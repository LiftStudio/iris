"""Avatars allégés pour téléphone : assets/<nom>.glb -> assets/tel/<nom>.glb (04/10/2026).

Repris de LA CAGE. Un avatar Avaturn embarque 10 à 14 textures de 1024 x 1024 (couleur, normales, rugosité... de
chaque vêtement). Décompressées dans la carte graphique, avec leurs mipmaps, c'est ~75 Mo pour un seul personnage :
de quoi faire saccader un téléphone moyen, à côté de l'école.
À la taille où un téléphone affiche un joueur, 512 x 512 ne se distingue pas de 1024. On garde la seule texture
qui se voit de près — la COULEUR du corps, c'est-à-dire le visage — en 1024, et on passe toutes les autres en 512 :
environ trois fois moins de mémoire graphique, un fichier plus léger, un décodage plus court au chargement.

Le maillage, le squelette et les animations ne bougent pas d'un octet : seules les images sont réencodées.
js/player.js charge assets/tel/<nom>.glb sur téléphone (et retombe sur l'original s'il manque).

    python tools/avatars_tel.py            # Haythem (le seul personnage d'IRIS)
    python tools/avatars_tel.py autre      # un autre fichier assets/autre.glb
"""
import io, json, os, struct, sys
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(RACINE, 'assets')
SORTIE = os.path.join(ASSETS, 'tel')
COTE = 512            # toutes les textures
COTE_VISAGE = 1024    # la couleur du corps (le visage) : celle qu'on regarde


def avatars():
    # IRIS n'a qu'un personnage (js/game.js : HAYTHEM, model 'assets/haythem.glb')
    return ['haythem']


def lire(chemin):
    d = open(chemin, 'rb').read()
    assert d[:4] == b'glTF', chemin
    lj = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + lj])
    o = 20 + lj
    lb = struct.unpack('<I', d[o:o + 4])[0]
    return j, d[o + 8:o + 8 + lb]


def ecrire(chemin, j, binaire):
    js = json.dumps(j, separators=(',', ':')).encode('utf-8')
    js += b' ' * ((4 - len(js) % 4) % 4)
    binaire += b'\0' * ((4 - len(binaire) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(binaire)
    with open(chemin, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, total))
        fh.write(struct.pack('<II', len(js), 0x4E4F534A)); fh.write(js)
        fh.write(struct.pack('<II', len(binaire), 0x004E4942)); fh.write(binaire)


def images_visage(j):
    """Les images de couleur du matériau du corps."""
    out = set()
    for m in j.get('materials', []):
        if 'body' not in (m.get('name') or ''):
            continue
        t = (m.get('pbrMetallicRoughness') or {}).get('baseColorTexture')
        if t is not None:
            out.add(j['textures'][t['index']]['source'])
    return out


def alleger(nom):
    src = os.path.join(ASSETS, nom + '.glb')
    j, b = lire(src)
    visage = images_visage(j)
    nouvelles = {}                                    # bufferView -> octets réencodés
    for i, im in enumerate(j.get('images', [])):
        if 'bufferView' not in im:
            continue
        bv = j['bufferViews'][im['bufferView']]
        o = bv.get('byteOffset', 0)
        brut = b[o:o + bv['byteLength']]
        img = Image.open(io.BytesIO(brut))
        cote = COTE_VISAGE if i in visage else COTE
        if max(img.size) <= cote:
            continue
        img.load()
        r = img.resize((min(cote, img.size[0]), min(cote, img.size[1])), Image.LANCZOS)
        f = io.BytesIO()
        if im.get('mimeType') == 'image/png':
            r.save(f, 'PNG', optimize=True)
        else:
            (r if r.mode == 'RGB' else r.convert('RGB')).save(f, 'JPEG', quality=86, optimize=True)
        if f.tell() < len(brut):
            nouvelles[im['bufferView']] = f.getvalue()
    # on recopie le tampon vue par vue, alignées sur 4 octets, en remplaçant les images allégées
    sortie = bytearray()
    for k, bv in enumerate(j['bufferViews']):
        o = bv.get('byteOffset', 0)
        octets = nouvelles.get(k, b[o:o + bv['byteLength']])
        sortie += b'\0' * ((4 - len(sortie) % 4) % 4)
        bv['byteOffset'] = len(sortie); bv['byteLength'] = len(octets)
        sortie += octets
    j['buffers'][0]['byteLength'] = len(sortie)
    os.makedirs(SORTIE, exist_ok=True)
    dst = os.path.join(SORTIE, nom + '.glb')
    ecrire(dst, j, bytes(sortie))
    print(f'{nom:12s} {os.path.getsize(src) / 1e6:5.2f} Mo -> {os.path.getsize(dst) / 1e6:5.2f} Mo  ({len(nouvelles)} images réduites)')


if __name__ == '__main__':
    for n in (sys.argv[1:] or avatars()):
        alleger(n)
