# Rapport L-V — l'arme de vue (vague 2)

Branche `lot/L-V` (depuis `socle` = `socle-ok`, e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-V`, port 8134 ; 23/10/2026.
Fichiers : `js/jeu/viewmodel.js`, `js/jeu/anim_vue.js` (remplis), `js/jeu/tests/test_viewmodel.js` (créé), ce rapport.

## Relecture (relecteur sévère, 23/10/2026) — où j'en suis

**EN COURS** (repreneur : reprendre ici). Jeton 2 pris à 06:41. Rejoué sur `3b2e79f` : `&rapport=1&lot=L-V` **17/17** PC
(1280 × 720, haute, 29 s) et **17/17** `?tel=1` (375 × 812, moyenne, 27 s), 0 signalé ; `&lot=S0` **29/29** (balade 0 / 0
avant et après). Corrections faites (voir « Relecture : ce qui a été corrigé » plus bas, à écrire) ; reste : jouer avec
les vrais modules de L-A, L-B, L-W (copie hors git), photos, rapport.

## Où j'en suis

**FINI** (757f08e et ce rapport). Les six points de la définition de « fini » (§ 5.1 règle 5) sont tenus : (a)
`&rapport=1&lot=L-V` **15/15 sur PC** (1280 × 720, haute) **et 15/15 sous `?tel=1`** (375 × 812, moyenne), 0 signalé ;
(b) `&rapport=1&lot=S0` **29/29** sur la branche (balade au bit près avant et après les parties) ; (c)
`python -I tools/verifier_proprietaires.py lot/L-V` → `OK 4 fichiers` ; (d) commits préfixés `L-V : …` avec la ligne
d'attribution ; (e) ce rapport, commité ; (f) onglet fermé, serveurs (8134, 8234) arrêtés, jeton rendu (voir « Incident : le jeton du navigateur »).
Un repreneur n'a rien à finir ; F2 rejoue les deux tests `apresFusion` (vraies armes de L-W, recul et gestes de L-A/L-B).
Outils de session, non commités : `C:/Users/hgami/AppData/Local/Temp/claude/C--/d2516763-f01d-443a-9d38-fe9a0c124e7f/scratchpad/lv/`
(`recepteur.py`, port 8234 : reçoit les photos du navigateur ; `planche.py` : planches-contact ; `photos/`). La maquette des
armes est DANS `js/jeu/tests/test_viewmodel.js` (`maquette`, `poserMaquettes`).

## Ce qui est fait

**`viewmodel.js` (≈ 800 lignes)** — le `Viewmodel` du § 4.5.9, signatures du socle gardées (`constructor(game)`,
`preparer(progres)`, `get superposition`, `montrer`, `cacher`, `maj(dt, etat)`, `vitrine(idArme)`), plus des AJOUTS
(règle 3) : `inspecter()`, `versMonde(nom, out)`, `liberer()`, `diag` (lu par les tests), exports `CHAMP_VUE`,
`CHAMP_VISEE`, `ANCRES`, `PORTEE_EPAULE`, `MARGE_BORD`, `PRISES`, `CLE_PIECE`, `couperBras`.
- **Bras** coupés dans `haythem.glb` (`banc/bras_fps.js` recopié et taillé) : triangles dont les 3 sommets sont à > 50 %
  sur `/^(Left|Right)(Arm|ForeArm|Hand)/`, sur `avaturn_body` ET `avaturn_look`, géométrie COPIÉE, matériaux clonés,
  cheveux et chaussures RETIRÉS : **5 083 triangles, 2 appels** (PC et `tel/`). Le buste est posé une fois (de profil,
  l'épaule gauche en avant, sur la ligne des ancres) ; les os des bras en sont DÉTACHÉS (`Object3D.attach`) sous un groupe
  `épaules` au repère de la scène : chaque image, ils repartent de leur repos, l'os de chaque bras est posé SUR son ancre,
  `ikBras` (exacte) met le poignet sur sa prise, coudes vers (0,3 ; −1 ; 0,2) et (−0,4 ; −1 ; 0) (CoD § 6.3).
- **Ancres d'épaule** D (0,20 ; −0,26 ; −0,05), G (−0,02 ; −0,25 ; −0,30) : tirées vers la prise quand elle est à plus de
  0,45 m, puis redescendues à 5° (4° + 1° de marge) sous le bord bas de la caméra de l'arme (52°).
- **Prises** (`PRISES`, repère de l'arme) : poignet, doigts, paume, flexion des doigts (index sur la détente, replié au
  tir) — poignée, garde-main, pompe (la main suit sa course de 9 cm), deux mains du P-17, chargeur, arrêtoir, levier du
  TP-50 ; main libre (hors champ) ; main qui tient un objet. Doigts lissés 0,06 s d'une prise à l'autre ; pouces compris.
- **Poses** `POSES_VUE` mêlées par poids lissés (sprint, sprint tactique, glissade, franchissement ; pas de sprint pendant
  un geste) ; **visée** : le repère `visee` de l'arme sur l'axe à 0,24 m (mesuré : ± 0,2 mm, ± 0,9 px), champ de l'arme
  52° → 44° en visée.
- **Ressorts intégrés EXACTEMENT** (solution analytique sur `dt` : la même courbe à toute cadence) : inertie du regard
  (−0,0016 × ω en °/s, ±3°, ω 18, ζ 0,8 ; × 0,35 en visée), balancement en huit (12 mm à f/2, 8 mm à f, f = 1,15 + 0,35 v ;
  sprint × 2,5, visée × 0,1, accroupi × 0,7), pas chassé 3°, réception −2,5 cm (ω 22, ζ 0,7) et petit saut au départ, recul
  visuel (piston, cabré, roulis ; ω 35, ζ 0,55 — le pic vaut exactement la fiche), respiration ±1,5 mm à 0,25 Hz.
- **Gestes** lus dans l'état de l'arsenal : recharges au chargeur (le chargeur part avec la main gauche à 0,55 s et revient
  EN PLACE à l'heure des balles entrées de la fiche), à vide avec l'arrêtoir, FP-12 cartouche par cartouche + pompe à vide,
  pompe après chaque coup, culasse du TP-50 0,25 s après le coup (main droite au levier, 60°, 8 cm), glissière du P-17
  (3 cm au tir, bloquée en arrière à vide), détente, changement d'arme (rangement de l'ancienne, sortie de la nouvelle
  avec dépassement), sortie de l'étui à la réapparition, couteau (lame vers l'avant-gauche, l'arme cachée), grenade
  (goupille, cuisson tenue, lancer, remontée), inspection. Un geste coupé (recharge annulée) s'éteint en 0,15 s, sans saut.
- **Scène de l'arme** : 3 lumières constantes (hémisphère, clé, bouche), clé PAR PIÈCE (`CLE_PIECE` : −1 et couloirs
  sombres 0,55, rue 1,25…, lissée 0,4 s ; l'environnement et l'hémisphère la suivent), éclair de bouche 50 ms par coup à la
  bouche de l'arme ; **PMREM de studio À ELLE** (`RoomEnvironment`, fait une fois) ; programmes compilés pour les DEUX cibles
  (tampon du composer et écran) : 20 variantes, constantes de Basse à Ultra.
- **Lunette** du TP-50 : cachée à 85 % de visée. **Vitrine** : l'arme seule qui tourne (0,6 rad/s) au rendu de SA scène
  (`Scene.onBeforeRender` : elle tourne au menu, où personne n'appelle `maj`), sa superposition à elle ; elle se prépare si
  besoin. **Écran étroit** (téléphone en hauteur) : la caméra de l'arme tourne vers l'arme, revient dans l'axe en visée.
- **Coût** : `maj` 0,07 à 0,1 ms par image (relatif ; 0,20 avant d'avoir détaché les bras du buste et figé les os fixes).

**`anim_vue.js` (≈ 250 lignes)** — `POSES_VUE` (§ 4.5.9, avec `bal`), `POSES_ARMES` (ajout : hanche du P-17), `VOIES` /
`VOIES_MAIN` (les voies d'une piste, 0 = repos), `piste(duree, cles, voies, ancres)` (une voie absente garde sa valeur ;
temps RECALÉS par ancres), `recaler`, `evaluer(piste, t, out)` (**Hermite cubique monotone**, Fritsch-Carlson : aucune main
qui rebondit à travers l'arme), `CHRONOS` (FA-24 écrite d'après CoD § 6.4, portée sur PM-9, TP-50, P-17 par les ancres
début / chargeur parti / `recharge.ajout` / fin ; FP-12 debut, cartouche, fin, pompe, après le tir ; TP-50 après le tir ;
sortie = la réponse d'un ressort ω 20, ζ 0,6 échantillonnée ; rangement ; couteau ; grenade ; inspection).

**`tests/test_viewmodel.js` (≈ 520 lignes)** — les 15 points du § 5.5.4 et 2 tests `apresFusion` ; l'arme de vue se pilote
par des ÉTATS FABRIQUÉS (`etat(o)`) pour les gestes que l'arsenal du socle n'a pas ; la MAQUETTE (cotes de CoD § 6.2) sert
au réglage des mains et aux photos.

## Le `__rapport`

PC (`http://127.0.0.1:8134/?test=1&rapport=1&lot=L-V`, 757f08e) : `ok: true`, `total: 15`, `echecs: []`, `signales: []`,
`ms: 74 127`, qualité high. Sous `?tel=1` (émulation 375 × 812) : `ok: true`, `total: 15`, `echecs: []`, `signales: []`,
`ms: 30 655`, téléphone, qualité medium.

| # | Critère (§ 5.5.4) | PC | `?tel=1` |
|---|---|---|---|
| 1 | appels ≤ 8 | 149 états, max 4 (grenade à 0,1 s : bras 2 + boîte + grenade) ; hanche 3 ; bras 2 maillages | idem |
| 2 | 3 lumières pendant 60 s | 3 (hémisphère, clé, bouche), 0 image fautive sur 3 600 (50 états) ; scène de jeu 8 → 8 | idem, 6 → 6 |
| 3 | programmes constants 10 s | arme 20 → 20 · jeu 146 → 146 (380 images, qualité figée) | arme 20 → 20 · jeu 85 → 85 (570 images) |
| 4 | épaules ≥ 4° sous le bord bas | pire 8,0° (FP-12, sprint tactique) sur 1 702 ancres | pire 6,7° |
| 5 | IK ≤ 1 / 2 cm | 0 cm (exacte, ≈ 1e-8 m) sur 851 mesures | idem |
| 6 | visée sur l'axe à 0,24 m, ± 1 px | ≤ 0,23 mm, ≤ 0,86 px (5 armes ; la respiration × 0,1) | ≤ 0,04 mm, ≤ 0,15 px |
| 7 | chargeur parti 0,55 s, en place 1,35 s | fabriqué 0,567 / 1,350 ; vraie recharge 0,558 / 1,342, balles entrées 1,350 | idem |
| 8 | recul visuel ± 5 %, < 2 % en 0,25 s | piston et cabré = fiche (2,8 cm / 2,2° … 6 cm / 8°), retour 0,20 s | idem |
| 9 | TP-50 caché à 85 % | 0,84 montrée · 0,85 cachée · 1 cachée · 0,5 montrée · FA-24 montrée | idem |
| 10 | `maj` ≤ 0,15 ms ; 0 NaN | 0,086 ms ; 0 NaN sur 10 000 états | 0,089 ms ; 0 |
| 11 | bras ≤ 6 000 tri. ; Haythem inchangé | 5 083 triangles, 2 maillages ; empreinte identique | idem |
| 12 | après l'œil, léger, sans composer | 1 / 1 (léger vrai) / 1, après l'œil ; 3 photos | idem |
| 13 | six photos | 6 différentes | 6 différentes |
| 14 | environnement fixe, programmes constants | même PMREM ; 20 → 20 de Basse à Ultra et retour ; 0 texture libérée sur 8 | idem |
| 15 | vitrine au menu | superposée, lacet 0,018 → 0,065, arme seule, lumières du jeu 8 → 8, retirée | idem |

`&rapport=1&lot=S0` sur la branche (PC, 2992335 — la suite ne touche que le test 3 de L-V) : `ok: true`, 29/29, 0 signalé,
127 s ; balade au bit près (1 et 27 : vue 3 0 / 0, vue 1 0 / 0) ; 8 : programmes 147 → 147, géométries 1 579 → 1 579 ;
14 : la passe superposée après l'œil, composer 1, sans composer 1.
`python -I tools/verifier_proprietaires.py lot/L-V` → `OK 4 fichiers (lot/L-V, L-V, base socle)`.

## Écarts au document (§ et ligne de `spec_finale.md`)

1. **Ajouts aux contrats** (règle 3, § 4.1 l. 670) : `Viewmodel.inspecter()`, `versMonde(nom, out)` (le point de la scène
   de JEU qui se projette au pixel du repère de l'arme : pour l'éclair et la douille de L-H), `liberer()`, `diag` ;
   `anim_vue.js` : `POSES_ARMES`, `VOIES`, `VOIES_MAIN`, `piste`, `recaler` ; `CHRONOS[arme]` a en plus `apresTir` (FP-12,
   TP-50) et, pour le FP-12, `debut / cartouche / fin / pompe` (au lieu de `rechargeTact / rechargeVide`, nuls).
2. **Champ de l'arme en visée 52° → 44°** (CoD § 6.4 ; le § 4.5.9 l. 1190 ne dit que 52°) : l'arme « vient à l'œil ».
   Les épaules sont vérifiées contre 52° (le plus large) ET le champ du moment.
3. **Pose de hanche propre au P-17** (`POSES_ARMES`, l. 1208 n'en donne qu'une) : à la pose du fusil, la main et la
   glissière sortaient du cadre ; (0,095 ; −0,075 ; −0,40) rot (0,04 ; 0,07 ; 0).
4. **Recharges** : la FA-24 garde « roulée de 25°, cabrée de 15° » (l. 1213) ; j'y ajoute un DÉCALAGE (−4 ; +3,5 ; −3 cm)
   pour que le puits du chargeur et la main soient à l'écran ; les autres armes ont leurs angles à elles (`GESTES`).
5. **Le recul visuel** (§ 3.4 l. 448, § 4.5.6 `reculV/H`) : l'arme de vue prend le `reculV` de l'Arsenal dès qu'il n'est
   pas nul (alors la caméra, qui en reçoit 15 %, et l'arme montrent le même cabré) ; tant qu'il est nul (le squelette), elle
   a SON ressort (ω 35, ζ 0,55, pic = la fiche). Le piston suit le cabré dans le rapport de la fiche ; le roulis est le sien.
6. **Ce que `etatArme()` ne dit pas** (§ 4.5.7 l. 1151) est LU DANS L'ARSENAL de l'acteur local (de l'état, jamais une
   règle) : l'arme qui vient (`vers`), la durée du geste (`fin − t0`), tactique ou à vide (`tact`), le compte des tirs
   (`tirSeq`), le chargeur, et, pour la grenade, `cmd.letale` (cuisson) / `cmd.tactique` (flash) ; la vitesse de côté depuis
   `corps.vel` et `camYaw`. Un champ de même nom dans `etat` passe devant (les tests, et L-B s'il les ajoute).
7. **L'inspection** (CoD § 6.4 : « tenir R 0,6 s ») n'a pas de déclencheur : `maj` ne lit jamais l'entrée (L-B : seul
   `lireCommande` le fait) et `cmd.recharger` est un front. `inspecter()` est là ; à brancher (demande).
8. **Pas d'éclair visible dans la scène de l'arme** : un quad de plus ferait 9 appels avec une vraie arme de 6 (critère 1).
   L'éclair visible reste aux effets de L-H (`versMonde('bouche')`) ; la `PointLight` de bouche éclaire l'arme et les mains.
9. **Rien de dessiné en plus** pendant la recharge du FP-12 (la cartouche dans la main) ni le chargeur vide qui tombe dans le
   monde (CoD § 6.4) : appels comptés, et le monde est aux effets (L-H).
10. **Pivot des rotations** : les poses tournent autour de la PRISE de la main droite (l'origine de l'arme) — la spec ne le
    dit pas. Conséquence vue sur la maquette : la pose de **sprint** du § 4.5.9 (l. 1209 : canon vers le bas, (0,06 ; −0,19 ;
    −0,25)) laisse l'arme presque hors champ, et toute pose plus haute amène la crosse à 12 cm de l'œil. Gardée telle
    quelle (une donnée de contrat) ; à revoir sur les vrais modèles de L-W (doute ci-dessous).
11. **Pouces** : `AvatarRig` ne prépare pas les pouces (`FINGERS`) ; j'appelle `rig._prep('…HandThumb1-3')` juste après sa
    construction (une méthode interne de `js/avatar.js`, lue, pas modifiée).
12. **Test 7, la vraie recharge** : ± 2 images (le relevé est fait entre deux images de 1/60 s) ; ± 1 image avec l'état
    fabriqué, comme écrit.
13. **Test 8** : « la caméra reçoit 15 % du cabré » est mesuré à F2 (`F2 recul…`) : avec l'Arsenal du socle, `reculV` est
    nul et VueFPS (L-B) ne cabre pas la caméra.
14. **La visée est lue telle quelle** (`etat.visee`) : la courbe `1 − (1 − t)³` est celle de l'Arsenal (§ 3.2 l. 359,
    L-A) ; l'arme de vue n'en ajoute pas une 2e (avec le squelette, le passage est donc linéaire).

## Demandes

- **L-B** (`VueFPS.etatArme`) : ajouter `vers` (id de l'arme qui vient), `duree` (du geste en cours), `tactique`,
  `tirSeq`, `chargeur`, `grenade` (`'frag' | 'flash'`), `cuisson` (goupille tirée, tenue), `lateral` (m/s sur la droite du
  regard) — l'arme de vue les lit d'abord, l'arsenal ensuite (écart 6).
- **L-A** : l'état `'lancer'` couvre goupille + cuisson + lancer (l'arme de vue lance sa piste de lancer au relâché) ; ou
  un champ `lancerType` / `lancerT` sur l'Arsenal. `reculV` : le ressort de la fiche (ω 35, ζ 0,55, pic = `recul.cabre`) —
  F2 le vérifie contre celui de l'arme de vue (± 5 %). `'couteau'` : `tEtat` depuis le coup (la touche à 0,12).
- **L-W** : les os (`chargeur`, `culasse`, `glissiere`, `pompe`, `detente`, `goupille`) enfants de l'arme, au repos à la
  création (l'arme de vue les déplace depuis ce repos, repère de l'arme) ; les prises de `PRISES` supposent les cotes de
  CoD § 6.2 (poignée sous l'origine, chargeur de la FA-24 vers (0 ; −0,17 ; −0,14), etc.) : F2 compare.
- **L-H** : l'éclair et la douille de Haythem par `aff.viewmodel.versMonde('bouche' | 'ejection')` ; le chargeur vide qui
  tombe (recharge à vide).
- **F2 / INT** : brancher l'inspection (`aff.viewmodel.inspecter()` sur R tenu 0,6 s, chargeur plein) ; revoir la pose de
  sprint sur les vrais modèles (proposition si la crosse gêne moins : (0,06 ; −0,15 ; −0,30) rot (−0,40 ; 0,65 ; 0,35)).

## Incident : le jeton du navigateur
- J'ai pris `jeton_3` au début de ma série et gardé un seul onglet ouvert toute la session (sans rafraîchir `qui.txt`).
  L-B l'a repris à 03:51 comme « périmé » (plus de 45 min, § 5.1 règle 3) alors que mon onglet était encore ouvert : nous
  avons partagé ce jeton (4 pages de jeu possibles). En rendant le mien à la fin (04:13), j'ai supprimé `jeton_3`, qui
  portait alors le `qui.txt` de L-B ; L-A l'a repris 17 s plus tard (04:12:50). L-B croit encore le tenir. Note laissée :
  `C:/Users/hgami/Downloads/IRIS_lots/_navigateur/NOTE_L-V_jeton3.txt`. Leçon (pour la règle 3) : un agent qui garde
  sa page plus de 45 min réécrit son `qui.txt`, et l'on ne supprime un jeton qu'après avoir relu que `qui.txt` est le sien.

## Doutes

- Toutes les prises (`PRISES`) ont été réglées sur la MAQUETTE ; les vrais modèles de L-W peuvent demander de les retoucher
  (une table, en tête de `viewmodel.js`). Test `F2 vraies armes` : repères de L-W = table ± 1 mm, mains ≤ 1 cm, ≤ 8 appels.
- Les avant-bras sont nus (la tenue de Haythem est à manches courtes) : c'est « la vraie tenue » de l'arbitrage 11.
- Les temps sont relatifs : d'autres agents tournaient ; l'onglet n'était pas devant (images faites à la main).

## Photos regardées

Dans `C:/Users/hgami/AppData/Local/Temp/claude/C--/d2516763-f01d-443a-9d38-fe9a0c124e7f/scratchpad/lv/photos/` :
- les six du critère 13 avec la BOÎTE du socle (l'état de la branche) : `rapport_socle_{hanche,visee,sprint,sprintTact,recharge09,glisse}.jpg`
  (planche `p_rapport_socle.jpg`) ;
- les mêmes avec la MAQUETTE : `m_{hanche,visee,sprint,sprintTact,recharge09,glisse}.jpg` (planche `p_maquette6.jpg`) —
  hanche : la main gauche sous le garde-main ; visée : le point rouge au centre ; sprint : l'arme baissée hors champ ;
  tactique : l'arme levée contre l'épaule ; recharge à 0,9 s : l'arme roulée, la main gauche à la ceinture ; glissade ;
- en jouant (vraies commandes) : `j_course_tir`, `j_visee_tir`, `j_recharge`, `j_change`, `j_p17`, `j_sprint_p17` ;
- gestes : `p_r.jpg` (recharge pas à pas), `p_k.jpg` (couteau, arrêtoir, P-17, FP-12), `p_h.jpg` (hanche des cinq armes) ;
- au −1 (clé 0,55) : `ss_hanche`, `ss_tir` ; téléphone en hauteur : `tel_hanche2`.
