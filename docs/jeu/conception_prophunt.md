# PROP HUNT À IRIS — conception (concepteur « prop hunt », 22/10/2026)

Base : `C:/Users/hgami/Downloads/IRIS`, master `a8b22dd` (v2.0), lu en lecture seule. Sources : les cinq cartes du
dossier (`carte_coeur.md`, `carte_monde.md`, `carte_persos.md`, `carte_props.md`, `carte_cage.md`) et une relecture
ciblée du code (lignes vérifiées sur a8b22dd : constructeurs du mobilier, `fusionnerDecor`, `fusionnerLocal`,
`Collisions.resoudre`, `Player.move`, `Portes.maj`, `carte.maj`, caméra V2, `audio.js`, `emotes.js`).
Les chiffres marqués **(mesuré)** viennent des cartes ; ceux marqués **(estimé)** ou **(calculé)** sont les miens.

---------------------------------------------------------------------------------------------------------------------

## 0. EN UNE PAGE

1. **Le jeu.** Une partie = 6 manches ; à chaque manche Haythem change de rôle (PROP, puis CHASSEUR, puis PROP…). Une
   manche : 3 s de présentation → **cachette** (30 s sur un niveau : les chasseurs ont l'écran noir et sont figés, les
   props se déguisent et se cachent) → **traque** (3 min) → 6 s de révélation. Les props gagnent s'il en reste un
   vivant au bout du chrono ou si tous les chasseurs sont morts ; les chasseurs gagnent s'ils les trouvent tous.
2. **Composition par défaut (5 acteurs, PC comme téléphone).** Haythem PROP : Haythem + 2 props bots contre
   2 chasseurs bots. Haythem CHASSEUR : Haythem + 1 coéquipier bot (un cran moins doué) contre 3 props bots ; l'option
   « Chasseur seul » fait du coéquipier un 4e prop. Réglable de 4 à 8 acteurs (chasseurs = arrondi(N/3)).
3. **Zone de jeu au choix : le −1 (défaut), le 2e, le 1er, le rez-de-chaussée, toute l'école** (rue exclue).
   Le −1 est idéal : tabourets, mange-debout, baby-foot, distributeurs, micro-ondes, poubelles, et le rendu le moins
   cher de l'école (150 à 340 appels en haute, **mesuré**, contre 880 au départ du hall).
4. **Les déguisements sont les VRAIS meubles de l'école** : un **registre des meubles** (`js/registre_meubles.js`)
   garde, AVANT la couture du décor, un prototype `clone(true)` par type/variante (géométries et matériaux partagés :
   rendu identique, aucun programme à compiler) et la liste de TOUTES les poses d'origine (type, position, cap, boîte
   orientée, zone). ≈ 25 types, ≈ 40 variantes, ≈ 270 poses déguisables **(estimé ; compte exact rendu par le registre)**.
   Il ne coûte que des lignes `noterMeuble(...)` dans les constructeurs et deux appels `fermerRegistre` posés DANS
   `fusionnerLocal` (`ecole_portes.js` L65) et `optimiserDecor` (`kit_decor.js` L539).
5. **Le registre sert à tout** : se déguiser (prototype), dire « ce n'était qu'un vrai meuble » (boîtes des poses
   testées dans le tir), juger qu'un objet « n'est pas à sa place » (bots chasseurs), générer les **cachettes
   crédibles** (« une chaise de plus parmi les chaises » : le pas de la rangée, le cap des voisines, la distance au
   mur), et un futur réseau (un déguisement = une clé, le décor est déterministe).
6. **Le prop** : viser un meuble à moins de 3 m + **E** → on en prend la forme (géométrie, matériaux, taille, PV et
   vitesse tirés de son volume, disque de collision à son rayon, bande de hauteur à la sienne : une poubelle passe sous
   une table). Caméra 3e personne propre au prop, **verrou de rotation (R)** avec aimantation d'équerre, **se figer
   (F)**, plaquage au mur des meubles muraux, **provocation obligatoire toutes les 40 s** (8 sons synthétisés,
   spatialisés), changements de forme limités (illimités pendant la cachette, 3 pendant la traque).
7. **Bots chasseurs** (Haythem prop) : vue (pré-filtre par zones 2 µs + DDA 8 µs, **mesurés**), modèle de **soupçon**
   chiffré : ce qui bouge ou tourne (le verrou de rotation a donc un sens), ce qui est peu crédible (calculé par la même
   fonction `credibilite()` qui donne à Haythem sa jauge de DISCRÉTION), ce qui est près d'une provocation entendue ;
   fausses alertes réalistes sur les vrais meubles ; **tir de test** ; **chaque balle sur un vrai meuble coûte 3 PV**.
8. **Bots props** (Haythem chasseur) : cachettes précalculées et notées, choix d'une pièce, d'un type présent en
   doublons et d'une place alignée ; trajet par le graphe de navigation du cœur ; pose propre au sol, cap d'équerre ;
   **figés dès que Haythem peut les voir** (cadre + ligne de vue), **se déplacent quand personne ne les voit** ;
   provoquent ; fuient ou bluffent quand on les touche.
9. **Indices pour le chasseur** : provocations spatialisées (étouffées à travers une dalle), frottement d'un prop qui
   court (7 m ; marcher est silencieux), « pouf » d'un changement de forme, **portes automatiques qui s'ouvrent toutes
   seules** (les portes s'ouvrent pour tous les acteurs), **scanner** (3 charges : direction et distance approximatives
   des props à moins de 12 m), indicateur visuel des sons (option).
10. **Partage avec le cœur FPS** : même `Partie` (machine à états, manches, chrono, score, graine), mêmes acteurs et
    même COMMANDE par acteur (pivot du réseau futur), mêmes armes / tir / effets / vue FPS / HUD de combat / menus /
    navigation / bots de base. Le prop hunt ajoute : registre et déguisements, `PartieProp`, deux cerveaux (chasseur
    de props, cacheur), caméra de prop, sons de provocation, petit HUD de prop.
11. **Coût ajouté au −1 (estimé)** : ≤ 90 appels en haute (2 avatars chasseurs 24, 4 props ≤ 48, voiles 4, effets 5) ;
    processeur ≤ 1,2 ms par image en moyenne (2 chasseurs animés une fois par image, props sans avatar, IA cadencée).
12. **Travail** : 6 lots jouables, ≈ 2 800 lignes, ≈ 12 à 14 jours, APRÈS les lots du cœur FPS (entrées, `game.partie`,
    vue FPS, armes, monde/nav, bots de base, HUD, son 3D, portes pour tous). Le lot P1 (registre) et le lot P2
    (déguisement de Haythem dans la balade, `?prop=1`) ne dépendent presque de rien et peuvent partir tout de suite.

---------------------------------------------------------------------------------------------------------------------

## 1. LE JEU TEL QU'ON LE JOUE

### 1.1 Une manche où Haythem est PROP (le −1, défaut)
- **0:00 présentation (3 s)** : écran « TU ES PROP — CACHE-TOI ! », Haythem apparaît en humain (son avatar, vue 3e
  personne de prop) dans l'espace pause du −1 avec ses deux coéquipiers bots, déjà déguisés (un tabouret, une
  poubelle : les props bots n'ont jamais d'avatar). Les deux chasseurs bots (avatars des amis) sont au pied de la volée
  de tôle, figés, écran noir côté jeu.
- **cachette (30 s)** : Haythem vise un meuble (contour lumineux sur le meuble visé, aide « E : devenir le tabouret
  vert »), appuie sur E : il EST un tabouret Tolix vert, à sa taille, à son rendu. Il peut changer autant qu'il veut,
  se placer, verrouiller sa rotation (R : le cap s'aimante sur celui des tabourets voisins), se figer (F). La jauge
  DISCRÉTION (★ à ★★★★★) lui dit si sa place est crédible. À 10 s : « 10 secondes ! ». À 0 : sifflet (le `whistle()`
  de LA CAGE) « LES CHASSEURS SONT LÂCHÉS ». Un prop resté humain est déguisé d'office en le meuble le plus courant
  de sa pièce.
- **traque (3:00)** : les chasseurs fouillent pièce par pièce. Le cercle de PROVOCATION du HUD se vide en 40 s ; à
  zéro, une provocation part toute seule (le sifflet, plus fort). Haythem peut provoquer avant (T : la roue des 8 sons ;
  G : la dernière utilisée) : +5 à +10 points, ×2 si un chasseur est à moins de 10 m. L'ŒIL du HUD se remplit quand un
  chasseur le regarde et le soupçonne. S'il est touché : vignette rouge, le meuble tressaille (un vrai meuble ne
  tressaille jamais : c'est la confirmation pour le chasseur). À 0 PV : le meuble éclate (rétrécit en 0,4 s, « crac »,
  bouffée de poussière) → Haythem devient spectateur (caméra de prop sur un coéquipier vivant, clic pour changer).
- **fin** : 6 s de révélation (chaque prop survivant montré par un contour et son nom), points, manche suivante.

### 1.2 Une manche où Haythem est CHASSEUR
- **présentation (3 s)** puis **cachette** : écran noir (« LES PROPS SE CACHENT · 0:24 » + une astuce), Haythem figé,
  il peut tourner la tête. Il n'entend RIEN des props (sinon il suivrait les frottements à l'oreille).
- **traque** : vue FPS du cœur (pistolet-mitrailleur, fusil à pompe, 1 grenade). Il fouille : un tabouret de trop
  autour d'une table, une chaise moutarde tournée de travers, un distributeur dans un couloir, une porte de la pause qui
  s'ouvre toute seule, une sonnerie de téléphone étouffée « en dessous ». Chaque balle sur un vrai meuble : −3 PV et
  « VRAI MEUBLE −3 » ; sur un prop : marqueur rouge, cri, +25 % des dégâts rendus en PV. Scanner (X) : 3 charges.
- Les props bots se figent dès qu'il peut les voir, bougent dans son dos. S'il meurt (PV à zéro à force de tirer sur
  des chaises), il est spectateur jusqu'à la fin de la manche.

---------------------------------------------------------------------------------------------------------------------

## 2. LES RÈGLES CHIFFRÉES (une seule table de réglages : `REGLAGES_PROP` dans `js/jeu/partie_prop.js`)

| Règle | Valeur | Remarque |
|---|---|---|
| Manches | 6 (4 / 6 / 8 au menu) | rôle de Haythem alterné ; « Premier rôle : prop / chasseur / au hasard » |
| Présentation | 3 s | rôles affichés, acteurs posés |
| Cachette / traque | −1 et 2e : 30 s / 3:00 · 1er : 35 s / 3:30 · RDC : 40 s / 4:00 · école : 50 s / 5:30 | plus long trajet à pied entre deux apparitions de l'école : 62 m (**mesuré**) = 15 s à 4 m/s |
| Fin de manche | 6 s | révélation, points |
| PV d'un chasseur | 100 | −3 par balle de PM sur un vrai meuble déguisable, −1 par plomb (max −6 par coup) ; la grenade ne coûte rien |
| Soin du chasseur | +25 % des dégâts faits à un prop, plafond 100 | règle classique : tirer juste soigne |
| PV d'un prop | `round(clamp(40 + 90·∛V, 60, 145))`, V = volume de la boîte du meuble (m³) **(calculé)** | chaise coque 0,30 m³ → 100 ; poubelle 0,082 → 79 ; micro-ondes 0,043 → 72 ; extincteur 0,031 → 68 ; distributeur 1,21 → 136 ; baby-foot 1,45 → 142 |
| Vitesse d'un prop | `4,6 × clamp(1,15 − 0,35·∛V, 0,72, 1,05)` m/s **(calculé)** | chaise 4,2 ; poubelle 4,6 ; micro-ondes 4,7 ; distributeur 3,6 ; baby-foot 3,5 (Haythem chasseur court à 5,48, **mesuré**) |
| Marche lente d'un prop | 1,4 m/s, SILENCIEUSE | au-delà de 1,2 m/s, un frottement toutes les 0,4 m, audible à 7 m |
| Sprint d'un prop | ×1,2, endurance 100, −33/s, +15/s (3 s de sprint) | |
| Saut d'un prop | 1,8 m/s → 0,165 m, « toc » à la réception (6 m) | |
| Changements de forme | illimités pendant la cachette ; 3 pendant la traque, 5 s entre deux | « pouf » audible à 10 m ; PV gardés en PROPORTION (pas de soin par changement) |
| Provocation obligatoire | toutes les 40 s (départ décalé de 0 à 15 s par la graine) ; 20 s dans la dernière minute ; 25 s pour le dernier prop | forcée = sifflet, rayon ×1,3 |
| Provocation volontaire | 4 s de recharge ; remet le compteur à zéro | points : §2.1 |
| Grenade | 1 par chasseur et par manche, 3,5 m, dégâts 120 au centre (linéaire) | ne pénalise pas : « tester un tas de chaises » coûte une grenade |
| Scanner | 3 charges par manche, 8 s entre deux, portée 12 m, même niveau | §8.4 |
| Fin de manche | tous les props morts → chasseurs ; chrono à 0 avec ≥ 1 prop vivant → props ; tous les chasseurs morts → props | |

