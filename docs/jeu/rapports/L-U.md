# Rapport L-U — menus et options (vague 2)

Branche `lot/L-U` (depuis `socle`, e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-U`, port 8141 ; 23/10/2026.
Section de la spécification : § 5.5.11 (contrats § 4.5.16, valeurs § 3, propriétaires § 5.2).

## Où j'en suis

**RELECTURE FINIE** (23/10, 07:25 ; relecteur sévère, commits « L-U relecture : … », section « Relecture » en fin de
rapport : 13 défauts trouvés et corrigés, 5 écarts et 1 demande ajoutés). Sur le code final (2095d30 ; les commits suivants
ne touchent que ce rapport), la définition de « fini » du § 5.1, règle 5 :
- (a) `&rapport=1&lot=L-U` : **14/14 sur PC** (1280 × 720, `&qualite=haute`, 18,3 s) et **14/14 sous `?tel=1`** (375 × 812,
  moyenne, 13,9 s) ; seul « signalé » : le premier Tab, « non valable » (onglet derrière ceux des autres agents, ou machine
  déjà au-delà de 50 ms sans Tab) — mesuré valable onglet devant : 35, 19, 21, 20 ms ;
- (b) `&rapport=1&lot=S0` : **29/29 sur PC** (`&qualite=haute`, 103 s) et **29/29 sous `?tel=1`** (98,5 s), la balade au bit
  près avant et après les parties (vue 3 et vue 1 : 0 / 0), « menu = référence » vrai ;
- (c) `python -I tools/verifier_proprietaires.py lot/L-U` → **OK 17 fichiers** ;
- (d) 12 commits « L-U relecture : … » avec la ligne d'attribution ; (e) ce rapport ;
- (f) onglet fermé, serveur 8141 arrêté, **jeton_3 rendu à 07:24** (pris à 06:49).
Reste à F2 : ce que disait le constructeur (ci-dessous : parcours manette sur les vraies fins, crédits, portraits à
côté des avatars de L-C, ÉCHAP réel sur l'écran de fin pointeur capturé — le navigateur intégré refuse la capture), et les
DEMANDES 1 à 8.

**Construction FINIE** (23/10, 05:56, le constructeur). La définition de « fini » du § 5.1, règle 5 :
- (a) `&rapport=1&lot=L-U` : **14/14 sur PC** (1280 × 720, qualité haute, 17,0 s ; dernier passage sur 4a3f7cc) et **14/14 sous
  `?tel=1`** (375 × 812 émulé, qualité moyenne, 15,3 s) ; seul « signalé » : le premier Tab mesuré onglet caché (non
  valable) — rejoué onglet DEVANT : **37,5 ms** au plus (≤ 50), vert ;
- (b) `&rapport=1&lot=S0` : **29/29 sur PC** (`&qualite=haute`, 233 s, balade au bit près avant et après les parties, vue 3
  et vue 1 : 0 / 0) et **29/29 sous `?tel=1`** (143 s, 0 / 0) ; un premier passage PC sans `&qualite=` : 28/29 (point 8,
  « programmes 144 → 145 » : la qualité automatique en route, onglet en arrière-plan — comme chez L-E), le point 8 rejoué
  seul : vert (programmes 179 → 179) ; (les deux derniers commits ne touchent que `menus.css` et une ligne du test 4) ;
- (c) `python -I tools/verifier_proprietaires.py lot/L-U` → **OK 17 fichiers** ;
- (d) 14 commits « L-U : … » avec la ligne d'attribution ; (e) ce rapport ;
- (f) onglet fermé, serveur 8141 arrêté, **jeton_1 rendu à 05:56** (pris à 05:24, périmé chez L-C : écart 15).

Rien ne reste à faire pour L-U en vague 2. Un repreneur part de `lot/L-U` (dernier commit « L-U : … rapport final »).
À F2 : le test « F2 parcours manette sur les vraies fins » (`apresFusion`), les crédits relus, les portraits à côté des
vrais avatars de L-C (✋ ; refaits par l'outil si un avatar a changé), et les DEMANDES ci-dessous.

## Ce qui est construit

- **`js/jeu/menus_jeu.js` (`MenuJeu`, § 4.5.16)** :
  - **accueil** (`#menu-jeu`, racine manette `menu-jeu`) : le titre IRIS, « L’ÉCOLE · BALADE · COMBAT · PROP HUNT », les six
    portes dans l'ordre du § 2.1 (table `ACCUEIL` : L-P y ajoutera ARMURERIE et PROFIL ; la place de la barre d'XP,
    `.mj-xp`, est posée), une fiche à droite qui dit ce qu'est la porte visée (souris, clavier, manette), l'aide en bas
    dans la langue de la dernière entrée (touches, boutons de la manette, doigt) ; flèches ↑ ↓ au clavier ;
  - **réglages** (`#reglage-jeu`, racine `reglage-jeu`, B / ÉCHAP reviennent ; focus d'arrivée sur LANCER) :
    COMBAT (habillage EN TÊTE, Airsoft par défaut · mode · zone — la domination grise les autres zones et ramène sur
    toute l'école · effectifs alliés / ennemis bornés à 9 bots sur PC, 5 au téléphone, avertissement au-delà de 7 / 3 ;
    en chacun pour soi, des adversaires · difficulté (Mixte comprise) · limite et temps préréglés par mode · classe avec
    sa dotation en clair · les six visages des amis, cochables, portrait en `<img>` ; aucun coché = « clones de Haythem »,
    et l'accord des amis rappelé) ; PROP HUNT (zone : AUTO + les cinq, grisées sous 6 types déguisables avec leur raison,
    défaut calculé comme `PartieProp` le calcule · manches 4/6/8 · joueurs 4-8 et la part de chasseurs · difficulté,
    Facile au tout premier lancement · premier rôle · chasseur seul · aides) ; STAND (défi : libre + les quatre ·
    classe · records lus dans `iris.stand.v1`) ; tout est gardé dans `settings.jeu` ; LANCER donne une graine neuve ;
  - **préparation** (`#prep-jeu`) : les étapes de `Partie.preparer` cochées une à une (« Plan de l’école », « Les élèves
    arrivent », « Meubles » au prop hunt, « Armes et effets »), une barre qui ne recule jamais, le mode lancé, une astuce
    toutes les 3,5 s avec les VRAIES touches (`actionKey` du profil) ;
  - **fin** (`#fin-jeu`, racine `fin-jeu`, un écran à elle, jamais `#overlay`) : le bandeau 2,5 s (VICTOIRE / DÉFAITE /
    ÉGALITÉ / « 2e PLACE »…, le score), puis le bilan — podium des trois premiers avec leurs portraits, six chiffres de
    Haythem (éliminations ou « touchés » en Airsoft, morts / « sorties », assistances, précision, têtes, plus longue
    série ; au prop hunt : points, props trouvés, provocations, survie, vrais meubles, précision), REJOUER · CHANGER DE
    MODE · MENU PRINCIPAL · BALADE ; un clic passe le bandeau ; la partie GELÉE dessous (écart 7) ;
  - **crédits** (`#credits-jeu`, racine `credits-jeu`) : le jeu, les avatars (Avaturn, Haythem et ses amis), la capture de
    mouvement (la formule CMU mot pour mot, Mixamo), Sketchfab CC BY 4.0 (les cinq danses et leurs auteurs, comme LA
    CAGE, sans le basket ni le parc), les voitures (Comrade1280), Poly Haven, three.js, es-module-shims, les polices ;
  - **caméra du menu** (`camera(dt, poser)`, `PLANS`) : trois plans de 12 s relevés et regardés dans l'école (le hall et
    la pile « iris » — Haythem, au départ, de dos devant elle —, le hall ouest qui s'approche de l'escalier principal, la
    pause orange du 1er vue de l'est), le sujet dans la moitié droite (la colonne du menu couvre la gauche), un fondu au
    noir de 1,2 s à chaque coupe (`#menu-fondu`, caché d'office par `body.en-jeu`), le corps fictif posé au sol sous la
    caméra ; `figer` pour un plan fixe (relevés).
- **Portraits** : `tools/portraits/` (`index.html` + `outil.js` — le moteur de portraits de LA CAGE taillé, cadrage
  resserré sur le visage — + `ecrire.py`, qui reçoit la page de l'outil ou lit un JSON, vérifie RIFF/WEBP, 192 × 192,
  couche alpha, ≤ 30 Ko, et écrit) ; les sept `assets/portraits/*.webp` (3,2 à 5,5 Ko) ; `js/jeu/portraits.js`
  (`PORTRAITS`, `portrait(fiche)`) ; `vignette(fiche)` (menus_jeu.js) : l'image, ou l'initiale sur un dégradé.
  **Planche** : `tools/portraits/planche.webp` (les sept côte à côte, regardés : bustes nets, visages centrés).
- **`js/ui.js`** : l'onglet **COMBAT** ajouté par le code (champ 75-110°, sensibilité en cm par tour à 800 ppp —
  0,45 → 17,7 cm —, sensibilité en visée, visée maintenue / bascule, accroupi maintenu, sprint auto, aide à la visée, tir
  auto tactile, couleur du réticule, secousses, habillage, priorité fluidité, démarrage) ; **Commandes** à trois
  profils BALADE / COMBAT / PROP HUNT (`LISTES_ACTIONS`, `bindingsDe` / `bind(…, profil)`), une case qui attend prend
  aussi un bouton de la souris (`Souris:0-4`) ou un cran de molette en COMBAT et PROP HUNT (jamais en BALADE : la souris
  y tourne la caméra), le clic capté ne clique rien d'autre ; le bloc manette décrit la disposition du profil montré ;
  « ⚠ Ctrl + W ferme l’onglet » dès qu'une touche Ctrl est liée, et `navigator.keyboard.lock()` en plein écran ;
  « Réinitialiser cet onglet » sait faire COMBAT et chaque profil ; « Commandes » ouvert en partie montre son profil.
- **`css/jeu/menus.css`** ; **`js/jeu/tests/test_menus.js`** (14 critères + 1 à F2).

## Le `__rapport`

`&rapport=1&lot=L-U` (PC, `http://127.0.0.1:8141/?test=1&rapport=1&lot=L-U`, 1280 × 720 émulé, qualité haute,
onglet en arrière-plan) : **ok, 14/14, 16,7 s, 1 signalé (non valable : onglet caché)**.

| # | Mesure |
|---|---|
| 1 | six portes dans l'ordre ; focus manette sur BALADE ; croix ↓ : balade → combat → prophunt → stand → options → credits ; A ouvre et B revient pour les cinq sous-écrans |
| 2 | BALADE LIBRE → lobby, partie nulle ; rejeu vue 3 0 / 0, vue 1 0 / 0, identiques |
| 3 | 3 plans de 12 s ; fondu (6 s : 0 · 11,7 : 0,5 · 12 : 1 · 12,3 : 0,5 · 12,7 : 0) ; 360 positions libres ; tactile caché ; `fx._enJeu()` faux |
| 4 | lignes habillage, mode, zone, effectifs, difficulté, limite, temps, classe, avatars ; Airsoft par défaut ; domination : rdc_rue, ss, etages grisées ; 4 + 5 = 9 bots au plus, avertissement à 9, aucun à 7 ; chacun pour soi ; 6 amis en `<img>` ; « clones de Haythem » ; **0 .glb, 0 contexte WebGL, onLoad 0** |
| 5 | grisée ⇔ < 6 types (sur `socle` aucune étiquette : toutes à 0) ; sans le lot R (simulé) : ss et e2 grisées avec leur raison, défaut le 1er ; choix explicite gardé ; zone grisée → AUTO ; le −1 à 7 types → défaut le −1 ; Facile au premier lancement |
| 6 | les choix reviennent (combat, prop, stand), relus du stockage |
| 7 | LANCER → présentation en **765 ms** (1re fois, ≤ 4 000) ; étapes Plan · Élèves · Armes (combat) et Plan · Élèves · Meubles · Armes (prop hunt, 252 ms) |
| 8 | fin : VICTOIRE · SISR 5 – 0 SLAM ; bilan à 2,5 s ; ÉCHAP sans pause par-dessus ; REJOUER (mêmes réglages, graine neuve) ; CHANGER DE MODE → réglages du combat ; MENU PRINCIPAL ; chacun pour soi VICTOIRE ; BALADE : instantané = référence |
| 9 | crédits 20/20, ni basket ni parc |
| 10 | onglets graphics · audio · controls · emotes · combat ; 0,45 → 17,7 cm ; chacun des 13 réglages écrit le sien |
| 11 | trois profils ; KeyT sur Recharger (COMBAT) ; Souris:0 à 4, Molette:haut / bas captés ; la balade identique ; Ctrl → « Ctrl + W ferme l’onglet » ; en BALADE, pas de Souris:0 |
| 12 | les quatre onglets d'aujourd'hui rendus, la qualité écrite puis rendue, le volume écrit |
| 13 | 7 fichiers 192 × 192, fond transparent, ≤ 30 Ko ; `portrait()` 1e-4 ms l'appel ; l'initiale sans image ; premier Tab 100 ms au plus (onglet caché : **non valable**, signalé) ; stockage qui lève : rien ne casse |
| 14 | « Modes de jeu » → menu, pas en pause, fronts purgés, accueil visible |

Sous `?tel=1` (375 × 812, émulation mobile, tactile) : **ok, 14/14, 15,3 s** — 4 : somme des bots 0 + 5 = 5 (au plus 5),
avertissement au-delà de 3 ; 7 : LANCER → présentation **227 ms** (≤ 10 000), prop hunt 145 ms ; 13 : premier Tab 223 ms
(onglet caché, non valable). Onglet DEVANT (PC, taille du panneau, rAF 40/s) : test 13 seul, premier Tab **37,5 ms**.

## Joué dans le navigateur (et regardé)

- **Les trois plans** relevés à la main (`menu.figer`, photos 1280 × 720 reçues par un petit serveur local) : le hall
  (la pile « iris » et Haythem à droite de l'image), l'escalier principal (le hall ouest qui s'approche des battants
  ouverts sur la volée), la pause orange du 1er (le mur orange à droite, les distributeurs, les mange-debout) ; deux
  essais refusés (une caméra DANS une forme du hall, une autre qui ne voyait que le plafond de l'escalier).
- **Les portraits** : deux passes de l'outil ; la planche regardée (`tools/portraits/planche.webp`).
- **Les écrans à 760 × 428** (téléphone couché) : l'accueil sur deux colonnes, les réglages du combat (les visages cochés
  en couleur, les autres en gris), une partie lancée par LANCER avec Gabriel et Koji cochés, sa fin (VICTOIRE · SISR 40 –
  36 SLAM, le podium Koji / Haythem / Gabriel avec leurs portraits, « 12 TOUCHÉS · 5 SORTIES · 3 ASSISTANCES… »), l'écran
  PRÉPARATION (étapes cochées, astuce aux vraies touches « E », « R »). Ce que ces essais ont corrigé : la fiche des
  réglages faisait 1 345 px de haut (LANCER hors de l'écran) → bornée à l'écran, le corps défile ; l'accueil d'une
  fenêtre très basse (374 × 210) coupait OPTIONS et CRÉDITS → il se serre et défile.
- En 1280 × 720 (mesuré, le panneau du navigateur ne montre pas plus grand) : la colonne 560 px, le titre en haut, les
  portes au milieu (254-591), la fiche de la porte en bas à droite (841-1211 × 559-677), la fiche des réglages 696 px
  avec LANCER à 629-695.

## Écarts au document

1. **Habillage EN TÊTE des réglages du combat** (§ 2.2, l. 162, le liste en dernier avant LANCER) : l'arbitrage 35 (l. 124)
   et R33 (l. 3252) disent « proposée en tête des réglages du COMBAT », « Militaire à un clic en tête » — suivis.
2. **Clés hors des DEFAULTS de `js/settings.js`** (§ 2.2 : « les derniers choix sont gardés (`settings.jeu`) ») : la limite
   et le temps par mode (`jeu.combat.limites`), les adversaires du chacun pour soi (`jeu.combat.adversaires` : 5, 3 au
   téléphone — `jeu.combat.ennemis` sert aux équipes, 4 par défaut, alors que le § 3.10 veut 5 en chacun pour soi) et
   les choix du stand (`jeu.stand`) n'ont pas de place dans `DEFAULTS` : ils sont gardés EN MÉMOIRE pour la session,
   `deepMerge` les oublie au rechargement (settings.js est à INT) → DEMANDE 1.
3. **Zone du prop hunt : un choix AUTO** en tête (`prop.zone: null`, le défaut « calculé au lancement » du § 3.9, montré
   « AUTO : Le 1er ») ; une zone explicite grisée n'est pas jouée (AUTO au lancement) mais reste gardée, et revient
   dès qu'elle a ses 6 types (« gardé tant que la zone n'est pas grisée », l. 597).
4. **Avatars au prop hunt** : le § 2.2 ne les liste pas pour le PROP HUNT ; `PartieProp` lit `opts.avatars` (les
   chasseurs « avatars des amis », § 2.7) — la ligne y est, partagée avec le combat (`jeu.combat.avatars`).
5. **Stand** : un défi « LIBRE » (`defi: null`, le mannequin à 10 m et les cibles sans chrono) en plus des quatre, et la
   classe (`PartieStand` lit `opts.classe`).
6. **« Fondu de 1,2 s »** : un fondu au NOIR (0,6 s de chaque côté de la coupe, `#menu-fondu`), pas un fondu enchaîné
   (deux rendus de l'école par image : non).
7. **La partie gelée sous l'écran de fin** (`game.paused = true` dans `MenuJeu.fin`) : `js/jeu/index.js` rend le pointeur
   à la fin, et `game.js` (l. 270) met en pause sur « iris-pointeur » sans capture → l'écran de PAUSE s'ouvrait
   par-dessus l'écran de fin, à la souris (pas sous `?test=1`, où rien n'est capturé). Gelée, la partie n'a plus rien
   qui avance (phase 'fin', acteurs figés) ; ÉCHAP sur l'écran de fin ne rouvre pas la pause (écouté en capture, avant
   `input.js`) ; REJOUER, CHANGER DE MODE, MENU PRINCIPAL, BALADE remettent `paused` à faux (`lancerPartie`,
   `quitterPartie`) → DEMANDE 2.
8. **Le registre rangé au menu** : à la 1re ouverture des réglages du PROP HUNT, `rattraperRegistre(scene)` +
   `zonerRegistre(lumieres)` (sans quoi `typesDeguisables` rend 0 partout avant la 1re préparation d'un prop hunt, et
   les meubles cousus seuls du lot R ne compteraient pas) : du calcul seulement, ni GPU, ni réseau ; idempotent.
9. **« Les 4 étapes nommées »** (test 7, l. 2736) : `Partie.preparer` n'en a que TROIS au combat (« Meubles » est au prop
   hunt) et leur ordre réel est Plan · Élèves · **Meubles** · Armes (le § 2.2, l. 168, met « Meubles » en dernier) :
   l'écran montre les étapes de la partie lancée, dans l'ordre où elles arrivent ; le test vérifie les 3 du combat et
   les 4 du prop hunt.
