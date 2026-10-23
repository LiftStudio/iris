# Rapport L-I — tactile, manette, assistance (vague 2)

Branche `lot/L-I` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-I`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8143 ;
23/10/2026. Spécification : `docs/jeu/spec_finale.md` §§ 3.2, 4.5.18, 5.5.13 (et §§ 4.8, 6.2, 6.3).

## Où j'en suis

**RELECTURE EN COURS** (relecteur sévère, 23/10 dès 06:20 ; section « Relecture » plus bas) : diff `socle...lot/L-I` relu
contre §§ 3.2, 3.6, 4.5.18, 4.8, 5.5.13 ; propriétaires OK ; 1er défaut corrigé (tir auto et armes semi-automatiques) ;
en attente d'un jeton du navigateur pour rejouer les critères et jouer.

(Constructeur, avant la relecture) **FINI.** Les six points de la définition du § 5.1 règle 5 sont tenus :
- (a) `&rapport=1&lot=L-I` : **13/13 sur PC** (8,8 s), **13/13 sous `?tel=1` à 812 × 375** (16,6 s) et **13/13 sous `?tel=1`
  en émulation mobile 375 × 812** (11,4 s), 0 signalé ;
- (b) `&rapport=1&lot=S0` sur cette branche : **29/29 sur PC** (82,2 s) et **29/29 sous `?tel=1` à 812 × 375** (69,8 s), 0
  signalé (balade au bit près, entrées, cycles, tactile et HUD de la balade = la référence) ;
- (c) `python -I tools/verifier_proprietaires.py lot/L-I` → `OK 7 fichiers` ;
- (d) commits préfixés `L-I : …`, ligne d'attribution ; (e) ce rapport ; (f) onglet fermé, serveur arrêté, jeton rendu
  (`jeton_2`, pris à 05:40:40, rendu à 05:52:30 ; attente de 05:09 à 05:40, les trois jetons pris — L-C, L-K, L-G, puis
  L-U et L-H).

Joué pour de vrai dans le navigateur intégré (812 × 375, `?tel=1`) : un glissé de la souris sur TIR (41 px) → le regard
tourne de 0,246 rad (0,006 rad/px) et une balle part ; au prop hunt, DÉGUISER touché → Haythem devient le carton, FIGER et
VERROU apparaissent, FIGER touché → « BOUGER », le prop figé. (Le navigateur intégré envoie des clics de SOURIS : le joystick,
qui ne se prend qu'au doigt, et l'appui long de PROVOQUER ont été joués par les tests, aux événements de pointeur `touch`
fabriqués — le chemin de `js/touch.js` en entier.)

Fait (commits `L-I : …`) :
1. `js/jeu/assistance_visee.js` — l'aide à la visée, à la manette et au doigt, jamais à la souris : RALENTISSEMENT
   (`facteurStick` : × 0,55 en visée, × 0,7 à la hanche, au prorata de la visée, dans le cône atan(0,45 / d) + 1° du buste
   SIMULÉ d'un ennemi VU à ≤ 40 m), SUIVI (+ 45 % de la vitesse angulaire de la cible quand le regard bouge — stick droit ou
   doigt), AIMANT D'ADS (au front de la visée, cible à < 7° et < 30 m : 70 % de l'écart pendant le temps d'ADS de l'arme,
   courbe 1 − (1 − u)³, cible suivie), TIR AUTO (au doigt, `controls.fps.tirAuto` : réticule sur la silhouette d'un ennemi
   à ≤ 30 m pendant 0,12 s → `cmd.tir`, 0,05 s de grâce). `corriger` réécrit `game.camYaw/camPitch` ET `cmd.lacet/tangage`.
   Jamais un prop déguisé comme cible (l'aide le trahirait) ; état rangé par partie (WeakMap) ; ni horloge ni hasard ; pas
   de lecture d'Input (les drapeaux `regardBouge` sont posés par la manette et le doigt). Valeurs : table `AIDE`.
2. `js/manette.js` en partie — stick droit à 3,6 rad/s (sensibilité du stick, courbe ^1,8, les deux axes), accélération de
   virage (au-delà de 0,9 pendant 0,25 s : × 1,35 en lacet, atteint en 0,3 s), × 0,55 en visée, × `facteurStick`, bornes
   `game.bornesTangage()` ; roue des provocations ouverte (ou LB tenu, profil prop) → le stick droit va à
   `partie.mouvementStick`, la caméra ne tourne pas ; calque « CLIQUE POUR JOUER » : A ou START le ferment SANS capture,
   bouton muet jusqu'au relâchement ; L3 : le sprint (2e appui < 0,30 s
   = sprint tactique, le verrou étant celui de `lireCommande`, L-B) ; vibrations sur ÉVÉNEMENTS de la partie
   (`VIBRATIONS_JEU` : tir faible 40 ms, touche reçue forte 120 ms, élimination et annonce une fois, explosion proche,
   flash) et plus aucune par `hoops-feedback` en partie ; la notification de branchement passe par le bandeau en partie
   (jamais `hud.feedback`) ; `aideBalade()` suit le profil (combat, prop). Valeurs : `STICK_JEU`, `VIBRATIONS_JEU`.
3. `js/touch.js` en partie — onze emplacements à elle (le groupe `jeu`, la pause commune ; la balade garde les siens à
   l'identique : `_contexte()` en balade = la référence), placés par une fonction PURE `disposition(W, H, T, sa)` (places
   enchaînées sur les rayons réels : ≥ 10 px à l'unité entre deux boutons, à toutes les tailles) ; contextes combat,
   chasseur (SCAN, ni flash ni couteau), prop (DÉGUISER, FIGER, VERROU, PROVOQUER) ; TIR et GRENADE en RÔLE MIXTE (le doigt
   vise en glissant) ; VISER en BASCULE (quand la visée est « maintenue » au clavier, le défaut) ; ACCROUPI en sprint = la
   glissade (le sprint tenu encore 0,15 s) ; SPRINT VERROUILLÉ au bord du joystick vers l'avant (sprint tactique demandé ;
   pouce levé, Haythem continue tout droit ; reposer le pouce, tirer, viser, s'accroupir, le tir auto, la pause le rendent) ;
   PROVOQUER : appui long 0,28 s (ou le pouce qui glisse déjà) = la roue, le glissé va à `partie.mouvementSouris` ; bref = la
   dernière (`provocVite`) ; visée au doigt 0,006 × sensibilité rad/px (les deux axes), × la sensibilité de visée de
   `Partie.souris`, × `facteurStick` ; toucher le calque = reprise sans capture ; le clic qu'un toucher du canevas donne
   n'atteint plus `game._onClick` (pas de demande de capture au téléphone) ; en partie, la souris qui bouge rend la main au
   clavier-souris (`auDoigt` faux) ; DISPOSITION TACTILE ouverte depuis la pause d'une partie : les boutons de la partie ;
   les variables du HUD (`--tc-droite`, `--tc-haut`) suivent le groupe à l'écran. Valeurs : `TACTILE_JEU`.
4. `css/jeu/tactile.css` — l'allure des boutons de partie (TIR rouge, plein pendant le tir auto ; DÉGUISER vert ; bascule
   allumée ; compte des grenades ; cadenas du sprint verrouillé ; rien qui bouge sous `prefers-reduced-motion`).
5. `js/manette_menus.js` — `data-retour` sur une racine (son bouton de retour, cherché en elle), réinscription avec
   `avant`, `racinesInscrites()`.
6. `js/jeu/tests/test_mobile.js` — les 13 critères + 4 de F2 (`apresFusion`).

## Écarts au document (à trancher par F2 / INT)

1. **COUTEAU au doigt** (§ 4.8, colonne Tactile : « glisser bas sur TIR ») : TIR est en rôle mixte (glisser = viser, § 3.2) ;
   un bouton COUTEAU (§ 4.5.18 le liste dans le contexte combat) le remplace.
2. **Touche reçue à la manette** : § 3.6 dit « fort 0,5, faible 0,8, 90 ms », § 4.5.18 et le critère 7 « forte 120 ms » →
   0,5 / 0,8 / 120 ms.
3. **Sprint verrouillé au doigt** : « verrouillé » lu à la manière de CoD Mobile — on peut lever le pouce, la course
   continue tout droit jusqu'à reposer le pouce (ou tirer, viser, s'accroupir).
4. **L3 à la manette** (§ 4.8 « L3 (double) ») : `js/manette.js` n'y ajoute RIEN — le verrou du sprint (un clic suffit,
   comme Call of Duty) est celui de `lireCommande`, que L-B a écrit dans sa branche (`E.verrou`) ; une 2e logique côté manette
   (essayée, puis retirée) se serait battue avec la sienne. Son test est à F2.
5. **Les bascules au doigt** : VISER est une bascule (§ 4.8 « VISER (bascule) ») tant que la visée est « maintenue » au
   clavier (défaut) ; si Haythem choisit la bascule au clavier, le bouton envoie l'appui tel quel et `lireCommande` (L-B)
   bascule. ACCROUPI : l'appui tel quel (l'accroupi est déjà en bascule par défaut, `accroupiMaintenu: false`) ; une
   bascule au doigt seulement si l'accroupi est « maintenu ».
6. **Le suivi** est dans `corriger` (pas dans `facteurStick`, § 4.5.18 « facteurStick (ralentissement, suivi) ») : un
   facteur ne peut pas ajouter la vitesse de la cible ; le stick et le doigt posent `regardBouge`, `corriger` l'applique au
   pas suivant. Le suivi vaut aussi pour le doigt qui vise (§ 3.2 : « manette et tactile »).
7. **Le tir auto** : « le réticule sur un ennemi » = le rayon de visée passe à ≤ 0,28 m (× h / 1,73) de l'axe du corps,
   entre ses pieds et le haut de sa tête (une cible du stand : son panneau).
8. **L'accélération de virage** : sur la poussée radiale du stick (> 0,9), appliquée au lacet seul (un « virage »).
9. **La visée au doigt en partie** : 0,006 rad/px sur les DEUX axes (la balade : 0,004 en tangage), comme la souris FPS
   (« mêmes facteurs sur les deux axes », arbitrage 27).
10. **Mort au combat** : SAUT devient PASSER (Espace / A pour passer la caméra de mort, § 3.6) ; au prop hunt, rien.

## Demandes

- **INT** (`js/game.js` `_onClick`) : ne demander la capture que si `partie.besoinCapture()` ; `js/touch.js` arrête déjà le
  clic d'un toucher, mais un clic de souris pendant que la manette est l'entrée du moment la demande encore.
- **L-B** : `lireCommande` reçoit du doigt `Tactile:sprintTact` (front, au verrou du sprint), `Tactile:visee` TENU (la
  bascule faite par le doigt quand la visée est « maintenue ») et `Tactile:accroupi` tel quel ; l'axe de la course verrouillée
  est (0, 1), amplitude 1. À garder si la lecture change.
- **L-G** : au doigt, `--tc-droite` (la grappe de tir de la partie, ≈ 256 px à l'unité) et `--tc-haut` (sous II et SCORES)
  sont tenus par `js/touch.js` pour le groupe à l'écran.

## Le `__rapport` (`http://127.0.0.1:8143/?test=1&rapport=1&lot=L-I`, puis `&tel=1`)

