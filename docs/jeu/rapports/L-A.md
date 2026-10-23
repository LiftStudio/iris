# Rapport L-A — armes et balistique (vague 2)

Branche `lot/L-A` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-A`), partie de `socle` (`e06258f`, tag `socle-ok`),
port 8131 ; 23/10/2026. Fichiers du lot : `js/jeu/armes.js`, `js/jeu/balistique.js`, `js/jeu/touches.js`,
`js/jeu/grenade.js`, `js/jeu/tests/test_armes.js` (et ce rapport).

## Où j'en suis

**FINI.** Les six points de la définition du § 5.1 (règle 5) sont tenus :
- (a) `&rapport=1&lot=L-A` : **19/19 sur PC** (13,6 s, 0 signalé) et **19/19 sous `?tel=1`** (émulation 375 × 812,
  15,1 s, 0 signalé) ;
- (b) `&rapport=1&lot=S0` sur la branche : **29/29 sur PC** (88,5 s, 0 signalé) et **29/29 sous `?tel=1`** (133,8 s,
  0 signalé) — balade au bit près avant et après les parties (vue 3 et vue 1 : 0 / 0), essai (13 tirs, 4 touches,
  1 élimination), tirs simultanés (2 éliminations au même pas, dans les deux ordres), cerveau minimal (42 éliminations,
  écart médian 1,97°) ;
- (c) `python -I tools/verifier_proprietaires.py lot/L-A` : `OK 6 fichiers` (fichiers et pureté) ;
- (d) commits préfixés « L-A : … » avec la ligne d'attribution ;
- (e) ce rapport, commité ;
- (f) onglet fermé (`tab-12`), serveur `python serve.py 8131` arrêté, jeton rendu (`jeton_3`, tenu de 04:12:50 à
  04:43:39 ; attendu de 03:28 à 04:12, les trois pris par L-D, L-G, L-V puis L-E, L-B — une note de L-V dans
  `_navigateur/` raconte que jeton_3 avait été partagé entre L-V et L-B avant moi : je l'ai pris libre, par `mkdir`).

Joué à l'écran (essai, `?partie=essai&graine=42`, onglet devant, 45 images/s) : une rafale de FA-24 tenue sur le
mannequin du hall fait monter la vue de 9,0° en 16 balles (le « 7 » du motif ; il faut tirer vers le bas), la réserve
du HUD descend (30 → 23 → 14), la dispersion revient à 2,2° dès qu'on lâche ; frag cuite 0,4 s, lancée : 3 rebonds puis
l'explosion ; couteau à 1,4 m : 150, la touche à 0,125 s ; flash : 3,09 s pour Haythem qui la regardait, 0,80 s pour
les mannequins de dos. (Les effets, les sons et l'arme de vue sont ceux des squelettes : L-H, L-V.)

## Ce qui est construit

**`balistique.js`** — les balles, la vue des bots et le vol des grenades sur le MONDE SOLIDE, jamais le lanceur de rayons :
- le PARCOURS DDA de la grille de 2 m (Amanatides et Woo sur la projection au sol), chaque forme une fois (`C._tour`
  incrémenté par le parcours lui-même, jamais dans un rappel), le PLUS PROCHE impact, sortie dès qu'il précède la sortie
  de la case ; une forme qui contient l'origine est ignorée (comme `rayonLibre`) ; une forme d'un autre niveau est rejetée
  dès sa tranche verticale ;
- les 53 SOLS d'abord (leur meilleur t borne le parcours) : dalles (plans bornés), rampes (trois morceaux linéaires :
  palier bas, plan incliné, palier haut ; normale du plan, tournée vers le tireur), et le plan y = 0 là où
  `solEn(x, z, 0,1) === 0` (la règle de `conception_cod` § 5.3 : là où aucun sol ne remplace le rez-de-chaussée) ; un sol
  arrête des deux côtés (dessous : 'plafond') ;
- trois MODES : `balle` (toutes les formes `joueur` et `camera`, sauf `off` et `balle === false` ; une vitre, claire ou
  dépolie, est TRAVERSÉE et notée), `vue` (formes `camera` seulement, vitres claires ignorées, `depoli` arrête), `objet`
  (grenades, souffle : une vitre arrête) ;
- `vue()` : le PRÉ-FILTRE `zonesCachees(A) & zoneDe(B)` (js/ecole_visibilite.js), sauf pour une paire
  d'`EXCEPTIONS_PREFILTRE`, puis le parcours ; `cacheParZones()` (le pré-filtre seul) ;
- `balle()` : `{ t, x, y, z, nx, ny, nz, mat, forme, vitre, vitres, sol }` — `mat` : 'sol' | 'plafond' | 'vitre' |
  'meuble' (forme rangée dans `MEUBLES.parForme`, ou `forme.meuble`) | 'mur' | 'rien' ;
- `tirer()` : le monde, puis les ENNEMIS avant l'impact (`rayonActeurs`) ; `traverse` vrai si une vitre précède
  l'arrivée (× 0,8 par `Partie.resoudreTir`) et une FÊLURE posée sur chaque vitre traversée (événement 'impact', mat
  'vitre', `traverse: true`) ;
- ajouts : `rayon(…, mode, h)`, `libre()` (ligne libre en mode objet), `matiere()`, `MODE`, `nomZone()`.

**`touches.js`** — les capsules depuis l'ÉTAT SIMULÉ (formules du § 4.5.6), la TÊTE AVANCÉE de 0,04 + 0,02·v selon le
cap (`facing` du Player, sinon `ang`), la boîte du prop décentrée et tournée avec lui, le panneau des cibles ; volumes
RÉUTILISÉS (aucune allocation par balle) ; `rayonActeurs` (préfiltre cylindre 1,1 m) ; ajouts `teteSimulee(acteur, out,
affiche)`, `rayonVolume`, `AVANCE_TETE`.

**`armes.js`** — l'ARSENAL complet (les 8 états) :
- tir automatique (`tir` tenu) et semi-automatique (front tamponné 0,1 s) ; cadence À REPORT DU RESTE ; tir émis AVANT
  la résolution des plombs, puis un événement 'trajet' par plomb (de l'œil au point d'arrivée : les traceurs) ;
- DISPERSION : base interpolée en 0,12 s (repos, marche > 0,3 m/s, course > 3 m/s, sortie de sprint, saut), × (1 − 0,2 ·
  accroupi), + chaleur (parTir, plafond, retour), × 1,3 en glissade, vers la valeur de visée selon la visée ; tirage
  `r = s·√u, θ = 2πv` par `Rng(melanger(graine, id, tirSeq))` (exporté : `tirage`) ; GERBE du FP-12 (1 plomb au centre à
  ± 0,3°, 7 en couronne à 0,6 × le cône ± 0,3°, tournée au hasard ; cône 5,0° → 3,6° en visée) ;
- RECUL à motif (le motif, puis sa boucle sur les `boucle` derniers ± `alea`, `aleaH` pour les armes à « h au hasard »),
  × (1 − 0,2 · visée) × (1 − 0,15 · accroupi), accumulé en radians et rendu par `prendreRecul` (remis à zéro) ; RAPPEL
  (`rappelDelai` après le dernier tir, `rappel` × la montée en `rappelT` ; un tir l'interrompt ; le motif repart de zéro
  ensuite) ;
- RESSORT VISUEL (ω 35, ζ 0,55 ; impulsion réglée pour que la crête d'un tir isolé vaille la fiche) : `reculV` (cabré, °),
  `reculH` (°), `piston` (m), `roulis` (°) — tenu à 120 Hz, HORS de l'état (affichage) ;
- VISÉE 0 → 1 au temps d'ADS sur `1 − (1 − t)³` (`vk` linéaire dans l'état, `visee` la courbe) ; pas en sprint, ni 0,1 s
  après un décollage, ni dans les 0,35 premières secondes d'une glissade ;
- RECHARGES : tactique (chargeur + 1) ou à vide, balles entrées au temps de la fiche, annulées avant (sprint, changement
  d'arme, couteau, grenade) ; d'office à vide ; FP-12 cartouche par cartouche (0,35 + 0,42 n + 0,30 ; + 0,45 de pompe à
  vide), interrompu par un tir (la main revient en 0,10 s, la pompe d'abord si le tube était vide ; le clic part) ;
- SPRINT (le drapeau `sprinting` du Player) : arme baissée ; en sortir — un tir demandé, la visée, l'arrêt — coûte
  `sprintTir` (ou `sprintTactTir` après un sprint tactique) ; le clic qui en fait sortir part au bout de la sortie ;
- FRANCHISSEMENT (`acteur.franchit`, posé par L-B) : rien en main ;
- COUTEAU : la FENTE (un ennemi vu dans le cône de 25° à ≤ 2,4 m : tiré vers lui à 6 m/s, ≤ 0,05 m par pas PAR LE MONDE
  SOLIDE, 0,15 s au plus, jusqu'à 0,9 m de lui), la TOUCHE à 0,12 s (l'ennemi vu dans un cône de 35° dont le centre est à
  ≤ 1,6 + 0,3 m ; la tête si le regard la croise), 150 (il tue), 0,60 s par coup ; dans le vide, l'impact sur le décor à
  1,6 m ; événement 'couteau' ;
- GRENADES tenues : la frag CUITE (l'appui tire la goupille, la mèche court ; lancée au relâché, après 0,15 s de goupille
  au moins ; EN MAIN au bout de 3,5 s), la flash d'un appui ; l'arme remonte (lancer 0,35 s, remontée 0,25 s) ;
- CHANGEMENT d'arme : rangement puis sortie, l'arme change à mi-geste (événement 'arme' à ce moment-là) ;
- `ajouterChargeur`, `remplir`, `etat()` / `appliquer()` complets (rejoués au bit près, recharge et grenade en cours) ;
- ajouts lus par l'arme de vue et le HUD : `versArme`, `dernierTir`, `grenade`, `cuisson`, `phaseLancer`
  ('goupille' | 'tenue' | 'lance' | 'remontee'), `cartouches`, `piston`, `roulis` ; `GESTES`.

**`grenade.js`** — le vol par le monde solide (mode `objet`, 4 rebonds au plus par pas), la grenade posée à son rayon
(4 cm) le long de la normale ; REBOND au-dessus de 1 m/s (normale × 0,35, tangente × 0,6 ; événement 'rebond') ; SONDE du
sol (elle roule, freinée à 6 m/s², s'arrête sous 0,4 m/s) ; un filet (sous le −1 ou à 2 m hors des bornes du jeu : un trou
du monde solide, elle s'arrête) ; l'EXPLOSION : frag 160 à ≤ 2 m puis linéaire jusqu'à 25 à 6,5 m, la distance prise au
CORPS (le segment des pieds au sommet de la tête), ligne libre du centre + 0,3 m vers le buste ou la tête ; flash
`0,8 + 3,2 × face × (1 − d/14)` plafonné 4 s, en ligne de vue (une vitre claire laisse passer la lumière) ; une mèche à 0
(cuite jusqu'au bout) : née dans la main, elle explose au pas même.

## Le `__rapport` (PC, `http://127.0.0.1:8131/?test=1&rapport=1&lot=L-A`)

