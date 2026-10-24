# Rapport L-P — la progression (vague 3)

Branche `lot/L-P` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-P`, depuis `vague2` = `vague2-ok` `2e688ba`), port 8153 ;
24/10/2026. Spécification : `docs/jeu/spec_finale.md` § 5.7.3 (et §§ 2.1, 3.3, 3.5, 4.1, 4.5, 4.6, 5.1, 5.2 ; CoD §§ 7.7, 11, 12).

## Où j'en suis

**FINI.** `?test=1&rapport=1&lot=L-P` : 11 / 11 ; `&lot=S0` : 29 / 29 sur le code final ; `python -I
tools/verifier_proprietaires.py lot/L-P` : OK ; joué sans `?test=1` (trois défauts trouvés en jouant, corrigés). Reste pour
INT : le test `F · Pas feutrés` (`apresFusion`, avec le cerveau de L-J), les demandes ci-dessous, L-U 7 à rejouer au calme.
Navigateur : `jeton_2` pris PÉRIMÉ à 07:09 (`qui.txt` de G-LUM daté 06:23:51, plus de 45 min), rafraîchi pendant les tests,
RENDU à la fin ; onglet `tab-53` fermé, serveur 8153 (lancé dans l'arbre) arrêté.

Un repreneur : `git -C C:/Users/hgami/Downloads/IRIS_lots/L-P log --oneline vague2..lot/L-P`.

## Ce qui est construit

- **`js/jeu/series.js` (simulation, pur)** : les tables `ACCESSOIRES` (point rouge niv. 10, poignée 12, chargeur étendu 14,
  silencieux 16), `ATOUTS` (Endurance 18, Main sûre 20, Pas feutrés 22, Récupération 24, Fantôme 26), `SERIES` (drone 3, gilet 5,
  sentinelle 7), `MEDAILLES` (16), `RAYONS_PAS` ; `ficheEquipee(base, accessoire, atout)` (une fiche d'arme RECOPIÉE et retouchée,
  même `id`, la fiche de L-A jamais touchée) et `equiperArsenal(arsenal, eq)` ; la classe `Series` d'une partie : compteurs par vie,
  séries à prendre (gardées à la mort, compteur remis à zéro), médailles (événement `medaille` { a, id, xp }), drones (balayage
  2 s pour l'équipe de Haythem → `hud.signalesMiniCarte` ; 3 s → `partie.signaler` pour un drone de bot ; Fantôme jamais vu),
  sentinelles (posées à 1,1 / 0,8 / 0,5 m devant soi si c'est libre et vu, 40 s ou 300 PV, repérage + réaction de Régulier,
  300°/s, rafales 4-7 et 0,45 s, erreur de Rayleigh 2,65° de médiane, ≤ 25 m sur 180° ; ses balles par `balistique.tirer` et
  `resoudreTir` du propriétaire, arme `sentinelle`, ses dégâts différés appliqués dans le pas ; touchée par les balles et les frags
  ennemies) ; `etat()` / `appliquer()`.
- **`js/jeu/armes_au_sol.js` (simulation, pur)** : `ArmesAuSol` — à la mort, l'arme tenue tombe (chargeur, réserve,
  accessoire), 30 s, 10 au plus ; ramassée par F (`interagir`, au front) ou deux appuis sur RECHARGER en 0,35 s, à ≤ 1,4 m au
  même niveau : ÉCHANGE avec l'arme en main (qui tombe à sa place) ; munitions prises en passant sur une arme du même modèle
  (≤ 1 m, jusqu'à la réserve) ; `etat()` / `appliquer()`.
- **`js/jeu/partie_fps.js`** (ajouts) : `equipementH()` (l'équipement de `opts.equipement` remis d'aplomb) et l'Arsenal équipé
  de Haythem ; la dotation gardée par acteur (`_fiches`) et RENDUE à chaque réapparition (une arme ramassée ne survit pas à la
  vie) ; les séries et les armes au sol à l'étape 8 ; surcharges : `deplacer` (Endurance), `evt` (le `tir` d'une arme équipée dit
  son `bruit` et `silencieux`, `ficheArme` rend la fiche du tireur pendant qu'on l'écoute ; chaque `pas` porte `rayon` — § 3.1,
  ÷ 3 Pas feutrés), `infliger` (le gilet avant la vie), `resoudreTir` / `appliquerEffet` (la sentinelle) ; la régénération de
  Récupération ; `majHud` : `hud.series`, `hud.signalesMiniCarte`, `hud.ramassage` ; l'état : `serie` dans chaque acteur, bloc
  `prog` (séries, armes au sol, équipement tenu) ; la sentinelle ne rend pas de chargeur et ne compte pas dans la série.
- **`js/jeu/profil.js`** : `Profil` (toutes les instances partagent le même profil) — XP et 40 niveaux, `DEBLOCAGES`,
  `CLASSES_DEPART` (leur accessoire / atout de CoD § 11 seulement une fois débloqués), 5 classes personnalisées (niv. 6),
  camouflages (30-40, et l'OR d'une arme à 100 têtes), statistiques par arme et par mode, médailles, 3 défis du jour tirés à la
  date, `equipement(classe)` (ce qui n'est pas débloqué est retiré), le bilan d'XP d'une partie, les annonces (niveau, défi, or) ;
  `iris.profil.v1` en try/catch, EN MÉMOIRE sous `?test=1`.
- **`js/jeu/aff_progression.js`** : les modèles des armes au sol (ceux de L-W, 3e personne, ≤ 3 appels, sans ombre), la sentinelle
  (primitives cousues par matériau, tête qui tourne, éclair et traceur additifs), le drone de l'équipe de Haythem (au-dessus de
  lui, sous le plafond), les sons synthétisés (tir de la tourelle, bourdon, pose, casse, gilet, série prête / lancée, médaille,
  niveau, défi, arme ramassée), le camouflage de la classe sur l'arme de vue (un jumeau de la teinte) ; trois racines de scène
  `dynamique` + `horsContact`, créées à la 1re préparation AVANT la compilation de la scène.
- **`js/jeu/hud_jeu.js`** (ajouts) : écusson de médaille (file, 1,8 s, or / argent / bronze, nom Airsoft « PREMIÈRE TOUCHE »),
  lignes « +50 DOUBLÉ », « +150 SÉRIE DE 3 », les trois séries en bas à droite (jauge de la vie, PRÊTE + sa touche, EN COURS + son
  temps ; au doigt on touche l'écusson), « DRONE ENNEMI », « F · RAMASSER PM-9 (32 / 96) », les annonces du profil (NIVEAU 17 et ses
  déblocages, DÉFI RÉUSSI), la silhouette de la sentinelle au fil, le chargeur réel au seuil « bas ».
- **`js/jeu/menu_progression.js`** : ARMURERIE (9 classes, détail, chiffres équipée / nue, l'arme qui tourne par
  `aff.viewmodel.vitrine(id)` décalée à droite par `setViewOffset`, le camouflage le temps de la vitrine, la caméra du menu
  tenue sur son plan, « PRENDRE CETTE CLASSE ») et PROFIL (niveau, défis du jour, totaux, par arme avec l'or, par mode,
  16 médailles, frise des déblocages) ; racines manette `armurerie-jeu`, `profil-jeu`.
- **`js/jeu/menus_jeu.js`** (ajouts) : la barre d'XP et les portes ARMURERIE · PROFIL SOUS LE TITRE (table `ACCUEIL`, `tete`),
  les classes du profil au réglage du combat (verrouillées grisées avec leur niveau ; la perso prise à l'armurerie ; « MES
  CLASSES »), `opts.equipement`, le BILAN D'XP de l'écran de fin (total, lignes, barre qui avance, niveau gagné, déblocages,
  défis, médailles), la précision du bilan sans les balles de la sentinelle.
- **`css/jeu/progression.css`**, **`js/jeu/tests/test_progression.js`** (11 critères + 1 `apresFusion`).

## `__rapport` (`?test=1&rapport=1&lot=L-P`, PC 1280 × 720, qualité moyenne ; 24/10 vers 08:58, sur `69ec57d`)

**`ok: true`, 11 / 11, 42,1 s, 0 signalé.** Ce que disent les tests :

| # | critère du § 5.7.3 | obtenu |
|---|---|---|
| 1 | barème d'XP exact ; niveau 10 à 14 400, 40 à 179 400 | 14 400 / 179 400, coût 800 + 200 (n − 1) à chaque niveau ; 33 événements au barème (élimination, tête, couteau, loin, défense, assistance 25, capture 150, neutralisation 75, point et suicide 0, séries 3/5/7/9 → 150/250/350/450, les 16 médailles, sentinelle 50) ; victoire 400, défaite 200 ; l'écran de fin montre le bilan d'XP |
| 2 | déblocages aux niveaux de la table ; un objet verrouillé n'est pas proposé | 27 déblocages à leur niveau ; l'équipement retire ce qui n'est pas débloqué (Tireur au niveau 1 → Assaut, Endurance à 18, silencieux à 16) ; aux réglages : Infiltration, Défense, Tireur grisés au niveau 1, aucune perso proposée, une perso verrouillée lancée en Assaut ; à l'armurerie (niveau 11) : point rouge ouvert, poignée, silencieux et atouts grisés |
| 3 | accessoires mesurés par l'Arsenal | point rouge : zoom 1,30 en visée ; poignée : 12 balles 5,41° (nue 6,76°), visée 0,283 s (nue 0,267) ; chargeur étendu : 45 / 90, visée 0,30 s, recharge tactique 2,10 s (nue 1,90) ; silencieux : bruit 8 m, paliers 12,75 / 25,5 ; un bot à 15 m derrière entend la FA-24 nue, pas la silencieuse ; un ennemi silencieux n'est pas sur la mini-carte |
| 4 | atouts mesurés | Endurance : tactique 6 s (nue 3), jauge pleine en 2 s (nue 4) ; Main sûre : recharge 1,425 s (× 0,75), changement 0,333 s (nue 0,408) ; Pas feutrés : rayon 3 m en course (9), 4,67 en sprint (14) ; Récupération : la vie remonte à 2,5 s (4) ; Fantôme : ni balayé par un drone ennemi, ni dans la mémoire des bots |
| 5 | séries | drone 25 s, 4 ennemis sur la mini-carte, balayage toutes les 2 s, plus rien à 25,5 s ; gilet : 30 dégâts → vie 100, armure 30 ; sentinelle posée à 1,1 m, 300 PV, 40 s, partie à 40 s ; **26 % de touches à 10 m** (237 / 908 sur trois graines : 24 / 28 / 27 %), 0 tir à 26 m, 0 derrière (120°), 46 sur le côté (80°) ; détruite par 9 touches ennemies ; mort : série à 0, gilet à prendre gardé, armure 0 à la réapparition |
| 6 | les 16 médailles une à une → XP et ligne exactes | 16 / 16 : chacune son événement, l'XP « médailles » du profil égale à la somme des médailles reçues, la ligne « +XP NOM » au HUD (« PREMIÈRE TOUCHE » en Airsoft) |
| 7 | profil relu identique ; stockage qui lève ; jamais `iris.settings.v1` | relu identique (2 095 octets) ; sauvegarde abîmée remise d'aplomb ; stockage qui lève : une partie jouée, +150 XP en mémoire, aucune exception, `enregistrer()` faux ; aucune écriture du navigateur pendant le profil (ni `iris.settings.v1` ni le vrai `iris.profil.v1`) ; défis du jour tirés à la date |
| 8 | armes au sol | PM-9 17 / 64 lâchée à la mort, « ramasser » au HUD, `ramasser` vrai (échange : la FA-24 30 / 90 à sa place), F la reprend, 2 × RECHARGER aussi ; munitions prises en passant (10 → 60) ; dotation rendue à la réapparition ; disparues à 30 s ; 10 gardées sur 13 ; **3 appels** chacune (178 → 181 avec une FA-24 au sol devant la caméra), sans ombre portée |
| 9 | armurerie et profil à la manette ; vitrine ; 0 lumière | portes : les six de L-U + ARMURERIE · PROFIL sous le titre (↑ depuis BALADE) ; A ouvre, la croix parcourt, A choisit, B revient ; vitrine de la PM-9 superposée, vue décalée, rendue en sortant ; lumières de la scène de jeu 8 → 8 ; profil : niveau, défis, armes, médailles, déblocages |
| 10 | ≤ 2 écritures DOM par image ; déterminisme et état, séries actives | 1,24 écriture par image (300 images, 7 bots, drone + sentinelle + médailles) ; même graine → même empreinte (7324f95d) avec 3 drones, 10 armes au sol ; état en pleine série identique (champ `serie` des acteurs, sentinelle, armes au sol) ; `verifierEtat` vrai |
| 11 | pureté ; maillages par `aff_progression.js` seul ; programmes constants | `series.js` n'importe que `armes.js` et `rng.js`, `armes_au_sol.js` que `armes.js` et `series.js` ; programmes 165 → 165 (sentinelle qui tire, drone, 6 armes au sol, camouflage or sur l'arme de vue) ; trois racines de scène `dynamique` + `horsContact`, aucun maillage hors d'elles |
| F | (`apresFusion`) Pas feutrés et la vraie oreille de L-J | à rejouer par INT avec le cerveau de L-J |

`python -I tools/verifier_proprietaires.py lot/L-P` : **OK 11 fichiers** (fichiers et pureté).

## Les autres fichiers de tests, rejoués sur `lot/L-P` (1280 × 720, `&fusion=1`)

| lot | résultat | notes |
|---|---|---|
| S0 | 29 / 29 (117,6 s, sur `900f732`) ; rejoué sur le code final (`4318b86`) : **29 / 29, 115,9 s** | la balade au bit près, les cycles, les entrées |
| L-E | 20 / 20 (109 s) | dont le déterminisme 4 c. 4 (60 s) et les 10 min de 4 c. 4 — avec les séries des bots |
| L-G | 18 / 18 (821 s, onglet souvent passé derrière par les autres agents) | écritures du HUD 1,14 par image (test 01) ; les manches réelles de 2 min |
| L-U | 14 / 15 | 7 « LANCER → présentation » : 1re préparation 9 741 ms (seuil 4 000) — la machine : mesurée à la suite dans le même onglet, 6,2 s ici contre 5,8 s sur l'arbre `apercu` (= `vague2-ok`) ; `AffProgression.preparer` coûte 61 ms. Les six portes (test 1), les quatre classes (4), le Tireur choisi (6) : verts |
| L-I | 17 / 18, puis 18 / 18 | 1 a dépassé son délai l'onglet derrière (minuteries bridées) ; rejoué seul, onglet devant : vert |

## Joué pour de vrai (24/10, 08:24-08:55, SANS `?test=1`, `http://127.0.0.1:8153/`, vrai son, panneau du navigateur intégré)

