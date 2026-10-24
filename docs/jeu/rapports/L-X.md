# Rapport L-X — les vraies armes 3D (hors spec, demande de Haythem du 23/10)

Branche `lot/L-X` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-X`, depuis `vague2` = `vague2-ok` `2e688ba`), port 8155 ;
24/10/2026. Demande : « pour les armes, mets des vraies armes 3D que tu installes par toi-même sur internet ». Les modèles
(8, CC0, 3DModelsCC0) ont été trouvés, convertis et vérifiés avant ce lot : `C:/Users/hgami/Downloads/IRIS_lots/_armes/`
(`choix.md`, `manifeste.json`, `LICENCES.md`, `planche.jpg`).

## Où j'en suis

**EN COURS (24/10, 07:55)** — construit, joué, photographié : les 5 armes + couteau + grenades sont les vraies, en vue FPS
(bras de Haythem) et dans les mains des bots ; `&rapport=1&lot=L-W` 17/17 au 1er passage (07:30) ; rejeux finaux en cours
(L-W après le réglage des visées, S0, L-V et L-C avec `&fusion=1`, L-W sous `?tel=1`). Jeton : `jeton_3`, repris PÉRIMÉ à
07:25 (qui.txt de G-MAT de 06:24, son onglet fermé depuis — voir « Navigateur »).

Un repreneur : `git -C C:/Users/hgami/Downloads/IRIS_lots/L-X log --oneline vague2..` dit ce qui est fait ; le serveur se
relance par `python serve.py 8155` dans l'arbre ; les photos arrivent dans `C:/Users/hgami/Downloads/IRIS_lots/_photos/L-X/`
par un petit récepteur hors dépôt (`node <scratchpad>/lx/recepteur.mjs <dossier> 8255` : POST d'un data:URL → fichier) et
l'adresse `&recepteur=8255` ; sans lui, les planches restent dans `window.__planche*`.