`ok: true`, `total: 19`, `echecs: []`, `signales: []`, `ms: 13 642`, qualité high. `?tel=1` (375 × 812) : `ok: true`, 19,
0 signalé, 15 100 ms, mêmes mesures (sauf le 99e centile de `balle`, 37,5 µs).

| # | Critère (§ 5.5.1) | Mesuré |
|---|---|---|
| 1 | DDA contre la référence brute (1 cm), 2 000 segments | **2 000 / 2 000** à ≤ 2 cm (118 sans obstacle) |
| 2 | contre les maillages (100 rayons, ≥ 97 % à ≤ 10 cm) | **98 / 100** — exclus et comptés à part : 28 verre, 29 décor sans forme, 10 forme sans décor, 30 cages d'escalier (26 d'accord), 5 portes (3 d'accord) — voir « Écarts », 1 |
| 3 | 400 rayons verticaux | **400 / 400** arrêtés avant le niveau voisin |
| 4 | vitres, dépolis, `camera:false`, `balle:false` | claires 20/20 (× 0,8, vue libre) · dépolies 20/20 (vue arrêtée 20) · camera:false 20/20 arrêtées · balle:false 20/20 passées |
| 5 | `balle` ≤ 30 µs médiane / 120 µs 99e à 30 m ; `tirer` 8 acteurs ≤ 0,1 ms | **10 µs / 40 µs** · **10 µs** (horloge à 0,1 ms : chaque rayon répété 40 fois) |
| 6 | 100 balles tête / torse / jambes à 10 m en visée | **100 / 100 / 100** |
| 7 | cadences | FA-24 30e à **2,3167 s** · PM-9 32e à 2,0583 · FP-12 10 coups en 7,7083 · TP-50 1,3250 · P-17 21 coups en 3 s · tampon 0,1417 s · reprise 75 ms (≥ 80 − 1 pas) |
| 8 | temps pour tuer (visée) | FA-24 10 m **4 balles, 233,3 ms** · PM-9 6 m 191,7 ms · P-17 8 m 291,7 ms · FP-12 4 m 1 coup · TP-50 torse 1, ventre 2, jambes 2 |
| 9 | `degatsDe` | **85 / 85** valeurs (5 armes × paliers × zones, + bornes des paliers) |
| 10 | recharges | tactique **1,9000 s → 31** · à vide 2,4500 → 30 · sprint à 1,30 annule (25 → 25), à 1,40 garde (→ 31) · FP-12 1,9167 → 7, interrompue par un tir · conservation 0 écart sur 1 000 actions |
| 11 | recul FA-24 | montée **6,760° (0,1180 rad)**, côté 0,150° · visée 5,408° (× 0,8) · accroupi 5,746° (× 0,85) · boucle ± 0,08° · rien avant 300 ms puis − 2,704° (40 %) · camPitch de Haythem − 0,1180 · cabré 0,91° |
| 12 | dispersion | repos **2,200°** · course 4,600° · saut 8,000° · 10 000 tirages dans le disque, rayon moyen 0,6667 s · FP-12 centre 4/4, couronne 28/28 |
| 13 | couteau | 1,6 m : tue, touche à 0,125 s · 2,4 m (10° du regard) : fente de 0,74 m, tue · 40° : rien · 3 m : rien · 2e coup 0,708 s après |
| 14 | grenades | 50 lancers : 50 hors des formes, 50 sur un sol · 160 / 92,5 / 25 · 0 derrière un mur · en main à 3,5000 s (160 à soi) · flash 2,4 s de face, 0,8 s de dos, rien derrière un mur |
| 15 | capsules / os `Head` (noté) | **29,7 cm moyen, 44,7 cm au 95e centile** sur 562 images de course — HORS des seuils : demande à L-C (bloquant à F2 seulement) |
| 16 | déterminisme, état | `verifierDeterminisme(42, 30, { bots: 4 })` 0b84af54 / 0b84af54 · état identique, recharge en cours et grenade en vol |
| 17 | schéma des événements, pureté | tir, recharge, arme, vide, grenade, explosion, flash : champs présents · 0 faute de pureté (le vérificateur relu en JavaScript) |
| 18 | `ajouterChargeur` | 90 → 90 (faux) · 50 → 80 → 90 · secondaire 48 → 48 |
| 19 | pré-filtre validé (ajout) | 10 000 paires visibles, **0** dite cachée (avec les 24 exceptions) |

Les deux tests `apresFusion` (vue sur le vrai graphe de L-D, pré-filtre dans l'autre sens, dépolis de L-M ; capsules
contre les vrais corps de L-C) sont écrits et sautés avant `&fusion=1`.

## Mesures (relatives : d'autres agents tournaient)

- `balle()` à 30 m : médiane 10 µs, 99e centile 40 µs (37,5 sous `?tel=1`) ; `tirer` à 8 acteurs : 10 µs.
- `Partie.pas` du test 10 du socle (1 + 3 mannequins + 2 bots qui tirent et voient) : 0,143 ms (le socle mesurait
  0,03 ms, onglet devant, machine plus calme ; l'onglet était ici derrière ceux de L-B et L-F).
- Banc HORS NAVIGATEUR (node, monde synthétique : `scratchpad/la/essai1.mjs`, `essai3.mjs`, `essai4.mjs`) : 3 000 segments
  par mode dans un monde tiré au hasard (300 formes, 26 sols) — balle 2 999, vue 2 999, objet 3 000 à ≤ 2 cm de la
  référence brute (les deux écarts : un coin rasé sur moins d'un pas de 1 cm) ; grenade lancée à plat : 2 rebonds,
  2,3 m de roulement, posée à 4 cm du sol.

## Écarts au document (§ et ligne de `spec_finale.md`)

1. **Test 2, les exclusions** (§ 5.5.1 point 2, l. 2243-2247 : exclus le verre et le « décor sans forme »). Sur les rayons
   tirés entre deux points libres pris au hasard, l'accord brut est de 87 à 90 % : les écarts viennent du MONDE SOLIDE
   lui-même, simplifié par construction, et le DDA, lui, l'épouse à 100 % (test 1). Classés en jouant (300 rayons) :
   (a) **forme sans décor** — le miroir du décor sans forme : les rangs de la salle Kahn en un bloc de 1,6 × 7,6 m, le
   mange-debout de la pause du 1er en cylindre plein, les boîtes de caméra (dessous de dalle à 3,25, boîte à 1,9 m de
   l'accueil, plafond de caméra du −1 à −0,76) ; (b) les **cages d'escalier** — rampes au milieu des marches, l'échiffre
   de la volée 2 en mur plein de 5,20 m (`carte_ecole.js` l. 625, x 1,85-2,0), le jour (l. 628, x 2,0-2,42), le portillon
   du 2e (x 16,2 ; 6,6-9,2), les marches de la volée de tôle en boîtes 10 cm plus larges ; (c) les **portes** — leur boîte
   n'est pas leur vantail (12 cm plus épaisse ; la porte vitrée de la Si 0.2 n'a pas `vitre`). Le test les compte À PART
   et l'écrit (accord 26/30 dans les cages, 3/5 sur les portes) ; la règle des 97 % porte sur le reste (98/100). Aussi :
   le premier impact de la balle est la première VITRE qu'elle traverse (le verre dépoli « opaque vert pâle » n'est pas
   `transparent` : sans cela, la balle qui passe la cloison vitrée comptait faux).
2. **Les points libres des tests** (l. 2241 « tirés sur les 53 sols ») : seulement ceux qui sont DANS UNE PIÈCE DE LEUR
   NIVEAU (`lumieres.zoneEn`) — les dalles débordent : celle du 2e (x 3,2-18,21, plan y −0,2 à 9) couvre au sud-ouest un
   vide sans plancher dessiné (là où « le 2e n'a pas de pièce », `ecole_visibilite.js` l. 375) ; celle du −1 (x 0,4-13,05,
   plan y 1 à 16,66) couvre aussi l'attente, le bureau B et la Si 0.1, où il n'y a pas de sous-sol : une grenade lancée
   de là filait sous la rue.
3. **Les champs `type` des événements 'grenade' et 'explosion'** (§ 4.6, l. 1632-1633) : `Partie.evt` construit
   `{ t, type, ...data }`, donc un champ `type` des données ÉCRASE le type de l'événement (l'événement 'grenade' arrivait
   sous le type 'frag' : aucun abonné à 'grenade' ne le recevait). Le type de grenade voyage sous **`arme`** ('frag' |
   'flash'), comme pour 'tir'. (Le squelette du socle avait le défaut.)
4. **Événements ajoutés** (§ 4.6) : 'trajet' (a, plomb, ox, oy, oz, x, y, z, mat : un par plomb, pour les traceurs),
   'couteau' (a, cible, x, y, z), 'rebond' (a, arme, x, y, z, v, id) ; phases 'annulee' et 'interrompue' de 'recharge'
   (et `n` à 'insere') ; 'impact' de vitre (fêlure) émis par `Balistique.tirer` ; 'tir' porte `visee`, 'grenade' porte
   `meche` et `id`, 'flash' porte `par` et `d`. 'tir' part AVANT les impacts de ses plombs ; sa direction est l'axe de la
   visée (les plombs dispersés sont dans 'trajet').
5. **Dispersion des quatre autres armes** (§ 3.4, l. 429-430 : « valeurs posées par L-A ») : PM-9 repos 2,6 · marche 3,6 ·
   course 4,6 · sprint 5,2 · saut 7,0 · parTir 0,18 · max 2,2 · retour 9 · visée 0 · en mouvement 0,25 (« plus large à la
   hanche » au repos, mais chauffe moins) ; P-17 1,6 · 2,4 · 3,4 · 4,2 · 6,0 · 0,45 · 2,0 · 8 · 0 · 0,10 ; TP-50 8 · 9 · 10 ·
   11 · 12 · 0 · 0 · 10 · 0 · 0,6 ; FP-12 : la gerbe (cône 5,0 → 3,6 en visée).
6. **Le cône du FP-12** (l. 431 : « cône 5,0° hanche / 3,6° visée ») lu comme un DEMI-angle (la convention du § 3.4) : à
   4 m la couronne est à 0,21 m de l'axe à la hanche — des plombs passent à côté des capsules du buste (r 0,165) — et un
   coup tue d'un tir à la hanche jusqu'à ≈ 3 m, en visée jusqu'à ≈ 4,5 m. Le test 8 (FP-12 à 4 m d'un coup) est fait en
   visée, comme les autres temps pour tuer. À régler à l'intégration (le ressenti « pompe » veut peut-être un cône plus
   serré à la hanche).
