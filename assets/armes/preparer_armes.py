# =====================================================================
#  LES VRAIES ARMES D'IRIS, PRÊTES POUR LE JEU (lot L-X, 24/10/2026)
# =====================================================================
# Usage : python -I assets/armes/preparer_armes.py <dossier des GLB vérifiés> [--sortie <racine du dépôt>]
#   (le dossier : C:/Users/hgami/Downloads/IRIS_lots/_armes/choix — les 8 GLB CC0 de 3DModelsCC0 déjà mis à l'échelle
#   réelle et au repère du contrat par l'atelier du 23/10, manifeste.json à côté)
# Écrit assets/armes/<id>.glb (PC, textures 1024) et assets/tel/armes/<id>.glb (téléphone, 512), et affiche la table des
# REPÈRES et des PIVOTS à recopier dans js/jeu/modeles_armes.js (le jeu la lit au chargement du module : l'arme de vue de
# L-V et la pose des bots de L-C règlent leurs mains dessus AVANT qu'un GLB soit arrivé). Lecture/écriture de fichiers.
#
# Ce qui change par rapport aux GLB vérifiés :
#  1. L'ORIGINE : l'atelier l'avait mise au CENTRE de la poignée, ~3 cm sous son raccord ; l'arme de vue de L-V a réglé la
#     main droite (le poignet 7,5 cm sous l'origine et 6,2 cm derrière, POIGNEE de viewmodel.js) sur le contrat de L-W :
#     l'origine EN HAUT de la poignée, au creux entre pouce et index. On la remonte donc le long de la poignée (ORIGINES,
#     relevées sur les coupes de chaque poignée puis réglées sur les photos de la vue FPS) : la main tombe sur la vraie
#     poignée, l'index sur la vraie détente.
#  2. LES GRENADES tournées d'un demi-tour (axe Y) : l'arme de vue tient une grenade le +X vers la main GAUCHE et tire la
#     goupille vers +X (viewmodel.js, _tenus) — l'anneau doit être à +X, comme chez L-W.
#  3. LES TEXTURES en JPEG partout (couleur 4:2:0 ; métal/rugosité et normales 4:4:4, sans sous-échantillonnage : leurs
#     canaux sont des mesures, pas des couleurs) : les normales PNG faisaient 440 à 740 Ko ; aucune extension glTF exigée.
#     Téléphone : 512 px (Lanczos, normales renormalisées).
#  4. LES REPÈRES ajoutés dans extras.iris.reperes (ceux que lisent l'arme de vue et les bots) : mainD, saisieChargeur (le
#     flanc gauche du chargeur, au tiers bas de ce qui dépasse), saisieLevier (levier d'armement, boule de culasse),
#     saisieGlissiere (stries arrière du P-17), oeilleton (FP-12 : la ligne de mire de la perle au-dessus de l'arrière du
#     boîtier), arretoir (l'arrêtoir de culasse, flanc gauche), goupille (l'anneau des grenades), courseMainG (FP-12).
import sys, os, io, json, struct
import numpy as np
from PIL import Image

IDS = ['fa24', 'pm9', 'fp12', 'tp50', 'p17', 'couteau', 'frag', 'flash']
# la nouvelle origine, dans le repère des GLB vérifiés (m) : le haut de la poignée, au milieu de sa profondeur (coupes
# horizontales : FA-24 poignée inclinée de 31°, raccord à y ≈ +0,01 ; PM-9 17°, +0,025 ; P-17 13°, +0,03 ; FP-12 et TP-50 :
# le poignet de la crosse, derrière le boîtier)
ORIGINES = {
    'fa24': [0.0, 0.022, -0.010], 'pm9': [0.0, 0.028, -0.008], 'fp12': [0.0, 0.030, -0.010], 'tp50': [0.0, 0.030, -0.010],
    'p17': [0.0, 0.034, -0.006], 'couteau': [0.0, 0.0, 0.0], 'frag': [0.0, 0.0, 0.0], 'flash': [0.0, 0.0, 0.0],
}
DEMI_TOUR = {'frag', 'flash'}
# LA HAUSSE DE LA FA-24 (relecture L-X, 24/10) : telle que l'atelier l'a livrée, la visée était injuste. Le centre du trou de
# la hausse est 5,4 mm SOUS la pointe du guidon (une arme parallèle à la caméra ne peut pas les aligner tous deux sur l'axe :
# la pointe tombait au bord haut du trou, et le coup partait 0,5° sous elle) et le trou ne fait que 2,4 mm (le petit
# œilleton) : vu à 12 cm, un disque noir de 5,5° masquait le centre de l'écran, la cible ne se voyait que par un trou de 1°.
# On lève donc le disque de la hausse jusqu'à la ligne du guidon (sa tige s'allonge d'autant) et on ouvre le trou au
# GRAND œilleton du vrai M4 (5 mm) ; l'œil se pose à OEIL_FA24 derrière lui (l'anneau cadre la cible, le guidon au centre).
OEIL_FA24 = 0.05
R_OEILLETON = 0.0025

