# IRIS — l'école en 3D

L'école **IRIS** (MediaSchool) en 3D, dans le navigateur : la balade libre, un jeu de tir à la première personne façon
Call of Duty (SISR contre SLAM, contre des bots), un prop hunt, un stand de tir, et **un mode EN LIGNE pour jouer entre
élèves**.

## Jouer tout de suite, dans le navigateur

**👉 https://liftstudio.github.io/iris/** — rien à installer : ouvre le lien sur un PC (Chrome ou Edge conseillés),
attends le chargement (une minute la première fois), et joue. La balade, le combat contre les bots, le prop hunt et le
stand de tir marchent tels quels. Le mode EN LIGNE (entre élèves) demande, lui, le serveur : voir juste en dessous.

## Installer et jouer (Windows)

1. **Télécharge le jeu** : bouton vert **Code** → **Download ZIP**, puis décompresse le dossier où tu veux.
   (Ou, si tu as git : `git clone https://github.com/LiftStudio/iris.git`.)
2. **Installe Node.js** (version LTS, gratuit) : https://nodejs.org. C'est lui qui fait tourner le jeu ET le serveur en
   ligne. Sans Node, Python suffit pour jouer seul (https://www.python.org, coche « Add Python to PATH »).
3. **Double-clique `Lancer.bat`** dans le dossier : le navigateur s'ouvre sur http://localhost:8124 (Chrome ou Edge
   conseillés). Garde la fenêtre noire ouverte tant que tu joues.

Le premier chargement prend une minute (l'école et les avatars) ; les suivants sont plus rapides.

### Jouer à plusieurs (mode EN LIGNE)

- **Sur le même wifi** : un seul joueur lance `Lancer.bat`. La fenêtre noire et l'écran **EN LIGNE** affichent une
  adresse du genre `http://192.168.1.12:8124` : les autres l'ouvrent dans leur navigateur (PC, téléphone ou tablette),
  rien à installer de leur côté. Chacun clique **EN LIGNE**, choisit son pseudo et son personnage, puis **JOUER**.
- **À distance** : voir [serveur/LISEZMOI.md](serveur/LISEZMOI.md) (un tunnel gratuit, sans compte).
- Au premier lancement, Windows demande l'autorisation pour `node` : **Autoriser**, en cochant **Réseaux privés**.

### Les touches du combat

ZQSD / flèches pour bouger · souris pour viser · clic gauche tirer · clic droit viser · R recharger · Maj sprint ·
C s'accroupir / glisser · Espace sauter · 1 / 2 ou molette changer d'arme · V couteau · G grenade · F ramasser ·
**B changer d'arme et de viseur** ·
Échap pause. Toutes les touches se changent dans OPTIONS.

---


Un jeu à part, tiré de **LA CAGE** : le même moteur, le même rendu et la même façon de bouger, mais **sans ballon**. On
y promène **Haythem**, et rien que lui, dans l'école **IRIS** (MediaSchool) : marcher, courir, sprinter, sauter,
s'asseoir, danser, sortir son téléphone, prendre l'ascenseur. Pas de match, pas de score, pas de boutique : une balade
libre.

> État actuel (v2.0, 14/10, **la passe stricte**) : Haythem veut du « 100 % » — chaque endroit doit ressembler
> EXACTEMENT à ses photos, et ses retours avaient trouvé ce que les vérifications laissaient passer (une porte trop
> loin, une salle trop étroite, deux présentoirs au lieu d'un, un verre transparent au lieu de dépoli, des chaises
> déformées, une ouverture vers le hall manquante). L'école a été coupée en sept zones — le passage, le hall ouest et
> l'escalier principal ; le C05, ses toilettes et le C01 ; le couloir et l'escalier est ; le sous-sol ; le 1er ; le 2e ;
> la rue et la façade —, chacune passée au crible photo par photo (la pose de l'appareil résolue, le jeu rendu au même
> point de vue, côte à côte et en fondu, chaque écart corrigé), puis RELUE par un second passage plus sévère, enfin
> fusionnée et rejouée ensemble. Les plus visibles : la **volée 2 de l'escalier principal à sa vraie pente** (elle
> arrive au 1er 2,35 m plus au sud, au bout du couloir sombre), le **passage des étudiants** à sa largeur et le vrai
> reflet de ses réglettes dans la porte vitrée, l'**espace pause du -1 d'une seule salle** (la vue de la porte de la
> vidéo de Haythem), les **chaises coque du 1er à hauteur de table**, les **coques de hêtre en écusson** du 2e, la
> **porte 6 au fond d'un renfoncement de 1,2 m**, le **5/7 d'en face redessiné** — voir « La version 2.0 » plus bas.
>
> Les retours r05 à r07 (v1.9.1 à 1.9.3, 13-14/10) : à droite du mur ardoise de l'accueil, une **glace** et non un
> bureau d'angle (r05) ; la **salle David Clark** refaite sur sa photo (r06) ; la **porte de la Si 0.1** 0,81 m plus près
> du passage de la pile (r07) ; le C05, ses toilettes et le C01 relus sur les photos 23, 05, 04 et 01.
>
> La v1.9 (12/10, **les retours r03 et r04 de Haythem ensemble**) : la salle d'attente élargie (r03), l'**accueil
> refait sur sa nouvelle photo** (r04 : le comptoir gris clair et son décroché PMR, le mur gris ardoise et ses deux
> affiches, le local aux portes de bois clair, le pilier de bois et son écran suspendu, le panneau des formations, le
> portant des goodies, la cloison vitrée du bureau d'angle, le plafond en plateaux perforés) et les **chaises coque à
> la taille d'une vraie Eames DAR** (0,63 × 0,60, 0,80 de haut : la coque du jeu faisait 0,67 de profondeur et
> paraissait trop grosse sur la photo 02) — voir « La version 1.9 » plus bas.
>
> Le retour r03 (v1.8, 12/10) : « c'est beaucoup mieux, mais cette partie est trop étroite :
> sur la photo, c'est plus grand et plus espacé ». La **salle d'attente s'élargit de 2,925 à 3,125 m** nu à nu, mesurée
> sur la photo 02 (et non reprise du jeu) : le mur jaune ne bouge pas, c'est le mur des jours dépolis qui recule de
> 0,20 m vers la rue avec tout ce qu'il porte ; le pilier gris glisse sur le rayon de r02 jusqu'à sortir du cadre de la
> photo 02, comme sur la photo ; la Si 0.1, imaginée, perd 0,20 m — voir « Le retour r03 » plus bas.
>
> Le retour r02 (v1.7, 11/10) : sur sa photo de la salle d'attente (« ça ne ressemble pas à
> 100 % à la photo »), la salle refaite objet par objet sur r02, 21 et 02 rejouées ensemble — un seul présentoir noir et
> le radiateur à panneau, trois jours de verre dépoli opaque, les vraies coques Eames, la borne à l'écart du pilier,
> le plafond en lames perforées, une lumière plus chaude — et, à droite du pilier, l'**ouverture vers le hall** : le
> mur sud s'arrête, une antichambre mène au hall, le mur nord du bureau de direction recule de 1,9 m et porte la porte
> de la Si 0.1 sur son retour — voir « Le retour r02 » plus bas.
>
> Les finitions du plan V2 (v1.6, 11/10) : la caméra qui garde Haythem dans l'image dans les volées et au passage des
> portes, les places au milieu des rangées serrées (on s'y faufile en pas chassés), le bas de l'escalier principal
> refait sur les photos 20, 06 et r01, la façade sur l'impasse recalée sur les photos 10 à 18, et l'école dessinée par
> ce que la caméra peut voir (deux fois moins d'appels de dessin aux endroits lourds) — voir « Les finitions » plus bas.
>
> Le plan V2 (v1.5, 11/10) : après avoir joué, Haythem a dit « les salles sont trop compressées »,
> « il y a des erreurs sur la ressemblance des salles » et, photo à l'appui, « la porte (grise du hall ouest) n'est pas
> aussi loin ». Sept audits ont rejoué chaque photo et chaque vidéo **au même point de vue** dans le jeu, et le plan a
> été recalé sur le **vrai gabarit** du bâtiment (l'emprise IGN : 19,8 m de façade, 23,7 m de fond à l'ouest et au
> centre, 13,8 m à l'est). Rien n'a été agrandi d'un bloc : chaque pièce a repris les **proportions de ses photos** —
> voir « Le plan V2 » plus bas. L'école est construite d'après **trois sources** — les **29 photos** de Haythem (2026),
> sa **vidéo du sous-sol** (2026) et la **vidéo officielle de visite** de l'école (`visite_officielle/visite.mp4`,
> tournée le 26 avril 2021, 100 s : le hall, la descente au -1, la grande salle, le 1er, la salle réseau, le 2e) ; tout
> est hors du dépôt, dans `references/ecole/`. Là où la vidéo de 2021 et les photos de 2026 se contredisent, ce sont
> les **photos** qui donnent l'état d'aujourd'hui ; la vidéo complète tout ce qu'elles ne montrent pas. **Quatre
> niveaux** d'un seul tenant, reliés par deux escaliers et un ascenseur :
> - le **sous-sol** (-3,06 m) : par la porte grise du hall ouest, le palier, la volée de tôle, le hall du -1, le
>   couloir et l'**espace pause** (la vidéo de Haythem) ; par l'**escalier est**, la descente, le palier « -1 », le
>   **sas technique** et son passage vers l'espace pause ; derrière le mur vert, la **grande salle S -1.14** (110
>   places) — la vidéo officielle ;
> - le **rez-de-chaussée** : le passage des étudiants, le hall ouest, l'escalier principal, le couloir C05 et la salle
>   David Clark, le C01, la salle d'attente au mur safran, le bureau de direction et la Si 0.1 ; le **hall d'entrée** et sa
>   **pile** (la plaque « iris », l'horloge, les annuaires), l'**accueil** nord-sud et son open-space ; derrière la porte
>   nord, le **couloir est**, l'**escalier est** et l'**ascenseur** ;
> - le **1er étage** (3,50 m) : derrière la porte du palier est, l'**espace pause orange** ; au sud la **salle de cours
>   S 1.3**, au nord la **salle Robert Kahn Si 1.4** (TP réseau) ; le couloir sombre jusqu'à l'escalier principal, qui
>   s'arrête au 1er ;
> - le **2e étage** (6,60 m) : le palier et son panneau « 2 », la porte coupe-feu et le sas, le **couloir au mur
>   rouge**, la **salle 1** (côté cour) et la **salle 2** (côté rue).
>
> Ce qui n'a été vu ni sur les photos ni sur la vidéo se visite quand même : c'est **imaginé** (marqué * dans le
> tableau), voir « Ce qui reste imaginé ». La RUE est complète (photos 07 à 18) : voitures garées, totems « iris »,
> jardinières de zinc, bambou et palmier, bancs (on s'y assoit), poubelles, vélos, motos et scooters, grille du jardin
> doublée de brande, impasse et carrefour.

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
| Vue (3e personne → épaule → 1re personne → vue photo) | C | Back / croix bas | VUE |
| Téléphone | P | croix haut | téléphone |
| Pause | Échap | Start | pause |

Toutes les touches se changent dans **Options › Commandes** ; les huit emotes de la roue dans **Options › Emotes**.
Les **rangées serrées** (grande salle S -1.14, S 1.3, rang des fenêtres de la salle 2 du 2e : 129 places dans 24 rangs) :
au bout d'un rang, l'aide dit « ou avance dans le rang » — pousser dans le rang (à moins de 41° de sa ligne) fait passer
Haythem en pas chassés, face à l'avant de la salle, et propose la place devant lui ; il se relève devant elle et ressort
par un bout ouvert (une poussée en travers le ramène au bout le plus proche). Au tactile, le bouton du moment est nommé
dans l'aide (« S'ASSEOIR : … », « DEBOUT : se lever ») et SAUT s'efface dans un rang.
L'**ascenseur** n'a pas de touche : devant sa porte, on l'appelle (le bouton s'allume) ; dedans, au bout de deux
secondes, il part vers le niveau suivant (va-et-vient du rez-de-chaussée au 2e).

## Ce qui a été gardé de LA CAGE

- Le **rendu** complet (`js/fx.js`, `js/options_rendu.js`, `js/ombres_*.js`, `js/ombre_cache.js`,
  `js/sonde_ciel.js`) : occlusion ambiante (GTAO), bloom, SMAA, adaptation de l'œil, étalonnage « photo », ombres
  douces, résolution dynamique, qualité automatique, réglages Basse → Ultra. La météo (`js/weather.js`) a un réglage
  **intérieur** : la carte le prend d'elle-même (`scene.userData.interieur`).
- **Haythem** (`assets/haythem.glb`, version allégée `assets/tel/`) avec ses animations : attente, marche, course,
  sprint, pas chassés, marche arrière, saut, danses, célébrations (`assets/anims/manifest.json`), et les couches
  procédurales (`js/couches.js` : inclinaison, regard, respiration, pas).
- Les **vues** de caméra (3e personne, épaule, 1re personne, et la **vue photo** du V2 : l'œil à 1,45 m et le champ
  des photos de Haythem, pour comparer pièce par pièce), le **clavier/souris**, la **manette** (avec la navigation dans
  les menus), le **tactile** (boutons déplaçables), la **roue des emotes**, le **téléphone** (le groupe s'appelle
  maintenant IRIS), les **options**, l'**écran de chargement** (le logo officiel de l'école sur fond blanc, barre et
  astuces au jaune du logo), la **PWA** (`manifest.webmanifest`, `sw.js`, cache `iris-v2.0`).
