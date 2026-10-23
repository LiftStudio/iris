# Rapport L-U — menus et options (vague 2)

Branche `lot/L-U` (depuis `socle`, e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-U`, port 8141 ; 23/10/2026.
Section de la spécification : § 5.5.11 (contrats § 4.5.16, valeurs § 3, propriétaires § 5.2).

## Où j'en suis

**EN COURS (fin de lot)** — tout est construit et joué dans le navigateur ; `&lot=L-U` **14/14 sur PC**. Reste : `&lot=S0`
sur PC (un 1er passage 28/29 : le point 8, la qualité automatique en route — voir plus bas — rejoué seul : vert), puis
`?tel=1` (L-U et S0), le rapport final, le jeton rendu.

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
