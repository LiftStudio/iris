# Rapport L-X — les vraies armes 3D (hors spec, demande de Haythem du 23/10)

Branche `lot/L-X` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-X`, depuis `vague2` = `vague2-ok` `2e688ba`), port 8155 ;
24/10/2026. Demande : « pour les armes, mets des vraies armes 3D que tu installes par toi-même sur internet ». Les modèles
(8, CC0, 3DModelsCC0) ont été trouvés, convertis et vérifiés avant ce lot : `C:/Users/hgami/Downloads/IRIS_lots/_armes/`
(`choix.md`, `manifeste.json`, `LICENCES.md`, `planche.jpg`).

## Où j'en suis

**EN COURS (24/10)** — arbre créé, spec (§§ 0-4, 4.5.8-4.5.10, 5.1, 5.5.3-5.5.5), F2.md, L-W.md, `viewmodel.js`,
`pose_arme.js` lus ; plan ci-dessous. Rien n'est encore construit.

Un repreneur : `git -C C:/Users/hgami/Downloads/IRIS_lots/L-X log --oneline vague2..` dit ce qui est fait.

## Le plan

1. `assets/armes/<id>.glb` (PC, textures 1024) et `assets/tel/armes/<id>.glb` (512) refaits depuis `_armes/choix/` par
   `assets/armes/preparer_armes.py` : origine ramenée au contrat de L-W (la prise de la main droite EN HAUT de la poignée,
   où l'arme de vue de L-V a réglé ses mains), textures JPEG, repères et pivots recalculés dans `extras.iris`.
2. `js/jeu/modeles_armes.js` : `creerArme` sur les GLB (une géométrie cousue par arme, un appel de dessin ; en vue, un
   `SkinnedMesh` rigide dont les os sont les vraies pièces mobiles), le modèle fait main en REPLI tant qu'un GLB n'est pas
   prêt (remplacé EN PLACE à son arrivée), `prechargerArmes()` à la préparation d'une partie (jamais au démarrage).
3. `js/jeu/tests/test_modeles_armes.js` réécrit ; photos (vue FPS, bots, vitrine) ; demandes à INT.
