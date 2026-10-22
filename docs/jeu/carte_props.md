# Carte des PROPS (meubles) et du RENDU d'IRIS — pour le FPS et le prop hunt

Dépôt lu : `C:/Users/hgami/Downloads/IRIS`, master a8b22dd (v2.0), three r170 (vendor/three, importmap). Rien n'a été
modifié dans le dépôt (`git status` vide à la fin). Mesures faites dans un onglet à moi (serveur `python serve.py 8322`,
fermé ensuite), prototypes jetables dans la console seulement.

Machine de mesure : Radeon 660M intégrée, ANGLE/Direct3D 11, 12 cœurs, dpr 1,4 ; volet du navigateur 1138 × 568 CSS,
soit **1593 × 795 (1,27 Mpx)** en haute à 100 %. **Attention** : pendant les mesures, trois autres instances du jeu
tournaient dans d'autres onglets (autres agents). Les **appels de dessin et les triangles sont exacts** ; les
millisecondes sont **pessimistes** (contention processeur et carte graphique), à lire comme des ordres de grandeur.

---------------------------------------------------------------------------------------------------------------------

## 0. En bref

1. **Aucun meuble n'existe plus comme objet après le chargement.** Chaque meuble est construit en petits maillages
   (`maille`, `boiteM`) dans un `THREE.Group`, puis TOUT est cousu par matériau : `optimiserDecor` (rez-de-chaussée, rue,
   pièces, est : 4 198 maillages → 232 blocs à la racine de la scène) et `fusionnerLocal` (chaque niveau). Il n'y a
   **aucun InstancedMesh** dans le décor. Les groupes des meubles restent dans la scène, vides.
2. Seule trace par meuble : les **346 sièges** `ch.sieges` (position, cap, type `nom`, `sol`), et les formes du monde
   solide (souvent grossières : une boîte par rangée de chaises).
3. **Copie autonome d'un meuble — deux voies, testées :**
   - *tout de suite, sans refonte* : **l'extraction par boîte** — reprendre dans les blocs cousus les triangles qui sont
     entièrement dans une boîte du monde, par matériau (prototype en § 3.2 : 5 à 35 ms par meuble, résultat juste pour un
     meuble isolé — chaise coque 0,63 × 0,80 × 0,60, 5 468 triangles, 3 matériaux) ; fragile contre un mur (plinthes et
     peinture ramassées) ;
   - *proprement* : **un registre des meubles** (`js/registre_meubles.js`, ~60 lignes) appelé à la fin de chaque
     constructeur, qui garde un prototype `objet.clone(true)` par type et variante AVANT la couture, plus la liste des
     poses (§ 3.3, avec les lignes exactes où se brancher).
4. **Budget** (haute, 1,27 Mpx) : 880 appels au départ, 1 080 au hall ouest, 1 710 dans la rue, 150 à 340 au -1 ;
   moyenne : 490 / 600 / 950 / 80 à 190. Le jeu est **limité par les appels de dessin** (≈ 25 à 45 µs de processeur
   chacun sous ANGLE). La haute = la moyenne + la passe de normales du GTAO (+80 % d'appels).
5. Coûts unitaires mesurés : un avatar (Haythem, 4 SkinnedMesh) = **12 appels + 63 000 triangles** en haute ; un meuble
   extrait de 3 matériaux = **12 appels en haute, 9 en moyenne** ; **300 impacts dans un InstancedMesh = +1 appel**.
6. Impacts : **quads alignés, un InstancedMesh** ; jamais `DecalGeometry` (31 ms par impact sur un bloc cousu de
   31 500 triangles) ; jamais `Raycaster` sur la scène (18 ms médian, 40 ms max par tir) — `C.rayonLibre` fait 0,18 ms.
7. **Lumières : ne JAMAIS en ajouter, en retirer ni changer leur `visible`/`castShadow` en jeu** : une PointLight ou une
   5e SpotLight ajoutée = 31 programmes recompilés **d'un bloc : 27 s d'image figée** (mesuré deux fois). Préallouer
   l'éclair du canon au chargement et ne jouer que sur `intensity`.
8. Visibilité par zones : ce qui est ajouté après le chargement n'est **jamais caché** par le tri (seulement par le
   cadrage) ; un bot derrière une dalle est dessiné. Le cacher à la main avec `zoneDe` + `zonesCachees` (exportés).

---------------------------------------------------------------------------------------------------------------------

## 1. Comment le mobilier est construit, puis cousu

### 1.1 Le chantier et les constructeurs
- `js/carte_ecole.js` `class Chantier` (L193) : `ch.decor` (le groupe « école IRIS », L198), `ch.C` (le monde solide),
  `ch.M` (matières), `ch.sieges`, `ch.lampes`, `ch.boite(x0, y0, x1, y1, h0, h1, mat, { ombre, collision, camera,
  horsAO, parent })` (L208), `ch.panneau(mat, w, h, x, y, hc, face, parent)` (L215). Coordonnées du PLAN : X = x,
  Z = -y, Y vers le haut.
- `js/ecole_portes.js` : `boiteM(w, h, d)` (L32, UV en mètres), `maille(geo, mat, x, y, z, rotY, parent, { ombre,
  recoit })` (L41), `fusionnerLocal(g)` (L65), `poserCoupe(f)` (L64).
- Les crochets, dans `construireCarte` (`js/carte_ecole.js` L1701) : `poserMobilier(ch)` L2297, `poserRdcCentre` L2299,
  `poserRue` L2300, `poserPieces` L2303, `poserEst` L2306, `poserEtage1(ch, renderer)` L2310 (qui appelle
  `poserPause1`, `poserKahn`, `poserEtage2`), `poserSousSol` L2314 (qui appelle `poserAmphi` dans `decaler(DY_P, …)`),
  `poserSousSolEst` L2317. Puis `new LumieresEcole` L2386, **`optimiserDecor(scene)` L2410**,
  `planifierOcclusionSol` L2411, `poserCoupe(null)` L2414, **`poserVisibilite(scene, ch.portes.auto)` L2415**.
- Un meuble type est un `THREE.Group` posé et tourné (`g.position.set(x, sol, -y); g.rotation.y = …;
  ch.decor.add(g)`), fait de `maille(...)` ; quelques-uns posent leurs maillages directement dans `ch.decor` (les 97
  fauteuils de la S -1.14, `js/ecole_amphi.js` L580-586). Chaque constructeur déclare aussi sa forme au monde solide
  (`C.ajouterCercle`, `C.ajouterBoite`, `C.ajouterBoiteOrientee`) et, s'il y a lieu, son siège.

### 1.2 La couture (pourquoi on ne retrouve plus un meuble)
- `js/kit_decor.js` **`optimiserDecor(scene)` (L539)** = `dedupliquerMateriaux` (L480 : deux matériaux de même
  signature deviennent le même objet) + **`fusionnerDecor` (L502)** : tous les maillages statiques qui partagent
  matériau, réglages d'ombre, attributs et `horsAOSol` deviennent UN maillage, **ajouté à la racine de la scène**
  (`scene.add(bloc)` L533), `matrixAutoUpdate = false` ; les maillages d'origine sont retirés et leur géométrie
  `dispose()` (L534). Mesuré au chargement : **122 matériaux remplacés, 835 distincts ; 4 198 maillages cousus en
  232 blocs (sur 4 466 candidats)**.
