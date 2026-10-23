# IRIS — SPÉCIFICATION DE CONSTRUCTION : COMBAT « FAÇON CALL OF DUTY » + PROP HUNT — VERSION FINALE

Architecte en chef, 22/10/2026. **Version finale** : `spec.md` relue après la critique (`critique.md`, 47 points) ; chaque
point justifié est appliqué à sa place, et l'annexe **§ 8 « Réponses à la critique »** dit, point par point, où et comment,
ou pourquoi il est écarté. **Ce fichier remplace `spec.md`** : un constructeur ne lit que lui et les fichiers qu'il cite.

Base : `C:/Users/hgami/Downloads/IRIS`, master `a8b22dd` (v2.0), three r170 sans bundler (importmap → `vendor/three`),
servi par `python serve.py 8124`. **Les documents cités par leur seul nom** (`conception_archi.md` la base,
`conception_cod.md` le ressenti, `conception_prophunt.md` le prop hunt, les cinq cartes `carte_coeur.md`,
`carte_monde.md`, `carte_persos.md`, `carte_props.md`, `carte_cage.md`, `critique.md`, et le banc des lecteurs `banc/*.js`)
sont dans `C:/Users/hgami/AppData/Local/Temp/claude/C--/d2516763-f01d-443a-9d38-fe9a0c124e7f/scratchpad/jeu/` ; **le
socle les recopie dans `docs/jeu/` de la branche `socle`** (§ 5.4, étape 5 ; ce dossier temporaire est volatil) et, à
partir de `socle-ok`, c'est la copie de `docs/jeu/` qui fait référence. LA CAGE (lecture seule) :
`C:/Users/hgami/Downloads/Basket_1v1_nouveau/Basket_1v1`. Les lignes citées ont été revues sur `a8b22dd`
(`js/game.js` 215, 238-249, 302-304, 380-386, 410, 432-442, 444-492, 502-508, 878-924, 1005-1025 ; `js/player.js` 53-62,
187-227, 649-724, 770-787, 1068-1136 ; `js/input.js` 15-77 ; `js/settings.js` 8-57 ; `js/main.js` 40-99 ; `js/audio.js`
18-27 ; `js/ui.js` 280-290, 315-360 ; `js/collisions.js` 20-28, 59, 153-156, 213-282 ; `js/couches.js` 50-56, 124,
186-191, 248-256, 328 ; `js/ecole_portes.js` 65, 294-298, 540-548, 580-609 ; `js/ecole_mobilier.js` 122-123, 184-188 ;
`js/ecole_hall.js` 831, 1023-1063 ; `js/kit_decor.js` 441-452, 502-539 ; `js/ecole_etage1.js` 1036-1053 ;
`js/carte_ecole.js` 628, 2416-2476 ; `js/fx.js` 454, 616-627, 2012-2020, 2059-2062 ; `sw.js` 13-40 ; `serve.py` 32-41).

**CE DOCUMENT FAIT FOI.** Là où il contredit une conception (ou `spec.md`), c'est lui qui gagne (§ 1 et § 8 disent
pourquoi). Un lot qui trouve une erreur dans ce document ne la corrige pas seul : il l'écrit dans son rapport, F2 ou
l'intégration tranche.

Plan : § 0 en une page · § 1 les arbitrages (37 + 9 ajoutés après la critique) · § 2 le jeu tel que Haythem le vivra ·
§ 3 les valeurs chiffrées · § 4 l'architecture (règles, arborescence, boucle, prises, contrats, événements, état, entrées,
chargement, harnais) · § 5 les lots de construction (socle, 14 lots en parallèle, fusion F2, vague 3, intégration) · § 6 ce
qui ne doit pas casser · § 7 les risques et leurs parades · § 8 les réponses à la critique.

Repère partout : MONDE `X = x du plan`, `Z = −y du plan`, `Y` vers le haut ; sols : −1 à −3,06, RDC 0, 1er 3,50, 2e 6,60.
`lacet` = `game.camYaw`, `tangage` = `game.camPitch`, **tangage > 0 = regard vers le BAS** (convention de `game.js`).

---------------------------------------------------------------------------------------------------------------------

## 0. EN UNE PAGE

IRIS devient un jeu à trois portes, toutes en solo contre des bots :
- **BALADE LIBRE** : celle d'aujourd'hui, inchangée (vérifiée par un REJEU DÉTERMINISTE — hasard semé, horloge simulée,
  état remis à zéro — à 1e-9 près sur les positions, § 4.10.1).
- **COMBAT** à la 1re personne : match à mort par équipes **SISR contre SLAM**, **chacun pour soi**, **domination**
  (A hall, B pause du −1, C pause du 1er), **stand de tir** ; cinq armes aux noms inventés + couteau + grenade + flash ;
  bots qui parcourent les quatre niveaux, voient, entendent, se couvrent, sans tricher.
- **PROP HUNT** : 6 manches, le rôle de Haythem alterne ; les props SONT les vrais meubles de l'école (tabourets du −1,
  chaises coques, chaises de hêtre du 2e…) ; les chasseurs traquent, chaque balle sur un vrai meuble leur coûte des PV.

Les douze décisions :
1. `game.mode` garde `'lobby'` = « en jeu » (14 lectures dans 5 fichiers) ; on ajoute `game.partie` (`null` = balade)
   et un mode `'menu'` (le menu principal, « pas en jeu » pour les 14 lectures).
2. Tout le neuf vit dans `js/jeu/` (plus `js/registre_meubles.js`, lu par deux fichiers de carte). Un fichier = un lot
   propriétaire. Les fichiers EXISTANTS sont touchés par le SOCLE (prises de 1 à 15 lignes), puis par UN seul lot.
   Le socle pose tous les fichiers de `js/jeu/` avec leurs signatures figées et un corps minimal qui marche.
3. Une seule boucle à pas fixe de 1/120 s ; `Partie.pas` fait toute la simulation dans un ordre contractuel (§ 4.3) ;
   les bots sont SIMULÉS à 120 Hz (≈ 15 µs) mais POSÉS (clips, couches, IK) une fois par image au plus.
4. **La commande est le pivot** (27 champs, § 4.5.2) : clavier, bot ou (plus tard) invité réseau la remplissent ; ni
   `Player`, ni les armes, ni les règles ne lisent `Input`. État sérialisable, hasard à graine, affichage et sons nourris
   par des ÉVÉNEMENTS et par l'état : c'est tout l'hôte autoritaire de demain.
5. Balles et vue des bots sur le monde solide (`js/collisions.js`) par DDA de sa grille + 53 sols + capsules calculées
   depuis l'ÉTAT SIMULÉ ; jamais de `Raycaster` (19 ms le rayon), jamais de `DecalGeometry` (31 ms l'impact).
6. Ressenti Call of Duty : caméra posée directement (0 lissage, la vue 1 met 105 ms aujourd'hui), pointeur brut,
   ±85°, temps pour tuer de 200 à 330 ms, recul à MOTIF appris, sprint tactique, glissade, saut qui garde l'élan,
   franchissement, son spatialisé, marqueurs de touche, régénération.
7. Navigation générée au lancement de la 1re partie (0,7 s PC) et gardée dans IndexedDB sous une empreinte du monde ;
   portes figées par une table en combat, portes « automatiques pour tous les acteurs » simulées en prop hunt ;
   ascenseur coupé ; zones de jeu fermées par rubalise.
8. **Aucune lumière ajoutée à la scène de jeu** (une de plus = 27 s d'image figée) ; l'arme de vue a sa scène, sa
   caméra et ses lumières à elle, en nombre constant.
9. Bots chargés au lancement de la partie (écran PRÉPARATION), avatars `assets/tel/` même sur PC, ≤ 6 distincts
   (3 au téléphone) : le démarrage de la balade ne s'allonge pas (32,7 s mesurés). Portraits des amis PRÉCALCULÉS en
   images (`assets/portraits/*.webp`) : jamais un 2e contexte WebGL, jamais un avatar chargé au menu.
10. Déguisements = vrais meubles, par un registre qui lit l'étiquette `userData.meuble` d'un meuble AVANT la couture
    du décor (`js/registre_meubles.js`) ; la même fonction `credibilite()` sert aux bots chasseurs et à la jauge
    DISCRÉTION de Haythem.
11. Harnais `window.__jeu` + un fichier de tests par lot, seuils chiffrés, « balade bit-identique » par rejeu
    déterministe ; le harnais ne dépend ni de `requestAnimationFrame` (images faites à la main dans un onglet caché) ni
    d'un son réel (`OfflineAudioContext` et journal des paramètres programmés) ; le navigateur intégré est partagé par
    tous les agents : **3 pages de jeu ouvertes au plus à la fois** (jetons, § 5.1 règle 3).
12. Ordre : **vague 1** = SOCLE (1 agent) → **vague 2** = 14 lots en parallèle → **F2** = fusion de la vague 2 (1 agent,
    noté vague 2,5) → **vague 3** = 4 lots (IA de combat, IA du prop hunt, progression, killcam) → **vague 4** =
    INTÉGRATION. Le lot R (l'espace pause du −1, autre agent, branche `p-pause-1015`) tourne en même temps et possède
    `js/ecole_soussol.js` et `js/ecole_amphi.js` : **aucun lot du gameplay n'y touche** ; il étiquette déjà chaque meuble
    du −1 (`userData.meuble = { type, nom, formes }`, cousu seul) et le registre sait le lire (§ 4.5.13).

---------------------------------------------------------------------------------------------------------------------

## 1. LES ARBITRAGES (chaque désaccord tranché)

| # | Sujet | Ce que proposaient les conceptions | Décision | Pourquoi |
|---|---|---|---|---|
| 1 | Base | archi : `js/jeu/`, socle + lots parallèles + harnais ; CoD : fichiers à plat dans `js/`, 9 lots en file (32 j) ; prop : `js/jeu/` + registre à la racine | **archi**, registre à la racine (`js/registre_meubles.js`) | propriétaires uniques, parallélisme, contrats figés ; le registre est appelé par la carte (deux coutures) |
| 2 | Convention de caméra | carte du cœur et CoD : `rotation.set(-p, yaw + π, 0, 'YXZ')` ; archi : sans π | **`rotation.set(-tangage, lacet, 0, 'YXZ')`** | calcul : Ry(l)·Rx(−t)·(0,0,−1) = (−sin l·cos t, −sin t, −cos l·cos t) ; le `lookAt` de la vue 1 (`game.js:1025`, `camPos − (3·sin l, 3,2·sin t, 3·cos l)`) a le MÊME AZIMUT et le même SIGNE de tangage, mais une élévation de atan(1,0667·sin t) et non t (27,1° au lieu de 28,6° à t = 0,5) : voulu, la FPS regarde exactement où dit le tangage ; avec π on regarderait derrière. Test du socle : formule à 0,1°, azimut de la vue 1 à 0,1°, signe du tangage |
| 3 | Hauteur d'œil | CoD 1,60 ; archi 1,62 ; carte 1,05 accroupi | **1,62 debout, 1,08 accroupi, 0,85 glissade, × h/1,73** | l'œil de la vue 1 est à 1,609 m : on ne change pas la taille de l'école ressentie |
| 4 | Allures | archi : vitesses de la balade (5,48 / 7,23), endurance ×0,5 ; CoD : 5,0 / 6,6 / sprint tactique 7,8, sprint illimité | **CoD** | c'est le ressenti demandé ; toutes les fiches ramenées aux mêmes vitesses (équité bots/joueur) ; `stamina` tenue à 100 (pas de « mains sur les genoux ») |
| 5 | Saut | archi `jump(2,6)` refusé sous un plafond bas ; CoD `jump(3,15)` réduit pour garder la tête à 8 cm du plafond | **CoD**, refusé sous 1,2 m/s | toujours un saut quand c'est possible ; 1 258 nœuds sont sous 2,2-2,4 m |
| 6 | Glissade, franchissement | CoD seul | **retenus** (lot L-B) | gestes signature ; aucun nouveau code de collision (`C.deplacer`) |
| 7 | Arsenal | archi : 4 armes génériques + couteau + grenade ; CoD : 5 armes nommées + couteau + frag + flash | **CoD** (FA-24 Faucon, PM-9 Guêpe, FP-12 Bélier, TP-50 Héron, P-17 Moineau) | chiffré pour les couloirs de 10-25 m et la rue bornée ; noms inventés (aucune marque) |
| 8 | Recul | archi : +0,55°/coup ± aléa, ressort 420/5,5 ; CoD : motif appris par arme + rappel + ressort visuel ω 35 ζ 0,55 | **CoD** | un motif s'apprend : c'est la compétence du jeu |
| 9 | Régénération | archi 25 PV/s ; CoD 35 PV/s | **4,0 s puis 35 PV/s** | 0 → 100 en 2,9 s : le rythme CoD |
| 10 | Boîtes de touche | archi : 5 capsules depuis l'état simulé ; CoD/persos : 12 capsules sur les os | **état simulé seulement** (tête, cou, torse, ventre, jambes) | déterministe, juste pour un bot posé à 4 Hz ou caché, rejouable par l'hôte (compensation de latence) ; contrôle : tête simulée / os `Head` ≤ 6 cm en moyenne |
| 11 | Bras de vue | archi : coupés dans `haythem.glb` (5 083 tri.) ; CoD : faits main (36 os) | **coupés dans `haythem.glb`, épaules replacées hors champ** | la vraie tenue de Haythem, doigts déjà riggés, prototype qui marche ; le seul défaut mesuré (bras de 0,479 m trop court pour la garde-main) disparaît si l'ancre de chaque épaule est posée par nous, hors de l'image. Repli : gants faits main si les photos le demandent |
| 12 | Arme de vue | CoD : primitives cousues en `SkinnedMesh` rigides, ≈ 6 appels | **CoD, ≤ 8 appels** (bras 2 + arme ≤ 6) | aucune arme sur le disque ; la marge évite de tordre les modèles |
| 13 | Passe de l'arme | carte : après `gtao` ; archi, CoD : après `oeil` | **après `oeil`** (index 3 du composer) | l'arme noire (15 % de l'écran en visée) ne doit pas faire éclaircir la scène par l'exposition automatique ; elle prend bloom, sortie, SMAA, étalonnage |
| 14 | Éclair de bouche | CoD : `PointLight` préallouée dans `ecole_lumieres.js` ; archi : aucune lumière | **aucune dans la scène de jeu** ; une `PointLight` dans la SCÈNE DE L'ARME | une lumière de plus se paie à chaque pixel, balade comprise, et un oubli (`visible`) fige 27 s ; la scène de l'arme est compilée à part, son nombre de lumières ne bouge jamais |
| 15 | Portes | archi : figées par table ; CoD : ouvertes à demeure ; prop : automatiques pour tous les acteurs | **table par mode** : combat = figées (ouvertes sur les chemins, avec une boîte mince SOLIDE le long du vantail ouvert ; culs-de-sac fermés ; une porte absente des tables suit une règle par défaut) ; prop hunt = portes de pièce « auto pour tous », simulées dans `Partie.pas`, frontières fermées | 100/100 arrivées au lieu de 64/100 ; en prop hunt « la porte qui s'ouvre seule » est un indice, et la simuler dans le pas la rend déterministe et sérialisable |
| 16 | La carte suit qui ? | prop : `game.foyer` (retouche `carte_ecole.js:2421`) ; archi, CoD : `jeuCarte` | **`jeuCarte = Object.create(game, { user: { value: corpsSuivi } })`** | aucune retouche de la carte ; spectateur et prop gardent portes, lampes et niveau justes |
| 17 | Navigation | archi : générée à la 1re partie + IndexedDB ; CoD : sous l'écran de chargement | **archi** | le démarrage de la balade ne bouge pas ; un fichier précalculé deviendrait faux à la première retouche (le lot R !) |
| 18 | Bornes de la rue | CoD : rubalise en boîtes ; archi : bornes de nav | **`joueur.bounds = BORNES_JEU`** (le filet de `Player.move`, `player.js:709-713`) + rubalise visuelle | zéro forme ajoutée pour la rue ; la moitié des appels de dessin de la rue disparaît de la vue de jeu |
| 19 | Corps d'un prop | archi : `Player` sans avatar ; prop : `Player` de Haythem en veille, `CorpsProp` pour les bots | **`CorpsProp` pour TOUS les props, Haythem compris** (son `Player` est garé, caché, non simulé) | un seul chemin de code, pas de tangage des couches (piège 13 du cœur), état minimal pour le réseau |
| 20 | Caméra du prop | CoD : caméra V2 ; prop : `camera_prop.js` ; archi : `CameraOrbite` | **`CameraOrbite`** (L-B) avec les chiffres du prop hunt | la V2 est liée à l'os `Head` et à `p.h` ; une seule caméra orbitale pour prop, mort et spectateur |
| 21 | Copie des meubles | archi : extraction par boîte (phase 1) ; prop : `noterMeuble()` dans 12 constructeurs | **registre qui lit `userData.meuble`**, fermé par les deux coutures (prises du socle) ; étiquettes posées par L-K hors du −1, par le lot R au −1 ; **pas d'extraction par boîte** | exact, sans boîtes à tenir ; l'extraction ramasse les murs (plinthes, peinture) justement pour les meubles muraux ; `js/ecole_soussol.js` et `js/ecole_amphi.js` sont au lot R |
| 22 | Hauteur de collision | archi : `collisions.js` intouché ; prop : bande réglable | **bande réglable**, valeurs d'aujourd'hui par défaut (socle) | la poubelle passe sous la table ; zéro effet sur la balade |
| 23 | Pénalité du chasseur | archi −5 par tir sur le décor, +5 par touche ; CoD −2 décor ; prop −3 par balle sur un VRAI meuble, −1 par plomb (≤ −6), soin = 25 % des dégâts | **prop** | seul « tirer sur un meuble » coûte : arroser un mur ne sert à rien, tirer sur une chaise est un pari ; viser juste soigne |
| 24 | Manches du prop hunt | archi : 2 manches, chasseurs dans la rue derrière la porte 6, traque 3:30 ; prop : 6 manches alternées, chasseurs figés et aveugles DANS la zone | **prop** | la rue est hors du prop hunt (414 m², 1 708 appels) ; alterner apprend les deux rôles |
| 25 | Effectifs | archi : mêlée 1+7, prop 3+3 ; CoD : CPS 1+5, équipes 4 c. 4 ; prop : 5 acteurs | **CoD pour le combat, prop pour le prop hunt** ; téléphone 1+3 / 2 c. 2 / 5 acteurs ; max 9 bots PC (avertissement au-delà de 7), 5 au téléphone (au-delà de 3) | 7 bots = le budget mesuré de la Radeon 660M ; 6 joueurs dans une école, c'est dense |
| 26 | Difficultés | archi 3 ; CoD Recrue / Régulier / Aguerri / Vétéran + Mixte ; prop Facile / Normal / Difficile | **CoD au combat, prop au prop hunt** | deux métiers différents (viser / soupçonner) |
| 27 | Sensibilité | archi : la balade × visée ; CoD : sensibilité FPS à part, mêmes facteurs sur les deux axes, visée à focale constante | **CoD** | 0,45 par défaut = 5 585 px par tour = 18 cm à 800 ppp, affiché en cm par tour |
| 28 | Champ | archi `graphics.fov` 95 ; CoD `controls.fps.champ` 90 | **`controls.fps.champ`, 90° horizontal 16:9 (75-110)** | tous les réglages du combat au même endroit ; ne repasse pas le préréglage graphique |
| 29 | Accroupi | CoD : C + Ctrl ; archi : jamais Ctrl | **jamais Ctrl par défaut** | en AZERTY, Ctrl + Marcher (code `KeyZ` = W) = Ctrl+W ferme l'onglet sans recours ; Ctrl + reculer = Ctrl+S |
| 30 | Pas des acteurs | CoD : par les couches (`audible`) ; archi : événements `pas` de la simulation | **archi** ; couches muettes en partie | un bot caché ou posé à 4 Hz doit s'entendre ; l'ouïe des bots lit les mêmes événements |
| 31 | Pose des bots | CoD : drapeau `poseParImage` ; archi : `Player.update = simuler + poser` | **archi** | séparation nette, testée au bit près sur la balade |
| 32 | `BUDGET_IMAGE` | CoD : 60 im/s en partie ; archi : ne pas toucher | **option « Priorité fluidité » (L-H), éteinte** ; l'intégration décide sur mesures calmes | la qualité auto vise 45 im/s ; changer la cible avant de mesurer fausse tout |
| 33 | Progression, séries, killcam | CoD lots 6 et 8 | **vague 3** | le jeu est complet sans eux ; ils se branchent sur les événements |
| 34 | IA des bots | archi : avec la nav (vague 1) ; CoD : lot 4 | **vague 3** (L-J, L-O) | une IA ne se règle qu'avec la vraie navigation, les vraies armes et les vrais meubles ; la vague 2 tourne avec le cerveau minimal du socle |
| 35 | Ton | CoD : habillage « airsoft » recommandé hors du PC | **option « Habillage : Airsoft / Militaire », AIRSOFT PAR DÉFAUT** (`jeu.habillage: 'airsoft'`), proposée en tête des réglages du COMBAT ; pas de sang, aucun corps qui reste | même mécanique, même ressenti (recul, temps pour tuer, marqueurs, poupée de chiffon gardée) ; une vraie école reconnaissable et les visages des camarades en option : le bon pari par défaut, « Militaire » à un clic (§ 7, R33) |
| 36 | Meubles du −1 | prop : `noterMeuble` dans `ecole_soussol.js` (L1161…) ; archi : extraction | **le registre LIT les étiquettes du lot R** (`{ type, nom, formes }`, chaque meuble cousu seul) ; copie APRÈS sa couture ; `formes` → `MEUBLES.parForme` | le lot R l'a déjà fait (branche `p-pause-1015`, 1aec791, 11 constructeurs) ; ses lignes changent : aucune ligne du −1 n'est citée ; une balle sur une forme d'un vrai meuble du −1 est reconnue sans boîte |
| 37 | Fusion de la vague 2 | archi : chaque lot fusionné par l'intégration finale | **F2, une fusion à elle entre la vague 2 et la vague 3** | l'IA (vague 3) se règle sur la vraie navigation, les vraies portes, les vraies armes et les vrais meubles : il lui faut une base fusionnée et vérifiée |

**Arbitrages ajoutés après la critique** (le détail de chaque point est au § 8) :

| # | Sujet | Ce qui était écrit | Décision | Pourquoi |
|---|---|---|---|---|
| 38 | Ordre des tirs dans un pas | tirs résolus tout de suite, acteur par acteur (Haythem = acteur 0) | **tirs du pas RASSEMBLÉS puis appliqués** (`Partie.differer` / `appliquerEffets`, § 4.3.2 étape 6) | sinon le premier acteur gagne tous les échanges ; deux tirs mortels au même pas tuent les deux |
| 39 | Roue des provocations | `game.wheel` (la roue des emotes) | **une roue à elle** : saisie dans `PartieProp` (souris capturée, chiffres, stick), dessin par `HudProp` (`RoueProvocations`) | la roue des emotes lit `clientX/Y` (morts sous capture), joue une emote au clic, se remet à chaque réglage |
| 40 | Portraits | copie de `portraits.js` de LA CAGE (2e contexte WebGL, 4 lumières, avatars chargés au menu) | **images précalculées** une fois par un outil (`tools/portraits/`, L-U) | rien de chargé au menu, pas de 2e contexte, pas de recuisson du sol, pas d'image figée au premier Tab |
| 41 | Aveuglement de la flash | `fx.flash` tenu à 1 | **calque DOM `#voile-flash`** (L-G) piloté par `partie.hud.aveugle` ; `fx.flash` en appoint | `fx.flash` plafonne à un voile gris de +0,35 et n'existe pas en qualité Basse |
| 42 | Capture du pointeur | reprise = capture exigée, refus → on reste en pause | **capture exigée seulement au clavier-souris** ; sinon un calque « CLIQUE POUR JOUER » ; la manette et le doigt reprennent sans capture | Échap et la manette ne donnent pas d'activation utilisateur ; le clic de LANCER a expiré au GO |
| 43 | Cerveau minimal du socle | « vers l'ennemi vu, rafale par seconde », visée parfaite | **`Errant` armé** vers les points chauds, erreur de visée σ∞ et 0,45 s de réaction ; chasseur minimal qui ne lit jamais `role` | sans cela, rien ne se passe en 4 c. 4 (départs à 41-51 m) et le prop hunt triche |
| 44 | Zone de repli du prop hunt | `e2` (le 2e) | **`e1` (le 1er, ≈ 10 types)**, puis `rdc` ; défaut calculé au lancement | le 2e n'a que 3 types déguisables : la règle « < 6 types → grisé » le grise lui-même |
| 45 | Cachettes | poses sur le graphe des chasseurs (rayon 0,3) | **2e graphe au rayon des props (0,2)** ; une cachette est LIBRE, dans la bande du type et ATTEIGNABLE | les vrais meubles ont des collisions groupées : la « chaise dans sa rangée » est dans une forme, inatteignable |
| 46 | Lisibilité des équipes | tenues teintées à 35 % + brassard | **chevron bleu permanent au-dessus de chaque allié** (DOM, ≤ 4, vu à travers les murs) + tenue à 60 % + brassard large | par défaut 8 clones de Haythem : au-delà de 15 m dans un couloir sombre, on ne sait pas qui est qui |

---------------------------------------------------------------------------------------------------------------------

## 2. LE JEU TEL QUE HAYTHEM LE VIVRA

### 2.1 Le démarrage et le menu principal
- L'écran de chargement d'aujourd'hui (sous-titre **« L'ÉCOLE · BALADE · COMBAT · PROP HUNT »**, astuces de combat
  mêlées aux autres), même durée (rien de plus n'est chargé au démarrage), puis « APPUIE POUR COMMENCER ».
- **MENU PRINCIPAL** (`game.mode = 'menu'`) : derrière lui l'école vivante — la caméra glisse lentement, 12 s par plan
  et fondu de 1,2 s, du hall vers la pile « iris », de l'escalier principal, de la pause orange du 1er. À gauche le
  titre IRIS et, l'un sous l'autre : **BALADE LIBRE · COMBAT · PROP HUNT · STAND DE TIR · OPTIONS · CRÉDITS** (vague 3 :
  ARMURERIE · PROFIL et la barre d'XP sous le titre). Manette : focus sur BALADE LIBRE, croix/stick, A, B. Tactile :
  gros boutons. Le tactile de jeu et la roue sont éteints (le mode n'est pas `'lobby'`).
- `?partie=balade` ou le réglage « Démarrage : balade » gardent l'arrivée directe d'aujourd'hui.

### 2.2 Les réglages de partie
- **COMBAT** → Mode (Match à mort par équipes · Chacun pour soi · Domination) · Zone (Toute l'école · RDC + rue · Le −1 ·
  Les étages ; la Domination n'existe que sur toute l'école) · Alliés 0-4 / Ennemis 1-5 (PC : 7 bots conseillés, 9 au
  plus ; téléphone 3 / 5) · Difficulté (Recrue · Régulier · Aguerri · Vétéran · Mixte) · Limite et temps (préréglés par
  mode) · Classe (Assaut · Infiltration · Défense · Tireur) · Avatars des bots (Gabriel, Imad, Marc-Antoine, Koji,
  Djafar, Ethan, cochables, avec leur portrait précalculé ; décochés tous = Haythem cloné et teint) · **Habillage**
  (**Airsoft**, coché par défaut, conseillé · Militaire ; la même ligne que dans Options › Combat) · **LANCER**.
- **PROP HUNT** → Zone (Le −1 · Le 1er · Le RDC · Le 2e · Toute l'école ; une zone de moins de 6 types déguisables est
  GRISÉE avec sa raison — aujourd'hui le 2e, qui n'en a que 3, et le −1 tant que le lot R n'est pas fusionné ; la zone par
  défaut est calculée au lancement : le −1 s'il a 6 types ou plus, sinon le 1er) · Manches (4 · 6 · 8) · Acteurs (4 à 8) ·
  Difficulté (Facile · Normal · Difficile ; Facile au tout premier lancement) · Premier rôle (Prop · Chasseur · Au
  hasard) · Chasseur seul (oui · non) · Aides (Discrétion · Œil · Voir les sons) · **LANCER**.
- Les derniers choix sont gardés (`settings.jeu`). LANCER ouvre **PRÉPARATION DE LA PARTIE** (barre et étapes : « Plan
  de l'école », « Les élèves arrivent », « Armes et effets », « Meubles » au prop hunt) : ≤ 4 s la 1re fois sur PC,
  ≤ 1,5 s ensuite (graphe en cache, avatars en cache).

### 2.3 Une manche de MATCH À MORT PAR ÉQUIPES, seconde par seconde (4 c. 4, toute l'école, Régulier, classe Assaut)
(Récit en habillage Militaire ; en Airsoft, l'habillage par défaut, seuls changent les mots — « TOUCHÉ » pour
« ÉLIMINÉ » —, les impacts — de peinture —, le timbre du tir et la durée de la poupée : § 3.6.)
- **0:00,0 — présentation (3 s)** : la caméra file de la rue vers la porte 6 ; bandeau « MATCH À MORT PAR ÉQUIPES ·
  SISR CONTRE SLAM · 40 ÉLIMINATIONS · 10:00 ». Haythem et ses alliés Gabriel, Imad et Koji (tenues teintées de bleu à
  60 %, brassard large, et un CHEVRON BLEU au-dessus de la tête, visible à travers les murs) dans la rue devant la porte 6 ;
  les quatre SLAM (orange : Marc-Antoine, Djafar, Ethan et un 2e Gabriel teint) au 2e, couloir rouge et salle 1 (41 à 51 m
  à pied).
- **0:03 — décompte** 3, 2, 1 (bips) ; on peut regarder, pas bouger. Si le pointeur n'est pas capturé (clavier-souris :
  le clic de LANCER a expiré pendant la préparation), le calque « CLIQUE POUR JOUER » attend le clic AVANT le décompte (la
  partie est gelée ; la manette et le doigt passent outre). **0:06 — « GO ! »**, buzzer, la caméra entre dans les yeux de
  Haythem : FA-24 à la hanche, `30 / 90`, P-17, une frag, une flash ; réticule à quatre traits.
- **0:06-0:08** : Maj tenu, sprint à 6,6 m/s, l'arme se baisse ; double appui sur Maj, **sprint tactique** 7,8 m/s,
  l'arme contre l'épaule, roulis de 1,5°. Il passe la porte 6 (ouverte à demeure) : 13 m de la rue au hall en 2 s.
- **0:10** : des pas de course résonnent à droite et en dessous (spatialisés, +4 dB pour les ennemis). Clic droit : la
  visée vient en 0,26 s, le champ se resserre ×1,25, la sensibilité suit la focale ; l'arme passe au centre, le point
  rouge s'allume.
- **0:14** : Ethan débouche du couloir est à 15 m. DEUX délais avant qu'il tire (Régulier) : sa jauge de repérage se
  remplit (0,45 s à ≤ 10 m, ≈ 0,51 s à 15 m), PUIS sa réaction (0,45 s) — ≈ 1 s en tout. Haythem tire le premier : FA-24,
  80 ms entre deux balles, quatre balles au torse (30 × 1,1 = 33 chacune) = **240 ms**. Trois marqueurs blancs « tic »,
  le 4e en X rouge, « +100 ÉLIMINATION » à droite du réticule ; fil en haut à droite « Haythem [FA-24] Ethan ». Ethan
  s'effondre en poupée de chiffon, s'efface 4 s plus tard. SISR 1 – 0. Le motif de recul a fait monter la visée de 2,1° :
  il a tiré vers le bas. (S'ils avaient tiré au même pas, les deux tirs comptaient : § 4.3.2, étape 6.)
- **0:17** : Djafar, en haut de la volée est, le touche deux fois (24 × 1,1 ≈ 26) : arc rouge à gauche du réticule,
  vignette rouge, son mat. 47 PV. Il recule derrière le pilier, appuie sur C (œil à 1,08 m en 0,16 s), recharge :
  **tactique** (il restait 18 balles) 1,90 s, les balles entrent à 1,35 s (« clac »), 30 + 1 dans la chambre.
- **0:21** : 4 s sans dégât → régénération 35 PV/s ; 100 PV à 0:22,5. Il tient G 1 s (mèche 3,5 s qui court dans la
  main), lâche : la frag rebondit deux fois sur la volée, explose à 2 m de Djafar (160 dégâts). « +100 » ; chaque
  élimination lui rend un chargeur de réserve de son arme principale (plafonné à la réserve de départ, § 3.5).
- **0:31** : Marc-Antoine l'a contourné par le hall ouest : trois balles dans le dos, une à la tête. **Caméra de mort**
  (roulis 25°, l'œil tombe à 0,4 m en 0,8 s, image désaturée, son étouffé), carte « ÉLIMINÉ PAR MARC-ANTOINE — FA-24 ·
  tête · 9 m · il lui reste 54 PV ». La caméra se tourne vers lui. **0:34** : réapparition dans la salle d'attente
  (le point le mieux noté : près des alliés, loin des ennemis à pied, vu de personne), 1,2 s de protection.
- **…** Tab montre le tableau (portraits, É/M/A, score, ratio). Les SLAM reprennent le 2e, les combats tournent autour
  de l'escalier est et du hall — les « points chauds ». Haythem fait ≈ 2 éliminations par minute en Régulier.
- **9:12** : 39 – 36 ; Gabriel élimine le dernier SLAM sorti de la pause du −1 : 40. Buzzer, « VICTOIRE » 2,5 s, puis
  le **bilan** : podium des trois meilleurs (portraits), éliminations, morts, assistances, précision, têtes, plus longue
  série ; REJOUER · CHANGER DE MODE · MENU PRINCIPAL · BALADE.

### 2.4 CHACUN POUR SOI (1 + 5, toute l'école)
0:00 présentation, 0:03 décompte, 0:06 chacun apparaît au point le plus éloigné À PIED de son plus proche ennemi,
vu de personne. 20 éliminations ou 10:00. Réapparition 2,0 s (Espace / A pour passer la caméra de mort). Pas de
régénération partagée, pas d'alliés : bleu = personne, rouge = tout le monde (plaque de nom au réticule à ≤ 30 m).
À 20 : podium des trois premiers.

### 2.5 DOMINATION (4 c. 4, toute l'école)
Trois anneaux au sol : **A** hall (14,88 ; 0 ; −3,12) r 2,5 m · **B** pause du −1 (9,38 ; −3,06 ; −9,37) r 3 · **C** pause
du 1er (12,63 ; 3,5 ; −7,87) r 3. Ces centres sont INDICATIFS : à la préparation, chacun est ramené au nœud du graphe le
plus proche à ≤ 3 m dont le dégagement est ≥ 1,5 m (le lot R refait le −1 : B peut tomber dans un meuble neuf). 0:06 « GO » : SISR (rue) est à 13 m de A, SLAM (2e) à 17 m de C ; B au milieu (35 / 37 m).
Haythem court à A : 0:08 dans l'anneau, capture d'un point neutre en 8 s (×1,5 à deux, ×2 à trois) → 0:16 « A PRISE »
(+150 au score individuel). Chaque point tenu rapporte 1 point d'équipe toutes les 3 s. Un point adverse : neutralisé en
4 s, pris en 12 s. Mi-temps à 75 points ou 5:00 (5 s, les camps s'échangent : l'école n'est pas symétrique) ;
fin à 150 ou 10:00.

### 2.6 STAND DE TIR (Haythem seul, la rue bornée devant la façade)
Une ligne de tir à x ≈ −1 ; des silhouettes en carton qui se lèvent à 8, 15 et 25 m, sur trois couloirs dont L-E fixe
les coordonnées EXACTES (table `STAND` de `partie_stand.js`) après une passe de mesure qui vérifie que la ligne de tir voit
chaque cible sans un vélo, une jardinière ni une voiture entre les deux (`balle()` libre). Défis : « 20 cibles en 30 s »,
« 10 têtes », « 30 balles à 15 m (recul) », « Réflexes » (cibles 0,8 s). 0:00 « 3, 2, 1 », chaque cible levée en
0,15 s, touchée = elle tombe (« tic »), tête = « ding » + points ×2. Chrono, précision, record (`iris.stand.v1`).
Un mannequin fixe à 10 m affiche zone et dégâts à chaque balle : le banc de réglage du ressenti.

### 2.7 PROP HUNT — Haythem PROP (le −1, Normal, 5 acteurs : Haythem + 2 props bots contre 2 chasseurs bots)
- **0:00 — présentation (3 s)** : « TU ES PROP — CACHE-TOI ! ». Haythem apparaît en humain dans l'espace pause du −1
  (vue 3e personne), ses deux coéquipiers déjà en meubles (un tabouret, une poubelle). Les deux chasseurs (avatars des
  amis) sont au pied de la volée de tôle, figés.
- **0:03 — cachette (30 s)** : il vise un tabouret Tolix vert (contour clair, aide « E : devenir le tabouret vert »), E :
  « pouf », il EST un tabouret Tolix, à sa taille et à son rendu, rayon de collision 0,27 m, 85 PV. Il se glisse entre
  deux tabourets autour d'une table, R : le cap s'aimante sur celui des voisins ; la jauge DISCRÉTION passe de ★★ à
  ★★★★★. F : figé. **0:23** : « 10 SECONDES ! ». **0:33** : sifflet, « LES CHASSEURS SONT LÂCHÉS » (un prop resté
  humain est déguisé d'office en le meuble le plus courant de sa pièce).
- **0:33-3:33 — traque (3:00)** : le cercle de PROVOCATION se vide en 40 s. Les chasseurs fouillent : la grande salle
  S −1.14, puis la pause. Imad s'arrête à 5 m, son soupçon monte sur un VRAI tabouret (fausse alerte) : tir de test,
  « VRAI MEUBLE −3 » pour lui. **1:13** : le cercle est vide, la provocation part seule (sifflet, rayon ×1,3) ; l'ŒIL du
  HUD se remplit : Imad le regarde. Haythem ne bouge pas. **1:20** : une balle le touche, vignette rouge, le meuble
  tressaille (un vrai meuble ne tressaille jamais) ; il fuit en sprint vers le couloir pendant qu'Imad recharge (au prop
  hunt, les chasseurs n'ont PAS de sprint tactique et leur sprint s'épuise en 4 s : fuir hors de vue est possible), change
  de forme dans le couloir (3 changements pendant la traque, 5 s entre deux, PV gardés en proportion) en poubelle.
  **2:40** : Djafar trouve un coéquipier bot. **3:33** : chrono à 0 avec deux props vivants → **les props gagnent**.
- **révélation (6 s)** : chaque prop survivant entouré et nommé ; +50 par survivant, +10 par 30 s de survie, provocations.
  Manche suivante : Haythem chasseur.

### 2.8 PROP HUNT — Haythem CHASSEUR (le −1, Haythem + 1 coéquipier bot contre 3 props bots)
- **0:00 — présentation (3 s)** puis **cachette (30 s)** : la scène est masquée par un panneau (`#voile-cachette`) qui
  montre « LES PROPS SE CACHENT · 0:24 », le TABLEAU DES RÔLES (qui est prop, qui chasse, la manche, le score), la
  MINI-CARTE DE LA ZONE (sa silhouette, ses pièces et ses portes, sans aucun acteur) et deux astuces qui changent toutes
  les 8 s ; la caméra est fixe ; il n'entend RIEN des props.
- **0:33 — traque** : vue FPS, PM-9 et FP-12, une frag, pas de couteau, scanner 3 charges. Il fouille : un tabouret de
  trop autour d'une table, une chaise tournée de travers, un distributeur dans le couloir, une porte de la pause qui
  s'ouvre seule, une sonnerie « en dessous ». **1:05** : FP-12 sur un tabouret suspect à 4 m : c'était un vrai (8 plombs,
  −6 PV, « VRAI MEUBLE »). **1:20** : X (scanner) : un arc orange au bord du réticule, « 4-8 m », à gauche. Le prop bot
  ne bouge plus (il se fige dès que Haythem peut le voir). Une rafale de PM-9 : marqueur ROUGE, cri, le meuble
  tressaille, +25 % des dégâts rendus en PV ; le prop fuit, il le suit, l'achève : « +100 », fil « Haythem [PM-9] Koji
  (la poubelle grise) ». **3:33** : il reste un prop → les props gagnent la manche. S'il était tombé à 0 PV à force de
  tirer sur des chaises : spectateur jusqu'à la fin de la manche.

### 2.9 Pause, fin, retour
Échap (le 1er Échap libère le pointeur : la pause s'ouvre sur `pointerlockchange`) : Reprendre · Tableau des scores ·
Options · Commandes · Recommencer · Quitter la partie. En balade, la pause gagne « Modes de jeu ». La pause gèle tout
(simulation, chrono, IA vivent dans `update`). **Reprendre** : au clavier-souris, le clic sur « Reprendre » redemande la
capture (c'est une activation utilisateur) ; si elle est refusée (Chrome refuse < 1 s après Échap), ou si l'on reprend par
Échap (qui n'est PAS une activation), la pause se ferme sur le calque « CLIQUE POUR JOUER » : la partie reste gelée
jusqu'au clic, qui capture et relance. À la manette (Start) ou au doigt (II), on reprend tout de suite, sans capture. Fin de partie : écran à elle (pas l'overlay), REJOUER · CHANGER DE MODE ·
MENU PRINCIPAL · BALADE ; quitter remet l'école telle qu'en balade (portes, ascenseur, profil de touches, Haythem au
départ, bots détruits).

---------------------------------------------------------------------------------------------------------------------

## 3. LES VALEURS CHIFFRÉES

Ce sont les valeurs de DÉPART : chaque lot les écrit telles quelles dans une table nommée en tête de son fichier
(`ALLURES`, `ARMES`, `DIFFICULTES`, `REGLAGES_PROP`…), l'intégration et la vague 3 les règlent au stand et sur des
parties simulées. Un lot ne change pas une valeur d'un autre lot.

### 3.1 Déplacements (`js/jeu/mouvement.js`, `ALLURES`)

| Allure | m/s (mobilité 1,00) | Mise en œuvre dans `Player` | Remarques |
|---|---|---|---|
| Marche (touche Marcher, stick < 58 %) | 2,15 | `p.marche = true` (plafond du clip, `player.js:689`) | pas audibles à 4 m |
| Course (défaut) | **5,00** | `p.speedMul = v / vBase(fiche)`, `vBase = 3,1 + spd/100 × 2,4` (Haythem 5,476) | TOUTES les fiches ramenées à 5,00 |
| Sprint (Maj tenu) | **6,60** | `sprintMul = 1,32` (celui d'aujourd'hui) | illimité, arme baissée, pas de tir |
| Sprint tactique (double appui sur Maj < 0,30 s, ou un appui sur la 2e touche `sprintTact` = SOURIS 5, ou L3 double) | **7,80** | `sprintMul = 1,56` | 3,0 s (PM-9, P-17 : 4,5 s) ; jauge pleine en 4 s, utilisable dès 1,2 s |
| Visée | 2,40 · PM-9 2,90 · P-17 3,10 · FP-12 2,50 · TP-50 1,60 | `speedMul` | pas de sprint en visée |
| Accroupi / accroupi visé | 2,30 / 1,50 | `speedMul` | pas muets pour les bots |
| Glissade | entrée `v0 = min(8,8 ; max(v ; 6,6) × 1,12)`, `v(t) = v0 (1 − t/0,75)^0,6`, 0,75 s | `move(dirFigée, true, dt)` avec `speedMul = v(t) / (vBase × 1,32)` | depuis un sprint ≥ 0,25 s à ≥ 6,0 m/s, accroupi pressé ; recharge 0,9 s ; direction figée ; tir permis (hanche ×1,3), pas de visée avant 0,35 s ; interdite sur une pente > 0,4 ; un saut garde 85 % de la vitesse |
| En l'air | élan gardé, τ 0,45 s vers la commande | `p.elanAir = true` (au lieu de `sp *= 0,35`, `player.js:693`) ; `p.hautCorps = 1,35` (la tête rentre : on passe sous un linteau à 2,04 m) | borné en vol (ci-dessous) |
| **Prop hunt, chasseurs** | course 5,00 · sprint 6,60 **à endurance** (−25/s, +15/s ; à 0, plus de sprint avant 20) · **pas de sprint tactique** | `acteur.sprintLimite = true` (posé par `PartieProp`) | sinon le prop repéré (≤ 5,8 m/s) est toujours rattrapé |

Mobilité de l'arme en main : P-17 1,08 · PM-9 1,06 · FA-24 1,00 · FP-12 1,00 · TP-50 0,92 · couteau seul 1,10.
Inertie au sol inchangée (τ 0,13 s au départ, 0,085 à l'arrêt). Endurance : `stamina = 100`, `staminaMul = 0` à chaque
pas en partie (sinon `gasMul` ralentit et les couches posent les mains sur les genoux) ; l'endurance des chasseurs du prop hunt
(`sprintLimite`) est un compteur de `mouvement.js` (`acteur.endurance`), jamais `stamina`, et entre dans l'état (§ 4.7).

| Hauteurs (× h/1,73) | Œil | Transition | Remarques |
|---|---|---|---|
| Debout | **1,62** | — | |
| Accroupi | **1,08** | descente 0,16 s, remontée 0,18 s (courbe douce) | relever refusé si `plafondEn` < pieds + 1,85 |
| Glissade | **0,85** | 0,12 s / 0,20 s | roulis 4° côté main faible, champ +4° |

- **Saut** : `v = min(3,15 ; √(2g · (plafondEn(x, z, pieds) − pieds − 1,73 − 0,08)))`, refusé si `v < 1,2` (apogée 0,505 m,
  0,64 s en l'air en terrain libre). **Borné aussi PENDANT le vol** (avec l'élan gardé on parcourt jusqu'à 5 m en l'air,
  sous des plafonds et des linteaux qui n'étaient pas au-dessus du décollage) : à chaque pas en l'air,
  (1) `plaf = C.plafondEn(x, z, pieds)` ; si `pieds + jumpY + 1,73 + 0,05 > plaf` → `jumpY = plaf − pieds − 1,78` et
  `jumpVel = min(0, jumpVel)` (on se cogne) ; (2) les linteaux et boîtes hautes ne sont pas des « plafonds » : la TRANCHE DE
  TÊTE `C.libre(x, z, r, pieds + jumpY, 1,78, 1,35)` (bande haut 1,78 / bas 1,35) doit être libre, sinon `jumpY` baisse
  par pas de 2 cm jusqu'à ce qu'elle le soit (au plus jusqu'à 0) et `jumpVel = min(0, jumpVel)` ; (3) en l'air le corps
  heurte avec `haut = 1,35` (`p.hautCorps`, passé à `C.deplacer` par `Player.move`) : pas de mur invisible devant une
  porte. Pas de visée dans les 0,1 s qui suivent le décollage. Réception d'une chute > 0,3 m : vitesse ×0,85 pendant 0,12 s, caméra −3 cm (ressort ω 22, ζ 0,7), arme
  −2,5 cm. Pas de dégâts de chute. (Rappel : `Player.move` passe `pos.y + jumpY` comme pieds à `C.deplacer`,
  `player.js:704` : on passe vraiment par-dessus ce qui est bas.)
- **Franchissement** (Espace face à un obstacle, ou sprint + avancer contre lui 0,15 s) : formes dont `y1 − pieds` est
  entre 0,45 et 1,20 m (F2 : 1,15 → 1,20, le comptoir de l'accueil fait 1,18 m) (tables, bureaux, banquettes, comptoir de l'accueil, jardinières) ; sonde `C.deplacer` de 0,5 m
  bloquée à < 0,8 m, ligne `rayonLibre` à `y1 + 0,25` libre sur 1,4 m, arrivée à 0,9-1,3 m au-delà avec `C.libre` et
  `|solEn − pieds| < 0,3`. Mouvement scripté 0,45 s (0,38 s sous 0,7 m), arc de caméra +0,35 m, sortie à 70 % de la vitesse
  d'entrée. Les rangs serrés (arrivée jamais libre) sont refusés d'eux-mêmes. Pas de position couchée. **Ce critère est
  UNE fonction pure, `franchissable(C, x, y, z, dx, dz) → { x, y, z, h } | null` (`mouvement.js`, écrite EN ENTIER par le
  socle)** : `appliquerCommande` (L-B) et la génération des liens « franchir » du graphe (L-D) l'appellent toutes deux, ce
  qui garantit qu'un bot ne planifie jamais un franchissement que le mouvement refuserait.
- **Escaliers** : rien à faire (rampes continues de `solEn`) ; l'œil suit `solAff`, les sauts de sol (bordure 0,12 m)
  lissés en montée (amortisseur critique 0,08 s) ET en descente (0,06 s).
- **Pas** (événement `pas`) : tous les 0,7 m en course, 0,45 m en marche, rien accroupi sous 1,3 m/s. Rayon d'audition
  des bots : sprint 14 m, course 9 m, marche 4 m, accroupi 0.
- **Contacts entre corps** : deux corps de rayons `ra` et `rb` ne se recouvrent pas (séparation à `ra + rb` ; `rayon` =
  0,3 pour un humain, celui du `CorpsProp` pour un prop : on se cogne à une poubelle-prop comme à la vraie poubelle) ;
  poussée partagée à moitié, après le déplacement, **PAR LE MONDE SOLIDE** : chaque poussée passe par `C.deplacer` (mêmes
  paramètres que `Player.move`, bande comprise) et vaut au plus **0,05 m par pas** (une poussée directe sur `pos`
  traverserait une cloison de 15 cm : `collisions.js` ne garantit l'absence de tunnel que par sous-pas de r/2) ; deux
  centres confondus se séparent selon l'angle `2π·frac(0,618·(ida + 7·idb))` (déterministe). Motif de LA CAGE
  `game.js:2170-2193`, sans `push`.

### 3.2 Caméra, visée, sensibilité (`vue_fps.js`, `entrees_jeu.js`, réglages `controls.fps`)
- **Pose directe** à chaque image : position = `posAff + (0, hauteurOeil + jumpY, 0)` + balancement ; rotation
  `camera.rotation.set(-(tangage − 0,15·reculV·DEG), lacet − 0,15·reculH·DEG, roulis, 'YXZ')` (`reculV`/`reculH` = le
  ressort VISUEL de l'Arsenal, en DEGRÉS, `reculV > 0` = l'arme se cabre ; `DEG = π/180` ; tangage > 0 = regard vers le
  BAS, donc un cabré fait regarder vers le HAUT en DIMINUANT le tangage). Aucun `lerp`. Le geste de souris arrive à
  l'écran à l'image suivante. Œil toujours ≥ 0,10 m sous `plafondEn` et hors des formes (la tranche de tête du saut).
  Le recul de VISÉE (celui qui déplace vraiment le regard) n'est PAS posé ici : `lireCommande` le consomme au pas qui suit
  le tir (§ 3.4).
- **Balancement** de la caméra (petit : c'est l'arme qui bouge) : fréquence `1,15 + 0,35 × v` Hz, vertical 1,0 cm (course)
  / 1,8 cm (sprint), latéral 0,6 cm, roulis 0,4° ; ×0,1 en visée ; nul à l'arrêt. Roulis 4° en glissade, 1,5° en sprint
  tactique, 0 sinon. Champ +5° en sprint (hors visée), +4° en glissade, lissés 0,15 s.
- **Souris** : pointeur capturé `requestPointerLock({ unadjustedMovement: true })` (repli sans option sur
  `NotSupportedError`) ; `0,0025 × sens` rad/px en lacet ET en tangage ; `sens` défaut **0,45** (5 585 px par tour, 18 cm à
  800 ppp, affiché « cm par tour à 800 ppp » ; 0,1-2,0) ; pics `|movementX| > 400` ignorés ; tangage borné **±1,48 rad**.
- **Champ** : `controls.fps.champ` = champ HORIZONTAL équivalent 16:9, défaut **90°** (75-110) ;
  `champV = 2·atan(tan(champ/2) / (16/9))`, plafond horizontal 108° pour les écrans très larges.
- **Visée (ADS)** : zoom sur la tangente P-17 ×1,10 · PM-9 ×1,15 · FA-24 ×1,25 · FP-12 ×1,10 · TP-50 ×4,0 (lunette) ;
  passage selon le temps d'ADS de l'arme, courbe `1 − (1 − t)³` ; sensibilité en visée
  `k = tan(champV_ADS/2) / tan(champV_hanche/2) × sensVisee` (défaut 1,0 ; 0,5-1,5). Lunette du TP-50 : à 85 % de l'ADS,
  arme de vue cachée, masque HTML (disque, réticule fin, vignettage) ; balancement en huit de 0,25° à 0,5 Hz ; Maj en
  visée = souffle retenu (×0,1 pendant 4 s, puis ×1,5 pendant 2 s).
- **Recul visuel** (ne touche pas la visée) : l'arme recule de `piston`, se cabre de `cabre`, roulis ±`roulis` ;
  ressort ω 35 rad/s, ζ 0,55 ; la caméra reçoit 15 % du cabré, rendu en 0,08 s. Secousses (`addShake`) : explosions
  seulement.
- **Manette** : stick droit 3,6 rad/s à `sens` 1 (courbe ^1,8, zone morte inchangée), accélération de virage (> 0,9
  pendant 0,25 s → ×1,35 en 0,3 s), ×0,55 en visée. **Aide à la visée** (manette et tactile, jamais la souris) :
  ralentissement ×0,55 (×0,7 à la hanche) quand le centre de l'écran est à moins de `atan(0,45/d) + 1°` du buste d'un
  ennemi vu à ≤ 40 m ; suivi : +45 % de la vitesse angulaire de la cible quand le stick droit bouge ; aimant d'ADS : cible
  à < 7° et < 30 m → la visée tourne de 70 % de l'écart pendant le temps d'ADS. **`corriger(cmd, game, dt)` réécrit
  `game.camYaw` / `game.camPitch` ET `cmd.lacet` / `cmd.tangage`** (sinon la commande suivante, relue sur `game`, annule
  l'aimant) ; `facteurStick(game)` ne fait que multiplier la vitesse du stick.
- **Tactile** (façon CoD Mobile) : TIR en rôle mixte bouton + regard (on vise en glissant sur le bouton), **tir auto**
  (défaut au téléphone) quand le réticule reste 0,12 s sur un ennemi à ≤ 30 m ; sprint verrouillé en poussant le
  joystick au-delà de son bord (= sprint tactique s'il est prêt) ; glisser vers le bas sur ACCROUPI en sprint = glissade.

### 3.3 Les armes (`js/jeu/armes.js`, `ARMES` ; les données exactes sont posées par le socle, L-A les règle)

| | **FA-24 « Faucon »** | **PM-9 « Guêpe »** | **FP-12 « Bélier »** | **TP-50 « Héron »** | **P-17 « Moineau »** |
|---|---|---|---|---|---|
| Classe | fusil d'assaut | pistolet-mitrailleur | fusil à pompe | précision à verrou | pistolet (secondaire) |
| Tir | auto 750 cps/min (80 ms) | auto 900 (66,7 ms) | pompe 70 (857 ms) | verrou 45 (1,33 s) | semi, 400 max (150 ms), tampon 0,1 s |
| Dégâts (m : dégâts) | ≤15 : 30 · ≤30 : 24 · au-delà 20 | ≤8 : 26 · ≤16 : 20 · 15 | 8 plombs × (≤5 : 18 · ≤9 : 11 · ≤14 : 6 · 0) | 105 partout | ≤10 : 34 · ≤20 : 25 · 20 |
| Tête / cou / torse / ventre / jambes | 1,4 / 1,2 / 1,1 / 1,0 / 0,9 | 1,25 / 1,1 / 1,0 / 1,0 / 0,9 | 1,0 partout | 2,0 / 1,5 / 1,0 / 0,9 / 0,75 | 1,5 / 1,2 / 1,0 / 1,0 / 0,9 |
| Balles pour tuer (près / moyen / loin, au ventre) | 4 / 5 / 5 | 4 / 5 / 7 | 1 (≥ 6 plombs) / 2 / 3 | 1 au-dessus du ventre, 2 sinon | 3 / 4 / 5 |
| TTK au corps, de près | **240 ms** | **200 ms** | 0 ou 857 ms | 0 ou 1,33 s | 300 ms |
| Chargeur / réserve | 30 / 90 | 32 / 96 | 7 / 21 | 5 / 20 | 12 / 48 |
| ADS · sprint→tir | 0,26 · 0,20 s | 0,20 · 0,13 | 0,26 · 0,18 | 0,42 · 0,32 | 0,15 · 0,10 |
| Recharge tactique / à vide (balles entrées à) | 1,90 / 2,45 (1,35) | 1,65 / 2,15 (1,15) | 0,35 + 0,42/cartouche + 0,30 (+0,45 pompe à vide), interruptible | 2,30 / 2,90 (1,70) | 1,30 / 1,65 (0,90) |
| Sortie / rangement | 0,30 / 0,20 | 0,25 / 0,18 | 0,32 / 0,22 | 0,38 / 0,25 | 0,20 / 0,15 |
| Zoom visée | ×1,25 | ×1,15 | ×1,10 | ×4,0 | ×1,10 |
| Mobilité | 1,00 | 1,06 | 1,00 | 0,92 | 1,08 |
| Bruit (m, ouïe des bots) | 45 | 40 | 45 | 60 | 35 |
| Encombrement (prises : § 4.5.9) | 0,84 m | 0,62 m | 0,95 m | 1,10 m | 0,19 m |

- Recharge « tactique » = il restait des balles → chargeur + 1 (chambre) ; (F2) jamais d'un chargeur plein (R n'y fait
  rien, comme dans Call of Duty). Annulée par le sprint, un changement d'arme ou
  le couteau tant que les balles ne sont pas entrées. Tir en sprint = sortie du sprint puis tir après `sprintTir`.
  Automatiques par `tir` tenu, semi-auto par front avec tampon de 0,1 s. Visée maintenue par défaut (bascule en option).
- **Cadence, avec REPORT DU RESTE** (80 ms font 9,6 pas, 857 ms en font 102,86 : `prochain = t + 60/rpm` tirerait tous
  les 10 pas, 30 balles en 2,417 s au lieu de 2,32) : un tir part au premier pas où `t ≥ prochain` (et `tir` tenu pour une
  automatique, ou un front — tamponné ≤ 0,1 s — pour une semi-automatique, une pompe ou un verrou), au plus un par pas ;
  puis **`prochain = max(prochain, t − PAS) + 60/rpm`**. En tir soutenu cela revient à `prochain += 60/rpm` (la moyenne
  est exacte) ; après une pause, la première rafale ne rattrape pas le temps perdu.
- **Couteau** (V / R3) : 150 dégâts (tue), portée 1,6 m, fente jusqu'à 2,4 m si un ennemi est dans un cône de 25° (tiré
  vers lui à 6 m/s pendant 0,15 s au plus), 0,60 s par coup, touche à 0,12 s.
- **Grenade à fragmentation** (G / RB) : 1 par vie ; maintenir = goupille tirée, mèche 3,5 s qui court dans la main
  (explose en main à 3,5 s) ; lancer 15 m/s dans l'axe + 2,5 m/s vers le haut ; rebonds (restitution 0,35, frottement
  0,6), arrêt sous 0,4 m/s ; **160 dégâts à ≤ 2,0 m, décroissance linéaire jusqu'à 25 à 6,5 m**, ligne de vue exigée
  (centre + 0,3 m → buste ou tête : un mur protège) ; dégâts à soi comptés (suicide −1).
- **Grenade flash** (A en AZERTY = `KeyQ` / LB) : 1 par vie (Défense : 2), mèche 1,6 s, rayon 14 m avec ligne de vue ;
  aveuglement `0,8 + 3,2 × face × (1 − d/14)` s (face 0 = dos tourné, 1 = plein regard), plafonné 4 s. Pour Haythem :
  un **calque DOM blanc `#voile-flash`** (L-G ; au-dessus du HUD, sous la pause) d'opacité 1 pendant `durée − 0,6` s puis
  fondu linéaire de 0,6 s, piloté par `partie.hud.aveugle = { t, duree }` (posé par `Partie.majHud` sur l'événement
  `flash` de l'acteur local) — il marche à toutes les qualités, Basse comprise (`fx.flash` seul plafonnait à un voile gris
  de +0,35 et n'existe pas quand `fx.enabled` est faux : il reste en appoint, mis à 1 par `VueFPS`) ; son étouffé
  (passe-bas 300 Hz) + acouphène. Un bot aveuglé ne perçoit plus et tire 20 % du temps vers la dernière position connue.
- **Classes** (vague 2, sans progression) : **Assaut** FA-24 + P-17 + frag + flash · **Infiltration** PM-9 + P-17 + frag +
  flash · **Défense** FP-12 + P-17 + frag + 2 flash · **Tireur** TP-50 + P-17 + flash. Bots : Assaut 40 %, Infiltration
  30 %, Défense 20 %, Tireur 10 % (tirés par la graine). **Chasseur du prop hunt** : PM-9 + FP-12 + 1 frag, ni couteau ni
  flash.
- Vitres : la balle traverse à 80 % des dégâts et pose une fêlure. Pas de tir à travers les murs. Les vitres DÉPOLIES
  (jours dépolis, cloisons de verre opaque : drapeau `depoli`, § 4.5.19) se traversent de même, mais **on ne voit pas à
  travers** : ni Haythem, ni les bots (`vue()` s'y arrête).

### 3.4 Dispersion et recul
- **Dispersion de hanche** (demi-angle, degrés) : `s = base(état) × (accroupi ? 0,8 : 1) + chaleur` ; `base` interpolée en
  0,12 s entre repos, marche (v > 0,3), course (v > 3), sprint→tir (pendant `sprintTir`), saut ; chaleur += `parTir`,
  plafond `max`, décroît de `retour` °/s. FA-24 : repos 2,2 · marche 3,4 · course 4,6 · sprint 5,5 · saut 8,0 · parTir 0,30 ·
  max 3,0 · retour 7,0 · visée 0,0 · visée en mouvement 0,15. Les autres armes : mêmes champs, valeurs posées par L-A
  (PM-9 plus large à la hanche, P-17 plus serrée, TP-50 8° « au jugé »). FP-12 : gerbe fixe (1 plomb au centre + 7 en
  couronne à 0,6 × cône) tournée au hasard, ±0,3°, cône 5,0° hanche / 3,6° visée.
- Tirage : `r = s·√u`, `θ = 2πv`, `u, v` d'un `Rng` semé par `melanger(graine, idActeur, tirSeq)` (le même sur l'hôte et
  l'invité demain). Réticule : écart en px `= tan(s) / tan(champV/2) × H/2` (il dit la vérité).
- **Recul de visée** (déplace vraiment `lacet`/`tangage` : on compense en tirant vers le bas) : au tir n° `i`,
  `tangage −= v[i]·k`, `lacet −= h[i]·k` (degrés → radians ; `k` = visée 0,8 × accroupi 0,85) ; au-delà du motif on boucle
  sur ses `boucle` derniers tirs avec ±`alea`. **Rappel** : 300 ms après le dernier tir, 40 % du recul vertical accumulé
  revient en 0,30 s. Motifs (°, `v` vers le haut, `h` > 0 vers la droite) :
  - FA-24 : `v` = 0,45 0,50 0,55 0,60 0,62 0,62 0,60 0,58 0,58 0,56 0,55 0,55 ; `h` = +0,05 +0,08 +0,10 +0,06 −0,04 −0,12
    −0,18 −0,15 −0,05 +0,10 +0,18 +0,12 ; boucle 6, aléa 0,08 → **6,8° de montée sur 12 balles**, un « 7 » à apprendre.
  - PM-9 : `v` = 0,30 0,32 0,34 0,36 0,38 0,40 puis 0,40 ; `h` en zigzag ±0,10 → ±0,22.
  - P-17 : `v` 1,1, `h` ±0,25 au hasard, rappel 80 % en 0,20 s. FP-12 : `v` 4,5, `h` ±0,8, rappel 100 % en 0,45 s. TP-50 :
    `v` 6,0, `h` ±0,5, rappel 100 % en 0,60 s.
  - **Qui l'applique** : l'Arsenal ACCUMULE le recul de chaque tir ; il est consommé au pas SUIVANT le tir par le lecteur
    de la commande — `lireCommande` fait `arsenal.prendreRecul(r)` puis `game.camPitch −= r.v ; game.camYaw −= r.h`
    (radians) AVANT de copier `lacet/tangage` dans la commande ; pour un bot, `Cerveau.commande` l'applique à sa visée
    interne et le compense selon sa difficulté. `VueFPS.poser` n'y touche jamais (une fois par image : le résultat
    dépendrait de la cadence d'images). Une montée de 6,76° = `camPitch` qui BAISSE de 0,118 rad.
- **Recul visuel** (arme de vue) : piston FA-24 2,8 cm · PM-9 2,0 · P-17 3,5 · FP-12 6,0 · TP-50 5,0 ; cabré 2,2° / 1,6 / 4,0 /
  8,0 / 6,0 ; roulis ±1,0°.

### 3.5 Vie, dégâts, réapparition
- 100 PV ; régénération 4,0 s après le dernier dégât, **+35 PV/s** ; protection d'apparition 1,2 s (finie au premier tir).
- Tir allié : désactivé (les balles traversent les alliés). Assistance : ≥ 30 dégâts sur une cible tuée dans les 5 s.
- **Munitions** : chaque élimination rend au tireur UN chargeur de réserve de son arme PRINCIPALE (`fiche.chargeur`
  balles), plafonné à la réserve de départ (`fiche.reserve`) — une bonne vie ne tombe plus à sec (120 balles, ≈ 10 par
  élimination). L-E le pose ; L-P (armes au sol) dit dans son rapport s'il le garde.
- Dégâts = `degatsDe(fiche, distance, zone)` × 0,8 si la balle a traversé une vitre. Zones simulées (§ 4.5.6).

### 3.6 Les retours (feedback)
| Retour | Valeurs |
|---|---|
| Marqueur de touche | X blanc de 4 traits 2 × 10 px à 6 px du centre, 0,12 s ; « tic » (triangle 1,8 kHz, 30 ms) |
| Tête | X un peu plus grand ; « ding » (sinus 3,2 kHz, 120 ms + harmonique) |
| Élimination | X rouge `#ff3b30` 0,22 s ×1,15 ; son sourd + 2e tic ; « +100 ÉLIMINATION » à droite du réticule (1,5 s, empilés) |
| Corps touché (vu) | le bot sursaute (buste −0,15 rad à l'opposé du coup, ressort ω 18) ; sa vitesse ×0,7 pendant 0,3 s |
| Être touché | arc rouge de 30° à 120 px du centre vers le tireur (opacité ∝ dégâts, 1,6 s) ; « punch » de visée 1,2° × dégâts/30 rendu en 0,18 s ; « thwack » ; manette (fort 0,5, faible 0,8, 90 ms) |
| Vie basse | vignette rouge d'opacité `(1 − vie/60) × 0,85` sous 60 PV, qui bat à 1,2 Hz sous 30 PV avec un cœur (deux sinus 55 Hz, 75 bpm) |
| Grenade proche | icône orientée à ≤ 7 m |
| Explosion proche | secousse 0,06 → 0 en 0,5 s (∝ 1 − d/8), acouphène (3,6 kHz 1,5 s), passe-bas 600 Hz rouvert en 2 s |
| Balle qui frôle (< 1,5 m de la tête) | sifflement (bruit passe-bande 4 kHz balayé, 80 ms) |
| Mort de Haythem | caméra de mort (roulis 25°, œil à 0,4 m en 0,8 s, désaturation 3 s), carte « ÉLIMINÉ PAR … — arme · zone · distance · PV restants du tueur », réapparition 3,0 s (CPS 2,0 s), Espace / A pour passer |
| Bot éliminé | poupée de chiffon Verlet (impulsion 2,5 m/s ; tête : coup sec), 4 s au sol, s'enfonce de 0,5 m en 0,4 s, disparaît ; **pas de sang, aucun corps qui reste** |
| Habillage **Airsoft (PAR DÉFAUT)** | impacts de peinture colorés (couleur de l'équipe du tireur) au lieu des trous ; « TOUCHÉ » au lieu d'« ÉLIMINÉ » (« +100 TOUCHÉ », « TOUCHÉ PAR … ») ; tir à la recette « gaz » (même structure claquement / corps / queue que le Militaire, claquement plus court, sans grave) : il claque encore ; le bot éliminé garde sa poupée de chiffon 1,5 s (au lieu de 4 s) puis s'efface en 0,6 s. Militaire (au choix) : la ligne du dessus et les trous |
| Alliés | **chevron bleu `#3d8bff` permanent** au-dessus de chaque allié (tête SIMULÉE + 0,35 m), en DOM, 4 au plus, vu à travers les murs, plus petit avec la distance (14 → 8 px) ; nom de l'allié sous le chevron à ≤ 15 m ; tenue teintée à 60 % et brassard large (8 cm) aux deux bras ; aucun chevron en chacun pour soi |

### 3.7 Les bots du combat (vague 2 : cerveau minimal du socle ; vague 3 : L-J)
- **Perception** à 10 Hz par bot, décalée (`(tick + 7·id) % 12 === 0`) ; décision à 20 Hz (`(tick + 3·id) % 6 === 0`) ;
  pilotage et lissage de la visée à chaque pas. Dégradation automatique si `Partie.pas` > 0,5 ms en moyenne : perception
  5 Hz, décision 10 Hz.
- **Vue** : ennemi à ≤ 50 m, dans le cône (demi-angle 50° / 55° / 60° / 65° selon la difficulté) ou à ≤ 2,5 m ; ligne de
  vue œil → tête ou buste SIMULÉS : pré-filtre `zonesCachees & zoneDe` (2 µs) puis DDA (8 µs) ; vitres claires
  transparentes, vitres DÉPOLIES opaques. Le pré-filtre n'a le droit de dire « caché » que là où il a été VALIDÉ : sur
  10 000 paires de nœuds que le DDA brut dit visibles, il doit répondre « peut-être visible » 100 fois sur 100 ; une paire
  de zones fautive va dans `EXCEPTIONS_PREFILTRE` (`balistique.js`), où l'on passe directement au DDA. **Repérage** :
  jauge 0 → 1 à la vitesse `1/tRepérage × f(d) × (cible accroupie immobile ? 0,6 : 1) × (cible qui tire ? 2 : 1)`, `f` = 1
  à ≤ 10 m, 0,5 à 30 m, 0,3 à 50 m (linéaire entre) ; à 1, la cible est connue tant qu'elle reste vue. **Puis** la
  réaction (repéré → 1er tir). Ce sont DEUX délais qui s'ajoutent : en Régulier, à 10 m, 0,45 + 0,45 = 0,9 s entre
  l'apparition dans le cône et la première balle.
- **Ouïe** (événements) : tirs au rayon de l'arme (§ 3.3, ×0,55 d'un niveau à l'autre), pas (§ 3.1), explosion 60 m,
  balle qui frôle → direction ; chaque indice faux de ±1,5 à ±4 m (graine) : les bots vont VOIR, ils ne savent pas.
  **Douleur** : touché → direction exacte du tireur, sa position à ±2 m s'il est à ≤ 25 m. **Équipe** : ce qu'un bot
  repère est partagé 0,6 s plus tard, oublié après 6 s (`partie.signaler`). Jamais la lecture d'un état que le joueur ne
  « montre » pas.
- **États** : PATROUILLE (vers les points chauds : chaque zone garde une chaleur des tirs et morts récents, demi-vie
  30 s) → ALERTE (indice) → TRAQUE (dernière position connue, < 6 s) → COMBAT (cible vue) → REPLI (couvert) → OBJECTIF
  (domination). Couvert : 12 nœuds tirés dans un anneau de 2-8 m, gardés s'ils sont cachés de la menace à 1,0 m et voient
  à 1,6 m ; 0,2 ms par décision, 2 décisions/s au plus. Cible gardée sauf menace 40 % plus proche ou qui tire sur soi.
- **On ne ralentit JAMAIS un bot** (ça se voit) : la difficulté joue sur la perception, la visée, la décision.

| Paramètre | Recrue | Régulier | Aguerri | Vétéran |
|---|---|---|---|---|
| Repérage `tRepérage` (jauge 0 → 1 à ≤ 10 m) | 0,65 s | 0,45 | 0,30 | 0,20 |
| Réaction (repéré → 1er tir), EN PLUS du repérage | 0,65 s | 0,45 | 0,30 | 0,20 |
| Erreur de visée σ0 → σ∞ (10 m, cible immobile) | 9° → 2,8° | 7° → 1,9° | 5° → 1,2° | 3,5° → 0,7° |
| Resserrage τ | 0,9 s | 0,7 | 0,5 | 0,35 |
| Vise la tête | 10 % | 20 % | 35 % | 50 % |
| Rotation max | 220°/s | 300 | 380 | 450 |
| Compensation du recul | 40 % | 65 % | 85 % | 95 % |
| Rafales FA-24 / pause | 3-5 / 0,6 s | 4-7 / 0,45 | 5-9 / 0,30 | 6-12 / 0,22 |
| Repli sous 35 % de vie | 30 % | 50 % | 70 % | 85 % |
| Grenades, coup d'œil depuis un couvert, couteau | non | grenades | oui | oui (+ pré-visée des portes) |

Erreur : `σ(t) = σ∞ + (σ0 − σ∞)·e^(−t/τ)`, ×1,5 si la cible se déplace latéralement à > 2 m/s, ×1,3 si le bot bouge,
×1,8 pendant 0,3 s après une touche reçue, ×(1 + 0,02 (d − 20)) au-delà de 20 m. Le bot tire de VRAIES balles. Ordre de
grandeur visé (buste à 10 m, FA-24) : 12 / 25 / 50 / 85 % de touches → Haythem meurt en 2,7 / 1,3 / 0,7 / 0,4 s de tir
continu. Mixte = alliés Régulier, ennemis tirés entre Recrue et Aguerri. En combat : pas chassés, changement de sens
toutes les 0,5-1,2 s, accroupi 15/25/35/40 % à > 15 m ; PM-9 et FP-12 foncent sous 8 m ; jamais de saut tireur ; ligne de
vue perdue → 0,15 s de tir encore (Aguerri+ : 0,3 s de suppression), puis TRAQUE. Recharge à < 25 % sans cible ; vide sous
le feu → pistolet (Aguerri+) ou repli. Grenades (Régulier+) : ennemi connu immobile ≥ 3 s derrière un couvert à 8-25 m sans
ligne de vue ; 25 s entre deux par bot, 10 s par équipe. **Franchissements** : les bots suivent les liens « franchir » du
graphe (tables, bureaux, banquettes, jardinières ; § 4.5.11) en envoyant le front `saut` face à l'obstacle — semer un bot
par-dessus une table ne marche pas.

**Le cerveau MINIMAL du socle** (vagues 2 et F2, avant L-J ; § 4.5.11) n'est pas un mannequin : sans rien percevoir, il
erre (`Errant`) vers le point chaud le plus récent (dernier tir ou dernière mort entendus), à défaut vers le départ
adverse ; il voit par `balistique.vue` (cône 60°, 50 m, jauge de repérage et réaction de SA difficulté) ; il vise avec
l'erreur gaussienne σ∞ de sa difficulté et une rotation bornée, tire par rafales de 3 à 5 avec 0,6 s de pause, recharge
à vide. C'est ce qui rend le jeu jouable à la fin de F2.

### 3.8 Les modes du combat (`partie_fps.js`, `partie_stand.js`)

| Mode | Joueurs PC / tél. | Limite | Réapparition | Particularités |
|---|---|---|---|---|
| Match à mort par équipes (SISR bleu `#3d8bff` c. SLAM orange `#ff8a1f`) | 4 c. 4 / 2 c. 2 | 40 éliminations (tél. 20) · 10:00 | 3,0 s | +1 au score d'équipe par élimination |
| Chacun pour soi | 1 + 5 / 1 + 3 | 20 · 10:00 | 2,0 s | podium des trois premiers |
| Domination | 4 c. 4 / 2 c. 2 | 150 points · 10:00, mi-temps à 75 ou 5:00 | 3,0 s | § 2.5 |
| Stand de tir | Haythem seul | défis | — | § 2.6, records `iris.stand.v1` |

Score individuel : élimination 100, tête +25, couteau +25, au-delà de 30 m +50, assistance 50, capture 150,
neutralisation 75, défense (élimination dans un anneau tenu) 50 ; suicide −1 élimination.

**Zones de jeu du combat** (`ZONES_JEU`, `constantes.js`) :
| Zone | Contenu | Départs (points indicatifs, ramenés au nœud le plus proche) |
|---|---|---|
| `ecole` (défaut) | 4 niveaux + rue bornée (x −3…23, z ≤ 6) | SISR rue devant la porte 6 (15,0 ; 0 ; 3,5) · SLAM 2e couloir rouge (14,63 ; 6,6 ; −5,87) et salle 1 (4,63 ; 6,6 ; −7,87) |
| `rdc_rue` | RDC (pièces ouvertes) + rue bornée ; frontières `hallO\|palierSS`, `couloirEst\|descenteEst`, `escalier\|hallO`, `escEst\|vestEst` | rue (3,5 ; 0 ; 3,0) c. salle David Clark (5,38 ; 0 ; −15,12) — 31 m |
| `ss` | le −1 ; frontières `hallO\|palierSS`, `couloirEst\|descenteEst` | sas est (15,63 ; −3,06 ; −9,62) c. pied de la volée de tôle (1,38 ; −3,06 ; −10,87) |
| `etages` | 1er + 2e + volées est ; frontières `escalier\|hallO`, `escEst\|vestEst` | S 1.3 (2,88 ; 3,5 ; −3,37) c. salle 1 du 2e — 39 m |
Jamais deux équipes adverses visibles l'une de l'autre au départ (le RDC hall–attente–hall ouest est un seul plateau) ;
le harnais le vérifie (ligne de vue entre départs = 0, distance à pied ≥ 15 m).

**Apparitions en cours de partie** : candidats = les 20 points de `carte_monde` § 8 + des nœuds échantillonnés du graphe
(dégagement ≥ 0,75 m, hors volées, ≈ 12 par niveau, filtrés par la zone de jeu) ; `note = 1,0 × proximité des alliés
(≤ 15 m à pied) − 3,0 × danger`, danger = ennemis à ≤ 20 m à pied (×3 s'ils ont une ligne de vue sur le point) + morts
récentes à ≤ 8 m ; tirage parmi les 3 meilleurs (graine). Chacun pour soi : le point qui maximise la distance à pied au
plus proche ennemi et n'est vu par personne. Distances à pied : champs de Dijkstra par point (15 ms chacun, en cache).

### 3.9 Le prop hunt (`REGLAGES_PROP` dans `partie_prop.js`)

| Règle | Valeur |
|---|---|
| Manches | 6 (4 / 6 / 8 au menu), rôle de Haythem alterné ; premier rôle : prop / chasseur / au hasard |
| Présentation / révélation | 3 s / 6 s |
| Cachette / traque | −1 et 2e : 30 s / 3:00 · 1er : 35 s / 3:30 · RDC : 40 s / 4:00 · école : 50 s / 5:30 |
| Composition (défaut 5) | Haythem prop : Haythem + 2 props bots c. 2 chasseurs bots ; Haythem chasseur : Haythem + 1 coéquipier bot (un cran moins doué) c. 3 props bots ; « Chasseur seul » : le coéquipier devient un 4e prop ; 4 à 8 acteurs, chasseurs = arrondi(N/3) |
| Chasseurs pendant la cachette | figés à leur départ, caméra fixe, la scène masquée par le panneau de cachette (`#voile-cachette` : chrono, tableau des rôles, mini-carte de la zone sans acteurs, astuces), sourds aux props |
| Allures des chasseurs | course 5,00 ; sprint 6,60 à ENDURANCE (100, −25/s en sprint, +15/s sinon ; épuisée → plus de sprint avant 20) ; **aucun sprint tactique** ; le reste comme au combat |
| PV d'un chasseur | 100 ; −3 par balle sur un VRAI meuble déguisable, −1 par plomb (≤ −6 par coup) ; la grenade ne coûte rien ; murs, sols : rien |
| Soin du chasseur | +25 % des dégâts faits à un prop (plafond 100) |
| PV d'un prop | `round(clamp(40 + 90·∛V, 60, 145))`, V = volume de la boîte (m³) : chaise coque 0,30 m³ → 100 ; poubelle → 79 ; micro-ondes → 72 ; distributeur → 136 ; baby-foot → 142 |
| Vitesse d'un prop | `4,6 × clamp(1,15 − 0,35·∛V, 0,72, 1,05)` m/s ; marche 1,4 m/s SILENCIEUSE ; sprint ×1,2 (endurance 100, −33/s, +15/s) ; saut 1,8 m/s (0,165 m, « toc » à 6 m) |
| Rayon de collision | `clamp(max(l, p)/2 × 0,9, 0,15, 0,5)` ; bande de hauteur `[pieds + min(0,25 ; 0,4 h), pieds + max(h, 0,5)]` |
| Changements de forme | illimités pendant la cachette ; 3 pendant la traque, 5 s entre deux ; « pouf » à 10 m ; PV gardés en proportion |
| Provocation obligatoire | toutes les 40 s (départ décalé de 0-15 s par la graine) ; 20 s dans la dernière minute ; 25 s pour le dernier prop ; forcée = sifflet, rayon ×1,3 |
| Provocation volontaire | 4 s de recharge, remet le compteur à zéro ; +5 à +10 points (×2 si un chasseur est à < 10 m) |
| Scanner (chasseur) | 3 charges par manche, 8 s entre deux, 12 m, même niveau ; arc ±20° (graine), teinte < 4 / < 8 / < 12 m ; les props à < 12 m entendent le bip |
| Fin de manche | tous les props morts → chasseurs ; chrono à 0 avec ≥ 1 prop → props ; tous les chasseurs morts → props |

Points : prop — 30 s de survie +10, provocation +5 à +10, manche survécue +50, dernier prop +25 ; chasseur — prop éliminé
+100, aide (≥ 25 % des dégâts) +40, balle sur un vrai meuble −2 ; équipe gagnante +50 chacun.

Les 8 provocations (synthétisées, aucune licence) : « Coucou ! » sifflé (0,6 s, 18 m, 5 pts) · sifflet d'arbitre (0,7 s,
22 m, 6) · klaxon pouet-pouet (0,8 s, 25 m, 7) · canard (0,9 s, 18 m, 5) · rire « hihihi » (1,2 s, 20 m, 6) · **sonnerie de
l'école** (1,6 s, 30 m, 10) · ba-dum-tss (1,0 s, 22 m, 7) · sonnerie de téléphone (1,4 s, 26 m, 8). À travers une dalle :
×0,35 et passe-bas 900 Hz. Autres indices : frottement d'un prop à > 1,2 m/s toutes les 0,4 m (7 m), « pouf » (10 m),
défigement (« craquement », 4 m), portes « auto » qui s'ouvrent pour tous les acteurs.

**Zones du prop hunt** (`ZONES_JEU`) : `ss` (−1, défaut) · `e2` (e2couloir, e2s1, e2s2, e2palier, e2sas) · `e1` (e1pause,
e1salle, e1kahn, e1couloir, e1bureau, e103, e104, e1est, palier1) · `rdc` (attente, hall, hallO, passage, si01, bureauB, dc,
c05, c01, couloirEst, vestEst) · `ecole_int` (tout sauf rue, porche, cage haute, ascenseur). Départs des chasseurs :
−1 hallSS (1,38 ; −3,06 ; −10,87) · 2e e2palier (15,63 ; 6,6 ; −9,87) · 1er e1est (15,88 ; 3,5 ; −9,87) · RDC hall
(14,88 ; 0 ; −3,12). Si le catalogue d'une zone a moins de 6 types déguisables, le menu la grise (avec sa raison) :
c'est le cas du **2e** (3 types : chaises en écusson, chaises visiteur, extincteurs) et du **−1 avant la fusion du lot R**.
La zone de REPLI est le **1er** (`e1`, ≈ 10 types : mange-debout, Miura, coques noires, distributeurs, chaises de hêtre de
la S 1.3, chaises de la Kahn, extincteur, plantes, fauteuil, chaises), puis `rdc`. Le défaut `settings.jeu.prop.zone` vaut
`null` = « calculé au lancement » : `ss` si `typesDeguisables('ss').length ≥ 6`, sinon `e1` ; un choix explicite de
Haythem est gardé tant que la zone n'est pas grisée.

**Déguisables** (≈ 25 types, ≈ 270 poses ; le registre rend le compte exact) : −1 (étiquetés par le lot R) tabourets
Miura et Tolix, mange-debout (colonne, trépied), table haute en X, baby-foot (sur place), distributeurs (muraux, sur
place), micro-ondes, poubelles carrées, chaise filaire, cartons, extincteur ; RDC chaises coques DAR (6 couleurs), borne,
présentoir, chaises moutarde et marine de la David Clark, chaises de bureau, corbeilles, plante, chaises luge, fauteuils
de l'accueil, photocopieurs, affranchisseuse, extincteur ; 1er mange-debout, tabourets Miura, chaises coques noires,
distributeurs, chaises de hêtre de la S 1.3, chaises de la Kahn, extincteur, plantes, fauteuil, chaises ; 2e chaises en
écusson, chaises visiteur, extincteurs. **Non déguisables** : tables longues, bureaux, banquettes, comptoirs, armoires
(disque > 0,5 m), radiateurs, affiches, écrans (plats), les 97 fauteuils sur poutre de la S −1.14, ce qui est posé sur
un bureau, la rue. **Un type n'est déguisable dans une zone que si TOUS ses exemplaires de la zone sont au registre** :
un vrai meuble non étiqueté (même géométrie qu'un prototype, absent du registre : `verifierMeubles().nonEtiquetes`)
serait un « tir gratuit » pour le chasseur et un indice (son impact sur le mur derrière) ; le type passe alors
`deguisable: false` dans cette zone, avec la raison au rapport.

**Bots chasseurs** (`DIFFICULTES_PROP`, vague 3 : L-O) :
| Réglage | Facile | Normal | Difficile |
|---|---|---|---|
| K (détection, /s) | 0,25 | 0,6 | 1,2 |
| εmax (fausses alertes) | 0,35 | 0,25 | 0,12 |
| Balles par tir de test | 1 | 2 | 3 |
| Erreur de visée / réaction | 3,5° / 0,6 s | 1,8° / 0,4 s | 0,8° / 0,25 s |
| Ouïe (portée, σ) | ×0,7, 0,15·d | ×1, 0,08·d | ×1,2, 0,05·d |
| Mémoire « vérifié » | 30 s | 60 s | 90 s |
| Grenade | non | non | sur une grappe de soupçons ≥ 60 |
| Coéquipier de Haythem | Facile | Facile | Normal |

Soupçon (perception 5 Hz, un bot par image) : candidats = props vivants ET vraies poses des pièces voisines, rendus
MÊLÉS et sans marque par `candidatsMeubles` (§ 4.5.13), jugés par les mêmes tests ; `λ = K·(1 − cred)²·clamp(1 − (d − 3)/12, 0, 1)·att` (+2,5 si l'objet bouge > 0,25 m/s ou tourne
> 0,6 rad/s) ; `cred` d'un vrai meuble = `1 − ε`, ε ∈ [0 ; εmax] tiré par (bot, pose) en début de manche ; cône 100°,
18 m ; états ATTENTE → PATROUILLE → FOUILLE (points d'observation) → ENQUÊTE (piste sonore, σ = 0,15/0,08/0,05·d) →
SUSPECT (≥ 60) → TIR_TEST (≥ 100 ; 140 si PV < 25) → TRAQUE. **Bots props** : cachette choisie au début de la cachette
parmi les CACHETTES ATTEIGNABLES (poses libres au rayon et dans la bande du type, sur le graphe des props au rayon 0,2 :
bouts de rangée, contre une table, contre un mur ; § 4.5.13), trajet sur ce graphe,
`score = 0,6·cred + 0,25·(1 − couverture) + 0,15·éloignement − 0,3 (déjà prise) − 0,4 (autre prop à < 3 m)`
(`couverture` = la part, de 0 à 1, des points d'observation de la pièce — nœuds des passages et du milieu, à 1,6 m — qui
voient la cachette ; `éloignement` = distance à pied au départ des chasseurs / 30 m, bornée à 1), Facile
parmi la meilleure moitié, Normal les 20 %, Difficile les 5 % ; vu en mouvement → figé après 0,5 / 0,25 / 0,1 s ; bouge
quand personne ne le voit et qu'il y a pression (chasseur à < 6 m qui approche, tir à < 4 m, bip, 70-110 s au même
endroit ; Facile ne bouge jamais après la cachette) ; touché sous 50 % : fuit 80 / 50 / 30 % du temps, sinon bluffe.
Jamais de bonus de vitesse.

### 3.10 Les budgets
| | PC (moyenne / haute) | Téléphone (`?tel=1`) |
|---|---|---|
| Bots par défaut / max | CPS 5, équipes 7, prop 4 / 9 (avertissement > 7) | 3 / 5 (avertissement > 3) |
| Avatars distincts | 6 (`assets/tel/`, ≈ 136 Mo GPU) | 3 (≈ 70 Mo) |
| Bots posés à chaque image | ceux à l'écran à < 18 m ; 1 image sur 3 à > 34 m ; 4 Hz cachés | 2 ; les autres 1 image sur 3 |
| Appels ajoutés typique / pire | ≈ 50 / ≤ 150 (7 bots 84 + arme 8 + effets ≤ 8 + props) | ≈ 30 / ≤ 80 |
| Pools d'effets | impacts 256, traceurs 32, douilles 64, éclairs 16, étincelles 128 | 96, 16, 24, 8, 48 |
| Processeur du gameplay (sim + poses + IA + balles + HUD + sons) | ≤ 2,5 ms par image en moyenne | ≤ 3 ms |
| `Partie.pas` complet | ≤ 0,5 ms avec 7 bots | ≤ 0,6 ms avec 3 bots |
| Voix sonores | 24 au plus | 12 |
| Préparation d'une partie | 1re ≤ 4 s, ensuite ≤ 1,5 s | 1re ≤ 10 s, ensuite ≤ 3 s |

Pourquoi ces seuils : le jeu est limité par les APPELS (≈ 20-35 µs de processeur chacun sous ANGLE sans contention) ;
départ en haute 881 appels ≈ 18-30 ms, en moyenne 486 ≈ 10-17 ms, au −1 en haute 342 ≈ 7-12 ms. D'où : **Moyenne** est le
socle du combat sur la Radeon 660M, **Haute** tient au −1 (le prop hunt par défaut). Leviers dans l'ordre : moins de
bots posés (cadence), ombres des bots coupées hors du niveau de la caméra, perception 5 Hz / décision 10 Hz, moins de
bots. `fx.calme = false` pendant `manche`/`traque` (une remontée de préréglage fige une image). **La glace de l'accueil
est PEINTE en partie** (`miroirAccueil.etat.coupe = true` par `MondePartie.entrer`, rendue par `sortir`) : son rendu
redessine le décor dès que la caméra a bougé de 25 cm (≈ 150 appels, 8-9 ms sur la 660M, une image sur deux), et une vue
FPS au sprint bouge de 11 cm par image — au cœur du combat (le hall, le point A, le chemin des SISR).

---------------------------------------------------------------------------------------------------------------------

## 4. L'ARCHITECTURE

### 4.1 Les règles de construction (valables pour TOUS les lots)
1. Français partout : identifiants, textes, commentaires, dans le style dense du code d'IRIS (en-tête de fichier qui dit
   le pourquoi, chiffres mesurés en commentaire, apartés entre parenthèses, dates).
2. **Un fichier = un propriétaire.** Un lot ne modifie que ses fichiers (§ 5.2). `tools/proprietaires.json` (socle) les
   liste ; `python -I tools/verifier_proprietaires.py lot/<clé>` refuse une branche qui touche un fichier hors de sa liste.
3. **Les signatures du socle sont figées.** Un lot peut AJOUTER des méthodes ou des champs ; en changer une existante
   passe par l'intégration (demande écrite dans le rapport du lot).
4. **Pureté de la simulation** (tout ce qu'appelle `Partie.pas`) : ni `Math.random()`, ni `performance.now()`, ni
   `Date.now()`, ni lecture d'`Input`, ni lecture d'os, de matrices d'affichage ou de la caméra. Hasard : `partie.rng`
   ou un `Rng` semé par `melanger(...)`. Temps : `partie.t` / `partie.tick`. Entrées : la commande. (Le décor, les couches,
   les effets et les sons gardent leur `Math.random`.)
5. Effets, sons, vibrations, HUD réagissent aux ÉVÉNEMENTS (`partie.sur(type, fn)`) et lisent l'état ; jamais un appel
   direct depuis la simulation. Les règles n'importent jamais un module d'affichage.
6. Tout objet ajouté à la scène en jeu : **enfant DIRECT de `game.scene`, `userData.dynamique = true`**
   (`ombre_cache.js:145-151`, `ombres_contact.js:200-208`, `kit_decor.js:160`), matériaux compilés sous l'écran de
   préparation (`Player.preparerRendu`, `game.js:186-211`). **Jamais de lumière ajoutée, retirée, cachée, ni de
   `castShadow` de LUMIÈRE changé** dans la scène de jeu.
7. Jamais de `THREE.Raycaster` sur la scène, jamais de `DecalGeometry`, jamais un matériau du décor modifié (partagés et
   dédupliqués : `material.clone()` d'abord).
8. Jamais une requête au monde solide dans le rappel d'une autre (`Collisions._parcourir` et `_tour` ne sont pas
   réentrants, `collisions.js:191`).
9. **Aucun lot ne modifie `js/ecole_soussol.js` ni `js/ecole_amphi.js`** (lot R en cours, autre agent).
10. Chaque lot travaille dans son arbre (`git worktree add ../IRIS_lots/<clé> -b lot/<clé> socle`, en vague 3 depuis
    `vague2`), sert son arbre sur SON port (`python serve.py <port>`, § 5.1), dans UN seul onglet ouvert seulement
    pendant qu'il tient un JETON du navigateur (§ 5.1, règle 3 : 3 pages de jeu au plus pour tous les agents), et ferme
    onglet et serveur à la fin. Les millisecondes mesurées pendant une vague sont RELATIVES (d'autres agents tournent) : un seuil de
    temps manqué de moins de 50 % est signalé, pas bloquant ; les budgets absolus se jugent à l'intégration, machine calme.
11. Le banc des lecteurs (`banc/{armer,accroupi,ragdoll,touches,bras_fps}.js` ; copie dans `docs/jeu/banc/` posée par
    le socle) est JETABLE : un lot qui en reprend du code le recopie dans son fichier dans son premier commit (rien n'importe
    `docs/`). Rien n'est importé de LA CAGE : on recopie et on taille (fins de ligne LF ; LA CAGE a des fichiers en CRLF).
12. Commits en français, préfixés de la clé du lot (`L-A : …`), avec les lignes d'attribution demandées.
13. **En partie, jamais** `game.wheel` (la roue des emotes), `hud.feedback` (il force une mise en page et fait vibrer la
    manette par `hoops-feedback`) ni `hud.hint` (l'aide de la balade) : la partie a sa roue, ses annonces et ses vibrations
    à elle (§§ 4.5.14, 4.5.15, 4.5.18).

### 4.2 Arborescence et propriétaires (tout est neuf sauf mention ; S0 pose le squelette de chaque fichier)

```
js/registre_meubles.js        L-K   MEUBLES, fermerRegistre(racine), rattraperRegistre(scene), zonerRegistre(lumieres), copieMeuble(cle)
js/jeu/index.js               S0    installerJeu(game, deps) : modes, menu au démarrage, affichage partagé, globales, harnais
js/jeu/constantes.js          S0    OEIL, TANGAGE_MAX, EQUIPES, NIVEAUX, niveauDe, BORNES_JEU, LIMITES, ZONES_JEU, VERSION_ETAT (figé)
js/jeu/rng.js                 S0    Rng (xorshift32 de LA CAGE net.js:224-238) + etat ; melanger(...) ; hacher(objet)
js/jeu/commande.js            S0    CHAMPS_COMMANDE, creerCommande, viderFronts, copierCommande, versTableau, depuisTableau
js/jeu/acteur.js              S0    class Acteur, class CorpsFixe (corps immobile : cibles du stand, corps fictif du menu)
js/jeu/partie.js              S0    class Partie (base) — vague 3 : L-Q (killcam, ajouts seulement)
js/jeu/partie_essai.js        S0    PartieEssai : Haythem armé (ou en meuble) + mannequins, sans règles
js/jeu/harnais.js             S0    window.__jeu (§ 4.10), tests sous ?test=1
js/jeu/tests/test_socle.js, tests/reference_balade.json                    S0
js/jeu/armes.js               L-A   ARMES, CLASSES, DOTATION_CHASSEUR, degatsDe, class Arsenal
js/jeu/balistique.js          L-A   class Balistique : vue, balle, tirer
js/jeu/touches.js             L-A   ZONES, capsules(acteur), rayonActeurs(...)
js/jeu/grenade.js             L-A   class Grenades
js/jeu/mouvement.js           L-B   ALLURES, appliquerCommande, hauteurOeil, vitesseSaut, separer, franchissable (écrite en entier par S0)
js/jeu/entrees_jeu.js         L-B   lireCommande(input, game, cmd, profil, partie)
js/jeu/vue_fps.js             L-B   class VueFPS — vague 3 : L-Q
js/jeu/camera_orbite.js       L-B   class CameraOrbite
js/jeu/modeles_armes.js       L-W   creerArme(id, { pourVue }), MATERIAUX_ARMES, REPERES
js/jeu/viewmodel.js           L-V   class Viewmodel (dont vitrine(id) pour l'armurerie) — vague 3 : L-Q
js/jeu/anim_vue.js            L-V   POSES_VUE, CHRONOS (pistes de la 1re personne), evaluer(...) — vague 3 : L-Q
js/jeu/avatars.js             L-C   FICHES_BOTS, preparerAvatars, creerCorps, libererCorps
js/jeu/teintes.js             L-C   teinteEquipe(player, equipe)
js/jeu/pose_arme.js           L-C   poserArme(acteur, dt), armeTroisieme(acteur)
js/jeu/accroupi.js            L-C   accroupir(player, k, bas)
js/jeu/poupee.js              L-C   class Poupee
js/jeu/cadence_acteurs.js     L-C   class CadenceActeurs
js/jeu/nav.js                 L-D   BORNES_NAV, VERSION_NAV, class Nav
js/jeu/nav_cache.js           L-D   lireNav(cle), ecrireNav(cle, donnees) (IndexedDB 'iris.nav')
js/jeu/pilotage.js            L-D   class Pilote, class Errant (cerveau d'essai qui va de zone en zone)
js/jeu/apparitions.js         L-D   POINTS_APPARITION, choisirApparition, departs
js/jeu/cerveau.js             S0 (minimal) → L-J (vague 3)   DIFFICULTES, class CerveauBase, class Cerveau
js/jeu/partie_fps.js          L-E   class PartieFPS (equipes, melee, domination) — vague 3 : L-P
js/jeu/partie_stand.js        L-E   class PartieStand
js/jeu/deguisements.js        L-K   preparerCatalogue, viserMeuble, deguiser, retirerProp, majProps, credibilite, cachettes, toucherPoses, candidatsMeubles…
js/jeu/corps_prop.js          L-K   class CorpsProp, deplacerProp(acteur, cmd, dt, partie)
js/jeu/partie_prop.js         L-F   REGLAGES_PROP, class PartieProp
js/jeu/sons_prop.js           L-F   PROVOCATIONS, class SonsProp
js/jeu/cerveau_prop.js        S0 (minimal) → L-O (vague 3)   DIFFICULTES_PROP, class CerveauChasseur, class CerveauCacheur
js/jeu/hud_jeu.js             L-G   class HudJeu — vague 3 : L-P
js/jeu/hud_prop.js            L-G   class HudProp, class RoueProvocations (le DESSIN de la roue ; la saisie est dans PartieProp)
js/jeu/tableau_scores.js      L-G   class TableauScores
js/jeu/minicarte.js           L-G   class MiniCarte
js/jeu/menus_jeu.js           L-U   class MenuJeu (accueil, réglages, préparation, fin, crédits, caméra du menu) — vague 3 : L-P
js/jeu/portraits.js           L-U   portrait(fiche) → URL d'une image PRÉCALCULÉE (assets/portraits/<id>.webp) ou null — aucun WebGL
js/jeu/effets.js              L-H   class Effets — vague 3 : L-Q
js/jeu/sons_jeu.js            L-H   class SonsJeu
js/jeu/assistance_visee.js    L-I   corriger(cmd, game, dt), facteurStick(game)
js/jeu/monde_partie.js        L-M   TABLE_PORTES_FPS, TABLE_PORTES_PROP, class MondePartie
js/jeu/killcam.js             L-Q   (vague 3)
js/jeu/profil.js, series.js, menu_progression.js, armes_au_sol.js        L-P (vague 3 ; simulation : series, armes_au_sol)
js/jeu/aff_progression.js     S0 (squelette) → L-P (vague 3)   AFFICHAGE de la progression : armes au sol, sentinelle, drone (abonné aux événements, lit l'état)
js/jeu/tests/test_<lot>.js    chaque lot le sien
css/jeu/hud.css (L-G) · css/jeu/menus.css (L-U) · css/jeu/tactile.css (L-I) · css/jeu/progression.css (L-P) — posés vides et liés par S0
tools/proprietaires.json, tools/verifier_proprietaires.py   S0
tools/portraits/{index.html,outil.js,ecrire.py}              L-U   l'outil qui rend les portraits une fois (moteur de portraits de LA CAGE recopié)
assets/tel/{gabriel,imad,marcantoine,koji,djafar,ethan}.glb   S0 (copiés tels quels de LA CAGE assets/tel/ ; L-C et L-U s'en servent)
assets/portraits/{haythem,gabriel,imad,marcantoine,koji,djafar,ethan}.webp   L-U (192 × 192, fond transparent)
docs/jeu/                     S0    spec_finale.md, conception_*.md, carte_*.md, critique.md, banc/*.js (copies figées)
docs/jeu/rapports/<clé>.md    chaque lot le sien (S0.md, L-A.md…, F2.md, INT.md), commité avec le lot
```
Dépendances : `game.js` n'importe RIEN de `js/jeu/` (`lancerPartie` reçoit la classe ; aucun cycle). `main.js` importe
`jeu/index.js`, qui importe tout statiquement (la liste de chargement les compte seule). Les tests sont importés
DYNAMIQUEMENT sous `?test=1` (hors liste de chargement, hors cache). Affichage (HUD, effets, sons, viewmodel, menus) →
abonnés aux événements et lecteurs de l'état ; règles → émettent. C'est la séparation hôte/client de demain.

### 4.3 La boucle, pas à pas

#### 4.3.1 `Game.frame(dt)` (`js/game.js:444-492`) après le socle
```
fx.debutImage()
body.en-jeu <- mode === 'lobby'                                            (inchangé)
input.scruter(game, dt)                                                    (inchangé : manette ; roue ouverte → le stick va à la roue, L-I)
                                                                           (setListener n'est PLUS ici : déplacé après updateCamera, prise S0)
wheelAte = updateEmoteInput(dt)                                            (garde : `|| this.partie`, l. 410)
pressed('pause') -> togglePause()                                          (inchangé ; boutons fournis par la partie)
if (!partie) pressed('phone') / pressed('camera')                         (l. 452-453)
si !paused : pas fixes 1/120 → this.update(FIXED_DT)                       (inchangé)
   └─ update(dt) : 1re ligne `if (this.partie) { this.partie.pas(dt); return; }`   (AVANT user.memoriser, l. 508)
interpoler() → partie ? partie.interpoler(a) : user.presenter(a)           (l. 502-505)
updateCamera(paused ? 0 : dt)                                              (l. 1006 : partie.camera / cameraMenu)
audio.setListener(camera.position, camera)                                 (déplacé de la l. 449 par S0 : l'auditeur suit la caméra DE CETTE image ; L-H lit l'orientation dans `camera`)
partie?.image(paused ? 0 : dt)                                             (nouveau, après updateCamera)
carte.maj(dt, partie ? partie.jeuCarte : mode === 'menu' ? carteMenu : this)   (l. 478 ; carteMenu = Object.create(game, { user: { value: corpsMenu } }))
weather, onTick, animate, ombres.update, préchauffe                        (inchangé)
fx.calme = !partie || partie.calme()                                       (l. 487)
fx.render(dt)                                                              (superpositions de l'arme dedans, § 4.4)
input.endFrame()                                                           (S0 : vieillissement 0,35 s, purge des codes non liés, molette relâchée)
```

#### 4.3.2 `Partie.pas(dt)` (120 Hz) — **l'ordre est un contrat** (socle ; les sous-classes surchargent `regles(dt)`)
```
1. tick++, t += dt ; pour chaque acteur actif : a.corps.memoriser()
2. COMMANDES   local    : viderFronts(a.cmd) ; lireCommande(game.input, game, a.cmd, this.profil, this)   (fronts consommés ICI)
                          (recul consommé : arsenal.prendreRecul → game.camPitch/camYaw, AVANT la copie du regard ;
                           assistance_visee.corriger est appelée DANS lireCommande ; partie.lireExtra(...) ensuite)
               bots     : a.cerveau.commande(dt, a.cmd)   (décision 20 Hz, perception 10 Hz, décalées par id)
               (plus tard) distants : la dernière commande reçue, rejouée
3. DÉPLACEMENT pour chaque acteur vivant non gelé : this.deplacer(a, dt)
               = a.prop ? deplacerProp(a, a.cmd, dt, this) (L-K) : appliquerCommande(a, a.cmd, dt, this) (L-B)
               (appliquerCommande finit par joueur.simuler(dt) : saut, minuteries — jamais la pose)
4. CONTACTS    separer(this.acteursVivants, collisions)                    (L-B : rayons ra + rb, poussées par C.deplacer, ≤ 0,05 m par pas)
5. PORTES      this.monde.majPortes(dt, this.acteurs)                      (L-M : portes 'auto' de la table)
6. ARMES       6a. pour chaque acteur vivant : a.arsenal?.pas(dt, a.cmd, this) → balistique.tirer → this.resoudreTir,
                   qui ÉMET 'impact' / 'frole' mais ne change AUCUNE vie : il DIFFÈRE ses effets (this.differer({ genre:
                   'degats' | 'faux' | 'soin', … })) ; couteau idem ;
               6b. this.appliquerEffets() : les effets du pas, dans l'ordre où ils ont été différés (this.appliquerEffet(e) :
                   base 'degats' → infliger ; PartieProp ajoute 'faux' et 'soin').
               Tous les tirs d'un pas partent donc des états D'AVANT les dégâts : deux tirs mortels au même pas tuent les
               deux tireurs (le tir d'un acteur tué pendant ce pas compte encore) ; aucun avantage à l'acteur 0.
7. PROJECTILES this.grenades.pas(dt)                                       (dégâts des explosions appliqués tout de suite)
8. RÈGLES      this.regles(dt)                                             (sous-classe : phases, régén., réapparitions, score, fin)
9. FOND        this.nav.pasFile()                                          (au plus UN calcul de chemin, 1 500 nœuds ouverts)
10. TEST       this.harnais?.surveiller(this)                              (?test=1 seulement)
```
Visé : ≤ 0,5 ms avec 7 bots sur PC (6 pas au plus par image : 3 ms au pire). Au-delà de 0,5 ms en moyenne sur 2 s, la
partie se dégrade d'elle-même (perception 5 Hz, décision 10 Hz) et le note dans `partie.degrade`.

#### 4.3.3 `Partie.image(dt)` (une fois par image, après `updateCamera`)
```
1. this.cadence.maj(this.acteurs, camera, this.imageN)    (L-C) → a.dessine, a.aPoser, a.ombre, a.poseDt
   (un acteur dont `dessine` PASSE à vrai est posé dans CETTE image, jamais une pose vieille de 0,25 s)
2. pour chaque acteur à poser : a.joueur.poser(a.poseDt, true) → Player.apresPose : accroupir puis poserArme (L-C)
   (le corps de l'acteur local en vue FPS n'est jamais posé ; il est caché)
3. poupées : a.poupee?.poser()                           (L-C, affichage seulement)
4. props   : majProps(this, dt)                          (L-K : racines, cap affiché, visibilité par zones, ombre, surbrillance)
5. this.majHud()                                         (base S0 : champs communs de this.hud ; les sous-classes ajoutent les leurs)
   affichage : this.aff.viewmodel.maj(dt, this.vue.etatArme()) ; this.aff.effets.maj(dt) ; this.aff.sons.maj(dt, camera) ;
               this.aff.hud.maj(dt, this.hud) ; this.aff.hudProp.maj(dt, this.hud) ; this.aff.tableau.maj(this, montre) ;
               this.aff.minicarte.maj(dt, this) ; this.aff.progression?.maj?.(dt)   (chaque module peut être absent : test `?.`)
6. this.monde.image(dt)                                  (L-M : rubalise, vantaux)
7. this.imageN++
```
L'interpolation (`interpoler`) a déjà posé `mesh.position = posAff` : la pose se fait APRÈS, sur la position affichée
(`Player.poser(dt, affiche = true)` ne réécrit pas le groupe, sinon le bot saute de 8 ms en 8 ms).

#### 4.3.4 `Partie.camera(dt, poser) → bool`
Acteur local vivant et humain (non prop) → `this.vue.poser(dt, poser)` (VueFPS) ; local prop → `this.orbite.viser(corps,
{ distance, hauteur })` + `poser` ; mort ou spectateur → caméra de mort (VueFPS, 3 s) puis `CameraOrbite` sur l'acteur
suivi ; chasseur pendant la cachette → caméra FIXE à son œil (le panneau de cachette masque la scène) ; `false` = la
caméra de la balade (ne doit jamais arriver en partie).

#### 4.3.5 Le calque « CLIQUE POUR JOUER » (socle)
`#calque-clic` (DOM créé par `index.js`, style dans `css/jeu/hud.css`) : « CLIQUE POUR JOUER » centré sur un voile à 40 %.
`Partie.attendreClic()` le montre et GÈLE la partie (`game.paused = true`, sans l'écran de pause) ; un clic dessus →
`capturer()` → capture accordée : calque caché, `game.paused = false`, `input.purger()` ; refusée : le calque reste. Le
bouton A / Start de la manette ou un toucher le cachent et relancent SANS capture. Il est demandé (a) au passage
présentation → décompte si `besoinCapture()` et que le pointeur n'est pas capturé ; (b) à la reprise d'une pause sans
capture (§ 2.9). **Jamais depuis la simulation** : le cas (a) est vu par `Partie.image` (affichage, une fois par image)
sur l'événement `phase` → `'decompte'` ; le décompte a pu avancer d'au plus une image (≤ 50 ms) avant le gel, sans
conséquence. **Sous `?test=1`**, `besoinCapture()` est FAUX (aucun test ne peut capturer le pointeur) sauf quand un test
simule la capture : `__jeu.simulerCapture('accordee' | 'refusee' | null)` (alors `besoinCapture()` est vrai et
`capturer()` rend la réponse simulée) — c'est ainsi que S0 (point 13) et L-B (point 15) testent le calque. `besoinCapture()` = `!entree.manette && !entree.tactile` (`entree`, exporté par `js/settings.js`, tenu
par `manette.js` et `touch.js` : la dernière entrée est le clavier ou la souris).

### 4.4 Les prises dans le code existant (TOUTES posées par le socle ; propriétaire ensuite entre crochets)

| Fichier : ligne (a8b22dd) | Prise | Ensuite |
|---|---|---|
| `js/game.js:215-216` (après `this.user`) | `this.partie = null; this.siegesTous = this.sieges.slice();` (au constructeur, `carte.maj` n'a pas encore refiltré : 346 sièges ; piège 9 du cœur) ; `this.cameraMenu = null; this.carteMenu = null;` | INT |
| `js/game.js:238` `_onClick` | en partie : `this.partie.capturer()` (le calque `#calque-clic` a son propre écouteur) ; hors partie : inchangé | INT |
| `js/game.js:239-240` `_onDown/_onUp` | `dragging` seulement `if (!this.partie)` (en FPS, le clic tire) | INT |
| `js/game.js:241-249` `_onMove` | 1re ligne : `if (this.partie?.roueOuverte?.()) { this.partie.mouvementSouris(e.movementX, e.movementY); return; }` (la souris capturée choisit dans la roue des provocations, la caméra ne bouge pas) ; puis `const [kx, ky] = this.partie ? this.partie.souris() : [0.0025 * c.sensitivity, 0.002 * c.sensitivity];` ; bornes `const [lo, hi] = this.bornesTangage();` au lieu de `-0.1, 0.9` ; en partie, `\|movementX\| > 400` ignoré | INT |
| `js/game.js:302-304` `applySettings` | `this.input.setBindings(s.bindings)` → `this.appliquerProfil()` (SANS purge : ce rappel tourne à chaque `settings.set`, y compris quand la qualité automatique change de préréglage en pleine manche — une purge y perdrait un saut, une recharge ou une grenade) ; l. 304 : `if (this.mode === 'lobby' && !this.partie) this.hud.setLobby();` | INT |
| `js/game.js:380-386` `enterLobby` | signature `enterLobby({ aide = true } = {})` ; avec `aide: false` : ni `hud.feedback(nom de la carte)`, ni `hud.hint(lobbyHint())`, `_aideT = 0`, `_aideMin = 0` (sinon l'aide de la balade reste plantée au milieu de l'écran pendant toute la partie : seul `update()` la fait baisser, et en partie il rend la main tout de suite) ; le reste inchangé | INT |
| `js/game.js:410` `updateEmoteInput` | garde `\|\| this.partie` (en partie, `game.wheel` n'est jamais ouverte ; la roue des provocations est à `PartieProp` et `HudProp`) | INT |
| `js/game.js:432-442` `togglePause` | en pause : boutons `this.partie ? this.partie.boutonsPause() : [...]`, la balade gagne « Modes de jeu » (→ `entrerMenu()`) ; à la reprise : `hideOverlay(); this.input.purger();` puis, en partie : si `this.partie.besoinCapture()` → `this.partie.capturer()` (le clic sur « Reprendre » est une activation) et, refusée ou reprise par Échap (pas une activation), `this.partie.attendreClic()` (§ 4.3.5) ; sinon (manette, doigt) reprise directe sans capture | INT |
| `js/game.js:449` | `this.audio.setListener(this.camera.position)` DÉPLACÉ juste après `updateCamera` (l. 475), en `this.audio.setListener(this.camera.position, this.camera)` (l'auditeur avait une image de retard sur un virage sec ; l'argument de plus est ignoré par l'`audio.js` d'aujourd'hui) | INT |
| `js/game.js:452-453` | `if (enJeu && !this.partie && …)` pour `phone` et `camera` | INT |
| `js/game.js:475` (après `updateCamera`) | `this.partie?.image(this.paused ? 0 : dt);` | INT |
| `js/game.js:478` | `this.carte.maj?.(this.paused ? 0 : dt, this.partie ? this.partie.jeuCarte : this.mode === 'menu' && this.carteMenu ? this.carteMenu : this);` (en `'menu'`, la carte vivante — spots, carte d'environnement, portes, niveau — suit le CORPS FICTIF du menu posé au sol sous la caméra du plan en cours, pas Haythem resté au départ) | INT |
| `js/game.js:487` | `this.fx.calme = !this.partie \|\| this.partie.calme();` | INT |
| `js/game.js:502-505` `interpoler` | `if (this.partie) this.partie.interpoler(a); else this.user.presenter(a);` | INT |
| `js/game.js:507-508` `update` | 1re ligne : `if (this.partie) { this.partie.pas(dt); return; }` | INT |
| `js/game.js:1006` (après `freeCam`) | `if (this.partie ? this.partie.camera(dt, poser) : this.mode === 'menu' && this.cameraMenu?.(dt, poser)) return;` | INT |
| `js/game.js` après 442 (nouvelles méthodes) | `bornesTangage()` → `this.partie ? this.partie.bornesTangage() : [-0.1, 0.9]` ; `entrerMenu()` (mode `'menu'`, HUD caché, pointeur libéré, `input.purger()`, événement `iris-menu`) ; `async lancerPartie(Classe, opts, progres)` (préparation, `this.partie = p`, `p.entrer()`, **`this.enterLobby({ aide: false })`**, **`appliquerProfil({ purger: true })`**, `body.classList.add('combat')`, événement `iris-partie` ; perte du pointeur en partie hors pause → `togglePause()`) ; `quitterPartie(vers = 'menu')` (`p.sortir()`, `partie = null`, `appliquerProfil({ purger: true })` (profil balade), `placerAuDepart()`, classe retirée, événement, puis `entrerMenu()` ou `enterLobby()`) ; **`appliquerProfil({ purger = false } = {})`** (`input.setBindings(settings.bindingsDe(p), settings.padBindingsDe(p)); input.sourisJeu = p !== 'balade'; if (purger) input.purger();`, `p = partie ? partie.profil : 'balade'` ; on ne vide les entrées qu'à l'entrée en partie, à la sortie et au changement de rôle) | INT |
| `js/player.js:53-62` chargeur | `def.discret` → un `GLTFLoader(new THREE.LoadingManager())` à part (les avatars des bots ne déclenchent pas `DefaultLoadingManager.onLoad`, qui recuit ombre du sol, carte d'environnement et cache d'ombre dans les 30 s après la construction, `kit_decor.js:441-452`) | L-C |
| `js/player.js:682` | `if (this.rang \|\| (moving && !this.airborne && !this.sansRangs && this._entrerRang(dir)))` | L-C |
| `js/player.js:686` | `sp *= this.sprintMul ?? 1.32` | L-C |
| `js/player.js:693-695` | en l'air : `if (!this.elanAir) sp *= 0.35` ; inertie `τ = this.airborne && this.elanAir ? 0.45 : (…comme aujourd'hui)` | L-C |
| `js/player.js:704` et `826` | `this.rayon ?? RAYON_JOUEUR` ; à l'appel de `C.deplacer` (l. 704), la bande `this.hautCorps, this.basCorps` passée en fin (`undefined` = les défauts de `collisions.js` : la balade ne change pas) | L-C |
| `js/player.js:721-723` | `if (this.capFixe)` : ni `faceWant = vitesse` ni `turnTo` (le cap vient de la commande : `setFacing(−sin lacet, −cos lacet)`) | L-C |
| `js/player.js:1068-1136` `update` | **découpe sans rien changer** : `update(dt) { this._annulerCouches(); this.simuler(dt); this.poser(dt, false, true); }` dans l'ORDRE EXACT d'aujourd'hui. `simuler(dt)` = saut (1072-1075), `landT` (1076), minuteries d'emote (1077-1082), virage vif (1084-1085), téléphone (1086-1093), assis (1099-1106 : il écrit `pos`), `this.ang = atan2(facing)` (1121). `poser(dt, affiche = false, dejaAnnule = false)` = annulation des couches (1070) sauf `dejaAnnule`, `animT/walkPhase` (1096-1098), pose, `_driveAnim`, fondu (1107-1120), `couches.dynamique`, `_poserSol`, groupe (1122-1136 ; avec `affiche = true` le groupe reste à `posAff/angAff`), couches des os, puis `this.apresPose?.(this, dt)` | L-C |
| `js/player.js` (nouveau) | `dispose()` : `disposed = true`, `scene.remove(mesh)`, `telMesh`, matériaux clonés (237-247), mélangeur arrêté, ET le bonhomme de secours que crée chaque `Player` (`player.js:187-227` : 5 matériaux, ≈ 20 géométries, jamais dessinés — `renderer.info` ne voit donc pas la fuite) | L-C |
| `js/couches.js:124` et `:328` | `(p.audible ?? (p.mesh.visible \|\| p.vuePremiere))` (en partie `audible = false` : les pas viennent de la simulation) | L-C |
| `js/couches.js:186-191` | `if (p.sansSouffle) this.veutSouffler = false` (un bot armé ne met pas les mains sur les genoux) | L-C |
| `js/input.js:15-37` | souris : `mousedown` → `presser('Souris:' + e.button)` SEULEMENT si `this.sourisJeu` (posé par `appliquerProfil`), `document.pointerLockElement` est le canvas AU MOMENT du `mousedown`, et plus de 150 ms se sont écoulées depuis la dernière capture (`this.tCapture`) — le clic qui capture ne tire donc jamais ; `mouseup` → `relacher` du même code s'il avait été pressé ; `wheel` → `presser('Molette:haut'\|'Molette:bas')` (mêmes conditions) ; `contextmenu` bloqué sur le canvas ; `mouseup`/`auxclick` des boutons 3 et 4 : `preventDefault()` (page précédente) ; `pointerlockchange` → `this.tCapture = performance.now()` si capturé, et `CustomEvent('iris-pointeur', { detail: { capture } })` ; horodatage des fronts (`Map code → t`) | INT |
| `js/input.js` (nouveau) | `purger()` : vide `pressedSet` et `releasedSet` (pas `downSet`) | INT |
| `js/input.js:77` `endFrame` | (1) retire des fronts tout code qu'aucune action liée ne porte (corrige l'emote fantôme) ; (2) oublie tout front plus vieux que 0,35 s ; (3) relâche les codes de molette. (Les chiffres 1-8 du prop hunt sont des ACTIONS, `provoc1`-`provoc8` : leurs fronts survivent aux images sans pas de simulation — ≈ 17 % des images à 144 Hz, la moitié à 240 Hz.) | INT |
| `js/settings.js:8-23` | `ACTIONS` **inchangé** ; à côté `export const ACTIONS_COMBAT = [...]`, `ACTIONS_PROP = [...]` (§ 4.8 : `ACTIONS_COMBAT` compte `sprintTact`, la 2e touche de sprint tactique ; `ACTIONS_PROP` compte `provoc1` à `provoc8`), chacune COMPLÈTE | INT |
| `js/settings.js:30-57` `DEFAULTS` | `controls.combat = { bindings, pad }`, `controls.prop = { bindings, pad }`, `controls.fps = { sens: 0.45, sensVisee: 1.0, champ: 90, viseeMaintenue: true, accroupiMaintenu: false, sprintAuto: false, aideVisee: true, tirAuto: TELEPHONE, reticule: '#ffffff', secousses: 1 }`, `game.demarrage: 'menu'`, `jeu: { combat: { mode: 'equipes', zone: 'ecole', allies: 3, ennemis: 4, difficulte: 'regulier', classe: 'assaut', avatars: [] }, prop: { zone: null /* calculée au lancement, § 3.9 */, manches: 6, acteurs: 5, difficulte: 'facile', premierRole: 'prop', chasseurSeul: false, aides: { discretion: true, oeil: true, voirSons: TELEPHONE } }, habillage: 'airsoft', fluidite: false }` | INT |
| `js/settings.js:88-119` `load` | répare chaque profil contre SA liste (deux emplacements, codes manette côté manette) ; `bind(id, slot, code, profil = 'balade')`, `bindPad(…, profil)` (dédoublonnage DANS le profil) ; `bindingsDe(profil)`, `padBindingsDe(profil)` | INT |
| `js/settings.js:173` `keyLabel`, `:189` `actionKey` | `Souris:0` « CLIC G », `Souris:2` « CLIC D », `Souris:1` « CLIC MOLETTE », `Souris:3/4` « SOURIS 4/5 », `Molette:haut/bas` « MOLETTE ↑/↓ » ; `actionKey(id, profil = window.__game?.partie?.profil)` | INT |
| `js/main.js:43` `onPhone` | `if (!game.paused && !game.partie && phone)` | INT |
| `js/main.js:59-65` (après le tactile) | `const jeu = installerJeu(game, { options, phone, touch: window.__touch, audio, ch });` | INT |
| `js/main.js:74` (`hoops-entree`) | `if (game.mode === 'lobby' && !game.partie) { … }` (sinon l'aide des touches de la balade revient en pleine partie à chaque bascule manette ↔ clavier) | INT |
| `js/main.js:79` | `window.__jeu` posé par le harnais (`index.js`) | INT |
| `js/main.js:84` `commencer` | `audio.init(); plein?.demande(); jeu.demarrer();` (menu ; balade si `?partie=balade` ou `game.demarrage === 'balade'` ; une partie si `?partie=<mode>`) | INT |
| `js/chargement.js:577` | `if (TRACE \|\| arg('test') === '1') go(null);` (les tests démarrent sans geste) | INT |
| `js/audio.js:18-27` `init` | `this.ctx = this.creerContexte ? this.creerContexte() : new AC();` et `if (this.ctx.state === 'suspended' && !(this.ctx instanceof OfflineAudioContext)) this.ctx.resume();` — sous `?test=1`, le harnais pose `audio.creerContexte = () => new OfflineAudioContext(2, 441000, 44100)` AVANT le démarrage (sans geste, un `AudioContext` resterait suspendu : `currentTime` à 0, `onended` jamais) | L-H |
| `js/collisions.js:213` `resoudre`, `:235` `deplacer`, `:278` `libre` | paramètres de fin `haut = HAUT_CORPS, bas = BAS_CORPS` (l. 59), passés de l'une à l'autre ; `const yb = pieds + bas, yh = pieds + haut` ; **valeurs par défaut = comportement d'aujourd'hui** | personne (lu) |
| `js/fx.js:618` (après `addPass(this.oeil)`) | `this.superpositions = []` + une passe `PasseSuperposee` (index 3, avant le bloom) qui dessine chaque `{ scene, camera }` avec `clear = false` et la profondeur effacée, `enabled` seulement si la liste n'est pas vide ; le chemin léger (sortie basse) l'a aussi ; chemin sans composer (`fx.js:2062`, `!this.enabled`) : après `renderer.render`, `autoClear = false; clearDepth(); render(...); autoClear = true` | L-H |
| `js/manette_menus.js:16-20` | `export function ajouterRacine(id, { retour, defaut, avant })` (insère dans `RACINES`, `RETOUR`, `DEFAUTS`) ; `retour` (340-344) : sur une racine qui a `data-retour-action`, « tape » cette action | L-I |
| `js/ecole_portes.js:65` (1re ligne de `fusionnerLocal`) | `fermerRegistre(g);` (+ import de `./registre_meubles.js`) : les meubles étiquetés d'un niveau sont copiés AVANT sa couture | L-M |
| `js/kit_decor.js:539` (1re ligne d'`optimiserDecor`) | `fermerRegistre(scene);` (+ import) | personne |
| `index.html:23` | quatre `<link rel="stylesheet">` : `css/jeu/hud.css`, `menus.css`, `tactile.css`, `progression.css` | INT |

Les prises « carte » (portes, ascenseur, visibilité, « jour » de l'escalier) ne sont PAS au socle : elles sont au lot L-M
(§ 5.3). `js/ecole_etage1.js` n'a pas besoin de prise pour les sièges (la copie du constructeur suffit).

### 4.5 Les contrats des modules (API exactes)

Conventions : positions MONDE en mètres ; angles en radians (degrés seulement dans les tables de données, nom suffixé
`Deg`) ; durées en secondes de partie ; identifiants d'acteurs = entiers ≥ 0 (Haythem = 0).

#### 4.5.1 `constantes.js` (S0, figé)
```js
export const PAS = 1 / 120;
export const OEIL = { debout: 1.62, accroupi: 1.08, glisse: 0.85, taille: 1.73 };     // × h / taille
export const TANGAGE_MAX = 1.48;
export const EQUIPES = { A: { id: 'A', nom: 'SISR', couleur: '#3d8bff' }, B: { id: 'B', nom: 'SLAM', couleur: '#ff8a1f' },
  props: { id: 'props', nom: 'PROPS', couleur: '#7ed957' }, chasseurs: { id: 'chasseurs', nom: 'CHASSEURS', couleur: '#ff5a4f' } };
export const NIVEAUX = [{ n: -1, sol: -3.06, bas: -3.5, haut: -0.22 }, { n: 0, sol: 0, bas: -0.22, haut: 3.3 },
  { n: 1, sol: 3.5, bas: 3.3, haut: 6.45 }, { n: 2, sol: 6.6, bas: 6.45, haut: 9.7 }];
export function niveauDe(y)                        // −1 | 0 | 1 | 2 (bandes de ecole_visibilite.js:52-56)
export const BORNES_JEU = { xMin: -3, xMax: 23, zMin: -24.5, zMax: 6 };
export const LIMITES = { pc: { bots: 9, conseil: 7, avatars: 6 }, tel: { bots: 5, conseil: 3, avatars: 3 } };
export const ZONES_JEU = {                         // § 3.8, § 3.9 ; `pieces` = id des 47 zones (carte_ecole.js:2345-2385)
  ecole:     { nom: 'Toute l’école', modes: ['combat'], pieces: '*', rue: true, departs: { A: [[15.0, 0, 3.5]], B: [[14.63, 6.6, -5.87], [4.63, 6.6, -7.87]] } },
  rdc_rue:   { nom: 'RDC + rue', modes: ['combat'], pieces: [...], rue: true, departs: { A: [[3.5, 0, 3.0]], B: [[5.38, 0, -15.12]] } },
  ss:        { nom: 'Le −1', modes: ['combat', 'prop'], pieces: ['pauseSS', 'salleSS', 'hallSS', 'couloirSS', 'passageSS', 'sasSS', 'palierSSE', 'escalierSS', 'escEstSS'],
               departs: { A: [[15.63, -3.06, -9.62]], B: [[1.38, -3.06, -10.87]], chasseurs: [[1.38, -3.06, -10.87]] } },
  etages:    { nom: 'Les étages', modes: ['combat'], pieces: [...], departs: { A: [[2.88, 3.5, -3.37]], B: [[4.63, 6.6, -7.87]] } },
  e2: { … modes: ['prop'] … }, e1: { … }, rdc: { … }, ecole_int: { … } };
export const VERSION_ETAT = 1;
```

#### 4.5.2 `commande.js` (S0, figé)
```js
// UNE COMMANDE par acteur et par pas : tout ce que la simulation a le droit de lire du dehors. Des nombres et des
// booléens : elle voyagera telle quelle (invité → hôte), 20 à 30 fois par seconde.
export const CHAMPS_COMMANDE = [
  'seq', 'ax', 'ay', 'amp', 'lacet', 'tangage',                                         // nombres
  'sprint', 'marche', 'accroupi', 'tir', 'visee', 'letale', 'interagir',                // TENUS
  'saut', 'sprintTact', 'recharger', 'armeSuiv', 'armePrec', 'armeN', 'couteau', 'tactique', 'serie',   // FRONTS combat
  'deguiser', 'verrou', 'figer', 'provoc', 'scanner' ];                                  // FRONTS prop hunt
export function creerCommande()        // tout à 0 / false ; armeN 0 (rien) | 1 | 2 ; serie 0 | 1-3 ; provoc −1 (rien) | 0-7 | 8 (la dernière)
export function viderFronts(c)         // remet les FRONTS à faux / 0 / −1 (au début de chaque lecture)
export function copierCommande(de, vers)
export function versTableau(c) → Array(27) ; export function depuisTableau(t, c) → c
```
`ax, ay` : axe RELATIF au lacet (x droite, y avant, comme `input.axis()`), `amp` 0..1 ; `letale` tenu = goupille tirée
(le relâcher lance) ; `lacet/tangage` : la visée VOULUE (recul et aide compris).

#### 4.5.3 `rng.js` (S0)
`class Rng` (xorshift32 de LA CAGE `net.js:224-238` : `seed(s)`, `next()`, `range(a, b)`, `int(n)`, `pick(arr)`) +
`get etat()` / `set etat(v)` ; `melanger(...entiers) → uint32` (graine dérivée : un tir = `melanger(graine, id, tirSeq)`) ;
`hacher(objet, precision = 1e-4) → string` (FNV-1a sur le JSON arrondi : l'empreinte des tests de déterminisme).

#### 4.5.4 `acteur.js` (S0)
```js
export class Acteur {
  constructor(partie, { id, nom, equipe = null, role = 'combattant', fiche = null, local = false, humain = false })
  id; nom; equipe; role;        // role : 'combattant' | 'prop' | 'chasseur' | 'cible'
  fiche; local; humain;         // local : piloté par CETTE machine (Haythem) ; humain : un vrai joueur
  joueur;                       // Player | null (capFixe, sansRangs, audible = false, sansSouffle, elanAir posés par creerCorps)
  corps;                        // ce qui bouge : joueur, CorpsProp (props) ou CorpsFixe (cibles) — pos, vel, posPrec, posAff,
                                //   solAff, jumpY, airborne, rayon, memoriser(), presenter(a)
  sprintLimite;                 // vrai : sprint à endurance, sans sprint tactique (chasseurs du prop hunt, § 3.9)
  cmd; cerveau;                 // creerCommande() ; Cerveau | CerveauChasseur | CerveauCacheur | null
  vie; vieMax; armure; vivant; mortT; reapparitionT; protegeT; gele; derniereTouche;   // { t, par, arme }
  arsenal;                      // Arsenal | null
  accroupi; glisse;             // 0..1 (simulés, posés par mouvement.js)
  jaugeTact; endurance;         // 0..1 et 0..100 (simulés, mouvement.js : sprint tactique ; sprint limité des chasseurs)
  prop;                         // null | { cle, T, racine (affichage), cap, fige, verrou, pv, changements, provocT, vitesseAff, rotAff }
  stats;                        // { elims, morts, tetes, assists, tirs, touches, score, degats, survie, provocs, rates }
  poupee;                       // Poupee | null (affichage)
  dessine; aPoser; poseDt; ombre;   // posés par CadenceActeurs (affichage)
  aff;                          // { bouche: {x,y,z}, arme3e: Group | null } — affichage seulement, jamais dans l'état
  get pos()                     // this.corps.pos
  oeil(out, affiche = false)    // pieds + hauteurOeil(this) (+ jumpY) ; posAff si affiche
  regard(out)                   // (−sin lacet·cos tangage, −sin tangage, −cos lacet·cos tangage) de la commande
  niveau()                      // niveauDe(pos.y + 0,5)
  changerCorps(corps)           // prop ↔ humain (Haythem garde son Player garé : visible = false, non simulé)
  mourir(t) ; reapparaitre(x, y, z, lacet, t)
  etat() ; appliquer(e)         // § 4.7
}
// Un corps qui ne bouge pas : les cibles du stand (role 'cible') et le corps FICTIF que suit la carte vivante au menu.
// (Partie.interpoler appelle corps.presenter(a) sur chaque acteur actif : une cible sans corps lèverait une exception.)
export class CorpsFixe {
  constructor(x = 0, y = 0, z = 0, cap = 0)
  pos; posPrec; posAff; vel /* (0, 0, 0) */; solAff; jumpY /* 0 */; airborne /* false */; ang; angAff; rayon /* 0,3 */
  placer(x, y, z, cap)          // pos = posPrec = posAff, solAff = y
  memoriser()                   // posPrec ← pos
  presenter(a)                  // posAff ← interpolation posPrec → pos (une cible qui se lève ou un corps de menu qui glisse)
}
```

#### 4.5.5 `partie.js` (S0) — la base de toutes les règles
```js
export class Partie {
  constructor(game, opts, deps)  // opts § 4.5.12/14 ; deps = { affichage (instances partagées de la session), harnais }
  static prerequis = { nav: true, navProps: false, avatars: true, catalogue: false }
  game; opts; deps; id;          // id : 'essai' | 'equipes' | 'melee' | 'domination' | 'stand' | 'prophunt'
  rng; graine; tick; t;
  phase; phaseT; phaseDuree;     // 'preparation' | 'presentation' | 'decompte' | 'manche' | 'mi_temps' | 'fin_manche' | 'fin'
                                 //   (+ 'cachette', 'traque', 'revelation' au prop hunt)
  acteurs; local; suivi;         // tableau ; l'acteur de Haythem ; l'acteur que suit la caméra
  zone; monde; nav; navProps; balistique; grenades; cadence; vue; orbite; aff;   // navProps : graphe des props (rayon 0,2) si prerequis.navProps
  hud;                           // l'état du HUD (§ 4.5.15), rempli par les règles
  degrade;                       // vrai si la perception est passée à 5 Hz
  get profil()                   // 'combat' | 'prop' selon le rôle de l'acteur local (change entre deux manches → game.appliquerProfil())
  async preparer(progres)        // progres(etape, f) : monde, graphe, avatars, catalogue (si prerequis), affichage, programmes
  entrer() ; sortir()            // monde.entrer/sortir, acteurs créés/détruits, abonnements de l'affichage, vue FPS
  pas(dt)                        // § 4.3.2 — NE PAS surcharger
  deplacer(a, dt)                // § 4.3.2 étape 3
  regles(dt)                     // la sous-classe
  interpoler(a)                  // corps.presenter(a) de chaque acteur actif (tout acteur a un corps : CorpsFixe pour les cibles)
  camera(dt, poser) → bool       // § 4.3.4
  image(dt)                      // § 4.3.3
  majHud()                       // à chaque image (§ 4.3.3 étape 5) : champs communs de this.hud depuis l'acteur local, dont
                                 //   `aveugle` ({ t, duree } depuis l'événement 'flash' de l'acteur local, sinon null) ;
                                 //   les sous-classes l'étendent (super.majHud() puis scores, points, cibles, prop…)
  calme() → bool                 // vrai hors 'manche' / 'traque'
  souris() → [kx, ky]            // rad/px ; visée comprise
  bornesTangage() → [lo, hi]     // [−1,48 ; 1,48] ; prop [−0,7 ; 1,25]
  capturer() → Promise<bool>     // pointeur (délégué à VueFPS) ; vrai si accordée
  besoinCapture() → bool         // !entree.manette && !entree.tactile (§ 4.3.5)
  attendreClic()                 // le calque « CLIQUE POUR JOUER » (§ 4.3.5)
  roueOuverte() → bool           // faux ; PartieProp : vrai pendant que la roue des provocations est tenue
  mouvementSouris(dx, dy)        // rien ; PartieProp : cumule le geste dans la roue (appelé par game._onMove, roue ouverte)
  mouvementStick(x, y)           // rien ; PartieProp : vecteur du stick droit (appelé par manette.js, roue ouverte)
  boutonsPause() → [{ label, cls, onClick }]
  get jeuCarte()                 // Object.create(game, { user: { value: corpsSuivi } })
  peutTirer(a) → bool            // faux pendant présentation, décompte, cachette (chasseurs), mort
  lireExtra(input, game, cmd)    // rien ; PartieProp : la roue des provocations (§ 4.5.14)
  resoudreTir(tireur, fiche, ox, oy, oz, dx, dy, dz, res, plomb)   // base : émet 'impact' / 'frole' et DIFFÈRE { genre: 'degats', … }
                                 //   (degatsDe) ; ne touche JAMAIS une vie (§ 4.3.2 étape 6) ; surchargé par PartieProp
  differer(effet)                // pousse { genre, … } (nombres et ids) dans la liste du pas
  appliquerEffets()              // § 4.3.2 étape 6b : appliquerEffet(e) pour chaque effet, dans l'ordre, puis vide la liste
  appliquerEffet(e)              // base : 'degats' → infliger(...) ; PartieProp ajoute 'faux' (pénalité) et 'soin'
  infliger(cible, degats, { par, arme, zone, x, y, z, dx, dy, dz, plomb }) // la SEULE porte des dégâts : protection, tir allié, armure, 'touche', 'elim', aides
  soigner(cible, pv, cause)
  signaler(equipe, idCible, x, y, z) ; signalements(equipe) → [{ id, x, y, z, t }]   // mémoire d'équipe des bots (et drone, vague 3)
  phaseVers(phase, duree)        // emet 'phase'
  annonce(texte, cls)            // emet 'annonce'
  ajouterActeur(def) → Acteur ; retirerActeur(a)
  evt(type, data)                // pousse { t, type, ...data } dans un anneau de 256, appelle les abonnés
  sur(type, fn) → desabonner     // '*' pour tout
  etat() → objet JSON ; appliquer(e) ; empreinte() → string
}
// partie_essai.js : export class PartieEssai extends Partie — opts { mannequins: [{x,y,z}], prop: false, classe }
// index.js        : export const MODES = { essai, equipes, melee, domination, stand, prophunt }
//                   export function installerJeu(game, deps) → { demarrer(), lancer(mode, opts), quitter(vers), menu, affichage }
```
`demarrer()` lit `?partie=` (`essai|equipes|melee|domination|stand|prophunt|balade`), `?graine=`, `?bots=`, `?diff=`,
`?zone=`, `?test=1`, `?rapport=1`, `?lot=` ; sinon `settings.game.demarrage`. L'affichage partagé (viewmodel, effets,
sons, HUD, tableau, mini-carte, menus) est créé UNE fois par session (à la 1re partie) et rebranché à chaque partie :
pools et programmes compilés une seule fois. Méthodes FACULTATIVES de l'affichage, appelées par le câblage avec `?.`
(§ 5.4 étape 4) et listées comme telles dans la table `SIGNATURES` du socle : `preparer(progres)` (Viewmodel, Effets,
SonsJeu, HudJeu, HudProp, MiniCarte), `brancher(partie)` / `debrancher()` (Effets, SonsJeu, SonsProp, HudJeu, HudProp,
Profil, Killcam, et `AffProgression` en vague 3).
`installerJeu` pose aussi le corps fictif du menu : `menu.corps = new CorpsFixe()` (placé à chaque image par
`MenuJeu.camera` au sol sous la caméra du plan en cours, `solEn`) et `game.carteMenu = Object.create(game, { user: {
value: menu.corps } })`.

#### 4.5.6 Armes, balistique, touches, grenades (L-A)
```js
// armes.js
export const ARMES = { fa24, pm9, fp12, tp50, p17, couteau, frag, flash };   // fiches : § 3.3-3.4 (le socle pose les données)
//   fiche : { id, nom, classe, emplacement, auto, rpm, degats: [[jusqu'à, dégâts]...], plombs, zones: { tete, cou, torse, ventre, jambes },
//             chargeur, reserve, ads, sprintTir, sprintTactTir, mobilite, zoom, recharge: { tact, vide, ajout, parCartouche? },
//             sortie, rangement, dispersion: {...}, recul: { v: [], h: [], boucle, alea, visee, accroupi, rappel, rappelT, piston, cabre, roulis },
//             bruit, son, portee }
export const CLASSES = { assaut, infiltration, defense, tireur };   // { principale, secondaire, letale: [id, n], tactique: [id, n] | null, couteau: true }
export const DOTATION_CHASSEUR = { principale: 'pm9', secondaire: 'fp12', letale: ['frag', 1], tactique: null, couteau: false };
export function degatsDe(fiche, distance, zone) → number
export class Arsenal {
  constructor(acteur, dotation, modificateurs = null)     // modificateurs : accessoires/atouts (vague 3), coefficients multiplicatifs
  pas(dt, cmd, partie)          // états 'pret' | 'tir' | 'recharge' | 'change' | 'sprint' | 'couteau' | 'lancer' | 'franchit' ; tirs → balistique.tirer → partie.resoudreTir
                                //   cadence : § 3.3 (`prochain = max(prochain, t − PAS) + 60/rpm`, un tir au plus par pas)
  prendreRecul(out) → out       // { v, h } en RADIANS : le recul de visée accumulé depuis le dernier appel (motif, boucle, aléa,
                                //   facteurs visée/accroupi, rappel), REMIS À ZÉRO ; lu par lireCommande (Haythem) ou le cerveau (§ 3.4)
  ajouterChargeur() → bool      // + fiche.chargeur à la réserve de l'arme principale, plafonné à fiche.reserve (élimination, § 3.5)
  get arme(); get emplacement(); get chargeur(); get reserve(); get etatArme(); get tEtat();
  get visee();                  // 0..1
  get dispersion();             // rad, demi-angle courant (réticule)
  get reculV(); get reculH();   // degrés, ressort VISUEL (arme de vue)
  get tirSeq(); get letales(); get tactiques();
  remplir() ; ramasser(idArme) → bool ; bloque   // bloque : cachette, mort
  etat() ; appliquer(e)
}
// balistique.js
export class Balistique {
  constructor(collisions)
  vue(ax, ay, az, bx, by, bz) → bool          // pré-filtre zonesCachees/zoneDe (2 µs ; sauté pour les paires de EXCEPTIONS_PREFILTRE), puis DDA (8 µs) ;
                                              //   vitres CLAIRES, `camera:false`, `off` ignorés ; une vitre `depoli` ARRÊTE la vue
  balle(ax, ay, az, dx, dy, dz, portee, out) → out   // { t, x, y, z, nx, ny, nz, mat: 'mur'|'vitre'|'meuble'|'sol'|'plafond'|'rien', forme, vitre }
  tirer(partie, tireur, ox, oy, oz, dx, dy, dz, portee, out) → out   // monde puis acteurs (rayonActeurs), le plus proche ; vitre (claire OU dépolie) = traverse (×0,8) ; { acteur, zone, t, x, y, z, nx, ny, nz, mat, forme, traverse }
}
export const EXCEPTIONS_PREFILTRE   // Set de paires de zones 'zoneA|zoneB' où le pré-filtre a menti (§ 3.7) : on y passe directement au DDA
// touches.js
export const ZONES = ['tete', 'cou', 'torse', 'ventre', 'jambes'];
export function capsules(acteur, out) → out   // 5 capsules depuis l'ÉTAT SIMULÉ ; prop → 1 boîte orientée (T.boite, cap) ; cible du stand → panneau
export function rayonActeurs(acteurs, ox, oy, oz, dx, dy, dz, tMax, sauf, out) → { acteur, zone, t } | null   // préfiltre cylindre 1,1 m
// grenade.js
export class Grenades { constructor(partie); lancer(acteur, type, mecheRestante); pas(dt); get liste(); etat(); appliquer(e) }
```
**Le DDA de `balle()`** (carte_monde § 6, étendu) : (1) garde le PLUS PROCHE impact (arrêt quand le meilleur t précède
la sortie de la case courante) ; (2) compte les formes `camera` ET `joueur` (les ≈ 75 formes `camera:false` — surtout le
mobilier de la rue, dont les jardinières, plus le « jour » de l'escalier, un portillon et deux formes du palier du −1,
carte_monde § 1.1 — arrêtent les balles) sauf `balle === false` et `off` ; (3) teste les 53 sols (dalles = plans bornés, rampes = plans inclinés) et le
plan `y = 0` là où aucun sol ne couvre (règle de `solEn`) ; (4) normale de la tranche d'entrée (recalcul local pour la
forme touchée : `_segment` ne la rend pas) ; (5) incrémente `C._tour` lui-même, jamais dans un rappel. Visé : ≤ 30 µs
médian à 30 m, ≤ 120 µs au 99e centile ; origine = l'ŒIL (jamais le bout du canon, qui peut être dans un mur).
**Capsules simulées** (pour h = 1,73, × h/1,73 ; accroupi k abaisse tout ce qui est au-dessus des hanches de 0,54·k ; glissade
idem à 0,77 ; + jumpY ; tête avancée de 0,04 + 0,02·v selon le cap — F2 : avance retirée, les corps armés de L-C ont la tête au-dessus des pieds) : tête sphère r 0,115 centrée à 1,635 · cou 1,42→1,55
r 0,06 · torse 1,12→1,42 r 0,165 · ventre 0,90→1,12 r 0,155 · jambes 0,10→0,90 r 0,13. Contrôle (L-A) : écart tête simulée /
os `Head` (+0,085 sur son Y) en course ≤ 6 cm en moyenne, ≤ 10 cm au 95e centile ; au-delà, L-C coupe le penché des
couches pour un acteur armé.

#### 4.5.7 Mouvement et caméras (L-B)
```js
// mouvement.js
export const ALLURES = { marche: 2.15, course: 5.0, sprint: 6.6, sprintTact: 7.8, visee: 2.4, accroupi: 2.3, accroupiVisee: 1.5 };
export function appliquerCommande(acteur, cmd, dt, partie)   // cap = setFacing(−sin lacet, −cos lacet) ; axe tourné de lacet ; allures ;
                                                             //   sprint tactique, glissade, saut borné, franchissement, accroupi ;
                                                             //   joueur.move ; joueur.simuler(dt) ; événements 'pas', 'saut', 'reception', 'glissade'
export function hauteurOeil(acteur) → number                 // au-dessus des pieds, sans jumpY
export function vitesseSaut(acteur) → number                 // 0 = pas de saut possible
export function separer(acteurs, collisions)                 // contacts entre corps (§ 3.1) : ra + rb, poussées par C.deplacer, ≤ 0,05 m par pas
export function franchissable(collisions, x, y, z, dx, dz) → { x, y, z, h } | null
                                                             // le critère du franchissement (§ 3.1) en fonction PURE, écrite en entier par le
                                                             //   socle : arrivée (x, y, z) et hauteur h de l'obstacle, ou null ; appelée par
                                                             //   appliquerCommande (L-B) ET par la génération des liens 'franchir' (L-D)
// entrees_jeu.js
export function lireCommande(input, game, cmd, profil, partie)   // le SEUL lecteur d'Input en partie : down() pour les tenus,
   // pressed() pour les fronts, axis()/amplitude(), double appui Maj OU front `sprintTact` → sprintTact (jamais si
   // acteur.sprintLimite), bascules (visée, accroupi), recul : arsenal.prendreRecul(r) puis game.camPitch −= r.v,
   // game.camYaw −= r.h ; lacet = game.camYaw, tangage = game.camPitch, seq++ ; puis assistance_visee.corriger(cmd, game, dt)
   // (qui réécrit game.camYaw/camPitch ET cmd.lacet/tangage)
// vue_fps.js
export class VueFPS {
  constructor(game)
  entrer(acteur) ; sortir()     // corps local caché à chaque image (mesh.visible = false, vuePremiere = false), superposition de l'arme, pointeur
  poser(dt, poser = false)      // § 3.2 ; écrit game.camera ; recul VISUEL seulement (15 % du cabré, signe du § 3.2) — jamais le recul de visée
  impulsion(dTangage, dLacet) ; secousse(amp, dur)
  mort(tueurId)                 // caméra de mort, 3 s
  etatArme() → { arme, etatArme, tEtat, visee, tirFront, reculV, reculH, sprint, sprintTact, glisse, vitesse, lacetV, tangageV, accroupi, enAir, mort }
  get champV(); capturer() → Promise
}
// camera_orbite.js
export class CameraOrbite {
  constructor(game)
  viser(cible /* corps | {x,y,z} */, { distance = 2.4, hauteur = 1.2, tangage: [lo, hi] })
  poser(dt, poser = false)      // lacet/tangage de la souris ; collision C.rayonLibre(r 0,15) ; sous plafondEn − 0,15 ; damp(14)
}
```
Chiffres du prop : pivot = `posAff + (0, max(0,5 ; 0,75 h), 0)`, recul `clamp(1,4 + 1,6·max(l, h, p), 2,0, 3,6)` m.
`VueFPS`, sur l'événement `flash` de l'acteur local : `fx.flash = 1` (appoint) ; l'aveuglement VISIBLE est le calque
`#voile-flash` de L-G, piloté par `partie.hud.aveugle` (§ 3.3).

#### 4.5.8 Modèles d'armes (L-W)
```js
export const MATERIAUX_ARMES   // acier 0x24272b (métal 0,85, rugosité 0,38) · polymère 0x2b2d30 (0 / 0,72) · teinte par arme (FA-24 terre 0x9a8665,
                               //   PM-9 noir, FP-12 vert 0x5b5f45, TP-50 sable, P-17 noir) · verre émissif (point rouge 0xff2a1a, toneMapped: false)
export const REPERES           // par arme, origine = prise de la main droite sur l'axe, −Z vers la bouche (m) :
  // fa24 : mainG (0, −0,025, −0,34) · bouche (0, 0,035, −0,64) · visee (0, 0,088, −0,08) · ejection (0,03, 0,05, −0,06) · crosse (0, 0,03, 0,20)
  // pm9  : mainG (0, −0,03, −0,24) · bouche (0, 0,03, −0,40) · visee (0, 0,075, −0,05) · ejection (0,03, 0,045, −0,05) · crosse (0, 0,03, 0,18)
  // fp12 : mainG (0, −0,03, −0,42) sur la pompe (course 9 cm) · bouche (0, 0,03, −0,78) · visee (0, 0,06, −0,70) · ejection (0,03, 0,04, −0,08) · crosse (0, 0,02, 0,22)
  // tp50 : mainG (0, −0,03, −0,36) · bouche (0, 0,03, −0,85) · visee (0, 0,075, −0,02) · ejection (0,03, 0,05, −0,05) · crosse (0, 0,03, 0,24)
  // p17  : mainG (−0,02, −0,04, 0,01) (deux mains) · bouche (0, 0,035, −0,13) · visee (0, 0,058, 0,04) · ejection (0,015, 0,04, −0,03)
  // couteau, frag, flash : mainD seule (anneau de goupille pour mainG)
export function creerArme(id, { pourVue = false } = {}) → THREE.Group
  // userData.reperes = REPERES[id] (Object3D posés) ; userData.os = { chargeur, culasse, glissiere, pompe, detente, goupille } (pourVue)
  // pourVue : SkinnedMesh rigides cousus par matériau (≤ 6 appels) ; sinon : une géométrie par matériau, sans os (3e personne, bots)
```
Pièces (CoD § 6.2) : FA-24 boîtier, garde-main à rails, canon + cache-flamme, crosse extrudée, poignée inclinée 18°,
chargeur courbe, point rouge ; PM-9 compact, crosse en fil, chargeur droit ; FP-12 tube magasin, pompe, guidon perle ;
TP-50 canon long, lunette r 0,022 × 0,32, culasse à levier (60° puis 8 cm), bipied replié ; P-17 glissière (recul 3 cm),
cran et guidon à points blancs ; couteau (lame extrudée biseautée) ; frag (sphère quadrillée + cuillère + anneau) ;
flash (cylindre à trous). Aucun fichier, aucune marque.

#### 4.5.9 Arme de vue (L-V)
```js
// viewmodel.js
export class Viewmodel {
  constructor(game)             // scène + PerspectiveCamera(52° vertical, near 0,01, far 5) à elle ; environment À ELLE (ci-dessous)
  async preparer(progres)       // bras coupés dans haythem.glb (banc/bras_fps.js), armes pourVue, carte d'environnement de studio, programmes compilés (game._compilerAsync)
  get superposition() → { scene, camera }   // poussée dans fx.superpositions par VueFPS.entrer
  montrer(idArme) ; cacher()
  maj(dt, etat)                 // etat = VueFPS.etatArme() ; poses, ressorts, pistes ; ne commande JAMAIS une règle
  vitrine(idArme | null)        // l'armurerie (vague 3) : l'arme seule, sans bras, qui tourne (0,6 rad/s) devant la caméra de l'arme ;
                                //   pousse SA superposition dans fx.superpositions tant qu'elle est montrée (aussi au menu), null la retire ;
                                //   aucune lumière ajoutée (ce sont les 3 lumières constantes de la scène de l'arme)
}
// anim_vue.js
export const POSES_VUE = { hanche, visee, sprint, sprintTact, glisse, franchit };   // repère caméra (m, rad), CoD § 6.4
export const CHRONOS = { fa24: { rechargeTact, rechargeVide, sortie, rangement }, …, couteau, grenade, inspection };   // pistes à clés
export function evaluer(piste, t, out) → out   // Hermite
```
Bras : coupés dans `haythem.glb` (triangles dont les 3 sommets sont à > 50 % sur `/^(Left|Right)(Arm|ForeArm|Hand)/`,
sur `avaturn_body` ET `avaturn_look`, géométrie COPIÉE), **ancres d'épaule posées par nous hors du cône de vue** (≥ 4°
sous le bord bas de la caméra de l'arme, à ≤ 0,45 m des prises dans toutes les poses ; départ D (0,20 ; −0,26 ; −0,05),
G (−0,02 ; −0,25 ; −0,30) en repère caméra), `ikBras` + `plierDoigts` sur les prises (poignée, garde-main, pompe, deux
mains, couteau, grenade, chargeur). Poses (repère caméra) : hanche (0,135 ; −0,125 ; −0,32) rot (0 ; 0,035 ; 0) ; visée :
le repère `visee` sur l'axe à 0,24 m (F2 : le FP-12 par son `oeilleton`) ; sprint (F2 : (0,10 ; −0,14 ; −0,30) rot (−0,30 ; 0,65 ; 0,35), proposée par L-V — l'ancienne (0,06 ; −0,19 ; −0,25) rot (−0,55 ; 0,65 ; 0,35) sortait l'arme du champ) ; sprint tactique (0,10 ;
−0,10 ; −0,30) rot (0,9 ; 0,2 ; −0,4) ; glissade hanche + (−0,02 ; −0,03 ; 0), roulis −0,25 ; franchissement (0,12 ; −0,22 ;
−0,22) rot (−0,3 ; 0,4 ; 0,45). Ressorts : inertie du regard (−0,0016 × vitesse angulaire, ±3°, ω 18, ζ 0,8), balancement en
huit (12 mm à f/2, 8 mm à f ; sprint ×2,5 ; visée ×0,1), pas chassé 3°, réception −2,5 cm, recul (§ 3.4), respiration
(±1,5 mm à 0,25 Hz). Chronologies : FA-24 recharge tactique 1,90 s (0-0,25 arme roulée 25° et cabrée 15° · 0,25-0,50 main
gauche au chargeur · 0,50 « clic » · 0,55 le chargeur part · 0,95-1,25 chargeur neuf · **1,35 « clac », balles entrées** ·
1,35-1,60 tape · 1,60-1,90 retour), à vide 2,45 s (+ arrêtoir à 2,05) ; FP-12 0,42 s par cartouche ; TP-50 culasse 0,25 s
après le coup ; changement d'arme (descente 0,25 m + 0,6 rad, ressort ω 20, ζ 0,6) ; couteau (0,10 / 0,18 / 0,32 s) ;
grenade (0,15 / goupille / tenue / lancer 0,35 / remontée 0,25). Les temps d'insertion viennent de la FICHE (l'animation
lit l'état de l'Arsenal, jamais l'inverse). Lumières de la scène de l'arme : une `HemisphereLight`, une
`DirectionalLight` clé (intensité par zone, lissée 0,4 s, couloirs sombres et −1 : 0,55), une `PointLight` de bouche
(intensité 0 hors éclair) — **nombre constant**, compilées sous la préparation. Pas d'ombre, pas `dynamique`.
**Carte d'environnement À ELLE, FIXE** : un PMREM de studio fait UNE fois à la préparation (`PMREMGenerator.fromScene(new
RoomEnvironment(), 0.04)`, `three/addons/environments/RoomEnvironment.js`), jamais celle de la scène de jeu — celle-ci
change ou passe à `null` selon la qualité (`fx.js:1270`, `1353`, `1392-1407`) et sa présence entre dans la clé des
programmes : l'arme recompilerait (image figée) ou garderait une texture libérée. Son intensité
(`scene.environmentIntensity`) suit celle de la lumière clé par zone. Les
miroirs ne montrent pas le joueur en FPS : accepté. Lunette du TP-50 : à 85 % de l'ADS, `cacher()`, le HUD pose le masque.

#### 4.5.10 Corps des acteurs (L-C)
```js
// avatars.js
export const FICHES_BOTS = [ /* gabriel 1,79/1,865, imad 1,89/1,864, marcantoine 1,83/1,861 (gabarit A), koji 1,75/1,888,
                                djafar 1,65/1,886 (B), ethan 1,85/1,88 (C) — js/roster.js de LA CAGE ; model 'assets/tel/<id>.glb' même sur PC */ ];
export async function preparerAvatars(game, ids, progres)   // un avatar par gabarit d'abord ; chargeur discret ; attend programmes + clips
export function creerCorps(fiche, scene, { equipe }) → Player   // capFixe, sansRangs, audible = false, sansSouffle, elanAir, cibleRegard = null
export function libererCorps(player)                        // player.dispose() (bonhomme de secours compris)
// teintes.js — export function teinteEquipe(player, equipe)  // tenue teintée à 60 % (appliquerFit de LA CAGE fit.js:403-437) + brassard LARGE
//                                                            //   (8 cm) aux DEUX bras, enfants des os d'épaule, couleur pleine de l'équipe
// pose_arme.js — export function poserArme(acteur, dt) ; export function armeTroisieme(acteur) → Group (racine de scène, dynamique) ; écrit acteur.aff.bouche
// accroupi.js — export function accroupir(player, k, bas = 0.42)
// poupee.js — export class Poupee { constructor(player, impulsion, point, collisions); pas(dt); poser(); get calme() }
// cadence_acteurs.js — export class CadenceActeurs { maj(acteurs, camera, imageN) }
```
`Player.apresPose = (p, dt) => { accroupir(p, acteur.accroupi); poserArme(acteur, dt); }` — pose UNE fois par image
(`AvatarRig.ajouter` est relatif : deux appels sans clip entre eux vissent le buste, piège 1 des persos). Cadence :
chaque image à < 18 m et à l'écran, 1 sur 3 au-delà de 34 m, 4 Hz caché ; dessiné = `!(zonesCachees(cam) & zoneDe(x,
−z, y + 1))` et dans le cadre (sphère 1 m) ; **un acteur dont `dessine` passe à vrai est posé DANS CETTE IMAGE** (sinon
un bot caché, posé à 4 Hz, reparaît dans une pose vieille de 0,25 s) ; `castShadow` = même niveau que la caméra ; au
téléphone 2 bots pleins, les autres 1 image sur 3 (`AVATARS_PLEINS` de LA CAGE `presence.js:76`). Réapparition = le même
`Player` remis (`anim.couper()` PUIS `animKey = null`, piège 2 des persos). Mort : Poupée Verlet (`banc/ragdoll.js` +
murs : `resoudre` sur Hips/Spine2/Head), 4 s, enfoncement, disparition ; habillage Airsoft (défaut) : poupée 1,5 s puis
effacement 0,6 s.

#### 4.5.11 Navigation, pilotage, apparitions (L-D) ; cerveau (S0 minimal → L-J)
```js
// nav.js
export const BORNES_NAV = { xMin: -3, xMax: 23, zMin: -24.5, zMax: 6 };
export const VERSION_NAV = 1;
export class Nav {
  static async obtenir(game, { pas = 0.25, rayon = 0.3, franchir = true, bornes = BORNES_NAV, progres }) → Nav   // cache sinon génération
                                // DEUX graphes, chacun en cache sous SA clé (le rayon et `franchir` entrent dans l'empreinte) :
                                //   celui des humains (rayon 0,3, liens 'franchir') — combat et chasseurs ;
                                //   celui des PROPS (rayon 0,2, franchir: false), demandé par PartieProp seulement — trajets des
                                //   props bots et cachettes atteignables (carte_monde § 10.1)
  nb; px; pz; ph;               // Float32Array
  zone;                         // Uint8Array : index dans la liste des 47 zones (lumieres.zoneEn(x, z, h + 0,1))
  niveau;                       // Int8Array : −1, 0, 1, 2 ; 3 = rue
  degage;                       // Float32Array : rayon libre (0,5 / 0,75 / 1 / 1,5 / 2)
  debut; liens; cout;           // CSR : Int32Array, Int32Array, Float32Array
  typeLien;                     // Uint8Array parallèle à `liens` : 0 marche, 1 'franchir' (coût = 2 × la distance)
  empreinte;                    // string
  restreindre(masque /* Uint8Array nb, 1 = permis */)   // la zone de jeu (§ 4.5.19)
  noeudPres(x, y, z, rayonMax = 1.5) → id | -1
  chemin(de, a, out) → bool                 // A* d'un bloc (outils, tests) ; distances en Float64Array
  demander(cle, de, a, rappel)              // A* FRACTIONNABLE en file : 1 calcul par pas, 1 500 nœuds ouverts par tranche
  pasFile()
  champDepuis(id) → Float64Array            // Dijkstra complet (15 ms), en cache par point d'apparition
  aleatoireDans(zoneId, rng) → id ; couverts(x, y, z, menaces, rng, n) → [id]
  distancePied(a, b) → m
}
// nav_cache.js — lireNav(cle) → Promise<objet | null> ; ecrireNav(cle, donnees) → Promise   (IndexedDB 'iris.nav', try/catch)
// pilotage.js
export class Pilote { constructor(acteur, nav, balistique); allerA(x, y, z, { sprint, arret = 0.3, marge = 0.3 }); stop(); pas(dt, cmd); get arrive(); get coince() }
export class Errant { constructor(acteur, partie, { vers } = {}); commande(dt, cmd) }   // de zone en zone (verifierBots) ;
                                //   `vers(acteur) → {x,y,z} | null` : une destination préférée (le cerveau minimal y met le point chaud)
// apparitions.js
export const POINTS_APPARITION   // les 20 points de carte_monde § 8 (zone, x, y, z, dégagement)
export function departs(zoneJeu, equipe, n, rng) → [{ x, y, z, lacet }]   // espacés de 1,5 m, ramenés aux nœuds
export function choisirApparition(partie, acteur) → { x, y, z, lacet }     // § 3.8
export function ramenerPoint(nav, x, y, z, { rayonMax = 3, degageMin = 1.5 }) → { x, y, z } | null   // les anneaux de domination (§ 2.5)
// cerveau.js (S0 : minimal, § 3.7 — Errant vers le point chaud tant qu'il ne perçoit rien ; perçoit par balistique.vue, cône 60°,
//   50 m, jauge de repérage puis réaction de sa difficulté ; vise avec l'erreur gaussienne σ∞ et la rotation bornée ;
//   rafales de 3-5 balles, 0,6 s de pause ; compense le recul selon sa difficulté ; recharge à vide)
export const DIFFICULTES = { recrue, regulier, aguerri, veteran };   // § 3.7 (tRepérage ET reaction, deux champs)
export class CerveauBase {
  constructor(acteur, partie, diff)
  commande(dt, cmd)             // cadences § 3.7 ; écrit TOUTE la commande
  percevoir() ; penser()        // remplissent this.vus, this.indices ; choisissent this.etat
  viserVers(x, y, z, dt)        // modèle d'erreur de la difficulté, rotation bornée → cmd.lacet/tangage
  allerA(x, y, z, opts)         // this.pilote
  entendre(evt)                 // abonné : 'tir', 'pas', 'explosion', 'frole', 'touche', 'provocation', 'frottement', 'deguise'
  get etat()
}
export class Cerveau extends CerveauBase { }   // combat (vague 3 : L-J)
```
Génération (carte_monde § 7, méthode B) : représentant = centre de case poussé hors des formes par `C.resoudre`, gardé
s'il reste dans la case et `libre` ; lien vers chacune des 8 voisines si `C.deplacer` y mène à 3 cm près ; un nœud par case
ET par sol (clé case + hauteur au demi-mètre) ; descente > 0,6 m = pas de lien ; remplissage DEPUIS DES GRAINES (le départ +
les 20 points) ; formes `mobile` éteintes (portes auto ouvertes) et formes `limite` éteintes pendant la génération ;
les boîtes des VANTAUX OUVERTS du combat (§ 4.5.19) ALLUMÉES pendant la génération (le graphe les contourne : il sert à
tous les modes, et en prop hunt elles sont éteintes, ce qui ne fait que l'élargir) ; cabine d'ascenseur exclue (plan
x > 17,95, y 7,7-9,05). **8 956 nœuds, 60 146 liens, une composante** attendus (graphe des humains, avant les liens
« franchir »). **Liens « franchir »** (graphe des humains seulement) : pour chaque nœud et chacune des 8 directions où le
lien de marche échoue, `franchissable(C, x, y, z, dx, dz)` ; s'il rend une arrivée, lien vers le nœud le plus proche à
≤ 0,3 m de l'arrivée, `typeLien = 1`, coût = 2 × la distance. Le `Pilote`, sur un lien 'franchir', s'aligne (< 15°) et
envoie le front `saut` à ≤ 0,6 m de l'obstacle.
Empreinte = `hacher([C.formes sans limite, C.sols.length, C.plafonds.length, Σ arrondi(coordonnées), pas, rayon, bornes,
VERSION_NAV])` ; `?nav=refaire` force. Pilotage (LA CAGE `ai.js:88-107`) : arrivée avec hystérésis, cap = la COMMANDE (le
cerveau vise, le pilote donne l'axe relatif au lacet : un bot qui vise court en pas chassés), ficelle tirée par BALAYAGE
`C.deplacer` jusqu'à 12 nœuds plus loin toutes les 0,25 s (jamais des `libre()` échantillonnés : 6/60 bloqués) ;
évitement à 0,6 m ; **face-à-face dans un passage étroit** (deux bots à < 1 m qui avancent l'un vers l'autre, produit
de leurs directions < −0,5, sur des nœuds de dégagement < 0,6 m — la volée de tôle fait 0,85 m) : celui de plus petit
`id` recule vers le nœud le plus proche de dégagement ≥ 0,75 m, attend que l'autre soit passé (≥ 1,2 m), puis reprend ;
coincé = < 0,6 m en 3 s → replanification, lien pénalisé ×10 pendant 10 s ; 2e coincement → téléportation au dernier
nœud sûr SEULEMENT hors de la vue du joueur local (comptée par le harnais).

#### 4.5.12 Règles du combat et stand (L-E)
```js
export class PartieFPS extends Partie {   // opts : { mode: 'equipes'|'melee'|'domination', zone, allies, ennemis, difficulte, duree, scoreCible, classe, avatars, graine, humain = true }
  regles(dt)                              // présentation 3 s → décompte 3 s → manche → (mi-temps 5 s) → fin ; régénération ; réapparitions ; score ; domination
}
export class PartieStand extends Partie { // opts : { defi: 'vingt'|'tetes'|'recul'|'reflexes' } ; cibles = acteurs role 'cible' (panneaux), corps = CorpsFixe ; records localStorage 'iris.stand.v1' (try/catch)
}
export const STAND = { ligne: { x, y, z, lacet }, couloirs: [{ x, z }], cibles: [{ x, y, z, cap, distance }] }   // coordonnées EXACTES, mesurées par L-E (§ 2.6)
```
L'état visuel des anneaux de domination et des cibles du stand passe par `partie.hud.points` / `partie.hud.cibles` :
L-H les dessine (les règles ne créent aucun maillage). Les centres des anneaux sont ramenés à la préparation par
`ramenerPoint(nav, …)` (§ 2.5). À chaque élimination, `PartieFPS` appelle `tireur.arsenal.ajouterChargeur()` (§ 3.5).

#### 4.5.13 Registre, déguisements, corps des props (L-K)
```js
// registre_meubles.js — LES MEUBLES DE L'ÉCOLE, copiés avant la couture du décor
export const MEUBLES = { types: Map /* cle → T */, poses: [] /* P */, parZone: Map, grille: Map, parForme: Map /* forme du monde solide → P.i */ };
//   étiquette lue : objet.userData.meuble = 'type' | { type, nom, formes?, variante?, mural?, surPlace?, deguisable?, voile? } (posée par la carte ;
//   `voile: false` = le meuble porte DÉJÀ son voile au sol, copié avec lui — chaise coque, ecole_mobilier.js:122-123 — : pas de 2e voile ;
//   le −1 par le lot R, qui pose { type, nom, formes } : `formes` = les formes de C.ajouter* du meuble, rangées dans parForme)
//   T = { cle, type, variante, nom, proto (Group : géométries et matériaux PARTAGÉS), boite (Box3 locale sans les transparents), taille,
//         rayon, haut, volume, pv, vitesse, mural, surPlace, deguisable }
//   P = { i, cle, x, y, z, cap, zone, cx, cz, hx, hz, y0, y1, c, s }   (boîte orientée MONDE : lue sur matrixWorld après
//         updateMatrixWorld(true) — les meubles du lot R vivent dans un groupe décalé, `gMeubles.position.z = −dySol`)
//   DEGUISABLE_PAR_TYPE : table du registre (le lot R n'écrit pas `deguisable`) ; comptoir, tablette-bar, étagère, table
//         longue… = non ; et tout type dont le disque dépasserait 0,5 m
export function fermerRegistre(racine)       // RACINE COMPRISE, chaque objet étiqueté pas encore vu (WeakSet) ; appelé par fusionnerLocal et optimiserDecor :
//   - objet étiqueté ≠ racine (meuble pris dans un bloc qu'on va coudre) → clone(true) TOUT DE SUITE, avant la couture ;
//   - objet étiqueté = racine (meuble cousu SEUL dans son repère, cas du lot R : `for (const g of _meubles) fusionnerLocal(g)`)
//     → il reste un objet à lui après la couture : on garde la RÉFÉRENCE et on le copie plus tard (rattraperRegistre), déjà
//     cousu (2-3 appels par copie au lieu de 15-40)
export function rattraperRegistre(scene)     // à la préparation : copie les références gardées (meubles cousus seuls) et les étiquetés jamais
                                             //   passés par une couture (groupes `nofuse`) ; rien n'est copié deux fois (WeakSet)
export function zonerRegistre(lumieres)      // P.zone par lumieres.zoneEn ; parZone ; grille de 2 m
export function copieMeuble(cle) → Group     // userData.meuble = cle, userData.dynamique = true
//   variante absente → dérivée de la signature du sous-arbre (nombre de maillages + matériaux + boîte arrondie au cm) :
//   deux formes différentes sous le même `type` ne partagent jamais un prototype
// deguisements.js
export async function preparerCatalogue(game, progres) → Map   // rattraper + zoner + Player.preparerRendu de chaque prototype (tampons renvoyés)
export function typesDeguisables(zoneJeu) → [cle]              // sans les types qui ont des exemplaires NON étiquetés dans la zone
export function viserMeuble(partie, acteur, lacet, tangage) → { cle, pose? , acteur? } | null   // rayon depuis le PIVOT du prop (pas la caméra : l'hôte le refait), DDA de MEUBLES.grille, < 3 m du prop, ligne libre
export function deguiser(partie, acteur, cle) → bool             // refusé sans la place (C.libre au rayon/bande) ; 'deguise' ; PV en proportion
export function retirerProp(partie, acteur)
export function majProps(partie, dt)                             // affichage : racine = posAff/cap affiché, visibilité par zones, ombre au niveau de la caméra, voile (sauf `voile: false`), surbrillance, tressaillement
export function credibilite(cle, x, y, z, cap, zone, { contreMur = false } = {}) → 0..1   // prop § 9.4 ; même formule pour bots et jauge DISCRÉTION
export function pasRangee(pose) → m ; export function distPassage(x, y, z) → m
export function* cachettes(zoneJeu, navProps) → générateur de lots ≤ 5 ms ; résultat [{ cle, x, y, z, cap, zone, cred, couverture }]
                                             //   SEULEMENT des poses LIBRES (C.libre au rayon du type, dans sa bande), ATTEIGNABLES
                                             //   (nœud du graphe des PROPS à ≤ 0,6 m, dans la composante de la zone) : bouts de rangée,
                                             //   contre une table, contre un mur — jamais « dans » une collision groupée
export function candidatsMeubles(partie, x, y, z, rayon, out) → out   // [{ x, y, z, cap, cle, ref }] : vraies poses ET props vivants
                                             //   à ≤ rayon, MÊLÉS et SANS MARQUE (`ref` opaque) — la seule porte par laquelle un
                                             //   cerveau de chasseur voit des meubles (il ne lit jamais `role` ni `prop` d'un acteur)
export function toucherPoses(ox, oy, oz, dx, dy, dz, tMax) → { pose, t } | null   // ≤ 6 µs ; si `balle().forme` est dans
                                             //   MEUBLES.parForme, la pose est celle-là (exact, sans boîte) ; sinon boîtes orientées de la grille
// corps_prop.js
export class CorpsProp {
  constructor(collisions, { rayon, haut, bas, bounds })
  pos; vel; posPrec; posAff; solAff; jumpY; jumpVel; airborne; ang; angPrec; angAff; speedNow; endurance; bounds; rayon; haut; bas
  memoriser() ; presenter(a) ; bouger(dir, vitesse, dt) → metresParcourus ; sauter(v) ; plaquer(collisions) → bool ; dispose()
}
export function deplacerProp(acteur, cmd, dt, partie)   // figé → rien ; sinon bouger + cap (libre : vers lacet à 6 rad/s ; verrou : aimanté < 20°) ; 'frottement' tous les 0,4 m > 1,2 m/s
```
Le prototype ne passe pas par `dedupliquerMateriaux` : il garde un matériau jumeau de même signature → **même programme,
mêmes textures, aucune compilation**. Les coutures CLONENT la géométrie avant de la transformer (`kit_decor.js:523`,
`ecole_portes.js:78`) puis `dispose()` l'originale : le prototype garde ses tableaux, three les renvoie au premier
dessin (d'où `preparerRendu`). Voile du prop (ombre cuite absente sous un faux meuble) : quad à dégradé radial à
l'empreinte du meuble, opacité 0,35 (0,2 au RDC où les ombres de contact s'ajoutent), 1 appel transparent ; aucun voile
pour un type `voile: false`. Flash rouge d'une touche : matériaux CLONÉS du prop (`emissive`, un uniforme : aucune
recompilation).
**Attention (L-K)** : `conception_prophunt` § 9.4 écrit `credibilite(cle, x, z, y, …)` ; le contrat est
`credibilite(cle, x, y, z, …)` — ne pas recopier le code de la conception tel quel. **`couverture`** (0..1) = la part des
points d'observation de la pièce (nœuds des passages et du milieu de la pièce, œil à 1,6 m) qui VOIENT la cachette
(`balistique.vue`) ; une cachette peu couverte est meilleure pour un prop.
**Registre complet** : `verifierMeubles()` rend aussi `nonEtiquetes` = les maillages qui ont la géométrie d'un maillage
de prototype mais ne sont sous aucune étiquette ; un type qui en a dans une zone y passe `deguisable: false`. Comme la
couture fond ces maillages dans des blocs, la comparaison se PRÉPARE dans `fermerRegistre` (qui parcourt déjà le
sous-arbre avant chaque couture) : pour chaque maillage NON étiqueté, une signature (nombre de sommets, taille de sa
boîte au cm près, nom du matériau) et sa position monde ; à la préparation, ces signatures sont comparées à celles des
maillages des prototypes. (Coût compté dans les 30 ms du registre à la construction.)

#### 4.5.14 Prop hunt : règles et sons (L-F) ; IA (S0 minimal → L-O)
```js
// partie_prop.js
export const REGLAGES_PROP = { … };       // § 3.9 (toutes les constantes du mode)
export class PartieProp extends Partie {  // opts : { zone, manches, acteurs, difficulte, premierRole, chasseurSeul, aides, graine }
  static prerequis = { nav: true, navProps: true, avatars: true, catalogue: true }
  regles(dt)                              // présentation → cachette → traque → révélation, ×N manches ; rôles alternés ; provocations forcées ; scanner ; points ; fin
                                          //   chasseurs : acteur.sprintLimite = true (sprint à endurance, sans tactique, § 3.9)
  resoudreTir(...)                        // monde, props vivants (via touches.js), VRAIES poses (toucherPoses jusqu'à t + 0,03) ; DIFFÈRE 'degats', 'faux', 'soin'
  appliquerEffet(e)                       // + 'faux' (pénalité du chasseur, événement 'faux') et 'soin'
  roue                                    // SAISIE de la roue (hors simulation, hors état) : { ouverte, ax, ay, choix /* −1 | 0-7 */ }
  roueOuverte() ; mouvementSouris(dx, dy) ; mouvementStick(x, y)   // § 4.5.5
  lireExtra(input, game, cmd)             // la roue : `provoquer` tenu → ouverte (ax = ay = 0 à l'ouverture) ; geste cumulé ≥ 40 px
                                          //   (stick ≥ 0,5) → choix = secteur (8, 0 en haut, sens horaire) ; relâché avec un choix →
                                          //   cmd.provoc = choix ; fronts provoc1-provoc8 → cmd.provoc = n − 1 ; provocVite (G, molette, RB) →
                                          //   cmd.provoc = 8 (la dernière) ; JAMAIS game.wheel
  majHud()                                // + hud.prop (dont roue: { ouverte, choix }, que dessine RoueProvocations)
  get profil() ; bornesTangage() ; camera(dt, poser)
}
// sons_prop.js
export const PROVOCATIONS = [ /* 8 : { id, label, icone, duree, rayon, points } */ ];
export class SonsProp { constructor(sonsJeu); brancher(partie); debrancher() }   // provocations, frottement, pouf, aïe, crac, bip, défigement — par sonsJeu.jouer3d
// cerveau_prop.js (S0 : minimal — CerveauChasseur : Errant dans la zone et, toutes les 8 s, UN tir de test sur un candidat de
//   candidatsMeubles à < 10 m qu'il voit, tiré au hasard semé (vrai meuble ou prop : il ne sait pas, il ne lit JAMAIS `role`) ;
//   tire sur un acteur HUMAIN qu'il voit (un prop resté humain) ; CerveauCacheur = se déguise en le type le plus courant de sa
//   pièce et ne bouge plus)
export const DIFFICULTES_PROP = { facile, normal, difficile };   // § 3.9
export class CerveauChasseur extends CerveauBase { }             // soupçon, fouille, enquête, tir de test (vague 3 : L-O)
export class CerveauCacheur { constructor(acteur, partie, diff); commande(dt, cmd); entendre(evt) }   // cachette, pose, figé/vu, fuite (L-O)
```
Résolution d'un tir au prop hunt : `m = balle(...)` ; `p` = prop touché (boîte orientée, ≤ 8 boîtes, < 2 µs) ;
`v = toucherPoses(o, d, min(m.t, p ? p.t : ∞) + 0,03)` ; `p` avant `v` → dégâts au prop, soin du tireur (différés) ; sinon
`v` et déguisable → « VRAI MEUBLE » (−3 / −1 par plomb, effet différé `faux`) ; sinon impact du monde (pas de décalque sur
un meuble). Grenade : dégâts aux props à ligne libre, aucune pénalité. Zone de test et de repli : `e1` (§ 3.9).

#### 4.5.15 HUD (L-G) — et l'état `partie.hud` (contrat du socle)
```js
export class HudJeu   { constructor(game); brancher(partie); debrancher(); maj(dt, hud) }   // DOM créé sous #hud par JS (pas d'index.html)
export class HudProp  { constructor(game); brancher(partie); debrancher(); maj(dt, hud) }
export class RoueProvocations { constructor(parent); maj(roue /* hud.prop.roue */, provocations) }   // le DESSIN seulement (8 secteurs, DOM sous #hud)
export class TableauScores { constructor(game); maj(partie, montre) }   // non interactif, PAS dans RACINES
export class MiniCarte { constructor(game); preparer(nav); maj(dt, partie) }   // silhouette du niveau rastérisée depuis les nœuds (0,25 m = 2 px)
// partie.hud (rempli par les règles, lu par l'affichage) :
{ vie, vieMax, armure, arme: { id, nom, chargeur, reserve, etat, k }, dispersion /* rad */, visee, letales, tactiques,
  chrono, phase, phaseT, phaseDuree, manche, nManches, scores: { A, B } | null, classement: [{ id, nom, equipe, elims, morts, assists, score, role, vivant }],
  annonce: { texte, cls, t } | null, mort: { tueur, arme, zone, distance, vieTueur, t } | null, reapparitionT,
  points: [{ id, x, y, z, r, possesseur, capture: { equipe, k } }], cibles: [{ id, x, y, z, cap, k, touchee }],
  prop: { forme, nomForme, changements, verrou, fige, provocT, provocMax, discretion, oeil, scanner: { charges, t }, propsRestants, chasseursRestants, role,
          roue: { ouverte, choix }, cachette: { chrono, roles: [{ id, nom, role, vivant }], astuces: [texte] } | null } | null,
  aveugle: { t, duree } | null, astuce, signalesMiniCarte: [{ id, x, z, t }],
  allies: [{ id, nom, x, y, z /* tête SIMULÉE + 0,35 */ }] }   // pour les chevrons (≤ 4) ; vide en chacun pour soi
```
Règle de `HUD.stamina` (`ui.js:293-296`) : le DOM n'est touché que si la valeur AFFICHÉE change ; seuls réticule,
mini-carte et plaques de noms bougent à chaque image (transformations CSS / un canevas 2D). Disposition (CoD § 9.1) :
réticule centre (4 traits 2 × 9 px, écart `4 px + dispersion`, bleu sur un allié, rouge sur un ennemi visé, caché en
visée) ; marqueurs ; « +100 » à droite du réticule ; score et chrono haut gauche (`.clock` de `style.css:140`, rouge sous
30 s) ; domination haut centre ; fil des éliminations haut droite (5 lignes, 5 s, silhouettes d'armes en SVG) ; mini-carte
bas gauche (200 px, 160 au tactile, 24 m de large, tourne avec Haythem ; ennemis 2 s après un tir non silencieux ;
chevrons ↑↓ pour un autre niveau ; nom du niveau) ; vie au-dessus (ne se montre qu'abîmée) ; munitions bas droite
(« 24 » / « 90 », nom, grenades, « R RECHARGER » sous 30 %) ; indicateurs de dégâts, vignette, lunette plein écran ;
**annonces dans un élément À ELLES** (`#hud-annonce`, créé par `HudJeu`, relancé en basculant deux classes `.a` / `.b`
ou par l'API Web Animations — jamais `hud.feedback`, qui force une mise en page (`void offsetWidth`, `ui.js:283-288`) et
envoie `hoops-feedback`, donc une vibration en plus de celles de L-I) ; **chevrons des alliés** (`hud.allies`, ≤ 4,
projetés à chaque image en transformation CSS, vus à travers les murs, 14 → 8 px avec la distance, nom dessous à
≤ 15 m) ; **`#voile-flash`** (blanc, au-dessus du HUD et sous la pause : opacité 1 tant que `aveugle.t < duree − 0,6`,
puis `(duree − t) / 0,6`). `body.combat` (règles posées dans `css/jeu/hud.css` par le socle, gardées par L-G) cache
`.stamina`, `#hud-keys`, `#phone-badge`, **`#hud-hint`** et **`#hud-streak`**. HUD prop : forme + « le tabouret vert »,
changements ●●○, 🔒 / ❄, anneau de provocation, DISCRÉTION ★, ŒIL (« REPÉRÉ ! » > 70 %), étiquettes des alliés (≤ 4),
point de visée et aide « E : devenir … », **`RoueProvocations`** (8 secteurs avec icône, nom et rayon ; le secteur
`choix` en surbrillance ; dessinée d'après `hud.prop.roue`, jamais `game.wheel`), **panneau de cachette** côté chasseur
(`#voile-cachette`, z-index 12, noir opaque — PAS `fx.flash` qui est blanc — avec chrono, tableau des rôles, mini-carte
de la zone sans acteurs et astuces, d'après `hud.prop.cachette`), arcs « Voir les sons ». Tableau : rang,
portrait 32 px, nom, score, É, M, A, ratio, série ; deux colonnes d'équipe ; colonnes du prop hunt (rôle, points, trouvés,
survie, provocations, « vrais meubles »).

#### 4.5.16 Menus et options (L-U)
```js
export class MenuJeu {
  constructor(game, deps)       // deps : { options, lancer, quitter }
  accueil()                     // racine manette 'menu-jeu' (ajouterRacine)
  reglage(mode)                 // 'combat' | 'prop' | 'stand' — racine 'reglage-jeu'
  preparation(f, etape)         // « PRÉPARATION DE LA PARTIE »
  fin(resultat)                 // racine 'fin-jeu' : REJOUER · CHANGER DE MODE · MENU PRINCIPAL · BALADE
  credits()                     // racine 'credits-jeu'
  camera(dt, poser) → bool      // branchée sur game.cameraMenu : trois plans, 12 s, fondu 1,2 s
}
export function portrait(fiche) → string | null   // 'assets/portraits/<fiche.id>.webp' si l'image existe (liste PORTRAITS figée dans le
                                                  //   module), sinon null (le DOM montre alors l'initiale sur un dégradé) ; AUCUN WebGL
```
**Portraits PRÉCALCULÉS** (et non plus rendus en jeu : la copie de `portraits.js` de LA CAGE ouvrait un 2e contexte
WebGL avec 4 lumières, chargeait les GLB des amis au MENU — contre « rien de plus au démarrage » —, relançait la cuisson de
l'ombre du sol par `DefaultLoadingManager.onLoad` moins de 30 s après la construction, et figeait l'image 150 ms par
portrait au premier Tab). L'outil `tools/portraits/` (L-U) : `index.html` (importmap vers `../../vendor/three`) +
`outil.js` = le moteur de portraits de LA CAGE (`js/portraits.js:35-106` : rendu 192 × 192 hors écran, fond transparent,
clé chaude, remplissage froid, contre-jour, cadrage buste) recopié et taillé ; il charge `assets/haythem.glb` et les 6
`assets/tel/<ami>.glb`, et pose `window.__portraits = { id: dataURL WebP 0,85 }`. L'agent le sert (`python serve.py
<port>` dans son arbre, `/tools/portraits/`), lit `JSON.stringify(window.__portraits)` par l'outil JavaScript du
navigateur, l'écrit dans un fichier et lance `python -I tools/portraits/ecrire.py portraits.json assets/portraits/` (qui
décode les sept images). À refaire seulement si un avatar change.
`ui.js` (L-U) : onglet Commandes à trois sous-onglets BALADE / COMBAT / PROP HUNT (`ui.js:165-175`), `listen()` (`ui.js:234`)
capture aussi `mousedown` et `wheel`, liste en dur du bloc manette (`ui.js:45-57`) qui suit le profil ; onglet **COMBAT**
des options (champ, sensibilité FPS en cm par tour, sensibilité en visée, visée maintenue / bascule, accroupi
maintenu, sprint auto, aide à la visée, couleur du réticule, secousses, tir auto tactile, habillage — Airsoft par
défaut —, priorité fluidité). Écran CRÉDITS : celui de LA CAGE (`index.html:319-365`) sans le basket ni le parc, avec Avaturn (Haythem et
ses amis), Mixamo, CMU (formule exigée), Sketchfab CC BY 4.0 (danses), voitures.glb, Poly Haven, three.js, es-module-shims,
polices — la licence CC BY 4.0 des danses l'exige déjà.

#### 4.5.17 Effets et sons (L-H)
```js
export class Effets {
  constructor(game)             // pools créés et COMPILÉS à la 1re préparation : impacts 256 (tél. 96), traceurs 32 (16), douilles 64 (24),
                                //   éclairs 16 (8), étincelles 128 (48), anneaux de domination 3, cibles du stand 12, explosion — un InstancedMesh chacun,
                                //   racine, dynamique, frustumCulled = false
  brancher(partie) ; debrancher() ; maj(dt)   // abonnés : tir, impact, touche, elim, explosion, flash, faux ; lit hud.points / hud.cibles
}
export class SonsJeu {
  constructor(audio)
  brancher(partie) ; debrancher() ; maj(dt, camera)
  jouer3d(x, y, z, recette /* (ctx, sortie, quand) => duree */, { gain = 1, rayon = 30, bas = false, prioritaire = false }) → voix | null
  get voix()                    // [{ x, y, z, panner, filtre, gain, debut, fin, niveauDb }] : les voix actives (lues par les tests)
  t                             // SON horloge (secondes), avancée par maj(dt) ; une voix est LIBÉRÉE quand t ≥ fin, avec
                                //   fin = t_départ + retard + durée rendue par la recette — JAMAIS sur `onended` (sous ?test=1,
                                //   l'OfflineAudioContext n'avance pas : currentTime reste à 0 et onended ne vient jamais)
}
// audio.js (L-H) : setListener(pos, camera = null) (orientation lue dans camera) ; init() garde la prise creerContexte du socle ;
//                  bruits blanc et rose PRÉCALCULÉS (1 s) au lieu d'un tampon par appel (audio.js:73) ;
//                  sortie spatialisée (PannerNode 'equalpower', 'inverse', référence 2 m, atténuation 1,2, max 60 m) ; buzzer, whistle, refus de LA CAGE (audio.js:178-234)
// fx.js (L-H) : PasseSuperposee (posée par S0) ; budgetImage (option « Priorité fluidité » : 1000/60 en partie, sinon BUDGET_IMAGE inchangé)
```
Une voix = source → `BiquadFilter` (occlusion) → `PannerNode` → sortie + envoi vers la réverbération (`audio.js:35-49`) ;
24 voix au plus (12 au téléphone), la plus faible volée ; **occlusion par le DDA** : `partie.balistique.vue(auditeur,
source)` (≈ 8 µs, lecture seule ; jamais `C.rayonLibre`, à 12-106 µs l'appel), **4 voix par image à tour de rôle**, et
seulement les voix dont le niveau estimé à l'auditeur dépasse −30 dB (bloqué : −9 dB et passe-bas 700 Hz ; autre
niveau : −14 dB, 400 Hz ; à travers une dalle pour les provocations : ×0,35, 900 Hz ; changements lissés en 0,1 s) ;
retard `d / 343` s. Recettes de tir (claquement / corps / grave / mécanique / queue) de CoD § 7.5 ; au-delà de
25 m plus de claquement ; hauteur ±4 % par coup ; pas des acteurs depuis l'événement `pas` (+4 dB les ennemis) ;
rechargements, tir à vide, sifflement, changement d'arme, sifflet, buzzer. Impacts : quads alignés sur la normale de
`balle()`, seulement sur les formes hautes (`y1 − y0 > 1,8` ou `joueur === false`) et les plafonds, jamais sur les vantaux ;
ailleurs une gerbe d'étincelles (sol : poussière ; vitre : fêlure + verre) ; effacement par rétrécissement après 25 s.
Traceurs : une balle sur trois (toutes pour les bots), trait de 2,5 m à 400 m/s. Douilles : œil + (0,12 droite, −0,08 bas,
0,35 avant), deux rebonds, « tink ». Éclairs : quads croisés additifs `toneMapped: false` (le bloom les fait briller),
3 images ; **aucune lumière dans la scène de jeu**. Habillage Airsoft (défaut) : impacts de peinture (couleur de l'équipe
du tireur), recette de tir « gaz » (§ 3.6 : même structure, claquement plus court, sans grave).

#### 4.5.18 Tactile, manette, assistance (L-I)
- `touch.js` : `_contexte()` (l. 224-238) en partie — combat : TIR (xl, rôle mixte bouton + regard), VISER, SAUT, ACCROUPI,
  RECHARGER, ARME, GRENADE, TACTIQUE, COUTEAU, SCORES, II ; prop : DÉGUISER, VERROU, FIGER, PROVOQUER (appui long = roue,
  bref = la dernière), SAUT, SCORES ; chasseur : + SCAN ; emplacements dans `EMPL` (l. 34-37), `NOMS` (43), `NOM_ACTION`
  (45), places par défaut dans `disposer()` (140-146) ; bornes du tangage `game.bornesTangage()` (l. 422) ; tir auto.
- `manette.js` : bornes (l. 338) par `game.bornesTangage()` ; vitesse et accélération du stick en partie ; `facteurStick`
  de l'assistance ; **roue des provocations ouverte** (`game.partie?.roueOuverte?.()`) → le stick droit va à
  `game.partie.mouvementStick(x, y)` et ne tourne PAS la caméra ; vibrations (`tir` faible 40 ms, touche reçue forte
  120 ms) par `game.input.manette.vibrer(f, l, ms)` (l. 376) sur ÉVÉNEMENTS de la partie SEULEMENT (en partie, plus aucun
  `hud.feedback`, donc plus de `hoops-feedback` : pas de double vibration) ; Start ou A sur le calque « CLIQUE POUR
  JOUER » → reprise sans capture ; aide `aideBalade()` (l. 24) qui suit le profil.
- `touch.js` : appui long sur PROVOQUER = roue ouverte, le glissé du doigt va à `mouvementSouris(dx, dy)` ; un toucher sur
  le calque « CLIQUE POUR JOUER » → reprise sans capture.
- `manette_menus.js` : `ajouterRacine` (posée par S0) ; les écrans du jeu s'y inscrivent eux-mêmes (L-U).
- `assistance_visee.js` : `corriger(cmd, game, dt)` (tir auto tactile, aimant d'ADS ; réécrit `game.camYaw/camPitch` ET
  `cmd.lacet/tangage`) ; `facteurStick(game)` (ralentissement, suivi) ; jamais à la souris (`entree.manette` ou
  `entree.tactile` exigés, `js/settings.js`).

#### 4.5.19 Le monde en partie (L-M)
```js
export const TABLE_PORTES_FPS;   // nom → 'ouverte' | 'fermee'
export const TABLE_PORTES_PROP;  // nom → 'auto' | 'fermee' | 'ouverte' ; frontières de la zone fermées à l'entrée
export const TABLE_DEPOLIS;      // [{ x, y, z }] : les vitres DÉPOLIES (jours dépolis, cloisons de verre opaque) parmi les 51 formes `vitre`
                                 //   (carte_monde § 9.7) ; centre de la forme à ± 5 cm
export function regleParDefaut(porte, zoneJeu, mode) → 'ouverte' | 'fermee' | 'auto'   // une porte ABSENTE des tables (le lot R
                                 //   en ajoute ou en déplace) : combat → 'ouverte' si ses deux côtés sont dans la zone, sinon
                                 //   'fermee' ; prop hunt → 'auto' ; notée dans `monde.inconnues` et au rapport
export class MondePartie {
  constructor(game)
  preparerSession()              // une fois : barrières (C.ajouterBoite(..., { y0, y1, camera: false, balle: false, limite: id }), off = true) calculées
                                 //   depuis les 46 passages entre zones, rubalise (un InstancedMesh, 1 appel) compilée ;
                                 //   VANTAUX SOLIDES : pour chaque porte 'auto' de la carte, une boîte orientée mince le long du vantail
                                 //   OUVERT (même calcul que ecole_portes.js:546-548, à l'angle ANGLE_AUTO), { vantail: true, porte: nom },
                                 //   off = true ; DÉPOLIS : forme.depoli = true pour chaque forme `vitre` de TABLE_DEPOLIS
  entrer(zoneJeu, table, mode = null, opts = null)   // portes forcées (forcer), vantaux solides allumés pour les portes 'ouverte' du COMBAT, ascenseur coupé,
                                 //   barrières de la zone allumées, joueur.bounds = BORNES_JEU si zone avec rue, glace de l'accueil
                                 //   peinte (miroir.coupe = true, ancienne valeur gardée) ; (F2) opts = Partie.optionsMonde() :
                                 //   { rueTracee: false } = la rue bornée sans sa rubalise (le stand)
  sortir()                       // l'état EXACT de la balade (formes off, k, vantaux et leurs boîtes, ascenseur, bornes, glace)
  majPortes(dt, acteurs)         // portes 'auto' : ouvertes si un acteur vivant est à < 2,1 m à son niveau (règle de Portes.maj) ; dans Partie.pas
  verrouiller(nom, ferme)
  noeudsAutorises(nav, zoneJeu, mode) → Uint8Array   // pièces de la zone, moins les pièces fermées par la table
  image(dt) ; etat() ; appliquer(e)                  // portes auto { k, sens }
}
```

| Porte (`ecole_portes.js`, carte_monde § 4) | Combat | Prop hunt | Pourquoi |
|---|---|---|---|
| entrée n° 6 (15,13 ; −0,8) | ouverte | fermée (la rue est hors jeu) | axe rue ↔ hall |
| passage (3,58 ; −4,05) | ouverte | auto (RDC, école) | axe principal |
| coupe-feu du 2e (14,75 ; −7,9) | ouverte | auto | SEUL accès au 2e (12 trajets sur 36 bloqués là) |
| salles 1 et 2 du 2e, David Clark, hall −1 → pause, S −1.14, Si 0.1, bureau B | ouvertes | auto | pièces de jeu ; « la porte qui s'ouvre seule » |
| service (hall), la grise vers le −1 | ouverte | auto si dans la zone, sinon fermée | 2e accès au −1 (volée de tôle) |
| toilettes F/H, PMR, local C01, service (passage) | fermées (des murs) | fermées | culs-de-sac à camper ; pièces « FERMEES » de la visibilité |

Mise en œuvre (`ecole_portes.js`) : `Portes.forcer(P, k)` pose `P.k`, les vantaux et `forme.off` ; `Portes.pilotees =
true` en partie → `maj` (l. 580-609) saute tout (la partie anime elle-même les portes 'auto' dans son pas). Ascenseur :
`majAscenseur` (`ecole_ascenseur.js:456`) ne fait rien si `jeu.partie` (formes de passage allumées : murs). Visibilité :
une pièce de `FERMEES` (`ecole_visibilite.js:392-398`, 329-335) dont une porte est OUVERTE devient `toujours`.
`carte_ecole.js:628` (le « jour » de l'escalier) : `balle: false`. `Portes._formePorte` (l. 561) : `vitre: true` pour les
modèles vitrés. Un graphe unique (portes auto ouvertes, vantaux solides allumés) sert à tous les modes ; la zone et les
pièces fermées passent par `nav.restreindre(noeudsAutorises(...))` — le graphe n'est jamais régénéré pour un changement de
zone. La glace de l'accueil : le constructeur de l'accueil ne rend que `{ maj }` (`ecole_hall.js:1577`) ; son `etat`
(`ecole_hall.js:831`, dont `coupe`) n'est joignable que par `window.__miroirAccueil` (l. 1023). `carte_ecole.js` (L-M),
juste après `const accueil = construireAccueil(ch)` (l. 1780), garde `window.__miroirAccueil?.etat ?? null` et le joint à
son retour (`miroirAccueil`) ; `MondePartie` met `etat.coupe = true` à l'entrée et rend l'ancienne valeur à la sortie ;
`instantane()` la compte.
Les extincteurs de `ecole_ascenseur.js` (l. 421) et du hall ouest de `carte_ecole.js` (l. 1198-1222) reçoivent l'étiquette
`{ type: 'extincteur', nom: "l'extincteur", mural: true }` de L-M (une donnée, propriétaire de ces deux fichiers) ; les
autres fichiers sont étiquetés par L-K (§ 5.3).

### 4.6 Les événements (tous en nombres et chaînes : ids d'acteurs, jamais d'objets three)
| Type | Données | Émis par | Écouté par |
|---|---|---|---|
| `tir` | a, arme, ox, oy, oz, dx, dy, dz, n (plombs), seq | Arsenal | effets, sons, cerveaux (ouïe), HUD (mini-carte), manette |
| `impact` | x, y, z, nx, ny, nz, mat, forme, plomb | Partie.resoudreTir | effets, sons |
| `touche` | par, cible, zone, degats, x, y, z, tete, dx, dz | Partie.infliger (étape 6b, ou 7 pour une grenade) | HUD (marqueurs, indicateurs), sons, cerveaux, corps (sursaut), manette |
| `elim` | par, cible, arme, tete, x, y, z, ix, iy, iz, assists | Partie.infliger | règles, HUD (fil), corps (poupée), vue (mort), sons, profil (vague 3) |
| `apparition` | a, x, y, z | règles | corps, HUD |
| `recharge` | a, phase ('debut'\|'insere'\|'fin'), tactique | Arsenal | viewmodel (rien de règle), sons |
| `arme` | a, id | Arsenal | viewmodel, HUD, sons |
| `vide` | a | Arsenal | sons |
| `grenade` | a, arme ('frag'\|'flash' — F2 : `type` est le nom de l'événement), x, y, z, vx, vy, vz, meche, id | Grenades | effets, sons, cerveaux |
| `rebond` | a, arme, x, y, z, v, id (F2 : ajout de L-A) | Grenades | sons |
| `explosion` | x, y, z, r, arme, a, id | Grenades | effets, sons, vue (secousse), cerveaux |
| `trajet`, `couteau` | (F2 : ajouts de L-A — le trajet d'une balle pour le traceur ; le coup de couteau) | Arsenal | effets, sons |
| `porte` | nom, x, y, z, ouvre, a (F2 : ajout de L-M) | MondePartie.majPortes | sons |
| `flash` | cible, duree | Grenades | Partie.majHud (`hud.aveugle` → `#voile-flash`), vue (fx.flash en appoint), sons, cerveaux |
| `frole` | a, x, y, z | Partie.resoudreTir | sons |
| `pas` | a, x, y, z, f (force 0..1), allure | mouvement | sons, cerveaux |
| `saut`, `reception` | a, f | mouvement | sons, viewmodel |
| `glissade` | a, debut | mouvement | sons, viewmodel |
| `phase` | phase, duree | Partie.phaseVers | HUD, sons (buzzer, sifflet), cerveaux |
| `annonce` | texte, cls | règles | HUD |
| `score` | equipe, valeur, id, points, raison | règles | HUD, profil |
| `capture` | point, equipe, etat ('neutre'\|'prise'\|'neutralise') | domination | HUD, sons, cerveaux |
| `deguise` | a, cle, x, y, z | deguiser | sons (pouf), HUD, cerveaux |
| `provocation` | a, id, x, y, z, forcee | PartieProp | sons, HUD (voir les sons), cerveaux |
| `frottement` | a, x, y, z | deplacerProp | sons, cerveaux |
| `faux` | a, pose, pv | PartieProp | HUD (« VRAI MEUBLE −3 »), sons |
| `soin` | a, pv | Partie.soigner | HUD |
| `scanner` | a, resultats: [{ dir, bande }] | PartieProp | HUD, sons, cerveaux (bip) |
| `fin` | gagnant, scores | règles | menus (fin), sons |
| `medaille`, `serie` | a, id | vague 3 | HUD, profil |

### 4.7 L'état sérialisable et le multijoueur plus tard (contrat du socle, testé par `verifierEtat`)
```js
{ v: 1, mode, zone, graine, tick, t, rng, phase, phaseT, manche, chrono, scores: { A, B } | null,
  acteurs: [{ id, nom, av, eq, role, x, y, z, vx, vz, cap, lacet, tangage, jy, jv, air, acc, gl, tact /* jauge du sprint tactique */, en /* endurance */,
              tA /* sprint tactique en cours (F2) */, ep /* épuisé, chasseur (F2) */, vie, ar, viv, rT, pT,
              arme: { i, ch: [..], res: [..], et, t, vk, seq, chaleur, reculI, let, tac }, prop: { cle, cap, fige, verrou, pv, chg, pT } | null,
              st: { e, m, a, s } }],
  grenades: [{ id, a, type, x, y, z, vx, vy, vz, t }], portes: [{ i, k, sens }], points: [...], evenements: [...] }
```
≈ 150 octets JSON par acteur → 10 acteurs ≈ 1,5 Ko × 20/s = 30 Ko/s par invité (le relais de LA CAGE accepte 8 192 octets
par message, 140 messages/s). Ne voyagent jamais : décor, registre, graphe, cachettes, barrières (déterministes,
construits par le code). Principe (LA CAGE `js/enligne.js`) : une seule simulation, celle de l'HÔTE ; les invités
envoient `versTableau(cmd)` (≤ 30/s, `seq`) ; l'hôte les rejoue (même `Partie.pas`, l'acteur distant lit une file au lieu
d'`Input`) et renvoie 20 images/s horodatées (`etat()` compact + événements) ; l'invité montre les autres 80-150 ms dans
le passé (`Horloge` + `Tampon` Hermite de `net.js:252-376`, avec `y`) et PRÉDIT son acteur avec le même
`appliquerCommande` ; compensation de latence : 1 s d'historique `(x, y, z, cap, acc, gl, jumpY)` par acteur et par pas
(7 200 nombres en anneau) et les capsules SIMULÉES refaites à l'instant vu par l'invité. Le LAN : `serveur/relais.js` +
`serveur/node.mjs` de LA CAGE dans `IRIS/serveur/`, port 8124, `SERVEUR_PUBLIC = ''` (jamais le salon de LA CAGE).
Rien de cela n'est construit maintenant.

### 4.8 Les entrées : profils de touches (codes physiques `e.code` ; libellé AZERTY entre parenthèses)

| Action (id) | BALADE (inchangé) | COMBAT clavier | COMBAT manette | PROP clavier | PROP manette | Tactile |
|---|---|---|---|---|---|---|
| forward / back / left / right | KeyW/S/A/D (Z S Q D) + flèches | idem | stick G | idem | stick G | joystick |
| sprint (double = tactique) | Maj ; RT | ShiftLeft | **L3** (double) | ShiftLeft | L3 | bord du joystick |
| sprintTact (2e touche, un seul appui) | — | **Souris:4 (SOURIS 5)** | — | — | — | — |
| walk / marcher | AltLeft, KeyZ (W) | AltLeft | stick < 58 % | AltLeft | — | effleurer |
| jump / saut (franchir) | Espace ; A, X | Space | A | Space | A | SAUT |
| accroupi (glisser en sprint) | — | **KeyC (C)** — jamais Ctrl | B | — | — | ACCROUPI |
| tir | — | Souris:0 (CLIC G) | RT | — | — | TIR (mixte) / tir auto |
| visee (Maj en visée = souffle) | — | Souris:2 (CLIC D) | LT | — | — | VISER (bascule) |
| recharger | — | KeyR (R) | X | — | — | RECHARGER |
| armeSuiv / armePrec | — | Molette:bas, KeyQ… non : **Molette:bas** / **Molette:haut** | Y | — | — | ARME (tape) |
| arme1 / arme2 | — | Digit1 / Digit2 (& / é) | — | — | — | — |
| couteau | — | KeyV (V), Souris:3 | R3 | — | — | glisser bas sur TIR |
| letale (tenir = cuire) | — | KeyG (G) | RB | — | — | GRENADE |
| tactique (flash) | — | KeyQ (A) | LB | — | — | TACTIQUE |
| interagir (vague 3 : ramasser) | (Entrée, E) | KeyF (F) | — | — | — | contextuel |
| scanner (chasseur) | — | KeyX (X) | croix ↓ | — | — | SCAN |
| serie1 / 2 / 3 (vague 3) | — | Digit3 / 4 / 5 | croix ← ↑ → | — | — | icônes |
| deguiser | — | — | — | KeyE (E), Souris:0 | X | DÉGUISER |
| verrou | — | — | — | KeyR (R) | Y | VERROU |
| figer | — | — | — | KeyF (F), Souris:2 | B | FIGER |
| provoquer (roue, tenir) / provocVite | — | — | — | KeyT (T) / KeyG (G), Molette | LB / RB | PROVOQUER (long / bref) |
| provoc1 … provoc8 (une provocation précise) | — | — | — | Digit1 … Digit8 (& é " ' ( - è _) | — | dans la roue |
| scores (tenir) | — | Tab | Back | Tab | Back | SCORES |
| pause | Échap ; Start | Escape | Start | Escape | Start | II |
| camera, phone, emote, interact (balade) | C, P, T/G, Entrée/E | — | — | — | — | — |

Les profils sont des TABLES COMPLÈTES séparées : un code ne sert qu'une action DANS un profil (`_take`, `input.js:69-75`,
consomme pour le premier lecteur). `Game.appliquerProfil()` à l'entrée en partie, à chaque changement de rôle (prop hunt)
et à la sortie (avec purge) ; `applySettings` le rappelle SANS purge. Les chiffres ne sont lus que par des ACTIONS
(`arme1/arme2`, `serie1-3`, `provoc1-8`) : leurs fronts survivent donc à `endFrame` jusqu'au pas qui les consomme. Ctrl
jamais par défaut ; si Haythem lie Ctrl, avertissement « Ctrl + W ferme l'onglet » et `navigator.keyboard.lock()` en
plein écran quand il existe. Le double appui sur Maj, répété, peut ouvrir la fenêtre « Touches rémanentes » de Windows
(5 Maj d'affilée : le jeu perd le focus, la capture, puis passe en pause) : d'où la 2e touche `sprintTact` (SOURIS 5,
un seul appui) et un conseil du README (désactiver le raccourci des touches rémanentes).

### 4.9 Le chargement et le cache
- **Démarrage de la balade inchangé.** Les modules `js/jeu/*.js` sont importés statiquement (≈ 300 Ko de JS : visé
  ≤ +0,3 s sur PC, mesuré par l'intégration avec `?chargement=trace` → `copy(JSON.stringify(__chargement.traceFigee))` →
  `python tools/liste_chargement.py releve.json`). Les tests sont importés dynamiquement sous `?test=1`.
- **Au lancement d'une partie** (écran PRÉPARATION, `Partie.preparer`) : barrières et rubalise (1re fois), graphe (cache
  ≈ 30 ms ou 0,7 s), avatars des bots (1re fois 150-480 ms chacun, un par gabarit d'abord, chargeur discret ; ensuite
  28 ms par exemplaire), catalogue et cachettes (prop hunt), viewmodel, pools d'effets, HUD, mini-carte compilés (1re fois).
- `sw.js` : les `assets/tel/<ami>.glb` sont « lourds » (cache d'abord, `sw.js:23`) : jouables hors ligne après la 1re
  partie. `VERSION` passe à `iris-v3.0` à l'INTÉGRATION seulement. Si des sons en fichiers arrivent un jour : ajouter
  `ogg|mp3|wav|m4a` à la règle des lourds. **Les tests ne vont jamais dans le cache** : la branche « réseau d'abord »
  (`sw.js:39-40`) copie toute réponse GET de la même origine, tests importés à la demande compris ; INT ajoute en tête du
  `fetch` : `if (url.pathname.includes('/js/jeu/tests/')) return;`.
- Les portraits (`assets/portraits/*.webp`, ≈ 10-20 Ko chacun) ne sont chargés que par les écrans de réglages qui les
  montrent (balises `<img>`), jamais au démarrage.

### 4.10 Le harnais (`js/jeu/harnais.js`, `window.__jeu`, socle)
```js
__jeu.pret() → Promise                        // le jeu est chargé (menu ou balade)
__jeu.lancer(mode, opts) → Promise<etat>      // mode 'essai'|'equipes'|'melee'|'domination'|'stand'|'prophunt'|'balade' ; opts { graine, bots, allies, ennemis,
                                              //   difficulte, avatars, duree, scoreCible, humain = true, campHumain, zone, manches, premierRole, mannequins, prop }
__jeu.quitter(vers = 'menu')
__jeu.etat() ; __jeu.empreinte()
__jeu.acteurs() → [{ id, nom, equipe, role, x, y, z, zone, niveau, vie, vivant, arme, chargeur, etatCerveau, prop }]
__jeu.teleporter(id, x, y, z, lacet?) ; __jeu.teleporterZone(id, zone)
__jeu.viser(id, cible)                        // acteur id | {x,y,z} | {lacet, tangage}
__jeu.commande(id, partielle, duree)          // force des champs de commande pendant `duree` s (pilote Haythem sans clavier)
__jeu.tirer(id, { n = 1, cible, intervalle }) → { tirs, touches, tetes, decor, elims }
__jeu.avancer(secondes, { rendu = false, vitesse = 1 }) → { ms, pas }   // simulation seule : Partie.pas en boucle, sans image
__jeu.images(n) → Promise<{ medMs, p95Ms, maxMs, appels, triangles, programmes, gels /* images > 100 ms */, valable }>
                                              // ne dépend JAMAIS de requestAnimationFrame : si `document.hidden` (ou aucun rAF depuis 250 ms),
                                              //   il appelle lui-même `game.frame(1/60)` n fois, rendu compris, et rend `valable: false`
                                              //   (les temps mesurés ne valent rien ; les COMPTES — appels, programmes — restent justes)
__jeu.journalAudio → { entrees: [{ param, methode, valeur, quand }], vider() }   // ?test=1 : espion posé sur AudioParam.prototype
                                              //   (setValueAtTime, linearRampToValueAtTime, exponentialRampToValueAtTime, setTargetAtTime,
                                              //   cancelScheduledValues) et AudioScheduledSourceNode.prototype (start, stop), anneau de 4 096 ;
                                              //   les tests de son lisent ce qui est PROGRAMMÉ, jamais le temps écoulé
__jeu.compteurs() → { tirs, touches, tetes, elims, impacts, sons, voix, chemins, aStarMs, coinces, teleportsSecours, horsMonde, pasMs, imageMs }
__jeu.verifierNav() → { noeuds, liens, composantes, parNiveau (m²), zonesAtteintes, apparitions, cabine, ms, cache }
__jeu.verifierBots({ duree = 120, bots = 8, cerveau = 'errant' }) → { coinces: [], horsMonde: [], sousLeSol: [], dansUnMur: [], traverseMurs: [], zonesVisitees }
__jeu.verifierDeterminisme(graine, secondes) → { a, b, egal }
__jeu.verifierEtat() → bool                   // etat() → appliquer() dans une partie neuve → etat() identique
__jeu.verifierEntrees() → { emoteFantome, sautApresPause, clicDeCapture, frontsVieux, aideEnPartie /* #hud-hint non vide en partie */ }
__jeu.simulerCapture(etat)                    // 'accordee' | 'refusee' | null (défaut sous ?test=1 : capture inutile, § 4.3.5)
__jeu.forcerImagesManuelles(bool)             // prend le chemin « onglet caché » d'images(n) même onglet devant (test du harnais)
__jeu.verifierMeubles() → { types, poses, deguisables, parZone, horsTolerance: [], nonEtiquetes: [{ type, zone, x, y, z }], ms }
__jeu.rejouerBalade() → { ecartMax, seuils }  // § 4.10.1, contre tests/reference_balade.json
__jeu.memoire() → renderer.info.memory + programmes + enfants de la scène
__jeu.photo(nom) → dataURL                    // capturée juste après un rendu (dans le rAF, ou après un game.frame manuel si l'onglet est caché)
__jeu.mesurer(fn, n) → { med, p95 }
__jeu.qualite(nom) → Promise                  // 'basse'|'moyenne'|'haute'|'ultra'|'auto' : graphics.quality posé EN MÉMOIRE (copie des
                                              //   réglages, rien d'enregistré dans iris.settings.v1) puis game.applySettings ; aussi `&qualite=`
__jeu.figerQualite(bool)                      // coupe la qualité automatique pendant une mesure (sinon elle change de préréglage en route)
__jeu.ajouterTest(lot, nom, async fn) ; __jeu.tests(lot?) → { ok, echecs: [{ nom, attendu, obtenu }], ms }
```
Adresse de test : `http://127.0.0.1:<port>/?test=1&partie=essai&graine=42` (`serve.py` écoute en IPv6 ET en IPv4,
`Serveur6`, l. 32-41 : `127.0.0.1` et `localhost` marchent ; démarre sans geste, `chargement.js:577`) ; `&rapport=1&lot=<clé>`
lance les tests du lot et pose `window.__rapport`. Les tests ne cliquent jamais à l'écran : tout passe par `__jeu`. Sous
`?test=1`, le harnais pose AVANT le démarrage `audio.creerContexte = () => new OfflineAudioContext(2, 441000, 44100)`
(prise S0 dans `audio.js`) et l'espion `journalAudio`. Le harnais s'abonne à `'*'`, chronomètre `Partie.pas`,
`Partie.image`, `nav.demander`, et surveille chaque acteur à chaque pas : `y < −3,6` ou hors `BORNES_NAV` → `horsMonde` ;
`!C.libre(x, z, 0,25, y)` plus de 0,2 s → `dansUnMur` ; segment `posPrec → pos` qui traverse une forme → `traverseMurs` ;
`pos.y` qui baisse de plus de 0,6 m sans saut → `sousLeSol` ; immobile (< 0,6 m en 5 s) alors que son cerveau veut
bouger → `coinces`.

#### 4.10.1 Ce que le harnais fixe pour TOUS les fichiers de tests (complément, posé par le socle)
- **Un fichier de tests par lot**, importé DYNAMIQUEMENT sous `?test=1` selon la table figée `FICHIERS_TESTS` de
  `harnais.js` : S0 `test_socle.js` · L-A `test_armes.js` · L-B `test_mouvement.js` · L-W `test_modeles_armes.js` · L-V
  `test_viewmodel.js` · L-C `test_corps.js` · L-D `test_nav.js` · L-E `test_combat.js` · L-K `test_meubles.js` · L-F
  `test_prop.js` · L-G `test_hud.js` · L-U `test_menus.js` · L-H `test_effets.js` · L-I `test_mobile.js` · L-M
  `test_monde.js` · F2 `test_fusion.js` · L-J `test_ia.js` · L-O `test_ia_prop.js` · L-P `test_progression.js` · L-Q
  `test_killcam.js` · INT `test_integration.js` (tous dans `js/jeu/tests/`). Un fichier absent = « pas de tests », pas une
  erreur ; `&rapport=1` sans `&lot=` les lance TOUS, dans cet ordre.
- **Forme d'un fichier** : `export default function (jeu) { jeu.ajouterTest('L-A', 'cadence FA-24', async (t) => { …
  return { ok, attendu, obtenu }; }, { delai: 60, apresFusion: false }); … }`. Un test qui lève une exception échoue (la
  pile va dans `obtenu`). `t = { graine, mesurer, attendre(s), images(n), temps(nom, mesure, seuil), note(nom, valeur) }`.
  `apresFusion: true` = un test qui exige le VRAI module d'un autre lot de la même vague : sauté avant la fusion, lancé
  seulement avec `&fusion=1` (F2, vague 3, INT).
- **Chaque test part d'un état propre** : le harnais quitte la partie en cours (`quitter('balade')`), rappelle
  `placerAuDepart()`, `input.purger()`, remet les réglages EN MÉMOIRE (copie prise au démarrage : un test n'écrit jamais
  `iris.settings.v1`), vide `journalAudio`, attend 2 images (par `t.images(2)`, donc sans dépendre de rAF). Délai par
  test : 120 s par défaut.
- **Les seuils de TEMPS** passent par `t.temps(nom, mesure, seuil)` : sous `&calme=1` (intégration, machine calme) un
  dépassement échoue ; sans, un dépassement de moins de 50 % est noté dans `__rapport.signales` (le test réussit) et au-delà
  il échoue (règle 10). Une mesure faite pendant que l'onglet était caché (images faites à la main) est notée « non
  valable » dans `__rapport.signales` et ne fait JAMAIS échouer un test (sauf sous `&calme=1`, où l'onglet doit être
  devant : le test échoue alors avec « onglet caché »). Les seuils de COMPTE (appels, programmes, nœuds, écarts, octets) ne sont JAMAIS relatifs. Toute
  mesure d'appels ou de triangles se fait après `__jeu.figerQualite(true)` et `await __jeu.qualite('moyenne')` (ou
  `'haute'` quand le seuil le dit).
- **`window.__rapport`** = `{ lot, ok, total, echecs: [{ nom, attendu, obtenu }], signales: [{ nom, mesure, seuil }],
  mesures: { nom: valeur }, ms, url, qualite, telephone, fini: true }`.
- **`rejouerBalade()`** rejoue SANS boucle d'images ET SANS HASARD, donc au bit près. Le code d'aujourd'hui n'est pas
  reproductible tel quel : `couches.js:53` tire la phase de respiration au hasard et `couches.js:252-254` le regard
  errant ; ils bougent l'os `Head`, sur lequel est posée la vue 1 (`game.js:1018-1022`) et qui règle en vue 3
  `_voitTete`/`_dansLImage`, donc `_camLibre`, donc le cap assisté (`_assistCap`, `game.js:878-924`, qui lit aussi
  `performance.now()` par `camManuT`), donc `camYaw` et `_decalCmd`, donc la direction de marche : le hasard remonte
  jusqu'aux positions. D'où, DANS CET ORDRE, au début de chaque passe (et pareil dans `enregistrer_balade.js`) :
  (a) `Math.random` remplacé par un xorshift32 semé (graine 1) et `performance.now` par l'horloge simulée du rejeu
  (`1e6 + n × 1000/120` ms, `n` = pas du rejeu) ; TOUT le rejeu tient dans UNE tâche JavaScript synchrone (aucun `await` :
  la boucle rAF du jeu ne peut pas s'intercaler) ; les deux fonctions sont rendues dans un `finally` ;
  (b) remise à zéro de ce que `placerAuDepart()` (`game.js:359-375`) ne remet pas : `u.couches = new Couches(u)` (sous le
  hasard semé), mélangeur et clips arrêtés (`u.animKey = null`, `u._clipAvant = undefined`), `game._cam = null`,
  `game.camManuT = undefined`, `game._omCap = 0`, pointeur libéré (`document.exitPointerLock?.()`), puis `placerAuDepart()` ;
  (c) puis 2 400 pas de `game.update(1/120)` appelés à la main (`Player.poseVisible` vrai au 2e pas de chaque paire, comme
  `frame` à 60 im/s), les pressions et relâchements du script aux pas fixés (avancer, tourner de 90° par `camYaw`, sprint
  jusqu'à vider l'endurance, saut, marcher, s'asseoir sur le siège le plus proche de la salle d'attente, se lever, sortir
  par la porte 6 et rentrer), et tous les 2 pas `carte.maj(1/60, game)`, `updateCamera(1/60)`, `input.endFrame()`. Deux
  passes : vue 3 (caméra V2) et vue 1. Un échantillon toutes les 0,5 s : `{ t, x, y, z, fx, fz, camYaw, cam: [x, y, z],
  q: [x, y, z, w] }`. Écart permis : **positions, cap et `camYaw` 1e-9 ; caméra 1e-6** — sauf si l'AUTO-CONTRÔLE a échoué
  (ci-dessous). La référence `tests/reference_balade.json` est ENREGISTRÉE PAR LE SOCLE SUR `a8b22dd` (§ 5.4, étape 0)
  par `tests/enregistrer_balade.js`, qui contient la même suite de commandes et les mêmes (a) et (b), et marche sans
  harnais (collé dans la console d'un arbre `a8b22dd`), en profil PC ET en `?tel=1`. **Auto-contrôle** : la référence
  est enregistrée DEUX FOIS, dans deux onglets frais ; si les deux passes divergent au-delà des seuils, les seuils
  deviennent 1e-6 m pour les positions (et le cap, `camYaw`) et 1e-3 pour la caméra, écrits dans
  `reference_balade.json.seuils` (lus par `rejouerBalade`) et notés au rapport S0 avec l'écart mesuré.
- **Ajouts du socle à l'API** (ils servent le § 6) :
  `__jeu.verifierSieges() → { total, assis, refus: [i], ms }` — pour chacun des sièges de `game.siegesTous` (au niveau du
  siège : `carte.maj` appelé pour refiltrer `game.sieges`) : si le siège a `s.rang` (place au milieu d'un rang serré, qu'on
  ne prend qu'en se faufilant, `player.js:770-787` — « posé à 0,6 m devant » mettrait Haythem DANS la boîte du rang, et
  `resoudre` l'en sortirait à plus de 1,1 m), Haythem est posé SUR la ligne du rang (`u.rang = { R: s.rang, t: s.t, ox: 0,
  oz: 0 }`, position `(R.ax + R.ux·t, R.sol, R.az + R.uz·t)`) ; sinon à 0,6 m devant lui et face à lui ; `interact` pressé, assis en ≤ 1,5 s
  simulée, relevé, puis `C.libre` à sa position ;
  `__jeu.verifierAscenseur() → { appel, montee, descente, ms }` — en balade : appel au RDC, cabine montée au 2e et
  redescendue, en simulation (pas fixes, comme `rejouerBalade`) ;
  `__jeu.instantane() → { portes: [{ nom, k, off }], ascenseur, formesOff, bornes, profil, vue, sieges, enfants, lumieres,
  decalCmd, miroirCoupe }` — l'école « telle qu'en balade », comparée avant une partie et après sa sortie ;
  `__jeu.verifierRaf() → { rafParSeconde, cache }` — compte les rAF pendant 1 s ; le harnais bascule de lui-même sur les
  images faites à la main si l'onglet est caché ou si rAF est bridé (< 20 par seconde) ;
  `__jeu.oublierCache() → Promise` — désinscrit le service worker de l'origine et vide `caches` (un `.glb` changé dans
  un arbre de lot n'est pas servi périmé, piège 18 du cœur).

---------------------------------------------------------------------------------------------------------------------

## 5. LES LOTS DE CONSTRUCTION

### 5.0 Le calendrier en une figure
```
VAGUE 1    S0  SOCLE ............................................ 1 agent ; master a8b22dd → branche `socle`
VAGUE 2    14 lots EN PARALLÈLE, chacun depuis `socle`, dans son arbre, sur son port :
           L-A armes et balistique · L-B mouvement et caméras · L-W modèles d'armes · L-V arme de vue
           L-C corps des acteurs · L-D navigation, pilotage, apparitions · L-E règles du combat et stand
           L-K registre, déguisements, corps des props · L-F règles du prop hunt et sons · L-G HUD
           L-U menus et options · L-H effets et sons · L-I tactile, manette, assistance · L-M le monde en partie
VAGUE 2,5  F2  FUSION de la vague 2 ............................... 1 agent ; `socle` + 14 branches → `vague2`
VAGUE 3    4 lots EN PARALLÈLE depuis `vague2` : L-J IA du combat · L-O IA du prop hunt · L-P progression · L-Q killcam
VAGUE 4    INT INTÉGRATION .................................... 1 agent ; `vague2` + 4 branches (+ lot R) → `integration`
                                                                   → master (avance rapide, v3.0)
EN MÊME TEMPS  lot R (autre agent : branche `p-pause-1015`, arbre verrouillé `p-pause-1015-b` sous `.claude/worktrees/`) :
               `js/ecole_soussol.js` et `js/ecole_amphi.js` SEULEMENT (vérifié le 22/10 : 1aec791, 0e8b3ea, un seul fichier)
```
**Les 14 lots du § 0 sont gardés.** Par rapport aux 10 lots de `conception_archi` § 6.3 : la vue a été coupée en trois
(L-B mouvement et caméras · L-W modèles · L-V arme de vue) parce que modéliser et animer l'arme sont deux métiers à eux
(≈ 1 600 lignes) et que c'est là que se joue le ressenti ; le HUD et les menus en deux (L-G · L-U : fichiers et écrans
disjoints, `ui.js` au seul L-U) ; le prop hunt en deux (L-K le registre touche 7 fichiers de carte et se teste seul,
L-F les règles) ; l'IA part en vague 3 (arbitrage 34). Aucun lot ne dépasse ≈ 2,5 jours d'un agent.

**Ordre de fusion de F2** (chaque fusion est sans conflit par construction ; l'ordre sert à faire tourner les tests de la
branche fusionnée sur une base qui a déjà ses dépendances réelles) : S0 → L-M → L-K → L-D → L-A → L-B → L-W → L-V → L-C →
L-H → L-E → L-F → L-G → L-U → L-I. **INT** : `vague2` → L-J → L-O → L-Q → L-P → lot R (s'il n'est pas déjà dans `vague2`).

### 5.1 Les règles communes des lots (en plus du § 4.1)
1. **Arbres et branches.** `git -C C:/Users/hgami/Downloads/IRIS worktree add ../IRIS_lots/<clé> -b lot/<clé> socle`
   (vague 3 : `… vague2`) ; F2 : `-b vague2 socle` ; INT : `-b integration vague2`. Personne ne travaille dans
   `C:/Users/hgami/Downloads/IRIS` (l'arbre de Haythem, sur master) sauf INT pour l'avance rapide finale. Personne ne
   touche `.claude/worktrees/` ni les branches `p-pause-1015*` (lot R), ne fait `git worktree prune`, ni `git push`.
2. **Ports** (un par agent ; LA CAGE garde 8123, Haythem 8124) :

| Clé | Lot | Port | Branche (depuis) | Fichier de tests |
|---|---|---|---|---|
| S0 | socle | 8130 (référence `a8b22dd` : 8129) | `socle` (`a8b22dd`) | `test_socle.js` |
| L-A | armes et balistique | 8131 | `lot/L-A` (`socle`) | `test_armes.js` |
| L-B | mouvement et caméras | 8132 | `lot/L-B` | `test_mouvement.js` |
| L-W | modèles d'armes | 8133 | `lot/L-W` | `test_modeles_armes.js` |
| L-V | arme de vue | 8134 | `lot/L-V` | `test_viewmodel.js` |
| L-C | corps des acteurs | 8135 | `lot/L-C` | `test_corps.js` |
| L-D | navigation, pilotage, apparitions | 8136 | `lot/L-D` | `test_nav.js` |
| L-E | règles du combat et stand | 8137 | `lot/L-E` | `test_combat.js` |
| L-K | registre, déguisements, corps des props | 8138 | `lot/L-K` | `test_meubles.js` |
| L-F | règles du prop hunt et sons | 8139 | `lot/L-F` | `test_prop.js` |
| L-G | HUD | 8140 | `lot/L-G` | `test_hud.js` |
| L-U | menus et options | 8141 | `lot/L-U` | `test_menus.js` |
| L-H | effets et sons | 8142 | `lot/L-H` | `test_effets.js` |
| L-I | tactile, manette, assistance | 8143 | `lot/L-I` | `test_mobile.js` |
| L-M | le monde en partie | 8144 | `lot/L-M` | `test_monde.js` |
| F2 | fusion de la vague 2 | 8150 | `vague2` (`socle`) | `test_fusion.js` |
| L-J | IA du combat | 8151 | `lot/L-J` (`vague2`) | `test_ia.js` |
| L-O | IA du prop hunt | 8152 | `lot/L-O` (`vague2`) | `test_ia_prop.js` |
| L-P | progression | 8153 | `lot/L-P` (`vague2`) | `test_progression.js` |
| L-Q | killcam | 8154 | `lot/L-Q` (`vague2`) | `test_killcam.js` |
| INT | intégration | 8160, puis master sur 8124 | `integration` (`vague2`) | `test_integration.js` |

3. **Le navigateur** : le navigateur INTÉGRÉ (le panneau du bureau, sur `127.0.0.1`), un seul onglet par agent, jamais
   l'extension Chrome (deux extensions sont reliées au compte de Haythem : l'une pilote un autre PC). Serveur lancé en
   tâche de fond dans SON arbre (`python serve.py <port>`), arrêté à la fin avec l'onglet. **File d'attente : 3 pages de
   jeu ouvertes au plus, tous agents confondus** (14 écoles entières ouvertes ensemble dépasseraient les ≈ 16 contextes
   WebGL de Chromium — le plus ancien est perdu, `hoops-gpu-perdu`, `game.js:275-280` —, la mémoire partagée de la
   Radeon 660M, et les onglets d'arrière-plan n'ont plus de rAF) : un agent PREND un jeton avant d'ouvrir une page de
   jeu, par `mkdir C:/Users/hgami/Downloads/IRIS_lots/_navigateur/jeton_<1|2|3>` (atomique : le premier qui réussit
   l'a ; il y écrit `qui.txt` = sa clé et l'heure), fait SA série de tests, FERME l'onglet, puis RENDS le jeton (`rm -r`
   du dossier) ; aucun jeton libre → il attend (nouvel essai toutes les 30 s) en continuant son code. Un jeton dont
   `qui.txt` a plus de 45 min est périmé : on peut le reprendre (en le notant au rapport). Le dossier `_navigateur/` est
   créé (vide) par S0. Le harnais tient de toute façon sans rAF (§ 4.10) ; les temps mesurés onglet caché sont « non
   valables ».
4. **Contre le squelette.** Un lot qui a besoin du module d'un autre lot de la même vague code contre le SQUELETTE du socle
   (signatures figées, données complètes, corps minimal qui marche), ne recopie jamais le travail de l'autre, et écrit
   ce qu'il attend du vrai dans un test `apresFusion: true` : F2 le rejoue sur la base fusionnée.
5. **Un lot est FINI quand** : (a) `&rapport=1&lot=<clé>` donne `__rapport.ok` (les temps peuvent être « signalés ») ;
   (b) `&rapport=1&lot=S0` passe ENCORE sur sa branche (balade au bit près, entrées, cycles : le § 6 de base) ; (c)
   `python -I tools/verifier_proprietaires.py lot/<clé>` passe (fichiers ET pureté) ; (d) commits préfixés `<clé> : …`
   avec les lignes d'attribution ; (e) rapport écrit et commité (`docs/jeu/rapports/<clé>.md`) ; (f) onglet et serveur
   fermés, jeton du navigateur rendu.
6. **Le rapport** : `docs/jeu/rapports/<clé>.md` DANS L'ARBRE DU LOT, commité avec lui (et non dans le dossier temporaire
   d'une session, volatil : un repreneur doit le trouver dans la branche), tenu à jour AU FIL DE L'EAU (une
   section « où j'en suis » en tête, pour qu'un agent repreneur sache où reprendre après une coupure) : ce qui est fait,
   le `__rapport` collé, les mesures (relatives), les écarts au document (avec le § et la ligne), les DEMANDES (signature à
   changer, valeur d'un autre lot, prise manquante), ce qui reste, les photos regardées.
7. **Commits** petits et fréquents (au moins un par étape testée), jamais de réécriture d'historique de `socle` ou de
   `vague2`. Un lot ne touche jamais `harnais.js`, `constantes.js`, `commande.js`, `tests/reference_balade.json`, ni
   `docs/jeu/` hors de SON rapport : un défaut du socle ou de ce document va dans le rapport, F2 le corrige.
8. **Les valeurs du § 3** sont écrites telles quelles dans la table nommée en tête du fichier propriétaire ; un désaccord
   va dans le rapport (la vague 3 et l'intégration règlent).

### 5.2 Les propriétaires
Fichiers NEUFS : § 4.2 (le socle pose le squelette de chacun ; vague 3 et INT dans la même liste). Fichiers EXISTANTS :

| Fichier existant | Socle (prises § 4.4) | Vague 2 | Vague 3 | Vague 4 |
|---|---|---|---|---|
| `js/game.js`, `js/input.js`, `js/settings.js`, `js/main.js` | oui | — | — | INT |
| `js/chargement.js` | l. 577 | — | — | INT (astuces l. 465-476) |
| `index.html` | 4 liens CSS (l. 23) | — | — | INT (sous-titre l. 128) |
| `css/style.css` | — | — | — | INT (si besoin ; tout le neuf est dans `css/jeu/`) |
| `js/player.js`, `js/couches.js` | oui | **L-C** | — | INT |
| `js/avatar.js`, `js/fit.js` | — | **L-C** (si besoin) | — | INT |
| `js/collisions.js` | bande `haut`/`bas` | — | — | INT |
| `js/kit_decor.js` | l. 539 | — | — | INT |
| `js/fx.js` | passe superposée | **L-H** | — | INT |
| `js/audio.js` | l. 18-27 (`creerContexte`) | **L-H** | — | INT |
| `js/ui.js` | — | **L-U** | — | INT |
| `js/touch.js`, `js/manette.js` | — | **L-I** | — | INT |
| `js/manette_menus.js` | `ajouterRacine` | **L-I** | — | INT |
| `js/ecole_portes.js` | l. 65 (`fermerRegistre`) | **L-M** | — | INT |
| `js/ecole_visibilite.js`, `js/ecole_ascenseur.js`, `js/carte_ecole.js` | — | **L-M** | — | INT |
| `js/ecole_mobilier.js`, `js/ecole_pieces.js`, `js/ecole_hall.js`, `js/ecole_etage1.js`, `js/ecole_etage1_pause.js`, `js/ecole_etage2.js`, `js/ecole_kahn.js`, **`js/ecole_est.js`, `js/ecole_soussol_est.js`, `js/ecole_rdc_centre.js`** | — | **L-K** (étiquettes) | — | INT |
| `js/ecole_soussol.js`, `js/ecole_amphi.js` | — | — | — | **lot R** (fusionné tel quel par F2 ou INT) |
| `assets/tel/*.glb` (6 avatars, neufs) | copiés de LA CAGE | lus par L-C, L-U | — | — |
| `docs/jeu/` (neuf) | copies des documents | chaque lot : `docs/jeu/rapports/<clé>.md` seulement | idem | INT (`docs/jeu/rapports/INT.md`) |
| `sw.js`, `assets/chargement.json`, `tools/liste_chargement.py`, `tools/chargement_releves.json`, `README.md`, `CREDITS.md`, `Lancer.bat`, `manifest.webmanifest` | — | — | — | INT (`sw.js` : tests hors cache) |
| tous les autres (`demarrage`, `phone`, `emotes`, `anim`, `appareil`, `config`, `ombre*`, `eclairage_perso`, `weather`, `nuages`, `sonde_ciel`, `options_rendu`, `util`, `ecole_*` restants), `serve.py`, `vendor/` | — | — | — | personne (lus) ; INT seulement pour un défaut bloquant, noté |

Fichiers NEUFS hors `js/jeu/` : `assets/portraits/*.webp` et `tools/portraits/*` → **L-U** ; `tools/proprietaires.json`,
`tools/verifier_proprietaires.py` → S0 (F2 et INT peuvent changer `proprietaires.json`, noté).

**Vague 3** (§ 5.7) : L-J `cerveau.js` + `pilotage.js` + `nav.js` ; L-O `cerveau_prop.js` + `deguisements.js` + `partie_prop.js` ;
L-P `profil.js` + `series.js` + `menu_progression.js` + `armes_au_sol.js` + **`aff_progression.js`** (l'AFFICHAGE des
armes au sol, de la sentinelle et du drone : `series.js` et `armes_au_sol.js` sont des fichiers de simulation, qui n'ont pas
le droit d'importer l'affichage) + `css/jeu/progression.css` + `partie_fps.js` + `hud_jeu.js` + `menus_jeu.js` ; L-Q
`killcam.js` + `partie.js` (ajouts) + `vue_fps.js` + `viewmodel.js` + `anim_vue.js` + `effets.js`. Les quatre listes sont
disjointes. (L'armurerie de L-P montre l'arme par `aff.viewmodel.vitrine(id)`, posée par L-V en vague 2 : L-P n'a pas à
toucher `viewmodel.js`.)

`tools/proprietaires.json` (socle) : `{ "base": { "S0": "a8b22dd", "L-A": "socle", …, "F2": "socle", "L-J": "vague2", …,
"INT": "vague2" }, "fichiers": { "<clé>": [chemins ou motifs] }, "simulation": [fichiers soumis à la pureté],
"interdits": ["js/ecole_soussol.js", "js/ecole_amphi.js"] }`. `python -I tools/verifier_proprietaires.py <branche>` :
`git diff --name-only <base>...<branche>`, refuse tout fichier hors de la liste du lot (F2 et INT : tout, sauf les
interdits hors fusion du lot R), puis cherche dans les fichiers « simulation » `Math.random`, `performance.now`,
`Date.now`, `Raycaster`, `DecalGeometry`, `Light(` et `.input.` / `Input`, sauf sur une ligne marquée
`// hors simulation`, permise à DEUX endroits seulement : `PartieProp.lireExtra` (la roue, lue à l'étape 2 du pas) et
`Partie.image` (Tab tenu pour le tableau ; le chronomètre de `Partie.pas` qui décide la dégradation du § 4.3.2 —
appliquée au pas SUIVANT, gardée dans `partie.degrade`, figée par `verifierDeterminisme`) ; et dans TOUT
`js/jeu/` sauf `viewmodel.js` : `Light(` (sans exception : les portraits sont des images, `tools/` est hors de
`js/jeu/`). Fichiers
« simulation » : `constantes`, `rng`, `commande`, `acteur`, `partie`, `partie_essai`, `partie_fps`, `partie_stand`,
`partie_prop`, `armes`, `balistique`, `touches`, `grenade`, `mouvement`, `corps_prop`, `deguisements`, `nav`,
`pilotage`, `apparitions`, `cerveau`, `cerveau_prop`, `monde_partie`, `series`, `armes_au_sol` (et
`js/registre_meubles.js`). Sortie : `OK <n> fichiers` ou la liste des fautes, code de retour 1.

### 5.3 Les prises de la carte (L-M) et les étiquettes des meubles (L-K)
Toutes sans effet en balade (conditionnées par `Portes.pilotees`, `jeu.partie`, `vis.forcees`, ou une simple donnée
lue par personne d'autre) ; lignes de `a8b22dd`, à revérifier par le lot.

**L-M (4 fichiers)** :
- `js/ecole_portes.js` — (a) `forcer(P, k)` : `P.k = k`, vantaux posés comme `maj` les pose à `k`, `P.forme.off = k > 0,5`
  (une porte 'auto' ouverte n'a AUCUNE forme le long de son vantail, `ecole_portes.js:606` ; seul l'état `'ouverte'` en
  construit une, l. 543-548 : la boîte mince du vantail ouvert est donc ajoutée par `MondePartie.preparerSession`, avec
  le même calcul, `{ vantail: true, porte: nom }`, éteinte hors partie) ;
  (b) `pilotees = false` : `maj` (l. 580-609) rend la main tout de suite quand il est vrai (la partie anime ses portes
  'auto' dans `Partie.pas`) ; (c) `_formePorte` (l. 561) : `vitre: true` pour les modèles vitrés (la balle traverse à
  80 %) ; (d) chaque porte a un `nom` stable (celui de la table § 4.5.19 ; à défaut `P.g.name`) et `liste()` les rend
  toutes, automatiques ou non ; (e) `instantane()` / `restaurer(i)` ; (f) la 1re ligne de `fusionnerLocal` (l. 65,
  `fermerRegistre(g)`, posée par le socle) reste la 1re.
- `js/ecole_visibilite.js` — `this.forcees = null` ; quand c'est un `Set` (posé par `MondePartie.entrer`, remis à `null`
  par `sortir`), une pièce de `FERMEES` (l. 392-398) dont une porte du `Set` est OUVERTE est traitée `toujours`
  (`fermeesVues`, l. 329-335) ; `null` = le chemin d'aujourd'hui, instruction pour instruction.
- `js/ecole_ascenseur.js:456` — 1re ligne de `majAscenseur` : `if (jeu.partie) return;` (cabine immobile, portes palières
  fermées, formes de passage allumées : des murs) ; `instantane()` / `restaurer(i)`.
- `js/carte_ecole.js` — l. 628 (le « jour » de l'escalier) : `balle: false` à côté de `camera: false` ; dans le retour
  (l. 2465-2475) : `visibilite`, `ascenseur` (s'ils n'y sont pas déjà joignables par `chantier`) et `miroirAccueil`
  (`window.__miroirAccueil?.etat ?? null`, lu juste après `construireAccueil(ch)`, l. 1780) ajoutés à l'objet rendu ;
  l'étiquette de l'extincteur du hall ouest (l. 1198-1222).
- `js/ecole_ascenseur.js` — en plus de la l. 456 : l'étiquette de l'extincteur au pied de l'ascenseur (l. 421).

**L-K (10 fichiers, une ligne par constructeur, AUCUNE géométrie touchée, AUCUN import ajouté)** : l'étiquette est une
donnée, `g.userData.meuble = { type, nom, variante?, mural?, surPlace?, voile? }`, posée sur le groupe du meuble avant son
`add` (la chaise coque porte `voile: false` : son voile au sol est déjà dans son groupe, `ecole_mobilier.js:122-123`).
En plus des 7 fichiers ci-dessous, L-K possède `js/ecole_est.js` (l'extincteur de la bande sud, vers la l. 1673),
`js/ecole_soussol_est.js` et `js/ecole_rdc_centre.js` : il y étiquette tout exemplaire d'un type déguisable que
`verifierMeubles().nonEtiquetes` y trouve (ces fichiers n'avaient aucun propriétaire en vague 2). Constructeurs (lignes de `conception_prophunt` § 5.3) : `ecole_mobilier.js` chaise coque l. 109 (variante =
couleur, à passer depuis l. 182-184), borne l. 213, présentoir l. 237 (`mural`), extincteur l. 369 (`mural`) ;
`ecole_pieces.js` paramètre `type` facultatif de `groupe(…)` l. 153 → chaise moutarde l. 2125, marine l. 2136, luge
l. 1255, de bureau l. 874, plante l. 955, corbeille l. 975 ; `ecole_hall.js` `groupe` l. 483 → fauteuil l. 522 (variante
`zebre`/`uni`), photocopieur l. 554 (`mural`, `surPlace`), affranchisseuse l. 575 ; `ecole_etage1_pause.js` mange-debout
l. 787, Miura l. 820, coque l. 848, chaise de hêtre l. 1157, distributeurs de la niche ; `ecole_etage1.js` chaise l. 688,
fauteuil l. 704, extincteur l. 783, plante l. 793 ; `ecole_etage2.js` extincteur l. 729, chaise visiteur l. 968, chaise en
écusson l. 1005 ; `ecole_kahn.js` chaise l. 695. Le −1 est étiqueté par le lot R (`{ type, nom, formes }`, arbitrage 36) ;
la rue n'est pas étiquetée (hors prop hunt).

### 5.4 VAGUE 1 — S0, LE SOCLE (1 agent, port 8130, ≈ 2 400 lignes, ≈ 2,5 jours)

Il pose TOUT ce dont les 14 lots ont besoin pour travailler sans se voir : les prises dans les fichiers existants (§ 4.4,
toutes), les contrats (§ 4.5) au caractère près, chaque fichier de `js/jeu/` avec ses DONNÉES complètes et un corps
minimal QUI MARCHE, le câblage de l'affichage, le harnais (§ 4.10), la référence de la balade, les outils des
propriétaires. Rien de lui ne doit être « joli » ; tout doit être JUSTE et figé.

**Étape 0 — la référence, avant toute modification.** `git -C … worktree add ../IRIS_lots/ref a8b22dd --detach` ;
`python serve.py 8129` dans `ref` ; `tests/enregistrer_balade.js` (rejeu DÉTERMINISTE, § 4.10.1 (a) à (c) : hasard semé,
horloge simulée, remise à zéro, une seule tâche synchrone) copié NON SUIVI dans `ref` et collé dans la console :
(1) profil PC, (2) `?tel=1` avec l'émulation mobile du navigateur intégré (tactile actif) ; **chacun DEUX FOIS, dans deux
onglets frais** (auto-contrôle : si les deux passes divergent au-delà de 1e-9 / 1e-6, les seuils de la référence passent à
1e-6 m et 1e-3, notés). Il produit
`js/jeu/tests/reference_balade.json` = `{ seuils: { pos: 1e-9, cam: 1e-6 } (ou ceux de l'auto-contrôle), ecartAuto,
pc: { vue3: [41 échantillons], vue1: [41] }, tel: { … }, sieges: { n: 346, empreinte }, tactile: <__touch._contexte() en
balade, au départ>, optim: '<la ligne [optim] de la console>', programmes, lumieres: <lumières de la scène>, instantane:
<§ 4.10.1>, hud: <empreinte du innerHTML de #hud en balade> }`. L'arbre `ref` est ensuite retiré (`git worktree remove`).

**Étape 1 — les prises (§ 4.4), dans cet ordre** : `collisions.js` (bande) → `player.js` et `couches.js` (découpe de
`update`, drapeaux, bande `hautCorps`/`basCorps` à `C.deplacer`, `dispose` avec le bonhomme de secours, chargeur
discret) → `input.js` → `settings.js` → `audio.js` (`creerContexte`) → `game.js` (dont `enterLobby({ aide })`,
`appliquerProfil({ purger })`, `setListener` déplacé, roue à la souris, reprise selon l'entrée, carte du menu) →
`main.js` (dont l. 74) → `chargement.js` → `fx.js` → `manette_menus.js` → `ecole_portes.js:65` et `kit_decor.js:539`
(`fermerRegistre`) → `index.html:23`. Le socle écrit `harnais.js` (et `rejouerBalade`) EN PREMIER et le rejoue après
chaque prise.

**Étape 2 — les contrats complets** (propriété du socle, figés) : `constantes.js` (§ 4.5.1, les 9 zones de jeu
complètes : `pieces` listées, départs), `rng.js`, `commande.js`, `acteur.js` (dont `CorpsFixe`), `partie.js` (§ 4.5.5 :
`pas` § 4.3.2 avec l'étape 6 en deux temps — `differer` / `appliquerEffets` —, `image` § 4.3.3, `camera` § 4.3.4,
`majHud` (dont `aveugle` et `allies`), `infliger`, `resoudreTir` de base avec le `frole` = balle passée à < 1,5 m d'une
tête, `signaler`, `attendreClic` / `besoinCapture` et le calque § 4.3.5, `roueOuverte` / `mouvementSouris` /
`mouvementStick` neutres, événements, état § 4.7), `partie_essai.js`, `index.js` (§ 4.5.5, `demarrer` et ses paramètres
d'adresse, `#calque-clic`, corps fictif du menu et `game.carteMenu`), `harnais.js` (§§ 4.10 et 4.10.1 : images sans rAF,
`OfflineAudioContext` et `journalAudio`, rejeu déterministe, `verifierSieges` par les rangs, `verifierRaf`).

**Étape 3 — les squelettes** (données complètes + corps minimal qui marche ; le propriétaire réécrit le corps) :

| Fichier | Le socle y pose | Le propriétaire y met |
|---|---|---|
| `armes.js` | `ARMES` (§§ 3.3-3.4 au complet ; dispersion de la FA-24 seule), `CLASSES`, `DOTATION_CHASSEUR`, `degatsDe` exact ; `Arsenal` : prêt / tir (cadence AVEC REPORT DU RESTE, § 3.3 ; auto, semi avec tampon 0,1 s) / recharge (tactique, à vide, balles entrées au temps de la fiche) / changement ; visée 0 → 1 au temps d'ADS ; `prendreRecul(out) → { v, h }` (rad, remis à zéro : le squelette rend 0) ; `ajouterChargeur()` exact ; ni recul, ni dispersion, ni couteau, ni grenade | L-A |
| `balistique.js` | `vue` et `balle` par `C.rayonLibre` (rayon 0, approximatifs : ni sols ni vitres) ; `tirer` = monde puis `rayonActeurs` ; `EXCEPTIONS_PREFILTRE` vide | L-A (DDA) |
| `touches.js` | `ZONES`, `capsules` aux formules du § 4.5.6 (sans la tête avancée), `rayonActeurs` exact | L-A |
| `grenade.js` | `Grenades` : chute balistique, arrêt au sol (`solEn`), explosion à la mèche, dégâts sans ligne de vue | L-A |
| `mouvement.js` | `ALLURES` ; `appliquerCommande` : cap = lacet, axe tourné, course 5,00 / sprint 6,60 par `speedMul`/`sprintMul`, saut fixe 3,15 m/s, `move` + `simuler`, `stamina = 100`, événement `pas` tous les 0,7 m ; `hauteurOeil` (debout 1,62 / accroupi 1,08, × h/1,73) ; `vitesseSaut` ; `separer` déjà PAR LE MONDE SOLIDE (`ra + rb`, `C.deplacer`, ≤ 0,05 m par pas, angle déterministe pour deux centres confondus) ; **`franchissable` ÉCRITE EN ENTIER** (critère du § 3.1 ; L-B et L-D l'appellent, personne ne la change sans passer par F2) | L-B |
| `entrees_jeu.js` | `lireCommande` : axes, sprint (et `sprintTact` : double Maj ou SOURIS 5), saut, tir, visée, recharger, `armeN` 1/2, recul consommé par `prendreRecul` (rend 0 au squelette), lacet/tangage de `game`, `seq++`, `corriger` appelé | L-B |
| `vue_fps.js` | `VueFPS` : caméra posée à l'œil, `rotation.set(-(tangage − 0,15·reculV·DEG), lacet − 0,15·reculH·DEG, 0, 'YXZ')` (reculs à 0 au squelette), champ de `controls.fps.champ`, capture du pointeur (`unadjustedMovement` + repli), corps local caché, superposition poussée ; `fx.flash = 1` sur le `flash` local ; `etatArme()` complet (champs à 0) ; `mort()` = 3 s fixes | L-B |
| `camera_orbite.js` | `CameraOrbite` : orbite à distance fixe, `rayonLibre` r 0,15, sans lissage | L-B |
| `modeles_armes.js` | `MATERIAUX_ARMES`, `REPERES` (§ 4.5.8, complets) ; `creerArme` = une boîte par arme à l'encombrement du § 3.3, repères posés | L-W |
| `viewmodel.js` | `Viewmodel` : sa scène, sa caméra (52°, near 0,01, far 5), SES TROIS LUMIÈRES (hémisphère, directionnelle, ponctuelle à 0), SA carte d'environnement de studio (PMREM de `RoomEnvironment`), la boîte de l'arme posée en hanche, `superposition`, `montrer`/`cacher`, `vitrine(id)` (la boîte qui tourne) ; `preparer` compile | L-V |
| `anim_vue.js` | `POSES_VUE` (§ 4.5.9, complets), `CHRONOS` (temps des fiches, sans clés), `evaluer` linéaire | L-V |
| `avatars.js` | `FICHES_BOTS` (§ 4.5.10 + `js/roster.js` de LA CAGE) ; `preparerAvatars` charge `assets/haythem.glb` pour tous (les 6 avatars des amis sont déjà copiés dans `assets/tel/` par le socle, mais leur chargement réglé est le travail de L-C) ; `creerCorps` = `new Player` + drapeaux ; `libererCorps` | L-C |
| `teintes.js`, `pose_arme.js`, `accroupi.js` | fonctions vides aux signatures exactes | L-C |
| `poupee.js` | `Poupee` : le corps reste debout 4 s puis se cache | L-C |
| `cadence_acteurs.js` | tous dessinés, tous posés à chaque image, ombre au niveau de la caméra | L-C |
| `nav.js`, `nav_cache.js` | `Nav.obtenir` rend une navigation « à vol d'oiseau » (`nb = 0`, `noeudPres → -1`, `demander` rend la cible tout de suite, `restreindre` sans effet, `distancePied` = distance droite, `typeLien` vide), pour les deux graphes ; cache sans effet | L-D |
| `pilotage.js` | `Pilote` en ligne droite (axe relatif au lacet), `coince` après 3 s ; `Errant` : de point d'apparition en point d'apparition, ou vers `vers(acteur)` s'il est donné | L-D |
| `apparitions.js` | `POINTS_APPARITION` (les 20 de `carte_monde` § 8) ; `departs` (points de `ZONES_JEU` espacés de 1,5 m) ; `choisirApparition` = le point de la zone le plus loin (à vol d'oiseau) des ennemis ; `ramenerPoint` = le point tel quel | L-D |
| `cerveau.js` | `DIFFICULTES` (§ 3.7, `tRepérage` ET `reaction`) ; `CerveauBase` MINIMAL QUI JOUE (§ 3.7 et § 4.5.11 : `Errant` vers le point chaud — dernier tir ou mort entendu, sinon le départ adverse — tant qu'il ne perçoit rien ; perception par `balistique.vue`, cône 60°, 50 m, jauge puis réaction ; visée par `viserVers` avec l'erreur gaussienne σ∞ et la rotation bornée ; rafales de 3-5, 0,6 s de pause ; recul compensé selon la difficulté ; recharge à vide) ; `Cerveau` | L-J (vague 3) |
| `partie_fps.js` | `PartieFPS` : `equipes` et `melee` (présentation 3 s, décompte 3 s — précédé du calque si besoin —, manche, fin au score ou au temps, réapparition 3 s, `ajouterChargeur` à l'élimination) ; `domination` retombe sur `equipes` avec une annonce | L-E |
| `partie_stand.js` | `PartieStand` : 6 cibles fixes à 8, 15, 25 m (acteurs `role: 'cible'`, corps `CorpsFixe`), sans défi | L-E |
| `js/registre_meubles.js` | `MEUBLES`, `fermerRegistre` / `rattraperRegistre` (WeakSet, clone des étiquetés, références des cousus seuls), `zonerRegistre`, `copieMeuble` — sur `a8b22dd` aucune étiquette : ils ne font rien | L-K |
| `deguisements.js` | catalogue = les types du registre + un type de SECOURS `carton` (boîte 0,45 × 0,35 × 0,45, un matériau existant) ; `viserMeuble` = le meuble le plus proche à < 3 m devant ; `deguiser`, `retirerProp`, `majProps` (racine posée, rien d'autre) ; `credibilite` → 0,5 ; `cachettes` vides ; `toucherPoses` → `null` ; `candidatsMeubles` = vraies poses du registre + props vivants à ≤ rayon, mêlés, sans marque | L-K |
| `corps_prop.js` | `CorpsProp` complet en signature (dont `rayon`), déplacement par `C.deplacer` au rayon, sans bande ; `deplacerProp` sans aimantation | L-K |
| `partie_prop.js` | `REGLAGES_PROP` (§ 3.9 complet) ; `PartieProp` : une manche présentation → cachette → traque → révélation, rôles fixes, fin quand les props sont morts ou au chrono ; chasseurs `sprintLimite` ; la SAISIE de la roue (`roue`, `roueOuverte`, `mouvementSouris`, `mouvementStick`, `lireExtra` : chiffres `provoc1-8` et G seulement) | L-F |
| `sons_prop.js` | `PROVOCATIONS` (§ 3.9, les 8) ; `SonsProp` sans effet | L-F |
| `cerveau_prop.js` | `DIFFICULTES_PROP` ; `CerveauChasseur` MINIMAL (§ 4.5.14 : `Errant` dans la zone ; toutes les 8 s un tir de test sur un candidat de `candidatsMeubles` à < 10 m qu'il voit, au hasard semé ; il ne lit jamais `role`) ; `CerveauCacheur` = se déguise en le type le plus courant de sa pièce, ne bouge plus | L-O (vague 3) |
| `hud_jeu.js`, `hud_prop.js` | un bloc de texte sous `#hud` (vie, munitions, chrono, scores, annonce) ; `RoueProvocations` = une liste texte des 8, le choix entre crochets | L-G |
| `tableau_scores.js`, `minicarte.js` | une liste texte (Tab) ; mini-carte sans effet | L-G |
| `menus_jeu.js` | `MenuJeu` : un écran `#menu-jeu` (DOM par JS) BALADE LIBRE · COMBAT · PROP HUNT · STAND DE TIR · OPTIONS, lancés aux réglages par défaut ; préparation = une barre ; fin = MENU PRINCIPAL · BALADE ; `ajouterRacine('menu-jeu')` ; `camera` = un plan fixe sur la pile « iris », qui place `corps` (le `CorpsFixe` du menu) au sol sous la caméra | L-U |
| `portraits.js` | `portrait` → `null` | L-U |
| `effets.js` | `Effets` sans effet (abonnés vides) | L-H |
| `sons_jeu.js` | `SonsJeu.jouer3d` = la recette jouée NON spatialisée sur la sortie d'`audio` ; un claquement de tir ; voix libérées sur SON horloge (`t`), jamais sur `onended` | L-H |
| `assistance_visee.js` | `corriger` sans effet ; `facteurStick` → 1 | L-I |
| `monde_partie.js` | `TABLE_PORTES_FPS`/`PROP` et `TABLE_DEPOLIS` vides ; `regleParDefaut` → 'ouverte' (combat) / 'auto' (prop hunt) ; `MondePartie` : `entrer` pose `joueur.bounds = BORNES_JEU` si la zone a la rue, `sortir` remet les bornes ; le reste sans effet ; `noeudsAutorises` → tout à 1 | L-M |
| `profil.js` | `PROFIL_CLE = 'iris.profil.v1'` ; `class Profil { charger(); enregistrer(); brancher(partie); debrancher(); get niveau(); get xp(); modificateurs(classe) → null }` sans effet | L-P (vague 3) |
| `killcam.js` | `class Killcam { constructor(game); brancher(partie); debrancher(); enregistrer(partie); get pret(); rejouer(victimeId) → Promise }` sans effet | L-Q (vague 3) |
| `aff_progression.js` | `class AffProgression { constructor(game); brancher(partie); debrancher(); maj(dt) }` sans effet | L-P (vague 3) |

**Étape 4 — le câblage de l'affichage, figé** (c'est lui qui rend les lots indépendants) :
- `installerJeu(game, deps)` crée `MenuJeu` tout de suite, son corps fictif (`menu.corps = new CorpsFixe()`) et
  `game.carteMenu = Object.create(game, { user: { value: menu.corps } })`, le calque `#calque-clic`, et sous `?test=1`
  `audio.creerContexte` et l'espion audio ; à la 1re partie, UNE fois par session, `aff = { viewmodel:
  new Viewmodel(game), effets: new Effets(game), sons: new SonsJeu(audio), sonsProp: new SonsProp(sons), hud: new
  HudJeu(game), hudProp: new HudProp(game), tableau: new TableauScores(game), minicarte: new MiniCarte(game), profil: new
  Profil(), killcam: new Killcam(game), progression: new AffProgression(game) }` (`AffProgression` : squelette posé par
  le socle dans `aff_progression.js`, rempli par L-P en vague 3 ; `Partie.image` appelle `aff.progression?.maj?.(dt)`) ;
  `game.cameraMenu = (dt, poser) => menu.camera(dt, poser)`.
- `Partie.preparer(progres)` : `monde.preparerSession()` (1re fois) → `nav` (`Nav.obtenir`, puis
  `nav.restreindre(monde.noeudsAutorises(nav, zone, id))`) → `navProps` (si `prerequis.navProps` : `Nav.obtenir(game,
  { rayon: 0.2, franchir: false })`, restreint de même) → avatars → catalogue (si `prerequis`) →
  `await aff.viewmodel.preparer(progres)` → `aff.minicarte.preparer(nav)` → `await aff.effets.preparer?.(progres)`,
  `aff.sons.preparer?.()`, `aff.hud.preparer?.()`, `aff.hudProp.preparer?.()` → compilation de la scène
  (`game._compilerAsync`) et attente des programmes. Étapes de `progres` : « Plan de l'école », « Les élèves arrivent »,
  « Armes et effets », « Meubles ».
- `entrer()` : `monde.entrer(zone, table)`, acteurs créés, vue FPS ou orbite, puis `brancher?.(this)` de `effets`, `sons`,
  `sonsProp`, `hud`, `hudProp`, `profil`, `killcam`, `progression` ; `sortir()` : `debrancher?.()` des mêmes, acteurs détruits
  (`libererCorps`, `CorpsProp.dispose`), `aff.viewmodel.cacher()`, `vue.sortir()`, `monde.sortir()`.
- `Partie.majHud()` (base, à chaque image, avant `aff.hud.maj`) remplit les champs communs de `partie.hud` depuis
  l'acteur local ; les sous-classes ajoutent les leurs (`scores`, `points`, `cibles`, `prop`…).
- Une sous-classe qui a besoin de la navigation pour s'installer surcharge `async preparer(progres)` en appelant
  `await super.preparer(progres)` d'abord (ex. `PartieFPS` en domination : anneaux ramenés par `ramenerPoint`).
Un lot peut AJOUTER à son module une méthode que ce câblage appelle avec `?.` ; il ne change pas le câblage.

**Étape 5 — les outils, les documents, les avatars** : `tests/test_socle.js`, `tests/enregistrer_balade.js`,
`tools/proprietaires.json`, `tools/verifier_proprietaires.py` (§ 5.2), `css/jeu/{hud,menus,tactile,progression}.css` (un
commentaire d'en-tête ; `hud.css` reçoit déjà les règles `body.combat` qui cachent `.stamina`, `#hud-keys`,
`#phone-badge`, `#hud-hint`, `#hud-streak`, et le style de `#calque-clic`) ; **`docs/jeu/`** = copies de
`spec_finale.md`, des trois conceptions, des cinq cartes, de `critique.md` et de `banc/*.js` (depuis le dossier du présent
document, § en-tête), et `docs/jeu/rapports/S0.md` ; **`assets/tel/{gabriel,imad,marcantoine,koji,djafar,ethan}.glb`**
copiés TELS QUELS de LA CAGE `assets/tel/` (L-C les règle et les charge, L-U en tire les portraits : les deux en ont besoin
dès la vague 2) ; le dossier vide `C:/Users/hgami/Downloads/IRIS_lots/_navigateur/` (jetons, § 5.1 règle 3).

**Crée** : les fichiers de `js/jeu/` du § 4.2 (dont `profil.js`, `killcam.js` et `aff_progression.js` de la vague 3 ;
`series.js`, `menu_progression.js` et `armes_au_sol.js` sont créés par L-P), `js/registre_meubles.js`,
`js/jeu/tests/test_socle.js`, `js/jeu/tests/enregistrer_balade.js`, `js/jeu/tests/reference_balade.json`, les 4
`css/jeu/*.css`, `tools/proprietaires.json`, `tools/verifier_proprietaires.py`, `docs/jeu/**`, `assets/tel/*.glb` (6).
**Modifie** : `js/game.js`, `js/player.js`, `js/couches.js`, `js/input.js`, `js/settings.js`, `js/main.js`,
`js/chargement.js`, `js/audio.js`, `js/collisions.js`, `js/fx.js`, `js/manette_menus.js`, `js/ecole_portes.js`,
`js/kit_decor.js`, `index.html`. **Dépend** : rien (`a8b22dd`).

**Acceptation (`test_socle.js`, `?test=1&rapport=1&lot=S0`, PC puis `?tel=1`)** :
1. `rejouerBalade()` : écart ≤ les seuils de la référence (1e-9 positions, cap, `camYaw` ; 1e-6 caméra — ou ceux de
   l'auto-contrôle, notés), vue 3 ET vue 1, profils `pc` ET `tel` ; deux rejeux de suite dans le même onglet donnent des
   échantillons IDENTIQUES au bit près ; après le rejeu, `Math.random` et `performance.now` sont les fonctions d'origine.
2. `game.siegesTous.length === 346`, empreinte des sièges = référence ; `verifierSieges()` : 346 assis sur 346, 0 refus
   (places au milieu des rangs prises par la ligne du rang, § 4.10.1).
3. `verifierAscenseur()` : appel, montée au 2e, descente — les trois vrais.
4. La ligne `[optim] … 4 198 maillages cousus en 232 blocs` identique à la référence ; lumières de la scène : même nombre.
5. `verifierEntrees()` = `{ emoteFantome: 0, sautApresPause: 0, clicDeCapture: 0, frontsVieux: 0, aideEnPartie: 0 }`
   (balade ET essai) ; le clic qui capture le pointeur ne produit aucun `Souris:0`, ni un clic dans les 150 ms qui suivent.
6. Convention de caméra : 200 couples (lacet, tangage) tirés (graine 1) — l'avant de `VueFPS` et la formule
   `(−sin l·cos t, −sin t, −cos l·cos t)` à ≤ 0,1° ; contre la vue 1 de `game.js` (convergée, `lookAt` l. 1025) : même
   AZIMUT à ≤ 0,1° et même SIGNE de tangage (son élévation vaut atan(1,0667·sin t), pas t : on ne la compare pas).
7. `lancer('essai', { graine: 42, mannequins: 3 points })` : en partie en ≤ 2 s (temps) ; œil à 1,62 ± 0,01 m au-dessus des
   pieds ; `commande(0, { tir: true }, 1)` → ≥ 10 événements `tir`, ≥ 1 `touche` sur le mannequin visé, `elim` quand sa
   vie atteint 0 ; `quitter('balade')` → `game.partie === null`, profil `balade`, `instantane()` = référence.
8. 3 cycles `lancer('essai')` / `quitter` : géométries et textures (`renderer.info.memory`) à ± 2 %, enfants de la scène
   identiques, `instantane()` identique ; programmes CONSTANTS pendant 10 s de tir en essai (après `preparer`).
9. `verifierEtat()` vrai ; `verifierDeterminisme(42, 30)` égal (essai avec 2 bots au cerveau minimal, armés).
10. `Partie.pas` (essai : 1 + 3 mannequins + 2 bots) ≤ 0,2 ms en moyenne sur 10 s (temps).
11. Chaque module de `js/jeu/` s'importe sans erreur ; chaque export et chaque méthode des §§ 4.5.1-4.5.19 existe avec son
    nombre de paramètres (table `SIGNATURES` du test, introspection : `prendreRecul`, `ajouterChargeur`, `majHud`,
    `differer`, `appliquerEffets`, `appliquerEffet`, `besoinCapture`, `attendreClic`, `roueOuverte`, `mouvementSouris`,
    `mouvementStick`, `CorpsFixe`, `franchissable`, `ramenerPoint`, `candidatsMeubles`, `vitrine`, `RoueProvocations`,
    `AffProgression`, `regleParDefaut` compris ; les méthodes FACULTATIVES de l'affichage marquées comme telles) : 0 manquant.
12. Démarrage : sans `partie=`, « APPUIE » → `mode === 'menu'`, `#menu-jeu` visible, focus manette sur BALADE LIBRE ;
    `?partie=balade` → `mode === 'lobby'`, `partie === null`, comme `a8b22dd` ; `?partie=essai` → en partie.
13. Pause et reprise : en essai, `iris-pointeur` (capture fausse) → `paused` vrai dans la même image ; « Reprendre » au
    clavier-souris → `input` purgé, capture redemandée ; refusée (capture simulée refusée) → la pause se ferme sur le
    calque « CLIQUE POUR JOUER », la partie RESTE gelée (`partie.t` n'avance pas) jusqu'au clic ; avec `entree.manette`
    vrai → reprise SANS capture, la partie avance ; au passage présentation → décompte sans capture (clavier-souris) →
    calque, décompte gelé ; manette → décompte direct.
14. `fx.superpositions` vide en balade → passe superposée `enabled === false` ; en essai → active, 1 superposition ; idem
    sur le chemin léger et sans composer (`fx.enabled = false`).
15. Réglages : un `iris.settings.v1` de `a8b22dd` aux touches de balade changées (donnée du test) → `load()` les garde à
    l'identique et ajoute `controls.combat`, `controls.prop`, `controls.fps`, `jeu` aux défauts (`habillage: 'airsoft'`,
    `prop.zone: null`).
16. `python -I tools/verifier_proprietaires.py socle` : OK ; `Light(` absent de `js/jeu/` hors `viewmodel.js`.
17. L'aide de la balade en partie : `#hud-hint` VIDE pendant 10 s d'essai, puis encore vide après un `hoops-entree`
    simulé (bascule manette ↔ clavier) et après un `settings.set(...)` ; `body.combat` cache `#hud-hint` et `#hud-streak`
    (style calculé `display: none`) ; aucun `hud.feedback` appelé en partie (espion).
18. Pas de purge en route : en essai, front `saut` pressé puis `settings.set(...)` (donc `applySettings`) dans la même image
    → le saut a lieu au pas suivant ; `appliquerProfil({ purger: true })` à l'entrée et à la sortie de partie vide bien les
    fronts.
19. Tirs simultanés : deux bots à 10 m qui se tirent dessus au MÊME pas avec des balles mortelles (vie mise à 1) → DEUX
    événements `elim` dans ce pas ; inverser leurs ids donne le même résultat.
20. Harnais sans rAF : `verifierRaf()` noté au rapport ; `__jeu.forcerImagesManuelles(true)` (chemin de l'onglet caché) →
    `images(10)` rend en < 5 s avec `valable: false`, les compteurs d'appels justes ; `photo()` rend une image non vide.
21. Son sous `?test=1` : `audio.ctx instanceof OfflineAudioContext` ; `sons.jouer3d(…, recette de 0,3 s)` → un `start`
    au journal à la date programmée, la voix encore active à `sons.t = 0,29`, libérée à `0,31` (après `avancer`) ; aucune
    voix libérée par `onended`.
22. `Player.dispose` : 20 `Player` créés puis libérés → toutes leurs géométries et tous leurs matériaux libérés, bonhomme
    de secours compris (espions sur `BufferGeometry.prototype.dispose` et `Material.prototype.dispose` : compte exact).
23. Roue (squelette du prop hunt, Haythem prop) : `provoc3` (Digit3) pressé pendant une image SANS pas de simulation →
    `cmd.provoc === 2` au pas suivant ; roue ouverte (T tenu) : un `mousemove` synthétique de 80 px vers la droite →
    `camYaw` inchangé, `roue.choix === 2` ; T relâché → `cmd.provoc === 2` ; `game.wheel.isOpen` toujours faux.
24. Menu : en `'menu'`, la carte vivante reçoit le corps fictif (`carte.maj` espionné : `user.pos` à ± 0,1 m du sol sous
    la caméra du plan) ; le stand (squelette) tourne 10 s sans exception (`CorpsFixe` des cibles interpolé).
25. Cerveau minimal : équipes 2 c. 2 de bots (`humain: false`) en zone `ss`, `avancer(120, { vitesse: 8 })` → au moins une
    élimination (ils se trouvent sans se voir au départ) ; écart angulaire médian des balles tirées à 10 m sur un buste
    immobile = σ∞ de leur difficulté ± 30 % ; prop hunt squelette, chasseur minimal : sur 40 tirs de test, la part tirée
    sur des props = leur part parmi les candidats de `candidatsMeubles` ± 20 points (il ne les distingue pas).
26. `docs/jeu/` contient `spec_finale.md`, les 3 conceptions, les 5 cartes, `critique.md`, `banc/*.js` ; `assets/tel/`
    les 6 avatars, tailles égales à celles de LA CAGE ; `C:/Users/hgami/Downloads/IRIS_lots/_navigateur/` existe.
**Ensuite** : tag `socle-ok` ; aucun lot de la vague 2 ne part avant que les 26 points soient verts.

### 5.5 VAGUE 2 — LES 14 LOTS EN PARALLÈLE (tous depuis `socle-ok`)

Chaque fiche dit : ce que le lot construit · les fichiers qu'il REMPLIT (squelettes du socle), CRÉE et TOUCHE (fichiers
existants d'IRIS) · ce dont il dépend (toujours S0 seul ; « contre le squelette de » = le module d'un autre lot qu'il
utilise avant F2) · ses critères d'acceptation, tous lisibles par `__rapport` · ce qu'il laisse à F2 (`apresFusion`).

**Rappel (écrit en clair aux §§ 3.4 et 4.5.7)** : le recul de VISÉE n'est pas appliqué par `VueFPS.poser` (une fois par
image : le résultat dépendrait de la cadence) mais par `lireCommande`, au pas SUIVANT le tir : `arsenal.prendreRecul(r)`
puis `game.camPitch −= r.v ; game.camYaw −= r.h` avant la copie dans la commande (pour un bot : sa visée interne, dans
`Cerveau.commande`). `VueFPS` ne pose que le recul VISUEL (15 % du cabré : la caméra regarde un peu plus HAUT, sans que
`camPitch` soit touché). **Navigateur** : chaque fiche suppose la règle 3 du § 5.1 (un jeton avant d'ouvrir une page de jeu).

#### 5.5.1 L-A — ARMES ET BALISTIQUE (port 8131, ≈ 1 000 lignes, 2,5 j)
**Construit** : l'`Arsenal` complet (§ 4.5.6 : les 8 états, tir automatique et semi-automatique avec tampon de 0,1 s et
cadence À REPORT DU RESTE (§ 3.3), `ajouterChargeur`,
sortie du sprint puis `sprintTir`, visée 0 → 1 au temps d'ADS sur la courbe `1 − (1 − t)³`, recharges tactique / à vide
avec balles entrées au temps de la fiche et annulation avant, FP-12 cartouche par cartouche interruptible, culasse du
TP-50, couteau et sa fente, frag cuite / lancée, flash, changement d'arme, `ramasser`, `bloque`) ; la dispersion du
§ 3.4 (les quatre autres armes réglées par lui, gerbe du FP-12) tirée par `Rng(melanger(graine, id, tirSeq))` ; le MOTIF
de recul, sa boucle, son aléa et son rappel, exposés par `prendreRecul` ; le ressort VISUEL (`reculV/H`) ; `degatsDe` ;
la balistique en DDA (§ 4.5.6 : plus proche impact, formes `camera` et `joueur`, `balle === false` et `off` ignorées, 53
sols et le plan `y = 0`, normales, vitres — claires ou dépolies — traversées à 80 %, `_tour` à elle) ; `vue` (pré-filtre
`zonesCachees & zoneDe` sauf pour `EXCEPTIONS_PREFILTRE`, puis DDA ; une forme `depoli` arrête la vue) ; `tirer` ; les capsules simulées (tête avancée comprise) ; `rayonActeurs` (pré-filtre cylindre 1,1 m) ; les
`Grenades` (rebonds restitution 0,35, frottement 0,6, arrêt sous 0,4 m/s, explosion avec ligne de vue centre + 0,3 m →
buste ou tête, flash `0,8 + 3,2 × face × (1 − d/14)` plafonné à 4 s) ; les événements `tir`, `recharge`, `arme`, `vide`,
`grenade`, `explosion`, `flash` (§ 4.6) ; `etat()` / `appliquer()` de l'arsenal et des grenades (§ 4.7).
**Remplit** : `js/jeu/armes.js`, `balistique.js`, `touches.js`, `grenade.js`. **Crée** : `js/jeu/tests/test_armes.js`.
**Touche** : rien d'existant. **Dépend** : S0. **Contre le squelette de** : `nav.js` (points de tir tirés sur les sols, pas
sur le graphe), `avatars.js` (corps de Haythem pour les capsules).
**Acceptation (`test_armes.js`)** :
1. DDA : 2 000 segments entre points libres tirés sur les 53 sols à 1,0-1,7 m (graine 7) — premier impact de `balle()` et
   d'une référence brute (pas de 1 cm, chaque forme, chaque sol) à ≤ 2 cm l'un de l'autre sur ≥ 99,5 % des segments.
2. 100 rayons comparés au `THREE.Raycaster` de la scène (permis dans les TESTS seulement), tirés entre deux points de
   sols libres (graine 7) à une hauteur de 1,0 à 1,7 m : le premier impact de `balle()` et celui du Raycaster à ≤ 10 cm
   l'un de l'autre sur ≥ 97 % des rayons ; sont EXCLUS (et comptés à part) les rayons dont le Raycaster touche d'abord un
   matériau transparent ou un décor sans forme (feuillage, rampes, lampes, câbles) — les formes de collision sont
   simplifiées (rangs en un bloc, chaises en cylindres).
3. 400 rayons verticaux (200 vers le haut, 200 vers le bas, sur les 4 niveaux) : 100 % arrêtés par un sol ou un plafond
   avant le niveau voisin.
4. 20 tirs à travers des vitres claires : `traverse` vrai, dégâts × 0,8 ; 20 à travers des vitres `depoli` (marquées par
   le test tant que la table de L-M n'est pas là) : traversées aussi, et `vue()` FAUSSE à travers chacune ; 20 tirs sur des
   formes `camera: false` (jardinières de la rue, « jour » de l'escalier) : 20 arrêtés ; 20 tirs à travers des formes
   `balle: false` : 20 passés.
5. `balle()` ≤ 30 µs en médiane à 30 m, ≤ 120 µs au 99e centile ; `tirer` avec 8 acteurs ≤ 0,1 ms (temps).
6. Mannequin à 10 m, tireur immobile en visée (dispersion 0) : 100 balles visées à la tête → 100 `tete` ; au torse → 100
   `torse` ; aux jambes → 100 `jambes`.
7. Cadences, tir tenu (règle du § 3.3 : `prochain = max(prochain, t − PAS) + 60/rpm`) : FA-24 30 balles, la 30e à
   29 × 80 ms = 2,32 s de la 1re ± 1 pas (et non 2,417 s, la cadence arrondie à 10 pas) ; PM-9 32 balles, la 32e à
   2,067 s ± 1 pas ; FP-12 un coup par 857 ms, 10 coups en 7,71 s ± 1 pas ; TP-50 un par 1,33 s ; P-17 : fronts toutes les
   50 ms pendant 3 s → 20 coups ± 1 (150 ms), un front tamponné ≤ 0,1 s jamais perdu ; après 2 s sans tirer, la 1re rafale
   de FA-24 ne part pas plus vite que 80 ms − 1 pas entre ses deux premières balles.
8. Temps pour tuer 100 PV au torse : FA-24 à 10 m 4 balles, 240 ms ± 1 pas ; PM-9 à 6 m 200 ms ; P-17 à 8 m 300 ms ; FP-12 à
   4 m d'un coup (≥ 6 plombs au buste) ; TP-50 d'un coup au-dessus du ventre, deux au ventre ou aux jambes.
9. `degatsDe` : les 40 valeurs de la table du § 3.3 (5 armes × paliers × zones) exactes.
10. Recharges : FA-24 tactique 1,90 s ± 1 pas → 31 dans l'arme ; à vide 2,45 s → 30 ; sprint à 1,30 s → annulée (chargeur
    inchangé), à 1,40 s → gardée ; FP-12 `0,35 + 0,42 n + 0,30` ± 1 pas, interrompue par un tir ; conservation : chargeur +
    réserve + balles tirées CONSTANT sur 1 000 actions tirées au hasard (graine 3).
11. Recul FA-24, hanche, debout, sans compensation : 12 balles → MONTÉE de 6,76° ± 0,01° (la somme des `v` rendus par
    `prendreRecul` = 0,118 rad, appliquée en `camPitch −=` : `camPitch` BAISSE de 0,118 rad) et lacet selon le motif
    ± 0,01° ; × 0,8 en visée, × 0,85 accroupi ; au-delà, boucle sur les 6 derniers ± 0,08° ; rappel de 40 % de la montée en
    0,30 s, 300 ms après le dernier tir ; ressort VISUEL : `reculV > 0` (cabré) après un tir.
12. Dispersion FA-24 à la hanche (après les 0,12 s d'interpolation) : repos 2,2°, course 4,6°, saut 8,0° ± 0,05° ; 10 000
    tirages : 100 % dans le disque, rayon moyen / `s` = 2/3 ± 0,02 ; FP-12 : 1 plomb au centre + 7 à 0,6 × cône ± 0,3°.
13. Couteau : tue à 1,6 m ; fente jusqu'à 2,4 m si un ennemi est dans le cône de 25° ; 0,60 s par coup ; touche à 0,12 s.
14. Grenades : 50 lancers (graine 5) depuis des points libres des pièces → 0 au repos dans une forme (`C.libre`), 0 sous un
    sol (`y ≥ solEn − 0,05`) ; dégâts 160 à ≤ 2 m, 92,5 ± 0,5 à 4,25 m, 25 à 6,5 m, 0 derrière un mur ; mèche cuite : explose
    en main à 3,5 s ; flash : durée = formule ± 0,05 s, 0 derrière un mur.
15. Capsules : un `Errant` qui court 10 s — tête simulée / os `Head` (+ 0,085) ≤ 6 cm en moyenne, ≤ 10 cm au 95e centile
    (mesuré et noté ; au-delà : demande à L-C dans le rapport, bloquant à F2 seulement).
16. `verifierDeterminisme(42, 30)` égal avec 4 bots qui tirent ; `verifierEtat()` vrai en pleine recharge et grenade en vol.
17. Chaque événement émis porte les champs du § 4.6 (contrôle de schéma) ; pureté (`verifier_proprietaires`) : 0 faute.
18. `ajouterChargeur()` : + 30 à la réserve de la FA-24, jamais au-delà de 90 ; sans effet sur la secondaire.
**À F2** : `vue()` sur 10 000 paires de nœuds du vrai graphe (0 vue à travers un mur, référence brute) ; **le pré-filtre
dans l'AUTRE sens** : sur 10 000 paires de nœuds que le DDA brut dit visibles, le pré-filtre répond « peut-être visible »
100 fois sur 100 — sinon chaque paire de zones fautive va dans `EXCEPTIONS_PREFILTRE` et le test est rejoué ; les vitres
de `TABLE_DEPOLIS` (L-M) arrêtent `vue()` ; capsules contre les vrais corps de L-C.

#### 5.5.2 L-B — MOUVEMENT ET CAMÉRAS (port 8132, ≈ 900 lignes, 2,5 j)
**Construit** : `appliquerCommande` complet (§ 3.1 : allures par `speedMul`/`sprintMul` ramenées à 5,00 / 6,60 pour
TOUTES les fiches, sprint tactique et sa jauge, sprint À ENDURANCE et sans tactique pour un acteur `sprintLimite`,
glissade, saut borné au décollage ET EN VOL — plafond, tranche de tête contre les linteaux, `hautCorps = 1,35` en l'air —,
élan en l'air, réception, franchissement scripté par `franchissable` (la fonction du socle, telle quelle), accroupi et ses
refus, mobilité de l'arme, `stamina` tenue à 100, descentes de bordure lissées 0,06 s) ; `hauteurOeil`, `vitesseSaut`,
`separer` (§ 3.1 : `ra + rb`, poussées par `C.deplacer` ≤ 0,05 m par pas) ; événements `pas`, `saut`, `reception`,
`glissade` ; `lireCommande` complet (§§ 4.5.7, 4.8 : double appui Maj < 0,30 s ou front `sprintTact` (SOURIS 5), bascules
de visée et d'accroupi selon `controls.fps`, `armeSuiv/Prec`, molette, recul consommé par `prendreRecul` et appliqué à
`camPitch/camYaw`, puis `assistance_visee.corriger`) ; `VueFPS` (§ 3.2 : pose directe, balancement, roulis, champ et ses
élargissements, visée et sensibilité à focale constante, recul VISUEL au signe du § 3.2, pics de souris ignorés, caméra
de mort, `impulsion`, `secousse`, `fx.flash = 1` en appoint sur l'événement `flash` de l'acteur local, souffle retenu du
TP-50, œil ≥ 0,10 m sous le plafond) ; `CameraOrbite` (§ 4.5.7, chiffres du prop).
**Remplit** : `js/jeu/mouvement.js`, `entrees_jeu.js`, `vue_fps.js`, `camera_orbite.js`. **Crée** :
`js/jeu/tests/test_mouvement.js`. **Touche** : rien d'existant. **Dépend** : S0. **Contre le squelette de** : `armes.js`
(fiches réelles, `visee`, `prendreRecul` à 0), `viewmodel.js`.
**Acceptation (`test_mouvement.js`)** :
1. Allures établies sur le plateau du hall, pour Haythem ET les 6 `FICHES_BOTS` : marche 2,15 · course 5,00 · sprint 6,60 ·
   tactique 7,80 · visée 2,40 · accroupi 2,30 · accroupi visé 1,50 m/s, à ± 1 % ; × mobilité de l'arme (§ 3.1) à ± 1 %.
2. Sprint tactique : double appui < 0,30 s → 7,80 m/s pendant 3,0 s (4,5 s PM-9 et P-17) puis 6,60 ; jauge pleine en 4 s,
   utilisable dès 1,2 s.
3. Saut en terrain libre : apogée 0,505 ± 0,005 m, 0,642 ± 0,01 s en l'air ; 2 000 sauts AVEC ÉLAN (sprint, direction
   tirée) depuis des points libres, dont 1 000 sous des plafonds bas ou vers eux (hall ouest, 2,2-2,4 m) (graine 11) : à
   CHAQUE pas en l'air, la tête (pieds + 1,73 + `jumpY`) à ≥ 5 cm de `plafondEn` ; `v < 1,2` → refusé ; l'élan est gardé en
   l'air (τ 0,45 s). 40 sauts au sprint à travers 20 portes (linteaux 2,04-2,10 m) : 40 passages (aucun « mur invisible »),
   la tranche de tête jamais dans une forme, l'œil jamais dans une forme.
4. Réception d'une chute > 0,3 m : vitesse × 0,85 pendant 0,12 s, événement `reception`.
5. Accroupi : œil à 1,08 ± 0,005 m après 0,16 s, 1,62 après 0,18 s au relevé ; relever refusé sous un plafond < pieds + 1,85.
6. Glissade (depuis ≥ 0,25 s de sprint à ≥ 6,0 m/s) : `v0 = min(8,8 ; v × 1,12)` ± 1 % ; distance en 0,75 s = `0,46875 × v0`
   ± 3 % (3,47 m depuis 6,6 m/s) ; direction figée ; refusée sur une pente > 0,4 ; recharge 0,9 s ; un saut garde 85 %.
7. Franchissement : 10 obstacles donnés par leurs COORDONNÉES dans le test (point de départ, direction), choisis après
   une passe de mesure qui vérifie que `franchissable` y rend une arrivée libre (candidats : comptoir de l'accueil,
   banquettes, bureaux, tables isolées, jardinière — pas les tables de la S 1.3, en rangs serrés) : 10 réussis en 0,45 s
   (0,38 sous 0,7 m), sortie à 70 % de la vitesse ; 5 rangs serrés (S 1.3, S −1.14) : 5 refusés ; 0 arrivée dans une forme.
8. Les trois escaliers et la volée de tôle, en montée et en descente, en course et au sprint : la DÉRIVÉE SECONDE de la
   hauteur d'œil `|Δy(n) − Δy(n−1)|` ≤ 1 cm d'une image à l'autre (à 60 images/s ; une volée de pente 0,48 fait monter
   l'œil de 4 à 5,3 cm par image : c'est la variation de cette montée qui doit être douce), et l'écart à la pente prévue
   ≤ 1 cm ; les bordures de 0,12 m lissées en montée (0,08 s) et en descente (0,06 s).
9. Pas : tous les 0,7 m ± 5 % en course, 0,45 m en marche, aucun accroupi sous 1,3 m/s.
10. `separer` : 8 acteurs posés au même point → après 0,2 s (24 pas), aucune paire à < 0,59 m, 0 dans une forme,
    0 traversée (segment `posPrec → pos` qui coupe une forme) ; 2 acteurs poussés l'un contre l'autre de part et d'autre
    d'une cloison de 15 cm : 0 traversée ; un humain et une poubelle-prop (rayon 0,15) : arrêtés à 0,45 m (± 1 cm), un
    baby-foot-prop (0,5) : à 0,8 m.
11. Caméra : `camYaw/camPitch` posés à l'image n → la caméra de l'image n les porte (quaternion à 1e-9 près ; aucun
    lissage) ; tangage borné à ± 1,48 (prop [−0,7 ; 1,25]) ; œil ≥ 0,10 m sous `plafondEn` en tout point du parcours.
12. Souris : `sens` 0,45 → 5 585 ± 2 px par tour, même facteur sur les deux axes ; `|movementX| > 400` ignoré ; en visée,
    facteur `tan(champV_ADS/2) / tan(champV_hanche/2) × sensVisee` ± 1 %.
13. Champ : `controls.fps.champ` 90 → `champV` 58,72° ± 0,05° ; + 5° en sprint, + 4° en glissade, lissés 0,15 s.
14. Balancement : 1,0 cm vertical en course, 1,8 en sprint (± 0,1), × 0,1 en visée, 0 à l'arrêt.
15. `iris-pointeur` (capture fausse) en partie → pause dans la même image ; recapture refusée → calque « CLIQUE POUR
    JOUER », partie gelée ; `entree.manette` → reprise sans capture ; `capturer()` rend une promesse qui dit si la capture
    est accordée (repli sans `unadjustedMovement` sur `NotSupportedError`).
16. Caméra de mort : roulis 25°, œil à 0,4 m en 0,8 s ; flash local → `fx.flash = 1` à l'événement ET `partie.hud.aveugle`
    = `{ t, duree }` de l'événement pendant toute sa durée, puis `null` (le calque blanc lui-même est testé par L-G).
17. Recul visuel : après un tir, la caméra regarde PLUS HAUT que `camPitch` (angle de la caméra < `camPitch` de
    `0,15·reculV·DEG` à 1e-6), puis revient ; `camPitch` n'est modifié que par `lireCommande` (`prendreRecul`).
18. `CameraOrbite` : 500 poses tirées autour de props de 0,3 à 1,5 m : jamais dans une forme, jamais au-dessus de
    `plafondEn − 0,15`. — `lireCommande` est le SEUL lecteur d'`Input` de `js/jeu/` (hors `lireExtra` marqué) ;
    `verifierEntrees()` toujours à 0.
19. `sprintLimite` (chasseur du prop hunt) : sprint 6,60 m/s pendant 4,0 s ± 1 pas puis course ; pas de sprint de nouveau
    avant 20 d'endurance ; double Maj et SOURIS 5 sans effet ; un combattant ordinaire : SOURIS 5 → 7,80 m/s.
**À F2** : 12 balles de FA-24 → montée de 6,76° (`camPitch` BAISSE de 0,118 rad ± 0,0002) ; visée au zoom de chaque arme ;
franchissement pendant la pose `franchit` de l'arme de vue ; `separer` avec les vrais `CorpsProp` de L-K.

#### 5.5.3 L-W — MODÈLES D'ARMES (port 8133, ≈ 700 lignes, 2 j)
**Construit** : les huit modèles faits main en primitives (§ 4.5.8 et CoD § 6.2) — FA-24, PM-9, FP-12, TP-50 (lunette,
culasse à levier, bipied replié), P-17 (glissière), couteau, frag, flash —, en deux versions : `pourVue` (`SkinnedMesh`
rigides cousus par matériau, os `chargeur`, `culasse`, `glissiere`, `pompe`, `detente`, `goupille`) et 3e personne (une
géométrie par matériau, sans os) ; `MATERIAUX_ARMES` partagés ; `REPERES` posés en `Object3D`. Aucun fichier, aucune
texture, aucune marque, aucun texte.
**Remplit** : `js/jeu/modeles_armes.js`. **Crée** : `js/jeu/tests/test_modeles_armes.js`. **Touche** : rien. **Dépend** : S0.
**Acceptation (`test_modeles_armes.js`)** :
1. Les 8 identifiants se créent ; `pourVue` ≤ 6 appels de dessin par arme (maillages × matériaux), 3e personne ≤ 3 ;
   triangles : vue ≤ 8 000, 3e personne ≤ 1 500.
2. Les repères de chaque groupe créé = la table `REPERES` à ± 1 mm ; `userData.os` présent selon l'arme.
3. Encombrement (longueur selon −Z) : 0,84 · 0,62 · 0,95 · 1,10 · 0,19 m à ± 3 %.
4. Os rigides : déplacer `os.chargeur` de 10 cm ne bouge que les sommets du chargeur (poids 1 sur un seul os, compte exact).
5. 0 requête réseau, 0 texture ; 20 exemplaires de plus → 0 matériau et 0 programme de plus (après une 1re compilation).
6. Création ≤ 5 ms par arme (temps).
7. Une planche photo (8 armes × 3 vues, `__jeu.photo`) jointe au rapport : proportions de CoD § 6.2, aucune inscription.
**À F2** : tenue par l'arme de vue de L-V (mains sur les repères ≤ 1 cm) ; armes à la 3e personne de L-C (`armeTroisieme`).

#### 5.5.4 L-V — L'ARME DE VUE (port 8134, ≈ 900 lignes, 2,5 j)
**Construit** : le `Viewmodel` (§ 4.5.9) — bras coupés dans `haythem.glb` (`banc/bras_fps.js` recopié), géométrie
COPIÉE, ancres d'épaule posées hors champ, `ikBras` et `plierDoigts` sur les prises ; poses `POSES_VUE` ; ressorts
(inertie du regard, balancement en huit, pas chassé, réception, recul visuel, respiration) ; chronologies `CHRONOS` et
`evaluer` (Hermite) de toutes les armes (recharges, culasse, pompe, changement, couteau, grenade) LUES dans l'état de
l'Arsenal, jamais l'inverse ; la scène de l'arme, ses trois lumières constantes (clé par zone, lissée 0,4 s) et SA carte
d'environnement de studio fixe (PMREM de `RoomEnvironment`, intensité réglée par la clé) ; la lunette (`cacher()` à 85 %
d'ADS) ; `vitrine(id)` pour l'armurerie de la vague 3.
**Remplit** : `js/jeu/viewmodel.js`, `anim_vue.js`. **Crée** : `js/jeu/tests/test_viewmodel.js`. **Touche** : rien.
**Dépend** : S0. **Contre le squelette de** : `modeles_armes.js` (boîtes et `REPERES` exacts), `armes.js` (états et temps
des fiches), `vue_fps.js` (`etatArme()`).
**Acceptation (`test_viewmodel.js`)** :
1. Appels de la superposition ≤ 8 (bras 2 + arme ≤ 6 ; avec la boîte du socle : 3).
2. Lumières de la scène de l'arme = 3, comptées à chaque image pendant 60 s qui parcourent tous les états.
3. Programmes CONSTANTS après `preparer` pendant 10 s de tir, recharges, changements, sprint, glissade, visée, couteau,
   grenade.
4. Épaules : dans toutes les poses et toutes les clés des chronologies (pas de 0,05 s), les ancres projetées sont ≥ 4° sous
   le bord bas de la caméra de l'arme.
5. Mains : erreur d'IK ≤ 1 cm dans les poses fixes, ≤ 2 cm pendant les animations.
6. Visée : le repère `visee` sur l'axe de la caméra à ± 1 mm, à 0,24 m ; centré à ± 1 px en 1280 × 720.
7. Recharge FA-24 forcée : le chargeur part à 0,55 s et le neuf est en place à 1,35 s ± 1 image de `tEtat`.
8. Recul visuel : pics du piston et du cabré du § 3.4 à ± 5 %, retour sous 2 % en ≤ 0,25 s ; la caméra reçoit 15 % du cabré.
9. TP-50 : visée ≥ 0,85 → arme de vue cachée ; < 0,85 → montrée.
10. `maj` ≤ 0,15 ms par image (temps) ; 10 000 images aux états tirés au hasard : 0 `NaN`.
11. Bras ≤ 6 000 triangles ; l'avatar de Haythem inchangé (sommets et boîte identiques avant / après `preparer`).
12. Dessinée après `oeil` sur le chemin du composer, et aussi sur le chemin léger et sans composer (3 photos).
13. Six photos au rapport : hanche, visée, sprint, sprint tactique, recharge à 0,9 s, glissade.
14. Environnement : `scene.environment` de la scène de l'ARME est sa propre texture PMREM, identique (même objet) avant et
    après des passages de qualité Basse → Moyenne → Haute → Ultra → Basse (`__jeu.qualite`) ; programmes de l'arme
    CONSTANTS pendant ces passages ; 0 texture libérée encore référencée.
15. `vitrine('fa24')` en mode `'menu'` : la superposition est dans `fx.superpositions`, l'arme tourne (lacet qui change
    d'une image à l'autre), 0 lumière dans la scène de JEU ajoutée ; `vitrine(null)` → superposition retirée.
**À F2** : avec les armes de L-W, ≤ 8 appels et mains sur les vraies prises ≤ 1 cm ; programmes constants.

#### 5.5.5 L-C — LES CORPS DES ACTEURS (port 8135, ≈ 900 lignes, 2 j)
**Construit** : les avatars des bots (`assets/tel/<ami>.glb`, déjà copiés de LA CAGE par le socle, `FICHES_BOTS`,
`preparerAvatars` un par gabarit d'abord, chargeur discret, programmes et clips attendus) ; `creerCorps` / `libererCorps`
(`Player.dispose`, bonhomme de secours compris) ; `teinteEquipe` (tenue à 60 % + brassard LARGE (8 cm) aux deux bras, sur
les os d'épaule, matériaux CLONÉS) ; `poserArme` (IK des deux bras sur l'arme
3e personne, `banc/armer.js` recopié) et `armeTroisieme` (avec le modèle 3e personne de `creerArme`) ; `accroupir`
(`banc/accroupi.js`) ; la `Poupee` Verlet (`banc/ragdoll.js` + murs : `resoudre` sur Hips/Spine2/Head, impulsion 2,5 m/s,
4 s, enfoncement 0,5 m en 0,4 s ; habillage Airsoft, le défaut : poupée 1,5 s puis effacement 0,6 s) ; `CadenceActeurs`
(§ 4.5.10 : à chaque image à < 18 m et à l'écran, 1 sur 3 au-delà de 34 m, 4 Hz caché, POSÉ dans l'image où il redevient
dessiné ; dessiné par zones et cadre ; ombre au niveau de la caméra ; téléphone 2 pleins) ; le sursaut à la touche (§ 3.6) ; la réapparition sur le même `Player` (`anim.couper()` puis
`animKey = null`) ; dans `player.js` et `couches.js`, ce que demandent ces corps au-delà des prises du socle (penché des
couches coupé pour un acteur armé si les capsules l'exigent).
**Remplit** : `js/jeu/avatars.js`, `teintes.js`, `pose_arme.js`, `accroupi.js`, `poupee.js`, `cadence_acteurs.js`.
**Crée** : `js/jeu/tests/test_corps.js` (les 6 avatars sont posés par le socle ; L-C ne les modifie pas — un avatar à
retoucher passe par le rapport). **Touche** : `js/player.js`, `js/couches.js` (et `js/avatar.js`, `js/fit.js` si besoin).
**Dépend** : S0. **Contre le squelette de** : `modeles_armes.js` (boîtes), `touches.js` (capsules du socle).
**Acceptation (`test_corps.js`)** :
1. `preparerAvatars` des 6 amis : ≤ 3 s cache chaud, ≤ 6 s la 1re fois (temps) ; `DefaultLoadingManager.onLoad` jamais
   déclenché pendant ; programmes après = programmes avant ± 2 (mêmes matériaux Avaturn que Haythem).
2. Mémoire des textures des 6 bots ≤ 140 Mo (somme des tailles des textures nouvelles) ; `?tel=1` : 3 distincts au plus.
3. Drapeaux de `creerCorps` : 120 s d'`Errant` dans les rangées de la salle David Clark → 0 entrée dans un rang, 0 son de
   pas joué par les couches d'un bot, jamais les mains sur les genoux.
4. `poserArme` : canon / direction de la commande ≤ 0,5° sur 200 couples (tangage dans ± 1,2), mains sur les prises ≤ 2 cm,
   ≤ 0,2 ms par acteur (temps) ; posée UNE fois par image (compteur d'appels de `AvatarRig.ajouter`).
5. `accroupir(p, 1)` : hanches abaissées de 0,42 ± 0,01 m, pieds au sol ± 2 cm.
6. 100 poupées à impulsions tirées : à plat en < 1 s, jamais dans une forme (Hips, Spine2, Head), 0 `NaN`, cachées à 4,4 s.
7. Cadence avec 7 bots sur 300 images : un bot d'un autre niveau → non dessiné, sans ombre ; > 34 m → posé 1 image sur 3 ;
   caché → 4 Hz ; un bot qui REDEVIENT dessiné est posé dans la même image (âge de sa pose = 0 à la 1re image où il est
   dessiné, 50 cas) ; poses ≤ 1,1 ms par image en moyenne (temps).
8. 50 morts et réapparitions du même bot : aucun clip figé, enfants de la scène constants, mémoire stable (± 2 %).
9. 3 cycles `lancer` (7 bots) / `quitter` : géométries et textures ± 2 %, enfants de la scène identiques, `instantane()`
   identique.
10. `teinteEquipe` : deux brassards de 8 cm, enfants des os d'épaule ; tenue teintée à 60 % ; aucun matériau du décor ni
    de Haythem modifié (empreinte des matériaux partagés identique).
11. Capsules (formules du socle) / os `Head` en course : ≤ 6 cm en moyenne, ≤ 10 cm au 95e centile, pour les 7 fiches.
12. `rejouerBalade()` au bit près (L-C touche `player.js` et `couches.js`).
13. Lisibilité : 10 photos (`__jeu.photo`) d'un SISR et d'un SLAM clonés de Haythem (aucun avatar d'ami coché), à 10, 20
    et 30 m, dans un couloir sombre du −1, au hall et dans la rue : l'équipe se reconnaît sur chacune (jugé et noté au
    rapport, photos jointes ; les chevrons de L-G s'y ajouteront à F2).
14. Habillage Airsoft : poupée 1,5 s puis effacement en 0,6 s ; Militaire : 4 s, enfoncement, disparition.
**À F2** : armes 3e personne de L-W dans les mains (≤ 2 cm) ; capsules de L-A contre les os.

#### 5.5.6 L-D — NAVIGATION, PILOTAGE, APPARITIONS (port 8136, ≈ 900 lignes, 2,5 j)
**Construit** : la génération du graphe (§ 4.5.11, `carte_monde` § 7 méthode B : représentants poussés par `resoudre`,
liens par `deplacer` à 3 cm, un nœud par case ET par sol, graines = départ + 20 points ; portes `mobile` et formes
`limite` éteintes PENDANT la génération puis rallumées, boîtes `vantail` ALLUMÉES pendant la génération puis remises ;
cabine exclue) ; les DEUX graphes (humains : rayon 0,3 avec les liens « franchir » tirés de `franchissable` ; props :
rayon 0,2 sans franchissement, carte_monde § 10.1), chacun sous sa clé de cache ; tableaux `px pz ph zone niveau degage`,
CSR, `typeLien` ;
empreinte et cache IndexedDB `iris.nav` (`try/catch`, `?nav=refaire`) ; `restreindre`, `noeudPres` (grille), `chemin`,
`demander` / `pasFile` fractionnables (1 500 nœuds par tranche), `champDepuis` (Dijkstra en cache par point),
`aleatoireDans`, `couverts` (12 nœuds dans un anneau de 2-8 m, cachés à 1,0 m de la menace, voyant à 1,6 m), `distancePied` ;
le `Pilote` (LA CAGE `ai.js:88-107` : arrivée à hystérésis, axe relatif au lacet, ficelle tirée par BALAYAGE `C.deplacer`
jusqu'à 12 nœuds toutes les 0,25 s, évitement à 0,6 m, face-à-face dans un passage étroit résolu par le plus petit `id`
qui recule vers un nœud dégagé à ≥ 0,75 m, front `saut` face à l'obstacle sur un lien « franchir », coincé →
replanification et lien pénalisé × 10 pendant 10 s, 2e coincement → téléportation au dernier nœud sûr hors de la vue du
joueur local) ; l'`Errant` (et son option `vers`) ; `POINTS_APPARITION`, `departs`, `choisirApparition` (§ 3.8 : note
proximité / danger, champs de Dijkstra, morts récentes, tirage parmi les 3 meilleurs ; chacun pour soi : distance à pied
maximale au plus proche ennemi, vu de personne) ; `ramenerPoint` (anneaux de domination).
**Remplit** : `js/jeu/nav.js`, `nav_cache.js`, `pilotage.js`, `apparitions.js`. **Crée** : `js/jeu/tests/test_nav.js`.
**Touche** : rien. **Dépend** : S0. **Contre le squelette de** : `balistique.js` (`vue` approximative), `monde_partie.js`
(pas de table de portes : le test ouvre lui-même toutes les portes et les referme).
**Acceptation (`test_nav.js`)** :
1. `verifierNav()` : nœuds 8 956 ± 5 %, liens 55 000-65 000, 1 composante, 20 apparitions sur 20, ≥ 60 m² sur chacun des 4
   niveaux et la rue, 0 nœud de cabine ; génération ≤ 1,0 s, lecture du cache ≤ 50 ms (temps) ; `cache: true` au 2e
   lancement.
2. Empreinte identique d'un rechargement à l'autre ; changée quand le test ajoute une forme, revenue quand il la retire.
3. `instantane()` identique avant et après `Nav.obtenir` (portes et limites rallumées).
4. A* sur 200 paires (graine 13) : médiane ≤ 3 ms, 95e centile ≤ 8 ms (temps) ; `demander` : tranches ≤ 1,5 ms et MÊME
   liste de nœuds que `chemin`.
5. `champDepuis` ≤ 15 ms (temps), mis en cache ; `noeudPres` ≤ 20 µs et un nœud à ≤ 1,5 m pour ≥ 99 % de 1 000 points libres.
6. `verifierBots({ duree: 180, bots: 8, cerveau: 'errant' })`, toutes portes ouvertes : 0 hors monde, 0 sous le sol, 0 dans
   un mur > 0,2 s, 0 traversée, ≤ 1 coincé > 4 s et ≤ 1 téléportation de secours par 10 minutes-bot, 47 zones atteignables
   visitées sur 47.
7. `restreindre` à la zone `ss` : 200 chemins tirés n'en sortent jamais.
8. `Pilote` : 100 trajets entre nœuds de niveaux différents (escaliers compris) → ≥ 98 arrivés en ≤ 1,5 × le temps à pied.
9. `departs` : pour chaque zone de combat et chaque camp, 5 points à ≥ 1,5 m l'un de l'autre, `degage ≥ 0,75` ; deux camps :
   distance à pied ≥ 15 m.
10. `choisirApparition` : 1 000 tirages face à des ennemis tirés (graine 17) — jamais un point à < 20 m à pied d'un ennemi qui
    le voit ; chacun pour soi : le point qui maximise la distance au plus proche ennemi, exactement.
11. Même graine → mêmes chemins, mêmes apparitions ; IndexedDB qui lève une exception → génération normale, 0 erreur.
12. Pureté : 0 faute.
13. Graphe des PROPS (rayon 0,2, sans franchissement) : 1 composante, ≥ 10 % de nœuds de plus que celui
    des humains dans les pièces meublées (salle d'attente, S 1.3, pause du 1er), clé de cache distincte ; génération
    ≤ 1,0 s (temps).
14. Liens « franchir » (graphe des humains) : chacun vérifié par `franchissable` (arrivée à ≤ 0,3 m de son nœud) ;
    ≥ 1 lien sur le comptoir de l'accueil et sur les banquettes de la salle d'attente ; 0 sur un rang serré ; A* qui les
    emprunte quand le détour à pied est > 2 × plus long.
15. Face-à-face : deux `Pilote` envoyés l'un vers l'autre dans la volée de tôle (0,85 m) puis dans un couloir étroit : 20
    essais, 20 croisements réussis en ≤ 6 s, 0 coincé.
16. `ramenerPoint` : les 3 anneaux de domination ramenés à ≤ 3 m d'un nœud de dégagement ≥ 1,5 m ; `C.libre` au rayon de
    l'anneau (1,5 m) au centre ramené.
**À F2** : `verifierBots` avec les tables de L-M (combat : portes figées, vantaux solides allumés ; prop hunt : portes
'auto' de `majPortes`) et la vraie `vue` de L-A ; ligne de vue entre départs adverses = 0 ; liens « franchir » suivis par
de vrais bots qui sautent avec le vrai franchissement de L-B (50 franchissements, ≥ 48 réussis, 0 coincé) ; cachettes de
L-K atteignables sur le graphe des props.

#### 5.5.7 L-E — RÈGLES DU COMBAT ET STAND (port 8137, ≈ 700 lignes, 2 j)
**Construit** : `PartieFPS` (§§ 2.3-2.5, 3.5, 3.8) — modes `equipes`, `melee`, `domination` : phases présentation 3 s →
décompte 3 s → manche → mi-temps (domination, 5 s, camps échangés) → fin ; dotations par classe (bots tirés 40/30/20/10 %
par la graine) ; régénération ; protection d'apparition ; réapparitions (3,0 s, 2,0 s en chacun pour soi, Espace / A pour
passer la caméra de mort) par `choisirApparition` ; score individuel et d'équipe (§ 3.8), assistances, suicides ; les
trois anneaux (centres ramenés par `ramenerPoint`) et leurs captures (`capture`, `hud.points`) ; zones de jeu et
départs ; limites PC / téléphone ; un chargeur rendu à chaque élimination (`ajouterChargeur`, § 3.5) ; `hud` rempli
(`scores`, `classement`, `chrono`, `mort`, `reapparitionT`, `annonce`, `allies`) ; événements `phase`, `annonce`, `score`,
`capture`, `apparition`, `fin`. `PartieStand` (§ 2.6) : ligne de tir de la rue et la table `STAND` (coordonnées EXACTES,
fixées après une passe de mesure : trois couloirs dont la ligne de tir voit chaque cible sans vélo, jardinière ni voiture
entre les deux), silhouettes à 8, 15, 25 m (acteurs `role: 'cible'`, corps `CorpsFixe`, panneaux de `capsules`), les
quatre défis, mannequin fixe à 10 m qui dit zone et dégâts (`hud.cibles`), records `iris.stand.v1` (`try/catch`).
**Remplit** : `js/jeu/partie_fps.js`, `partie_stand.js`. **Crée** : `js/jeu/tests/test_combat.js`. **Touche** : rien.
**Dépend** : S0. **Contre le squelette de** : armes, mouvement, nav (vol d'oiseau), apparitions, cerveau minimal — les
parties de bots se testent au −1 (`ss`, compact : le cerveau minimal y trouve ses ennemis) ou par `__jeu.tirer` /
`teleporter`.
**Acceptation (`test_combat.js`)** :
1. Équipes : présentation 3 s → décompte 3 s → manche (± 1 pas), commande sans effet et `peutTirer` faux avant le « GO ».
2. Chacun pour soi, 6 bots (`humain: false`, zone `ss`, `avancer(600, { vitesse: 8 })`) : fin à 20 éliminations ou à 10:00 ;
   Σ éliminations = Σ morts − suicides ; classement trié ; `fin` émis avec le gagnant.
3. Équipes 4 c. 4 : + 1 par élimination, fin à 40 (20 au téléphone) ; 2 000 tirs forcés à travers des alliés → 0 dégât
   allié, la balle continue jusqu'à l'ennemi derrière.
4. Réapparition 3,0 s ± 1 pas (chacun pour soi 2,0) ; protection 1,2 s finie au premier tir ; régénération 4,0 s après le
   dernier dégât puis 35 PV/s (0 → 100 en 2,857 s ± 1 pas).
5. Assistance à ≥ 30 dégâts dans les 5 s (29 : rien) ; chaque ligne du barème du § 3.8 provoquée une fois → points exacts.
6. Domination : point neutre pris en 8 s seul, 5,33 s à deux, 4 s à trois (± 1 pas) ; disputé → figé ; point adverse
   neutralisé en 4 s puis pris en 12 s ; 1 point d'équipe toutes les 3 s par point tenu ; mi-temps à 75 ou 5:00 (camps
   échangés) ; fin à 150 ou 10:00 ; `hud.points` à jour.
7. 10 min de chacun pour soi : 0 apparition sous les yeux d'un ennemi ; ≤ 2 % des morts < 2 s après l'apparition.
8. Classes : dotations exactes ; 1 000 tirages de classe de bots → 40/30/20/10 % ± 3 points.
9. Les 4 zones de combat se lancent avec leurs départs ; Domination hors `ecole` refusée avec un message.
10. `?tel=1` : défauts 1 + 3 et 2 c. 2, 5 bots au plus.
11. Stand : chaque défi va au bout (« 20 cibles en 30 s », « 10 têtes », « 30 balles à 15 m », « Réflexes » 0,8 s) ; cible
    levée en 0,15 s, tombée à la touche, tête × 2 ; record écrit (stockage qui lève → 0 erreur) ; mannequin à 10 m : zone et
    dégâts de CHAQUE balle dans `hud.cibles`.
12. `verifierDeterminisme(42, 60)` égal (4 c. 4 de bots) ; `verifierEtat()` vrai en manche, mi-temps et fin.
13. `partie.hud` : tous les champs du § 4.5.15 présents et typés, dans chaque mode (contrôle de schéma) ; `allies` vide en
    chacun pour soi, ≤ 4 sinon.
14. Stand : pour chaque cible de `STAND`, `balle()` de la ligne de tir (œil debout) au centre de la cible : libre jusqu'à
    elle (aucun impact avant) ; 10 s de stand : 0 exception (`CorpsFixe` interpolé).
15. Munitions : FA-24 avec 0 en réserve, une élimination → réserve 30 ; à 90, une élimination → 90 ; 60 éliminations
    d'affilée sans recharger → jamais au-delà de 90.
16. Domination : chaque anneau ramené (`ramenerPoint`) est libre au rayon de 1,5 m (`C.libre`), y compris avec un −1
    modifié (le test ajoute une boîte de meuble sur le point B indicatif : B est déplacé, toujours libre).
**À F2** : apparitions à distance à pied réelle et vue réelle ; une partie de 10 min 4 c. 4 de bots sur toute l'école avec
les portes de L-M ; 100 duels FA-24 contre FA-24 à 15 m entre deux bots Réguliers placés symétriquement (graines
différentes) : l'acteur de plus petit `id` n'a aucun avantage — chacun des deux en gagne ≥ 30 (les morts simultanées
comptent pour les deux).

#### 5.5.8 L-K — REGISTRE, DÉGUISEMENTS, CORPS DES PROPS (port 8138, ≈ 750 lignes + 30 lignes de carte, 2 j)
**Attention, en tête de lot** : `conception_prophunt` § 9.4 écrit `credibilite(cle, x, z, y, …)` ; le contrat est
`credibilite(cle, x, y, z, …)` (§ 4.5.13) — ne pas recopier le code de la conception tel quel.
**Construit** : les étiquettes hors du −1 (§ 5.3, dont `voile: false` sur la chaise coque) ; le registre (§ 4.5.13 :
`fermerRegistre` avant chaque couture, copie tout de suite d'un meuble pris dans un bloc, RÉFÉRENCE d'un meuble cousu seul
copiée plus tard, signatures des maillages NON étiquetés notées au passage, `rattraperRegistre`, `zonerRegistre` par
`game.carte.lumieres`, `copieMeuble`, variantes dérivées de la signature, `DEGUISABLE_PAR_TYPE`, déguisable PAR ZONE
(aucun exemplaire non étiqueté dans la zone), boîtes orientées monde, `parForme`, grille de 2 m) ; `preparerCatalogue`
(prototypes passés par `Player.preparerRendu`, types déguisables par zone) ; `viserMeuble` depuis le PIVOT du prop ;
`deguiser` / `retirerProp` (refus sans la place, PV en proportion, événement `deguise`) ; `majProps` (racine à `posAff` et
cap affiché, jamais penchée ; visibilité par zones ; ombre au niveau de la caméra ; voile sauf `voile: false` ;
surbrillance ; tressaillement ; flash rouge par matériaux clonés) ; `credibilite` (prop § 9.4) et `couverture` (§ 4.5.13) ;
`pasRangee`, `distPassage` ; `cachettes` (générateur par tranches ≤ 5 ms, poses LIBRES, dans la bande, ATTEIGNABLES sur le
graphe des props) ; `candidatsMeubles` ; `toucherPoses` ; `CorpsProp` (bande de hauteur du § 3.9, `rayon`, endurance, saut
1,8 m/s, `plaquer` mural) et `deplacerProp` (libre / verrou aimanté < 20°, figé, marche silencieuse, `frottement`).
**Remplit** : `js/registre_meubles.js`, `js/jeu/deguisements.js`, `corps_prop.js`. **Crée** : `js/jeu/tests/test_meubles.js`.
**Touche** : `js/ecole_mobilier.js`, `js/ecole_pieces.js`, `js/ecole_hall.js`, `js/ecole_etage1.js`,
`js/ecole_etage1_pause.js`, `js/ecole_etage2.js`, `js/ecole_kahn.js`, `js/ecole_est.js`, `js/ecole_soussol_est.js`,
`js/ecole_rdc_centre.js` (étiquettes seulement). **Dépend** : S0. **Contre le squelette de** : `nav.js` (cachettes sur
points libres ; l'atteignabilité sur le vrai graphe des props est un test `apresFusion`), `camera_orbite.js`.
**Acceptation (`test_meubles.js`)** :
1. Construction inchangée : ligne `[optim]` identique ; appels et triangles aux 11 endroits de `carte_props` § 4.1
   identiques (qualité figée haute puis moyenne) ; `rejouerBalade()` au bit près ; registre ≤ 30 ms à la construction (temps).
2. `verifierMeubles()` hors −1 : ≥ 18 types, ≥ 200 poses ; chaque taille à ± 10 % de `carte_props` § 2 (table du test) ;
   `horsTolerance` vide (sinon le type est `deguisable: false`, raison au rapport) ; `nonEtiquetes` : chaque entrée soit
   étiquetée par L-K (ses 10 fichiers), soit relevant de L-M (`ecole_ascenseur.js`, `carte_ecole.js` : listée au rapport
   pour F2), soit justifiée ; tout type qui garde un non-étiqueté dans une zone est absent de `typesDeguisables(zone)`.
3. `preparerCatalogue` ≤ 600 ms (temps) et 0 programme compilé ; une copie ≤ 3 appels pour un meuble cousu seul, ≤ 12 (haute)
   sinon.
4. Chaque prototype posé à la place de son original : boîtes égales à ± 1 mm, même clé de programme.
5. Deux formes différentes sous un même `type` ne partagent jamais un prototype (signatures comparées sur tous les types).
6. `toucherPoses` ≤ 6 µs (temps) ; 1 000 rayons vers le centre de vraies poses → 1 000 trouvées ; visés 5 cm à côté → 0.
7. `credibilite`, 6 situations du test, toutes choisies parmi des poses LIBRES au rayon et dans la bande du type (une
   chaise « dans » sa rangée est dans une collision groupée — `ecole_mobilier.js:186`, 5 coques dans UNE boîte — et ne peut
   pas être une cachette) : chaise coque au BOUT de sa rangée ≥ 0,8, la même au milieu du couloir ≤ 0,25 ; Tolix contre une
   table ≥ 0,7 ; distributeur contre un mur ≥ 0,7, au milieu d'une pièce ≤ 0,3 ; chaise tournée de 90° au bout de sa
   rangée ≤ 0,5.
8. `CorpsProp`, chaque type déguisable : 100 trajets depuis des points libres (graine 19) → 0 traversée, 0 dans un mur ; la
   poubelle passe sous une table (bande) ; le baby-foot est refusé dans une porte de 0,8 m (« Pas la place »).
9. `deguiser` refusé sans la place (rien ne change) ; PV gardés en proportion à ± 1 ; `deguise` émis.
10. `cachettes('e1')` : tranches ≤ 5 ms (temps), ≥ 30 cachettes notées (`cred`, `couverture`), CHACUNE libre au rayon et
    dans la bande de son type (`C.libre`) — 0 dans une forme.
11. `majProps` : roulis et tangage de la racine exactement 0 ; voile = 1 appel transparent, AUCUN pour un type
    `voile: false` (chaise coque : un seul voile, le sien) ; flash rouge : 0 programme neuf.
12. `viserMeuble` : 20 cas (meuble visé à 2,5 m → trouvé ; derrière un mur → `null` ; à 3,5 m → `null`).
13. Sans le lot R : `typesDeguisables('ss').length < 6` (le menu grisera le −1) — noté, pas une faute ;
    `typesDeguisables('e2').length < 6` (le 2e grisé) ; `typesDeguisables('e1').length ≥ 6` (la zone de repli).
14. `candidatsMeubles` : autour d'un prop déguisé en Tolix au milieu de vrais Tolix, les candidats rendus ne permettent
    pas de distinguer le prop (mêmes champs, même type, `ref` opaque — contrôle de schéma) ; ≤ 0,05 ms pour 10 m.
**À F2** : atteignabilité sur le VRAI graphe des props (L-D) : sur `e1` (et `ss` si le lot R est là), parmi les poses
libres de crédibilité ≥ 0,6 (avant le filtre d'atteinte), ≥ 70 % atteignables ; ≥ 20 cachettes de crédibilité ≥ 0,6 par
zone ; 5 photos de cachettes au rapport ; (si le lot R est fusionné) types du −1 (Miura, Tolix, mange-debout, baby-foot,
distributeurs, micro-ondes…) ; 200 tirs sur des meubles du −1 → pose trouvée par `parForme` 200 fois sur 200 ;
`nonEtiquetes` vide pour les types déguisables (les extincteurs de L-M étiquetés).

#### 5.5.9 L-F — RÈGLES DU PROP HUNT ET SONS (port 8139, ≈ 750 lignes, 2 j)
**Construit** : `PartieProp` (§§ 2.7-2.8, 3.9, 4.5.14) — manches (4 / 6 / 8), rôles alternés et premier rôle, composition
(chasseurs = arrondi(N/3), « chasseur seul »), présentation → cachette (chasseurs figés, caméra fixe, sourds aux props ;
`hud.prop.cachette` rempli : chrono, rôles, astuces — le panneau est dessiné par L-G) → traque → révélation, prop resté
humain déguisé d'office, PV des props (`T.pv`), chasseurs `sprintLimite` (sprint à endurance, sans tactique, § 3.9),
pénalité et soin du chasseur (effets DIFFÉRÉS `faux` / `soin`, `appliquerEffet`), `resoudreTir` à trois listes (monde,
props, vraies poses), provocations forcées et volontaires, changements de forme comptés, scanner, fins de manche,
points, profil de touches changé entre deux manches (`appliquerProfil({ purger: true })`), `hud.prop` rempli, spectateur ;
la SAISIE de la roue des provocations (§ 4.5.14 : `roue`, `roueOuverte`, `mouvementSouris`, `mouvementStick`, `lireExtra`
— T tenu, geste cumulé, chiffres `provoc1-8`, G / molette / RB = la dernière ; JAMAIS `game.wheel`) ; la zone par défaut
calculée au lancement (`ss` si ≥ 6 types, sinon `e1`) ; `SonsProp` (les 8 provocations synthétisées, frottement, pouf,
aïe, crac, bip, défigement, par `sonsJeu.jouer3d`, à travers une dalle × 0,35 et passe-bas 900 Hz).
**Remplit** : `js/jeu/partie_prop.js`, `sons_prop.js`. **Crée** : `js/jeu/tests/test_prop.js`. **Touche** : rien.
**Dépend** : S0. **Contre le squelette de** : `deguisements.js` (type `carton` de secours), `cerveau_prop.js` minimal,
`monde_partie.js` (portes non pilotées), `sons_jeu.js` (non spatialisé), `hud_prop.js` (roue en texte). Zone de test :
**`e1`** (le 2e n'a que 3 types ; le −1 attend le lot R).
**Acceptation (`test_prop.js`)** :
1. Partie de bots (`humain: false`, 5 acteurs, `e1`, 6 manches, `avancer` × 8) : phases dans l'ordre, durées 35 s de
   cachette et 3:30 de traque au 1er (§ 3.9), 3 s / 6 s ± 1 pas ; avec Haythem : rôles alternés, `premierRole` respecté
   (prop, chasseur, hasard semé). Zone par défaut : `settings.jeu.prop.zone === null` → `e1` sans le lot R.
2. Composition : N de 4 à 8 → arrondi(N/3) chasseurs ; « chasseur seul » → le coéquipier devient un prop de plus.
3. Cachette : déplacement des chasseurs 0, 0 `tir` de chasseur, caméra de Haythem chasseur FIXE et `hud.prop.cachette`
   rempli (chrono, rôles, ≥ 2 astuces qui changent toutes les 8 s) ; aucun événement `provocation`, `frottement`,
   `deguise` transmis à un cerveau de chasseur ; `SonsProp` muet pour Haythem chasseur.
4. Fin de cachette : un prop resté humain est déguisé en le type le plus courant de sa pièce.
5. Tir sur une VRAIE pose déguisable : − 3 PV (FP-12 : − 1 par plomb, ≤ − 6 par coup), `faux`, − 2 points ; sur un mur ou un
   sol : 0 ; grenade : 0 ; chasseur à 0 PV → spectateur jusqu'à la fin de la manche.
6. Soin : + 25 % des dégâts faits à un prop, plafond 100.
7. Fins : props tous morts → chasseurs ; chrono à 0 avec ≥ 1 prop → props ; chasseurs tous morts → props.
8. Changements : illimités en cachette ; 3 en traque, 5 s entre deux (le 4e et celui à 4,9 s refusés).
9. Provocations : forcées toutes les 40 s (départ décalé de 0-15 s, semé), 20 s dans la dernière minute, 25 s pour le dernier
   prop, sifflet et rayon × 1,3 ; volontaires : recharge 4 s, compteur remis à zéro, + 5 à + 10 points (× 2 si un chasseur est
   à < 10 m).
10. Scanner : 3 charges, 8 s entre deux, 12 m, même niveau, arc ± 20° semé, bandes < 4 / < 8 / < 12 m ; bip reçu par les
    props à < 12 m.
11. Barème du § 3.9 : chaque ligne provoquée une fois → points exacts.
12. Changement de rôle → `game.appliquerProfil({ purger: true })` ; en prop E = `deguiser`, en chasseur R = `recharger`.
13. Roue : `provoc1-8` pressés pendant des images SANS pas → `cmd.provoc` juste au pas suivant ; G = la dernière ; T tenu
    + gestes synthétiques (`mouvementSouris`) vers les 8 directions → `roue.choix` = 0…7 dans l'ordre, `camYaw` inchangé ;
    stick (`mouvementStick`) idem ; T relâché sans choix → aucune provocation ; `game.wheel` jamais ouverte ;
    `verifierEntrees().emoteFantome === 0`, roue ouverte ou fermée.
14. `SonsProp` : 8 recettes aux durées ± 0,05 s (lues dans `journalAudio`) ; voix ≤ 24.
15. `verifierDeterminisme(42, 60)` égal ; `verifierEtat()` vrai en cachette, traque, révélation.
16. Chasseurs : `sprintLimite` vrai en traque ; poursuite scriptée en ligne droite (40 m) d'un prop Tolix (≈ 4,5 m/s,
    5,45 en sprint pendant 3 s) par un chasseur qui sprinte : avec 6 m d'avance, pas rattrapé en 4 s ; ensuite l'écart se
    referme à ≤ 0,5 m/s (course 5,00 contre ≈ 4,5) — de quoi casser la ligne de vue ou changer de forme.
**À F2** : vrai catalogue (L-K) et portes 'auto' pour tous (L-M) ; sons spatialisés (L-H) ; roue dessinée par L-G ; le −1
si le lot R est là.

#### 5.5.10 L-G — LE HUD (port 8140, ≈ 800 lignes + 400 de CSS, 2 j)
**Construit** : `HudJeu` (§ 4.5.15, CoD § 9.1 : réticule à quatre traits qui dit la vérité, bleu / rouge sous un allié /
ennemi, caché en visée ; marqueurs de touche, de tête, d'élimination ; « +100 » empilés ; score et chrono ; domination en
haut au centre ; fil des éliminations et silhouettes d'armes en SVG ; vie qui ne se montre qu'abîmée ; munitions,
grenades, « R RECHARGER » ; indicateurs de dégâts ; vignette et cœur ; masque de lunette ; caméra de mort et sa carte ;
annonces dans `#hud-annonce` À ELLES (deux classes basculées ou Web Animations ; JAMAIS `hud.feedback`) ; plaques de noms
à ≤ 30 m ; **chevrons bleus des alliés** (`hud.allies`, ≤ 4, à travers les murs, nom à ≤ 15 m) ; **`#voile-flash`** blanc
piloté par `hud.aveugle`) ; `HudProp` (forme et son nom, changements, verrou / figé, anneau de provocation, DISCRÉTION en
étoiles, ŒIL, étiquettes des alliés, aide « E : devenir … », **`RoueProvocations`** dessinée d'après `hud.prop.roue`,
**panneau de cachette** `#voile-cachette` noir en z-index 12 avec chrono, tableau des rôles, mini-carte de la zone sans
acteurs et astuces d'après `hud.prop.cachette`, arcs « Voir les sons ») ; `TableauScores` (non interactif, pas dans
`RACINES`) ; `MiniCarte` (silhouette du niveau rastérisée depuis les nœuds, 0,25 m = 2 px, tourne avec Haythem ; une
variante « zone entière, sans acteurs » pour le panneau de cachette) ; `body.combat` (les règles posées par le socle dans
`hud.css`, gardées) ; textes de l'habillage Airsoft (le défaut). Tout le DOM est créé par JS sous `#hud` ; règle de `HUD.stamina` (le DOM n'est écrit que si
la valeur AFFICHÉE change).
**Remplit** : `js/jeu/hud_jeu.js`, `hud_prop.js`, `tableau_scores.js`, `minicarte.js`, `css/jeu/hud.css`. **Crée** :
`js/jeu/tests/test_hud.js`. **Touche** : rien. **Dépend** : S0 (état `partie.hud`, événements ; il se nourrit d'un
`partie.hud` FABRIQUÉ par le test autant que des parties d'essai).
**Acceptation (`test_hud.js`)** :
1. ≤ 2 écritures DOM par image en moyenne (MutationObserver sur `#hud`, 300 images de manche avec 7 bots) ; 0 lecture de
   mise en page dans `maj` (`getBoundingClientRect`, `offset*`, `getComputedStyle` comptés : 0).
2. Réticule : écart = 4 px + `tan(s) / tan(champV/2) × H/2` à ± 1 px pour 5 dispersions ; caché en visée ; bleu sur un allié,
   rouge sur un ennemi.
3. `touche` → marqueur dans la même image, 0,12 s ; tête plus grand ; `elim` → X rouge 0,22 s × 1,15 et « +100 » empilé 1,5 s.
4. Fil : 5 lignes au plus, 5 s chacune. Indicateur de dégâts : arc de 30° à 120 px vers le tireur à ± 5° (8 directions),
   1,6 s. Vignette : opacité `(1 − vie/60) × 0,85` ± 0,01 sous 60 PV, battement à 1,2 Hz sous 30.
5. Munitions en bas à droite, « R RECHARGER » sous 30 % du chargeur ; vie montrée seulement abîmée ; chrono rouge sous 30 s.
6. Mini-carte : 200 px (160 au tactile), 24 m de large ; ennemi montré 2 s après un tir non silencieux ; chevrons d'un autre
   niveau ; `preparer(nav)` ≤ 50 ms, `maj` ≤ 0,1 ms (temps).
7. Tableau : montré tant que `scores` est tenu ; colonnes du combat (rang, portrait 32 px, nom, score, É, M, A, ratio,
   série ; deux colonnes d'équipe) et du prop hunt (rôle, points, trouvés, survie, provocations, vrais meubles).
8. HUD prop : nom de forme, ●●○, 🔒 / ❄, étoiles = `ceil(discretion × 5)`, « REPÉRÉ ! » au-delà de 70 %, ≤ 4 étiquettes
   d'alliés ; panneau de cachette noir (pas `fx.flash`) avec chrono, rôles, mini-carte de la zone (0 acteur dessiné) et
   astuces ; `RoueProvocations` : 8 secteurs, le secteur `choix` en surbrillance dans la MÊME image que le changement de
   `hud.prop.roue.choix`, cachée quand `ouverte` est faux ; `game.wheel` jamais touchée.
9. Domination : A, B, C en haut au centre, couleur du possesseur, progression de capture.
10. Lunette : masque à visée ≥ 0,85, réticule caché.
11. `body.combat` cache `.stamina`, `#hud-keys`, `#phone-badge`, `#hud-hint`, `#hud-streak` ; en balade, l'empreinte de
    `#hud` = la référence.
12. 300 images avec `partie.hud = {}` ou des champs manquants : 0 exception.
13. Habillage Airsoft (défaut) : « TOUCHÉ » au lieu d'« ÉLIMINÉ » ; Militaire : « ÉLIMINÉ » ; tous les textes en
    français (liste noire du test : KILL, HEADSHOT, RELOAD, AMMO, WINNER…).
14. `#voile-flash` : avec `hud.aveugle = { t, duree: 3 }` aux instants t = 0 ; 2,3 ; 2,4 ; 2,7 ; 3,0 → opacité 1 ; 1 ;
    1 ; 0,5 ; 0 (± 0,02) ; même résultat en qualité Basse (`fx.enabled = false`) ; au-dessus du HUD, sous la pause
    (z-index comparés).
15. Chevrons : 3 alliés, dont un derrière un mur et un derrière la caméra → 2 chevrons montrés (le 3e caché), à ± 2 px de
    la projection de leur point ; taille 14 px à 2 m, 8 px à 40 m ; aucun en chacun pour soi.
16. Annonces : 20 annonces de suite → 0 appel à `hud.feedback` (espion), 0 événement `hoops-feedback`, 0 lecture de mise
    en page ; chaque annonce relancée (animation qui repart).
**À F2** : avec les vrais événements de L-A/L-E/L-F, une manche de 2 min : mêmes seuils 1 et 12 ; 10 photos de L-C
refaites avec les chevrons : équipe reconnaissable sur toutes.

#### 5.5.11 L-U — MENUS ET OPTIONS (port 8141, ≈ 800 lignes + 300 de CSS, 2 j)
**Construit** : `MenuJeu` (§§ 2.1, 2.2, 2.9, 4.5.16 : accueil sur fond vivant — `camera` à trois plans de 12 s et fondu
de 1,2 s, qui place le corps fictif du menu au sol sous la caméra —, réglages COMBAT (avec la ligne Habillage, Airsoft par
défaut) / PROP HUNT (zones grisées avec leur raison, défaut calculé) / STAND gardés dans `settings.jeu`, préparation, fin,
crédits ; chaque écran inscrit par `ajouterRacine`) ; les PORTRAITS PRÉCALCULÉS (§ 4.5.16 : l'outil `tools/portraits/`,
les 7 images `assets/portraits/*.webp`, `portrait(fiche)` qui rend leur URL, aucun WebGL en jeu) ; dans
`ui.js` : l'onglet COMBAT des options AJOUTÉ PAR JS dans `buildOptions` (pas dans `index.html`), les trois sous-onglets de
Commandes (BALADE / COMBAT / PROP HUNT) branchés sur `bindingsDe` / `bind(…, profil)`, `listen()` qui capture aussi
`mousedown` et `wheel`, le bloc manette qui suit le profil, l'avertissement Ctrl.
**Remplit** : `js/jeu/menus_jeu.js`, `portraits.js`, `css/jeu/menus.css`. **Crée** : `js/jeu/tests/test_menus.js`,
`tools/portraits/index.html`, `tools/portraits/outil.js`, `tools/portraits/ecrire.py`, `assets/portraits/{haythem,gabriel,
imad,marcantoine,koji,djafar,ethan}.webp`. **Touche** : `js/ui.js`. **Dépend** : S0 (dont les 6 avatars copiés dans
`assets/tel/`). **Contre le squelette de** : `avatars.js` (`FICHES_BOTS`), `deguisements.js` (`typesDeguisables` pour
griser une zone), `manette_menus.js` (`ajouterRacine` du socle).
**Acceptation (`test_menus.js`)** :
1. Après « APPUIE » : `mode === 'menu'`, `#menu-jeu` aux 6 boutons dans l'ordre (BALADE LIBRE · COMBAT · PROP HUNT · STAND
   DE TIR · OPTIONS · CRÉDITS), focus manette sur BALADE ; navigation manette simulée (croix, A) jusqu'à chacun ; B revient
   de chaque sous-écran.
2. BALADE LIBRE → `mode === 'lobby'`, `partie === null`, puis `rejouerBalade()` au bit près.
3. Caméra du menu : trois plans de 12 s, fondu de 1,2 s ; 360 positions échantillonnées : jamais dans une forme ; tactile
   caché ; `fx._enJeu()` faux.
4. Réglages COMBAT : tous les champs du § 2.2 ; Domination seulement sur `ecole` ; somme des bots bornée (PC 9, avertissement
   au-delà de 7 ; téléphone 5, au-delà de 3) ; 6 avatars cochables avec portrait (balise `<img>` vers
   `assets/portraits/<id>.webp`) ; aucun coché → la ligne « Haythem cloné » ; ligne Habillage, Airsoft coché par défaut.
   Ouvrir le menu puis les réglages COMBAT : 0 requête d'un `.glb` (liste des requêtes réseau), 0 `WebGLRenderer` créé
   (espion), `DefaultLoadingManager.onLoad` jamais déclenché.
5. Réglages PROP HUNT : champs du § 2.2 ; une zone est grisée, avec sa raison, si `typesDeguisables(zone).length < 6`
   (sans le lot R : `ss` et `e2` grisés) ; défaut calculé au lancement (`ss` si ≥ 6 types, sinon `e1`) ; Facile au tout
   premier lancement.
6. Les choix reviennent à la réouverture (`settings.jeu`, en mémoire pendant les tests).
7. LANCER → PRÉPARATION (barre, les 4 étapes nommées) → présentation de la partie en ≤ 4 s la 1re fois sur PC (temps).
8. Fin : écran à elle (pas `#overlay`) — REJOUER relance avec les mêmes réglages, CHANGER DE MODE ouvre les réglages, MENU
   PRINCIPAL, BALADE (`instantane()` = la référence).
9. CRÉDITS : Avaturn (Haythem et ses amis), Mixamo, CMU (formule exigée), Sketchfab CC BY 4.0 (danses, auteurs comme LA CAGE
   `index.html:319-365`), voitures.glb, Poly Haven, three.js, es-module-shims, polices — chacun présent.
10. Onglet COMBAT : champ 75-110, sensibilité FPS affichée en cm par tour à 800 ppp (0,45 → 17,7 cm), sensibilité en visée
    0,5-1,5, visée maintenue / bascule, accroupi maintenu, sprint auto, aide à la visée, couleur du réticule, secousses, tir
    auto tactile, habillage, priorité fluidité — chacun écrit son réglage.
11. Commandes : lier une touche en COMBAT laisse `bindingsDe('balade')` identique ; `Souris:0-4` et `Molette:haut/bas`
    capturés ; lier Ctrl → « Ctrl + W ferme l'onglet » affiché.
12. Onglets d'aujourd'hui (graphismes, audio, commandes, emotes) : rendus sans exception, comportement inchangé (changer la
    qualité écrit `graphics.quality`).
13. Portraits : les 7 fichiers `assets/portraits/*.webp` existent, 192 × 192, fond transparent, ≤ 30 Ko chacun ;
    `portrait(fiche)` rend leur URL en < 0,1 ms, `null` pour une fiche sans image (initiale sur dégradé dans le DOM) ;
    premier Tab d'une manche : aucune image > 50 ms (`images` de la manche) ; une planche des 7 portraits au rapport.
14. Pause de la balade : « Modes de jeu » → `entrerMenu()` (mode `'menu'`, pointeur libre, entrée purgée).
**À F2** : CRÉDITS relus ; parcours complet manette sur les vrais écrans de fin ; portraits regardés à côté des vrais
avatars réglés par L-C (refaits par l'outil si un avatar a changé).

#### 5.5.12 L-H — EFFETS ET SONS (port 8142, ≈ 900 lignes, 2,5 j)
**Construit** : `Effets` (§ 4.5.17 : pools en `InstancedMesh` créés et compilés à la préparation — impacts, traceurs,
douilles, éclairs, étincelles, anneaux de domination, cibles du stand, explosion ; impacts seulement sur les formes
hautes et les plafonds, gerbes ailleurs ; éclairs en quads additifs `toneMapped: false` ; habillage Airsoft, le
défaut) ; `SonsJeu` (voix bornées et libérées sur SON horloge, occlusion par `balistique.vue` — 4 voix par image à tour
de rôle, seulement au-dessus de −30 dB —, retard `d/343`, recettes de tir de CoD § 7.5 et la recette « gaz » de
l'Airsoft, pas des acteurs depuis l'événement `pas`, rechargements, tir à vide, sifflement, changement d'arme, buzzer et
sifflet de LA CAGE, acouphène et passe-bas des explosions et des flashs) ; dans `audio.js` : la prise `creerContexte`
gardée, `setListener(pos, camera)` (orientation lue dans la caméra passée par `game.js` après `updateCamera`), bruits
blanc et rose PRÉCALCULÉS, sortie spatialisée (`PannerNode` 'equalpower', 'inverse', référence 2 m, atténuation 1,2,
max 60 m) ; dans `fx.js` : `budgetImage` (option « Priorité fluidité ») et la passe superposée tenue sur les trois chemins.
**Les tests de son** (sous `?test=1`, `OfflineAudioContext`) lisent ce qui est PROGRAMMÉ (`journalAudio`, et les valeurs
posées par `.value` sur les paramètres des voix), jamais le temps écoulé ni `onended`.
**Remplit** : `js/jeu/effets.js`, `sons_jeu.js`. **Crée** : `js/jeu/tests/test_effets.js`. **Touche** : `js/fx.js`,
`js/audio.js`. **Dépend** : S0 (événements, `partie.hud.points/cibles`).
**Acceptation (`test_effets.js`)** :
1. Programmes CONSTANTS pendant 10 s à 100 tirs/s avec impacts, traceurs, douilles, éclairs, étincelles et explosions.
2. 1 000 impacts : le pool des impacts = 1 appel ; ≤ 0,2 ms de mise à jour pour 256 actifs (temps) ; le plus vieux recyclé.
3. Impacts seulement sur les formes hautes (`y1 − y0 > 1,8` ou `joueur === false`) et les plafonds, jamais sur un vantail ou
   un meuble ; quad aligné sur la normale à ± 2°.
4. Lumières de la scène de jeu : même nombre avant, pendant et après une partie.
5. 100 tirs/s pendant 10 s (avancés par `avancer`, l'horloge de `SonsJeu` aussi) : ≤ 24 voix (12 au téléphone) à tout
   instant ; chaque voix libérée quand `sons.t ≥ fin` (± 1 image), aucune par `onended` ; 0 `AudioBuffer` créé par tir
   après la préparation.
6. Panneau de chaque voix à la position de la source à ± 1 cm (valeurs posées sur `positionX/Y/Z`) ; auditeur posé APRÈS
   `updateCamera` : à la position de la caméra DE L'IMAGE et orienté comme elle à ± 1° (aucune image de retard sur un
   virage de 90° en une image) ; 8 sources autour de l'auditeur → côté gauche / droit juste 8 fois sur 8.
7. Occlusion (lue dans `journalAudio` : `setTargetAtTime` du gain et de la fréquence du filtre) : bloqué → − 9 dB et
   passe-bas 700 Hz ; autre niveau → − 14 dB, 400 Hz ; retard `d/343` ± 1 ms (date du `start` programmé) ; occlusion par
   `balistique.vue`, 4 voix au plus par image, aucune voix sous −30 dB testée ; coût de l'occlusion ≤ 0,05 ms par image
   (temps) ; 0 appel à `C.rayonLibre` depuis `sons_jeu.js` (espion).
8. Au-delà de 25 m, pas de claquement ; hauteur ± 4 % d'un coup à l'autre ; pas des ennemis + 4 dB.
9. Balade : les sons de pas, crissements et réceptions des couches jouent encore (5 s de marche : nombre de `start`
   programmés au journal ± 10 % de `a8b22dd`).
10. `fx.js` : passe superposée sur les trois chemins ; « Priorité fluidité » en partie → budget 1000/60 ; éteinte ou en
    balade → `BUDGET_IMAGE` inchangé.
11. Anneaux (3) et cibles (12) : 1 appel par pool, lus dans `hud.points` / `hud.cibles`.
12. Airsoft (défaut) : impacts de peinture à la couleur de l'équipe du tireur ; tir à la recette « gaz » (claquement
    présent, plus court, sans grave) ; Militaire : trous, recette pleine.
13. `Effets.maj` ≤ 0,3 ms, `SonsJeu.maj` ≤ 0,2 ms par image avec 7 bots qui se battent (temps).
14. `rejouerBalade()` au bit près ; en balade la passe superposée reste désactivée.
**À F2** : test à l'aveugle au stand (8 tirs autour de Haythem, direction juste ≥ 7/8 — à la main, ✋, avec un vrai son :
F2 lance la page SANS `?test=1` pour ce test) ; éclairs à la bouche réelle (`acteur.aff.bouche` de L-C, repère `bouche`
de L-W) ; occlusion avec la vraie `vue` de L-A.

#### 5.5.13 L-I — TACTILE, MANETTE, ASSISTANCE (port 8143, ≈ 500 lignes + 100 de CSS, 1,5 j)
**Construit** : dans `touch.js`, les contextes de partie (§ 4.5.18 : combat, prop, chasseur ; `EMPL`, `NOMS`,
`NOM_ACTION`, places par défaut ; TIR en rôle mixte bouton + regard ; tir auto ; sprint verrouillé au bord du joystick ;
glisser vers le bas sur ACCROUPI = glissade ; bornes par `game.bornesTangage()` ; appui long sur PROVOQUER = roue, le
glissé du doigt va à `mouvementSouris` ; toucher le calque « CLIQUE POUR JOUER » = reprise sans capture) ; dans
`manette.js`, bornes par `game.bornesTangage()`, vitesse et accélération du stick en partie, `facteurStick`, stick droit
vers `mouvementStick` quand la roue est ouverte (la caméra ne tourne pas), A / Start sur le calque = reprise sans
capture, vibrations sur ÉVÉNEMENTS de la partie seulement, `aideBalade()` qui suit le profil ; dans `manette_menus.js`, ce que les écrans du jeu demandent au-delà d'`ajouterRacine`
(socle) ; `assistance_visee.js` (ralentissement, suivi, aimant d'ADS, tir auto ; jamais à la souris) ; `css/jeu/tactile.css`.
**Remplit** : `js/jeu/assistance_visee.js`, `css/jeu/tactile.css`. **Crée** : `js/jeu/tests/test_mobile.js`. **Touche** :
`js/touch.js`, `js/manette.js`, `js/manette_menus.js`. **Dépend** : S0. **Contre le squelette de** : `entrees_jeu.js`,
`touches.js` (bustes des ennemis), `menus_jeu.js` minimal.
**Acceptation (`test_mobile.js`)** :
1. Boutons des trois contextes présents ; aucun recouvrement (aire d'intersection 0) et tous dans l'écran à 812 × 375,
   915 × 412 et 1138 × 568.
2. Doigt simulé sur TIR qui glisse de 100 px → `camYaw` change de `0,006 × s` rad/px ET `cmd.tir` tenu pendant le glissé.
3. Tir auto (défaut au téléphone) : réticule 0,12 s sur un ennemi à ≤ 30 m → `tir` ; jamais à la souris.
4. Joystick poussé au-delà de son bord → sprint verrouillé (tactique s'il est prêt) ; glissé vers le bas sur ACCROUPI en
   sprint → glissade.
5. Manette en partie : RT tir, LT visée, L3 sprint (double = tactique), R3 couteau, RB létale, LB tactique, Y arme, X
   recharger, B accroupi, A saut, Back scores ; bornes ± 1,48 ; stick 3,6 rad/s à `sens` 1 (courbe ^1,8), × 1,35 après 0,25 s
   au-delà de 0,9 (atteint en 0,3 s), × 0,55 en visée.
6. Assistance (manette et tactile) : × 0,55 (hanche × 0,7) quand le centre est à < `atan(0,45/d) + 1°` du buste d'un ennemi vu
   à ≤ 40 m ; suivi + 45 % ; aimant d'ADS 70 % à < 7° et < 30 m ; à la souris : commande identique au bit près avec et sans.
7. Vibrations : tir faible 40 ms, touche reçue forte 120 ms (espion sur `manette.vibrer`) ; en partie, une annonce ou une
   élimination ne fait vibrer QU'UNE fois (pas de `hoops-feedback` en plus).
8. Balade : `__touch._contexte()` = la référence ; manette en balade : bornes − 0,1 / 0,9 et 2,9 rad/s ; racines `phone`,
   `options`, `overlay` navigables ; `retour` sur `overlay` tape la pause.
9. Racines du jeu (`menu-jeu`, `reglage-jeu`, `fin-jeu`, `credits-jeu`) navigables ; B revient par `data-retour-action`.
10. Mode `'menu'` : calque tactile caché ; en partie : montré.
11. `?tel=1` + émulation mobile : menu → COMBAT → LANCER → un bot touché → pause (II) → Reprendre (AUCUNE capture
    demandée, la partie repart) → pause → Quitter → menu, sans un seul événement clavier.
12. Manette débranchée en partie → pause ; manette en pause → Start → reprise SANS capture, la partie avance ; calque
    « CLIQUE POUR JOUER » au décompte → A le ferme et le décompte part.
13. Roue des provocations à la manette (Haythem prop) : LB tenu ouvre la roue ; stick droit vers les 8 directions →
    `roue.choix` 0…7, `camYaw` INCHANGÉ ; LB relâché → `cmd.provoc` = le choix ; au doigt : appui long sur PROVOQUER +
    glissé → même résultat.
**À F2** : boutons sur les vrais écrans de L-U ; assistance sur les vrais bustes (capsules de L-A) ; une manche à la manette
seule ; la roue dessinée par L-G suit le stick.

#### 5.5.14 L-M — LE MONDE EN PARTIE (port 8144, ≈ 400 lignes + 40 de carte, 1 j)
**Construit** : les prises de la carte (§ 5.3, dont `miroirAccueil` au retour de la carte et les étiquettes des deux
extincteurs de `ecole_ascenseur.js` et `carte_ecole.js`) ; `TABLE_PORTES_FPS` et `TABLE_PORTES_PROP` (§ 4.5.19, TOUTES
les portes de `portes.liste()` à `a8b22dd`) et `regleParDefaut` pour une porte qu'elles ne connaissent pas (le lot R en
ajoute et en déplace au −1 : combat → ouverte si ses deux côtés sont dans la zone, sinon fermée ; prop hunt → 'auto' ;
listée dans `monde.inconnues` et au rapport) ; `TABLE_DEPOLIS` (les vitres dépolies parmi les 51 formes `vitre`,
carte_monde § 9.7, relevées une à une) ; `MondePartie` : `preparerSession` (barrières `C.ajouterBoite(…, { camera: false,
balle: false, limite: id })` éteintes, une par passage frontière parmi les 46 ; rubalise en un `InstancedMesh` compilé ;
VANTAUX SOLIDES — une boîte orientée mince le long du vantail ouvert de chaque porte 'auto', même calcul que
`ecole_portes.js:546-548` à `ANGLE_AUTO`, `{ vantail: true, porte: nom }`, éteinte ; `depoli: true` posé sur les formes de
`TABLE_DEPOLIS`), `entrer` (portes forcées, vantaux solides allumés pour les portes 'ouverte' du COMBAT, `Portes.pilotees`,
ascenseur coupé, barrières de la zone allumées, `vis.forcees`, bornes, glace de l'accueil peinte), `sortir` (l'état
EXACT de la balade, glace comprise), `majPortes` (portes 'auto' du prop hunt : ouvertes si un acteur VIVANT est à < 2,1 m
à son niveau, dans `Partie.pas`, déterministe), `verrouiller`, `noeudsAutorises`, `image` (rubalise, vantaux), `etat` /
`appliquer` (`{ k, sens }` des portes 'auto').
**Remplit** : `js/jeu/monde_partie.js`. **Crée** : `js/jeu/tests/test_monde.js`. **Touche** : `js/ecole_portes.js`,
`js/ecole_visibilite.js`, `js/ecole_ascenseur.js`, `js/carte_ecole.js`. **Dépend** : S0. **Contre le squelette de** :
`nav.js` (le test des barrières prend des points libres de part et d'autre).
**Acceptation (`test_monde.js`)** :
1. Chaque porte de `portes.liste()` a une règle — celle des tables, ou `regleParDefaut` (notée) : « 0 porte inconnue sans
   règle » ; entrée en combat : `k` et `forme.off` de chacune = sa règle ; une porte FICTIVE ajoutée par le test (deux
   côtés dans la zone) → ouverte en combat, 'auto' en prop hunt, listée dans `monde.inconnues`.
2. `sortir()` → `instantane()` identique (égalité profonde) à celui d'avant `entrer`, pour chaque zone et chaque mode.
3. Ascenseur en partie : appel sans effet, 120 s de bots devant lui → 0 transport ; après la sortie, `verifierAscenseur()`
   vrai.
4. Barrières : pour chaque zone (`ss`, `e2`, `e1`, `rdc`, `rdc_rue`, `etages`), 200 trajets tirés (graine 23) vers
   l'extérieur → 0 acteur hors de la zone ; les barrières laissent passer la caméra et les balles.
5. Rubalise : 1 appel ; programmes constants à `entrer`.
6. Prop hunt : une porte 'auto' s'ouvre pour N'IMPORTE QUEL acteur vivant à < 2,1 m de son niveau et se referme ;
   `verifierDeterminisme` égal avec des portes en mouvement ; `etat` / `appliquer` des portes.
7. Visibilité : 6 photos aux portes ouvertes des pièces de `FERMEES` (combat) : aucune pièce coupée, ≤ + 60 appels par
   rapport à la balade à la même pose.
8. `jeuCarte` : l'acteur suivi sur un autre niveau → `carte.maj` montre SON niveau.
9. `noeudsAutorises` : aucun nœud dans une pièce fermée par la table, aucun hors des pièces de la zone.
10. `joueur.bounds = BORNES_JEU` dans les zones avec rue, remis à la sortie ; le « jour » de l'escalier a `balle === false` ;
    chaque modèle vitré a `vitre === true`.
11. `rejouerBalade()` au bit près (L-M touche quatre fichiers de carte) ; `verifierSieges()` 346 / 346.
12. Vantaux solides : en combat, 20 balles tirées dans des vantaux OUVERTS (portes 'ouverte' de la table) → 20 arrêtées
    (`mat` du vantail) ; 20 trajets de `Pilote` qui frôlent un vantail ouvert → 0 traversée ; hors partie, toutes les
    boîtes `vantail` éteintes (`instantane()` = la référence).
13. Dépolis : `TABLE_DEPOLIS` non vide, chaque entrée trouvée (forme `vitre` à ≤ 5 cm) ; `forme.depoli` vrai sur elles
    seulement ; 0 hors partie (le drapeau ne change rien à la balade : `rejouerBalade` au bit près).
14. Glace de l'accueil : `miroirAccueil.coupe` vrai en partie, rendu à sa valeur à la sortie ; face à la glace, la
    caméra déplacée de 30 cm entre deux images pendant 60 images : le compteur `miroirAccueil.rendus` ne bouge pas en
    partie (il augmente en balade dans le même parcours).
**À F2** : `verifierBots` de L-D avec les tables (combat et prop hunt) ; barrières et `nav.restreindre` qui tombent au même
endroit (200 trajets de `Pilote` par zone) ; graphe régénéré avec les boîtes `vantail` allumées (empreinte changée une
fois) ; 0 traversée de vantail par un bot ; après la fusion du lot R : 0 porte inconnue sans règle, B ramené et libre.

### 5.6 VAGUE 2,5 — F2, LA FUSION DE LA VAGUE 2 (1 agent, port 8150, ≈ 1,5 j)
**Construit** : la branche `vague2` — `git merge --no-ff lot/<clé>` dans l'ordre du § 5.0, et après CHAQUE fusion
`&rapport=1&lot=<clé>&fusion=1` puis `&lot=S0` (un conflit = une faute de propriétaire : on s'arrête et on la trouve) ;
le lot R est fusionné après L-K SEULEMENT si son agent l'a déclaré fini (son dernier commit ne dit plus « EN COURS ») ;
les DEMANDES des 14 rapports tranchées (signatures du socle changées par F2 lui-même et notées ; valeurs renvoyées à la
vague 3 ou à INT) ; les tests `apresFusion` de tous les lots ; les corrections de raccord (n'importe quel fichier sauf
ceux du lot R, chacune notée « F2 : raccord — fichier — pourquoi » dans un commit à part) ; le banc du ressenti au stand ;
`tests/test_fusion.js` ; le rapport `docs/jeu/rapports/F2.md`, qui liste aussi ce que la vague 3 doit savoir (dont les
portes inconnues du lot R, les entrées de `EXCEPTIONS_PREFILTRE`, les non-étiquetés restants).
**Crée** : `js/jeu/tests/test_fusion.js`. **Modifie** : la branche `vague2` (fusions) ; corrections de raccord notées
(`tools/proprietaires.json` si un propriétaire change). **Dépend** : les 14 lots de la vague 2.
**Acceptation (`test_fusion.js`, et tous les fichiers de tests avec `&fusion=1`)** :
1. Les 15 fichiers de tests (S0 + 14) verts sur PC ; S0, L-B, L-C, L-E, L-F, L-I verts sous `?tel=1`.
2. La chaîne du tir, au stand, sur le mannequin à 10 m : clic simulé → `lireCommande` → `Arsenal` → `balle` → effet différé
   → `infliger` → marqueur et son PROGRAMMÉ (`start` au `journalAudio`) DANS LA MÊME IMAGE → recul visuel de l'arme de vue ;
   FA-24 au torse : élimination à 240 ms ± 1 pas ; 12 balles → montée de 6,76° (`camPitch` baisse de 0,118 rad).
3. Souris → caméra en ≤ 1 image (un `mousemove` synthétique avant l'image n est porté par le rendu de l'image n).
4. Chaque événement du § 4.6 a au moins un abonné ; chaque `touche` et chaque `elim` produisent ≥ 2 retours (visuel + son).
5. `verifierBots({ duree: 180, bots: 8, cerveau: 'errant' })` avec la table de combat sur `ecole` et la table du prop hunt sur
   `e1` (et `ss` si le lot R est là) : 0 hors monde, 0 sous le sol, 0 dans un mur > 0,2 s, 0 traversée (vantaux solides
   compris : 0 traversée de vantail), ≤ 1 coincé > 4 s et ≤ 1 téléportation de secours par 10 minutes-bot ; 200 trajets
   par zone : 0 sortie (barrières = `restreindre`) ; 50 franchissements de bots sur des liens « franchir » : ≥ 48 réussis.
6. Parties complètes de bots, simulées (`avancer` × 8) : équipes 4 c. 4 sur `ecole` 10 min (≥ 10 éliminations : le
   cerveau minimal se trouve), chacun pour soi 1 + 5 10 min, domination 4 c. 4 10 min, prop hunt 6 manches sur `e1`, stand
   (4 défis par un Haythem scripté) : 0 exception, fins justes, scores cohérents, 0 acteur hors monde.
6 bis. Pré-filtre de visibilité dans les DEUX sens (§ 3.7) : 10 000 paires « DDA visible » → 100 % « peut-être visible »
   (après `EXCEPTIONS_PREFILTRE`) ; 10 000 perceptions de bots : 0 à travers un mur ou une vitre dépolie.
7. Dans chaque mode : programmes constants après `preparer` ; 3 cycles lancer / quitter : mémoire ± 2 %, `instantane()`
   identique, `rejouerBalade()` au bit près ensuite.
8. Qualité figée moyenne, 7 bots : appels ajoutés ≤ 50 typiques, ≤ 150 au pire ; `Partie.pas` ≤ 0,5 ms ; processeur du
   gameplay ≤ 2,5 ms par image (temps, relatifs).
9. Capsules / os `Head` ≤ 6 cm en moyenne, ≤ 10 cm au 95e centile, avec les vrais corps armés.
10. Préparation d'une partie : 1re ≤ 4 s, suivantes ≤ 1,5 s (temps).
11. Le § 6 (tous ses points automatiques) vert.
12. Dix photos au rapport : hanche, visée, recharge, caméra de mort, menu, réglages, fin, stand, prop déguisé, chasseur ;
    et les 10 photos de lisibilité des équipes de L-C, refaites avec les chevrons de L-G.
13. ✋ À la main, SANS `?test=1` (vrai son, vraie capture du pointeur, onglet devant, un jeton du navigateur) : une manche
    de 3 min au clavier-souris (LANCER → « CLIQUE POUR JOUER » → GO → tirs, recharge, grenade, flash reçue d'un bot, pause
    par Échap, reprise par clic), une à la manette (reprise par Start sans capture), le test à l'aveugle des sons de L-H,
    une manche de prop hunt (roue des provocations à la souris capturée et aux chiffres) ; ce qui cloche va au rapport.
**Ensuite** : tag `vague2-ok` ; la vague 3 part de là.

### 5.7 VAGUE 3 — QUATRE LOTS EN PARALLÈLE (depuis `vague2-ok`)

#### 5.7.1 L-J — L'IA DU COMBAT (port 8151, ≈ 1 000 lignes, 3 j)
**Construit** : le `Cerveau` du § 3.7 — perception à 10 Hz et décision à 20 Hz décalées par id, dégradation à 5 / 10 Hz
au-delà de 0,5 ms ; vue (cône par difficulté, ≤ 50 m, proximité 2,5 m, ligne de vue œil → tête ou buste SIMULÉS ; vitres
dépolies opaques) et jauge de repérage (`tRepérage`) PUIS réaction (`reaction`) — deux délais qui s'ajoutent (§ 3.7) ;
ouïe par les événements avec ses erreurs semées ; douleur ; mémoire d'équipe (`signaler`, 0,6 s, oubli 6 s) ; trajets
qui empruntent les liens « franchir » (front `saut` du `Pilote`) ;
états PATROUILLE (points chauds, demi-vie 30 s) → ALERTE → TRAQUE → COMBAT → REPLI → OBJECTIF ; couverts ; modèle d'erreur
de visée `σ(t)` et ses facteurs, compensation du recul (`prendreRecul`), rafales, pas chassés, accroupi, ruée du PM-9 et du
FP-12, suppression, rechargements, pistolet, grenades, couteau, pré-visée des portes (Vétéran), Mixte ; dans `pilotage.js`
les déplacements de combat (pas chassés, changements de sens toutes les 0,5-1,2 s) ; dans `nav.js` les couverts et la
chaleur par zone.
**Remplit** : `js/jeu/cerveau.js`. **Touche** : `js/jeu/pilotage.js`, `js/jeu/nav.js`. **Crée** : `js/jeu/tests/test_ia.js`.
**Dépend** : F2.
**Acceptation (`test_ia.js`)** :
1. Pas de triche : la cible d'un bot est TOUJOURS un acteur qu'il a perçu (vue, ouïe, douleur, équipe) — espion sur
   l'affectation ; 10 000 perceptions : 0 vue à travers un mur, 0 à travers une forme `depoli` ; Haythem caché (y compris
   derrière un jour dépoli, à 3 m d'un bot), muet, qui ne tire pas : pendant 60 s, la visée d'aucun bot à < 10° de lui plus
   de 1 % du temps sans indice.
2. Cadences et décalages du § 3.7 ; passage en mode dégradé au-delà de 0,5 ms et retour.
3. Deux délais, médianes de 200 rencontres à 10 m : repérage (entrée dans le cône → jauge à 1) 0,65 / 0,45 / 0,30 /
   0,20 s ± 0,05 ; réaction (repéré → 1er tir) 0,65 / 0,45 / 0,30 / 0,20 s ± 0,05 ; total (entrée dans le cône → 1re
   balle) 1,30 / 0,90 / 0,60 / 0,40 s ± 0,08.
4. Buste à 10 m, FA-24, cible immobile : 12 / 25 / 50 / 85 % de touches ± 5 points (1 000 balles par difficulté) ; Haythem
   tué en 2,7 / 1,3 / 0,7 / 0,4 s de tir continu ± 20 %.
5. Jamais ralenti : vitesses des bots = `ALLURES` ± 1 % à toutes les difficultés.
6. Grenades : jamais en Recrue ; sinon seulement sur un ennemi connu, immobile depuis ≥ 3 s, derrière un couvert, à 8-25 m,
   sans ligne de vue ; ≥ 25 s entre deux par bot, ≥ 10 s par équipe.
7. Choix d'un couvert ≤ 0,2 ms, ≤ 2 par seconde ; `Partie.pas` avec 7 bots ≤ 0,5 ms (temps).
8. `verifierBots` avec le `Cerveau` de combat (équipes, 8 bots, 10 min) : 0 hors monde, 0 dans un mur, ≤ 1 coincé > 4 s par
   10 minutes-bot.
9. 4 c. 4 de bots en Régulier sur `ecole`, 10 min : ≥ 25 éliminations ; médiane apparition → premier contact 6-12 s.
10. Domination, 10 min : chaque point pris au moins une fois par chaque camp ; ≥ 30 % du temps des bots en OBJECTIF.
11. Un « Haythem » piloté par un cerveau Aguerri contre des Réguliers : 1,5 à 3 éliminations par minute (le rythme du § 2.3).
12. `verifierDeterminisme(42, 60)` égal ; Mixte : alliés Réguliers, ennemis tirés entre Recrue et Aguerri.
13. Franchissement : Haythem (scripté) passe par-dessus le comptoir de l'accueil pour semer un bot qui le traque : le bot
    le suit par le lien « franchir » (≤ 2 s de retard) au lieu de faire le tour, 9 fois sur 10.

#### 5.7.2 L-O — L'IA DU PROP HUNT (port 8152, ≈ 800 lignes, 2,5 j)
**Construit** : `CerveauChasseur` (§ 3.9, prop § 9 : soupçon sur les props vivants ET les vraies poses des pièces voisines,
reçus MÊLÉS par `candidatsMeubles`, par les MÊMES tests ; `λ` ; `ε` par (bot, pose) en début de manche ; cône 100°, 18 m ;
ATTENTE → PATROUILLE → FOUILLE → ENQUÊTE → SUSPECT → TIR_TEST → TRAQUE ; ouïe et `σ` ; mémoire « vérifié » ; grenade en
Difficile ; coéquipier de Haythem un cran moins doué ; sprint limité par l'endurance comme tout chasseur) ;
`CerveauCacheur` (choix de cachette parmi les cachettes ATTEIGNABLES par la note du § 3.9, trajet sur le graphe des
PROPS (`partie.navProps`), pose, figé quand vu, déplacement sous pression hors de vue, provocations, fuite sous 50 % —
une fuite qui casse la ligne de vue est possible, les chasseurs n'ayant que 4 s de sprint) ; réglages dans
`REGLAGES_PROP`, `DIFFICULTES_PROP`, `cachettes` et `credibilite`.
**Remplit** : `js/jeu/cerveau_prop.js`. **Touche** : `js/jeu/deguisements.js`, `js/jeu/partie_prop.js`. **Crée** :
`js/jeu/tests/test_ia_prop.js`. **Dépend** : F2 (et le `CerveauBase` de `vague2`, dont il n'emploie que `viserVers`,
`allerA`, `entendre`).
**Acceptation (`test_ia_prop.js`)** :
1. Pas de triche : un prop et une vraie pose de même crédibilité, à la même place, donnent le MÊME `λ` (au bit près) ;
   `cerveau_prop.js` ne lit jamais `prop` ni `role` d'un autre acteur hors des fonctions de perception (espion).
2. Perception à 5 Hz, un bot par image, ≤ 0,15 ms chacune (temps).
3. Mode simulé, 20 manches × 8, `e1` (et `ss` si le lot R est là), Normal : les chasseurs bots trouvent 40-70 % des props ;
   2 à 8 tirs « vrai meuble » par chasseur et par manche ; survie des props bots 30-60 % ; ≥ 80 % des props bots cachés
   dans une cachette de crédibilité ≥ 0,6 (aucun « au milieu de la pièce » faute de cachette atteignable).
4. Facile < Normal < Difficile en taux de découverte, ≥ 10 points d'écart à chaque cran.
5. 0 tir de chasseur pendant la cachette ; en Facile, aucun prop bot ne bouge après la cachette ; figé quand vu après 0,5 /
   0,25 / 0,1 s ± 1 pas.
6. Haythem prop immobile dans une cachette `cred ≥ 0,8`, Normal, 3:00 : trouvé dans ≤ 50 % de 20 manches ; au milieu d'un
   couloir (`cred ≤ 0,2`) : trouvé dans ≥ 90 %.
7. Haythem chasseur : sur 10 manches, aucun prop bot vu en mouvement dans son cadre plus de 0,25 s (Normal).
8. Grenade seulement en Difficile, sur une grappe de soupçons ≥ 60 ; `Partie.pas` à 5 acteurs ≤ 0,6 ms (temps) ;
   `verifierDeterminisme(42, 60)` égal.
9. Fuite : 20 props bots touchés sous 50 % en Difficile (fuite 30 %) et Facile (80 %) : la part qui fuit = le réglage
   ± 10 points ; ≥ 25 % des fuites cassent la ligne de vue du chasseur avant d'être rattrapées.

#### 5.7.3 L-P — LA PROGRESSION (port 8153, ≈ 1 000 lignes + 200 de CSS, 2,5 j)
**Construit** (CoD §§ 7.7 et 11) : profil `iris.profil.v1` (XP, niveaux 1-40 à `800 + 200 (n − 1)`, déblocages,
statistiques par arme et par mode, défis du jour tirés à la date) ; accessoires (point rouge, poignée, chargeur étendu,
silencieux) et atouts (Endurance, Main sûre, Pas feutrés, Récupération, Fantôme) passés à l'`Arsenal` en
`modificateurs` ; classes personnalisées (5) ; séries par vie (3 Drone 25 s, 5 Gilet + 60 d'armure, 7 Sentinelle 40 s ou
300 PV qui tire comme un Régulier à ≤ 25 m sur 180° ; les bots ont le drone, qui nourrit leur mémoire d'équipe toutes les
3 s) ; médailles et lignes « +XP » ; armes au sol (lâchées à la mort, ramassées par F = `interagir`, 30 s, 10 au plus) ;
leur AFFICHAGE et celui de la sentinelle et du drone dans `aff_progression.js` (`AffProgression`, abonné aux événements,
lecteur de l'état : `series.js` et `armes_au_sol.js` sont des fichiers de simulation, ils n'importent jamais
l'affichage) ; écrans ARMURERIE (l'arme montrée par `aff.viewmodel.vitrine(id)`) et PROFIL, barre d'XP sous le titre du
menu ; la décision sur le chargeur rendu à l'élimination (§ 3.5) une fois les armes au sol arrivées, notée au rapport.
**Remplit** : `js/jeu/profil.js`, `aff_progression.js`, `css/jeu/progression.css`. **Crée** : `js/jeu/series.js`,
`menu_progression.js`, `armes_au_sol.js`, `js/jeu/tests/test_progression.js`. **Touche** : `js/jeu/partie_fps.js`,
`hud_jeu.js`, `menus_jeu.js`. **Dépend** : F2.
**Acceptation (`test_progression.js`)** :
1. Barème d'XP exact pour chaque événement ; cumul : niveau 10 à 14 400 XP, niveau 40 à 179 400.
2. Déblocages aux niveaux de la table ; un objet verrouillé n'est pas proposé.
3. Accessoires mesurés par l'`Arsenal` : point rouge zoom × 1,30 ; poignée : 12 balles de FA-24 → 5,41° (× 0,8), ADS + 0,02 s ;
   chargeur étendu 45 balles, ADS + 0,04 s, recharge + 0,2 s ; silencieux : bruit 8 m, aucun point sur la mini-carte, paliers
   − 15 %.
4. Atouts mesurés : Endurance (tactique 6 s, recharge de la jauge × 0,5), Main sûre (recharge × 0,75, changement × 0,8), Pas
   feutrés (rayon d'audition des bots ÷ 3), Récupération (régénération à 2,5 s), Fantôme (invisible au drone).
5. Séries : drone 25 s (ennemis sur la mini-carte toutes les 2 s, sauf Fantôme) ; gilet pris avant la vie ; sentinelle 40 s
   ou 300 PV, 25 % ± 5 de touches à 10 m, ≤ 25 m, 180° ; compteur remis à zéro à la mort.
6. Les 16 médailles de CoD § 7.7 provoquées une à une → XP et ligne exactes.
7. Profil enregistré puis relu identique ; stockage qui lève → le jeu tourne, profil en mémoire ; jamais d'écriture de
   `iris.settings.v1`.
8. Armes au sol : lâchée à la mort d'un bot, ramassée par F (`ramasser` vrai, munitions reprises), disparue à 30 s, 10 au
   plus ; ≤ 3 appels chacune.
9. Armurerie et profil navigables à la manette ; arme qui tourne par `vitrine(id)` dans la scène de l'arme de vue (0 lumière
   ajoutée à la scène de jeu, `viewmodel.js` non modifié par L-P).
10. Seuils de L-G toujours tenus (≤ 2 écritures DOM par image) ; `verifierDeterminisme` égal séries actives ;
    `verifierEtat()` vrai (champ `serie` des acteurs).
11. Pureté : `series.js` et `armes_au_sol.js` n'importent aucun module d'affichage ; les maillages des armes au sol, de la
    sentinelle et du drone sont créés par `aff_progression.js` seul (racines de scène, `dynamique`, compilés à la
    préparation : programmes constants).

#### 5.7.4 L-Q — LA KILLCAM (port 8154, ≈ 500 lignes, 1,5 j)
**Construit** : l'anneau d'images (30 Hz sur 6 s, tous les acteurs : position, cap, tangage, vitesse, accroupi, arme, état
d'arme ≈ 20 nombres, `Float32Array`) et les événements de tir ; le rejeu après la mort de Haythem (simulation GELÉE, corps
reposés depuis l'anneau, caméra dans l'œil du tueur avec SON arme de vue, traceurs et éclairs rejoués, 4,5 s finissant 1 s
après la mort, « KILLCAM FINALE » à la dernière élimination avec 0,4 s à × 0,25, Espace / A pour passer) ; la photo avant /
`partie.appliquer(photo)` après ; `jeuCarte` sur le tueur pendant le rejeu ; l'inspection de l'arme (`CHRONOS.inspection`,
jouée à la 1re sortie d'une arme dans la partie).
**Remplit** : `js/jeu/killcam.js`. **Touche** : `js/jeu/partie.js` (ajouts seulement : l'enregistrement après l'étape 10 du
pas, la photo, le gel), `vue_fps.js`, `viewmodel.js`, `anim_vue.js`, `effets.js`. **Crée** : `js/jeu/tests/test_killcam.js`.
**Dépend** : F2.
**Acceptation (`test_killcam.js`)** :
1. Anneau ≤ 200 Ko ; enregistrement ≤ 0,05 ms par pas (temps).
2. Rejeu de 4,5 s finissant 1 s après la mort (± 1 image) ; killcam finale avec ses 0,4 s à × 0,25.
3. Après le rejeu, `empreinte()` identique au bit près à celle d'avant ; le chrono n'a pas avancé.
4. Caméra à ± 2 cm de l'œil enregistré du tueur ; son arme de vue montrée ; 0 programme compilé pendant 20 rejeux ; mémoire
   stable (± 2 %).
5. Espace / A → fin dans l'image, état rétabli.
6. `carte.maj` suit le niveau du tueur pendant le rejeu ; L-A à L-V : leurs tests restent verts (ajouts seulement).

### 5.8 VAGUE 4 — INT, L'INTÉGRATION (1 agent, port 8160 puis master sur 8124, ≈ 2,5 j)
**Construit** : la branche `integration` (`vague2-ok` + L-J → L-O → L-Q → L-P, puis le lot R s'il est fini et pas déjà
dans `vague2`) ; les demandes de la vague 3 tranchées ; les réglages fins (valeurs des §§ 3.3-3.9 d'après le stand, les
parties simulées et les rapports) ; la décision « Priorité fluidité » / `BUDGET_IMAGE` sur mesures calmes ; `sw.js`
(`VERSION = 'iris-v3.0'`) ; le relevé de chargement (`?chargement=trace` → `liste_chargement.py` → `assets/chargement.json`,
`tools/chargement_releves.json`) ; les astuces de combat et de prop hunt (`chargement.js:465-476`) ; le sous-titre
« L'ÉCOLE · BALADE · COMBAT · PROP HUNT » (`index.html:128`) ; `sw.js` : les tests jamais mis en cache (`if
(url.pathname.includes('/js/jeu/tests/')) return;` en tête du `fetch`) ; `README.md` (Comment jouer : les trois portes,
les modes, les touches AZERTY par profil — dont SOURIS 5 pour le sprint tactique et le conseil de couper le raccourci des
« touches rémanentes » de Windows (5 Maj d'affilée) —, la manette, le tactile ; ce qui a été joué ; l'habillage Airsoft
par défaut et à garder pour toute vidéo publiée ; l'accord des amis pour leurs avatars) ; `CREDITS.md` ; trois parties
jouées jusqu'au bout ; le § 6 entier ; `docs/jeu/rapports/INT.md` ; l'avance rapide de master et le tag `v3.0` ; les arbres
`IRIS_lots/*` retirés (branches gardées) et le dossier `IRIS_lots/_navigateur/` vidé.
**Crée** : `js/jeu/tests/test_integration.js`. **Modifie** : `js/game.js`, `js/input.js`, `js/settings.js`, `js/main.js`,
`js/chargement.js`, `index.html`, `css/style.css` (si besoin), `sw.js`, `assets/chargement.json`,
`tools/chargement_releves.json`, `README.md`, `CREDITS.md`, et les fichiers des lots pour les réglages et raccords notés.
**Dépend** : L-J, L-O, L-P, L-Q (et F2).
**Acceptation (`test_integration.js`, tous les fichiers avec `&fusion=1&calme=1`, machine calme, un seul onglet)** :
1. Les 20 fichiers de tests verts sur PC, SANS seuil de temps « signalé » ; S0, L-B, L-C, L-E, L-F, L-I, L-J, INT verts sous
   `?tel=1`.
2. Budgets absolus du § 3.10 (Radeon 660M, moyenne, 7 bots) : processeur du gameplay ≤ 2,5 ms par image, `Partie.pas`
   ≤ 0,5 ms, appels ajoutés ≤ 50 typiques / ≤ 150 au pire, voix ≤ 24 ; téléphone ≤ 3 ms, ≤ 0,6 ms, ≤ 80 appels, ≤ 12 voix ;
   préparation 1re ≤ 4 s puis ≤ 1,5 s (téléphone 10 s / 3 s).
3. Une partie 4 c. 4 aux 11 endroits de `carte_props` § 4.1 (moyenne) : image médiane ≤ 22 ms (45 im/s, la cible de la
   qualité auto), le hall mesuré AVEC la glace de l'accueil à l'écran (peinte en partie) et au sprint ; sinon les leviers
   du § 3.10, dans l'ordre, appliqués et notés. Toutes ces mesures onglet DEVANT (sous `&calme=1`, une mesure « non
   valable » échoue).
4. Démarrage de la balade : « APPUIE POUR COMMENCER » ≤ référence + 0,3 s (médiane de 3, PC) ; aucun fichier de plus chargé
   au démarrage hors `js/jeu/*.js` et `css/jeu/*.css`.
5. Le § 6 vert, point par point.
6. Trois parties jouées jusqu'au bout (équipes 10 min Régulier ; prop hunt 6 manches, Haythem prop puis chasseur ; stand,
   4 défis) : 0 erreur à la console, 10 photos au rapport.
7. Hors ligne : 2e lancement sans réseau → balade ET une partie (avatars en cache) ; après une passe de tests sur 8124,
   `caches` ne contient AUCUN fichier de `js/jeu/tests/`.
8. `git status` propre ; `verifier_proprietaires` des 4 branches de la vague 3 : OK ; master avancé sans fusion
   (`--ff-only`) ; `VERSION` `iris-v3.0` affichée à l'écran de chargement.
9. ✋ Les points « à la main » de F2 (point 13) refaits sur `integration` PUIS sur master à 8124, dont : la flash reçue
   en qualité Basse (calque blanc visible), le prop hunt sur la zone par défaut, une partie avec des amis cochés et une
   sans (chevrons, lisibilité), l'habillage Militaire puis Airsoft.

### 5.9 Tailles et calendrier
| | Lignes (ordre de grandeur) | Durée d'un agent | Calendrier |
|---|---|---|---|
| S0 socle | ≈ 2 400 (contrats ≈ 750, squelettes et données ≈ 800 — dont le cerveau minimal qui joue et `franchissable` —, prises ≈ 300, harnais et outils ≈ 550 — rejeu déterministe, images sans rAF, son hors ligne) | 2,5 j | j 1-3 |
| Vague 2 (14 lots) | ≈ 11 500 + 800 de CSS + 40 lignes de carte + l'outil des portraits | 1 à 2,5 j chacun (3 pages de navigateur à la fois) | j 3-6 |
| F2 | raccords, tests, parties à la main | 1,5 j | j 7-8 |
| Vague 3 (4 lots) | ≈ 3 400 | 1,5 à 3 j chacun | j 8-11 |
| INT | réglages, documents | 2,5 j | j 11-13 |
| **IRIS v3.0 (balade + combat + prop hunt + stand, solo contre des bots)** | **≈ 17 800** | | **≈ 13 jours de calendrier** |
| Plus tard (hors de ce document) : LAN + hôte autoritaire (§ 4.7) | ≈ 1 000 repris de LA CAGE + ≈ 600 neufs | 5-6 j | |

Le jeu est JOUABLE à la fin de F2 : le cerveau minimal du socle n'est pas un mannequin (il erre vers les points chauds,
repère avec les deux délais de sa difficulté, vise avec l'erreur σ∞, tire par rafales, franchit les obstacles par les
liens du graphe), les armes, les modes et le stand sont complets, et le prop hunt oppose des cacheurs immobiles (dans des
cachettes atteignables) à des chasseurs qui tirent au hasard sur les meubles qu'ils voient — sans jamais lire qui est
prop. La vague 3 le rend bon.

---------------------------------------------------------------------------------------------------------------------

## 6. CE QUI NE DOIT PAS CASSER, ET COMMENT LE VÉRIFIER

Le principe : tout ce qui est neuf vit derrière `game.partie` (ou `mode === 'menu'`) ; ce qui reste visible en balade
est COMPARÉ à une référence enregistrée sur `a8b22dd` (§ 5.4, étape 0), jamais jugé « à l'œil ». Les vérifications
automatiques sont dans `test_socle.js` (groupe « balade ») et rejouées par TOUS les lots (§ 5.1, règle 5b) ; celles
marquées ✋ sont faites à la main par F2 et INT.

### 6.1 La balade
| Ce qui ne doit pas bouger | Comment on le vérifie | Seuil |
|---|---|---|
| Les déplacements de Haythem (course, sprint, endurance, saut, marche, s'asseoir, se lever, porte 6) | `rejouerBalade()` (§ 4.10.1 : hasard semé, horloge simulée, état remis à zéro, une seule tâche synchrone), vue 3 et vue 1, profils PC et `?tel=1` | positions, cap, `camYaw` ≤ 1e-9 (ou le seuil de l'auto-contrôle, 1e-6, noté) |
| `Player.update` = `simuler` + `poser` dans l'ordre d'aujourd'hui | idem (c'est lui qui le prouve) ; L-C le rejoue après chaque commit qui touche `player.js` ou `couches.js` | idem |
| L'arrivée directe | `?partie=balade` et `settings.game.demarrage = 'balade'` → `mode === 'lobby'`, `partie === null`, Haythem au départ face à la pile « iris » | égalité avec `a8b22dd` |
| Le menu ne change rien à la balade | menu → BALADE LIBRE → `rejouerBalade()` | ≤ 1e-9 |
| La pause de la balade | boutons d'aujourd'hui + « Modes de jeu » seulement ; Reprendre / Options / Commandes / Revenir au départ marchent | liste exacte |
| Vues 1 → 4, emotes, téléphone, cap assisté, rangs, sièges, portes automatiques, voiles, sons de pas des couches | groupe « balade fonctionnelle » de `test_socle.js` : cycle C (3 → 2 → 1 → 4 → 3) ; `doEmote(0)` joue un clip ; P ouvre puis ferme le téléphone (`input.blocked` vrai puis faux) ; entrée dans une rangée de la salle David Clark → `rang` posé ; 5 s de marche → sons de pas PROGRAMMÉS (`start` au `journalAudio`, ± 10 % de la référence) ; endurance − 22/s au sprint ; à l'arrivée en balade, l'aide des touches (`#hud-hint`) s'affiche comme aujourd'hui (`enterLobby()` sans argument = `aide: true`) | chacun vrai |
| Les entrées de la balade | `verifierEntrees()` en balade ; touches par défaut de la balade = `ACTIONS` de `a8b22dd` ; un `iris.settings.v1` ancien garde SES touches | 0 / égalité |
| Le HUD de la balade | empreinte du `innerHTML` de `#hud` en balade = référence ; `.stamina`, `#hud-keys`, `#phone-badge` visibles | égalité |
| Rien de neuf dans la scène de la balade | lumières de la scène = référence ; `[optim] 4 198 → 232` ; passe superposée désactivée ; aucun enfant de scène ajouté par `js/jeu/` avant la 1re partie | égalité |
| Le retour d'une partie | `quitter('balade')` après chaque mode : `instantane()` = référence (portes `k`/`off`, boîtes des vantaux éteintes, ascenseur, barrières éteintes, glace de l'accueil rendue, bornes, profil `balade` et `input.sourisJeu` faux, vue, `_decalCmd = 0`, corps de Haythem visible et audible, `capFixe`/`rayon`/`hautCorps` remis), puis `rejouerBalade()` | égalité ; ≤ 1e-9 |

### 6.2 Le tactile
- En balade : `__touch._contexte()` = la référence (mêmes boutons, mêmes emplacements, même libellés) ; regard du doigt
  `0,006 × s` rad/px et bornes − 0,1 / 0,9 ; la disposition éditée de Haythem (`controls.tactile.places`) relue telle quelle.
- En mode `'menu'` : calque caché ; en partie : contexte de partie ; au retour en balade : contexte d'aujourd'hui.
- ✋ `?tel=1` + émulation mobile (812 × 375) : une balade de 2 min au doigt (escalier principal, s'asseoir, téléphone,
  emote), puis une partie entière au doigt (L-I, point 11).

### 6.3 La manette
- En balade : stick droit 2,9 rad/s en lacet, 1,6 en tangage, bornes − 0,1 / 0,9, zone morte 0,15 ; RT = sprint ; les racines
  `phone`, `options`, `overlay` navigables ; `hoops-feedback` fait vibrer comme aujourd'hui ; manette débranchée → pause.
- Les racines du jeu ne prennent jamais le focus en balade (`NavMenus.ouvertes()` en balade = celles d'aujourd'hui).
- ✋ une balade et une partie à la manette seule (F2 et INT).

### 6.4 `?tel=1`
- Profil `ecole/tel` chargé (liste de chargement du téléphone), qualité automatique au départ en moyenne, `rejouerBalade()`
  au bit près contre la référence `tel`.
- En partie : 3 avatars distincts au plus, 2 bots posés pleinement, pools réduits (§ 3.10), ≤ 12 voix, défauts 1 + 3 / 2 c. 2 /
  5 acteurs ; tests S0, L-B, L-C, L-E, L-F, L-I, L-J, INT verts sous `?tel=1` (INT).
- ✋ au −1 en prop hunt : ≥ 30 im/s mesurés au calme (INT).

### 6.5 Le chargement
- Rien de plus n'est chargé au démarrage que les modules `js/jeu/*.js` et `css/jeu/*.css` (liste des requêtes réseau
  jusqu'à « APPUIE » = celle de `a8b22dd` + ces fichiers) ; avatars des amis, graphe, catalogue : à la PRÉPARATION d'une
  partie seulement ; au MENU et dans ses réglages, seulement les portraits (`assets/portraits/*.webp`, images), jamais un
  `.glb`, jamais un 2e contexte WebGL.
- Durée jusqu'à « APPUIE POUR COMMENCER » ≤ référence + 0,3 s (32,7 s mesurés le 22/10 avec d'autres onglets : INT refait
  la référence au calme sur `a8b22dd`, puis mesure `integration`, médiane de 3).
- Les tests ne sont jamais dans la liste de chargement (importés dynamiquement) ni dans le cache hors ligne (`sw.js` les
  saute, prise d'INT, § 4.9 ; vérifié par INT point 7).
- `?chargement=trace` marche ; 0 erreur à la console pendant le chargement ; l'écran de chargement affiche `iris-v3.0`
  après INT (pas avant : `VERSION` ne change qu'à l'intégration).
- Hors ligne : 2e lancement sans réseau → balade (INT, ✋).

### 6.6 Les 346 sièges
- `game.siegesTous.length === 346` (copie au constructeur, avant tout `carte.maj` : piège 9 du cœur) et empreinte des sièges
  = référence.
- `verifierSieges()` : 346 assis sur 346 en balade, avant ET après une partie de chaque mode (les places au milieu des
  rangs serrés prises par la ligne du rang, § 4.10.1).
- `game.sieges` (la liste refiltrée par niveau) : 64 au RDC au départ, comme aujourd'hui.
- Aucun lot ne retire, ne déplace ni ne filtre un siège ; les étiquettes de L-K ne touchent pas la liste.

### 6.7 L'ascenseur
- `verifierAscenseur()` en balade : appel, montée au 2e, descente — avant ET après une partie de chaque mode.
- En partie : inerte (L-M, point 3) ; aucun nœud de cabine dans le graphe (L-D, point 1).
- ✋ un aller-retour à la main au RDC → 2e après une partie (INT).

### 6.8 La caméra V2
- `rejouerBalade()` vue 3 : position et orientation de la caméra ≤ 1e-6 de la référence (le renfoncement de la porte 6, la
  salle d'attente, la porte 6 dans les deux sens sont dans le parcours).
- Coût de `updateCamera` en vue 3 ≤ 0,126 ms × 1,2 (temps, INT au calme).
- Après une partie : `game.vue` remise, `_decalCmd = 0`, aucun saut de caméra (distance à la pose de référence à 1 s ≤ 1 cm,
  dans `rejouerBalade` relancé après `quitter`).
- La V2 ne sert JAMAIS en partie (`Partie.camera` rend vrai à chaque image : compteur du harnais = 0 retour faux).

### 6.9 Les portes, la visibilité, la carte vivante
- `instantane()` identique avant / après chaque partie ; la porte 6 s'ouvre à l'approche de Haythem en balade (elle est sur
  le parcours de `rejouerBalade`) ; `vis.forcees === null`, `Portes.pilotees === false` en balade ; boîtes `vantail`
  éteintes, glace de l'accueil vivante (`coupe` à sa valeur de balade) ; le drapeau `depoli` ne change rien en balade.
- En mode `'menu'`, la carte vivante suit le corps fictif du menu (spots et carte d'environnement de la zone filmée) ; en
  balade, elle suit Haythem comme aujourd'hui.
- Appels et triangles aux 11 endroits de `carte_props` § 4.1 en balade, qualité figée haute et moyenne : identiques à la
  référence (L-K, L-M, F2, INT).

### 6.10 Les réglages de Haythem et LA CAGE
- `iris.settings.v1` : les tests n'écrivent jamais dedans (réglages en mémoire) ; un fichier ancien est réparé sans perdre
  une touche (S0, point 15) ; `iris.chargement.v1`, `iris.phone.v1` intacts.
- LA CAGE (`C:/Users/hgami/Downloads/Basket_1v1_nouveau/Basket_1v1`) : lue seulement — `git status` y reste vide ; le port
  8123 n'est jamais pris.
- Le lot R : `js/ecole_soussol.js` et `js/ecole_amphi.js` jamais modifiés par une branche du jeu (`verifier_proprietaires`) ;
  son arbre `.claude/worktrees/…` jamais touché.

### 6.11 Qui vérifie quoi, quand
| Moment | Ce qui est rejoué |
|---|---|
| Chaque lot, avant de finir | `&lot=S0` (§§ 6.1, 6.6-6.8 automatiques) + ses propres tests ; L-C, L-K, L-M, L-H, L-I, L-U : aussi leurs points de balade (tactile, manette, sons, HUD, appels) |
| F2, après chaque fusion | `&lot=<clé>&fusion=1` puis `&lot=S0` ; à la fin, tout le § 6 automatique, PC et `?tel=1` ; ✋ manette et tactile |
| INT | tout le § 6 avec `&calme=1`, ✋ compris, sur `integration` PUIS sur master après l'avance rapide (port 8124, comme Haythem) |

---------------------------------------------------------------------------------------------------------------------

## 7. LES RISQUES ET LEURS PARADES

| # | Risque | Proba. / impact | Détection | Parade | Qui |
|---|---|---|---|---|---|
| R1 | Deux lots écrivent le même fichier : fusions en conflit | moyenne / fort | `verifier_proprietaires.py` à chaque fin de lot ; F2 s'arrête au 1er conflit | un propriétaire par fichier et par vague (§ 5.2) ; toutes les prises par le socle ; câblage figé (§ 5.4, étape 4) | S0, chaque lot, F2 |
| R2 | Le socle est le goulot : une signature ou une donnée fausse se paie 14 fois | forte / fort | `test_socle` point 11 (introspection des signatures) ; demandes des rapports | signatures recopiées du § 4.5 au caractère près ; données complètes dans les squelettes ; la vague 2 ne part qu'au tag `socle-ok` ; un lot peut AJOUTER, F2 tranche les changements | S0, F2 |
| R3 | Régression de la balade par la découpe de `Player.update` ou une prise | moyenne / fort | `rejouerBalade` au bit près, vue 3 et vue 1, PC et `?tel=1` | même ordre d'instructions ; prises derrière `game.partie` ; rejouée après chaque prise du socle et par tous les lots | S0, L-C, tous |
| R4 | Le lot R change la carte du −1 sous la navigation et le registre | forte / moyen | empreinte du graphe ; `verifierNav`, `verifierBots`, `verifierMeubles` après sa fusion | graphe régénéré par empreinte ; apparitions par zone, ramenées au nœud ; étiquettes lues au chargement, aucune coordonnée de meuble en dur | L-D, L-K, F2, INT |
| R5 | Le lot R n'est pas fini à F2 : le −1 sans étiquettes, sans meubles déguisables | moyenne / moyen | `typesDeguisables('ss').length < 6` | le menu grise le −1 (et le 2e, 3 types), défaut calculé au lancement → le 1er (`e1`, ≈ 10 types, § 3.9) ; tests du prop hunt sur `e1` ; INT fusionne R plus tard sans rien changer | L-U, L-F, INT |
| R6 | Coût des bots (poses à 120 Hz : 6 bots = image de 21,8 → 39,8 ms) | forte si rien n'est fait / fort | `__jeu.images`, temps de `Partie.image` | simuler à 120 Hz, poser une fois par image, cadence par distance et visibilité (L-C) | L-C, F2 |
| R7 | Appels de dessin sur la puce intégrée (bots, props, effets) | moyenne / fort | appels aux 11 endroits, qualité figée | avatars `tel/`, ≤ 6 distincts, coupe par zones, ombre au niveau de la caméra, pools en `InstancedMesh`, moyenne conseillée en combat | L-C, L-H, INT |
| R8 | Une lumière ajoutée dans la scène de jeu (éclair, scanner, surbrillance) : 27 s d'image figée | faible (règle) / très fort | `Light(` cherché dans `js/jeu/` hors `viewmodel.js` ; nombre de lumières comparé | aucune lumière en jeu ; quads additifs + bloom ; la scène de l'arme a ses 3 lumières constantes | tous, L-H, L-V |
| R9 | Programmes compilés en pleine manche (bot, arme, impact, prop, lunette) | moyenne / fort | test « programmes constants » dans chaque lot qui dessine | tout compilé dans `preparer` ; matériaux Avaturn = ceux de Haythem ; prototypes de meubles jumeaux du décor | L-C, L-V, L-H, L-K |
| R10 | Bots bloqués (portes, ascenseur, rangs, passages étroits : 36 % des trajets aujourd'hui) | forte / fort | `verifierBots` | portes par table, ascenseur coupé, `sansRangs`, représentants poussés, balayage, coincé → replanification → secours hors de vue | L-D, L-M, F2 |
| R11 | Balles qui traversent sols, vitres, meubles bas | forte avec `rayonLibre` / fort | tests verticaux, vitres et meubles bas de L-A | DDA : sols, formes `camera: false`, vitres, `balle: false` | L-A |
| R12 | Capsules simulées décalées de la tête affichée (penché en course) | moyenne / moyen | écart ≤ 6 cm moyen, ≤ 10 cm au 95e centile | tête avancée dans les capsules ; sinon penché des couches coupé pour un acteur armé | L-A, L-C |
| R13 | Échap et pointeur : pause qui ne s'ouvre pas, recapture refusée < 1 s, Échap et manette qui ne sont pas des activations, clic de LANCER expiré au GO, clic de capture qui tire, `unadjustedMovement` absent (Firefox), aperçu en iframe qui refuse tout | certaine / moyen | tests S0 5 et 13, L-B 15, L-I 11-12 | pause sur `pointerlockchange` ; `Souris:*` seulement sous capture et 150 ms après ; capture exigée au clavier-souris seulement ; calque « CLIQUE POUR JOUER » (§ 4.3.5) au décompte et à la reprise ; la manette et le doigt reprennent sans capture ; repli sans option | S0, L-B, L-I |
| R14 | Fronts fantômes et touches tapées pendant la pause (tirs, grenades, emotes fantômes) | certaine (vérifié) / moyen | `verifierEntrees` | purge à la reprise, vieillissement 0,35 s, purge des codes non liés | S0 |
| R15 | Ctrl + Z (= Ctrl + W en AZERTY) ferme l'onglet | certaine si Ctrl est lié / fort | revue des défauts ; test L-U 11 | jamais Ctrl par défaut ; avertissement ; `navigator.keyboard.lock()` en plein écran | S0, L-U |
| R16 | Convention de caméra fausse (le « + π » d'une carte) ; signe du recul inversé | moyenne / moyen | `test_socle` point 6 (formule à 0,1°, azimut de la vue 1, signe du tangage) ; L-A 11, L-B 17 | formule du § 1, arbitrage 2 ; signe du recul écrit au § 3.2 (un cabré DIMINUE le tangage) | S0, L-A, L-B |
| R17 | Recuisson de l'ombre du sol par le chargement des bots (< 30 s après la construction) | moyenne / faible | `onLoad` compté (L-C, point 1) | chargeur discret | S0, L-C |
| R18 | Mémoire graphique (611 Mo pour 10 avatars PC) et fuites d'une partie à l'autre | moyenne / fort au téléphone | `memoire()` sur 3 cycles | `tel/`, ≤ 6 / ≤ 3 distincts, `Player.dispose`, affichage créé une fois par session | L-C, F2 |
| R19 | Sons : déchets mémoire, trop de voix, aucune direction | certaine aujourd'hui / moyen | tests L-H 5-7 | bruits précalculés, 24 voix, `PannerNode`, pas émis par la simulation | L-H |
| R20 | Déterminisme cassé (un `Math.random`, l'affichage qui tire dans `partie.rng`, des portes animées dans `carte.maj`) | moyenne / moyen (tests, réseau futur) | `verifierDeterminisme` ; pureté | règle 4 ; fichiers « simulation » cherchés par `verifier_proprietaires` ; portes 'auto' dans `Partie.pas` ; recul consommé au pas (§ 5.5) | tous |
| R21 | `_tour` réentrant dans les rayons (collisions faussées sans erreur) | faible / fort | tests L-A | règle 8 ; la balistique tient son propre parcours | L-A |
| R22 | Au téléphone, viser et tirer en même temps est injouable au pouce | forte / fort au téléphone | test L-I + partie au doigt | TIR mixte (regard), tir auto par défaut, assistance | L-I |
| R23 | Lenteur du téléphone : graphe 2-4 s, préparation longue | moyenne / moyen | chrono sous `?tel=1` | cache IndexedDB ; 3 bots ; un Worker plus tard si nécessaire | L-D, INT |
| R24 | Les visages réels des amis comme cibles | — / humain | — | par défaut AUCUN avatar d'ami coché (Haythem cloné et teint) ; README : demander à chacun avant de les cocher | L-U, INT |
| R25 | Licences : danses CC BY 4.0 sans crédits en jeu ; GLB de LA CAGE sans licence notée | certaine / moyen | revue ; test L-U 9 | écran CRÉDITS ; seuls les avatars `tel/` des amis sont repris de LA CAGE | L-U, INT |
| R26 | Service worker : un fichier lourd changé servi périmé (dans un arbre de lot, ou chez Haythem) | moyenne / faible | photos, tailles des textures | une origine par port et par lot ; `__jeu.oublierCache()` ; fichiers neufs = URL neuves ; `VERSION` à l'intégration | tous, INT |
| R27 | Le prop qui penche avec les couches, fait des bruits de pas, garde le rayon de Haythem | certaine si rien / moyen | tests L-K 8 et 11 | `CorpsProp` pour TOUS les props (arbitrage 19), Haythem garé ; racine à part | L-K |
| R28 | Spirale d'images lentes (6 pas par image × IA lourde) | faible / fort | `Partie.pas` ≤ 0,5 ms | IA à 10/20 Hz décalées, A* en file, dégradation automatique | L-D, L-J |
| R29 | Agents qui mesurent en même temps : chiffres faux | certaine / faible | — | ports séparés, seuils de temps « signalés » pendant les vagues, mesures absolues à l'intégration seule (`&calme=1`) | tous, INT |
| R30 | Indices visuels involontaires d'un faux meuble (ombre cuite absente, ombres de contact du seul RDC) | moyenne / moyen | photos côte à côte (L-K) | voile de prop réglé par type et par niveau | L-K |
| R31 | Soupçon des bots mal réglé (omniscients : triche ressentie ; aveugles : ennui) | forte / moyen | mode simulé (L-O 3-7) | constantes dans `REGLAGES_PROP` ; mêmes tests pour props et vrais meubles ; Facile par défaut | L-O, INT |
| R32 | Collision en disque des meubles longs (baby-foot 1,48 m, distributeur) | moyenne / faible | test L-K 8 | rayon ≤ 0,5, `surPlace`, coins vérifiés au changement et au verrou, sinon « Pas la place » | L-K |
| **R33** | **Un jeu de tir dans une vraie école, reconnaissable, publié (TikTok, réseau de l'école) : il peut être très mal reçu** | faible tant que le jeu reste sur son PC / **très fort** s'il sort | — | **pas de sang, aucun corps qui reste, armes aux noms inventés ; habillage AIRSOFT PAR DÉFAUT** (impacts de peinture, « TOUCHÉ », tir « gaz », poupée courte puis effacement : L-G, L-H, L-C), « Militaire » à un clic en tête des réglages du combat ; README et rapport final : **l'habillage Airsoft pour toute vidéo publiée**, et l'accord des amis dont l'avatar paraît | L-G, L-H, L-C, L-U, INT |
| R34 | Marques : un nom, un logo, un son d'une licence existante | faible / moyen | liste noire des textes (L-G 13) ; revue INT | noms inventés, sons synthétisés, aucun texte de marque dans le jeu | L-W, L-H, INT |
| R35 | Réglages enregistrés : nouvelles actions et profils dans `iris.settings.v1` qui cassent les touches de balade choisies par Haythem | moyenne / moyen | `test_socle` point 15 | profils complets et séparés ; `load()` répare chaque profil contre SA liste | S0 |
| R36 | Équilibre des rôles du prop hunt (chasseur seul contre des cacheurs Difficile : impossible) | moyenne / moyen | L-O 3-6 | provocations forcées, scanner, Facile au 1er lancement, dernier prop à 25 s | L-F, L-O |
| R37 | La cadence sur la Radeon 660M : 60 im/s non garantis, un jeu de tir à 35 im/s ne « fait » pas le ressenti | forte / fort | INT point 3 | moyenne en combat, ≤ 7 bots, rue bornée, pose par image, option « Priorité fluidité » ; leviers du § 3.10 dans l'ordre | L-C, L-H, INT |
| R38 | Barrières ajoutées après la construction : une boîte oubliée laisse sortir un bot | moyenne / moyen | L-M 4 ; F2 5 | barrières tirées des 46 passages ; `nav.restreindre` aligné dessus ; 200 trajets par zone | L-M, F2 |
| R39 | Un lot code contre un squelette qui ne ressemble pas au vrai module : la vague 2 casse à la fusion | moyenne / moyen | tests `apresFusion` | données complètes dans les squelettes ; chaque lot écrit ce qu'il attend du vrai ; F2 a 1,5 jour pour les raccords | tous, F2 |
| R40 | L-O s'appuie sur le `CerveauBase` de `vague2` pendant que L-J le change | moyenne / moyen | `test_ia_prop` rejoué par INT après L-J | L-O n'emploie que `viserVers`, `allerA`, `entendre` (sémantique figée) et surcharge le reste | L-O, INT |
| R41 | Session coupée en plein lot (fin de contexte d'un agent) | forte / moyen | rapport « où j'en suis » | commits fréquents, rapport tenu au fil de l'eau DANS LA BRANCHE (`docs/jeu/rapports/<clé>.md`, commité), documents de référence copiés dans `docs/jeu/` (le dossier temporaire de session est volatil), arbre gardé : un repreneur repart de la branche et du rapport ; un jeton du navigateur périmé (> 45 min) se reprend | tous |
| R42 | L'agent pilote le mauvais navigateur (deux extensions reliées au compte : l'une sur un autre PC) | moyenne / moyen | l'adresse `127.0.0.1:<port>` qui ne répond pas | le navigateur INTÉGRÉ seulement (§ 5.1, règle 3) | tous |
| R43 | Un agent travaille dans l'arbre de Haythem (master) ou touche l'arbre du lot R | faible / fort | `git status` de `C:/Users/hgami/Downloads/IRIS` ; `verifier_proprietaires` | arbres sous `IRIS_lots/` seulement ; jamais `push`, jamais `worktree prune` ; master avancé par INT seul, `--ff-only` | tous, INT |
| R44 | Taille du chantier (≈ 17 800 lignes) : on se perd dans les bots sans savoir si tirer est agréable | forte / moyen | F2 points 2-3 (le stand) | jouable à la fin de F2 ; le stand de tir et son mannequin comme banc du ressenti AVANT l'IA | F2, INT |
| R45 | « Vrai gameplay » pas ressenti : c'est un réglage, pas du code | moyenne / fort | parties d'INT ; retour de Haythem | toutes les valeurs dans des tables nommées ; INT règle au stand ; la v3.0 ouvre une boucle de réglages avec Haythem | INT |
| R46 | Stockage indisponible (navigation privée, quota) : IndexedDB, records, profil, portraits | faible / faible | tests « stockage qui lève » (L-D 11, L-E 11, L-U 13, L-P 7) | `try/catch` partout, le jeu tourne sans | L-D, L-E, L-U, L-P |
| R47 | Quitter une partie laisse l'école en état de partie (portes figées, vantaux solides, glace peinte, ascenseur coupé, bornes, profil de touches) | moyenne / fort | `instantane()` avant / après (S0 8, L-M 2, F2 7) | `MondePartie.sortir` rend l'état EXACT ; `quitterPartie` remet profil, corps, départ | S0, L-M |
| R48 | Navigateur saturé : 14 lots ouvrent chacun une école (≈ 16 contextes WebGL au plus, mémoire partagée de la 660M, `hoops-gpu-perdu`), onglets d'arrière-plan sans rAF : tests bloqués 120 s | certaine sans parade / fort | `verifierRaf()` ; délais dépassés | 3 jetons de navigateur (§ 5.1 règle 3) ; harnais qui fait ses images à la main onglet caché (§ 4.10) ; temps « non valables » jamais bloquants hors `&calme=1` | S0, tous |
| R49 | Le rejeu de la balade n'est pas reproductible (hasard des couches, `performance.now` du cap assisté, état non remis) : `socle-ok` n'arrive jamais, ou un lot est accusé à tort | certaine sans parade / très fort | auto-contrôle de l'étape 0 (deux enregistrements) ; S0 point 1 | hasard semé, horloge simulée, remise à zéro, une seule tâche synchrone (§ 4.10.1) ; seuils relâchés à 1e-6 / 1e-3 et notés si l'auto-contrôle diverge | S0 |
| R50 | Le lot R ajoute ou déplace des portes et des meubles au −1 : tables figées fausses, point B dans un meuble | forte / moyen | L-M 1 (0 porte inconnue sans règle) ; L-E 16 ; F2 | `regleParDefaut` ; anneaux ramenés par `ramenerPoint` ; rien de codé en dur au −1 | L-M, L-E, F2 |
| R51 | Sons invérifiables sous `?test=1` (contexte audio suspendu sans geste) | certaine sans parade / moyen | S0 point 21 | `OfflineAudioContext` par la prise `creerContexte`, `journalAudio`, voix libérées sur l'horloge de `SonsJeu` ; test à l'aveugle et parties à la main sans `?test=1` (F2 13, INT 9) | S0, L-H |
| R52 | Équipes illisibles (8 clones de Haythem par défaut) ; flash invisible en Basse | forte / moyen | photos L-C 13 et F2 12 ; L-G 14-15 | chevrons permanents, tenue à 60 %, brassards larges ; calque `#voile-flash` en DOM | L-C, L-G |
| R53 | Le prop hunt « bête » : cachettes crédibles hors d'atteinte, types non étiquetés qui trahissent, prop repéré toujours rattrapé, chasseur devant un écran noir | forte / fort (ennui) | L-K 7, 10, 13 et à F2 ; L-O 3, 9 ; L-F 16 | graphe des props au rayon 0,2 et cachettes atteignables ; `nonEtiquetes` et déguisable par zone ; sprint des chasseurs à endurance ; panneau de cachette (rôles, mini-carte, astuces) | L-K, L-D, L-F, L-G, L-O |
| R54 | Un bot « laser » ou un cerveau minimal immobile rend F2 injouable ; l'ordre des tirs favorise l'acteur 0 | forte sans parade / moyen | S0 19 et 25 ; L-E (duels à F2) ; F2 6 | cerveau minimal Errant + erreur σ∞ + deux délais ; tirs du pas rassemblés puis appliqués (§ 4.3.2) | S0, L-E, L-J |
| R55 | Deux arbitrages pris contre la critique ou à côté (§ 8.2) se révèlent faux à l'usage (habillage par défaut, saisie de la roue dans `PartieProp`) | faible / faible | retour de Haythem ; rapports | tout est dans des tables nommées et des réglages ; INT peut basculer le défaut `jeu.habillage` d'une ligne | INT |

---------------------------------------------------------------------------------------------------------------------

## 8. RÉPONSES À LA CRITIQUE (`critique.md`, 47 points)

Tous les constats ont été revérifiés dans le code de `a8b22dd` (`couches.js:50-56` et `248-256`, `game.js:298-306`,
`380-386`, `1015-1030`, `fx.js:2012-2020`, `ecole_portes.js:294-298`, `540-548`, `600-608`, `ecole_mobilier.js:184-188`,
`audio.js:18-28`, `ui.js:280-290` et `315-360`, `collisions.js:20-28`, `59`, `153-156`, `ecole_hall.js:831`, `1023-1029`,
`1577`, `player.js:765-790`, `serve.py:32-41`, `sw.js:13-40`) : **tous sont justes**. Aucun n'est écarté en entier ; neuf
sont appliqués AUTREMENT que la critique le propose, ou en partie, pour la raison dite en une ligne (tableau 8.2).

### 8.1 Où chaque point est appliqué

| # | Point | Verdict | Où dans ce document |
|---|---|---|---|
| 1 | Balade non reproductible (hasard des couches, `performance.now`, état non remis) | appliqué, + horloge simulée et rejeu en UNE tâche synchrone | § 4.10.1 (a)-(c) et auto-contrôle ; § 5.4 étape 0 ; S0 point 1 ; § 6.1 |
| 2 | Test de convention faux pour le tangage | appliqué | § 1 arbitrage 2 ; S0 point 6 |
| 3 | 14 pages WebGL dans un navigateur ; rAF bridé en arrière-plan | appliqué autrement (jetons) | § 5.1 règle 3 (jetons par `mkdir`) ; § 4.10 (`images` sans rAF, `verifierRaf`) ; § 4.10.1 (temps « non valables ») ; S0 point 20 ; R48 |
| 4 | Son muet sous `?test=1` | appliqué autrement (prise `creerContexte`) | § 4.4 (`audio.js:18-27`) ; § 4.10 (`journalAudio`) ; § 4.5.17 (horloge de `SonsJeu`) ; S0 point 21 ; L-H |
| 5 | Aide de la balade plantée au milieu de l'écran | appliqué | § 4.4 (`enterLobby({ aide })`, `game.js:304`, `main.js:74`) ; § 4.5.15 (`body.combat`) ; S0 point 17 |
| 6 | `appliquerProfil()` purge en plein combat | appliqué (la partie `main.js:56` est sans objet) | § 4.4 (`appliquerProfil({ purger })`) ; § 4.8 ; S0 point 18 |
| 7 | La roue des emotes ne peut pas servir aux provocations | appliqué autrement (saisie / dessin séparés) | arbitrage 39 ; § 4.4 (`_onMove`) ; § 4.5.5 ; § 4.5.14 ; § 4.5.15 ; § 4.5.18 ; § 4.8 (`provoc1-8`) ; S0 point 23 |
| 8 | Flash invisible en Basse, grisante ailleurs | appliqué (test chez L-G) | arbitrage 41 ; § 3.3 ; § 4.5.5 (`majHud`, `aveugle`) ; § 4.5.15 ; L-G ; L-B |
| 9 | La capture casse le tir, la reprise, la manette | appliqué | arbitrage 42 ; § 2.3 ; § 2.9 ; § 4.3.5 ; § 4.4 (`input.js`, `togglePause`) ; S0 point 13 ; L-B ; L-I |
| 10 | Vantaux ouverts traversables en combat | appliqué | § 1 arbitrage 15 ; § 4.5.11 (graphe) ; § 4.5.19 ; § 5.3 ; L-M ; F2 |
| 11 | Le miroir de l'accueil coûte jusqu'à 8 ms | appliqué | § 3.10 ; § 4.5.19 ; § 5.3 (`carte_ecole.js`) ; L-M ; INT |
| 12 | `separer` traverse les murs, bloque les volées étroites | appliqué | § 3.1 ; § 4.3.2 ; § 4.5.7 ; § 4.5.11 (face-à-face) ; L-B ; L-D |
| 13 | Saut borné au décollage seulement | appliqué, + tranche de tête contre les linteaux | § 3.1 ; § 4.4 (`player.js:704`, `hautCorps`) ; L-B |
| 14 | Repli `e2` qui viole sa propre règle | appliqué | arbitrage 44 ; § 2.2 ; § 3.9 ; § 4.4 (`prop.zone: null`) ; L-F ; L-U ; R5 |
| 15 | Cachettes crédibles hors d'atteinte | appliqué | arbitrage 45 ; § 3.9 ; § 4.5.11 (graphe des props) ; § 4.5.13 ; L-K ; L-D ; L-O |
| 16 | Registre incomplet, voile doublé | appliqué autrement (signatures prises à la couture ; extincteurs de L-M) | § 3.9 ; § 4.5.13 ; § 4.5.19 ; § 5.2 ; § 5.3 ; L-K ; L-M |
| 17 | Bots qui voient à travers le verre dépoli | appliqué | § 3.3 ; § 3.7 ; § 4.5.6 ; § 4.5.19 (`TABLE_DEPOLIS`) ; L-A ; L-M ; L-J |
| 18 | Pré-filtre testé dans un seul sens | appliqué | § 3.7 ; § 4.5.6 (`EXCEPTIONS_PREFILTRE`) ; L-A (à F2) ; F2 |
| 19 | « Jouable à la fin de F2 » faux avec le cerveau minimal | appliqué | arbitrage 43 ; § 3.7 ; § 4.5.11 ; § 4.5.14 ; § 5.4 (squelettes) ; S0 point 25 ; § 5.9 |
| 20 | L'ordre des tirs donne tout à Haythem | appliqué | arbitrage 38 ; § 4.3.2 étape 6 ; § 4.5.5 ; S0 point 19 |
| 21 | Alliés et ennemis indistincts | appliqué | arbitrage 46 ; § 2.3 ; § 3.6 ; § 4.5.10 ; § 4.5.15 (`allies`) ; L-C ; L-G |
| 22 | Propriétaires manquants en vague 3 ; `Light(` bloque L-U | appliqué autrement (`vitrine` au contrat) | § 4.2 ; § 4.5.9 ; § 5.2 ; § 5.4 (squelette `aff_progression.js`) ; L-V ; L-P |
| 23 | Portraits : 2e contexte WebGL, avatars au menu | appliqué (images précalculées) | arbitrage 40 ; § 0 décision 9 ; § 4.5.16 ; § 4.9 ; L-U ; S0 (avatars copiés) |
| 24 | Le lot R casse les tables figées et le point B | appliqué | § 2.5 ; § 4.5.11 (`ramenerPoint`) ; § 4.5.19 (`regleParDefaut`) ; L-M ; L-E ; R50 |
| 25 | Test d'escalier physiquement impossible | appliqué (descentes lissées, pas exclues) | § 3.1 ; L-B point 8 |
| 26 | Cadence sans report du reste | appliqué autrement (formule unifiée) | § 3.3 ; § 4.5.6 ; L-A point 7 |
| 27 | Signe et unité du recul visuel | appliqué | § 3.2 ; § 3.4 ; § 4.5.7 ; L-A point 11 ; L-B ; F2 |
| 28 | Occlusion trop chère, auditeur en retard | appliqué | § 4.3.1 ; § 4.4 (`game.js:449`) ; § 4.5.17 ; L-H |
| 29 | Aucun ravitaillement avant la vague 3 | appliqué | § 2.3 ; § 3.5 ; § 4.5.6 (`ajouterChargeur`) ; § 4.5.12 ; L-E |
| 30 | `verifierSieges` ne peut pas asseoir au milieu d'un rang | appliqué | § 4.10.1 ; S0 point 2 |
| 31 | Cibles du stand sans corps, stand sans coordonnées | appliqué | § 2.6 ; § 4.5.4 (`CorpsFixe`) ; § 4.5.12 (`STAND`) ; L-E |
| 32 | La carte vivante du menu suit Haythem | appliqué | § 4.3.1 ; § 4.4 (`game.js:478`) ; § 4.5.5 ; S0 point 24 |
| 33 | Deux critères sans tolérance ou contradictoires | appliqué | L-A point 2 ; L-B point 7 |
| 34 | `separer` à rayon fixe trahit le prop | appliqué | § 3.1 ; § 4.5.4 (`rayon`) ; L-B |
| 35 | Annonces par `#hud-feedback` | appliqué | § 4.1 règle 13 ; § 4.5.15 ; § 4.5.18 ; L-G |
| 36 | Environnement de l'arme fragile | appliqué | § 4.5.9 ; L-V |
| 37 | Prop repéré condamné ; cachette en écran noir | appliqué | § 2.7 ; § 2.8 ; § 3.1 ; § 3.9 ; § 4.3.4 ; § 4.5.15 ; L-F ; L-G |
| 38 | Bots qui ne franchissent rien | appliqué (une seule fonction `franchissable`) | § 3.1 ; § 3.7 ; § 4.5.7 ; § 4.5.11 ; L-D ; L-J |
| 39 | Trois ambiguïtés | appliqué | § 3.7 (deux délais) ; § 3.2 et § 4.5.18 (`corriger`) ; § 4.5.13 (`credibilite`, `couverture`) |
| 40 | Méthodes hors contrats | appliqué | §§ 4.5.5, 4.5.6, 4.5.17 ; S0 point 11 |
| 41 | Fuite du bonhomme de secours | appliqué | § 4.4 (`player.js`, `dispose`) ; S0 point 22 |
| 42 | Tests dans le cache ; IPv6 | appliqué | § 4.9 ; § 4.10 ; INT |
| 43 | Spec et rapports dans `%TEMP%` | appliqué | en-tête ; § 4.2 ; § 5.1 règles 6-7 ; § 5.4 étape 5 ; R53 |
| 44 | Touches rémanentes de Windows | appliqué | § 3.1 ; § 4.8 (`sprintTact`) ; INT (README) |
| 45 | Pose vieille de 0,25 s au retour en vue | appliqué | § 4.3.3 ; § 4.5.10 ; L-C |
| 46 | « 75 meubles bas » | appliqué | § 4.5.6 |
| 47 | Habillage par défaut | appliqué, avec une nuance | arbitrage 35 ; § 2.2 ; § 2.3 ; § 3.6 ; § 4.4 (`habillage: 'airsoft'`) ; R33 |

### 8.2 Ce qui n'est pas repris tel quel (une ligne chacun)

- **3** — Le jeton n'est pas un fichier `scratchpad/jeu/navigateur.lock` : un dossier temporaire de session n'est pas
  partagé par les agents ; trois dossiers `jeton_N` créés par `mkdir` (atomique) sous `IRIS_lots/_navigateur/` le sont.
- **4** — On ne remplace pas `audio.ctx` après coup : `init()` crée lui-même `master` et la réverbération ; une prise
  `creerContexte` les garde, et `SonsJeu` libère ses voix sur SA propre horloge (celle de l'`OfflineAudioContext` reste à 0).
- **6** — « `main.js:56` ne touche à la roue que hors partie » est sans objet : la roue des provocations n'est plus
  `game.wheel`.
- **7** — La roue n'est pas lue par `lireExtra` DANS le HUD : les règles n'importent jamais l'affichage (§ 4.1 règle 5) ;
  la saisie est dans `PartieProp`, le dessin dans `HudProp`.
- **8** — Le test du calque blanc va chez L-G, qui possède le calque, et non dans le test 16 de L-B (L-B vérifie
  `hud.aveugle` et `fx.flash`).
- **16** — La détection des non-étiquetés se prépare à la couture (après, les maillages sont fondus dans des blocs) ; les
  extincteurs de `ecole_ascenseur.js` et `carte_ecole.js` sont étiquetés par L-M, leur propriétaire, pas par L-K.
- **22** — `Viewmodel.vitrine` n'est pas posée par F2 : elle entre au contrat du socle et L-V la remplit en vague 2 (un
  contrat vaut mieux qu'un raccord de fusion) ; `aff_progression.js` a un squelette du socle comme `profil.js`.
- **26** — La formule semi-automatique proposée, `prochain = max(prochain + 60/rpm, t)`, n'impose plus l'intervalle
  minimal après une pause (si `prochain + 60/rpm < t`, le tir suivant part au pas suivant) : formule unifiée
  `prochain = max(prochain, t − PAS) + 60/rpm`.
- **47** — Airsoft par défaut, oui ; mais Haythem a demandé « comme Call of Duty » : l'Airsoft garde le ressenti (poupée
  1,5 s, tir « gaz » qui claque) et le choix est en tête des réglages du COMBAT, pas enfoui dans les options.

---------------------------------------------------------------------------------------------------------------------

Fin de la spécification. Elle fait foi (en-tête) ; un lot qui y trouve une erreur l'écrit dans son rapport (§ 5.1, règle 6),
F2 ou l'intégration tranche.
