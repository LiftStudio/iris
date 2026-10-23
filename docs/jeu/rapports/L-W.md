# Rapport L-W — les modèles d'armes (vague 2)

## Relecture — où j'en suis (relecteur, 23/10/2026, commits « L-W relecture : … »)

**EN COURS.** Lu : la spec (§ 3.3, § 4.1, § 4.5.8-4.5.9, § 4.10, § 5.1, § 5.5.3), CoD § 6.2, le diff `socle...lot/L-W`
(3 fichiers), la planche et les photos du constructeur. `verifier_proprietaires` : OK 3 fichiers ; fins de ligne CRLF comme
les voisins ; 9 commits préfixés, tous avec la ligne d'attribution. Corrections de lecture COMMITÉES (`160cb2c`,
`a88fadf`, détail plus bas) et passées sous Node (tests 2, 3, 4, 6, 8 ; aperçu logiciel des pièces en bout de course).
Jeton du navigateur : en attente depuis 06:00 (les trois pris par L-E, L-M, L-H). Reste : rejouer L-W et S0 sur PC et sous
`?tel=1` (avec les tests 7 et 10 regardés), jouer l'essai, puis clore ce rapport.

### Ce que la relecture a trouvé et corrigé (lecture du code, avant le navigateur)
1. **Pièces qui flottaient en bout de course** (vue ; invisibles au repos, donc absentes de la planche et des tests) :
   - P-17 : la couronne polie, l'âme et le guide du ressort sont FIXES, à −0,135 ; la glissière reculée de 3 cm (au tir, et
     tenue en arrière à vide par L-V) laissait la couronne flotter 2,5 cm devant elle. Ajout d'un canon fixe (r 5,8 mm,
     −0,1305 → −0,0705) et d'un guide (−0,1345 → −0,0945), cachés dans la glissière au repos : glissière reculée, le canon
     paraît, comme sur un vrai pistolet.
   - TP-50 : la culasse ne faisait que 3,8 cm (+0,030 → +0,068) ; reculée de 8 cm elle flottait 7,5 cm derrière le boîtier, à
     chaque coup (le réarmement est 0,25 s après le tir, en hanche). Le corps se prolonge dans le boîtier jusqu'à −0,05 (os
     `culasse`, vue seulement) : ouverte, elle sort du boîtier.
   - FA-24 : le levier d'armement tiré de 7,5 cm était un T sans tige au-dessus du tube de crosse. Une tige (os `culasse`,
     vue) court dans le boîtier.
2. **Chargeur du P-17** (`COURSES_OS`) : tiré tout droit vers le bas (`y −0,16`), il traversait le devant de la poignée inclinée
   de 15° dès 2,6 cm (7 mm de jeu). Sa course suit l'axe de la poignée : `y −0,16·cos 15°, z +0,16·sin 15°`.
3. **Boîtes des `SkinnedMesh`** : le maillage recevait la Box3 et la Sphere de la GÉOMÉTRIE PARTAGÉE ;
   `SkinnedMesh.computeBoundingBox()` (three r170) les réécrit sur place avec les os de CET exemplaire — un appel (L-V, un
   outil) aurait faussé la boîte de toutes les armes. Copiées par exemplaire.
4. **Repère `oeilleton` du FP-12** (ajout, 0 ; 0,060 ; −0,035 : le centre de l'anneau arrière, sur la ligne de mire de la
   perle) : viser par la perle à 0,24 m (§ 4.5.9) met la crosse 0,68 m derrière la caméra ; par l'œilleton, 1,5 cm derrière
   l'œil (FA-24 : 4 cm). Donné à L-V et F2 pour trancher l'écart 4.
5. **Test 5, « 0 requête »** : il comptait `performance.getEntriesByType('resource')`, dont le tampon plafonne (250 par défaut ;
   203 déjà pris à ce test sur PC) — plein, une requête de plus n'y entre plus et « +0 » ne prouve rien. Remplacé par un `PerformanceObserver` ouvert pendant
   le test (`takeRecords` après 300 ms).
6. **Planche (test 7)** : la 3e colonne s'appelait « vue du tireur » aussi pour le couteau et les grenades (c'est un
   trois-quarts arrière) ; et le modèle à la 3e PERSONNE — celui que le joueur voit sur tous les bots — n'était sur aucune
   photo. 4e colonne « 3e personne (bots) » (32 photos). Le studio est mis en commun (`studio()`).
