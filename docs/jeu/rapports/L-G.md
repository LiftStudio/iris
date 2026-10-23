# Rapport L-G — le HUD (vague 2)

Branche `lot/L-G` (depuis `socle` = `socle-ok` e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-G`, port 8140 ; 23/10/2026.

## Où j'en suis

**FINI** (les six points du § 5.1 règle 5). Le HUD complet est construit, joué dans le navigateur intégré (essai, équipes,
domination fabriquée, prop hunt prop et chasseur, tableau, mort, flash), PC et `?tel=1` :

- `&rapport=1&lot=L-G` : **16/16 sur PC** (fenêtre du panneau 374 × 218, 9,5 s, 0 signalé) et **16/16 sous `?tel=1`**
  (émulation 812 × 375, doigt, 9,3 s, 0 signalé) ;
- `&rapport=1&lot=S0` sur la branche : **29/29 sur PC** (94,5 s, 0 signalé ; balade au bit près) et **29/29 sous `?tel=1`**
  (émulation mobile 375 × 812, 66,2 s, 0 signalé) ;
- `python -I tools/verifier_proprietaires.py lot/L-G` → `OK 7 fichiers` (fichiers et pureté) ;
- commits préfixés « L-G : », jeton du navigateur rendu, onglet et serveur fermés.

Un repreneur n'a rien à finir ; s'il reprend, il part du dernier commit de `lot/L-G` et de ce rapport.

## Ce qui est construit

**`js/jeu/hud_jeu.js` — `HudJeu`** (§ 4.5.15, CoD § 9.1). DOM créé par JS une fois (à la préparation : `preparer()`), sous
`#hud`, racine `#hud-jeu` marquée `data-jeu` :
- le **réticule** à quatre traits 2 × 9 px, écart `4 px + tan(s) / tan(champV/2) × H/2` (champV de `partie.vue`), couleur du
  réglage `controls.fps.reticule`, **bleu sur un allié / rouge sur un ennemi** visé (rayon du centre de l'écran par
  `rayonActeurs` sur les capsules simulées, à ≤ 60 m, puis `balistique.vue` : jamais à travers un mur ; **un prop ne
  colore jamais le réticule** — il se trahirait), caché en visée (fondu jusqu'à 50 % de l'ADS), la **plaque du nom** visé
  à ≤ 30 m sous le réticule ;
- les **marqueurs** : X blanc 4 traits 2 × 10 px à 6 px, 0,12 s ; tête × 1,35 ; élimination rouge `#ff3b30` × 1,15 0,22 s
  (au prop hunt, un prop touché marque en rouge, § 2.8) ; les **« +100 »** à droite du réticule, empilés, 1,5 s (« +100
  TOUCHÉ » en Airsoft, « +100 ÉLIMINATION » en Militaire, « +25 TIR À LA TÊTE », « +50 ASSISTANCE », les `score` des règles
  avec leur raison) ;
- le **score et le chrono** en haut à gauche (barres SISR / SLAM vers la limite, l'équipe de Haythem d'abord ; chacun pour
  soi : rang et meneur ; prop hunt : « PROPS 3 · CHASSEURS 2 » et la manche ; chrono `.clock` rouge sous 30 s) ;
- la **domination** en haut au centre (A, B, C à la couleur du possesseur, anneau conique de la capture en cours, pouls à
  chaque `capture`), la **barre de capture** quand Haythem est dans un anneau, et les **marqueurs A, B, C dans le monde**
  (lettre et distance, ramenés au bord de l'écran) ;
- le **fil des éliminations** en haut à droite : 5 lignes, 5 s, **silhouettes des 8 armes en SVG** dessinées à la main,
  icône de tête, la forme du prop au prop hunt (« Koji (la poubelle grise) »), la ligne de Haythem surlignée ;
- la **vie** au-dessus de la mini-carte, montrée seulement abîmée (fondu 1,2 s après la guérison), « +PV » des soins ;
- les **munitions** en bas à droite (chargeur, réserve, nom court, frag ◆ / flash ✸, « R RECHARGER » sous 30 % — la touche
  vraie par `actionKey`, « RECHARGEMENT », « PLUS DE MUNITIONS ») ;
- les **arcs rouges** vers qui touche Haythem (30° à 120 px, opacité ∝ dégâts, 1,6 s, tournant avec la caméra) ;
- la **grenade proche** (≤ 7 m, icône au bord d'un cercle, vers elle, et sa distance) ;
- la **vignette** `(1 − vie/60) × 0,85` sous 60 PV, **battement à 1,2 Hz** sous 30 ;
- la **lunette** du TP-50 (masque plein écran, réticule fin, point rouge) à ≥ 85 % de la visée ;
- la **caméra de mort** : carte « TOUCHÉ PAR … — arme · zone · distance · il lui reste N PV » (`hud.mort` des règles, sinon
  tirée des événements `touche` / `elim`), « RÉAPPARITION DANS 2,1 s · ESPACE : passer », « TROUVÉ PAR … » et
  « SPECTATEUR » au prop hunt, et **l'image désaturée 3 s** (calque `backdrop-filter`) ;
- les **annonces** dans `#hud-annonce` (à elles ; file courte, chacune relancée ; « GO ! » en vert) — jamais
  `hud.feedback` ; les messages de la qualité automatique (`game._dire`, cls `warn` / `bad`) vont sur une petite ligne
  d'alerte ; la **présentation** (« MATCH À MORT PAR ÉQUIPES / SISR CONTRE SLAM · 40 ÉLIMINATIONS · 10:00 », « TU ES PROP —
  CACHE-TOI ! »…), le **décompte 3, 2, 1** relancé à chaque chiffre, « VICTOIRE / DÉFAITE / ÉGALITÉ » à la `fin` ;
  l'**astuce** des règles (`hud.astuce`) ;
- les **chevrons bleus des alliés** (`hud.allies`, ≤ 4, à travers les murs, 14 → 8 px de 2 à 40 m, nom dessous à ≤ 15 m,
  aucun derrière la caméra ni en chacun pour soi) ;
- le stand : la dernière balle (zone, dégâts, distance) ;
- **`#voile-flash`** (hors de `#hud`, z-index 14 : au-dessus du HUD 10, sous les boutons tactiles 15, le calque 25 et la pause
  30) : opacité 1 tant que `aveugle.t < durée − 0,6`, puis `(durée − t) / 0,6` ; pur DOM, donc aussi en qualité Basse.

**`js/jeu/hud_prop.js` — `HudProp`, `RoueProvocations`** : en bas au centre une rangée — l'anneau de provocation (le temps
avant la provocation forcée, « 0:12 », rouge sous 5 s), l'icône et le nom de la forme, les changements (●●○ en traque, ∞ en
cachette), 🔒 / ❄, la DISCRÉTION en étoiles `⌈d × 5⌉`, l'ŒIL qui se remplit (« REPÉRÉ ! » au-delà de 70 %) — et les
touches dessous ; le point de visée et l'aide « E : devenir le tabouret vert » ; les étiquettes des alliés (≤ 4) et, à la
révélation, le nom et la forme de chaque prop survivant ; le scanner du chasseur (●●○, recharge, arcs autour du réticule
teintés < 4 / < 8 / < 12 m, 2 s) ; « VRAI MEUBLE −3 » ; les arcs « VOIR LES SONS » au bord de l'écran (2 s, ▲ / ▼ à travers
une dalle ; l'aide `aides.voirSons`) ; la **roue** (8 secteurs autour du centre, 0 en haut, sens horaire, icône, nom, rayon,
points ; le choix en surbrillance dans la même image ; réduite sur un petit écran) ; le **panneau de cachette**
`#voile-cachette` (hors de `#hud`, z-index 12, noir opaque) : « LES PROPS SE CACHENT », chrono, tableau des rôles, mini-carte
de la zone, deux astuces qui tournent toutes les 8 s, la manche. Hors du prop hunt il dort (aucune écriture).

