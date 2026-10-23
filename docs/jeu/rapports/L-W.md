# Rapport L-W — les modèles d'armes (vague 2)

Branche `lot/L-W` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-W`), partie de `socle` (`e06258f`, tag `socle-ok`),
port 8133 ; 23/10/2026.

## Où j'en suis

**EN COURS — étape 3 : le code est écrit et vérifié hors navigateur, pas encore joué dans le navigateur.**
- Fait : `js/jeu/modeles_armes.js` (les huit modèles, deux versions, cache, matériaux, repères, os) et
  `js/jeu/tests/test_modeles_armes.js` (9 tests + 2 pour F2), commit `1dadb8e` ; contrôlés sous Node (three r170 du
  `vendor/`, chargeur dans le dossier de session) : appels, triangles, encombrement, repères à 0 mm, volumes et
  orientations des 600 pièces, temps de création.
- En attente : un jeton du navigateur (les trois tenus par L-D, L-G, L-V à 03:26), puis : `&rapport=1&lot=L-W` sur PC et
  `?tel=1`, la planche photo (regardée), l'arme dans l'essai (regardée), `&rapport=1&lot=S0`, `verifier_proprietaires`.

Un repreneur : `git log` de `lot/L-W`, puis ce fichier. Le serveur : `python serve.py 8133` dans l'arbre ; la planche se
récupère par `window.__plancheArmes` (dataURL) — un petit récepteur local (`recepteur.py`, dossier de session) l'écrit dans
`C:/Users/hgami/Downloads/IRIS_lots/_photos/L-W/`.

## Ce qui est construit

`js/jeu/modeles_armes.js` — les huit armes faites main en primitives (boîtes chanfreinées à 44 triangles, cylindres, tours
`LatheGeometry`, profils extrudés biseautés avec trous, une sphère « quadrillée »), AUCUN fichier, aucune texture, aucune
marque, aucun texte :
- **FA-24** (terre) : boîtier supérieur et inférieur, puits évasé, rails à dents, levier d'armement en T (os `culasse`),
  sélecteur, arrêtoir, goupilles, fenêtre d'éjection, tube et crosse ajourée, plaque de couche, poignée à 18° à creux de
  doigts, pontet, détente (os), chargeur courbe extrudé sur un arc de R 0,40 (os `chargeur`, nervures, semelle), garde-main
  octogonal à ouïes, arrêt de main, bloc de gaz, cache-flamme creux à trois fentes, point rouge (embase, boîtier creux,
  molette, le point de verre émissif au repère `visee`), organes de secours repliés.
- **PM-9** (noir) : boîtier compact, viseur à fenêtre (cadre ajouré + point), levier d'armement à gauche dans sa fente (os),
  garde-main court nervuré, compensateur à évents, chargeur droit à 4° (os, trous témoins), crosse en fil (deux boucles,
  charnière à gauche, plaque).
- **FP-12** (vert) : boîtier d'acier, fenêtres d'éjection et de chargement, œilleton (anneau) et guidon perle (blanc, au
  repère `visee`), canon à rail ventilé et couronne creuse, tube magasin, collier, pompe (os, course 9 cm, 7 stries, barres
  d'action), crosse à poignée intégrée et trou de pouce, plaque, sûreté, porte-cartouches à gauche (4 cartouches, culots
  polis).
- **TP-50** (sable) : boîtier rond, rail, culasse (os : corps poli, levier et boule ; se lève de 60° puis recule de 8 cm),
  canon conique, frein de bouche à évents, lunette (tour de 15 points, lentilles à reflet, trois tourelles, deux colliers),
  crosse à trou de pouce et appui-joue (dégagement de la culasse en arrière), chargeur (os), bipied replié (embase,
  charnière, jambes à rallonge, patins).
- **P-17** (noir) : glissière d'acier (os : 3 cm ; stries avant et arrière, fenêtre d'éjection, cran à deux points et
  guidon à un point blancs — tout sur l'os), canon poli fixe visible dans la fenêtre quand la glissière recule, couronne,
  carcasse, cache-poussière à rail, bec, poignée à 15° et plaquettes, pontet carré, détente, arrêtoir, chargeur dans la
  poignée (os ; caché au repos, sa semelle dessous).
- **Couteau** : manche à creux de doigts (teinte), garde, pommeau, lame à pointe rabattue, tranchant poli, gouttière.
- **Frag** : corps quadrillé (8 colonnes, 6 rangs, sillons à −6 %), fusée, cuillère à gauche, anneau et goupille (os).
- **Flash** : cylindre à 18 trous, cerclages, fusée, cuillère à gauche, anneau et goupille (os).

Deux versions d'une même recette (les PLANS) : `pourVue` = un `SkinnedMesh` par matériau, toutes les pièces d'un matériau
COUSUES (`mergeGeometries`), chaque sommet porté par un seul os (poids 1), os enfants d'une `racine` posés à leurs pivots
(`OS_ARMES`), `frustumCulled = false` ; 3e personne = un `Mesh` par matériau (≤ 3 : le poli et la lentille passent à
l'acier, le verre et le blanc disparaissent), boîtes sans chanfrein, segments divisés par deux, lunette simplifiée,
`castShadow`/`receiveShadow`, `userData.dynamique`. Géométries en CACHE par arme et par version, partagées par tous les
exemplaires ; matériaux partagés (`MATERIAUX_ARMES`).

Ajouts au contrat (règle 3 : ajouts seulement, signatures inchangées) : exports `IDS_ARMES`, `ENCOMBREMENTS`, `OS_ARMES`
(pivots), `COURSES_OS` (le geste de chaque os, pour L-V), `viderCacheArmes()` (tests), `libererArme(g)` (rend la texture
d'os du squelette ; jamais les géométries ni les matériaux, partagés) ; matériaux `lentille`, `blanc`, `poli`, `tous` ;
repères `mainD` des armes à feu, `saisieChargeur`, `saisieLevier`, `saisieGlissiere` ; `userData.squelette`, `appels`,
`triangles`, `sommetsParOs`. En vue, les repères portés par une pièce mobile sont enfants de son os (`mainG` du FP-12 sur
la pompe, les saisies, l'anneau des grenades).

## Mesures hors navigateur (Node 24, three r170, relatives)

| Arme | vue : appels / triangles | 3e : appels / triangles | longueur | création à froid vue / 3e (ms, code chaud) |
|---|---|---|---|---|
| FA-24 | 4 / 3 456 | 3 / 928 | 0,840 (0 %) | 4,2 / 2,2 |
| PM-9 | 4 / 2 264 | 3 / 880 | 0,620 (0 %) | 3,9 / 2,3 |
| FP-12 | 5 / 2 772 | 3 / 694 | 0,960 (+1,05 %) | 3,4 / 1,8 |
| TP-50 | 5 / 3 640 | 3 / 1 072 | 1,102 (+0,2 %) | 4,9 / 2,9 |
| P-17 | 5 / 1 206 | 3 / 328 | 0,190 (+0,2 %) | 1,6 / 0,9 |
| couteau | 4 / 436 | 2 / 300 | 0,29 | 1,0 / 0,8 |
| frag | 3 / 1 692 | 2 / 404 | Ø 0,07 | 2,9 / 0,8 |
| flash | 4 / 804 | 2 / 312 | Ø 0,04 × 0,12 | 1,2 / 0,6 |

Repères à 0,000 mm de la table dans les deux versions ; 0 valeur non finie ; volumes et orientations des pièces sains.

## Écarts au document

1. **FP-12, encombrement et repères** (§ 3.3 l. 394 ; § 4.5.8 l. 1172) : 0,95 m, mais `crosse` (+0,22) et `bouche`
   (−0,78) sont à 1,00 m l'un de l'autre — on ne peut pas avoir les deux bouts de l'arme sur ses repères. Choix : couche à
   +0,215 (la crosse 5 mm dans la plaque), couronne à −0,745 : 0,96 m (+1 %) ; la BOUCHE, repère, est 3,5 cm devant le
   canon (l'éclair de L-H y naît : il chevauche la couronne). À trancher par F2 : avancer `bouche` à −0,745 ou accepter.
2. **PM-9** (même lignes) : 0,62 m pour 0,58 m entre `crosse` (+0,18) et `bouche` (−0,40) : le compensateur dépasse la
   bouche de 2,5 cm (−0,425 ; la bouche = la couronne du canon, dans le compensateur) et la plaque la crosse de 1,5 cm.
3. **PM-9, « crosse en fil repliée »** (CoD § 6.2) : repliée, la crosse finirait à +0,07 et l'arme ferait 0,50 m ;
   `crosse` (+0,18) et 0,62 m demandent la crosse DÉPLIÉE. Montrée dépliée, charnière à gauche.
4. **FP-12, visée au guidon perle** (§ 4.5.8 l. 1172, § 4.5.9 « le repère `visee` sur l'axe à 0,24 m ») : `visee` est la
   perle, à −0,70 ; posée à 0,24 m de l'œil, l'arme recule de 46 cm et la crosse passe 0,68 m DERRIÈRE la caméra. Un
   œilleton (anneau) est posé sur le boîtier à −0,035 sur la même ligne de mire (y 0,06) : L-V peut viser par lui. À
   trancher par L-V / F2 (doute, pas une faute de L-W).
5. **« 0 texture »** (§ 5.5.3 point 5) : un `SkinnedMesh` a une texture de matrices d'os (`DataTexture` de three, une par
   squelette rendu) ; aucune autre. Le test 5 compte exactement une texture par squelette de vue rendu, et leur retour par
   `libererArme`.

## Demandes

- **L-V** : exposer les poignets de ses bras (`vm.mains() → { D, G }`, positions monde) pour le test F2 « mains sur les
  repères ≤ 1 cm » ; les gestes des os sont dans `COURSES_OS` (le TP-50 : `rz` 60° puis `z` 8 cm) ; les repères de saisie
  pour les recharges.
- **L-C** : `armeTroisieme` avec `creerArme(id)` (3e personne) — `crosse`, `mainD`, `mainG`, `bouche` ; ne pas libérer
  les géométries ni les matériaux (partagés) : `libererArme(g)`.
- **F2** : les écarts 1 et 4.

## Ce qui reste

Le navigateur (jeton), la planche, l'essai, le rapport du socle, `verifier_proprietaires`.