7. **Test 10 (ajout) : les pièces mobiles en bout de course** — chaque os au bout de `COURSES_OS` (culasse du TP-50 levée de
   60° ET reculée ; chargeurs à 40 %, à la sortie du puits), en vue du tireur et de flanc : `window.__plancheCourses`, à
   regarder (ce que les points 1 et 2 ont manqué).
8. **Repères sous les os** (contrat § 4.5.8 « `userData.reperes` = REPERES[id] (Object3D posés) ») : le constructeur avait mis
   les repères d'une pièce mobile SOUS son os, leur `position` relative au pivot (la `mainG` du FP-12 à 42 cm de la table
   pour qui lit `position`). Le squelette du socle les posait tous enfants directs du groupe, et L-V a codé contre lui (règle
   4) : son test `F2 vraies armes` compare `reperes[n].position` à la table — il aurait échoué à F2. Remis comme au socle
   (tous enfants directs, `position` = la table, vérifié par le test 2), et les repères qui suivent une pièce ont un JUMEAU
   enfant de l'os, sous `userData.reperesMobiles` (ajout ; `null` en 3e personne).

## Constructeur (avant la relecture)

Branche `lot/L-W` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-W`), partie de `socle` (`e06258f`, tag `socle-ok`),
port 8133 ; 23/10/2026.

## Où j'en suis

**FINI.** Les huit modèles sont construits, joués dans le navigateur intégré (jeton 3, 04:43-04:53) et vérifiés :
- `&rapport=1&lot=L-W` : **9/9 sur PC** (qualité haute, 10,5 s ; 1 temps signalé, voir plus bas) et **9/9 sous `?tel=1`**
  (émulation 375 × 812, qualité moyenne, 9,5 s, 0 signalé).
- `&rapport=1&lot=S0` sur la branche : **29/29 sur PC** (72,1 s, 0 signalé) et **29/29 sous `?tel=1`** (56,9 s) — la
  balade au bit près avant et après les parties (points 1 et 27 : vue 3 0 / 0, vue 1 0 / 0), programmes constants
  pendant 10 s de tir avec les vrais modèles dans l'arme de vue (point 8 : 147 → 147 PC, 86 → 86 tel).
- `python -I tools/verifier_proprietaires.py lot/L-W` → `OK 3 fichiers (lot/L-W, L-W, base socle)`.
- Console : seule l'erreur connue du service worker (« An unknown error occurred when fetching the script »).
- Onglet fermé, serveur (8133) et récepteur de photos (8233) arrêtés, jeton rendu à 04:53.

Les deux tests `apresFusion` (mains de L-V sur les repères, armes des bots de L-C) sont écrits pour F2.
Un repreneur n'a rien à finir ; les outils de session (aperçu logiciel sous Node, récepteur de photos, attente du jeton)
sont copiés dans `C:/Users/hgami/Downloads/IRIS_lots/_photos/L-W/outils/`.

## Ce qui est construit

`js/jeu/modeles_armes.js` (≈ 790 lignes) — les huit armes faites main en primitives (boîtes chanfreinées à 44 triangles,
cylindres, tours `LatheGeometry`, profils extrudés biseautés avec trous, une sphère « quadrillée »), AUCUN fichier, aucune
texture, aucune marque, aucun texte :
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
  guidon à un point blancs — tout sur l'os), canon poli FIXE visible dans la fenêtre quand la glissière recule, couronne,
  carcasse, cache-poussière à rail, bec, poignée à 15° et plaquettes, pontet carré, détente, arrêtoir, chargeur dans la
  poignée (os ; caché au repos, sa semelle dessous).
- **Couteau** : manche à creux de doigts (teinte), garde, pommeau, lame à pointe rabattue, tranchant poli, gouttière.
- **Frag** : corps quadrillé (8 colonnes, 6 rangs, sillons à −6 %), fusée, cuillère à gauche, anneau et goupille (os).
- **Flash** : cylindre à 18 trous, cerclages, fusée, cuillère à gauche, anneau et goupille (os).

Deux versions d'une même recette (les PLANS) : `pourVue` = un `SkinnedMesh` par matériau, toutes les pièces d'un matériau
COUSUES, chaque sommet porté par un seul os (poids 1), os enfants d'une `racine` posés à leurs pivots (`OS_ARMES`),
`frustumCulled = false`, boîte et sphère du repos posées sur le maillage (three ne les recalcule pas par les os, exemplaire
par exemplaire) ; 3e personne = un `Mesh` par matériau (≤ 3 : le poli et la lentille passent à l'acier, le verre et le
blanc disparaissent), boîtes sans chanfrein sauf les pièces de silhouette (garde-mains octogonaux, pompe), segments divisés
par deux, lunette simplifiée, `castShadow`/`receiveShadow`, `userData.dynamique`. Géométries en CACHE par arme et par
version, PARTAGÉES par tous les exemplaires ; matériaux partagés (`MATERIAUX_ARMES`). Les normales sont lissées par un
lisseur à angle (table de hachage à 10 µm : `toCreasedNormals` de three hache au centimètre, il fusionnerait des pièces
entières d'une arme).

Ajouts au contrat (règle 3 : ajouts seulement, signatures inchangées — le point 11 du socle le confirme) : exports
`IDS_ARMES`, `ENCOMBREMENTS`, `OS_ARMES` (pivots), `COURSES_OS` (le geste de chaque os, pour L-V), `viderCacheArmes()`
(tests), `libererArme(g)` (rend la texture d'os du squelette ; jamais les géométries ni les matériaux, partagés) ;
matériaux `lentille`, `blanc`, `poli`, `tous` ; repères `mainD` des armes à feu, `saisieChargeur`, `saisieLevier`,
`saisieGlissiere` ; `userData.squelette`, `appels`, `triangles`, `sommetsParOs`. En vue, les repères portés par une pièce
mobile sont enfants de son os (`mainG` du FP-12 sur la pompe, les saisies, l'anneau des grenades) ; `visee` ne l'est
jamais (la glissière du P-17 recule, la visée de L-V ne doit pas la suivre). **(Relecture : les repères sont redevenus
enfants directs du groupe ; ce sont leurs jumeaux de `userData.reperesMobiles` qui suivent les os — point 8 plus haut.)**

`js/jeu/tests/test_modeles_armes.js` — 9 tests (les 7 points du § 5.5.3, la géométrie saine, l'arme de vue du socle en
essai) et 2 pour F2 (`apresFusion`).

## Le `__rapport` (PC, `http://127.0.0.1:8133/?test=1&rapport=1&lot=L-W`)

