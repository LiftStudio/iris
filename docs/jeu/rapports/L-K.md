# Rapport L-K — registre, déguisements, corps des props (vague 2)

Branche `lot/L-K` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-K`, depuis `socle` = `socle-ok` e06258f), port 8138 ;
23/10/2026. Section de la spec : § 5.5.8 ; contrats § 4.5.13 ; valeurs § 3.9 ; étiquettes § 5.3.

## Où j'en suis

**FINI** (23/10, 10:10) — le lot est construit, joué et vérifié ; les six points de la définition de fini tenus :

- (a) `?test=1&rapport=1&lot=L-K` : **16 / 16**, 0 signalé (qualité haute, 69 s) — commit b91237d ;
- (b) `?test=1&rapport=1&lot=S0` sur `lot/L-K` : **29 / 29** (les deux derniers passages, de suite ; voir Doutes : S0 · 8
  a échoué 4 fois sur 6, sous deux formes, et passe rejoué seul) ;
- (c) `python -I tools/verifier_proprietaires.py lot/L-K` : « OK 12 fichiers » ;
- (d) commits `L-K : …` avec la ligne `Co-Authored-By` ;
- (e) ce rapport ;
- (f) onglet fermé, serveur 8138 arrêté, jeton rendu (jeton_3, pris à 09:27:00 dans la file normale, rendu à 10:09:38 —
  la règle des 45 min n'a pas servi).

Joué pour de vrai (prop hunt au 1er, Haythem prop puis chasseur) : voir « Photos regardées ». Un successeur n'a rien à
reprendre ici ; ce qui reste est chez d'autres lots (Demandes).

## Fait

### Le registre (`js/registre_meubles.js`)
- `fermerRegistre(racine)` (première ligne de `fusionnerLocal` et `optimiserDecor`, prise du socle) : un parcours en pile
  (13 000 objets) ; un étiqueté pris dans un bloc → NOTÉ TOUT DE SUITE, mais rien de lourd : la référence de ses maillages
  (géométrie, matériau, matrice monde copiée, ombres, ordre de rendu), sa matrice de pose et sa signature ; la racine même de
  la couture (cousu seul, lot R) → sa RÉFÉRENCE, notée à la préparation ; les pièces d'un meuble posé à plat (`partie` commun,
  `cap` de la façade : les distributeurs de la niche du 1er) réunies en un meuble ; les maillages NON étiquetés triés après le
  parcours — seuls ceux d'un matériau de meuble (même matériau, puis même texture ou couleur, puis même signature au contenu)
  ou d'extincteur gardent deux sommets, leurs comptes et leur place locale ; rien sous un groupe `nofuse` vu depuis la scène.
- La VARIANTE : la signature numérique d'un exemplaire (deux FNV-1a mêlés d'entiers : chaque maillage, ses sommets, indices,
  matériau à son CONTENU — les jumeaux que `dedupliquerMateriaux` fondra sont un même matériau ici —, sa matrice relative à la
  racine au mm — la locale d'un enfant direct, le produit du chemin sinon, sans le bruit d'un cap monde —, l'inclinaison et
  l'échelle de la racine) : une signature nouvelle sous un type déjà vu fait `type:2` (`type:variante-2` si la variante est
  donnée). Chaque pose garde l'`empreinte` de son exemplaire.
- Le PROTOTYPE, ACHEVÉ À LA PRÉPARATION (`rattraperRegistre`) : les maillages de l'original, rien de cloné que leurs attributs
  utiles, ramenés dans le repère du prototype (l'origine de la racine AU BAS du meuble, tournée de son seul cap ; l'inclinaison
  — l'extincteur du hall ouest, 7° sur son crochet — reste dedans), COUSUS par matériau, ordre de rendu et attributs (une
  chaise coque de 22 maillages en coûterait 88 appels en haute ; cousue, ≤ 12) ; les variantes de couleur partagent la
  géométrie cousue (même signature géométrique). Une copie posée à (x, y0, z), tournée de `cap`, retombe sur l'original au
  sommet près. LE BUDGET D'UNE COPIE (≤ 12 appels en haute : deux par maillage, un par passe d'ombre de chaque maillage
  qui en porte, deux passes au pire) : au-delà, les plus petits maillages du prototype cessent de porter une ombre.
- Le type T : boîte exacte (sans les transparents), taille, rayon `clamp(max(l, p)/2·0,9 ; 0,15 ; 0,5)`, bande
  `[min(0,25 ; 0,4 h) ; max(h ; 0,5)]`, volume, PV et vitesse du § 3.9, mural / sur place / famille / symétrie
  (`PROPRIETES_PAR_TYPE`, le lot R n'écrit que `{ type, nom, formes }`), voile, accroche (médiane de la hauteur au-dessus du
  sol de ses exemplaires), dos, déguisable (`DEGUISABLE_PAR_TYPE` ; plus de 1,0 m de long, 1,6 m s'il est sur place ; plus de
  4 matériaux opaques — l'affranchisseuse en coûtait 25 appels — ; hors des tailles de référence à ± 10 % ; posé sur un
  meuble, accroche > 0,3 m sans être mural).
- La pose P : origine, SOL (le monde solide s'il est connu, sinon le sol du niveau), cap, boîte orientée au sol à la
  convention de `js/collisions.js`, `y0`/`y1`, zone (`lumieres.zoneEn` au-dessus de son sol), `pas` de sa rangée (médiane
  par famille et par pièce), `empreinte`.
- `rattraperRegistre` : références, étiquetés jamais cousus, prototypes achevés, poses recalées si leur racine a bougé,
  oubliés comparés à la plus grosse pièce de chaque prototype, tailles de référence. `zonerRegistre(lumieres, collisions)` :
  zones, grille de 2 m (chaque case que touche la boîte orientée, clés numériques), pas, accroche, zone des oubliés.
  `copieMeuble(cle)`. `_bacASable(fn)` pour le test de coût.

### Les étiquettes (7 fichiers de carte, une ligne par constructeur, aucune géométrie touchée, aucun import)
`ecole_mobilier.js` chaise coque (variante = couleur, `voile: false`), borne, présentoir, kakémono, extincteur du hall
ouest ; `ecole_pieces.js` chaise de bureau, plante, corbeille, chaise luge, chaise moutarde et marine de la David Clark, trois
extincteurs (couloir de service, local technique, mur sud de la David Clark) ; `ecole_hall.js` fauteuil de l'accueil (`uni` /
`zebre`), photocopieur, machine à affranchir ; `ecole_etage1_pause.js` mange-debout, Miura, chaise coque à pieds noirs
(orange, menthe, lime), chaise de hêtre de la S 1.3, les deux distributeurs de la niche (pièces réunies) ; `ecole_etage1.js`
chaise de classe, fauteuil de bureau, extincteur, plante ; `ecole_kahn.js` chaise, extincteur ; `ecole_etage2.js` extincteur,
chaise visiteur, chaise en écusson (salle 1 / salle 2). Types en minuscules à traits d'union, comme ceux du lot R
(`tabouret-miura` est le même type au 1er et au −1, deux variantes).

### Les déguisements (`js/jeu/deguisements.js`)
Catalogue et carton de secours ; `preparerCatalogue` (rattrapage, zones, formes du monde solide rattachées à leur meuble —
`parForme` —, portes, textures des prototypes envoyées à la carte ; AUCUN programme compilé : les matériaux des prototypes
sont ceux du décor) ; `typesDeguisables` (toutes les clés déguisables de la zone), `typesDistincts` (les types) et
`deguisableDans` (aucun oublié dans la zone) ; `viserMeuble` (pivot, grille, < 3 m, ligne libre, déguisable dans la zone,
coéquipiers déguisés compris) ; `deguiser` / `retirerProp` (place : disque, bande et coins ; PV en proportion ; 'deguise' ;
'refus') ; `majProps` (racine droite à la position et au cap affichés, zones, ombre au niveau de la caméra, voile 0,35 / 0,2
au RDC, surbrillance, tressaillement, flash rouge par matériaux clonés, mort en 0,4 s, `partie.viseMeuble`) ; `credibilite`,
`credibiliteActeur`, `pasRangee`, `distPassage`, `contreMurEn`, `enPleinCouloir` ; `cachettes` (générateur par lots) et
`couvertureDe` ; `candidatsMeubles` (refs opaques) ; `toucherPoses` (grille, `forme`).

### Le corps des props (`js/jeu/corps_prop.js`)
`CorpsProp` (inertie de `Player.move`, `C.deplacer` au rayon et dans la bande, sol, bornes, saut 1,8 m/s qui heurte un plateau,
`porter(T)`, `plaquer`), `coinsLibres`, `deplacerProp` (marche silencieuse, sprint ×1,2 à endurance −33/+15, seuil 20, saut et
'saut', cap libre à 6 rad/s, verrou aimanté < 20° à 4 rad/s sur les poses de la famille puis les axes, plaquage mural au
verrou, figé, 'frottement'), `ALLURES_PROP`.

### Les tests (`js/jeu/tests/test_meubles.js`)
Les 14 points de l'acceptation (1 en trois : balade, onze endroits, coût) et 2 à F2 (`apresFusion`). Un banc Node (la VRAIE
carte construite sans navigateur, contexte 2D factice, dans le dossier de session) a servi à caler ce qui ne demande pas de
rendu : registre, variantes, toucherPoses, crédibilité, 792 000 pas de corps de prop, cachettes, viser.

## `__rapport`

`window.__rapport` du 23/10 vers 09:50 (`lot=L-K`, PC, qualité haute, onglet du volet caché) : `ok: true`, `total: 16`,
`echecs: []`, `signales: []`, `ms: 69236`, `fini: true`.

| test | obtenu |
|---|---|
| 1a [optim] et balade | 122 matériaux remplacés, 835 distincts · 4198 maillages cousus en 232 blocs (sur 4466) · vue 3 0 / 0 · vue 1 0 / 0 — identique à `socle` |
| 1b onze endroits | 22 relevés identiques à `socle-ok` (haute et moyenne, appels et triangles) |
| 1c coût du registre | 15,5 ms à la construction (+ 21,8 ms à la préparation) · 238 poses, 46 types · 9737 maillages non étiquetés croisés, 780 retenus, 55 coutures |
| 2 verifierMeubles | 25 types, 238 poses hors du −1 (46 clés) · tailles justes (16 écarts justifiés) · horsTolerance [] · oubliés : l'extincteur de L-M (e1est 17,72 ; 4,12 ; −7,53) · autres [] |
| 3 catalogue | 6 ms · programmes 141 → 141 · +2 au rendu (depth, depth) · toutes les copies ≤ 12 appels (les plus chères : fauteuil de bureau 12, extincteur du hall ouest 12) |
| 4 prototypes | 46 types · boîtes à ± 1 mm · programmes de la liste |
| 5 variantes | 238 poses · plante 3, extincteur 6, chaise coque noire 3, écusson 2, fauteuil d'accueil 3, chaise coque 6, chaise de bureau 3, corbeille 3 · aucune faute |
| 6 toucherPoses | 1000 trouvées (929 la pose visée) · 0 à côté · 1,94 µs |
| 7 crédibilité | bout de rangée 0,93 · tournée de 90° 0,43 · milieu du couloir 0,15 · Miura contre une table 0,83 · distributeur contre un mur 0,75 · au milieu 0,05 |
| 8 CorpsProp | 44 types, 792 000 pas · 0 traversée, 0 dans un mur · corbeille sous la table, Miura arrêté au bord · porte de 0,60 m refusée (place) |
| 9 deguiser | coin (4,55 ; −4,9) : corbeille oui, chaise coque non (inchangé) · au large oui, PV 51 pour 50 · événements deguise, refus:place, deguise |
| 10 cachettes(e1) | 116 (9 types, 78 de crédibilité ≥ 0,6) en 22 lots, pire 3,2 ms · 0 dans une forme |
| 11 majProps | racines droites, un voile chacune · flash rouge sans programme (147 → 147) · 0 racine restée |
| 12 viserMeuble | 10 / 5 / 5 cas · tous justes |
| 13 typesDeguisables | ss 0 · e2 3 types (4 clés) · e1 9 types (12 clés) · rdc 13 types (24 clés) |
| 14 candidatsMeubles | 42 candidats dont le prop et 33 vraies chaises moutarde · mêmes champs · refs opaques · 0,023 ms |

`lot=S0` sur la branche (10:09) : `ok: true`, `total: 29`, 0 échec, 0 signalé ; S0 · 8 « géo 1578 → 1578 · tex 511 → 511 ·
enfants 307 → 307 · instantané identique · programmes 145 → 145 (60 tirs) ».

## Mesures (relatives)

- **Registre à la construction** : 15,4-15,5 ms rejoué sur la réplique (navigateur, `fermerRegistre` seul ; seuil 30) ; la
  préparation de la réplique (prototypes achevés, zones) 22-31 ms. Sur la VRAIE carte (banc Node, la machine chargée par les
  autres lots, cumul des 55 coutures) : 29-55 ms, dont `noter` 17-27 ms pour 238 meubles et le tri des non-étiquetés 12-18 ms
  (à froid : il tombe à 3-5 ms rejoué à chaud) — voir Doutes.
- **Catalogue** : `preparerCatalogue` 6-7 ms (≤ 600), 0 programme ; à la première image d'une copie, 2 programmes de profondeur.
- **Une copie** (haute, le hall) : 3 à 12 appels ; une chaise coque 8, un tabouret Miura 3 ; l'extincteur du hall ouest
  14 → 12 et la grande plante 11 → 10 par le budget d'une copie (Écart 15).
- **Requêtes** : `toucherPoses` 1,9-2,5 µs ; `candidatsMeubles` (10 m) 0,02 ms ; `cachettes(e1)` 116 en 22 lots, le pire 3,2-3,9 ms.
- **Décor** : aux onze endroits, appels et triangles identiques à `socle-ok` (22 relevés) ; `[optim]` identique.
- **En jouant** : Haythem Miura — PV 90, crédibilité 0,60 au milieu de l'espace pause, 0,83 contre le mange-debout ; 4 balles
  au milieu du tabouret : 4 touches, flash, tressaillement, éliminé (90 → 0), rétréci.

## Écarts au document

1. **Extincteurs « de L-M »** (§ 4.5.19 l. 1617 ; § 5.3 l. 2013) : l'extincteur du hall ouest n'est pas dans
   `carte_ecole.js` l. 1198-1222 (des commentaires seulement) mais dans `ecole_mobilier.js` l. 369 — étiqueté par L-K, comme
   le dit aussi § 5.3 l. 2018 ; « l'extincteur de la bande sud » (§ 5.3, `ecole_est.js` vers l. 1673) est posé par
   `poserBandeSud`, dans `js/ecole_ascenseur.js` (l. 421-430) : c'est celui « au pied de l'ascenseur », à L-M.
2. **`typesDeguisables(zone)`** (§ 4.5.13 « → [cle] ») rend TOUTES les clés déguisables de la zone (variantes comprises :
   L-F s'en sert comme d'un ensemble de clés permises) ; **AJOUT** `typesDistincts(zone)` : les types distincts, pour la
   règle « moins de 6 types → grisé » (§ 3.9 ; six couleurs de chaise coque ne font qu'un type) — c'est elle que le test 13
   compte.
3. **`credibilite`** : la formule de `conception_prophunt` § 9.4 recalée sur les six situations du test 7 (sinon une chaise
   tournée de 90° au bout de sa rangée vaut 0,78 > 0,5 et un distributeur au milieu d'une pièce 0,55 > 0,3) : de travers
   −0,35, entre-deux +0,05, mural dos au mur +0,2 (sans voisin), mural loin d'un mur −0,5, en plein couloir −0,2, symétrie du
   type (un tabouret tourné n'a pas bougé) ; `opts.contreMur` absent = lu sur le monde solide (le contrat écrit `= false`).
4. **AJOUTS** (règle 3 du § 4.1) : `toucherPoses(…, tMax, forme = null)` (la forme de `balle()`, pour `parForme` :
   `Function.length` inchangé) ; `zonerRegistre(lumieres, collisions = …)` ; l'événement **`refus`** `{ a, cle, raison:
   'place' | 'type' }` (« Pas la place ») ; `partie.viseMeuble` `{ cle, nom, pose, acteur }` ; `typesDistincts`,
   `credibiliteActeur`, `deguisableDans`, `pivotDe`, `couvertureDe`, `contreMurEn`, `enPleinCouloir`, `CATALOGUE`, `typeDe`,
   `CARTON`, `PASSAGES_PIECES`, `REGLAGES_DEGUISEMENT`, `ALLURES_PROP`, `coinsLibres`, `CorpsProp.porter`, `MEUBLES.stats` /
   `.collisions`, `P.empreinte` / `P.pas`, `PROPRIETES_PAR_TYPE`, `TAILLES_REFERENCE`, `empriseEgale`, `familleDe`,
   `CASE_GRILLE` / `cleCase`, `_bacASable`, `oublierAffichage`, `A_LA_SORTIE`.
5. **`deguiser` ne crée rien dans la scène** : la racine affichée naît à la première image (`majProps`) — la simulation
   ne touche pas l'affichage (§ 4.1 règle 5) ; il refuse un type qui ne se prend pas dans la zone de la partie.
6. **Prototypes cousus par matériau, faits des maillages de l'original** (§ 4.5.13 parle d'un clone) : sans cela une copie
   dépasse 12 appels (test 3) ; et le clone coûtait à la construction ce que le registre n'a pas le droit d'y dépenser.
7. **Registre différé** : § 4.5.13 dit « une copie de chaque meuble étiqueté » avant la couture — la couture ne garde que les
   RÉFÉRENCES des maillages et la matrice de chaque exemplaire (la couture retire les originaux de la scène et ne libère que
   leur copie sur la carte graphique, `dispose` l. 535 de `kit_decor.js` : leurs sommets restent lisibles) ; prototypes,
   boîtes et poses sont achevés au rattrapage (écran PRÉPARATION).
8. **`preparerCatalogue` ne compile rien** (§ 4.5.13 : « compile les prototypes ») : leurs matériaux sont les jumeaux de ceux
   du décor, déjà compilés ; `Player.preparerRendu` en compilait onze (les variantes du cran de repli) et
   `game._compilerTout` sept, pour une cible qui n'est pas celle du rendu. Restent deux ou trois programmes de PROFONDEUR (les
   objets mobiles non animés : ombre portée, ombre de contact), compilés à la première image d'une copie — mesuré et borné
   (test 3 : ≤ 3, tous `depth…`) ; demande à L-H.
9. **Étiquette à pièces** (`partie`, `cap`) : les distributeurs de la niche du 1er sont des boîtes du repère du niveau, sans
   groupe — les envelopper aurait touché la géométrie de la carte.
10. **Tailles de référence** (test 2) : celles du document sortent de boîtes d'extraction polluées (le mange-debout voisin du
    Miura, la table sous les chaises de hêtre et de Kahn, les plinthes sous la plante) — relevées sur la copie exacte
    (`TAILLES_REFERENCE`), comparées sans orientation (le présentoir : l et p échangés) ; chaque écart au document est
    justifié dans `JUSTIFIES`.
11. **Tests sans le lot R** : le Tolix du test 7 est le Miura du 1er (contre un mange-debout), le baby-foot du test 8 un type
    d'essai à ses cotes (1,05 × 0,93 × 1,48, sur place), la poubelle de « sous une table » la corbeille.
12. **Le coût du registre à la construction** (test 1, « ≤ 30 ms ») est mesuré en REJOUANT le registre sur une réplique
    (`_bacASable` : chaque pose recopiée avec son étiquette, autant de maillages non étiquetés que la construction en a
    croisés) : `registre_meubles.js` est un fichier « simulation » (aucune horloge permise).
13. **`cachettes`** : des lots par budget de requêtes au monde solide (pas d'horloge dans un fichier « simulation ») ; le
    générateur rend chaque lot (ses nouvelles cachettes) puis la liste complète en valeur de retour.
14. **Oubliés** : un maillage non étiqueté n'est reconnu que si son matériau (au contenu) a déjà paru sur un meuble étiqueté
    à cette couture ou à une précédente, ou s'il se dit extincteur — tout lire coûtait 17 ms de signatures de matériaux.
15. **Budget d'une copie** : « une copie ≤ 12 appels » (test 3) tenu en retirant l'ombre portée des plus petits maillages du
    prototype quand deux par maillage plus deux par ombrant dépassent 12 (la poignée de l'extincteur du hall ouest, le plus
    petit des trois ombrants de la grande plante, 0,40 m) ; l'original garde la sienne.
16. **Méthode des tests 1c et 3** : 1c chronomètre `fermerRegistre` seul (ce que paient les coutures ; le rattrapage et les
    zones, de l'écran PRÉPARATION, à part) ; 3 relève le fond juste avant chaque copie (relevé une fois, il dérivait de 3
    appels et faisait échouer des copies de 9 appels).

## Demandes

- **L-F** : `PartieProp._deguiser` (socle) remplace le corps AVANT `deguiser` — refusé, l'humain devient un `CorpsProp` sans
  meuble ; `deguiser` change lui-même le corps d'un humain : l'appeler directement. Écouter `refus` (« Pas la place »),
  remplir `hud.prop.discretion` par `credibiliteActeur`, l'aide « E : devenir … » par `partie.viseMeuble.nom`. (Lu sur
  `lot/L-F` 556d75e : son `_deguiser` rend déjà le Player sur un refus — parfait ; mais `assez = (z) =>
  typesDeguisables(z).length >= 6` compte des CLÉS : les six couleurs de la chaise coque font six « types » — prendre
  `typesDistincts(z)`.)
- **L-G** : dessiner `partie.viseMeuble` (le point de visée et l'aide) et `refus`.
- **L-H** : précompiler les 2 programmes de PROFONDEUR des objets mobiles non animés (ombre portée, ombre de contact d'une
  copie de meuble) avec la préchauffe — aujourd'hui compilés à la première image d'un prop (test L-K 3 les borne à 3).
- **L-M** : l'étiquette de l'extincteur de `js/ecole_ascenseur.js` (l. 421-430) — tant qu'il manque, il n'est pas déguisable
  et `deguisableDans` refuse l'extincteur dans la zone `e1est`.
- **L-O** : `CerveauCacheur` — vu en jouant : les props bots restent à leur point d'apparition (un Miura planté au milieu du
  passage de l'espace pause, 12,63 ; −7,87 ; un CARTON en 15,71 ; −10,05 faute de meuble à portée) ; les envoyer vers
  `cachettes(zone)` (cachettes crédibles, libres, triées) et ne choisir que des types `deguisableDans(T, partie.zone)`.
- **F2 / harnais** : `__jeu.tirer(id, { cible })` vise un prop à hauteur d'homme — 4 balles par-dessus un tabouret Miura, 0
  touche ; viser le milieu de sa boîte (`y + T.haut / 2`). Et la surbrillance : retirée à la sortie par `retirerProp` et
  `A_LA_SORTIE` (corps de prop libéré) ; une partie quittée sans AUCUN prop la laisserait dans la scène (instantané).

## Doutes

- **S0 · 8 instable** (« trois cycles … programmes constants ») : sur `lot/L-K`, 6 passages ce matin — 2 échecs « programmes
  144 → 145 » (la qualité retombée en moyenne en route), 2 échecs « géo 1578 → 1630 » (52 géométries envoyées à la carte
  pendant les cycles 3 à 5 au lieu d'avant), 2 passages verts (1630 → 1630 et 1578 → 1578) ; `socle-ok` servi sur 8138 :
  1 passage vert ; le test rejoué seul sur la branche : stable (1578 → 1578, 144 → 144). L-K n'ajoute rien à la scène hors
  du prop hunt (`majProps` n'agit que sur les props ; le mode essai ne prépare pas le catalogue) : je crois à la charge (le
  volet caché, les onglets des autres lots, la qualité automatique), sans l'avoir prouvé.
- **Le coût réel de la construction** : la réplique du test 1c (copies cousues — 4 à 12 maillages au lieu de 20 à 40 —, code
  déjà chaud) mesure 15 ms ; la vraie construction, mesurée dans Node sur la vraie carte, 29-55 ms (machine chargée, code
  froid). Le critère est tenu tel que le test l'écrit ; l'écart est là.
- **Oubliés** : un maillage non étiqueté n'est reconnu que si son matériau (au contenu) a déjà paru sur un meuble étiqueté à
  sa couture ou avant, ou s'il se dit extincteur (Écart 14).
- **Budget d'une copie** : « deux passes d'ombre au pire » est mesuré (11 puis 14 une image sur deux pour l'extincteur du hall
  ouest), pas expliqué (une ombre de lampe mise à jour par tranches, sans doute).
- La crédibilité recalée (Écart 3) tient les six situations du test et ce que j'ai vu en jouant (0,60 → 0,83 contre le
  mange-debout) ; elle reste à éprouver avec les vrais props bots de L-O.

## Reste

Rien dans le lot. Hors du lot, à la fusion (F2, `&fusion=1`) : les deux tests `apresFusion` (atteignabilité par le graphe des
props de L-D ; le −1 du lot R — types, `parForme`, aucun oubli), l'étiquette de L-M, et le −1 déguisable (aujourd'hui 0
type : le lot R n'est pas sur la branche). Pas lancé : `?tel=1` pour L-K (rien n'y dépend du téléphone : registre et requêtes
sans rendu, copies ≤ 12 appels en haute).

## Photos regardées

Dans `C:/Users/hgami/Downloads/IRIS_lots/_photos/L-K/` (captures du volet, 524 × 306) :

1. `1_presentation_pause_1er.jpg` — présentation au 1er, Haythem PROP devant l'espace pause (mange-debout, Miura, chaises
   orange) : le décor intact.
2. `2_haythem_tabouret_miura.jpg` — touche E réelle (clavier) : « PROP · le tabouret Miura », PV 90 ; la copie droite,
   posée au sol, pareille aux Miura d'à côté.
3. `3_miura_contre_le_mange_debout.jpg` — le Miura avancé contre le mange-debout, entre deux vrais : on ne le distingue pas
   (crédibilité 0,83).
4. `4_chasseur_voit_la_pause.jpg` — Haythem CHASSEUR (traque) : le Miura d'un bot au milieu du passage, à côté des vrais : indiscernable.
5. `5_miura_elimine.jpg` — 4 balles : touché, flash rouge, tressaillement, éliminé et rétréci (il a disparu de l'image).

Vu aussi : la surbrillance du meuble visé (`partie.viseMeuble` = « le tabouret Miura », pose 25), l'ombre et le voile des
copies (test 11), les props bots touchés par les chasseurs bots (carton 77, chaise de hêtre 89).
