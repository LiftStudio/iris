# Rapport L-X — les vraies armes 3D (hors spec, demande de Haythem du 23/10)

Branche `lot/L-X` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-X`, depuis `vague2` = `vague2-ok` `2e688ba`), port 8155 ;
24/10/2026. Demande : « pour les armes, mets des vraies armes 3D que tu installes par toi-même sur internet ». Les modèles
(8, CC0, 3DModelsCC0) ont été trouvés, convertis et vérifiés avant ce lot : `C:/Users/hgami/Downloads/IRIS_lots/_armes/`
(`choix.md`, `manifeste.json`, `LICENCES.md`, `planche.jpg`).

## Où j'en suis

**EN COURS (24/10, 06:52)** — construit et commité (`37efcf6`, `2fea517`) : les GLB du jeu, `modeles_armes.js` réécrit sur
eux (repli fait main rempli en place), les tests. Vérifié HORS navigateur (three r170 sous Node, textures retirées) : les 8
GLB se cousent, repères = extras ± 0 mm, pivots ± 0,07 mm, os rigides justes, 1 maillage par arme, repli → vraie arme en
place. **Reste** : le jeu au navigateur (jeton : les trois pris par L-O, G-LUM, G-MAT depuis 06:23 ; j'attends), les
photos, le réglage des origines et des matériaux sur photos, S0 / L-V / L-C rejoués, le rapport final.

Un repreneur : `git -C C:/Users/hgami/Downloads/IRIS_lots/L-X log --oneline vague2..` dit ce qui est fait ; le serveur se
relance par `python serve.py 8155` dans l'arbre, le récepteur de photos par
`node <scratchpad>/lx/recepteur.mjs C:/Users/hgami/Downloads/IRIS_lots/_photos/L-X 8255` (outil hors dépôt, 20 lignes :
POST d'un data:URL → fichier ; sans lui, les planches restent dans `window.__planche*`).