7. **Couteau** (l. 404) : la touche prend un cône de 35° et la portée au BORD de la cible (centre à ≤ 1,6 + 0,3 m) ; la
   fente s'arrête à 0,9 m du centre visé.
8. **Recharge du FP-12 interrompue** (l. 389 « interruptible ») : la main revient en 0,10 s (0,45 de pompe si le tube était
   vide) ; le clic qui l'a interrompue part alors.
9. **`touches.capsules` d'un prop** : la boîte locale DÉCENTRÉE de T.boite tourne avec le meuble (le squelette ne prenait
   que sa hauteur) — à vérifier avec le vrai `majProps` de L-K (même convention de cap que `rotation.y`).
10. **Grenade** : rebonds francs seulement au-dessus de 1 m/s, roulement freiné à 6 m/s² (non chiffrés au § 3.3) ; un
    filet l'arrête sous le −1 ou à 2 m hors des bornes du jeu (un trou du monde solide ne la fait plus tomber sans fin).
11. **`EXCEPTIONS_PREFILTRE` posée dès la vague 2** (§ 5.5.1 l. 2283-2286 : « À F2 ») : le test 19 (ajouté) a trouvé, sur
    10 000 paires de points libres, 37 lignes de vue que le pré-filtre disait cachées — les pièces fermées du
    rez-de-chaussée vues de plus de 8 m de leur porte (r0|r0si 29, rue|r0si 4, r0|r0sv 4). Les exceptions couvrent les
    quatre pièces fermées vues des six zones qui voient le rez-de-chaussée (24 paires) : le combat tient leurs portes
    ouvertes, le prop hunt les ouvre pour tous. Elles deviennent inutiles (et sans effet) quand L-M branche
    `visibilite.forcees`.
