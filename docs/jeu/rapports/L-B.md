# Rapport L-B — mouvement et caméras (vague 2)

Branche `lot/L-B` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-B`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8132 ;
23/10/2026. Spec : `docs/jeu/spec_finale.md` § 5.5.2 (lot L-B), contrats § 4.5.7, valeurs §§ 3.1-3.2.

## Où j'en suis

**EN COURS — étape 6 : le code des quatre modules et les tests des 19 critères sont écrits et commités ; il reste à les
jouer au navigateur (jeton) : `&rapport=1&lot=L-B`, `&lot=S0`, la passe de mesure du franchissement (critère 7 :
`await __jeu.mesuresFranchir()` puis les coordonnées recopiées dans `OBSTACLES` / `RANGS_SERRES` du test).**

Pour un repreneur : serveur `python serve.py 8132` dans l'arbre, prendre un jeton (`mkdir …/_navigateur/jeton_N`), ouvrir
`http://127.0.0.1:8132/?test=1`, puis dans la console `await __jeu.chargerTests('L-B'); await __jeu.tests('L-B', '7')` (le
2e argument filtre les tests dont le nom commence par lui).

Plan (une étape = un commit testé) :
1. `mouvement.js` : allures, sprint tactique, endurance des chasseurs, glissade, saut borné en vol, réception,
   franchissement, accroupi, œil lissé (escaliers, bordures), pas, contacts. — écrit
2. `entrees_jeu.js` : bascules, double Maj / SOURIS 5, verrou de sprint (manette, doigt), souffle du TP-50, recul. — écrit
3. `vue_fps.js` : pose directe, balancement, roulis, champ, visée à focale constante, recul visuel, caméra de mort,
   impulsion, secousse, plafond. — écrit
4. `camera_orbite.js` : chiffres du prop, collisions, plafond, `damp(14)`. — écrit
5. `tests/test_mouvement.js` : les 19 critères (+ 4 tests « À F2 » en `apresFusion`). — écrit
6. Navigateur (jeton) : `&rapport=1&lot=L-B`, `&lot=S0`, jeu à la main, photos. — à faire

## Fait

- `python -I tools/verifier_proprietaires.py lot/L-B` → `OK 6 fichiers (lot/L-B, L-B, base socle)`.

## Écarts au document

