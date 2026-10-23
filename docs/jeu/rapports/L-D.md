# Rapport L-D — navigation, pilotage, apparitions (vague 2)

Branche `lot/L-D` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-D`, depuis `socle` = `socle-ok`, e06258f), port 8136 ;
23/10/2026. Spécification : `docs/jeu/spec_finale.md` § 5.5.6 (contrats § 4.5.11, valeurs §§ 3.7-3.8, propriétaires § 5.2).

## Où j'en suis — RELECTURE (relecteur sévère, 23/10, commits « L-D relecture : … »)

Relecture en cours sur `9ca7414`. Fait : spec (§§ 3.7-3.8, 4.5.11, 5.1, 5.5.6) et diff `socle...lot/L-D` relus ;
propriétaires OK. À faire, dans l'ordre : corriger (liste dans « Relecture » en bas), rejouer `&lot=L-D` puis `&lot=S0`,
jouer (jeton), mettre ce rapport à jour. Un repreneur : la section « Relecture » en bas dit ce qui est corrigé et ce qui reste.

## Où j'en suis — construction

- [x] `nav.js` : génération (méthode B), deux graphes, CSR, empreinte, cache, A* d'un bloc et en file, champs, couverts
- [x] `nav_cache.js` : IndexedDB `iris.nav` (index des 4 dernières empreintes, délais, `try/catch`)
- [x] `pilotage.js` : `Pilote` (ficelle par balayage, évitement, face-à-face, franchir, coincé → secours), `Errant`
- [x] `apparitions.js` : départs (deux camps tirés ensemble), réapparition (§ 3.8), `ramenerPoint`
- [x] `tests/test_nav.js` : les 16 critères du § 5.5.6 + ressenti des errants (17) + couverts (18) + 4 tests `apresFusion` pour F2
- [x] joué dans le navigateur (jeton 1), `&lot=L-D` vert, `&lot=S0` vert (29/29), propriétaires OK
- [x] onglet fermé, serveur arrêté, jeton rendu (voir « Définition de fini »)

**FINI** au sens du § 5.1 règle 5 (voir « Définition de fini » en bas). Un repreneur : `git log lot/L-D`, ce rapport.

## Ce qui est fait

### `js/jeu/nav.js` — le graphe
- **Génération** (carte_monde § 7, méthode B, recodée en tableaux) : représentant = centre de case poussé par `C.resoudre`,
  gardé s'il reste dans sa case, sur le même sol, `libre` ; un nœud par case ET par sol (clé case + hauteur au demi-mètre) ;
  liens vers les 8 voisines si `C.deplacer` y mène à 3 cm ; descente > 0,6 m = pas de lien ; remplissage depuis le départ
  de Haythem + les 20 lieux ; cabine d'ascenseur exclue ; formes `mobile` et `limite` ÉTEINTES, `vantail` ALLUMÉES pendant
  la génération, chacune rendue à son état exact (`finally`) ; tout en UNE tâche synchrone (une image de la carte vivante
  ouvrirait/fermerait des portes au milieu).
  Accélérations mesurées : le lien dans l'autre sens réutilise le balayage déjà fait (`deplacer` est symétrique à 6 liens
  près sur 97 274, carte_monde) — remplissage 0,56 → 0,36 s ; dégagement lu en UNE visite de la grille (`clairance`, le
  critère exact de `libre`) au lieu de `libre` à 2 m (64 µs l'appel) — 180 → 85 ms.
- **Liens « franchir »** (graphe des humains) : `franchissable` (js/jeu/mouvement.js, le critère du mouvement, jamais
  recopié) sur les directions où la marche échoue, après deux tris : une forme BASSE devant (boîte englobante) et les deux
  conditions nécessaires les moins chères de `franchissable` recopiées À L'IDENTIQUE (la sonde au ras du sol bute, une des
  arrivées est libre : 3 essais sur 10 échouaient là après 9 sondes) ; un essai par bloc de 4 × 4 cases, par direction et
  par sol (un lien par mètre le long d'une table). Arrivée = le nœud à ≤ 0,3 m ; coût 2 × la distance. **396 liens**
  (pause du 1er, pause du −1, David Clark, Kahn, salle 1 du 2e, Si 0.1, banquettes de l'attente, la rue…).
- **Tableaux** : `px pz ph` (Float32), `zone` (indice dans `PIECES`, 255 = aucune), `region` (AJOUT : la zone, ou celle
  de la pièce la plus proche par le graphe pour un seuil entre deux rectangles — c'est elle que lisent les masques : un
  seuil sans pièce couperait une porte), `niveau` (−1…2, 3 = la rue), `degage` (0,5 / 0,75 / 1 / 1,5 / 2, sinon le rayon),
  CSR `debut liens cout typeLien`, grille des cases (`caseDebut caseNoeuds`) pour `noeudPres`.
- **Empreinte** : FNV-1a sur les formes (type, coordonnées au mm, hauteurs, drapeaux, `off` des formes ni mobiles ni
  vantaux), les sols, les plafonds, les rectangles des 47 zones, puis `hacher([...comptes, pas, rayon, franchir, bornes,
  VERSION_NAV])` ; les barrières (`limite`) n'y entrent pas. Stable portes ouvertes ou fermées, d'un rechargement à l'autre.
- **Cache** : la session (données partagées, une `Nav` neuve par partie : masque, file, pénalités et champs n'en fuient
  pas), puis IndexedDB, sinon génération ; l'écriture N'EST PAS attendue (sous charge, 1,4 s pour le Mo du graphe ; une
  lecture qui suit attend la transaction d'elle-même) ; `?nav=refaire` ou `{ refaire: true }` force.
- **Chemins** : A* en tableaux (tas binaire, Float64), heuristique euclidienne ; `chemin` d'un bloc et `demander`/`pasFile`
  (1 500 nœuds ouverts par tranche, une demande à la fois, une demande de même clé remplace l'autre) — MÊME code, mêmes
  départages, donc même liste ; un nœud collé à un mur (dégagement = le rayon) coûte × 1,3 (le plus court chemin longeait
  les murs et rasait chaque coin) ; liens pénalisés × 10 pendant 10 s ; franchissements ratés appris (ci-dessous).
- `champDepuis` (Dijkstra complet, en cache par nœud tant que le masque ne change pas), `champMulti(sources, max)` (AJOUT :
  plusieurs sources, borné), `aleatoireDans`, `couverts` (12 tirés dans l'anneau 2-8 m, cachés à 1,0 m de chaque menace,
  en voyant une à 1,6 m ; `menaces` = leurs YEUX), `distancePied` (A* « pur » : la vraie distance, sans bords ni pénalités).

### `js/jeu/pilotage.js` — le Pilote et l'Errant
- **Pilote** : arrivée à hystérésis (LA CAGE `moveTo`) ; chemin demandé à la file quand la cible saute (> 1 m) ou glisse
  (> 1,5 m), 0,5 s au plus souvent ; **ficelle** toutes les 0,25 s jusqu'à 12 nœuds par dichotomie de balayages
  `C.deplacer` qui suivent le sol (pas de raccourci par-dessus un bord de palier, jamais au-delà d'un lien « franchir »),
  d'abord avec 8 cm de marge (on ne racle pas les chambranles), l'ancienne visée gardée tant qu'elle tient ;
  **resynchronisation** (poussé plus loin sur le chemin, il reprend au nœud qu'il touche : sinon la ficelle le ramenait en
  arrière — un va-et-vient vu au palier du 2e) ; axe relatif au lacet ; **évitement** des corps à 0,6 m devant (jamais vers
  un vide) ; **face-à-face** quand le passage est ÉTROIT (aucun nœud à 0,45 m de l'un ou l'autre n'a 0,6 m de dégagement —
  le critère « nœuds de dégagement < 0,6 » seul déclenchait le long de tous les murs : 70 reculs en 3 min) : le plus petit
  `id` recule par un chemin qui ne fait que S'ÉLOIGNER de l'autre jusqu'au nœud dégagé ≥ 0,75 m, attend qu'il soit passé
  (≥ 1,2 m et qui s'éloigne, ou arrivé), 3 s au plus ; un cul-de-sac dans son dos → c'est l'autre qui recule ;
  **franchir** : aligné < 15°, `saut` quand la face est à ≤ 0,6 m du centre ; raté (1,6 s) → les liens « franchir » à
  1,5 m pénalisés, un autre chemin ; la partie compte réussis / ratés (`nav.noterFranchir`) : à 3 ratés et plus de deux
  fois plus de ratés que de réussis, TOUS les liens « franchir » coûtent × 10 (le saut du squelette — 0,5 m — ne passe pas
  une table ; celui de L-B franchit, la règle ne se déclenche alors jamais) ; **coincé** (< 0,6 m en 3 s, ou 4 s sans
  passer un nœud) → lien pénalisé, nouveau chemin ; 2e d'affilée → **secours** au dernier nœud sûr à ≥ 1,5 m en arrière,
  jamais plus bas que lui de 0,5 m (une téléportation n'est pas une chute), seulement si le joueur local ne voit ni le bot
  ni le nœud ; 3e → `coince` (le cerveau change d'idée) ; **déplacé par un autre** (réapparition, harnais : > 1 m d'un pas)
  → il repart de zéro (sinon le secours le renvoyait d'où il venait).
- **Errant** : il MARCHE (pas de franchissement en patrouille : c'est l'affaire d'une poursuite, L-J — et le harnais compte
  un saut par-dessus un banc comme « dans un mur », il lit les pieds sans le saut) ; il vide ses fronts à chaque pas (un
  `saut` resté vrai faisait sautiller) ; de pièce en pièce de la ZONE DE JEU (la moins visitée de la partie, partagée par les errants ; le cœur de
  la pièce — son lieu d'apparition — une visite sur deux, sinon le plus dégagé de cinq nœuds) ; avec `vers` (le point
  chaud du cerveau minimal) : il y court (sprint au-delà de 15 m), le GUETTE 2 à 4 s, puis fait sa ronde à 2-6 m ; regard
  dans la marche lissé (0,09 s, 9 rad/s au plus), coups d'œil à l'arrêt.

### `js/jeu/apparitions.js`
- `departs` : les deux camps tirés ENSEMBLE, à tour de rôle (le plus proche à pied de sa base, pénalisé de 1,5 × ce dont
  il s'avance vers la base adverse ; passes : dégagé 0,75 à ≤ 12 m, 0,5 à ≤ 12 m, puis jusqu'à 30 m), chaque point à ≥ 15 m
  à pied de tous ceux d'en face, à 1,5 m de ceux de son camp, hors des volées ; tournés vers le premier bout du chemin vers
  la base adverse (on part dans le bon couloir) ; mis en cache par graphe et masque. Les chasseurs : un camp seul.
- `choisirApparition` (§ 3.8) : candidats = les 20 lieux + ≈ 12 nœuds par niveau échantillonnés du plus loin d'abord
  (52 sur `ecole`) ; distances À PIED par Dijkstra BORNÉS depuis les acteurs (un par ennemi à 20 m, un pour les alliés à
  15 m) au lieu d'un champ par candidat ; note = 1,0 × proximité − 3,0 × danger (× 3 vu, morts récentes à 8 m) ; jamais un
  point à < 20 m à pied d'un ennemi qui le voit, ni à < 6 m d'un ennemi ; tirage parmi les 3 meilleurs (`partie.rng`) ;
  chacun pour soi : le plus loin à pied du plus proche ennemi que personne ne voit, exactement ; regard vers l'ennemi.
- `ramenerPoint` : le nœud de dégagement ≥ `degageMin` le plus proche à ≤ `rayonMax` ; s'il n'y en a pas, RELEVÉ (le plus
  dégagé de la ronde) et dit : `{ x, y, z, degage, releve: true }` (voir écarts).
- Sans graphe (`nb = 0`) : les replis du squelette.

## Le `__rapport` (PC, `http://127.0.0.1:8136/?test=1&rapport=1&lot=L-D`)

