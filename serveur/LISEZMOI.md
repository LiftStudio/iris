# Jouer à IRIS en ligne

Même principe que LA CAGE : un petit serveur sans dépendance (`serveur/node.mjs` + `serveur/relais.js`) qui sert
**le jeu ET le salon en ligne sur le même port** (8124). Personne n'a rien à taper : le jeu trouve le serveur tout
seul, parce que c'est celui qui lui a envoyé la page.

## 1. Chez toi, sur le même wifi : rien à configurer

1. Double-clique **`Lancer.bat`**. Si Node.js est installé, la fenêtre noire affiche :

   ```
   sur cet ordinateur   http://localhost:8124
   sur le meme wifi     http://192.168.1.154:8124   <- essaie celle-la en premier
   ```

2. Tes amis ouvrent **cette adresse-là** (avec `http://` devant) sur leur PC, leur téléphone ou leur tablette.
3. Chacun clique **EN LIGNE** dans le menu, choisit son pseudo et son personnage, puis **JOUER**.

Tant que la fenêtre noire reste ouverte, l'école est ouverte. L'écran EN LIGNE affiche aussi l'adresse à donner.

> Si un ami n'arrive pas à ouvrir l'adresse, c'est le pare-feu Windows : à la première ouverture il demande
> l'autorisation pour `node`. Réponds **Autoriser** et coche **Réseaux privés**.

## 2. À distance, sans rien installer : le tunnel

Garde la fenêtre du point 1 ouverte et lance, dans une autre fenêtre :

```bash
npx localtunnel --port 8124
```

Il donne une adresse en `https://….loca.lt` : ton ami l'ouvre et joue. C'est bien pour un soir à deux. L'adresse
change à chaque lancement, et tout passe par ton PC, qui doit rester allumé.

## 3. Un serveur ailleurs

Une page servie par un autre hôte peut viser un serveur précis : `?serveur=192.168.1.154:8124` ou
`?serveur=wss://mon-serveur/ws`.

Le relais est le même que celui de LA CAGE. Pour l'héberger en permanence sur Cloudflare, il faudrait porter son
enveloppe `cloudflare.js` (voir `Documents\Basket_1v1\serveur\LISEZMOI.md`), avec les types de messages d'IRIS :
`pos`, `fx`, `touche`, `elim`, `sync`.

## Ce qui passe sur le réseau

| message | qui l'envoie | pour quoi faire |
|---|---|---|
| `pos` | chaque joueur, 20 fois par seconde | position, regard, posture, arme et vie de son soldat |
| `fx` | le tireur | ses tirs, ses trajets de balle et ses impacts, que les autres voient et entendent |
| `touche` | le tireur, vers sa victime | les dégâts de sa balle. C'est la victime qui les applique, avec ses règles : gilet, protection d'apparition |
| `elim` | la victime, à tous | sa mort : chacun met à jour le fil des éliminations et le score |
| `sync` | le plus ancien du salon, au nouveau venu | le score et le temps de jeu en cours (match par équipes) |
| `manche` | le plus ancien (prop hunt) | les rôles de la manche : qui chasse, qui est meuble |
| `phase` | le plus ancien (prop hunt) | cachette, traque, révélation (et qui a gagné la manche), fin |

Deux salons, un par mode : `PUBLIC` (match à mort par équipes) et `PROPHUNT`. Au plus 10 élèves par salon. Il n'y a pas de bots en ligne.
Le serveur public est un Worker Cloudflare (`serveur/cloudflare.js`, `wrangler.jsonc`) : pour le redéployer, double-clique `serveur/Deployer_le_serveur.bat`.

Pas encore : les grenades des autres ne se voient pas voler (leurs dégâts arrivent bien), ni leurs séries
(drone, sentinelle).