Le navigateur intégré refuse la capture du pointeur (F2 l'a noté) : elle est SIMULÉE (un getter de `document.pointerLockElement`,
`requestPointerLock` / `exitPointerLock` remplacés, `pointerlockchange` émis) ; tout le reste passe par les vrais chemins : clics de
l'outil sur « APPUIE », ARMURERIE, RETOUR, LANCER, le calque « CLIQUE POUR JOUER » ; les touches 3 et 4 du vrai clavier pour les
séries ; un « joueur automatique » qui tourne la vue (`camYaw`, comme la souris) vers l'ennemi vu et tient le clic gauche
(`input.presser('Souris:0')`, lu par `lireCommande`), et qui marche par le pilote de L-D (`Pilote`, commande forcée `ax/ay`). Le
profil RÉEL de l'origine (`iris.profil.v1` du port 8153, neuf au départ : niveau 1). Ce qui a été vu :

- **Accueil** : « NIV. 1 · 0 / 800 XP · DÉFIS DU JOUR 0 / 3 », ARMURERIE et PROFIL sous la barre. **Armurerie** (clic) : les neuf
  classes, Infiltration « NIVEAU 2 », Défense « NIVEAU 4 », Tireur « NIVEAU 8 », les cinq perso « NIVEAU 6 » ; la FA-24 qui tourne
  en haut ; RETOUR (clic) : l'accueil, la vitrine retirée, la vue de sa caméra rendue. **Réglages** : Assaut seul jouable.
