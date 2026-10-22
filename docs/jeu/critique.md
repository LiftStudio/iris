# CRITIQUE SÉVÈRE DE `spec.md` (IRIS : combat + prop hunt), 22/10/2026

Lu : `spec.md` en entier (2 611 lignes), les cinq cartes et les trois conceptions là où la spec s'y appuie. Vérifié dans
le code de `C:/Users/hgami/Downloads/IRIS` (master `a8b22dd`, lecture seule), dans la branche du lot R
(`p-pause-1015-b`, 0e8b3ea, lecture seule) et dans LA CAGE (lecture seule).

**Ce qui tient.** La plupart des lignes citées sont justes, à 1-4 lignes près. Les écarts les plus nets sont dans la
découpe de `Player.update` : `ang` est en l. 1125 et non 1121, le groupe en l. 1127-1135. La découpe
`simuler`/`poser` est faisable sans changer un bit : `ang` n'est lu qu'après, et `animT`/`walkPhase` ne dépendent pas de
l'assise. Les calculs du § 3 sont exacts : temps pour tuer, balles pour tuer, 6,76° du motif de la FA-24, apogée de
0,5057 m en 0,642 s, champ vertical de 58,72°, glissade de 0,46875·v0, grenade à 92,5 à 4,25 m. Le lot R étiquette bien
ses meubles avec `{ type, nom, formes }` (`ecole_soussol.js` l. 1380-1393 de sa branche) et ne touche qu'un fichier. Le
problème est ailleurs : la spec a plusieurs **impossibilités de construction**, des **critères qui échoueront sur le
code d'aujourd'hui**, et des **trous de jouabilité**. Les voici, du plus grave au moins grave. Chaque point donne le
constat avec sa preuve, l'effet, puis la **correction** et qui la fait.

---------------------------------------------------------------------------------------------------------------------

## A. BLOQUANTS : le socle ou la fusion F2 ne passeront pas tels quels

**1. La balade rejouée « au bit près » n'est pas reproductible sur `a8b22dd` lui-même (S0 points 1 et 8, et tout lot
qui rejoue `&lot=S0`).**
Constat : `couches.js:53` tire la phase de respiration au hasard (`this.resp = Math.random()*6.28`) et `couches.js:252-254`
tire le regard errant (`errance`, `erranceT`) au hasard. Ces deux valeurs font bouger l'os `Head`. Or, en vue 1, la
caméra est posée sur cet os (`game.js:1018-1022`). En vue 3, l'os règle `_voitTete` et `_dansLImage`
(`game.js:854-861`, `1094-1097`). Il change donc `_camLibre` et `S.dl`, qui pilotent le cap assisté (`_assistCap`,
`game.js:878-924`). Le cap assisté modifie `camYaw` et `_decalCmd`, qui fixent la direction de marche (`game.js:531`).
Le hasard remonte ainsi jusqu'aux POSITIONS. S'y ajoutent `performance.now()` dans le cap assisté (`game.js:888`, via
`camManuT`) et l'état des couches et des clips, que `placerAuDepart()` ne remet pas à zéro (`game.js:359-375`). Deux
rejeux de `a8b22dd` ne donneront pas le même résultat à 1e-9 près, ni à 1e-6 près pour la caméra.
Effet : le tag `socle-ok` ne tombe jamais, ou un lot est accusé à tort d'avoir cassé la balade.
**Correction (S0, § 4.10.1)** : `rejouerBalade` et `enregistrer_balade.js` font, dans cet ordre :
(a) remplacer `Math.random` par un xorshift semé (graine 1) pendant le rejeu, puis le rendre ;
(b) mettre `u.couches = new Couches(u)`, ou remettre `resp = 0`, `errance = null`, `erranceT = 0`, `fatigue`, `souffle`
et `immobileT` à 0 ; mettre `u.anim?.stop?.(0)`, `u.animKey = null`, `u._clipAvant = undefined`,
`game._cam = null`, `game.camManuT = undefined`, `game._omCap = 0`, et quitter la capture du pointeur ;
(c) **auto-contrôle** : la référence est enregistrée DEUX fois, dans deux onglets frais. Si les deux passes divergent au
delà des seuils, les seuils passent à 1e-6 m pour les positions et 1e-3 pour la caméra, et l'écart est noté.
Le point 1 de S0 ne vaut que si l'auto-contrôle passe.

**2. Le test de convention de caméra (S0 point 6, arbitrage 2) est faux pour le tangage.**
Constat : la vue 1 vise `camPos − (3·sin l, 3,2·sin t, 3·cos l)` (`game.js:1025`). Son élévation vaut donc
atan(1,0667·sin t), pas t. À t = 0,5 on a 27,1° au lieu de 28,6° ; à t = 0,9 (la borne de la balade), 39,9° au lieu
de 51,6°. L'affirmation « le même avant que le lookAt de la vue 1 » n'est vraie que pour le lacet. Sur 200 tirages, le
test échoue presque toujours.
**Correction (S0)** : comparer à la vue 1 seulement l'AZIMUT (≤ 0,1°) et le SIGNE du tangage. Garder la formule
(−sin l·cos t, −sin t, −cos l·cos t) à 0,1° pour `VueFPS`. Corriger la justification de l'arbitrage 2.

