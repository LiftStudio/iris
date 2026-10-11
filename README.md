# IRIS — l'école en 3D

Un jeu à part, tiré de **LA CAGE** : le même moteur, le même rendu et la même façon de bouger, mais **sans ballon**. On
y promène **Haythem**, et rien que lui, dans l'école **IRIS** (MediaSchool) : marcher, courir, sprinter, sauter,
s'asseoir, danser, sortir son téléphone, prendre l'ascenseur. Pas de match, pas de score, pas de boutique : une balade
libre.

> État actuel (v1.6, 11/10, **les finitions du plan V2**) : la caméra qui garde Haythem dans l'image dans les volées et
> au passage des portes, les places au milieu des rangées serrées (on s'y faufile en pas chassés), le bas de l'escalier
> principal refait sur les photos 20, 06 et r01, la façade sur l'impasse recalée sur les photos 10 à 18, et l'école
> dessinée par ce que la caméra peut voir (deux fois moins d'appels de dessin aux endroits lourds) — voir « Les
> finitions » plus bas.
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
  astuces au jaune du logo), la **PWA** (`manifest.webmanifest`, `sw.js`, cache `iris-v1.6`).
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
js/ecole_hall.js      le HALL D'ENTRÉE (la vidéo officielle) : l'accueil nord-sud, l'open-space et son mitoyen gris,
                      l'angle nord-est ouvert (photocopieur, « INFORMATIQUE », table, présentoir), les lignes du plafond
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
| L'espace pause | grand carrelage beige, mur vert anis et cloisons de verre dépoli, mange-debout noirs, tabourets (on s'y assoit : 21), l'îlot de trois tables, le baby-foot nord-sud sous la dalle manquante, grande table en X, distributeurs, trombinoscope, casiers, sas des toilettes (fermé) ; l'**aile** de 2021 (tablette haute, micro-ondes noir et blanc, trois A4, chaise filaire, tabouret) ; la porte grise G du mur sud (fermée) ; la porte sombre de 2026 | V (v_059 à v_067) ; l'aile : VO 22-27 s, 34-35 s |
| La grande salle S -1.14 | derrière la porte vitrée dépolie du mur vert (« Salle de cours S -1.14 ») : sol plat, 8 + 6 rangs de tables filantes de hêtre, 98 fauteuils coque jaune moutarde (on s'assoit, et on se faufile en pas chassés jusqu'au milieu des rangs ; le bout ouest du rang 7 s'ouvre contre le poteau), tableau triptyque sous le carter de l'écran et ses enceintes, le portrait d'Einstein et un second en gris, meuble multimédia, poteau et retombée, convecteurs, goulotte, luminaires à grille ; la porte verte du fond (V2 : dans la parcelle, y 11,86-21,41, son mur est en x 13,3) | VO 26,7-33,9 s ; son état de 2026 n'est pas vu |
| La descente est | la volée A sous la volée 2 du rez-de-chaussée, le palier bas à -1,53 (réglette, voyant, bloc de sortie, affiche iris), la volée B, le palier du -1 (le panneau cuivré « -1 » : « Salle de cours S -1.14 / Espace pause », l'interrupteur), la porte à deux vantaux (ouverte à demeure vers le palier, comme sur la vidéo) | VO 12,4-18,2 s, 35,5-41 s ; P 24 (la tête) |
| Le sas technique, le passage P, le passage sombre * | la porte grise « RÉSERVÉ AU PERSONNEL », la plaque du trumeau, la porte double ⚡ du local électrique, la porte crème ⚡ (un placard), un boîtier noir ; le PASSAGE P, puis un passage sombre en baïonnette (éteint, mais lisible : le bloc de sortie vert au bout et sa lueur, une veilleuse ambre au ras du sol sur le mur est — imaginés) jusqu'à la porte sombre de l'espace pause | VO 18,2-21,8 s ; V (la porte sombre) |
| **Rez-de-chaussée** | | |
| Le hall d'entrée | porte n° 6 (automatique) et ses vitrophanies (quart de cible, nuage et sa constellation, équerre jaune, pavé « iris », phrase, visage ; les trois bandes du vantail est), tapis ; l'ACCUEIL nord-sud (comptoir sur socle de bois, tablette PMR, pupitre de chêne grisé), l'open-space du personnel et son mitoyen gris ardoise (affiche à l'immeuble, photo de la façade, premiers secours, caméras, imprimante) ; les huit lignes lumineuses du plafond ; l'angle nord-est ouvert (pan cannelé, photocopieur, étiquettes « INFORMATIQUE », table et chaise de hêtre — on s'y assoit —, présentoir) ; deux fenêtres à barreaux | P 03, 16, 24 ; VO 3-7 s, 92,5-97,8 s |
| La pile du hall | face sud : l'horloge ambre (à l'heure de l'ordinateur), la plaque « iris » et l'annuaire du niveau 0 (Si 0.1, Si 0.2) ; face est, jaune : le grand annuaire à seize lames ; face ouest, le fond de la salle d'attente : radiateur à façade grise, affichettes « WIFI », haut-parleur, bloc de sortie, présentoir | VO 6,4-12,4 s, 92,6 s ; P 03, 21, 22 |
| La salle d'attente | 2,9 × 7,5 m entre le mur safran et le mur des jours dépolis, qui est aussi le mur nord du bureau de direction et de la Si 0.1 (V2 : 4,2 m plus près de la rue — il n'y a plus de « cou ») ; mur safran et sa lisse blanche, panneau DAE, écran, chaises coque (on s'y assoit), jours dépolis, borne, pilier gris et ses deux affiches ; un présentoir contre la pile, un autre à l'entrée du C01 | P 01, 02, 03, 21 ; VO 7-11,6 s |
| Le passage de la pile et le bureau de direction B 0.3 * | 2,1 m entre l'angle du bureau (deux redents) et la pile ; au bout, la porte vitrée à cadre blanc et à affiche ; la plaque et le drapeau « Bureau de direction B 0.3 » ; dedans *, bureau de chêne, fauteuil et chaises visiteurs (on s'assoit), armoire, bibliothèque, tableau, plante | P 01, 03, 22 ; VO 7-9 s |
| La Si 0.1 Tim Berners-Lee * | l'ex-salle A, derrière la porte grise du mur sud de la salle d'attente : deux rangs de cinq postes face au nord, la toile devant les jours dépolis, le poste de l'enseignant, le tableau blanc, l'imprimante ; trois fenêtres sur la rue | nom : annuaire de la pile (VO) |
| Le passage des étudiants | 2,25 × 4,45 m : grille noire ouverte sur la rue, réglettes fluorescentes de la façade à la paroi, panneaux de liège, petit tableau à six feuilles, plinthes de carrelage gris, porte blanche « Sortie », double porte vitrée aux autocollants « iris » (automatique, sans fixes), le bloc de sortie et le hublot près de la rue | P 07, 10, 19 |
| Le hall ouest | 4,9 m de la paroi vitrée aux portes de l'escalier (8,6 m avant le V2) : la pile du plan d'évacuation (0,70 × 0,92), puis, 0,97 m après la paroi, la porte grise de l'escalier du sous-sol dans son renfoncement de 2,25 m, l'extincteur, le radiateur à façade grise contre l'avancée nord, l'affiche jaune du tri, les portes coupe-feu de 2 × 1,0 m (le vantail ouest ouvert à plat) ; plafond de plâtre à 2,30 qui remonte contre la paroi vitrée, un hublot, le dôme de la caméra | P 06 et r01, 02, 04, 07, 20 ; V |
| L'escalier principal | refait par le bas (finitions) : par la porte, la volée 1 de quatre contremarches vers le nord (girons de 0,30, le poteau à platine au pied), le palier à 0,70 devant le mur à affiches (A4 violette, écusson vert, affiche A2, grand panneau, main courante horizontale), puis la volée 2 de seize contremarches vers le sud, à l'ouest, au-dessus d'un mur d'échiffre blanc à plinthe (lisse basse et main courante sombres, barreaux gris) — la cage va du nu 0,75 au nu 4,45 et passe au-dessus de la trémie de la volée de tôle ; il s'arrête au palier du 1er (même arrivée, double porte ouverte), plafond de la cage à 6,40 m | P 20, 06 et r01, 04, 23 |
| Le couloir C05 | 1,4 × 3,6 m, qui commence au jambage des portes de l'escalier : les deux portes des toilettes à fente vitrée haute, leurs plaques et leurs affiches, la retombée et ses hublots ; au fond, la porte bleue de la salle David Clark (automatique) | P 05, 23 |
| Les toilettes du C05 * | femmes : deux cabines aux portes safran, les vasques et leur miroir ; hommes : deux cabines, trois urinoirs, deux vasques ; faïence, grès, sèche-mains, un vrai miroir sur PC | portes : P 23 |
| La salle David Clark Si 0.2 * | derrière la porte bleue et son entrée, une salle informatique de 8,4 × 6,8 m : deux colonnes de trois tables pour deux, un poste par place (écran, clavier, souris, unité centrale ; on s'assoit), tableau blanc, écran, vidéoprojecteur, bureau de l'enseignant ; deux fenêtres sur la courette ouest *, entre les deux ailes du bâtiment | plaque et porte : P 23, 05 ; nom : VO 7,9 s |
| Le couloir C01 | 1,8 m de large : à 2,8 m de l'entrée la porte du local, en face la gaine technique, 1,4 m plus loin la porte des toilettes PMR ; au fond, une porte fermée (le local du fond) ; un présentoir à l'entrée | P 01 |
| Les toilettes PMR *, le local technique *, le couloir de service * | cuvette suspendue et barres d'appui ; baies serveurs aux diodes, onduleur, tableau électrique ; bacs, chariot de ménage | plaque : P 01 |
| Le couloir est et le vestibule | lino moucheté, mur jaune et sa plaque directionnelle bleue (Si 0.1, Si 0.2), cannelé gris-vert, plinthes gris foncé, plafond de plâtre et hublots, poteau gris ; la niche : la tête de la descente au -1 (poteaux à crosse, portillons repliés, tapis) ; le dégagement et, au bout, l'ascenseur ; le vestibule jaune, son affiche à la pomme et le déclencheur rouge, la porte nord crème ; au fond, un local fermé de 0,9 m et le mur du fond de la partie est (y 13,8, IGN) | P 24, 26 ; VO 12-15 s, 38-41 s, 90-92 s |
| L'ascenseur | au bout du dégagement (rez-de-chaussée), de la bande sud (1er) et du vestibule (2e) : la façade palière inox (fixe, deux vantaux télescopiques, afficheur bleu, platine d'appel) ; la cabine * (inox, granit, main courante, boutons) qui porte Haythem d'un niveau à l'autre | VO 68,2-70 s (au 1er) ; rez-de-chaussée et 2e déduits |
| L'escalier est | en U contre le mitoyen : 2 x 9 marches sombres à nez noirs et arête d'aluminium, mains courantes noires, palier à 1,75 m (réglette, bloc de sortie, affiche « la vie à l'école »), l'échiffre ORANGE jusqu'au 1er puis ROUGE jusqu'au 2e, le palier à 5,05 m ; la cage monte au 3e (volées 5 à 7 *, portillon *) | P 25, 26 ; VO 41-44 s, 68-72 s, 88,8-90 s |
| La rue | trottoirs, chaussée ; la façade de l'école recalée sur les photos (finitions) : les encadrements rouges plus hauts que larges (1,47 × 2,53) aux vraies travées, une fenêtre d'un vantail par travée dans un épais cadre brun-noir au nu de la pierre (bavette sombre), des vitres qui renvoient la rue et le ciel, le 5e étage et la toiture plate, le portail n° 6, l'écusson, les drapeaux, les projecteurs, une pierre grise un cran froide ; le n° 8 en brique chamois et son trumeau de pierre ; les deux totems « iris », quatre grands bacs de zinc, le cyprès en pot noir, bambou, palmier contre le portail, bancs (on s'y assoit), corbeille, poubelle, trottinette — chaque pied relevé sur les photos 16 à 18 ; huit voitures garées, motos, scooters, vélos, le jardin, l'impasse, le carrefour | P 07 à 18 |
| **1er étage (3,50 m)** | | |
| Le palier est | vinyle moucheté foncé, le panneau d'étage (« 1 » : S 1.3, Si 1.4, Si 1.5, Espace pause, S 1.6), « WIFI IRIS », « POINT ÉCOUTE », l'échiffre orange et son chant gris, la porte gris taupe de l'espace pause ; au fond du renfoncement nord, la porte d'un local (fermée) | P 27, 28, 29 ; VO 41-45 s |
| La bande sud | le doublage, le grand tableau abstrait, le disque de laiton, le boîtier vert, la réglette, l'extincteur, la porte de l'ascenseur ; aucune porte (le 103 et la 104 ne s'y ouvrent pas) | VO 68,2-70 s |
| L'espace pause | 7 m de profondeur (V2 : le mur des jours 2 m plus au sud — ce n'est plus un couloir de 0,78 m) : murs crème et orange, plan en L ; le local fermé du coin nord-ouest * et, sur sa face est, la niche des distributeurs (machine à café, machine à snacks à deux portes vitrées) ; trois poteaux serrés et leurs murets lilas à tablette, la porte de service à vitre lilas-bleu ; banquettes courbes jaune et rouge, table basse, cinq mange-debout, tabourets « Miura », chaises coque (on s'assoit : 23 places) ; lino taupe, dalles et spots, trois jours dépolis ; au fond, le mur orange et la porte vitrée de la Si 1.4 | VO 44,9-49,2 s, 53,2-54,8 s, 66,6-68,1 s ; P 28 |
| La salle de cours S 1.3 | 4,7 m de profondeur, plafond à 2,50 : sept fenêtres sur la rue, moquette en dalles bleu-gris, tables doubles de hêtre clair, chaises de hêtre percé (on se faufile derrière les dossiers jusqu'aux places des fenêtres), tableau de 2,0 m et son volet, vidéoprojecteur ; un blanc froid | VO 49,2-53,2 s |
| Le recoin sud-est | un renfoncement qui file au sud jusqu'à une porte taupe fermée (la seconde porte de la salle) | VO 67 s |
| La salle Robert Kahn Si 1.4 | la salle réseau aveugle, dans le gabarit du bâtiment (sa porte à 4,4 m de son mur ouest) : six caissons lumineux, poutre et deux poteaux, 30 postes (tours noires, écrans, consoles), commutateurs, routeurs, borne Wi-Fi, cordons rouges et cyan, deux tableaux à schémas, bureau de l'enseignant, étagère miel, extincteur, desserte bleue, prises et sonde, porte grise fermée ; moquette marine, lumière froide (31 places) ; son toit à lanterneaux | VO 54,7-66,6 s |
| Le couloir sombre, le palier d'étage ouest * | derrière la porte du fond de l'espace pause : le couloir jusqu'à l'escalier principal (banc, plan d'évacuation, extincteur, local ménage fermé) | — |
| Le bureau de la travée 1 *, le bureau 103 *, la salle Gordon Earle Moore Si 1.5 (104) * | derrière la grande baie rouge et les fenêtres des travées 9 à 12 ; fermés (leur accès n'est pas vu) | façade : P 11, 12, 16, 18 ; nom : P 28 |
| **2e étage (6,60 m)** | | |
| Le palier | la copie de celui du 1er : le mur du panneau « 2 » (« Salles de cours S 2.7 - S 2.8 / Salle Bjarne Stroustrup Si 2.6 / Bureau des Conseillers B 2.3 »), réglette, poussoir, prise, tapis ; une fenêtre dans ce mur ; l'extincteur du recoin ; le vestibule de l'ascenseur | VO 70-72 s |
| La porte coupe-feu et le sas | bâton inox, oculus, huisserie de bois côté palier, rabattue contre le mur ; côté sas, la plaque noire, le plan d'évacuation, la caméra | VO 72-73 s, 88 s |
| Le couloir | le mur nord ROUGE VERMILLON, lino taupe, plafond lisse à 2,45, six spots, trois chaises noires, la photo turquoise, deux affiches, les plaques ; au fond, une porte grise fermée | VO 73,1-75,7 s, 84,2-88,7 s |
| La salle 1 (S 2.7, côté cour) | 9,35 × 4,9 m, plafond à 2,40 (V2 : elle prend la place du haut de l'escalier principal, que rien ne montre) : six fenêtres à stores de toute la hauteur, embrasures brun-noir, la sixième plus large et sans store ; neuf luminaires, vidéoprojecteur, moquette marine en damier, cinq rangées, chaises de hêtre à dossier plein (31 places), tableau blanc, coin du professeur (caisson gris, meuble noir), poteaux | VO 75,8-78,4 s |
| La salle 2 (S 2.8, côté rue) | plafond à 2,40, cinq fenêtres d'un seul vantail et, dans le cadre rouge de la travée 7, la fenêtre haute qui descend au sol (photos 11, 12), moquette anthracite, deux colonnes de tables pour deux, chaises à six trous (rang des fenêtres : on s'y faufile), triptyque, range-documents | VO 78,4-84,2 s ; P 11, 12 |
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
| Les places au milieu des rangées serrées (`js/player.js` `poserRangs`) | 80 places qu'on ne prenait qu'au bout du rang | on s'y faufile en pas chassés : **129 places dans 24 rangs**, 314 places sur 331 se prennent en marchant (les 17 autres sont dans des pièces fermées) | VO q_0108-0130, q_0204, q_0324 |
| Le bas de l'escalier principal (`js/carte_ecole.js` `construireEscalier`) | un U de 2 × 10, palier à 1,75 : par la porte, le flanc de la volée 1 | quatre contremarches dans la porte, palier à 0,70 devant le mur à affiches, volée 2 à l'ouest au-dessus d'un échiffre ; garde-corps hors de l'occlusion de l'écran (plus de moucheté gris) | P 20, 06 et r01, 04 |
| La façade sur l'impasse (`js/carte_ecole.js`, `js/ecole_etage1.js`, `js/ecole_etage2.js`, `js/ecole_matieres.js`, `js/ecole_rue*.js`) | cadres rouges carrés, fenêtres à meneau et imposte, tableaux de pierre claire, attique en retrait, plafonniers vus par les vitres | cadres 1,47 × 2,53 aux vraies travées, une fenêtre d'un vantail dans un cadre brun-noir, 5e étage et toiture plate, reflets de la rue, mobilier du trottoir à sa place | P 10 à 18 (recalées à 2-9 px) |
| Le rendu (`js/ecole_visibilite.js`) | le rez-de-chaussée et la rue dessinés partout, le 1er et le 2e en entier depuis la rue | ce que la caméra ne peut pas voir n'est pas dessiné : rue 2 150 → 1 380 appels, palier est du 1er 1 482 → 807, pause du -1 1 166 → 597 ; le passage sombre du -1 lisible | V v_066, v_067 |

À l'intégration : le tri par zones a suivi l'escalier refait (la cage part de x 0,60, la volée 2 surplombe la trémie de
la volée de tôle) — rejoué tri actif puis coupé, pixel à pixel, sur les trois escaliers en montée et en descente, les
couloirs des quatre niveaux, la rue et plus de 500 poses tirées au hasard là où l'on marche.

### Ce qui reste imaginé

Les pièces étoilées n'ont été vues ni sur les photos ni sur la vidéo (ou seulement leur porte) : leur intérieur est
imaginé, plausible pour une école du numérique parisienne, avec les matières et la lumière du reste de l'école, et
sans être encombré (« ne pas meubler l'imaginé »). Celles du rez-de-chaussée sont dans `js/ecole_pieces.js` : **quand
Haythem enverra des photos de ces pièces, c'est ce module qu'on reprend**, pièce par pièce (chaque pièce est une
fonction : `salleA` (la Si 0.1), `bureauB`, `couloirService`, `localTechnique`, `toilettesFemmes`, `toilettesHommes`,
`toilettesPMR`, `salleDavidClark`, `courette`).

Restent aussi imaginés ou incertains (avec la photo qui trancherait) :
- **Rez-de-chaussée** :
  - la longueur du passage des étudiants (4,45 m gardés ; les photos 07 et 10 donnent plutôt 3,85 : une photo du
    passage prise de la paroi vitrée, le sol visible) ;
  - le haut de l'escalier principal : vue du hall, la volée 2 passe 0,5 à 0,8 m plus haut que sur les photos r01, 06
    et 20 (la photo 04 n'y voit plus les barreaux), parce qu'elle garde l'arrivée du jeu au palier du 1er (y 8,35) ;
    à sa vraie pente (0,53, girons de ≈ 0,33), elle arriverait au 1er vers y 6,3-7,0, dans le couloir sombre imaginé —
    c'est déplacer le palier du 1er et sa double porte, imaginés (une photo depuis le palier intermédiaire vers le haut,
    puis du palier du 1er) ; le vantail ouest reste à plat (entrouvert sur la photo 20) ;
  - le pilier gris et la borne (les photos 21 et 02 diffèrent de ≈ 0,7 m) ; l'écart entre le C01 et la pile vu de la
    photo 01 (≈ 1 m) ; l'angle nord-est du bureau B (± 0,3 m : une photo de l'angle sud-est de la salle vers le sud) ;
  - la porte de la Si 0.1 et tout son intérieur, la Si 0.2 et ses fenêtres, la courette ouest, les toilettes, le local,
    la PMR, le couloir de service, la réserve ouest et le local du fond (fermés) ;
  - le texte des lames de l'annuaire et des affiches ; le pupitre de l'accueil (± 0,4 m) ; la cabine de l'ascenseur ;
  - le plafond du hall d'entrée (la photo 03 n'y voit que des spots ronds) ; le ressaut de 10 cm entre le plafond du
    hall ouest (2,30) et celui du C05 (2,40).
- **Sous-sol** : la focale de la vidéo (≈ 1 000 px mesurés, l'audit supposait 1 200) ; la profondeur du hall du -1 ; le
  mobilier de la pause (confiance moyenne) ; le passage sombre (si la porte sombre ouvre sur un local, le passage P est
  muré côté pause) ; le bloc est de la grande salle (la VO la mènerait en L) ; le nombre de marches de la descente est
  (8 + 8) ; le dedans des locaux ⚡ et « réservé au personnel » ; la couleur de 2026 du vestibule.
- **1er** : le groupe nord de l'espace pause (décalé de 1,85 m d'après la VO, ± 0,3 : une photo de la pause vers le
  nord-ouest depuis la porte du palier) ; le local du coin nord-ouest, le couloir sombre, le bureau de la travée 1, le
  103 et la Si 1.5, le local du palier est ; le contenu des tableaux de la Si 1.4.
- **2e** : aucune photo de 2026 ; la salle 2 en plan (son mur ouest) ; la profondeur du recoin de l'extincteur ; les
  Si 2.6 et B 2.3, le dégagement ouest ; laquelle des deux salles est S 2.7 ou S 2.8 ; la cage au-dessus (volées 5 à 7,
  portillon) ; les étages 3 à 5 et le -2 n'existent pas encore.
- **La façade** : le tableau sombre des fenêtres est une doublure de 25 cm (la menuiserie reste à sa place pour ne pas
  toucher aux salles : vue très en biais, la bande sombre est un peu large) ; le côté de l'ouvrant de la fenêtre haute
  de la travée 7 du 2e (les deux photos sont prises de l'ouest) ; le reflet des vitres est une seule tuile, qui se répète
  de près ; le premier banc (± 0,4 m), le totem du passage et la trottinette (± 0,3 m) ; le n° 4 haussmannien reste plat,
  le passage reste blanc (jaune sur les photos 10 et 11).
- **Les places des rangées serrées** : dans la salle 2 du 2e, il n'y a que 0,145 m entre la table d'à côté et le dos des
  chaises : en passant vers la place des fenêtres, les jambes de Haythem entrent de 5 à 8 cm dans la chaise côté allée
  (sur la VO q_0324, les chaises sont rentrées sous les tables : les rentrer de 0,10-0,15 m réglerait cela).
- **La caméra** : garder sa tête dans l'image fait tourner la vue plus vite aux demi-tours des paliers (le réglage :
  le 0.78 de `_dansLImage` dans `js/game.js`) ; à la pose de la photo 25 (vestibule est, Haythem dos au mur jaune), la
  vue reste plongeante, 65 cm au-dessus de sa tête, faute de recul derrière lui ; au pied de la volée de tôle (palier tournant de 0,85 m), Haythem reste translucide
  quelques dixièmes de seconde.
- Les couleurs de 2026 des murs vus seulement en 2021 : le vestibule (jaune), le mitoyen de l'accueil (gris), le
  couloir du 2e (rouge), l'espace pause du 1er (orange).

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
Changer aussi la version de `sw.js` (aujourd'hui `iris-v1.6`) quand index.html, le style, un module ou un fichier lourd
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