10. **Onglet COMBAT** : un groupe DÉMARRAGE en plus (`game.demarrage` : menu ou balade — le « réglage Démarrage : balade »
    du § 2.1, l. 154, n'avait pas d'écran) ; le réticule ne propose jamais le rouge (celui d'un ennemi visé, § 4.5.15).
11. **Cadrage des portraits** plus serré que LA CAGE (1,0 m devant la tête, le regard 5 cm au-dessus de l'os de la tête,
    au lieu de 1,28 m et 6 cm dessous) : à 1,28 la tête ne faisait qu'un quart de l'image, illisible en 32 px (planche
    regardée, `tools/portraits/planche.webp`). Les portraits sont donc des BUSTES : le bas de l'image est opaque
    (épaules), les coins du haut transparents (test 13).
12. **`ecrire.py`** a deux entrées : le JSON de la spec (`ecrire.py portraits.json assets/portraits/`) ET `--ecouter
    <port>` : la page de l'outil (`?envoyer=<port>`) poste ses images à un petit serveur local — sans quoi il fallait
    recopier 30 Ko de base64 par l'outil JavaScript du navigateur.
13. **REJOUER** relance avec les mêmes réglages et une graine NEUVE (la même graine rejouerait la même partie).
14. **`MENUS.courant`** (export de `menus_jeu.js`) : le menu de la session, pour les tests et pour L-P ; `vignette(fiche,
    cls)` exportée aussi (l'image, ou l'initiale sur un dégradé), réutilisable par le tableau des scores (L-G).
15. **Jeton du navigateur** : après 2 h d'attente (les trois jetons pris et repris), `jeton_1` a été repris PÉRIMÉ à 05:24
    (`qui.txt` de L-C daté 04:39:20 ; une note est laissée, `_navigateur/NOTE_L-U_jeton1.txt` ; l'onglet de L-C, 8135,
    était encore ouvert : je n'y ai pas touché). Mon attente a sondé toutes les 30 s, puis toutes les 10 s.
16. **Les tests tapent les touches sur `document.body`** (test 8) : à la cible `window`, Chromium sert d'abord les
    écouteurs posés avant (ceux de `input.js`), quel que soit le drapeau de capture ; une vraie touche part du corps de
    la page, où l'écoute en capture du menu passe la première.

## Demandes

1. **INT (`js/settings.js` DEFAULTS)** : ajouter `jeu.combat.adversaires: TELEPHONE ? 3 : 5`, `jeu.combat.limites: {
   equipes: { score: TELEPHONE ? 20 : 40, duree: 600 }, melee: { score: 20, duree: 600 }, domination: { score: 150, duree:
   600 } }` et `jeu.stand: { defi: null, classe: 'assaut' }` — les menus les lisent déjà ; sinon ils ne passent pas un
   rechargement.
2. **INT ou F2 (`js/game.js` l. 270)** : ne pas mettre en pause sur « iris-pointeur » quand `partie.phase === 'fin'` ;
   alors `MenuJeu.fin` pourra laisser `game.paused` (écart 7).
3. **F2 (`js/settings.js`)** : `unbind(id, slot)` et `unbindPad(id, slot)` n'ont pas de paramètre `profil` (ils vident la
   balade) ; `ui.js` passe par `bind(id, slot, null, profil)` pour les profils du jeu. Un `profil` à la fin des deux
   serait plus net.
4. **L-E** : le menu lit les records du stand dans `iris.stand.v1` sous la forme `{ <défi>: nombre | { score, temps,
   precision } }` (au mieux, jamais exigé) ; dire le format retenu à F2.
5. **L-G** : le tableau des scores peut montrer les portraits par `portrait(fiche)` (`js/jeu/portraits.js`) — ou
   `vignette(fiche, cls)` de `menus_jeu.js`, qui retombe sur l'initiale quand une fiche n'a pas d'image.
6. **L-P (vague 3)** : `ACCUEIL` (menus_jeu.js) est la table des portes de l'accueil — y ajouter ARMURERIE et PROFIL ;
   `.mj-xp` (sous le titre, caché) attend la barre d'XP.
7. **F2** : le point 8 du socle (« programmes constants ») tombe parfois quand la qualité AUTOMATIQUE change de préréglage
   pendant la mesure (onglet en arrière-plan, plusieurs agents) — vu ici comme chez L-E ; rejoué avec `&qualite=haute`,
   vert. Le figer dans le test (`figerQualite`) éviterait le faux échec.

## Relecture (relecteur sévère, 23/10)

Relu : la spécification (§§ 2.1, 2.2, 2.9, 3.7-3.10, 4.1, 4.5.16, 4.8, 4.9, 4.10, 5.1, 5.2, 5.5.11), le diff complet
`git diff socle...lot/L-U` (17 fichiers), le code qu'il touche (`js/jeu/index.js`, `js/game.js` lancerPartie / quitterPartie /
togglePause / frame, `js/manette.js` et `js/manette_menus.js`, `js/settings.js`, `partie.js`, `partie_fps.js`,
`partie_prop.js`). `python -I tools/verifier_proprietaires.py lot/L-U` : OK 17 fichiers. Fins de ligne : celles des voisins
(CRLF partout, LF pour `js/ui.js` comme avant).