PC : `ok: true`, `total: 13`, `echecs: []`, `signales: []`, 8 780 ms. `?tel=1` à 812 × 375 : `ok: true`, 13, 16 563 ms.
`?tel=1` en émulation mobile (375 × 812, toucher émulé) : `ok: true`, 13, 11 359 ms. (Sur PC, sans `js/touch.js`, les
critères 2, 4, 10 et 11 disent « joué sous ?tel=1 » ; l'aide à la visée et la manette se jouent partout.)

| # | Critère (spec § 5.5.13) | Mesuré (`?tel=1`, 812 × 375) |
|---|---|---|
| 1 | trois contextes présents, sans recouvrement, dans l'écran | combat 11 boutons, chasseur 10 (SCAN, ni flash ni couteau), prop 7 (5 encore humain) · 0 recouvrement, 0 dehors aux trois tailles · écart mini 9,6 / 10,6 / 14,0 px · à l'écran : les 11 du combat |
| 2 | TIR mixte : 100 px → 0,006 × s rad/px, tir tenu | −0,600000 rad pour −0,600000 · tangage inchangé · tir tenu tout le glissé · relâché au lever |
| 3 | tir auto 0,12 s ≤ 30 m ; jamais à la souris | mannequin à 3,4 m : 1er tir à 0,133 s (16 pas) · à côté (après la grâce), hors de portée, à la souris, coupé : 0 tir |
| 4 | joystick au-delà du bord → sprint verrouillé (tactique) ; ACCROUPI en sprint → glissade | mi-course : rien · au bord : verrou + front `sprintTact` · 60 % vers l'avant : tenu · pouce levé : court tout droit (ay 1, amp 1) · ACCROUPI : accroupi ET sprint au même pas, sprint rendu 0,15 s après · pouce reposé : arrêt · au bord sur le côté : pas de verrou |
| 5 | manette en partie | RT tir, LT visée, L3 sprint, R3 couteau, RB létale, LB tactique, Y arme, X recharger, B accroupi, A saut, Back scores · L3 double → tactique · bornes ± 1,48 · 1,435 rad/s pour 3,6 × 0,6^1,8 · 3,6 → 4,51 → 4,86 rad/s (× 1,35) · visée × 0,55 (0,789 rad/s) |
| 6 | assistance : × 0,55 / × 0,7, suivi + 45 %, aimant 70 % ; souris identique au bit près | 0,7 dans le cône (8,5° à 3,4 m), 1 hors du cône, 0,55 en visée, 1 caché / hors de portée / à la souris · suivi : écart max 1,1e-16 rad à 0,45 × la vitesse de la cible, rien quand le regard ne bouge pas · aimant 5° → 1,5° (30 %), commande réécrite, rien à 9° · souris : 40 pas identiques au bit près avec et sans l'aide |
| 7 | vibrations | tir [0 ; 0,35 ; 40 ms] · touche reçue [0,5 ; 0,8 ; 120 ms] · annonce 1 · élimination 1 · `hoops-feedback` en partie : 0 vibration, aucun émis |
| 8 | balade : tactile = référence ; manette −0,1 / 0,9 et 2,9 rad/s ; racines ; B sur la pause | `_contexte()` = référence · aucune racine en balade · 2,9 rad/s · −0,1 / 0,9 · overlay (Reprendre → Options), B la referme · options, B les ferme · téléphone, B le range |
| 9 | racines du jeu ; B revient | menu-jeu (focus BALADE, la croix descend les 6) · reglage-jeu, credits-jeu (écrans d'essai inscrits comme ceux de L-U) : B revient · data-retour-action : l'action tapée · fin-jeu navigable |
| 10 | menu : calque caché ; partie : montré | caché au menu · TIR à l'écran en partie · la balade rendue (= référence) |
| 11 | au doigt seul : menu → COMBAT → LANCER → bot touché → II → Reprendre sans capture → II → Quitter → menu | équipes lancées du menu · aucun calque au décompte · 4 touches · pause · reprise : 0 capture demandée, 0 `requestPointerLock` · menu · 0 événement clavier |
| 12 | manette : débranchée → pause ; Start → reprise sans capture ; A ferme le calque | pause · reprise sans capture, la partie avance · calque au décompte, A le ferme, le décompte repart, sans saut |
| 13 | roue des provocations : manette et doigt | LB ouvre · 8 directions → 0…7 · caméra immobile · LB relâché → 5 · jamais `game.wheel` · doigt : appui long ouvre, glissé bas-droite → 3, levé → 3, bref → 8 (la dernière) |

## À F2 (tests `apresFusion`, lancés avec `&fusion=1`)

Joués ici sur le squelette pour vérifier qu'ils tournent sans exception (`&fusion=1`, `?tel=1`) : « aide à la visée sur les
vrais bustes » passe déjà (0,7 centré ; tir auto : 4 touches) ; les quatre autres échouent comme prévu sans les vrais
modules — les écrans de L-U (« null → null » : le squelette lance la partie au lieu d'ouvrir les réglages), la vraie
glissade et le vrai sprint tactique de L-B (6,2 m/s, glisse 0), le verrou de L3 de `lireCommande` (L-B), la roue dessinée
par L-G (0 secteur en surbrillance). F2 : les rejouer après L-B, L-G et L-U ; ✋ une manche à la manette seule (critère
« À F2 » du § 5.5.13) — la manette simulée des tests ne remplace pas une vraie manette dans les mains.

## Doutes

- **La roue de L-G** : le test F2 cherche dans `#hud` un conteneur `.roue-provocations` (ou une classe « roue ») et un
  secteur marqué (`choix`, `on` ou `aria-selected`) ; si L-G marque autrement, ajuster le sélecteur du test (pas le jeu).
- **`--tc-droite` en partie** (≈ 247 px à 812 × 375) : la grappe de tir est plus large que celle de la balade ; le HUD de
  L-G pose les munitions à sa gauche — à regarder ensemble à F2 sur un vrai téléphone.
- **Le pouce gauche et le tir auto** : au téléphone, `tirAuto` est vrai par défaut ; un prop resté humain est une cible (il
  est visiblement un humain), un prop déguisé jamais.

## Photos regardées

Dans le navigateur intégré (émulation 812 × 375, réduite dans le panneau) : l'essai au hall (TIR rouge sous le pouce, SAUT
et ACCROUPI au bord, VISER en bas, P-17 à gauche de TIR, RECHARGER au-dessus, GRENADE / FLASH / COUTEAU en haut à droite, II
et SCORES en haut à gauche, rien sur le joystick) ; le prop hunt à la pause du 1er (DÉGUISER vert, PROVOQUER, SAUT ; puis
déguisé : FIGER, VERROU — Haythem en carton de secours au sol). Captures du panneau :
`C:/Users/hgami/.claude/projects/C--/d2516763-f01d-443a-9d38-fe9a0c124e7f/tool-results/mcp-Claude_Browser-blob-1792727346006-f1ge6d.png`
(combat) et `…-1792727523334-36wiyb.png` (prop déguisé).

## Ce qui reste

Rien pour L-I. À F2 : les cinq tests `apresFusion`, les demandes ci-dessus, et la partie entière au doigt sur un vrai
téléphone (§ 6.2 ✋).

## Relecture (relecteur sévère, 23/10/2026)

Relu : le diff complet `socle...lot/L-I` (7 fichiers), contre §§ 3.2, 3.6, 4.1, 4.5.18, 4.6, 4.8, 5.1, 5.5.13 ;
`python -I tools/verifier_proprietaires.py lot/L-I` → OK 7 fichiers.

### Défauts trouvés et corrigés (commits `L-I relecture : …`)

1. **Tir auto et armes semi-automatiques** (`js/jeu/assistance_visee.js`) : le tir auto TENAIT `cmd.tir` ; le P-17, le
   FP-12 et le TP-50 ne partent qu'au front de la gâchette (`Arsenal.pas`, tampon 0,1 s) — une seule balle partait, puis
   plus rien, le réticule posé sur l'ennemi (au téléphone, l'arme de poing devenait inutilisable). Le tir auto bat
   maintenant la gâchette d'une semi-automatique un pas sur deux (la cadence de l'arme reste la seule limite) ; le doigt
   qui tient TIR garde la main. Test 3 (f) : P-17, 4 balles en 0,62 s à 400 coups/min (1 avant).
