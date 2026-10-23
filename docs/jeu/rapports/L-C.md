# Rapport L-C — les corps des acteurs (vague 2)

Branche `lot/L-C` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-C`, depuis `socle` = `socle-ok` e06258f), port 8135 ; 23/10/2026.
Spécification : `docs/jeu/spec_finale.md` § 5.5.5 (lot), § 4.5.10 (contrats), § 3.6 (retours), § 3.10 (budgets).

## Où j'en suis

**EN COURS — étape 1 à 7 écrites, PAS ENCORE JOUÉES** (23/10, 03:40) : crochets de `player.js` (`surAvatar`, ajouts
d'après-pose `_apresDebut/_apresFin/_apresAnnuler`, présentation `leger`) et de `couches.js` (`penche`, `sansRegard`,
`droit` → `_droit`), `fit.js` (`appliquerFit`, `moyenne` de LA CAGE), les six modules du lot et `tests/test_corps.js`
(14 tests). Prochaine étape : jeton du navigateur (les trois étaient pris), `&rapport=1&lot=L-C`, mise au point, puis
`&lot=S0` (balade au bit près).

Plan (un commit par étape testée) :
1. `player.js` / `couches.js` : crochets de partie (avatar prêt, annulation des ajouts d'après-pose, présentation légère
   d'un corps caché, penché et regard coupés pour un acteur armé, dos droit) — balade rejouée au bit près après chaque commit.
2. `avatars.js` : fiches, préparation (un avatar par gabarit d'abord, chargeur discret, programmes et clips attendus,
   plafond 6 / 3 distincts), `creerCorps` / `libererCorps`.
3. `teintes.js` (+ `appliquerFit` / `moyenne` de LA CAGE recopiés dans `fit.js`) : tenue à 60 %, brassards de 8 cm.
4. `accroupi.js`, `pose_arme.js` (posture armée, IK des deux bras, sprint, recharge, changement, recul, sursaut).
5. `poupee.js` (Verlet + murs, sous-pas fixes, Airsoft / Militaire), réapparition sur le même `Player`.
6. `cadence_acteurs.js` (zones, cadre, distance, ombre, téléphone 2 pleins, posé dans l'image où il redevient dessiné).
7. `tests/test_corps.js` (les 14 critères), photos de lisibilité, `&lot=S0` encore vert, `verifier_proprietaires`.

Mesures préalables (23/10, essai, Haythem cloné en `Errant` puis en commande forcée dans la rue) : le clip de course
penche le dos de 23° (29° au sprint) ; la tête de l'os est à 31 cm DEVANT les pieds et 11 cm plus bas que la tête
simulée des boîtes de touche (37 et 19 cm au sprint) ; à la marche 6,5 cm devant ; à l'arrêt 2 cm. D'où le « dos droit »
d'un acteur armé (`couches.js _droit`). Bras de Haythem : 0,237 + 0,241 m (épaule → poignet), main 0,079 m.

## Ce qui est fait

(rien encore)

## Écarts au document

(aucun pour l'instant)

## Demandes

(aucune pour l'instant)

## Doutes

(aucun pour l'instant)