- Ce qui y échappe : `userData.nofuse` (ou un parent : `nePasFusionner(o)` L501 — les groupes des niveaux), les
  transparents (le **voile d'ombre de chaque chaise coque**, les taches d'ombre de la rue, les vitres), les matériaux à
  shader maison (`onBeforeCompile` : vent, grain, pièces de rue « teintes »), les SkinnedMesh, les maillages à plusieurs
  matériaux.
- Les NIVEAUX sont cousus à part par `fusionnerLocal` (un maillage par matériau, dans le repère du groupe) :
  `js/ecole_etage1.js` L982 (le 1er entier : pause, S 1.3, Kahn, palier), `js/ecole_etage2.js` L1492,
  `js/ecole_soussol.js` L1487 (pause du -1 + S -1.14), `js/ecole_soussol_est.js` L507 ; puis `nePasFusionner(groupe)`.
- La rue passe par l'`Atelier` (`js/ecole_rue_mobilier.js` L73) : les pièces sont cousues DÈS la construction, la
  couleur écrite **sur les sommets** (attribut `color`) de quatre matériaux de classe (`materiauClasse` L57, shader
  maison) — il n'y a jamais eu de groupe par meuble dans la rue.
- Enfin la **coupe par zones** (`js/ecole_visibilite.js` `couperParZones` L186, posée par `poserCoupe` au début de
  `construireCarte`) RÉINDEXE chaque bloc par famille de zones (`userData.coupe`) et crée à la demande des maillages
  `userData.suite` qui partagent ses sommets. Mesuré : 223 blocs rangés par famille, 1 168 maillages en 101 jeux.
- Résultat dans la scène chargée : 1 693 maillages (hors suites), **703 894 triangles** ; plus gros blocs 31 500,
  30 828, 27 968, 20 212 triangles.

### 1.3 Les sièges : la seule liste de meubles qui survit
`ch.sieges` (`game.sieges`, `carte.sieges`) : `{ x, z, y (hauteur des hanches), fx, fz (le regard), sx, sz (où l'on
se relève), nom, sol (-3,06 / 0 / 3,50 / 6,60), rang (rangées serrées) }` en coordonnées du MONDE.
**Piège** : la liste est REMPLIE PAR NIVEAU à chaque changement d'étage de Haythem (`js/ecole_etage1.js` L1044-1053) ;
la liste complète est la variable locale `tous` (L1046), inaccessible de dehors. Relevé niveau par niveau :

