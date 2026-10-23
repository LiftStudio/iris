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
