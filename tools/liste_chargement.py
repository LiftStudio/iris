"""La liste de l'écran de chargement : assets/chargement.json (repris de LA CAGE).

L'écran de chargement (js/chargement.js) télécharge, AVANT de construire le jeu, les fichiers dont l'école a besoin, en
comptant leurs octets : c'est ce qui donne une vraie barre (« 12,4 Mo / 25,1 Mo · 3,2 Mo/s »). Ce script lui en fait la
liste, avec la taille de chaque fichier relue sur le disque :

  - LES MODULES (js/, vendor/three) : le graphe des `import` statiques depuis js/main.js, recalculé ici à chaque passage
    (un module ajouté y entre tout seul), plus ceux que les relevés ont vus arriver par import() ; ils ne sont pas
    retéléchargés, seulement comptés au passage ;
  - PAR PROFIL — « ecole/pc » ou « ecole/tel » — ce que le jeu demande VRAIMENT jusqu'à l'école prête (Haythem, ses
    animations, les textures). Ces listes sont RELEVÉES dans le jeu, pas devinées : la carte choisit ses fichiers selon
    l'appareil (textures _1k, avatar allégé assets/tel/ sur téléphone). Les relevés sont gardés dans
    tools/chargement_releves.json.

    python tools/liste_chargement.py                      # refait assets/chargement.json (tailles à jour)
    python tools/liste_chargement.py releve1.json ...     # range d'abord ces relevés, puis refait la liste
    python tools/liste_chargement.py --racine DOSSIER     # la liste d'une copie du jeu

Les tailles des fichiers texte (modules, JSON) sont comptées avec les fins de ligne de git (LF) : sous Windows
(core.autocrlf), le dossier de travail les a en CRLF, ~2 % de plus que ce qui est publié.

RELEVER UN PROFIL. Servir le jeu (Lancer.bat, ou python serve.py 8124), puis ouvrir
http://localhost:8124/?chargement=trace — ajouter &tel=1 pour le téléphone. L'écran de chargement ne télécharge rien
dans ce mode et se lève tout seul ; dans la console :
    copy(JSON.stringify(__chargement.traceFigee))
puis coller dans un fichier .json et le passer à ce script (le profil est écrit dedans).
QUAND ? Quand la carte se met à charger d'autres fichiers au démarrage (une nouvelle salle, une nouvelle texture). Un
fichier oublié n'empêche rien : il se charge à l'étape suivante, sans compter dans la barre. Un fichier qui n'existe
plus est signalé ici et retiré. Les tailles, elles, sont relues à chaque passage.
"""
import json, os, re, sys
from urllib.parse import unquote

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RELEVES = os.path.join(RACINE, 'tools', 'chargement_releves.json')
SORTIE = os.path.join(RACINE, 'assets', 'chargement.json')

# jamais dans la liste : la page elle-même, l'écran de chargement et ses images, le service worker, les icônes
EXCLUS = re.compile(r'^(index\.html|sw\.js|manifest\.webmanifest|css/|assets/chargement(/|\.json)|assets/icons/)')