- **1re partie** (équipes, toute l'école, 20 · 5:00) : présentation, calque, GO ; Haythem resté dans la rue n'a croisé personne ;
  DÉFAITE 3 – 20 — profil : +200 XP (partie finie), enregistré (2 044 octets). **Trouvé** : l'écran de fin n'avait PAS de bilan
  d'XP — `courante` et `derniere` étaient propres à chaque instance du profil, et le menu (une autre instance que celle de
  l'affichage, branchée à la partie) n'en avait pas. Corrigé (partagées : 5c68a8e) et vérifié par le test 1.
- **2e partie** (équipes, le −1, 30 · 5:00, Recrue) : 6 éliminations ; médailles PREMIÈRE TOUCHE, DOUBLÉ, TRIPLÉ, FURIE, SÉRIE DE 5 ;
  série 6 : DRONE et GILET à prendre ; touches **3** puis **4** au vrai clavier : « DRONE · 25 s », l'écusson du drone en bleu, la
  mini-carte couverte de points rouges (le balayage), le gilet enfilé ; « F · RAMASSER PM-9 (24 / 96) » sur une arme tombée ;
  VICTOIRE 30 – 22. **Bilan** : « +1 750 XP · NIVEAU SUPÉRIEUR 3 · 150 / 1 200 XP · ÉLIMINATIONS × 6 +600 · MÉDAILLES × 5 +350 ·
  SÉRIES × 2 +400 · VICTOIRE +400 · (les cinq médailles) · DÉBLOQUÉ PM-9 « Guêpe », Classe Infiltration ». **Trouvé** : à
  1280 × 720, les boutons de fin (collés au bas, L-U) couvraient le bilan d'XP placé sous les chiffres — il passe sous le podium,
  le podium se serre (5060d36, 69ec57d) ; à la vitrine, `setViewOffset` AGRANDISSAIT l'arme (une image entière plus grande que la
  fenêtre) — l'image entière est maintenant plus petite : l'arme rétrécit et tombe dans la moitié droite (5060d36).