- **La caméra V2** (`js/game.js`, 11/10) : champ vertical de 63° (celui des photos, l'horizontal plafonné à 108°),
  recul de 2,6 m à l'intérieur (4,3 m dans la rue), à ≈ 1,9 m de haut avec 7° de piqué, 0,4 m sur l'épaule droite (à
  gauche, ou dans l'axe, quand un mur la gêne : le côté est choisi par une note, sans battement) ; elle ne filme
  **jamais depuis une autre pièce** que celle de Haythem (sa zone, ou une voisine ouverte : sinon le recul est raccourci
  jusqu'au seuil) ; serrée, elle ouvre son champ à 69° et rend Haythem translucide au lieu de le cacher. Au départ, elle
  est dans le hall, comme la vidéo officielle, et non plus dans la rue.
  **Finitions** (v1.6) : dans une volée, elle suit la PENTE (plus haute quand les marches montent derrière lui, dans
  l'axe quand elles descendent, sous les plafonds de son chemin) ; à l'étroit, elle passe AU-DESSUS DE L'ÉPAULE au lieu
  de se coller dans sa nuque ; elle SUIT LE SEUIL d'une porte derrière lui au lieu de bondir ; elle VOIT SA TÊTE (l'os de
  l'avatar : sinon elle se rapproche sur sa ligne, et sa tête reste à 78 % du demi-champ) ; au clavier seul, au
  joystick et à la manette, quand on ne la tourne pas soi-même, le CAP ASSISTÉ la range derrière sa marche (0,8 s après
  le dernier geste ; 2 s quand la souris est capturée). Mesuré sur 22 parcours des volées et des passages étroits :
  Haythem hors de l'image ou caché 21 % → 0,4 % des images au joystick en courant, 24 % → 0,8 % au clavier seul.

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
js/carte_ecole.js     L'ÉCOLE : murs, portes, sols, plafonds, escalier, façade, lumières ; déclare tout au monde solide ;
                      appelle les crochets ci-dessous, range leurs zones, fait la lumière cuite et la carte vivante
js/ecole_matieres.js  les matières dessinées (carrelage 60x120, plafonds perforés, peintures, pierre, signalétique)
js/ecole_portes.js    les portes (fermées, ouvertes, AUTOMATIQUES) et les fenêtres, les vitrophanies de la porte 6
js/ecole_lumieres.js  les spots qui suivent Haythem, la lumière cuite au sol, la carte d'environnement par pièce
js/ecole_mobilier.js  le mobilier (chaises coque où l'on s'assoit, écran, borne, présentoir, affiches)
js/ecole_hall.js      le HALL D'ENTRÉE (la photo r04, la vidéo officielle) : l'accueil nord-sud et son décroché PMR,
                      l'open-space et son mitoyen gris ardoise, la glace du mitoyen (r05), le local technique, le pilier et son
                      écran, le portant des goodies, l'angle nord-est (photocopieur, « INFORMATIQUE », meuble noir), le
                      plafond en plateaux, sa retombée et ses lignes lumineuses
js/ecole_rdc_centre.js la PILE du hall (plaque « iris », horloge, annuaires), le bureau de direction B 0.3 (plaque, drapeau)
js/ecole_rue.js       la rue (trottoirs, chaussée et ses détails, façades voisines et d'en face, jardin, impasse, carrefour)
js/ecole_rue_mobilier.js  le mobilier de la rue, ses plantes (un atlas de feuillage) et ses deux-roues
js/ecole_rue_voitures.js  les voitures garées (assets/voitures.glb, repeintes dans leur texture)
js/ecole_pieces.js    les pièces imaginées du rez-de-chaussée (Si 0.1 informatique, bureau de direction, couloir de
                      service, local technique, toilettes du C05 et PMR, salle David Clark Si 0.2 et la courette ouest) :
                      murs qui manquaient, mobilier, luminaires, sièges, zones de lumière, miroirs
js/ecole_est.js       le couloir est, le vestibule et l'escalier est (photos 24 à 29, vidéo) : la porte nord du hall, les
                      volées jusqu'au 1er (poserEst, appelé par la carte) ; le palier est du 1er et la cage jusqu'au 2e
                      (poserPalierEst, appelé par l'étage) ; la cage au-dessus du 2e (poserCageHaute)
js/ecole_ascenseur.js L'ASCENSEUR : la façade palière inox, l'afficheur, la platine d'appel, la cabine (imaginée) qui
                      dessert le rez-de-chaussée, le 1er et le 2e ; la bande sud du palier est du 1er
js/ecole_etage1.js    le 1er ÉTAGE : sa façade percée, le bureau 103, la salle 104, le couloir sombre, le palier d'étage
                      ouest, le haut de la cage de l'escalier principal (qui s'arrête au 1er) ; sa lumière et son ombre cuites, sa visibilité et ses ombres selon
                      l'étage de Haythem, les sièges de son niveau (quatre niveaux : -1, 0, 1, 2) ; appelle :
js/ecole_etage1_pause.js  l'espace pause orange, la salle de cours S 1.3, le recoin, le bureau de la travée 1, la porte
                      de la Si 1.4 (Y_MUR_ORANGE, SI14)
js/ecole_kahn.js      la salle Robert Kahn Si 1.4 (TP réseau) et son toit à lanterneaux
js/ecole_etage2.js    le 2e ÉTAGE : palier, porte coupe-feu, sas, couloir rouge, salles 1 et 2, façades ; sa lumière et
                      son ombre cuites, sa visibilité
js/ecole_soussol.js   le SOUS-SOL (la vidéo de Haythem) : palier, volée de tôle, hall du -1, couloir, espace pause ; sa
                      lumière et son ombre cuites (cuireOcclusionNiveau : l'ombre douce de chaque niveau), la dalle qui
                      coupe les ombres du rez-de-chaussée, sa visibilité ; appelle :
js/ecole_amphi.js     la grande salle S -1.14, derrière le mur vert
js/ecole_soussol_est.js   la descente de l'escalier est au -1, le palier « -1 », le sas technique et le passage
js/ecole_visibilite.js  CE QUE LA CAMÉRA PEUT VOIR : l'école en zones (la rue, les cages et la trémie par niveau, l'est,
                      les pièces fermées, l'avant et le fond des étages), le décor cousu rangé par familles de zones,
                      et à chaque rendu les zones cachées tirées de la position de la caméra (__visibilite.actif = false
                      montre tout)
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
renvois à l'origine du code, ces fichiers n'existent pas ici. Les commentaires de l'école citent leurs sources :
« photo 24 », « VO q_0277 » (une image de la vidéo officielle, q_n ≈ (n - 1)/4 s), « 92,6 s » (un instant de la vidéo).

## L'école dans le jeu

Sources : **P** = photos de Haythem (2026), **V** = sa vidéo du sous-sol (2026), **VO** = la vidéo officielle (2021),
en secondes ; * = imaginé.

| Pièce | Ce qu'on y trouve | Sources |
|---|---|---|
| **Sous-sol (-3,06 m)** | | |
| Le palier et la volée (ouest) | derrière la porte grise du hall ouest : le palier de béton peint taupe (le panneau jaune « 0 », un hublot, l'interrupteur à voyant vert), une longue volée droite de 17 contremarches en tôle larmée, garde-corps inox à quatre lisses, le rampant du plafond à 2,95 m des nez ; le rebord du mitoyen et son objet jaune (V2 : toute la chaîne suit la porte grise, 4,09 m plus près de la rue) | V (v_001 à v_030) |
| Le hall du -1 et le couloir | un hall presque carré à la résine grise (« -1 », extincteur, consigne, poutre, bloc lumineux, porte grise), son mur est en décrochement ; le couloir étroit de 0,92 m qui revient vers le sud sur 7,8 m, grès gris foncé, quatre spots | V (v_026 à v_058) |
| L'espace pause | UNE SEULE SALLE de 7,9 × 9,3 m (v2.0 : la vue de la porte de la vidéo de Haythem — plus de retour sud ni d'aile), grand carrelage beige ; au mur ouest, le mur vert anis et la tablette aux micro-ondes de 2021 ; au mur est, le comptoir en équerre et ses trois cadres, les casiers et leur poubelle grise, le passage aux deux portes crème (vers le passage sombre et le sas), la grille, deux A4, la poubelle bleue ; au mur sud, le trombinoscope, la porte sombre (ouverte sur un local éteint) et les trois distributeurs tournés vers la salle ; les mange-debout du mur vert à 0,85 m de lui, deux tables en X, l'îlot de mange-debout et sa Tolix verte, la table grise, le baby-foot devant le comptoir (on s'assoit : 116 places au -1) ; les deux dalles qui manquent au plafond | V (v_059 à v_067) ; VO q_0088, q_0134-0137 |
| La grande salle S -1.14 | derrière la porte vitrée dépolie du mur vert (« Salle de cours S -1.14 ») : sol plat, 8 + 6 rangs de tables filantes de hêtre, 98 fauteuils coque jaune moutarde (on s'assoit, et on se faufile en pas chassés jusqu'au milieu des rangs ; le bout ouest du rang 7 s'ouvre contre le poteau), tableau triptyque sous le carter de l'écran et ses enceintes, le portrait d'Einstein et un second en gris, meuble multimédia, poteau et retombée, convecteurs, goulotte, luminaires à grille ; la porte verte du fond (V2 : dans la parcelle, y 11,86-21,41, son mur est en x 13,3) | VO 26,7-33,9 s ; son état de 2026 n'est pas vu |
| La descente est | la volée A sous la volée 2 du rez-de-chaussée, le palier bas à -1,53 (réglette, voyant, bloc de sortie, affiche iris), la volée B, le palier du -1 (le panneau cuivré « -1 » : « Salle de cours S -1.14 / Espace pause », l'interrupteur), la porte à deux vantaux (ouverte à demeure vers le palier, comme sur la vidéo) | VO 12,4-18,2 s, 35,5-41 s ; P 24 (la tête) |
| Le sas technique, le passage P, le passage sombre * | la porte grise « RÉSERVÉ AU PERSONNEL », la plaque du trumeau, la porte double ⚡ du local électrique, la porte crème ⚡ (un placard), un boîtier noir ; le PASSAGE P, puis un passage sombre (éteint, mais lisible : le bloc de sortie vert et sa lueur, une veilleuse ambre au ras du sol — imaginés) jusqu'au passage aux deux portes crème de l'espace pause | VO 18,2-21,8 s ; V v_060-v_067 |
| **Rez-de-chaussée** | | |
| Le hall d'entrée | la porte n° 6 (automatique) au fond d'un renfoncement de 1,2 m (v2.0, photos 16 et 17 : ses vitrages en y 0,8 ; le portail : retours de pierre, grille à lames, interphone, bandeau noir, sous-face grise et sa grille, seuil carrelé, soubassement taupe) et ses vitrophanies (quart de cible, nuage et sa constellation, équerre jaune, pavé « iris », phrase, visage), tapis ; l'ACCUEIL nord-sud refait sur r04 (le comptoir de stratifié gris clair à rainure, sur son socle de chêne clair, la tablette grise en saillie ; le décroché PMR, son caisson bas et son caisson à tablette haute : bouilloire, bacs à courrier noirs, papiers, l'écran « DELL »), l'open-space du personnel (trois fauteuils : on s'y assoit) et son mitoyen gris ardoise (deux affiches encadrées, la caméra dôme) ; à droite du mur ardoise, la GLACE collée sur le mitoyen (retour r05 : penchée de 2,7°, elle renvoie le hall, la porte 6 et la baie du bureau de direction, et Haythem s'y voit), la machine à affranchir ; au fond, le local technique aux portes de bois clair, le pilier de bois clair et l'écran suspendu « Commander votre sweat à l'accueil », le panneau des formations aux bandeaux orange, le portant noir des goodies ; plafond en plateaux perforés, la retombée est-ouest, les huit lignes lumineuses et les spots ; l'angle nord-est (pan cannelé, photocopieur, étiquettes « INFORMATIQUE », meuble bas noir) ; deux fenêtres à barreaux | P r04, r05, 03, 16, 17, 24 ; VO 3-7 s, 92,5-97,8 s, q_0372-0392 |
| La pile du hall | face sud : l'horloge ambre (à l'heure de l'ordinateur), la plaque « iris » et l'annuaire du niveau 0 (Si 0.1, Si 0.2) ; face est, jaune : le grand annuaire à seize lames ; face ouest, le fond de la salle d'attente : le présentoir noir à cinq tablettes, le radiateur vertical à panneau gris (0,5 × 1,25), affichettes « WIFI », haut-parleur, le boîtier blanc à deux voyants | VO 6,4-12,4 s, 92,6 s ; P 03, 21, 22, r02 |
| La salle d'attente | 3,1 × 7,5 m (3,125 nu à nu, retour r03 : 2,925 avant) entre le mur safran et le mur des jours dépolis, qui est aussi le mur nord de la Si 0.1 (V2 : 4,2 m plus près de la rue — il n'y a plus de « cou ») ; mur safran et sa lisse blanche (de 0,73 à 0,93, v1.9.3 : photos 05 et 04), panneau DAE, écran, kakémono « 1ère école pour le BTS SIO » au bout du mur (18 cm plus à l'ouest, v1.9.3) ; chaises coque Eames DAR à leur taille (0,63 × 0,60, assise à 0,45, 0,80 de haut — v1.9) sur piètement tour Eiffel, adossées aux deux murs (on s'y assoit : trois au sud, cinq au nord ; 1,89 m entre les bords avant des deux rangées) ; trois jours de verre dépoli OPAQUE vert pâle à cadre blanc épais, quatre affiches sur celui du milieu, la double lisse grise dessous ; la borne contre le mur sud, tournée vers le nord, son écran en mosaïque de photos ; le pilier gris (0,86 × 0,43, x 9,18-10,04 × y 5,46-5,89 : 0,79 m du mur des jours, 1,31 m de passage jusqu'aux chaises du nord — 1,25 en v1.8) et ses affiches ; plafond en lames perforées de 30 cm et sa bande de dalles lisses au sud, spots d'un blanc chaud (2 900 K) ; à droite du pilier, l'ouverture vers le hall (retour r02) ; le présentoir du C01 plus loin dans le couloir | P r02, 21, 02, 01, 03 ; VO 7-11,6 s, q_0034-0056 |
| L'antichambre et le passage de la pile | derrière le bout du mur sud de la salle d'attente (x 9,24, le drapeau noir du bureau de direction sur sa face nord), du mur nord du bureau (ligne y 2,925) à la ligne du mur des jours : la porte grise de la Si 0.1 dans son mur, en x 9,975 (retour r07 : 0,81 m plus près du passage de la pile, un redan devant le bout du mur sud), la plaque « Bureau de direction B 0.3 » ; sur le mur du bureau, son jour dépoli ; elle rejoint le passage de la pile, qui s'ouvre sur le hall sur 2,1 m ; au bout, la porte vitrée du bureau à cadre blanc et à affiche ; sombre (pas de spot à elle) | P r02, r07, 01, 03, 22 ; VO q_0040-0043 |
| Le bureau de direction B 0.3 * | 3 m de profondeur derrière la porte vitrée : bureau de chêne, fauteuil et chaises visiteurs (on s'assoit), armoire, bibliothèque, tableau, plante dans l'angle | — |
| La Si 0.1 Tim Berners-Lee * | l'ex-salle A, derrière la porte grise de l'antichambre, de la cloison mince du passage (x 4,73, v2.0) au mur de sa porte, 4,525 m de profondeur : deux rangs de postes face au nord (cinq, et quatre au fond), la toile devant les jours dépolis, le poste de l'enseignant, le tableau blanc, l'imprimante ; trois fenêtres sur la rue | nom : annuaire de la pile (VO) |
| Le passage des étudiants | 2,95 m de large derrière l'ouverture de 2,25 (v2.0 : son mur est n'est qu'une cloison mince, nu 4,70 ; un retour brun derrière le jambage), 4,05 m de la façade à la double porte vitrée (automatique, 2,25 × 2,47, cadre de 9 cm, méplats blancs coudés, autocollants « iris » de 7,8 × 4,2 cm au dos presque noir) ; plafond plat à 2,60 ; les deux réglettes pendues, leur lueur jaune en haut des murs et leur VRAI REFLET dans la porte vitrée ; deux tableaux de liège, la charte, la porte blanche « Sortie », l'affichette au QR code ; la grille noire ouverte sur la rue, le seuil clair et la grille d'égout sur le trottoir ; vu de la rue, sombre et chaud, vu du hall, d'un blanc froid (les voiles qui s'effacent quand on approche) | P 07, 10, 19 |
| Le hall ouest | 4,9 m de la paroi vitrée aux portes de l'escalier : la pile du plan d'évacuation (0,70 × 0,92), puis, 0,97 m après la paroi, la porte grise de l'escalier du sous-sol (taupe, fente vitrée large, ferme-porte à glissière) dans son renfoncement de 2,25 m, dans la pénombre ; l'extincteur penché et sa boucle, le radiateur à façade grise contre l'avancée nord, l'affiche jaune du tri, les portes coupe-feu de 2 × 1,0 m (le vantail ouest entrouvert à 85°, fentes vitrées larges, gris bleuté côté hall, beige côté cage, bandeau gris bleuté de 18 cm, ferme-porte gris clair) ; plafond de plâtre gris neutre à 2,30 qui remonte contre la paroi vitrée, un hublot, le dôme de la caméra | P 06 et r01, 02, 04, 07, 20 ; V |
| L'escalier principal | par la porte, la volée 1 de quatre contremarches vers le nord (girons de 0,32, le poteau à platine au pied), le palier à 0,70 devant le mur à affiches (A4 violette, écusson vert, affiche A2, grand panneau, main courante horizontale), puis la volée 2 de seize contremarches vers le sud, À SA VRAIE PENTE (v2.0, photo 06 : girons de 0,366), à l'ouest, au-dessus d'un mur d'échiffre blanc (lisse basse et main courante sombres, barreaux gris) ; elle passe derrière l'avancée nord du hall (son coffrage) et au-dessus de la trémie de la volée de tôle, entre deux murs, et arrive au 1er en y 6,0, au bout ouest du couloir sombre | P 20, 06 et r01, 04, 23 |
| Le couloir C05 | 1,39 × 3,6 m, du jambage des portes de l'escalier (8 cm) à la porte bleue : le plafond bas du hall y entre de 0,65 m, puis le plafond à 2,45 et ses deux hublots ; les deux portes des toilettes (0,93, en retrait de 6 cm, fente vitrée de 22 cm, verre ardoise, plaques de 16,5 cm, l'affiche orange) ; au fond, la porte bleue de la salle David Clark (automatique, rétro-éclairée par la salle) et son imposte, l'interrupteur et la prise | P 05, 23, 04 |
| Les toilettes du C05 * | femmes : deux cabines aux portes safran, les vasques et leur miroir ; hommes : deux cabines, trois urinoirs, deux vasques ; faïence, grès, sèche-mains, un vrai miroir sur PC | portes : P 23 |
| La salle David Clark Si 0.2 | derrière la porte bleue : la salle de la photo r06 de Haythem (« c'est la salle qui doit être là »), 8,375 × 9,475 m jusqu'au fond du bâtiment, aveugle ; plafond de dalles de 120 × 60 à 2,35 et ses luminaires à grille, moquette vert olive, le gros poteau, l'armoire anthracite, les rangées de tables de hêtre et leurs postes éteints, l'îlot en T et son vidéoprojecteur, les chaises coque moutarde sur luge (35 places : on s'assoit), la chaise bleu marine | P r06, 23, 05 ; nom : VO 7,9 s |
| Le couloir C01 | 1,60 m de large (v1.9.1, photo 01) : la porte du local à l'entrée, la gaine en face (deux vantaux au-dessus de la plinthe, la grille et la trappe), la porte des toilettes PMR ; le plafond à 2,35, puis à 2,47 passé la retombée de y 9,80 ; au fond, une porte fermée ; un présentoir à l'entrée (ses brochures vues de chant) | P 01 |
| Les toilettes PMR *, le local technique *, le couloir de service * | cuvette suspendue et barres d'appui ; baies serveurs aux diodes, onduleur, tableau électrique ; bacs, chariot de ménage | plaque : P 01 |
| Le couloir est et le vestibule | lino moucheté, mur jaune et sa plaque directionnelle bleue (Si 0.1, Si 0.2), cannelé gris-vert, plinthes gris foncé, plafond de plâtre et hublots, poteau gris ; la niche : la tête de la descente au -1 (poteaux à crosse, portillons repliés, tapis) ; le dégagement et, au bout, l'ascenseur ; le vestibule jaune, son affiche à la pomme et le déclencheur rouge, la porte nord crème ; au fond, un local fermé de 0,9 m et le mur du fond de la partie est (y 13,8, IGN) | P 24, 26 ; VO 12-15 s, 38-41 s, 90-92 s |
| L'ascenseur | au bout du dégagement (rez-de-chaussée), de la bande sud (1er) et du vestibule (2e) : la façade palière inox (fixe, deux vantaux télescopiques, afficheur bleu, platine d'appel) ; la cabine * (inox, granit, main courante, boutons) qui porte Haythem d'un niveau à l'autre | VO 68,2-70 s (au 1er) ; rez-de-chaussée et 2e déduits |
| L'escalier est | en U contre le mitoyen : 2 x 9 marches sombres à nez noirs et arête d'aluminium, parties à 0,23 m du jambage (girons de 0,251), mains courantes noires à 0,90 m des nez et leurs crosses, palier à 1,75 m (réglette, bloc de sortie, affiche « la vie à l'école »), l'échiffre ORANGE jusqu'au 1er puis ROUGE jusqu'au 2e, le palier à 5,05 m ; la cage monte au 3e (volées 5 à 7 *, portillon *) | P 25, 26, 27, 28, 29 ; VO 41-44 s, 68-72 s, 88,8-90 s |
| La rue | trottoirs, chaussée gris neutre, bordure et caniveau sombres, les marques du trottoir ; la façade de l'école recalée sur les photos (les encadrements rouges, une fenêtre d'un vantail par travée dans un cadre brun-noir, les grilles des baies dans leur tableau, le 5e étage et la toiture plate, le portail n° 6 et son renfoncement de 1,2 m, l'écusson, les drapeaux, les projecteurs anthracite) ; le n° 4 en relief (balconnets de fonte, portail de pierre), le n° 8 et sa caméra, le lampadaire sur sa console à 7,7 m ; en face, le 5/7 redessiné d'un seul tenant de x −6,5 à 12,1 (caissons de mélèze, porche du garage, pilier « 5/7 », porche de l'entrée), l'immeuble à balcons en relief, l'immeuble crème et le café ; au fond de l'impasse (x −10), le mur de 2,4 m sous sa grille, l'escalier en colimaçon et les deux immeubles derrière ; les deux totems « iris », les bacs de zinc, le bambou, le palmier en gerbe, les bancs (on s'y assoit), le grand conteneur gris-bleu, les vélos et la station de réparation, motos, scooters ; huit voitures garées ; le jardin et ses arbres gris-vert, le carrefour | P 07 à 18 |
| **1er étage (3,50 m)** | | |
| Le palier est | vinyle moucheté foncé, le panneau d'étage (« 1 » : S 1.3, Si 1.4, Si 1.5, Espace pause, S 1.6), « WIFI IRIS », « POINT ÉCOUTE », l'échiffre orange et son chant gris, la main courante du mur sud du palier (le tube noir du bord des photos 28 et 29), la bande d'éveil, la porte gris taupe de l'espace pause au fond de son alcôve ; le renfoncement et le mur nord dans l'ombre | P 27, 28, 29 ; VO 41-45 s, q_0276 |
| La bande sud | le doublage, le grand tableau abstrait, le disque de laiton, le boîtier vert, la réglette, l'extincteur, la porte de l'ascenseur ; aucune porte (le 103 et la 104 ne s'y ouvrent pas) | VO 68,2-70 s |
| L'espace pause | 7 m de profondeur (V2 : le mur des jours 2 m plus au sud — ce n'est plus un couloir de 0,78 m) : murs blancs et orange, plan en L ; le local fermé du coin nord-ouest * et, sur sa face est, la niche des distributeurs (machine à café, machine à snacks à deux portes vitrées) et leur habillage jusqu'au meuble bas brun ; trois poteaux (le 2e en x 6,64-7,16, le 3e de 0,62 m et sa sketchnote de 0,50 × 0,72) sous une retombée blanche, leurs murets lilas à tablette, la plaque « Espace pause » dans la fente du 1er au 2e, la porte de service à vitre lilas-bleu ; banquettes courbes moutarde et rouge, table basse, cinq mange-debout, tabourets « Miura », les trois chaises coque À HAUTEUR DE TABLE sur tour Eiffel noire (v2.0 : elles étaient montées en chaises de bar ; on s'assoit : 22 places) ; lino taupe, dalles et plafonniers ronds à lumière froide, trois jours dépolis, la notice A2 du pan est ; au fond, le mur orange et la porte vitrée de la Si 1.4 | VO 44,9-49,2 s, 53,2-54,8 s, 66,6-68,1 s, q_0183-0270 ; P 28 |
| La salle de cours S 1.3 | 4,7 m de profondeur, plafond à 2,50 : sept fenêtres sur la rue et leurs cache-radiateurs, moquette en dalles bleu-gris, tables doubles de hêtre clair, chaises de hêtre au VISAGE PERCÉ (deux yeux, une bouche en arc) sur luge argent (on se faufile derrière les dossiers jusqu'aux places des fenêtres), le triptyque de 0,98 + 2,0 + 0,98, vidéoprojecteur ; un blanc froid | VO 49,2-53,2 s, q_0200-0212 |
| Le recoin sud-est | un renfoncement qui file au sud jusqu'à une porte taupe fermée (la seconde porte de la salle) | VO 67 s |
| La salle Robert Kahn Si 1.4 | la salle réseau aveugle, dans le gabarit du bâtiment (sa porte à 4,4 m de son mur ouest) : six caissons lumineux, poutre et deux poteaux, 30 postes (tours noires, écrans, consoles), commutateurs, routeurs, borne Wi-Fi, cordons rouges et cyan, deux tableaux à schémas, bureau de l'enseignant, étagère miel, extincteur, desserte bleue, prises et sonde, porte grise fermée ; moquette marine, lumière froide (31 places) ; son toit à lanterneaux | VO 54,7-66,6 s |
| Le couloir sombre * | derrière la porte du fond de l'espace pause, jusqu'au palier de l'escalier principal, qui est son bout ouest (v2.0 : la volée 2 y arrive en y 6,0) : la double porte coupe-feu « 1er étage » en travers du couloir (x 3,0, ouverte à demeure), le mur nord safran, le banc, le plan d'évacuation, l'extincteur, le placard de ménage à l'ouest de la volée | — |
| Le bureau de la travée 1 *, le bureau 103 *, la salle Gordon Earle Moore Si 1.5 (104) * | derrière la grande baie rouge et les fenêtres des travées 9 à 12 ; fermés (leur accès n'est pas vu) | façade : P 11, 12, 16, 18 ; nom : P 28 |
| **2e étage (6,60 m)** | | |
| Le palier | la copie de celui du 1er : le mur du panneau « 2 » (« Salles de cours S 2.7 - S 2.8 / Salle Bjarne Stroustrup Si 2.6 / Bureau des Conseillers B 2.3 »), réglette, poussoir, prise, tapis ; une fenêtre dans ce mur ; l'extincteur du recoin ; le vestibule de l'ascenseur | VO 70-72 s |
| La porte coupe-feu et le sas | automatique (fermée vue du couloir, on la tire du palier), bâton inox, oculus dès 0,60 m, huisserie de bois côté palier ; côté sas, la plaque noire, le plan d'évacuation, la caméra | VO 72-73 s, 88 s, q_0289-0292, q_0351-0355 |
| Le couloir | le mur nord ROUGE VERMILLON, lino taupe, plafond lisse à 2,45, six spots, trois chaises noires, la photo turquoise, deux affiches, les plaques ; au fond, une porte grise fermée | VO 73,1-75,7 s, 84,2-88,7 s |
| La salle 1 (S 2.7, côté cour) | 9,35 × 4,9 m, plafond à 2,40 (V2 : elle prend la place du haut de l'escalier principal, que rien ne montre) : six fenêtres à stores de toute la hauteur, embrasures brun-noir, la sixième plus large et sans store ; neuf luminaires d'un blanc neutre, vidéoprojecteur, moquette marine en damier, cinq rangées, des coques de hêtre ocre doré à dossier haut en ÉCUSSON, rentrées sous les tables (31 places), tableau blanc, coin du professeur (caisson gris, meuble noir), poteaux | VO 75,8-78,4 s, q_0304-0314 |
| La salle 2 (S 2.8, côté rue) | plafond à 2,40, d'un blanc froid, cinq fenêtres d'un seul vantail et, dans le cadre rouge de la travée 7, la fenêtre haute qui descend au sol (photos 11, 12), moquette anthracite bleuté, deux colonnes de tables pour deux, coques de hêtre en écusson à six trous rentrées sous les tables (rang des fenêtres : on s'y faufile), triptyque, range-documents | VO 78,4-84,2 s, q_0315-0337 ; P 11, 12 |
| Fermés * | la Si 2.6, le B 2.3, le dégagement ouest | — |

Le départ est dans le hall d'entrée, juste passé la porte 6, face à la pile et à sa plaque « iris » — là où entre la
vidéo officielle. Pause › **Revenir au départ** y ramène.

### Le plan V2 (11/10/2026)

Les retours de Haythem après avoir joué (« trop compressé », « des erreurs de ressemblance », « la porte n'est pas
aussi loin ») avaient trois causes, et aucune ne se réglait en agrandissant tout : des pièces mal placées ou trop
longues, une caméra qui reculait de 4,3 m (elle filmait depuis la pièce voisine et se collait dans les couloirs), et
des pièces imaginées encombrées. Le plan V2 recale chaque pièce sur ses photos, rejouées au même point de vue dans le
jeu (même place, même cap, même focale : f ≈ 600 px pour 1 600 sur les photos 01-21, 1 500 pour 4 000 sur les photos
23-29, ≈ 1 000 pour 1 920 sur la vidéo du -1, ≈ 430-513 pour 640 sur la vidéo officielle), et sur le vrai gabarit du
bâtiment (l'emprise IGN BD TOPO : façade de 19,8 m, 23,7 m de fond à l'ouest et au centre, 13,8 m à l'est, deux ailes
fermées à l'ouest et une courette entre elles).

| Ce qui a changé | Avant | V2 | D'où |
|---|---|---|---|
| Le bloc ouest du rez-de-chaussée | ≈ 4,2 m trop au nord | trois décalages : la salle d'attente −4,20 (`DY_A`), l'escalier principal et le C05 −4,675 (`DY_S`), l'ouest du -1 −4,09 (`DY_SS`) | P 02, 03, 06, 21, 23 ; VO q_0027-0046 |
| Paroi vitrée du passage → porte grise | 4,10 m | **0,97 m** (la pile du plan d'évacuation 0,70 × 0,92, le renfoncement de 2,25) | P 06, r01 |
| Le hall ouest | 8,6 m de long, plafond 2,40 | **4,9 m**, plafond 2,30 | P 06, 04, 07 |
| Le passage des étudiants | 3,0 × 5,4 m, ouverture 3,3 | **2,25 × 4,45 m**, ouverture 2,25, sans fixes vitrés | P 07, 10, 19 |
| La salle d'attente | derrière un « cou » de 4,2 m | contre le bureau de direction et la pile ; le cou, le kakémono et le totem disparaissent | P 01, 02, 03, 21 |
| Le passage de la pile | 1,13 m | **2,1 m** | P 03 |
| Le C05 | 1,05 × 5,0 m, un trumeau de 0,30 avant lui | **1,4 × 3,6 m**, il commence au jambage des portes de l'escalier | P 05, 23 |
| Le C01 | local à 1,85 m, PMR 4,3 m plus loin | **2,8 m et 1,4 m**, la gaine en face du local | P 01 |
| La salle David Clark Si 0.2 | 40 m², hors du bâtiment | **59 m²** dans le bâtiment, allées ≥ 0,9 m | IGN |
| L'escalier principal | jusqu'au 2e | **jusqu'au 1er** (rien ne montre son haut ; la salle 1 du 2e prend la place) | VO q_0304-0313 |
| Le -1 | grande salle hors de la parcelle | toute la chaîne de la porte grise recule de 4,09 ; grande salle y 11,86-21,41 ; un passage sombre * relie le passage P à la porte sombre de 2026 | V v_001-067 ; VO |
| L'espace pause du 1er | 4,97 m de profondeur, passage de 0,78 | **7,0 m**, passage de 2,4-2,8 | P 28 ; VO q_0183-0270 |
| La S 1.3 | 6,7 m de profondeur, plafond 2,70 | **4,7 m, 2,50** | VO q_0205-0212 |
| La Robert Kahn | 1,1 m hors du bâtiment | dans le gabarit | VO q_0221 ; IGN |
| La salle 1 du 2e | 8,05 m de long, plafond 2,70 | **9,35 m, 2,40** | VO q_0304-0313 |
| Le couloir est, la cage est | proportions justes | matières seulement (lino, jaune, cannelé, plaque, nez de marche) | P 24, 25, 26 |
| La caméra | 4,3 m de recul, 58° | **2,6 m, 63°**, jamais dans une autre pièce, vue photo | P 01, 06, 24 ; VO q_0300 |

Les coordonnées du V2 sont celles du plan de `js/carte_ecole.js` ; les constantes de décalage sont en tête des modules
qui s'en servent (`DY_A`, `DY_S`, `DY_SS`, `Y_ESC`).

### Les finitions (v1.6, 11/10/2026)

Cinq lots, chacun construit puis relu en jouant (au même point de vue que les photos, et en vue de jeu), puis fusionnés
et rejoués ensemble :

| Ce qui a changé | Avant | Finitions | D'où |
|---|---|---|---|
| La caméra dans les volées, les paliers, les passages étroits (`js/game.js`) | collée dans sa nuque, translucide, ou Haythem hors de l'image (21 % des images au joystick en courant) | la pente, au-dessus de l'épaule, le seuil suivi, la tête toujours vue, le cap assisté : **0,4 %** | P 25 ; V v_010 ; banc de 22 parcours × 5 façons de jouer |
| Les places au milieu des rangées serrées (`js/player.js` `poserRangs`) | 80 places qu'on ne prenait qu'au bout du rang | on s'y faufile en pas chassés : **129 places dans 24 rangs**, 314 places sur 331 se prennent en marchant (les 17 autres sont dans des pièces fermées) ; dans la salle 2, les chaises rentrées de 0,15 m sous les tables, le rang au milieu du passage | VO q_0108-0130, q_0204, q_0324 |
| Le bas de l'escalier principal (`js/carte_ecole.js` `construireEscalier`) | un U de 2 × 10, palier à 1,75 : par la porte, le flanc de la volée 1 | quatre contremarches dans la porte, palier à 0,70 devant le mur à affiches, volée 2 à l'ouest au-dessus d'un échiffre ; garde-corps hors de l'occlusion de l'écran (plus de moucheté gris) | P 20, 06 et r01, 04 |
| La façade sur l'impasse (`js/carte_ecole.js`, `js/ecole_etage1.js`, `js/ecole_etage2.js`, `js/ecole_matieres.js`, `js/ecole_rue*.js`) | cadres rouges carrés, fenêtres à meneau et imposte, tableaux de pierre claire, attique en retrait, plafonniers vus par les vitres | cadres 1,47 × 2,53 aux vraies travées, une fenêtre d'un vantail dans un cadre brun-noir, 5e étage et toiture plate, reflets de la rue, mobilier du trottoir à sa place | P 10 à 18 (recalées à 2-9 px) |
| Le rendu (`js/ecole_visibilite.js`) | le rez-de-chaussée et la rue dessinés partout, le 1er et le 2e en entier depuis la rue | ce que la caméra ne peut pas voir n'est pas dessiné : rue 2 150 → 1 380 appels, palier est du 1er 1 482 → 807, pause du -1 1 166 → 597 ; le passage sombre du -1 lisible | V v_066, v_067 |

À l'intégration : le tri par zones a suivi l'escalier refait (la cage part de x 0,60, la volée 2 surplombe la trémie de
la volée de tôle) — rejoué tri actif puis coupé, pixel à pixel, sur les trois escaliers en montée et en descente, les
couloirs des quatre niveaux, la rue et plus de 500 poses tirées au hasard là où l'on marche.

### Le retour r02 : la salle d'attente et la jonction vers le hall (v1.7, 11/10/2026)

Haythem a envoyé sa photo de la salle d'attente, prise du bout ouest vers l'est (`retours_haythem/r02_photo_salle_attente.jpg`,
la photo 21 en pleine définition, 1 848 × 4 000, ultra grand-angle : f ≈ 1 502 px), avec sa capture du jeu au même
endroit : « on voit bien qu'il y a des trucs qui ne vont pas, ça ne ressemble pas à 100 % à la photo ». La salle a été
refaite objet par objet sur r02 et la photo 02 rejouées ENSEMBLE (deux poses retrouvées à la fois, la 02 calée sur la
porte grise du hall ouest), puis relue ; la jonction vers le hall a été construite et relue de même (r02, photos 01, 03,
VO q_0027, q_0036, q_0040-0043).

| Ce qui a changé | Avant (v1.5-v1.6) | v1.7 | D'où |
|---|---|---|---|
| Les présentoirs du fond | deux côte à côte | UN, noir, à cinq tablettes jusqu'au sol ; celui du C01 plus loin dans le couloir (y 8,1-8,9), caché par le bout du mur safran ; à droite, le radiateur vertical à panneau (0,5 × 1,25) | r02, P 21, 01 |
| Les jours du mur sud | deux grandes vitres à 86 % : la Si 0.1 et ses postes vus au travers, les affiches flottantes | TROIS jours de verre dépoli OPAQUE vert pâle (1,02 × 1,28, de 1,12 à 2,40), cadre blanc de 8,5 cm et appui saillant ; les quatre affiches collées sur celui du milieu (les mêmes vues de près sur r02 et sur la 02) ; la double lisse grise dessous | r02, P 02, 21 |
| Les chaises | des « palettes » plates | des coques Eames (baquet, accoudoirs, dossier renversé, ourlet) sur un vrai piètement tour Eiffel ; au sud canard, rose, noire en x 7,0 / 6,2 / 5,4, au nord cinq de 6,8 à 9,6 | r02, P 02, 21 |
| La borne | collée au pilier, des pictogrammes bleus | contre le mur sud en x 8,6, tournée vers le nord, 1,82 m sur son socle plat, l'écran en mosaïque de 4 × 3 photos | r02 |
| Le pilier gris | x 10,3-10,9 × y 5,55-6,15 : vu du bout ouest, 7,5° trop à gauche et 1,5 m trop loin | x 8,80-9,66 × y 5,59-6,02 (les rayons de r02 et de la 02 croisés), un ton plus sombre que les murs | r02, P 02 |
| Le plafond, la lumière | un damier de plateaux de 60 × 120, aussi blanc que les murs, des spots froids | des lames perforées de 30 cm du sud au nord, joint en long à y 7,42, une bande de dalles lisses le long du mur sud ; un beige chaud ; spots relevés sur les photos, 2 900 K | r02, P 02, 21 |
| À droite du pilier | le mur sud, la porte grise de la Si 0.1, le mur nord du bureau en y 4,8 : le hall ne se voyait de nulle part | le mur sud s'arrête en x 9,24 (le drapeau du bureau de direction sur ce bout de mur) ; derrière, une ANTICHAMBRE de 1,7 m qui rejoint le passage de la pile et le hall ; le mur nord du bureau recule à la ligne y 2,925 ; la Si 0.1 perd son angle nord-est, sa porte passe sur le retour x 9,165 (et sa plaque, et celle du bureau, face à l'est) | r02, P 01, 03 ; VO q_0040-0043 |
| Le fond de la salle | un bloc de sortie vert | un boîtier blanc à deux voyants bleutés ; le kakémono « 1ère école pour le BTS SIO » au bout du mur safran | r02 |

À l'intégration avec les finitions : la salle, rejouée aux poses de r02, de la 21 et de la 02, est la même que sur la
branche du retour, pixel pour pixel hors du hall vu par l'ouverture (la façade des finitions et l'heure du jour) ; la
salle d'attente, l'antichambre, la Si 0.1 et le bureau sont dans la zone du rez-de-chaussée du tri par zones
(`js/ecole_visibilite.js` : jamais cachés au rez-de-chaussée), tri actif et coupé identiques sur le trajet porte 6 →
antichambre → Si 0.1 → salle → hall ouest. Le bureau de direction, réduit à 2,85 m de profondeur par la jonction, ne
laissait que 0,62 m derrière les chaises des visiteurs (0,02 de jeu pour Haythem) et 0,25 entre l'angle du bureau de
chêne et la plante : son mobilier est passé 0,08 m plus près de la façade et la plante 5 cm plus avant dans l'angle.
Les sièges rejoués : **330** (la Si 0.1 a un poste de moins), dont 129 dans les rangs (les trois sorties) et 184 autres
qu'on prend en marchant ; les 17 derniers sont dans des pièces fermées.

### Le retour r03 : la salle d'attente élargie (v1.8, 12/10/2026)

Haythem a envoyé sa capture du jeu (v1.7), prise au bout est de la salle, vers l'ouest, entre le pilier et les chaises
du nord (`retours_haythem/r03_jeu_salle_attente_etroite.jpg` ; rejouée en vue 1 en (10,1 ; 6,85)) : « c'est beaucoup
mieux, mais cette partie est trop étroite : sur la photo, c'est plus grand et plus espacé. Là aussi, agrandis
l'espace ». La largeur a été MESURÉE sur la photo 02 (f 615), sans reprendre celle du jeu : une pose et la position du
mur sud résolues ensemble sur les joints du carrelage (carreaux de 60 comptés en travers), la porte grise du hall ouest,
l'angle de la pile du plan d'évacuation, les bouts des deux murs, les cadres des jours, la plinthe du mur sud et l'arête
haute du mur jaune — 3,11 à 3,18 m selon les observations gardées, l'appareil en (10,80 ; 6,99) à 1,50 m, à 0,8 m du
mur jaune et non à 0,46 comme la pose de la relecture r02 (d'où les chaises du nord « trop en avant » qu'elle notait).
La relecture a recoupé : r02 (f 1 502, connue) rejouée avec l'appareil en y 7,00 au lieu de 7,20 rend les chaises du
nord à leur taille de la photo sans déplacer les jours ; l'écart entre les pieds avant des deux rangées de chaises,
relevé sur le carrelage redressé de la photo 02 (le carrelage seul, sans aucune cote du jeu), vaut ≈ 3 carreaux de 60
(1,85 m ; le jeu : 1,75 avant, 1,95 après) — entre les deux. Selon les observations retenues, la largeur vraie est
entre 2,9 et 3,2 m ; 3,125 est gardée (le plus d'observations, et le ressenti de Haythem).

| Ce qui a changé | v1.7 | v1.8 | D'où |
|---|---|---|---|
| La largeur de la salle | 2,925 m nu à nu (mur des jours sur la ligne 4,8) | **3,125 m** : le mur des jours recule de 0,20 vers la rue (`DY_R03`, ligne 4,6, nu 4,675) avec ses trois jours, leurs affiches, la double lisse, le déclencheur rouge, la bande de dalles lisses et les lames du plafond, la rangée sud de spots, le carrelage, les zones ; le mur jaune ne bouge pas (le C05, les toilettes et la cage sont derrière) | P 02, r02 |
| Le mobilier du sud | chaises en y 5,25, borne en 5,08 | chaises noire, rose, canard en 5,05, borne en 4,88 (toujours adossées) ; le drapeau et la plaque du bureau de direction restent à l'angle du bout du mur | P 02, r02 |
| Le pilier gris | x 8,80-9,66 × y 5,59-6,02 : à la pose refaite de la 02, il se dressait sur le tiers gauche de la photo | x 9,18-10,04 × y 5,46-5,89 (même taille), au croisement des rayons de r02 et de la 02 refaite : la bande grise de 13 px au bord gauche de la photo ; 1,25 m de passage jusqu'aux chaises du nord (1,12), 1,65 entre les deux rangées (1,45) | P 02, r02 |
| Le bout ouest | le mur est du passage jusqu'en y 4,875 | il s'arrête au nouveau nu ; la bande libérée prend le plafond bas du hall ouest et sa retombée en x 4,85 | P 02, 04 |
| La Si 0.1 * | 4,725 m de profondeur | 4,525 m : la toile contre les jours, le poste de l'enseignant contre le mur, le rang du fond −0,05, les chaises à 0,33 des tables ; 0,61, 0,61 et 0,64 m de passage, les dix places atteintes | — |
| Le spot de l'antichambre (relecture) | en (9,95 ; 4,8) à 2,60, à moitié caché par la bande de dalles lisses | à 2,58, sous la bande qui le cachait tout entier une fois élargie | r02 |

Joué (relecture, port 8286) : la capture de Haythem rejouée en vue 1 et en vue de jeu dans v1.7 et v1.8 ; la photo 02
à la pose de la relecture r02 et à la pose refaite ; r02 aux deux poses (y 7,20 et 7,00) ; les photos 04 et 05 (le bout
ouest, inchangées) ; les 21 sièges de la salle, de la Si 0.1 et du bureau (proposés, assis, relevés sur un point libre) ;
la carte des places atteignables ; hall → antichambre → salle → hall ouest → passage, hall → Si 0.1 et ses allées,
salle → C01 → hall, l'escalier principal monté (3,50) et redescendu (0) ; `?tel=1` ; console sans erreur hors service
worker.

### La version 1.9 : la salle élargie, l'accueil de r04, les chaises à leur taille (12/10/2026)

Trois travaux réunis : la salle d'attente élargie du retour r03 (plus haut), l'accueil refait sur la nouvelle photo de
Haythem (r04) et les chaises coque ramenées à leur vraie taille. Les deux retours, partis tous deux de la v1.7, se sont
fusionnés sans conflit (`js/carte_ecole.js` : le mur des jours d'un côté, le plafond et les spots du hall de l'autre).

**Le retour r04 : l'accueil.** Haythem a envoyé une photo de l'accueil prise du hall, face au comptoir
(`retours_haythem/r04_photo_accueil.jpg`, objectif normal) : « corrige après ». Sa pose a été résolue sur les points de
fuite (le comptoir et le mur ardoise fuient au même point, la retombée et le retour blanc à angle droit : f ≈ 640 px,
62° de champ), puis superposée au jeu arête sur arête : l'appareil en (13,6 ; 2,35), à 1,155 m, cap 75 — de là, le
mur ardoise tombe sur le mitoyen et trois spots sur ceux de la VO à 0,1 m près.

| Ce qui a changé | v1.7-v1.8 | v1.9 | D'où |
|---|---|---|---|
| Le comptoir | x 16,45-17,15, y 1,1-3,55, sur socle de bois, terminé par un pupitre de chêne grisé | x 16,83-17,53, y 1,1-3,6 : stratifié gris clair et sa rainure à 0,745, socle de chêne clair en retrait, tablette grise en saillie à 1,15 ; le pupitre et le range-documents de 2021 retirés | r04 |
| Le décroché PMR | une tablette | y 3,6-4,58 : caisson bas en retrait, tablette à 0,76 sur un pied gris carré, caisson haut et sa tablette en débord ; bouilloire, bacs à courrier noirs, chemise rouge, papiers, l'écran « DELL » | r04 |
| Le mitoyen gris ardoise | l'affiche à l'immeuble, la photo de la façade, les premiers secours | un gris neutre plus clair de y 1,82 à 4,43 ; DEUX affiches encadrées, redessinées sur r04 agrandie (l'immeuble au cadre magenta ; les câbles de couleur et l'immeuble vu d'en bas, le pavé « iris ») ; la caméra dôme | r04 |
| Le bureau d'angle | — | la cloison vitrée à 45° du coin sud-est (verre clair, trois bandes de vitrophanie, baie à menuiserie gris bleu, porte vitrée) et le grand copieur blanc | r04, P 03, VO q_0380-0383 |
| Le fond de l'accueil | — | le local technique (x 18,8-19,8, y 4,43-7,5) aux portes de bois clair, étiquette rouge, triangles jaunes, déclencheur rouge et boîtier blanc ; le pilier de bois clair et l'écran suspendu « Commander votre sweat à l'accueil » ; le panneau des formations aux trois bandeaux orange ; le portant noir des goodies sur roulettes (sweats « iris », affichette, brochures) | r04 |
| L'angle nord-est | table blanche, chaise de hêtre (un siège), présentoir de bois | le meuble bas noir de r04 ; le photocopieur et les étiquettes « INFORMATIQUE » restent | r04, P 24 |
| Le plafond du hall | plâtre lisse, spots en (17,7 ; 4,3) et (18,3 ; 6,3) | plateaux perforés 0,6 × 1,2, plus clairs (la surface la plus blanche de r04) ; la retombée est-ouest y 5,28-5,53 de la pile au local ; spots en (17,1 ; 4,95) et (18,55 ; 7,1) ; les lignes lumineuses en ruban de 3,5 cm | r04, P 03 |
| L'open-space | quatre fauteuils | trois fauteuils (on s'y assoit), le passage du personnel par le nord, entre le caisson haut et le portant | r04 |

**Les chaises coque à leur taille** (doute 3 de la relecture r03 : la coque faisait 0,63 × 0,67 hors tout et 0,83 de
haut, et paraissait trop grosse sur la photo 02 — la citron y couvrait 137 px de large pour 120 sur la photo). Elle a
maintenant les cotes d'une vraie Eames DAR : **0,63 de large, 0,60 de profondeur, l'assise à 0,45 devant, les
accoudoirs à 0,635, le dossier à 0,80**, ourlet compris (`js/ecole_mobilier.js` `geoCoque` : le plan raccourci, le
dossier un peu moins haut et un peu moins renversé ; la largeur, le baquet et le piètement inchangés). Les chaises
restent contre leurs murs : la rangée nord recule de 3,5 cm (y 7,455), le haut des dossiers au nu du mur safran ; la
rangée sud reste en 5,05, le dos de ses coques à 1 cm de la double lisse grise (il y mordait de 3 cm). Entre les bords
avant des deux rangées, 1,89 m (1,80 en v1.8) ; du pilier gris aux chaises du nord, 1,31 m.

Joué (intégration, port 8290) : la photo 02 et r02 rejouées à leur pose en v1.8 et en v1.9 (la citron passe à 127 px
de large) ; la capture r03 de Haythem rejouée en vue 1 et en vue de jeu ; la chaise de face, de profil et de dessus ;
r04 à sa pose (photo, jeu, fondu), la photo 03 et la photo 16 (de la rue), l'accueil en vue de jeu ; les **328 sièges**
des quatre niveaux (42 au rez-de-chaussée, 112 au 1er, 55 au 2e, 119 au -1 ; 129 dans les rangs) : on s'assoit sur
chacun et on se relève sur un point libre, à son niveau, sans NaN ; les huit chaises de la salle proposées, les trois
fauteuils de l'open-space pris en marchant ; **26 parcours** à pied (la volée de tôle, l'escalier principal et
l'escalier est en montée et en descente, les couloirs du -1, le C05, le C01, le passage, le 1er, le 2e, et deux
nouveaux : porte 6 → antichambre → salle d'attente → hall ouest, et l'accueil par le passage du personnel), chacun dans
les deux sens : aucun blocage, aucune chute, aucun NaN ; le tour des quatre niveaux en vue de jeu ; `?tel=1` (740 × 360 :
la salle, l'accueil, l'escalier principal monté et redescendu, la volée de tôle) ; console sans erreur hors service
worker.

### Les retours r05 à r07 (v1.9.1 à 1.9.3, 13-14/10/2026)

| Retour | Ce qui a changé | D'où |
|---|---|---|
| r05 : « à droite, c'est un MIROIR, regarde bien » | la cloison vitrée du bureau d'angle devient une GLACE collée sur le mitoyen (y 0,40-1,82), penchée de 2,7° — le mur ouest du hall y retombe en y 144 de r04 ; elle renvoie le hall, la porte 6, la baie du bureau de direction (son store et ses trois bandes) et le jour de l'entrée, et Haythem s'y voit à coup sûr ; la machine à affranchir à la place du copieur ; les tons de r04 pavé par pavé | r04, r05 ; VO q_0372-0376 |
| r06 : « c'est la salle qui doit être là » | la salle David Clark Si 0.2 refaite sur la photo de Haythem, rejouée six fois à sa pose (voir le tableau plus haut) | r06 |
| r07 : la porte de la Si 0.1 trop loin | elle avance avec son mur de 0,81 m vers le passage de la pile (ligne x 9,975), un redan devant le bout du mur sud | r07, r02, P 22 |
| (relecture du C05 et du C01) | le C05 et ses toilettes, la retombée du C01, la lisse et le kakémono de la salle d'attente, vus des photos 23, 05, 04, 01 | P 23, 05, 04, 01 |

### La version 2.0 : la passe stricte (13-14/10/2026)

Sept zones, chacune refaite photo par photo puis relue par un second passage plus sévère — qui reprenait les poses
lui-même, sans les planches du premier : la pose de l'appareil résolue (place, cap, hauteur, focale), le jeu rendu au
même point de vue, côte à côte et en fondu 50 %, chaque écart relevé (nombre d'objets, forme, matière, couleur,
position, taille, proportions, largeur des passages, lumière) et corrigé, puis la même place regardée en vue de jeu.

| Zone | Ce que la passe a trouvé et corrigé | D'où |
|---|---|---|
| Le passage, le hall ouest, l'escalier principal (`js/carte_ecole.js`, `js/ecole_mobilier.js`, `js/ecole_portes.js`, `js/ecole_etage1.js`) | la VOLÉE 2 À SA VRAIE PENTE — quatre nez lus de profil par le vantail ouvert de la photo 06 : des girons de 0,366 et non 0,24 ; elle passait 0,5 à 1,0 m trop haut ; elle arrive maintenant au 1er en y 6,0, au bout ouest du couloir sombre, et la double porte « 1er étage » barre ce couloir en x 3,0 ; la volée 1 recalée (1re contremarche 9,90, girons de 0,32) ; le passage à 2,95 m (sa cloison est mince, la Si 0.1 y perd 15,5 cm), sa porte vitrée de 2,25 × 2,47, ses méplats coudés, ses autocollants à leur taille, le vrai reflet des deux réglettes dans la porte (il tombe à quelques pixels de la photo 19 et suit le joueur), le passage d'un blanc froid vu du hall et sombre et chaud vu de la rue ; le vantail ouest des portes de l'escalier entrouvert, les fentes vitrées larges, les deux teintes des vantaux, le bandeau gris bleuté ; la pénombre du renfoncement de la porte grise ; le plafond du hall ouest gris neutre | P 06 (r01), 07, 10, 19, 20, 04 |
| Le C05, les toilettes, le C01, la salle David Clark (`js/carte_ecole.js`, `js/ecole_pieces.js`, `js/ecole_portes.js`, `js/ecole_matieres.js`, `js/ecole_mobilier.js` — déjà en v1.9.3) | les portes des toilettes (feuillure grise éclairée, fente de 22 cm, verre ardoise, plaques de 16,5 cm, l'affiche orange redessinée, plus de barre d'inox), la porte bleue 1,7 fois plus claire, le dôme de la caméra ; la retombée du C01 en y 9,80 ; dans la salle, la troisième chaise du mur ouest (35 places), les murs, les luminaires, l'armoire, la moquette mesurés aux mêmes points | P 23, 05, 04, 01, r06 |
| Le couloir et l'escalier est (`js/ecole_est.js`) | les poses des photos 27 à 29 refaites avec leurs VERTICALES (l'appareil de la photo 28 est à l'horizontale, l'œil à 0,92 m et non 1,02) ; la main courante du mur sud du palier du 1er (le tube noir du bord des photos 28 et 29, pris pour un doigt), le mur sud de la cage arrêté en 16,60, les mains courantes à 0,90 m des nez, le fond du renfoncement en 13,66, le renfoncement et le mur sud dans l'ombre ; le petit vantail du vestibule au milieu du mur, fermé ; les hublots sans couronne sombre (ils sortent de l'occlusion de l'écran) ; la plinthe rampante, les girons gris neutre | P 24 à 29 ; VO q_0276-0280 |
| Le sous-sol (`js/ecole_soussol.js`, `js/ecole_soussol_est.js`, `js/ecole_amphi.js`) | l'espace pause d'une SEULE SALLE : vu de la porte (v_059 à v_061, la pose tenue par la barre de seuil et les fuyantes du carrelage), le sol est libre vers le sud-est — le retour sud et son affiche, qui barraient la vue à 0,6 m, et l'aile n'existent pas ; le comptoir en équerre, les casiers, le passage aux deux portes crème, le trombinoscope, la porte sombre, les distributeurs tournés vers la salle, les meubles posés sur leurs pieds relevés au sol ; le grès du couloir aux couleurs de v_050, la fente de son caisson | V v_050-v_067 ; VO q_0088, q_0134-0137 |
| Le 1er étage (`js/ecole_etage1_pause.js`, `js/ecole_mobilier.js`) | les trois chaises coque À HAUTEUR DE TABLE (montées en chaises de bar, leur coque aurait fait 0,31 m de large à 48,8 s de la vidéo), le 3e poteau de 0,62 m et sa sketchnote, le 2e poteau 0,5 m plus à l'ouest, la retombée blanche, l'habillage des distributeurs jusqu'au meuble bas ; dans la S 1.3, le visage percé des dossiers (les trous étaient découpés à 5 % de transparence : invisibles) et la luge argent | VO 47-49,6 s, 52,8-55,4 s, 66-67,4 s, q_0183-0270 ; P 28 |
| Le 2e étage (`js/ecole_etage2.js`) | des coques de hêtre à dossier haut en ÉCUSSON au lieu de plaques d'écolier entre deux montants (six trous dans la salle 2), rentrées sous les tables de la salle 1 ; la salle 1 en blanc neutre, la salle 2 en blanc froid, sa moquette anthracite bleuté (elles sortaient crème) ; la porte du fond gris très clair (elle sortait kaki) ; l'affiche du mur rouge au bord de la baie de D1 ; le pied du mur rouge sans plinthe sombre | VO q_0285-0345 |
| La rue et la façade (`js/ecole_rue*.js`, `js/carte_ecole.js`, `js/ecole_portes.js`, `js/ecole_matieres.js`) | la photo 09 enfin posée : le 5/7 d'en face redessiné de x −6,5 à 12,1, le mur du fond de l'impasse haut de 2,4 m, l'escalier en colimaçon ; les arbres du jardin à leur taille et gris-vert (ils cachaient l'immeuble du café) ; l'immeuble à balcons et le n° 4 en relief ; la porte 6 au fond d'un renfoncement de 1,2 m (photos 16 et 17 : la bande de sol, le tableau ouest, la largeur du vitrage), ses vitres, sa sous-face, son soubassement ; la bande pointillée qui scintillait sur la pierre au-dessus du passage et du portail (trois murs qui partaient du nu extérieur) ; le linteau du passage à 2,57 ; les voitures, le mobilier du trottoir à leur place | P 08 à 18 |

**À l'intégration** (branche `integration-c`, 14/10), les sept branches fusionnées dans l'ordre des zones, et raccordé ce
qui dépend d'une zone à l'autre :
- le mur des portes de l'escalier : arrêté à 1,55 sous la volée 2 et monté d'un jet au-dessus des portes (zone 1),
  jusqu'au nu 4,53 du C05 (zone 2) ; le plafond bas devant le C05 du même plâtre gris neutre que le hall ouest ;
- les deux options `cadre` du vantail vitré réunies (la traverse haute du passage, celle de la porte 6) ; le tirant
  plat du passage reste un méplat coudé, la porte 6 a ses deux barres (`tirant: 'barres'`) ;
- UN SEUL VOILE sur le passage vu de la rue (celui de la zone 1 : à eux deux, il sortait trois fois trop sombre), tendu
  au nu extérieur de la façade et jusqu'au linteau de 2,57 de la zone 7 ; la bande sombre intérieure du bâti part de
  2,57 (photo 10 : le plafond se voit juste sous le linteau) ;
- l'ACCUEIL SUIT LA PORTE 6 RECULÉE : la baie du bureau de direction, le jour de la porte sur le mur ouest et le reflet
  rasant du vitrage avancent de 0,5 m avec l'angle (la baie était pour moitié dans le porche, et la glace de r04 ne la
  montrait plus) ; le retour est du porche, côté hall, blanc de jour comme dans la glace de r04 ; le départ recule à
  y 3,7 (sa caméra était dans le porche, derrière le vitrage).
- les baies du milieu du 5/7, qu'on voit au fond du passage sur la photo 07 (ses rayons renvoyés sur la façade d'en
  face) : une porte vitrée à cadre blanc, de l'enduit, une baie à cadre sombre — au lieu d'une baie à cadre gris, d'un
  pilier de mélèze et d'une baie à cadre de bois.

Joué (intégration, port 8340) : rue → passage → porte automatique → hall ouest → volée 1 → palier → volée 2 → 1er
(3,50) → couloir sombre → double porte → espace pause → palier est, et la descente ; l'escalier est du 1er au
rez-de-chaussée, du 1er au 2e et retour ; la porte grise → la volée de tôle → le -1 (−3,06) → l'espace pause → le
passage aux portes crème → le passage sombre → P → le sas → la descente est → le rez-de-chaussée, et l'inverse ; le
C05 jusqu'à la salle David Clark ; le couloir du 2e. Aucun blocage, aucune chute, au plus 15 cm de saut d'une image à
l'autre dans les volées. Les **346 sièges** (116 au -1, 64 au rez-de-chaussée et dans la rue, 111 au 1er, 55 au 2e) :
assis puis relevé sur chacun, à son niveau. Le tri par zones rendu actif puis coupé, pixel à pixel, en une soixantaine de poses (les
volées, les paliers, les couloirs des quatre niveaux, la pause du -1, la rue) : identique. Les photos 10, 07, 06, 04,
23, 28 et r04 rejouées à leur pose après fusion (photo | 1.9.3 | 2.0 | fondu), et une trentaine de places des
quatre niveaux et de la rue en vue de jeu, la caméra derrière Haythem. `?tel=1` (740 × 360) : chargé, joué. Console sans erreur hors service
worker.

### Ce qui reste imaginé

Les pièces étoilées n'ont été vues ni sur les photos ni sur la vidéo (ou seulement leur porte) : leur intérieur est
imaginé, plausible pour une école du numérique parisienne, avec les matières et la lumière du reste de l'école, et
sans être encombré (« ne pas meubler l'imaginé »). Celles du rez-de-chaussée sont dans `js/ecole_pieces.js` : **quand
Haythem enverra des photos de ces pièces, c'est ce module qu'on reprend**, pièce par pièce (chaque pièce est une
fonction : `salleA` (la Si 0.1), `bureauB`, `couloirService`, `localTechnique`, `toilettesFemmes`, `toilettesHommes`,
`toilettesPMR`, `salleDavidClark`, `courette`).

Restent aussi imaginés ou incertains (avec la photo qui trancherait) :
- **Rez-de-chaussée** :
  - la longueur du passage des étudiants contre la taille de sa porte vitrée : sur les seules photos 07 et 10, un passage
    plus court et une porte plus petite donneraient presque la même image (4,05 m et 2,25 × 2,47 gardés, sur trois
    recoupements : photo 19, photo 10 à la pose de la rue, le reflet des tubes) ; et la hauteur entre son ouverture et
    son plafond : de la rue (photo 10), le linteau est à 2,57 et le plafond se voit juste dessous, du hall (photo 07),
    une bande sombre d'une vingtaine de centimètres surmonte l'ouverture — avec un plafond à 2,60, les deux ne tiennent
    pas ensemble (la rue gardée) ; les montants centraux de sa porte vitrée trop larges et trop blancs (photo 19 : 7 cm,
    gris), l'affichette au QR code trop terne ; vu de la rue, la bande claire du seuil un peu large ;
  - le plafond du hall ouest, 6 à 8 cm trop haut (photo 06 : 2,23-2,26 au-dessus du renfoncement ; le baisser touche le
    bandeau des portes de l'escalier et le passage de la volée 2) ; le radiateur du renfoncement trop blanc ; le bandeau
    des portes de l'escalier (les photos 20 et 04 ne s'accordent pas) ; le haut de l'escalier principal, imaginé : le
    palier du 1er au bout du couloir sombre et sa double porte (une photo depuis le palier intermédiaire vers le haut) ;
  - le C05 et le C01 : les poses des photos 05 et 04 ont l'appareil un peu bas (1,43-1,52 m pour ≈ 1,54) ; le noyer des
    fentes un peu sombre ; le présentoir et le bloc de secours de la pile peut-être 0,6 m trop au sud (photo 01 ; le
    présentoir est sur roulettes) ; les hauteurs du plafond du C01 (2,35 et 2,47, ou 2,30 et 2,42 avec une pose plus
    basse) ; dans la salle David Clark, la moquette, le haut du mur ouest, ses taches et l'écran allumé de r06 ;
  - la salle d'attente (retours r02 et r03) : sa largeur (3,125 m gardés ; la photo 02 seule donne 3,11-3,18 avec
    la porte grise à 2,04 m, son carrelage seul 2,85-3,05 — les deux bords d'une photo d'ultra grand-angle ne se
    calent pas tout à fait ensemble) ; le pilier, compromis entre r02 et la 02 : à la pose refaite de la 02 il n'en est
    plus que la bande du bord gauche, mais sur r02 son affiche A2 paraît ≈ 15 % plus petite que sur la photo et il
    tombe 2 à 5° trop à gauche selon la pose — un pilier un peu plus près de r02, ou un peu plus gros (≈ 0,95 × 0,47), le serrerait
    mieux (une photo de la salle prise du milieu, vers le pilier, trancherait) ; les chaises sont aux cotes d'une
    vraie DAR (v1.9), mais leur coque reste un baquet un peu plus haut de flanc que sur les photos 02 et r02, où
    l'accoudoir paraît plus bas devant le dossier (une photo d'une chaise de profil trancherait) ; aucune pose ne cale à la fois le dedans de la salle et les points fixes du hall
    ouest et de la pile (20 à 50 px d'écart restent sur r02 ; le présentoir et le radiateur sortent ≈ 15 px trop à
    droite) ; les chaises du sud sont 0,6 m plus à
    l'ouest sur r02 que sur la 02 (déplacées entre les deux prises ? r02 suivie) ; la borne est placée pour un appareil à
    1,55 m (à 1,35, elle serait 0,5 m plus près) ; les perforations du plafond un peu trop contrastées, le fond de la
    salle un rien moins chaud ; vue de la Si 0.1, la toile cache le jour du milieu (une photo de la salle d'attente du
    bout est vers le pilier, et une de la Si 0.1) ;
  - la jonction (retour r02) : le mur nord du bureau de direction sur la ligne 2,925 (les photos 03 et r02 ; la photo 01
    le voudrait plus au nord, mais seulement par la hauteur supposée de la porte vitrée) ; la porte de la Si 0.1 sur le
    retour de l'antichambre (aucune photo ne la montre) ; le drapeau contre le cadre du jour est (r02, 2026) quand la VO
    de 2021 le voit plutôt à l'angle (une photo de l'antichambre depuis le passage de la pile, vers l'ouest) ; l'écart
    entre le C01 et la pile vu de la photo 01 (≈ 1 m) ;
  - tout l'intérieur de la Si 0.1, la Si 0.2 et ses fenêtres, la courette ouest, les toilettes, le local, la PMR, le
    couloir de service, la réserve ouest et le local du fond (fermés) ;
  - le texte des lames de l'annuaire et des affiches ; la cabine de l'ascenseur ;
  - l'accueil (retours r04, r05) et la porte 6 : la relecture de la rue met les vitrages de la porte 6 au fond d'un
    renfoncement de 1,2 m (photos 16 et 17), la glace de r04 les voudrait plutôt près de la façade — la baie du bureau
    de direction a suivi l'angle de la porte (y 0,80-1,73 au lieu de 0,30-1,23) et ses bandes retombent dans la glace à
    10-15 px de la photo (une photo de l'entrée prise du hall, la porte 6 de biais, trancherait) ; le dedans du local
    technique ; le dessin des deux affiches du mur
    ardoise, redessinées sur r04 agrandie ; vue du bout est de la salle d'attente (photo 03), l'ouverture vers le hall
    paraît plus étroite que sur la photo et le comptoir y est moins vu — c'est la jonction r02 (le mur nord du bureau de
    direction, la pile) qui le décide, pas l'accueil (une photo du passage de la pile vers le hall trancherait) ;
  - le ressaut de 10 cm entre le plafond du hall ouest (2,30) et celui du C05 (2,40).
- **Sous-sol** : la focale de la vidéo (≈ 1 000 px mesurés, l'audit supposait 1 200) ; la profondeur du hall du -1 ; la
  profondeur de l'espace pause (les directions sont sûres, les distances à ± 1 m : la pose de v_067 la voudrait 20 %
  plus courte du nord au sud — une photo de la porte vers le sud-est, une du mur vert vers le sud) ; son mur nord et la
  grande salle, non déplacés (la VO met le coin nord-ouest vers y 13,8) ; les distributeurs, plus hauts et plus proches
  sur v_067 ; le passage aux deux portes crème (pris pour le passage P de 2021) et le local derrière la porte sombre,
  imaginés ; la tablette aux micro-ondes de 2021, gardée sans être vue en 2026 ; le grès du couloir (son rendu varie
  d'une session à l'autre) ; le passage sombre ; le bloc est de la grande salle (la VO la mènerait en L) ; le nombre de marches de la descente est
  (8 + 8) ; le dedans des locaux ⚡ et « réservé au personnel » ; la couleur de 2026 du vestibule.
- **1er** : la profondeur de la S 1.3 (q_0212 de face : 5,1 m, le jeu 4,69 — la photo 28 garde le mur des jours ; une
  façade intérieure en y ≈ −0,15 accorderait les deux) ; les mange-debout et les tabourets Miura de la pause (les vues
  de la VO se contredisent de 0,5 à 1 m ; deux chaises menthe ?) ; le 1er poteau peut-être plus large ; la teinte du
  dernier pan de l'habillage des distributeurs ; à l'escalier est, le plafond au-dessus de la porte de l'espace pause
  (photo 28 : une arête nette à 2,30, un caisson ?), le dernier nez du 1er 6 cm trop loin, et les girons de la volée 1
  (quatre indices disent 0,27-0,29 et non 0,251 : le mitoyen vers 20,0-20,2, que le cadastre met en 19,95-20,05 ; le
  corriger déplace la gaine de l'ascenseur et les paliers) ; vu du seuil du couloir est, le haut de la cage pêche (la
  carte d'environnement du couloir) ; le tableau abstrait de la bande sud à 2 cm de la nouvelle main courante ; le local du coin nord-ouest, le couloir sombre, le bureau de la travée 1, le
  103 et la Si 1.5, le local du palier est ; le contenu des tableaux de la Si 1.4.
- **2e** : aucune photo de 2026 ; LE PALIER, LA PORTE COUPE-FEU ET LE SAS ne collent pas à la VO (calée à 2,9 px sur le
  mur du panneau, q_0285 met l'extincteur au sud du mur de la porte ; la porte ouverte, q_0289-0292, laisse un pan blanc
  de 1,1 m à l'ouest, le jeu 0,5 ; du couloir, q_0352-0354, la caméra tombe dans le mur sud : une porte plus à l'est et
  un recoin plus profond ? une photo de 2026 du palier, côté porte) ; les chaises et l'affiche du mur sud du couloir
  (q_0300 et q_0316 se contredisent) ; la rangée est de la salle 1 ; ses chaises à moitié rentrées (le jeu ne tire pas
  une chaise quand on s'assied) ; les blancs neutre et froid des deux salles, pris sur la VO de 2021 ; la salle 2 en
  plan (son mur ouest) ; la profondeur du recoin de l'extincteur ; les
  Si 2.6 et B 2.3, le dégagement ouest ; laquelle des deux salles est S 2.7 ou S 2.8 ; la cage au-dessus (volées 5 à 7,
  portillon) ; les étages 3 à 5 et le -2 n'existent pas encore.
- **La façade** : le tableau sombre des fenêtres est une doublure de 25 cm (la menuiserie reste à sa place pour ne pas
  toucher aux salles : vue très en biais, la bande sombre est un peu large) ; le côté de l'ouvrant de la fenêtre haute
  de la travée 7 du 2e (les deux photos sont prises de l'ouest) ; le reflet des vitres est une seule tuile, qui se répète
  de près ; le premier banc (± 0,4 m), le totem du passage (13 cm trop loin de la bordure) et la trottinette (± 0,3 m) ;
  la hauteur de l'appareil de la photo 09 (1,74 m, dont dépend le fond de l'impasse, gardé en x −10,5 ; l'IGN dit −7,4) ;
  le milieu du rez-de-chaussée du 5/7, relevé seulement au fond du passage de la photo 07 (x 2,4-5,9 : de loin, les
  voitures devant), le reste dessiné sans photo, et ses caissons des étages pairs ; la bordure de 12 cm (4 à 6 cm sur les photos) ; corbeille, poubelle
  haute et bambou peut-être 15 à 25 cm trop près de la bordure ; la Kia en carrosserie compacte ; les drapeaux raides,
  la moto générique, le portail vert du jardin réduit à un poteau, l'oriel du n° 8, les plantes du n° 8.
- **La caméra** : garder sa tête dans l'image fait tourner la vue plus vite aux demi-tours des paliers (le réglage :
  le 0.78 de `_dansLImage` dans `js/game.js`) ; à la pose de la photo 25 (vestibule est, Haythem dos au mur jaune), la
  vue reste plongeante, 65 cm au-dessus de sa tête, faute de recul derrière lui ; au pied de la volée de tôle (palier tournant de 0,85 m), Haythem reste translucide
  quelques dixièmes de seconde.
- Les couleurs de 2026 des murs vus seulement en 2021 : le vestibule (jaune), le couloir du 2e (rouge), l'espace pause
  du 1er (orange). (Le mitoyen de l'accueil, gris ardoise, est confirmé par r04.)

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
plafonds (`plafondEn(x, z, y)` : ceux qui sont au-dessus de `y`), et des **sols** — `C.sol(...)` (un palier) et
`C.rampe(...)` (une volée de marches, pente passant par le milieu des marches) : `solEn(x, z, y)` rend le sol sous les
pieds, Haythem le suit. Une forme dont `off` vaut vrai n'existe plus (les vantaux des portes automatiques ; la lumière
cuite l'ignore aussi). `vitre: true` : la lumière cuite au sol traverse la forme. `?debug=murs` montre tout.

**Les lumières** (`js/ecole_lumieres.js`) : chaque luminaire posé par le chantier est une LAMPE de sa zone (pièce).
Quatre spots (deux au téléphone) se posent sous les lampes les plus proches de Haythem, dans sa pièce et celles qui s'y
ouvrent ; toutes les lampes, et le jour qui entre par la porte 6, le passage et les fenêtres, sont peintes une fois dans
la lumière cuite du carrelage, découpées par les murs. Chaque zone a son point de prise de vue pour la carte
d'environnement, reprise quand Haythem y entre. Une nouvelle pièce : un rectangle dans `zones`, ses voisines, son point.
Les spots ne portent pas d'ombre : deux pièces voisines s'éclairent au travers de leur mur — on ne déclare voisines que
celles qui s'ouvrent largement l'une sur l'autre.

**Les crochets.** Dans `construireCarte`, après les murs, les plafonds et les luminaires du rez-de-chaussée :
`poserMobilier(ch)`, `poserRdcCentre(ch)` (la pile), `poserRue(ch)`, `poserPieces(ch)` (les pièces imaginées, leurs
zones), `poserEst(ch, { RECT })` (le couloir et l'escalier est, l'ascenseur au rez-de-chaussée, le hall par
`js/ecole_hall.js`), `poserEtage1(ch, renderer)` (qui appelle `poserPause1`, `poserPalierEst` — la bande sud et
l'ascenseur du 1er —, `poserKahn` et `poserEtage2` — le 2e, la cage haute, l'ascenseur du 2e), `poserSousSol(ch,
renderer, { RECT })` (qui appelle `poserAmphi`), `poserSousSolEst(ch, renderer, { RECT })`. Tous avant les lumières, la
lumière cuite et l'optimisation du décor ; les zones de la cage est, des étages et du sous-sol EN TÊTE de la liste
(leurs rectangles couvrent ceux du rez-de-chaussée, à d'autres hauteurs) ; leurs `maj` à chaque image.

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

**Les quatre niveaux.** Planchers à -3,06 (sous-sol), 0, 3,50 (1er) et 6,60 m (2e) ; dessous de la dalle du 2e à
6,40 m, étages courants de 3,10 m (la tuile de la façade). Ce qu'il faut savoir pour bâtir en hauteur (et en dessous) :
- le monde solide : une DALLE (`C.sol`) sous tout ce qu'on foule à un étage, seuils compris (sinon on retombe au
  rez-de-chaussée), des murs à leurs hauteurs absolues, le dessous du plancher en forme « caméra seule » ;
- une lampe d'étage porte `base` (son plancher : visée des spots, tri des pièces voisines) et `cuire: false` (elle est
  cuite sur le sol de son niveau, pas sur celui d'en bas) ; un rectangle de zone porte une hauteur minimale (2,60 au
  1er, 5,70 au 2e) et, pour le sous-sol et la cage du 1er, une hauteur MAXIMALE (`[x0, z0, x1, z1, hmin, hmax]`) ;
- chaque niveau cuit sa lumière (`cuireLumiereSol` sur ses formes ramenées au sol) et son ombre douce
  (`cuireOcclusionNiveau(renderer, groupe, sols, base, R, drapeau)`, exportée par `js/ecole_soussol.js`) ; un sol cuit
  à part a une rugosité à lui (l'optimisation du décor ne doit pas le confondre) ;
- un siège porte `sol` (-3,06 ; 3,50 ; 6,60) : seuls ceux du niveau de Haythem sont proposés (-1, 0, 1, 2 :
  `js/ecole_etage1.js`) ;
- tout ce qui est à un étage porte `horsAOSol` (l'ombre cuite du rez-de-chaussée ne le voit pas) ; le groupe d'un étage
  n'est dessiné que si la caméra peut le voir, et ne porte ombre que si Haythem y est ;
- les portes automatiques ne s'ouvrent que pour qui est À LEUR NIVEAU (`Portes.maj` reçoit les pieds de Haythem et la
  hauteur de la caméra) : passer au-dessus ou en dessous d'une porte ne l'ouvre plus ;
- l'ascenseur : `poserAscenseur(ch, { base, groupe, ouvert, y0, hMur, zone, bouton })` (`js/ecole_ascenseur.js`) pose
  un palier ; `ouvert: true` le fait desservir (un sol où marcher devant, la zone de lumière de son palier) ;
- SOUS LE SOL (`js/ecole_soussol.js`, en-tête : quatorze pièges) : `solEn` rend 0 là où aucun sol ne couvre, donc des
  dalles `C.sol(..., 0)` au-dessus de tout le sous-sol sauf les trémies, et une dalle à -3,06 sous tout ce qu'on foule
  en bas ; des plafonds sans retombées ; des lampes `{ base: -3.06, cuire: false }` (et `couleur` : les LED neutres du
  -1) ; une dalle-boîte sous le carrelage qui porte l'ombre du « soleil » sur le -1 tant que Haythem est en haut.
`?debug=murs` dessine les formes des étages et du sous-sol à leur hauteur et les sols (dalles, rampes) en magenta.
Restent à venir : les étages 3 à 5 (la cage est y monte déjà) et le -2.

**Rejouer une photo** (la méthode du plan V2, à garder pour toute nouvelle pièce) : retrouver la pose de l'appareil
(place, hauteur, cap, tangage, roulis) par moindres carrés sur quelques points du plan visibles sur la photo, puis, dans
la console, `__game.freeCam = true`, la caméra à cette pose et au champ de la photo (f ≈ 600 px pour 1 600 sur les
photos 01-21 : champ de 106° sur le grand côté), quelques `__game.frame(0.033)`, `__game.fx.render(0.016)` et
`__game.renderer.domElement.toDataURL()` ; comparer côte à côte et en fondu. Regarder aussi la même place en **vue de
jeu** (la caméra V2 derrière Haythem) et en **vue photo** : c'est ainsi que Haythem juge. Les proportions — distances
entre portes, murs et meubles, largeurs, profondeurs — sont celles des photos ; on ne grandit jamais tout d'un bloc.

**L'écran de chargement** : après avoir ajouté des fichiers chargés au démarrage, relever les profils
(`?chargement=trace`, puis `?chargement=trace&tel=1`) et relancer `python tools/liste_chargement.py` (voir son en-tête).
Changer aussi la version de `sw.js` (aujourd'hui `iris-v2.0`) quand index.html, le style, un module ou un fichier lourd
changent.

**Ce que la caméra peut voir** (`js/ecole_visibilite.js`) : les ZONES sont écrites en dur, en coordonnées du plan V2 (les
cages, la trémie, l'est, les pièces fermées, l'avant et le fond des étages), et les règles de `zonesCachees` disent, selon
la place de la caméra, quelles zones elle ne peut pas voir. **Qui déplace un mur, une cage ou une pièce reprend ses
boîtes et ses règles**, puis vérifie : `__visibilite.actif = false` montre tout ; rendre la même vue tri actif puis coupé
et comparer pixel à pixel (le long des escaliers, en montée et en descente, et en des poses tirées au hasard là où l'on
marche) ; il ne doit rester que les fentes du décor.

**Les rangs serrés** (`js/player.js` `poserRangs`) : une pièce qui pose une rangée de sièges serrés donne à chacun le
même objet `s.rang` — `{ nom, sol, ax, az, bx, bz` (les deux bouts de la ligne libre, en monde), `fx, fz` (l'avant de la
salle), `sieges }` — ; un bout est ouvert si Haythem y tient à 5 cm près (`ouvA` / `ouvB` à false : fermé).
