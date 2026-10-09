# IRIS — l'école en 3D

Un jeu à part, tiré de **LA CAGE** : le même moteur, le même rendu et la même façon de bouger, mais **sans ballon**. On
y promène **Haythem**, et rien que lui, dans l'école **IRIS** (MediaSchool) : marcher, courir, sprinter, sauter,
s'asseoir, danser, sortir son téléphone. Pas de match, pas de score, pas de boutique : une balade libre.

> État actuel : le moteur est prêt et une **salle d'essai** provisoire (`js/carte_ecole.js`) aux couleurs de l'école
> sert à l'éprouver (collisions, caméra, éclairage intérieur). L'intérieur de l'école, d'après les photos de Haythem
> (`references/ecole/`, hors du dépôt), viendra la remplacer, pièce par pièce, dans ce même module.

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
js/carte_ecole.js     LA CARTE : sol, murs, plafond, mobilier, lumières ; déclare les murs aux collisions
js/collisions.js      le monde solide : murs, portes, piliers, plafonds ; questions du joueur et de la caméra
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

## Construire l'école (pour la suite)

Tout se passe dans `js/carte_ecole.js`, dont `construireCarte(scene, renderer)` rend :

```js
{ nom, collisions, depart: { x, z, fx, fz }, bornes, sieges: [{ x, z, y, fx, fz, sx, sz, nom }] }
```

**Le repère** : x vers l'est, z vers le sud, y vers le haut, en mètres ; le sol est à y = 0.

**Les murs** se déclarent au monde solide (`js/collisions.js`) **en même temps** qu'on pose leur géométrie :

```js
const C = new Collisions();
// un mur de (x0, z0) à (x1, z1), épais de 20 cm, haut de 2,70 m, percé d'une porte de 1,30 m dont le centre est à
// 6 m du début du mur, et d'une fenêtre (allège à 0,9 m) :
const m = C.mur(x0, z0, x1, z1, 0.2, { h: 2.7, ouvertures: [{ a: 6, l: 1.3, h: 2.1 }, { a: 10, l: 2, h: 2.2, bas: 0.9 }] });
// m.pleins = les morceaux pleins [{ a0, a1, y0, y1 }] (distances le long du mur) : y poser la géométrie
C.plafond(x0, z0, x1, z1, 2.7);             // la caméra s'y arrête
C.ajouterBoite(x0, z0, x1, z1, { y1: 0.9 }); // un comptoir (le joueur le contourne)
C.ajouterCercle(x, z, 0.24);                // un pilier rond
C.ajouterBoiteOrientee(cx, cz, hx, hz, a);   // un meuble tourné
```

Options d'une forme : `y0`/`y1` (hauteurs), `joueur: false` (seule la caméra la voit), `camera: false` (la caméra passe
au travers : une vitre). Le joueur est un disque de 30 cm de rayon qui occupe la hauteur [0,25 ; 1,6] m au-dessus de
ses pieds : il **glisse** le long des murs, ne traverse jamais un mur même fin (sous-pas d'au plus la moitié du rayon),
passe sous les linteaux. La caméra recule devant les murs, s'arrête sous le plafond, et cache Haythem quand elle
arrive dans sa tête. `?debug=murs` montre tout.

**Les lumières et le rendu** : la salle d'essai montre la recette d'un intérieur (une « lumière de plafond » presque
d'aplomb qui porte les ombres douces, un ciel hémisphérique, des lampes ponctuelles, la carte d'environnement prise sur
place) et ce qu'elle doit poser dans `scene.userData` (voir l'en-tête de `js/carte_ecole.js`).

**L'écran de chargement** : après avoir ajouté des fichiers chargés au démarrage, relever les profils
(`?chargement=trace`, puis `?chargement=trace&tel=1`) et relancer `python tools/liste_chargement.py` (voir son en-tête).
Changer aussi la version de `sw.js` (`iris-v1.1`…) quand index.html, le style ou un fichier lourd changent.
