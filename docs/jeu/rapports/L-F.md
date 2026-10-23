# Rapport L-F — les règles du prop hunt et ses sons (vague 2)

Branche `lot/L-F` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-F`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8139 ;
23/10/2026. Fichiers du lot : `js/jeu/partie_prop.js`, `js/jeu/sons_prop.js`, `js/jeu/tests/test_prop.js`, ce rapport.

## Relecture (relecteur sévère, 23/10) — où j'en suis

**EN COURS (repreneur, 08:04).** Jeton 3 repris (pris à 07:24:29 par la session coupée, rafraîchi), serveur 8139 relancé,
onglet `tab-35`. 1er `&lot=L-F` sur `a0a54e4` : **16/17** — le test 3 échouait (« témoin : 0 reçus à la traque ») : depuis
`44bdcf7`, l'oreille du chasseur est enveloppée à SA création et l'espion du test, posé après, ne voyait plus rien (le « 0 son
reçu en cachette » était vide de sens). Corrigé en `2553a46` avec : la vue, l'arme de vue et les touches de Haythem suivent
son rôle À L'IMAGE (`_suivreRole`, au début de `camera`) au lieu d'un appel depuis `regles` (§ 4.1 règle 5 ; un état rendu
qui change son rôle est suivi aussi) ; `arsenal.bloque` (hors de l'état) déduit de la phase à la fin d'`appliquer` et dès la
présentation ; endurance remise à 100 à chaque manche ; options de l'appelant copiées. `&lot=L-F` → **17/17** (31 s).
Reste : S0 (PC, `?tel=1`), L-F `?tel=1`, le jeu en vrai.

Relu par la session coupée : la spec (§§ 2.7-2.9, 3.9, 4.1, 4.3, 4.5.5, 4.5.13-4.5.17, 4.6, 4.7, 4.10, 5.1, 5.5.9) et tout le diff
`socle...lot/L-F` ; `verifier_proprietaires` OK (4 fichiers). Corrigé à la lecture (commits « L-F relecture : … », de
`74bc40a` à `eb084a4`) : l'état garde les colonnes du prop hunt (survie, provocations, vrais meubles) ; un prop figé (ou
verrouillé) le reste en changeant de forme ; le scanner refusé avec sa raison hors de la traque ; « Voir les sons » ne
montre que ce qu'on entendrait (rayon de la provocation, `dalle`) ; Haythem éliminé qui suit un prop : l'orbite aux chiffres
du prop ; le chasseur bot sourd enveloppe SON oreille (pas celle du prototype) ; l'atténuation de secours bornée à 60 m ; au
téléphone 5 bots au plus. Tests 2, 8, 10 complétés. Serveur 8139 lancé ; reste : un jeton du navigateur (tous pris depuis
06:15), puis L-F et S0 (PC, `?tel=1`) et le jeu en vrai.

## Où j'en suis

**FINI** (les six points du § 5.1 règle 5) :
- (a) `&rapport=1&lot=L-F` : **17/17 sur PC** (54,6 s, 0 signalé) et **17/17 sous `?tel=1`** (émulation 375 × 812, 49,1 s,
  0 signalé), sur le dernier code (`8e8d87e`) — les 16 critères du § 5.5.9, plus 14 bis (chaque son rendu hors ligne) ; 3 tests `apresFusion` pour F2.
- (b) `&rapport=1&lot=S0` sur la branche : **29/29 sur PC** (86,9 s) et **29/29 sous `?tel=1`** (78,4 s), 0 signalé ; balade
  au bit près (points 1 et 27 : 0 / 0, vue 3 et vue 1), point 25 « 40 tirs de test, props 33 % pour 33 % des candidats ».
- (c) `python -I tools/verifier_proprietaires.py lot/L-F` → OK (fichiers et pureté).
- (d) commits préfixés « L-F : », lignes d'attribution ; (e) ce rapport ; (f) onglet et serveur fermés, jeton rendu.

Joué pour de vrai dans le navigateur intégré (`?partie=prophunt&zone=e1`, sans `?test=1`, vrai `AudioContext`) : une partie de
6 manches menée jusqu'à l'écran de fin — voir « Le jeu en vrai ». Ce qui reste n'est pas à L-F : voir « Demandes ».

Un repreneur : `cd C:/Users/hgami/Downloads/IRIS_lots/L-F`, `git log --oneline socle..` ; serveur `python serve.py 8139` ;
page `http://127.0.0.1:8139/?test=1&rapport=1&lot=L-F`.