### Défauts trouvés à la lecture (avant le navigateur)

1. **Précision du bilan au-delà de 100 %** (`bilan`, l. « prec ») : `stats.tirs` compte un tir de FP-12 pour UN, et
   `Partie.infliger` compte une touche par PLOMB (huit par coup) — deux tirs à 2,5 m donnaient « 800 % ». Corrigé : le
   bilan compte lui-même, sur les événements (`tir` : `n` plombs ; `touche` : par le tireur), des touches sur des plombs,
   borné à 100 % ; test 8 (deux tirs de FP-12 à 2,5 m). → DEMANDE 8 (F2 / L-A) pour les statistiques elles-mêmes.
2. **`mmss` arrondissait après le partage** : 59,6 s → « 0:60 ». Corrigé (arrondi à la seconde d'abord).
3. **Les choix hors des DEFAULTS oubliés au rechargement** (limite et temps par mode, adversaires du chacun pour soi,
   défi et classe du stand : § 2.2 « les derniers choix sont gardés ») : la sauvegarde les écrit, `deepMerge` les jette à
   la relecture. Corrigé DANS le lot : `MenuJeu._rattraper()` les reprend au démarrage de la sauvegarde brute (lue,
   jamais écrite), puis `_jeu` les remet d'aplomb ; sans effet le jour où INT les met dans les DEFAULTS (DEMANDE 1
   gardée) ; test 6 (relecture, puis rattrapage).
