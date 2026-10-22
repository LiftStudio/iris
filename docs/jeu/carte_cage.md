# CE QUE LA CAGE PEUT PRÊTER AU FPS ET AU PROP HUNT D'IRIS

Lecture seule des deux dépôts (rien n'a été écrit dans l'un ni dans l'autre). Mesures faites dans le navigateur intégré,
sur un onglet jetable d'IRIS servi par le `serve.py` déjà lancé (port 8124, processus 36760), prototypes dans la console
seulement, objets retirés et fonctions remises après chaque essai, onglet fermé à la fin.

- LA CAGE : `C:/Users/hgami/Downloads/Basket_1v1_nouveau/Basket_1v1`, HEAD `0d55a0c` (« v8.3 : service worker et notes de
  version »). 21 339 lignes pour les fichiers lus ici.
- IRIS : `C:/Users/hgami/Downloads/IRIS`, HEAD `a8b22dd` (v2.0). 34 825 lignes de `js/`.
- Conditions de mesure : fenêtre 1138 × 568, DPR 1,4, plusieurs autres onglets d'agents ouverts → la qualité
  automatique d'IRIS est tombée de « haute » à « moyenne ». Les temps d'image sont donc RELATIFS (avant/après), pas absolus.

---------------------------------------------------------------------------------------------------------------------

## 0. EN BREF

| Module de LA CAGE | Verdict pour IRIS | Travail |
|---|---|---|
| `js/net.js` (611 l.) | **À reprendre presque tel quel** : Identity, Rng à graine, Horloge, Tampon d'interpolation Hermite, LocalTransport / SocketTransport, Room. 4 constantes à changer (adresse publique, annuaire, port 8123, clé de stockage). | 0,5 j |
| `serveur/relais.js` + `node.mjs` (+ `cloudflare.js`, `deno.js`) | **À reprendre tel quel** : relais sans dépendance, hôte = premier arrivé, écho, purge des fantômes, débit limité. `node.mjs` sert le jeu ET le salon sur le même port → c'est le LAN. Port 8123 → 8124. | 0,5 j (LAN) ; +0,5 j (Cloudflare, nouveau worker) |
| `js/enligne.js` (1058 l.) | **Le squelette de l'hôte autoritaire est réutilisable** (rôles hôte/invité/spectateur, `EntreeDistante`, images à 20/s horodatées, prédiction + réconciliation du joueur local, rejoindre/regarder en cours). Tout ce qui touche au ballon, à la jauge de tir et au « miroir » des équipes est à jeter. Manque pour un FPS : la visée (lacet/tangage) dans les commandes, `y` dans les positions, la compensation de latence des tirs. | 3–4 j (plus tard) |
| `js/presence.js` (574 l.) | Utile pour une **balade à plusieurs** (avatars des autres + pseudo, tampon, LOD). La moitié concerne le parc de Bécon (nappes, vélos, plateau) : à retirer. | 1 j (plus tard) |
| `Player.etatAnim` / `appliquerAnim` (`js/player.js` l. 1689 et 1744) | **Absents d'IRIS** : la règle (n'envoyer que ce qui n'est pas au repos ; ne recaler une minuterie que si l'écart dépasse `TOL_ANIM`) est à recopier, les champs sont à refaire (arme, visée, recharge, tir, mort, déguisement). | 0,5 j |
| `js/game.js` (3711 l.) | Des **motifs** : pas fixe 120 Hz (déjà dans IRIS), boucle des « pilotes » (clavier / réseau / IA), contacts entre corps, `rnd()` à graine, machine d'états `countdown → playing → (scored) → over` + `stateT`, compte à rebours, fin de match. | 1 j |
| `js/ai.js` (439 l.) | **95 % basket**, inutilisable tel quel. À garder : `moveTo` avec hystérésis d'arrivée, `sprintH`, la règle `faceTo(cible, true)`, la structure `AIController(game, me, diff)` + `DIFFICULTY`. L'IA FPS est à écrire. | 3–5 j (IA neuve) |
| `js/pedestrians.js` (2428 l.) | `Pedestrians` (trottoirs en segments) : rien pour l'intérieur. `PassantsParc` : **le pilotage** (carotte, moustaches, évitement, « coincé » + arête barrée, garde-fou de niveau) et le **Dijkstra borné** sont adaptables ; le skinning **cuit en texture + InstancedMesh** est le seul moyen de dessiner une foule à bas coût. Lié au module `Monde` du parc : table de correspondance plus bas. | 2 j |
| `js/ui.js` (1437 l.) + `index.html` + `css/style.css` | **Menu d'accueil** (`buildMenu`, écrans `.menu-screen[data-screen]`, boutons `data-go`), **tableau des scores** (`.scoreboard`, `HUD.setScore`/`setClock`), écran CRÉDITS, porte du jeu en ligne (`buildOnline`). IRIS n'a aucun de ces écrans. | 1,5 j |
| `js/matchs_ui.js` (157 l.) | Liste « matchs en cours » + REJOINDRE / REGARDER + latence : à reprendre le jour du multijoueur. | 0,5 j (plus tard) |
| `js/audio.js` (241 l.) | Les briques `_osc`/`_noise` sont déjà dans IRIS (avec une réverbération en plus). À prendre : `buzzer`, `whistle` (le sifflet du prop hunt), `boom`, `block`, `ooh`, `cheer`, `boo`, `refus`. Les sons d'armes sont à écrire. | 0,5 j |
| `js/hoopfx.js` (252 l.) | Ressort amorti + filet de Verlet : rien de direct (le ressort peut servir au recul de l'arme). | — |
| `js/fx.js` | **Identique** à celui d'IRIS à 2 endroits près (ombres du parc entier, cadrage d'ombre au téléphone). Rien à reprendre. | — |
| `js/badges.js` | `badgeFx(map)` (aplatir des niveaux en coefficients) = mécanique d'**atouts** façon CoD. | 0,2 j |
| `js/roster.js` | 17 fiches d'avatars Avaturn (amis de Haythem) avec `model`, `modelHeight`, tenues `fit`/`coupe*`. Stats de basket inutiles. | 0,2 j |
| `js/portraits.js` | **Tel quel** : vignette de l'avatar rendue hors écran, cachée en localStorage (tableau des scores, fil des éliminations, choix du personnage). | 0,1 j |
| `js/training.js` | Motif d'atelier chronométré avec records en localStorage → **stand de tir / parcours**. | 0,5 j |
| Assets | `assets/passants/*.glb` (8 corps légers recolorables : **les bots du téléphone**), `assets/tel/*.glb`, clips `cmu/getup.json` (chute + relève), `Defeated.fbx`, `Picking Up.fbx`. Pas d'animation d'arme dans LA CAGE. | — |

---------------------------------------------------------------------------------------------------------------------

## 1. CE QUI EST DÉJÀ COMMUN (pas besoin de le reprendre)

Comparaison ligne à ligne (`diff --strip-trailing-cr`, LA CAGE → IRIS) :

