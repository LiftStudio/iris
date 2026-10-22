# CARTE DES PERSONNAGES — IRIS → FPS + PROP HUNT

Lecteur : personnages. Rien n'a été modifié dans `C:/Users/hgami/Downloads/IRIS` (git status vide après coup) ni dans LA
CAGE (`C:/Users/hgami/Downloads/Basket_1v1_nouveau/Basket_1v1`). Les mesures viennent d'un **banc jetable** hors dépôt
(`scratchpad/jeu/banc/`, servi en lecture seule par `scratchpad/jeu/outils/serveur_banc.py` : `/iris/…` = IRIS, `/cage/…` =
LA CAGE) qui importe les VRAIS modules d'IRIS (`js/player.js`, `js/avatar.js`, `js/anim.js`) et charge les vrais GLB.

Machine de mesure : PC de Haythem, Radeon intégrée AMD (ANGLE D3D11, id 0x1681), 12 fils, Chrome 152 (volet navigateur de
l'appli Claude, souvent caché : tout est chronométré en synchrone, `gl.finish()` compris). Rendu du banc SANS post-traitement
(pas de GTAO/bloom/SMAA) : les chiffres de rendu sont un plancher, pas le coût dans l'école.

---------------------------------------------------------------------------------------------------------------------------

## 0. L'ESSENTIEL EN 12 LIGNES

1. **Tous les avatars ont le MÊME squelette** : 52 os, mêmes noms, même ordre, sans préfixe `mixamorig` (vérifié sur les
   18 GLB : 17 amis + `marchand.glb`). Tous les clips d'IRIS leur vont sans rien changer.
2. **Il y a 4 gabarits** (signature de pose de référence, `anim.js signatureRig`) : A = haythem, gabriel, imad, marcantoine,
   massyl, marchand ; B = aiden, clovis, djafar, haris, koji, lamine ; C = antoine, ethan, nemanja, titouan, yazid ; D = nico.
   Les clips reciblés sont mis en cache par gabarit : 1er avatar d'un gabarit ≈ 300 ms de calcul bloquant, les suivants 4 ms.
3. **Instancier un bot = `new Player(def, scene)`** d'IRIS (la classe telle quelle). 2e exemplaire du même GLB : 28 ms,
   géométrie et textures PARTAGÉES (16/16), mémoire ≈ 0. Un GLB nouveau (même gabarit) : 150-200 ms ; gabarit nouveau : 400-480 ms.
4. **Coût CPU d'un bot** : 0,07-0,15 ms par pas de 1/120 s (≈ 0,14-0,30 ms par image à 60 im/s). 20 bots : 1,37 ms par pas.
   Le premier poste n'est pas le mélangeur (0,009 ms) mais `updateMatrixWorld(true)` (0,038 ms, appelé 3 fois par pas+image).
5. **Coût de rendu** (banc, sans post-trait.) : +0,45 ms par bot avec ombres, +0,25 sans ; 20 bots = 8,6 ms, 245 appels,
   1,0 M triangles (passe d'ombre comprise). Dans l'école s'y ajoutent la passe de normales du GTAO et la carte des ombres de contact.
6. **Mémoire graphique** : 47-79 Mo de textures PAR GLB DISTINCT (11 à 16 textures 1024²) ; version `tel/` 19-27 Mo.
   10 avatars distincts = 611 Mo mesurés. → bots en `assets/tel/<nom>.glb` MÊME SUR PC, et 4-6 avatars distincts au plus.
7. **Combien** : PC 8-12 bots à pleine cadence ; téléphone 3-4 à pleine cadence + le reste à 1 image sur 3 (c'est la table
   `AVATARS_PLEINS` que LA CAGE applique déjà, `js/presence.js:76`). Au-delà : promeneurs cuits en instances (`PassantsParc`).
8. **Pose d'arme procédurale : faite et validée au banc** (`banc/armer.js`, 0,17 ms) : buste réparti sur Spine/Spine1/Spine2
   par `AvatarRig.ajouter`, puis `ikBras` des deux mains sur un fusil placé dans le repère « épaule → cible ». Marche à
   l'arrêt, en courant (clip `run` sous les bras) et accroupi. Écart d'axe canon/cible 0,0-0,1°.
9. **Accroupi procédural : fait** (`banc/accroupi.js`, 0,35 ms) : bassin −0,42 m, pieds gardés là où le clip les pose,
   `ikJambe`. Marche aussi par-dessus la marche CMU (marche accroupie). Hanches 0,49-0,55 m, tête 1,07-1,16 m.
10. **Mort : poupée de chiffon Verlet faite** (`banc/ragdoll.js`, 0,037 ms/pas + 0,1 ms de pose) : 17 points, buste rigide,
    sol, liens anti-repli. Corps à plat en ~0,75 s dans 4 cas d'impulsion. Le clip `knock` de LA CAGE finit ASSIS (pas un mort).
11. **Boîtes de touche : 12 capsules sur les os** (`banc/touches.js`) : 1,6 µs par rayon qui touche, 0,07 µs rejeté par le
    préfiltre. Elles suivent tout : clip, visée, accroupi, poupée.
12. **Bras FPS : taillés dans l'avatar de Haythem** (`banc/bras_fps.js`) : on ne garde que les triangles des os des bras
    (5 083 triangles, 7,6 ms), modèle accroché à la caméra, `ikBras` sur l'arme dans le repère caméra. Fonctionne ; le
    cadrage reste à régler (valeurs de départ au § 5.7).

---------------------------------------------------------------------------------------------------------------------------

## 1. IRIS — L'EXISTANT, FICHIER PAR FICHIER

### 1.1 Les fichiers du personnage

| Fichier | Contenu | Mesures |
|---|---|---|
| `assets/haythem.glb` | Avaturn (générateur « Avaturn.me \| Blender »), 1 skin, 52 os, 4 maillages skinnés : `avaturn_body` (11 746 tri : tête, cou, bras, MAINS — rien sous les vêtements), `avaturn_hair_0` (886, BLEND), `avaturn_shoes_0` (5 040), `avaturn_look_0` (3 484, la tenue) | 3,53 Mo ; 21 156 tri ; 14 textures (11 × 1024², 3 × 512²) ≈ **63 Mo GPU** ; boîte 1,843 m ; hanches 0,9668 ; jambe 0,8464 (unités modèle) ; md5 identique à celui de LA CAGE |
| `assets/tel/haythem.glb` | même maillage, textures 512 (visage 1024) — `tools/avatars_tel.py` | 1,69 Mo ; ≈ 23 Mo GPU |
| `assets/anims/manifest.json` | 24 clips : `idle`, `run`/`run_alt`/`sprint`/`def_slide_l`/`def_slide_r`/`def_back` (Mixamo, `loco:true`), `walk`/`walk_back`/`walk_side`/`walk_side_m` (CMU json, `loco:true`), `saut` (Jump), `block` (Defender 0-0,8 s), `spin_alt`, `victory`, `celebrate_2/3`, `taunt`, 6 danses GLB Sketchfab | FBX « Without Skin, 30 fps, In Place » 0,3-1,0 Mo ; CMU 32-36 Ko ; md5 identiques à LA CAGE |
| `assets/anims/cmu/*.json` | marche 143_32 / arrière 143_39 / latérale 143_40 (20 os, 30 fps, 45 images pour `walk`) | reciblage CMU = **1 ms** de calcul |

Aucun clip d'arme, de tir, de mort, d'accroupi dans IRIS ni dans LA CAGE ; aucun fichier d'arme sur le disque (recherche
`*rifle*|*gun*|*pistol*|*weapon*` dans Downloads et Documents : rien).

### 1.2 `js/player.js` — `class Player` (1 159 lignes)

- `new Player(def, scene)` (l. 142). `def` lu : `height` (taille en jeu, m), `modelHeight` (hauteur du GLB : échelle =
  height/modelHeight), `model` (url), `spd` (vitesse : 3,1 + spd/100 × 2,4 m/s, l. 684), `name`, `skin`/`color1`/`color2`
  (bonhomme de secours), `coupeHaut/coupeManche/coupeJambe/coupeBas` (l. 255-256, couper la tenue). HAYTHEM =
  `{ height: 1.73, spd: 99, model: 'assets/haythem.glb', modelHeight: 1.84 }` (`js/game.js:131`).
- Chargement : `loadModel` (l. 56, cache par url ; `urlAvatar` l. 55 prend `assets/tel/<nom>.glb` au téléphone si l'url est
  exactement `assets/[a-z0-9_]+.glb`) → `_loadAvatar` (l. 231) : `SkeletonUtils.clone` (l. 234), matériaux clonés par
  joueur (l. 237-247), `new AvatarRig(model)` (l. 248), tenues `fit.js` (l. 251-260), `model.scale = 2/modelHeight`
  (le groupe racine est en « unités 2 m », `root.scale = h/2`, l. 189), éclairage perso (l. 272), clips `_loadAnims`
  (l. 291 : manifeste → `loadMixamoClip` de chaque clip, `new AnimPlayer`), `_mesurerSol` (l. 316, semelle au sol pour
  `idle`), compilation parallèle `Player.preparerRendu` (l. 278, posé par `js/game.js:186`). Prêt : `p.anim` non nul et
  `p.avatarModel.visible` (au plus 6 s, l. 281). Promesse `p._pretAvatar`.
- Un pas : `memoriser()` (l. 649) → `move(dir, sprint, dt)` (l. 673 : inertie 0,13/0,085 s, endurance, monde solide
  `Player.collisions.deplacer` + `solEn`, rangs serrés, `turnTo`) → `update(dt)` (l. 1068 : `couchesAnnuler`/`surAnnuler`,
  saut, emotes, téléphone, `_pose()` procédurale, `_driveAnim` (l. 470 : loco calée sur le sol / clip / procédural),
  fondu de pose, `couches.dynamique`, `_poserSol`, `mesh.updateMatrixWorld(true)` **deux fois** l. 1133 et 1135,
  `couches.os`). Une fois par image : `presenter(a)` (l. 652 : interpolation, tangage/roulis du groupe, téléphone,
  sphères d'occlusion — encore un `updateMatrixWorld(true)`).
- Pilotage utile aux bots : `move(dir, sprint, dt)`, `marche = true` (plafond 2,15 m/s), `faceTo(cible, doux=true)`
  (l. 862, cap visé), `setFacing(x, z)` (l. 856), `turnTo` (l. 831), `jump(v=2.6)` (l. 871), `startEmote(def)`/`stopEmote()`
  (l. 879), `sasseoir(siege)`/`seLever()` (l. 381), `cibleRegard` (Vector3 regardé par la tête, couches.js), `stamina`,
  `speedNow`, `airborne`, `facing`, `pos`, `vel`, `posAff`/`angAff` (affichés), `avatar` (AvatarRig), `anim` (AnimPlayer),
  `avatarModel`, `avatarScale`, `mesh` (groupe racine, `userData.dynamique = true`).
- Statiques : `Player.collisions` (l. 1153), `Player.rangs` (l. 1155), `Player.poseVisible` (l. 1157 : vrai sur le DERNIER
  pas avant une image, posé par `js/game.js:467`), `Player.preparerRendu` (l. 1159).
- Vue 1re personne aujourd'hui : `js/game.js:1010-1033` — la caméra est dans l'os `Head` (+9 cm devant, demi-balancement),
  et **tout le personnage est masqué** (`p.mesh.visible = false`, l. 1031) ; `p.vuePremiere = true` garde les pas audibles.

### 1.3 `js/avatar.js` — `class AvatarRig` (390 lignes)

`new AvatarRig(model)` (l. 27) : relève les os (nom sans `mixamorig`), la T-pose (`tpose[n] = { bone, rest, P, Pinv, dir }`,
l. 35-52, sert au reciblage), baisse les bras UNE fois par modèle (`userData.armsDown`, l. 55-61), capture le repos de 44
os pilotés (`entries`), clavicules détendues (`NATURAL_CLAV`). `ok` = a LeftArm, LeftUpLeg, Spine.
API (toutes en coordonnées MONDE sauf `_set`) :
- `bone(nom)` ; `bones` (objet nom → Bone) ; `entries` ; `tposeHipsY`.
- `apply(c)` (l. 367) : pose procédurale complète depuis un objet `REST` (`tL,tR,tLz,tRz,kL,kR,aL,aR,aLz,aRz,aLy,aRy,eL,eR,eLy,eRy,hL,hR,torsoX,torsoY,headX`) ;
  `applyArms(c, kSpine=0, k=1)` (l. 357) : bras seuls par-dessus un clip.
- `repere(C, Ci)` (l. 187) puis `ajouter(nom, rx, ry=0, rz=0)` (l. 220) : rotation AJOUTÉE dans le repère du personnage
  (rx > 0 penche en avant, ry > 0 vers sa gauche). **Relatif : s'empile si on l'applique deux fois sans que le clip ait réécrit l'os.**
- `couchesDebut/couchesFin/couchesAnnuler(noms)` (l. 199-219) et `surDebut/surFin/surAnnuler` (l. 91-113) : le mécanisme
  anti-empilement (rendre au mélangeur un os que personne n'a réécrit).
- `viserPoint(nom, enfant, cible, k=1)` (l. 254) : tourne `nom` pour que son enfant vise `cible`.
- `ikBras(cote, cible, fDes, nDes, pole, k=1)` (l. 276) : IK deux os exacte ; poignet en `cible`, doigts selon `fDes`, paume
  selon `nDes`, coude du côté `pole`. Rend false sans les os de la main. Jamais de NaN écrit.
- `ikJambe(cote, cible, orteil, pole, k=1)` (l. 314) ; `aMains(cote)`, `aJambe(cote)` ; `repereMain(cote, W, f, n)` (l. 261) ;
  `plierDoigts(cote, [p1,p2,p3], k)` (l. 344) ; `longueurs()` (l. 335 : `{ jambe, bras }` en m).
- `fonduDepuis(dur, dy)` / `fonduAppliquer(dt)` (l. 119-133) : fondu de pose os par os.

### 1.4 `js/anim.js` (587 lignes)

- `loadManifest(url)` (l. 18). `loadMixamoClip(url, nom, def, ref, rig)` (l. 253) → `Promise<{ clip, def } | null>` ; `ref =
  { hipsY, legLen }` (l. 294-295 de player.js). FBX/GLB : `retargetClip` (l. 120, reciblage « monde » sur la T-pose de
  l'avatar, refusé si la source n'est pas en T-pose) ; JSON CMU : `loadCmuClip` (l. 41 ; `range`, `reverse` = clip joué à
  l'envers l. 59, `standHipsY`). `finishClip` (l. 212) : `mirror`, `loco` (phase0 + foulée), timings auto `set/release/apex`.
- **Cache des clips reciblés** (l. 231-263) : clé = url|nom|fiche|hanches/jambe|signature du rig ; chaque avatar reçoit
  `clip.clone()`. Mesuré : gabarit déjà vu = 4 ms pour 24 clips ; gabarit neuf = ~300 ms (idle 18-28, victory 22-35,
  gangnam 45-73, hiphop 58 ms ; CMU 1 ms).
- `class AnimPlayer(model)` (l. 331) : `add(nom, clip, def)`, `has`, `play(nom, { fade, speed, restart })` (l. 505, jumeaux
  pour relancer en fondu), `stop(fade)`, `couper()` (l. 532 : tout arrêter), `couperLoco()`, `setSpeed`, `finished`,
  `update(dt)`, locomotion à phase partagée `majPoidsLoco(nom, dt)` + `appliquerLoco(phase, dt)` (l. 402-461),
  **couche « haut du corps »** `jouerHaut(nom, cle, vit, t0)` / `stopHaut()` / `appliquerHaut(dt)` (l. 551-586 ; poids
  `poidsHaut` l. 325 : Spine 0,35, Spine1 0,7, Spine2/cou/tête/bras 1, jambes 0). C'est LA prise pour des clips d'arme Mixamo
  (tir, rechargement) par-dessus la course.

### 1.5 `js/couches.js` — `class Couches(p)` (349 lignes)

`dynamique(dt)` (l. 69, tangage/roulis du GROUPE entier selon l'accélération, pompes) ; `os(dt)` (l. 172 : essoufflé =
mains sur les genoux si `stamina < 30` et arrêté (l. 186-191), petits pas en pivotant, respiration (épaules l. 222-226),
regard `_regard` l. 243 vers `p.cibleRegard`, `_appuis` l. 326 = sons de pas). `Couches.son` = module audio
(`js/game.js:181`) ; `Couches.OS` = os touchés. Les sons ne partent que si `p.mesh.visible || p.vuePremiere` (l. 124, 328).
`_mainsSurGenoux` (l. 283) est la recette de l'accroupi (pieds gardés, bassin descendu, `ikJambe`).

### 1.6 `js/fit.js` et `js/eclairage_perso.js`

- `fit.js` : `poserMasque(mesh)` (l. 39, attribut `cageMask` = part bras / part jambe par sommet, d'après les poids d'os ;
  géométrie PARTAGÉE entre exemplaires) ; `reperes(mesh)` (l. 69) ; `couperTenue(mesh, { haut, manche, jambe, bas })` (l. 109,
  ne touche que l'index) ; `poserJambes(rig, couleur, matCorps)` (l. 230, troncs de cône sur les os si on coupe le pantalon) ;
  `equiperShader(mat)` (l. 367, tenue « éteinte » dans IRIS : `uFitCorps.w = 0`). **`appliquerFit` (repeindre une tenue) a
  été retiré d'IRIS** (l. 402) ; il existe dans LA CAGE `js/fit.js:403-437` (`appliquerFit(mat, f, rep)` + `moyenne(tex)`,
  ~35 lignes) : c'est l'outil pour des COULEURS D'ÉQUIPE.
- `eclairage_perso.js` : `new EclairagePerso()` (l. 162), `.equiper(model)` (l. 167, découpe + occlusion du corps + peau,
  chaîné après fit.js), `.maj(p)` (l. 180, 14 sphères sur les os, 9 au téléphone `NB_SPH` l. 29). 0,0013 ms/perso.

---------------------------------------------------------------------------------------------------------------------------

## 2. LA CAGE — CE QUI SE RÉUTILISE

### 2.1 Les avatars (`assets/*.glb`, fiches `js/roster.js:6-163`)

Tous : Avaturn, 52 os identiques, `avaturn_body` de 9 986 sommets (corps amputé sous les vêtements), 0 animation (sauf yazid : 1).
Mo = Mio du fichier ; GPU = textures RGBA8 + mipmaps (calculé sur les images embarquées) ; tri = total des maillages.

| Avatar | Taille jeu / modelHeight | Gab. | PC Mo | tel Mo | GPU PC / tel | Tri | Maill. | Remarque |
|---|---|---|---|---|---|---|---|---|
| haythem | 1,73 / 1,84 | A | 3,53 | 1,69 | 63 / 23 | 21 156 | 4 | le héros (déjà dans IRIS) |
| aiden | 1,65 / 1,883 | B | 4,03 | 2,33 | 49 / 25 | 25 398 | 8 | lunettes (2 maillages, un BLEND) |
| antoine | 1,85 / 1,85 | C | 4,28 | 1,84 | 79 / 27 | 23 790 | 5 | blond, t-shirt blanc, jean noir |
| clovis | 1,65 / 1,90 | B | 4,54 | 2,43 | 73 / 25 | 27 900 | 6 | même tenue qu'ethan |
| djafar | 1,65 / 1,886 | B | 3,51 | 1,74 | 59 / 23 | 20 743 | 4 | |
| ethan | 1,85 / 1,88 | C | 4,62 | 2,50 | 73 / 25 | 27 550 | 6 | t-shirt blanc (essais du banc) |
| gabriel | 1,79 / 1,865 | A | 4,20 | 2,43 | 57 / 21 | 28 400 | 5 | costume noir, baskets rouges |
| haris | 1,65 / 1,892 | B | 3,69 | 1,81 | 59 / 23 | 19 815 | 4 | |
| imad | 1,89 / 1,864 | A | 4,22 | 2,34 | 57 / 21 | 27 886 | 5 | débardeur gris, jean |
| koji | 1,75 / 1,888 | B | 4,25 | 1,98 | 73 / 25 | 24 536 | 7 | tresses, t-shirt blanc, jean noir |
| lamine | 1,80 / 1,88 | B | 4,23 | 2,07 | 57 / 21 | 27 629 | 6 | **costume-cravate, mains grises** (LA CAGE corrige par `accorderMains` + `coupeManche/coupeBas` + `fit`) |
| marcantoine | 1,83 / 1,861 | A | 4,29 | 2,39 | 57 / 21 | 28 040 | 5 | bleu marine |
| massyl | 1,65 / 1,836 | A | 3,80 | 2,48 | 48 / 24 | 38 775 | 6 | **costume de ronin + chapeau conique** (boîte 2,017 m : `modelHeight` = corps), le plus lourd en triangles |
| nemanja | 1,95 / 1,861 | C | 2,73 | 1,71 | 59 / 23 | 21 452 | 4 | casquette, costume noir |
| nico | 1,85 / 1,825 | D | 3,58 | 1,55 | 63 / 23 | 20 022 | 4 | gabarit seul (hanches 0,900) |
| titouan | 1,68 / 1,867 | C | 3,34 | 1,77 | 59 / 23 | 21 056 | 4 | |
| yazid | 1,84 / 1,852 | C | 2,52 | 1,61 | 47 / 19 | 22 877 | 3 | qamis blanc, keffieh |
| marchand (Pierrick) | 1,73 (`js/merchant.js:13`) | A | 1,76 | — | 19 / — | 20 077 | 4 | textures déjà en 512 |

Gabarits (unités modèle) : A hanches 0,9668 / jambe 0,8464 ; B 1,0011 / 0,8732 ; C 0,9841 / 0,8485 ; D 0,8997 / 0,8056.
Crâne mesuré sur les 17 (sommets du corps portés à > 50 % par `Head`) : de Head − 0,05 à Head + 0,21, ± 0,12 en profondeur,
± 0,095 en largeur (os `Head` à 1,61-1,68 m modèle). Épaules (LeftArm↔RightArm) 0,368-0,419. Bras (épaule→poignet, en jeu) :
0,479 m (Haythem 1,73 m) à 0,514 m (Ethan 1,85 m).

**Provenance notée** (commentaires de `js/roster.js`) : avatars Avaturn « donnés par Haythem » (ex. `Downloads/model (2).glb →
assets/koji.glb`, 02/10 ; antoine/marcantoine 04/10 ; imad/nemanja 04/10 ; gabriel 04/10 ; yazid `1000052212.bin` 06/10) ;
« aucun vrai joueur NBA ». Licence : Avaturn cité au menu CRÉDITS de LA CAGE (`index.html:330`) et dans `CREDITS.md` d'IRIS
pour Haythem seul. Rien de noté sur l'accord des amis pour leur visage — à faire valider (voir Risques).

Versions **passants** (`assets/passants/<nom>.glb`, `tools/passants_glb.py`, `tools/credits_passants.md`) pour aiden,
clovis, djafar, ethan, haris, lamine, nico, titouan : UN maillage skinné (même squelette) + un « de loin » de ~5 200 tri,
géométrie quantifiée, 0,64-1,03 Mo, textures EXTERNES en atlas (`_couleur.webp` 1024/512, `_masque.jpg` R=haut B=bas,
`_relief.jpg`) recolorées par shader (`materiauPassant`, `js/pedestrians.js:217`). Pas de matériaux `look/body/shoes` : non
branchable tel quel dans `Player` (pas de tenue, pas de semelle mesurée) ; idéal pour des figurants ou des bots lointains.

### 2.2 `js/ai.js` (439 lignes) — `class AIController(game, me, diff)`

Tout est du basket (porteur, écartement, passes, rebond). Réutilisable tel quel : `moveTo(cible, sprint, dt, stopDist=0.15,
marge=0.30)` (l. 88, arrivée avec hystérésis — évite d'osciller autour du point), `sprintH(cle, v, seuil)` (l. 103, sprint
avec hystérésis ±0,5 m), et la règle de la l. 38-44 : **toujours `faceTo(cible, true)`** (cap visé) — sinon le cap saute à
chaque pas et toute l'animation saccade (cause n° 1 des matchs saccadés, mesurée). Instanciation : `js/game.js:585-588`
(`new Player(def, scene, isUser)` + `this.ais.set(p, new AIController(this, p, diff))`).

### 2.3 `js/pedestrians.js` (2 428 lignes) — deux techniques de foule

- `class Pedestrians` (l. 244) : un `SkinnedMesh` + un `AnimationMixer` par passant (`_habiller` l. 754 : `clonerSquelette`,
  `mixer.clipAction`, marche posée à la main à la phase de la foulée) ; foulée MESURÉE sur l'avatar (`mesurerFoulee` l. 187) ;
  **cadence d'animation selon la vue** (`_animer` l. 1008 : chaque image à < 18 m, 30 Hz à < 34 m, 15 Hz au-delà, 4 Hz hors
  champ sauf s'il porte une ombre) ; niveau de détail à 12 m (8 m au téléphone) ; sphère englobante posée à la main
  (`frustumCulled = true`) ; ombre seulement à < 30 m. ~0,2 ms pour 12 passants.
- `class PassantsParc` (l. 1648) : **squelette CUIT** (`cuireSquelette` l. 1255 : matrices d'os image par image dans une
  `DataTexture` flottante, 40 images de marche + 32 de repos + 12 pour s'asseoir) + **un `InstancedMesh` par avatar**
  (`materiauxPromeneur` l. 1197 réécrit skinbase/skinning). 26 promeneurs (12 au téléphone) en 6-8 appels de dessin.
  Inutilisable pour un bot qui VISE (pas d'IK par instance), parfait pour une foule ou des leurres.

### 2.4 `js/player.js` de LA CAGE (3 103 lignes) — ce qu'IRIS n'a plus

- **Mise au sol** : `tomber(nx, nz, force)` (l. 1875 : chute + temps au sol + relevé, `chuteT`), joué dans `_driveAnim`
  l. 1185-1206 avec les clips `knock` (= `cmu/getup.json` à l'envers, `reverse:true, fit:0.80`) et `getup` (`fit:1.25`)
  (manifeste de LA CAGE l. 96-97, CMU 139_18). Déclenché par `Game.mettreAuSol` (`js/game.js:2290`).
- **État d'animation sérialisable** : `etatAnim()` (l. 1689) / `appliquerAnim(e, emotes, propre)` (l. 1744) : on n'envoie
  que les champs hors repos (3 champs pour un joueur qui marche), les minuteries ne sont reprises que si elles divergent de
  plus de `TOL_ANIM = 0.12` s (l. 183). C'est le modèle à suivre pour l'hôte autoritaire.
- `accorderMains(model)` (l. 112, mains couleur du visage — Lamine) ; `urlAvatar` (l. 66) ; `new Player(def, scene, isUser)`.
- Autres clips présents dans LA CAGE et absents d'IRIS, reciblés au banc sur ethan : `knock` (12 ms, 2,37 s), `getup` (7 ms),
  `defeat` = Defeated.fbx (145 ms, 6,73 s, à genoux), `def_stance` = Goalkeeper Idle.fbx (119 ms, garde basse bras
  écartés), `pickup` = Picking Up.fbx (169 ms, 1,13 s, se baisser).

### 2.5 `js/headwear.js`, `js/portraits.js`, `js/presence.js`

- `poserCoiffure(model, rig, def)` (`headwear.js:114`) : casquette/bandeau/bonnet en primitives, ENFANT de l'os `Head`
  (coût par image nul), taille lue sur la boîte des cheveux (`crane` l. 22). → casque/brassard d'équipe gratuit.
- `portrait(def)` (`portraits.js:106`) : vignette 192 px du vrai avatar, rendue hors écran et gardée dans localStorage
  (second contexte WebGL libéré 3 s après). → tableau des scores, fil des éliminations.
- `presence.js` : `LOD_AVATAR = { anim: 40, cache: 90, hysteresis: 5 }` (l. 71) ; `AVATARS_PLEINS = { pc: { extreme: 10,
  ultra: 10, high: 10, medium: 6, low: 6 }, tel: { high: 4, medium: 3, low: 3 } }` (l. 76) ; `pasDeLoin` (l. 441) : les
  suivants s'animent une image sur trois, phases décalées par rang. LA CAGE tient un 5 contre 5 (10 avatars complets) au
  téléphone avec ça (README : 360 appels, 1,09 M tri en moyenne).

---------------------------------------------------------------------------------------------------------------------------

## 3. MESURES DU BANC (chiffres bruts)

| Mesure | Valeur |
|---|---|
| Premier perso (haythem, IRIS) prêt, 24 clips téléchargés + reciblés | 1 864-1 913 ms |
| Avatar neuf, gabarit neuf (aiden, ethan, nico) | 399 / 477 / 460 ms |
| Avatar neuf, gabarit connu (gabriel, imad, koji, titouan, djafar, lamine) | 153-201 ms (lecture du GLB) |
| 2e exemplaire d'un GLB déjà chargé | **28 ms**, géométrie + textures partagées 16/16 |
| `SkeletonUtils.clone` / `new AvatarRig` | 0,3-1,5 ms / 0,2-0,8 ms |
| `Player.move + update` par perso et par pas (1/120 s) | arrêt 0,10 ; course 0,12-0,15 ; sprint 0,08-0,17 ms (10 bots) ; 20 bots : 0,069 ms |
| Décomposition par appel | `updateMatrixWorld(true)` 0,038 ; `mixer.update` 0,009 ; `couches.os` 0,006 ; `surDebut+surFin` 0,0015 ; `eclairage.maj` 0,0013 ; `move` 0,0006 ; `presenter` 0,033 ms |
| `update` à dt = 1/60 (un appel par image) | 0,148 ms (≈ le même coût qu'un pas de 1/120 : cadence = levier) |
| Rendu, 0 / 1 / 5 / 10 persos, ombres | 1,32 / 1,41 / 3,70 / 5,90 ms |
| Rendu, sans ombres | 0,89 / 1,09 / 1,80 / 3,35 ms |
| 20 bots (5 avatars) en course | sim 1,37 ms/pas (2,75 ms par image à 60 im/s), rendu 8,6 ms, 245 appels, 1,0 M tri |
| 1er rendu de 10 avatars neufs SANS précompilation | **4 956 ms figés** (17 programmes + 197 textures) |
| Avatar neuf une fois les programmes compilés | `initTexture` 11 ms (tel) ; 1er rendu ≈ 23 ms |
| Textures, 10 avatars distincts PC | **611 Mo** ; géométrie 11,8 Mo |
| `viser` (pose d'arme) | 0,17 ms |
| `accroupir` | 0,35 ms (dont `updateMatrixWorld`) |
| Poupée : un pas / une pose | 0,037 ms / 0,106 ms ; immobile en 0,75 s |
| Rayon contre les 12 capsules | 1,6 µs (touché) ; 0,07 µs (rejeté par le préfiltre) |
| Bras FPS : création / triangles | 7,6 ms / 5 083 |

---------------------------------------------------------------------------------------------------------------------------

## 4. RÉPONSES

### 4.1 Instancier N personnages animés

```js
import { Player } from './player.js';
const FICHE = (id, h, mh) => ({ id, name: id, height: h, spd: 80, color1: '#888', color2: '#444', skin: '#c68642',
  model: `assets/tel/${id}.glb`, modelHeight: mh });        // tel/ même sur PC pour les bots (voir 4.6)
const p = new Player(FICHE('gabriel', 1.79, 1.865), scene); // ajoute p.mesh à la scène, charge, recible, compile
p.pos.set(x, sol, z); p.setFacing(fx, fz); p.memoriser();
await p._pretAvatar;                                        // (ou : attendre p.anim && p.avatarModel.visible)
```
- `SkeletonUtils.clone` : OUI, c'est déjà ce que fait `_loadAvatar` (l. 234) ; les matériaux sont clonés par joueur, les
  textures et la géométrie restent partagées. Les CLIPS sont partagés par gabarit (cache `anim.js`) puis `clip.clone()`
  (copie de tableaux) ; un `AnimationMixer` par perso (dans `AnimPlayer`).
- `urlAvatar` ne bascule en `tel/` que pour `assets/<nom>.glb` au téléphone : pour forcer `tel/` sur PC, mettre l'url
  `assets/tel/<nom>.glb` directement dans la fiche (le regex ne la touche pas).
- Charger les bots PENDANT l'écran de chargement (1er gabarit + programmes : jusqu'à 5 s figées sinon). Un perso par
  gabarit d'abord (A, B, C), les autres ensuite.
- Combien : PC 8-12 à pleine cadence (≤ 6 avatars distincts) ; téléphone 3-4 pleins + le reste une image sur trois (table
  `AVATARS_PLEINS`). Pour du « beaucoup » (prop hunt avec 20 leurres qui marchent) : la technique `PassantsParc`.

### 4.2 Pose d'arme procédurale (sans clip d'arme) — `banc/armer.js`

Validée en images : debout, en courant (clip `run` sous la ceinture, bras sur l'arme), accroupi, marche accroupie.
Algorithme (APRÈS le clip et les couches, sur la pose finale) :
1. **Buste** : `A.repere(C, Ci)` ; direction cible dans le repère du perso depuis `Spine2` → lacet (borné ±1,1 rad) et
   tangage (±1,0) répartis `[0.2, 0.35, 0.45]` sur Spine/Spine1/Spine2 via `A.ajouter(n, -tangage*w, lacet*w, 0)` ; puis
   `p.mesh.updateMatrixWorld(true)`.
2. **Repère de l'arme** : crosse = `lerp(RightArm, Spine2, 0.28)` − 2 cm vers le haut de l'arme ; f = crosse → cible ;
   r = f × Y ; u = r × f ; `arme.quaternion` = base (−r, u, f) ; arme à l'échelle h/1,8.
3. **Mains** : `ikBras('Right', poignée, f*0.55 − u*0.75 − r*0.25, −r, épauleD + r*0.35 − u*0.55)` + `plierDoigts('Right',
   [0.9, 1.1, 0.8])` ; `ikBras('Left', garde-main, f*0.6 + r*0.75, u, épauleG − r*0.25 − u*0.6)` + `plierDoigts('Left',
   [0.8, 1.0, 0.7])`.
Mesures : poignée à 0,30 m de la crosse → main droite à 0 cm ; garde-main à 0,40 m → 1 cm, 0,43 → 3,3 cm, 0,45 → 4,5 cm,
0,58 → 15 cm (bras trop court). **Garde-main à 0,40 m au plus de la crosse** pour les gabarits du jeu. Écart canon/cible
≤ 0,1° dans 6 directions (devant, ±60°, ±40° en hauteur, 120° en arrière : le buste plafonne, le reste vient du cap).
Prises alternatives : la tête suit le buste (0,05 rad) ; mettre `p.cibleRegard = null` quand l'arme est levée (sinon le
regard de couches.js ajoute son propre lacet sur Spine2/Neck/Head).
Avec des clips Mixamo d'arme (Haythem peut les télécharger : FBX Without Skin, 30 fps, In Place — le pipeline actuel les
recible, test T-pose `retargetClip` l. 132-134) : les jouer en `jouerHaut` par-dessus la loco, et garder l'IK de la main
gauche + l'arme accrochée à la main droite pour coller au modèle d'arme.

### 4.3 Mort — `banc/ragdoll.js` (classe `Poupee`)

- **Poupée Verlet** (recommandé) : 17 points aux os (Hips, Spine2, Head, épaules, coudes, poignets, hanches, genoux,
  chevilles, orteils) ; buste RIGIDE (6 points liés deux à deux) ; liens d'os ; raideurs tête-épaules et tibia-orteil ;
  distances MINIMALES genou/coude (0,55/0,35) ET **hanche** : genou-poitrine ≥ 0,85, pied-poitrine ≥ 0,75, genoux ≥ 0,6,
  pieds ≥ 0,5 de la distance de départ (sans elles, mesuré : jambes rabattues sur le buste, pieds à 14-15 cm de la tête) ;
  8 itérations ; sol `solEn` + frottement 0,35. Impulsion = vitesse du joueur + coup au point touché (le buste suit à 50 %).
  Pose : hanches en position + rotation du repère du buste depuis la mort, puis `viserPoint` racine → extrémités.
  4 cas testés (balle de face à l'arrêt, dans le dos en courant, à la tête de côté, sans impulsion) : corps étendus,
  tête-pieds 1,19-1,54 m, immobiles à 0,75 s.
- Clip `knock` de LA CAGE : marche sur les avatars d'IRIS (12 ms) mais finit ASSIS (hanches 0,17 m, tête 0,63 m) : bon
  pour « mis au sol / réanimé », pas pour une mort. `defeat` = à genoux (6,7 s). Clips Mixamo « Death » : possibles (à télécharger).
- Ce qui manque au prototype : les MURS (passer les points Hips/Spine2/Head par `collisions.resoudre`), et la torsion des
  membres (viserPoint ne gère pas le roulis : bras parfois vrillés, invisible de loin).

### 4.4 Accroupi — `banc/accroupi.js`

`accroupir(p, k, bas = 0.42)` : pieds/orteils relevés en monde, hanches −0,42·k et −0,10·k vers l'arrière, `ajouter`
Spine 0,22 / Spine1 0,12 / Neck −0,2 / Head −0,14, `ikJambe` des deux côtés (pôle 0,9 m devant, ±0,25 m dehors).
Marche par-dessus `idle` ET par-dessus la marche CMU (marche accroupie) ; ensuite `viser` (l'arme suit les épaules).
Résultat : hanches 0,49-0,55 m, tête 1,07-1,16 m, orteils au sol (3-8 cm). En jeu : vitesse ≤ 1,3 m/s (foulée de la marche
× ~0,6, ou `p.marche = true` + `speedMul`), la caméra 1re personne descend toute seule (elle lit l'os `Head`, l. 1018-1022 de
game.js, même avatar masqué). Option clip : `Goalkeeper Idle.fbx` (LA CAGE `def_stance`) = garde basse de basket, bras écartés.

### 4.5 Boîtes de touche — `banc/touches.js`

| Zone | Os (segment) | Rayon (m, pour 1,80 m) | Multiplicateur proposé |
|---|---|---|---|
| tête | sphère sur `Head`, +0,085 le long de l'Y de l'os | 0,115 | 2,5 |
| cou | Neck → Head | 0,06 | 1,6 |
| torse | Spine1 → Neck | 0,165 | 1,0 |
| ventre | Hips → Spine1 | 0,155 | 1,0 |
| bras (×4) | Arm → ForeArm (0,055), ForeArm → Hand (0,045) | | 0,75 |
| jambes (×4) | UpLeg → Leg (0,085), Leg → Foot (0,06) | | 0,7 |

Rayons × `p.h / 1.8`. Préfiltre : cylindre de 1,1 m autour de `p.mesh.position + 0,9 m`. Test : rayons horizontaux de face
à 0,3/0,6 m passent ENTRE les jambes (attendu), 0,95 → ventre, 1,2-1,6 → torse (le haut du torse mord le menton : réduire
à 0,15 ou arrêter à Spine2), 1,72 → tête, 1,85 → raté. Lire les positions dans `matrixWorld` APRÈS la pose finale (arme,
accroupi, poupée). Pour la compensation de latence : 12 capsules × 2 points = 72 nombres par perso et par pas d'historique.

### 4.6 Avatars à reprendre comme bots, et comment les copier

Première fournée conseillée (tenues « de rue », 3 gabarits, pas de correctif de tenue nécessaire) : **gabriel, imad,
marcantoine (A — même gabarit que Haythem, zéro reciblage), koji, djafar (B), ethan ou titouan (C)**. Poids : PC 25,1 Mo /
tel 13,4 Mo pour les six ; GPU 376 Mo en PC contre **136 Mo en tel/** → utiliser `tel/` pour les bots partout.
À éviter sans travail : lamine (costume + mains grises : porter `accorderMains` et `appliquerFit`), massyl (ronin + chapeau :
`coupeHaut: 1.66` suffit pour le chapeau, la tenue reste un kimono ; 38 775 tri), aiden (lunettes BLEND : un programme de plus).
Copie (un écrivain le fera, pas ce lecteur) :
1. `LA CAGE/assets/<nom>.glb` → `IRIS/assets/<nom>.glb` et `LA CAGE/assets/tel/<nom>.glb` → `IRIS/assets/tel/<nom>.glb`
   (IRIS a déjà `tools/avatars_tel.py` pour les refaire).
2. Fiches : reprendre `height`/`modelHeight` de `js/roster.js` (tableau § 2.1) dans un nouveau `js/bots.js`.
3. Clips : rien à copier pour marcher/courir/sauter (les mêmes fichiers) ; `assets/anims/cmu/getup.json` (52 Ko) si l'on veut
   `knock/getup` ; `Goalkeeper Idle.fbx` (656 Ko) si l'on veut une garde basse.
4. `CREDITS.md` (Avaturn : les avatars des amis), `sw.js` (`VERSION` à changer : fichiers lourds), relevé de l'écran de
   chargement `?chargement=trace` puis `python tools/liste_chargement.py releve.json` (sinon la barre ne les compte pas).

### 4.7 Bras + arme en vue FPS — `banc/bras_fps.js`

- **Bras coupés dans l'avatar de Haythem** (recommandé, testé) : `skClone` du GLB, sur `avaturn_body` ET `avaturn_look`
  (la manche) : géométrie COPIÉE (`geometry.clone()`, elle est partagée avec le cache) puis index réduit aux triangles dont
  les 3 sommets sont à > 50 % sur `/^(Left|Right)(Arm|ForeArm|Hand)/` (clavicule exclue) → 5 083 tri, mains et manches de
  la vraie tenue ; cheveux/chaussures masqués ; modèle tourné de π, l'œil (Head +0,09 haut, +0,09 devant) sur l'objectif,
  groupe enfant de la caméra ; `ikBras` vers l'arme placée dans le repère caméra. Valeurs de départ mesurées (arme dont
  l'origine est la crosse, +z = canon, tournée de π) : crosse (0,11 ; −0,12 ; +0,06), poignée à 0,30, garde-main à 0,34 →
  erreurs 0 cm / 1 cm ; bras de Haythem 0,479 m : garde-main > ~0,36 m de la crosse = inatteignable. FOV conseillé du
  « viewmodel » 50-55° (à 60°, la main droite sortait de l'image), `near` 0,01-0,02. Reste : cadrage (on voit peu les bras),
  orientation de la main gauche, recul/balancement.
- Rendu : `js/fx.js:2062` (`this.composer.render(dt)`) — ajouter juste après une passe « arme » : `renderer.autoClear =
  false; renderer.clearDepth(); renderer.render(sceneArme, cameraArme)` (ou une `RenderPass` dans le composer avant la passe
  de sortie pour garder l'étalonnage). Les bras ne doivent PAS être `dynamique` (ombres de contact, carte d'ombre).
- Alternatives : (b) garder TOUT le corps de Haythem visible sauf la tête (même coupe, os `Head|Neck` exclus) avec la caméra
  dans la tête — « corps entier », ombre propre, mais l'arme passe dans les murs ; (c) bras procéduraux (cylindres) : moche.

---------------------------------------------------------------------------------------------------------------------------

## 5. PIÈGES (relevés, dont plusieurs mesurés)

1. **`ajouter()` est relatif.** Appelé dans `presenter` sur une image SANS pas de simulation (écran 144 Hz > 120 Hz), il
   s'ajoute à la torsion de l'image d'avant : buste vissé. Poser l'arme et l'accroupi DANS le pas (`update`), sur le
   dernier pas avant l'image (`Player.poseVisible`), ou mémoriser/restaurer comme `couchesDebut/Fin`. (`ikBras/ikJambe/
   viserPoint` sont absolus : sans risque.)
2. **Après `anim.couper()`, remettre `p.animKey = null`**, sinon `_driveAnim` ne relance pas `idle` (clé inchangée) et le
   squelette reste dans la pose de la poupée (mesuré au banc). Et au premier `play`, le mélangeur mémorise la pose COURANTE
   comme « origine » : relever un mort = recréer le Player (28 ms) ou restaurer une photo des os prise à la création.
3. **`frustumCulled = false`** sur tout l'avatar (`player.js:240`) ET `ecole_visibilite.js:160-166` (`exclu`) ne range
   jamais un `SkinnedMesh` ni un objet `dynamique` : **un bot à l'autre étage est dessiné à chaque image** (et dans la carte
   d'ombre, la passe GTAO, les ombres de contact). Couper soi-même : `zoneDe(x, -z, y+1) & __visibilite.cachees` (masque des
   zones cachées, `ecole_visibilite.js:115, 336, 477`) + frustum sur une sphère de 1 m → `p.mesh.visible = false` et
   animation à 4 Hz.
4. **`updateMatrixWorld(true)` deux fois par pas (l. 1133, 1135) + une fois par image (`presenter`)** ≈ 0,076 ms sur
   ~0,11 ms : les deux tiers du coût CPU d'un bot. Pour les bots : un seul `update` par image avec le
   dt de l'image (0,148 ms au lieu de 2 × 0,12), et `presenter` sans la 2e mise à jour.
5. **Mémoire graphique** : 47-79 Mo par avatar distinct (611 Mo pour 10) — limiter le nombre d'avatars DIFFÉRENTS, pas le
   nombre de bots ; `tel/` pour les bots.
6. **Gel au premier rendu** : 4,96 s pour 10 avatars neufs sans précompilation. `Player.preparerRendu` existe (posé par
   game.js) : charger les bots sous l'écran de chargement.
7. **Le groupe racine est à l'échelle h/2 et PENCHE** (`presenter` : `rotation.set(tangage, ang, roulis)`) : un objet
   (arme, accessoire de prop hunt) enfant de `p.mesh` hérite de l'échelle et s'incline dans les virages. Diviser par
   `mesh.scale`, ou tenir l'objet hors du groupe.
8. **Essoufflé = mains sur les genoux** (`couches.js:186-191`, endurance < 30 + arrêt 0,5 s) : chez un bot armé, ça
   descend les hanches avant l'IK de l'arme. Garder `stamina` haut ou neutraliser `veutSouffler`.
9. **Le regard** (`cibleRegard`) ajoute du lacet à Spine2/Neck/Head : doublon avec la visée → `null` quand l'arme est levée.
10. **Rayon de collision unique** `RAYON_JOUEUR = 0.3` (`config.js:13`, utilisé par `move` l. 704) : un prop (chaise,
    poubelle) a besoin d'un rayon propre → `this.rayon ?? RAYON_JOUEUR` dans `move`.
11. **Rangs serrés** : `move` fait entrer n'importe quel Player dans un rang de sièges (`_entrerRang`, l. 682) — un bot
    poussé contre le bout d'une rangée s'y « faufile » ; le neutraliser pour les bots (`p.rang` jamais posé) ou le gérer.
12. **Sons de pas** : partent pour tout Player visible (`couches.js:124, 328`) — bien pour entendre l'ennemi, mais
    `audio.js:_attCorps` n'a que l'atténuation à la distance, PAS de stéréo/direction. Un prop caché (`mesh.visible = false`,
    `vuePremiere = false`) devient muet.
13. **`viserPoint` ne gère pas le roulis** (poupée : avant-bras parfois vrillés) ; **`retargetClip` refuse une source qui
    n'est pas en T-pose** (copie directe + avertissement, l. 290).
14. Interpolation : `Game.interpoler` (game.js:502) ne présente QUE `this.user` ; chaque bot doit faire `memoriser()`
    avant ses pas et `presenter(a)` une fois par image, sinon il saute de 1/120 s en 1/120 s.
15. Les tenues : IRIS n'a plus `appliquerFit` ; pour des couleurs d'équipe, le reprendre de LA CAGE (`fit.js:403-437`).

---------------------------------------------------------------------------------------------------------------------------

## 6. COMMENT S'Y BRANCHER POUR LE FPS ET LE PROP HUNT

### 6.1 Modules à créer (proposition)

- `js/bots.js` : fiches des bots (§ 4.6) ; `js/combattant.js` : un **Combattant** = `{ id, p: Player, equipe, vie,
  arme: { id, munitions, recharge, cadence, prochainTir }, accroupi: 0..1, visee: { lacet, tangage }, mort: Poupee|null,
  prop: null|{ id, rayon } }` ; ses méthodes `poser()` (accroupi → arme, sur le dernier pas), `touches(o, d, L)` (capsules),
  `tuer(impulsion, point)`, `etatReseau()` / `appliquerReseau(e)`.
- `js/arme.js` : fusil en primitives (comme `banc/armer.js:fusil`) puis GLB ; `viser(p, arme, cible, k)` ; recul = petit
  tangage ajouté au buste + recul de la crosse le long de f (5-8 cm, 0,08 s).
- `js/poupee.js` : `banc/ragdoll.js` + murs (`collisions.resoudre` sur Hips/Spine2/Head) + `solEn` de la carte.
- `js/vue_fps.js` : bras de Haythem coupés + arme, scène et caméra à part, passe après `composer.render` (fx.js:2062).
- IA : un cerveau par bot qui produit `{ dir, sprint, marche, cible, tir, accroupi }` ; déplacement par `move` +
  `faceTo(cible, true)` (règle de LA CAGE), arrivée avec hystérésis (`ai.js:88`), chemins dans l'école = sujet d'un autre
  lecteur (graphe de navigation sur `collisions`).

### 6.2 Ordre dans la boucle (game.js)

```
frame(dt):
  pas fixes (1/120) : pour chaque combattant vivant :
      p.memoriser(); cerveau(dt) -> dir, sprint, cible ; p.move(dir, sprint, dt)
      si visible/proche ou dernier pas (Player.poseVisible) : p.update(dtCumulé) ; c.poser()   // accroupi -> arme
      tirs de l'hôte : rayon -> monde (collisions.rayonLibre) puis capsules des combattants (le plus proche gagne)
  mort : poupee.pas(1/120) ; à l'image : poupee.poser()
  interpoler : this.user.presenter(a) ; pour chaque combattant visible : c.p.presenter(a)   (+ arme suivie)
  culling : zoneDe(...) & __visibilite.cachees, frustum -> p.mesh.visible ; cadence d'animation selon rang/distance
  rendu : composer, puis passe « arme 1re personne »
```

### 6.3 FPS (le joueur)

- Garder `this.user` = Player de Haythem (déplacement, sol, escaliers, endurance, saut) ; en vue FPS : `mesh.visible =
  false` comme aujourd'hui, MAIS continuer `update` (l'os `Head` donne la hauteur de l'œil, accroupi compris) ; viewmodel à
  part (§ 4.7) ; visée = lacet/tangage de la caméra (déjà `camYaw/camPitch`, game.js:245-247 : bornes de tangage −0,1..0,9
  à élargir pour un FPS) ; le corps vu par les autres (réseau) prend `viser()` avec la même cible.
- Accroupi : `c.accroupi` glisse vers 0/1 en 0,15 s ; vitesse × 0,5 ; hitbox suit (capsules sur os).

### 6.4 PROP HUNT

- Le prop est un Player dont l'avatar est caché (`p.avatarModel.visible = false`, le groupe `p.mesh` reste pour la
  position) et qui porte un meuble de l'école (géométries de `js/ecole_mobilier.js`, ex. `geoCoque()` de la chaise coque) dans
  un groupe À PART qui suit `posAff/angAff` (piège 7 : pas d'échelle h/2, pas de tangage) ; rayon de collision du meuble
  (piège 10) ; hitbox = la boîte du meuble (pas les capsules) ; caméra 3e personne (la caméra d'IRIS, vue 3, telle quelle) ;
  sons de pas coupés tant qu'il est immobile, ou volontairement audibles (choix de gameplay).
- Les chasseurs = combattants FPS. Leurres/foule : `PassantsParc` (instances, squelette cuit) ou des meubles sans joueur.

### 6.5 Réseau plus tard (hôte autoritaire) — ce qu'un perso doit sérialiser

Par combattant et par paquet : `id, x, y, z, ang, vx, vz, air (jumpY/jumpVel), acc (0..1), lacet, tangage, arme,
tirSeq (compteur de tirs), rech (minuterie), vie, mort (impulsion + point + graine), prop (id du meuble)` + l'état d'animation
compact façon `etatAnim()` de LA CAGE (champs hors repos seulement, minuteries reprises au-delà de 0,12 s d'écart). Tout se
recalcule chez le client à partir de ça (loco, accroupi, IK de l'arme, poupée). Les capsules ne voyagent pas : l'hôte les
pose lui-même (il anime tous les persos) et garde 12 × 2 points par pas pour remonter le temps.

---------------------------------------------------------------------------------------------------------------------------

## 7. FICHIERS DU BANC (jetables, hors dépôt)

`C:/Users/hgami/AppData/Local/Temp/claude/C--/d2516763-f01d-443a-9d38-fe9a0c124e7f/scratchpad/jeu/`
- `banc/index.html` (scène + `window.B` : `B.def`, `B.ajouter`, `B.pret`, boucle 1/120), `banc/armer.js` (`fusil()`,
  `viser()`), `banc/accroupi.js` (`accroupir()`), `banc/ragdoll.js` (`Poupee`), `banc/touches.js` (`ZONES`, `toucher()`,
  `dessiner()`), `banc/bras_fps.js` (`couperBras()`, `brasFps()`).
- `outils/serveur_banc.py BANC IRIS CAGE PORT` (lecture seule, `/iris/__banc/`), `outils/glb_info.py <glb…>` (os, maillages,
  triangles, images), `outils/serveur_cors.py`.
- Rejouer : `python -I outils/serveur_banc.py banc C:/Users/hgami/Downloads/IRIS C:/Users/hgami/Downloads/Basket_1v1_nouveau/Basket_1v1 8137`
  puis `http://127.0.0.1:8137/iris/__banc/index.html` (127.0.0.1 et non localhost : le serveur n'écoute qu'en IPv4 et
  « localhost » coûte ~300 ms par requête — même piège que celui noté dans `serve.py` d'IRIS).
