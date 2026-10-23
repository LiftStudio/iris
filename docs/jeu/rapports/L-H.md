# Rapport L-H — les effets et les sons (vague 2)

Branche `lot/L-H` (depuis `socle` = `socle-ok` e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-H`, port 8142 ; 23/10/2026.

## Où j'en suis

**RELECTURE EN COURS (relecteur sévère, 23/10)** — voir la section « Relecture » en fin de rapport : trois défauts corrigés
(les sons de Haythem jetés dans une oreille, la mort qui laissait le son étouffé jusqu'à la fin de la partie, les vrais
meubles hauts décalqués), deux abonnements morts retirés, les pools posés à l'entrée de la partie ; tests ajoutés ; pas
encore rejoué au navigateur (jetons pris). Un repreneur : rejouer `&rapport=1&lot=L-H` puis `&lot=S0` (PC et `?tel=1`).

Ce qui suit est l'état laissé par le constructeur :

**FINI** (les six points du § 5.1 règle 5). Le lot est construit, joué au navigateur intégré (photos ci-dessous) et vert :
- `&rapport=1&lot=L-H` : **14/14 sur PC** (47 s) et **14/14 sous `?tel=1`** (émulation mobile 375 × 812, 43 s) ; deux temps
  notés « non valables » à chaque passage (critère 13 : l'onglet n'était pas devant — les autres agents prennent le devant
  du panneau —, images faites à la main ; mesurés quand même sous les seuils : Effets.maj 0,068 / 0,059 ms, SonsJeu.maj
  0,189 / 0,188 ms) ;
- `&rapport=1&lot=S0` sur la branche : **29/29 sur PC** (130 s, 0 signalé) et **29/29 sous `?tel=1`** (73 s, 0 signalé) ;
  balade au bit près avant (1) et après les parties (27), vue 3 et vue 1 : 0 / 0 ;
- `python -I tools/verifier_proprietaires.py lot/L-H` → `OK 6 fichiers` (fichiers et pureté) ;
- commits préfixés « L-H : », jeton 3 du navigateur rendu (pris 05:21, rendu 06:21), onglet fermé, serveur arrêté.

Un repreneur n'a rien à finir ; s'il reprend, il part du dernier commit de `lot/L-H` et de ce rapport. Le serveur de la
session (`…/scratchpad/lh/serve_lh.py <racine> <port> <photos>`, hors dépôt) est `serve.py` plus un POST `/__photo/<nom>` :
les photos d'un onglet qui n'est pas devant arrivent en JPEG dans le dossier de session (`window.__jeu.photo`, réduite,
envoyée par `fetch`).

## Ce qui est construit

**`js/audio.js`** (la balade n'y voit rien : ses sons gardent leur nombre de départs, mesuré contre `a8b22dd`) :
- `setListener(pos, camera)` pose position, avant et haut sur l'auditeur du contexte, par `.value`, avec la rotation de la
  caméra de L'IMAGE (`game.js` l'appelle après `updateCamera`) — sur un virage de 90° en une image, 0° d'écart (test 6) ;
- `bruitBlanc` / `bruitRose` : une seconde chacun, faits à `init` ; `_noise` part d'un point au hasard dedans (plus un
  tampon de 2 000 nombres au hasard par son) ;
- `spatial()` (PannerNode 'equalpower', 'inverse', référence 2 m, atténuation 1,2, max 60 m) et `attenuation(d)` (la même
  loi en nombres : le niveau estimé d'une voix), table `SPATIAL` exportée ;
- `buzzer`, `refus`, `whistle` de LA CAGE (`audio.js:178-234`), avec départ différé et sortie facultatifs ;
- la prise `creerContexte` du socle gardée.

**`js/fx.js`** : `get budgetImage()` = `BUDGET_IMAGE` (45 im/s, inchangé en balade et par défaut) ou 1000/60 quand
`fx.fluidite` (posé par les effets tant qu'ils sont branchés, d'après `settings.jeu.fluidite`, relu à chaque image) ;
`_cible`, `_seuilBaisse` et la marche de vsync (`_marcheBaisse` : 26 ms comme avant, 20 ms à 60 im/s, 34 ms de moyenne en
basse) le lisent. La passe superposée du socle tenue sur les trois chemins (test 10 : composer, moyenne légère, sans
composer — une fois chacun). `_decoupes` (les objets cachés à la passe de normales de l'occlusion) relevé TOUT DE SUITE
quand les pools du jeu entrent ou sortent de la scène (`scene.userData.effetsJeu`), et non 2 s plus tard (un quad
transparent dessiné plein dans les normales y laissait un carré sombre).

**`js/jeu/sons_jeu.js` — `SonsJeu`** :
- LES VOIX : la recette dans une entrée → la CHAÎNE de la voix (gain = niveau et occlusion → passe-bas de l'occlusion →
  panoramique) → le bus du jeu (compresseur −14 dB 4:1, puis le passe-bas des explosions, des flashs et de la mort) →
  sortie, et un envoi vers la réverbération de la salle (0,2 à l'intérieur). Les CHAÎNES sont faites une fois (24 à la
  préparation, 30 au plus) et reprises : un nœud coûte 15 à 55 µs (mesuré : gain 16, passe-bas 46, panoramique 53,
  branchement 12 µs) — une chaîne neuve par son, c'était 200 µs par tir. Les sons « à l'oreille » (marqueurs, cœur,
  décompte, coup reçu) ont leur sortie à part, jamais étouffée.
- 24 voix au plus (12 au téléphone) ; au-delà, la plus faible à l'auditeur (gain × loi de distance × occlusion) est volée
  (fondu de 15 ms), ou la nouvelle refusée si c'est elle la plus faible ; libérées sur l'horloge de SonsJeu (`t`) quand
  t ≥ fin = départ + décalage + retard + durée — jamais par `onended` (test 5 : 877 voix libérées à leur fin, 0 en avance,
  0 en retard d'un pas, 142 volées, 0 tampon créé pendant 1 000 tirs).
- L'OCCLUSION par `partie.balistique.vue(auditeur, source)` : 4 voix par image au plus, les neuves d'abord (elles partent
  déjà occultées : `.value`, puis `setTargetAtTime` au journal), puis à tour de rôle celles qui durent (revues toutes les
  0,25 s au plus) ; seulement au-dessus de −30 dB. Bloquée −9 dB / 700 Hz, autre niveau −14 dB / 400 Hz, `bas` (la dalle
  d'une provocation) × 0,35 / 900 Hz, `dalle: 'faite'` (déjà faite par sons_prop.js) rien ; lissé en 0,1 s. 0,013 ms par
  image hors `vue()` (test 7), 0 appel à `C.rayonLibre` hors de `vue()`.
- LE RETARD d/343 (option `retard`, voir les écarts) et le DÉCALAGE : un événement est joué à son moment dans l'image
  (depuis le premier pas de l'image), un FA-24 garde ses 80 ms quelle que soit la cadence des images.
- LES RECETTES (CoD § 7.5) : tir = claquement (passe-haut) / corps / grave / mécanique / queue (écho du couloir à 45 ms
  −12 dB, de la façade dehors à 140 ms −18 dB, traîne du TP-50) ; au-delà de 25 m ni claquement ni mécanique, corps
  passe-bas 1,2 kHz ; hauteur ± 4 % par coup, tirée de `melanger(graine, tireur, seq)` ; Haythem : le coup sourd contre
  l'épaule. AIRSOFT (le défaut) : la recette « gaz » (claquement deux fois plus court, corps plus haut, sans grave, le gaz
  et la culasse). Pas (+4 dB pour un ennemi, accroupi à 4 m et ×0,3, sprint tactique plus lourd), réception, saut,
  glissade, rechargements (début / balles entrées / fin, cartouche par cartouche au FP-12, pompe et culasse), tir à vide,
  changement d'arme, couteau, impacts par matière (et la peinture), balle qui frôle (passe-bande 4 kHz balayé, 80 ms),
  marqueurs « tic » (triangle 1,8 kHz 30 ms) et « ding » (3,2 kHz 120 ms + harmonique), élimination (son sourd + 2e tic),
  coup reçu (« thwack », et la bille en Airsoft), cœur sous 30 PV (deux sinus 55 Hz, 75 / min), frag (claquement, corps
  rose, 55 Hz, débris ; acouphène 3,6 kHz et passe-bas 600 Hz rouvert en 2 s à moins de 8 m), grenade Airsoft (pop, gaz,
  billes), flash (claquement nu, sonnerie ; reçue : 300 Hz + acouphène), mort de Haythem (le bus étouffé jusqu'à sa
  réapparition), décompte (bips), GO et fin (le buzzer de LA CAGE), mi-temps (le sifflet), captures de la domination
  (arpège majeur / mineur), fin (victoire / défaite), lancer et rebonds des grenades (lus dans l'état, ou l'événement
  `rebond` de L-A), douilles (« tink », appelé par les effets).
- LA BANQUE DE SONS : les sons fréquents (50 tirs : 5 armes × militaire / gaz × Haythem, Haythem dehors, près, près dehors,
  loin ; 9 pas ; 10 impacts) rendus UNE fois, en tâche de fond, dans un OfflineAudioContext à partir des MÊMES recettes
  (19,6 s de son, ≈ 2,3 s de rendu seul) puis lus par une source à la hauteur voulue (`playbackRate`) — `SonsJeu.maj`
  passait de 0,39 à 0,15 ms par image à 7 bots. Tant qu'elle n'est pas prête, les recettes jouent en direct.
- les ajouts de L-A au § 4.6, pris s'ils viennent : `couteau`, `rebond`, `arme` (le genre d'une grenade).

**`js/jeu/effets.js` — `Effets`** : neuf pools en `InstancedMesh` (PC / téléphone) — impacts 256 / 96 (atlas : trou,
peinture, fêlure, brûlure ; éclairés comme le mur ; effacés par rétrécissement après 25 s), traceurs 32 / 16, douilles 64 /
24 (laiton, cartouches rouges du FP-12 ; deux rebonds sur `solEn`, couchées 3 s), éclairs 16 / 8 (deux flammes croisées
et une étoile, 3 images), étincelles 128 / 48 (additives, étirées le long de leur vitesse), explosion et fumées 96 / 40
(mélangées), grenades en vol 8 / 6, anneaux de la domination 9 (anneau, capture qui grandit, lettre tournée vers la
caméra), cibles du stand 12 (la silhouette en carton, levée en 0,15 s, couchée en 0,12 s avec un rebond, un éclair blanc
à la touche ; pas de carton pour le mannequin de L-E). Créés une fois, compilés à la préparation (`Player.preparerRendu`),
posés dans la scène à la préparation et RETIRÉS à la sortie (la balade retrouve ses enfants : tests 7 et 8 du socle), un
appel chacun (`forceSinglePass` pour les transparents à deux faces : three les dessinait deux fois), aucune lumière.
Les événements sont notés puis traités dans `maj` : un impact y retrouve le tir du même pas sur son rayon (à 12° près ; ou
le `trajet` de L-A, exact) — la couleur de l'équipe du tireur pour la peinture, le bout du traceur. Impacts : décalque
sur les formes hautes et les plafonds seulement, jamais un vantail, un meuble, le sol (test 3 : normale à 0°) ; la forme
et sa normale recalculées au point quand la balistique ne les donne pas (le squelette) ; gerbes (poussière de plâtre,
éclats, étincelles courtes ; au sol de la poussière ; vitre : fêlure et éclats ; Airsoft : gouttes de peinture) ; corps
touché : la poussière de la tenue, ou la peinture (jamais de sang) ; vrai meuble du prop hunt (`faux`) : les éclats là où
la balle l'a pris (le rayon du tir contre la boîte de la pose). L'ÉCLAIR de Haythem en vue FPS (son arme de vue n'a que sa
lumière de bouche) est posé dans la scène au bout du canon DESSINÉ : le repère `bouche` de l'arme montrée, projeté par la
caméra de l'arme, reposé à 0,8 m sur la même ligne de vue ; le traceur part de là (une balle sur trois ; toutes pour les
bots). Explosions : frag (cœur, boule de feu, fumée sombre qui monte, étincelles, débris, poussière, brûlure au sol),
grenade Airsoft (un pop, un nuage de poudre à la couleur de l'équipe du lanceur, les billes, une tache de peinture),
flash (l'étoile blanche, un peu de fumée).

**`js/jeu/tests/test_effets.js`** : les 14 critères du § 5.5.12, plus trois « À F2 » (`apresFusion` : l'occlusion avec
la vraie `vue` de L-A ≤ 0,05 ms, les éclairs à la vraie bouche de L-C, les impacts du vrai DDA avec leur forme).
`compterSonsBalade(game, espion)` (exporté) : le compte des départs de sources de 5 s de course en balade, le même script
que celui collé dans la console de `a8b22dd`.

### Le `__rapport` (PC, `http://127.0.0.1:8142/?test=1&rapport=1&lot=L-H`)

`ok: true`, `total: 14`, `ms: 47026`, qualité medium, `echecs: []`, `signales` : les deux temps du critère 13 (non valables).
Sous `?tel=1` : `ok: true`, `total: 14`, `ms: 42775`, téléphone vrai — 12 voix au plus (critère 5 : 472 libérées à leur fin,
557 volées), pools du téléphone (96 impacts), programmes 87 → 87, banque de 41 sons.

Le tableau (passage PC précédent, 62 s ; le dernier ne diffère que par les temps) :

| # | Mesure |
|---|---|
| 1 | programmes 151 → 151 après 2 s de chauffe · 1 000 tirs émis + 1 237 de la partie, 874 décalques, 1 213 traceurs, 617 douilles, 1 237 éclairs, 987 gerbes, 5 explosions |
| 2 | 256 actifs · les 256 derniers présents, 0 ancien · maj < 0,01 ms · 1 appel (qualité moyenne) |
| 3 | mur (forme 43) : 1 décalque, normale 0° · plafond (177) : 1, 0° · meuble (6) : 0 · vantail (44) : 0 · sol : 0 · 0 vantail décalquable |
| 4 | lumières 8 → 8 → 8 |
| 5 | 1 000 tirs en 10 s · ≤ 24 voix · 877 libérées à leur fin (0 en avance, 0 en retard), 142 volées · 0 `onended` · 0 AudioBuffer |
| 6 | auditeur à 0 m de la caméra, 0° après un virage de 90° en une image · 8/8 panoramiques à ± 1 cm · 8/8 du bon côté (rendus à part) |
| 7 | bloquée 0,355 / 700 Hz · libre 1 / 20 kHz · autre niveau 0,2 / 400 Hz · retard 49,563 ms pour 17 m · 4 occlusions dans l'image de 10 voix neuves · voix à −63 dB jamais testée · 0,013 ms hors `vue()` · 0 `rayonLibre` |
| 8 | claquement à 10 m (6 ms), aucun à 35 m (corps passe-bas 1 200) · hauteur 0,963 … 1,04 sur 30 coups, 30 différentes, au journal (playbackRate) · pas d'un ennemi × 1,585 (+4 dB) |
| 9 | 26 départs de sources en 5 s de course (a8b22dd : 26, 26, 23 — médiane 26) |
| 10 | balade : budget 22,22, passe éteinte · partie, fluidité cochée : 16,67 · décochée : 22,22 · superposition dessinée une fois sur les trois chemins, après l'œil · sortie : 22,22, éteinte |
| 11 | anneaux : 7 instances, 1 appel · cibles : 12, 1 appel · 9 debout, 3 couchées · vides : rien · stand : 6/6 à leur place |
| 12 | Airsoft par défaut : peinture à la couleur de l'équipe B (écart 0), recette gaz (claquement 3 ms, pas de grave) · Militaire : trou, recette pleine (6 ms, 95 Hz) |
| 13 | 79 tirs, banque prête (69 sons) · Effets.maj 0,037 ms · SonsJeu.maj 0,152 ms par image (non valables : onglet pas devant) |
| 14 | balade 0 / 0 · passe éteinte · 0 pool dans la scène |

### Photos regardées (dossier de session `…/scratchpad/lh/photos/`)

`lh_06_trous_militaire.jpg` (rafale d'un mannequin sur le pilier du hall : trous, poussière, étincelles, douilles qui
volent), `lh_07_trous_airsoft.jpg` (la même en Airsoft : peinture orange de l'équipe B, gouttes), `lh_09_bot_tire_b.jpg`
(un mannequin qui tire vers Haythem : l'éclair et sa lueur), `lh_10/11` (Haythem tire : la lueur de bouche au bout du
canon, les douilles à droite), `lh_12/14` (l'anneau A bleu et la capture orange qui grandit, les cartons, la frag).
Corrigé après les photos : trous trop petits et clairs (cœur noir de 2 cm, liseré clair invisible sur le plâtre), étincelles
trop longues (jusqu'à 1 m du mur), éclairs trop petits vus de face, fumée trop claire (un gris de 0,32 sur un mur blanc).

## Écarts au document

1. **Le retard d/343 est une OPTION de `jouer3d`** (`retard: true`), fausse par défaut (§ 4.5.17 : « retard d/343 s » pour
   toute voix). Le test 21 du socle appelle `jouer3d(0, 0, 0, …)` et exige un `start` à la date courante et la voix
   libérée à 0,31 s : avec le retard par défaut (l'auditeur est à 14,5 m), il échouait. Tous les sons de SonsJeu passent
   `retard: true` ; js/jeu/sons_prop.js (L-F) peut le passer aussi.
2. **Options et membres AJOUTÉS** (règle 3) : `jouer3d` lit aussi `retard`, `decalage`, `hauteurOcc`, `oreille`,
   `occlusion`, `dalle` (`'faite'`, celle de L-F), `tampon` / `hauteur` (la banque) ; `bas` est lu comme « la règle de la
   dalle des provocations » (× 0,35, 900 Hz au lieu de −14 dB, 400 Hz). SonsJeu gagne `spatial` (lu par L-F), `jouer2d`,
   `douille`, `etouffer`, `rouvrir`, `pretBanque`, `banque`, `stats` ; Effets gagne `stats`, `impactsActifs`, `airsoft`,
   `pools`. `preparer()` de SonsJeu rend la promesse de la banque (le câblage ne l'attend pas).
3. **La banque de sons** (non écrite au document) : les recettes du § 4.5.17 rendues une fois, puis lues (la performance
   du critère 13). La hauteur ± 4 % passe par `playbackRate`.
4. **Neuf pools au lieu de huit** : les grenades en vol (§ 4.6 : `grenade` → effets ; personne d'autre ne les dessine).
5. **Airsoft** (§ 3.6) : pas de douilles (une réplique à gaz n'en éjecte pas), traceurs aux couleurs des équipes, éclairs
   ternes (le gaz), grenade en nuage de poudre et tache de peinture. Choix du lot : le document ne dit que la peinture et
   la recette « gaz ».
6. **L'éclair de Haythem en vue FPS** est dans la scène de jeu (quads, aucune lumière) et non dans la scène de l'arme : L-V
   n'y pose que sa lumière de bouche.
7. **Le critère 7 (coût de l'occlusion ≤ 0,05 ms)** est mesuré HORS `vue()` : la `vue` du squelette passe par
   `C.rayonLibre` (0,015 ms les 4 avec elle ici) ; le coût tout compris avec le DDA de L-A est le test F1 (`apresFusion`).
8. **Le critère 9** se compte en départs de TOUTES les sources (oscillateurs et tampons, espion du test) : le journal du
   harnais ne voit pas `AudioBufferSourceNode.start` (voir les demandes). La référence de `a8b22dd` (26) a été mesurée le
   23/10 avec le même script, l'archive servie à côté.
9. **Le critère 13** a été mesuré onglet pas devant (images faites à la main, « non valable ») : les autres agents
   reprennent le devant du panneau. INT le refait au calme.
10. **Le critère 1** mesure après 2 s de chauffe (comme les cycles du test 8 du socle) et qualité figée : à la toute
    première partie d'un onglet frais, d'autres modules (corps des bots, ombres, arme de vue) et le précompilateur de repli
    de `fx.js` ajoutaient 2-3 programmes en tâche de fond.
11. **`Partie.evt`** fait `{ t, type, ...données }` : le champ `type` d'une explosion ou d'une grenade (frag / flash, § 4.6)
    ÉCRASE le nom de l'événement (un abonné à 'explosion' reçoit `type: 'frag'`). Les effets et les sons notent chaque
    événement avec le nom de son abonnement ; le genre est lu dans `arme` (L-A l'a renommé), sinon `type`.
12. **L'impact ne dit pas qui a tiré** (§ 4.6) : la couleur de la peinture vient du tir du même pas dont le rayon passe par
    le point (12°), ou du `trajet` de L-A.
13. **`_marcheBaisse`** : 20 ms pour 60 im/s (sans requêtes de temps), valeur du lot ; 26 et 34 ms inchangés.

## Demandes

- **F2 (socle)** : `Partie.evt` — poser `type` APRÈS les données (`{ t, ...données, type }`), ou renommer le champ des
  grenades (`arme`, comme L-A) dans le § 4.6 ; aujourd'hui un abonné à `explosion` reçoit `type: 'frag'`.
- **F2 (harnais)** : `espionAudio` n'enveloppe que `AudioScheduledSourceNode.prototype.start` ; `AudioBufferSourceNode`
  a son propre `start`, qui le masque : aucun départ de tampon (bruits, banque) n'est au journal. Envelopper aussi
  `AudioBufferSourceNode.prototype.start`.
- **F2** : si le retard d/343 doit être le défaut de `jouer3d`, changer le test 21 du socle (il suppose un départ à la date
  courante pour un appel direct).
- **L-A** : un impact sur la VITRE traversée (`mat: 'vitre'` au point de traversée, la balle continuant) — sans lui, pas
  de fêlure ni de bruit de verre quand une balle traverse ; `touches.js` : le panneau d'une cible du stand prend
  `s = sin(cap)` (juste pour cap = ±π/2 seulement ; ailleurs l'axe des boîtes est le symétrique — `s = −sin(cap)`).
- **L-F** : passer `retard: true` aux `jouer3d` de sons_prop.js (le son arrive d/343 après) ; `bas: true` fait la règle de la
  dalle si l'on veut la laisser à SonsJeu.
- **L-V** : si l'arme de vue dessine un jour sa flamme de bouche, retirer la branche `fps` de `Effets._eclair` (sinon deux
  flammes) ; `_boucheVue` lit le repère `userData.reperes.bouche` de l'arme montrée dans la scène de l'arme.
- **L-C** : `acteur.aff.bouche` sert aux éclairs, aux traceurs et aux douilles des bots (repli : devant le buste, côté arme).
- **INT** : « Priorité fluidité » (budget 1000/60 en partie) à décider sur mesures calmes (arbitrage 32).

## Doutes

- L'arme de vue n'apparaissait pas sur les photos (`jeu.photo`) de cette branche — à revoir à F2 avec le vrai viewmodel ;
  l'éclair FPS se pose au repère projeté, il ne dépend pas de ce qui est dessiné.
- La banque se rend en ≈ 2,3 s seule, mais en 15 à 30 s sous ?test=1 quand les tests occupent la page : les premiers sons
  d'une session jouent en direct (rien ne manque, ils coûtent plus).

## Ce qui reste

- rien pour L-H ; à F2 : les trois tests `apresFusion` (F1 occlusion avec la vraie `vue`, F2 éclairs à la vraie bouche,
  F3 impacts du vrai DDA), le test à l'aveugle au stand (✋, sans `?test=1`, vrai son), et les demandes ci-dessus.

## Relecture (relecteur sévère, 23/10/2026)

### Où en est la relecture

Spécification relue (§§ 3.6, 3.10, 4.1, 4.5.17, 4.6, 5.1, 5.5.12), diff `socle...lot/L-H` lu en entier. Corrections
écrites, tests ajoutés ; rejeu au navigateur à faire.

### Défauts trouvés et corrigés

1. **Les sons de Haythem jetés dans une oreille** (`sons_jeu.js`). Le panoramique 'equalpower' ne regarde que la direction
   HORIZONTALE de la source. Le tir de Haythem part de son œil SIMULÉ, à quelques centimètres de la caméra, qui est posée
   sur la position AFFICHÉE et balancée. Ses pas sont joués à ses pieds, juste sous la caméra, et sa recharge à 1 m au-dessus
   d'eux. À 2-4 cm, la direction horizontale est quelconque et le son part presque tout entier dans une oreille. En pas
   chassé, chaque balle de Haythem claquait d'un côté ; ses pas et sa recharge sautaient d'une oreille à l'autre avec le
   balancement. Correction : option `centre` de `jouer3d` (ajout, règle 3). La voix va au milieu, sans panoramique ni
   distance ni occlusion, mais reste dans le bus du jeu (compresseur, étouffement des explosions, envoi vers la salle). Elle
   sert au tir, aux pas, aux bruits du corps (recharge, tir à vide, arme, saut, réception, glissade), au couteau et au lancer
   de grenade de Haythem en vue FPS. Test 6 complété.
2. **La mort laissait le son étouffé jusqu'à la fin de la partie** (`sons_jeu.js`). L'élimination de Haythem posait le
   passe-bas de 450 Hz sans réouverture ; seule une `apparition` le rouvrait. Le prop hunt n'en émet pas : un prop ou un
   chasseur éliminé restait sourd tout le reste de la manche, et des suivantes. Correction : étouffé 3 s (la caméra de
   mort, § 3.6), puis rouvert en 1 s ; une réapparition plus tôt (2 s en chacun pour soi) rouvre tout de suite. Test 15
   ajouté (une vraie mort par `Partie.infliger`, lue au journal).
3. **Les vrais meubles hauts recevaient des décalques** (`effets.js`). La règle « jamais sur un meuble » ne tenait qu'au
   champ `mat` de l'impact. La balistique du squelette dit 'mur' partout. Une forme haute d'un meuble du registre
   (distributeur, armoire étiquetée, plus de 1,8 m) était donc décalquée. Correction : une forme de `MEUBLES.parForme`
   est un meuble, quoi que dise `mat`. Test 3 complété.
4. **Haythem entendait les pas des autres plus loin que la spécification** (`sons_jeu.js`, `REGLAGES_SONS.rayons.pas`).
   Le lot avait posé sprint 22 m, course 15 m, marche 6 m, accroupi 4 m (« l'oreille de Haythem, plus fine que celle des
   bots »). Le § 3.1 dit « pas audibles à 4 m » pour la marche et « pas muets » accroupi ; CoD § 7.5 dit sprint 14, course
   9, marche 4, accroupi muet. Les bots l'entendent à 14 / 9 / 4 / 0 m : l'écart lui donnait l'avantage, contre
   l'équité du § 1 (arbitrage 4). Ramené à 14 / 9 / 4 / 0. Ses propres pas restent joués, accroupi compris, au milieu.
5. **Une recharge annulée jouait le bruit du chargeur mis en place** (`sons_jeu.js`). Tout ce qui n'était ni 'debut' ni
   'insere' jouait la recette de fin. La branche `lot/L-A` émet aussi 'annulee' (le sprint) et 'interrompue' (un tir
   pendant le chargement du FP-12) : on aurait entendu le « clac » ou la pompe d'une recharge qui n'a pas eu lieu. Ces
   phases ne jouent plus rien. Test 16 ajouté.

### Demandes des autres lots à L-H (lues dans leurs rapports, prises ici)

- **L-M** (`'porte'` `{ nom, x, y, z, ouvre, a }`, un ajout au § 4.6) : SonsJeu s'y abonne. Une porte 'auto' qui commence
  à s'ouvrir fait le pêne, le souffle du vantail et la ferrure ; une porte qui finit de se refermer, le battant et le pêne.
  La voix est spatialisée et occultée, à 14 m au plus. C'est l'indice « la porte qui s'ouvre seule » du § 3.9. Test 17.
- **L-V** (`versMonde('bouche' | 'ejection')`, un ajout de L-V) : l'éclair et le départ du traceur de Haythem en vue
  FPS, et sa douille, partent de là quand l'arme de vue sait le dire. Le point est à la distance du repère, pas à
  0,8 m. Sinon, le repère cherché par les effets, puis l'œil décalé. Test `apresFusion` F4.
- **L-A** (écouter 'trajet', 'rebond', 'couteau', l'impact de vitre `traverse: true`, les `mat` 'sol' | 'plafond' |
  'vitre' | 'meuble' | 'mur') : déjà fait par le constructeur. La branche `lot/L-A` émet bien l'impact de vitre
  (`balistique.js` l. 346), la demande du constructeur à L-A est donc tenue. Pour la grenade en vol, un pool existe.
- **L-E** (`hud.cibles` : `k`, `cap` = rotation.y, `touchee`, `mannequin` ; `hud.points`) : tenu. Le cap est relu sur le
  stand : le carton regarde la ligne de tir et tombe en arrière.
- **L-F** : (1) `dalle: 'faite'` et (2) `spatial` sont tenus. (3) SonsJeu ne siffle pas au prop hunt : `_etat` et `fin`
  sortent sur `prophunt`. (4) « Libérer la plus faible plutôt que refuser » : c'est déjà la règle de `_place`. Une voix
  n'est refusée que si elle est elle-même la plus faible. Le refus observé par L-F venait du squelette, dont l'horloge
  des sons n'avançait pas.

### Nettoyé

- `Effets` s'abonnait à `elim` et à `flash` sans rien en faire (deux abonnements morts) : retirés. La touche qui tue a
  déjà sa gerbe, la poupée est à L-C, le voile blanc au HUD.
- `SonsJeu._etouffeJusque` écrit, jamais lu : retiré.
- `Effets.preparer` laissait les pools dans la scène : une préparation interrompue les y oubliait en balade. Ils sont
  maintenant retirés après la compilation ; `brancher` les pose à l'entrée de la partie.
