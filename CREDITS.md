# Crédits — IRIS

IRIS reprend le moteur, le personnage et une partie des ressources de **LA CAGE** (le jeu de basket de Haythem). Ce
fichier liste ce qui vient de tiers dans ce qui a été gardé.

## Personnage

- `assets/haythem.glb`, `assets/tel/haythem.glb` : l'avatar de Haythem, créé avec **Avaturn** (avaturn.me). La version
  `tel/` est la même, aux textures réduites pour les téléphones (`tools/avatars_tel.py`).

## Animations

- **Mixamo** (Adobe, mixamo.com) — `Idle`, `Fast Run`, `Running`, `Sprint`, `Jog Strafe Left/Right`,
  `Slow Jog Backwards`, `Jump`, `Defender`, `Soccer Spin`, `Victory`, `Clapping`, `Cheering`, `Taunt` (FBX, sans
  peau, « In Place »). Utilisation selon les conditions de Mixamo.
- **CMU Graphics Lab Motion Capture Database** (mocap.cs.cmu.edu, financée par la NSF, EIA-0196217) — la marche
  (143_32), la marche arrière (143_39) et la marche latérale (143_40), dans `assets/anims/cmu/`, converties par
  l'outil de LA CAGE.
- **Sketchfab**, licence **Creative Commons Attribution (CC BY 4.0)**, http://creativecommons.org/licenses/by/4.0/ —
  reciblées sur le squelette de l'avatar (modifiées) :
  - « Hip Hop Dance by Sarwar (3D scan) » — **Muhammad Rahman** (`dance_hiphop.glb`)
  - « Josh Breakdance 1990 » — **Mixamo** (`dance_break.glb`)
  - « Kachujin G Rosales Chicken Dance » — **Mixamo** (`dance_chicken.glb`)
  - « Gangnam Style » — **reizibarrientos** (`dance_gangnam.glb`)
  - « Ymca Dance Bani » — **Shivay gaming** (`dance_ymca.glb`)

## Véhicules

- `assets/voitures.glb`, `assets/tel/voitures.glb` : extrait (quatre carrosseries : citadine, compacte, berline, SUV)
  du « Generic passenger car pack » de **Comrade1280** (Sketchfab), licence **Creative Commons Attribution (CC BY
  4.0)**, http://creativecommons.org/licenses/by/4.0/ — modifié : carrosseries extraites et recentrées, tampon
  compacté, textures réduites à 256 px pour les téléphones (`tools/voitures_glb.py`) ; dans le jeu, chaque voiture est
  repeinte dans sa texture (`js/ecole_rue_voitures.js`).
- Les motos, scooters, vélos, la trottinette et tout le mobilier de la rue sont modelés par le code
  (`js/ecole_rue_mobilier.js`) : aucun fichier.

## Textures

- `assets/tex/beton_*` : **Poly Haven** — *Concrete Wall 003* (https://polyhaven.com), licence **CC0 1.0** (domaine
  public). Le relief discret des murs peints.
- Tout le reste du décor (carrelage, dalles du plafond, peintures, affiches, écran ; dehors : enrobé, pavés, brande,
  façades, feuillages, totems) est dessiné par le code (`js/carte_ecole.js`, `js/kit_decor.js`, `js/ecole_rue*.js`) :
  aucun fichier.

## Logiciels et polices

- **Three.js** r170 (`vendor/three/`) — licence MIT, © les auteurs de three.js.
- **es-module-shims** (`vendor/es-module-shims.js`) — licence MIT, Guy Bedford.
- Polices **Bebas Neue** (Dharma Type) et **Oswald** (Vernon Adams), via Google Fonts — SIL Open Font License 1.1.
- Le logo « iris » (`tools/icones.py`) est dessiné avec **Century Gothic** (police de Windows) ; seules les images
  produites sont livrées, pas la police.

## Références

Les photos de l'école (`references/`, hors du dépôt) ont été prises et envoyées par Haythem : elles servent de modèle
pour l'intérieur, rien n'en est affiché dans le jeu.
