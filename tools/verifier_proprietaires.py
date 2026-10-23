"""LES PROPRIÉTAIRES ET LA PURETÉ (socle S0 du jeu, 22/10 ; spec §§ 4.1 règles 2 et 4, 5.2).

python -I tools/verifier_proprietaires.py <branche> [clé] [--base=<réf>] [--lot-r]

1. Les fichiers que la branche change depuis sa base (git diff --name-only <base>...<branche>) sont-ils tous à elle ?
   La clé du lot se lit dans le nom de la branche (lot/L-A → L-A ; socle, j-socle, j-socle-ok → S0 ; vague2 → F2 ;
   integration → INT ; sinon la première clé L-x qu'il contient) ou se donne en 2e argument. La base est celle de
   tools/proprietaires.json ; une base absente du dépôt est cherchée sous ses autres noms (socle → socle-ok, j-socle-ok,
   j-socle ; vague2 → vague2-ok…), ou se donne par --base=<réf>. Sa liste est dans tools/proprietaires.json (motifs glob), plus son rapport
   docs/jeu/rapports/<clé>.md. F2 et INT : tout, sauf js/ecole_soussol.js et js/ecole_amphi.js (le lot R) — sauf avec
   --lot-r (la fusion du lot R).
2. La PURETÉ des fichiers « simulation » (dans l'arbre de la branche) : ni Math.random, ni performance.now, ni Date.now,
   ni Raycaster, ni DecalGeometry, ni Light(, ni lecture d'Input (`.input.`, `Input`), hors commentaires ; une ligne
   marquée « // hors simulation » n'est permise que dans js/jeu/partie.js (Partie.image) et js/jeu/partie_prop.js
   (PartieProp.lireExtra).
3. `Light(` nulle part dans js/jeu/ (texte brut), sauf js/jeu/viewmodel.js (les trois lumières de la scène de l'arme).
Sortie : « OK <n> fichiers » (code 0), ou la liste des fautes (code 1).
"""
import fnmatch, json, os, re, subprocess, sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JETONS = [r'Math\.random', r'performance\.now', r'Date\.now', r'Raycaster', r'DecalGeometry', r'Light\(', r'\.input\.', r'\bInput\b']


def git(*args):
    r = subprocess.run(['git', '-C', RACINE, *args], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or 'git ' + ' '.join(args))
    return r.stdout


def sans_commentaires(ligne, dans_bloc):
    """La ligne sans ses commentaires (// et /* */), hors chaînes ; rend (code, dans_bloc)."""
    out, i, q = [], 0, None
    while i < len(ligne):
        c = ligne[i]
        if dans_bloc:
            if ligne.startswith('*/', i):
                dans_bloc = False
                i += 2
                continue
            i += 1
            continue
        if q:
            out.append(c)
            if c == '\\' and i + 1 < len(ligne):
                out.append(ligne[i + 1])
                i += 2
                continue
            if c == q:
                q = None
            i += 1
            continue
        if c in '\'"`':
            q = c
            out.append(c)
            i += 1
            continue
        if ligne.startswith('//', i):
            break
        if ligne.startswith('/*', i):
            dans_bloc = True
            i += 2
            continue
        out.append(c)
        i += 1
    return ''.join(out), dans_bloc


def correspond(chemin, motifs):
    for m in motifs:
        if m == '*':
            return True
        if fnmatch.fnmatch(chemin, m) or (m.endswith('/**') and chemin.startswith(m[:-2])):
            return True
    return False


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')     # (la console de Windows : les accents)
    except Exception:
        pass
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    lot_r = '--lot-r' in sys.argv
    base_donnee = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--base=')), None)
    if not args:
        print(__doc__)
        return 2
    branche = args[0]
    P = json.load(open(os.path.join(RACINE, 'tools', 'proprietaires.json'), encoding='utf-8'))
    cle = args[1] if len(args) > 1 else (branche.split('/', 1)[1] if branche.startswith('lot/') else P.get('branches', {}).get(branche))
    if not cle:
        m = re.search(r'\b(L-[A-Z])\b', branche)
        cle = m.group(1) if m else None
    if not cle or cle not in P['fichiers']:
        print('clé de lot inconnue pour la branche', branche, '(donne-la en 2e argument)')
        return 2
    base = base_donnee
    if not base:
        for b in [P['base'][cle], P['base'][cle] + '-ok', 'j-' + P['base'][cle] + '-ok', 'j-' + P['base'][cle]]:
            if subprocess.run(['git', '-C', RACINE, 'rev-parse', '--verify', '--quiet', b + '^{commit}'], capture_output=True).returncode == 0:
                base = b
                break
    if not base:
        print('base introuvable pour', cle, ':', P['base'][cle], '(donne-la par --base=<réf>)')
        return 2
    fautes = []
    try:
        fichiers = [f for f in git('diff', '--name-only', f'{base}...{branche}').splitlines() if f]
    except RuntimeError as e:
        print('git :', e)
        return 2
    motifs = P['fichiers'][cle] + [f'docs/jeu/rapports/{cle}.md']
    for f in fichiers:
        if f in P['interdits'] and not (lot_r and cle in ('F2', 'INT')):
            fautes.append(f'{f} : interdit (lot R)')
        elif not correspond(f, motifs):
            fautes.append(f'{f} : hors de la liste de {cle}')
    # la pureté, dans l'arbre de la branche
    arbre = set(git('ls-tree', '-r', '--name-only', branche).splitlines())
    permis = set(P.get('horsSimulationPermis', []))
    for f in P['simulation']:
        if f not in arbre:
            continue
        texte = git('show', f'{branche}:{f}')
        bloc = False
        for n, ligne in enumerate(texte.splitlines(), 1):
            marque = '// hors simulation' in ligne
            code, bloc = sans_commentaires(ligne, bloc)
            for j in JETONS:
                if re.search(j, code):
                    if marque and f in permis:
                        continue
                    fautes.append(f'{f}:{n} : {j.replace(chr(92), "")} — {ligne.strip()[:100]}')
    for f in sorted(arbre):
        if f.startswith('js/jeu/') and f.endswith('.js') and f != 'js/jeu/viewmodel.js':
            if 'Light(' in git('show', f'{branche}:{f}'):
                fautes.append(f'{f} : Light( (une lumière hors de la scène de l’arme)')
    if fautes:
        print(f'{len(fautes)} faute(s) — {branche} ({cle}, base {base}) :')
        for x in fautes:
            print('  ' + x)
        return 1
    print(f'OK {len(fichiers)} fichiers ({branche}, {cle}, base {base})')
    return 0


if __name__ == '__main__':
    sys.exit(main())
