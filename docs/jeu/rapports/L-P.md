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
