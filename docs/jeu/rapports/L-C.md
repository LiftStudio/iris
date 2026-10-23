# Rapport L-C — les corps des acteurs (vague 2)

Branche `lot/L-C` (arbre `C:/Users/hgami/Downloads/IRIS_lots/L-C`, depuis `socle` = `socle-ok` e06258f), port 8135 ; 23/10/2026.
Spécification : `docs/jeu/spec_finale.md` § 5.5.5 (lot), § 4.5.10 (contrats), § 3.6 (retours), § 3.10 (budgets).

## Où j'en suis

**EN COURS — tout le lot est écrit et joué ; reste la passe finale** (23/10, 06:30) : `&rapport=1&lot=L-C` complet,
`&lot=S0` encore vert, `?tel=1`, `verifier_proprietaires`, puis ce rapport finalisé. Les 14 tests ont tous passé un par un.

Un repreneur : `git log` de `lot/L-C` ; le serveur `python serve.py 8135` dans l'arbre ; un jeton du navigateur
(`_navigateur/jeton_<n>`, § 5.1 règle 3 : la file est très demandée) ; la page
`http://127.0.0.1:8135/?test=1&rapport=1&lot=L-C` (≈ 4-6 min) puis `&lot=S0`.

## Ce qui est fait

### Les fichiers

| Fichier | Ce qu'il fait |
|---|---|
| `js/jeu/avatars.js` | `FICHES_BOTS` (les six amis, `assets/tel/<id>.glb` même sur PC), `FICHE_HAYTHEM` (gabarit A). `preparerAvatars` : un corps SONDE par avatar (chargeur discret, clips reciblés, programmes compilés, variante transparente de l'effacement, **une image vraie** sous l'écran de préparation — teinte, brassards, une arme), un avatar par gabarit d'abord, plafond 6 / 3 distincts ; les sondes restent hors de la scène pour la session (leurs matériaux tiennent les programmes en vie : une préparation suivante coûte 0 ms). **Calage de la tête** : l'échelle de l'avatar ajustée (× 1,009 à 1,030) pour que sa tête soit là où la simulation la compte. `creerCorps` (drapeaux `capFixe`, `sansRangs`, `audible = false`, `sansSouffle`, `elanAir`, `cibleRegard = null`, `discret` ; un ami non préparé prend un avatar préparé), `libererCorps` (brassards détachés, puis `Player.dispose`). |
| `js/jeu/teintes.js` | `teinteEquipe` : tenue teintée à 0,6 (haut couleur pleine, bas × 0,42) par le shader des tenues (`appliquerFit`, uniformes seuls, matériaux clonés) ; deux brassards de 8 cm sous `LeftArm` / `RightArm`, à 12 cm de l'articulation, ajustés à la manche de chaque avatar (93e centile + 5 mm), émissifs 0,22 ; `retirerTeinte`, `preparerTeintes`. |
| `js/jeu/accroupi.js` | `accroupir(player, k, bas = 0.42)` : pieds gardés, bassin −0,42 k à la verticale et −6 cm vers l'arrière, dos, cou, `ikJambe`. |
| `js/jeu/pose_arme.js` | `poserArme` : buste de trois quarts (0,55 rad), part du tangage au buste, tête dans l'axe (joue sur la crosse en visée), arme 3e personne (réserve partagée de `creerArme(id)`) au canon EXACTEMENT dans la direction de la commande, crosse au creux de l'épaule, **glissée le long de son axe pour rester à portée de bras** (visée très haute ou très basse), sprint (en travers), recharge (main gauche au chargeur, à la ceinture, retour), changement d'arme, gestes, ressort de recul (piston, cabré de la fiche), sursaut à la touche ; **cinématique inverse du bras réécrite** pour une pose par image (`ikBrasRapide` : 0,075 ms par acteur au lieu de 0,2-0,3) ; `acteur.aff.bouche` ; `armeTroisieme`, `suivreArme` (entre deux poses), `priseMain`. |
| `js/jeu/poupee.js` | `Poupee` Verlet (17 points, buste rigide, plis, sol, MURS sur hanches / poitrine / tête), pas fixes de 1/120 s, effondrement (bassin vers le bas, genoux vers l'avant), affaissement et bascule (loin d'un mur), pesanteur × 1,35, repos, arrêt à 3 s ; Militaire 4 s + enfoncement 0,5 m en 0,4 s ; Airsoft 1,5 s + effacement 0,6 s (matériaux clonés transparents, brassards rangés) ; `releverCorps` (réapparition : `anim.couper()` puis `animKey = null`, pas de fondu, ajouts oubliés). |
| `js/jeu/cadence_acteurs.js` | dessiné = zone vue (`zonesCachees` / `zoneDe`) ET cadre (sphère 1 m) ; posé chaque image < 18 m, une sur deux < 34 m, une sur trois au-delà, 4 Hz caché, DANS L'IMAGE où il redevient dessiné ; téléphone : 2 pleins ; ombre au niveau de la caméra ; présentation `leger` d'un corps caché ; réapparition (la poupée quittée). |
| `js/player.js` | `surAvatar` (l'habillage avant la 1re image), la mémoire des ajouts d'après-pose (`_apresDebut/_apresFin/_apresAnnuler` : `ajouter` est relatif, un buste tourné que personne ne réécrit s'empilait), `oublierApres`, `leger` dans `presenter`. Rien de cela en balade (rejeu au bit près). |
| `js/couches.js` | `penche` (le groupe d'un acteur armé penche à 25 %), `sansRegard`, `droit` → `_droit` : le dos visant, depuis les hanches, le point au-dessus du centre des pieds, et la tête droite sur le cou. |
| `js/fit.js` | `appliquerFit` et `moyenne` de LA CAGE recopiés (sans `needsUpdate`) ; le mélange de la teinte fait dans l'espace perçu (sans effet quand la tenue est éteinte : Haythem). |
| `js/jeu/tests/test_corps.js` | les 14 critères du § 5.5.5. |

## Écarts au document

(à compléter)

## Demandes

(à compléter)