`ok: true`, `total: 17` (le 18e, couverts, ajouté ensuite : vert seul — voir le dernier passage en bas), `echecs: []`,
`signales: []`, `ms: 28524`, qualité high, téléphone false.

| # | Critère (§ 5.5.6) | Obtenu |
|---|---|---|
| 1 | `verifierNav` | 8 904 nœuds, 60 252 liens, 1 composante, 20/20, m² 96 / 182 / 111 / 61 / 106, cabine 0, génération 896 ms ; cache IndexedDB 22,6 ms, session 1,1 ms |
| 2 | empreinte | `nav:3245b255:r0.3:f:v1` portes ouvertes comme fermées, au chargement précédent ; + forme `nav:3ad006e6…`, − forme = |
| 3 | `instantane()` | identiques (et `off` de chaque forme) |
| 4 | A* 200 paires | médiane 0,7 ms, p95 2,6 ms ; tranches p95 0,8 ms (max 1,1) ; mêmes 200/200 |
| 5 | champ, `noeudPres` | 3,9 ms puis en cache ; 0,5 µs ; 1 000 / 1 000 points libres |
| 6 | `verifierBots` 180 s × 8 | 0 / 0 / 0 / 0, coincés 0, secours 0, 44 pièces |
| 7 | `restreindre` ss | 200 chemins, 0 sortie, le hall refusé |
| 8 | Pilote 100 trajets | 100 arrivés, 99 dans le temps (médiane 1,02, p95 1,06) |
| 9 | départs | école, RDC + rue, étages : 5 + 5 à 0,75 m, ≥ 15 m (34,6 / 18,7 / 18,8 m) ; −1 : 15,0 m, dégagement relâché (écart 5) |
| 10 | réapparition | 0 faute / 1 000 (6,5 ms le tirage), chacun pour soi 100/100 |
| 11 | déterminisme, IndexedDB qui lève | égaux ; régénéré sans cache, 0 exception, 0 erreur |
| 12 | pureté | 0 faute (et `verifier_proprietaires.py` : OK) |
| 13 | graphe des props | 10 610 nœuds, 1 composante, attente ×1,11, S 1.3 ×1,25, pause du 1er ×1,23, clé à lui, 726 ms |
| 14 | liens « franchir » | 396 redonnés sur 396, attente 2, comptoir 0 (écart 3), rangs 0, A* 30/30 |
| 15 | face-à-face | volée de tôle 10/10 (4,7 s), couloir du −1 10/10 (3,1 s), 0 coincé |
| 16 | anneaux | A dégagé 1,5 ; B, C relevés à 1,0 (le mieux de la ronde, écart 4) |
| 17 | ressenti | 4,99 m/s en ligne droite, rotation ≤ 9 rad/s, 10 demi-tours de commande en 40 s × 6 |
| 18 | couverts | 45 essais, 2 couverts (rares : il faut un écran entre 1,0 et 1,6 m), 0 faute |

