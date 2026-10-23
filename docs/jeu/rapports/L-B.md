# Rapport L-B — mouvement et caméras (vague 2)

Branche `lot/L-B` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-B`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8132 ;
23/10/2026. Spec : `docs/jeu/spec_finale.md` § 5.5.2 (lot L-B), contrats § 4.5.7, valeurs §§ 3.1-3.2.

## Où j'en suis

**PRESQUE FINI (23/10, 04:52) — reste à rejouer `&rapport=1&lot=L-B` après 754a71d (les sauts sous linteaux du critère 3
mis en fonction, `sautsPortes`, pour le test « À F2 » des 20 portes ; aucun code du jeu changé), jeton attendu.** Avant
754a71d, les 19 critères passaient au navigateur (`&rapport=1&lot=L-B` : `ok`, 19/19, aussi en profil
téléphone `&tel=1`), `&rapport=1&lot=S0` passe ENCORE sur la branche (29/29), `verifier_proprietaires` passe ; onglet et
serveur fermés, jeton rendu. Restent les 5 tests « À F2 » (`apresFusion`, joués sous `&fusion=1` à l'intégration).

Pour un repreneur : serveur `python serve.py 8132` dans l'arbre, prendre un jeton (`mkdir …/_navigateur/jeton_N`), ouvrir
`http://127.0.0.1:8132/?test=1`, puis dans la console `await __jeu.chargerTests('L-B'); await __jeu.tests('L-B', '7 ')` (le
2e argument filtre les tests dont le nom commence par lui).

Plan (une étape = un commit testé) :
1. `mouvement.js` : allures, sprint tactique, endurance des chasseurs, glissade, saut borné en vol, réception,
   franchissement, accroupi, œil lissé (escaliers, bordures), pas, contacts. — fait
2. `entrees_jeu.js` : bascules, double Maj / SOURIS 5, verrou de sprint (manette, doigt), souffle du TP-50, recul. — fait
3. `vue_fps.js` : pose directe, balancement, roulis, champ, visée à focale constante, recul visuel, caméra de mort,
   impulsion, secousse, plafond. — fait
4. `camera_orbite.js` : chiffres du prop, collisions, plafond, `damp(14)`. — fait
5. `tests/test_mouvement.js` : les 19 critères (+ 5 tests « À F2 » en `apresFusion`). — fait
6. Navigateur (jeton) : `&rapport=1&lot=L-B`, `&lot=S0`, jeu piloté, photos. — fait

## Fait

- `http://127.0.0.1:8132/?test=1&rapport=1&lot=L-B` → `__rapport` : `{ ok: true, total: 19, ms: 33 663, echecs: [],
  signales: [], qualite: 'medium', telephone: false }` ; avec `&tel=1` : `{ ok: true, total: 19, ms: 20 160, telephone: true }`.
- `http://127.0.0.1:8132/?test=1&rapport=1&lot=S0` (sur la branche, après tout le lot) → `{ ok: true, total: 29, ms: 69 689,
  echecs: [], signales: [] }` : balade rejouée au bit près (vue 3 0/0, vue 1 0/0, avant et après les parties), entrées à 0,
  `Partie.pas` 0,068 ms, 0 signature manquante (125 exports), balade fonctionnelle (vues, emote, téléphone, rang de la
  S 1.3, endurance − 11 en 0,5 s, 7 pas programmés).
- `python -I tools/verifier_proprietaires.py lot/L-B` → `OK 6 fichiers (lot/L-B, L-B, base socle)`.
- Fins de ligne : les six fichiers en CRLF (`git ls-files --eol` : `i/crlf w/crlf`), comme au socle.

### Mesures (`__rapport.mesures`, profil PC)