CT = {5121: np.uint8, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


class GLB:
    def __init__(self, chemin):
        b = open(chemin, 'rb').read()
        assert b[:4] == b'glTF'
        cl = struct.unpack('<I', b[12:16])[0]
        self.js = json.loads(b[20:20 + cl].decode('utf8'))
        o = 20 + cl
        bl = struct.unpack('<I', b[o:o + 4])[0]
        bin_ = b[o + 8:o + 8 + bl]
        self.vues = [bytearray(bin_[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']]) for v in self.js['bufferViews']]

    def acc(self, i):
        a = self.js['accessors'][i]; v = self.js['bufferViews'][a['bufferView']]
        dt = np.dtype(CT[a['componentType']]); n = NC[a['type']]
        assert v.get('byteStride', dt.itemsize * n) == dt.itemsize * n
        return np.frombuffer(bytes(self.vues[a['bufferView']]), dtype=dt, count=a['count'] * n, offset=a.get('byteOffset', 0)).reshape(a['count'], n).copy()

    def ecrire_acc(self, i, arr):
        a = self.js['accessors'][i]
        arr = np.asarray(arr, dtype=np.dtype(CT[a['componentType']])).reshape(a['count'], NC[a['type']])
        off = a.get('byteOffset', 0)
        self.vues[a['bufferView']][off:off + arr.nbytes] = arr.tobytes()
        if 'min' in a:
            a['min'] = [float(x) for x in arr.min(0)]; a['max'] = [float(x) for x in arr.max(0)]

    def sauver(self, chemin):
        morceaux, pos = [], 0
        for k, v in enumerate(self.js['bufferViews']):
            d = self.vues[k]; pad = (-pos) % 4
            if pad:
                morceaux.append(b'\0' * pad); pos += pad
            v['byteOffset'] = pos; v['byteLength'] = len(d); morceaux.append(bytes(d)); pos += len(d)
        binaire = b''.join(morceaux); binaire += b'\0' * ((-len(binaire)) % 4)
        self.js['buffers'] = [{'byteLength': len(binaire)}]
        j = json.dumps(self.js, ensure_ascii=False, separators=(',', ':')).encode('utf8'); j += b' ' * ((-len(j)) % 4)
        total = 28 + len(j) + len(binaire)
        with open(chemin, 'wb') as f:
            f.write(struct.pack('<4sII', b'glTF', 2, total))
            f.write(struct.pack('<II', len(j), 0x4E4F534A)); f.write(j)
            f.write(struct.pack('<II', len(binaire), 0x004E4942)); f.write(binaire)
        return total

    def parents(self):
        return {c: i for i, n in enumerate(self.js['nodes']) for c in n.get('children', [])}

    def pos_monde(self, ni):
        P, t, k = self.parents(), np.zeros(3), ni
        while k is not None:
            n = self.js['nodes'][k]
            assert not any(x in n for x in ('rotation', 'scale', 'matrix')), n.get('name')
            t += np.array(n.get('translation', [0, 0, 0]), dtype=np.float64); k = P.get(k)
        return t


def maillages(g, triangles=False):
    """{nom : (sommets dans le repère de la racine — ou ses triangles —, index du nœud)}"""
    R = {}
    for i, n in enumerate(g.js['nodes']):
        if 'mesh' in n:
            pr = g.js['meshes'][n['mesh']]['primitives'][0]
            P = g.acc(pr['attributes']['POSITION']).astype(np.float64) + g.pos_monde(i)
            R[n['name']] = (P[g.acc(pr['indices']).reshape(-1, 3)] if triangles else P, i)
    return R


def coupe(T, y):
    """les points où les arêtes des triangles T (n × 3 × 3) coupent le plan horizontal y (les sommets d'un maillage
    pauvre ne disent rien d'une bande : un chargeur n'a de sommets qu'en haut et en bas)"""
    d = T[:, :, 1] - y; L = []
    for a, b in ((0, 1), (1, 2), (2, 0)):
        m = (d[:, a] * d[:, b]) < 0
        t = d[m, a] / (d[m, a] - d[m, b])
        L.append(T[m, a] + (T[m, b] - T[m, a]) * t[:, None])
    return np.concatenate(L)


def jpeg(img, q, sous):
    f = io.BytesIO(); img.save(f, 'JPEG', quality=q, optimize=True, subsampling=sous); return f.getvalue()


def textures(g, taille):
    m = g.js['materials'][0]; pbr = m['pbrMetallicRoughness']
    src = lambda t: g.js['textures'][t['index']]['source']
    for role, ti in (('couleur', pbr['baseColorTexture']), ('mr', pbr['metallicRoughnessTexture']), ('normales', m['normalTexture'])):
        i = src(ti); im = g.js['images'][i]
        brut = bytes(g.vues[im['bufferView']])
        img = Image.open(io.BytesIO(brut)).convert('RGB')
        if role == 'normales':
            a = np.asarray(img, dtype=np.float32) / 127.5 - 1.0
            if img.size[0] != taille:
                a = np.stack([np.asarray(Image.fromarray(a[..., c], 'F').resize((taille, taille), Image.LANCZOS)) for c in range(3)], -1)
            a[..., 2] = np.clip(a[..., 2], 0, None); a /= np.maximum(np.linalg.norm(a, axis=-1, keepdims=True), 1e-6)
            out = jpeg(Image.fromarray(np.clip(np.round((a + 1) * 127.5), 0, 255).astype(np.uint8), 'RGB'), 92, 0)
        else:
            if img.size[0] == taille and im.get('mimeType') == 'image/jpeg':
                out = brut                                         # (déjà en JPEG à la bonne taille : pas de 2e compression)
            else:
                img = img.resize((taille, taille), Image.LANCZOS)
                out = jpeg(img, 90, 2 if role == 'couleur' else 0)
        g.vues[im['bufferView']] = bytearray(out); im['mimeType'] = 'image/jpeg'
        im['name'] = '%s_%s' % (g.js['nodes'][g.js['scenes'][0]['nodes'][0]]['name'], role)


def transformer(g, ident):
    """origine déplacée (et demi-tour des grenades) : nœuds, sommets, normales, extras"""
    O = np.array(ORIGINES[ident], dtype=np.float64)
    racine = g.js['scenes'][g.js.get('scene', 0)]['nodes'][0]
    R = np.diag([-1.0, 1.0, -1.0]) if ident in DEMI_TOUR else np.eye(3)
    P = g.parents()
    for i, n in enumerate(g.js['nodes']):
        if i == racine:
            continue
        t = np.array(n.get('translation', [0, 0, 0]), dtype=np.float64)
        if P.get(i) == racine:
            t = t - O
        n['translation'] = [round(float(x), 6) for x in R @ t]
    if ident in DEMI_TOUR:
        for m in g.js['meshes']:
            for pr in m['primitives']:
                for att in ('POSITION', 'NORMAL'):
                    a = g.acc(pr['attributes'][att]).astype(np.float64); g.ecrire_acc(pr['attributes'][att], a @ R.T)
    iris = g.js['nodes'][racine]['extras']['iris']
    f = lambda v: [round(float(x), 4) for x in R @ (np.array(v, dtype=np.float64) - O)]
    iris['reperes'] = {k: f(v) for k, v in iris['reperes'].items()}
    for p in iris.get('pieces', iris.get('pieces_mobiles', {})).values():
        for k in ('pivot', 'min', 'max'):
            if k in p:
                p[k] = f(p[k])
        if ident in DEMI_TOUR and 'min' in p:                 # (le demi-tour échange min et max en x et z)
            a, b = np.array(p['min']), np.array(p['max']); p['min'] = [float(x) for x in np.minimum(a, b)]; p['max'] = [float(x) for x in np.maximum(a, b)]
    iris['origine_l_x'] = {'deplacee_de': [float(x) for x in O], 'demi_tour_y': ident in DEMI_TOUR,
                           'contrat': 'origine = prise de la main droite EN HAUT de la poignée (contrat de L-W, mains de L-V)'}
    return iris


def r4(v):
    return [round(float(x), 4) for x in v]


def hausse_fa24(g, rep):
    """la hausse levée sur la ligne du guidon, son trou ouvert à 5 mm ; rend (centre du trou, pointe du guidon)"""
    M = maillages(g); P, ni = M['Sight_2']; B = M['Barrel'][0]
    # la pointe du guidon : le plus haut des sommets de la lame (|x| < 2,5 mm, à l'avant du garde-main ; les oreilles sont à ±6 mm)
    L = B[(np.abs(B[:, 0]) < 0.0025) & (B[:, 2] < -0.30) & (B[:, 1] > 0.10)]; pointe = L[np.argmax(L[:, 1])]
    # le centre du trou : le bord intérieur (les sommets à moins de 2 mm de l'axe du disque, relevé près de `visee`)
    r0 = np.hypot(P[:, 0], P[:, 1] - rep['visee'][1]); bord = r0 < 0.002
    c = P[bord][:, :2].mean(0); dy = float(pointe[1] - c[1])
    Q = P.copy(); d = Q[:, :2] - c; r = np.hypot(d[:, 0], d[:, 1]); bord = r < 0.002
    Q[bord, :2] = c + d[bord] * (R_OEILLETON / r[bord])[:, None]           # (le trou ouvert : le bord intérieur poussé à 2,5 mm)
    Q[Q[:, 1] > c[1] - 0.008, 1] += dy                                      # (le disque levé ; la tige, plus bas, s'allonge)
    pr = g.js['meshes'][g.js['nodes'][ni]['mesh']]['primitives'][0]
    g.ecrire_acc(pr['attributes']['POSITION'], Q - g.pos_monde(ni))
    zt = float(P[bord][:, 2].max())                                        # (la face arrière du trou)
    return [0.0, float(pointe[1]), zt], [0.0, float(pointe[1]), float(pointe[2])]


def ajouter_reperes(g, ident, iris):
    """les repères que lisent l'arme de vue et les bots, relevés sur la géométrie"""
    M = maillages(g); MT = maillages(g, True); rep = iris['reperes']
    rep['mainD'] = [0.0, 0.0, 0.0]
    fixes = np.concatenate([P for k, (P, _) in M.items() if k not in ('Magazine', 'Trigger', 'Bolt', 'Charging_Handle', 'Slide', 'Fore_Stock', 'Pin')])
    if 'Magazine' in M:
        C = M['Magazine'][0]
        zm = (C[:, 2].min(), C[:, 2].max())
        # le bas du puits : le plus bas des sommets fixes au-dessus du chargeur (même z, près du plan médian)
        dessus = fixes[(fixes[:, 2] > zm[0] + 0.004) & (fixes[:, 2] < zm[1] - 0.004) & (np.abs(fixes[:, 0]) < 0.02) & (fixes[:, 1] > C[:, 1].min() + 0.01)]
        ycut = dessus[:, 1].min() if len(dessus) else C[:, 1].max()
        y0 = C[:, 1].min()
        yt = y0 + 0.012 if ident == 'p17' else y0 + (min(ycut, C[:, 1].max()) - y0) / 3
        bande = coupe(MT['Magazine'][0], yt)
        rep['saisieChargeur'] = r4([bande[:, 0].min(), yt, (bande[:, 2].min() + bande[:, 2].max()) / 2])
        # l'arrêtoir : le flanc gauche du boîtier, au-dessus de l'arrière du puits
        za = zm[1] + 0.006; ya = ycut + 0.02
        TF = np.concatenate([T for k, (T, _) in MT.items() if k not in ('Magazine', 'Trigger', 'Bolt', 'Charging_Handle', 'Slide', 'Fore_Stock', 'Pin')])
        cote = coupe(TF, ya); cote = cote[np.abs(cote[:, 2] - za) < 0.012]
        if len(cote):
            rep['arretoir'] = r4([cote[:, 0].min(), ya, za])
    if ident == 'fp12':
        ej = rep['ejection']
        sous = fixes[(np.abs(fixes[:, 2] - ej[2]) < 0.01) & (np.abs(fixes[:, 0]) < 0.012) & (fixes[:, 1] < ej[1])]
        yb = sous[:, 1].min() if len(sous) else ej[1] - 0.04
        rep['saisieChargeur'] = r4([0.0, yb - 0.004, ej[2]])        # la fenêtre de chargement, sous le boîtier
        rep['arretoir'] = rep['saisieChargeur']
        # (l'arme de vue vise par `oeilleton` quand il existe, l'œil 0,24 m derrière lui : sur la ligne de mire de la perle,
        # l'œil à +0,205 — la joue sur la crosse, comme chez L-W ; par l'arrière du boîtier, l'œil tombait à 12 cm de lui et le
        # boîtier bouchait la moitié de l'image, photos du 24/10)
        rep['oeilleton'] = r4([0.0, rep['visee'][1], -0.035])
        rep['courseMainG'] = 0.09
    if ident == 'fa24':
        # (relecture : la hausse levée sur la ligne du guidon et ouverte, hausse_fa24 ; `visee` = le centre de son trou, `guidon`
        # = la pointe de la lame — l'atelier relevait le haut des oreilles —, `oeilleton` = le point de la ligne de mire 0,24 m
        # devant l'œil, l'œil à OEIL_FA24 derrière la hausse : la crosse et le tube restent derrière lui)
        rep['visee'], rep['guidon'] = (r4(v) for v in hausse_fa24(g, rep))
        rep['oeilleton'] = r4([0.0, rep['visee'][1], rep['visee'][2] - (0.24 - OEIL_FA24)])
        H = M['Charging_Handle'][0]; G = H[H[:, 0] < H[:, 0].min() + 0.008]
        rep['saisieLevier'] = r4(G.mean(0))
    if ident == 'pm9':
        B = M['Bolt'][0]; G = B[B[:, 0] < B[:, 0].min() + 0.006]
        rep['saisieLevier'] = r4(G.mean(0))
    if ident == 'tp50':
        B = M['Bolt'][0]; G = B[B[:, 0] > B[:, 0].max() - 0.012]
        rep['saisieLevier'] = r4(G.mean(0))
    if ident == 'p17':
        S = M['Slide'][0]
        # (l'arrêtoir du Makarov : sur le flanc gauche de la carcasse, juste sous la glissière, au-dessus de la détente — la
        # règle du puits, faite pour les fusils, le mettait sur la poignée)
        B = M['Body'][0]; ys = S[:, 1].min() - 0.004; c = coupe(MT['Body'][0], ys); c = c[np.abs(c[:, 2] + 0.035) < 0.012]
        rep['arretoir'] = r4([c[:, 0].min() if len(c) else B[:, 0].min(), ys, -0.035])
        rep['saisieGlissiere'] = r4([S[:, 0].min(), (S[:, 1].min() + S[:, 1].max()) / 2, S[:, 2].max() - 0.016])
    if ident in DEMI_TOUR:
        rep['goupille'] = rep['anneau']
    return rep


def main():
    src = sys.argv[1]
    racine = sys.argv[sys.argv.index('--sortie') + 1] if '--sortie' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
    table = {}
    for ident in IDS:
        for tel, taille in ((False, 1024), (True, 512)):
            g = GLB(os.path.join(src, ident + '.glb'))
            iris = transformer(g, ident)
            rep = ajouter_reperes(g, ident, iris)
            textures(g, taille)
            g.js['asset']['generator'] = 'IRIS : atelier des armes (23/10) + assets/armes/preparer_armes.py (lot L-X, 24/10)'
            g.js['asset']['copyright'] = 'CC0 1.0 - modele 3DModelsCC0 (nisu), conversion GLB BoQsc ; adapte pour IRIS (origine, textures %d px)' % taille
            dossier = os.path.join(racine, 'assets', 'tel', 'armes') if tel else os.path.join(racine, 'assets', 'armes')
            os.makedirs(dossier, exist_ok=True)
            n = g.sauver(os.path.join(dossier, ident + '.glb'))
            if not tel:
                M = maillages(g); tout = np.concatenate([P for P, _ in M.values()])
                pieces = iris.get('pieces', iris.get('pieces_mobiles', {}))
                table[ident] = {'reperes': rep, 'pivots': {k: p['pivot'] for k, p in pieces.items()},
                                'boite': [r4(tout.min(0)), r4(tout.max(0))], 'octets': n}
            print('%-8s %s %7d octets' % (ident, 'tel' if tel else 'pc ', n))
    print(json.dumps(table, ensure_ascii=False))


if __name__ == '__main__':
    main()