## Ce qui est construit

**`js/jeu/partie_prop.js` — `PartieProp`** (§§ 2.7-2.8, 3.9, 4.5.14) :
- **Manches** (4 / 6 / 8, 1 à 12 admises), **rôle de Haythem alterné**, premier rôle prop / chasseur / au hasard SEMÉ (un `Rng`
  à lui : voir « Écarts » 1). Les champs absents des options viennent des derniers choix (`settings.jeu.prop`), puis des défauts.
- **Composition** : chasseurs = arrondi(N/3). Les acteurs vivent toute la partie : Haythem (id 0) ; les bots qui chassent un
  jour (les arrondi(N/3) premiers : un `Player` d'élève chacun, garé quand ils sont meubles) ; les bots toujours props (un
  `CorpsProp` seul, **jamais d'avatar**, arbitrage 19 — `_ajouterPropBot`, sans `ajouterActeur` qui crée un `Player` à chacun).
  Haythem prop : lui + props bots c. arrondi(N/3) chasseurs bots ; Haythem chasseur : lui + arrondi(N/3) − 1 coéquipiers (un
  cran moins doués : `DIFFICULTES_PROP[d].coequipier`), celui qui est mis au repos tourne d'une manche à l'autre ; « chasseur
  seul » : il chasse seul. Noms : ceux des amis (le tableau des rôles et le fil en ont besoin), corps : l'ami coché ou Haythem cloné.
- **Phases** : présentation 3 s (tout le monde figé ; les props bots déjà en meubles) → **cachette** (durée de la zone, § 3.9 ;
  les props seuls bougent ; changements illimités ; « 10 SECONDES ! ») → **traque** → **révélation** 6 s → manche suivante,
  ou **fin** (`fin` : `gagnant` = l'id du meilleur total, `scores` = { points, manches, classement }). Les durées se comptent en
  PAS (`_fini`, `_franchi`) : 35 s de cachette au 1er = 35 s ± 0.
- **Chasseurs pendant la cachette** : figés à leur départ (tournés vers le cœur de la zone), arme BLOQUÉE (ni tir, ni recharge,
  ni changement), caméra fixe (celle de `Partie.camera`), `hud.prop.cachette` rempli (chrono, zone, manche, tableau des rôles
  avec les scores, deux astuces qui changent toutes les 8 s) — y compris pendant la présentation, pour que le panneau de L-G
  soit là dès la 1re image —, et **SOURDS aux props** : le cerveau de chaque chasseur bot est enveloppé (`entendre` filtré par
  `PartieProp.sourd(e)` : rien d'un prop, ni provocation, frottement, « pouf », défigement, avant la traque) ; Haythem
  chasseur n'entend rien non plus (`SonsProp`, muet pour lui).
- **Le lâcher** : un prop resté humain est déguisé d'office en le type le plus courant de SA pièce (parmi les déguisables de
  la zone), sinon de la zone, sinon le carton ; si la place manque, le suivant. Annonce « LES CHASSEURS SONT LÂCHÉS ».
- **Se déguiser** (E) : le meuble visé (ou le coéquipier visé) ; rien de visé : un humain prend le type le plus courant de sa
  pièce (un bot, le sien), un meuble ne change pas (on ne gâche pas un changement) ; viser sa propre forme ne fait rien ;
  « Pas la place » → il reste ce qu'il était. Traque : **3 changements, 5 s entre deux** (compteur `prop.changements`, remis à 0
  au lâcher). **Se figer** (F) ; se défiger prend **0,25 s** et craque (`defige`). **Verrou** (R) : la bascule (l'aimantation est
  à L-K, dans `deplacerProp`).
- **Provocations** : obligatoire toutes les **40 s** (la 1re 40 s + 0-15 s semés après le lâcher), **20 s dans la dernière
  minute**, **25 s pour le dernier prop** (le plus court des deux s'il y a lieu), au **sifflet**, rayon × 1,3, sans points ;
  volontaires (roue, chiffres, G = la dernière) : **4 s** de recharge, compteur de l'obligatoire remis à zéro, leurs points
  (× 2 si un chasseur est à moins de 10 m) ; seulement pendant la traque (avant : refus, « c'est pendant la traque »).
- **Scanner** (X) : 3 charges, 8 s entre deux, chaque prop vivant à moins de 12 m AU MÊME NIVEAU → sa direction (± 20° semés,
  monde `dir` et relative au regard `rel`) et sa bande (< 4 / < 8 / < 12 m) ; jamais qui, jamais un meuble.
- **Tirs** (`resoudreTir`, trois listes) : la balistique rend le monde ou un prop (sa boîte) ; `poseTouchee(…, t + 0,03)` (=
  `toucherPoses` de L-K) rend la vraie pose ; prop d'abord → dégâts + **soin** (25 % de ce qui est VRAIMENT fait, plafond 100) ;
  vraie pose déguisable d'abord → impact `mat: 'meuble'` + effet `faux` ; sinon le monde (`Partie.resoudreTir`). Tout DIFFÉRÉ
  (6b) : `appliquerEffet` ajoute `faux` et `soin` ; **−3 PV par balle, −1 par plomb, −6 au plus par coup** (les 8 plombs d'un
  FP-12 : une seule annonce « faux », `pv` 6, `n` 8) ; **−2 points par coup**. Grenade : rien (elle ne passe pas par
  `resoudreTir`). Chasseur à 0 PV : éliminé « par les meubles » (`elim`, `par === cible`, `arme: 'meuble'`), spectateur
  jusqu'à la fin de la manche. Personne ne tire hors de la traque (`peutTirer`).
- **Points** (§ 3.9) : prop — +10 par 30 s de survie en traque, provocation volontaire, +50 manche survécue, +25 au dernier
  (seul survivant) ; chasseur — +100 prop éliminé, +40 l'aide (un autre chasseur à ≥ 25 % des dégâts du prop), −2 par coup
  dans un vrai meuble ; +50 à chaque membre de l'équipe gagnante (morts compris). Événements `score`.
- **Fins** : props tous morts → chasseurs ; chrono à 0 avec un prop → props ; chasseurs tous morts → props.
- **Profil de touches** changé ET purgé à chaque nouvelle manche (`game.appliquerProfil({ purger: true })`), la vue suivie
  (VueFPS + arme de vue pour le chasseur ; orbite pour le prop), le regard posé.
- **Spectateur** (Haythem éliminé) : un coéquipier vivant, saut / déguiser / un clic = le suivant.
- **Caméra du prop** : orbite aux chiffres du prop (pivot max(0,5 ; 0,75 h), recul clamp(1,4 + 1,6 max(l, h, p), 2,0, 3,6)) ;
  Haythem prop encore humain est posé une fois par image si la cadence ne l'a pas fait (celle du socle ne pose jamais
  l'acteur local) ; le calque « CLIQUE POUR JOUER » au début de la cachette (clavier-souris sans capture : la souris vise).
- **Saisie de la roue** (hors simulation, hors état) : celle du socle, fermée dès que Haythem n'est plus un prop vivant.
- **`hud.prop`** rempli à chaque image (jauges 4 fois par seconde) : forme, nom, changements restants, `changementsIllimites`,
  `changementT`, verrou, figé, `provocT`/`provocMax`/`provocPrete`, **discrétion** (`credibilite`, la formule des bots),
  **œil** (le soupçon du cerveau d'un chasseur s'il en dit un — `cerveau.oeil(acteur)`, L-O —, sinon la part du regard : à
  ≤ 18 m, cône de 50°, ligne de vue), `vise` (le meuble visé : « E : devenir … »), scanner (charges, recharge, derniers
  résultats 2 s), restants, rôle, roue, cachette, astuces (prop), manche, zone, `zoneRemplacee`, `refus` (1,5 s),
  `revelation` (les survivants nommés, à leur place), `resultat`, aides, `sons` (« Voir les sons » : provocations des 2
  dernières secondes), `spectateur`. `hud.classement` : + trouvés, survie, provocations, vrais meubles. `hud.allies` des props :
  au-dessus du meuble.
- **État** (§ 4.7, + `pp`) : `etat()` ajoute `pp` (manches, rôles, résultats, gagnant, et par acteur : provocations, défigement,
  changement, scanner, dégâts reçus par chasseur, coéquipier) ; `appliquer()` refait les RÔLES (corps, arme, cerveau) et les
  déguisements d'abord, puis la base, puis les compteurs — vérifié en cachette, traque, révélation, et à la manche 2 (Haythem
  chasseur, un chasseur bot devenu prop) dans une partie neuve encore à la manche 1.
- **Zone** : `ss` si `typesDeguisables('ss') ≥ 6`, sinon `e1` ; un choix explicite gardé tant qu'il n'est pas grisé, sinon
  remplacé (noté dans `zoneRemplacee`) ; `forcerZone` (tests) le garde.

**`js/jeu/sons_prop.js` — `SonsProp`**, `PROVOCATIONS` (inchangée), `REGLAGES_SONS`, `RECETTES_PROP` : les 8 provocations
synthétisées (coucou sifflé 1 320 → 1 100 Hz ; sifflet d'arbitre à bille, trille 28 Hz ; klaxon de poire ; canard ; rire
« hihihi » ; sonnerie électrique de l'école battue à 22 Hz ; ba-dum-tss ; téléphone 1 200 / 1 500 Hz) aux durées du § 3.9, et
les petits bruits (frottement, pouf, aïe, crac, bip, craquement, toc, « bonk » du vrai meuble pour le chasseur, sifflet du
lâcher, bips des 10 dernières secondes, ritournelles de fin de manche). Un bruit blanc d'une seconde par contexte audio (aucun
tampon par son). Règles : **à travers une dalle × 0,35 et passe-bas 900 Hz** (voix marquée `dalle: 'faite'`) ; au-delà de son
rayon, rien ; **Haythem chasseur n'entend rien des props avant la traque** ; tant que `sonsJeu.spatial` est faux (le squelette),
atténuation (modèle inverse de L-H : référence 2 m, atténuation 1,2) et gauche / droite (`StereoPannerNode`) faites ici. Le
« bip » du scanner : le chasseur qui scanne l'entend, un prop à moins de 12 m (même niveau) aussi. Un journal numéroté des sons
joués (`journal`, `n`, `muets`) pour les tests et la mise au point.

## Le `__rapport`

PC (`http://127.0.0.1:8139/?test=1&rapport=1&lot=L-F`) : `ok: true`, `total: 17`, `echecs: []`, `signales: []`, `ms: 54580`,
qualité high. `?tel=1` (375 × 812) : `ok: true`, `total: 17`, `echecs: []`, `signales: []`, `ms: 49123`, téléphone vrai.

| # | Critère (§ 5.5.9) | Mesure (PC ; `?tel=1` identique sauf mention) |
|---|---|---|
| 1 | phases, durées, rôles, premier rôle, zone par défaut | 25 phases dans l'ordre · traque de la manche 1 au chrono : 210 s · fin émise · prop → chasseur → prop, chasseur → prop · hasard (graines 1-6) chasseur, prop, prop, prop, chasseur, prop ; même graine, même rôle · zone par défaut e1 (réglage null) · e2 demandé → e1 (moins de 6 types) |
| 2 | composition | N 4…8 → 1, 2, 2, 2, 3 chasseurs dans les deux rôles de Haythem, props sans avatar · chasseur seul : 1 c. 4, puis 2 chasseurs bots quand il est prop |
| 3 | cachette | déplacement des chasseurs 0 m · 0 tir · caméra 0 rad · panneau (chrono 31,72, 5 rôles, 2 astuces qui changent en 8 s) · 0 son de prop reçu par un cerveau de chasseur · 4 sons tus, 0 joué · témoin à la traque : 15 frottements entendus, 15 reçus |
| 4 | lâcher | humain → `tabouret_fictif` (60 dans sa pièce contre 10 + 80 poubelles ailleurs), avatar caché ; registre vide → carton |
| 5 | vrai meuble, mur, grenade, 0 PV | PM-9 : 100 → 97, `faux` 3, −2 · FP-12 : 97 → 91, `faux` 6 (8 plombs), −2 · mur et sol 0 · grenade 0 · à 0 PV : éliminé (meuble), traque continue, suivi Imad · vivant à la manche suivante |
| 6 | soin | touche 26 → 50 + 6,5 = 56,5 · à 99 : 100 (soin 1) |
| 7 | fins | chasseurs / props / props, puis la révélation |
| 8 | changements | 6 en cachette (compteur 0) · traque oui, non (4,9 s), oui (5 s), oui, non (le 4e) |
| 9 | provocations | forcées au sifflet × 1,3 · décalages 0,03 / 5,42 / 2,73 s, puis 40 s, 20 s dans la dernière minute · dernier prop : 25,01 et 50,01 s après sa référence · canard +5 (compteur remis) · refusée à 2 s · sonnerie +10 à 4 s · sifflet +12 (chasseur à < 10 m) |
| 10 | scanner | bandes 0, 1, 2 (ni le prop à 13 m ni celui du RDC) · ± 20° · semé · refusé à 1 s, 3 scans, charges 0, « Scanner vide » · bip à 8 m : 1, à 14 m : 0 |
| 11 | barème | +10 · +6 · 2 × 100 et 1 × 40 (30 % ; rien à 20 %) · −2 · +50 +25 +50 au dernier prop, +50 au prop mort de l'équipe gagnante, rien au chasseur · +50 / +50 aux chasseurs gagnants |
| 12 | changement de rôle | prop (E déguiser) → chasseur (profil combat, R recharger, purge, fronts vidés) → prop |
| 13 | roue | 8 chiffres sans pas · souris et stick 0…7 · caméra immobile · T sans choix → −1 · provoc3 puis G : klaxon, klaxon · game.wheel fermée, 0 emote fantôme roue fermée et ouverte |
| 14 | sons | durées 0,6 / 0,7 / 0,8 / 0,9 / 1,2 / 1,6 / 1,0 / 1,4 · 20 recettes · 24 voix (tél. 12) · dalle 900 Hz, gain × 0,18 = 0,35 × l'atténuation à 3,5 m · frottement à 9 m : rien |
| 14b | rendu hors ligne (crête / efficace) | coucou 0,19/0,077 · sifflet 0,16/0,080 · klaxon 0,16/0,049 · canard 0,12/0,030 · rire 0,17/0,043 · sonnerie 0,13/0,045 · badumtss 0,36/0,040 · téléphone 0,07/0,041 · frottement 0,19/0,018 · pouf 0,41/0,044 · aïe 0,40/0,062 · crac 0,52/0,040 · bip 0,24/0,037 · craquement 0,11/0,011 · toc 0,23/0,040 · bonk 0,24/0,037 · lâcher 0,17/0,086 · bips 0,14/0,065 · ritournelles 0,16/0,051 et 0,09/0,034 ; aucun NaN |
| 15 | déterminisme, état | cf95cec3 / cf95cec3 · état vrai en cachette, traque, révélation (250 s) et à la manche 2 (294 s, Haythem chasseur) |
| 16 | chasseurs | `sprintLimite` vrai (chasseurs), faux (props) · double Maj et SOURIS 5 : pas de sprint tactique |

À F2 (`apresFusion`) : « catalogue réel » (zone par défaut et une balle dans une VRAIE pose → `faux` sur elle), « poursuite »
(le critère 16 entier : 6 m d'avance tenus 4 s, puis ≤ 0,5 m/s — il dépend du sprint à endurance de L-B et de la vitesse d'un
type de L-K ; le squelette sprinte sans fin), « sons spatialisés » (`sonsJeu.spatial`, panneau sur la voix).

S0 sur la branche : PC 29/29 (86,9 s) — 1 balade au bit près (0 / 0), 9 « état vrai · 03041e41 / 03041e41 · prop hunt vrai
(3 props déguisés) », 23 roue tout vrai, 25 « 48 élim., écart 1,97°, 40 tirs de test, props 33 % pour 33 % des candidats »,
27 et 29 vrais ; `?tel=1` 29/29 (78,4 s ; 25 : 34 élim., 40 tirs de test). (Un temps, S0 point 25 a échoué : les départs des
props évitaient les portes à 1,3 m et la pause orange du 1er n'en avait plus — ramené à 0,75 m, écart 5.)

## Le jeu en vrai (navigateur intégré, `?partie=prophunt&zone=e1&graine=3`, sans `?test=1`)

La machine était chargée (trois pages de jeu ouvertes, 3 à 4 images/s en haute puis moyenne : `Partie.pas` 0,09 ms,
`Partie.image` 0,48 ms — le rendu, pas le jeu) : la partie a été menée par `__jeu.commande` / `__jeu.avancer` et regardée à
chaque étape (captures d'écran du panneau). La capture du pointeur est refusée au panneau automatisé : le calque « CLIQUE
POUR JOUER » est bien venu au début de la cachette et la partie est restée gelée (fermé ensuite par `fermerCalque(true)`, le
chemin de la manette).
- Manche 1, prop : Haythem humain dans la pause orange (orbite), E → un carton à sa taille (caméra à 2,1 m, pivot 0,5 m),
  frottements entendus en courant (journal : `frottement` gain 0,60), figé dans le couloir du 1er, « 10 SECONDES ! », sifflet du
  lâcher, provocations forcées au sifflet à 40 s + décalage (78,0 / 78,7 / 88,6 s), +10 de survie toutes les 30 s, « DERNIÈRE
  MINUTE ! », révélation : « LES PROPS GAGNENT LA MANCHE » (Haythem 170 points : 7 × 10 + 50 + 50).
- Manche 2, chasseur : vue FPS et PM-9 (la boîte du squelette), Gabriel (chasseur de la manche 1) devenu prop (son Player
  caché, un carton), Imad chasseur, profil combat. Cachette : panneau rempli, rien entendu des props (0 son), sifflet + bips.
  Traque : scanner → un arc à < 4 m ; trois balles dans le carton de Koji → « aïe » × 3, « crac », +100, soins 6,5 + 6,5 + 6,25.
- Six manches jusqu'à l'écran de fin (8 s de simulation pure pour 1 524 s de jeu) : `fin` émis, Marc-Antoine 1 020 points.
- Console : seule l'erreur connue du service worker.

Défauts trouvés en jouant et corrigés : le premier rôle « au hasard » était toujours « prop » (écart 1) ; un prop pouvait
partir dans une porte (les départs évitent maintenant les 46 passages, à 0,75 m de leur centre) ; les chasseurs regardaient
le mur du palier au départ (tournés vers le cœur de la zone) ; un élève qui finissait la manche en poupée restait
caché la manche suivante (montré, clips coupés) ; Haythem prop humain n'était pas animé (posé par `PartieProp.image`).

## Écarts au document

1. **Premier rôle « au hasard »** (§ 3.9) : tiré d'un `Rng(melanger(graine, 0x7201e))` à lui, pas du 1er tirage de
   `partie.rng` — le xorshift32 semé d'un petit entier rend d'abord des nombres proches de 0 (graines 1 à 6 : « prop » 6 fois).
2. **Provocations** : seulement pendant la traque (la cachette n'a pas de points, et les chasseurs y sont sourds) ; une
   volontaire compte aussi dans `stats.provocs`, comme une forcée (colonne « provocations » du tableau). À l'entrée de la
   dernière minute, un prop dont la dernière provocation a plus de 20 s provoque tout de suite.
3. **« Balle sur un vrai meuble −2 »** (§ 3.9) : compté PAR COUP (un coup de FP-12 = −2, pas −16), comme le plafond de −6 PV
   par coup ; `stats.rates` aussi par coup.
4. **« Dernier prop +25 »** : au seul prop survivant de la manche (en plus de ses +50).
5. **Départs des props** : les lieux de la zone (`pointsDe`) hors de celui des chasseurs, à tour de rôle d'une manche à l'autre,
   espacés de 1,5 m, jamais dans un passage ; au 1er, la pause orange (3,8 m du palier est) reste aux props (S0 point 25 y
   trouve ses tirs de test ; les chasseurs y sont figés et aveugles toute la cachette).
6. **Événements ajoutés** (§ 4.6) : `refus` { a, raison } (Haythem seul : « Pas la place », « Plus de changement de forme »,
   « Changement de forme : attends 5 s », « Le scanner recharge », « Scanner vide », « Provocation : attends un peu », « Les
   provocations, c'est pendant la traque ») ; `defige` { a, x, y, z } ; `faux` porte aussi `n` (plombs) et x, y, z ;
   `provocation` porte `n`, `rayon`, `duree`, `points` ; `scanner` porte x, y, z, `portee`, `resultats: [{ dir, rel, bande }]` ;
   `fin` : `gagnant` = l'id du meilleur total (pas une équipe), `scores` = { points, manches, classement }. L'`elim` d'un
   chasseur mort par les meubles a `par === cible` et `arme: 'meuble'`.
7. **Champs ajoutés** (règle 3) : `hud.prop` (liste plus haut), `REGLAGES_PROP.annonceCachette / derniereMinute / survie /
   defige / astuces`, `ASTUCES_PROP`, `PartieProp.poseTouchee` (la pose touchée : une méthode, que les tests remplacent),
   `sourd(e)`, `etat().pp`, `REGLAGES_SONS`, `RECETTES_PROP`, `SonsProp.jouer / jouerProvocation / journal / n / muets`.
8. Les PV d'un prop sont ceux de l'acteur (`vie`) ; `prop.pv` en est la copie (remise à chaque pas).

## Demandes

- **F2 (bloquant pour « jouable à la fin de F2 ») — le chasseur minimal ne tire jamais son tir de test** (`cerveau_prop.js`,
  squelette du socle) : en patrouille, `CerveauBase.commande` remet `this.aim` au lacet de l'errant À CHAQUE PAS
  (`this.aim.l = cmd.lacet`), puis `CerveauChasseur` appelle `viserVers` qui ne tourne que d'un pas de rotation depuis là :
  `pret` n'est jamais vrai, `cmd.tir` jamais posé (mesuré : 6 entrées au journal de Gabriel, 0 `tir`, lacet figé à −1,233).
  S0 point 25 ne compte que les CHOIX. Correction proposée : dans la branche `vise`, garder la visée d'un pas à l'autre (par
  ex. `if (this.vise) { this.aim.l = this._aimVise.l; … }` avant `viserVers`, ou ne pas appeler l'errant tant que `vise`).
  Sans elle, au prop hunt du socle, aucun chasseur bot ne touche jamais un prop (les props bots ne bougent pas non plus : c'est
  le minimal).
- **L-H** : (1) `jouer3d(…, { dalle: 'faite' })` = la dalle déjà faite par `SonsProp` (× 0,35, 900 Hz) : ne pas y remettre la
  règle « autre niveau » (−14 dB, 400 Hz) ; (2) poser `sonsJeu.spatial = true` quand les voix sont spatialisées (alors
  `SonsProp` n'atténue plus ni ne place le son lui-même) ; (3) `SonsProp` joue le sifflet du lâcher (phase `traque`) et la
  ritournelle de fin de manche : que `SonsJeu` ne siffle pas aussi sur `traque` ; (4) `jouer3d` gagnerait à libérer la plus
  faible voix plutôt que de refuser quand 24 sont pleines (un « bip » de scanner refusé, observé quand l'horloge des sons
  n'avançait pas).
- **L-C** : `CadenceActeurs` ne pose jamais l'acteur local ; en prop hunt, Haythem prop encore HUMAIN est à la 3e personne :
  `PartieProp.image` le pose s'il ne l'a pas été (`!a.aPoser`) — si la vraie cadence le pose, rien n'est fait deux fois.
- **L-G** : `hud.prop.cachette` est rempli aussi pendant la présentation (panneau dès la 1re image du chasseur) ; dessiner
  `refus`, `vise` (« E : devenir … »), `revelation`, `sons`, `scanner.resultats` (`rel` = relatif au regard au moment du scan,
  `dir` = direction monde), `spectateur`, `astuces` du prop ; le fil peut dire « s'est perdu dans les meubles » sur un `elim`
  dont `arme === 'meuble'`.
- **L-U / F2** : `index.js` affiche « Partie finie » pour le prop hunt (`gagnant` est un id) : montrer le nom du gagnant et le
  podium (`scores.classement`).
- **L-K** : `deguiser` incrémente `prop.changements` ; `PartieProp` le réécrit (son compteur de la traque) — le laisser à la
  partie. `viserMeuble` qui rend `{ acteur }` (un coéquipier visé) est accepté comme forme copiable.
- **L-O** : garder `PartieProp.sourd` (les chasseurs bots sont enveloppés à la création : un cerveau qui s'abonne autrement
  doit le respecter) ; exposer `oeil(acteur) → 0..1` pour la jauge ŒIL ; `CerveauCacheur.cle` (le type voulu) est lu par
  `_changerForme` (validé : déguisable dans la zone, ou le carton).
- **L-D** : `PASSAGES` (exporté par le squelette de `pilotage.js`) est lu par `PartieProp` s'il existe encore (import en espace
  de noms : pas d'erreur s'il disparaît) pour éviter de poser un prop dans un passage.

## Doutes

- Les temps sont relatifs (machine chargée : 3 à 4 images/s pendant le jeu en vrai) ; aucun seuil de temps n'est dans mes tests.
- Le panneau de cachette du chasseur et les jauges DISCRÉTION / ŒIL ne se voient pas avant L-G (le HUD du squelette est une
  ligne de texte) ; `credibilite` rend 0,5 avant L-K.
- Les sons n'ont été qu'ÉCOUTÉS PAR LES NOMBRES (journal, rendu hors ligne : crête, efficace) : le test à l'oreille (F2 / INT,
  sans `?test=1`) dira s'il faut retoucher un timbre (le téléphone est le plus doux : crête 0,07).

## Jeton du navigateur

Les trois jetons étaient pris de 03:26 à 04:26. À 03:51:16 j'ai cru reprendre le jeton 3 (périmé, L-V 03:05:46), mais L-B
l'avait repris 6 s plus tôt : j'ai rendu son `qui.txt` à L-B dans la minute (aucune page ouverte). Jeton 2 pris à 04:26:59
(libre), rafraîchi pendant l'usage, rendu à la fin.

## Photos regardées

Captures du panneau (non jointes, la machine les garde dans le dossier des résultats d'outils) : Haythem humain dans la pause
orange (présentation) ; le calque « CLIQUE POUR JOUER » au début de la cachette ; Haythem en carton (orbite) puis figé dans le
couloir du 1er (chrono 3:25) ; la vue FPS du chasseur à la présentation de la manche 2 ; la traque, la porte de la pause ; l'écran
de fin « FIN DE LA PARTIE · Partie finie ».