- Console : aucune erreur du jeu (seule celle, connue, du service worker que le navigateur intégré refuse).
- À voir par INT : à 374 × 218 (le panneau ici, plus petit qu'un téléphone couché) l'armurerie ne montre qu'une rangée de classes
  et l'écran de fin se fait défiler ; le nom d'un allié (chevron) peut passer sur les écussons des séries.

## Décisions (le § 5.7.3 laisse le choix)

- **Le chargeur rendu à l'élimination (§ 3.5) : GARDÉ.** Les armes au sol ne durent que 30 s, là où l'on a tué ; une
  élimination à 25 m ne passe pas sur le corps : sans le chargeur, une bonne vie au FA-24 retomberait à sec. Les deux se
  cumulent (et l'on prend en plus les munitions d'une arme du même modèle en passant dessus). La sentinelle, elle, ne rend
  pas de chargeur.
- **Le barème d'XP** (CoD § 11) : élimination = les points du barème de L-E (100, + 25 tête, + 25 couteau, + 50 au-delà de
  30 m, + 50 défense) ; assistance 25 (son score reste 50) ; capture 150 ; neutralisation 75 ; série 50 × n à n = 3, 5, 7, 9…
  (« 3, 5, 7… ») ; victoire 400, partie finie 200 ; médailles de 25 à 100 (ci-dessous) ; sentinelle ennemie détruite 50 (et
  50 points de score). Le PROP HUNT rapporte ses points positifs (provocations, survie, manches, props trouvés 100, aides) et la
  fin (400 au premier du classement, sinon 200) ; le STAND 100 par défi joué, + 150 s'il est réussi ; l'essai rien.
