# Rapport L-I — tactile, manette, assistance (vague 2)

Branche `lot/L-I` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-I`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8143 ;
23/10/2026. Spécification : `docs/jeu/spec_finale.md` §§ 3.2, 4.5.18, 5.5.13 (et §§ 4.8, 6.2, 6.3).

## Où j'en suis

**EN COURS — étape 6 : le code et les tests sont écrits et commités, PAS ENCORE JOUÉS au navigateur** (les trois jetons
étaient pris : L-C, L-K, L-G ; attente en cours, serveur prêt sur 8143). `python -I tools/verifier_proprietaires.py lot/L-I`
→ OK. Un repreneur : prendre un jeton (§ 5.1 règle 3), ouvrir `http://127.0.0.1:8143/?test=1&rapport=1&lot=L-I` (PC) puis
la même adresse avec `&tel=1` sous l'émulation mobile (812 × 375), corriger ce qui échoue, puis `&lot=S0` (PC et tel),
jouer pour de vrai (une partie au doigt, une à la manette simulée), rendre le jeton, finir ce rapport.

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
   bouton muet jusqu'au relâchement ; L3 VERROUILLE le sprint tant que le stick gauche pousse vers l'avant (2e appui < 0,30 s
   = sprint tactique ; tirer, viser, stick lâché ou tiré en arrière le rendent) ; vibrations sur ÉVÉNEMENTS de la partie
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
4. **L3 verrouillé à la manette** (§ 4.8 dit seulement « L3 (double) ») : le sprint d'un jeu de tir à la manette se
   verrouille d'un clic (tenir L3 en visant du pouce gauche est intenable) ; le double appui reste le sprint tactique.
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