**`js/jeu/tableau_scores.js` — `TableauScores`** : tenu par Tab / Back (ou basculé depuis la pause), non interactif, pas
dans `RACINES` ; combat : deux colonnes d'équipe (une en chacun pour soi), rang, portrait 32 px (`portrait(fiche)` de L-U,
sinon l'initiale sur un dégradé), nom, score, É, M, A, ratio, série en cours (lue dans les `elim`) ; prop hunt : rôle,
points, trouvés, survie, provocations, vrais meubles. Une ligne gardée par acteur : seuls les textes qui changent sont
écrits, l'ordre refait quand le classement change.

**`js/jeu/minicarte.js` — `MiniCarte`** : 200 px (160 au doigt ; réduite sur une petite fenêtre), 24 m de large, tournée
avec Haythem ; fond = la silhouette du niveau rastérisée à la préparation (8 px/m, 0,25 m = 2 px) **depuis les nœuds du
graphe** — et, tant que la navigation est celle du squelette (sans nœuds), depuis les **pièces** de la carte vivante (les
rectangles des 47 zones, chacune à son niveau) moins les **murs hauts** (formes de plus de 1,8 m) ; flèche blanche et cône de
vue au centre, alliés en flèches bleues orientées, ennemis en points rouges **2 s après chaque tir** non silencieux (là où ils
ont tiré), signalés (`hud.signalesMiniCarte`), anneaux A / B / C (au bord s'ils sortent), ▲ / ▼ pour un autre niveau ; sous
la carte « −1 · ESPACE PAUSE ». `dessinerZone(canvas, zone)` : la zone entière sans acteurs (silhouette, pièces, portes,
noms) pour le panneau de cachette. `cacher()` à la sortie de la partie.

**`css/jeu/hud.css`** : tout le style (≈ 330 règles), les règles `body.combat` et `#calque-clic` du socle gardées ; hors
partie (`body:not(.combat)`), rien du HUD du jeu ne se montre. Disposition au doigt (`body.touch`, variables `--tc-*` de
`js/touch.js`) : la vie sous la rangée du haut, la mini-carte dessous, le score en une ligne au centre (SISR · chrono ·
SLAM), la domination dessous, les munitions à gauche de la grappe de tir. Vérifié sans chevauchement à 812 × 375 (doigt)
et à 1280 × 720.

**Les règles du DOM** (critères 1 et 16) : tout ce qui bouge à chaque image (réticule, marqueurs, « +100 », fil, arcs,
chevrons, anneaux, vignette, vie, annonce, flash…) passe par des **variables CSS de la racine, écrites en UNE affectation de
`style.cssText` par image** et seulement si l'une change ; les textes, classes et `hidden` ne sont écrits que si la valeur
affichée change ; aucune lecture de mise en page dans `maj` (la taille de l'écran est gardée au `resize`) ; les animations
suivent **l'horloge du HUD** (la somme des `dt` de `maj` : la pause les gèle, un test les rejoue sans rAF). Mesuré au
critère 1 : **0,8 écriture DOM par image**, **0,37 ms de HUD par image** (les quatre `maj`), mini-carte 25-47 µs.

## Le `__rapport`

PC (`http://127.0.0.1:8140/?test=1&rapport=1&lot=L-G`, fenêtre 374 × 218, qualité haute) : `ok: true`, `total: 16`,
`echecs: []`, `signales: []`, `ms: 9522`. Sous `?tel=1` (émulation 812 × 375) : `ok: true`, 16/16, `ms: 9289`.

| # | Critère (spec l. 2673-2702) | Mesuré (PC ; `?tel=1` si différent) |
|---|---|---|
| 1 | ≤ 2 écritures DOM / image, 0 lecture de mise en page | 0,8 (tel 0,81) sur 300 images de manche à 7 bots, 29 tirs ; 0 lecture ; HUD 0,37 ms / image |
| 2 | réticule | s 0 / 0,01 / 0,025 / 0,05 / 0,1 → 4 / 5,9 / 8,8 / 13,7 / 23,4 px pour 4 / 5,94 / 8,85 / 13,7 / 23,44 ; caché en visée ; ennemi rgb(255, 59, 48), allié rgb(61, 139, 255), plaques |
| 3 | marqueurs, « +100 » | même image ; 1 à 0,06 s, 0 à 0,125 s ; tête × 1,35 ; élim. rouge × 1,44, 0,23 à 0,2 s, 0 à 0,23 s ; 3 empilés (y −42, −21, 0) ; 1,48 s là, 1,53 s parti |
| 4 | fil, arcs, vignette | 5 lignes, 0 après 5 s ; arcs 8/8 à ± 5° ; 30° à 120 px ; 0,03 à 1,55 s, 0 à 1,61 s ; vignette 0 / 0,01 / 0,21 / 0,43 / 0,71 exactes ; battement 0,8333 s |
| 5 | munitions, vie, chrono | bas droite (doigt : à gauche de la grappe) ; « R RECHARGER » à 8/30, rien à 9 ; « PLUS DE MUNITIONS » ; vie pleine 0, abîmée 1 ; chrono rouge à 29 s |
| 6 | mini-carte | 200 / 160 px ; allié à 6 m à droite → (24, 0) px pour (24, 0) [tel (40, 0)] ; ▲ à l'étage ; ennemi 0,1-1,95 s oui, 2,05 s non ; preparer 7 ms (pièces), maj 47 µs [tel 3,3 ms, 25 µs] |
| 7 | tableau | caché / tenu / relâché ; deux colonnes ; 8 lignes ; portrait 24 px sur ce petit écran (32 au PC, règle de largeur) ; prop hunt : ses six colonnes |
| 8 | HUD prop | nom, ●●○, 🔒 / ❄, étoiles 0 1 1 2 3 5 5, REPÉRÉ à 0,71 pas à 0,69, 4 étiquettes sur 6 ; panneau noir z 12 « 0:25 », 5 rôles, astuces, carte de zone {niveaux 1, pièces 9, portes 0, acteurs 0} ; roue 8/8 dans la même image ; `game.wheel` fermée |
| 9 | domination | centrée en haut ; ABC ; A bleu, B orange ; capture 0,4 puis 0,75 ; cachée sans points |
| 10 | lunette | 0,84 non, 0,85 oui (réticule 0) ; pas pour la FA-24 |
| 11 | `body.combat`, HUD de la balade | les cinq cachés en partie ; empreinte 426bda93 = référence ; en balade le HUD du jeu caché |
| 12 | état vide ou troué | 0 exception sur 300 images, essai et prop hunt (15 états troués) |
| 13 | habillage, français | Airsoft « +100 TOUCHÉ », « TOUCHÉ PAR … » ; Militaire « +100 ÉLIMINATION », « ÉLIMINÉ PAR … » ; liste noire vide |
| 14 | `#voile-flash` | 1 ; 1 ; 1 ; 0,5 ; 0 aux deux qualités (fx.enabled faux compris) ; z-index 10 < 14 < 30 |
| 15 | chevrons | 2 sur 3 ; ± 0,03 px ; 14 px à 2 m, 7,98 px à 40 m ; nom 1 / 0 ; chacun pour soi 0 |
| 16 | annonces | 20/20 relancées ; 0 `hud.feedback`, 0 `hoops-feedback`, 0 lecture de mise en page |
| F2 | manches réelles de 2 min (`apresFusion`) | écrit, sauté avant la fusion (`&fusion=1`) |

## Écarts au document

1. **Les animations ne passent ni par deux classes `.a` / `.b` ni par Web Animations** (§ 4.5.15, l. 1467-1468 ; L-G l. 2659)
   : elles suivent l'horloge du HUD par les variables CSS de l'écriture unique de l'image. Même effet (une annonce relancée
   repart de zéro, aucune mise en page forcée, aucun `hud.feedback`), et en plus la pause les gèle et un test les rejoue au
   pas près sans rAF.
2. **`#voile-flash` et `#voile-cachette` ne sont pas sous `#hud`** (l. 2667 : « tout le DOM … sous `#hud` ») : `#hud` est un
   contexte d'empilement de z-index 10 ; « au-dessus du HUD, sous la pause » (z-index comparés) et « z-index 12 » ne se
   tiennent que hors de lui. Ce sont des enfants de `body`, marqués `data-jeu`, créés par JS.
3. **La désaturation de la caméra de mort** (§ 3.6 « désaturation 3 s ») n'a pas de propriétaire au § 5.5 ; L-G la fait
   (calque `backdrop-filter: grayscale` de 3 s, avec la carte) plutôt qu'un filtre CSS sur le canevas de `game.js`.
4. **La mini-carte et le tableau n'ont pas de `debrancher`** (contrat § 4.5.15) : rien ne les cachait à la sortie d'une
   partie (la mini-carte restait en balade). `HudJeu.debrancher` appelle `minicarte.cacher()` et `tableau.cacher()`
   (méthodes AJOUTÉES), et `hud.css` cache tout le HUD du jeu hors de `body.combat`.
5. **Taille de la mini-carte** : 200 px (160 au doigt) comme dit, mais réduite sur une petite fenêtre (≤ 36 % de la hauteur au
   PC, 43 % au doigt, ≤ 30 % de la largeur, ≥ 96 px) — sinon elle couvrait le réticule dans la fenêtre du panneau
   (374 × 218). Le test 6 vérifie 200 à 1280 × 720 et 160 à 812 × 375, et la règle à la taille courante.
6. **Silhouette de la mini-carte** : depuis les nœuds du graphe comme dit ; tant que `nav.nb === 0` (le squelette de L-D),
   un repli depuis les pièces et les murs hauts. Après F2, ce sont les nœuds (vérifier le rendu : point « À F2 »).
7. **Le battement de la vignette** reste quand le navigateur demande « moins de mouvement » (le panneau de Haythem le
   demande) : c'est une information de jeu, sans déplacement ; seuls les clignotements de texte s'arrêtent.
8. **Points de « +100 »** : quand les règles émettent `score` (raison `elim`) pour Haythem, ce sont leurs points qui
   s'affichent, sinon 100 ; le « +25 TIR À LA TÊTE » vient des règles si elles envoient la raison `tete`, sinon du HUD
   (pas de doublon : les règles s'abonnent à `elim` avant le HUD).
9. **Plaques de noms** (l. 2659, « plaques de noms à ≤ 30 m ») : comprises comme le nom de l'acteur visé, sous le réticule
   (allié en bleu, ennemi en rouge), à ≤ 30 m ; les alliés ont en plus leur nom sous le chevron à ≤ 15 m.
10. Le test 7 vérifie le portrait à 32 px au PC, 28 px sur un écran ≤ 900 × 520 et 24 px ≤ 760 de large (le tableau tient
    alors sur un téléphone, ses deux colonnes l'une sous l'autre).

## Demandes

- **L-F** : `hud.prop.vise` = `{ cle, nom } | null` (le meuble que vise le prop, celui de `viserMeuble` de son pas) — l'aide
  « E : devenir … » le lit s'il existe ; à défaut L-G appelle lui-même `viserMeuble` 10 fois par seconde (lecture seule).
- **L-F** : préciser deux champs de `hud.prop` (lus ainsi par L-G) : `provocT` = le temps QUI RESTE avant la provocation
  forcée (l'anneau se vide vers 0), `changements` = les changements DÉJÀ FAITS pendant la traque (il en reste
  `REGLAGES_PROP.changements.traque − changements`), `scanner.t` = le temps qui reste avant la prochaine charge ; et
  l'événement `scanner` : `resultats[].dir` = un lacet MONDE (radians) ou un vecteur `{ x, z }`, `bande` = 0 / 1 / 2 (ou
  4 / 8 / 12 m) — les deux formes sont lues.
- **L-E** : `hud.mort` = `{ tueur (id ou nom), arme, zone, distance, vieTueur, t (temps de partie) }` ; la limite de score
  (`scoreCible`) lue sur la partie (`partie.scoreCible`, sinon 40 / 150) — un champ `hud.limite` serait plus propre (ajout au
  contrat, à F2).
- **F2** : rejouer le test « F2 manches réelles de 2 min » (`&fusion=1`) ; regarder la mini-carte depuis les vrais nœuds ;
  les 10 photos de L-C avec les chevrons (équipe reconnaissable sur toutes) ; vérifier que les `score` de L-E ne doublent pas
  les « + » (écart 8).
- **L-P (vague 3, propriétaire de `hud_jeu.js` ensuite)** : les médailles et séries peuvent passer par `_pousserXp(n, libellé,
  'bonus')` et les annonces par `_pousserAnnonce` ; garder l'écriture unique de l'image (critère 1, L-P point 10).

## Doutes

- Les mesures sont relatives (d'autres agents tournaient ; la fenêtre du panneau fait 374 × 218 px CSS) : 0,37 ms de HUD
  par image à revoir au calme (INT).
- Les captures d'écran du panneau sous émulation 1280 × 720 sortent réduites dans un coin (le panneau rétrécit la page
  émulée) : la disposition aux grandes tailles a été vérifiée par les rectangles des blocs (aucun chevauchement à 1280 × 720
  ni à 812 × 375 au doigt), le rendu regardé à la taille du panneau.
- `hud.astuce` : le contrat ne dit pas sa forme ; lu comme une chaîne (ou `{ texte }`).
- La barre de vie « ne se montre qu'abîmée » : elle reste 1,2 s après la guérison, puis s'efface en 0,5 s.

## Photos regardées (navigateur intégré, fenêtre 374 × 218)

Essai (réticule, munitions, mini-carte « RDC · HALL » ; élimination : X rouge, « +100 TOUCHÉ », fil ; arcs et vignette à
24 PV ; caméra de mort désaturée et sa carte « TOUCHÉ PAR MANNEQUIN 2 — FA-24 · tête · 5 m · il lui reste 100 PV ») ;
équipes au −1 (présentation, décompte « 2 », « GO ! », chevrons et noms des alliés) ; prop hunt prop au 1er (rangée du prop :
anneau 0:13, LE TABOURET VERT, ●●○, 🔒, ★★★★☆ ; la roue, « Sonnerie de l'école » choisie) ; prop hunt chasseur (panneau de
cachette : rôles, carte de la zone e1 et ses 9 pièces, astuces ; en traque : scanner, arcs, voir les sons, « VRAI MEUBLE
−3 », l'astuce) ; tableau des scores (deux colonnes) ; `?tel=1` à 812 × 375 (score en une ligne, A B C dessous, mini-carte
sous les boutons, munitions avant SAUT).
