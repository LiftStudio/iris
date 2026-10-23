# Rapport L-E — règles du combat et stand de tir (vague 2)

Branche `lot/L-E` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-E`), partie de `socle` (`e06258f`, tag `socle-ok`), port 8137 ;
23/10/2026. Fichiers : `js/jeu/partie_fps.js`, `js/jeu/partie_stand.js`, `js/jeu/tests/test_combat.js` (spec §§ 2.3-2.6, 3.5,
3.8, 4.5.12, 5.5.7).

## Où j'en suis

**EN COURS — étape 3 (tests dans le navigateur)**. Fait et commité : la passe de mesure de la rue (jeton 1, rendu), le
premier jet complet de `partie_fps.js` et de `partie_stand.js` (commit « premier jet complet »), `test_combat.js` (16
critères + 3 `apresFusion`). Reste : faire passer `&rapport=1&lot=L-E` (PC puis `?tel=1`), jouer à la main (combat, domination,
stand), `&lot=S0`, vérificateur, rapport final. Attente d'un jeton du navigateur (les trois pris par L-D, L-G, L-V à 03:20).

## La passe de mesure du stand (23/10, 03:00, jeton 1)

Formes du monde solide dans la rue (x −4…27, z −1,5…7,5, sous 2,4 m), relevées dans la page :
- la façade : z 0 → 0,4 de x −0,3 à 20,1 ; un immeuble à l'ouest (x ≤ −0,3, z ≤ 1,65) et à l'est (x ≥ 20,1, z ≤ 1,65) ;
- le trottoir à y = 0 jusqu'à z = 3,1, la chaussée à y = −0,12 de z 3,1 à 9,35 ;
- le mobilier contre la façade (jardinières, bancs, potelets : `camera: false`) jusqu'à z ≈ 2,2 (2,5 en x 18,9-20,2) ;
- **les vélos garés en bloc** (forme 297) : x 15,95-19,4, z 4,08-5,93, jusqu'à 0,98 m ; trois arceaux (294-296) z 4,2-4,55 ;
- **une voiture garée** (forme 322) : x 22,69-26,11, z 3,28-4,96, jusqu'à 1,21 m ; d'autres voitures à z ≥ 7,28.
Conséquence : à x ≈ −1 (§ 2.6), une cible à 25 m tomberait dans la voiture, et un couloir au-delà de z ≈ 4 passe dans les
vélos. Table `STAND` retenue : ligne de tir à **x = −2,7**, couloirs **z 2,85** (trottoir), **3,75** (chaussée) et un 3e
**en biais de z 5,8 à 6,6** (entre les vélos et les voitures d'en face) ; cibles à x 5,3 / 12,3 / 22,3 (8, 15, 25 m) ;
mannequin à (7,3 ; 4,9), 10 m. Chaque segment œil debout → centre, tête, bords (± 0,22), bas, haut de chaque cible est
libre de TOUTES les formes (`camera: false` comprises), au rayon 3 cm ; regardé à l'écran depuis la ligne (photo dans la
page, des boîtes rouges posées à la main puis retirées : couloirs dégagés, rien devant).