`&rapport=1&lot=S0` sur la branche : **29/29**, 87,6 s, 0 signalé ; balade au bit près (vue 3 0 / 0, vue 1 0 / 0) ;
point 10 `Partie.pas` 0,068 ms ; point 25 : 33 élim., 41 tirs de test (props 32 % pour 32 % des candidats).

## Mesures (relatives : trois autres agents tournaient, et l'onglet passait souvent derrière les leurs)

| | mesure |
|---|---|
| graphe des humains | 8 904 nœuds (8 956 ± 5 %), 60 252 liens (dont 396 « franchir »), 1 composante, 20/20 lieux, m² −1 96 · RDC 182 · 1er 111 · 2e 61 · rue 106, 0 nœud de cabine, 44 pièces |
| génération (onglet devant) | 0,85-1,05 s : remplissage ≈ 0,36-0,42 s, franchissements ≈ 0,3-0,45 s, zones + dégagement ≈ 0,12 s ; onglet derrière ceux des autres agents : jusqu'à 4,6 s ; l'écriture IndexedDB (non attendue) a pris jusqu'à 1,4 s |
| graphe des props | 10 610 nœuds, 72 840 liens, 1 composante, 0,73-0,9 s ; attente ×1,11, S 1.3 ×1,25, pause du 1er ×1,23 |
| cache | IndexedDB 6-8 ms, session 2 ms |
| A* (200 paires, graine 13) | médiane 0,6 ms, p95 2,5 ms ; tranches p95 0,8 ms ; mêmes 200/200 |
| `champDepuis` | 3,7-4,2 ms ; `noeudPres` 0,5 µs |
| `verifierBots` 180 s × 8 | 0 hors monde, 0 sous le sol, 0 mur, 0 traversée, 0 coincé, 0 secours, 44 pièces ; ≈ 2,6 chemins par bot et par minute |
| Pilote 100 trajets entre niveaux | 100 arrivés, 98-100 en ≤ 1,5 × (médiane 1,02-1,03) ; les lents passent par un lien « franchir » de la Kahn que le saut du squelette ne passe pas (le pilote le pénalise et fait le tour ; au 3e raté de la partie, l'A* ne les prend plus) |
| face-à-face | volée de tôle 10/10 (4,6 s), couloir du −1 (cul-de-sac) 10/10 (3,1 s), 0 coincé |
| réapparition | 0 faute sur 1 000 tirages, 8-11 ms le tirage ; chacun pour soi 100/100 exacts |
| errants (ressenti) | 4,99 m/s en ligne droite (jamais ralentis), regard ≤ 9 rad/s, ≤ 8 demi-tours de commande en 40 s × 6 ; à moins de 4 cm d'un mur en courant : 15 % des pas → 10 % (bords × 1,3, marge de ficelle) |
| combat de bots 4 c. 3 (`equipes`, ecole, 180 s simulées) | fin à 40-36, 76 éliminations, 72 réapparitions : la plus proche à 19,1 m à pied d'un ennemi, 0 vue ; 504 chemins (2,8/s), A* 394 ms en tout ; `Partie.pas` 0,17 ms en moyenne (7 bots) |

## Écarts au document

1. **Le lieu « rue »** (§ 4.5.11 `POINTS_APPARITION`, carte_monde § 8 : (15,63 ; 0 ; 9,38)) est HORS de la rue bornée
   (`BORNES_NAV.zMax` 6) : aucun nœud, `verifierNav` aurait 19/20. Ramené au plus dégagé de la rue bornée, la chaussée
   devant la porte 6 : (13,13 ; −0,12 ; 4,88), dégagement 2 m (aussi dans les graines de `nav.js`).
2. **47 pièces** (§ 5.5.6 point 6) : `e1bureau`, `e103`, `e104` sont derrière des portes FERMÉES (aucun nœud, même au rayon
   0,2) ; le test exige les 44 pièces atteignables.
3. **Le comptoir de l'accueil** (point 14, § 3.1) : le comptoir haut fait **1,18 m** (`ecole_hall.js` CPT.h) ;
   `franchissable` refuse au-delà de 1,15 m : aucun lien n'y est possible sans changer la fonction du socle. Le test vérifie
   les banquettes de l'attente (2 liens, un par mètre), et dit « comptoir 0 ». DEMANDE ci-dessous.
4. **Anneaux B et C** (§ 2.5, point 16) : les pauses du −1 et du 1er sont meublées, aucun nœud n'y a 1,5 m de dégagement
   à 8 m à la ronde (1,0 au mieux). `ramenerPoint` relève (le plus dégagé à ≤ 3 m) et le dit (`releve`, `degage`) au lieu
   de rendre null ; A (hall) est dégagé de 1,5 m.
5. **Départs du −1** (point 9) : la pause entière est à moins de 15 m à pied de la sas ; le camp B (pied de la volée de
   tôle) n'a que 3 nœuds dégagés de 0,75 m à 15 m de la base d'en face (le camp A 4) : 5 points à 0,75 m y sont
   impossibles. Les départs relâchent (0,5 m, puis le graphe : 2 points du camp B dans le couloir du −1, cul-de-sac de
   0,8 m) ; le test calcule ce que la zone permet et le dit. Les trois autres zones : 5 + 5 points à 0,75 m, ≥ 15 m.
6. **Franchissements** (§ 4.5.11 : « pour chaque nœud et chacune des 8 directions ») : un essai par bloc de 1 m, par
   direction et par sol (la génération passait de 1,5 s à 0,9 s) ; chaque lien gardé est redonné par `franchissable`.
7. **Pénalités du chemin** : en plus du × 10 des liens où l'on s'est coincé, × 1,3 sur un nœud collé à un mur et × 10 sur
   les « franchir » d'une partie où ils ratent (ci-dessus) ; `champDepuis`, `champMulti` et `distancePied` restent des
   distances à pied vraies.
8. **Empreinte** (§ 4.5.11 : « Σ arrondi(coordonnées) ») : un FNV-1a au mm au lieu d'une somme (une forme déplacée sans
   changer la somme passait) ; les zones (le lot R les change avec le −1) y entrent aussi.
