# Rapport L-E — règles du combat et stand de tir (vague 2)

Branche `lot/L-E` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-E`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8137 ;
23/10/2026. Fichiers : `js/jeu/partie_fps.js`, `js/jeu/partie_stand.js`, `js/jeu/tests/test_combat.js` (spec §§ 2.3-2.6, 3.5,
3.8, 4.5.12, 5.5.7). Rien d'autre n'est touché.

## Où j'en suis

**RELECTURE EN COURS** (relecteur sévère, 23/10, 05:00 — commits « L-E relecture : … », section « Relecture » en fin de
rapport). Fait : spécification relue (§§ 2.3-2.6, 3.5, 3.8, 4.5.12, 4.5.15, 4.6, 4.7, 5.1, 5.5.7), diff `socle...lot/L-E` relu en
entier, vérificateur OK ; corrections commitées et REJOUÉES (jeton 1 pris à 05:56) : `&lot=L-E` **17/17 sur PC** (28,3 s, 0
signalé) et **17/17 sous `?tel=1`** (27,8 s), `&lot=S0` **29/29** (65,0 s, balade 0 / 0 avant et après les parties). Reste :
jouer à la main, finir la section « Relecture ».

Ce qui suit est l'état laissé par le constructeur :

**FINI** (23/10, 04:30). Les six points de la définition de « fini » (§ 5.1, règle 5) sont tenus :
- (a) `&rapport=1&lot=L-E` : **16/16 sur PC** (48,6 s, 0 signalé, qualité haute) et **16/16 sous `?tel=1`** (émulation mobile
  375 × 812, 43,8 s, 0 signalé) ;
- (b) `&rapport=1&lot=S0` sur la branche : **29/29** (136 s, 0 signalé ; balade au bit près avant et après les parties,
  vue 3 et vue 1 : 0 / 0 ; le stand du socle compte 6 cibles) — un premier passage avait échoué au point 8 (« programmes
  144 → 145 ») : la qualité automatique était passée de haute à moyenne pendant la mesure (onglet en arrière-plan, rAF à
  4 images/s, cinq onglets de jeu ouverts par les agents) ; rejoué, vert ;
- (c) `python -I tools/verifier_proprietaires.py lot/L-E` → `OK 4 fichiers` (fichiers et pureté) ;
- (d) commits préfixés « L-E : », lignes d'attribution ; (e) ce rapport ; (f) onglet fermé, serveur 8137 arrêté, jeton 2
  rendu à 04:28.
Un repreneur n'a rien à finir : il part du dernier commit de `lot/L-E`. Les trois tests `apresFusion` sont pour F2.

## Le `__rapport` (PC, `http://127.0.0.1:8137/?test=1&rapport=1&lot=L-E`)

`ok: true`, `total: 16`, `echecs: []`, `signales: []`, `ms: 48615`, qualité high, téléphone false. Sous `?tel=1` : `ok: true`,
16/16, `ms: 43808`, téléphone true (point 10 : « (?tel=1) … parties tél. 2 c. 2 → 4 · 1 + 3 → 4 · bots 5 · score 20 »).