**3. Quatorze lots en parallèle dans UN navigateur intégré : les tests d'images et de temps ne tourneront pas.**
Constat : chaque lot ouvre son onglet sur une école entière (§ 5.1 règle 3). Cela fait 14 pages WebGL ou plus. Le
`portraits.js` de LA CAGE ouvre en plus un 2e contexte (point 9). Or Chromium plafonne vers 16 contextes actifs et perd
le plus ancien, ce qui déclenche `hoops-gpu-perdu` (`game.js:275-280`). Il faut ajouter des Go de textures sur la
mémoire partagée de la Radeon 660M. Surtout, un onglet en arrière-plan n'a plus de `requestAnimationFrame` (ou très
ralenti) : `__jeu.images(n)`, `t.images(n)` et « attendre 2 images » restent bloqués jusqu'au délai de 120 s.
**Correction (§ 5.1, S0)** :
(a) une **file d'attente du navigateur** : 3 pages de jeu ouvertes au plus en même temps, un jeton
`scratchpad/jeu/navigateur.lock`, l'onglet fermé entre deux séries de tests ;
(b) le harnais ne dépend jamais de rAF : si `document.hidden` est vrai, `images(n)` appelle `game.frame(1/60)` à la
main, rendu compris, et marque les mesures de temps « non valables » ;
(c) un test S0 qui vérifie que rAF tourne dans un onglet d'arrière-plan du panneau, et qui bascule sinon.

**4. Sous `?test=1`, le son est muet, donc les tests de son sont invérifiables (L-H 5-8, L-F 14, F2 point 2 « son dans
la même image »).**
Constat : `chargement.js:577` lance le jeu sans geste. `audio.init()` crée alors un `AudioContext` suspendu
(`audio.js:18-27`) : `currentTime` reste à 0 et `onended` ne vient jamais. Les voix ne se libèrent pas, et les durées
ou le retard `d/343` ne se mesurent pas.
**Correction (S0, harnais)** : sous `?test=1`, remplacer `audio.ctx` par un `OfflineAudioContext` de 10 s. Les tests
lisent les paramètres programmés (`setValueAtTime` et suivants), pas le temps écoulé. `SonsJeu` libère une voix à
l'heure calculée `quand + durée`, jamais sur `onended`.

---------------------------------------------------------------------------------------------------------------------

## B. MAJEURS : ce qui ne marchera pas dans CE code, ou cassera le jeu

**5. L'aide de la balade reste plantée au milieu de l'écran pendant toute la partie.**
Constat : `lancerPartie` appelle `this.enterLobby()` (§ 4.4). Or `enterLobby` écrit l'aide des touches
(`hud.hint(lobbyHint())`, `_aideT = 14`, `game.js:385`) et le bandeau « IRIS — REZ-DE-CHAUSSÉE » (`game.js:382`). Seul
`update()` fait baisser `_aideT`, et en partie il rend la main tout de suite. Le texte « souris = caméra · C = vue … P =
téléphone » reste donc affiché (`#hud-hint`, `.hint` à 34 % de la hauteur, `style.css:154`). `body.combat` ne le cache
pas. `main.js:74` (`hoops-entree`) et `applySettings` (`game.js:304`, `setLobby`) le font aussi revenir.
**Correction (S0)** :
(a) `lancerPartie` appelle `enterLobby({ aide: false })` : pas de `hint`, pas de `feedback`, `_aideT = 0` ;
(b) `body.combat` cache aussi `#hud-hint` et `#hud-streak` ;
(c) prises `main.js:74` et `game.js:304` gardées par `&& !game.partie` ;
(d) nouveau test S0 : `#hud-hint` vide pendant 10 s d'essai, puis après une bascule manette ↔ clavier.

**6. `appliquerProfil()` vide les entrées à chaque changement de réglage, en plein combat.**
Constat : la prise de `game.js:302` remplace `setBindings` par `appliquerProfil()`, qui appelle `input.purger()`. Or
`applySettings` tourne à chaque `settings.set` (`main.js:56`). La baisse automatique de qualité en fait un en pleine
manche (`game.js:172-176`). Un saut, une recharge ou une grenade tapés à ce moment-là sont perdus. Et `main.js:56` remet
`game.wheel.setList(roueEmotes())`, ce qui efface la roue des provocations (point 7).
**Correction (S0)** : `appliquerProfil({ purger = false })`. On ne vide les entrées qu'à l'entrée en partie, à la
sortie et au changement de rôle. `applySettings` relie les touches du profil EN COURS sans rien vider. `main.js:56` ne
touche à la roue que hors partie.

**7. La roue des provocations ne peut pas être la roue des emotes (`game.wheel`, arbitrage implicite § 4.5.14).**
Constat :
- un clic sur un secteur appelle `onPick = doEmote` (`game.js:179`, `ui.js:345`) sur le Haythem garé ;
- le centre affiche « EMOTES » (`ui.js:355`) ;
- la sélection à la souris lit `clientX/clientY` (`ui.js:320-325`), qui ne bougent plus quand le pointeur est capturé :
  on ne choisit rien à la souris ;
- `main.js:56` remet les emotes à chaque réglage.
Enfin, les chiffres 1-8 ne sont liés à aucune action du profil PROP. La purge de `endFrame` (§ 4.4) les efface donc sur
toute image sans pas de simulation (≈ 17 % des images à 144 Hz, la moitié à 240 Hz) : la provocation est perdue.
**Correction** :
- L-G (`hud_prop.js`) crée une `RoueProvocations` à elle, en DOM sous `#hud`. On choisit en cumulant `movementX/Y`
  pendant que T est tenu, aux chiffres, ou au stick droit. `lireExtra` lit son état. `game.wheel` n'est jamais touchée
  en partie.
