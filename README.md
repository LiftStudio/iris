# IRIS — l'école en 3D

Un jeu à part, tiré de **LA CAGE** : le même moteur, le même rendu et la même façon de bouger, mais **sans ballon**. On
y promène **Haythem**, et rien que lui, dans l'école **IRIS** (MediaSchool) : marcher, courir, sprinter, sauter,
s'asseoir, danser, sortir son téléphone. Pas de match, pas de score, pas de boutique : une balade libre.

> État actuel (v1.3, 10/10) : l'école est construite d'après les **29 photos** de Haythem et sa **vidéo du sous-sol**
> (`references/ecole/`, hors du dépôt : 01 à 21, la 22e une ancienne photo du hall, 23 à 29 le C05 et l'escalier est,
> `video_sous_sol/` 22 s et ses 67 images) — **trois niveaux** :
> - le **rez-de-chaussée** : le passage des étudiants et sa grille, le hall ouest, l'escalier principal, le couloir C05
>   (ses toilettes, au fond la porte bleue de la salle David Clark), le C01, la salle d'attente au mur safran, le hall
>   d'entrée et l'accueil, la porte n° 6 et la façade sur la rue ; derrière la porte nord du hall, le **couloir est** et
>   l'**escalier est** jusqu'au 1er (photos 24 à 29) ;
> - le **sous-sol** (-3,06 m, la vidéo) : derrière la porte grise du hall ouest, le palier, la longue volée de tôle, le
>   hall du -1, le couloir étroit et l'**espace pause** ;
> - le **1er étage** : ses salles sous leurs **vrais noms** (le panneau d'étage de la photo 28), le palier est, l'espace
>   pause côté cour, et l'escalier principal jusqu'au palier du 2e (fermé).
>
> Ce qui n'a jamais été photographié se visite quand même : l'intérieur est **imaginé** en attendant des photos (voir
> « Les pièces imaginées » et le tableau). La RUE est complète (photos 07 à 18) : voitures garées, totems « iris »,
> jardinières de zinc, bambou et palmier, bancs (on s'y assoit), poubelles, vélos, motos et scooters, grille du jardin
> doublée de brande, impasse et carrefour.
>
> **Le 1er étage reste en grande partie IMAGINÉ** (`js/ecole_etage1.js`) : sont relevés la double porte du palier
> (photos 06, 20), la façade (photos 11, 12, 16 à 18 : le rythme des fenêtres, la grande baie et la fenêtre étroite dans
> leurs encadrements rouges, les pastilles des pompiers), les plafonniers des salles devinés par les vitres (photo 12 :
> des barres de tubes ; photo 11 : une grille argentée à alvéoles), le palier de l'escalier est et son panneau d'étage
> (photos 27 à 29), le format des plaques de salle (photo 23) ; l'intérieur des salles, le couloir et l'espace pause (dans
> le style de celui du sous-sol, filmé) sont imaginés.

## Lancer le jeu

- **Windows** : double-cliquer sur `Lancer.bat`. Il démarre le petit serveur (`serve.py`, il faut **Python**) sur le
  port **8124** et ouvre le navigateur sur http://localhost:8124. (LA CAGE garde le 8123 : les deux jeux tournent en
  même temps.)
- **À la main** : `python serve.py 8124` dans ce dossier, puis ouvrir http://localhost:8124.
- Le jeu a besoin de **WebGL 2** (tout navigateur récent). Ouvrir `index.html` directement (file://) ne marche pas :
  les modules ES exigent un serveur.

Adresses utiles :

| Adresse | Effet |
|---|---|
| `?tel=1` | profil téléphone sur PC (qualité, textures allégées, commandes tactiles si l'écran est tactile) |
| `?debug=murs` | dessine toutes les formes de collision en fil de fer (vert : joueur et caméra, cyan : caméra seule) |
| `?chargement=trace` | relève les fichiers demandés jusqu'à l'école prête (voir `tools/liste_chargement.py`) |

## Commandes

| Action | Clavier / souris | Manette | Tactile |
|---|---|---|---|
| Se déplacer | ZQSD (ou WASD, flèches) | stick gauche (effleurer = marcher) | joystick flottant à gauche |
| Caméra | souris (clic pour capturer le pointeur) | stick droit | glisser à droite |
| Marcher | Alt ou Z maintenu | L3 | joystick à moitié |
| Sprint | Maj ou G | RT | joystick au bord |
| Sauter | Espace | A (ou X) | SAUT |
| S'asseoir / se lever | Entrée ou E près d'une chaise | Y | S'ASSEOIR / DEBOUT |
| Emotes (roue) | T (puis 1 à 8) | LB | bouton emotes |
| Vue (3e personne → épaule → 1re personne) | C | Back / croix bas | VUE |
| Téléphone | P | croix haut | téléphone |
| Pause | Échap | Start | pause |

Toutes les touches se changent dans **Options › Commandes** ; les huit emotes de la roue dans **Options › Emotes**.

## Ce qui a été gardé de LA CAGE

- Le **rendu** complet (`js/fx.js`, `js/options_rendu.js`, `js/ombres_*.js`, `js/ombre_cache.js`,
  `js/sonde_ciel.js`) : occlusion ambiante (GTAO), bloom, SMAA, adaptation de l'œil, étalonnage « photo », ombres
  douces, résolution dynamique, qualité automatique, réglages Basse → Ultra. La météo (`js/weather.js`) a un réglage
  **intérieur** : la carte le prend d'elle-même (`scene.userData.interieur`).
- **Haythem** (`assets/haythem.glb`, version allégée `assets/tel/`) avec ses animations : attente, marche, course,
  sprint, pas chassés, marche arrière, saut, danses, célébrations (`assets/anims/manifest.json`), et les couches
  procédurales (`js/couches.js` : inclinaison, regard, respiration, pas).
- Les **trois vues** de caméra, le **clavier/souris**, la **manette** (avec la navigation dans les menus), le
  **tactile** (boutons déplaçables), la **roue des emotes**, le **téléphone** (le groupe s'appelle maintenant IRIS),
  les **options**, l'**écran de chargement** (le logo officiel de l'école sur fond blanc, barre et astuces au jaune du
  logo), la **PWA** (`manifest.webmanifest`, `sw.js`, cache `iris-v1.3`).

## Ce qui a été retiré

Le ballon et tout ce qui en dépend (dribble, tir, passes, contres, paniers), les terrains (La Cage, Levallois,
Jemmapes, le parc de Bécon) et leurs fichiers, les autres joueurs et l'IA, le choix du joueur et la gacha, la boutique,
les matchs et le score, l'entraînement, le jeu en ligne, les passants, le vélo, le plan, le menu d'accueil, l'appli
Android/iOS. Le jeu démarre directement dans l'école après l'écran de chargement.

## Structure

```
index.html            la page : écran de chargement, HUD, téléphone, options (les textes)
css/style.css         le style des écrans (HUD, options, téléphone, tactile, roue des emotes)
js/main.js            le démarrage : réglages, jeu, téléphone, tactile, rideau de l'écran de chargement
js/game.js            la boucle (pas fixe de 1/120 s + interpolation), la caméra, les sièges, la pause
js/player.js          Haythem : avatar, animations, déplacement (inertie, endurance), saut, emotes, téléphone
js/carte_ecole.js     L'ÉCOLE : murs, portes, sols, plafonds, escalier, façade, lumières ; déclare tout au monde solide
js/ecole_matieres.js  les matières dessinées (carrelage 60x120, plafonds perforés, peintures, pierre, signalétique)
js/ecole_portes.js    les portes (fermées, ouvertes, AUTOMATIQUES) et les fenêtres, les vitrophanies de la porte 6
js/ecole_lumieres.js  les spots qui suivent Haythem, la lumière cuite au sol, la carte d'environnement par pièce
js/ecole_mobilier.js  le mobilier (chaises coque où l'on s'assoit, écran, borne, présentoir, affiches, accueil)
js/ecole_rue.js       la rue (trottoirs, chaussée et ses détails, façades voisines et d'en face, jardin, impasse, carrefour)
js/ecole_rue_mobilier.js  le mobilier de la rue, ses plantes (un atlas de feuillage) et ses deux-roues
js/ecole_rue_voitures.js  les voitures garées (assets/voitures.glb, repeintes dans leur texture)
js/ecole_pieces.js    les pièces imaginées du rez-de-chaussée (salle A informatique, bureau B, couloir de service, local
                      technique, toilettes du C05 et PMR, salle David Clark et sa cour) : murs qui manquaient, mobilier,
                      luminaires, sièges, zones de lumière, miroirs
js/ecole_est.js       le couloir est et l'escalier est (photos 24 à 29) : la porte nord du hall, le vestibule, les volées
                      jusqu'au 1er (poserEst, appelé par la carte) ; le palier est du 1er et la cage au-dessus
                      (poserPalierEst, appelé par l'étage)
js/ecole_etage1.js    le 1er ÉTAGE : sa façade percée, salles (leurs vrais noms), couloir, toilettes, espace pause,
                      mobilier, l'escalier jusqu'au 2e ; sa lumière et son ombre cuites, sa visibilité et ses ombres selon
                      l'étage de Haythem, les sièges de son niveau (trois niveaux : -1, 0, 1)
js/ecole_soussol.js   le SOUS-SOL (la vidéo) : palier, volée de tôle, hall du -1, couloir, espace pause ; sa lumière et son
                      ombre cuites, la dalle qui coupe les ombres du rez-de-chaussée, sa visibilité
js/collisions.js      le monde solide : murs, portes, piliers, plafonds, sols et rampes (escalier)
js/kit_decor.js       les outils de décor repris de LA CAGE : textures dessinées, relief, carte d'environnement
                      prise sur place, ombre cuite au sol, fusion des matériaux, vent des feuillages
js/fx.js …            le rendu (voir plus haut)
js/settings.js        réglages et touches (localStorage « iris.settings.v1 »)
js/input.js, manette*.js, touch.js     les commandes
js/ui.js, emotes.js, phone.js, audio.js, chargement.js, demarrage.js
tools/icones.py           refait le logo « iris » et les icônes
tools/liste_chargement.py refait assets/chargement.json (la liste de l'écran de chargement)
tools/avatars_tel.py      refait l'avatar allégé des téléphones
tools/voitures_glb.py     compacte assets/voitures.glb et refait sa version téléphone (assets/tel/)
```

Les commentaires du moteur citent parfois des fichiers de LA CAGE (`js/court.js`, `js/monde_*.js`…) : ce sont des
renvois à l'origine du code, ces fichiers n'existent pas ici.

## L'école dans le jeu

| Pièce | Ce qu'on y trouve | Photos |
|---|---|---|
| **Rez-de-chaussée** | | |
| Le passage des étudiants | grille noire ouverte sur la rue, réglettes fluorescentes, panneaux de liège, porte blanche « Sortie », portes vitrées aux autocollants « iris » (automatiques) | 07, 10, 19 |
| Le hall ouest | plan d'évacuation, la porte grise de l'escalier du sous-sol (on la tire, barre inox), extincteur, radiateur, affiche jaune du tri, portes coupe-feu (le vantail gauche ouvert) | 06, 20, 04, vidéo |
| L'escalier | deux volées de 10 marches, palier à 1,75 m, garde-corps à barreaux, main courante, palier du 1er étage (double porte ouverte) ; il continue jusqu'au palier du 2e (6,60 m, double porte fermée) | 20, 06 |
| Le couloir C05 | les deux portes des toilettes (femmes, hommes) à fente vitrée haute cerclée de bois, leurs plaques et leurs affiches, la retombée et ses deux hublots ; au fond, la porte bleue de la salle David Clark (automatique) et son imposte | 05, 23 |
| Les toilettes du C05 * | femmes : trois cabines aux portes safran, deux vasques et leur miroir ; hommes : deux cabines, trois urinoirs, deux vasques, le panneau « sol glissant » ; faïence, grès 30 x 30, sèche-mains, un vrai miroir sur PC | portes : 23 |
| La salle David Clark (B 0.2) * | derrière la porte bleue : trois rangs de tables pour deux (on s'assoit), tableau blanc, écran et vidéoprojecteur, bureau de l'enseignant, trois fenêtres sur une cour (le bâtiment dépasse ici son fond) | plaque et porte : 23, 05 |
| La salle d'attente | mur safran et sa lisse blanche, panneau DAE, écran, chaises coque (on s'y assoit), jours dépolis, borne, pilier (face au cou : la plaque « iris », l'annuaire des salles et l'horloge à diodes rouges, à l'heure de l'ordinateur), présentoir, kakémono des formations (Bac pro, BTS, Bac+3, Bac+5) | 02, 21, 22 |
| Le couloir C01 | gaine technique, porte des toilettes PMR (plaque au fauteuil roulant), porte du local | 01 |
| Les toilettes PMR * | cuvette suspendue, barres d'appui, lave-mains accessible, miroir | plaque : 01 |
| Le local technique * | baies serveurs aux diodes qui clignotent, onduleur, tableau électrique, étagères, établi, chemins de câbles, réglettes suspendues | — |
| La salle A (informatique) * | trois rangées de cinq postes (on s'assoit), bureau de l'enseignant, toile et vidéoprojecteur, tableau blanc, stores, dalles LED | — |
| Le bureau B * | bureau de chêne, fauteuil et chaises visiteurs (on s'assoit), armoire, bibliothèque, tableau, plante | — |
| Le couloir de service * | derrière la porte blanche « Sortie » du passage, jusqu'au mur du palier du sous-sol : porte de secours, bacs, chariot de ménage, cartons | — |
| Le hall d'entrée | porte n° 6 (automatique) et ses vitrophanies, tapis, comptoir d'accueil, fenêtres à barreaux, totem noir « 1ère école pour le BTS SIO en France » ; au nord, en face de la porte 6, la porte à 1,5 vantail du couloir est (l'affiche « POINT ÉCOUTE » sur le semi-fixe) et la cloison cannelée du bureau du photocopieur (fermé) | 03, 16, 22, 24 |
| Le couloir est | lino moucheté clair, mur jaune et sa plaque directionnelle, plinthes gris foncé, plafond de plâtre et hublots, poteau gris, la niche sous l'escalier (tapis, interrupteur) ; au fond, la porte du vestibule | 24, 26 |
| L'escalier est | en U contre le mitoyen : 2 x 9 marches sombres à nez d'aluminium, plinthe rampante, mains courantes noires des deux côtés, palier à 1,75 m (réglette, bloc de sortie, affiche « la vie à l'école »), le mur d'échiffre ; il monte jusqu'au palier du 2e (porte fermée) | 25, 26 (au-dessus du 1er : imaginé) |
| La rue | trottoirs (pavés devant le n° 8), chaussée (reprises, lignes, rond peint, pièce de pavés, plaques), façade de l'école (drapeaux en V, écusson), les deux totems « iris », jardinières de zinc, bambou, palmier, bancs à lattes (on s'y assoit), corbeille, cendrier, bacs roulants, huit voitures garées, motos, scooters (l'un sous sa housse), vélos, station de réparation et arceaux, le 5/7, le jardin derrière sa grille doublée de brande, l'impasse et la marquise du n° 10, le carrefour (trois immeubles, potelets) | 07 à 18 |
| **Sous-sol (-3,06 m)** | | |
| Le palier et la volée | derrière la porte grise du hall ouest : le palier de béton peint (le panneau jaune « 0 », un hublot, l'interrupteur à voyant vert), une longue volée droite de 17 contremarches en tôle larmée, garde-corps inox à quatre lisses, rampant blanc | vidéo, v_001 à v_030 |
| Le hall du -1 et le couloir | un hall presque carré à la résine grise (« -1 », extincteur, consigne, poutre, bloc lumineux blanc au fond, porte grise) ; le couloir étroit de 0,92 m qui revient vers le sud (caisson et grille au fond) | vidéo, v_026 à v_058 |
| L'espace pause | grand carrelage beige, mur vert anis et cloisons de verre dépoli, mange-debout noirs, tabourets verts et noirs (on s'y assoit), baby-foot, grande table en X, table grise, trois distributeurs, trombinoscope, casiers, sas des toilettes (fermé) | vidéo, v_059 à v_067 (le sud, l'ouest et l'aile : imaginés) |
| **1er étage (3,50 m)** | | |
| Le palier est | vinyle moucheté foncé, le panneau d'étage (le « 1 » sur son bandeau cuivré et les cinq salles), l'affichette « WIFI IRIS », l'affiche « POINT ÉCOUTE », le mur d'échiffre orange et son chant gris, la porte gris taupe du couloir ; au fond, la porte de la salle de cours B 1.6 (106, fermée) ; les portes du 103 et de la 104 ; l'issue de secours | 27, 28, 29 |
| Le palier d'étage (escalier principal) | mur safran et une copie du panneau d'étage, « WIFI IRIS » et « POINT ÉCOUTE », banc, plan d'évacuation, extincteur, local ménage (fermé) | *imaginé* (le panneau : 28) |
| Le couloir | portes grises et leurs plaques noires à trois lignes, tableau de liège, affiches, fontaine à eau, horloge ; il finit sur la porte du palier est | *imaginé* (les plaques : 23) |
| Salle de cours B 1.1 (101) | derrière les travées 1 à 4 (la grande baie rouge) : 9 tables pour deux, tableau blanc, vidéoprojecteur, écran déroulé, liège au fond, luminaires à grille (comme toutes les salles et bureaux de l'étage) | façade 12 (et 11 : la grille), nom : 28 |
| Salle Robert Kahn B 1.4 (102, informatique) | travées 5 à 8 : 18 postes (sous les fenêtres, contre le couloir, îlot central), baie de brassage, le cadre « Robert E. Kahn » | façade 11, 17, nom : 28 |
| Bureau 103 (pédagogie) | travées 9-10 : bureaux, armoires, table ronde ; sa porte donne sur le palier est | façade 16 |
| Salle Gordon Earle Moore B 1.5 (104) | travées 11-12 : salle de TD en deux îlots de six, la loi de Moore au tableau, la fenêtre rouge des pompiers | façade 18, nom : 28 |
| L'espace pause (105) * | côté cour, sa porte ouverte : grès grège, mur vert anis, mange-debout, tabourets Tolix et noirs (on s'y assoit), deux distributeurs, tablette haute sous deux fenêtres sur cour, affiches, poubelle bleue, trombinoscope | dans le style de celui du sous-sol (vidéo) |
| Les toilettes de l'étage | faïence blanche, trois cabines (la première ouverte), deux lavabos, miroir, sèche-mains | *imaginé* |
| Le 2e étage | les paliers des deux escaliers, portes fermées | — |

Le départ est dans le hall d'entrée, juste passé la porte 6. Pause › **Revenir au départ** y ramène.

### Les pièces imaginées (*)

Les pièces marquées d'une étoile n'ont **pas encore été photographiées** (ou seulement leur porte) : leur intérieur est
imaginé, plausible pour une école de commerce et du numérique parisienne, avec les matières et la lumière du reste de
l'école. Celles du rez-de-chaussée sont dans `js/ecole_pieces.js` (appelé par la carte comme `poserMobilier`) : **quand
Haythem enverra des photos de ces pièces, c'est ce module qu'on reprend**, pièce par pièce (chaque pièce est une
fonction : `salleA`, `bureauB`, `couloirService`, `localTechnique`, `toilettesFemmes`, `toilettesHommes`,
`toilettesPMR`, `salleDavidClark`, `cour`). Leurs portes s'ouvrent toutes seules (état `'auto'` dans
`js/carte_ecole.js`) ; chaque pièce a sa zone de lumière (rendue par `poserPieces`), sans voisines. Ce que disent les
photos des portes est respecté : le local a ses gonds au nord (photo 01) et la porte vitrée du bureau B s'ouvre
toujours vers le cou (`libre: -1`, photo 03) ; la salle A a ses gonds au nord pour que son vantail ne barre pas
l'allée des postes ; les portes des toilettes du C05 ont leurs gonds au sud et la porte bleue s'ouvre toujours vers le
couloir (photo 23 : un étudiant en sort en la poussant). Le vrai miroir des toilettes (un second rendu de la scène) ne
se calcule que quand Haythem est dans la pièce ; ailleurs et sur les petites qualités, une glace (carte
d'environnement projetée, ou peinte).

**Ce qui reste imaginé** (à refaire quand les photos viendront) : l'intérieur de toutes les pièces étoilées ; au 1er,
l'intérieur des salles, le couloir, le palier d'étage, les toilettes et l'espace pause ; les volées 3 et 4 de
l'escalier est et les deux paliers du 2e ; au sous-sol, le sud et l'ouest de l'espace pause, son aile, le dedans du sas
des toilettes et du local sombre, le fond du hall et du couloir ; le nom « David Clark » et sa cour ; l'intérieur du
bureau du photocopieur. Les profondeurs du sous-sol viennent d'une focale estimée sur la vidéo (≈ 1 200 px, ± 15 %).

## Construire la suite de l'école

**Le plan.** `js/carte_ecole.js` parle en coordonnées du **plan** relevé sur les photos : x le long de la façade (0 =
mitoyen ouest, côté impasse ; 19,8 = mitoyen est), y depuis le nu intérieur de la façade vers le fond du bâtiment
(y < 0 : le trottoir et la rue). Dans le jeu : X = x, Z = -y, Y vers le haut, sol du rez-de-chaussée à 0.

**Le chantier** (`ch`, classe `Chantier`) pose tout en coordonnées du plan, géométrie et monde solide ensemble :

```js
ch.mur({ de: [x0, y0], a: [x1, y1], ep: 0.15, h: 3.25, mats: { N: M.orange, S: M.blanc }, plinthes: ['S'],
         ouvertures: [{ c: 6.85, l: 0.93, h: 2.04 }, { c: 8.35, l: 1.3, bas: 0.95, h: 2.3 }] });  // porte, fenêtre
ch.porte('x', 12.075, 6.85, { l: 0.93, modele: 'grise', etat: 'fermee', cote: 'S' });   // ou 'ouverte', 'auto'
ch.plafond(x0, y0, x1, y1, 2.6, 'plateaux');           // ou 'platre' ; la caméra s'y arrête, retombées comprises
ch.boite(x0, y0, x1, y1, h0, h1, M.comptoir, { collision: true });
ch.spot(x, y, 2.6, 'attente');  ch.opale(x, y, 2.4, 'c05');   // un luminaire = une lampe (spots et lumière cuite)
```

**Le monde solide** (`js/collisions.js`, coordonnées du jeu) : boîtes, boîtes orientées, cercles, murs percés,
plafonds (`plafondEn(x, z, y)` : ceux qui sont au-dessus de `y`), et maintenant des **sols** — `C.sol(...)` (un
palier) et `C.rampe(...)` (une volée de marches, pente passant par le milieu des marches) : `solEn(x, z, y)` rend le
sol sous les pieds, Haythem le suit. Une forme dont `off` vaut vrai n'existe plus (les vantaux des portes automatiques).
`vitre: true` : la lumière cuite au sol traverse la forme. `?debug=murs` montre tout.

**Les lumières** (`js/ecole_lumieres.js`) : chaque luminaire posé par le chantier est une LAMPE de sa zone (pièce).
Quatre spots (deux au téléphone) se posent sous les lampes les plus proches de Haythem, dans sa pièce et celles qui s'y
ouvrent ; toutes les lampes, et le jour qui entre par la porte 6, le passage et les fenêtres, sont peintes une fois dans
la lumière cuite du carrelage, découpées par les murs. Chaque zone a son point de prise de vue pour la carte
d'environnement, reprise quand Haythem y entre. Une nouvelle pièce : un rectangle dans `zones`, ses voisines, son point.

**Les crochets.** `poserMobilier(ch)` (`js/ecole_mobilier.js`) et `poserRue(ch)` (`js/ecole_rue.js`) reçoivent le
chantier : ils posent ce qu'ils veulent avec les mêmes outils (et `ch.sieges` pour ce où l'on s'assoit). Puis, dans cet
ordre : `poserPieces(ch)` (`js/ecole_pieces.js`) meuble les pièces imaginées et rend leurs zones ; `poserEst(ch, { RECT })`
(`js/ecole_est.js`) pose le couloir et l'escalier est, rend ses zones (`zones` au rez-de-chaussée, `zonesHaut` pour la
cage et le palier du 1er), son lino et sa mise à jour ; `poserEtage1(ch, renderer)` (qui appelle lui-même
`poserPalierEst`) ; `poserSousSol(ch, renderer, { RECT })`. Tous avant les lumières, la lumière cuite et l'optimisation
du décor ; les zones de la cage est, de l'étage et du sous-sol EN TÊTE de la liste (leurs rectangles couvrent ceux du
rez-de-chaussée, à d'autres hauteurs) ; leurs `maj` à chaque image. Restent à venir : les étages au-dessus du 1er.

**La rue** (`js/ecole_rue.js` et ses deux modules) : ses cotes sont dans `RUE` (trottoir de 2,4 m, chaussée de 6,4 m
12 cm plus bas, trottoir d'en face de 1,6 m ; l'impasse à x = -10,5, le carrefour à x = 45). Les pièces opaques du
mobilier passent par un `Atelier` qui les coud (les matières sans image sont des TEINTES posées sur les sommets de
quatre matériaux de classe : mat, satiné, laqué, métal) ; toutes les feuilles sont des cartes d'UN atlas dessiné
(bambou, palme, olivier, arbuste, thuya, fleurs, choisya, couronne), balancées par le vent ; sous ce qui est posé
dehors, des taches d'ombre douces (la carte d'ombre du soleil ne couvre que le trottoir de l'école). Les voitures
(`VOITURES`) : une carrosserie du fichier, une teinte, une place sur la file ; le monde solide et les taches sont posés
tout de suite, les carrosseries quand `assets/voitures.glb` arrive. Les motos et les scooters sont des PROFILS de côté
extrudés (`profil`, avec `effile` pour la largeur vue de dessus), sur des pneus tournés (`pneu`) et des jantes à bâtons
(`roue`). Au carrefour, une boîte invisible arrête Haythem à x = 44,5 : les potelets de fonte en marquent la ligne sur
les trottoirs. Les recoins trop étroits pour lui (moins de 60 cm entre deux obstacles) sont bouchés dans le monde
solide : il s'y coinçait en tremblant.

**Les trois niveaux.** `poserEtage1(ch, renderer)` (`js/ecole_etage1.js`) rend ses zones de lumière (rangées AVANT
celles du rez-de-chaussée) et sa mise à jour (appelée par la carte). Plancher à 3,50 m, dessous de la dalle du 2e à
6,40 m, étages courants de 3,10 m (la tuile de la façade) ; le sous-sol (`js/ecole_soussol.js`) a son sol à -3,06 m.
Ce qu'il faut savoir pour bâtir en hauteur (et en dessous) :
- le monde solide : une DALLE (`C.sol`) sous tout ce qu'on foule à l'étage, seuils compris (sinon on retombe au
  rez-de-chaussée), des murs à leurs hauteurs absolues, le dessous du plancher en forme « caméra seule » ;
- une lampe d'étage porte `base` (son plancher : visée des spots, tri des pièces voisines) et `cuire: false` (elle est
  cuite sur le carrelage de l'étage, pas sur celui d'en bas) ; un rectangle de zone porte une hauteur minimale (2,60) ;
- un siège d'étage porte `sol` (3,50 ; -3,06 au sous-sol) : seuls ceux du niveau de Haythem sont proposés (-1, 0, 1) ;
- tout ce qui est à l'étage porte `horsAOSol` (l'ombre cuite du rez-de-chaussée ne le voit pas) ; le groupe de l'étage
  n'est dessiné que si la caméra peut le voir, et ne porte ombre que si Haythem y est ;
- les portes automatiques ne s'ouvrent que pour qui est À LEUR NIVEAU (`Portes.maj` reçoit les pieds de Haythem et la
  hauteur de la caméra) : passer au-dessus ou en dessous d'une porte ne l'ouvre plus.
- SOUS LE SOL (`js/ecole_soussol.js`, en-tête : quatorze pièges) : `solEn` rend 0 là où aucun sol ne couvre, donc des
  dalles `C.sol(..., 0)` au-dessus de tout le sous-sol sauf la trémie, et une dalle à -3,06 sous tout ce qu'on foule en
  bas ; le carrelage du rez-de-chaussée coupé au droit du palier ; des murs à plinthes au sol du -1 (un `mur()` local) ;
  des plafonds sans retombées ; des zones à hauteur MAXIMALE (`[x0, z0, x1, z1, hmin, hmax]`, js/ecole_lumieres.js),
  en tête de liste ; des lampes `{ base: -3.06, cuire: false }` (et `couleur` : les LED neutres du -1) ; une
  dalle-boîte sous le carrelage qui porte l'ombre du « soleil » sur le -1 tant que Haythem est en haut.
`?debug=murs` dessine les formes de l'étage et du sous-sol à leur hauteur et les sols (dalles, rampes) en magenta.

**L'écran de chargement** : après avoir ajouté des fichiers chargés au démarrage, relever les profils
(`?chargement=trace`, puis `?chargement=trace&tel=1`) et relancer `python tools/liste_chargement.py` (voir son en-tête).
Changer aussi la version de `sw.js` (aujourd'hui `iris-v1.3`) quand index.html, le style ou un fichier lourd changent.
