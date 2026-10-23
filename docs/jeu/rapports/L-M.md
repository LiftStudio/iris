# Rapport L-M — le monde en partie (vague 2)

Branche `lot/L-M` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-M`, depuis `socle` = `socle-ok`), port 8144 ; 23/10/2026.

## Relecture (23/10, relecteur sévère) — où j'en suis

EN COURS. Code relu contre §§ 3, 4.5.19, 5.3, 5.5.14 et le diff `socle...lot/L-M` ; `verifier_proprietaires` OK 7 fichiers.
Corrigé (commit `L-M relecture : …`) : `appliquer` levait jamais un verrou (état d'avant un verrou → porte restée fermée) ;
ordre des portes pilotées après un verrou ; `_dedans` dès la balade gardée ; rubalise envoyée segment par segment.
Reste : rejouer `&lot=L-M` et `&lot=S0` (PC, `?tel=1`), jouer (combat, prop hunt), photos — en attente d'un jeton du
navigateur (les trois pris à 06:55).

## Où j'en suis (constructeur)

**FINI.** Les quatre prises de la carte (§ 5.3), `js/jeu/monde_partie.js` complet (§ 4.5.19), `js/jeu/tests/test_monde.js`
(les 14 critères du § 5.5.14, plus 2 tests `apresFusion` pour F2), joués dans le navigateur intégré (jeton_2, de 05:52 à
06:31, rendu ; onglet et serveur fermés).

- `&rapport=1&lot=L-M` : **14/14 sur PC** (qualité haute, 34,7 à 54 s, 0 signalé) et **14/14 sous `?tel=1`** (émulation
  375 × 812, 67,4 s, 0 signalé).
- `&rapport=1&lot=S0` sur la branche : **29/29 sur PC** (66,7 s) et **29/29 sous `?tel=1`** (62,4 s) — balade au bit près
  avant et après les parties (0 / 0), 346 sièges, `[optim] 4198 → 232`, instantané = référence, 3 cycles.
- `python -I tools/verifier_proprietaires.py lot/L-M` → `OK 7 fichiers` (fichiers et pureté).
- Appels et triangles de la BALADE aux 11 endroits de `carte_props` § 4.1, haute et moyenne figées : **identiques** à
  ceux du socle servi à côté (`git archive socle`, port 8148, le même onglet, une page à la fois) — table plus bas.

Un repreneur n'a rien à reprendre ; ce qui reste est à F2 (plus bas).

## Ce qui est fait

**Les prises de la carte** (sans effet en balade : `pilotees` faux, `forcees` nul, `jeu.partie` nul, données lues par
personne d'autre) :
- `js/ecole_portes.js` : chaque porte (43 : 16 automatiques, 27 fixes) a un NOM STABLE (le `nom` de la carte, à défaut
  le nom du groupe ; un doublon prendrait « (2) » — il n'y en a pas) et une fiche dans `toutes` (`liste()`) : `etat`,
  `modele`, `vitree`, `double`, centre, normale, `base`, `h`, `l`, `libre`, vantaux, forme, `k`, `sens` (pour une
  automatique, la fiche EST l'objet de `auto`) ; `pilotees` (vrai : `maj` rend la main tout de suite) ; `forcer(P, k)` ;
  `instantane()` / `restaurer(i)` (k, côté, forme, angle de chaque vantail, `pilotees`) ; `vitre: true` sur la forme des
  modèles vitrés (`vitree`, `vitree2`, `bleue`) ; `ANGLE_AUTO`, `RAYON_AUTO`, `DUREE` exportés.
- `js/ecole_visibilite.js` : `forcees` (accesseur du retour de `poserVisibilite`, et de `__visibilite`) ; une pièce de
  `FERMEES` dont une porte pilotée est OUVERTE est vue de partout ; null = le chemin d'aujourd'hui.
- `js/ecole_ascenseur.js` : `majAscenseur` ne fait rien si `jeu.partie` ; `instantane(ch)`, `restaurer(ch, i)`,
  `couper(ch)` ; l'extincteur du pied de l'ascenseur étiqueté (écart 2).
- `js/carte_ecole.js` : le « jour » de l'escalier `balle: false` ; `visibilite` et `miroirAccueil` (l'`etat` de la glace,
  lu juste après `construireAccueil`) au retour de la carte.

**`MondePartie`** (`js/jeu/monde_partie.js`, 600 lignes) :
- `TABLE_PORTES_FPS` / `TABLE_PORTES_PROP` : les 43 portes de `portes.liste()` (relevé du 23/10), au combat les
  automatiques ouvertes sur les chemins et fermées sur les culs-de-sac, au prop hunt « auto » (porte 6, culs-de-sac
  fermés) ; les fixes à leur état. `regleParDefaut` (combat : ouverte si ses deux côtés sont dans la zone, sinon fermée ;
  prop hunt : auto) ; `inconnues`, `ecarts`. Une porte de la frontière de la zone est fermée (écart 6).
- `TABLE_DEPOLIS` : 14 entrées relevées une à une (3 jours de la Si 0.1, jour du bureau B, porte bleue et imposte de la
  David Clark, 3 jours de la S 1.3, portes des salles 1 et 2 du 2e, fixe, imposte et porte de la S −1.14) ; `depoli` posé à
  l'entrée, retiré à la sortie.
- LES BARRIÈRES : tirées des 46 passages de `carte_monde` § 7. Pour chacun : la limite des deux pièces (les rectangles de
  pièces sont alignés : la bascule de `a` à `b` le long de chaque axe, lue au SOL de chaque point — une volée change de
  pièce par sa hauteur), puis le passage libre le long d'elle (disque de 4 cm, pas de 3 cm) ; un passage par une PORTE
  prend la baie de la porte (écart 11). Une boîte orientée de 10 cm, du sol − 0,35 au sol + 1,95, `camera: false, balle:
  false, limite: 'a|b'` ; rangée pour les passages frontières de la zone (une pièce dedans, l'autre dehors ; et ceux que
  `ZONES_JEU` nomme). Les 46 sont trouvés (`ok`).
- LA RUBALISE : deux rubans rouge et blanc (0,92 et 1,18 m), en segments de 50 cm d'un bout libre à l'autre, une flèche de
  3 cm, un vrillage lent ; un `InstancedMesh` (1 024 segments au plus, un appel), `dynamique`, enfant direct de la scène
  pendant la partie seulement ; seulement sur les passages frontières qu'une porte fermée ne clôt pas déjà. Compilé à
  chaque préparation (écart 9).
- LES VANTAUX SOLIDES : 13 boîtes (une par vantail des portes automatiques, à `ANGLE_AUTO`, du côté libre ou de la face,
  le calcul de `ecole_portes.js` l. 546-548), `{ vantail: true, porte: nom }`, rangées pour les portes 'ouverte' du combat.
- `entrer` / `sortir` : l'école telle qu'en balade gardée (portes, ascenseur, glace, bornes, `forcees`) puis rendue AU BIT
  PRÈS ; les formes de partie rangées puis retirées (écart 1).
- `majPortes` (étape 5 du pas) : les portes 'auto' s'ouvrent pour n'importe quel acteur vivant à < 2,1 m à son niveau,
  côté opposé au sien (ou `libre`), se referment 1,6 fois plus lentement ; événement `'porte'` (écart 12). `verrouiller`,
  `etat` / `appliquer` (`{ i, k, sens }`, `v` si verrouillée). `image` : les vantaux posés d'après `k` (la simulation ne
  touche que `k`, `sens`, la forme), la rubalise au vent, les vantaux des paliers de l'ascenseur suivent leur étage.
- `noeudsAutorises` : les pièces ATTEIGNABLES de la zone (depuis les pièces de ses départs, par les passages dont les deux
  pièces sont dedans et dont la porte n'est pas fermée), un nœud hors de toute pièce suivant ses voisins ; zone inconnue
  (prop hunt avant le calcul de sa zone) : tout.
- `avecVantaux(fn)` (pour la génération du graphe), `cotesPorte`, `PASSAGES_PIECES`, `piecesPermises`, `frontieresDe`,
  `regleDe` (ajouts).

## Le `__rapport` (PC, `http://127.0.0.1:8144/?test=1&rapport=1&lot=L-M`, commit b10d669)