`ok: true`, `total: 9`, `echecs: []`, `signales: [{ nom: 'création à froid, la pire (ms)', mesure: 5,9, seuil: 5 }]`
(la FA-24 de vue, médiane de 3 à froid, la machine chargée par les autres agents ; 3,5-3,7 ms aux deux passes
précédentes), `ms: 10 452`, qualité haute, téléphone faux.
Sous `?tel=1` : `ok: true`, `total: 9`, `echecs: []`, `signales: []`, `ms: 9 508`, qualité moyenne, téléphone vrai.

| # | Critère (§ 5.5.3) | PC | `?tel=1` |
|---|---|---|---|
| 1 | 8 armes ; vue ≤ 6 appels / ≤ 8 000 tri. ; 3e ≤ 3 / ≤ 1 500 (comptés ET rendus) | FA-24 4/3 456 · 3/960 ; PM-9 4/2 264 · 3/912 ; FP-12 5/2 796 · 3/742 ; TP-50 5/3 640 · 3/1 072 ; P-17 5/1 206 · 3/328 ; couteau 4/436 · 2/300 ; frag 3/1 692 · 2/404 ; flash 4/804 · 2/312 | idem |
| 2 | repères = `REPERES` ± 1 mm ; `userData.os` selon l'arme | écart max 0 mm (vue et 3e) ; os de `OS_ARMES` en `Bone`, aucun en 3e ; 11 repères portés suivent leur os, les autres ne bougent pas | idem |
| 3 | encombrement ± 3 % | FA-24 0,840 (0 %) · PM-9 0,620 (0 %) · FP-12 0,960 (+1,1 %) · TP-50 1,102 (+0,2 %) · P-17 0,190 (+0,2 %) | idem |
| 4 | os rigides : 10 cm, seuls ses sommets, compte exact | 16 os : sommets bougés = sommets portés = comptés à l'assemblage (FA-24 chargeur 1 308/1 308, culasse 264, détente 156 ; FP-12 pompe 1 128 ; TP-50 culasse 1 260 ; P-17 glissière 1 182 ; goupilles 768…), tous de 10 cm, poids (1, 0, 0, 0) partout | idem |
| 5 | 0 réseau, 0 texture ; +20 exemplaires : 0 matériau, 0 programme | requêtes +0 · 0 carte · 14 matériaux, tous de la table → 14 · programmes 141 → 141 · textures 516 → 676 (+160 = 160 squelettes de vue rendus : leurs textures d'os) → 516 → 508 après `libererArme` | programmes 81 → 81 · textures 319 → 479 → 319 → 311 |
| 6 | création ≤ 5 ms (temps) | à froid (cache vidé, code chaud), médiane de 3 : pire 3,7 / 3,6 / **5,9 (signalé)** ms selon la passe ; en cache 0,24 ms (FA-24 de vue) | pire 3,2 ms |
| 7 | planche 8 × 3 par `__jeu.photo` | 24 photos, l'arme sur 4 à 19 % de chaque image (contre la même photo sans elle) | 24 photos, 2 à 10 % |
| 8 | (ajout) géométrie saine | 63 972 sommets : 0 non fini, 0 normale non unitaire, 0 triangle nul | idem |
| 9 | (ajout) dans l'arme de vue du socle, en essai | 8/8 modèles (`SkinnedMesh`), FA-24 4 appels, programmes 148 → 148 pendant 3 s de tir et une recharge (30 tirs) | 88 → 88 |

Le socle sur la branche (`&lot=S0`) : PC 29/29 (1 et 27 : 0 / 0 ; 7 : entrée 59 ms, 13 tirs, 4 touches, 1 élim. ; 8 :
géo 1 715 → 1 715, tex 509 → 509, enfants 348 → 348, programmes 147 → 147 ; 29 : tout vrai) ; tel 29/29 (8 : géo 1 296
→ 1 296, tex 412 → 412, programmes 86 → 86).

## Photos regardées

Dans `C:/Users/hgami/Downloads/IRIS_lots/_photos/L-W/` (hors de l'arbre git : la liste des propriétaires n'admet que ce
rapport dans `docs/`) :
- `planche.jpg` (PC) et `planche_tel.jpg` : la planche du point 7 — 8 armes × flanc gauche, trois-quarts avant, vue du
  tireur (la caméra de la pose de hanche de L-V, § 4.5.9), rendues par le jeu (`__jeu.photo` : bloom, sortie, étalonnage)
  sur un fond de studio. Proportions de CoD § 6.2 tenues ; aucune inscription.
- `essai_fa24_hanche.jpg`, `essai_montage_4.jpg` (PM-9, FP-12, TP-50, P-17) : l'arme de vue du SOCLE (pose de hanche fixe,
  sans bras) en essai, au hall : les modèles dans le vrai rendu, avec la carte de studio de l'arme.