- **Les 16 médailles** : premier sang 50 (« PREMIÈRE TOUCHE » en Airsoft) · tir à la tête 25 · doublé 50 · triplé 75 · furie
  100 (enchaînement à moins de 4 s) · vengeance 50 · sauvetage 50 (l'ennemi a touché un allié vivant dans les 3 s) · longue
  distance 50 (> 30 m) · à bout portant 25 (< 2 m, sans le couteau) · au couteau 50 · série de 5 75 · série de 10 100 ·
  capture 25 · neutralisation 25 · défense 50 (EN PLUS de l'XP de l'action) · **trouble-fête 50** (la 16e : CoD § 7.7 en nomme
  quinze — casser une série de 3 ou plus).
- **Le gilet** : son armure prend les coups AVANT la vie (`PartieFPS.infliger` ; la base du socle en prend la moitié à chaque
  coup) ; un coup que le gilet a tout pris est un coup (marqueur, son, régénération retardée) ; il ne survit pas à la mort.
- **La sentinelle** : posée devant soi seulement si la place est libre, au même sol et vue (sinon « PAS LA PLACE », la série
  reste à prendre) ; tire de vraies balles (balistique, `resoudreTir`, dégâts différés) au nom de son propriétaire ; son erreur
  est réglée sur la mesure — 2,65° de médiane donne 26 % de touches à 10 m (le σ∞ de 1,9° du Régulier en donnerait ≈ 35 % sur
  les capsules d'aujourd'hui) ; les balles et les frags ENNEMIES l'abîment (300 PV) ; elle n'a pas de forme de collision (rien
  n'est ajouté au monde solide en cours de partie : on la traverse).
- **Les classes de départ** gardent leur accessoire et leur atout de CoD § 11 (Assaut : Endurance ; Infiltration : silencieux et
  Pas feutrés ; Défense : Main sûre ; Tireur : Récupération) mais seulement une fois DÉBLOQUÉS : la progression améliore aussi
  les classes qu'on a déjà.
- **Les accessoires** : un, sur l'arme principale ; point rouge sur FA-24, PM-9, FP-12, P-17 (zoom porté À 1,30) ; poignée et
  chargeur étendu sur toutes ; silencieux sur FA-24, PM-9, TP-50, P-17 (pas sur la pompe). Endurance : « recharge × 0,5 » lu
  comme le TEMPS de recharge de la jauge (deux fois plus vite).
- **Les camouflages** (Ardoise 30 · Forêt 32 · Désert 34 · Nuit 36 · Corail 38 · Arctique 40 · Or à 100 têtes avec l'arme) : une
  teinte de l'arme principale de la classe, montrée à l'armurerie et posée en partie sur l'arme de VUE de Haythem (un jumeau du
  matériau : même programme) ; les armes à la 3e personne et au sol gardent la teinte d'origine.
- **ARMURERIE et PROFIL sous le titre**, à côté de la barre d'XP (« vague 3 : ARMURERIE · PROFIL et la barre d'XP sous le
  titre », § 2.1), et non dans la colonne des portes du jeu : l'accueil garde les six portes de L-U (ses tests et ceux de L-I les
  comptent) ; la croix y monte depuis BALADE LIBRE. Aux réglages du combat : les quatre classes de départ (verrouillées grisées,
  avec leur niveau), la classe perso PRISE à l'armurerie, et « MES CLASSES » (l'armurerie, qui y revient).