| Niveau | Total | Détail (`nom` : nombre) |
|---|---|---|
| -1 | 116 | le fauteuil 97 (S -1.14), la chaise 1, le tabouret 15 (Miura), le tabouret vert 3 (Tolix) |
| 0 | 64 | la chaise 45 (8 coques DAR de la salle d'attente, 35 coques moutarde de la salle David Clark, chaises visiteurs), la chaise de bureau 9 (Si 0.1), le banc 4 (2 bancs de la rue), le fauteuil 2, le fauteuil de l'accueil 1, de l'enseignant 1, du bureau 1, la chaise de l'établi 1 |
| 1 | 111 | la chaise 85 (S 1.3 au visage percé, 30 de la Kahn, 3 coques DAR de la pause), la banquette 14 (places de 2 banquettes), le tabouret 5 (Miura), le banc 2, fauteuils 2, du bureau 1, du professeur 1, la chaise du professeur 1 |
| 2 | 55 | la chaise 50 (coques de hêtre en écusson, salles 1 et 2), la chaise du couloir 3, du professeur 2 |

---------------------------------------------------------------------------------------------------------------------

## 2. Inventaire des meubles déguisables

Tailles et triangles MESURÉS par extraction (§ 3.2) sur un exemplaire ; « mat. » = nombre de matériaux = appels de
dessin par passe pour une copie.

| Type | Constructeur (fichier : ligne) | Combien | Taille l × h × p (m) | Tri. | Mat. | Remarques |
|---|---|---|---|---|---|---|
| Chaise coque DAR (piètement tour Eiffel chromé) | `ecole_mobilier.js` `chaise(ch, x, y, face, couleur)` L109 ; posées L182-184 ; coque `geoCoque()` L55 / `geoOurletCoque()` L96 (exportées) | 8 (RDC, 6 couleurs `COQUE` L33) | 0,63 × 0,80 × 0,60 | 5 468 | 3 | + un voile transparent 0,84 × 0,76 au sol (non cousu, non extrait) ; groupe de ~22 maillages avant couture |
| Chaise coque DAR à pieds noirs (pause du 1er) | `ecole_etage1_pause.js` `coque(x, y, dir, mat, sortie)` L848 ; posées L956, L966 | 3 (orange, menthe, lime) | ≈ idem | ≈ 5 500 | 2 | même coque partagée |
| Fauteuil coque moutarde S -1.14 | `ecole_amphi.js` `fauteuil(x, yb)` L580 (5 maillages directement dans `ch.decor`, **pas de groupe**) ; rangs L591-633 | 97 + 1 chaise seule (L638) | 0,51 × 0,95 × 0,51 | 86 | 3 | attaché à la poutre du rang (exclue par la boîte) |
| Tabouret Miura noir (-1) | `ecole_soussol.js` `tabouret(x, y, fx, fz, 'miura')` L1200 | 15 | 0,61 × 0,86 × 0,53 | 337 | 1 | |
| Tabouret Tolix vert (-1) | idem, `sorte = 'tolix'` | 3 | 0,59 × 0,76 × 0,57 | 380 | 2 | |
| Tabouret Miura (1er) | `ecole_etage1_pause.js` `miura(x, y, dir, sortie)` L820 ; posés L951-953 | 5 | 0,53 × 0,85 × 0,52 | 456 | 1 | |
| Mange-debout colonne (-1) | `ecole_soussol.js` `mangeDebout(x, y, 'colonne')` L1161 ; L1276 | 5 (+ 2 trépieds L1288-1289) | 0,62 × 1,06 × 0,60 | 400 | 2 | rotation pseudo-aléatoire `(x*3.7+y)%6.28` |
| Mange-debout (1er) | `ecole_etage1_pause.js` `mangeDebout(x, y)` L787 ; L950 | 4 | ≈ 0,65 × 1,10 × 0,65 | — | 2 | |
| Grande table haute en X (-1) | `ecole_soussol.js` `grandeTable` L1180 ; L1287, L1291 | 2 | Ø 0,80 × 1,06 | — | 1-2 | |
| Baby-foot | `ecole_soussol.js` `babyFoot(x, y)` L1233 ; L1294 | 1 | 1,05 × 0,93 × 1,48 | 758 | 7 | feutre texturé |
| Distributeur | `ecole_soussol.js` `distributeur(x, mat, o)` L1258 ; L1330-1332 | 3 (-1) + 2 au 1er (niche, `ecole_etage1_pause.js`) | 0,85 × 1,83 × 0,78 | 76 | 6 | façade = MeshBasicMaterial texturée ; adossé au mur sud |
| Micro-ondes / four | `ecole_soussol.js` boucle L1392 (pas de fonction) | 2 | 0,32 × 0,28 × 0,48 | 36 | 2 | sur la tablette à 1,05 |
| Poubelle carrée (grise, bleue) | `ecole_soussol.js` `poubelle(x, y, mat, c)` L1337 | 2 | 0,36 × 0,63 × 0,36 | 24 | 2 | |
| Corbeille ronde | `ecole_pieces.js` `corbeille(ch, P, x, y, mat, r, h)` L975 ; L1069, L1239, L1567, L2236 ; rue `ecole_rue_mobilier.js` `corbeille` L747 | 4 + rue | Ø 0,28 × 0,34 (à 0,30 × 0,60) | — | 2 | |
| Extincteur | `ecole_mobilier.js` groupe `ext` L369 (hall ouest) ; `ecole_etage1.js` `extincteur` L783 (L906) ; `ecole_etage2.js` `extincteur` L729 (L796, L1129) ; d'autres dans `ecole_est.js`, `ecole_kahn.js`, `ecole_ascenseur.js` | ≈ 8 | 0,21 × 0,64 × 0,23 | 848 | 4 | penché (`rotation.x = -0.12`) ; collé au mur |
| Plante en pot | `ecole_pieces.js` `plante(ch, P, x, y, o)` L955 (L1232, bureau B) ; `ecole_etage1.js` `plante` L793 (L865, L886) | 3 | 0,7 × 1,95 × 0,7 | ≈ 200 | 4 | feuilles = plans (`P.feuille`) ; extraction polluée dans l'angle (plinthes) |
| Présentoir à brochures | `ecole_mobilier.js` `presentoir(x, y, roulettes)` L237 ; L260 | 1 | 0,36 × 1,73 × 0,80 | 190 | 2 | |
| Chaise hêtre au visage percé (S 1.3) | `ecole_etage1_pause.js` `chaiseHetre` L1157 ; L1190 ; table `tableDouble` L1110 | ≈ 50 | 0,44 × 0,86 × 0,55 | 692 | 3 | rentrée sous la table : boîte à serrer |
| Chaise de la Kahn (coque hêtre sur luge) | `ecole_kahn.js` `chaise` L695 ; `poste` L772 (tour L708, écran L717, clavier L724) | 30 postes | 0,49 × 0,85 × 0,55 | 774 | 3 | coque texturée |
| Coque de hêtre en écusson (2e) | `ecole_etage2.js` `chaiseLuge` L1005 ; `table` L1032 ; `poste` L1049 ; `chaiseVisiteur` L968 | 50 + 3 | 0,42 × 0,82 × 0,48 | 654 | 3 | |
| Chaise de bureau (Si 0.1) | `ecole_pieces.js` `chaiseBureau` L874 ; écran `ecranPC` L902, `clavier` L911, `unite` L919, `table` L928 | 9 | 0,68 × 1,05 × 0,66 | 1 307 | 4 | |
| Fauteuils de l'accueil, écran, photocopieur | `ecole_hall.js` `fauteuil` L522, `ecran` L544, `copieur` L554, `affranchisseuse` L575 (groupes par `groupe()` L483) | 3 / 2 / 2 | — | — | — | |
| Radiateurs | `carte_ecole.js` `radiateur(ch, x, y, face, l, h0, h1)` L1691 ; `ecole_pieces.js` `radiateur` L941 | ≈ 10 | 0,45 × 1,25 × 0,06 | — | 2-3 | plats contre le mur : déguisement peu crédible hors d'un mur |
| Cartons | `ecole_pieces.js` couloir de service L1318-1320, étagère L1400-1412 (`P.carton`, `texCarton` L503) | ≈ 10 | 0,3-0,4 de côté | 12 | 1 | boîtes arrondies `R()` L167 |
| Banc de la rue | `ecole_rue_mobilier.js` `banc(ch, A, M, x, y, L, a, o)` L717 ; L1100, L1108 | 2 | 1,3 × 0,86 × 0,6 | ≈ 300 | 1 (+ taches) | **couleurs de sommets** |
| Bac roulant, vélo, trottinette, moto | `ecole_rue_mobilier.js` `bacRoulant` L769, `velo` L789, `trottinette` L819, `moto` L908 | 5+ / 5 / 3 / 6 | bac 0,6 × 0,98 × 0,74 | — | 1-3 | Atelier : couleurs de sommets |

(La « chaise de la S -1.14 » demandée, ce sont les 97 fauteuils + la chaise seule du meuble multimédia.)

---------------------------------------------------------------------------------------------------------------------

## 3. Obtenir une copie autonome d'un meuble

### 3.1 Ce qui ne marche pas
- Retrouver le groupe : il existe encore mais **vide** (ses maillages sont partis dans un bloc).
- Cloner un bloc : c'est le matériau de toute l'école (un bloc « mobilier noir mat » = tous les meubles noirs d'un
  niveau).
- `Raycaster` pour viser un meuble : 18 ms par rayon (§ 4.3).

### 3.2 Voie 1, sans refonte : l'extraction par boîte (prototype testé)
Reprendre, dans tous les maillages de la scène dont la boîte touche une boîte du monde, les triangles dont les trois
sommets sont dedans ; un maillage par matériau ; sommets recentrés sur le pied du meuble.

```js
// (console ; à mettre dans un module) box : THREE.Box3 du MONDE ; rend un Group autonome, pied au centre-bas de la boîte
function extraireMeuble(scene, box, { marge = 0.01, sauf = null } = {}) {
  const B = box.clone().expandByScalar(marge), bb = new THREE.Box3(), v = [0, 1, 2].map(() => new THREE.Vector3()), w = new THREE.Vector3();
  const O = new THREE.Vector3((box.min.x + box.max.x) / 2, box.min.y, (box.min.z + box.max.z) / 2), lots = new Map();
  scene.traverse((o) => {
    // (pas les suites de la coupe par zones : elles partagent les sommets des blocs — doublons ; pas ce qui bouge)
    if (!o.isMesh || o.isSkinnedMesh || o.isInstancedMesh || o.userData.suite || o.userData.dynamique || Array.isArray(o.material)) return;
    if (sauf && sauf(o.material)) return;                                  // (matériaux du bâtiment, taches transparentes)
    const g = o.geometry, pos = g.attributes.position; if (!g.boundingBox) g.computeBoundingBox();
    o.updateWorldMatrix(true, false); if (!bb.copy(g.boundingBox).applyMatrix4(o.matrixWorld).intersectsBox(B)) return;
    const I = g.index, n = (I ? I.count : pos.count) / 3, nm = new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
    const noms = ['normal', 'uv', 'uv1', 'color'].filter((k) => g.attributes[k]);      // (color : la rue, l'Atelier)
    const cle = o.material.uuid + '|' + noms; let L = lots.get(cle);
    for (let t = 0; t < n; t++) {
      const id = [0, 1, 2].map((s) => (I ? I.getX(t * 3 + s) : t * 3 + s));
      if (!id.every((i, s) => B.containsPoint(v[s].fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld)))) continue;
      if (!L) lots.set(cle, L = { mat: o.material, noms, a: Object.fromEntries(['position', ...noms].map((k) => [k, []])) });
      id.forEach((i, s) => {
        L.a.position.push(v[s].x - O.x, v[s].y - O.y, v[s].z - O.z);
        for (const k of noms) { const A = g.attributes[k];
          if (k === 'normal') { w.fromBufferAttribute(A, i).applyMatrix3(nm).normalize(); L.a.normal.push(w.x, w.y, w.z); }
          else for (let c = 0; c < A.itemSize; c++) L.a[k].push(A.getComponent(i, c)); }
      });
    }
  });
  const grp = new THREE.Group();
  for (const L of lots.values()) {
    const q = new THREE.BufferGeometry();
    for (const k in L.a) q.setAttribute(k, new THREE.Float32BufferAttribute(L.a[k], k === 'position' || k === 'normal' || k === 'color' ? 3 : 2));
    const m = new THREE.Mesh(q, L.mat); m.castShadow = m.receiveShadow = true; grp.add(m);
  }
  return grp;
}
```
Résultats (§ 2) : juste pour les meubles isolés (chaises, tabourets, mange-debout, baby-foot, distributeur,
micro-ondes, poubelles, fauteuils). Coût **5 à 35 ms** par meuble (la première ~35 ms : parcours et boîtes de toute la
scène) — ~0,5 s pour un catalogue de 20 types, à faire **sous l'écran de chargement**, une fois par TYPE (puis
`clone()`, qui partage géométrie et matériaux). Vérifié à l'œil : la chaise coque blanche, le Tolix vert, le fauteuil
moutarde reposés dans le hall sont fidèles.
**Ses pièges** :
- **contre un mur, elle ramasse le bâtiment** : la plante du bureau B rapporte « peinture blanche », « plinthe en bois
  verni », « aluminium laqué blanc » ; le bac roulant de la rue, le « bâti noir de la porte de secours ». Il faut une
  boîte serrée ET une liste de matériaux à exclure (`sauf`) ou à garder, par type ;
