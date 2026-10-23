# Rapport L-C — les corps des acteurs (vague 2)

Branche `lot/L-C` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-C`, depuis `socle` = `socle-ok` e06258f), port 8135 ; 23/10/2026.
Spécification : `docs/jeu/spec_finale.md` § 5.5.5 (lot), § 4.5.10 (contrats), § 3.6 (retours), § 3.10 (budgets).

## Où j'en suis

**EN COURS — étape 0 : lecture faite** (spec §§ 0-4 et § 5.5.5 mot pour mot, rapport S0, `carte_persos.md`, banc
`armer.js`, `accroupi.js`, `ragdoll.js`, fichiers du socle à remplir, `player.js`, `couches.js`, `avatar.js`, `fit.js`).

Plan (un commit par étape testée) :
1. `player.js` / `couches.js` : crochets de partie (avatar prêt, annulation des ajouts d'après-pose, présentation légère
   d'un corps caché, penché et regard coupés pour un acteur armé) — balade rejouée au bit près après chaque commit.
2. `avatars.js` : fiches, préparation (un avatar par gabarit d'abord, chargeur discret, programmes et clips attendus,
   plafond 6 / 3 distincts), `creerCorps` / `libererCorps`.
3. `teintes.js` (+ `appliquerFit` / `moyenne` de LA CAGE recopiés dans `fit.js`) : tenue à 60 %, brassards de 8 cm.
4. `accroupi.js`, `pose_arme.js` (posture armée, IK des deux bras, sprint, recharge, changement, recul, sursaut).
5. `poupee.js` (Verlet + murs, sous-pas fixes, Airsoft / Militaire), réapparition sur le même `Player`.
6. `cadence_acteurs.js` (zones, cadre, distance, ombre, téléphone 2 pleins, posé dans l'image où il redevient dessiné).
7. `tests/test_corps.js` (les 14 critères), photos de lisibilité, `&lot=S0` encore vert, `verifier_proprietaires`.

## Ce qui est fait

(rien encore)

## Écarts au document

(aucun pour l'instant)

## Demandes

(aucune pour l'instant)

## Doutes

(aucun pour l'instant)
