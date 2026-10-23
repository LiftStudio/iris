# Rapport L-U — menus et options (vague 2)

Branche `lot/L-U` (depuis `socle`, e06258f), arbre `C:/Users/hgami/Downloads/IRIS_lots/L-U`, port 8141 ; 23/10/2026.
Section de la spécification : § 5.5.11 (contrats § 4.5.16, valeurs § 3, propriétaires § 5.2).

## Où j'en suis

**EN COURS** — tout le code est écrit et commité ; rien n'est encore joué dans le navigateur (les trois jetons étaient
pris : `jeton.sh` attend le premier libre).

Fait (commits `L-U : …`) :
- `js/jeu/menus_jeu.js` : accueil (six portes, fiche de la porte visée, aide clavier / manette / doigt), réglages COMBAT /
  PROP HUNT / STAND (settings.jeu), préparation à étapes, fin (bandeau 2,5 s puis podium, chiffres, quatre boutons ; la
  partie gelée dessous), crédits, caméra à trois plans de 12 s et fondu de 1,2 s (positions à relever dans l'école).
- `css/jeu/menus.css` ; `js/ui.js` (onglet COMBAT, Commandes à trois profils, souris et molette, Ctrl) ;
  `tools/portraits/{index.html, outil.js, ecrire.py}` ; `js/jeu/tests/test_menus.js` (14 critères + 1 à F2).

Reste, dans l'ordre (navigateur, jeton) :
1. Relever les trois plans de la caméra du menu dans l'école (jamais dans une forme), les regarder.
2. Rendre les 7 portraits (`/tools/portraits/?envoyer=8149` + `ecrire.py --ecouter 8149 assets/portraits/`), planche.
3. `&rapport=1&lot=L-U` puis `&lot=S0` (PC, puis `?tel=1`) ; jouer les écrans pour de vrai (souris, manette simulée).
4. `python -I tools/verifier_proprietaires.py lot/L-U`, rapport final, jeton rendu, serveur et onglet fermés.