4. **Avertissement sur la partie par défaut du prop hunt au téléphone** : 5 joueurs = 4 bots, un de plus que le conseil
   de 3 (§ 3.10) — l'écran disait « l'image peut ramer » sur ses propres valeurs par défaut. Le seuil du prop hunt est
   désormais `max(conseil, joueurs par défaut − 1)` (PC inchangé : 7). Écart 17.
5. **REJOUER préparait la partie sur la BALADE** : `lancerPartie` quitte la partie finie vers « rien » ; pendant les
   0,3 à 1,5 s de préparation, l'école tournait en balade (Haythem au départ, pilotable, son HUD sous l'écran
   PRÉPARATION) et un échec y laissait le joueur. REJOUER quitte maintenant vers le MENU, puis lance : même fond
   (l'école vivante) qu'après LANCER, et un échec ramène à l'accueil avec un message.
6. **Le plein écran verrouillait TOUT le clavier** (`navigator.keyboard.lock()` sans argument, dès qu'un Ctrl est lié) :
   ÉCHAP verrouillé se TIENT 2 s pour sortir du plein écran, et Alt + Tab peut être pris. Ne sont verrouillées que les
   lettres et les chiffres (Ctrl + W, S, D, T, N, 1… : ce que la spécification veut protéger).
7. **`ecrire.py`** : le pré-vol `OPTIONS` envoyait un en-tête APRÈS la fin des en-têtes ; une image fautive (taille,
   alpha, poids) était quand même écrite par-dessus la bonne. Corrigés (essayés : fichier et écoute, une image fautive
   refusée et non écrite, le pré-vol à trois en-têtes).
8. **Code mort** : `_prepT0` (posé, jamais lu) retiré.
9. **Tests dépendants de la sauvegarde de l'origine** : les tests 4 (Airsoft par défaut, limites préréglées) et 10 (champ
   à 90°…) lisaient les réglages chargés de `iris.settings.v1` de `127.0.0.1:8141` — une partie jouée à la main sur ce
   port (hors `?test=1`, qui n'écrit rien) les aurait fait échouer. Ils partent maintenant de réglages NEUFS (en mémoire).
10. **Le CLAVIER ne validait rien dans les menus** (joué : ↓ ↓ ENTRÉE sur l'accueil, rien ne s'ouvrait) : `js/input.js`
    empêche l'action par défaut des touches qu'il lie (ENTRÉE = interagir, ESPACE = sauter), des flèches et de Tab ; l'aide
    de l'accueil promettait « ENTRÉE valider », et dans les réglages ni Tab ni les flèches ne parcouraient rien. Corrigé
    (`MenuJeu._naviguer`, écouté en capture avant `input.js`) : les flèches mènent le focus au bouton le plus proche dans leur
    direction — l'écart de travers mesuré entre les BORDS (des boutons d'une colonne alignés à gauche, de largeurs
    différentes : mesuré entre centres, ↓ sautait COMBAT), d'abord dans la fiche qui défile (les lignes sous le pli, que
    LANCER aurait volées), ← → restent sur la ligne —, ENTRÉE ou ESPACE valident, le focus survit au nouveau rendu des
    réglages, le cadre du focus clavier est celui de la manette ; accueil, réglages, crédits, bilan. Test 1 (au clavier).