- S0 ajoute à `ACTIONS_PROP` les actions `provoc1` à `provoc8` (Digit1-8), pour que leurs fronts survivent.

**8. La grenade flash est invisible en Basse et seulement grisante ailleurs.**
Constat : `fx.flash` perd 3,5 par seconde (`fx.js:2017`) et n'est appliqué qu'à 35 %, en addition après l'étalonnage
(`fx.js:2018`, `fx.js:165`, `options_rendu.js:241`). « Tenu à 1 », il donne au mieux un voile gris à +0,35. En Basse,
`fx.enabled = false` (`fx.js:834`) : pas d'étalonnage, donc rien.
**Correction (L-G, L-B)** : un calque DOM `#voile-flash` blanc, au-dessus du HUD et sous la pause. Opacité 1 pendant
`durée − 0,6` s, puis fondu de 0,6 s. `VueFPS` le commande sur l'événement `flash`. `fx.flash` reste en appoint. Le
test 16 de L-B mesure ce calque.

**9. La capture du pointeur casse le tir, la reprise et la manette (§ 4.4 `input.js`, § 2.9, S0 point 13).**
Constat :
(a) La prise de `input.js` enregistre `Souris:0` « si le pointeur est capturé OU si la cible est le canvas ». Le clic
qui capture vise justement le canvas : il tire. Cela contredit `clicDeCapture: 0`.
(b) Échap et les boutons de manette ne donnent pas d'« activation utilisateur ». Reprendre par Échap, Start ou au
doigt ne peut donc pas recapturer, et la règle « refusée → on RESTE en pause » bloque la manette et le tactile en
pause pour toujours.
(c) Après LANCER viennent au plus 4 s de préparation et 3 s de présentation : l'activation du clic a expiré, la
première capture est refusée.
**Correction (S0, L-B)** :
(a) en partie, `Souris:*` seulement si `document.pointerLockElement === canvas` au moment du `mousedown`, et 150 ms
ignorées après chaque capture ;
(b) on n'exige la capture pour reprendre que si la dernière entrée est clavier ou souris (`!entree.manette && !IS_TOUCH`) ;
(c) au GO et à toute reprise sans capture, un calque « CLIQUE POUR JOUER » : le décompte attend ce clic, la manette et
le doigt passent outre ;
(d) S0 point 13 complété par : manette → reprise sans capture.

**10. En combat, les portes « ouvertes à demeure » ont un vantail visible mais traversable.**
Constat : `forcer(P, 1)` pose les vantaux comme `maj` à `ANGLE_AUTO = 1,45 rad` (83°, `ecole_portes.js:296`), en
travers du couloir, avec `forme.off = true` (`ecole_portes.js:606`). Seul l'état `'ouverte'` construit une boîte mince
le long du vantail ouvert (`ecole_portes.js:543-548`) ; une porte `'auto'` ouverte n'en a aucune. Balles, bots et
joueurs passent donc au travers d'une porte qu'on voit, et se « couvrir » derrière elle ne sert à rien.
**Correction (L-M)** : `preparerSession` ajoute, pour chaque porte 'auto' marquée « ouverte » dans `TABLE_PORTES_FPS`,
une boîte orientée mince le long du vantail ouvert (même calcul que l. 546-548, `off` vrai hors partie). L-D la compte
dans l'empreinte du graphe : elle est allumée pendant la génération. Tests : L-M, 20 balles dans des vantaux ouverts,
20 arrêtées ; F2 point 5, 0 traversée de vantail.

**11. Le miroir de l'accueil coûte jusqu'à +8 ms au cœur du combat (le hall, le point A de la Domination, le chemin
des SISR).**
Constat : le miroir redessine le décor dès que la caméra a bougé de 25 cm, soit environ 150 appels et 8-9 ms sur la
660M, au plus une image sur deux (`ecole_hall.js:1027-1063` et son commentaire). Une vue FPS au sprint bouge de 11 cm
par image : il se redessine sans arrêt. La spec n'en parle pas.
**Correction (L-M)** : `MondePartie.entrer` met `__miroirAccueil.etat.coupe = true` (la glace peinte), à joindre par le
retour de la carte, et `sortir` le rend. `instantane()` l'inclut. INT mesure les 11 endroits AVEC la glace à l'écran.

**12. `separer` fait traverser les murs et bloque les bots dans les volées étroites.**
Constat : la poussée est écrite « sur `pos`, après le déplacement », sans passer par le monde solide (§ 3.1). Or
`collisions.js` ne garantit l'absence de traversée que par des sous-pas de r/2 (`collisions.js:23-26`). Une poussée
de 0,3 m contre une cloison de 15 cm envoie le centre au-delà du milieu : il ressort DE L'AUTRE CÔTÉ. Le test 10 de
L-B (8 acteurs au même point, séparés en UN pas) force justement de grosses poussées. Dans la volée de tôle (0,85 m),
deux bots face à face se bloquent.
**Correction (L-B, L-D)** :
- la poussée passe par `C.deplacer(pos, dx, dz, r, null, pieds)` et vaut au plus 0,05 m par pas ;
- test 10 : « après 0,2 s, aucune paire à < 0,59 m, 0 dans une forme, 0 traversée » ;
- `Pilote` : quand deux bots se font face là où le dégagement est sous 0,6 m, celui de plus petit `id` recule vers le
  nœud le plus proche dégagé à 0,75 m ou plus.