- `essai_fa24_os.jpg` : la même, le chargeur sorti, le levier d'armement tiré et la détente pressée PAR LES OS — le
  dépouillement sur la carte graphique fait ce que le test 4 vérifie sur le processeur.
- `apercu_logiciel_vue.png`, `apercu_logiciel_3e.png`, `apercu_logiciel_hanche_visee.png` : l'aperçu logiciel (un petit
  rastériseur sous Node, avant le jeton) qui a servi aux retouches : pontets qui n'atteignaient pas la poignée, pontet et
  détente du P-17 détachés de la carcasse, crosse du FP-12 trop massive, bipied du TP-50 trop long, garde-mains en 3e
  personne qui perdaient leur octogone.

## Écarts au document

1. **FP-12, encombrement et repères** (§ 3.3 l. 394 ; § 4.5.8 l. 1172) : 0,95 m, mais `crosse` (+0,22) et `bouche`
   (−0,78) sont à 1,00 m l'un de l'autre — on ne peut pas avoir les deux bouts de l'arme sur ses repères. Choix : couche à
   +0,215 (la crosse 5 mm dans la plaque), couronne à −0,745 : 0,96 m (+1 %) ; la BOUCHE, repère, est 3,5 cm devant le
   canon (l'éclair de L-H y naît : il chevauche la couronne). À trancher par F2 : avancer `bouche` à −0,745 ou accepter.
2. **PM-9** (mêmes lignes) : 0,62 m pour 0,58 m entre `crosse` (+0,18) et `bouche` (−0,40) : le compensateur dépasse la
   bouche de 2,5 cm (−0,425 ; la bouche = la couronne du canon, dans le compensateur) et la plaque la crosse de 1,5 cm.
3. **PM-9, « crosse en fil repliée »** (CoD § 6.2) : repliée, la crosse finirait à +0,07 et l'arme ferait 0,50 m ;
   `crosse` (+0,18) et 0,62 m demandent la crosse DÉPLIÉE. Montrée dépliée, charnière à gauche.
4. **FP-12, visée au guidon perle** (§ 4.5.8 l. 1172, § 4.5.9 « le repère `visee` sur l'axe à 0,24 m ») : `visee` est la
   perle, à −0,70 ; posée à 0,24 m de l'œil, l'arme recule de 46 cm et la crosse passe 0,68 m DERRIÈRE la caméra (vu à
   l'aperçu : l'œil au milieu du canon). Un œilleton (anneau) est posé sur le boîtier à −0,035 sur la même ligne de mire
   (y 0,06) : L-V peut viser par lui. À trancher par L-V / F2 (doute, pas une faute de L-W).
5. **« 0 texture »** (§ 5.5.3 point 5) : un `SkinnedMesh` a une texture de matrices d'os (`DataTexture` de three, une par
   squelette rendu) ; aucune autre. Le test 5 compte exactement une texture par squelette de vue rendu, et leur retour par
   `libererArme`.
6. **Point 6, mesure** : « ≤ 5 ms par arme » mesuré À FROID (cache de géométries vidé, code déjà compilé par une passe),
   médiane de 3, la pire des 16 (8 armes × 2 versions). En cache, une arme coûte 0,24 ms.
7. **Point 7, la planche** : faite par `__jeu.photo` d'une superposition (scène de studio : fond dégradé collé à la
   caméra, carte d'environnement PMREM de `RoomEnvironment`, aucune lumière ajoutée — `Light(` est interdit dans
   `js/jeu/` hors `viewmodel.js`, tests compris) ; gardée dans `window.__plancheArmes`, et écrite sur le disque par un petit
   récepteur local (`recepteur.py`, port 8233) — la liste des propriétaires n'admet pas d'image dans la branche.
