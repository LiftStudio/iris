# IRIS — le monde solide, les niveaux et la navigation (rapport du lecteur, 22/10/2026)

Dépôt lu : `C:/Users/hgami/Downloads/IRIS`, master `a8b22dd` (v2.0), **aucune modification** (`git status` vide à la fin).
Mesures : `python serve.py 8321`, un seul onglet du navigateur intégré sur `http://localhost:8321/` (fermé à la fin,
serveur arrêté ; l'onglet « seed » du 8124 n'a pas été touché). Les prototypes n'ont existé que dans la console
(`window.__genNav2`, `__astar`, `__dijkstra`…), sur la carte construite, avant et après « APPUIE POUR COMMENCER » (le monde
solide ne change pas au démarrage : 1 466 formes avant comme après).

Repère partout : **monde** `X = x du plan`, `Z = -y du plan` (z+ = vers la rue), `Y` vers le haut, sol du rez-de-chaussée
à 0. Les fichiers de carte parlent en **plan** (x le long de la façade, y vers le fond) ; `Collisions` parle en **monde**
(z = -y). Toutes les hauteurs sont ABSOLUES.

---------------------------------------------------------------------------------------------------------------------

## 0. L'essentiel en dix lignes

1. Le monde solide (`js/collisions.js`) : **1 466 formes** verticales (boîtes alignées, boîtes orientées, cylindres) entre
   deux hauteurs, rangées dans une **grille de cases de 2 m** (481 cases, 8 formes par case en moyenne, 99 au pire) ; à
   part, **53 sols** (41 dalles + 12 rampes d'escalier) et **118 plafonds** en listes simples.
2. Il suffit pour TOUT le gameplay « monde » : marcher (bots compris), tester une ligne de vue, faire voler une balle —
   à condition d'y ajouter les sols pour les balles et de traiter les vitres à part.
3. Raycaster three.js sur la scène : **19 ms par rayon** (650 000 triangles opaques, pas de BVH). Le même rayon sur les
   primitives (`rayonLibre`) : **12 à 106 µs** selon la longueur ; en parcours DDA de la grille avec sortie au premier
   obstacle : **7,9 µs**. Donc : JAMAIS de Raycaster sur les maillages pour les balles ou la vue des bots.
4. Graphe de navigation généré automatiquement (prototype console) : grille de 0,25 m, rayon 0,3 m (celui de Haythem),
   un nœud par case et par sol, liens vérifiés par `C.deplacer` → **13 875 nœuds, 97 274 liens, une seule composante,
   0,7 s** (8 956 nœuds si l'on borne la rue à 6 m devant la façade). Les quatre niveaux, les trois escaliers, la volée
   de tôle et la descente est sont dedans.
5. A* (prototype naïf) : **2,7 ms en moyenne, 13,5 ms au pire** ; Dijkstra complet 15 ms. Un bot qui suit le chemin
   avec le vrai déplacement arrive **100 fois sur 100** (portes ouvertes) — **64 sur 100** avec les portes automatiques
   dans leur état réel : elles ne s'ouvrent que pour Haythem.
6. Pièges majeurs : portes automatiques (pour Haythem seul), ascenseur (Haythem seul), rangées de sièges (infranchissables
   au rayon 0,3), vitres (murs pour `rayonLibre`), sols absents du test de rayon, la rue immense (414 m², la moitié du
   graphe), le 2e accessible par UN seul chemin (l'escalier est puis la porte coupe-feu du 2e).

---------------------------------------------------------------------------------------------------------------------

## 1. `js/collisions.js` — l'API exacte (375 lignes)

### 1.1 Les formes (en-tête l. 9-16, `_ranger` l. 74)

| type | objet | déclaré par |
|---|---|---|
| boîte alignée | `{ t:'b', x0, z0, x1, z1 }` | `ajouterBoite(x0, z0, x1, z1, o = {})` l. 100 (ordre libre, trié) |
| boîte orientée | `{ t:'o', cx, cz, hx, hz, a, c, s }` | `ajouterBoiteOrientee(cx, cz, hx, hz, a, o = {})` l. 105 (`a = -rotation.y`) |
| cylindre | `{ t:'c', x, z, r }` | `ajouterCercle(x, z, r, o = {})` l. 108 |

Options (`o`, recopiées telles quelles dans la forme par `...o`) : `y0` (défaut 0), `y1` (défaut `Infinity` — **aucune
forme n'a gardé y1 infini**, mesuré), `joueur` (défaut vrai ; faux = caméra seule : plafonds, dessous de plancher,
dessous des marches), `camera` (défaut vrai ; faux = le joueur seul : mobilier de rue, le « jour » entre les volées).
Drapeaux posés par d'autres modules et que `collisions.js` n'interprète PAS : `off` (lu partout : la forme n'existe plus),
`mobile` (portes automatiques et passage de l'ascenseur : lu par la lumière cuite, `ecole_lumieres.js`), `vitre`
(informatif). `_ranger` ajoute `id`, `tour`, la boîte englobante `bx0, bz0, bx1, bz1`.

Mesuré (après construction) :

| clé (t + J joueur + C caméra + M mobile + V vitre) | nombre |
|---|---|
| bJC (murs, meubles) | 762 |
| cJC (piliers, pieds, chaises) | 291 |
| bC (caméra seule : plafonds, dessous de dalles, sous les marches) | 248 |
| bJCV (vitres) | 50 (+1 bCV) |
| bJ (joueur seul) | 35 |
| bJCM (portes automatiques + passages d'ascenseur) | 19 |
| oJC / oJ / oC | 19 / 17 / 1 |
| cJ | 23 |
| **total** | **1 466** |

Les 75 formes « joueur seul » : presque toutes dans la rue (jardinières, bacs, vélos, bancs, potelets x 39,5 et 46,5),
plus le **« jour » de l'escalier principal** (`carte_ecole.js` l. 628 : x 2,0-2,42, de 0 à 5,2 m, le vide entre les
volées), un portillon au pied de la volée 5 au 2e (x 16,2 ; y 10,8-12,4 ; 6,6-9,2) et deux formes du palier du -1 ouest
(x 0-1,6 ; y 5,6-6,1 ; jusqu'à 1,9).

### 1.2 Les autres déclarations

- `mur(x0, z0, x1, z1, ep, { h = 2.7, ouvertures = [], camera = true })` l. 115 — découpe le mur autour des ouvertures
  `[{ a, l, h = 2.1, bas }]` (jambages, linteau, allège) et rend `{ x0, z0, ux, uz, long, ep, h, pleins, ouvertures }`.
  (La carte passe en général par `Chantier.mur`, `carte_ecole.js` l. 231, qui fait la même découpe en coordonnées du plan
  avec `base` et `h` absolus, et pose la géométrie exactement sur les morceaux pleins.)
- `plafond(x0, z0, x1, z1, y, ep = 0.3)` l. 145 — un rectangle dans `this.plafonds` + une boîte `joueur:false` de `y` à `y+ep`.
- `plafondEn(x, z, yMin = -Infinity)` l. 153 — le plus bas des plafonds au-dessus de `yMin` (boucle sur les 118).
- `sol(x0, z0, x1, z1, h)` l. 161 — une dalle. `rampe(x0, z0, x1, z1, axe, a0, h0, a1, h1)` l. 168 — une volée
  (`axe` 'x' ou 'z', hauteur linéaire de h0 en a0 à h1 en a1, bornée).
- `solEn(x, z, y = 0, marche = 0.45)` l. 180 — **le sol le plus haut qui couvre (x, z) sans dépasser y + 0,45** ; si
  AUCUN sol ne couvre, 0. (Boucle sur les 53 sols.)

### 1.3 Les questions

- `resoudre(pos, r, vel = null, pieds = 0)` l. 213 — sort le disque `{x, z}` de rayon r de toutes les formes qu'il touche
  (4 passes), retire à `vel` la composante qui rentre ; le corps occupe **[pieds + 0,25 ; pieds + 1,6]** (l. 59 :
  `BAS_CORPS`, `HAUT_CORPS`) : une forme qui finit sous 0,25 m au-dessus des pieds, ou commence au-dessus de 1,6 m, ne
  compte pas. Formes `off` ou `joueur:false` ignorées.
- `deplacer(pos, dx, dz, r, vel = null, pieds = 0)` l. 235 — le même en sous-pas de r/2 (pas de tunnel).
- `libre(x, z, r, pieds = 0)` l. 278 — vrai si `resoudre` ne bouge pas le disque de plus de 0,1 mm.
- `rayonLibre(ax, ay, az, bx, by, bz, r = 0.2)` l. 288 — **la part libre (0 à 1) du segment A→B pour une sphère de rayon
  r**, contre les formes `camera` non `off` ; une forme qui CONTIENT déjà A est ignorée (`_segment` l. 300, l. 317 et
  l. 337). Ne rend ni la forme touchée ni la normale ; **ne connaît pas les sols** (ce ne sont pas des formes).
- `afficherDebug(scene, hMax = 3.2)` l. 348 — fil de fer de tout (vert joueur, bleu caméra, magenta sols) ; activé par
  `?debug=murs` (`js/game.js` l. 168).

### 1.4 La structure d'accélération

`CASE = 2` (l. 57) ; `this.grille = Map(cle(i, k) → [formes])` avec `cle = (i + 32768) * 65536 + (k + 32768)` (l. 61) ;
chaque forme est rangée dans toutes les cases de sa boîte englobante. `_parcourir(x0, z0, x1, z1, f)` l. 191 visite les
cases du RECTANGLE demandé et marque chaque forme du numéro de tour `_tour` pour ne la voir qu'une fois. Conséquences :
- pour un rayon, c'est le rectangle englobant du segment qui est parcouru : un rayon de 40 m en diagonale teste
  ~270 formes (mesuré ci-dessous) ;
- **pas réentrant** : appeler `rayonLibre`/`resoudre`/`libre` depuis le rappel d'un `_parcourir` casse le marquage.
- Aucune méthode pour RETIRER une forme : on l'éteint (`off = true`), comme les portes.

### 1.5 Les coûts mesurés (PC de Haythem, onglet du navigateur intégré)

| question | coût |
|---|---|
| `libre(x, z, 0.3, h)` | 3,7 µs |
| `solEn` | 0,68 µs |
| `plafondEn` | 0,81 µs |
| `deplacer` d'un pas de 6 cm | 4,0 µs |
| `rayonLibre(…, 0)` 2 m / 5 m / 10 m / 20 m / 40 m | 11,6 / 23,9 / 35,4 / 59,8 / 106 µs (11 / 28 / 70 / 167 / 270 formes testées) |
| `rayonLibre` entre deux nœuds au hasard (yeux à 1,6 m) | 89 à 102 µs |
| ligne de vue par DDA de la grille, sortie au premier obstacle (prototype, § 6) | **7,9 µs** |
| `Portes.maj` (16 portes, un acteur) | 5,3 µs |

---------------------------------------------------------------------------------------------------------------------

## 2. `js/carte_ecole.js` — le Chantier, les zones, les niveaux, la lumière cuite, la carte vivante

- Contrat (en-tête l. 11) : `construireCarte(scene, renderer) → { nom, collisions, depart, bornes, sieges, maj(dt, jeu),
  lumieres, portes, chantier }` (fonction l. 1701, retour l. 2465). `depart` = plan (14,9 ; 3,7) plein nord → monde
  `{ x: 14.9, z: -3.7, fx: 0, fz: -1 }` (l. 2464). `bornes = { xMin: -22, xMax: 47, zMin: -24.5, zMax: 12.45 }` (l. 2471) :
  un filet que `Player` applique en serrant sa position (`js/player.js` l. 709-713).
- `class Chantier` l. 193 (`ch`, passé à tous les `poser*`) : `ch.C` (le monde solide), `ch.M` (matières), `ch.decor`,
  `ch.portes` (`new Portes(C, M, decor)`), `ch.lampes`, `ch.sieges`, conversions `X(x) = x`, `Z(y) = -y`. Méthodes :
  `boite(x0, y0, x1, y1, h0, h1, mat, { ombre, collision = false, camera, horsAO, parent })` l. 208 (collision seulement si
  demandée), `panneau(...)` l. 215, `mur({ de, a, ep, h, base, mats, plinthes, ouvertures, camera, ombre })` l. 231
  (ouvertures `[{ c, l, h, bas }]`, hauteurs absolues ; rend `{ axeX, ligne, debut, fin, pleins }`), `porte(axe, ligne, c, o)`
  l. 275 (→ `Portes.ajouter`), `plafond(x0, y0, x1, y1, h, type, { camera, retombees })` l. 286 (déclare `C.plafond` si
  `camera`), luminaires l. 310-371.
- Ordre de construction (l. 1780-2340) : façade, murs, entrée, paroi du passage, porte du fond, escalier, accueil, puis les
  crochets `poserMobilier`, `poserRdcCentre`, `poserRue`, `poserPieces`, `poserEst`, `poserEtage1` (qui appelle
  `poserEtage2`), `poserSousSol`, `poserSousSolEst`.
- **Les zones** (l. 2345-2385) : 47 « pièces » `{ id, rects: [[x0, z0, x1, z1, hMin, hMax]] (MONDE), voisines, env }`,
  celles de l'étage et du sous-sol en tête (l. 2385). Lecture : `game.carte.lumieres.zoneEn(x, z, y)`
  (`js/ecole_lumieres.js` l. 57 ; `hMin` ne compte que s'il est > 0, `hMax` seulement s'il est donné). Les 47 id :
  `escEst2 e1est escEst3 e2palier e2sas e2couloir e2s1 e2s2 e1kahn e1pause e1salle e1bureau e1couloir e103 e104
  descenteEst escEstSS palierSSE sasSS passageSS palierSS escalierSS hallSS couloirSS pauseSS salleSS palier1 escalier
  passage c05 hallO c01 attente hall porche rue si01 bureauB service local wcF wcH pmr dc vestEst escEst couloirEst`.
  C'est la bonne granularité pour nommer les lieux (« il est dans la pause du -1 »), découper la navigation en régions et
  choisir des apparitions.
- **La lumière cuite** : `cuireLumiereSol(C, ch.lampes, rect, { tpm: 16 })` l. 2388 (et une par niveau dans les modules
  d'étage) — calculée UNE fois à la construction, découpée par les formes du monde solide (les formes `mobile` laissent
  passer). Elle ne bouge pas en jeu : une porte qu'on « verrouille » ne change pas la lumière.
- **La carte vivante** : `maj(dt, jeu)` l. 2420, appelée par `js/game.js` l. 478. Tout y est piloté par **`jeu.user` (Haythem)
  et `jeu.camera`** : voiles du passage et de la cage, `visibilite.maj` (l. 2445), **`ch.portes.maj(dt, u.x, u.z, cam.x,
  cam.z, u.y, cam.y)` (l. 2446)**, `lumieres.maj` (les spots de la pièce de Haythem et de ses voisines), `etage1.maj`,
  `sousSol.maj`, `sousSolEst.maj`, `est.maj` (dont `majAscenseur`), `accueil.maj`. Coût mesuré : 0,03 ms.

### Les niveaux (hauteurs de sol)

| niveau | sol | déclaré |
|---|---|---|
| -1 | **-3,06** (`Y_SS`, `ecole_soussol.js` l. 91) | `C.sol(0.4, -1.0, 13.05, -16.66, Y_SS)` + emprise de la grande salle (`ecole_soussol.js` l. 1015-1017), le sas et le palier est (`ecole_soussol_est.js` l. 456-459) |
| palier de la descente est | -1,53 | `ecole_soussol_est.js` (HB) |
| rez-de-chaussée | 0 (implicite là où rien ne couvre) + dalles à 0 au-dessus de tout le -1 (`DALLES_RDC`, `ecole_soussol.js` l. 154 et l. 1012) | |
| palier intermédiaire, escalier principal | 0,70 | `carte_ecole.js` l. 620-621 |
| paliers intermédiaires, escalier est | 1,75 et 5,05 | `ecole_est.js` l. 1237, 1695 |
| 1er | **3,50** | `ecole_etage1.js` l. 635-636, `ecole_kahn.js` l. 556, `ecole_etage1_pause.js` l. 1216, `ecole_est.js` l. 1545, 1579 |
| 2e | **6,60** | `ecole_etage2.js` l. 1454, `ecole_est.js` l. 1817 |
| cage haute (volées 5-7, paliers 8,15 / 9,70 / 11,25) | | `ecole_est.js` l. 1760 (`poserCageHaute`) — **inaccessible** (portillon fermé, 0 nœud) |
| rue | trottoir 0, chaussée -0,12, banquette 0,12 | `ecole_rue.js` l. 379-380, 836 |

Bandes de hauteur pour dire « à quel niveau est ce point » (celles de `ecole_visibilite.js` l. 56) : -1 `[-3,5 ; -0,22[`,
rez-de-chaussée `[-0,22 ; 3,3[`, 1er `[3,3 ; 6,45[`, 2e `[6,45 ; 9,7[`.

---------------------------------------------------------------------------------------------------------------------

## 3. `js/ecole_visibilite.js` — zones de rendu et ce que la caméra voit

- `ZONES` (l. 64) : **25 zones de rendu** en boîtes du PLAN `[x0, y0, x1, y1, h0, h1]` (cages, trémie, pièces fermées du
  RDC, chaque niveau, la rue), un bit chacune (`ZONE`, l. 100 ; `DEHORS = 1 << 30`, l. 101).
- `zoneDe(x, y, h)` l. 115 — **en PLAN** (y = -z) : le bit de la zone du point.
- `zonesCachees(x, h, z)` l. 336 — **en MONDE, attention à l'ordre (x, hauteur, z)** : le masque des zones que la caméra
  ne peut PAS voir de ce point (règles tirées d'un relevé de 14 966 poses, vérifiées pixel à pixel).
- `poserVisibilite(scene, portesAuto)` l. 389 — coupe les blocs cousus par famille et branche le tri sur
  `scene.onBeforeRender` pour la caméra du jeu seulement.

**Réutilisable pour la vue des bots ?** OUI, comme PRÉ-FILTRE (ensemble potentiellement visible) : mesuré sur 20 000 paires
de nœuds au hasard (yeux à 1,6 m), `(zonesCachees(A) & zoneDe(B)) !== 0` rejette **39 % des paires en 2,1 µs**, et **jamais
à tort** (0 paire déclarée cachée alors que le segment est libre). Les paires restantes passent au test fin (§ 6).
Et pour le RENDU des bots : un `SkinnedMesh` est `exclu` du tri (l. 160 environ : `exclu(o)`), donc un bot au 2e est
dessiné quand la caméra est au -1. Il faut le cacher soi-même : `bot.visible = !(zonesCachees(cam) & zoneDe(bot))`.

---------------------------------------------------------------------------------------------------------------------

## 4. Les portes (`js/ecole_portes.js`, 716 lignes)

Trois états (en-tête l. 16-24, `Portes.ajouter(o)` l. 476) :
- `'fermee'` : vantail fermé et `_formePorte` (l. 561) = **un mur** (non mobile). Infranchissable, pour tout le monde.
- `'ouverte'` : vantail ouvert à demeure ; pas de forme dans la baie, mais une boîte mince le long du vantail ouvert
  (l. 541-546). Traversable.
- `'auto'` : la forme de la baie est **mobile** ; `Portes.maj(dt, x, z, camX, camZ, y = 0, camY = 1.5)` (l. 580) l'éteint
  (`forme.off = P.k > 0.02`, l. 606) quand **Haythem** est à moins de `RAYON_AUTO = 2,1 m` (l. 297) à son niveau, ou que la
  caméra passe dans la baie ; ouverture en `DUREE = 0,38 s` (l. 298), refermeture 1,6 fois plus lente. `ch.portes.auto[]`
  garde `{ g, vantaux, forme, cx, cz, rot, cote, k, sens, nx, nz, libre, base, h, l }`.

Les 16 portes automatiques (monde) : service (passage) (1,68 ; -1,3) · service (hall) — la porte grise vers le -1 —
(1,68 ; -5,48) · toilettes femmes (6 ; -8,48) · toilettes hommes (6 ; -10,98) · local C01 (11,63 ; -8,99) · PMR
(11,63 ; -11,26) · Si 0.1 (9,98 ; -3,53) · bureau B (12,89 ; -2,5) · **entrée n° 6 (15,13 ; -0,8, l = 1,96)** · **passage
(3,58 ; -4,05, l = 2,07)** · salle David Clark (5,16 ; -12,78) · **coupe-feu du 2e (14,75 ; -7,9, base 6,6)** · salle 1 du 2e
(12,45 ; -6,56) · salle 2 du 2e (10,52 ; -4,59) · hall -1 → pause (2,49 ; -10,76, base -3,06) · grande salle S -1.14
(9,8 ; -14,48, base -3,06). Plus 3 passages d'ascenseur mobiles (x 18 ; z -8,4 ; bases 0 / 3,5 / 6,6).

Les 27 autres : ouvertes — escalier (3,45 ; -9), couloir est (hall), vestibule est, 1er étage (palier ouest), Robert Kahn,
pause (porte du fond), S 1.3, palier est (couloir du 1er), palier -1 (escalier est, deux vantaux) ; **fermées** — porte
noire de secours de la façade, gaine technique, fond du C01, semi-fixes, local ménage (1er), S 1.3 (recoin), bureau
travée 1, Si 1.4 (mur ouest), dégagement ouest du 2e, bureau B 2.3, **salle Bjarne Stroustrup Si 2.6** (25 m² au 2e, plan
x 3,4-9,4 y 0,4-4,1 : une salle entière inaccessible), local électrique et sas du -1.

**Mesuré** : portes automatiques ouvertes, un bot qui suit son chemin arrive 100 fois sur 100 ; dans leur état réel (18 des
19 formes mobiles fermées), **36 trajets sur 100 restent bloqués** devant une porte — 12 devant la coupe-feu du 2e, qui
est le seul accès au 2e.

---------------------------------------------------------------------------------------------------------------------

## 5. L'ascenseur, les escaliers, les étages

### L'ascenseur (`js/ecole_ascenseur.js`, 529 lignes)

`poserAscenseur(ch, { base, groupe, ouvert, y0, y1, hMur, zone, bouton })` l. 258 ; `majAscenseur(ch, dt, jeu)` l. 456 ;
`transporter(jeu, dy)` l. 442. Gaine x 17,9-19,8, passage plan y 8,0-8,81 (`ASC`, l. 58) ; desservi au RDC, au 1er et au 2e
(pas au -1). Tout est écrit pour **Haythem seul** : l'appel, la présence « dedans », la cellule de la porte lisent
`jeu.user.pos` ; `transporter` décale Haythem et la caméra de `dy`, d'un coup, portes closes. Dans le graphe, la cabine
est **un cul-de-sac de 17 nœuds à chaque niveau** (plan x 17,95-19,8 ; y 7,7-9,05). À exclure de la navigation des bots
(ou à remplacer par un lien « téléporteur » au coût fixe de 1,4 + 1,3 × niveaux s, si l'on veut un jour).

### Les escaliers — rampes du monde solide (mesurées) et nœuds du graphe posés dessus

| escalier | rampe (monde : x0, z0, x1, z1) | de → à | nœuds | déclaré |
|---|---|---|---|---|
| principal, volée 1 (4 marches) | 2,42 ; -11,02 ; 4,45 ; -9,74 (axe z) | 0 → 0,70 | 24 | `carte_ecole.js` l. 619 |
| principal, palier | dalles 0,70 | | | l. 620-621 |
| principal, volée 2 (16 contremarches, vers le sud) | 0,75 ; -11,67 ; 1,98 ; -5,82 | 0,70 → 3,50 | 58 | l. 622 |
| volée de tôle (vers le -1) | 0,40 ; -10,22 ; 1,25 ; -5,88 | 0 → -3,06 | 17 | `ecole_soussol.js` l. 1014 |
| descente est, volée haute | 16,83 ; -10,65 ; 18,83 ; -9,15 (axe x) | 0 → -1,53 | 21 | `ecole_soussol_est.js` |
| descente est, volée basse | 16,83 ; -12,45 ; 18,83 ; -10,8 | -1,53 → -3,06 | 40 | idem |
| est, volées 1 et 2 | 16,15 ; -12,45 ; 18,42 ; -10,8 puis 16,15 ; -10,65 ; 18,42 ; -9,15 | 0 → 1,75 → 3,50 | 40 + 28 | `ecole_est.js` l. 798 |
| est, volées 3 et 4 | mêmes rectangles | 3,50 → 5,05 → 6,60 | 40 + 27 | idem |
| est, volées 5-7 (cage haute) | | 6,60 → 11,25 | **0** | `ecole_est.js` l. 1760 |

L'accès aux niveaux : **le -1** par la volée de tôle (derrière la porte grise « service (hall) » du hall ouest) ou par la
descente est ; **le 1er** par l'escalier principal (arrivée au couloir sombre ouest) ou par l'escalier est ; **le 2e
uniquement par l'escalier est** (puis le sas et la porte coupe-feu du 2e). L'escalier principal s'arrête au 1er.

### Ce que chaque module de niveau fait au monde solide

- `ecole_soussol.js` (1 648 l.) : dalles à 0 au-dessus de tout le -1 SAUF la trémie (`DALLES_RDC` l. 154, posées l. 1012) —
  sans elles, `solEn` ferait tomber le joueur du RDC sur la dalle du -1 —, le palier « 0 », la rampe, la dalle du -1,
  et pour la caméra seule le dessous de la dalle du RDC (l. 1019). En-tête l. 57-75 : les douze pièges d'un niveau sous le sol.
- `ecole_etage1.js` (1 147 l.) : dalles à 3,50 sous tout ce qu'on foule, sauf au-dessus des volées ; le dessous du
  plancher en boîtes caméra seule (l. 637-640). `poserEtage1(ch, renderer) → { zones, maj(dt, jeu) }`.
- `ecole_etage2.js` (1 537 l.) : idem à 6,60 (l. 75 : « des SOLS sous tout ce qu'on foule, la cage exceptée : sinon
  solEn rendrait le plancher du 1er »). `poserEtage2(ch, renderer) → { zones, maj, groupe }`.

---------------------------------------------------------------------------------------------------------------------

## 6. La scène, le Raycaster, et pourquoi tirer sur les primitives

### La scène (mesurée)

1 761 maillages (1 690 sans les 71 « suites » invisibles de la coupe par zones), 1 `InstancedMesh`, 8 `SkinnedMesh`
(Haythem) ; **707 000 triangles** (764 000 en comptant les suites) ; 1 626 géométries, 507 textures. Les maillages
« solides à l'œil » (opaques, visibles par eux-mêmes, hors Haythem) : **1 345 maillages, 650 000 triangles**. Par groupe :
« école IRIS » 596 maillages / 167 000 tri., « 1er étage » 316 / 158 000, « 2e étage » 227 / 86 000, « sous-sol »
166 / 30 000, « sous-sol est » 72 / 10 000, blocs cousus à la racine 234 / 211 000.

### Le Raycaster contre les primitives (300 paires de nœuds à moins de 25 m, yeux à 1,6 m)

| méthode | coût par rayon |
|---|---|
| `Raycaster.intersectObjects(1 345 maillages)` | **19,0 ms** |
| `Raycaster.intersectObject(scene, true)` | 19,7 ms |
| `C.rayonLibre(…, 0)` | 0,18 ms |
| DDA de la grille, sortie au premier obstacle (prototype ci-dessous) | ~0,008 ms |

Accord avec la vérité « maillages » : même niveau — 0 rayon déclaré bloqué à tort, 5 déclarés libres à tort sur 300 (4 par
le **feuillage des arbres de la rue**, qui n'a pas de forme, 1 par Haythem lui-même) ; d'un niveau à l'autre (400 paires à
moins de 8 m) — **0 libre à tort**, 1 bloqué à tort. Les dalles des étages et les plafonds tiennent : la vue ne traverse pas
les planchers.

### Mais les SOLS ne sont pas des formes

Rayons verticaux de 1,6 m au-dessus du sol à 2 m dessous, sur un nœud sur sept :

| où | arrêté au sol | traverse le sol |
|---|---|---|
| 1er | 232 / 232 | 0 |
| 2e | 136 / 139 | 2 |
| rez-de-chaussée (dedans) | 285 / 364 | **79** (là où il n'y a pas de -1 dessous) |
| -1 | 0 / 203 | **203** |
| rue | 0 | **953** |

Vers le haut : tout est arrêté par un plafond dedans, rien dans la rue. **Une balle tirée vers le sol doit donc tester
les 53 sols de `C.sols`** (dalles = plans horizontaux bornés, rampes = plans inclinés bornés) **et le plan y = 0 là où
aucun sol ne couvre le point d'impact** (la règle de `solEn`). C'est trivial et gratuit (53 tests).

### Le prototype de ligne de vue par DDA (testé : 20 000 paires, 7,9 µs contre 89 µs ; les 133 écarts sont tous des vitres)

```js
// LIGNE DE VUE A -> B (monde) : les cases de 2 m que traverse le segment, dans l'ordre ; premier obstacle = caché.
// Ignore les vitres (on voit au travers), les formes « joueur seul » (le vide du jour, le mobilier bas de la rue) et
// les formes éteintes (portes ouvertes). Le marquage `_tour` est celui de js/collisions.js (non réentrant).
const cleCase = (i, k) => (i + 32768) * 65536 + (k + 32768);
function vue(C, ax, ay, az, bx, by, bz) {
  const dx = bx - ax, dy = by - ay, dz = bz - az, tour = ++C._tour, T = 2;
  let i = Math.floor(ax / T), k = Math.floor(az / T);
  const i1 = Math.floor(bx / T), k1 = Math.floor(bz / T), si = dx > 0 ? 1 : -1, sk = dz > 0 ? 1 : -1;
  const tdx = dx ? Math.abs(T / dx) : Infinity, tdz = dz ? Math.abs(T / dz) : Infinity;
  let tmx = dx ? ((si > 0 ? (i + 1) * T : i * T) - ax) / dx : Infinity;
  let tmz = dz ? ((sk > 0 ? (k + 1) * T : k * T) - az) / dz : Infinity;
  for (let n = 0; n < 200; n++) {
    const l = C.grille.get(cleCase(i, k));
    if (l) for (const s of l) {
      if (s.tour === tour) continue; s.tour = tour;
      if (s.off || !s.camera || s.vitre) continue;
      if (C._segment(s, ax, ay, az, dx, dy, dz, 0) < 1) return false;
    }
    if (i === i1 && k === k1) break;
    if (tmx < tmz) { tmx += tdx; i += si; } else { tmz += tdz; k += sk; }
  }
  return true;
}
```

---------------------------------------------------------------------------------------------------------------------

## 7. Le graphe de navigation — méthode, prototype, mesures

### Deux méthodes essayées

**A. Centre de case** (une case libre si `libre(centre, 0,3, solEn(centre))`, liens vers les 8 voisines libres) : rapide
(0,17-0,48 s) mais **fragile aux portes étroites** : un disque de 0,3 m ne passe une baie de 0,75 m (bureau B) qu'à
±7,5 cm de son axe ; si aucun centre de case n'y tombe, la pièce disparaît. Mesuré : à 0,20 m, le 1er perdait **22 m²**
(55 m² au lieu de 77) ; à 0,25 m, le 2e en perdait 7.

**B. Représentant + balayage (retenue)** : le représentant d'une case est son centre **poussé hors des formes par
`C.resoudre`**, gardé s'il reste dans la case et s'il est `libre` ; un lien vers chaque voisine (8 directions) existe si
**`C.deplacer` y mène vraiment** (arrivée à 3 cm près) — la même physique que Haythem. Les sols suivent `solEn` depuis la
hauteur du nœud (marche 0,45) : les volées sont des rampes, un nœud peut exister à plusieurs hauteurs dans la même case
(1 943 cases ont 2 à 4 nœuds superposés). Une descente de plus de 0,6 m (un bord de palier sans garde-corps) n'est pas
un lien. Les formes `mobile` (portes automatiques, passages d'ascenseur) sont éteintes le temps de la génération, puis
rallumées.

### Mesures (graine : le départ, monde (14,9 ; 0 ; -3,7))

| pas | rayon | temps | nœuds | liens | RDC | -1 | 1er | 2e | escaliers | rue |
|---|---|---|---|---|---|---|---|---|---|---|
| 0,25 | **0,30** | **0,69 s** | **13 875** | **97 274** | 162 m² | 88 | 102 | 61 | 40 | 414 |
| 0,20 | 0,30 | 0,85 s | 20 761 | 149 100 | 149 | 87 | 97 | 57 | 38 | 403 |
| 0,33 | 0,30 | 0,51 s | 8 289 | 55 578 | 170 | 96 | 113 | 68 | 42 | 413 |
| 0,50 | 0,30 | 0,40 s | 3 866 | 24 110 | (trop grossier : 2 331 balayages ratés) | | | | | |
| 0,25 | 0,20 (petit prop) | 0,97 s | 15 866 | — | 190 | 114 | 128 | 78 | 50 | 432 |
| 0,25 | 0,25 | 0,69 s | 14 907 | — | 175 | 100 | 114 | 73 | 43 | 427 |
| 0,25 | 0,40 (gros prop) | 0,49 s | 11 014 | — | 111 | 71 | **52** | 38 | 33 | 383 |

(m² = nombre de cases × 0,0625 : une case dont le représentant est libre compte entière.)
- **Une seule composante connexe** (tout est atteignable depuis le départ, par construction) ; 6 liens asymétriques sur
  97 274 (balayages à la limite) — sans conséquence.
- **La rue fait la moitié du graphe** (6 620 nœuds) : bornée à x -3…23 et z ≤ 6 (6 m devant la façade), on tombe à
  **8 956 nœuds, 60 146 liens**.
- Taille : JSON naïf (x, z, h arrondis au cm + listes de voisins) **731 Ko** ; binaire (3 × Float32 + Int32 par lien)
  ~540 Ko ; le monde solide lui-même en JSON : **91 Ko**.
- Les aires « libres mais non atteintes » sont toutes des pièces fermées (porte `'fermee'`) ou des vides murés (sous les
  volées, derrière les mitoyens) : rien d'oublié par erreur.

### Chemins (prototypes)

- A* (tas binaire en tableaux, heuristique euclidienne avec la hauteur × 1,5) : **2,7 ms en moyenne sur 200 paires au
  hasard, 13,5 ms au pire, ~2 700 nœuds ouverts** ; rue → salle 2 du 2e : 8,1 ms, 57,5 m, 203 nœuds.
- Dijkstra complet depuis un nœud : 15 ms (utile pour une carte de distances par apparition, à précalculer).
- Le plus loin du départ : 51 m (la grande salle du -1). Le plus long trajet entre deux apparitions : 62 m (grande salle
  du -1 ↔ salle 2 du 2e), soit ~10 s au sprint de Haythem (7,2 m/s).
- **Suivi** par un bot qui marche avec `C.deplacer` + `C.solEn` à 4 m/s, 60 i/s (portes ouvertes) :
  - de nœud en nœud : **60 / 60 arrivés** ;
  - avec raccourci (« tirer la ficelle ») vérifié par un BALAYAGE `C.deplacer` jusqu'à 12 nœuds plus loin, toutes les
    0,25 s : **100 / 100 arrivés, trajets 5 % plus courts**, ~126 balayages par trajet ;
  - avec un raccourci vérifié par 8 `libre()` échantillonnés : **6 / 60 bloqués** — à ne pas faire.

### Les 46 passages d'une zone à l'autre (tirés du graphe : liens dont les deux bouts sont dans deux zones différentes)

Centre en PLAN (x, y, hauteur) et nombre de liens (≈ largeur) :
`attente|bureauB` (12,88 ; 2,5 ; 0) 2 · `attente|c01` (12,47 ; 7,78) 34 · `attente|hall` (13,25 ; 3,63) 38 · `attente|hallO`
(5,75 ; 6,62) 50 · `attente|si01` (10 ; 3,52) 8 · `c01|local` (11,5 ; 9) 8 · `c01|pmr` (11,49 ; 11,21) 10 · `c05|dc`
(5,14 ; 12,74) 14 · `c05|hallO` (5,25 ; 9) 20 · `c05|wcH` (6 ; 11) 8 · `couloirEst|descenteEst` (17 ; 9,88 ; -0,12) 18 ·
`couloirEst|hall` (15,22 ; 7,49) 8 · `couloirEst|vestEst` (15,19 ; 10,75) 10 · `couloirSS|hallSS` (2 ; 10 ; -3,06) 8 ·
`descenteEst|escEstSS` (18,75 ; 9,88 ; -1,45) 26 · `e1couloir|e1pause` (4,75 ; 5,69 ; 3,5) 10 · `e1couloir|palier1`
(1,38 ; 6,75 ; 3,05) 14 · `e1est|e1pause` (13,5 ; 8,03 ; 3,5) 18 · `e1est|escEst2` (16,03 ; 10,51 ; 3,49) 62 ·
`e1kahn|e1pause` (10,44 ; 13 ; 3,5) 4 · `e1pause|e1salle` (10,83 ; 5,01 ; 3,5) 10 · `e2couloir|e2s1` (12,45 ; 6,49 ; 6,6) 10 ·
`e2couloir|e2s2` (10,54 ; 4,49 ; 6,6) 10 · `e2couloir|e2sas` (14,62 ; 6,49 ; 6,6) 30 · `e2palier|e2sas` (14,75 ; 8 ; 6,6) 8 ·
`e2palier|escEst3` (16 ; 9,88 ; 6,6) 26 · `escEst|escEst2` (17,5 ; 9,88 ; 2,46) 26 · `escEst|vestEst` (16 ; 11,63 ; 0) 26 ·
`escEst2|escEst3` (17 ; 9,88 ; 6,02) 26 · `escEstSS|palierSSE` (17 ; 11,63 ; -2,93) 26 · `escalier|hallO` (2,96 ; 9,01 ; 0) 10 ·
`escalier|palier1` (1,36 ; 9 ; 1,98) 14 · `escalierSS|hallSS` (0,81 ; 10 ; -2,91) 8 · `escalierSS|palierSS` (0,83 ; 5,98 ;
-0,09) 4 · `hall|porche` (15,13 ; 0,75 ; 0) 38 · `hallO|palierSS` (1,5 ; 5,49 ; 0) 8 · `hallO|passage` (3,55 ; 4 ; 0) 42 ·
`hallO|wcF` (6 ; 8,5 ; 0) 8 · `hallSS|pauseSS` (2,51 ; 10,79 ; -3,06) 10 · `palierSSE|sasSS` (15,38 ; 10,75 ; -3,06) 18 ·
`passage|rue` (3,26 ; -0,5 ; 0) 44 · `passage|service` (1,5 ; 1,3 ; 0) 10 · `passageSS|pauseSS` (13,01 ; 8,74 ; -3,06) 20 ·
`passageSS|sasSS` (13,99 ; 9,74 ; -3,06) 20 · `pauseSS|salleSS` (9,76 ; 14,5 ; -3,06) 8 · `porche|rue` (14,83 ; -0,5 ; 0) 60.
C'est le **graphe de régions** tout fait pour un chemin à deux étages (zones puis grille dans la zone).

### Le prototype de génération (console, testé)

```js
// LE GRAPHE DE NAVIGATION : une case de `pas`, un nœud par case et par sol ; le représentant d'une case est son centre
// poussé hors des formes (resoudre), gardé s'il reste dans la case ; un lien vers chacune des 8 voisines si le
// déplacement du joueur (deplacer) y mène vraiment. Les formes mobiles (portes automatiques) ouvertes le temps du calcul.
function genererNav(C, { pas = 0.25, rayon = 0.3, bornes: B, graines }) {
  const mob = C.formes.filter((f) => f.mobile), avant = mob.map((f) => f.off);
  for (const f of mob) f.off = true;
  const NI = Math.ceil((B.xMax - B.xMin) / pas), NK = Math.ceil((B.zMax - B.zMin) / pas);
  const X = (i) => B.xMin + (i + 0.5) * pas, Z = (k) => B.zMin + (k + 0.5) * pas;
  const cle = (i, k, h) => (i * 4096 + k) * 64 + ((Math.round(h * 2) + 32) & 63);
  const px = [], pz = [], ph = [], ci = [], ck = [], vois = [], index = new Map(), memo = new Map(), file = [];
  const P = { x: 0, z: 0 }, Q = { x: 0, z: 0 };
  const rep = (i, k, h0) => {                      // le représentant de la case pour des pieds à h0, ou null
    const x = X(i), z = Z(k), h = C.solEn(x, z, h0);
    if (h < h0 - 0.6) return null;                 // une chute : pas de lien
    const c = cle(i, k, h);
    if (memo.has(c)) return memo.get(c);
    P.x = x; P.z = z; C.resoudre(P, rayon, null, h);
    let r = null;
    if (Math.abs(P.x - x) <= pas / 2 && Math.abs(P.z - z) <= pas / 2) {
      const h2 = C.solEn(P.x, P.z, h0);
      if (Math.abs(h2 - h) < 0.3 && C.libre(P.x, P.z, rayon, h2)) r = { x: P.x, z: P.z, h: h2, c };
    }
    memo.set(c, r);
    return r;
  };
  const ajouter = (i, k, r) => {
    let id = index.get(r.c);
    if (id !== undefined) return id;
    id = px.length; px.push(r.x); pz.push(r.z); ph.push(r.h); ci.push(i); ck.push(k); vois.push([]);
    index.set(r.c, id); file.push(id);
    return id;
  };
  const mene = (ax, az, h, bx, bz) => { Q.x = ax; Q.z = az; C.deplacer(Q, bx - ax, bz - az, rayon, null, h); return Math.hypot(Q.x - bx, Q.z - bz) < 0.03; };
  for (const [x, z, y] of graines) {
    const i = Math.floor((x - B.xMin) / pas), k = Math.floor((z - B.zMin) / pas), r = rep(i, k, y);
    if (r) ajouter(i, k, r);
  }
  const D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (let q = 0; q < file.length; q++) {
    const a = file[q];
    for (const [di, dk] of D8) {
      const i = ci[a] + di, k = ck[a] + dk;
      if (i < 0 || k < 0 || i >= NI || k >= NK) continue;
      const r = rep(i, k, ph[a]);
      if (r && mene(px[a], pz[a], ph[a], r.x, r.z)) vois[a].push(ajouter(i, k, r));
    }
  }
  mob.forEach((f, j) => (f.off = avant[j]));
  return { px, pz, ph, vois, ci, ck, index, cle, pas, B };
}
// genererNav(__game.collisions, { bornes: __game.carte.bornes, graines: [[14.9, -3.7, 0]] })
```

(Dans un Dijkstra/A*, garder les distances en `Float64Array` : en `Float32Array`, le test « déjà mieux » de la file
paresseuse se trompe par arrondi et l'exploration s'arrête à 1 700 nœuds sur 13 875 — piège rencontré.)

---------------------------------------------------------------------------------------------------------------------

## 8. Les lieux d'apparition

Pour chaque zone, le nœud le plus dégagé (le plus grand disque libre, essayé à 0,5 / 0,75 / 1 / 1,5 / 2 m), hors volées.
Coordonnées MONDE `(x, y, z)` — pour le plan, y_plan = -z.

| niveau | zone | point (monde) | dégagement | m² atteints |
|---|---|---|---|---|
| -1 | pauseSS (espace pause) | (9,38 ; -3,06 ; -9,37) | 1,0 | 49 |
| -1 | salleSS (grande salle S -1.14, devant) | (9,63 ; -3,06 ; -22,62) | 0,75 | 21 |
| -1 | sasSS (sas, est) | (15,63 ; -3,06 ; -9,62) | 1,0 | 7 |
| -1 | hallSS (pied de la volée de tôle) | (1,38 ; -3,06 ; -10,87) | 0,75 | 5 |
| RDC | hall (≈ le départ) | (14,88 ; 0 ; -3,12) | 1,5 | 23 |
| RDC | attente (salle d'attente) | (11,63 ; 0 ; -4,62) | 1,5 | 21 |
| RDC | hallO (hall ouest) | (4,63 ; 0 ; -6,87) | 1,5 | 15 |
| RDC | dc (salle David Clark) | (5,38 ; 0 ; -15,12) | 1,0 | 40 |
| RDC | passage | (3,63 ; 0 ; -3,87) | 1,0 | 11 |
| RDC | couloirEst | (15,63 ; 0 ; -9,87) | 0,75 | 8 |
| RDC | c01 | (12,38 ; 0 ; -11,37) | 0,75 | 10 |
| 1er | e1pause (espace pause orange) | (12,63 ; 3,5 ; -7,87) | 1,0 | 44 |
| 1er | e1kahn (Robert Kahn Si 1.4) | (8,13 ; 3,5 ; -22,62) | 1,0 | 28 |
| 1er | e1salle (S 1.3, l'allée) | (2,88 ; 3,5 ; -3,37) | 1,0 | 15 |
| 1er | e1est (palier est) | (15,88 ; 3,5 ; -9,87) | 0,75 | 11 |
| 2e | e2couloir (couloir rouge) | (14,63 ; 6,6 ; -5,87) | 1,0 | 18 |
| 2e | e2s1 (salle 1) | (4,63 ; 6,6 ; -7,87) | 1,0 | 18 |
| 2e | e2s2 (salle 2) | (17,13 ; 6,6 ; -2,37) | 0,75 | 13 |
| 2e | e2palier | (15,63 ; 6,6 ; -9,87) | 0,75 | 10 |
| rue | milieu de la rue | (15,63 ; 0 ; 9,38) | 2,0 | 414 |

Distances À PIED entre apparitions (Dijkstra sur le graphe, m) :

| | rue | hall | att. | hallO | dc | pauseSS | salleSS | sasSS | e1pause | e1kahn | e1salle | e2coul. | e2s1 | e2s2 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| rue | 0 | 13 | 16 | 24 | 31 | 35 | 48 | 30 | 33 | 50 | 45 | 41 | 51 | 53 |
| hall | 13 | 0 | 4 | 12 | 19 | 23 | 36 | 17 | 20 | 38 | 32 | 28 | 38 | 40 |
| attente | 16 | 4 | 0 | 8 | 15 | 25 | 36 | 19 | 22 | 40 | 34 | 30 | 40 | 42 |
| hallO | 24 | 12 | 8 | 0 | 9 | 19 | 28 | 25 | 25 | 41 | 32 | 38 | 48 | 50 |
| dc | 31 | 19 | 15 | 9 | 0 | 26 | 36 | 33 | 31 | 47 | 38 | 45 | 55 | 57 |
| pauseSS | 35 | 23 | 25 | 19 | 26 | 0 | 13 | 7 | 29 | 47 | 41 | 37 | 47 | 49 |
| salleSS | 48 | 36 | 36 | 28 | 36 | 13 | 0 | 19 | 42 | 60 | 54 | 50 | 60 | 62 |
| sasSS | 30 | 17 | 19 | 25 | 33 | 7 | 19 | 0 | 23 | 41 | 36 | 31 | 41 | 44 |
| e1pause | 33 | 20 | 22 | 25 | 31 | 29 | 42 | 23 | 0 | 19 | 13 | 17 | 27 | 29 |
| e1kahn | 50 | 38 | 40 | 41 | 47 | 47 | 60 | 41 | 19 | 0 | 31 | 35 | 45 | 47 |
| e1salle | 45 | 32 | 34 | 32 | 38 | 41 | 54 | 36 | 13 | 31 | 0 | 29 | 39 | 41 |
| e2couloir | 41 | 28 | 30 | 38 | 45 | 37 | 50 | 31 | 17 | 35 | 29 | 0 | 11 | 13 |
| e2s1 | 51 | 38 | 40 | 48 | 55 | 47 | 60 | 41 | 27 | 45 | 39 | 11 | 0 | 19 |
| e2s2 | 53 | 40 | 42 | 50 | 57 | 49 | 62 | 44 | 29 | 47 | 41 | 13 | 19 | 0 |

Vues mutuelles (yeux à 1,6 m, `rayonLibre`) : seulement rue–hall (porte 6 ouverte à ce moment), hall–attente, hall–hallO,
attente–hallO — **le RDC est un seul grand plateau ouvert** : ne pas y faire apparaître deux équipes adverses.

Conseils : FPS en équipes — A dans la rue/porche, B au 2e (e2couloir/e2s1 : 41-51 m) ou au -1 (salleSS/pauseSS : 35-48 m) ;
en mêlée générale, tirer parmi les 20 points celui qui maximise la distance à pied au plus proche ennemi et n'est vu par
aucun. Prop hunt — les props partout (ils ont 30-60 s d'avance), les chasseurs dans la rue/le porche derrière la porte 6
« verrouillée » (forme mobile rallumée, `k` gardé à 0) jusqu'au signal.

Où les PETITS props (rayon 0,2) vont et pas les chasseurs (rayon 0,3) — nœuds du graphe « prop » absents du graphe
« chasseur » : rue 18,6 m², **salleSS 10,3** (entre les rangs), **e1pause 10,1**, **pauseSS 9,9**, e1kahn 7,6, e2s1 6,9,
hall 5,5, dc 5,1, escalier 4,1, e1salle 3,8, e2palier 3,4, si01 3,1. Les gros props (0,4) perdent la moitié du 1er
(52 m² au lieu de 102) : les portes étroites les arrêtent.

---------------------------------------------------------------------------------------------------------------------

## 9. Les pièges

1. **Portes automatiques = Haythem seul.** `Portes.maj(dt, x, z, camX, camZ, y, camY)` (`ecole_portes.js` l. 580) ne
   connaît qu'un acteur et la caméra ; fermée, la baie est un mur (`forme.off = false`). Mesuré : 36 % des trajets de bots
   bloqués. La porte coupe-feu du 2e (14,75 ; 6,6 ; -7,9) est le SEUL accès au 2e.
2. **Ascenseur = Haythem seul** (`majAscenseur` l. 456 lit `jeu.user`, `transporter` l. 442 ne porte que lui) ; la cabine
   est un cul-de-sac de 17 nœuds par niveau.
3. **Portes étroites et grille** : 0,75 m (bureau B), 0,80 (Si 0.1), 0,82 (David Clark), 0,83 (local) ; avec l'échantillonnage
   au centre des cases, des pièces entières disparaissent selon le pas (22 m² du 1er à 0,20 m). D'où le représentant poussé
   + balayage.
4. **Rampes** : `solEn` suit la volée depuis la hauteur ACTUELLE (marche 0,45) ; un nœud de rampe a une hauteur continue —
   clé de nœud = (case, hauteur arrondie au demi-mètre). Sous la volée 2 passe la volée de tôle : deux nœuds par case.
5. **Le sol implicite** : `solEn` rend 0 là où aucun sol ne couvre — mais là où SEULE une dalle plus basse couvre (au-dessus
   du -1 sans `DALLES_RDC`), il rend la dalle basse : on tombe. Tout nouvel espace au-dessus du -1 ou à l'étage exige sa
   dalle (`ecole_soussol.js` en-tête, piège 1 ; `ecole_etage2.js` l. 75).
6. **Les sols ne sont pas des formes** : `rayonLibre` traverse le sol du -1, de la rue et d'une partie du RDC. Pour les
   balles, tester `C.sols` + le plan y = 0 hors de tout sol.
7. **Vitres** : 51 formes `vitre` (`camera` vraie) = des MURS pour `rayonLibre`, alors qu'on voit au travers (façade à
   allège 1,1 m, jours dépolis, cloisons vitrées). Et les portes vitrées automatiques (passage, n° 6) n'ont PAS le drapeau
   `vitre` sur leur forme : fermées, elles cachent ce qu'on voit au travers.
8. **Formes « joueur seul »** (`camera:false`) ignorées par `rayonLibre` : le « jour » de l'escalier (bien : c'est un vide)
   mais aussi les 70 meubles de la rue (bacs, jardinières, vélos) : des balles les traverseraient.
9. **Feuillage** sans forme : on « voit » au travers des arbres pour `rayonLibre` (4 écarts sur 300).
10. **« A dedans : ignorée »** (`_segment` l. 317, 337) : un rayon qui part DANS une forme l'ignore. Partir de l'œil (au
    centre du corps, toujours à 0,3 m des murs), jamais du bout du canon qui dépasse dans un mur.
11. **`_tour` non réentrant** (l. 192) : pas de requête dans le rappel d'une autre.
12. **Rangées serrées** : 24 rangs (`Player.rangs`, `player.js` l. 752-768 : S 1.3 6 rangs / 24 places, salle 2 du 2e
    4 / 8, grande salle du -1 14 / 97) ; au rayon 0,3 ils sont pleins (la grande salle du -1 se réduit à une allée et
    au devant). Haythem s'y faufile par une mécanique à part (`_entrerRang` l. 770, `_glisserRang`) ; un bot devra la
    reprendre (liens « rang » : bout ouvert → place → autre bout) ou laisser ces rangs aux props.
13. **Plafonds bas** : 1 258 nœuds sous un plafond à 2,2-2,4 m ; 25 sous 2,0-2,2 (les linteaux à 2,04-2,10) ; 4 sous 2,0
    (une boîte caméra à 1,9 m au-dessus de l'accueil, plan (17,9 ; 5,4)). Saut de Haythem `jump(v = 2.6)` = 0,34 m :
    tête à 1,95 m — une caméra subjective à 1,6-1,7 m frôle les linteaux en sautant ; borner le saut par
    `plafondEn(x, z, pieds) - 0,1`.
14. **La rue** : 414 m², la moitié des nœuds ; l'adresse `bornes` va de x -22 à 47 mais les façades arrêtent la marche
    vers x -10 et 39. Des voitures garées (boîtes, `ecole_rue_voitures.js` l. 175) font des couverts. À borner pour le jeu.
15. **Pièces fermées** (porte `'fermee'`) : la Si 2.6 du 2e (25 m²), le bureau travée 1, le local ménage, le bureau B 2.3,
    le local électrique et le sas du -1… ne sont pas dans le graphe. Pour les ouvrir, changer `etat` à la construction (et
    régénérer).
16. **Rendu** : les bots (`SkinnedMesh`) ne sont jamais cachés par le tri par zones ; les groupes d'étage sont montrés
    selon la CAMÉRA ; leurs ombres portées ne s'allument que quand Haythem est à leur niveau (lumière presque d'aplomb).
17. **Coût sur téléphone** : la génération (0,7 s sur PC) peut prendre plusieurs secondes en `?tel=1`. Et un worker de
    module ne voit pas l'importmap : `collisions.js` importe `'three'` (pour `afficherDebug` seulement) — à isoler si l'on
    veut générer dans un worker.
18. **Le service worker** (`sw.js`) et la liste de chargement (`tools/liste_chargement.py`, `assets/chargement.json`) :
    un fichier de navigation précalculé devra y être ajouté, sinon il n'est ni préchargé ni hors ligne.

---------------------------------------------------------------------------------------------------------------------

## 10. COMMENT S'Y BRANCHER POUR LE FPS ET LE PROP HUNT

### 10.1 Un module `js/jeu/monde.js` (lecture seule du monde solide)

- `genererNav(C, { pas: 0.25, rayon: 0.3, bornes, graines })` — le prototype du § 7, à la construction de la partie
  (après `construireCarte`, avant la première image : 0,7 s sous le rideau de `js/demarrage.js`) ; bornes de jeu
  `{ xMin: -3, xMax: 23, zMin: -24.5, zMax: 6 }` (8 956 nœuds). Ajouter à chaque nœud sa zone
  (`lumieres.zoneEn(x, z, h + 0.1)`) et son niveau (bandes du § 2). Exclure les nœuds de la cabine d'ascenseur (plan
  x > 17,95, y 7,7-9,05). Un second graphe à `rayon: 0.2` pour les props (facultatif).
  Mise en cache : clé = empreinte du monde (`C.formes.length`, `C.sols.length`, somme des coordonnées) → IndexedDB, ou
  fichier précalculé `assets/nav.bin` (~540 Ko, ou ~350 Ko avec la rue bornée).
- `chemin(a, b)` : A* (distances en `Float64Array`), puis « tirer la ficelle » par BALAYAGE `C.deplacer` (12 nœuds
  d'avance, toutes les 0,25 s). Pour 8-12 bots : un re-calcul par bot et par seconde, étalé sur les images ; plus tard, un
  chemin à deux étages par les 46 passages du § 7.
- `vue(ax, ay, az, bx, by, bz)` : d'abord le pré-filtre `zonesCachees(ax, ay, az) & zoneDe(bx, -bz, by)` (2 µs, jamais
  faux), puis le DDA du § 6 (8 µs) qui ignore `vitre`, `joueur:false` et `off`. Yeux à pieds + 1,6.
- `balle(ax, ay, az, dx, dy, dz, portee)` → `{ t, point, normale, forme | sol, matiere }` : le même DDA mais en gardant le
  PLUS PROCHE impact (on s'arrête quand le meilleur t est avant la sortie de la case courante), formes `camera || joueur`
  sauf un nouveau drapeau `balle: false` (à poser sur le « jour » de `carte_ecole.js` l. 628), vitres comprises (impact
  ou traversée, au choix du jeu), plus les 53 sols de `C.sols` et le plan y = 0 hors de tout sol. La normale sort de la
  face d'entrée (l'axe de la dernière tranche franchie dans `_segment`). Les corps (bots, joueurs) : des capsules à part,
  testées après, jamais dans `Collisions`.

### 10.2 Les changements dans la carte (pour l'équipe qui écrit le jeu)

1. **Portes pour tous** : `Portes.maj(dt, acteurs, cam)` avec `acteurs = [{ x, z, y }]` — une porte s'ouvre si l'un d'eux
   la veut (même test qu'aujourd'hui l. 589-594) ; `carte_ecole.js` l. 2446 passe Haythem + bots. Coût mesuré : 5 µs par
   acteur. Ou, plus simple pour un mode de jeu : `porte.forme.off = true` et vantaux ouverts à demeure, sauf la porte 6 en
   prop hunt (le « sas » des chasseurs).
2. **Ascenseur** : hors navigation des bots ; pour le joueur en FPS, le garder (ou le couper : `ouvert: false`).
3. **Vitres des portes** : `Portes._formePorte` (l. 561) pose `vitre: true` quand le modèle est `vitree`/`vitree2`.
4. **Le vide de l'escalier** (`carte_ecole.js` l. 628) : `balle: false`.
5. **Bots visibles ou non** : `bot.mesh.visible = !(zonesCachees(cam.x, cam.y, cam.z) & zoneDe(bot.x, -bot.z, bot.y + 1))`,
   et `userData.dynamique = true` pour qu'ils restent hors des photos du décor et des ombres cuites.
6. **Rangs** : pour les bots chasseurs, des liens « rang » (bout ouvert → chaque place → l'autre bout) avec la vitesse
   `VITESSE_RANG` de `player.js` ; pour les props, le graphe à 0,2 m les contient déjà.
7. **Saut et plafond** en vue subjective : borner `jumpY` par `plafondEn(x, z, pieds) - 0,1 - 1,6`.

### 10.3 Le prop hunt, côté monde

- Les déguisements : le mobilier qui a une forme et une taille de prop — les cylindres `cJC` (291 : chaises, pieds,
  poubelles) et les petites boîtes à `y1 < 1,3` — donnent la liste des objets imitables par pièce (une requête
  `C._parcourir` sur les rectangles de la zone). Le prop déguisé ne s'ajoute PAS au monde solide (pas de retrait possible) :
  une capsule à part, comme les joueurs.
- Les cachettes : nœuds du graphe « prop » absents du graphe « chasseur » (§ 8), et nœuds à faible dégagement (≤ 0,3 m)
  collés au mobilier.
- Le chasseur qui « tire sur un meuble pour voir » : `balle()` sur les primitives touche la FORME du meuble (son `id`) —
  c'est la clé pour dire « ce n'était qu'une chaise » et pénaliser.

### 10.4 Pour le multijoueur plus tard (hôte autoritaire)

Le graphe est DÉTERMINISTE (même monde solide → même graphe) : chaque client le calcule ou le charge, il ne voyage jamais.
L'état du monde à sérialiser se réduit à : pour chaque porte automatique `{ i, k, sens }` (et donc `forme.off`), l'état de
l'ascenseur `{ cab, cible, phase, k, t }`, et pour chaque acteur `{ x, z, y, vx, vz, cap }`. Les balles se tirent chez
l'hôte avec les mêmes `vue()`/`balle()` (8 µs) ; les clients ne font que l'affichage.