**13. Le saut est borné au décollage, pas pendant le vol (§ 3.1, L-B test 3).**
Constat : avec l'élan gardé, on parcourt jusqu'à 5 m pendant 0,64 s. Sous un linteau (2,04-2,10 m, carte_monde § 9) ou
le plafond de 2,2-2,4 m du hall ouest, le haut du corps simulé (`pieds + jumpY + 1,6`, `collisions.js:59`) heurte la
boîte du linteau : un mur invisible devant chaque porte quand on saute. Et la tête passe à moins de 5 cm du plafond :
le test 3 échoue.
**Correction (L-B)** : à chaque pas en l'air, `plaf = C.plafondEn(x, z, pieds)`. Si
`pieds + jumpY + 1,73 + 0,05 > plaf`, alors `jumpY = plaf − pieds − 1,78` et `jumpVel = min(0, jumpVel)` (on se cogne).
En l'air, passer `haut = 1,35` à `C.deplacer` : la tête rentre, et un saut passe sous un linteau à 2,04 m.

**14. La zone de repli `e2` du prop hunt viole la règle qui la désigne (§ 3.9, § 2.2, R5, L-F, L-U 5).**
Constat : le § 3.9 lui-même ne donne au 2e que **3** types déguisables (chaises en écusson, chaises visiteur,
extincteurs), comme carte_props § 2. La règle « moins de 6 types → grisé » griserait donc aussi `e2`. L-F règle tout le
prop hunt sur une zone où tout le monde est une chaise.
**Correction (S0, L-F, L-U)** : repli sur `e1` (≈ 10 types : mange-debout, Miura, coques noires, distributeurs, hêtre de
la S 1.3, Kahn, extincteur, plantes, fauteuil), puis `rdc`. Zone de test de L-F = `e1`. Le défaut `jeu.prop.zone` est
calculé au lancement (`ss` si 6 types ou plus, sinon `e1`).

**15. Les cachettes les plus crédibles sont hors d'atteinte : le prop hunt sera bête.**
Constat : les collisions des vrais meubles sont GROUPÉES. Par exemple, les 5 chaises coques nord de la salle d'attente
tiennent dans UNE boîte de 6,45-9,95 × 7,12-7,79, haute de 0,8 m (`ecole_mobilier.js:186`). Les chaises de la S 1.3
sont rentrées sous les tables, et les rangs sont pleins au rayon de 0,3 m. « Une chaise coque dans sa rangée »
(crédibilité ≥ 0,8, test 7 de L-K) se trouve dans une forme : `deguiser` et `CorpsProp` la refusent. Les props bots
cherchent leur chemin sur le graphe des chasseurs (rayon 0,3), donc aucune niche. Ils finissent au milieu des pièces,
trouvés en un coup d'œil.
**Correction (L-K, L-D)** :
- un 2e graphe au rayon des props (0,2), la variante de carte_monde § 10.1 ;
- `cachettes()` ne garde que les poses `C.libre` au rayon et dans la bande du type, et atteignables sur ce graphe :
  bouts de rangée, contre une table, contre un mur ;
- les cas du test 7 de L-K sont choisis parmi ces poses ;
- nouveau test de L-K : au moins 70 % des cachettes de crédibilité ≥ 0,6 atteignables, 5 photos au rapport.

**16. Un registre incomplet crée des « tests gratuits » et des indices.**
Constat : de vrais exemplaires d'un type déguisable restent sans étiquette. Exemples : les extincteurs de
`ecole_est.js`, `ecole_ascenseur.js` et `carte_ecole.js` (hall ouest), selon carte_props § 2. `ecole_est.js` n'a d'ailleurs
aucun propriétaire en vague 2. Tirer sur l'un d'eux ne coûte rien et laisse un impact sur le mur derrière : un indice et
un abus. De plus, la chaise coque porte DÉJÀ son voile au sol (`ecole_mobilier.js:122-123`), copié avec elle ; le voile
de L-K le doublerait et assombrirait le faux meuble.
**Correction (L-K)** :
- `verifierMeubles()` rend aussi `nonEtiquetes` : les maillages de même géométrie qu'un prototype mais absents du
  registre. Un type qui en a dans une zone y passe `deguisable: false` ;
- `ecole_est.js`, `ecole_soussol_est.js` et `ecole_rdc_centre.js` sont donnés à L-K pour les étiquettes ;
- pas de voile ajouté aux types qui en ont un (`voileIntegre`).

**17. Les bots voient à travers le verre dépoli : « sans tricher » est faux.**
Constat : `vue()` rend transparentes toutes les formes `vitre`. Or ces 51 formes comptent les jours DÉPOLIS et des
cloisons (carte_monde § 9.7). Un bot repère et abat Haythem à travers un verre que Haythem, lui, ne peut pas percer
du regard.
**Correction (L-M, L-A)** : un drapeau `depoli: true` sur ces formes, pris dans une table de positions de
`monde_partie.js` à `preparerSession`. `vue()` s'y arrête ; `balle()` le traverse à 80 % des dégâts. L-J test 1 :
0 perception à travers une forme dépolie.

