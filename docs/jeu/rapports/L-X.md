# Rapport L-X — les vraies armes 3D (hors spec, demande de Haythem du 23/10)

Branche `lot/L-X` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-X`, depuis `vague2` = `vague2-ok` `2e688ba`), port 8155 ;
24/10/2026. Demande : « pour les armes, mets des vraies armes 3D que tu installes par toi-même sur internet ». Les modèles
(8, CC0, 3DModelsCC0) ont été trouvés, convertis et vérifiés avant ce lot : `C:/Users/hgami/Downloads/IRIS_lots/_armes/`
(`choix.md`, `manifeste.json`, `LICENCES.md`, `planche.jpg`).

## Relecture — où j'en suis (relecteur sévère, 24/10/2026, commits « L-X relecture : … »)

**EN COURS (08:50).** Lu : la tâche du lot, le § 4.5.8-4.5.9, § 4.1, § 5.1, § 5.5.3, `_armes/choix.md`, `manifeste.json`,
`LICENCES.md`, le diff `vague2...lot/L-X` (22 fichiers). Hors navigateur : les 16 GLB relus (1 matériau, 1 primitive, aucun
nœud tourné ni mis à l'échelle, aucune extension, textures JPEG, `extras.iris` présents) ; `verifier_proprietaires` sur une
copie avec l'entrée L-X (rendue) : OK 22 fichiers. En attente d'un jeton du navigateur (les trois tenus : L-O, R-KAHN, L-J).

## Constructeur (avant la relecture ; ce qui suit est son rapport, gardé tel quel)

## Où j'en suis

**FINI (24/10, 08:45).** Les 5 armes, le couteau et les grenades sont les VRAIES (8 modèles CC0 de 3DModelsCC0, en GLB à
l'échelle réelle, PBR 1024 px — 512 au téléphone), en vue FPS avec les bras de Haythem (hanche, visée par les vrais
organes de visée, recharge où part le vrai chargeur, sprint, couteau, grenades dégoupillées) et dans les mains des bots
(3e personne, crosse à l'épaule, main gauche sur le vrai garde-main) ; partout où `creerArme` sert (arme de vue, vitrine
de l'armurerie, killcam de L-Q, réserve des bots ; armes au sol de L-P à venir). Chargées à la PRÉPARATION d'une partie
(jamais au démarrage de la balade), avec le modèle fait main de L-W en repli, rempli en place à l'arrivée.
`&rapport=1&lot=L-W` (les tests de L-X) **17/17 sur PC, 17/17 sous `?tel=1`** ; S0 29/29 (22 rejoué seul, la machine), L-V 19/19
et L-C 14/14 avec `&fusion=1` ; balade au bit près ; console sans erreur du jeu. Onglet fermé, serveur 8155 et récepteur 8255
arrêtés, `jeton_3` rendu à 08:42. Restent les DEMANDES 1 à 5 (INT) : surtout la 3 (`tools/proprietaires.json` n'a pas de
L-X : `verifier_proprietaires` ne passe qu'avec elle — essayé sur une copie : OK 22 fichiers) et la 2 (les mains de L-V
réglées pour les vraies armes, valeurs prêtes).

Un repreneur n'a rien à finir ici. `git -C C:/Users/hgami/Downloads/IRIS_lots/L-X log --oneline vague2..` ; refaire les GLB :
`python -I assets/armes/preparer_armes.py C:/Users/hgami/Downloads/IRIS_lots/_armes/choix` (puis recopier la table qu'il affiche
dans `REPERES` / `OS_ARMES` si une origine change) ; les photos arrivent dans `C:/Users/hgami/Downloads/IRIS_lots/_photos/L-X/`
par l'adresse `&recepteur=8255` et un petit récepteur hors dépôt (POST d'un data:URL → fichier ; sans lui, les planches restent
dans `window.__planche*`).

## Ce qui est construit

**Les vraies armes, dans le jeu** (`assets/armes/`, 5,6 Mo ; `assets/tel/armes/`, 2,6 Mo) — les 8 modèles CC0 de 3DModelsCC0
(« nisu », conversion GLB de BoQsc), un seul auteur, un seul niveau de détail, PBR complet, à l'échelle réelle :

| arme du jeu | modèle réel | triangles | longueur | pièces mobiles réelles (os de l'arme de vue) |
|---|---|---|---|---|
| FA-24 « Faucon » | M4A1 | 9 236 | 0,859 m | chargeur, levier d'armement (culasse), détente |
| PM-9 « Guêpe » | M3 Grease Gun | 7 721 | 0,627 m | chargeur, culasse, détente |
| FP-12 « Bélier » | pompe façon 870 | 1 740 | 1,099 m | pompe (+ culasse vue par la fenêtre), détente |
| TP-50 « Héron » | verrou à lunette façon SSG 69 | 4 808 | 1,144 m | culasse à levier (60° autour de l'axe du canon, puis 8 cm), chargeur, détente |
| P-17 « Moineau » | Makarov | 3 991 | 0,169 m | glissière (avec sa sûreté), chargeur, détente |
| couteau | Ka-Bar | 1 550 | 0,297 m | — |
| frag | M26/M61 | 3 642 | 0,10 m | goupille et anneau |
| flash | M84 | 5 562 | 0,12 m | goupille et anneau |

`assets/armes/preparer_armes.py` (lecture/écriture de fichiers, refait les 16 GLB depuis `_armes/choix/`) : **l'origine
remontée en haut de la poignée** (contrat de L-W : la prise de la main droite au creux entre pouce et index ; l'atelier l'avait
mise au centre de la poignée, 3 cm plus bas — la main droite de L-V tombait 3 cm trop bas), relevée sur les coupes de chaque
poignée (FA-24 inclinée de 31°, PM-9 17°, P-17 13°, poignets de crosse du FP-12 et du TP-50) puis vérifiée sur les photos ;
**les grenades d'un demi-tour** (l'arme de vue tient une grenade le +X vers la main gauche et tire la goupille vers +X :
l'anneau doit y être, comme chez L-W) ; **textures en JPEG** (couleur 4:2:0, métal/rugosité et normales 4:4:4 : leurs canaux
sont des mesures ; les normales PNG faisaient 440 à 740 Ko ; aucune extension glTF exigée), 1024 px sur PC, 512 au téléphone ;
**les repères** que lisent l'arme de vue et les bots, relevés sur la géométrie et écrits dans `extras.iris.reperes` (mainD,
saisieChargeur, saisieLevier, saisieGlissiere, arretoir, oeilleton, goupille, courseMainG) ; le JSON de la table pour le JS.
`LICENCES.md` (preuves CC0) et `manifeste_atelier.json` (le manifeste de l'atelier du 23/10 : sources, sha256, licences,
transformations) à côté.

**`js/jeu/modeles_armes.js`** (réécrit ; le contrat du § 4.5.8 gardé) :
- `creerArme(id, { pourVue })` → `Group`. **Vue** : UN `SkinnedMesh` — toutes les pièces du GLB cousues en une géométrie,
  chaque sommet porté par un os rigide (racine pour le fixe, l'os de la vraie pièce mobile, posé à son pivot ; inverses des os
  donnés explicitement) : **1 appel** de dessin (≤ 8 demandés). **3e personne** : la même géométrie sans os, 1 `Mesh`, 1 appel.
  Les deux versions partagent position, normale, uv, index (un seul envoi à la carte) ; un matériau par arme (celui du GLB,
  normalScale (1, −1) et recto-verso tels que GLTFLoader les pose, anisotrope ×4) et son CLONE pour la 3e personne (métal ×0,5 :
  la scène de jeu n'a pas de carte d'environnement en Basse ni en Moyenne, un métal à 1 y est noir).
- `userData.reperes` = la table `REPERES` (relevée sur les vrais modèles, = `extras.iris` du GLB à 0 mm, test 2), tous enfants
  directs ; `userData.reperesMobiles` (vue) = leurs jumeaux enfants des os (chargeur, levier, glissière, pompe, goupille) ;
  `userData.os` = { chargeur, culasse, glissiere, pompe, detente, goupille } = les VRAIES pièces ; `OS_ARMES` (leurs pivots),
  `COURSES_OS` (leurs gestes), `ENCOMBREMENTS` (les longueurs réelles).
- **Chargement asynchrone** : `prechargerArmes({ game })` lit les 8 GLB par un `GLTFLoader` à SON `LoadingManager` (jamais
  `DefaultLoadingManager.onLoad`, qui recuirait ombre du sol, carte d'environnement et cache d'ombre), coud, envoie les textures
  à la carte une par une (une image entre deux), une fois par session, ne rejette jamais ; **rien au démarrage de la balade**
  (test 0 : 0 requête `/armes/` avant la 1re partie). Tant qu'un GLB n'est pas prêt — ou s'il échoue —, `creerArme` rend le
  **modèle fait main de L-W, recalé** (translaté de la moyenne des écarts de sa bouche et de sa main gauche à ceux de la vraie
  arme : les mains de L-V et de L-C le tiennent encore) et lance le chargement ; à l'arrivée, chaque groupe de repli est
  **REMPLI EN PLACE** (même `Group`, même `userData` — `arme3e`, `horsContact`, `ombre` de la réserve des bots gardés —,
  drapeaux d'ombre, d'élagage, d'ordre recopiés), ses programmes compilés AVANT l'échange (la scène de l'arme de vue aux deux
  cibles où elle est dessinée ; la scène de jeu, ombres comprises, pour la 3e personne). Joué : test 0, la préparation d'un essai
  donne le repli, puis 8/8 armes de vue et les armes des bots remplies en place, programmes constants ensuite.
- `etatArmes()`, `armesPretes()`, `chargerModele(id, url, { garder })`, `remplacerRepli(g)` (tests), `forcerFaitMain(oui)` et
  l'adresse `?armes=main` (le repli partout : la cadence comparée), `modeleArme(id)` → { geometrie, materiau } (demande 4),
  `MATERIAUX_ARMES` (ceux du repli, + `glb(id, troisieme)`), `viderCacheArmes()`, `libererArme(g)`, `BASE_ARMES`.

**`js/jeu/tests/test_modeles_armes.js`** (réécrit ; sous la clé `L-W` de `FICHIERS_TESTS` : `&rapport=1&lot=L-W`) — 17 tests :
0 rien au démarrage / tout à la préparation / rempli en place · 1 huit vraies armes (1 appel, triangles réels, textures
1024 / 512, sRGB, normalScale) · 2 repères = table = extras du GLB (1 mm), os aux pivots, jumeaux · 3 encombrement · 4 os
rigides (les sommets de la vraie pièce, tous de 10 cm) · 5 réseau, 16 matériaux, tampons partagés, 0 programme pour 320
exemplaires · 6 création ≤ 5 ms · 7 planche studio · 8 géométrie saine · 9 dans l'arme de vue (1 appel, ≤ 8 avec les bras,
programmes constants en tirant et rechargeant) · 10 pièces mobiles en bout de course · 11 repli → rempli en place · 12 GLB
absent → le repli reste · 13 vue FPS JOUÉE (5 armes × hanche / visée / recharge 0,9 s / sprint, couteau, frag, flash ;
mains ≤ 1 cm ; luminance de l'arme seule) · 14 dans les mains des bots · 15 cadence 4 c. 4 en moyenne · 16 grenades en vol.

## Joué et vérifié (navigateur intégré, 127.0.0.1:8155, 1280 × 720)

- **Vue FPS, les cinq armes** (photos `_photos/L-X/hd_*`, `planche_vue_fps.jpg`) : FA-24 (M4A1 noir, rails, hausse et
  guidon réels, levier d'armement), PM-9 (Grease Gun : la main gauche sur le puits du chargeur, doigts refermés), FP-12 (main
  gauche sur la VRAIE pompe en bois), TP-50 (lunette, levier, crosse verte), P-17 (Makarov, plaquettes) ; hanche, visée,
  recharge (le vrai chargeur part avec la main gauche ; FP-12 : la fenêtre de chargement ; P-17 : le chargeur sous la poignée),
  sprint ; couteau (Ka-Bar en main), frag tenue, flash dégoupillée. Mains : erreur d'IK 0 / 0 cm sur les cinq.
- **Visée** réglée sur photos : la FA-24 vise par sa vraie hausse (œilleton) et son guidon, l'œil à 12 cm de la hausse
  (`oeilleton`) — à 24 cm, la crosse et le tube remplissaient le bas de l'image ; le FP-12 sur la ligne de sa perle, l'œil à
  +0,205 (la joue sur la crosse) — par l'arrière du boîtier, le boîtier bouchait la moitié de l'image ; PM-9 par sa hausse
  à œilleton (le bouchon du boîtier dessous, comme sur le vrai M3) ; P-17 cran et guidon ; TP-50 : lunette (masque du HUD à 85 %).
- **Éclairage** (test 13, luminance moyenne de l'arme seule, photo sans l'arme soustraite) : FA-24 0,08-0,17 (un M4A1 noir :
  rails et détails lisibles), PM-9 0,11-0,18, FP-12 0,10-0,30, TP-50 0,15-0,22, P-17 0,09-0,30 ; 0 % brûlé ; ni arme noire
  (≥ 0,05 exigé) ni brûlée (≤ 3 %). La clé par pièce de L-V (−1 à 0,55) et la carte de studio s'appliquent telles quelles.
- **Bots** (photos `hd_bot_*`) : un clone de Haythem teint SISR tient chaque vraie arme, crosse à l'épaule, main gauche sur le
  vrai garde-main (FA-24), la vraie pompe (FP-12) ; pistolet à deux mains ; mains ≤ 0,01 cm des repères (test 14).
- **Cadence** (même partie 4 c. 4, graine 42, moyenne figée, 6 s simulées, 3 × 60 images faites à la main — onglet non devant,
  temps « non valables », machine partagée par 8 agents) : vraies armes **771 appels**, 546 827 triangles, médiane 41-43 ms ;
  repli fait main (`?armes=main`) **785 appels**, 500 471 triangles, médiane 55-63 ms. Les vraies armes coûtent MOINS d'appels
  (1 par arme au lieu de 3 à 5 en vue et de 2 à 3 par bot), +46 000 triangles ; la cadence n'est pas moins bonne (l'écart de
  temps est du bruit de machine chargée : à refaire par INT, machine calme, onglet devant).
- **Chargement** : préchargement 6,7 s dans ces conditions (8 GLB, 24 textures envoyées une image sur deux, onglet caché :
  40 ms par texture) ; couture 0,7 à 47 ms par arme (la 1re, JIT compris) ; création d'un exemplaire 0,1 ms.
- **Console** : aucune erreur du jeu ; l'erreur connue du service worker et le 404 voulu du test 12 (`absent_l_x.glb`).

## Les `__rapport`

(une page FRAÎCHE par lot, 127.0.0.1:8155, 1280 × 720 — 375 × 812 sous `?tel=1` —, panneau montré mais onglet NON devant :
images faites à la main, temps « non valables » ; machine partagée avec 7 autres agents)

| lot | résultat | durée | notes |
|---|---|---|---|
| L-W (les tests de L-X) | **17/17** | 135 s (`9250786` ; 1er passage à 07:30 : 17/17, 287 s) | signalé non valable : image médiane 4 c. 4 41,9 ms (seuil 33) ; test 0 : la préparation donne le repli, 8/8 armes de vue et 2/2 armes de bots remplies en place à l'arrivée, programmes 170 → 170 ensuite |
| L-W sous `?tel=1` | **17/17** | 148 s (`a9ebdd0`) | textures 512, `assets/tel/armes/` ; test 0 : programmes 100 → 100 ; signalé non valable : 4 c. 4 (2 c. 2) 31,1 ms. 1er passage : 16/17 — test 0, programmes 99 → 101 : deux programmes de PROFONDEUR (la carte d'ombre de la vraie arme, `map` donc « uv », dessinée sans lumière au téléphone) compilés en jeu ; corrigé (`a9ebdd0` : `compilerTroisieme`, la carte d'ombre sans lumière précompilée) |
| S0 (`&lot=S0`) | **28/29**, puis 29/29 | 965 s (!) | 22 « Player.dispose : 20 corps » en délai dépassé (60 s) dans ce passage de 16 min (la machine) ; rejoué seul dans la même page (`__jeu.tests('S0', '22')`) : vert en 2,6 s — rien n'y touche une arme. Balade au bit près AVANT et APRÈS les parties (vue 3 0 / 0, vue 1 0 / 0) ; 345 sièges sur 345 ; 3 cycles : programmes 170 → 170, textures 531 → 531 |
| L-V (`&fusion=1`) | **19/19** | 114 s | F2 vraies armes : 3 appels (arme 1 + bras 2), repères 0 mm, mains 0 cm ; visée : chaque repère sur l'axe à 0,24 m ± 0,15 mm, ± 0,54 px ; environnement et programmes de l'arme constants à travers les qualités (20 → 20) ; signalé : `maj` 0,181 ms (seuil 0,15, relatif) |
| L-C (`&fusion=1`) | **14/14** | 50 s | `poserArme` avec les vraies armes : canon 0,000°, main droite 0,00 cm, gauche ≤ 0,30 cm (FP-12, TP-50), 0,115 ms ; 3 cycles à 7 bots : géométries, textures, enfants identiques |

`python -I tools/verifier_proprietaires.py lot/L-X` : refuse les 19 fichiers d'`assets/armes/`, `assets/tel/armes/` et ce
rapport (« hors de la liste de L-W » : L-X n'est pas dans `tools/proprietaires.json`, demande 3) ; avec l'entrée L-X ajoutée
sur une copie (rendue aussitôt) : **OK 22 fichiers**. Pureté : rien (aucun fichier « simulation » touché). Fins de ligne : CRLF
comme les voisins (`git ls-files --eol`), binaires `-text`. Tous les commits « L-X : … » avec la ligne d'attribution.

## Les demandes (à INT ; chacune dans un fichier qui n'est pas à L-X)

**1. Le préchargement à la préparation** — `js/jeu/partie.js` (S0 ; L-Q en vague 3), `Partie.preparer` (l. 88-97 sur `vague2`).
Sans elle, c'est le premier `creerArme` de la préparation (la réserve des bots, `preparerArmes3e`) qui lance le chargement :
l'arme de vue et les bots reçoivent le repli, rempli en place à l'arrivée (joué, sans image figée) — mais la 1re partie d'une
session peut montrer le repli quelques dixièmes de seconde après le GO (test 0, 2e passage : « main → glb » après l'entrée).
Avec elle, les GLB arrivent pendant le graphe, et aucun repli ne se montre jamais :
```js
import { prechargerArmes } from './modeles_armes.js';            // (avec les imports, l. 12-36)
  async preparer(progres) {
    const g = this.game, P = this.constructor.prerequis, pr = progres || (() => {});
    const armes = prechargerArmes({ game: g });                   // L-X : les 8 GLB des armes, une fois par session, pendant le graphe
    const M = mondeDesParties(g);
    …
    pr('Plan de l’école', 1);
    if (P.avatars) await preparerAvatars(g, this.opts.avatars || [], pr);
    if (P.catalogue) await preparerCatalogue(g, pr);
    await armes;                                                  // (avant l'arme de vue : elle crée ses armes et compile sa scène)
    pr('Armes et effets', 0);
```
(Le chargement court ainsi pendant le graphe ET les avatars ; si les GLB arrivent avant `preparerArmes3e` — le cas courant —,
les bots reçoivent directement les vraies armes, sinon leur repli est rempli en place sans image figée. Mesuré ici, machine
chargée par 8 agents, onglet caché : préchargement 6,7 s sur PC, 22 s au téléphone émulé — lecture, couture, envoi des 24
textures une image sur deux, compilation de la 3e personne et de ses ombres plafonnée à 4 s ; à mesurer par INT machine calme,
contre le budget de la 1re préparation, § 3.10 : 4 s PC, 10 s téléphone.)
(Variante sans toucher `partie.js` : `await prechargerArmes({ game })` en 1re ligne de `compilerArmes3e` — `pose_arme.js`, L-C
— et de `Viewmodel._preparer` — `viewmodel.js` —, qui importent déjà `modeles_armes.js` ; mais le chargement ne commence alors
qu'après les avatars : +0,2 à 0,5 s à la 1re préparation.)

**2. Les mains de L-V sur les vraies armes** — `js/jeu/viewmodel.js` (L-V ; L-Q en vague 3), `PRISES` (l. 70-100). Réglées au
navigateur en remplaçant `PRISES` à chaud (photos `_photos/L-X/essai_garde_*`, `essai_p17_*`), erreur d'IK 0 cm :
- la main GAUCHE sous le garde-main (FA-24), la pompe (FP-12), le fût (TP-50) : avec `GARDE`, la paume était À CÔTÉ du
  garde-main et les doigts, repliés, montaient le long de son flanc (déjà ainsi sur les armes de L-W : photo
  `_photos/L-W/relecture/f_fa24_hanche.jpg`) ; dessous, paume vers le haut et un peu vers l'arme, doigts qui enveloppent le côté
  lointain, pouce le long du côté proche (le geste de Call of Duty). Le PM-9 garde `GARDE` (la main sur le puits du chargeur,
  doigts refermés : juste tel quel) :
```js
const GARDE_DESSOUS = (o) => prise(o, [-0.014, -0.030, 0.044], [0.55, 0.40, -0.73], [-0.40, 0.92, 0.05], [0.95, 1.1, 0.8], [0.75, 0.85, 0.6], [0.05, 0, 0]);
  fa24: { d: POIGNEE(), g: GARDE_DESSOUS(REPERES.fa24.mainG), …
  fp12: { d: POIGNEE(), g: GARDE_DESSOUS(REPERES.fp12.mainG), course: …
  tp50: { d: POIGNEE(), g: GARDE_DESSOUS(REPERES.tp50.mainG), …
```
- le P-17 tenu à deux mains : les deux mains étaient SOUS la poignée (le Makarov au-dessus d'elles, la main droite cachée ; déjà
  ainsi avec le P-17 de L-W, `f_p17_vide.jpg`) ; remontées et refermées sur la poignée :
```js
  p17: { d: prise([0, 0, 0], [0.020, -0.050, 0.058], [-0.20, -0.35, -0.91], [-1, 0.1, 0], [1.05, 1.25, 0.9], [0.30, 0.45, 0.35], POUCE_TENU),
    g: prise(REPERES.p17.mainG, [-0.030, -0.030, 0.030], [0.65, 0.05, -0.76], [0.92, 0.3, 0.1], [1.0, 1.1, 0.8], [0.9, 1.0, 0.7], [0.2, 0.1, 0.1]),
```
- les ARRÊTOIRS (main gauche, recharge à vide) relevés sur les vrais modèles : `REPERES.<id>.arretoir` — FA-24 (−0,012 ; 0,002 ;
  −0,082), P-17 (−0,011 ; 0,007 ; −0,035), PM-9 (le loquet du chargeur, −0,015 ; −0,013 ; −0,216), TP-50 (flanc gauche du boîtier
  au-dessus du chargeur), FP-12 (la fenêtre de chargement) ; les points en dur de `PRISES.<id>.arretoir` sont dans le repère des
  armes de L-W (FA-24 à 1,8 cm du vrai, P-17 à 2,8 cm ; PM-9 et TP-50 à 16 cm — celui du TP-50 était le levier, à droite) : `arretoir: prise(REPERES.<id>.arretoir,
  <son décalage du poignet>, …)` pour les cinq.

**3. Les propriétaires** — `tools/proprietaires.json` (S0 ; F2 et INT peuvent le changer) : `"base": { …, "L-X": "vague2" }` et
`"fichiers": { …, "L-X": ["js/jeu/modeles_armes.js", "js/jeu/tests/test_modeles_armes.js", "assets/armes/**", "assets/tel/armes/**"] }`.
Avec ces deux lignes (essayées sur une copie, puis rendue), `python -I tools/verifier_proprietaires.py lot/L-X` → `OK 22
fichiers (lot/L-X, L-X, base vague2)`. Sans elles, il refuse les 19 fichiers d'`assets/` et ce rapport (« hors de la liste de
L-W ») : rien d'autre (pureté comprise).

**4. Les grenades en vol** — `js/jeu/effets.js` (L-H ; L-Q en vague 3), l. 376 : `pools.grenades` est un icosaèdre (r 1, mis à
l'échelle à l'instance). Avec la vraie géométrie, deux pools (frag, flash), 1 appel chacun, à l'échelle 1 (le GLB est en
mètres) : `const F = modeleArme('frag'), L = modeleArme('flash');` → `poolMesh(F.geometrie, F.materiau, N.grenades, 'frags en
vol', { fx: false })` et de même pour la flash (avec repli sur l'icosaèdre si `modeleArme` rend null : GLB absent) ; le genre
d'une grenade en vol est déjà lu par `genreGrenade`. (Appelé après `prechargerArmes`, donc dans `Effets.preparer`.)

**5. Les crédits** — `CREDITS.md` (INT) : aucun crédit n'est obligatoire (CC0 1.0 pour les huit, aucun modèle CC-BY) ; la ligne de
remerciement conseillée : « Armes 3D : 3DModelsCC0 (« nisu »), domaine public (CC0 1.0), conversion GLB par BoQsc —
https://www.3dmodelscc0.com — adaptées pour IRIS (origine, textures). » (`assets/armes/LICENCES.md` a les preuves.)

**6. Pour les autres** (aucune ligne à écrire) : `sw.js` met déjà les `.glb` en « lourds » (cache d'abord) — jouables hors ligne
après la 1re partie ; L-P (armes au sol, armurerie) : `creerArme(id, { pourVue: false })` rend la vraie arme à la 3e personne
(1 appel, `dynamique`), `aff.viewmodel.vitrine(id)` montre la vraie arme de vue ; L-Q (killcam) : l'arme de vue du tueur est la
vraie ; `harnais.js` : les tests de L-X sont sous la clé `L-W` (le fichier de L-W dans `FICHIERS_TESTS`) — rien à changer.

## Crédits (pour `CREDITS.md`, INT)

**Aucun crédit CC-BY** : les huit modèles sont dans le domaine public (CC0 1.0) — aucun secours CC-BY de l'atelier n'est utilisé
(leurs lignes de crédit, au cas où, sont dans `assets/armes/LICENCES.md`). Remerciement conseillé (facultatif) :
« Armes 3D : 3DModelsCC0 (« nisu »), domaine public (CC0 1.0), conversion GLB par BoQsc — adaptées pour IRIS. »

## Écarts au document

1. § 3.3 « Encombrement » : les vraies armes mesurent FA-24 0,859 (+2 %), PM-9 0,627 (+1 %), FP-12 **1,099 (+16 %)**, TP-50 1,144
   (+4 %), P-17 **0,169 (−11 %)** m — un 870 à canon court reste plus long que les 0,95 du document ; un Makarov est un petit
   pistolet. `ENCOMBREMENTS` dit les vraies longueurs (personne d'autre ne le lit).
2. § 4.5.8 : `pourVue` ≤ 6 appels et 3e personne ≤ 1 500 triangles (acceptation de L-W, § 5.5.3) → 1 appel et les triangles du vrai
   modèle (1 550 à 9 236, ≤ 30 000) : la 3e personne coûte 1 appel par bot au lieu de 3, +46 000 triangles pour 7 bots.
   `MATERIAUX_ARMES` : ceux du repli de L-W, plus un matériau PBR par arme (et son clone de 3e personne).
3. § 4.5.8 « aucun fichier, aucune texture » (le choix de L-W) : renversé par la demande de Haythem du 23/10 — 16 GLB (8,2 Mo),
   chargés à la préparation d'une partie seulement.
4. § 4.5.9 « le repère `visee` sur l'axe à 0,24 m » : la FA-24 vise par `oeilleton` (la ligne de mire, l'œil à 12 cm de la vraie
   hausse) comme le FP-12 depuis F2 ; `visee` reste le vrai viseur.
5. Le contrat de `creerArme` (synchrone) est gardé ; ce qui est asynchrone (le GLB) passe par le REPLI rempli en place — un
   groupe rendu par `creerArme` avant l'arrivée des GLB change de contenu (enfants, `userData.os`, `reperesMobiles`) une fois ;
   ceux qui gardent une référence à un OS ou à un maillage de l'arme (aucun aujourd'hui : `viewmodel.js` et `pose_arme.js` les
   relisent à chaque image) doivent les relire.
## Photos (regardées ; `C:/Users/hgami/Downloads/IRIS_lots/_photos/L-X/`)

- `hd_fa24_hanche`, `hd_fa24_visee` (avant le réglage) puis `hd2_fa24_visee` (la vraie hausse, le guidon dans l'œilleton),
  `hd_pm9_hanche` / `_visee`, `hd_fp12_hanche` / `_visee` puis `hd2_fp12_visee` (la perle au bout de la bande), `hd_tp50_hanche`,
  `hd_tp50_visee_debut`, `hd_p17_hanche` / `_visee` : la vue FPS en 1280 × 720 ;
- `hd_bot_fa24`, `hd_bot_pm9`, `hd_bot_fp12`, `hd_bot_tp50`, `hd_bot_p17` : un bot SISR à 2,4 m qui tient chaque vraie arme ;
- `pc/planche_vue_fps.jpg` (5 armes × 4 états + couteau, frag, flash), `pc/planche_studio.jpg` (8 × 4 vues, 3e personne
  comprise), `pc/planche_courses.jpg` (pièces mobiles en bout de course : rien ne flotte, rien ne traverse), `pc/planche_bots.jpg`
  (celle du test 14, au premier passage : les bots y étaient loin — reprise en `hd_bot_*`) ; les mêmes sous `?tel=1` à la racine ;
- `essai_garde_A`, `essai_garde_B`, `essai_garde_B_haut`, `essai_garde_B_fp12`, `essai_garde_B_tp50`, `essai_p17_A` à `_C`,
  `crop_*` : les mains de L-V réglées à chaud (demande 2).

## Navigateur

`jeton_3` repris PÉRIMÉ à 07:25 (qui.txt de G-MAT du 06:24:28, 61 min ; note `NOTE_L-X_jeton3.txt` laissée ; G-MAT a fermé son
onglet à 07:47 et l'a noté), après 45 min d'attente (06:40-07:25 : L-O, G-LUM et G-MAT tenaient les trois). qui.txt
rafraîchi à chaque série. Onglet `tab-54` (127.0.0.1:8155) fermé, serveur 8155 et récepteur 8255 arrêtés, `jeton_3` rendu
(`rm -r`) et ma note retirée à 08:42.

## Ce qui reste (à d'autres)

- INT : les demandes 1 à 5 ; les mesures de temps machine calme, onglet devant (cadence comparée à `?armes=main`, préchargement,
  couture) ; ✋ un œil sur les gestes que je n'ai pas photographiés : la recharge à vide (arrêtoir, demande 2), le levier du TP-50
  en bout de course dans une vraie partie, l'inspection.
- Les grenades en vol (demande 4, L-H / INT) ; les armes au sol et l'armurerie (L-P) prendront `creerArme` tel quel.
- Doutes notés : le PM-9 (M3 de 1944) détonne un peu à côté du M4A1 (choix de l'atelier, `_armes/choix.md`) ; le FA-24 est très
  noir (un vrai M4A1 l'est) — luminance moyenne 0,08-0,17 en pleine lumière : si Haythem le veut plus lisible, `AJUSTE_MAT`
  (modeles_armes.js) peut éclaircir la couleur du matériau de vue sans toucher aux textures.