9. **`noeudsAutorises`** (L-M) est encore « tout permis » au squelette : l'errant lit lui-même les pièces de la zone de
   jeu (sinon un chasseur du prop hunt au 1er errait au −1 et dans la rue — c'est ce qui faisait échouer S0 point 25).
10. **AJOUTS** aux contrats (règle 3 du § 4.1, rien de changé) : `demander(…, o = null)` (5e paramètre facultatif,
    `{ franchir: false }` : par la marche seule), `pilote.franchir` (faux pour l'errant), `Nav.oublier()`, `Nav.empreinteDe(game, o)`,
    `Nav.genererSync(game, o)`, `Nav.ecriture`, `Nav.derniere`, options `refaire` et `chrono` d'`obtenir` ;
    `nav.region`, `nav.dans(x, y, z, r, out, dyMax)`, `nav.lien(u, v)`, `nav.penaliser(u, v, jusqua)`,
    `nav.annuler(cle)`, `nav.champMulti(sources, max, out)`, `nav.masquePieces(pieces)`, `nav.pieceDe(i)`,
    `nav.piecesPermises()`, `nav.permis(i)`, `nav.longueur(L)`, `nav.noterFranchir(ok)`, `nav.franchirMauvais` ;
    `nav_cache.js` `viderNav()`, `oublierBase()` ; `apparitions.js` `REGLES_APPARITION`, `candidatsApparition(nav)`,
    `departs(…, nav = null)` (5e paramètre facultatif : `departs` n'a pas de graphe dans sa signature — à défaut,
    `Nav.derniere`, le graphe des humains que la partie vient de restreindre), `piecesDe`, `pointsDe` ; `pilotage.js`
    `Pilote.secoursTotal`, `pilote.dir`, `pilote.mode`, `errant.etat`. Les `PASSAGES` / `routePieces` du squelette sont
    retirés (le graphe les remplace : demande de S0).
11. `franchissable` relue (demande de S0, écart 10) : son interprétation (arrivée au-delà de la face, ligne ≥ 1,4 m,
    hauteur = la marche franchie) donne des liens justes (499/499 redonnés) ; seul le plafond 1,15 m pose question (3).

## Demandes

- **F2 / S0** : `franchissable` plafonne la hauteur à 1,15 m ; le comptoir haut de l'accueil fait 1,18 m. Passer le
  plafond à 1,20 m (§ 3.1 cite le comptoir parmi les franchissables) ou rayer le comptoir du § 5.5.6 point 14.
- **F2 / L-E** : les anneaux de domination B et C n'ont pas 1,5 m de dégagement (1,0 au mieux) : `ramenerPoint` rend
  `{ …, degage: 1, releve: true }` ; L-E peut réduire le rayon de capture de ces deux anneaux ou les garder à 3 m (on se
  bat entre les tables : c'est voulu ?).
- **F2 / INT** : la base du camp B au −1 (`ZONES_JEU.ss.departs.B`, pied de la volée de tôle) laisse deux joueurs dans
  le couloir du −1 (cul-de-sac de 0,8 m) ; la mettre devant la grande salle (9,63 ; −3,06 ; −22,62), 19 m à pied de la sas,
  donnerait cinq points dégagés à chaque camp — à mesurer avec le lot R (il refait le −1).
- **L-M** : `noeudsAutorises(nav, zone, mode)` peut s'écrire `nav.masquePieces(piecesDe(zone))` moins les nœuds des pièces
  fermées par la table (la RÉGION d'un nœud, pas sa zone : un seuil de porte n'a pas de pièce dans les rectangles) ; la
  rue est une pièce (`rue`) comme les autres.
- **L-B** : le pilote envoie le front `saut` face à l'obstacle, aligné < 15°, quand la face est à ≤ 0,6 m du CENTRE du
  corps (la sonde de `franchissable` bute à < 0,48 m) ; le regard de l'errant est dans l'axe (lissé). Si le franchissement
  exige autre chose (le sprint, l'axe à fond…), le dire à F2.
- **L-J (vague 3)** : `couverts(x, y, z, menaces, rng, n)` attend les YEUX des menaces ; `champMulti` borné sert les
  points chauds et les replis ; `pilote.mode` (`route` / `recul` / `attente`) et `pilote.dir` sont lisibles ; le face-à-face
  ne se déclenche qu'entre deux PILOTES (`b.cerveau.pilote`).

## Doutes

- Les temps : onglet derrière ceux de trois autres agents (le panneau est partagé), une génération y a pris 4,6 s ; devant,
  0,9-1,05 s. Le seuil de 1,0 s est « signalé » ou tenu selon la charge ; l'intégration le mesurera au calme.
- Le graphe a 8 904 nœuds (8 956 attendus, mesure du prototype) : 52 de moins, sans doute la cabine (17 nœuds × 3
  niveaux, exclue ici avant le remplissage).
- Le cerveau minimal replanifie souvent en combat (≈ 3 chemins/s pour 7 bots : le point chaud bouge à chaque tir entendu) :
  dans le budget ; L-J lissera.
- Les parties successives d'un même onglet ne sont pas identiques au bit près entre elles (les passages d'ascenseur,
  formes `mobile`, restent dans l'état où la balade les a laissés : le squelette de `MondePartie` ne coupe pas encore
  l'ascenseur, L-M le fera) ; deux parties lancées à la suite le sont (`verifierDeterminisme`, test 11).
- `couverts` en rend peu (2 sur 45 essais) : il faut un écran entre 1,0 et 1,6 m (comptoir, cloison basse) entre le
  couvert et la menace ; c'est la définition du § 3.7 — L-J pourra appeler plusieurs fois ou élargir.

## Ce qui reste (pour F2 et la vague 3 — rien d'obligatoire pour L-D)

- Les 4 tests `apresFusion` de `test_nav.js` : `verifierBots` avec les tables de L-M ; départs adverses sans ligne de vue
  (vraie `vue` de L-A) ; 50 franchissements de bots avec le vrai franchissement de L-B (≥ 48) ; cachettes de L-K
  atteignables sur le graphe des props (e1).
- Avec le lot R : régénération par empreinte (automatique), `verifierNav` / `verifierBots` / test 9 au −1 à refaire.

## Photos regardées

Prises par `__jeu.photo()` et montrées dans l'onglet (non gardées) : une manche d'équipes de bots (orbite derrière un bot qui
passe en courant la porte du palier de l'ascenseur), la caméra de mort de Haythem tombé dans la pause du −1, les rangées
jaunes de la S −1.14 derrière. Le panneau du navigateur est partagé par quatre agents (onglets des ports 8131, 8132, 8137) :
l'onglet passe souvent derrière, rAF à 2 / s — les images ont été faites à la main (`game.frame`). Le ressenti des trajectoires
est mesuré plutôt que regardé : vitesse, rotation, demi-tours (test 17), frottement des murs (15 % → 10 % des pas à moins
de 4 cm d'un mur).

## Définition de fini (§ 5.1 règle 5)

- (a) `&rapport=1&lot=L-D` : `__rapport.ok` (dernier passage ci-dessous).
- (b) `&rapport=1&lot=S0` sur la branche : 29/29.
- (c) `python -I tools/verifier_proprietaires.py lot/L-D` : `OK 6 fichiers (lot/L-D, L-D, base socle)`.
- (d) commits « L-D : … » avec la ligne d'attribution.
- (e) ce rapport, commité.
- (f) onglet fermé, serveur du port 8136 arrêté, jeton `jeton_1` rendu (pris à 03:15, rafraîchi pendant les tests).

### Dernier passage

23/10, sur `71717c1` : `&rapport=1&lot=L-D` → **`ok: true`, 18/18**, 29,96 s, 0 échec, 0 signalé (génération 924 ms,
graphe des props 639 ms, cache IndexedDB 43,9 ms ; `verifierBots` 0 / 0 / 0 / 0, 0 coincé, 0 secours, 44 pièces ; A* 30/30
sur les franchissements ; couverts 0 faute). `&lot=S0` 29/29 (sur `202b9bd`, le pilotage inchangé depuis). Propriétaires :
OK. Onglet `tab-8` fermé, serveur 8136 arrêté, `jeton_1` rendu.

## Relecture (relecteur sévère, 23/10)

### Constats sur `9ca7414` (à corriger : ✔ = corrigé, commité)

1. `nav.restreindre` vidait la file des chemins SANS rappeler les demandeurs : un pilote en attente de son chemin
   (`_attente`) restait figé pour toujours (ni chemin, ni surveillance « coincé ») dès qu'une partie restreint son graphe
   en cours de route (L-F le fait au changement de zone du prop hunt, L-M peut le faire en verrouillant une porte).
2. `champDepuis` / `champMulti` comptaient les liens pénalisés (× 10 pendant 10 s) : des distances « à pied » fausses
   juste après un coincement — un ennemi derrière un lien pénalisé semblait loin, la réapparition pouvait tomber à
   moins de 20 m de lui (le rapport disait « distances vraies »).
3. L'errant (la patrouille du cerveau minimal) gardait son regard d'avant le combat : sortie d'un combat, la tête et le
   corps du bot sautaient d'un coup vers l'ancien regard (jusqu'à 180° en un pas).
4. L'errant lisait `arrive` / `coince` du pilote pour la destination D'AVANT quand la sienne venait de changer : au point
   chaud entendu pendant une pause, il passait en « guet » sans y être allé (pas de sprint, pas de guet à l'arrivée).
5. `departs` : un appel par camp, deux tirages si les `n` diffèrent au-delà de 6 (`K = max(6, n)` dans la clé) — les deux
   camps pouvaient sortir de deux tirages différents, donc à moins de 15 m l'un de l'autre.
6. Morts récentes de la réapparition lues dans l'anneau de 256 événements de la partie : en plein combat (tirs, pas,
   impacts) il couvre 3 s, pas les 10 s voulues.
7. `choisirApparition` pouvait rendre un point VU par un ennemi à plus de 20 m à pied (permis par le § 3.8) : L-E le
   refuse alors (`_sur` : vu de personne à 60 m, aucun ennemi à 6 m) et prend son repli — le choix de L-D ne servait pas.
8. Test 1 : le graphe mesuré AVANT toute partie, donc sans les vantaux solides de `MondePartie.preparerSession` (L-M) :
   à F2, `verifierNav` mesurerait un autre graphe que celui des parties (autre empreinte).

### Le jeton du navigateur (relecture)

- 05:31:23-05:31:50 : mon script d'attente lisait la DERNIÈRE date de `qui.txt` (celle de l'ancien preneur, citée par un
  jeton repris) et a cru `jeton_1` périmé alors que L-U le tenait depuis 05:24:23 : `qui.txt` réécrit à l'identique de
  celui de L-U 27 s plus tard ; aucune page ouverte entre-temps (L-U n'a rien perdu). Script corrigé (la PREMIÈRE date).
- 06:17:57 : `jeton_1` pris (attente de 06:17 à cause de la file). 06:31:51-06:41:14 : un script d'attente arrêté par
  l'outil (TaskStop) tournait encore sous Windows et a pris aussi `jeton_2` ; aucune page n'y a été ouverte (un seul
  onglet, `tab-28`) ; rendu dès vu, les processus orphelins tués.