**18. Le pré-filtre de visibilité « jamais faux » n'est testé que dans un sens.**
Constat : `zonesCachees & zoneDe` est réglé pour le RENDU vu de la caméra (`ecole_visibilite.js:336` et suivantes). On
teste « 0 vue à travers un mur », jamais l'inverse : un faux négatif ferait que Haythem voit le bot sans que le bot le
voie.
**Correction (L-A, F2)** : sur 10 000 paires de nœuds que le DDA brut dit visibles, le pré-filtre doit répondre « peut-
être visible » 100 fois sur 100. Sinon, on ne s'en sert pas pour les paires de zones fautives (une table d'exceptions).

**19. « Jouable à la fin de F2 » (§ 5.9) est faux avec le cerveau minimal du socle.**
Constat : le cerveau minimal « va vers l'ennemi vu le plus proche, rafale par seconde », avec une rotation bornée et
sans erreur de visée (§ 4.5.11). Sans ennemi vu, il ne fait rien : en 4 c. 4 sur toute l'école, les départs sont à
41-51 m et personne ne se rencontre. Quand il voit, il vise comme un laser. Et le `CerveauChasseur` minimal, qui est le
cerveau de combat, prend pour cible les acteurs props EN TANT QUE TELS : c'est une triche.
**Correction (S0)** :
- le cerveau minimal = `Errant` vers le point chaud ou le départ adverse tant qu'il ne perçoit rien ;
- visée avec l'erreur gaussienne σ∞ de la difficulté et une réaction de 0,45 s ;
- le `CerveauChasseur` minimal ne lit jamais `role` : un tir de test toutes les 8 s sur une pose, vraie ou fausse, à
  moins de 10 m.