- les triangles à cheval sur la boîte sont perdus (la poignée de l'extincteur, la moitié d'un banc si la boîte est
  centrée sur un seul de ses deux sièges) ;
- les taches d'ombre transparentes de la rue sont ramassées (`taches d'ombre de la rue`, transparent) : les exclure ;
- **les matériaux sont ceux du décor, PARTAGÉS** (et dédupliqués) : changer la couleur d'une copie (clignoter en rouge
  quand on la touche) changerait tous les meubles de l'école → `material.clone()` d'abord ;
- la rue est en **couleurs de sommets** : sans l'attribut `color` elle sort blanche (corrigé ci-dessus) ;
- le voile d'ombre des chaises coque n'est pas ramassé (transparent, plus grand que la boîte) : en reposer un
  (`PlaneGeometry(0.84, 0.76)`, dégradé radial noir, `depthWrite: false`, comme `matVoile` `ecole_mobilier.js` L100).
- marche aussi sur les niveaux cachés (`groupe.visible = false`) : on lit la géométrie, pas l'image.

### 3.3 Voie 2, recommandée : un REGISTRE DES MEUBLES (petite refonte)
Principe : chaque constructeur, à sa fin, se déclare ; le registre garde **un prototype par (type, variante)** — un
`objet.clone(true)` pris AVANT la couture, qui partage géométries et matériaux — et **la liste des poses** (où sont les
meubles : cachettes, cibles des bots, contrôle « est-ce un vrai meuble ? »).

```js
// js/registre_meubles.js — les meubles de l'école, pour s'en déguiser (prop hunt) et les reconnaître
import * as THREE from 'three';
export const MEUBLES = { types: new Map(), poses: [] };
// À la FIN d'un constructeur (avant ch.decor.add, ou juste après : la couture vient bien plus tard, L2410)
export function noterMeuble(type, objet, { variante = '', sol = 0, rayon = null, hauteur = null, deguisable = true } = {}) {
  const cle = type + (variante ? ':' + variante : '');
  objet.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(objet), taille = bb.getSize(new THREE.Vector3());
  if (!MEUBLES.types.has(cle)) {
    const proto = objet.clone(true);                    // (géométries et matériaux PARTAGÉS : rien n'est copié)
    proto.position.set(0, 0, 0); proto.rotation.set(0, 0, 0); proto.updateMatrixWorld(true);
    MEUBLES.types.set(cle, { type, variante, proto, taille, rayon: rayon ?? Math.max(taille.x, taille.z) / 2, hauteur: hauteur ?? taille.y, deguisable });
  }
  MEUBLES.poses.push({ cle, x: objet.position.x, y: objet.position.y, z: objet.position.z, cap: objet.rotation.y, sol });
}
export function copieMeuble(cle) {
  const T = MEUBLES.types.get(cle); if (!T) return null;
  const c = T.proto.clone(true); c.userData.meuble = cle; c.userData.dynamique = true;   // (racine de la scène, voir § 6)
  return c;
}
```
- **La couture ne casse pas le prototype** : `fusionnerDecor` retire les maillages d'ORIGINE de leurs groupes et
  appelle `geometry.dispose()` (L534) — `dispose()` ne libère que les tampons de la carte graphique ; les tableaux
  restent, three les renvoie au premier dessin du clone. Les clones ont leurs propres `Mesh`, hors de la scène : ni
  cousus, ni coupés par zones.
- **Où se brancher** (une ligne chacun, à la fin du constructeur) :
  - `js/ecole_mobilier.js` : `chaise` L109 (variante = couleur ; avant `ch.decor.add(g)` L143), `presentoir` L237,
    la borne L213, le kakémono L276, l'extincteur L369 ;
  - `js/ecole_soussol.js` : `mangeDebout` L1161, `grandeTable` L1180, `tabouret` L1200 (variante = sorte), `babyFoot`
    L1233, `distributeur` L1258 (le corps est fait de `B(...)` dans `ch.decor` : l'envelopper dans un groupe),
    `poubelle` L1337, les micro-ondes L1392 (idem) ; **attention au repère `decaler(DY_P, …)` (L726, L1428)** : le
    groupe `gD` est décalé de `z = -DY_P` (2,70) — prendre la position MONDE (`getWorldPosition`) pour la pose ;
  - `js/ecole_amphi.js` `fauteuil` L580 : les 5 maillages vont directement dans `ch.decor` → les mettre dans un groupe
    (`const g = new THREE.Group(); g.position.set(x, Y_SS, -yb); ch.decor.add(g)`, maillages en local) ;
  - `js/ecole_etage1_pause.js` : `mangeDebout` L787, `miura` L820, `coque` L848, `banquette` L868, `tableDouble`
    L1110, `chaiseHetre` L1157 ; `js/ecole_etage1.js` : `chaise` L688, `extincteur` L783, `plante` L793 ;
  - `js/ecole_etage2.js` : `extincteur` L729, `chaiseVisiteur` L968, `chaiseLuge` L1005, `table` L1032, `poste` L1049 ;
  - `js/ecole_kahn.js` : `chaise` L695, `tour` L708, `ecran` L717, `poste` L772 ;
  - `js/ecole_pieces.js` et `js/ecole_hall.js` : un seul point chacun — leurs helpers **`groupe(ch, x, y, face, h)`
    (`ecole_pieces.js` L153, `ecole_hall.js` L483)** reçoivent un `type` facultatif et appellent `noterMeuble` quand le
    constructeur a fini (ou les constructeurs nommés : `chaiseBureau` L874, `plante` L955, `corbeille` L975,
    `chaiseLuge` L1255 ; `fauteuil` L522, `ecran` L544, `copieur` L554) ;
  - `js/ecole_rue_mobilier.js` : l'**Atelier** coud dès `ajouter` (L79) — y ajouter un « meuble en cours »
    (`A.debut(type)` / `A.fin()`) qui garde aussi une copie des géométries (déjà en repère monde, attribut `color`
    compris) de chaque pièce ajoutée, pour `banc` L717, `corbeille` L747, `bacRoulant` L769, `velo` L789, `trottinette`
    L819, `moto` L908.
- **Exposer la liste complète des sièges** : dans `js/ecole_etage1.js` L1046, `if (!tous) { tous = ch.sieges.slice();
  ch.siegesTous = tous; }` et le rendre par la carte (`carte.siegesTous`).
- Le registre fait aussi la **liste des cachettes** (`MEUBLES.poses` + les 346 sièges) et sert au réseau plus tard :
  un déguisement se dit `{ cle: 'tabouret:tolix' }`, l'état d'un prop `{ id, cle, x, y, z, cap, pv }` — tout est
  déterministe (le décor est construit par le code, les mêmes clés sur toutes les machines).

### 3.4 Un déguisement à UN appel de dessin
Un meuble de 3 matériaux coûte 3 appels par passe (§ 4.2). Pour les types sans image (tabourets, mange-debout,
poubelles, micro-ondes, extincteur, chaise coque) : à la création du prototype, écrire la couleur de chaque matériau sur
ses sommets (`color`) et coudre en UN maillage sous un seul `MeshStandardMaterial({ vertexColors: true, roughness:
moyenne })` (la méthode de l'Atelier de la rue) → 1 appel par passe ; les types texturés (baby-foot, distributeur, coques
de hêtre) gardent un maillage par image.

---------------------------------------------------------------------------------------------------------------------

## 4. Le budget de rendu (mesuré)

### 4.1 Par endroit
Haute, 1593 × 795 (1,27 Mpx), résolution dynamique figée à 100 % ; appels et triangles = **une image entière** (passe
principale, normales du GTAO, ombre des mobiles, ombres de contact, une face de carte d'environnement le cas échéant) ;
« GPU » = requête de temps autour de `fx.render` ; « CPU » = temps de `fx.render` côté processeur.

| Endroit (pieds) | Appels | Triangles | GPU ms | CPU ms |
|---|---|---|---|---|
| Départ, hall (14,9 ; 0 ; -3,7) | 881 | 437 k | 17,7 | 22,3 |
| Salle d'attente | 814 | 536 k | 20,0 | 21,2 |
| Hall ouest | 1 084 | 752 k | 24,6 | 29,2 |
| Rue | 1 708 | 537 k | 29,0 | 33,3 |
| Espace pause du -1 | 342 | 157 k | 13,4 | 11,8 |
| S -1.14 | 149 | 118 k | 13,1 | 6,5 |
| Espace pause du 1er | 754 | 615 k | 18,4 | 21,8 |
| S 1.3 | 473 | 393 k | 22,9 | 13,0 |
| Robert Kahn | 261 | 287 k | 15,9 | 8,1 |
| Salle 1 du 2e | 321 | 317 k | 16,7 | 10,6 |
| Salle David Clark | 174 | 354 k | 16,1 | 6,5 |

Moyenne (le préréglage que l'auto a CHOISI sur cette machine), même résolution : départ **486** appels / 252 k / 10,9 ms
GPU / 19,1 CPU ; hall ouest 597 / 407 k / 12,6 / 24,6 ; pause -1 187 / 100 k / 6,3 / 9,3 ; pause 1er 401 / 338 k / 9,8 /
15,5 ; rue 947 / 302 k / 10,4 / 36,4 ; S -1.14 80 / 80 k / 5,7 / 6,6.

`?tel=1` (profil téléphone sur ce PC : 2 spots au lieu de 4, textures moitié, l'auto démarre en moyenne) : moyenne en
1484 × 740 (1,10 Mpx) — départ 486 / 246 k, hall ouest 597 / 402 k, pause -1 186 / 100 k (6,9 ms GPU), S -1.14 79 /
80 k (6,4 ms), pause 1er 401 / 333 k, rue 947 / 296 k, salle d'attente 442 / 293 k ; basse en 1138 × 568 (0,65 Mpx) —
départ 484, hall ouest 595, pause -1 184 (4,6 ms GPU), rue 1 051. (Là où il y a beaucoup d'appels, la requête de temps
monte à 44-69 ms : la carte attend le processeur, elle ne travaille pas plus — le jeu est limité par les APPELS.)

À retenir :
- **≈ 25 à 45 µs de processeur par appel** sous ANGLE (l'en-tête de `js/ecole_visibilite.js` dit 20 à 35 µs sans
  contention). Le coût d'une image suit le nombre d'appels bien plus que les pixels ou les triangles.
- **Haute ≈ moyenne + 80 % d'appels** : la passe de normales du GTAO redessine la scène (881 contre 486 au départ).
  Pour un FPS sur puce intégrée, la moyenne (pas d'AO) est le bon socle.
- Programmes : 138-142 sur PC, 154 en `?tel=1` ; chargement (PC) : « terrain 7,0 s · joueurs 5,3 s · shaders 13,5 s ·
  image 2,9 s — menu prêt à 29,6 s ». Mémoire : 1 577 géométries / 507 textures (PC), 1 648 / 496 (`?tel=1`).
- Carte d'ombre : 3 072² douce en haute (portée 22,7 × 29,4 m, caméra fixe sur l'école), **le décor en cache**
  (`js/ombre_cache.js`, 132 maillages fixes) ; seuls les mobiles (4 maillages : Haythem) sont redessinés à chaque image.

### 4.2 Coûts unitaires mesurés (deltas sur une image)
| Ajout | Haute | Moyenne |
|---|---|---|
| Haythem (4 SkinnedMesh visibles, ≈ 16 k triangles par passe) | **+12 appels, +63 k tri** | — |
| 1 meuble extrait de 3 matériaux (chaise S 1.3, `userData.dynamique`) | **+12 appels, +2,8 k tri** | **+9 appels, +2,1 k tri** |
| 300 impacts (un InstancedMesh de quads transparents) | **+1 appel, +600 tri** | — |
| 1 boîte quelconque au -1, vue du hall (derrière la dalle) | +2 appels (dessinée pour rien) | — |
→ un maillage opaque qui porte ombre = **4 appels en haute** (principale, normales GTAO, ombre, contact) et **3 en
moyenne** ; transparent = 1 (ni normales, ni ombre, ni contact).

### 4.3 Ce qui coûte trop (mesuré)
- `THREE.Raycaster.intersectObject(scene, true)` : **18,3 ms médian, 40,6 ms max** par rayon (703 894 triangles en
  1 693 maillages, sans BVH ; il teste aussi les niveaux cachés). `ch.C.rayonLibre(...)` (la grille de 2 m du monde
  solide, 1 466 formes) : **0,175 ms** pour un rayon de 40 m.
- `DecalGeometry` : 3,2 ms sur un maillage de 192 triangles, **31,4 ms sur le bloc cousu de 31 500 triangles** (elle
  parcourt toute la géométrie cible). Un quad orienté : 0,009 ms.
- **Changer le NOMBRE de lumières** : une PointLight ajoutée → 31 programmes neufs, **27,5 s** pour l'image suivante ;
  une 5e SpotLight → **27,3 s** (204 programmes ensuite). Remettre l'ancienne configuration (déjà compilée) : 30-40 ms.
  Changer `intensity` ou la position d'une lumière existante : 0 programme, image normale.

### 4.4 Combien d'objets dynamiques
Base en jeu : 400-600 appels à l'intérieur en moyenne (950 rue), 800-1 100 en haute (1 700 rue). Sur cette puce, une
image à 60 im/s laisse ~16 ms dont la boucle de jeu ; le préréglage auto vise 45 im/s (`BUDGET_IMAGE` `js/fx.js` L453).
Proposition de budget de l'AJOUT (au-dessus du décor) :
| | PC moyenne/haute | `?tel=1` / téléphone |
|---|---|---|
| Bots (avatars) | 8 (≈ 96-110 appels en haute, ≈ 500 k tri) | 4-5 avatars allégés (`assets/tel/`) |
| Props déguisés (joueurs/bots) | 6-8, cousus en 1-2 maillages (§ 3.4) | 4 |
| Impacts | 256 (1 InstancedMesh, 1 appel) | 96 |
| Traceurs | 32 (1 InstancedMesh additif, 1 appel) | 16 |
| Douilles | 64 (1 InstancedMesh, `castShadow false`, 2 appels) | 24 |
| Éclair du canon | 1 PointLight préallouée + 1 sprite | sprite seul (pas de lumière) |
| Total ajouté visé | ≤ 150 appels | ≤ 80 appels |
Les bots hors de vue (autre niveau, pièce fermée) sont cachés à la main (§ 6) : ils ne comptent pas.

---------------------------------------------------------------------------------------------------------------------

## 5. Impacts de balles, traceurs, douilles, éclairs

### 5.1 Les impacts : des quads, un InstancedMesh, un anneau
Testé (300 impacts posés en tirant des rayons `rayonLibre` depuis la caméra) : +1 appel, rendu propre sur la pile, les
murs et le plafond.
```js
// à la construction (sous l'écran de chargement), puis Player.preparerRendu(impacts) pour compiler son programme
const N = TELEPHONE ? 96 : 256;
const mat = new THREE.MeshStandardMaterial({ map: texTrou /* canevas 64², dégradé noir → transparent */, transparent: true,
  depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, roughness: 0.9 });
