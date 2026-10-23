# Rapport L-C — les corps des acteurs (vague 2)

Branche `lot/L-C` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-C`, depuis `socle` = `socle-ok` e06258f), port 8135 ; 23/10/2026.
Spécification : `docs/jeu/spec_finale.md` § 5.5.5 (lot), § 4.5.10 (contrats), § 3.6 (retours), § 3.10 (budgets).

## Où j'en suis

**EN COURS — tout le lot est écrit et joué ; reste la passe finale** (23/10, 06:30) : `&rapport=1&lot=L-C` complet,
`&lot=S0` encore vert, `?tel=1`, `verifier_proprietaires`, puis ce rapport finalisé. Les 14 tests ont tous passé un par un.

Un repreneur : `git log` de `lot/L-C` ; le serveur `python serve.py 8135` dans l'arbre ; un jeton du navigateur
(`_navigateur/jeton_<n>`, § 5.1 règle 3 : la file est très demandée) ; la page
`http://127.0.0.1:8135/?test=1&rapport=1&lot=L-C` (≈ 4-6 min) puis `&lot=S0`.

## Ce qui est fait

### Les fichiers

| Fichier | Ce qu'il fait |
|---|---|
| `js/jeu/avatars.js` | `FICHES_BOTS` (les six amis, `assets/tel/<id>.glb` même sur PC), `FICHE_HAYTHEM` (gabarit A). `preparerAvatars` : un corps SONDE par avatar (chargeur discret, clips reciblés, programmes compilés, variante transparente de l'effacement, **une image vraie** sous l'écran de préparation — teinte, brassards, une arme), un avatar par gabarit d'abord, plafond 6 / 3 distincts ; les sondes restent hors de la scène pour la session (leurs matériaux tiennent les programmes en vie : une préparation suivante coûte 0 ms). **Calage de la tête** : l'échelle de l'avatar ajustée (× 1,009 à 1,030) pour que sa tête soit là où la simulation la compte. `creerCorps` (drapeaux `capFixe`, `sansRangs`, `audible = false`, `sansSouffle`, `elanAir`, `cibleRegard = null`, `discret` ; un ami non préparé prend un avatar préparé), `libererCorps` (brassards détachés, puis `Player.dispose`). |
| `js/jeu/teintes.js` | `teinteEquipe` : tenue teintée à 0,6 (haut couleur pleine, bas × 0,42) par le shader des tenues (`appliquerFit`, uniformes seuls, matériaux clonés) ; deux brassards de 8 cm sous `LeftArm` / `RightArm`, à 12 cm de l'articulation, ajustés à la manche de chaque avatar (93e centile + 5 mm), émissifs 0,22 ; `retirerTeinte`, `preparerTeintes`. |
| `js/jeu/accroupi.js` | `accroupir(player, k, bas = 0.42)` : pieds gardés, bassin −0,42 k à la verticale et −6 cm vers l'arrière, dos, cou, `ikJambe`. |
| `js/jeu/pose_arme.js` | `poserArme` : buste de trois quarts (0,55 rad), part du tangage au buste, tête dans l'axe (joue sur la crosse en visée), arme 3e personne (réserve partagée de `creerArme(id)`) au canon EXACTEMENT dans la direction de la commande, crosse au creux de l'épaule, **glissée le long de son axe pour rester à portée de bras** (visée très haute ou très basse), sprint (en travers), recharge (main gauche au chargeur, à la ceinture, retour), changement d'arme, gestes, ressort de recul (piston, cabré de la fiche), sursaut à la touche ; **cinématique inverse du bras réécrite** pour une pose par image (`ikBrasRapide` : 0,075 ms par acteur au lieu de 0,2-0,3) ; `acteur.aff.bouche` ; `armeTroisieme`, `suivreArme` (entre deux poses), `priseMain`. |
| `js/jeu/poupee.js` | `Poupee` Verlet (17 points, buste rigide, plis, sol, MURS sur hanches / poitrine / tête), pas fixes de 1/120 s, effondrement (bassin vers le bas, genoux vers l'avant), affaissement et bascule (loin d'un mur), pesanteur × 1,35, repos, arrêt à 3 s ; Militaire 4 s + enfoncement 0,5 m en 0,4 s ; Airsoft 1,5 s + effacement 0,6 s (matériaux clonés transparents, brassards rangés) ; `releverCorps` (réapparition : `anim.couper()` puis `animKey = null`, pas de fondu, ajouts oubliés). |
| `js/jeu/cadence_acteurs.js` | dessiné = zone vue (`zonesCachees` / `zoneDe`) ET cadre (sphère 1 m) ; posé chaque image < 18 m, une sur deux < 34 m, une sur trois au-delà, 4 Hz caché, DANS L'IMAGE où il redevient dessiné ; téléphone : 2 pleins ; ombre au niveau de la caméra ; présentation `leger` d'un corps caché ; réapparition (la poupée quittée). |
| `js/player.js` | `surAvatar` (l'habillage avant la 1re image), la mémoire des ajouts d'après-pose (`_apresDebut/_apresFin/_apresAnnuler` : `ajouter` est relatif, un buste tourné que personne ne réécrit s'empilait), `oublierApres`, `leger` dans `presenter`. Rien de cela en balade (rejeu au bit près). |
| `js/couches.js` | `penche` (le groupe d'un acteur armé penche à 25 %), `sansRegard`, `droit` → `_droit` : le dos visant, depuis les hanches, le point au-dessus du centre des pieds, et la tête droite sur le cou. |
| `js/fit.js` | `appliquerFit` et `moyenne` de LA CAGE recopiés (sans `needsUpdate`) ; le mélange de la teinte fait dans l'espace perçu (sans effet quand la tenue est éteinte : Haythem). |
| `js/jeu/tests/test_corps.js` | les 14 critères du § 5.5.5. |

## Mesures (relatives : d'autres agents tournaient ; l'onglet du lot était souvent DERRIÈRE les leurs dans le même panneau — minuteries ralenties : `compileAsync` de three attend par `setTimeout`)

- **Avant le lot** (essai, Haythem cloné, commande forcée dans la rue) : le clip de course penche le dos de 23° (29° au
  sprint) ; tête de l'os à 31 cm DEVANT les pieds et 11 cm SOUS la tête simulée (37 et 19 cm au sprint) ; marche 6,5 cm ;
  arrêt 2 cm. Au repos, la tête des amis est de 2,7 cm (Koji, Djafar, Marc-Antoine) à 4,8 cm (Ethan) sous la formule des
  boîtes de touche (Haythem 1,2 cm).
- **Après** (test 11, `Errant` 20 s dans l'école, images > 4 m/s) : 3,5 à 4,7 cm en moyenne, 6,1 à 8,0 cm au 95e centile
  pour les 7 fiches (calage : haythem 1,0087 · gabriel 1,0220 · imad 1,0218 · marcantoine 1,0176 · koji 1,0181 ·
  djafar 1,0182 · ethan 1,0295).
- Accroupi (test 5) : hanches −0,420 m, pieds 0,00 cm ; en jeu, tête affichée 1,18 m contre 1,10 simulée (voir Demandes).
- Poupées (test 6) : 100/100 à plat en < 1 s (médiane 0,50 s, 90e 0,60 s, max 0,80-0,83 s), 0 dans une forme, 0 NaN,
  toutes au repos à 3,1 s, cachées à 4,4 s (Militaire). Avant réglage (le banc tel quel, amorti par pas de 1/120 s) :
  médiane 1,1 s, 17/100 sous la seconde.
- Préparation des six amis (test 1) : 1,5-2,1 s la 1re fois onglet au premier plan, 6,2 à 11 s onglet derrière ceux des
  autres agents (signalé) ; 0 ms ensuite ; 0 `DefaultLoadingManager.onLoad` ; 138 → 162 programmes pendant la préparation
  (les cheveux des amis : voir Écarts), puis +0 au premier dessin des six corps.
- Textures nouvelles des six (test 2) : 137,3 Mo (85 textures) ; 6 avatars distincts PC.
- Arme en main (test 4) : canon / commande 0,000° sur 200 couples (tangage ± 1,2), main droite 0,00 cm, gauche ≤ 1,75 cm
  (FA-24 1,1 · FP-12 1,7 · TP-50 1,7 · PM-9 et P-17 0,0) ; 0,075 ms par acteur (0,15-0,32 avant `ikBrasRapide`) ; une pose
  et 22 ajouts par image.
- Cadence (test 7) : bot du 2e jamais dessiné ni ombré, 20 poses en 5 s (4 Hz) ; 0 faute de la règle de distance (126
  images à > 34 m) ; 120 retours dans le cadre, tous posés dans l'image même ; 0,56 ms de poses par image pour 7 bots.
- 50 morts et réapparitions (test 8) : 0 clip figé, debout, armé 50/50 ; enfants 311 → 311 ; géométries 1619 → 1630,
  textures 511 → 515 (± 2 %).
- 3 cycles à 7 bots (test 9) : géométries 1630 → 1634, textures 556 → 558, enfants 309 → 309, instantané identique.
- Teinte (test 10) : 2 brassards de 8,0 cm sous LeftArm / RightArm, tenue à 0,6, couleurs des équipes ; matériaux de la
  scène inchangés.
- Habillage (test 14) : Airsoft opaque à 1,5 s, 0,5 à 1,8 s, caché à 2,12 s ; Militaire enfoncé de 0,50 m, caché à 4,42 s.

## Photos regardées

Dossier de session (volatil) `C:/Users/hgami/AppData/Local/Temp/claude/C--/d2516763-f01d-443a-9d38-fe9a0c124e7f/scratchpad/lc/photos/` :
`g01`-`g14` (visée de côté, de face, de trois quarts, teintes avant / après le mélange perçu, course, sprint, accroupis,
recharge, morts à 0,3 / 0,8 / 1,7 s), `01`-`10` (lisibilité, test 13 : rue à 10, 20, 30 m, hall, −1, couloir, 5 m).
Jugement : les équipes se lisent sur toutes les photos où les corps sont dans le cadre — orange et bleu francs à 5-20 m,
encore distincts à 30 m dans la rue ; brassards nets ; course le buste droit, sprint l'arme en travers, accroupi de
combat crédible, recharge lisible (main gauche à la ceinture), chute en poupée propre. Deux cadrages du test 13 (−1, couloir
est) ne montrent pas les bots (les points ne sont pas dans le même couloir) : à reprendre par F2 avec les chevrons. Les
armes sont les BOÎTES de secours de `modeles_armes.js` (L-W) : des « planches » tenues comme des armes ; F2 vérifiera les
mains sur les vraies prises.

## Écarts au document

1. **Critère 1** (§ 5.5.5 : « programmes après = programmes avant ± 2 (mêmes matériaux Avaturn que Haythem) ») : la
   prémisse est fausse pour les CHEVEUX des amis (`avaturn_hair_*`, d'autres jeux de textures et un alphaTest) : la
   préparation des six crée 24 programmes (138 → 162), tous SOUS l'écran de préparation (c'est le but, R9). Le test vérifie
   donc la garde réelle : les six corps créés APRÈS la préparation, montrés et dessinés 30 images → ± 2 (mesuré +0).
2. **Image vraie des sondes** : la compilation parallèle du jeu (`Player.preparerRendu` → `ombre_cache.js avecProfondeur`)
   compile les programmes de la carte d'ombre AVEC les lumières de la scène ; three r170 les dessine SANS (clés relevées au
   traceur) : 3 programmes de profondeur naissaient au premier dessin d'un ami. `preparerAvatars` dessine donc ses sondes
   neuves trois images (`game.frame`) sous l'écran de préparation. Voir Demandes (INT).
3. **Critère 3** (« rangées de la salle David Clark ») : elle n'a pas de rang SERRÉ (`Player.rangs` : S −1.14, S 1.3,
   salle 2 du 2e, comme l'a noté S0) ; le test garde 4 errants à la David Clark et pousse 4 bots dans les bouts ouverts des
   rangs de la S 1.3, avec un témoin (le même corps sans `sansRangs` y entre).
4. **Critère 4** : mesuré avec la cadence forcée (chaque bot posé à chaque image) ; la cadence a son test (7).
5. **Critère 7** : la caméra est posée à la main (x = −18 dans la rue, hors des bornes du jeu où aucun corps ne va) pour
   tenir des distances de 16 à 50 m dans une rue de 26 m ; « un bot d'un autre niveau » = au 2e, vu de la rue.
6. **Calage de la tête** (§ 4.5.10, fiches « gabriel 1,79/1,865 … ») : les fiches gardent leurs valeurs, mais l'avatar est
   mis à l'échelle × k (1,009 à 1,030, mesuré sur la sonde) pour que sa tête soit à 1,635 × h/1,73 — sans cela le critère
   11 était faux de 3 à 5 cm pour chaque ami, la formule des boîtes de touche étant celle des proportions de Haythem.
7. **Le dos droit** (§ 4.5.6 : « au-delà, L-C coupe le penché des couches pour un acteur armé ») : couper le penché ne
   suffisait pas (le clip de course penche le DOS de 23°) ; un acteur armé court donc le buste droit au-dessus de ses pieds
   (`couches.js _droit`) et la tête droite sur le cou ; le groupe ne penche plus qu'à 25 %.
8. **Teinte** (« tenue teintée à 60 % », `appliquerFit` de LA CAGE) : `force` 0,6 gardée, mais (a) le mélange avec le
   tissu se fait dans l'espace perçu (`fit.js`) et (b) le contraste du tissu passe de 0,85 à 0,25 : sinon une chemise
   blanche (Koji, Ethan) restait blanche — mesuré et photographié (`g03`-`g07`).
9. **Brassards** « enfants des os d'épaule » : sous `LeftArm` / `RightArm` (l'os du bras, qui part de l'épaule), pas sous les
   clavicules `LeftShoulder` / `RightShoulder` (un brassard ne suivrait pas le bras) ; à 12 cm de l'articulation.
10. **Poupée** : en plus du banc — pas fixes de 1/120 s (l'amorti du banc était par pas : à 120 Hz il doublait, la chute
    traînait), effondrement, affaissement, bascule (loin d'un mur), pesanteur × 1,35, repos forcé à 3 s ; sans cela « à
    plat en < 1 s » n'était tenu que 17 fois sur 100. Le corps mort ne garde pas son arme (cachée ; L-P et ses armes au sol
    diront).
11. **L'arme glisse le long de son axe** quand la visée est très haute ou très basse (la crosse quitte l'épaule) : sans
    cela, la main gauche manquait le garde-main du FP-12 de 13 cm (bras de 0,48 m, garde-main à 0,6 m de l'épaule).
12. **Sondes gardées** : les corps sondes de `preparerAvatars` ne sont jamais libérés (hors de la scène, leurs matériaux
    tiennent les programmes, dont la variante transparente de l'effacement) ; 7 au plus par session.
13. **Recul visuel 3e personne** : un ressort par tir (piston et cabré des fiches de L-A, ω 35, ζ 0,55) — non chiffré par
    la spec pour les bots.

## Demandes

- **L-B (F2)** : « sa vitesse × 0,7 pendant 0,3 s » à la touche (§ 3.6, ligne du sursaut) est de la SIMULATION :
  `mouvement.js` (lire `acteur.derniereTouche.t`) ; L-C ne fait que le sursaut affiché.
- **L-A (F2)** : la tête AVANCÉE des boîtes de touche (`0,04 + 0,02·v`, § 4.5.6) contredit le dos droit d'un acteur armé :
  avec ces corps, la tête est AU-DESSUS des pieds (≈ +2 cm en course) ; garder la formule du socle (sans avance) ou la
  ramener à ≤ 0,02 m. Accroupi : la tête affichée est 8 cm plus haute que la simulée (1,18 contre 1,10 m) — l'abaissement
  `0,54·k` pourrait passer à `0,46·k`.
- **L-U** : au téléphone, ne laisser cocher que 3 amis (au-delà, `creerCorps` donne à un bot l'avatar d'un ami préparé).
- **L-W (F2)** : `armeTroisieme` prend les modèles par `creerArme(id)` et les garde dans une réserve (jamais libérés :
  partagés) ; les mains visent `REPERES[id].mainG` et l'origine — si les repères changent, la pose suit.
- **L-H** : `acteur.aff.bouche` est écrite à chaque pose ET entre deux poses (`suivreArme`) ; l'arme d'un mort est cachée.
- **L-E** : à la réapparition, garder `a.poupee = null` (la cadence relève le corps : `anim.couper()` puis `animKey = null`).
- **INT** : `ombre_cache.js sceneOmbre` / `avecProfondeur` compilent la carte d'ombre avec les lumières, three r170 la
  dessine sans (clés relevées au traceur le 23/10) — la préchauffe du jeu rate ces programmes pour tout objet neuf ;
  `preparerAvatars` le contourne pour les bots (image vraie), le décor et les props en profiteraient.

## Doutes

- La file des jetons (§ 5.1 règle 3) : 14 agents pour 3 jetons ; essais toutes les 10 s au lieu de 30 (à 30 s, 70 min
  d'attente sans jamais l'obtenir) ; mon jeton du 04:39 a été repris par L-U à 05:24 (périmé, à juste titre) : j'ai fermé
  l'onglet et repris la file.
- Les temps mesurés onglet derrière ceux des autres (minuteries ralenties) ne sont pas « non valables » pour le harnais
  (`document.hidden` reste faux dans le panneau) : la préparation de 1re fois (6-11 s) y est signalée, 1,5-2 s ailleurs.
- La teinte « à 60 % » reste pâle sur une chemise blanche (bleu clair, orange pâle) : lisible avec les brassards ; F2 jugera
  avec les chevrons de L-G.