### 2.1 Les points (tableau des scores et classement de fin)
| Fait | Points |
|---|---|
| Prop : 30 s de survie pendant la traque | +10 |
| Prop : provocation volontaire | +5 à +10 selon le son (§8.1), ×2 si un chasseur est à moins de 10 m |
| Prop : manche survécue / dernier prop vivant | +50 / +25 |
| Chasseur : prop éliminé (le coup final) / aide (≥ 25 % des dégâts) | +100 / +40 |
| Chasseur : balle sur un vrai meuble | −2 |
| Équipe gagnante de la manche (chacun) | +50 |
Colonnes du tableau (Tab) : nom, rôle, points, props trouvés, survie (s), provocations, tirs « vrais meubles ».

---------------------------------------------------------------------------------------------------------------------

## 3. LES ZONES DE JEU

Les zones sont des ENSEMBLES DE PIÈCES (`id` des 47 zones de `carte_ecole.js` L2345-2385, lues par
`lumieres.zoneEn(x, z, y)`, `ecole_lumieres.js` L57). Les nœuds du graphe de navigation (cœur, `carte_monde` §10.1)
portent leur zone : les bots n'utilisent que les nœuds de la zone de jeu. Aux frontières, des **barrières** :
- **portes automatiques** de frontière **verrouillées** (`P.verrou = true` : `Portes.maj` les saute, `forme.off =
  false`, `k = 0`) ;