**20. L'ordre de résolution des tirs donne tous les échanges à Haythem.**
Constat : les tirs sont résolus « TOUT DE SUITE », acteur par acteur, à l'étape 6 (§ 4.3.2), et Haythem est l'acteur 0.
Si deux tirs mortels partent au même pas, le bot touché le premier ne tire jamais : aucun échange de tirs, et
l'impression de bots « lents ».
**Correction (S0, `Partie.pas`)** : l'étape 6 rassemble tous les tirs du pas à partir des états d'avant le pas (le tir
d'un acteur tué pendant ce pas compte encore), puis applique les `infliger`.

**21. On ne distingue pas les alliés des ennemis avec les réglages par défaut.**
Constat : par défaut, aucun avatar d'ami n'est coché, donc 8 clones de Haythem (R24, `jeu.combat.avatars: []`).
Seules les tenues les distinguent, teintées à 35 % avec un brassard (§ 4.5.10). Au-delà de 15 m, dans un couloir
sombre, on ne sait pas qui est qui. La plaque de nom n'apparaît qu'au réticule.
**Correction (L-G, L-C)** :
- un chevron bleu PERMANENT au-dessus de chaque allié, en DOM, 4 au plus, vu à travers les murs (comme dans CoD) ;
- tenue teintée à 60 %, brassard large de la couleur d'équipe ;
- test : 10 photos à 10, 20 et 30 m, équipe reconnaissable sur toutes.

**22. Il manque des propriétaires en vague 3, et une règle bloque L-U.**
Constat :
(a) L-P doit afficher les armes au sol, la sentinelle et le drone. Mais `armes_au_sol.js` et `series.js` sont des
fichiers de « simulation », qui n'ont pas le droit d'importer l'affichage, et l'affichage du monde (`effets.js`) est à
L-Q. Personne ne peut construire ces maillages.
(b) « Arme qui tourne dans la scène de l'arme de vue » : `viewmodel.js` est à L-Q, et `Light(` est interdit ailleurs.
(c) L-U doit copier `portraits.js` de LA CAGE, qui crée une HÉMISPHÈRE et trois DIRECTIONNELLES dans son propre
contexte WebGL (LA CAGE `js/portraits.js:35-45`). Le contrôle « `Light(` dans `js/jeu/` hors `viewmodel.js` » le
refuse : L-U ne peut pas finir.
**Correction (§ 4.2, § 5.2, `proprietaires.json`)** :
- un fichier d'affichage `js/jeu/aff_progression.js` à L-P ;
- une méthode `Viewmodel.vitrine(id)` posée par F2 avant la vague 3 ;
- `portraits.js` exempté de la règle `Light(` (scène et contexte à lui), ou mieux, au point 23.

**23. Les portraits chargent les avatars des amis au MENU, ouvrent un 2e contexte WebGL et relancent la cuisson du sol.**
Constat : le copier de LA CAGE ouvre un `WebGLRenderer` de plus et son propre `new GLTFLoader()`, lié au gestionnaire
par défaut (LA CAGE `portraits.js:35-46`). Or L-U doit montrer les « 6 avatars cochables avec portrait » au menu
(L-U test 4) :
- les GLB des amis se chargent donc avant toute partie, contre « rien de plus au démarrage » et « avatars à la
  préparation seulement » (§ 6.5) ;
- moins de 30 s après la construction, `DefaultLoadingManager.onLoad` relance la cuisson de l'ombre du sol
  (`kit_decor.js:441-452`) ;
- au premier Tab d'une manche, chaque portrait pas encore en cache fige l'image (150 ms × 6).
**Correction (L-U)** : des portraits PRÉCALCULÉS une fois (`assets/portraits/<id>.webp`, faits par un outil sur le
moteur de portraits de LA CAGE), sans contexte WebGL en jeu. À défaut, les rendre à la préparation avec le moteur
principal dans une cible de rendu, et un chargeur à gestionnaire séparé.

**24. Le lot R casse les tables figées : portes, zones de jeu, point B.**
Constat : le lot R réécrit le −1 (+662/−326 lignes dans `ecole_soussol.js`, portes décalées en l. 845 de sa branche).
Or L-M test 1 exige que « chaque porte de `portes.liste()` soit dans les deux tables » : les nouvelles portes font
échouer F2 ou INT. `ZONES_JEU` est figé dans `constantes.js`, et le point B (9,38 ; −3,06 ; −9,37) est écrit en dur :
il peut tomber dans un meuble neuf.
**Correction (L-M, L-E)** :
- une porte inconnue suit une règle par défaut : en combat, ouverte si ses deux côtés sont dans la zone, fermée
  sinon ; en prop hunt, 'auto' ; elle est notée au rapport, et le test exige « 0 porte inconnue sans règle » ;
- B est ramené à la préparation au nœud le plus proche à 3 m ou moins, dégagé à 1,5 m ou plus ;
- test : l'anneau de B est libre (`C.libre` au rayon de 1,5 m).

---------------------------------------------------------------------------------------------------------------------

## C. MOYENS : critères invérifiables, ambiguïtés de construction, ennui de jeu

**25. Le test 8 de L-B (« jamais un saut d'œil > 3 cm d'une image à l'autre » dans les escaliers) est physiquement
impossible.**
Constat : la volée 2 de l'escalier principal monte 2,80 m sur 5,85 m, une pente de 0,48 (carte_monde, table des
volées). À 5 m/s, l'œil monte normalement de 4 cm par image à 60 images/s ; au sprint, de 5,3 cm.
**Correction** : mesurer la DÉRIVÉE SECONDE (|Δy(n) − Δy(n−1)| ≤ 1 cm) ou l'écart à la pente prévue (≤ 1 cm). Lisser
aussi les descentes de bordure (0,06 s), ou les exclure en le disant.

**26. La cadence des armes n'est pas tenable sans report du reste (L-A test 7).**
Constat : 80 ms font 9,6 pas, 857 ms en font 102,86. Un constructeur qui écrit `prochain = t + 60/rpm` tire en réalité
tous les 10 pas (83,3 ms) : 30 balles en 2,417 s, pas 2,32 ± 1 pas.
**Correction (§ 3.3, en clair)** : arme automatique `prochain += 60/rpm`, tir dès que `t ≥ prochain` ; semi-automatique
`prochain = max(prochain + 60/rpm, t)`.

**27. Le signe et l'unité du recul visuel sont faux (§ 3.2, § 4.5.6, L-A test 11, F2 « `camPitch` monté de 6,76° »).**
Constat : `rotation.set(-(tangage + reculV), lacet + reculH, …)` alors que `reculV`/`reculH` sont en DEGRÉS
(§ 4.5.6). Et un cabré positif doit faire regarder EN HAUT, donc diminuer le tangage (tangage > 0 = vers le bas). « Tangage
+6,76° » a donc le mauvais signe.
**Correction** : `rotation.set(-(tangage − 0,15·reculV·DEG), lacet − 0,15·reculH·DEG, roulis, 'YXZ')`. Dans tous les
tests, écrire « montée de 6,76° (`camPitch` baisse de 0,118 rad) ».

**28. L'occlusion du son coûte trop et l'auditeur a une image de retard.**
Constat : l'occlusion passe par `C.rayonLibre`, à 12-106 µs l'appel (carte_monde § 0.3). Avec 24 voix à 10 Hz, cela
fait jusqu'à 25 ms par seconde, environ 0,4 ms par image, au-delà des 0,2 ms de L-H test 13. Et `setListener` est
appelé AVANT `updateCamera` (`game.js:449`) : le panoramique a une image de retard sur un virage sec.
**Correction (L-H, S0)** : l'occlusion par `partie.balistique.vue()` (DDA à 8 µs), 4 voix par image à tour de rôle, et
seulement les voix au-dessus de −30 dB. Prise S0 : `setListener` déplacé après `updateCamera`, ou posé par
`SonsJeu.maj(dt, camera)`.

**29. Il n'y a pas de ravitaillement en munitions avant la vague 3.**
Constat : la FA-24 a 120 balles par vie, sans aucun ramassage avant L-P. À 2 éliminations par minute (§ 2.3) et environ
10 balles par élimination, une bonne vie tombe à sec : il faut mourir pour se réarmer.
**Correction (L-E)** : chaque élimination rend un chargeur de réserve à l'arme principale du tireur, jusqu'à l'arrivée
des armes au sol. Test L-E.

**30. `verifierSieges()` ne peut pas asseoir Haythem sur les places au milieu d'un rang (§ 4.10.1, § 6.6).**
Constat : « posé à 0,6 m devant lui » met Haythem dans la boîte du rang. Les places au milieu d'un rang ne se prennent
qu'en se faufilant (`player.js:770-787`), et `resoudre` le sort à plus de 1,1 m. La rangée de 97 places de la S −1.14,
la S 1.3 et la salle 2 du 2e donnent alors des refus, et le 346 sur 346 n'est pas atteignable.
**Correction (S0)** : pour un siège qui a `s.rang`, poser d'abord `u.rang = { R: s.rang, t: s.t, ox: 0, oz: 0 }` sur sa
ligne, puis `interact` ; pour les autres, la règle des 0,6 m.

**31. Les cibles du stand n'ont pas de corps, et le stand n'a pas d'emplacements.**
Constat : `Partie.interpoler` appelle `corps.presenter(a)` sur chaque acteur actif (§ 4.5.5), mais un acteur
`role: 'cible'` n'a pas de `corps` (§ 4.5.4) : exception. Le stand « x ≈ −1, cibles à 8, 15, 25 m » ne donne ni z, ni
couloirs. Or le mobilier de la rue (vélos, jardinières, voitures : formes qui arrêtent les balles) peut barrer les
lignes de tir.
**Correction** : S0 ajoute un `CorpsFixe` (`pos`, `posAff`, `memoriser`/`presenter` sans effet). L-E donne des
coordonnées exactes, et un test « `balle()` de la ligne de tir à chaque cible : libre ».

**32. En mode `'menu'`, la carte vivante suit Haythem, pas la caméra du menu.**
Constat : `carte.maj(dt, this)` suit `user`. Or les 4 spots et la carte d'environnement suivent la zone de l'acteur
(`ecole_lumieres.js:7-12`, `63-80`). Haythem reste au départ dans le hall pendant que la caméra du menu filme la pause
du 1er : pas de spots, reflets du hall.
**Correction (S0, prise `game.js:478`)** : en `'menu'`, passer
`Object.create(game, { user: { value: corpsMenu } })`, avec `corpsMenu.pos` au sol sous la caméra du plan en cours
(`solEn`).

**33. Deux critères sont sans tolérance ou se contredisent.**
- L-A test 2 : « accord ≥ 97 % avec le Raycaster » ne fixe ni distance ni échantillon. Les formes de collision sont
  simplifiées (rangs en un bloc, chaises en cylindres, rampes et lampes sans forme). **Correction** : rayons entre nœuds
  libres à 1,0-1,7 m, accord = premier impact à 10 cm ou moins, matériaux transparents et décor sans forme exclus.
- L-B test 7 cite « les tables de la S 1.3 » comme franchissements réussis, mais la S 1.3, c'est 6 rangs serrés
  (« refusés d'eux-mêmes »). **Correction** : les 10 obstacles sont donnés par leurs coordonnées, choisis après une
  passe de mesure qui vérifie une arrivée libre.

**34. `separer` utilise un rayon fixe : le corps trahit le faux meuble.**
Constat : des disques de 0,3 m pour tous (§ 3.1). Un chasseur est arrêté à 0,6 m d'une petite poubelle-prop (rayon
0,15), ou entre dans le baby-foot (0,5) : en se cognant, on reconnaît le prop.
**Correction (L-B)** : `separer` utilise `ra + rb`, avec le `rayon` du `CorpsProp`. Le prop est traité comme le serait le
vrai meuble de ce type.

**35. Faire passer les annonces par `#hud-feedback` contredit le test 1 de L-G et double les vibrations.**
Constat : `HUD.feedback` force une mise en page (`void this.fb.offsetWidth`, `ui.js:283-288`) et envoie
`hoops-feedback`, qui fait vibrer la manette. Annoncer par lui viole « 0 lecture de mise en page » (L-G test 1), et
chaque « +100 » vibre en plus des vibrations d'événements de L-I.
**Correction (L-G)** : un élément d'annonce à `HudJeu`, relancé en basculant deux classes ou par l'API Web Animations.
En partie, plus aucun `hud.feedback`, et les vibrations viennent seulement de L-I.

**36. L'environnement de la scène de l'arme est fragile.**
Constat : il est pris une fois sur celui de la scène (§ 4.5.9), mais `scene.environment` change ou passe à `null`
selon la qualité (`fx.js:1270`, `1353`, `1392-1407`). La présence d'une carte d'environnement entre dans la clé des
programmes : l'arme recompile, donc une image figée, ou garde une texture libérée.
**Correction (L-V)** : une carte d'environnement À ELLE, fixe (un PMREM de studio fait une fois à la préparation),
réglée par l'intensité de la lumière clé par zone.

**37. Prop hunt : le prop repéré est condamné, et la cachette côté chasseur est un écran noir.**
Constat : les chasseurs ont le sprint illimité à 6,6 m/s plus le sprint tactique à 7,8 (§ 3.1). Le prop le plus rapide
plafonne à 5,8 m/s, une chaise à 5,05 (§ 3.9). Fuir ne marche jamais. Pendant la cachette, Haythem chasseur a 30 s
d'écran noir où « il peut tourner la tête » : c'est incohérent, et ennuyeux.
**Correction (L-F)** : au prop hunt, les chasseurs n'ont pas de sprint tactique et ont un sprint à endurance
(−25/s, +15/s). Pendant la cachette, montrer le tableau des rôles, la mini-carte de la zone et les astuces, au lieu
du noir.

**38. Les bots ne franchissent rien, et le joueur les sème par-dessus une table.**
Constat : le graphe de navigation n'a aucun lien de franchissement, et les bots ne sautent jamais (§ 3.7). Haythem
franchit une table (§ 3.1) et le bot fait le tour : un abus facile.
**Correction (L-D, puis L-J)** : des liens « franchir » (obstacle de 0,45 à 1,15 m, arrivée libre, coût × 2), et le
`Pilote` envoie le front `saut` face à l'obstacle.

**39. Trois ambiguïtés qu'un constructeur ne peut pas trancher seul.**
- **Repérage et réaction.** Le § 2.3 dit « jauge remplie en 0,45 s », la table dit « réaction (repéré → 1er tir)
  0,45 s ». Ce sont DEUX délais : en Régulier à 10 m, 0,9 s avant le premier tir. À écrire en clair.
- **Aide à la visée.** `corriger(cmd, game, dt)` doit réécrire `game.camYaw/camPitch`, sinon la commande suivante
  annule l'aimant. À écrire en clair.
- **Crédibilité.** La conception écrit `credibilite(cle, x, z, y, …)` (conception_prophunt § 9.4), la spec
  `(cle, x, y, z, …)`. À signaler en tête de L-K : ne pas recopier le code de la conception tel quel. Définir aussi
  `couverture` dans la spec (part des points d'observation qui voient la cachette, 0..1).

**40. Des méthodes utilisées ne figurent pas dans les contrats : le test 11 de S0 (« 0 manquant ») ne les verra pas.**
Constat : `Arsenal.prendreRecul(out)` n'est défini qu'au § 5.4 et dans la « précision de l'architecte ».
`Partie.majHud()`, `CorpsFixe` (point 31) et les `preparer?.()` de l'affichage n'existent qu'au § 5.4.
**Correction** : les ajouter aux §§ 4.5.5, 4.5.6 et 4.5.17, donc à la table `SIGNATURES`.

---------------------------------------------------------------------------------------------------------------------

## D. MINEURS (à corriger en passant)

**41.** `Player.dispose` doit aussi libérer le bonhomme de secours que crée chaque `Player` : 5 matériaux et environ 20
géométries (`player.js:187-227`). Ils ne sont jamais dessinés, donc `renderer.info` ne voit pas la fuite.

**42.** `sw.js` copie dans le cache toute réponse GET de la même origine (branche « réseau d'abord ») : les tests
importés à la demande Y SONT. Le « jamais dans le cache hors ligne » du § 6.5 est faux. **Correction (INT)** :
`if (url.pathname.includes('/js/jeu/tests/')) return;`. Au passage, `serve.py` écoute en IPv6 ET en IPv4
(`Serveur6`) : la note « 127.0.0.1 : n'écoute qu'en IPv4 » est fausse, sans gravité.

**43.** La spec, le banc et les rapports vivent dans `%TEMP%` (`AppData/Local/Temp/claude/…`) : un dossier volatil, et
celui d'une seule session. Or le repreneur du R41 en dépend. **Correction (S0)** : copier `spec.md`, le banc et les
cartes dans `docs/jeu/` sur la branche `socle`. Les rapports vont dans `docs/jeu/rapports/<clé>.md`, commités avec le lot.

**44.** Le double appui sur Maj du sprint tactique, répété, peut ouvrir la fenêtre « Touches rémanentes » de Windows
(5 Maj d'affilée) : le jeu perd le focus, puis la capture, puis passe en pause. **Correction** : une 2e touche de sprint
tactique libre de choix (`Souris:4`), et un conseil dans le README.

**45.** `CadenceActeurs` : un bot caché (posé à 4 Hz) qui redevient visible montre une pose vieille de 0,25 s. Le poser
dans l'image même où `dessine` passe à vrai.

**46.** Chiffres faux mais sans conséquence. Les « 75 meubles bas `camera:false` » sont surtout le mobilier de la rue,
plus le « jour » de l'escalier, un portillon et deux formes du palier du −1 (carte_monde § 1.1). Ils arrêtent bien les
balles, mais les jardinières de la rue en font partie.

**47.** Le contexte : un jeu de tir dans une vraie école, reconnaissable, avec les visages des camarades en option
(R33). L'habillage « Militaire » par défaut est le mauvais pari, puisque la mécanique est la même. **Correction
(S0, `DEFAULTS.jeu.habillage`)** : `'airsoft'` par défaut, « Militaire » à choisir dans les options.

---------------------------------------------------------------------------------------------------------------------

## E. Ce qu'il faut changer AVANT de lancer le socle (résumé de priorité)

1. Rejeu déterministe de la balade (points 1, 2) et harnais sans rAF ni son réel (points 3, 4) : sinon `socle-ok`
   n'arrive jamais.
2. Prises S0 à ajouter ou corriger : `enterLobby({ aide: false })`, `body.combat` qui cache `#hud-hint`, `main.js:74`,
   `appliquerProfil({ purger })`, `Souris:*` seulement sous capture, reprise selon le type d'entrée, `CorpsFixe`,
   résolution des tirs par lot, cerveau minimal Errant avec erreur de visée, actions `provoc1-8`, menu suivi par un
   corps fictif.
3. Tables de propriétaires : `aff_progression.js` à L-P, `Viewmodel.vitrine` par F2, `ecole_est.js`,
   `ecole_soussol_est.js` et `ecole_rdc_centre.js` à L-K, exemption ou suppression de `portraits.js` avec lumières.
4. Données à corriger dans la spec : zone de repli `e1`, signe et unités du recul, cadence par report du reste,
   critères L-B 8, L-A 2 et L-B 7 réécrits, habillage par défaut.
5. À la charge des lots, inscrites dans leurs fiches : vantaux ouverts solides (L-M), miroir coupé en partie (L-M),
   vitres dépolies (L-M, L-A), `separer` par le monde solide avec `ra + rb` (L-B), saut borné en vol (L-B), graphe des
   props et cachettes atteignables (L-K, L-D), registre complet (L-K), voile flash en DOM (L-G), roue des provocations
   à elle (L-G), chevrons des alliés (L-G), occlusion par le DDA (L-H), environnement propre à l'arme (L-V), munitions
   rendues à l'élimination (L-E), sprint limité des chasseurs (L-F), liens de franchissement (L-D, L-J).