- **Les défis du jour** : trois par jour parmi douze (éliminations à une arme débloquée, têtes, captures, assistances,
  victoires, une médaille, une série de 5, couteau, grenade, props trouvés, manches survécues en prop, un défi du stand), 300 à
  500 XP, tirés à la date locale.
- **Sous `?test=1`**, le profil vit en mémoire et, vide, vaut le NIVEAU 40 (tout débloqué) : les tests des autres lots, écrits
  avant la progression (L-U 6 choisit le Tireur aux réglages), restent vrais ; ceux de L-P posent leur niveau.

## Écarts au document

1. § 5.7.3 / CoD § 7.7 : seize médailles dont TROUBLE-FÊTE (le § 7.7 en nomme quinze).
2. § 5.7.3 « 7 Sentinelle … qui tire comme un Régulier » : repérage, réaction, rotation et rafales du Régulier, mais une erreur de
   2,65° (et non σ∞ 1,9°) pour tenir les 25 % ± 5 du point 5 ; pas de collision.
3. § 5.7.3 « ramassées par F = interagir » : aussi par deux appuis sur RECHARGER (la manette et le doigt n'ont pas d'`interagir`
   au combat, § 4.8) — demande ci-dessous.
4. § 2.1 : ARMURERIE et PROFIL sous le titre (voir « Décisions »), pas dans la colonne des portes.
5. Accessoires : aucune pièce MODÉLISÉE sur les armes (« quelques pièces de plus sur les os de l'arme », CoD § 11) —
   `js/jeu/modeles_armes.js` n'est pas à ce lot.
6. Le drone : un quadrirotor au-dessus de Haythem quand SON équipe en a un ; un drone ennemi n'est montré que par le HUD
   (« DRONE ENNEMI ») — un drone au-dessus de chaque bot qui en a un dirait où il est.
7. L'Arsenal de L-A ignore ses `modificateurs` et son `ramasser` rend faux : l'équipement passe par des FICHES recopiées
   (`equiperArsenal`, après la construction) et l'échange par les champs de l'arsenal (`armes`, `ch`, `res`, `pr`, `_etat`) —
   demande 1.

## Demandes

1. **INT (`js/jeu/armes.js`)** : `Arsenal.ramasser(fiche, ch, res)` — le corps de `ArmesAuSol.ramasser` (l'échange dans
   l'emplacement en main, l'état 'change' de la sortie, l'événement `arme`) — et le constructeur qui applique ses `modificateurs`
   (`ficheEquipee` de `js/jeu/series.js`) ; L-P s'y branchera sans rien changer d'autre.
2. **INT (`js/settings.js`, `js/touch.js`)** : `interagir` à la manette au combat (la croix ↓, libre au combat) et un bouton
   contextuel au doigt quand une arme est à ramasser (`partie.hud.ramassage`) ; les séries au doigt (aujourd'hui : toucher
   l'écusson du HUD, qui presse la touche de la série).
3. **L-J (`js/jeu/cerveau.js`)** : entendre les pas au rayon `e.rayon` de l'événement (posé par `PartieFPS.evt` : § 3.1, ÷ 3 avec
   Pas feutrés ; test `F · Pas feutrés` en `apresFusion`), les tirs à `e.bruit ?? partie.ficheArme(e.arme).bruit` (le silencieux :
   8 m) ; lire `partie.signalements(équipe)` (le drone des bots, toutes les 3 s ; au chacun pour soi la clé `'acteur:<id>'`) ;
   prendre pour cible les sentinelles ennemies (`partie.series.sentinelles` : x, y, z, vie, a, eq — une balle qui les coupe les
   abîme déjà, `PartieFPS.resoudreTir`).
4. **L-Q** : les tirs de la sentinelle sont des `tir` dont `a` est l'id de la sentinelle (≥ 1000, pas un acteur) et `par` son
   propriétaire ; le camouflage de Haythem est un jumeau du matériau de SON arme de vue (`AffProgression._camo`) — une killcam qui
   montre l'arme de vue du tueur avec la même arme le verrait.
5. **INT (`js/jeu/partie_stand.js`)** : lire `opts.equipement` comme `PartieFPS.equipementH` (`equiperArsenal`) — le stand est le
   banc du ressenti : on y essaierait poignée, point rouge, chargeur. Le menu n'y propose aujourd'hui que les classes de départ.
6. **INT / L-W** : les pièces des accessoires sur les modèles (silencieux au repère `bouche`, point rouge à `visee`), en vue et à
   la 3e personne, compilées à la préparation.
7. **INT (L-U test 7)** : sous charge, la 1re préparation mesurée 6,2 s ici contre 5,8 s sur l'arbre `apercu` (= `vague2-ok`),
   dans le même onglet à la suite : L-P n'y ajoute que ≈ 60 ms (`AffProgression.preparer`) ; le 9 741 ms du rejeu de L-U 7 est la
   machine (trois agents), à rejouer au calme.