11. **Téléphone couché (812 × 375)** : le bilan de fin faisait 603 px — REJOUER et les trois autres boutons sous le pli.
    Corrigé : bilan compact sous 520 px de haut (podium et chiffres resserrés, les six chiffres sur une ligne dès 600 px
    de large) : 375 px, tout visible ; et partout, un bilan qui défile garde ses quatre boutons collés au bas. Les lignes de
    réglage gardent libellé à gauche et réglage à droite sur un écran large mais bas (≈ 3 lignes visibles au lieu de 2).
12. **Titre du bilan sans ex æquo** : au prop hunt, quatre joueurs à 0 point donnaient « MEILLEUR SCORE » (Haythem premier
    par l'ordre des acteurs) ; « 1e PLACE » au lieu de « 1re ». Le rang compte les ex æquo (« EX ÆQUO EN TÊTE »), et le
    chacun pour soi est classé par éliminations, comme sa règle (`PartieFPS`) ; VICTOIRE seulement pour le gagnant qu'elle
    désigne.
13. **Tests fragiles** (vus au premier passage, le panneau du navigateur à 1280 × 218 : 11/14) : le test 1 supposait une
    colonne (↓ dans l'ordre de la liste) — sur un écran bas l'accueil est sur deux colonnes : il parcourt maintenant les
    quatre directions depuis BALADE et vérifie que chaque porte est atteinte ; test 13 (premier Tab à 155 ms onglet DEVANT) :
    la machine chargée par les autres agents faisait déjà 220 à 280 ms SANS Tab — le test mesure maintenant 30 images sans
    Tab (après 30 d'échauffement) et note la mesure « non valable » si elles passent déjà 50 ms.

### Vérifié, juste (point par point)

- **Contrat § 4.5.16** : `MenuJeu(game, deps)` avec `deps = { options, lancer, quitter }` (index.js) ; `accueil()` (racine
  `menu-jeu`), `reglage('combat' | 'prop' | 'stand')` (racine `reglage-jeu`, `prophunt` accepté aussi), `preparation(f,
  etape)`, `fin(resultat)` (racine `fin-jeu`, les quatre boutons), `credits()` (racine `credits-jeu`), `camera(dt, poser) →
  true` (branchée par `game.cameraMenu`) ; `portrait(fiche) → 'assets/portraits/<id>.webp' | null`, liste `PORTRAITS` figée,
  aucun WebGL (`Light(` absent de `js/jeu/`, l'outil est dans `tools/`). Signatures du socle inchangées ; ajouts : `MENUS`,
  `vignette`, `bilan`, `optionsDe`, `zonesProp`, `compterTypes`, `_rattraper`.
- **Affichage seulement** : le menu s'abonne à `elim`, `phase`, `tir`, `touche` de la partie et lit son état ; il ne
  change aucune règle — sauf `game.paused = true` sous l'écran de fin (écart 7, DEMANDE 2, gardé : le pointeur rendu à la
  fin ouvrirait la pause par-dessus). Aucun fichier de simulation dans le lot (pureté sans objet).
- **Valeurs du § 3** : `LIMITES` (PC 9 bots, conseil 7, 6 visages ; téléphone 5, 3, 3), limites par mode (équipes 40 —
  20 au téléphone —, chacun pour soi 20, domination 150 ; 10:00), effectifs par défaut (PC 3 + 4 = 7, chacun pour soi 5 ;
  téléphone 1 + 2, 3), les textes des difficultés conformes au § 3.7 (repérage + réaction : 0,65 + 0,65 · 0,9 s à 10 m ·
  0,6 s · 0,2 s, Mixte), les défis du § 2.6, le prop hunt du § 3.9 (manches 4/6/8, 4 à 8 joueurs, chasseurs =
  arrondi(N/3), Facile au premier lancement, repli `e1`, 6 types), sensibilité 0,45 → 17,7 cm à 800 ppp, champ 75-110 (90),
  visée 0,5-1,5, classes (dotations lues dans `CLASSES`), crédits contre `CREDITS.md` et LA CAGE `index.html:319-365` (sans
  basket ni parc).
- **Propriétaires** : `python -I tools/verifier_proprietaires.py lot/L-U` → OK 17 fichiers ; ni `js/ecole_soussol.js`, ni
  `js/ecole_amphi.js`, ni le harnais, ni `docs/jeu/` hors de ce rapport ; fins de ligne : CRLF comme les voisins, LF pour
  `js/ui.js` (comme avant).
- **Joué et regardé** (onglet devant, 1280 × 720) : les trois plans de la caméra du menu (le hall et la pile « iris »,
  l'escalier principal, la pause orange du 1er), les réglages COMBAT (habillage en tête, visages cochés en couleur) et
  PROP HUNT (les zones grisées et leur raison), PRÉPARATION (étapes, astuce aux vraies touches), un LANCER → présentation,
  la fin (bandeau VICTOIRE, puis le bilan : podium à portraits, six chiffres, quatre boutons), REJOUER (préparation sur
  le menu), Options › COMBAT, Commandes › COMBAT (libellés AZERTY, souris, molette) ; au téléphone couché : l'accueil sur
  deux colonnes, les réglages, le bilan (corrigés, 11) ; le vrai démarrage (sans `?test=1` : « APPUIE POUR COMMENCER » →
  le menu, puis ↓ ↓ ENTRÉE : défaut 10 ; aucune sauvegarde laissée dans l'origine 8141). Console : aucune erreur des menus
  (la seule : le service worker que le navigateur intégré refuse d'inscrire, hors lot).

### Non vérifiable ici

- **La vraie capture du pointeur** : le navigateur intégré la refuse (après un vrai clic sur « CLIQUE POUR JOUER », le
  calque reste et `pointerLockElement` est nul). L'ÉCHAP réel sur l'écran de fin, pointeur capturé, reste donc à F2 (déjà
  demandé par le constructeur) ; il est couvert par le raisonnement (index.js rend le pointeur APRÈS que `fin` a gelé la partie :
  `iris-pointeur` arrive sur une partie en pause) et par le test 8 (synthétique).
- **Les temps** : la machine est partagée (rAF à 6 images/s quand l'onglet n'est pas devant, trois onglets d'école
  ouverts) ; le premier Tab mesuré VALABLE, onglet devant, quatre manches de suite : 35, 19, 21, 20 ms (sans Tab :
  17-18 ms) — sous les 50 ms ; les passages complets le notent « non valable » quand la machine passe déjà 50 ms sans Tab.

### Écarts ajoutés par la relecture

17. Avertissement d'effectif du prop hunt au-delà de `max(conseil, joueurs par défaut − 1)` et non du seul conseil (le
    § 3.10 ne prévoit pas que la partie par défaut du téléphone, 5 joueurs, dépasse son conseil de 3 bots).
18. REJOUER quitte vers le menu avant de relancer (le § 2.9 ne dit pas par où passer).
19. `navigator.keyboard.lock(<lettres et chiffres>)` et non `lock()` (§ 4.8) : ÉCHAP et Alt + Tab restent au navigateur.
20. Le clavier dans les menus (flèches, ENTRÉE, ESPACE) : le § 2.1 ne parle que de la manette et du doigt.
21. Au chacun pour soi, podium et rang par éliminations (puis points) ; ailleurs par points (§ 2.4 : « podium des trois
    premiers » ; la règle désigne le gagnant aux éliminations).

### Demandes ajoutées par la relecture

8. **F2 / L-A** (`armes.js` `stats.tirs`, `partie.js` `infliger` → `stats.touches`) : un tir compte UN, une touche compte
   par PLOMB — la précision des statistiques passe 100 % au FP-12 (deux tirs à 2,5 m : 6 touches pour 2 tirs). Le bilan
   compte lui-même sur les événements ; le profil (L-P) et le tableau des scores (L-G) en auront besoin : compter les plombs
   dans `tirs`, ou une touche par tir.
