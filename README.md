# IRIS — l'école en 3D

Un jeu à part, tiré de **LA CAGE** : le même moteur, le même rendu et la même façon de bouger, mais **sans ballon**. On
y promène **Haythem**, et rien que lui, dans l'école **IRIS** (MediaSchool) : marcher, courir, sprinter, sauter,
s'asseoir, danser, sortir son téléphone. Pas de match, pas de score, pas de boutique : une balade libre.

> État actuel : le **rez-de-chaussée de l'école** est construit d'après les 21 photos de Haythem (`references/ecole/`,
> hors du dépôt) : le passage des étudiants et sa grille, le hall ouest, l'escalier jusqu'au palier du 1er étage, les
> couloirs C05 et C01, la salle d'attente au mur safran, le hall d'entrée et l'accueil, la porte n° 6 et la façade sur la
> rue. Les pièces jamais photographiées (salle A, bureau B, toilettes, bureaux, étages) sont derrière des portes fermées.
> Le mobilier et la rue ont chacun leur module, dans une première version à compléter.

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
  les **options**, l'**écran de chargement** (titre IRIS, logo « iris » jaune et noir, astuces de l'école), la **PWA**
  (`manifest.webmanifest`, `sw.js`, cache `iris-v1.0`).

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
js/ecole_rue.js       la rue (trottoir, chaussée, façades voisines et d'en face, impasse, carrefour)
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
```

Les commentaires du moteur citent parfois des fichiers de LA CAGE (`js/court.js`, `js/monde_*.js`…) : ce sont des
renvois à l'origine du code, ces fichiers n'existent pas ici.

## L'école dans le jeu

| Pièce | Ce qu'on y trouve | Photos |
|---|---|---|
| Le passage des étudiants | grille noire ouverte sur la rue, réglettes fluorescentes, panneaux de liège, porte blanche « Sortie », portes vitrées aux autocollants « iris » (automatiques) | 07, 10, 19 |
| Le hall ouest | plan d'évacuation, porte grise du couloir de service, extincteur, radiateur, affiche jaune du tri, portes coupe-feu (le vantail gauche ouvert) | 06, 20, 04 |
| L'escalier | deux volées de 10 marches, palier à 1,75 m, garde-corps à barreaux, main courante, palier du 1er étage (double porte fermée) | 20, 06 |
| Le couloir C05 | porte de secours en verre dépoli bleu au fond | 05 |
| La salle d'attente | mur safran et sa lisse blanche, panneau DAE, écran, chaises coque (on s'y assoit), jours dépolis, borne, pilier, présentoir | 02, 21 |
| Le couloir C01 | gaine technique, toilettes, local | 01 |
| Le hall d'entrée | porte n° 6 (automatique) et ses vitrophanies, tapis, comptoir d'accueil, fenêtres à barreaux | 03, 16 |
| La rue | trottoir, chaussée, façade de l'école (drapeaux, encadrements rouges), immeubles voisins et d'en face | 08 à 18 |

Le départ est dans le hall d'entrée, juste passé la porte 6. Pause › **Revenir au départ** y ramène.

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
chantier : ils posent ce qu'ils veulent avec les mêmes outils (et `ch.sieges` pour ce où l'on s'assoit). Restent à
venir, décrits par le relevé : les totems « iris », jardinières, bancs, vélos et voitures de la rue ; l'intérieur des
pièces fermées (salle A informatique, bureau B, toilettes) ; les étages.

**L'écran de chargement** : après avoir ajouté des fichiers chargés au démarrage, relever les profils
(`?chargement=trace`, puis `?chargement=trace&tel=1`) et relancer `python tools/liste_chargement.py` (voir son en-tête).
Changer aussi la version de `sw.js` (`iris-v1.1`…) quand index.html, le style ou un fichier lourd changent.