| Fichier | LA CAGE | IRIS | Lignes différentes |
|---|---|---|---|
| `js/avatar.js` (AvatarRig : `ikBras`, `ikJambe`, `viserPoint`, `repereMain`, `plierDoigts`) | 390 | 390 | **0** |
| `js/appareil.js`, `js/ombre_cache.js`, `js/ombres_soleil.js`, `js/options_rendu.js`, `js/sonde_ciel.js`, `js/eclairage_perso.js`, `js/nuages.js` | — | — | **0** |
| `js/anim.js` (AnimPlayer, `loadManifest`, `loadMixamoClip`) | 586 | 587 | 3 |
| `js/fx.js` (PostFX) | 2082 | 2071 | 15 (import `monde_ombres.js`, cadrage d'ombre `ENCEINTE` au téléphone) |
| `js/input.js` | 108 | 108 | 6 (commentaires) |
| `js/weather.js` | 439 | 447 | 26 (réglage « intérieur ») |
| `js/manette.js` / `manette_menus.js` | 427 / 392 | 406 / 376 | 61 / 34 |
| `js/couches.js` | 452 | 349 | 143 (IRIS a retiré `_defense`, `_vol`, `_pompe`, `_mainsPompe`) |
| `js/fit.js` | 466 | 403 | 67 |
| `js/player.js` | 3103 | 1159 | réécrit (IRIS : sans ballon, avec murs/sols/rangs) |
| `js/game.js` | 3711 | 1114 | réécrit (IRIS : balade, caméra V2) |

Piège : une partie des fichiers de LA CAGE est en **CRLF** (`js/input.js` par exemple), ceux d'IRIS en **LF** : sans
`--strip-trailing-cr`, `input.js` sort « 216 lignes différentes » pour 6 réelles. Normaliser en LF tout fichier recopié.

Ce qu'IRIS a déjà et que LA CAGE n'aurait pas apporté : le monde solide multi-niveaux (`js/collisions.js`), les portes
automatiques (`js/ecole_portes.js`), la visibilité par zones (`js/ecole_visibilite.js`), la caméra V2, la 1re personne
(`js/game.js` l. 1010-1033, l'œil dans l'os `Head`), la réverbération (`js/audio.js` l. 31-50).

---------------------------------------------------------------------------------------------------------------------

## 2. MODULE PAR MODULE

### 2.1 `js/ai.js` — l'IA des adversaires (439 lignes)

API :
```js
export class AIController {
  constructor(game, me, diff)        // l. 46 ; diff = DIFFICULTY[...] de js/config.js l. 43 : { speed, skill, aggro, label }
  newPossession()                    // l. 55  (basket)
  update(dt)                         // l. 70  : aiguillage porteur / sans ballon / défense / balle libre / rebond
  moveTo(target, sprint, dt, stopDist = 0.15, marge = 0.30)   // l. 88 → rend false à l'arrivée
  sprintH(cle, v, seuil)             // l. 103 : sprint avec hystérésis ±0,5
  offense, sortir, choisirSortie, offBallSortie, posteBas, choisirGeste, startWindup, offBall, receive, defense, onBall, loose, rebound
}
```
Créée par `Game._newPlayer` (`js/game.js` l. 584-590) dans `this.ais` (Map joueur → contrôleur) et appelée dans la boucle
des pilotes (l. 1153-1158).

Ce qui vaut pour un FPS :
- **`moveTo` (l. 88-101)** : arrivé à `stopDist`, on ne repart qu'au-delà de `stopDist + marge` (sauf si la cible saute
  de plus d'1 m). Sans ça, un bot posté oscille (arrêt/départ/arrêt) et l'animation avec lui.
- **`sprintH` (l. 103-107)** : même idée pour le sprint.
- **La règle du cap (l. 40-44)** : toujours `faceTo(cible, true)` (cap VISÉ, pivot à vitesse bornée). L'appeler sans le
  `true` recopie le cap d'un coup : mesuré dans LA CAGE, chaque joueur pivotait de plus de 70° en moins d'un dixième de
  seconde une fois par seconde. `faceTo(target, doux = false, net = false)` existe dans IRIS (`js/player.js` l. 862).
- `g.rnd()` partout (jamais `Math.random`) : la partie reste reproductible à partir d'une graine.

Ce qui ne vaut pas : tout le reste (spots d'écartement, jauge de tir, passes, contres, appui dos au panier). Il n'y a
**aucune navigation** : le terrain de basket est un rectangle ouvert, l'IA va en ligne droite. Pour l'école il faut un
graphe (voir 2.2 et § 3).

### 2.2 `js/pedestrians.js` — passants et promeneurs (2428 lignes)

Deux classes.

**`Pedestrians`** (l. 244, `constructor(scene, routes, count = 10)`, routes = segments `{ ax, az, bx, bz }`) : trottoirs
en segments raccordés (`reseau`, l. 126), obstacles relevés en rastérisant la scène par tranches (`COUPES` 0,35/0,8/1,25 m,
cases de 20 cm), carotte dans une carte de décalages latéraux libres. Fait pour une rue rectiligne : **inutilisable dans
une école à couloirs et portes**. Deux fonctions à garder :
- `mesurerFoulee(modele, clip)` (l. 187) : la foulée réelle d'un avatar sur un clip (pied d'appui qui recule) → les pieds
  ne glissent pas. IRIS a sa propre phase de foulée dans `Player` ; utile seulement pour une foule cuite.
- `materiauPassant(base, teinteHaut, teinteBas, lum)` (l. 217) : **repeint le haut et le bas** d'un avatar passant via
  le masque (canal rouge = haut, bleu = bas) en gardant les plis. → **couleurs d'équipe** (rouge/bleu) sans fichier.

**`PassantsParc`** (l. 1648, `constructor(scene, graphe, { dx = 0, reglages = null, ordonnanceur = null })`, graphe =
`{ noeuds: [[x, z, y]], aretes: [[i, j, type]] }`, type 0 allée / 1 escalier / 2 rampe) : 26 promeneurs (12 au
téléphone) sur un graphe, avec :
- `distancesGraphe(voisins, i, max)` l. 1363 : Dijkstra borné (liste ouverte naïve) ;
- `raccorderCulsDeSac` l. 1382, `souder` l. 1438, `elaguer` l. 1578, `areteFermee` l. 1549 + `_fermer` : nettoyage du
  graphe en tâche de fond (0,25 ms par image) — arêtes qui traversent un obstacle fermées d'avance, couloir libre
  `decal[e]` pour celles qui frôlent ;
- `_suivant(a, b)` l. 1839 : choix au carrefour (plutôt tout droit) — c'est de l'ERRANCE, pas d'A* vers une cible ;
- `_carotte(p, avance, out)` l. 1902 : point visé 1,4 m devant sur le chemin, décalé à droite, miroir 0,6 s si la
  carotte tombe dans un obstacle ;
- `_piloter(p, dt, tx, tz, vVoulue, type)` l. 2096-2166 : **évitement des autres** (devant/latéral, doubler, freiner
  derrière un lent), **moustaches** tous les 0,1 s (`Monde.rayonLibre` à 0,9 m, ±0,6 rad, puis ±1,5 rad à 0,5 m pour
  longer un mur), cap à vitesse bornée 2,4 rad/s, ralenti dans les virages et les pentes ;
- `_coince(p)` l. 1991 : moins de 60 cm en 3 s sans arrêt → l'arête compte un coincement ; au second, `barree = 2`, plus
  personne ne la prend ;
- `_auNiveau` l. 2168, `_pousser` l. 2220 : **un pas qui change le sol de plus de `MARCHE_MAX` (0,35 m) est refusé** ;
- `_contacts()` l. 2192 : écartement à 0,5 m, le joueur ne se fait pas pousser ;
- le **skinning cuit** (GLSL l. 1166-1192, `materiauxPromeneur` l. 1197) : marche/repos/s'asseoir cuits en texture
  (une ligne par image, 3 texels par os), un `InstancedMesh` par avatar → 6 à 8 appels de dessin pour toute la foule.

Dépendance : tout passe par `js/monde.js` (le relief du parc). Correspondance avec le monde solide d'IRIS
(`js/collisions.js`, classe `Collisions`) :

| `Monde` (LA CAGE, `js/monde.js`) | `Collisions` (IRIS, `js/collisions.js`) | Remarque |
|---|---|---|
| `sol(x, z)` l. 163 | `solEn(x, z, y = 0, marche = 0.45)` l. 180 | **IRIS a besoin de `y`** (4 niveaux superposés) : passer la hauteur courante de l'agent partout. |
| `resoudre(pos, rayon, agent, vitesse)` l. 268 | `resoudre(pos, r, vel = null, pieds = 0)` l. 213 / `deplacer(pos, dx, dz, r, vel, pieds)` l. 235 | `pieds` = hauteur ABSOLUE des pieds. |
| `rayonLibre(ax, ay, az, bx, by, bz, r)` l. 282 | `rayonLibre(ax, ay, az, bx, by, bz, r = 0.2)` l. 288 | **Même signature.** Ignore les formes `camera:false` et `off`. |
| `drapeaux`, `surface`, `nappe` | — | Pas d'équivalent : tout ce qui est `libre` est marchable. |
| `pente(x, z, dx, dz)` | à dériver de `solEn` | |
| `Monde.bancs` | `carte.sieges` (`{ x, z, y, fx, fz, sx, sz, nom, sol }`) | |

### 2.3 Le jeu en ligne : `js/net.js`, `serveur/`, `js/enligne.js`, `js/presence.js`

#### `js/net.js` (611 lignes) — réutilisable presque entièrement

```js
export const SERVEUR_PUBLIC = 'wss://la-cage-salon.lacage-salon.workers.dev/ws'   // l. 37  ← À CHANGER pour IRIS
export const ANNUAIRE = 'https://raw.githubusercontent.com/LiftStudio/la-cage-apk/main/serveur.json'   // l. 44 ← À CHANGER
export function dansLApplication()                         // l. 63 (APK Capacitor)
export function normaliserAdresse(saisie)                  // l. 76 ; ajoute ':8123' l. 89 ← 8124
export async function chercherSurLeWifi(surAvancement, port = 8123)   // l. 106 ← 8124
export function serveurRetenu() / retenirServeur(url) / oublierServeur()   // l. 134-136, clé 'lacage.serveur.v1' l. 23
export function serveurDeLaPage()                          // l. 140 : ws(s)://<hôte de la page>/ws
export async function repond(urlWs, ms = 1200)             // l. 151 : GET /etat → { salons: n }
export async function trouverServeur()                     // l. 170
export function surReseauLocal()                           // l. 193
export class Identity      // l. 203 : id stable (randomUUID) + pseudo ≤ 16, localStorage 'hoops.identity.v1' (l. 22)
export class Rng           // l. 224 : xorshift32 ; seed(s), next(), range(a, b), int(n), pick(arr)
export class Horloge       // l. 252 : echantillon(tEmetteur, tLocal), affichage(tLocal, min = 80, max = 150), pret
export function heurePas(t, dt, jeu = null)                // l. 299 : heure exacte du pas de 1/120 s en cours
export class Tampon        // l. 319 : constructor(duree = 1000, saut = 2.5, silence = Infinity) ; ajouter(e) ; lire(t, o, maxExtra = 150)
                           //          échantillon { t, x, z, vx, vz, fx, fz, (y, vy) } ; Hermite position+vitesse, cap au plus court
export class LocalTransport  // l. 389 : salon 100 % local (écho) — tester tout le flux sans réseau
export class SocketTransport // l. 400 : (url, ident) ; reconnexion 0,8 s × 2^n jusqu'à 15 s ; file de 60 messages
export class Room          // l. 440 : (transport, ident, cb) ; join, leave(definitif), reprendre, setReady, setChar, setMode, say,
                           //          start, lancerMatch(match), envoyerDirect(msg) ; isHost = premier arrivé ; ping/pong 2 s → latence
```
Protocole (un message = `{ t, ... }`) : `hello / join / leave / ready / char / mode / chat / start` (état du salon, renvoyés
À TOUS, expéditeur compris) ; `pos / input / state` (temps réel, renvoyés aux AUTRES seulement) ; `ping / pong`.

#### `serveur/` — le relais

- `serveur/relais.js` (211 l.) : `export class Relais({ journal, salonUnique = true })` avec `brancher(envoyer, fermer)`,
  `recevoir(cli, brut)`, `rejoindre`, `quitter`, `debrancher`, `diffuser(code, obj, sauf)`, `entretien()`, `get etat`.
  `LIMITES` : 10 joueurs par salon, 400 salons, **8 192 octets par message**, **140 messages/s par client**, 90 s de
  silence max. Types acceptés : `ETAT_SALON` et `TEMPS_REEL` (l. 45-46) — tout le reste est jeté. Ne connaît ni HTTP ni
  WebSocket : indépendant de l'hébergeur.
- `serveur/node.mjs` (219 l.) : **sans aucune dépendance** (WebSocket RFC 6455 écrit à la main, trames l. 51-79), sert
  le jeu ET le salon sur le même port (`PORT = env.PORT || 8123`, l. 31), `/etat` avec les adresses du réseau local
  (cartes virtuelles VMware/WSL/Hyper-V écartées), ping → pong, `end` écouté (sinon le joueur parti reste 90 s).
- `serveur/cloudflare.js` (197 l.) + `wrangler.jsonc` : Durable Object unique `Salon`, API d'hibernation, liste des
  joueurs reconstruite depuis l'« attachement » des sockets. Worker déployé : `la-cage-salon` (LiftStudio).
- `serveur/deno.js` (39 l.) : banc d'essai local seulement.
- `Lancer.bat` de LA CAGE : si `node` est là, `node serveur\node.mjs` (jeu + salon) ; sinon Python seul (pas de salon).

**LAN avec IRIS — faisable, deux voies :**
1. **Recopier `relais.js` + `node.mjs`** dans `IRIS/serveur/` (port 8124, textes) et le choix node/python dans
   `IRIS/Lancer.bat`. Node v24.14.0 est installé sur le PC (`C:/Program Files/nodejs/node`). Même relais en LAN et sur
   Cloudflare : une seule logique à maintenir. **C'est la voie recommandée.**
2. **Ajouter un WebSocket à `serve.py`** (Python 3.12.10 installé) : faisable avec la seule bibliothèque standard —
   dans `do_GET`, si `Upgrade: websocket`, réponse 101 avec `base64(sha1(clé + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'))`,
   puis boucle de lecture des trames sur `self.rfile` (le serveur est déjà un `ThreadingTCPServer` à fils démons : un
   fil par joueur, ≤ 10 joueurs) ; plus `/etat` en JSON (sinon `repond()` de `net.js` croit le serveur mort). Mais il
   faut **porter `relais.js` en Python** (~120 l.) + les trames (~60 l.) : deux relais à garder identiques.

Budget Cloudflare (plan gratuit, `serveur/LISEZMOI.md` l. 95-106) : 100 000 requêtes/jour, un message WebSocket entrant
= 1/20 de requête → **2 000 000 messages/jour**. Un FPS hôte autoritaire : hôte 20 images/s + chaque invité ~30
commandes/s. **10 joueurs : 20 + 9 × 30 = 290 msg/s → ≈ 1 h 55 de jeu par jour ; 4 joueurs : 110 msg/s → ≈ 5 h.** Le LAN
(node.mjs) n'a pas de plafond.

#### `js/enligne.js` (1058 lignes) — l'hôte autoritaire

```js
export const ACTIONS = ['shoot', 'pass', 'spin', 'dribble', 'legs', 'behind', 'bump', 'sprint', 'walk', 'switch']   // l. 58
export class EntreeDistante   // l. 80 : (joueur = null) ; recevoir(m) ; down(id) ; pressed(id) ; released(id) ; peek(id) ; sprint() ; amplitude() ; .dir
export class MatchEnLigne     // l. 121 : constructor(game, room, m, role = null) ; role 'hote' | 'client' | 'spect'
  // hôte : installer, ajouterPilote, choisirPilotes, abandon, recevoirInput, evt(e, urgent), apresPas(dt), envoyerImage, image() (l. 318), annoncer (l. 352), rejoindre (l. 372), demandeSpect, depart
  // invité : recevoirEtat (l. 494), recevoirMien (l. 526), relacher, sansJoueur, reconcilier (l. 578), appliquerJoueur, appliquerImage (l. 606),
  //          heure, pasClient (l. 720), predire (l. 791), envoyerCommandes (l. 824)
export class Matchs           // l. 891 : la liste des matchs annoncés (oubliés 6 s après la dernière annonce), rejoindre / regarder / rapide
```
Le principe (en-tête l. 1-50) : **une seule simulation, celle de l'hôte** ; les invités n'envoient que leurs commandes
(manche + touches, appuis tout de suite, manche ≤ 20/s, numérotées `q`) ; l'hôte les rejoue sur le joueur de l'invité
avec **la même interface que `js/input.js`** (le code de jeu ne voit pas la différence) et renvoie 20 images/s
horodatées (`tm`, `heurePas`) avec `ak` (dernière commande reçue). L'invité : montre les autres 80-150 ms dans le passé
(Horloge + Tampon), **prédit son propre joueur** avec le même `Player.move`, corrige l'écart en douceur (constante 0,1 s,
d'un coup au-delà de 1,5 m), gèle sa prédiction pendant les gels de l'hôte (`gelFin`). Départs : la place repasse à
l'ordinateur après 6 s sans nouvelles ; onglet de l'hôte caché → message `hp`.

Une image `state` (l. 318-349) : `{ t:'state', n, tm, st, stT, sc, clock, ball, pl:[{ i, p:[x,z], f, v, st, sp, e, j, jv, b, s, u, w, an }], ctl, ak, ev }`.

À changer pour un FPS : `ACTIONS` (tirer, viser, recharger, changer d'arme, accroupi, interagir, déguiser…) ; ajouter à
`input` le **lacet et le tangage de la visée** (aujourd'hui seule une direction monde `x, z` part, l. 834-842) ; ajouter
**`y`** aux positions (tout est en 2D `p:[x, z]` ; IRIS a 4 niveaux) ; ajouter la **compensation de latence** (l'hôte doit
rejouer le tir de l'invité sur les positions que l'invité voyait, ~`lag` + retard d'affichage plus tôt : garder ~1 s
d'historique des boîtes de touche côté hôte). Tout le ballon, la jauge et le miroir des équipes : à jeter.

#### `js/presence.js` (574 lignes)

`export class Presence` l. 103, `constructor(scene, roster, yard = null)`, `attach(room)` l. 135, `emit(u, dt, charId, ball, tn)`
l. 184 (≤ 12 paquets/s en mouvement, un signe de vie toutes les 2 s à l'arrêt), `onPos(m)` l. 271 (avatar créé au premier
paquet + plaque du pseudo, tampon horodaté), `update(dt, camPos)` l. 368, `pasDeLoin(o, cam, dt)` l. 441 (**animation une
image sur trois au-delà de 40 m**), `retirerJoueur(id)` l. 358, `inRing(centre, rayon)` l. 498, `setVisible(v)` l. 525 ;
`export class Demo` l. 542 (faux joueurs qui passent par le même tuyau : test sans serveur). Bon pour « se balader à
plusieurs dans l'école ». La moitié du fichier est propre au parc de Bécon (`ter`, `pl`, `pn`, `mh`, vélos, plateau seul).

#### `Player.etatAnim()` / `appliquerAnim(e, emotes, propre)` (`js/player.js` de LA CAGE l. 1689-1843)

N'envoie que les champs qui ne sont pas au repos (un joueur qui marche : 3 champs, pas 40) ; à la réception, une
minuterie de geste n'est reprise que si le geste commence ou si l'écart dépasse `TOL_ANIM` (l. 182) — sinon le clip
avance par à-coups 20 fois par seconde. **IRIS n'a ni l'une ni l'autre, ni `remote`** (grep vide dans `IRIS/js/player.js`).

### 2.4 `js/game.js` de LA CAGE — états de match, chronos, pilotes

- `frame(dt)` l. 926 : pas fixe 1/120 s, 6 pas max par image (5 au téléphone), deux pas de retard gardés,
  `Player.poseVisible = n === nPas - 1` (seul le dernier pas calcule la pose fine). **IRIS a la même boucle**
  (`IRIS/js/game.js` l. 444-471) mais **n'utilise plus `Player.poseVisible`** (défini l. 1157 de `IRIS/js/player.js`,
  lu nulle part) : chaque pas de 1/120 s recalcule toute la pose de chaque `Player`.
- `update(dt)` l. 1133 : **la boucle des pilotes** l. 1153-1158 — pour chaque joueur, `R.piloteDe(p)` (réseau) →
  `controlUser(dt, pil)`, sinon le joueur local → `controlUser(dt)`, sinon `this.ais.get(p)?.update(dt)`. C'est la
  couture prévue pour le réseau.
- États : `this.state` ∈ `'countdown' | 'playing' | (pause après panier) | 'over'`, `this.stateT` (s) ; compte à rebours
  l. 1159-1164 (`lastCount`, `hud.feedback(n | 'GO !')`, `audio.buzzer()`) ; chrono des tirs `shotClock` décrémenté dans
  `rules(dt)` l. 3136 ; `startMatch(opts)` l. 897 (scores à 0, `state = 'countdown'`, `stateT = 3.4`, sifflet) ;
  `finDeMatch(win)` l. 3415 ; `turnover(msg, newOffense, ra)` l. 3437 ; `reward(why, coins, xp)` l. 3327.
- `updateContacts()` l. 2170 : séparation des corps (demi-largeur 0,34 m, force `pen × 55`, partagée selon gabarit),
  consommée par `Player.move` via `p.push`. **IRIS n'a pas `push`.**
- `rnd()` l. 3225 (`this.rng.next()`, `this.rng = new Rng(...)` l. 151, graine `opts.seed` l. 598) ; `setDemo(n)` l. 3232 ; `lancerEnLigne(opts)` l. 3242 ;
  `recevoirMatch` l. 3258 ; `setOnline(room)` l. 3299.
- `enterMenu()` l. 678 + caméra du menu l. 3521-3530 (orbite lente autour du terrain derrière le menu) ;
  `enterLobby()` l. 708 ; `_buildRing()` l. 392 (le **cercle bleu** : on entre dedans à plusieurs pour lancer un match).
- `fx.calme = this.mode !== 'match' || this.state !== 'playing' || this.paused` (l. 1002) : la qualité automatique ne
  remonte pas en pleine action (une remontée coûte une image). IRIS pose `fx.calme = true` en permanence (l. 487).

### 2.5 `js/ui.js`, `js/matchs_ui.js`, `index.html`, `css/style.css` — menus et tableau des scores

- `buildMenu(roster, settings, cb)` l. 90 : écrans `<section class="menu-screen" data-screen="…">` dans `#menu`, boutons
  `data-go`, Échap revient à l'accueil, rend `{ show(screen), hide(), refresh(), player }`. Accueil dans `index.html`
  l. 166-187 (logo, 7 boutons `.nav-btn` numérotés, pied). CSS : `.home`, `.nav-btn` (l. 46-71 de `css/style.css`).
- `buildMatchSetup` l. 236 (mode, difficulté, score cible, équipes, `MODES` l. 14 : DUEL/DUO/TRIO/ESCOUADE/FULL COURT),
  `buildOptions` l. 638, `buildShop` l. 488, `buildVoeux` l. 1347, `buildOnline(roster, cb)` l. 1114 (la « porte » :
  pseudo, adresse, CHERCHER SUR LE WIFI, chat, conseils selon local/APK/en ligne).
- `class HUD` l. 929 : `setNames(u, c)`, `setScore(u, c)`, `setClock(v)` (n'écrit le DOM que si la valeur change),
  `possession`, `hint`, `feedback(text, cls)` (émet `hoops-feedback` → vibrations manette), `gain(why, coins, xp)`,
  `meter`, `stamina`, `momentum`, `streak`. Balisage `#hud .scoreboard` dans `index.html` l. 517-548 ; CSS
  `.scoreboard` l. 239 et marge de zone sûre l. 1130.
- `showOverlay(title, text, buttons)` / `hideOverlay()` l. 1100-1108 : **identiques dans IRIS** (`IRIS/js/ui.js` l. 361-369).
- Écran **CRÉDITS** : `index.html` l. 319-365 (CMU avec la formule exigée, Mixamo, DeepMotion, Sketchfab CC BY 4.0).
- `js/matchs_ui.js` : `creerBlocMatchs(parent, avant, jeu, actions)` l. 51, `construireHub(game, actions)` l. 72 ;
  éléments créés en JS (une page en cache par le service worker les a quand même).
IRIS n'a que `buildOptions`, `HUD` (sans score ni chrono), `EmoteWheel`, `showOverlay` : **pas de menu d'accueil, pas de
tableau des scores, pas d'écran crédits.**

### 2.6 `js/audio.js` — sons procéduraux

LA CAGE : tout est synthétisé (sauf 5 enregistrements CC0 du parc). Briques `_osc(type, f0, f1, dur, vol, when)` l. 119
et `_noise(dur, vol, filterType, freq, attack, when, q)` l. 133 — **déjà dans IRIS** (`IRIS/js/audio.js` l. 55-87), avec
en plus un envoi vers une réverbération (`salle(k)`). À prendre (une ligne chacun) : `buzzer()` l. 178, `refus()` l. 180,
`whistle()` l. 234, `boom()` l. 112, `block()` l. 240, `ooh()` l. 110, `cheer()` l. 238, `boo()` l. 239 ; `swell`/
`setCrowd` (foule, l. 69-108) si on veut une ambiance de fin de manche. Les pas des autres sont déjà joués par
`js/couches.js` pour tout `Player` (l. 124, 328, 344) — **mais seulement si `p.mesh.visible || p.vuePremiere`**.

### 2.7 `js/hoopfx.js`

`HoopFx(scene, hp, boardDist)` : ressort amorti (raideur 420, amortissement 5,5) + filet de Verlet (96 nœuds, 180 cordes,
mise en sommeil). Rien de direct pour un FPS ; le ressort amorti est la bonne forme pour le **recul de l'arme** et le
retour du réticule.

### 2.8 `js/fx.js`

Identique (voir § 1). Pour le FPS : le bloom fera briller les éclairs de bouche ; un sprite est rangé à part dans la
passe de normales de l'occlusion (`_decoupes`, l. 1542 ; c'est pour ça que `presence.horsNormales` existe dans LA CAGE) ;
penser à poser `fx.calme = false` pendant une manche.

### 2.9 `js/badges.js`, `js/roster.js`, `js/portraits.js`, `js/training.js`

- `badgeFx(map)` l. 91 : `{ id: niveau }` → objet de coefficients cumulés ; `badgeList(map)` l. 103. Mécanique d'atouts.
- `ROSTER` (`js/roster.js` l. 6) : 17 fiches `{ id, name, height, model: 'assets/<id>.glb', modelHeight, color1, color2,
  skin, fit?, coupeManche?, coupeBas?, mainsVisage? }` — haythem, ethan, clovis, lamine, djafar, haris, aiden, titouan,
  nico, massyl, koji, antoine, marcantoine, imad, nemanja, gabriel, yazid (+ 4 fiches sans avatar à ne pas utiliser).
  IRIS sait déjà charger ces champs (`IRIS/js/player.js` `_loadAvatar` l. 231 : `couperTenue`, `equiperShader`).
- `portrait(def)` l. 106 (async, data-URL 192 px, cache localStorage `hoops.portraits.v1`), `portraitCache(id)` l. 116,
  `prechauffer(roster, onOne)` l. 120 ; dépend de `urlAvatar` (existe dans `IRIS/js/player.js` l. 55) et de `NUAGES`
  (existe dans IRIS). Second contexte WebGL libéré 3 s après le dernier portrait.
- `Training(scene, game)` l. 41 : `start(id)`, `stop()`, `update(dt, user)`, `finish()`, records localStorage
  `hoops.training.v1`, anneaux verts au sol, chrono. Patron d'un **stand de tir** / d'un parcours chronométré.

### 2.10 Les assets réutilisables

| Asset | Taille | Pour quoi |
|---|---|---|
| `assets/<ami>.glb` (17) | 2,6 – 4,7 Mo chacun | joueurs/bots en haute qualité |
| `assets/tel/<ami>.glb` (17) | 35 Mo au total | même chose au téléphone |
| `assets/passants/<nom>.glb` (aiden, clovis, djafar, ethan, haris, lamine, nico, titouan) | 0,8 – 1,0 Mo + `_couleur.webp` 150-200 Ko (`_512` 53-63 Ko) + `_masque.jpg` + `_relief.jpg` | **bots légers** : un seul maillage (+ un maillage de loin ~5 200 triangles), squelette Mixamo intact, recolorables par équipe |
| `assets/anims/cmu/getup.json` (51 Ko) | — | `knock` (chute = relève jouée à l'envers, `reverse: true`, fit 0,80) et `getup` (fit 1,25) : **mort et réapparition** |
| `assets/anims/Defeated.fbx` (855 Ko), `Picking Up.fbx` (1,0 Mo), `Goalkeeper Idle.fbx` | — | défaite de fin de manche, ramasser des munitions, garde basse |
| `assets/anims/Taunt.fbx`, `Victory.fbx`, `Cheering.fbx`, `Clapping.fbx` | — | **déjà dans IRIS** |
| `assets/bin.glb` (356 Ko), `chaise.glb` (1,2 Mo), `poteau.glb` (60 Ko), `ball.glb` (2,1 Mo), `lamp.glb` (300 Ko) | — | déguisements possibles du prop hunt (mais IRIS a ses propres meubles dessinés par le code, plus fidèles à l'école) |
| `assets/anims/dm/*` (DeepMotion, 4 Mo) | — | **à NE PAS reprendre** (basket, et tirés de vidéos YouTube) |

**Aucune animation d'arme** dans LA CAGE (ni visée, ni recharge). Les bras armés seront procéduraux avec l'IK déjà
présente des deux côtés (`AvatarRig.ikBras(cote, cible, fDes, nDes, pole, k)`, `viserPoint`, `repereMain`, `plierDoigts`,
`js/avatar.js` l. 254-357, identique) ou viendront de nouveaux clips Mixamo.

---------------------------------------------------------------------------------------------------------------------

## 3. MESURES (navigateur, IRIS en jeu)

**Le monde solide d'IRIS** (`__game.collisions`) :
- 1 466 formes : 1 115 boîtes, 314 cercles, 37 boîtes orientées ; 1 216 pour le joueur, 1 391 pour la caméra, 250
  caméra seule (plafonds…), **75 `camera:false`** (mobilier bas de 0,56 à 0,95 m : tables, chaises, présentoirs) ;
  481 cases de grille (2 m) ; 53 sols dont 12 rampes ; 118 plafonds ; bornes x −22…47, z −24,5…12,45.
- 5 formes mobiles (portes automatiques) : porte 6 (x 14,15-16,11, z −0,84) ; porte du palier de l'escalier est
  (x 17,9-18, z −8,81…−8) aux niveaux 0, 3,5 et 6,6 ; une porte du 1er (x 10,05-11, z −12,9).
- Dalles aux hauteurs −3,06 / −1,53 / −0,12 / 0 / 0,12 / 0,7 / 1,75 / 3,5 / 5,05 / 6,6 / 8,15. Rampes : volée 2 de
  l'escalier principal pente 0,48 (1,23 m de large), escalier est 0,69-0,77 (1,50-1,65 m), **volée de tôle 0,706 sur
  0,85 m de large**.

**Prototype de graphe de navigation** (console, grille sur toute l'emprise, nœud si `solEn` cohérent + `libre` + 1,9 m
sous plafond ; arête aux 8 voisins si dénivelé ≤ 0,45 m et `deplacer` arrive au bout) :

| Pas / rayon | Nœuds | Arêtes | Temps | Atteints depuis le départ (14,9 ; −3,7) | dont −1 / 0 / 1er / 2e |
|---|---|---|---|---|---|
| 0,50 m / 0,30 | 7 828 | 26 591 | 196 ms | 4 283 (RDC seul, coupé du reste) | — |
| 0,25 m / 0,30 | 30 384 | 111 390 | 586 ms | 9 611 | 815 / 7 581 / 1 020 / 195 |
| 0,25 m / 0,30, portes auto ouvertes | 30 396 | — | 538 ms | 9 647 | 815 / 7 593 / 1 032 / 207 |
| 0,25 m / 0,25, portes ouvertes | 32 058 | — | 470 ms | 10 638 | 886 / 7 917 / 1 589 / 246 |
| 0,20 m / 0,25, portes ouvertes | 49 627 | — | 807 ms | 16 897 | 1 445 / 12 568 / 2 509 / 375 |

Lecture : la plus grande « composante » (16 653 nœuds à 0,25 m) est le **dehors** (derrière le bâtiment, mitoyens) → il
faut remplir depuis une graine, pas tout prendre. Les quatre niveaux sont bien reliés par les escaliers, **mais la
grille brute laisse des îlots** : au 2e, des îlots de 442, 302, 204, 187 et 118 nœuds non reliés au départ ; au −1, 952
(espace pause ouest, via la volée de tôle de 0,85 m) et 277 (grande salle). Exemple sondé au 2e : entre x 9,84 et 9,96
un mur plein sépare les salles côté rue (pas de porte) ; les passages qui relient vraiment ces pièces sont plus étroits
que ce que la grille sait franchir. → **il faut des nœuds de porte** (centre de chaque baie, de part et d'autre) et
une vérification au `Player.move` réel, pas une grille seule.

**A\*** (tas binaire, JS brut) sur la grille de 0,25 m : 3,8 à 12 ms pour des chemins de 21 à 35 m (1 000 à 2 500 nœuds
ouverts). Trop pour 8 bots qui recalculent souvent ; OK pour un graphe de points de passage de quelques centaines de
nœuds (pièces + portes + paliers) précalculé une fois.

**Tir instantané** : `collisions.rayonLibre(...)` sur 30 m, rayon 0 : **86 µs** par rayon (2 000 rayons, 65 % touchent un
mur). Coût négligeable même à 15 tirs/s × 10 tireurs.

**Bots = `Player` d'IRIS** (6 clones de `HAYTHEM`, modèle déjà en cache) :
- création 6 ms pour les 6 ; clips prêts en 147 ms ;
- `Player.move` **7,8 µs** par pas, `Player.update` **65 µs** par pas (boucle serrée) ;
- en jeu, 6 bots qui tournent en rond : **1,59 ms par pas de 1/120 s**, image médiane **21,8 → 39,8 ms** (95e centile
  29 → 63 ms), retour à 23,6 ms après retrait ;
- un avatar = 4 maillages skinnés, 21 156 triangles, 52 os (4 appels de dessin + l'ombre).
→ Le coût est dans la POSE recalculée à chaque pas de 120 Hz, pas dans le déplacement : simuler à 120 Hz, animer
**une fois par image affichée** (et une sur trois au loin, `presence.pasDeLoin`).

---------------------------------------------------------------------------------------------------------------------

## 4. LICENCES ET PROVENANCE

Déjà dans IRIS et crédités (`IRIS/CREDITS.md`) : avatar de Haythem (Avaturn), clips Mixamo, mocap CMU (143_32/39/40,
« NSF EIA-0196217 »), 5 danses Sketchfab **CC BY 4.0**, `voitures.glb` (Comrade1280, CC BY 4.0), béton Poly Haven CC0,
Three.js MIT, es-module-shims MIT, polices OFL.

Ce que LA CAGE apporterait en plus :
| Ressource | Origine / licence | Statut |
|---|---|---|
| Avatars des amis (`assets/*.glb`, `assets/tel`, `assets/passants`) | Avaturn ; `tools/credits_passants.md` : aucune ressource extérieure ajoutée | OK techniquement ; ce sont des **visages réels** → demander aux amis s'ils veulent servir de cibles dans un FPS |
| `cmu/getup.json` (139_18) | CMU, formule exigée (déjà dans les crédits de LA CAGE) | OK |
| `Defeated.fbx`, `Picking Up.fbx`, `Goalkeeper Idle.fbx` | Mixamo | OK (conditions Mixamo) |
| Sons du parc (`assets/sons/`, 535 Ko) | Freesound CC0 (`tools/credits_sons.md`) | OK, mais inutiles ici |
| Arbres du parc (`assets/parc/`) | Sketchfab CC BY 4.0 (`CREDITS.md`) | inutiles ici |
| `assets/tree2.glb` | « Low Poly Tree Scene Free », Nicholas-3D, Sketchfab CC-BY (README l. 1217) | inutile |
| `assets/bin.glb`, `ball.glb`, `hoop.glb`, `hoop2.glb`, `rim.glb` | « Sketchfab, fourni par Haythem » (README l. 1220, 1259) — **licence non notée** | à vérifier avant tout réemploi |
| `assets/lamp.glb` | « Street lamp (low poly) », pinokio21 (README l. 445) — **licence non notée** | idem |
| `assets/chaise.glb`, `poteau.glb` | scans 3D de Haythem | à lui |
| `assets/marchand.glb` | Avaturn de Pierrick (personne réelle) | idem avatars |
| `assets/anims/dm/*` | DeepMotion Animate 3D à partir de vidéos YouTube | **ne pas reprendre** |

**IRIS n'a aucun écran de crédits en jeu** : la licence CC BY 4.0 des danses exige l'attribution là où l'œuvre est
diffusée (le commentaire de LA CAGE `index.html` l. 319-322 le rappelle). Le menu d'accueil du FPS doit avoir son écran
CRÉDITS (copier la section de LA CAGE l. 323-365 en retirant le basket et le parc).

---------------------------------------------------------------------------------------------------------------------

## 5. PIÈGES

1. **Le salon public de LA CAGE.** `net.js` tel quel se connecte à `SERVEUR_PUBLIC` (`la-cage-salon`) et le relais force
   le salon unique `PUBLIC` (`relais.js` l. 33, `salonUnique = true`) : les paquets `pos` d'IRIS arriveraient dans le hub
   de LA CAGE (et inversement). Nouveau worker (`iris-salon`) ou un champ `jeu` filtré par le relais.
2. **Port 8123 codé en dur** : `net.js` l. 89 et l. 106, `node.mjs` l. 31, textes de `ui.js` l. 1130 et 1285, `Lancer.bat`.
3. **Positions 2D.** Paquets `pos` et images `state` en `p:[x, z]` ; `Tampon` n'a `y` que pour le ballon. IRIS a 4 niveaux :
   envoyer `y` (ou le niveau), sinon un joueur à l'étage est montré au rez-de-chaussée.
4. **`Monde.sol(x, z)` n'a pas de `y`** ; `collisions.solEn(x, z, y)` en a besoin. Tout code de `pedestrians.js` porté
   doit passer la hauteur courante de l'agent.
5. **Les portes automatiques ne s'ouvrent que pour Haythem et la caméra** : `PortesEcole.maj(dt, x, z, camX, camZ, y, camY)`
   (`IRIS/js/ecole_portes.js` l. 580, appelée l. 2446 de `carte_ecole.js`) ne prend qu'UNE position (rayon 2,1 m, l. 297).
   Fermée, la porte est un mur (`forme.off = false`) : un bot s'y écrase. Il faut une liste d'agents.
6. **Visibilité par zones** (`IRIS/js/ecole_visibilite.js`, `zoneDe(x, y, h)` l. 115 avec y = −z du monde, `zonesCachees`
   l. 336, `__visibilite.cachees`) : les pièces cachées perdent leurs murs à l'image ; un bot dans une pièce cachée serait
   vu « à travers » → cacher les bots de leur zone. Mais **`couches.js` ne joue les pas que si `p.mesh.visible`**
   (l. 124, 328) : cacher un bot le rend muet. Séparer « dessiné » et « audible ».
7. **Les tirs traversent le mobilier bas** : `rayonLibre` ignore les 75 formes `camera:false` (tables, chaises) et les
   formes `off`. Il faut une requête « balles » qui les compte (même parcours de grille, autre filtre).
8. **Coût de la pose** (§ 3) : `Player.poseVisible` n'est plus lu dans IRIS ; sans découplage simulation/pose, 6 bots
   doublent le temps d'image.
9. **Pas de `push`, pas de `team`, pas de `remote`, pas d'`etatAnim`** dans le `Player` d'IRIS (constructeur
   `Player(def, scene)` l. 142 ; LA CAGE : `Player(def, scene, isUser)`).
10. **La visée verticale est bridée** : `camPitch` borné à [−0,1 ; 0,9] rad (`IRIS/js/game.js` l. 247) — un FPS veut ±1,45.
    En 1re personne, le corps suit la marche (`faceWant` = direction du déplacement, `player.js` l. 721), pas la
    caméra : pour mitrailler en pas chassés, le cap doit suivre le lacet de la caméra.
11. **Pas de bouton de souris** dans `Input` (clavier + manette + tactile seulement ; le clic sert à capturer le
    pointeur, `game.js` l. 238). Ajouter des codes « Souris:0 / Souris:2 ». À la manette, RT = sprint aujourd'hui
    (`settings.js` l. 13) : à déplacer (L3) pour libérer LT/RT (viser/tirer, hystérésis déjà là, `manette.js` l. 29).
12. **`_noise` alloue un tampon audio à chaque appel** (les deux `audio.js`) : une rafale à 12 coups/s + les bots = beaucoup
    de déchets → précalculer un bruit blanc une fois. Pas de spatialisation non plus (aucun `PannerNode`, atténuation à la
    seule distance, à travers les planchers) : un FPS a besoin de la direction.
13. **Grille de navigation** : remplir depuis une graine (sinon on navigue dehors) ; ajouter des nœuds de porte ; la volée
    de tôle (0,85 m) et les rangs serrés (blocs solides, on s'y « faufile » par un mécanisme à part, `Player._glisserRang`)
    ne passent pas à la grille.
14. **`DIFFICULTY` règle la vitesse de l'ordinateur** (`speedMul`) ; dans un FPS, ralentir un bot se voit : jouer sur la
    précision, le temps de réaction et l'agressivité plutôt.
15. **Nouveaux modules** : à ajouter à `sw.js` (changer `VERSION = 'iris-v2.0'`) et refaire `assets/chargement.json`
    avec `tools/liste_chargement.py` (sinon ils se chargent hors de la barre, et l'ancien cache sert l'ancien code).
16. **Les modes** : `touch.js` (l. 274, 311, 418) et `manette.js` (l. 206, 276) ne marchent qu'en `game.mode === 'lobby'`.
    Un mode FPS doit soit garder `'lobby'` comme mode et ranger la partie ailleurs (`game.partie`), soit élargir ces tests.
17. **Fins de ligne CRLF** dans LA CAGE (§ 1).
18. **Qualité automatique** : sur une machine chargée, IRIS passe en « moyenne » tout seul ; ne pas laisser la
    remontée tomber au milieu d'un échange de tirs (`fx.calme`).

---------------------------------------------------------------------------------------------------------------------

## 6. COMMENT S'Y BRANCHER POUR LE FPS ET LE PROP HUNT

Principe : on n'importe PAS les modules de LA CAGE dans IRIS (ils tirent `monde.js`, `ball.js`, `court*.js`…) ; on
**recopie et taille** les morceaux utiles dans de nouveaux fichiers d'IRIS, en français, en gardant leurs commentaires.

### 6.1 Ossature (solo d'abord, sérialisable dès le premier jour)

1. **`IRIS/js/reseau_outils.js`** ← `Rng` (net.js l. 224-238), `Horloge` (l. 252-297), `heurePas` (l. 299-307), `Tampon` +
   `hermite`/`hermiteD`/`copier` (l. 319-376), en LF. Ajouter `y`/`vy` aux joueurs dans `Tampon.lire`.
   Ajouter à `Game` (IRIS) : `this.rng = new Rng(graine)` et `rnd() { return this.rng.next(); }` — **tout tirage de
   règle (dispersion, dégâts aléatoires, choix des bots, apparitions) passe par `jeu.rnd()`**.
2. **`IRIS/js/partie.js`** : la manche, sur le modèle de `startMatch` / compte à rebours / `rules` / `finDeMatch`
   (game.js de LA CAGE l. 897-924, 1159-1169, 3136, 3415). États : `'decompte' → 'manche' → 'fin_manche' → 'fin'`, `stateT`,
   chrono de manche, score par équipe et par joueur, `etat()` qui rend un objet JSON (scores, chrono, état, liste des
   combattants `{ id, equipe, x, y, z, lacet, tangage, vie, arme, munitions, anim }`) et `appliquer(etat)` — c'est ce
   que l'hôte enverra plus tard tel quel.
3. **La boucle des pilotes** (game.js LA CAGE l. 1153-1158) dans `IRIS/js/game.js` `update` : chaque combattant a une
   SOURCE de commandes avec l'interface d'`Input` (`down`, `pressed`, `released`, `sprint`, `amplitude`, `.dir`, + `lacet`,
   `tangage`) : le clavier local, un bot (qui remplit cette interface), plus tard `EntreeDistante` (enligne.js l. 80-119).
   Le même code de jeu sert les trois.
4. **`Player` d'IRIS** : ajouter `push` + `updateContacts` (game.js LA CAGE l. 2170-2193) ; `equipe`, `vie` ;
   séparer `simuler(dt)` (déplacement, saut, minuteries : 120 Hz) et `poser(dt)` (clips, couches, IK : une fois par image
   affichée, une image sur trois au loin comme `presence.pasDeLoin` l. 441-452). Mesuré : la pose est 8× plus chère que le
   déplacement.
5. **Les animations** : ajouter au manifeste d'IRIS `knock` (`cmu/getup.json`, `reverse: true`, `fit: 0.8`) et `getup`
   (`fit: 1.25`) — copier `assets/anims/cmu/getup.json` (51 Ko) ; `defeat` (`Defeated.fbx`, fit 3,2) ; `IRIS/js/anim.js`
   sait déjà jouer `reverse` (l. 59, comme LA CAGE). Bras armés : IK
   `ikBras('Right', poignée)` / `ikBras('Left', garde-main)` sur la pose de course, dans le même ordre que les couches
   (après `surFin`).

### 6.2 FPS

- **Caméra** : partir de la vue 1 d'IRIS (`game.js` l. 1010-1033, œil dans l'os `Head`) ; élargir `camPitch` ; corps calé
  sur le lacet ; arme à la première personne dessinée dans une petite scène à part (ou un groupe enfant de la caméra
  rendu après le décor) pour qu'elle ne rentre pas dans les murs.
- **Tir** : hitscan. Murs : une variante de `Collisions.rayonLibre` qui compte aussi `camera:false` (86 µs le rayon de
  30 m). Corps : capsules par os (tête/torse/jambes) posées sur `AvatarRig.bone(...)`, testées après le mur le plus
  proche. Dispersion et recul tirés par `jeu.rnd()`. Recul : ressort amorti (formes de `hoopfx.js` l. 10-13).
- **Sons** : partir des briques d'IRIS + `boom`/`block` de LA CAGE ; un bruit blanc précalculé ; un `PannerNode` par
  source ; bruit d'un tir entendu par les bots (rayon d'audition).
- **HUD** : reprendre `.scoreboard` + `HUD.setScore`/`setClock` (LA CAGE `index.html` l. 518-522, `ui.js` l. 947-950,
  `css/style.css` l. 239), `feedback` pour les annonces (« ÉLIMINÉ », « DOUBLÉ ») — il fait déjà vibrer la manette —, un
  réticule, la vie, les munitions, le fil des éliminations avec `portrait(def)` (portraits.js l. 106).
- **Bots FPS** (`IRIS/js/bots.js`, à écrire) :
  - corps : `Player` + fiche de `ROSTER` (amis) au PC, **passants** au téléphone (1 maillage, LOD à 12 m), teinte
    d'équipe par `materiauPassant` (pedestrians.js l. 217-239) ;
  - navigation : graphe de points de passage d'IRIS = pièces + **nœuds de porte** + paliers/volées, construit au
    chargement depuis `collisions` (le prototype à la grille prend 0,5-0,8 s et laisse des îlots : § 3) ; A* dessus ;
  - pilotage : `moveTo` + `sprintH` (ai.js l. 88-107), carotte + moustaches + évitement + coincé/arête barrée
    (pedestrians.js l. 1902, 2096-2166, 1991) avec la table `Monde → Collisions` du § 2.2 ;
  - perception : cône de vue + `rayonLibre` vers la tête de la cible (à cadence réduite, 5-10 Hz par bot), mémoire de la
    dernière position vue, ouïe (tirs, pas) ;
  - combat : temps de réaction, erreur de visée qui se resserre, rafales, recharge à couvert ; la difficulté joue sur ces
    réglages (pas sur `speedMul`) ;
  - portes : la liste des agents passée à `PortesEcole.maj` ; visibilité : bot caché si sa zone l'est, mais audible.

### 6.3 Prop hunt

LA CAGE n'a rien de prop hunt ; ce qu'elle prête :
- la **manche chronométrée** de `partie.js` (temps de cache des props 30 s pendant lequel les chasseurs sont aveugles,
  puis chasse ; compte à rebours et `buzzer()` repris de game.js l. 1159-1164) ;
- `whistle()` (audio.js l. 234) = le **sifflet obligatoire** des props toutes les N secondes, `Taunt.fbx` (déjà dans IRIS) ;
- le **cercle bleu** (game.js l. 392, `presence.inRing`) pour lancer une manche à plusieurs dans le hall ;
- la recoloration du shader pour marquer l'équipe des chasseurs ;
- côté bots : le même pilotage ; un bot prop choisit un meuble cohérent avec la pièce (chaise coque près des tables,
  corbeille près d'un mur) et se fige ; un bot chasseur tire sur ce qui n'était pas là au début de la manche (liste des
  meubles relevée au chargement) avec une pénalité de vie par tir à côté.
Les déguisements eux-mêmes viennent d'IRIS : ses meubles sont dessinés par le code (`ecole_mobilier.js` exporte
`geoCoque()` l. 55 ; `ecole_rue_mobilier.js` exporte `corbeille`, `bacRoulant`, `potRond`, `banc`… l. 574-790) et
fusionnés dans le décor : pour un déguisement, il faut refaire le meuble à part avec ces fonctions (on ne peut pas
« prendre » une chaise dans le décor cousu). Les GLB de LA CAGE (`bin.glb`, `ball.glb`…) ne servent qu'en appoint, licence à
vérifier.

### 6.4 Plus tard : en ligne / LAN

1. `IRIS/serveur/relais.js` (copie) + `IRIS/serveur/node.mjs` (port 8124, textes IRIS) + `Lancer.bat` à la LA CAGE
   (node si présent, sinon `serve.py` solo). `net.js` copié avec `SERVEUR_PUBLIC = ''` au début (jeu en LAN seulement),
   `ANNUAIRE` vide, port 8124, clés de stockage `iris.*`.
2. `MatchEnLigne` taillé : `ACTIONS` du FPS, lacet/tangage dans `input`, `y` dans `pl`, `partie.etat()` dans `state`,
   compensation de latence des tirs côté hôte (historique de 1 s des capsules), bots de l'hôte comme des joueurs
   ordinaires (« places tenues par l'ordinateur » de `annoncer`, l. 352-364 : rejoindre en cours prend un bot).
3. `etatAnim`/`appliquerAnim` réécrits pour IRIS.
4. Cloudflare (facultatif) : nouveau worker, budget ≈ 2 h/jour à 10 joueurs.

### 6.5 Taille du travail (ordre de grandeur)

| Lot | Repris de LA CAGE | Neuf | Durée |
|---|---|---|---|
| Ossature (rng, partie, pilotes, contacts, pose découplée) | ~250 l. | ~400 l. | 2-3 j |
| FPS jouable contre bots (armes, tir, HUD, menu, sons) | ~150 l. (+ CSS ~80) | ~1 500 l. | 5-7 j |
| Navigation + IA des bots | ~200 l. (pilotage) | ~900 l. | 4-6 j |
| Prop hunt solo | ~50 l. | ~700 l. | 3-4 j |
| LAN (relais + node.mjs + net.js) | ~1 000 l. presque tels quels | ~100 l. | 1-2 j |
| Hôte autoritaire FPS | ~450 l. adaptés | ~500 l. | 4-5 j |
