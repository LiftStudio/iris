# IRIS — l'école en 3D

Un jeu à part, tiré de **LA CAGE** : le même moteur, le même rendu et la même façon de bouger, mais **sans ballon**. On
y promène **Haythem**, et rien que lui, dans l'école **IRIS** (MediaSchool) : marcher, courir, sprinter, sauter,
s'asseoir, danser, sortir son téléphone, prendre l'ascenseur. Pas de match, pas de score, pas de boutique : une balade
libre.

> État actuel (v1.4, 10/10) : l'école est construite d'après **trois sources** — les **29 photos** de Haythem (2026),
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
>   David Clark, le C01, la salle d'attente au mur safran, le cou et le bureau de direction ; le **hall d'entrée** et sa
>   **pile** (la plaque « iris », l'horloge, les annuaires), l'**accueil** nord-sud et son open-space ; derrière la porte
>   nord, le **couloir est**, l'**escalier est** et l'**ascenseur** ;
> - le **1er étage** (3,50 m) : derrière la porte du palier est, l'**espace pause orange** ; au sud la **salle de cours
>   S 1.3**, au nord la **salle Robert Kahn Si 1.4** (TP réseau) ; le couloir sombre jusqu'à l'escalier principal ;
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
| Vue (3e personne → épaule → 1re personne) | C | Back / croix bas | VUE |
| Téléphone | P | croix haut | téléphone |
| Pause | Échap | Start | pause |

Toutes les touches se changent dans **Options › Commandes** ; les huit emotes de la roue dans **Options › Emotes**.
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
- Les **trois vues** de caméra, le **clavier/souris**, la **manette** (avec la navigation dans les menus), le
  **tactile** (boutons déplaçables), la **roue des emotes**, le **téléphone** (le groupe s'appelle maintenant IRIS),
  les **options**, l'**écran de chargement** (le logo officiel de l'école sur fond blanc, barre et astuces au jaune du
  logo), la **PWA** (`manifest.webmanifest`, `sw.js`, cache `iris-v1.4`).

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
js/ecole_rdc_centre.js la PILE du hall (plaque « iris », horloge, annuaires), le bureau de direction B 0.3, le totem
js/ecole_rue.js       la rue (trottoirs, chaussée et ses détails, façades voisines et d'en face, jardin, impasse, carrefour)
js/ecole_rue_mobilier.js  le mobilier de la rue, ses plantes (un atlas de feuillage) et ses deux-roues
js/ecole_rue_voitures.js  les voitures garées (assets/voitures.glb, repeintes dans leur texture)
js/ecole_pieces.js    les pièces imaginées du rez-de-chaussée (salle A informatique, bureau de direction, couloir de
                      service, local technique, toilettes du C05 et PMR, salle David Clark et sa cour) : murs qui
                      manquaient, mobilier, luminaires, sièges, zones de lumière, miroirs
js/ecole_est.js       le couloir est, le vestibule et l'escalier est (photos 24 à 29, vidéo) : la porte nord du hall, les
                      volées jusqu'au 1er (poserEst, appelé par la carte) ; le palier est du 1er et la cage jusqu'au 2e
                      (poserPalierEst, appelé par l'étage) ; la cage au-dessus du 2e (poserCageHaute)
js/ecole_ascenseur.js L'ASCENSEUR : la façade palière inox, l'afficheur, la platine d'appel, la cabine (imaginée) qui
                      dessert le rez-de-chaussée, le 1er et le 2e ; la bande sud du palier est du 1er
js/ecole_etage1.js    le 1er ÉTAGE : sa façade percée, le bureau 103, la salle 104, le couloir sombre, le palier d'étage
                      ouest, l'escalier jusqu'au 2e ; sa lumière et son ombre cuites, sa visibilité et ses ombres selon
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
| Le palier et la volée (ouest) | derrière la porte grise du hall ouest : le palier de béton peint (le panneau jaune « 0 », un hublot, l'interrupteur à voyant vert), une longue volée droite de 17 contremarches en tôle larmée, garde-corps inox à quatre lisses | V (v_001 à v_030) |
| Le hall du -1 et le couloir | un hall presque carré à la résine grise (« -1 », extincteur, consigne, poutre, bloc lumineux, porte grise) ; le couloir étroit de 0,92 m qui revient vers le sud | V (v_026 à v_058) |
| L'espace pause | grand carrelage beige, mur vert anis et cloisons de verre dépoli, mange-debout noirs, tabourets (on s'y assoit), baby-foot, grande table en X, distributeurs, trombinoscope, casiers, sas des toilettes (fermé) ; l'**aile** de 2021 (tablette haute, micro-ondes noir et blanc, trois A4, chaise filaire, tabouret) ; la porte grise G du mur sud (fermée) | V (v_059 à v_067) ; l'aile : VO 22-27 s, 34-35 s |
| La grande salle S -1.14 | derrière la porte vitrée dépolie du mur vert (« Salle de cours S -1.14 ») : sol plat, 8 + 6 rangs de tables filantes de hêtre, 109 fauteuils coque jaune moutarde et une chaise (on s'assoit), tableau triptyque sous le carter de l'écran et ses enceintes, le portrait d'Einstein et un second en gris, meuble multimédia, poteau et retombée, convecteurs, goulotte, luminaires à grille ; la porte verte du fond | VO 26,7-33,9 s ; son état de 2026 n'est pas vu |
| La descente est | la volée A sous la volée 2 du rez-de-chaussée, le palier bas à -1,53 (réglette, voyant, bloc de sortie, affiche iris), la volée B, le palier du -1 (le panneau cuivré « -1 » : « Salle de cours S -1.14 / Espace pause », l'interrupteur), la porte à deux vantaux (automatique) | VO 12,4-18,2 s, 35,5-41 s ; P 24 (la tête) |
| Le sas technique | la porte grise « RÉSERVÉ AU PERSONNEL », la plaque du trumeau, la porte double ⚡ du local électrique, la porte crème ⚡, un boîtier noir ; le PASSAGE de 1,1 m qui débouche dans l'espace pause (la « porte du local sombre » de 2026) | VO 18,2-21,8 s ; V (la porte) |
| **Rez-de-chaussée** | | |
| Le hall d'entrée | porte n° 6 (automatique) et ses vitrophanies (quart de cible, nuage et sa constellation, équerre jaune, pavé « iris », phrase, visage ; les trois bandes du vantail est), tapis ; l'ACCUEIL nord-sud (comptoir sur socle de bois, tablette PMR, pupitre de chêne grisé), l'open-space du personnel et son mitoyen gris ardoise (affiche à l'immeuble, photo de la façade, premiers secours, caméras, imprimante) ; les huit lignes lumineuses du plafond ; l'angle nord-est ouvert (pan cannelé, photocopieur, étiquettes « INFORMATIQUE », table et chaise de hêtre — on s'y assoit —, présentoir) ; deux fenêtres à barreaux | P 03, 16, 24 ; VO 3-7 s, 92,5-97,8 s |
| La pile du hall | face sud : l'horloge ambre (à l'heure de l'ordinateur), la plaque « iris » et l'annuaire du niveau 0 (Si 0.1, Si 0.2) ; face est, jaune : le grand annuaire à seize lames ; face ouest : radiateur, affichettes « WIFI », haut-parleur | VO 6,4-12,4 s, 92,6 s ; P 03, 22 |
| Le cou | le passage au sud-ouest de la pile, le trumeau, le totem « 1ère école pour le BTS SIO en France » (contre le mur ouest *), la plaque et le drapeau « Bureau de direction B 0.3 » | VO 7-11,6 s ; P 01, 03 |
| Le bureau de direction B 0.3 * | bureau de chêne, fauteuil et chaises visiteurs (on s'assoit), armoire, bibliothèque, tableau, plante | porte : P 03 |
| La salle d'attente | mur safran et sa lisse blanche, panneau DAE, écran, chaises coque (on s'y assoit), jours dépolis, borne, pilier gris et ses deux affiches, présentoir, kakémono des formations | P 02, 21 ; VO 11,6 s |
| Le passage des étudiants | grille noire ouverte sur la rue, réglettes fluorescentes, panneaux de liège, porte blanche « Sortie », portes vitrées aux autocollants « iris » (automatiques) | P 07, 10, 19 |
| Le hall ouest | plan d'évacuation, la porte grise de l'escalier du sous-sol, extincteur, radiateur, affiche jaune du tri, portes coupe-feu (le vantail gauche ouvert) | P 06, 20, 04 ; V |
| L'escalier principal | deux volées de 10 marches, palier à 1,75 m, garde-corps à barreaux, main courante, palier du 1er étage (double porte ouverte) ; il continue jusqu'au palier du 2e (double porte fermée) | P 20, 06 |
| Le couloir C05 | les deux portes des toilettes à fente vitrée haute, leurs plaques et leurs affiches, la retombée et ses hublots ; au fond, la porte bleue de la salle David Clark (automatique) | P 05, 23 |
| Les toilettes du C05 * | femmes : trois cabines aux portes safran, deux vasques et leur miroir ; hommes : deux cabines, trois urinoirs, deux vasques ; faïence, grès, sèche-mains, un vrai miroir sur PC | portes : P 23 |
| La salle David Clark Si 0.2 * | derrière la porte bleue : trois rangs de tables pour deux (on s'assoit), tableau blanc, écran, vidéoprojecteur, bureau de l'enseignant, trois fenêtres sur une cour | plaque et porte : P 23, 05 ; nom : VO 7,9 s |
| Le couloir C01 | gaine technique, porte des toilettes PMR, porte du local | P 01 |
| Les toilettes PMR *, le local technique *, la salle A *, le couloir de service * | cuvette suspendue et barres d'appui ; baies serveurs aux diodes, onduleur, tableau électrique ; trois rangées de cinq postes ; bacs, chariot de ménage | plaque : P 01 |
| Le couloir est et le vestibule | lino moucheté clair, mur jaune et sa plaque directionnelle (Si 0.1, Si 0.2), plinthes gris foncé, plafond de plâtre et hublots, poteau gris ; la niche : la tête de la descente au -1 (poteaux à crosse, portillons repliés, tapis) ; le dégagement et, au bout, l'ascenseur ; le vestibule jaune, son affiche à la pomme et le déclencheur rouge, la porte nord crème | P 24, 26 ; VO 12-15 s, 38-41 s, 90-92 s |
| L'ascenseur | au bout du dégagement (rez-de-chaussée), de la bande sud (1er) et du vestibule (2e) : la façade palière inox (fixe, deux vantaux télescopiques, afficheur bleu, platine d'appel) ; la cabine * (inox, granit, main courante, boutons) qui porte Haythem d'un niveau à l'autre | VO 68,2-70 s (au 1er) ; rez-de-chaussée et 2e déduits |
| L'escalier est | en U contre le mitoyen : 2 x 9 marches sombres à nez d'aluminium, mains courantes noires, palier à 1,75 m (réglette, bloc de sortie, affiche « la vie à l'école »), l'échiffre ORANGE jusqu'au 1er puis ROUGE jusqu'au 2e, le palier à 5,05 m ; la cage monte au 3e (volées 5 à 7 *, portillon *) | P 25, 26 ; VO 41-44 s, 68-72 s, 88,8-90 s |
| La rue | trottoirs, chaussée, façade de l'école (drapeaux, écusson), les deux totems « iris », jardinières de zinc, bambou, palmier, bancs (on s'y assoit), huit voitures garées, motos, scooters, vélos, le jardin, l'impasse, le carrefour | P 07 à 18 |
| **1er étage (3,50 m)** | | |
| Le palier est | vinyle moucheté foncé, le panneau d'étage (« 1 » : S 1.3, Si 1.4, Si 1.5, Espace pause, S 1.6), « WIFI IRIS », « POINT ÉCOUTE », l'échiffre orange et son chant gris, la porte gris taupe de l'espace pause ; au fond, la porte de la S 1.6 (fermée) | P 27, 28, 29 ; VO 41-45 s |
| La bande sud | le doublage, le grand tableau abstrait, le disque de laiton, le boîtier vert, la réglette, l'extincteur, la porte de l'ascenseur ; aucune porte (le 103 et la 104 ne s'y ouvrent pas) | VO 68,2-70 s |
| L'espace pause | murs crème et orange, plan en L : le local fermé du coin nord-ouest * et, sur sa face est, la niche des distributeurs (machine à café, machine à snacks à deux portes vitrées) ; trois poteaux serrés et leurs murets lilas à tablette, la porte de service à vitre lilas-bleu ; banquettes courbes jaune et rouge, table basse, mange-debout, tabourets « Miura », chaises coque hautes (on s'assoit : 18 places) ; lino taupe, dalles et spots, trois jours dépolis ; au fond, le mur orange et la porte vitrée de la Si 1.4 | VO 44,9-49,2 s, 53,2-54,8 s, 66,6-68,1 s |
| La salle de cours S 1.3 | sept fenêtres sur la rue, moquette en dalles bleu-gris, 24 tables doubles de hêtre clair, 48 chaises de hêtre percé, tableau triptyque, vidéoprojecteur ; un blanc froid | VO 49,2-53,2 s |
| Le recoin sud-est | un renfoncement de 2 m qui file au sud jusqu'à une porte taupe fermée (la seconde porte de la salle) | VO 67 s |
| La salle Robert Kahn Si 1.4 | la salle réseau aveugle (6,4 x 11,3 m) : six caissons lumineux, poutre et deux poteaux, 30 postes (tours noires, écrans, consoles), commutateurs, routeurs, borne Wi-Fi, cordons rouges et cyan, deux tableaux à schémas, bureau de l'enseignant, étagère miel, extincteur, desserte bleue, prises et sonde, porte grise fermée ; moquette marine, lumière froide (31 places) ; son toit à lanterneaux | VO 54,7-66,6 s |
| Le couloir sombre, le palier d'étage ouest * | derrière la porte du fond de l'espace pause : le couloir jusqu'à l'escalier principal (banc, plan d'évacuation, extincteur, local ménage fermé) | — |
| Le bureau de la travée 1 *, le bureau 103 *, la salle Gordon Earle Moore Si 1.5 (104) * | derrière la grande baie rouge et les fenêtres des travées 9 à 12 ; fermés (leur accès n'est pas vu) | façade : P 11, 12, 16, 18 ; nom : P 28 |
| **2e étage (6,60 m)** | | |
| Le palier | la copie de celui du 1er : le mur du panneau « 2 » (« Salles de cours S 2.7 - S 2.8 / Salle Bjarne Stroustrup Si 2.6 / Bureau des Conseillers B 2.3 »), réglette, poussoir, prise, tapis ; une fenêtre dans ce mur ; l'extincteur du recoin ; le vestibule de l'ascenseur | VO 70-72 s |
| La porte coupe-feu et le sas | bâton inox, oculus, huisserie de bois côté palier ; côté sas, la plaque noire, le plan d'évacuation, la caméra | VO 72-73 s, 88 s |
| Le couloir | le mur nord ROUGE VERMILLON, lino taupe, plafond lisse, six spots, trois chaises noires, la photo turquoise, deux affiches, les plaques ; au fond, une porte grise fermée | VO 73,1-75,7 s, 84,2-88,7 s |
| La salle 1 (S 2.7, côté cour) | six fenêtres à stores, moquette marine en damier, cinq rangées, chaises de hêtre à dossier plein, tableau blanc, poteaux | VO 75,8-78,4 s |
| La salle 2 (S 2.8, côté rue) | cinq fenêtres, moquette anthracite, deux colonnes de tables pour deux, chaises à six trous, triptyque, range-documents | VO 78,4-84,2 s |
| Fermés * | la Si 2.6, le B 2.3, le dégagement ouest, le palier de l'escalier principal | — |

Le départ est dans le hall d'entrée, juste passé la porte 6, face à la pile et à sa plaque « iris » — là où entre la
vidéo officielle. Pause › **Revenir au départ** y ramène.

### Ce qui reste imaginé

Les pièces étoilées n'ont été vues ni sur les photos ni sur la vidéo (ou seulement leur porte) : leur intérieur est
imaginé, plausible pour une école du numérique parisienne, avec les matières et la lumière du reste de l'école. Celles
du rez-de-chaussée sont dans `js/ecole_pieces.js` : **quand Haythem enverra des photos de ces pièces, c'est ce module
qu'on reprend**, pièce par pièce (chaque pièce est une fonction : `salleA`, `bureauB`, `couloirService`,
`localTechnique`, `toilettesFemmes`, `toilettesHommes`, `toilettesPMR`, `salleDavidClark`, `cour`).

Restent aussi imaginés ou incertains :
- **Rez-de-chaussée** : la place de la salle d'attente (la vidéo de 2021 la met plus au sud, à gauche de la pile, les
  photos 02, 04, 05 et 21 de 2026 là où elle est — elle y reste) ; la place du totem en 2026 ; le texte des lames de
  l'annuaire et des affiches ; le pupitre de l'accueil (± 0,4 m) ; l'objet noir mural du coin sud-est ; la cabine de
  l'ascenseur et sa présence au rez-de-chaussée (sa porte n'y est pas vue).
- **Sous-sol** : le nombre de marches de la descente (8 + 8) et la longueur du palier bas ; le texte de la plaque du
  trumeau et des étiquettes ; le dedans des locaux ⚡ et « réservé au personnel », le plafond du sas ; la couleur de
  2026 du vestibule (jaune en 2021) ; la profondeur de la grande salle (± 1 m), son mur est, son état en 2026, son
  second portrait ; la gaine de l'ascenseur reste close au -1.
- **1er** : le local du coin nord-ouest, le couloir sombre, le bureau de la travée 1, le 103 et la Si 1.5, la S 1.6 ;
  le texte des affiches ; la place absolue de la Si 1.4 (± 1 m), le contenu de ses tableaux, la pièce derrière sa porte
  grise ; le mobilier de l'espace pause est recomposé (± 0,5 m).
- **2e** : les Si 2.6 et B 2.3, le dégagement ouest, laquelle des deux salles est S 2.7 ou S 2.8, le dessin de la
  photo turquoise ; son état en 2026 (aucune photo) ; la cage au-dessus (volées 5 à 7, portillon) ; les étages 3 à 5 et
  le -2 n'existent pas encore.
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

**L'écran de chargement** : après avoir ajouté des fichiers chargés au démarrage, relever les profils
(`?chargement=trace`, puis `?chargement=trace&tel=1`) et relancer `python tools/liste_chargement.py` (voir son en-tête).
Changer aussi la version de `sw.js` (aujourd'hui `iris-v1.4`) quand index.html, le style, un module ou un fichier lourd
changent.