| # | Critère (§ 5.5.7) | Mesure (PC) |
|---|---|---|
| 1 | phases, rien avant le GO | décompte au pas 360 · manche 720 · peutTirer faux, 0 m, 0 tir avant ; après : 2,31 m, des tirs |
| 2 | chacun pour soi, 6 bots au −1 | fin au score (99,3 s, meilleur 20), émise 1 fois · Σ élim. 88 = Σ morts 88 − 0 suicide · trié · gagnant = 1er |
| 3 | équipes : +1, fin au score, tirs à travers un allié | défaut 40 / 20 (tél.) · 13 élim., 0 écart · fin au pas de la 8e (5–8) · 2 000 tirs : allié 0 dégât (tir direct 0), ennemi 2 000 touches |
| 4 | réapparition, protection, régénération | 240 / 360 pas · protégé 0 · 0 · 10 · protection finie au premier tir · 479 pas sans soin, 343 pas de soin (2,86 s) |
| 5 | barème, assistances | 100 · 125 (tête) · 125 (couteau) · 150 (> 30 m) · assistance 50 à 30 dégâts, rien à 29 · suicide −100 et équipe 6 → 5 · capture 150, défense 150, neutralisation 75 |
| 6 | domination | 960 / 640 / 480 pas · disputé figé · 480 puis 1 440 · +20 en 30 s (2 anneaux) · `hud.points` · mi-temps à 75 (camps échangés) · fin à 150 · au temps : mi-temps 10 s, fin 20 s |
| 7 | apparitions (10 min, 1 + 5, toute l'école) | 30 apparitions, 0 vue (7 replis) · 0 mort rapide sur 30 |
| 8 | classes | dotations exactes ×4 · 40,2 / 29,4 / 19,5 / 10,9 % |
| 9 | zones, refus | les 4 zones, chaque acteur à ≤ 6 m d'un départ de son camp · « la domination ne se joue que sur toute l'école (zone « Le −1 » refusée) » |
| 10 | effectifs | PC 4 c. 4, 1 + 5, max 9 · tél. 2 c. 2, 1 + 3, max 5, score 20 |
| 11 | stand | levée 18 pas · chute à la touche, tête × 2 (50 / 100 à 8 m) · 20 cibles en 4,72 s · record écrit · 10 têtes · 30 / 30 balles · réflexes 20 / 20 (28 ms) · stockage qui lève : 0 erreur · mannequin : 10 coups, zones et dégâts (tête 42, torse 33, ventre 30, jambes 27) |
| 12 | déterminisme, état | 188bf2c8 / 188bf2c8 · état vrai en manche, mi-temps, fin (et au stand) |
| 13 | schéma de `partie.hud` | 0 faute dans les 5 parties (équipes, chacun pour soi, domination, deux stands), carte de mort comprise · alliés 4 / 0 / 4 / 0 / 0 |
| 14 | lignes du stand | 6 cibles, 12 lignes libres (`balle()` et toutes les formes) · 10 s sans exception |
| 15 | munitions | 30 · 90 · jamais au-delà de 90 sur 60 éliminations |
| 16 | anneaux | A 1,5 m au point · B 1,0 m au point · C 1,25 m à 1,5 m du point · meuble sur B : B → 2,25 m, libre à 1,0 m |

Les trois tests `apresFusion`, lancés une fois à blanc avec `&fusion=1` contre les squelettes (pour voir qu'ils tournent) :
apparitions réelles « 8 apparitions, 0 vue, 0 repli » ; 100 duels « id 0 : 41 · id 1 : 39 » (20 sans vainqueur en 20 s) ;
10 min 4 c. 4 sur toute l'école : 0 élimination — au squelette les bots ne se trouvent pas sur toute l'école (voir les doutes) :
c'est à F2, avec la navigation de L-D, qu'il doit passer.

## Joué à la main (navigateur intégré, sans `?test=1`, vrai son)

- **Équipes au −1** (`?partie=equipes&zone=ss`) : APPUIE → préparation → présentation (bandeau « MATCH À MORT PAR ÉQUIPES ·
  SISR CONTRE SLAM · 40 ÉLIMINATIONS · 10:00 · LE −1 ») → décompte → GO ; Haythem piloté au script (il vise l'ennemi vu le
  plus proche, sinon court vers lui) : 6 éliminations, une mort (« Gabriel 2 → Haythem »), réapparition 3,0 s plus tard ;
  la partie menée à 40 (SLAM 40 – 36 SISR) : verdict « DÉFAITE » 2,5 s puis l'écran de fin (L-U) « Victoire des SLAM ».
  Fil vérifié : éliminations, assistances, apparitions dans l'ordre.
- **Toute l'école** : la caméra de la présentation part de la rue, 7 m derrière et 2,2 m au-dessus de Haythem, face à la
  porte 6 (photo regardée), et finit dans ses yeux (7,04 → 0,00 m, courbe douce) ; le calque « CLIQUE POUR JOUER » s'est
  bien posé au décompte (la capture du pointeur est refusée au navigateur intégré : la partie est restée gelée ; reprise
  en se déclarant à la manette, sans capture).
- **Domination** : Haythem dans l'anneau A (dessiné à la main pour la photo, en attendant L-H) : 8 s, « A PRISE », +150,
  l'anneau passe au bleu, SISR 1 – 0 trois secondes plus tard.
- **Stand** : « 20 CIBLES EN 30 S » — décompte, cibles qui se lèvent (panneaux posés à la main d'après `hud.cibles`),
  20 touches (10 têtes) en 7,9 s : « RÉUSSI · 20 CIBLES EN 7,9 S · 2 617 PTS · NOUVEAU RECORD ! » ; l'entraînement libre :
  les 6 silhouettes et le mannequin à côté des couloirs (photo regardée depuis la ligne).
- Mesures relatives (cinq onglets de jeu ouverts par les agents) : 27,8 ms par image en moyenne qualité au −1, rAF bridé à
  4 images/s quand l'onglet n'était pas devant ; `Partie.pas` du socle (point 10 de S0) 0,056 ms.

## Ce qui est construit

### `PartieFPS` (`js/jeu/partie_fps.js`)
- **Modes** `equipes`, `melee`, `domination` ; tables en tête : `REGLES_FPS` (durées, limites PC / téléphone, effectifs,
  réapparitions, régénération, barème, classes des bots, Mixte) et `DOMINATION` (anneaux, vitesses de capture, points).
- **Refus** (`PartieFPS.refus(opts)`, statique, lisible par le menu) : zone inconnue, zone du prop hunt, domination hors de
  toute l'école, difficulté inconnue → le constructeur lève une `Error` avec la raison (« la domination ne se joue que sur
  toute l'école (zone « Le −1 » refusée) »).
- **Effectifs** (`effectifs(mode, opts, tel)`, exporté) : alliés 0-4, ennemis 1-5, 9 bots au plus sur PC (5 au téléphone),
  avertissement au-delà de 7 (3) ; défauts 4 c. 4 / 1 + 5 (PC), 2 c. 2 / 1 + 3 (téléphone) ; `opts.appareil: 'tel'|'pc'`
  force un appareil (tests sur PC).
- **Phases** : présentation 3 s → décompte 3 s → manche → mi-temps 5 s (domination) → verdict 2,5 s (`fin_manche` :
  « VICTOIRE », « DÉFAITE », « ÉGALITÉ », « PODIUM · 2E »…) → `fin` (l'événement porte `gagnant`, `scores` et le BILAN :
  classement, podium, verdict, la ligne de Haythem — rang, précision, têtes, plus longue série). Tout le monde est figé
  (`gele` + `arsenal.bloque`) hors de la manche : on regarde, on ne bouge pas, on ne tire pas.
- **Présentation** : la caméra file de 7 m derrière / 2,2 m au-dessus de Haythem (gardée hors des murs par `rayonLibre`)
  jusque dans ses yeux en 3 s (courbe douce), regard tenu au cap du départ : la vue FPS du décompte enchaîne sans saut ;
  l'arme de vue est cachée pendant ce vol. Le bandeau : « MATCH À MORT PAR ÉQUIPES · SISR CONTRE SLAM · 40 ÉLIMINATIONS ·
  10:00 · TOUTE L'ÉCOLE ».
- **Bots** : classe tirée par la graine (`tirerClasseBot(graine, id)`, exporté : 40/30/20/10 %), difficulté (Mixte : alliés
  Réguliers, ennemis tirés entre Recrue et Aguerri), fiche : l'ami coché, sinon Haythem cloné — mais nommé d'après les amis
  (Gabriel, Imad, Marc-Antoine, Koji, Djafar, Ethan, puis « Gabriel 2 »…), pour un fil d'éliminations lisible.
- **Régénération** 4,0 s après le dernier dégât, 35 PV/s ; **protection** 1,2 s (Acteur.reapparaitre) finie au premier
  tir (abonné à `tir`) ; **réapparition** 3,0 s (2,0 en chacun pour soi), Espace / A (`cmd.saut`) passe la caméra de mort
  au plus tôt 1 s après la mort.
- **Où réapparaître** : `choisirApparition` (L-D) si son point est SÛR (vu d'aucun ennemi, tête et buste, et aucun ennemi à
  < 6 m) ; sinon un REPLI (compté : `partie.replis`) parmi les lieux de la zone (points de carte_monde § 8, départs, voisins à
  1,5 m) notés selon le § 3.8 (équipes : alliés à ≤ 15 m − 3 × (ennemis à ≤ 20 m + morts récentes à ≤ 8 m) ; chacun pour
  soi : le plus loin du plus proche ennemi) ; rien de sûr : on réessaie toutes les 0,25 s, 1 s au plus.
- **Barème** (§ 3.8) : élimination 100, tête +25, couteau +25, au-delà de 30 m +50, assistance 50 (les assistances elles-mêmes
  viennent de `Partie.infliger`), capture 150, neutralisation 75, défense 50 ; suicide : −100 au score, −1 au score de
  l'équipe (équipes), −1 au compte du chacun pour soi (`net = elims − suicides`), `stats.elims` intouché (Σ élim. = Σ morts −
  suicides). Un chargeur rendu au tireur à chaque élimination (`ajouterChargeur`). Événements `score` (raison `elim`,
  `assistance`, `suicide`, `capture`, `neutralisation`, `point`).
- **Domination** : anneaux posés à la préparation (`ramenerPoint` puis un disque libre cherché autour, voir les écarts),
  capture d'un point neutre en 8 s (×1,5 à deux, ×2 à trois), point adverse neutralisé en 4 s puis pris en 8 de plus (12 s),
  disputé = figé, prise abandonnée qui retombe à mi-vitesse, tenants qui défendent ; 1 point d'équipe toutes les 3 s par
  anneau tenu ; mi-temps à 75 ou 5:00 (anneaux neutres, camps échangés : chacun repart du départ d'en face), fin à 150 ou
  10:00 ; annonces « A PRISE », « B PERDUE », « C NEUTRALISÉE » ; événements `capture` (`prise`, `neutralise`, `neutre`).
- **HUD** : `chrono`, `scores`, `classement` (+ `av`, `tetes`, `suicides`, `net`, `serie`, `serieMax`, `ratio`, `precision`,
  captures…), `mort` (+ `tueurId`, `armeId`, `passerT`, `suicide`), `points`, `allies` (base), et `mode` (ajout).
- **État** : le bloc `fps` (temps de jeu, gagnant, mi-temps, côtés, séries, dernier dégât et assistances en cours de chaque
  acteur, morts récentes, attentes) ; `appliquer` le rend exactement (`verifierEtat` vrai en manche, mi-temps, fin).

### `PartieStand` (`js/jeu/partie_stand.js`)
- Table **`STAND`** mesurée (voir plus bas) : ligne, 3 couloirs, 6 cibles — deux par distance, deux par couloir : 8 et 15 m
  sur le trottoir, 15 et 25 m au milieu, 8 et 25 m dans le couloir en biais (`cap`, `distance`, `couloir`) —, mannequin,
  bornes de Haythem (la rue, côté chaussée : ni la façade ni ses portes).
- Cibles : acteurs `role: 'cible'`, `CorpsFixe`, vie « infinie » : `Partie.infliger` émet la touche (« tic », « ding »), la
  CHUTE est ici — jamais d'élimination ni de « +100 ». Levée en 0,15 s (touchable une fois debout), chute en 0,2 s.
- **Défis** (`DEFIS`) : « 20 CIBLES EN 30 S » (deux à la fois, couloirs différents), « 10 TÊTES » (60 s ; une balle au corps
  fait tomber la cible, ratée), « 30 BALLES À 15 M » (une cible qui ne tombe pas : touches, GROUPEMENT et DÉRIVE en cm sur
  le panneau), « RÉFLEXES » (20 cibles une à une, debout 0,8 s, temps de réaction) ; sans défi : ENTRAÎNEMENT LIBRE (chaque
  couloir lève sa cible, la suivante du couloir 1 s après la touche, sans fin). Points : 50 / 75 / 100 selon la distance, × 2 à la
  tête (+ bonus de temps, de réaction). « 3, 2, 1 » avant chaque défi (le calque « CLIQUE POUR JOUER » au clavier-souris),
  verdict 2,5 s (« RÉUSSI · 20 CIBLES EN 7,9 S · 2 617 PTS · NOUVEAU RECORD ! »), puis `fin` (`resultat`).
- **Mannequin** : un vrai corps (Haythem cloné), figé, que les contacts ne poussent pas ; chaque balle → `hud.cibles`
  (entrée `mannequin: true` : `n`, `dernier`, `coups` — zone, dégâts, distance — les 12 derniers).
- **Records** `iris.stand.v1` (`lireRecords`, `enregistrerRecord`, `meilleur`, exportés) : lus et écrits par `image()`
  (affichage), jamais par la simulation ; un stockage qui lève ne fait aucune erreur. La réserve de l'arme principale est
  tenue pleine (recharger reste à faire).

## La passe de mesure du stand (23/10, 03:00, jeton 1)

Formes du monde solide dans la rue (x −4…27, z −1,5…7,5, sous 2,4 m), relevées dans la page :
- la façade : z 0 → 0,4 de x −0,3 à 20,1 ; un immeuble à l'ouest (x ≤ −0,3, z ≤ 1,65) et à l'est (x ≥ 20,1, z ≤ 1,65) ;
- le trottoir à y = 0 jusqu'à z = 3,1, la chaussée à y = −0,12 de z 3,1 à 9,35 ;
- le mobilier contre la façade (jardinières, bancs, potelets : `camera: false`) jusqu'à z ≈ 2,2 (2,5 en x 18,9-20,2) ;
- **les vélos garés en bloc** (forme 297) : x 15,95-19,4, z 4,08-5,93, jusqu'à 0,98 m ; trois arceaux (294-296) z 4,2-4,55 ;
- **une voiture garée** (forme 322) : x 22,69-26,11, z 3,28-4,96, jusqu'à 1,21 m ; d'autres voitures à z ≥ 7,28 (x ≥ 20,5).
Conséquence : à x ≈ −1 (§ 2.6), une cible à 25 m tomberait dans la voiture, et un couloir au-delà de z ≈ 4 passe dans les
vélos. Table retenue : ligne de tir à **x = −2,7**, couloirs **z 2,85** (trottoir), **3,75** (chaussée) et un 3e **en biais
de z 5,8 à 6,6** (entre les vélos et les voitures d'en face) ; cibles à x 5,3 / 12,3 / 22,3 (8, 15, 25 m) — neuf places
mesurées, six silhouettes posées (le test 24 du socle en compte 6 : deux par distance, deux par couloir) ; **mannequin à
(7,3 ; 7,2)**, 10 m, à côté des couloirs (au milieu, en (7,3 ; 4,9), il cachait la cible à 25 m du 3e couloir depuis la
ligne : le test des réflexes l'a montré, 14/20). Chaque segment œil debout → centre, tête, bords (± 0,22), bas, haut de chaque
cible, et vers la tête, le buste et les jambes du mannequin, est libre de TOUTES les formes (`camera: false` comprises) au
rayon 3 cm ; regardé à l'écran depuis la ligne (boîtes posées à la main puis retirées : couloirs dégagés, rien devant).

## Écarts au document (et pourquoi)

1. **§ 2.6, l. 227 « ligne de tir à x ≈ −1 »** → x = −2,7 (la voiture garée à x ≥ 22,69 ; voir la mesure).
2. **§ 2.5 / § 4.5.11 / § 5.5.7 point 16 « dégagement ≥ 1,5 m »** : introuvable aux pauses sur la carte du socle — la pause du
   −1 n'a nulle part 1,25 m libre à ≤ 3 m (1,0 au point indicatif), la pause du 1er a 1,25 m à 1,35 m du point, le hall a
   1,5 m au point. `DOMINATION.libres = [1.5, 1.25, 1.0, 0.75]` : le plus grand dégagement trouvé, le plus près ; le test 16
   exige le centre libre à son dégagement, ≥ 1,0 m (A à 1,5). Le lot R refait le −1 : à revoir à l'intégration.
3. **§ 5.5.7 point 7** (≤ 2 % de morts dans les 2 s) : joué sur **toute l'école** (le chacun pour soi du § 2.4, 1 + 5). Au −1,
   six bots meurent 52 fois par minute : 6,5 % des morts y suivent l'apparition de moins de 2 s quel que soit le lieu (la
   densité : chaque lieu est à moins de 20 m de tous) — mesuré 300 s, 260 morts, 17 rapides.
4. **Suicide** (§ 3.8 « −1 élimination ») : interprété −100 au score, −1 au score de l'équipe (équipes), −1 au compte du
   chacun pour soi ; `stats.elims` n'est pas décrémenté (sinon Σ élim. ≠ Σ morts − suicides, point 2).
5. **Noms des bots clonés** : le § 2.2 dit « décochés tous = Haythem cloné et teint » ; le corps l'est, le NOM est celui d'un
   ami (Gabriel, Imad…) — sinon le fil dit « Haythem [FA-24] Haythem ».
6. **Ajouts** (règle 3, aucune signature changée) : `PartieFPS.refus`, `effectifs`, `tirerClasseBot`, `REGLES_FPS`,
   `DOMINATION`, `bilan()`, `candidats()`, `replis`, `hud.mode`, champs en plus du classement et de `mort` ; au stand
   `DEFIS`, `REGLES_STAND`, `lireRecords`, `enregistrerRecord`, `meilleur`, `hud.stand`, `STAND.mannequin`, `STAND.bornes`,
   `couloir` des cibles ; l'événement `fin` porte en plus le bilan (`classement`, `podium`, `verdict`, `local`…) ou le
   `resultat` du défi ; l'état porte un bloc `fps` / `stand`.
7. **Surcharges** de méthodes de la base (signatures inchangées) : `preparer` (anneaux), `peutTirer` (rien hors de la
   manche), `camera` (présentation), `image` (arme cachée pendant la présentation ; records du stand), `majHud`, `etat`,
   `appliquer`, `appliquerEffet` (stand).

## Demandes

- **F2 / L-U** (`js/jeu/index.js`, socle) : l'écran de fin reçoit `{ texte }` seulement ; au stand, `gagnant` (Haythem, un
  nombre) donne « Partie finie ». Passer l'événement `fin` entier à `menu.fin` (ou lire `game.partie.bilan()` /
  `game.partie.resultat` et `game.partie.record`) pour montrer le bilan et le résultat du défi.
- **L-U** : griser avant de lancer — `PartieFPS.refus(opts)` dit pourquoi ; `effectifs(mode, opts)` donne les bornes et
  l'avertissement ; les défis et records du stand : `DEFIS`, `lireRecords()`. Une partie refusée lève dans `lancerPartie`
  (le constructeur) : le menu, caché par `preparation(0)`, doit revenir.
- **L-H** : dessiner `hud.cibles` (`k` = levée 0..1, `cap` = rotation.y, `touchee`, `tete`, `mannequin`) et `hud.points`
  (`possesseur`, `capture.equipe` / `k`, `r`).
- **L-D** : `ramenerPoint(nav, …, { degageMin: 1,5 })` ne trouvera rien aux pauses (écart 2) : rendre `null`, L-E dégage
  lui-même ; `choisirApparition` : L-E ne garde son point que s'il est sûr (vu de personne, aucun ennemi à < 6 m).
- **F2** : rejouer les trois tests `apresFusion` (apparitions réelles, 10 min 4 c. 4 sur toute l'école, 100 duels).

## Doutes

- La qualité automatique de `fx.js` passe ses messages par `partie.annonce` (S0, écart 3) : « Trop lent : qualité →
  MOYENNE » écrase le bandeau de présentation et entre dans l'anneau des événements (donc dans `etat()`) — hors des tests
  (qualité figée), deux parties de même graine peuvent différer par ces annonces.
- Sur toute l'école, au squelette (navigation à vol d'oiseau), les bots ne se trouvent pas (3 min, 0 élimination) : ils
  restent dans la rue ou dans l'escalier est ; c'est le pilotage (L-D) — au −1, ils se battent (équipes jouées jusqu'à 40).

## Relecture (relecteur sévère, 23/10)

### Contrats relus point par point (diff `socle...lot/L-E`, 4 fichiers, vérificateur `OK 4 fichiers`)

- **§ 4.5.12** : `PartieFPS extends Partie`, opts `{ mode, zone, allies, ennemis, difficulte, duree, scoreCible, classe, avatars,
  graine, humain }` tous lus (+ `campHumain`, `appareil`, `presentation`, `decompte`, ajouts) ; `regles(dt)` seul surchargé du
  pas (l'ordre du § 4.3.2 intact : les règles à l'étape 8, le barème sur `elim` émis par `infliger` à l'étape 6b ou 7) ;
  `PartieStand` opts `{ defi }`, cibles `role: 'cible'` sur `CorpsFixe`, records `iris.stand.v1` sous `try/catch` ; `STAND =
  { ligne: { x, y, z, lacet }, couloirs: [{ x, z }], cibles: [{ x, y, z, cap, distance }] }` (+ `couloir`, `mannequin`, `bornes`) ;
  anneaux par `ramenerPoint` à la préparation ; `ajouterChargeur()` à chaque élimination. Aucune signature du socle changée.
- **§ 4.6** : `phase`, `annonce`, `score { equipe, valeur, id, points, raison }`, `capture { point, equipe, etat }` (`neutre` |
  `prise` | `neutralise`), `apparition { a, x, y, z }`, `fin { gagnant, scores }` — tous en nombres et chaînes.
- **§ 4.5.15** : `chrono`, `scores`, `classement` (champs du contrat + ajouts), `mort { tueur, arme, zone, distance, vieTueur, t }`,
  `reapparitionT`, `annonce`, `points [{ id, x, y, z, r, possesseur, capture: { equipe, k } }]`, `cibles [{ id, x, y, z, cap, k,
  touchee }]`, `allies` (base, vide en chacun pour soi).
- **§ 4.7 / pureté** : ni `Math.random`, ni horloge, ni `Input`, ni caméra dans ce qu'appelle le pas (la caméra de la
  présentation et les records sont dans `camera` / `image`, affichage) ; hasard = `partie.rng` ou `Rng(melanger(graine, id, …))` ;
  l'état des règles dans `etat()` (blocs `fps` / `stand`), rendu par `appliquer`.
- **§ 3** : présentation 3 s, décompte 3 s, mi-temps 5 s ; 40 (tél. 20) / 20 / 150 · 10:00 ; réapparition 3,0 / 2,0 / 3,0 ;
  régénération 4,0 s puis 35 PV/s ; protection 1,2 s (Acteur) finie au 1er tir ; assistance ≥ 30 dégâts en 5 s (Partie) ;
  barème 100 / +25 / +25 / +50 au-delà de 30 m / 50 / 150 / 75 / 50 ; anneaux A (14,88 ; 0 ; −3,12) r 2,5, B (9,38 ; −3,06 ;
  −9,37) r 3, C (12,63 ; 3,5 ; −7,87) r 3, 8 s (×1,5, ×2), 4 s + 8 s, 1 pt / 3 s, mi-temps 75 ou 5:00 ; classes 40/30/20/10 ;
  Mixte ; effectifs 4 c. 4 / 1 + 5 (tél. 2 c. 2 / 1 + 3), 9 bots (5), avertissement > 7 (> 3) ; stand 8 / 15 / 25 m, levée 0,15 s,
  réflexes 0,8 s — tous écrits tels quels dans `REGLES_FPS`, `DOMINATION`, `DEFIS`, `REGLES_STAND`.

### Corrections (fichiers du lot)

1. **Stand, entraînement libre : pas de « CLIQUE POUR JOUER »** — le libre part en `manche` sans décompte, donc sans le
   calque que `Partie.image` pose au passage au décompte : au clavier-souris, le clic du menu a expiré, la souris ne vise pas
   (`game.js` `_onMove` exige la capture en partie) et rien ne le dit. `PartieStand.image` pose le calque à la 1re image
   (clavier-souris sans capture) ; à la manette ou au doigt, rien. Test 17 ajouté.
2. **État : les anneaux partagés avec la partie** — `Partie.etat` (socle) ne copie `points` qu'au 1er niveau : `capture` et
   `presents`, modifiés EN PLACE à chaque pas, restaient les objets vivants dans un instantané. `PartieFPS.etat` les copie en
   profondeur ; contrôle ajouté au test 12.
3. **Affichage dans la simulation** — la poupée libérée et le corps remontré à la réapparition étaient écrits dans
   `_reapparaitre` / `_reprise` (étape 8 du pas) : déplacés dans un abonné à `apparition` (comme `Partie._elimVue`, § 4.1
   règle 5).
4. `replis` posé au constructeur ; schéma du HUD du test 13 complété (`astuce`, § 4.5.15).
5. **Chacun pour soi, départs à vue** — § 2.4 « au point le plus éloigné […] vu de personne » : `_placerMelee` ne regardait
   que la distance. Chacun prend maintenant le lieu le plus loin des placés PARMI ceux qu'aucun placé ne voit (œil → tête ou
   buste ; à défaut le plus loin) ; contrôle ajouté au test 9 (toute l'école : 0 paire à vue ; le −1 noté).
6. **Stand : Haythem tué par sa propre frag, pour de bon** — la grenade inflige ses dégâts par `Partie.infliger` (étape 7,
   sans `appliquerEffet`) et le stand n'a pas de réapparition : une frag aux pieds laissait Haythem mort jusqu'à la sortie,
   la caméra en orbite sur le mannequin. `PartieStand.infliger` : 0 dégât à Haythem (seul au stand). Contrôle au test 14.

