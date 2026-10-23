# Rapport L-H — les effets et les sons (vague 2)

Branche `lot/L-H` (depuis `socle` = `socle-ok` e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-H`, port 8142 ; 23/10/2026.

## Où j'en suis

**EN COURS — essais.** Tout le lot est écrit, joué et commité ; jeton 3 du navigateur pris à 05:21 (rafraîchi).
- `&rapport=1&lot=S0` sur la branche : **29/29 sur PC** (76 s, 0 signalé ; balade au bit près 0 / 0 avant et après).
- `&rapport=1&lot=L-H` : 13/14 au dernier passage complet (le 9 attend la mesure de `a8b22dd`), puis une boucle sans borne
  d'un test a figé l'onglet (corrigée : ffe36bc) — à rejouer.
- Reste : `L-H` vert sur PC et sous `?tel=1`, `S0` sous `?tel=1`, la mesure des sons de la balade sur `a8b22dd`
  (archive dans le dossier de session `…/scratchpad/lh/ref_a8b22dd`, servie sur 8142 à `localhost`, script
  `…/scratchpad/lh/compter_a8b22dd.js` = `compterSonsBalade` du test) pour poser `PAS_A8B22DD` dans `test_effets.js`.

Un repreneur : `git log` de `lot/L-H`, puis ce rapport. Le serveur de la session (`…/scratchpad/lh/serve_lh.py <racine>
<port> <photos>`) est `serve.py` plus un POST `/__photo/<nom>` : les photos d'un onglet qui n'est pas devant (les autres
agents prennent le devant du panneau) arrivent en JPEG dans le dossier de session.

## Ce qui est construit

(à compléter à la fin)

## Écarts au document

(à compléter à la fin)

## Demandes

(à compléter à la fin)

## Ce qui reste

- voir « Où j'en suis ».
