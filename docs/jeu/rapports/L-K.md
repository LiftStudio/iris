# Rapport L-K — registre, déguisements, corps des props (vague 2)

Branche `lot/L-K` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-K`, depuis `socle` = `socle-ok` e06258f), port 8138 ;
23/10/2026. Section de la spec : § 5.5.8 ; contrats § 4.5.13 ; valeurs § 3.9 ; étiquettes § 5.3.

## Où j'en suis

**EN COURS** — tout le code du lot est écrit et commité, rien n'est encore joué dans le navigateur (les trois jetons sont
pris depuis 03:05 par L-D, L-G, L-V ; une boucle d'attente tourne).

- fait : `js/registre_meubles.js` (registre complet), `js/jeu/deguisements.js`, `js/jeu/corps_prop.js`, les étiquettes de 7
  fichiers de carte (`ecole_mobilier`, `ecole_pieces`, `ecole_hall`, `ecole_etage1`, `ecole_etage1_pause`, `ecole_etage2`,
  `ecole_kahn`), `js/jeu/tests/test_meubles.js` (14 points + 2 à F2) ;
- à faire, dans l'ordre : (1) charger la page, regarder le registre (types, tailles, oubliés), corriger ; (2) relevé de
  référence des 11 endroits sur `socle-ok` (archive dans le dossier de session, servie sur 8138 le temps du relevé) et le
  recopier dans `REFERENCE_ENDROITS` ; (3) `&rapport=1&lot=L-K` jusqu'au vert ; (4) jouer pour de vrai un prop hunt
  (Haythem prop, chasseur) et regarder les props ; (5) `&lot=S0` ; (6) `verifier_proprietaires.py` ; (7) rapport final.

## Fait

### Le registre (`js/registre_meubles.js`)
- `fermerRegistre(racine)` (avant chaque couture, prise du socle) : un étiqueté pris dans un bloc → noté TOUT DE SUITE ; la
  racine même de la couture (cousu seul, lot R) → sa RÉFÉRENCE, notée à la préparation ; les pièces d'un meuble posé à plat
  (`partie` commun, `cap` de la façade : les distributeurs de la niche du 1er) réunies en un meuble ; chaque maillage NON
  étiqueté croisé en chemin laisse sa signature (sommets, indices, matériau à son contenu, boîte au mm) et sa place — pas
  sous un groupe `nofuse` vu depuis la scène (les niveaux déjà cousus, relus à leur propre couture).
- La VARIANTE : la signature d'un exemplaire (chaque maillage : sommets, indices, matériau à son CONTENU — les jumeaux que
  `dedupliquerMateriaux` fondra sont un même matériau ici —, la place relative à la racine au mm par le produit des
  matrices LOCALES du chemin — sans le bruit d'un cap monde —, l'inclinaison et l'échelle de la racine) : une signature
  nouvelle sous un type déjà vu fait `type:2` (`type:variante-2` si la variante est donnée). Chaque pose garde
  l'`empreinte` (FNV-1a) de son exemplaire.
- Le PROTOTYPE : la racine clonée SANS son étiquette (`userData` passe par `JSON.stringify` au clone ; les `formes` du lot R
  sont des formes du monde solide), posée dans son repère — l'origine de la racine ramenée AU BAS du meuble, tournée de son
  seul cap ; l'inclinaison (l'extincteur du hall ouest, 7° sur son crochet) reste dans le prototype —, puis COUSU par
  matériau, ombre, ordre de rendu et attributs (une chaise coque de 22 maillages en coûterait 88 appels en haute ; cousue,
  ≤ 12). Une copie posée à (x, y0, z), tournée de `cap`, retombe sur l'original au sommet près.
- Le type T : boîte exacte (sans les transparents), taille, rayon `clamp(max(l, p)/2·0,9 ; 0,15 ; 0,5)`, bande
  `[min(0,25 ; 0,4 h) ; max(h ; 0,5)]`, volume, PV et vitesse du § 3.9, mural / sur place / famille / symétrie
  (`PROPRIETES_PAR_TYPE`, le lot R n'écrit que `{ type, nom, formes }`), voile, accroche (médiane de la hauteur au-dessus du
  sol de ses exemplaires), dos, déguisable (`DEGUISABLE_PAR_TYPE` ; plus de 1,0 m de long, 1,6 m s'il est sur place ;
  hors des tailles de référence à ± 10 % ; posé sur un meuble, accroche > 0,3 m sans être mural).
- La pose P : origine, SOL (le monde solide s'il est connu, sinon le sol du niveau), cap, boîte orientée au sol à la
  convention de `js/collisions.js`, `y0`/`y1`, zone (`lumieres.zoneEn` au-dessus de son sol), `pas` de sa rangée (médiane
  par famille et par pièce), `empreinte`.
- `rattraperRegistre` : références, étiquetés jamais cousus, poses recalées si leur racine a bougé, oubliés comparés à la
  plus grosse pièce de chaque prototype (et, pour les extincteurs, un matériau qui le dit), tailles de référence.
  `zonerRegistre(lumieres, collisions)` : zones, grille de 2 m (chaque case que touche la boîte orientée, clés
  numériques), pas, accroche, zone des oubliés. `copieMeuble(cle)`. `_bacASable(fn)` pour le test de coût.

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
`parForme` —, portes, `Player.preparerRendu` des prototypes, du voile et de la surbrillance, une fois par session) ;
`typesDeguisables` (un par TYPE) et `deguisableDans` (aucun oublié dans la zone) ; `viserMeuble` (pivot, grille, < 3 m,
ligne libre, déguisable dans la zone, coéquipiers déguisés compris) ; `deguiser` / `retirerProp` (place : disque, bande et
coins ; PV en proportion ; 'deguise' ; 'refus') ; `majProps` (racine droite à la position et au cap affichés, zones, ombre au
niveau de la caméra, voile 0,35 / 0,2 au RDC, surbrillance, tressaillement, flash rouge par matériaux clonés, mort en 0,4 s,
`partie.viseMeuble`) ; `credibilite`, `credibiliteActeur`, `pasRangee`, `distPassage`, `contreMurEn`, `enPleinCouloir` ;
`cachettes` (générateur par lots) et `couvertureDe` ; `candidatsMeubles` (refs opaques) ; `toucherPoses` (grille, `forme`).

### Le corps des props (`js/jeu/corps_prop.js`)
`CorpsProp` (inertie de `Player.move`, `C.deplacer` au rayon et dans la bande, sol, bornes, saut 1,8 m/s qui heurte un plateau,
`porter(T)`, `plaquer`), `coinsLibres`, `deplacerProp` (marche silencieuse, sprint ×1,2 à endurance −33/+15, seuil 20, saut et
'saut', cap libre à 6 rad/s, verrou aimanté < 20° à 4 rad/s sur les poses de la famille puis les axes, plaquage mural au
verrou, figé, 'frottement'), `ALLURES_PROP`.

## `__rapport`

## Mesures (relatives)

## Écarts au document

1. **Extincteurs « de L-M »** (§ 4.5.19 l. 1617 ; § 5.3 l. 2013) : l'extincteur du hall ouest n'est pas dans
   `carte_ecole.js` l. 1198-1222 (des commentaires seulement) mais dans `ecole_mobilier.js` l. 369 — étiqueté par L-K, comme
   le dit aussi § 5.3 l. 2018 ; « l'extincteur de la bande sud » (§ 5.3, `ecole_est.js` vers l. 1673) est posé par
   `poserBandeSud`, dans `js/ecole_ascenseur.js` (l. 421-430) : c'est celui « au pied de l'ascenseur », à L-M.
2. **`typesDeguisables(zone)`** (§ 4.5.13 « → [cle] ») rend UNE clé par TYPE (sa variante la plus courante) : la règle « moins
   de 6 types » compte des types (les chaises en écusson du 2e ont deux variantes).
3. **`credibilite`** : la formule de `conception_prophunt` § 9.4 recalée sur les six situations du test 7 (sinon une chaise
   tournée de 90° au bout de sa rangée vaut 0,78 > 0,5 et un distributeur au milieu d'une pièce 0,55 > 0,3) : de travers
   −0,35, entre-deux +0,05, mural dos au mur +0,2 (sans voisin), mural loin d'un mur −0,5, symétrie du type (un tabouret
   tourné n'a pas bougé) ; `opts.contreMur` absent = lu sur le monde solide (le contrat écrit `= false`).
4. **AJOUTS** (règle 3 du § 4.1) : `toucherPoses(…, tMax, forme = null)` (la forme de `balle()`, pour `parForme` :
   `Function.length` inchangé) ; `zonerRegistre(lumieres, collisions = …)` ; l'événement **`refus`** `{ a, cle, raison:
   'place' | 'type' }` (« Pas la place ») ; `partie.viseMeuble` `{ cle, nom, pose, acteur }` ; `credibiliteActeur`,
   `deguisableDans`, `pivotDe`, `couvertureDe`, `contreMurEn`, `enPleinCouloir`, `CATALOGUE`, `typeDe`, `CARTON`,
   `PASSAGES_PIECES`, `REGLAGES_DEGUISEMENT`, `ALLURES_PROP`, `coinsLibres`, `CorpsProp.porter`, `MEUBLES.stats` /
   `.collisions`, `P.empreinte` / `P.pas`, `PROPRIETES_PAR_TYPE`, `TAILLES_REFERENCE`, `_bacASable`, `oublierAffichage`.
5. **`deguiser` ne crée plus rien dans la scène** : la racine affichée naît à la première image (`majProps`) — la simulation
   ne touche pas l'affichage (§ 4.1 règle 5) ; il refuse un type qui ne se prend pas dans la zone de la partie.
6. **Prototypes cousus par matériau** (§ 4.5.13 parle d'un clone) : sans cela une copie dépasse 12 appels (test 3).
7. **Étiquette à pièces** (`partie`, `cap`) : les distributeurs de la niche du 1er sont des boîtes du repère du niveau, sans
   groupe — les envelopper aurait touché la géométrie de la carte.
8. **Tests sans le lot R** : le Tolix du test 7 est le Miura du 1er (contre un mange-debout), le baby-foot du test 8 un type
   d'essai à ses cotes (1,05 × 0,93 × 1,48, sur place), la poubelle de « sous une table » la corbeille.
9. **Le coût du registre à la construction** (test 1, « ≤ 30 ms ») est mesuré en REJOUANT le registre sur une réplique
   (`_bacASable`) : `registre_meubles.js` est un fichier « simulation » (aucune horloge permise).
10. **`cachettes`** : des lots par budget de requêtes au monde solide (pas d'horloge dans un fichier « simulation ») ; le
    générateur rend chaque lot (ses nouvelles cachettes) puis la liste complète en valeur de retour.

## Demandes

- **L-F** : `PartieProp._deguiser` remplace le corps AVANT `deguiser` — refusé, l'humain devient un `CorpsProp` sans meuble
  (son avatar caché : il disparaît) ; `deguiser` change lui-même le corps d'un humain : l'appeler directement. Écouter
  `refus` (« Pas la place »), remplir `hud.prop.discretion` par `credibiliteActeur`, l'aide « E : devenir … » par
  `partie.viseMeuble.nom`.
- **L-G** : dessiner `partie.viseMeuble` (le point de visée et l'aide) et `refus`.
- **L-M** : l'étiquette de l'extincteur de `js/ecole_ascenseur.js` (l. 421-430) — tant qu'il manque, l'extincteur n'est pas
  déguisable au 1er (zone `e1est`) ni dans toute l'école.
- **L-O** : `CerveauCacheur.typeDeLaPiece` doit choisir parmi les types `deguisableDans(T, partie.zone)` (le distributeur de
  friandises, trop long, est refusé).
- **F2** : la surbrillance est retirée à la sortie par `retirerProp` (appelé pour chaque prop par `Partie.sortir`) ; une
  partie quittée sans AUCUN prop déguisé la laisserait dans la scène — à surveiller (instantané).

## Doutes

## Reste

## Photos regardées
