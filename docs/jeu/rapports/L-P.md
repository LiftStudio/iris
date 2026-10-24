# Rapport L-P — la progression (vague 3)

Branche `lot/L-P` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-P`, depuis `vague2` = `vague2-ok` `2e688ba`), port 8153 ;
24/10/2026. Spécification : `docs/jeu/spec_finale.md` § 5.7.3 (et §§ 2.1, 3.3, 3.5, 4.1, 4.5, 4.6, 5.1, 5.2 ; CoD §§ 7.7, 11, 12).

## Où j'en suis

**EN COURS — le code est fait et commité, `test_progression.js` 11/11.** Reste : les rejeux des autres fichiers de tests sur
la branche (S0 en cours, puis L-E, L-U, L-G, L-I), la partie jouée sans `?test=1`, le rapport final.
Navigateur : `jeton_2` pris PÉRIMÉ à 07:09 (`qui.txt` de G-LUM daté 06:23:51), rafraîchi pendant les tests ; onglet `tab-53`,
serveur 8153 (lancé dans l'arbre).

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

## `__rapport` (`?test=1&rapport=1&lot=L-P`, PC 1280 × 720)

(à compléter)

## Écarts au document

(à compléter)

## Demandes

(à compléter)