- **escaliers** (pas de porte) : des boîtes invisibles déclarées UNE fois au chargement après `construireCarte`,
  `C.ajouterBoite(..., { y0, y1, camera: false, balle: false, limite: id })` puis `off = true` ; la partie rallume
  celles de sa zone (`collisions.js` n'a pas de retrait, on éteint : piège 1.4 de `carte_monde`). Visuel : un ruban de
  chantier rouge et blanc (quads dans UN InstancedMesh, 1 appel, matériau compilé sous l'écran de chargement), et
  « Limite de la zone de jeu » au HUD au contact ;
- **l'ascenseur est hors jeu** dans toutes les zones (il ne porte que Haythem : `ecole_ascenseur.js` L442, L456) :
  ses trois passages restent fermés.

| Zone | Pièces (id) | Apparition chasseurs (monde) | Apparitions props | Barrières (passages, PLAN x ; y ; h, de `carte_monde` §7) | Rendu haute / moyenne (**mesuré**) |
|---|---|---|---|---|---|
| **−1** (défaut) | pauseSS, salleSS, hallSS, couloirSS, passageSS, sasSS, palierSSE, escalierSS, escEstSS | hallSS (1,38 ; −3,06 ; −10,87) | pauseSS (9,38 ; −3,06 ; −9,37), sasSS (15,63 ; −3,06 ; −9,62), salleSS (9,63 ; −3,06 ; −22,62) | porte grise « service (hall) » (monde 1,68 ; −5,48) verrouillée ; boîte au haut de la descente est `couloirEst|descenteEst` (17 ; 9,88 ; −0,12) | pause 342 / 187, S −1.14 149 / 80 |
| **2e** | e2couloir, e2s1, e2s2, e2palier, e2sas | e2palier (15,63 ; 6,6 ; −9,87) | e2s1, e2s2, e2couloir (§8 de `carte_monde`) | boîte `e2palier|escEst3` (16 ; 9,88 ; 6,6) | salle 1 : 321 |
| **1er** | e1pause, e1salle, e1kahn, e1couloir, e1bureau, e103, e104, e1est, palier1 | e1est (15,88 ; 3,5 ; −9,87) | e1pause (12,63 ; 3,5 ; −7,87), e1kahn (8,13 ; 3,5 ; −22,62), e1salle (2,88 ; 3,5 ; −3,37) | boîtes `escalier|palier1` (1,36 ; 9 ; 1,98) et `e1est|escEst2` (16,03 ; 10,51 ; 3,49) | pause 754 / 401, S 1.3 473, Kahn 261 |
| **RDC** | attente, hall, hallO, passage, si01, bureauB, dc, c05, c01, wcF, wcH, pmr, local, service, couloirEst, vestEst | hall (14,88 ; 0 ; −3,12) | attente (11,63 ; 0 ; −4,62), dc (5,38 ; 0 ; −15,12), hallO (4,63 ; 0 ; −6,87) | porte 6 verrouillée ; porte grise du −1 verrouillée ; boîtes `passage|rue` (3,26 ; −0,5), `escalier|hallO` (2,96 ; 9,01), `escEst|vestEst` (16 ; 11,63), `couloirEst|descenteEst` | départ 881 / 486, attente 814, hall O 1 084 / 597, DC 174 |
| **École** | tout sauf rue, porche, cage haute, ascenseur | hall | les 19 apparitions intérieures | porte 6 et `passage|rue` | jusqu'à 1 084 / 597 |

**Recommandation** : −1 par défaut (compact, ≈ 80 m² à pied **mesuré**, meubles iconiques, rendu au plus bas), 2e en
deuxième (55 chaises toutes semblables : le paradis du doublon), puis 1er (pause orange + S 1.3 + Kahn), RDC
(salle d'attente, David Clark, Si 0.1), école entière pour les longues parties. **La rue est exclue** (414 m², la moitié
du graphe, 1 708 appels en haute **mesuré**, mobilier en couleurs de sommets non encore registrable : phase 3).

---------------------------------------------------------------------------------------------------------------------

## 4. LES MEUBLES DÉGUISABLES, PIÈCE PAR PIÈCE

Tailles, triangles et matériaux **mesurés** par `carte_props` §2 (extraction d'un exemplaire) ; nombres relevés dans les
constructeurs. « Mat. » = matériaux = appels de dessin par passe. `mural` = se plaque contre un mur quand on verrouille.
« Sur place » = trop gros pour franchir les portes étroites (0,75-0,83 m, `carte_monde` piège 3) : on ne le prend que
là où on s'arrête (le bot voyage dans une petite forme puis change à sa cachette).

### 4.1 Le −1 (sol −3,06)
| Pièce | Meuble (clé) | Nb | Taille l×h×p (m) | Tri. / mat. | Constructeur (fichier : ligne) |
|---|---|---|---|---|---|
| Espace pause | tabouret Miura noir (`tabouret:miura`) | 15 | 0,61×0,86×0,53 | 337 / 1 | `ecole_soussol.js` `tabouret` L1200 (5 le long du mur vert L1281, 2+1+1+3 autour des tables L1287-1291, 3 sous le comptoir L1306, 1 sous la tablette L1402) |
| | tabouret Tolix vert (`tabouret:tolix`) | 3 | 0,59×0,76×0,57 | 380 / 2 | idem, `sorte = 'tolix'` |
| | mange-debout à colonne (`mange_debout:colonne`) | 5 | 0,62×1,06×0,60 | 400 / 2 | `mangeDebout` L1161 ; posés L1280 |
| | mange-debout trépied (`mange_debout:trepied`) | 2 | ≈ 0,64×1,06×0,64 | — / 1 | idem, L1288-1289 |
| | grande table haute en X (`table_x`) | 2 | Ø 0,80 × 1,06 | — / 1-2 | `grandeTable` L1180 ; L1287, L1291 |
| | baby-foot (`baby_foot`, sur place) | 1 | 1,05×0,93×1,48 | 758 / 7 | `babyFoot` L1233 ; L1294 |
| | distributeur (`distributeur:friandises|cafe|frais`, mural, sur place) | 3 | 0,85×1,83×0,78 | 76 / 6 | `distributeur` L1258 (corps en `B(...)` : à envelopper, §5.3) ; L1330-1332 |
| | micro-ondes (`micro_ondes:noir|blanc`) | 2 | 0,32×0,28×0,48 | 36 / 2 | boucle L1392 (`B(...)`, sur la tablette à 1,05) |
| | poubelle carrée (`poubelle:grise|bleue`, mural) | 2 | 0,36×0,63×0,36 | 24 / 2 | `poubelle` L1337 ; L1343, L1347 |
| | chaise filaire noire (`chaise_filaire`) | 1 | ≈ 0,42×0,85×0,40 | — / 1 | groupe L1405 |
| | cartons du local sombre (`carton`) | 2 | 0,65×0,5×0,5 / 0,5×0,35×0,4 | 12 / 1 | `B(...)` L1326-1327 |
| Hall du −1 | extincteur (`extincteur:ss`, mural) | 1 | 0,13×0,55×0,13 (accroché à 0,85) | — / 4 | `garnirHall` groupe `ex` L1134 |
| S −1.14 | chaise seule du meuble multimédia (`chaise_amphi`) | 1 | 0,51×0,95×0,51 | ≈ 90 / 2 | `ecole_amphi.js` L636 et suivantes (groupe) |
| | **les 97 fauteuils : NON déguisables** | 97 | | | `fauteuil` L580 : coque sur la POUTRE du rang, sans pieds — seule, elle flotterait. Les rangs sont des blocs solides (`C.ajouterBoite` L623) : on n'y entre pas |

### 4.2 Le rez-de-chaussée
| Pièce | Meuble | Nb | Taille | Constructeur |
|---|---|---|---|---|
| Salle d'attente | chaise coque DAR chromée (`chaise_coque:blanc|canard|grege|citron|noir|rose`) | 8 | 0,63×0,80×0,60 ; 5 468 tri / 3 mat. ; + son voile d'ombre | `ecole_mobilier.js` `chaise` L109 (groupe ajouté L143) ; rangées L182-184 (pas 0,7 m) |
| | borne numérique (`borne`) | 1 | ≈ 0,62×1,6×0,42 | groupe `borne` L213 |
| | présentoir à brochures (`presentoir`, mural) | 1 | 0,36×1,73×0,80 ; 190 / 2 | `presentoir` L237 ; L260 |
| Salle David Clark (Si 0.2) | chaise coque moutarde sur luge (`chaise_dc`) | 35 | ≈ 0,46×0,85×0,52 | `ecole_pieces.js` `chaiseMoutarde` L2125 (par `groupe()` L153) ; L2251, L2280, L2291, L2299, L2307 |
| | chaise visiteur bleu marine (`chaise_marine`) | 1 | ≈ 0,47×0,82×0,45 | `chaiseMarine` L2136 ; L2279 |
| Si 0.1 et bureau B | chaise de bureau (`chaise_bureau`) | 9 | 0,68×1,05×0,66 ; 1 307 / 4 | `chaiseBureau` L874 |
| | corbeille ronde (`corbeille`) | 4 | Ø 0,28×0,34 (à 0,30×0,60 inox) | `corbeille` L975 ; L1069, L1239, L1567, L2236 |
| Bureau B | plante en pot (`plante:b`) | 1 | 0,7×1,65×0,7 | `plante` L955 ; L1232 |
| | chaise luge (`chaise_luge_b`) | 3 | ≈ 0,45×0,82×0,5 | `chaiseLuge` L1255 |
| Hall (accueil) | fauteuil de l'accueil (`fauteuil_accueil:uni|zebre`) | 3 | ≈ 0,7×0,8×0,7 | `ecole_hall.js` `fauteuil` L522 ; L1365-1367 |
| | photocopieur (`copieur`, mural, sur place) | 2 | ≈ 0,6×1,15×0,6 | `copieur` L554 ; L1532 |
| | affranchisseuse (`affranchisseuse`) | 1 | petite (posée) | `affranchisseuse` L575 ; L1359 |
| Hall ouest | extincteur (`extincteur:rdc`, mural) | 1 | 0,21×0,64×0,23 ; 848 / 4 | `ecole_mobilier.js` groupe `ext` L369 |

### 4.3 Le 1er (sol 3,50)
| Pièce | Meuble | Nb | Taille | Constructeur |
|---|---|---|---|---|
| Espace pause orange | mange-debout (`mange_debout:pause1`) | 4 | ≈ 0,65×1,10×0,65 | `ecole_etage1_pause.js` `mangeDebout` L787 ; L950 |
| | tabouret Miura (`tabouret:miura1`) | 5 | 0,53×0,85×0,52 ; 456 / 1 | `miura` L820 ; L951-953 |
| | chaise coque à pieds noirs (`chaise_coque_noire:orange|menthe|lime`) | 3 | ≈ 0,63×0,80×0,60 | `coque` L848 ; L956, L966 |
| | distributeur de la niche (`distributeur:pause1`, mural, sur place) | 2 | ≈ 0,85×1,83×0,78 | niche, `ecole_etage1_pause.js` |
| S 1.3 | chaise de hêtre au visage percé (`chaise_hetre`) | ≈ 50 | 0,44×0,86×0,55 ; 692 / 3 | `chaiseHetre` L1157 ; L1190 (rentrée sous les tables doubles L1110 : rangs solides) |
| Robert Kahn (Si 1.4) | chaise de la Kahn, coque hêtre sur luge (`chaise_kahn`) | 30 | 0,49×0,85×0,55 ; 774 / 3 | `ecole_kahn.js` `chaise` L695 (dans `poste` L772) |
| Couloir, bureaux 103-104 | extincteur (`extincteur:e1`, mural) | 1 | ≈ 0,21×0,64×0,23 | `ecole_etage1.js` `extincteur` L783 ; L906 |
| | plante (`plante:e1`) | 2 | 0,7×(1,1 à 1,95)×0,7 | `plante` L793 ; L865, L886 |
| | fauteuil, chaise (`fauteuil_e1`, `chaise_e1`) | 2 / 4 | — | `fauteuil` L704, `chaise` L688 |

### 4.4 Le 2e (sol 6,60)
| Pièce | Meuble | Nb | Taille | Constructeur |
|---|---|---|---|---|
| Salles 1 et 2 | chaise coque de hêtre en écusson (`chaise_luge2:<coque>`) | 50 | 0,42×0,82×0,48 ; 654 / 3 | `ecole_etage2.js` `chaiseLuge` L1005 |
| Couloir rouge | chaise visiteur (`chaise_visiteur`) | 3 | ≈ 0,5×0,85×0,5 | `chaiseVisiteur` L968 |
| Couloir, salle 1 | extincteur (`extincteur:e2`, mural) | 2 | ≈ 0,21×0,64×0,23 | `extincteur` L729 ; L796, L1129 |

### 4.5 Non déguisables (et pourquoi)
- **Trop grands pour un disque de collision ≤ 0,5 m** : tables longues et doubles, bureaux, postes de la Kahn,
  banquettes (14 places), comptoirs, armoires, étagères — le joueur est un DISQUE (`Collisions.resoudre`, L213) : une
  table de 1,6 × 0,8 m en disque passerait dans les murs.
- **Plats ou accrochés** : radiateurs, affiches, écrans muraux, tableaux, plaques, horloges (un radiateur loin d'un mur
  ne trompe personne).
- **Sans pieds** : les 97 fauteuils sur poutre de la S −1.14.
- **Posés sur un bureau** : tours, écrans, claviers, micro-ondes SUR leur tablette — phase 2 « posables » : un petit prop
  à moins de 0,5 m d'une surface (forme `y1` entre 0,7 et 1,1 m, épaisseur < 0,1 m, sous le centre) monte dessus quand
  il se fige (glissé de 0,3 s, `y = y1`). En phase 1, un micro-ondes au sol est simplement… suspect.
- **La rue** (bancs, bacs roulants, vélos, trottinettes, motos, corbeilles : `ecole_rue_mobilier.js` L717-908) : rue
  hors jeu ; l'Atelier coud dès `ajouter` (L79) en couleurs de sommets → registrable en phase 3 par `A.debut(type)` /
  `A.fin()` (`carte_props` §3.3).

---------------------------------------------------------------------------------------------------------------------

## 5. TIRER LES MEUBLES DU DÉCOR : LE REGISTRE

### 5.1 Pourquoi pas autrement
Après le chargement, aucun meuble n'existe plus comme objet : `optimiserDecor` (`kit_decor.js` L539) coud 4 198
maillages en 232 blocs, `fusionnerLocal` (`ecole_portes.js` L65) coud chaque niveau, puis `couperParZones` réindexe
(**mesuré**, `carte_props` §1.2). Le Raycaster coûte 18-40 ms par rayon (**mesuré**). L'extraction par boîte marche
pour un meuble isolé (5-35 ms) mais ramasse le bâtiment contre un mur (plantes, extincteurs, distributeurs : justement
des meubles muraux). Le registre ne lit rien après coup : il garde ce que les constructeurs ont fait.

**Vérifié dans le code** : les deux coutures CLONENT avant de transformer (`const g = o.geometry.clone();
g.applyMatrix4(o.matrixWorld)` L519 de `kit_decor.js` ; `const q = o.geometry.clone(); q.applyMatrix4(_m)` L78 de
`ecole_portes.js`) puis retirent l'original de son groupe et appellent `dispose()` : la géométrie d'un prototype
`clone(true)` pris AVANT reste intacte (`dispose()` ne libère que les tampons de la carte graphique ; three les renvoie
au premier dessin).

### 5.2 Le module (`js/registre_meubles.js`, ≈ 110 lignes)
```js
// js/registre_meubles.js — LES MEUBLES DE L'ÉCOLE, gardés avant la couture du décor : de quoi s'en déguiser (prop hunt),
// les reconnaître (« ce n'était qu'un vrai meuble ») et savoir où ils sont (cachettes, soupçons des bots).
// Un constructeur appelle noterMeuble(type, groupe) quand il veut (même avant de remplir le groupe) ; le prototype n'est
// pris qu'à la fermeture : juste avant la couture du niveau (fusionnerLocal) ou du décor (optimiserDecor).
import * as THREE from 'three';
export const MEUBLES = { types: new Map(), poses: [], parZone: new Map(), grille: new Map(), attente: [] };
const CASE = 2, cle2 = (i, k) => (i + 32768) * 65536 + (k + 32768);
export function noterMeuble(type, objet, { variante = '', mural = false, surPlace = false, deguisable = true, nom = null } = {}) {
  MEUBLES.attente.push({ type, objet, variante, mural, surPlace, deguisable, nom });
}
// des maillages posés à plat dans le décor (les `B(...)` du −1 : distributeurs, micro-ondes, cartons) : un groupe-repère
export function noterMailles(type, mailles, { cap = 0, ...o } = {}) {
  const g = new THREE.Group(); g.userData.mailles = mailles; g.userData.cap = cap;
  MEUBLES.attente.push({ type, objet: g, ...o, variante: o.variante || '' });
}
const _b = new THREE.Box3(), _m = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
// la boîte LOCALE du meuble (repère de sa pose), sans les transparents (le voile des chaises coque : 0,84 x 0,76)
function boiteLocale(mailles, inv) {
  const B = new THREE.Box3();
  for (const m of mailles) {
    if (!m.isMesh || m.material.transparent) continue;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    _m.multiplyMatrices(inv, m.matrixWorld); B.union(_b.copy(m.geometry.boundingBox).applyMatrix4(_m));
  }
  return B;
}
export function fermerRegistre(sous = null) {
  const reste = [];
  for (const e of MEUBLES.attente) {
    // (seulement ce qui est DANS le groupe qu'on va coudre : un vantail de porte cousu entre-temps n'emporte rien)
    if (sous && !descend(e.objet, sous) && !(e.objet.userData.mailles || []).some((m) => descend(m, sous))) { reste.push(e); continue; }
    poser(e);
  }
  MEUBLES.attente = reste;
}
const descend = (o, g) => { for (let n = o; n; n = n.parent) if (n === g) return true; return false; };
function poser(e) {
  const o = e.objet, M = e.objet.userData.mailles || null;
  let mailles, pose = new THREE.Matrix4();
  if (M) {                                                      // repère : centre-bas des maillages, cap donné
    for (const m of M) m.updateWorldMatrix(true, false);
    const B = new THREE.Box3(); for (const m of M) { m.geometry.computeBoundingBox(); B.union(_b.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld)); }
    pose.compose(_p.set((B.min.x + B.max.x) / 2, B.min.y, (B.min.z + B.max.z) / 2), _q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, o.userData.cap), _s.set(1, 1, 1));
    mailles = M;
  } else { o.updateWorldMatrix(true, true); pose.copy(o.matrixWorld); mailles = []; o.traverse((m) => m.isMesh && mailles.push(m)); }
  pose.decompose(_p, _q, _s);
  const cap = new THREE.Euler().setFromQuaternion(_q, 'YXZ').y;
  _inv.copy(pose).invert();
  const cle = e.type + (e.variante ? ':' + e.variante : '');
  if (!MEUBLES.types.has(cle)) {
    const proto = new THREE.Group();                            // (géométries et matériaux PARTAGÉS : rien n'est copié)
    for (const m of mailles) { const c = m.clone(false); _m.multiplyMatrices(_inv, m.matrixWorld); _m.decompose(c.position, c.quaternion, c.scale); proto.add(c); }
    const bl = boiteLocale(mailles, _inv), t = bl.getSize(new THREE.Vector3()), V = t.x * t.y * t.z;
    MEUBLES.types.set(cle, { cle, type: e.type, variante: e.variante, nom: e.nom, proto, boite: bl, taille: t,
      rayon: Math.min(0.5, Math.max(0.15, Math.max(t.x, t.z) / 2 * 0.9)), haut: t.y, volume: V,
      pv: Math.round(Math.min(145, Math.max(60, 40 + 90 * Math.cbrt(V)))),
      vitesse: 4.6 * Math.min(1.05, Math.max(0.72, 1.15 - 0.35 * Math.cbrt(V))),
      mural: e.mural, surPlace: e.surPlace, deguisable: e.deguisable });
  }
  const T = MEUBLES.types.get(cle), b = T.boite;
  const P = { i: MEUBLES.poses.length, cle, x: _p.x, y: _p.y, z: _p.z, cap, zone: null,
    // la BOÎTE ORIENTÉE (pour les tirs, les soupçons, les cachettes) : centre monde, demi-côtés, cos/sin du cap
    cx: 0, cz: 0, hx: (b.max.x - b.min.x) / 2, hz: (b.max.z - b.min.z) / 2, y0: _p.y + b.min.y, y1: _p.y + b.max.y, c: Math.cos(cap), s: Math.sin(cap) };
  const lx = (b.min.x + b.max.x) / 2, lz = (b.min.z + b.max.z) / 2;
  P.cx = _p.x + lx * P.c + lz * P.s; P.cz = _p.z - lx * P.s + lz * P.c;
  MEUBLES.poses.push(P);
  const r = Math.hypot(P.hx, P.hz);
  for (let i = Math.floor((P.cx - r) / CASE); i <= Math.floor((P.cx + r) / CASE); i++)
    for (let k = Math.floor((P.cz - r) / CASE); k <= Math.floor((P.cz + r) / CASE); k++) {
      const q = cle2(i, k); if (!MEUBLES.grille.has(q)) MEUBLES.grille.set(q, []); MEUBLES.grille.get(q).push(P);
    }
}
// après new LumieresEcole (carte_ecole.js L2386) : la pièce de chaque pose
export function zonerRegistre(lumieres) {
  for (const P of MEUBLES.poses) {
    const Z = lumieres.zoneEn(P.cx, P.cz, P.y + 0.1); P.zone = Z ? Z.id : null;
    if (!MEUBLES.parZone.has(P.zone)) MEUBLES.parZone.set(P.zone, []); MEUBLES.parZone.get(P.zone).push(P);
  }
  console.info('[meubles] %d types, %d poses', MEUBLES.types.size, MEUBLES.poses.length);
}
export function copieMeuble(cle) {
  const T = MEUBLES.types.get(cle); if (!T) return null;
  const c = T.proto.clone(true); c.userData.meuble = cle; c.userData.dynamique = true; return c;
}
```
Notes : le prototype ne passe pas par `dedupliquerMateriaux` (il n'est pas dans la scène) : il garde un matériau
« jumeau » de même signature que celui du décor — **même clé de programme, mêmes textures : aucune compilation**.
Toute modification ultérieure d'un matériau (lumière cuite, `needsUpdate`) touche aussi le prototype, qui le partage.

### 5.3 Où se brancher (une ligne chacune ; aucune géométrie touchée)
- `js/ecole_portes.js` L65, 1re ligne de `fusionnerLocal(g)` : `fermerRegistre(g);` (import de `./registre_meubles.js`).
- `js/kit_decor.js` L539, 1re ligne de `optimiserDecor(scene)` : `fermerRegistre(scene);`.
- `js/carte_ecole.js` après L2386 (`new LumieresEcole`) : `zonerRegistre(lumieres);` ; dans le retour (L2465) :
  `meubles: MEUBLES`.
- `js/ecole_mobilier.js` : `chaise` L109 → `noterMeuble('chaise_coque', g, { variante: nomCouleur, nom: 'la chaise' })`
  avant `ch.decor.add(g)` L143 (passer le nom de la couleur à `chaise(...)`, L182-184) ; `borne` L213 ;
  `presentoir` L237 (`mural: true`) ; `ext` L369 (`'extincteur', { variante: 'rdc', mural: true }`).
- `js/ecole_soussol.js` : `mangeDebout` L1161 (`variante: type`) ; `grandeTable` L1180 ; `tabouret` L1200
  (`variante: sorte`) ; `babyFoot` L1233 (`surPlace: true`) ; `distributeur` L1258 → `noterMailles('distributeur',
  [corps, socle, façade, …], { variante, cap: Math.PI, mural: true, surPlace: true })` (garder les retours de `B(...)`,
  qui rend le maillage, L638-646) ; `poubelle` L1337 (`noterMailles`) ; micro-ondes L1392 (`noterMailles`, cap
  `Math.PI / 2`) ; chaise filaire L1405 ; cartons L1326-1327 ; extincteur `ex` L1134. Le repère `decaler(DY_P)`
  (L726) ne gêne pas : tout est lu en matrices MONDE.
- `js/ecole_amphi.js` : la chaise seule (groupe, L636 et suivantes). PAS `fauteuil` L580.
- `js/ecole_pieces.js` : un paramètre `type` facultatif à `groupe(ch, x, y, face, h, type)` (L153) qui appelle
  `noterMeuble(type, g)` → `chaiseMoutarde` L2125, `chaiseMarine` L2136, `chaiseLuge` L1255, `chaiseBureau` L874,
  `plante` L955, `corbeille` L975 passent leur type.
- `js/ecole_hall.js` : même chose dans `groupe` L483 → `fauteuil` L522 (`variante: zebre ? 'zebre' : 'uni'`),
  `copieur` L554 (`mural, surPlace`), `affranchisseuse` L575.
- `js/ecole_etage1_pause.js` : `mangeDebout` L787, `miura` L820, `coque` L848, `chaiseHetre` L1157, distributeurs de la
  niche ; `js/ecole_etage1.js` : `chaise` L688, `fauteuil` L704, `extincteur` L783, `plante` L793.
- `js/ecole_etage2.js` : `extincteur` L729, `chaiseVisiteur` L968, `chaiseLuge` L1005 (`variante` = nom de la coque).
- `js/ecole_kahn.js` : `chaise` L695.
≈ 35 lignes ajoutées dans 12 fichiers. **Contrôle de non-régression** : la ligne de console
« [optim] … 4 198 maillages cousus en 232 blocs » doit rester identique (le registre n'ajoute ni ne retire rien à la
scène), et les poses photo de référence doivent donner les mêmes images.

### 5.4 Repli sans registre (si une famille n'est pas encore instrumentée)
L'extraction par boîte de `carte_props` §3.2 (`extraireMeuble(scene, box, { sauf })`) donne un prototype (5-35 ms,
sous l'écran de chargement) ; les poses de ce type viennent alors des sièges (`ch.sieges`, liste complète à garder
AVANT le premier `carte.maj` : `ecole_etage1.js` L1046 refiltre par niveau, piège 9 de `carte_coeur`). À n'utiliser
que pour des meubles isolés (pas les muraux).

### 5.5 Préparer le rendu
Sous l'écran de chargement (étape « joueurs », `js/demarrage.js`), après `construireCarte` : un exemplaire de chaque
prototype passe par `Player.preparerRendu(o)` (`js/game.js` L186-210 : textures, programmes, ombre, contact, cran de
repli) — leurs tampons ont été libérés par la couture et seraient renvoyés en plein jeu (≈ 1 ms par meuble, **estimé**).
Idem pour : le matériau de surbrillance (§6.1), le voile de prop (§6.7), le ruban des barrières, la poussière.

---------------------------------------------------------------------------------------------------------------------

## 6. SE DÉGUISER ET VIVRE EN MEUBLE

### 6.1 Viser un meuble sans Raycaster (`viserMeuble`, `js/jeu/meubles.js`)
Rayon depuis la caméra par le centre de l'écran (un point de visée discret est affiché en mode prop). Parcours DDA des
cases de 2 m de `MEUBLES.grille` jusqu'à 6 m, test « segment contre boîte orientée » (tranches, ≈ 0,1 µs la boîte),
plus les props vivants (on peut copier un coéquipier). Retenu si : `T.deguisable`, centre de la boîte à moins de 3 m
du PROP (pas de la caméra, 2-3 m derrière), ligne libre `C.rayonLibre(propCentre → boîteCentre, 0)` (≈ 20-40 µs).
Coût : < 0,05 ms, une fois par image tant qu'on est prop (**estimé**). Surbrillance : un clone du prototype (géométrie
partagée) avec UN matériau additif `MeshBasicMaterial({ color: 0xffffff, transparent, opacity: 0.22, depthWrite:
false, blending: AdditiveBlending })` compilé au chargement, posé sur la pose visée, échelle 1,015 : 1 à 7 appels
tant qu'on vise.

### 6.2 `deguiser(jeu, acteur, cle)`
```js
// le prop prend la forme d'un meuble du registre ; refusé s'il n'y a pas la place pour son disque
function deguiser(jeu, a, cle) {
  const T = MEUBLES.types.get(cle), C = jeu.collisions, c = a.corps;
  if (!T || !C.libre(c.pos.x, c.pos.z, T.rayon, c.pos.y, hautCorps(T))) { jeu.hud.feedback('Pas la place', 'warn'); return false; }
  const ancien = a.prop;
  const racine = copieMeuble(cle);                               // (racine de la scène + dynamique : piège 1 de carte_props)
  racine.traverse((m) => { if (!m.isMesh) return; m.material = m.material.clone();   // (même programme ; pour le flash rouge)
    m.castShadow = !m.material.transparent; m.receiveShadow = true; });
  racine.add(voileProp(T));                                      // la tache douce sous le meuble (§6.7)
  jeu.scene.add(racine);
  if (ancien) retirerProp(jeu, ancien);                          // (dispose des matériaux CLONÉS seulement)
  a.prop = { cle, T, racine, cap: ancien ? ancien.cap : a.cap, capPrec: 0, verrou: false, fige: false,
    pv: ancien ? Math.round(T.pv * ancien.pv / ancien.T.pv) : T.pv,
    changements: ancien ? ancien.changements : 0, provocT: a.prop ? a.prop.provocT : null };
  c.rayon = T.rayon; c.haut = hautCorps(T);
  if (a.joueur) { a.joueur.mesh.visible = false; a.joueur.vuePremiere = false; }   // Haythem : avatar caché, pas muets
  jeu.partie.evenement({ type: 'pouf', id: a.id, x: c.pos.x, y: c.pos.y, z: c.pos.z });
  return true;
}
const hautCorps = (T) => Math.max(0.5, T.haut);                  // bande [pieds + min(0,25 ; 0,4 h), pieds + max(h, 0,5)]
```
À chaque image (`PartieProp.image`) : `racine.position` = `corps.posAff`, `racine.rotation.y` = cap interpolé ;
`racine.visible = !(zonesCachees(cam.x, cam.y, cam.z) & zoneDe(x, -z, y + 0.5))` (`ecole_visibilite.js` L115, L336 :
ce qui est ajouté après le chargement n'est jamais caché par le tri, **mesuré**) ; `castShadow` des maillages
opaques = (niveau du prop === niveau de la caméra) — changer `castShadow` d'un MAILLAGE ne recompile rien ; prop figé :
`racine.matrixAutoUpdate = false` après une dernière mise à jour.

### 6.3 Le corps d'un prop
- **Bots props : pas de `Player`, pas d'avatar** — un `CorpsProp` (`js/jeu/corps_prop.js`, ≈ 90 lignes) : `pos`,
  `vel`, `posPrec`, `posAff`, `jumpY`, `jumpVel`, `airborne`, `rayon`, `haut`, `endurance`, `memoriser()`,
  `presenter(a)` (mêmes noms que `Player` : le reste du code ne voit pas la différence). Coût ≈ 5 µs par pas
  (`deplacer` d'un pas de 6 cm 4,0 µs, `solEn` 0,68 µs, **mesurés**).
- **Haythem prop : son `Player` sert de corps** (`pos`, `vel`, `posPrec`, `memoriser`/`presenter` existent :
  `player.js` L649-668), mais la règle n'appelle PAS `p.move` ni `p.update` tant qu'il est meuble (ni pose, ni clips,
  ni pas : `couches.js` L124, L328 ; ≈ 0,3 ms par pas économisées, **mesuré** pour un Player qui marche). Redevenu
  chasseur à la manche suivante, `p.move/update` reprennent.
- **`bougerProp(c, dir, vitesse, dt)`** : l'inertie de `Player.move` (τ 0,12 s au départ, 0,08 s à l'arrêt,
  `player.js` L693-697), puis `C.deplacer(c.pos, dx, dz, c.rayon, c.vel, c.pos.y + c.jumpY, c.haut)`,
  `c.pos.y = C.solEn(c.pos.x, c.pos.z, c.pos.y)`, les bornes de la carte, le saut (1,8 m/s), l'endurance, le
  frottement tous les 0,4 m au-dessus de 1,2 m/s. Pas de rangs serrés (les rangs sont des blocs solides : les props
  restent dans les allées).
- **Une seule modification du monde solide** (`js/collisions.js`) : la bande de hauteur du corps devient un paramètre,
  par défaut celle d'aujourd'hui — `resoudre(pos, r, vel = null, pieds = 0, haut = HAUT_CORPS, bas = BAS_CORPS)`
  (L213, la ligne `const yb = pieds + bas, yh = pieds + haut`), `deplacer(..., haut, bas)` (L235, qui les passe),
  `libre(x, z, r, pieds = 0, haut, bas)` (L278). Effet voulu : un prop plus bas qu'un plateau (y0 0,73) passe dessous —
  une poubelle sous un bureau, c'est crédible.

### 6.4 La caméra du prop (`js/jeu/camera_prop.js`, ≈ 70 lignes)
La caméra V2 est faite pour Haythem (tête de l'avatar `_voitTete` L866, épaule, `p.h` L737, L1008) : le prop a la
sienne, appelée par le crochet du cœur `if (this.partie?.camera(dt, poser)) return;` en tête de `updateCamera`
(`game.js` L1005).
- pivot = `posAff + (0, max(0,5 ; 0,75 h), 0)` ; recul voulu `D = clamp(1,4 + 1,6 · max(l, h, p), 2,0, 3,6)` m ;
- direction arrière = `(sin yaw · cos pitch, sin pitch, cos yaw · cos pitch)` (convention `camYaw/camPitch` d'IRIS :
  `pitch > 0` = regard vers le bas, `carte_coeur` §5.2) ;
- `t = C.rayonLibre(pivot, voulu, 0.15)`, recul obtenu `max(0,4 ; D·t − 0,05)`, hauteur sous `plafondEn(pivot) −
  0,15` ; lissage `damp(14, dt)` ; tangage borné à **[−0,7 ; 1,25] rad** (borne par partie : `game.bornesTangage()`
  du cœur, aujourd'hui −0,1 / 0,9 en trois endroits : `game.js` L247, `manette.js` L338, `touch.js` L422) ;
- coût ≈ 0,03 ms (**estimé** : un `rayonLibre` de 3 m ≈ 20 µs + un `plafondEn` 0,8 µs).
La carte vivante suit `jeu.user.pos` (`carte_ecole.js` L2421) : c'est le corps du prop de Haythem → portes, lampes,
niveau visible restent justes. Spectateur : `game.foyer` (§12.2).

### 6.5 Rotation : libre, verrouillée, aimantée
- **Libre** (défaut) : le cap du meuble suit le lacet de la caméra, à 6 rad/s au plus (pas de saccade ; règle
  `faceTo(cible, true)` de LA CAGE, `carte_cage` §2.1). Tourner la caméra fait TOURNER LE MEUBLE : c'est visible et
  les bots le perçoivent (§9.1) — d'où le verrou.
- **R = verrouiller** : le cap se fige ; il s'**aimante** s'il est à moins de 20° d'un cap d'équerre : les caps des
  poses de même type dans la pièce (les chaises d'une rangée), puis les quatre axes du monde (les murs de l'école sont
  d'équerre sur x/z), à 4 rad/s. La caméra tourne alors librement autour.
- **Plaquage mural** (`T.mural` : extincteurs, distributeurs, poubelles, présentoir, copieurs) : au verrou, quatre
  sondes `rayonLibre` de 0,45 m (dans l'axe du cap et à ±90°) ; le mur le plus proche → le dos du meuble à 1,5 cm du
  mur, cap = normale du mur. Un extincteur mural monte à sa hauteur d'accroche (0,83 m, comme ceux du décor) : il ne
  touche plus le sol (corps figé tant qu'il est accroché).

### 6.6 Se figer (F)
Bascule : figé, le prop ne bouge plus quoi qu'on touche (on peut viser la caméra, provoquer, regarder le chrono), le
cap est verrouillé, la racine passe en `matrixAutoUpdate = false`. Se défiger prend 0,25 s et fait un léger
« craquement » (4 m). Les bots props se figent d'eux-mêmes (§10.4).

### 6.7 Ce qui trahirait un faux meuble — et ce qu'on y fait
| Différence possible | Correction |
|---|---|
| Ombre cuite du sol : les vrais meubles (sauf les coques, `horsAOSol`) assombrissent le sol cuit sous eux | `voileProp(T)` : un quad à dégradé radial (comme `matVoile`, `ecole_mobilier.js` L100), à l'empreinte du meuble, opacité 0,35 (0,2 au RDC, où les ombres de contact s'ajoutent : `ombres_contact.js` ramasse les objets dynamiques) ; 1 appel transparent |
| Voile des chaises coque | déjà dans le prototype (le voile est dans le groupe de la chaise, non cousu car transparent) |
| Matériaux | prototype = matériaux d'origine (jumeaux de même signature) : identiques |
| Visibilité par zones / par niveau | même règle de zone à la main (§6.2) |
| Interpolation (un meuble qui glisse) | figé : immobile ; en mouvement : c'est le jeu |
| Hauteur | `solEn` : posé au sol exact (pas de flottement) |
| Le prop qui tressaille quand on le touche | voulu : c'est la confirmation qu'attend le chasseur |

---------------------------------------------------------------------------------------------------------------------

## 7. TIRER EN PROP HUNT

### 7.1 Résolution d'un tir (le tir du cœur + deux listes)
Le cœur FPS fournit `monde.balle(ax, ay, az, dx, dy, dz, portee) → { t, point, normale, forme | sol }` (DDA de la
grille, formes `camera || joueur` sauf `balle: false`, sols compris : `carte_monde` §10.1) et les capsules des corps.
Le prop hunt ajoute, dans `armes.surTir` :
```js
// le plus proche des trois : le monde, un prop vivant (sa boîte orientée), un VRAI meuble déguisable (une pose)
const m = monde.balle(o.x, o.y, o.z, d.x, d.y, d.z, 60);
const p = toucherProps(partie.props, o, d, m.t);                 // ≤ 8 boîtes : < 2 µs
const v = toucherPoses(MEUBLES, o, d, Math.min(m.t, p ? p.t : Infinity) + 0.03);   // DDA de MEUBLES.grille jusqu'à t
if (p && (!v || p.t <= v.t)) degatsProp(p.acteur, degats, tireur);            // prop : dégâts, soin du tireur
else if (v && MEUBLES.types.get(v.pose.cle).deguisable) fauxMeuble(tireur, v);   // vrai meuble : −3 PV, « VRAI MEUBLE »
else impactMonde(m);                                                          // mur, sol, table : décalque (cœur)
```
- **Pourquoi `+ 0,03`** : les formes du monde solide des meubles sont grossières (UNE boîte pour la rangée de la salle
  d'attente, `ecole_mobilier.js` L186 ; un cercle de 0,17 m par chaise de la David Clark, `ecole_pieces.js` L2130) ;
  la boîte de la pose enveloppe le meuble : touchée au même endroit (à 3 cm près) que la forme, c'est le meuble qui
  compte. Entre deux chaises d'une rangée (le jour de 7 cm), c'est la boîte de rangée : « raté ».
- **Pas de décalque sur un meuble** (sa boîte orientée n'est pas sa surface : `carte_props` §5.2) : étincelles,
  « poc » sec, éclat de bois/plastique selon le matériau, marqueur gris « VRAI MEUBLE −3 ».
- **Sur un prop** : marqueur rouge, son « aïe » synthétisé, le meuble tressaille 0,15 s (±3° en roulis), ses
  matériaux clonés virent au rouge 80 ms (`emissive`, un uniforme : aucune recompilation).
- **Grenade** : dégâts aux props dans 3,5 m (ligne libre du centre de l'explosion à leur centre), aucune pénalité.
- Coût : tir du cœur 18-106 µs (**mesuré**) + poses ≈ 3-6 µs (**estimé**) ; un fusil à pompe de 8 plombs < 1 ms.

### 7.2 Les PV, la mort
Prop à 0 PV : `racine` rétrécit en 0,4 s, bouffée de poussière (8 quads dans un InstancedMesh préparé), « crac »,
fil des éliminations du cœur (`HUD.elimination(tueur, arme, victime)` : « Gabriel ✕ Haythem (le tabouret vert) »).
Chasseur à 0 PV (trop de vrais meubles touchés) : poupée de chiffon du cœur (`banc/ragdoll.js` → `js/poupee.js`),
« Imad s'est perdu dans les chaises ».

---------------------------------------------------------------------------------------------------------------------

## 8. LES INDICES ET LES SONS

### 8.1 Les provocations (8 sons, tout synthétisé comme `js/audio.js` : aucun fichier, aucune licence)
| # | Son | Durée | Rayon | Points | Fabrication (briques `_osc` L54, `_noise` L68) |
|---|---|---|---|---|---|
| 1 | « Coucou ! » sifflé | 0,6 s | 18 m | 5 | deux sinusoïdes 1 320 → 1 100 Hz |
| 2 | Sifflet d'arbitre (forcée par défaut) | 0,7 s | 22 m (×1,3 forcée) | 6 | `whistle()` de LA CAGE `audio.js` L234, recopié |
| 3 | Klaxon pouet-pouet | 0,8 s | 25 m | 7 | carrée 420 Hz ×2, filtre passe-bas |
| 4 | Canard coin-coin | 0,9 s | 18 m | 5 | dent de scie 600 → 380 Hz + bruit bande 1 kHz |
| 5 | Rire « hihihi » | 1,2 s | 20 m | 6 | 5 coups triangle 900-1 100 Hz, formants |
| 6 | **Sonnerie de l'école** | 1,6 s | 30 m | 10 | cloche électrique : carrée 980 Hz modulée à 22 Hz |
| 7 | Ba-dum-tss | 1,0 s | 22 m | 7 | deux sinus graves + bruit aigu (la cymbale) |
| 8 | Sonnerie de téléphone « Allô ? » | 1,4 s | 26 m | 8 | double tonalité 1 200/1 500 Hz en salves (le téléphone de Haythem, `js/phone.js`) |
La roue des provocations est la roue des emotes (`EmoteWheel`, `ui.js` L315 ; `updateEmoteInput`, `game.js` L408)
avec une autre liste (`setList`) ; T l'ouvre, 1-8 ou la souris choisit. **Le piège n° 1 de `carte_coeur`
(touches chiffres non liées → emote fantôme) doit être corrigé avant** : il lancerait une provocation fantôme.

### 8.2 Le son 3D (fourni par le cœur, indispensable ici)
`AudioFX` n'a ni gauche/droite ni orientation (`setListener(p)` L16, `_attCorps` L87, **constaté**). Le cœur ajoute
`audio.son3d(pos, jouer)` : un `PannerNode` (HRTF sur PC, `equalpower` au téléphone), l'orientation de l'auditeur
posée par image. Pour le prop hunt : **à travers une dalle** (bande de niveau différente, `ecole_visibilite.js` L52),
volume ×0,35 et passe-bas 900 Hz : « ça vient d'en dessous ». Les bots « entendent » par la même règle (§9.2).
Option d'accessibilité **« Voir les sons »** (défaut : activée au téléphone) : un arc au bord de l'écran dans la
direction de chaque provocation, 2 s.

### 8.3 Les autres indices
- **Frottement** d'un prop qui va à plus de 1,2 m/s : un bruit filtré toutes les 0,4 m, audible à 7 m. Marcher (1,4 m/s,
  touche de marche ou manche à peine poussé) est silencieux : on peut ramper, lentement.
- **« Pouf »** d'un changement de forme : 10 m.
- **Les portes automatiques s'ouvrent pour TOUS les acteurs** (évolution du cœur : `Portes.maj(dt, acteurs, cam)`,
  `ecole_portes.js` L580, 5 µs par acteur **mesuré**, appel `carte_ecole.js` L2446) : une porte de la pause qui
  s'ouvre seule, c'est un prop qui passe. Les vantaux sont des objets du décor : rien à ajouter.
- **Pendant la cachette, les chasseurs n'entendent aucun son de prop** (règle d'équité).

### 8.4 Le scanner (chasseur, X / croix ← / bouton SCAN)
3 charges par manche, 8 s entre deux. Une onde (anneau au HUD + bip) : pendant 2 s, pour chaque prop vivant à moins de
12 m et au même niveau, un arc au bord du réticule dans sa direction ±20° (bruit tiré par la graine) et une teinte par
distance (< 4 m rouge, < 8 m orange, < 12 m jaune). Il ne désigne jamais un meuble. Il s'entend : les props à moins de
12 m entendent « bip » (les bots en profitent pour bouger, §10.4). Coût : 4 distances, rien d'autre.

---------------------------------------------------------------------------------------------------------------------

## 9. LES BOTS CHASSEURS (quand Haythem est prop)

Corps : `Player` du cœur avec un avatar d'ami (`assets/tel/<nom>.glb` même sur PC : 19-27 Mo de textures au lieu de
47-79, **mesuré**), armes et pose d'arme procédurale du cœur (`banc/armer.js`, 0,17 ms), animé UNE fois par image.
Cerveau : `CerveauChasseurProp` (`js/jeu/ia_prop.js`) par-dessus la base des bots du cœur (chemin A*, suivi « ficelle »
par balayage `C.deplacer`, visée, tir).

### 9.1 La vue et le soupçon (5 Hz par bot, un bot par image)
```js
// pour chaque candidat : les props vivants ET les poses d'origine des pièces voisines (MEUBLES.parZone) — les mêmes
// tests pour les deux : un bot ne « sait » pas qui est un prop, il juge ce qu'il voit
const H = zonesCachees(oeil.x, oeil.y, oeil.z);                  // une fois (ordre x, hauteur, z : L336)
for (const o of candidats) {
  if (H & o.bit) continue;                                       // pré-filtre : 39 % rejetés en 2 µs, jamais à tort (mesuré)
  const d = dist(oeil, o.centre); if (d > 18) continue;
  const a = angle(bot.regard, o.centre - oeil); if (a > 0.87) continue;      // cône de 100°
  if (!monde.vue(oeil, o.centre)) continue;                      // DDA 7,9 µs (mesuré), vitres transparentes
  const att = (a < 0.26 ? 1 : 0.5) * (bot.etat === 'fouille' ? 1.5 : 1) * (1 + 2 * bot.alerte(o.centre));
  let lam = R.K[diff] * (1 - o.cred) ** 2 * clamp(1 - (d - 3) / 12, 0, 1) * att;
  if (o.prop && (o.v > 0.25 || o.w > 0.6)) lam += 2.5;           // il BOUGE ou TOURNE sous ses yeux
  bot.soupcon.ajouter(o, lam * 100 * dtPercep);
}
```
- **`o.cred`** d'un prop = `credibilite(cle, x, z, cap, zone)` (§9.4), recalculée quand il s'arrête ou tourne ; d'un
  vrai meuble = `1 − ε`, ε tiré par la graine pour chaque (bot, pose) en début de manche, ε ∈ [0 ; εmax(diff)] : les
  **fausses alertes** viennent de là, surtout près d'un son entendu (`alerte` ×3). Chiffres (**calculés**, Normal,
  K = 0,6, à 4 m, regard central) : prop parfaitement placé (cred 0,9) → 0,6 point/s : 166 s d'observation pour
  tirer = invisible ; chaise au milieu d'un couloir (cred 0,3) → 29 points/s : tir en 3,4 s ; distributeur dans un
  escalier (cred 0) → 60 points/s : 1,7 s ; vrai meuble au pire (ε 0,25) → 3,8 points/s, 11 près d'une provocation
  récente : un tir de test au bout de 9 s s'il reste à le fixer — c'est la chaise qu'on « soupçonne pour rien ».
- `o.v`, `o.w` : vitesse et vitesse de rotation affichées du prop (la rotation libre se voit : il faut verrouiller).
- Coût : ≈ 40 candidats, ≈ 15 passent le cône → ≈ 0,15 ms par perception, 5 Hz, 2 bots → 1,5 ms par seconde
  (**estimé**).

### 9.2 L'ouïe
Chaque son de prop (provocation, frottement, pouf, défigement) crée chez chaque bot une **piste** `{ x, y, z, force,
t }` : à portée (×0,7 / 1 / 1,2 selon la difficulté), même niveau ou à travers une dalle (force ×0,35, erreur +3 m),
position estimée = vraie + bruit gaussien d'écart σ = (0,15 / 0,08 / 0,05)·d (graine). Les pistes s'éteignent en 20 s.

### 9.3 La machine à états
| État | Fait | Sort vers |
|---|---|---|
| ATTENTE | cachette : figé, aveugle | PATROUILLE au sifflet |
| PATROUILLE | choisit une pièce : score = (poses + cachettes de la pièce) × âge de la dernière visite + 3 × pistes ; y va | FOUILLE à l'arrivée ; ENQUÊTE sur piste fraîche |
| FOUILLE | va aux 1 à 3 **points d'observation** de la pièce (nœuds qui voient le plus de poses : précalcul ≈ 10 ms par pièce **estimé**), balaye le regard vers les grappes de meubles 2-4 s | PATROUILLE ; SUSPECT si soupçon ≥ 60 |
| ENQUÊTE | va à 4-6 m de la position estimée d'une piste, fouille centrée dessus | FOUILLE / SUSPECT |
| SUSPECT | s'approche à 3-6 m, fixe l'objet (attention 1) | TIR_TEST à ≥ 100 ; FOUILLE si le soupçon retombe |
| TIR_TEST | fusil à pompe sous 6 m, sinon PM ; 1 / 2 / 3 balles | TRAQUE si prop touché ; sinon l'objet est « vérifié » (soupçon −200, 30 / 60 / 90 s) → FOUILLE |
| TRAQUE | feu soutenu avec l'erreur de visée, poursuite à la dernière position vue | ENQUÊTE après 3 s sans le voir |
| Prudent (PV < 25) | seuil de tir de test 140 au lieu de 100 | |

### 9.4 La crédibilité (une seule fonction, aussi la jauge DISCRÉTION de Haythem)
```js
// js/jeu/meubles.js — à quel point un meuble de type `cle` posé là « est à sa place » (0 = absurde, 1 = parfait)
export function credibilite(cle, x, z, y, cap, zone, { contreMur = false } = {}) {
  const T = MEUBLES.types.get(cle), memes = (MEUBLES.parZone.get(zone) || []).filter((p) => p.cle.split(':')[0] === T.type);
  let k = memes.length ? 0.35 : memeTypeAuNiveau(T.type, y) ? 0.15 : 0;
  const pres = memes.map((p) => [p, Math.hypot(p.x - x, p.z - z)]).filter(([, d]) => d < 2).sort((a, b) => a[1] - b[1]);
  k += Math.min(pres.length, 3) / 3 * 0.2;                                         // des semblables tout près
  if (pres.length) {
    const [v, d] = pres[0], dc = Math.abs(angle(cap - v.cap)) % (Math.PI / 2);   // (une chaise tournée de 90° dans une rangée : faux)
    k += Math.abs(angle(cap - v.cap)) < 0.21 ? 0.15 : Math.abs(angle(cap - v.cap)) < 0.44 ? 0.07 : 0;
    k += Math.abs(d - pasRangee(v)) < 0.12 ? 0.1 : 0;                             // au pas de la rangée
  } else if (T.mural && contreMur) k += 0.15;
  k += distPassage(x, z, y) > 0.9 ? 0.1 : -0.2;                                   // pas dans une porte, un passage
  k += enPleinCouloir(x, z, y, zone) ? -0.2 : 0;                                  // couloir, à plus de 0,8 m des murs
  return Math.max(0, Math.min(1, k + 0.1));                                       // (+0,1 : posé au sol, sans mur traversé)
}
```
`pasRangee(v)` : médiane des distances de chaque pose à sa plus proche semblable de la pièce (0,7 m dans la salle
d'attente, 0,62 dans la David Clark : précalculé). `distPassage` : distance au plus proche des 46 passages et des
centres de portes. Jauge de Haythem : ★ = `ceil(5 · cred)`, recalculée 4 fois par seconde. **C'est la même formule
que celle des bots : la jauge apprend à se cacher.**

### 9.5 Difficulté des chasseurs
| Réglage | Facile | Normal | Difficile |
|---|---|---|---|
| K (détection) | 0,25 /s | 0,6 /s | 1,2 /s |
| εmax (fausses alertes) | 0,35 | 0,25 | 0,12 |
| Balles par tir de test | 1 | 2 | 3 |
| Erreur de visée / réaction | 3,5° / 0,6 s | 1,8° / 0,4 s | 0,8° / 0,25 s |
| Ouïe (portée, σ) | ×0,7, 0,15·d | ×1, 0,08·d | ×1,2, 0,05·d |
| Mémoire « vérifié » | 30 s | 60 s | 90 s |
| Grenade | non | non | sur une grappe de soupçons ≥ 60 |
| Coéquipier de Haythem (chasseur) | Facile | Facile | Normal |
Jamais de bonus de vitesse (se voit, `carte_cage` piège 14).

---------------------------------------------------------------------------------------------------------------------

## 10. LES BOTS PROPS (quand Haythem est chasseur)

Corps : `CorpsProp` + copie du meuble ; **jamais d'avatar** (déguisés dès l'apparition, en le type le plus courant de
leur pièce de départ). Cerveau : `CerveauCacheur` (`js/jeu/ia_prop.js`).

### 10.1 Les cachettes (précalculées une fois par zone de jeu, au lancement de la partie)
```js
// pour chaque pose déguisable de la zone : 4 à 8 places voisines où UN DE PLUS serait crédible
for (const P of posesDeLaZone) {
  const T = MEUBLES.types.get(P.cle), pas = pasRangee(P), ax = axeRangee(P);   // (vers la plus proche semblable)
  const cands = [decal(P, ax, pas), decal(P, ax, -pas), decal(P, ax, 2 * pas), decal(P, ax, -2 * pas),
                 rang(P, 0.9), rang(P, -0.9), ...autourDeLaTable(P, [-40, 40]), ...leLongDuMur(P, [-0.6, 0.6, -1.2, 1.2])];
  for (const c of cands) {
    if (!C.libre(c.x, c.z, T.rayon, P.y, hautCorps(T))) continue;              // 3,7 µs (mesuré)
    if (Math.abs(C.solEn(c.x, c.z, P.y + 0.3) - P.y) > 0.05) continue;          // même sol
    if (chevauchePose(c, T) || distPassage(c.x, c.z, P.y) < 0.9) continue;      // pas sur un vrai meuble, pas dans une porte
    if (!nav.proche(c.x, P.y, c.z, 0.35)) continue;                             // atteignable (graphe du cœur)
    cachettes.push({ cle: P.cle, x: c.x, y: P.y, z: c.z, cap: P.cap, zone: P.zone, cred: credibilite(P.cle, c.x, c.z, P.y, P.cap, P.zone) });
  }
}
// + la couverture : quelle part des points d'observation de la zone voit chaque cachette (masque de bits)
```
Coût (**estimé**) : −1 ≈ 40 poses × 8 = 320 essais (≈ 5 ms) + couverture ≈ 200 cachettes × 12 points × 8 µs = 19 ms ;
école entière ≈ 270 poses → ≈ 60 ms + 0,3 s de couverture (faite par lots de 5 ms sous l'écran de présentation).

### 10.2 Le choix (au début de la cachette, graine de la manche)
`score = 0,6·cred + 0,25·(1 − couverture) + 0,15·éloignement(apparition des chasseurs) − 0,3 (même cachette qu'une
manche précédente) − 0,4 (un autre prop à moins de 3 m)`. Type : pondéré par le nombre de poses du type dans la pièce
(les doublons : 35 moutarde en David Clark, 18 tabourets au −1, 50 chaises au 2e), ×0,5 si `surPlace`, jamais deux
props du même type dans la même pièce en Facile/Normal. Qualité : Facile tire parmi la meilleure moitié, Normal parmi
les 20 % meilleures, Difficile parmi les 5 %.

### 10.3 Le trajet et la pose
A* sur le graphe du cœur (rayon 0,3 ; 2,7 ms en moyenne, **mesuré**), file d'attente commune (un chemin par image au
plus) ; suivi par balayage (100 % d'arrivées portes ouvertes, **mesuré**). Le bot voyage dans sa forme de départ
(petite) ; à 0,15 m de la cachette : glissé de 0,3 s jusqu'au point exact, cap tourné vers celui de la cachette
(4 rad/s), changement de forme si le type final est autre (gratuit pendant la cachette), `y = solEn`, FIGÉ. Mural :
plaqué (§6.5).

### 10.4 Vu / pas vu, bouger, provoquer, fuir (4 Hz par bot)
- **Vu** = dans le cadre de la caméra de Haythem (angle < demi-champ + 10 %) ET `monde.vue(caméra, centre)` ET < 30 m
  (ou vu par le coéquipier chasseur, même test depuis son œil). Coût : 2 chasseurs × 8 µs.
- **Vu en mouvement → se fige** après 0,5 / 0,25 / 0,1 s (Facile / Normal / Difficile) — là où il est, même au
  milieu d'un couloir (sa crédibilité chute : c'est la chance du chasseur).
- **Bouger** quand il n'est vu par personne et qu'il y a « pression » : un chasseur à moins de 6 m qui s'approche, un
  tir à moins de 4 m, le bip du scanner, une provocation qu'il vient de faire près d'un chasseur, ou 70 à 110 s au même
  endroit (Normal, Difficile). Nouvelle cachette à moins de 15 m de chemin, non vue maintenant, dont le CHEMIN n'est
  vu par aucun chasseur (points tous les 1 m testés : ≈ 0,25 ms, à la décision). Course si personne n'est à moins de
  7 m, sinon marche silencieuse. Facile ne se déplace jamais après la cachette.
- **Provoquer** : forcée (règle) ; volontaire quand aucun chasseur à moins de 12 m et qu'il n'est pas vu : jamais /
  1 par minute / 1 toutes les 40 s (longues provocations quand les chasseurs sont loin).
- **Touché** : sous 50 % de PV, fuit (sprint vers une cachette hors de vue) 80 % / 50 % / 30 % du temps, sinon bluffe
  (reste figé : un vrai meuble ne bouge pas, c'est le pari).

### 10.5 Le coéquipier chasseur de Haythem
`CerveauChasseurProp` en difficulté « Coéquipier » (§9.5) : il fouille d'autres pièces que Haythem (pénalité de score
de pièce si Haythem y est ou y était il y a < 20 s), ses éliminations rapportent à l'équipe.

---------------------------------------------------------------------------------------------------------------------

## 11. HAYTHEM CHASSEUR : CE QUI CHANGE PAR RAPPORT AU FPS
- **Aveuglement** : un voile HTML `#voile-cachette` (fond noir opaque, z-index 12 : au-dessus du canvas, sous le HUD
  de texte), compte à rebours, astuce tirée d'une liste ; commandes ignorées sauf le regard ; le rendu continue (la
  qualité auto peut s'ajuster pendant ce temps : `fx.calme = true` en cachette, `false` en traque — `game.js` L487,
  `_remonter` `fx.js` L1805). Ne PAS se servir de `fx.flash` (voile BLANC, `fx.js` L647).
- **Armes de la manche** : PM (11 coups/s, 14 dégâts, 30 + 150) et fusil à pompe (8 plombs × 9, 1,1 coup/s, 6 + 24)
  du cœur, 1 grenade, pas de couteau (il servirait à « tâter » les meubles sans pénalité). Le coéquipier bot a le même
  équipement.
- **Retours** : marqueur de touche rouge/gris, « VRAI MEUBLE −3 » (`HUD.feedback`, `ui.js` L288 : il fait vibrer la
  manette), PV au HUD, scanner.

---------------------------------------------------------------------------------------------------------------------

## 12. L'ARCHITECTURE

### 12.1 Fichiers (le dossier `js/jeu/` du cœur, `carte_monde` §10.1 ; noms à harmoniser avec la conception FPS)
| Fichier | Rôle | Lignes (estimé) |
|---|---|---|
| `js/registre_meubles.js` | §5.2 (importé par les modules de la carte : à la racine de `js/`) | 110 |
| `js/jeu/meubles.js` | `viserMeuble`, `deguiser`, `retirerProp`, `voileProp`, `credibilite`, `pasRangee`, `distPassage`, cachettes | 450 |
| `js/jeu/corps_prop.js` | `CorpsProp`, `bougerProp`, saut, frottement, plaquage mural | 180 |
| `js/jeu/camera_prop.js` | caméra 3e personne de prop et de spectateur | 90 |
| `js/jeu/partie_prop.js` | `PartieProp extends Partie` : phases, rôles, composition, provocations forcées, points, fin de manche, `REGLAGES_PROP`, `etat()/appliquer()` | 550 |
| `js/jeu/ia_prop.js` | `CerveauChasseurProp`, `CerveauCacheur` | 700 |
| `js/jeu/sons_prop.js` | 8 provocations, frottement, pouf, bips, « aïe », « crac » (par `audio.son3d`) | 160 |
| `js/jeu/hud_prop.js` | forme, changements, verrou/figé, provocation, discrétion, œil, scanner, voile de cachette, étiquettes d'alliés, révélation | 250 |
| index.html / css | blocs du HUD de prop, écran PROP HUNT du menu | 120 |
| Retouches (collisions, portes, kit_decor, carte, constructeurs, settings, touch, manette_menus, sw.js) | §5.3, §6.3, §13 | 90 |
| **Total** | | **≈ 2 700-2 800** |

### 12.2 Ce que le prop hunt demande au cœur (déjà prévu par `carte_coeur` §7, rappelé ici)
- `game.partie` avec ses crochets : `update` L507 (`partie.pas(dt)` après les `memoriser`), `interpoler` L502
  (`presenter` de tous les acteurs : `Player` et `CorpsProp`), `updateCamera` L1005 (`partie.camera`), `frame` L444
  (touches `camera` L453-458 et `phone` L452 ignorées en partie ; `partie.image(dt)` ; `fx.calme` L487),
  `togglePause` L432 (boutons de la règle) ; `mode` reste `'lobby'` (14 lectures).
- **`game.foyer`** (petit ajout) : l'acteur que suit la caméra (Haythem, ou celui qu'il regarde en spectateur) ;
  `carte_ecole.js` L2421 lit `(jeu.foyer || jeu.user).pos` — portes, lampes, niveau visible suivent ce qu'on regarde
  (piège 11 de `carte_coeur`).
- `Input` : souris, profils de touches, purge des fronts non liés et à la reprise (les pièges 1 et 2 de
  `carte_coeur`, vérifiés en jeu) ; `pointerlockchange`.
- `monde.js` : `balle()`, `vue()`, graphe de navigation par zone, A*, suivi ; `Portes.maj` pour tous + `verrou` ;
  ascenseur hors bots.
- `audio.son3d`, `armes.js` avec un crochet `surTir`, effets (impacts, traceurs), `hud_combat.js` (réticule, PV,
  munitions, chrono/manche, fil, tableau des scores, écran de fin), menu principal.

### 12.3 Le partage avec le FPS, brique par brique
| Brique du cœur | Utilisée par le prop hunt | Ce que le prop hunt y ajoute |
|---|---|---|
| `Partie` (états `decompte → manche → fin_manche → fin`, chrono, scores, `rng` à graine, `etat()/appliquer()`) | `PartieProp extends Partie` | sous-phases `cachette`/`traque`, rôles alternés, composition, règles de fin |
| Acteur + COMMANDE par acteur | chasseurs = acteurs FPS ; props = acteurs à `CorpsProp` (ou `Player` en veille) | champs de commande `deguiser`, `verrou`, `figer`, `provoc` (−1 ou 0-7), `scanner` |
| `armes.js`, tir, effets | chasseurs | `surTir` : props, poses, pénalité, soin ; pas de décalque sur meuble |
| `vue_fps.js` | Haythem chasseur | rien |
| `monde.js` (balle, vue, nav, A*, suivi) | les deux cerveaux, les cachettes | grille des poses ; graphe filtré par zone de jeu ; barrières |
| Bots de base (`bots.js` : chemin, suivi, visée, tir, perception) | chasseurs bots ; déplacement des props bots | `CerveauChasseurProp`, `CerveauCacheur` |
| `hud_combat.js` | réticule, PV, munitions, chrono, fil, tableau, fin de manche | `hud_prop.js` (petit) |
| Menus (principal, pause, options COMBAT) | entrée PROP HUNT | écran de réglages PROP HUNT |
| `audio.son3d` | provocations, frottements, pas des chasseurs | `sons_prop.js` |
| `Portes.maj` pour tous | indice « porte qui s'ouvre seule » | `verrou` des portes de frontière |

### 12.4 La commande et l'application
```js
// une commande par acteur et par pas (union FPS + prop) : la seule chose que la simulation lit de l'extérieur
{ seq, axe: { x, y }, amp, sprint, marche, saut, yaw, pitch,
  tir, visee, recharger, arme, grenade,                         // chasseur (cœur)
  deguiser, verrou, figer, provoc, scanner }                    // prop hunt (fronts consommés une fois)
// PartieProp.appliquer(a, c, dt) :
//  prop    → c.deguiser : viserMeuble(a, c.yaw, c.pitch) puis deguiser() ; c.verrou / c.figer : bascules ;
//            c.provoc ≥ 0 : provoquer(a, c.provoc) ; bougerProp(a.corps, dirDe(c), vitesse(a, c), dt) si non figé ;
//            cap : libre → vers c.yaw à 6 rad/s, verrouillé → aimanté
//  chasseur → mouvement FPS du cœur + armes (surTir) + c.scanner
```
L'hôte (plus tard) résout lui-même ce que vise `deguiser` à partir de `yaw/pitch` : même fonction, même registre.

### 12.5 L'état sérialisable (`PartieProp.etat()`, ≈ 1 Ko en JSON pour 5 acteurs)
```js
{ v: 1, tick, graine, zone: '-1', phase: 'cachette' | 'traque' | ..., t, manche, nManches, roleHaythem,
  scores: { [id]: { pts, trouves, survie, provocs, rates } },
  acteurs: [{ id, nom, avatar | null, role: 'prop' | 'chasseur', vivant, pv, x, y, z, vx, vz, cap,
              yaw, pitch, arme, chargeur, reserve, grenades, scanner,                         // chasseur
              prop: { cle, verrou, fige, changements, provocT } | null }],                     // prop
  portes: [{ i, k, sens, verrou }], barrieres: [id],
  evenements: [{ t, type: 'provoc' | 'pouf' | 'frottement' | 'tir' | 'touche' | 'faux' | 'elim' | 'scan', ... }] }
```
Tout le reste se recalcule chez chacun : registre, cachettes, graphe (déterministes : construits par le code). Tous
les tirages de règle par `jeu.rnd()` (le `Rng` de `net.js` de LA CAGE, `carte_cage` §6.1) ; l'IA ne tourne que chez
l'hôte. À 20 images/s : ≈ 20 Ko/s, sous la limite de 8 192 octets par message du relais (`carte_cage` §2.3).

### 12.6 Ordre d'un pas de `PartieProp.pas(dt)` (120 Hz)
1. chrono, sous-phases, provocations forcées (compteurs par prop) ;
2. commandes : Haythem (`lireCommande(input)` du cœur) ; bots (`cerveau.commande(dt)`) — perception 5 Hz et décisions
   4 Hz étalées (un bot par image), chemins par la file A* commune ;
3. application (§12.4) ; chasseurs `Player` : `move` à chaque pas, `update` (pose) une fois par image
   (`Player.poseVisible`, `carte_cage` §2.4) ;
4. contacts entre corps (disques, `updateContacts` de LA CAGE `game.js` L2170) ;
5. morts, fin de manche, points ; `tick++`.
`image(dt)` : racines des props (position, cap, visibilité, ombre), surbrillance, HUD, étiquettes.

---------------------------------------------------------------------------------------------------------------------

## 13. HUD, MENUS, COMMANDES

### 13.1 Actions (groupe « Prop hunt » de `ACTIONS`, `settings.js` L8-23 ; profil de touches « prop » à côté des
profils « balade » et « combat » du cœur — un code partagé est consommé par la première action qui le lit, `_take`
`input.js` L69-75)
| id | Libellé | Clavier (AZERTY) | Manette | Tactile |
|---|---|---|---|---|
| `deguiser` | Se déguiser (viser + appuyer) | E, Clic G | X | DÉGUISER (xl, allumé quand un meuble est visé) |
| `verrou` | Verrouiller la rotation | R | Y | VERROU (u) |
| `figer` | Se figer | F, Clic D | B | FIGER (l) |
| `provoquer` | Roue des provocations | T | LB (tenir) | 📢 (appui long) |
| `provoc_vite` | Dernière provocation | G, Molette | RB | 📢 (appui bref) |
| `scanner` | Scanner (chasseur) | X | croix ← | SCAN |
| (cœur) | sprint / marche / saut / pause / scores | Maj / Alt G, W / Espace / Échap / Tab | L3 / — / A / Start / Back | |
Le téléphone (P) et la touche `camera` (C) sont coupés en partie. Tactile : `_contexte()` (`touch.js` L224-238) rend la
grappe du rôle ; manette : rien à coder pour les boutons (codes `Pad:*`), écran PROP HUNT ajouté à `RACINES` / `DEFAUTS`
(`manette_menus.js` L16-20).

### 13.2 HUD de prop (`#hud-prop` sous `#hud`, `index.html` L207-216, `pointer-events: none`)
Forme (icône + « le tabouret vert »), changements restants ●●○, 🔒 / ❄, anneau de provocation (« 0:12 »), DISCRÉTION
★★★☆☆, ŒIL de repérage (le plus fort soupçon d'un chasseur qui le voit, 0 → 100 %, « REPÉRÉ ! » au-delà de 70 %),
étiquettes des alliés (nom au-dessus de chaque prop allié, projeté par image, ≤ 4), point de visée et aide « E :
devenir … ». Le DOM n'est touché que quand une valeur change (règle de `HUD.stamina`, `ui.js` L293-296).
HUD commun (cœur) : bandeau de manche « PROPS 3 · CHASSEURS 2 · 2:41 », PV, munitions, fil, tableau (Tab).

### 13.3 Écran PROP HUNT (menu principal du cœur → PROP HUNT)
Zone (−1 / 2e / 1er / RDC / École) · Manches (4 / 6 / 8) · Acteurs (4 à 8) · Difficulté (Facile / Normal / Difficile) ·
Premier rôle (Prop / Chasseur / Au hasard) · Chasseur seul (oui / non) · Aides : Discrétion, Œil, Voir les sons.
Réglages gardés dans `settings.game.prophunt` (clé `iris.settings.v1`, `settings.js` L58). Écran de fin : classement
(portraits des amis par `portrait(def)` de LA CAGE, `portraits.js` L106), REJOUER / AUTRE ZONE / BALADE / MENU.

---------------------------------------------------------------------------------------------------------------------

## 14. BUDGET (le −1, PC moyenne/haute ; téléphone entre parenthèses)

| Poste | Coût | Source |
|---|---|---|
| Décor de la pause du −1 | 342 appels haute / 187 moyenne (186 en `?tel=1`) | **mesuré** |
| 2 chasseurs avatars | +24 appels haute, +126 k tri ; 2 avatars `tel/` ≈ 50 Mo GPU | **mesuré** (12 appels, 63 k tri, 19-27 Mo par avatar) |
| 3-4 props (meubles de 1 à 3 matériaux) + voiles | +12 à +48 appels haute (+9 à +36 moyenne) + 4 | **mesuré** (12/9 par meuble de 3 mat.) |
| Surbrillance, poussière, ruban, effets du cœur | ≤ +10 | **estimé** |
| **Total à l'image** | **≤ 430 appels haute / ≤ 260 moyenne** (le départ du hall en fait 881 / 486) | |
| Processeur, simulation | chasseurs : `move` 7,8 µs/pas + pose 0,07-0,15 ms une fois par image ; props : ≈ 5 µs/pas ; Haythem prop ≈ 0,01 ms | **mesuré** (cartes persos/cage) |
| Processeur, IA | perception chasseurs ≈ 0,15 ms × 5 Hz × 2 ; cacheurs ≈ 0,05 ms × 4 Hz × 3 ; A* 2,7 ms au plus une fois par image (pointe 13,5) | **estimé** à partir des coûts unitaires mesurés |
| **Moyenne par image** | ≈ 0,8 à 1,2 ms (pointe ≈ 4 ms un pas où tombe un A*) | **estimé** |
| Chargement en plus | registre ≈ 30 ms ; préparation de ≈ 40 prototypes sous l'écran (programmes déjà connus : textures/tampons seulement) ; graphe du cœur 0,7 s ; cachettes + couverture 25 ms (−1) à 0,4 s (école) au lancement | **estimé** |
| Mémoire | prototypes : géométries gardées en mémoire centrale ≈ 2-5 Mo ; rien de neuf sur la carte graphique | **estimé** |
| Lumières | **aucune ajoutée** (une PointLight = 27 s d'image figée, **mesuré**) | règle |
Au téléphone : mêmes 5 acteurs (2 avatars `tel/`, LA CAGE en tient 10, `carte_persos` §2.5) ; si besoin, déguisement
cousu en un maillage à couleurs de sommets (`carte_props` §3.4 : 1 appel par passe pour les types sans image).

---------------------------------------------------------------------------------------------------------------------

## 15. ORDRE DE TRAVAIL (chaque lot jouable, vérifié avant le suivant)

| Lot | Contenu | Dépend du cœur | Taille | Vérification |
|---|---|---|---|---|
| **P1 — Registre** | `js/registre_meubles.js`, les ≈ 35 lignes `noterMeuble`/`noterMailles`, `fermerRegistre` dans `fusionnerLocal` et `optimiserDecor`, `zonerRegistre`, `?debug=meubles` (boîtes orientées en fil de fer, nom au survol), `__meubles.compter()` | rien | 1 j, ≈ 200 l. | log `[optim]` inchangé (4 198 → 232) ; mêmes images aux poses photo ; chaque prototype posé à côté de son original dans le hall : identique à l'œil ; nombre de poses par pièce = §4 |
| **P2 — Haythem meuble dans la balade** (`?prop=1`) | `viserMeuble`, `deguiser`, `CorpsProp`/`bougerProp`, bande de hauteur dans `collisions.js`, caméra de prop, verrou + aimantation, figer, plaquage mural, voile, jauge DISCRÉTION, E pour redevenir Haythem | crochet `updateCamera` seulement | 2 j, ≈ 600 l. | chaque type : 100 trajets au hasard sur le graphe sans traverser de mur ; poubelle sous une table, baby-foot refusé dans une porte de 0,8 m ; jauge cohérente (chaise dans la rangée ★★★★★, au milieu du couloir ★) |
| **P3 — Haythem prop contre 2 chasseurs bots** (−1) | `PartieProp` (phases, chrono, rôle fixe), provocations (roue, forcées, sons 3D), `CerveauChasseurProp` (vue, soupçon, ouïe, états, tir de test, pénalité), `surTir`, PV et mort du prop, œil, fin de manche, spectateur (`game.foyer`) | `game.partie`, entrées, bots de base, armes, `monde.vue/balle`, nav, son3d, portes pour tous, HUD combat | 4 j, ≈ 900 l. | **mode simulé** `__prop.simuler(20, { vitesse: 8 })` (un « Haythem bot » cacheur à sa place, sans rendu) : en Normal, les chasseurs trouvent 40-70 % des props du −1, 2 à 8 balles « vrais meubles » par chasseur et par manche ; puis 5 manches jouées à la main |
| **P4 — Haythem chasseur contre 3 props bots** | cachettes + couverture, `CerveauCacheur` (choix, trajet, pose, vu/pas vu, déplacements, provocations, fuite), aveuglement, scanner, indices, coéquipier | vue FPS + armes du cœur | 3 j, ≈ 700 l. | simulation : props bots contre 2 chasseurs bots, taux de survie Normal 30-60 % ; à la main : aucun prop visible en train de bouger dans le cadre plus de 0,25 s (Normal) ; `?debug=props` (cachettes colorées par crédibilité, barres de soupçon) |
| **P5 — La partie complète** | rôles alternés, 6 manches, points, tableau, écran de fin, écran PROP HUNT, zones 2e/1er/RDC/école + barrières et ruban, verrous de portes, ascenseur hors jeu | menu principal du cœur | 2 j, ≈ 400 l. | une partie de 6 manches sur chaque zone ; aucune sortie de zone en 200 trajets de bots ; Échap/pause gèle tout (IA et chrono vivent dans `update`) |
| **P6 — Finitions** | tactile et manette (contexte, RACINES), Voir les sons, déguisement cousu (téléphone), « posables » (micro-ondes sur la tablette), sons fignolés, `sw.js` `VERSION` + `CORE`, relevé `?chargement=trace` + `tools/liste_chargement.py`, astuces de chargement, README, CRÉDITS (Avaturn des amis) | | 2 j, ≈ 300 l. | `?tel=1` à 30 im/s au −1 ; une partie entière à la manette seule et au tactile seul |
Total : **≈ 14 jours, ≈ 3 100 lignes avec les essais**. P1 et P2 peuvent partir tout de suite, en parallèle du cœur.

---------------------------------------------------------------------------------------------------------------------

## 16. RISQUES

1. **Le registre touche 12 fichiers de la carte** (une ligne chacun) : une erreur d'emplacement (appelé sur un groupe
   qui contient aussi la table, la rangée…) donne un prototype faux ou une boîte trop grande. Parade : P1 compare
   chaque prototype à son original et chaque taille aux mesures de `carte_props` §2 (±10 %) ; un type hors tolérance
   est marqué `deguisable: false` plutôt que faux. La correction de la partie « mal faite » de l'école (la vidéo du
   15/10) ne casse rien : tout est relu du code au chargement, aucune coordonnée de meuble n'est écrite en dur.
2. **Les indices visuels involontaires** (ombre cuite sous les vrais meubles, ombres de contact au seul RDC,
   `carte_props` pièges 10-11) : un œil exercé repérerait les props à leur pied. Parade : voile de prop (§6.7) réglé
   par comparaison d'images côte à côte, par type et par niveau.
3. **Le réglage du soupçon des bots** (trop omniscients : le joueur se sent triché ; trop bêtes : ennui). Parade : toutes
   les constantes dans `REGLAGES_PROP`, mode simulé accéléré pour mesurer, `?debug=props`. Les bots ne lisent jamais
   « qui est un prop » : ils jugent props et vrais meubles par les mêmes tests.
4. **Collision en disque des meubles longs** (baby-foot 1,48 m, distributeur) : leurs bouts entrent dans les murs.
   Parade : rayon ≤ 0,5, `surPlace`, contrôle des quatre coins par `libre(…, 0,05)` au changement et au verrou ; sinon
   refus (« Pas la place »).
5. **Dépendances au cœur FPS** (P3 n'existe pas sans `game.partie`, la commande, `monde.vue/balle`, la navigation, le
   son 3D, les portes pour tous). Si le son 3D manque, le rôle de chasseur est frustrant (on n'entend pas d'où vient la
   provocation) : « Voir les sons » en secours.
6. **Les deux défauts d'entrée vérifiés** (chiffre non lié → emote fantôme ; Espace pendant la pause → saut à la
   reprise) : la roue des provocations et le tir en héritent tels quels. À corriger au lot 1 du cœur.
7. **Portes automatiques et ascenseur pour Haythem seul** (36 % des trajets de bots bloqués, la coupe-feu du 2e est le
   SEUL accès au 2e, **mesuré**) : sans `Portes.maj` pour tous, la zone 2e et l'école entière sont injouables pour les
   bots ; repli : portes de la zone ouvertes à demeure (on perd l'indice « porte qui s'ouvre seule »).
8. **Visages réels des amis** comme chasseurs (avatars Avaturn de LA CAGE, `carte_persos` §2.1) : leur accord n'est pas
   noté. Repli : Haythem recoloré en équipe, ou les corps « passants » recolorables (`assets/passants/`).
9. **Barrières ajoutées après la construction** : le graphe filtré par zones et les boîtes de barrière doivent tomber
   au même endroit ; une boîte oubliée laisse un bot sortir. Vérification P5 (200 trajets). Les barrières sont
   `camera: false, balle: false` : ni la caméra ni les balles ne s'y cognent.
10. **Le coût au RDC et dans l'école entière** (880 à 1 084 appels de décor en haute, **mesuré**) : le prop hunt y reste
    possible mais la moyenne y est le bon socle ; le −1 par défaut.
11. **Lumières interdites en jeu** (27 s figées) : aucun effet de prop hunt n'en ajoute ; le scanner et la surbrillance
    sont du HUD et des matériaux additifs compilés au chargement.
12. **Équilibre des rôles** : en solo, le rôle de chasseur contre des cacheurs Difficile peut sembler impossible
    (cachettes notées à 0,9). Parades : provocations forcées, scanner, Facile par défaut au premier lancement, et la
    règle « dernier prop : provocation toutes les 25 s ».