const impacts = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.09, 0.09), mat, N);
impacts.count = 0; impacts.frustumCulled = false;            // (la sphère d'un InstancedMesh ne suit pas ses instances)
impacts.castShadow = impacts.receiveShadow = false; impacts.userData.dynamique = true; impacts.name = 'impacts';
scene.add(impacts);                                          // À LA RACINE (voir § 7)
// poser : point P (2 mm devant la surface), normale n
q.setFromUnitVectors(Z, n); q.multiply(rot.setFromAxisAngle(Z, Math.random() * 6.28));
m4.compose(P, q, echelle); impacts.setMatrixAt(k = (k + 1) % N, m4); impacts.count = Math.max(impacts.count, k + 1);
impacts.instanceMatrix.needsUpdate = true;
```
- Il ne casse **ni la lumière cuite** (lightMap des seuls sols, statique), **ni l'ombre cuite** (aoMap des sols ;
  l'impact est `dynamique`, exclu de la cuisson `kit_decor.js` L354 et des prises de la carte d'environnement L160),
  **ni le cache d'ombre** (`castShadow` faux), **ni la visibilité** (un seul appel, toujours dessiné).
- Transparent → hors de la passe de normales du GTAO (pas d'auréole) ; l'occlusion d'écran passe dessus.
- Pour l'effacer avec le temps : rétrécir l'instance (`echelle` → 0) plutôt qu'un attribut d'opacité (qui demanderait
  un `onBeforeCompile`).

### 5.2 Trouver le point et la NORMALE
`C.rayonLibre(ax, ay, az, bx, by, bz, r)` (`js/collisions.js` L288) rend seulement la fraction libre. Pour le tir, une
variante qui garde **la forme touchée** et en tire la normale : boîte `b` → la face d'entrée (le `slab` qui a donné
`t0`, L303-311), boîte orientée `o` → la même chose dans son repère (`s.c`, `s.s`), cercle `c` → radiale.
**Pièges du monde solide comme cible** :
- `rayonLibre` ignore les formes `camera: false` (`if (!s.camera || s.off) return;` L292) : **les vitres et les
  grillages laissent passer les balles** — un rayon de tir doit les voir (ou choisir : verre traversé + fêlure) ;
- **les SOLS ne sont pas des formes** (`C.sols` : 53 dalles et rampes à part ; `solEn(x, z, y)` L180) : un tir vers le
  bas traverse le carrelage → intersecter aussi les dalles (`C.sols`) ou marcher le long du rayon avec `solEn` ;
- les meubles ont des formes **grossières** (une boîte pour une rangée de chaises : `C.ajouterBoite(6.45, -7.79, 9.95,
  -7.12, { y1: 0.8 })` `ecole_mobilier.js` L186 ; une boîte par rang de la S -1.14 `ecole_amphi.js` L623) → un impact
  posé dessus flotte devant les chaises. Ne poser un décalque que sur les MURS et les PLAFONDS (formes hautes :
  `y1 - y0 > 1.8`, ou `joueur === false`) ; ailleurs, une gerbe d'étincelles sans décalque ;
- les vantaux des portes automatiques sont des formes `mobile` qui s'éteignent (`off`) : ne pas y coller d'impact (ou
  l'attacher au groupe du vantail, qui tourne).
- Option précise plus tard : vendre `three-mesh-bvh` (MIT) dans `vendor/` — BVH des blocs au chargement, rayons en
  ~0,05 ms, normales exactes (meubles compris).

### 5.3 Traceurs, douilles, éclair
- Traceurs : un InstancedMesh de quads étirés (ou `LineSegments`) en `AdditiveBlending`, `toneMapped: false`, couleur
  > 1 pour que le bloom (moyenne et plus ; seuil 0,92 à pente douce `fx.js` L568-572) les fasse briller. Les lignes et
  points sont exclus des normales du GTAO (`_pointsLignes`) et des prises de carte d'environnement.
- Douilles : InstancedMesh d'un petit cylindre (8 côtés), `castShadow = false`, physique maison (sol `solEn`).
- Éclair du canon : deux quads croisés additifs `toneMapped: false` (+ bloom) — et sur PC la lumière du § 5.4.
- Retours d'écran existants : **`fx.flash`** (`js/fx.js` L647, décroît de 3,5/s L2017, voile blanc `uFlash` dans
  l'étalonnage) pour un coup reçu ; **`game.addShake(amp, dur)`** (`js/game.js` L494) pour le recul.

### 5.4 Une lumière d'éclair sans tout recompiler
- **Règle d'or** : le nombre de lumières, leur `visible` et leur `castShadow` font partie de la clé de TOUS les
  programmes (`js/ecole_lumieres.js` L9-10 le dit pour les spots). Ajouter, retirer, cacher une lumière = 27 s figées
  sur cette puce. Changer `intensity`, `color`, `position`, `distance` : gratuit.
- Donc **préallouer** l'éclair AVANT la précompilation de l'écran de chargement (`js/demarrage.js` → 
  `game.prechaufferScene()` L82) : le plus propre est d'en faire un « slot » de `LumieresEcole` (`js/ecole_lumieres.js`
  constructeur L40-52 : `N_SPOTS` 4 / 2 au téléphone L29) — par ex. une `PointLight(0xffc27a, 0, 4.5, 2)`
  `castShadow = false` ajoutée sur PC seulement (au téléphone, aucune : 2 spots déjà, et chaque lumière se paie à
  chaque pixel). Allumée 50-70 ms à chaque tir. Ne PAS « emprunter » un des spots : `LumieresEcole.maj` reprend leurs
  intensités à chaque image (L96-102).
- Lumière cuite : intacte (le lightMap est une texture des sols). Ombre cuite : l'aoMap n'assombrit que l'indirect,
  l'éclair (direct) n'est pas assombri sous les meubles — sans importance pour 60 ms. Comme les spots, l'éclair n'a pas
  d'ombre : il traverse les murs dans sa portée → `distance` ≤ 4-5 m.
- Si un jour le second étage du cache d'ombre sert (feuillage au vent : `COUCHE_VENT` `js/ombre_cache.js` L41-47),
  TOUTES les lumières doivent être sur la couche 29 — sans objet dans IRIS (vent : 0), mais une lumière ajoutée après le
  tri y créerait des programmes de profondeur faux.
- Qualité auto : `setQuality` réalloue toutes les cibles (une image figée) — `js/game.js` L488 pose `fx.calme = true` à
  chaque image (« une balade : la qualité peut remonter ») : en combat, le mode FPS doit poser `fx.calme = false` pour
  bloquer les remontées (`_remonter` `js/fx.js` L1805). `precompilerRepli` (toutes les 3 s, L2057) compile les nouveaux
  venus pour le cran du dessous.

---------------------------------------------------------------------------------------------------------------------

## 6. Visibilité par zones et objets dynamiques

- `poserVisibilite` (`js/ecole_visibilite.js` L389) range dans ses lots ce qui EXISTE au chargement, et à chaque rendu
  par la caméra du jeu cache les lots des zones invisibles (`scene.onBeforeRender` L440, rendu par `onAfterRender` L467). **Ce qui est ajouté
  ensuite n'est jamais caché par ce tri** (seulement par le cadrage de three) — mesuré : une boîte au -1, vue du hall
  (derrière la dalle), coûtait +2 appels.
- Ce qui a `userData.dynamique` (soi ou un parent), un `Reflector`, un nom en `ascenseur…`, un point, une ligne, un
  sprite, un SkinnedMesh est « exclu » (`exclu` L160) : jamais caché.
- **Cacher un bot à la main** (testé, 0,00x ms) :
```js
import { zoneDe, zonesCachees, DEHORS } from './ecole_visibilite.js';
const H = zonesCachees(cam.position.x, cam.position.y, cam.position.z);   // (une fois par image ; L336)
for (const b of bots) {
  const z = zoneDe(b.pos.x, -b.pos.z, b.pos.y + 1.0);                       // (PLAN : y = -z ; h = hauteur absolue ; L115)
  b.racine.visible = z === DEHORS || (H & z) === 0;
}
```
  (prendre le milieu du corps : les bandes de hauteur des zones sont -0,22 / 3,30 / 6,45 / 9,70, L52). `__visibilite.cachees`
  existe aussi mais il est recalculé aussi par la caméra de la carte d'environnement : appeler `zonesCachees` soi-même.
  Les pièces fermées (toilettes, local, Si 0.2) ne sont « vues » qu'à moins de 8 m d'une de leurs portes (`FERMEES`, `PRES_PORTE` L327-335) :
  un bot caché aux toilettes disparaît bien quand on est loin.
- **Les ombres par niveau** : le décor d'un étage ne porte ombre que si Haythem y est (`haut` `js/ecole_etage1.js`
  L1042-1043 ; idem 2e et -1). Un bot d'un autre niveau qui porte ombre la projetterait AU TRAVERS des dalles sur le
  niveau du joueur (la lumière principale tombe presque d'aplomb, les dalles d'en haut ne portent pas) → `castShadow =
  (niveau du bot === niveau du joueur)`.
- Les groupes des niveaux s'allument selon la CAMÉRA (`groupe.visible`, `ecole_etage1.js` L1038) : un prop posé dans un
  niveau doit être à la racine de la scène, pas dans le groupe du niveau (sinon il disparaît avec lui… et il serait
  traité comme décor fixe par le cache d'ombre).
- Les miroirs (`Reflector` des toilettes et de l'accueil) redessinent la scène : bots et props y sont, au prix de leurs
  appels, quand le miroir est à l'image.

---------------------------------------------------------------------------------------------------------------------

## 7. Pièges (récapitulatif)

1. **Racine + `dynamique`** : tout ce qui bouge (bots, props déguisés, impacts, traceurs, douilles) doit être un
   ENFANT DIRECT de la scène avec `userData.dynamique = true`. Sinon : le cache d'ombre le prend pour du décor (il ne
   reconnaît un mobile que si `o.parent === this.scene && o.userData.dynamique`, `js/ombre_cache.js` L151) ; les ombres
   de contact ne le ramassent pas (`_ramasser` ne regarde que `scene.children`, `js/ombres_contact.js` L200-208) ; la
   carte d'environnement le photographie (`rendreFace` ne cache que les enfants directs dynamiques, `kit_decor.js` L160).
2. **Ajouter un objet NON dynamique qui porte ombre** change le compte des projetants (relu toutes les 0,5 s) → le
   cache d'ombre du décor est recuit (une image de plus à chaque changement).
3. **Charger un fichier par les chargeurs de three dans les 30 s qui suivent la construction** (`planifierOcclusionSol`
   accroche `THREE.DefaultLoadingManager.onLoad`, `kit_decor.js` L451-452) recuit l'ombre du sol, refait la carte
   d'environnement et le cache d'ombre (`solCuit`) : charger les armes et les bots SOUS l'écran de chargement, ou avec
   un `LoadingManager` à soi.
4. **Programmes neufs** : un matériau jamais vu (bot, arme, décalque) se compile à sa première image (de 0,1 s à
   plusieurs secondes sur ANGLE). Le faire préparer : `Player.preparerRendu(o)` (`js/game.js` L186-210 : textures,
   programmes, ombre, contact, cran de repli) ou `game._compilerTout(o, true)` (L320), sous l'écran de chargement
   (`js/demarrage.js`).
5. **Lumières** : jamais d'ajout, de retrait, de `visible` ni de `castShadow` changés en jeu (27 s) — § 5.4.
6. **Matériaux du décor partagés** : ne jamais modifier le matériau d'un meuble extrait ou cloné ; le cloner.
7. **Raycaster et DecalGeometry interdits** sur le décor cousu (§ 4.3).
8. **Sièges filtrés par niveau** : `ch.sieges` ne contient que le niveau de Haythem (§ 1.3).
9. **Repères décalés** : la pause et la S -1.14 sont construites dans `decaler(DY_P = 2,70, …)`
   (`js/ecole_soussol.js` L726, L1428 ; `js/ecole_amphi.js` L75) ; la salle d'attente dans `DY_A`/`DY_R03`
   (`ecole_mobilier.js` L20-26) : toujours lire les positions MONDE.
10. **Ombres de contact au rez-de-chaussée seulement** : leur plan est le rectangle `solContact` à y = 0 (RECT du sol) ;
    aux étages et au -1, ni Haythem ni les bots n'ont de tache de contact.
11. **La lumière d'un bot** : les 4 spots (2 au téléphone) suivent HAYTHEM (sa pièce et les voisines,
    `LumieresEcole.maj` L63-102) et la carte d'environnement est celle de SA zone : un bot dans une autre pièce n'a que
    l'hémisphère, la directionnelle et la carte de la pièce du joueur — un peu plus plat, sans gravité.
12. **Vue 1re personne** : `js/game.js` L1031 met `p.mesh.visible = false` à chaque image (on ne se voit pas, et on
    n'a plus d'ombre) ; pour cacher l'avatar d'un joueur déguisé en 3e personne, le faire par un drapeau dans Player ou
    par les couches (`layers`), pas par `visible` (réécrit par la caméra).
13. L'extraction ne voit pas les matériaux à plusieurs entrées (`Array.isArray(material)`) : il n'y en a pas dans le
    décor cousu, mais un futur modèle importé pourrait en avoir.

---------------------------------------------------------------------------------------------------------------------

## 8. COMMENT S'Y BRANCHER POUR LE FPS ET LE PROP HUNT

### 8.1 Le catalogue des déguisements (phase 1 tout de suite, phase 2 propre)
- **Phase 1 (sans toucher aux constructeurs)** : un module `js/deguisements.js` qui, à la fin de `preparerJeu`
  (`js/demarrage.js`, sous la barre), extrait une fois par TYPE avec `extraireMeuble` (§ 3.2) à partir d'un catalogue
  de boîtes de référence relevées ici (coordonnées MONDE ; Y_SS = -3,06) :
  - chaise coque blanche : x 6,44-7,16 · y 0-0,86 · z -7,815 / -7,095 (la 1re du nord, salle d'attente) ;
  - mange-debout colonne : centre (5,2 ; -3,06 ; -13,53), ± 0,33, h 1,08 ;
  - baby-foot : centre (8,0 ; -3,06 ; -8,2), ± 0,62 en x, ± 0,76 en z, h 0,96 ;
  - distributeur : x 5,245-6,105 · z -5,12 / -5,90 · h 1,85 (sur -3,06) ;
  - micro-ondes : x 2,56-2,90 · y -2,02 / -1,72 · z -9,0 / -9,5 ;
  - poubelle bleue : centre (10,24 ; -3,06 ; -11,8), ± 0,19, h 0,64 ;
  - présentoir : x 12,82-13,29 · z -5,96 / -6,84 · h 0-1,8 ;
  - extincteur du hall ouest : x 1,72-2,01 · y 0,5-1,35 · z -6,74 / -7,02 ;
  - chaises, tabourets, fauteuils : une boîte de ± 0,28 à 0,36 m autour d'un SIÈGE de ce type (`nom`), h 0,85-1,05 ;
  - avec une liste de matériaux exclus (« peinture », « plinthe », « taches d'ombre », `M.blanc`, `M.bois`…) et un
    contrôle de taille attendue (± 10 %) : si l'extraction dérive (le décor a bougé), le type est retiré du jeu au lieu
    de donner un meuble faux.
- **Phase 2** : le registre (§ 3.3) remplace le catalogue : plus de boîtes à tenir, les variantes (couleurs des coques)
  et les poses viennent d'elles-mêmes, la rue aussi.

### 8.2 Se déguiser (joueur ou bot)
```js
// prop : { id, cle, racine: Group, pv, pos, cap } — état sérialisable : { id, cle, x, y, z, cap, pv }
function deguiser(jeu, acteur, cle) {
  const T = catalogue.get(cle);                       // (registre ou phase 1)
  const racine = T.proto.clone(true);                 // (géométries/matériaux partagés ; 1-7 maillages)
  racine.userData.dynamique = true; racine.name = 'prop ' + cle;
  racine.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  jeu.scene.add(racine);                              // racine de la scène (§ 7.1) ; programmes déjà compilés (mêmes matériaux que le décor)
  acteur.prop = { cle, racine, rayon: T.rayon, hauteur: T.hauteur };   // le disque de collision du joueur prend T.rayon
  cacherAvatar(acteur, true);                         // par un drapeau (§ 7.12)
}
// à chaque image : racine.position = pieds de l'acteur ; racine.rotation.y = cap (aimanté par 90° quand il s'arrête,
// comme les vrais meubles, posés d'équerre) ; racine.visible = visibleParZones(acteur) ; castShadow = même niveau.
```
- Les matériaux étant ceux du décor, **le prop a exactement le rendu du vrai meuble** (même texture, même éclairage,
  même programme : rien à compiler) — à condition de ne jamais toucher à ses matériaux (§ 7.6) ; pour le faire rougir
  quand on le touche, poser une coque clonée le temps d'un flash.
- Un prop immobile peut être « posé » : `matrixAutoUpdate = false` après l'avoir placé.
- Ombre de contact : automatique au rez-de-chaussée (ramassé toutes les 0,5 s) ; le voile des chaises coque est à
  reposer à la main si l'on veut le même « pied » que les vraies.

### 8.3 Les cachettes et les règles
- Les cachettes d'un type : ses poses (registre) et les sièges du même `nom` (346, niveau par `sol`) ; un prop qui se
  cache près d'un meuble de son type est crédible. Les hauteurs de sièges donnent aussi les tables (le plateau est à
  0,72-0,75 devant le siège) pour poser un micro-ondes, une corbeille.
- « Tirer sur un meuble » : savoir si le point touché est un VRAI meuble (rien) ou un prop (dégâts) se fait par les
  props (disques/boîtes de leur rayon et hauteur, testés avant le décor), jamais par le maillage. En prop hunt classique,
  tirer sur le décor coûte des PV au chasseur : le rayon du monde solide suffit (§ 5.2).

### 8.4 Les effets du FPS (un module, tout préparé au chargement)
- `js/fps_effets.js` : impacts (§ 5.1), traceurs, douilles, éclair (§ 5.3-5.4) — chacun UN InstancedMesh à la racine,
  `dynamique`, créé et passé par `Player.preparerRendu` sous l'écran de chargement ; l'éclair = une lumière
  préallouée (PC) dont seule l'intensité bouge ; `fx.flash` pour les coups reçus ; `game.addShake` pour le recul.
- Rayon de tir : `C` + normales (§ 5.2) ; jamais `Raycaster`.
- Sons : `js/audio.js` (`AudioFX`, `audio.salle(0.2)` à l'intérieur) — hors de mon sujet.

### 8.5 Les bots et le budget
- Un bot avatar = 12 appels + 63 k triangles en haute ; 8 au plus sur PC, 4-5 au téléphone (avatars allégés
  `assets/tel/`, `tools/avatars_tel.py`). Racine `dynamique`, cachés par zones (§ 6), ombre seulement au niveau du
  joueur. Les animations (`js/anim.js`, clips `assets/anims/manifest.json`) et l'IA sont hors de ce rapport.
- En mode FPS sur puce intégrée, **la moyenne sans AO** est le bon socle (la haute coûte +80 % d'appels) ; envisager
  `BUDGET_IMAGE = 1000 / 60` (`js/fx.js` L453) pour que la résolution dynamique et l'auto visent 60 im/s ; `fx.calme =
  false` pendant les échanges de tirs (pas de changement de préréglage en plein combat).

### 8.6 Pour le réseau plus tard
Tout ce qui est décrit est rejouable par un état sérialisable : le décor est déterministe (construit par le code) ; un
déguisement est une `cle` de catalogue ; un prop `{ id, cle, x, y, z, cap, pv }` ; un impact `{ x, y, z, nx, ny, nz,
t }` (l'anneau se rejoue chez chacun) ; un tir `{ tireur, origine, direction, t }` résolu par l'hôte sur le monde solide
(`C`, sans rendu : l'hôte n'a pas besoin de la scène).

---------------------------------------------------------------------------------------------------------------------

## Annexe : fichiers lus
`js/carte_ecole.js` (Chantier, construireCarte), `js/kit_decor.js` (en entier), `js/ecole_mobilier.js` (en entier),
`js/ecole_visibilite.js` (en entier), `js/ecole_lumieres.js` (en entier), `js/ombre_cache.js` (1-315),
`js/ombres_contact.js` (en-tête, ramassage), `js/fx.js` (en-tête, constructeur, préréglages, mesures, render),
`js/options_rendu.js` (en-tête), `js/ecole_portes.js` (outils, fusion), `js/collisions.js` (API, rayons),
`js/ecole_soussol.js` (décalage, mobilier de la pause, couture), `js/ecole_amphi.js` (rangs, fauteuils),
`js/ecole_etage1_pause.js` (mobilier de la pause), `js/ecole_etage1.js` (couture, maj par niveau),
`js/ecole_pieces.js`, `js/ecole_hall.js`, `js/ecole_etage2.js`, `js/ecole_kahn.js`, `js/ecole_rue_mobilier.js`
(constructeurs, Atelier), `js/game.js` (boucle, précompilation, 1re personne), `js/main.js`, `README.md`.