def lire_json(chemin, defaut):
    try:
        with open(chemin, encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return defaut


TEXTE = ('.js', '.mjs', '.json', '.css', '.html', '.txt', '.svg', '.gltf')


def taille(chemin):
    p = os.path.join(RACINE, unquote(chemin.split('?')[0]))
    if not os.path.isfile(p):
        return None
    if p.lower().endswith(TEXTE):
        with open(p, 'rb') as f:
            return len(f.read().replace(b'\r\n', b'\n'))       # (fins de ligne de git : voir plus haut)
    return os.path.getsize(p)


def carte_imports():
    """La carte d'imports d'index.html (« three », « three/addons/ »)."""
    with open(os.path.join(RACINE, 'index.html'), encoding='utf-8') as f:
        html = f.read()
    m = re.search(r'<script type="importmap">(.*?)</script>', html, re.S)
    return {k: v[2:] if v.startswith('./') else v for k, v in json.loads(m.group(1))['imports'].items()} if m else {}


IMPORT = re.compile(r'''(?:^|[;\s])(?:import\s+(?:[\w*$\s{},]+?\s+from\s+)?|export\s+(?:\*|\{[^}]*\})\s+from\s+)['"]([^'"]+)['"]''', re.M)


def graphe_modules(depart='js/main.js'):
    carte = carte_imports()
    vus, pile = [], [depart]
    while pile:
        f = pile.pop()
        if f in vus:
            continue
        p = os.path.join(RACINE, f)
        if not os.path.isfile(p):
            print(f'  ! module introuvable : {f}')
            continue
        vus.append(f)
        with open(p, encoding='utf-8') as fh:
            code = fh.read()
        # (sans les commentaires : un exemple d'import dans un commentaire n'est pas un module)
        code = re.sub(r'(^|[^:\\])//[^\n]*', r'\1', re.sub(r'/\*.*?\*/', '', code, flags=re.S))
        for spec in IMPORT.findall(code):
            if spec in carte:
                cible = carte[spec]
            elif any(spec.startswith(k) for k in carte if k.endswith('/')):
                k = max((k for k in carte if k.endswith('/') and spec.startswith(k)), key=len)
                cible = carte[k] + spec[len(k):]
            elif spec.startswith('.'):
                cible = os.path.normpath(os.path.join(os.path.dirname(f), spec)).replace('\\', '/')
            else:
                continue
            pile.append(cible)
    return vus


def main(args):
    global RACINE, SORTIE
    if args[:1] == ['--racine']:
        if len(args) < 2 or not os.path.isfile(os.path.join(args[1], 'index.html')):
            sys.exit('--racine : un dossier du jeu (avec index.html) est attendu')
        RACINE = os.path.abspath(args[1])
        SORTIE = os.path.join(RACINE, 'assets', 'chargement.json')
        args = args[2:]
    releves = lire_json(RELEVES, {})
    for chemin in args:
        r = lire_json(chemin, None)
        if not r or 'profil' not in r or 'fichiers' not in r:
            sys.exit(f'{chemin} : pas un relevé (attendu {{"profil": ..., "fichiers": [...]}})')
        releves[r['profil']] = r['fichiers']
        print(f'relevé rangé : {r["profil"]} ({len(r["fichiers"])} fichiers)')
    if args:
        with open(RELEVES, 'w', encoding='utf-8') as f:
            json.dump(dict(sorted(releves.items())), f, ensure_ascii=False, indent=1)
            f.write('\n')

    fichiers, index = [], {}

    def ajouter(chemin):
        if chemin in index:
            return index[chemin]
        t = taille(chemin)
        if t is None:
            return None
        index[chemin] = len(fichiers)
        fichiers.append([chemin, t])
        return index[chemin]

    # les modules : le graphe statique, puis ceux des relevés (import() dynamiques)
    js = []
    for f in graphe_modules() + [c for l in releves.values() for c in l if c.endswith('.js')]:
        if EXCLUS.match(f):
            continue
        i = ajouter(f)
        if i is not None and i not in js:
            js.append(i)

    profils, absents = {}, set()
    for profil, liste in sorted(releves.items()):
        l = []
        for c in liste:
            if c.endswith('.js') or EXCLUS.match(c):
                continue
            i = ajouter(c)
            if i is None:
                absents.add(c)
            elif i not in l:
                l.append(i)
        profils[profil] = l

    # écrit à la main : une ligne par fichier, des différences lisibles d'une version à l'autre
    lignes = ['{', '"_": "Liste de l\'écran de chargement (js/chargement.js) - fabriquée par tools/liste_chargement.py, ne pas modifier à la main.",',
              '"fichiers": [']
    lignes += [json.dumps(f, ensure_ascii=False) + (',' if k < len(fichiers) - 1 else '') for k, f in enumerate(fichiers)]
    lignes += ['],', '"js": ' + json.dumps(js) + ',', '"profils": {']
    lignes += [json.dumps(p) + ': ' + json.dumps(l) + (',' if k < len(profils) - 1 else '') for k, (p, l) in enumerate(profils.items())]
    lignes += ['}', '}']
    with open(SORTIE, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lignes) + '\n')

    Mo = lambda o: f'{o / 1048576:.1f} Mo'
    tjs = sum(fichiers[i][1] for i in js)
    print(f'assets/chargement.json : {len(fichiers)} fichiers, modules {len(js)} ({Mo(tjs)})')
    for p, l in profils.items():
        print(f'  {p:22s} {len(l):4d} fichiers  {Mo(sum(fichiers[i][1] for i in l)):>9s}  (+ modules : {Mo(tjs + sum(fichiers[i][1] for i in l))})')
    for c in sorted(absents):
        print(f'  ! relevé mais introuvable sur le disque, retiré : {c}')


if __name__ == '__main__':
    main(sys.argv[1:])