1. **Les bordures et les volées** (§ 3.1 l. 330-331 : « sauts de sol lissés en montée (amortisseur critique 0,08 s) ET en
   descente (0,06 s) » ; critère 8, l. 2322-2325). Deux amortisseurs critiques dans le temps retardent l'œil sur une volée
   (écart à la pente de plusieurs cm à 5-6,6 m/s, contre ≤ 1 cm exigé) et ne savent pas adoucir la CASSURE au pied et au
   palier d'une volée (la dérivée seconde y vaut 4 à 8 cm par image, contre ≤ 1 cm). L'œil de l'acteur local suit donc la
   MOYENNE DU SOL sous une fenêtre carrée centrée sur les pieds, alignée sur les axes du monde (volées, dalles et bordures de
   l'école le sont toutes), en TRAPÈZE (pleine sur 1,2 m, adoucie sur 0,4 m de chaque bord : une moyenne de 1,6 m passée dans
   une de 0,4 m), échantillonnée tous les 4 cm le long de x et de z (x-moyenne + z-moyenne − centre) ; près d'une volée, seule
   la ligne de son axe ; le long d'une ligne, un échantillon n'est gardé que s'il CONTINUE le sol du précédent (au plus 0,8 m/m
   et un saut de 0,13 m), sinon la ligne garde le dernier sol vu (au-delà d'un mur, d'un bord de dalle, d'une volée empilée).
   Au milieu d'une volée l'œil suit la pente exacte, la cassure devient un arrondi, une bordure de 0,12 m une montée douce
   (≈ 0,3 s en course, au lieu de 0,08 / 0,06 s). La fenêtre ne dépend ni de la vitesse ni de la direction : les deux premières
   versions (le long de la vitesse, de longueur ∝ v) faisaient sauter l'œil au départ, à l'arrêt contre un mur et à travers
   les murs (jusqu'à 96 cm de dérivée seconde mesurés) ; en contrepartie, arrêté au bord d'une volée, l'œil est jusqu'à ≈ 15 cm
   sous sa hauteur (l'arrondi de la cassure). C'est un calcul de la simulation (déterministe, 120 Hz, l'acteur local
   seulement : ≈ 100 `solEn` par pas), interpolé à l'image par `VueFPS`. Mesuré (critère 8) : 9 volées, montée et descente,
   course et sprint, pire dérivée seconde 0,85 cm par image, écart à la pente au milieu 0,54 cm. Un arrêt NET contre un mur à
   6,6 m/s arrête aussi net la montée de l'œil (≈ 1,2 cm) : le test mesure tant que la course n'est pas cassée.
2. **La sensibilité en visée** (§ 3.2, critère 12) : `Partie.souris()` (js/jeu/partie.js, au socle — puis L-Q) lit encore
   `sensVisee` seul ; le commentaire du socle la laisse à L-B. `VueFPS.entrer` pose donc sur l'INSTANCE de la partie
   `partie.souris = () => vue.souris()` (tan(champV_ADS/2) / tan(champV_hanche/2) × sensVisee, à la visée courante), retiré
   par `VueFPS.sortir`. Demande à F2 ci-dessous.
3. **La vitesse en visée et la mobilité** (§ 3.1) : les allures course, sprint, tactique, accroupi, accroupi visé sont
   × la mobilité de l'arme en main ; la visée prend la valeur de l'ARME dans la table du § 3.1 (FA-24 2,40, PM-9 2,90…),
   sans × mobilité (la table donne déjà une vitesse par arme) ; la marche reste plafonnée à 2,15 (le clip, `player.js:695`).
   Les deux s'interpolent par la part de visée de l'arsenal et par l'accroupi.
4. **La commande retouchée par le mouvement** : pendant que la visée est interdite (0,35 s de glissade, 0,1 s après un
   décollage, tout le franchissement), `appliquerCommande` met `cmd.visee` à faux, et `cmd.tir` pendant un franchissement :
   l'arsenal (étape 6) les lit après le déplacement (étape 3). L'arsenal de L-A refait déjà ces règles de son côté
   (`envol`, `glT`, `acteur.franchit`) : sans conflit.
5. **Les contacts avec un prop** (§ 3.1 l. 334-340 « poussée partagée à moitié ») : un prop DÉGUISÉ (`CorpsProp`) n'est pas
   poussé par un humain (« on se cogne à une poubelle-prop comme à la vraie poubelle » ; un chasseur qui bousculerait un
   meuble saurait) — l'humain prend toute la correction ; entre deux humains, ou deux props, moitié-moitié. Le corps poussé
   perd la vitesse qui rentrait dans l'autre (comme contre un mur) : sans cela un sprint s'enfonce de 2 à 4 cm par pas, la
   poussée étant bornée à 0,05 m.
6. **La gravité** : `Player.simuler` (L-C) intègre le saut par Euler semi-implicite (apogée 0,4926 m) ; `appliquerCommande`
   lui rend g·dt²/2 d'avance à chaque pas en l'air : la parabole exacte, apogée 0,5057 m, 0,642 s (critère 3).
7. **Ajouts aux contrats** (règle 3 : ajouts seulement) : sur l'acteur, `allure`, `franchit`, `sprintTactique` (les deux
   derniers sont les noms que l'arsenal de L-A lit déjà) et `mvt` (sprint tactique en cours, épuisement, glissade,
   franchissement, minuteries, œil lissé) ; dans `etatArme()`, `franchit`, `reception`, `phase`, `frequence`,
   `balancement`, `allure`, `lateral`, `lunette`, `souffle` ; `VueFPS.souris()`, `VueFPS.champHanche`,
   `VueFPS.champVPour()`, `CameraOrbite.chiffresProp()`, `CameraOrbite.champ()` ; exports `VISEE_PAR_ARME`, `SPRINT_TACT`,
   `ENDURANCE`, `GLISSADE`, `ACCROUPI`, `SAUT`, `RECEPTION`, `FRANCHIR`, `PAS_ACTEUR`, `CONTACTS`, `OEIL_LISSE`, `penteEn`,
   `mobilite`, `solLisse` (mouvement.js), `ENTREES`, `etatEntrees` (entrees_jeu.js), `VUE` (vue_fps.js), `ORBITE`.
8. **Les chiffres du prop** (§ 4.5.7) : `Partie.camera` / `PartieProp.camera` passent des chiffres de squelette (2,4 m / 1,0) ;
   `CameraOrbite` reconnaît le corps d'un prop déguisé et prend les siens (pivot max(0,5 ; 0,75 h), bras
   clamp(1,4 + 1,6·max(l, h, p), 2,0, 3,6)) quoi que demande l'appelant.
9. **La caméra de mort** : roulis de 25° d'un côté ou de l'autre (selon les ids), la vue qui se tourne vers le tueur après
   0,3 s ; la désaturation et le son étouffé (§ 3.6) sont à l'affichage (L-H / L-G), pas à la caméra.
10. **Tests en « terrain libre »** : les allures longues (sprint tactique 4,5 s = 35 m, sprint limité 4 s) ne tiennent dans
    aucune pièce : les critères 2, 4, 5, 6, 9, 13, 14, 19 se jouent loin de l'école, `Player.collisions` coupé le temps du
    test (rendu dans un `finally`). Le critère 1 se joue bien sur le plateau du hall (ligne libre de 9 m cherchée).

## Demandes

- **F2** : `Partie.souris()` → `return this.vue && this.vue.souris ? this.vue.souris() : …` (et retirer la pose sur
  l'instance faite par `VueFPS.entrer`).
- **F2 (état, § 4.7)** : le sprint tactique EN COURS et l'épuisement d'un chasseur (`acteur.mvt.tact`, `.epuise`) ne sont pas
  dans l'état : après `appliquer`, un sprint tactique repart en sprint, un chasseur épuisé peut resprinter avant 20.
  Sans effet en solo ; à ajouter (`tA`, `ep`) avant le réseau.
- **L-A** : la sortie de sprint peut lire `acteur.mvt.sprintFinT` (l'heure de la fin du dernier sprint) ;
  `acteur.sprintTactique`, `acteur.franchit` sont posés à chaque pas ; la glissade passe `Player.move(…, false)` (pas de
  drapeau `sprinting` : on tire en glissade, hanche × 1,3 par `acteur.glisse`).
- **L-C** : pendant un franchissement, les PIEDS sont soulevés (`pos.y` = sol + levée, jusqu'à h + 6 cm), `jumpY` reste à 0 :
  la pose suit `posAff`.
- **L-V** : `etatArme()` porte en plus `franchit` (0..1), `reception` (le creux de la caméra, m), `phase` / `frequence` du pas,
  `lateral` (m/s), `lunette` (0..1, à partir de 85 % de visée du TP-50), `souffle`.
- **L-D** : un front `saut` du `Pilote` sur un lien « franchir » déclenche le franchissement si `franchissable` rend une
  arrivée dans la direction de la COMMANDE (l'axe tourné du lacet ; à l'arrêt, le regard).
- **L-I** : le front montant de `input.touchSprint` (le joystick au-delà du bord) lance le sprint tactique s'il est prêt.

## Doutes

## Reste
