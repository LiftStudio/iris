"""Les voitures de la rue : assets/voitures.glb compacté, et sa version allégée assets/tel/voitures.glb (09/10/2026).

assets/voitures.glb est un extrait du pack « Generic passenger car pack » de Comrade1280 (Sketchfab, CC BY 4.0, voir
CREDITS.md) : quatre carrosseries (citadine, compacte, berline, SUV), ~29 000 triangles, 17 textures de 512 x 512.
L'extrait avait gardé TOUT le tampon binaire du pack d'origine (3,6 Mo, dont plus de la moitié ne servait à rien) :
ce script ne garde, pour chaque accesseur, que ses propres données, serrées les unes contre les autres (les mêmes
octets, rien n'est recalculé), et réécrit le fichier en place.

LA VERSION TÉLÉPHONE (assets/tel/voitures.glb, js/ecole_rue_voitures.js la charge au téléphone et retombe sur
l'original si elle manque) : les mêmes maillages, les textures passées de 512 à 256 (une voiture garée de l'autre côté
de la rue ne se voit pas de plus près sur un écran de téléphone), réencodées en JPEG.

    python tools/voitures_glb.py
"""
import io, json, os, struct
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(RACINE, 'assets', 'voitures.glb')
TEL = os.path.join(RACINE, 'assets', 'tel', 'voitures.glb')
COTE_TEL = 256

COMPOSANTE = {5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4}
NOMBRE = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT2': 4, 'MAT3': 9, 'MAT4': 16}


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
    binaire = bytes(binaire) + b'\0' * ((4 - len(binaire) % 4) % 4)
    total = 12 + 8 + len(js) + 8 + len(binaire)
    with open(chemin, 'wb') as fh:
        fh.write(struct.pack('<III', 0x46546C67, 2, total))
        fh.write(struct.pack('<II', len(js), 0x4E4F534A)); fh.write(js)
        fh.write(struct.pack('<II', len(binaire), 0x004E4942)); fh.write(binaire)


def compacter(j, binaire, image=None):
    """Un tampon neuf : chaque accesseur et chaque image n'y emportent que leurs octets. `image(octets)` peut réencoder
    les images au passage."""
    out, vues, deja = bytearray(), [], {}

    def ajouter(data, cible=None):
        while len(out) % 4:
            out.append(0)
        v = {'buffer': 0, 'byteOffset': len(out), 'byteLength': len(data)}
        if cible:
            v['target'] = cible
        out.extend(data)
        vues.append(v)
        return len(vues) - 1

    for a in j['accessors']:
        bv = j['bufferViews'][a['bufferView']]
        taille = COMPOSANTE[a['componentType']] * NOMBRE[a['type']]
        pas = bv.get('byteStride', taille)
        debut = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
        cle = (a['bufferView'], a.get('byteOffset', 0), a['count'], a['type'], a['componentType'])
        if cle not in deja:
            if pas == taille:
                data = binaire[debut:debut + taille * a['count']]
            else:
                data = b''.join(binaire[debut + i * pas:debut + i * pas + taille] for i in range(a['count']))
            deja[cle] = ajouter(data, bv.get('target'))
        a['bufferView'] = deja[cle]
        a.pop('byteOffset', None)
    for im in j.get('images', []):
        bv = j['bufferViews'][im['bufferView']]
        data = binaire[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']]
        if image:
            data, im['mimeType'] = image(data)
        im['bufferView'] = ajouter(data)
    j['bufferViews'] = vues
    j['buffers'] = [{'byteLength': len(out)}]
    return j, out


def reduire(data):
    im = Image.open(io.BytesIO(data)).convert('RGB')
    if max(im.size) > COTE_TEL:
        im = im.resize((COTE_TEL, COTE_TEL), Image.LANCZOS)
    b = io.BytesIO()
    im.save(b, 'JPEG', quality=85, optimize=True)
    return b.getvalue(), 'image/jpeg'


def main():
    avant = os.path.getsize(SOURCE)
    j, b = lire(SOURCE)
    j, b = compacter(j, b)
    j['asset']['generator'] = 'IRIS tools/voitures_glb.py (pack Comrade1280, CC BY 4.0)'
    ecrire(SOURCE, j, b)
    print('assets/voitures.glb : %.2f Mo -> %.2f Mo' % (avant / 1e6, os.path.getsize(SOURCE) / 1e6))
    j, b = lire(SOURCE)
    j, b = compacter(j, b, reduire)
    os.makedirs(os.path.dirname(TEL), exist_ok=True)
    ecrire(TEL, j, b)
    print('assets/tel/voitures.glb : %.2f Mo (textures %d px)' % (os.path.getsize(TEL) / 1e6, COTE_TEL))


if __name__ == '__main__':
    main()