| Critère | Obtenu |
|---|---|
| 1 allures | marche 2,148 · course 4,996 · sprint 6,595 · tactique 7,794 · visée 2,398 · accroupi 2,298 · accroupi visé 1,499 ; course × mobilité : FA-24 4,996, PM-9 5,296, FP-12 4,996, TP-50 4,597, P-17 5,396, couteau 5,496 (ligne du hall, 11,5 ; −6,5) |
| 2 sprint tactique | FA-24 3,008 s à 7,80 puis 6,601 · PM-9 4,5 s à 8,268 puis 6,997 · P-17 4,5 s à 8,424 puis 7,129 · jauge 0,163 refusée / 0,237 acceptée / pleine 1,0 |
| 3 saut | apogée 0,5057 m en 0,65 s · élan 1,59 m/s (attendu 1,59) · 1 935 sauts + 65 franchissements (964 sous plafond bas, 141 270 pas en l'air) : tête 0, tranche 0, refus 0/0 · 16 portes (30 sens) : 40/40 passages, œil dedans 0, tranche 0 |
| 4 réception | 4,999 → 4,25 (× 0,85), encore 4,25 à 0,05 s, puis 4,988 ; 1 événement, chute 0,506 m |
| 5 accroupi | 1,08 à 0,16 s · 1,62 à 0,18 s · monotone · relever refusé sous 1,85 |
| 6 glissade | 6,597 → v0 7,392 (7,392) · 3,468 m en 0,75 s (3,465) · direction 0,017° · recharge refusée puis permise · saut 5,767 → 4,852 (× 0,841) · pente 0,48 : refusée |
| 7 franchissement | 10 obstacles (0,46 à 1,10 m) en 0,383-0,458 s · rangs serrés refusés 5/5 |
| 8 escaliers | 9 volées (−3,06 à 6,6), montée et descente, course et sprint : pire Δ² de l'œil 0,852 cm/image, pire écart à la pente 0,536 cm (2 080 images, 120 au milieu) · plafond 0 · bordure 0,12 m : montée 0,317 s, descente 0,30 s |
| 9 pas | course 0,700 (20 pas) · sprint 0,700 · marche 0,450 (13) · accroupi à 2,3 m/s : 6 pas « accroupi » · accroupi à 1,0 m/s : 0 |
| 10 contacts | 8 au même point : paire la plus proche 0,595 m en 24 pas, dedans 0, traversées 0 · cloison 0,15 : 0 · poubelle-prop 0,45, baby-foot-prop 0,80, prop immobile |
| 11 caméra | écart 2,2e-16 · tangage [−1,48 ; 1,48], prop [−0,7 ; 1,25] · 60 sauts sous plafond bas, 2 400 images, 0 au-dessus |
| 12 souris | 5 585,05 px/tour · kx = ky = 1,125e-3 · pic 0 · visée × 0,80 (0,80) · `sensVisee` 1,3 → × 1,04 (1,04) |
| 13 champ | 58,7155° vertical · 90 → sprint 95 → glissade 93,98 · lissage 95 % en 0,15 s |
| 14 balancement | course 1,0 cm · sprint 1,797 · visée 0,049 (0,0483 à 2,41 m/s) · arrêt 0 |
| 15 pointeur | pause, calque, partie gelée, manette, repli, brut, refus : tout vrai |
| 16 mort | à 0,8 s : roulis −25°, œil 0,4 m · tueur 5,44° puis 0° · flash 1 · aveuglement 0 → 1 → fini |
| 17 recul | caméra plus haute de 5,236e-3 rad, revenue · camPitch −0,01, camYaw −0,002 au pas suivant · la caméra ne touche pas camPitch |
| 18 orbite | 1 000 poses : dedans 0, plafond 0 · bras du carton 2,12 · aucun autre lecteur d'Input · entrées à 0 (balade, essai) |
| 19 sprint limité | 4,008 s puis 5,01 m/s · reprise à 20 · 0 pas tactique · max 6,60 · combattant SOURIS 5 → 7,793 (tactique) |

### Photos regardées (`…/scratchpad/lb/photos/`, 523 × 305, `__jeu.photo`)

`lb_hanche.jpg` (un mannequin dans l'axe, la boîte de l'arme du socle en bas à droite), `lb_visee.jpg` (le même, au zoom
de la FA-24 : champ vertical 48,5°), `lb_sprint.jpg` (la rue à 6,6 m/s, champ 95°), `lb_glissade.jpg` (l'œil bas, 0,9 m,
le champ 93°), `lb_accroupi.jpg`, `lb_volee.jpg` (au milieu de la volée 0 → 1,75 de l'escalier est, en course : la main
courante droite, pas de marche qui saute), `lb_orbite_prop.jpg` (l'orbite du prop dans la rue, le bras entier).

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
11. **Les 20 portes du critère 3** (§ 5.5.2 crit. 3, l. 2312 : « 40 sauts au sprint à travers 20 portes (linteaux
    2,04-2,10 m) »). Sur la branche, l'école n'a que 16 portes PASSABLES sous un linteau de 2,04-2,10 m (les 16 portes
    automatiques et les ouvertures libres du 1er ; les autres portes de cette hauteur sont fermées en balade, et les tables
    de portes du combat sont à L-M, vides au socle). Le test fait donc 40 sauts sur ces 16 portes (30 passages-sens où il y a
    la place de part et d'autre : une fois à 1,5 m du plan — la tête monte sous le linteau —, puis à 0,8 m — l'apogée
    dessous), 40/40 passages ; un test « À F2 » rejoue le compte du document (20 portes, un saut par sens) avec les tables.
    La vitesse de sprint est posée au départ (pas de piste d'élan : les vestibules des toilettes n'en ont pas) ; chaque porte
    automatique est refermée entre deux sauts et s'ouvre devant le sauteur (`majPortes`, à 2,1 m).
12. **Le point d'un pas** (§ 3.1, critère 9) : l'événement `pas` part au pas de simulation où la distance de 0,7 m (0,45 m)
    est atteinte, mais à la POSITION exacte où elle l'est (interpolée dans le pas) : sans cela, à 6,6 m/s (5,5 cm par pas de
    simulation), l'écart entre deux pas variait de ± 8 % ; mesuré 0,700 / 0,450 exactement.
13. **L'œil près d'une bordure** (suite de l'écart 1) : la fenêtre de 1,6 m voit le trottoir à moins de 1 m d'une bordure de
    0,12 m : l'œil y est jusqu'à ≈ 5 cm plus haut que pieds + 1,62 (vu sur la photo `lb_accroupi.jpg`, 1,13 au lieu de 1,08,
    à 0,8 m de la bordure de la rue) ; c'est l'arrondi de la marche, qui monte en 0,3 s au lieu d'un saut. Les critères 5 et
    13 se mesurent loin de toute bordure.

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
- **L-M / F2** : le critère 3 au compte du document (20 portes passables de 2,04-2,10 m) dépend des tables de portes
  (`TABLE_PORTES_FPS` : les portes du combat ouvertes sur les chemins) ; le test « F2 · 40 sauts au sprint à travers 20
  portes » le rejoue sous `&fusion=1`. Une porte ouverte par table doit garder son LINTEAU (la forme au-dessus de
  l'ouverture) et une boîte mince le long du vantail ouvert, hors du passage (sinon `chercherPortes` ne la voit pas libre).
- **F2 (socle)** : `harnais.js` n'a pas de `photo(nom)` qui enregistre : les photos de ce rapport ont été postées par la
  page (`fetch` POST du `toDataURL`) à un petit récepteur local du dossier temporaire. Un `__jeu.photo(nom, { envoyer })`
  vers le serveur du lot éviterait à chaque lot de refaire ce relais.

## Doutes

- L'orbite du prop (photo `lb_orbite_prop.jpg`, essai `prop: true`) : le corps du prop (Haythem « en carton » non déguisé)
  ne se voit pas au pivot ; la caméra est bien à 2,1-2,5 m derrière lui, au-dessus. Le modèle d'un prop non déguisé est à
  L-C / L-F ; à revoir à F2 sur une vraie manche.
- Console sous `?test=1` : « An unknown error occurred when fetching the script » (×12) : l'enregistrement du service
  worker refusé dans le panneau du navigateur intégré (aucun enregistrement actif) ; sans rapport avec le lot, déjà là au
  socle.
- `Partie.camera` / `PartieProp.camera` passent encore des chiffres de squelette (2,4 m / 1,0) : `CameraOrbite` les remplace
  par ceux du prop quand le pivot est le corps d'un prop (écart 8) ; pour un humain suivi (spectateur), ce sont ceux de
  l'appelant (L-Q).

## Reste

- Les 5 tests « À F2 » (`apresFusion`) : 12 balles de FA-24 → camPitch −0,118 rad (L-A), visée au zoom de chaque arme
  (L-A / L-V), pose « franchit » de l'arme de vue (L-V), `separer` avec les vrais `CorpsProp` (L-C / L-F), 40 sauts à
  travers 20 portes (L-M). Rien d'autre pour le lot.