`ok: true`, `total: 14`, `echecs: []`, `signales: []`, qualité high. Sous `?tel=1` : `ok: true`, 14/14, 0 signalé.

| # | Critère | Mesure |
|---|---|---|
| 1 | une règle par porte, entrée en combat, porte fictive | 43 portes (16 automatiques), 43 noms · sans règle : 0 / 0 · k et `off` = la règle pour chacune · 0 inconnue · fictive : ouverte (combat), auto (prop hunt), dans `inconnues` · défaut ouverte / auto / fermée (hors zone) |
| 2 | sortie au bit près, chaque zone et mode | combat : ecole, rdc_rue, ss, etages · prop : ss, e2, e1, rdc, ecole_int — instantané ET empreinte du monde (chaque forme, la grille, chaque porte et ses vantaux, `pilotees`, `forcees`, l'ascenseur entier, la glace, les bornes, la rubalise, les enfants) identiques ; instantané = la référence de `a8b22dd` |
| 3 | ascenseur | 120 s, 4 bots devant et dedans, Haythem dedans : 0 transport, cabine immobile portes closes, passages allumés · après : appel, montée, descente vrais |
| 4 | barrières | ss 2 frontières, e2 1, e1 2, rdc 11, rdc_rue 9, etages 2 · 200 trajets par zone (au sprint, sauts, rayons 0,3 et 0,2, huit à la fois) : 0 dehors, 0 barrière franchie · caméra et balles : 14/14 inchangées par la barrière |
| 5 | rubalise | 1 appel (355 / 354, deux rendus de la même image) · programmes 144 → 144 de la fin de la préparation à 10 images après l'entrée |
| 6 | prop hunt | la porte de la Si 0.1 s'ouvre pour Haythem (prop), un mannequin, un bot (k 0 → 1, forme éteinte) et se referme ; ni un mort, ni un vivant au 1er au-dessus · `etat` = `appliquer` · même graine → même empreinte (9b614208), 8 relevés de portes à mi-course |
| 7 | visibilité | 6 poses (2,8 à 11,8 m) par la porte ouverte de la David Clark : 0,00 % de pixels changés avec / sans le tri · appels en partie − balade : 0, 0, 0, 0, 0, +40 · témoin sans `forcees` : 440 appels au lieu de 480 (la salle coupée, un trou à l'image) |
| 8 | jeuCarte | suivi au 1er : la carte vivante dans « e1pause » ; Haythem : « hall » |
| 9 | nœuds permis | graphe d'essai de 5 073 nœuds (tous les 50 cm de chaque pièce, à son sol) : 0 dans une pièce fermée (toilettes, local, PMR, service), 0 hors de la zone, chaque départ servi · ecole 39 pièces, rdc_rue 13, ss 9, etages 15, e2 5, e1 6, rdc 11, ecole_int 37 |
| 10 | rue, « jour », vitrées | `BORNES_JEU` pour Haythem et les bots (rdc_rue), rendues ; inchangées au −1 · le jour : `balle === false` · 7 portes vitrées `vitre === true`, aucune autre |
| 11 | balade, sièges | vue 3 et vue 1 : 0 / 0 (après toutes ces parties) · 346 / 346 |
| 12 | vantaux solides | 13 boîtes · 20/20 balles arrêtées sur le vantail (tirs que rien d'autre n'arrête) · 0/20 traversée · hors partie : 0 forme de partie, instantané = référence |
| 13 | dépolis | 14 entrées, 14 trouvées · `depoli` sur elles seules en partie · 0 hors partie |
| 14 | glace de l'accueil | `coupe` false → true → false · 60 images à 30 cm de pas face à elle : 20 rendus en balade, 0 en partie |

### Appels / triangles de la balade (haute, puis moyenne ; image entière, Haythem posé, caméra posée 45 images)

| Endroit | haute `lot/L-M` = `socle` | moyenne |
|---|---|---|
| départ | 802 / 388 k | 438 / 217 k |
| salle d'attente | 709 / 477 k | 384 / 261 k |
| hall ouest | 629 / 526 k | 331 / 284 k |
| rue | 1 736 / 563 k | 957 / 305 k |
| pause du −1 | 337 / 137 k | 180 / 80 k |
| S −1.14 | 121 / 97 k | 59 / 59 k |
| pause du 1er | 570 / 404 k | 293 / 222 k |
| S 1.3 | 564 / 462 k | 291 / 251 k |
| Robert Kahn | 194 / 198 k | 92 / 110 k |
| salle 1 du 2e | 186 / 245 k | 92 / 143 k |
| David Clark | 251 / 384 k | 124 / 208 k |

(Une première passe donnait 405 et 298 à la David Clark et au −1 sur la branche : la carte d'environnement d'une pièce se
prend une face par image ; refaites deux fois de suite sur les deux arbres, mêmes chiffres partout.)

### Mesures (relatives : d'autres agents tournaient)

- `preparerSession` (une fois par session : les 46 limites, 43 portes, 13 vantaux, 14 dépolis, la rubalise) : la première
  partie de la session (rdc, prop hunt) entre en 275 à 426 ms, préparation comprise (l'entrée en essai d'une partie
  suivante : 61 ms, S0 point 7).
- `majPortes` : 11 portes pilotées au plus × les acteurs, quelques µs par pas.

## Écarts au document

1. **Formes de partie hors du monde solide hors partie** (§ 4.5.19 `preparerSession` : « off = true ») : une barrière ou
   une boîte de vantail ÉTEINTE mais gardée dans `C.formes` changerait pour toujours `instantane().formesOff` (comparé à la
   référence de `a8b22dd` : S0 points 7-8, L-M points 2 et 12, § 6.1) et l'empreinte du graphe. Elles sont faites une fois
   (`C.ajouterBoite*` puis retirées), RANGÉES à `entrer` (`Collisions._ranger`) et RETIRÉES à `sortir` (liste et grille
   rendues telles quelles, cases neuves supprimées). Pour la génération du graphe (L-D : « boîtes des vantaux ouverts
   ALLUMÉES pendant la génération ») : `game.mondePartie.avecVantaux(fn)` (DEMANDE 1).
2. **L'extincteur du hall ouest** (§§ 4.5.19, 5.3 : `carte_ecole.js` l. 1198-1222) : ces lignes ne font que le citer ; il
   est construit par `js/ecole_mobilier.js` l. 368-387 (L-K : « extincteur l. 369 (mural) »). Rien à étiqueter dans
   `carte_ecole.js`. Celui du pied de l'ascenseur (`ecole_ascenseur.js` l. 421) était fait de maillages posés un à un dans
   le groupe de l'étage : ils sont rangés dans un groupe à lui, posé au pied du corps (le registre lit la pose sur
   `matrixWorld`), à leur place dans le groupe de l'étage (la couture les voit dans le même ordre : `[optim]` inchangé), qui
   porte `{ type: 'extincteur', nom: "l'extincteur", mural: true, formes: [son cercle] }`.
3. **La porte bleue de la David Clark est VITRÉE** (`vitre: true`, § 5.3 c) : un dépoli dans un cadre d'aluminium ; elle est
   aussi dans `TABLE_DEPOLIS`. Les portes des salles 1 et 2 du 2e et de la S −1.14 (`vitree`, verre remplacé par un dépoli
   dans leurs fichiers) aussi. Le jour du bureau B (bande claire de 0,5 m au-dessus de 2 m) est compté dépoli : l'œil est à
   1,62.
4. `regleParDefaut(porte, zoneJeu, mode)` a besoin des pièces de part et d'autre de la porte : AJOUT `cotesPorte(porte,
   lumieres)` (exporté ; les lumières de la carte gardées par le module, posées par `MondePartie`), et `PASSAGES_PIECES`
   (les 46 passages recopiés de `carte_monde` § 7 : ceux de `pilotage.js` sont à L-D, qui doit les remplacer).
5. `entrer(zoneJeu, table, mode = null)` : un 3e paramètre facultatif (le compte des paramètres du test 11 de S0 ne change
   pas) ; sans lui, le mode se lit sur la table (`TABLE_PORTES_PROP` ou nulle : prop hunt).
6. Les portes de la FRONTIÈRE de la zone sont fermées dans les DEUX modes (§ 4.5.19 le dit du prop hunt ; au combat, la règle
   par défaut le dit d'une porte inconnue) : une porte ouverte sur une barrière n'apprend rien. Les portes FIXES gardent
   l'état de leur construction quelle que soit la table (`ecarts` les note ; 0 aujourd'hui).
7. `Portes.forcer(P, k)` éteint la forme au-delà de 0,5 (§ 5.3 a) ; le pas de la partie garde le seuil de `maj`, 0,02.
8. L'ascenseur : `instantane(ch)`, `restaurer(ch, i)`, `couper(ch)` sont des fonctions du chantier exportées par
   `ecole_ascenseur.js` (comme `majAscenseur`) ; il reste joignable par `carte.chantier` : le retour de la carte gagne
   seulement `visibilite` et `miroirAccueil`.
9. La rubalise n'est pas dans la scène que `Partie.preparer` compile, et un préréglage changé change ses programmes : elle
   est compilée par `noeudsAutorises`, la seule méthode du monde que `Partie.preparer` appelle à CHAQUE préparation, avant
   la compilation de la scène (DEMANDE 2 : un appel `monde.preparerPartie?.()` serait plus propre).
10. `ecole_visibilite.js` : le Set `forcees` contient les portes PILOTÉES ; une pièce fermée est montrée tant que l'une
    d'elles est OUVERTE (`k > 0,02`) — au combat les ouvertes à demeure, au prop hunt celles qu'un acteur ouvre ; le masque
    est alors refait à chaque rendu.
11. Une barrière par une PORTE est posée dans la baie de la porte : la limite des rectangles de pièces, au ras d'un mur,
    débordait parfois de la baie (celle de l'escalier principal mordait de 30 cm sur l'entrée du C05). Les autres suivent
    la limite des rectangles (au sol) et le passage libre le long d'elle.
12. AJOUT au § 4.6 : l'événement `'porte'` `{ nom, x, y, z, ouvre, a }` (une porte 'auto' commence à s'ouvrir — `a` :
    l'acteur —, finit de se refermer) : « la porte qui s'ouvre seule » doit s'entendre (DEMANDE 3).
13. `game.mondePartie` : le monde de la session, posé par son constructeur (la génération du graphe se fait pendant la
    préparation, quand `game.partie` est encore nul).
14. Test 7 : la « balade à la même pose » est mesurée la glace de l'accueil peinte et `fx.calme` égal des deux côtés (sinon
    la glace — 150 appels — et l'occlusion refaite hors du calme faussent l'écart de la salle) ; les poses sont choisies au
    monde solide (les points libres d'où la vue entre dans la salle par la porte).

## Demandes

1. **F2 / L-D** : générer le graphe des humains dans `game.mondePartie.avecVantaux(() => …)` (les 13 boîtes des vantaux
   ouverts rangées le temps du calcul ; `fn` peut rendre une promesse) ; les formes de partie portent `partie: true`
   (barrières : `limite`), à sauter dans l'empreinte si une génération a lieu en pleine partie.
2. **F2** : appeler `this.monde.preparerPartie?.()` dans `Partie.preparer` (à chaque préparation) ; je le poserai alors
   au lieu de la compilation dans `noeudsAutorises` (écart 9).
3. **L-H / L-F / L-O** : s'abonner à `'porte'` (un bruit de porte spatialisé ; un indice pour l'ouïe des chasseurs).
4. **Lot R / F2** : après la fusion du −1, relever de nouveau les trois entrées `lotR: true` de `TABLE_DEPOLIS` (fixe,
   imposte et porte de la S −1.14) et nommer dans les tables toute porte neuve (`monde.inconnues` les liste ; la règle par
   défaut les tient en attendant). Ses portes fixes posées dans un repère décalé (`decaler`) sont lues à leur centre MONDE
   (`cotesPorte`).
5. **L-A** : `balle()` doit rendre `forme` (le test F2 vérifie `forme.vantail` sur un vantail ouvert) et la vue s'arrêter
   sur une forme `depoli` (test F2).

## Doutes

- Les pièces de `lumieres.zones` sont des rectangles sans hauteur maximale pour la plupart : au-dessus de la pause du 1er,
  un point du palier du 2e hors de ses rectangles se lit « e1pause », et au ras d'un mur on lit la pièce voisine. Les tests
  jugent « dehors » sur le niveau de la pièce et à 35 cm des murs ; `noeudsAutorises` en dépend aussi (un nœud qui
  tomberait dans une pièce d'un autre niveau serait mal classé) — à revoir avec le vrai graphe (test F2).
- La vrille de la rubalise est un pur affichage ; elle traverse à l'image le vantail ouvert de la porte de l'escalier
  (photo plus bas) — accepté.
- Les poses de l'ascenseur coupé gardent la cabine où elle était (au RDC au départ) : le palier qui la voit garde sa lampe
  éteinte et ses portes fermées.

## Ce qui reste (à F2)

- Les deux tests `apresFusion` : le vrai graphe restreint (aucun nœud dans une pièce fermée, aucun dans un vantail ouvert)
  et la vraie balistique (forme `vantail` touchée, dépolis opaques à la vue et traversés par la balle).
- § 5.5.14 « À F2 » : `verifierBots` avec les tables, barrières et `nav.restreindre` au même endroit (200 trajets de `Pilote`
  par zone), graphe régénéré avec les vantaux, après la fusion du lot R : 0 porte inconnue sans règle.

## Photos regardées (navigateur intégré, captures d'écran)

- La rubalise du passage hall ouest → escalier principal en combat `rdc_rue` (de 2,6 m) : deux rubans rouge et blanc d'un
  jambage à l'autre, derrière le vantail ouvert ; lisible à l'œil, sans reflet.
- La porte de la Si 0.1 en prop hunt (`rdc`), vue de l'orbite de Haythem prop : elle s'ouvre devant un mannequin (k 0,39
  après 9 images), la salle visible derrière.
- La même porte forcée ouverte en combat (vue FPS) : la baie libre, la salle des postes derrière.