12. **Test 15** : noté, il ne fait pas échouer (« bloquant à F2 seulement », l. 2279) ; le test `apresFusion` le rend
    bloquant sur les vrais corps.

## Demandes

- **L-B** : (a) `tir` tenu doit couper le sprint du CORPS (comme la visée, `appliquerCommande`) — sinon l'arsenal sort du
  sprint, attend `sprintTir` et tire, mais Haythem court encore à 6,6 m/s ; (b) poser `acteur.sprintTactique` (bool)
  pendant le sprint tactique (l'arsenal prend sinon la vitesse > 7,2 m/s) ; (c) poser `acteur.franchit` (bool) pendant le
  franchissement scripté ; (d) `VueFPS.etatArme()` peut lire `piston`, `roulis`, `versArme`, `phaseLancer`, `cuisson`,
  `dernierTir`, `tirSeq`.
- **L-C** : la tête simulée est à **29,7 cm** de l'os `Head` (+ 0,085) en moyenne chez un coureur (44,7 cm au 95e
  centile ; les corps du squelette sont des clones de Haythem avec les couches de la balade : penché, inclinaison) — couper
  le penché et l'inclinaison des couches pour un acteur armé (§ 4.5.6 l. 1120-1122, R12). Bloquant à F2.
- **L-M** : `balle: false` sur le jour (prévu, l. 1609) ET sur l'échiffre de la volée 2 au-dessus de sa main courante
  (`carte_ecole.js` l. 625, boîte pleine de 0 à 5,20 m : une balle s'y arrête dans le vide de la cage) et sur le portillon
  du 2e ; `vitre: true` sur la porte vitrée de la Si 0.2 (verre dépoli bleu) ; `forme.depoli` (TABLE_DEPOLIS).
- **L-H** : écouter 'trajet' (traceurs), 'rebond' (le « tink »), l'impact de vitre `traverse: true` (fêlure sans arrêt),
  'couteau' ; `mat` vaut 'sol' | 'plafond' | 'vitre' | 'meuble' | 'mur'.
- **F2** : (a) trancher le champ `type` → `arme` de 'grenade' / 'explosion' (écart 3) — ou corriger `Partie.evt`
  (`{ ...data, t, type }`) et renommer le champ dans le § 4.6 ; (b) rejouer le pré-filtre sur le vrai graphe (test « F2 ·
  vue… ») et compléter `EXCEPTIONS_PREFILTRE` ; (c) les exclusions du test 2 (écart 1).

## Doutes

- Le test 2 dépend de la carte : chaque retouche du monde solide (lot R au −1, L-M) le fait bouger de quelques rayons.
- Les temps sont relatifs (machine partagée, onglet souvent derrière ceux des autres agents) et l'horloge du navigateur
  est à 0,1 ms : les µs sont des moyennes de 40 répétitions.
- Le recul des BOTS : le cerveau minimal le prend (`prendreRecul`) et en garde (1 − compensation), mais il revise sa cible
  à chaque pas (300°/s) : en pratique, il le compense tout entier. C'est L-J.

## Photos regardées

Captures du panneau (onglet du lot, 524 × 306 affiché) : l'essai au départ, le mannequin du hall au centre de la visée
(HUD « 0:00 · VIE 100 · FA-24 « Faucon » 30 / 90 ») ; la même vue à la 7e balle d'une rafale tenue (la vue a monté d'un
cran, 23 / 90) et à la 16e (le mannequin est passé sous le centre : la montée du motif, 14 / 90). Rien d'autre à
regarder pour ce lot : il n'a ni maillage ni effet (impacts, traceurs, grenade en vol : L-H ; l'arme : L-W, L-V).