8. **Le navigateur** (§ 5.1 règle 3) : attente de 03:27 à 04:43. Mon attente a repris `jeton_3` comme PÉRIMÉ à 03:51
   (`qui.txt` de L-V daté 03:05, 2 717 s : la règle des 45 min) — L-V tenait encore son onglet (sa note
   `_navigateur/NOTE_L-V_jeton3.txt`) et L-B a pris le jeton dans la seconde ; je n'ai rien ouvert sur ce jeton-là. Puis,
   après deux pertes de course à 30 s, l'essai est passé à toutes les 10 s (écart à la règle 3, noté). J'ai tenu `jeton_3`
   de 04:43:51 à 04:53:19 et l'ai rendu en vérifiant que son `qui.txt` était le mien.

## Demandes

- **L-V** : exposer les poignets de ses bras (`vm.mains() → { D, G }`, positions monde) pour le test F2 « mains sur les
  repères ≤ 1 cm » (sinon F2 branche le test sur ce que L-V expose) ; les gestes des os sont dans `COURSES_OS` (le TP-50 :
  `rz` 60° puis `z` 8 cm ; la pompe `z` 9 cm, que `mainG` suit) ; les repères de saisie pour les recharges ; l'écart 4
  (visée du FP-12). Les modèles ne changent pas la scène de l'arme : 3 à 5 appels par arme (≤ 6).
- **L-C** : `armeTroisieme` avec `creerArme(id)` (3e personne) — `crosse`, `mainD`, `mainG`, `bouche` ; ne pas libérer
  les géométries ni les matériaux (partagés) : `libererArme(g)`.
- **L-H** : la bouche du FP-12 est 3,5 cm devant le canon (écart 1).
- **F2** : les écarts 1, 4 et 8 ; rejouer les deux tests `apresFusion` de L-W.

## Doutes

- Les teintes du § 4.5.8 sortent CLAIRES dans le studio de l'arme (la terre de la FA-24 tire sur le beige, le vert du
  FP-12 sur l'olive pâle) : c'est la carte d'environnement de L-V, pas le matériau ; à juger avec les bras et l'intensité de
  la clé par zone.
- Le point rouge (`0xff2a1a`, `toneMapped: false`) est net mais petit en hanche (r 0,9 mm) ; en visée il est au centre.
  Si L-H veut qu'il « bave », c'est le bloom, ou une couleur au-delà de 1 (`color.multiplyScalar`), pas un plus gros point.
- Les temps sont relatifs (14 agents sur la machine) : la création à froid a varié de 3,5 à 5,9 ms d'une passe à l'autre.

## Ce qui reste

Rien pour L-W. À F2 : les deux tests `apresFusion` (mains de L-V, armes des bots de L-C) et les écarts ci-dessus.
