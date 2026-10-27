// Enveloppe Node du relais d'IRIS (reprise de LA CAGE, 27/10/2026) — SANS AUCUNE DEPENDANCE.
//
//     node serveur/node.mjs            (port 8124 : celui du jeu — LA CAGE garde le 8123)
//     PORT=9000 node serveur/node.mjs
//
// Pourquoi ecrire le WebSocket a la main plutot que d'installer `ws` : ce projet n'a ni package.json ni
// node_modules, et c'est un de ses agrements — on le clone, on l'ouvre, il marche. Le protocole tient en
// quatre-vingts lignes pour ce dont on a besoin (poignee de main, trames texte, ping, fermeture), et ces
// quatre-vingts lignes evitent d'avoir a expliquer un `npm install` avant de pouvoir essayer le jeu a deux.
//
// Ce fichier sert a jouer a plusieurs SUR LE MEME RESEAU : deux ordinateurs, ou un ordinateur et un telephone,
// sur le meme wifi. Pour jouer avec des amis a distance, il faut un serveur en ligne — voir serveur/LISEZMOI.md.
//
// IL SERT AUSSI LE JEU, et ce n'est pas un gadget. Trois raisons :
//   - une seule adresse a donner a ses amis (« tape 192.168.1.23:8124 »), au lieu d'une pour la page et une
//     pour le serveur, avec le risque de se tromper de port ;
//   - le WebSocket est alors de MEME ORIGINE que la page : plus aucune question de port bloque, de mixed
//     content ou de pare-feu different entre les deux ;
//   - le client peut deviner l'adresse du serveur tout seul a partir de celle de la page (js/ui.js), donc
//     personne n'a rien a taper du tout.
// Les fichiers sont revalides a chaque requete, comme dans serve.py : un module ES ou un clip .glb modifie
// est recharge a coup sur, sans re-telecharger les gros fichiers inchanges.
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Relais, LIMITES } from './relais.js';

const PORT = Number(process.argv[2]) || Number(process.env.PORT) || 8124;
// La constante magique de la RFC 6455 : le serveur la colle derriere la cle du client, prend le SHA-1 du
// tout, et renvoie le resultat en base64. C'est la seule preuve que le navigateur demande — et elle se
// recopie de travers sans que rien ne le dise : le serveur repond 101, la socket se ferme, le navigateur
// n'annonce qu'un code 1006 sans un mot d'explication. Verifiee ici contre l'implementation de Node.
const MAGIE = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// TRACE=1 node serveur/node.mjs : journalise CHAQUE message recu et l'etat du salon juste apres. A garder :
// c'est ce qui a montre que des clients reconnectes envoyaient « hello » et jamais « join », donc qu'ils
// etaient connectes et invisibles. Vu de l'exterieur, tout avait l'air normal.
const TRACE = !!process.env.TRACE;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.ktx2': 'image/ktx2', '.bin': 'application/octet-stream', '.gltf': 'model/gltf+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.wav': 'audio/wav', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.webmanifest': 'application/manifest+json',
};

const relais = new Relais({ journal: (m) => console.log(m) });
setInterval(() => relais.entretien(), 30000);

// ---------------------------------------------------------------- trames
// Cote serveur on n'ecrit jamais de masque (c'est reserve au client), et nos messages ne depassent jamais
// quelques kilo-octets : deux formes de longueur suffisent.
function trame(texte, opcode = 1) {
  const corps = Buffer.from(texte, 'utf8');
  const n = corps.length;
  const tete = n < 126 ? Buffer.from([0x80 | opcode, n])
    : n < 65536 ? Buffer.from([0x80 | opcode, 126, n >> 8 & 255, n & 255])
      : Buffer.concat([Buffer.from([0x80 | opcode, 127]), (() => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(n)); return b; })()]);
  return Buffer.concat([tete, corps]);
}

// Lit autant de trames completes que le tampon en contient. Le TCP decoupe ou il veut : une trame peut
// arriver en trois morceaux, et trois trames dans un seul paquet.
function lire(tampon, surTexte, surControle) {
  let p = 0;
  for (;;) {
    if (tampon.length - p < 2) break;
    const b0 = tampon[p], b1 = tampon[p + 1];
    const opcode = b0 & 0x0f, masque = (b1 & 0x80) !== 0;
    let n = b1 & 0x7f, q = p + 2;
    if (n === 126) { if (tampon.length - q < 2) break; n = tampon.readUInt16BE(q); q += 2; }
    else if (n === 127) { if (tampon.length - q < 8) break; n = Number(tampon.readBigUInt64BE(q)); q += 8; }
    const cle = masque ? tampon.subarray(q, q + 4) : null; if (masque) q += 4;
    if (tampon.length - q < n) break;
    const charge = Buffer.from(tampon.subarray(q, q + n));
    if (cle) for (let i = 0; i < n; i++) charge[i] ^= cle[i & 3];
    p = q + n;
    if (opcode === 1) surTexte(charge.toString('utf8'));
    else if (opcode === 8 || opcode === 9) surControle(opcode, charge);
  }
  return tampon.subarray(p);
}

// ---------------------------------------------------------------- serveur
// Sert un fichier du dossier du jeu. Le `path.resolve` puis le test de prefixe sont la SEULE protection qui
// compte ici : sans lui, une requete « /../../Documents » sortirait du dossier du jeu. Ce serveur tourne sur
// le reseau de la maison, pas seulement sur localhost — la question se pose donc vraiment.
function servirFichier(req, res) {
  const url = new URL(req.url, 'http://x');
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const abs = path.resolve(RACINE, '.' + rel);
  if (abs !== RACINE && !abs.startsWith(RACINE + path.sep)) { res.writeHead(403); res.end('interdit'); return; }

  fs.stat(abs, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('introuvable : ' + rel); return; }
    // Revalidation systematique + 304 si le fichier n'a pas bouge : on recharge a coup sur, sans retelecharger
    // les .glb (85 Mo au total) a chaque rafraichissement.
    const etag = `"${st.size.toString(36)}-${Math.floor(st.mtimeMs).toString(36)}"`;
    const tete = {
      'content-type': TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-cache, must-revalidate',
      etag,
    };
    if (req.headers['if-none-match'] === etag) { res.writeHead(304, tete); res.end(); return; }
    tete['content-length'] = st.size;
    res.writeHead(200, tete);
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(abs).pipe(res).on('error', () => res.destroy());
  });
}

const serveur = http.createServer((req, res) => {
  // `access-control-allow-origin` : le jeu peut etre servi par un autre hote que le salon (page en ligne,
  // serveur a la maison). Sans cet en-tete, la page n'a PAS le droit de lire la reponse, et le salon passe
  // pour mort alors qu'il repond.
  if (req.url === '/etat') {
    // On annonce les adresses du reseau local pour que LE JEU puisse les afficher. Sans ca, la seule facon de
    // savoir quoi taper sur un telephone etait de retrouver la fenetre noire — qu'on a justement refermee, ou
    // reduite, ou qui est sur un autre ecran. Le renseignement le plus utile du lanceur etait au seul endroit
    // ou l'on ne regarde jamais.
    const { vraies } = adressesLocales();
    res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
    res.end(JSON.stringify({ ...relais.etat, max: LIMITES.parSalon, adresses: vraies.map((c) => `http://${c.ip}:${PORT}`) }));
    return;
  }
  servirFichier(req, res);
});

serveur.on('upgrade', (req, socket) => {
  if (TRACE) console.log('UPGRADE', req.url, JSON.stringify(req.headers));
  const cle = req.headers['sec-websocket-key'];
  if (!cle) { socket.destroy(); return; }
  const accept = crypto.createHash('sha1').update(cle + MAGIE).digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
    + `Sec-WebSocket-Accept: ${accept}\r\n\r\n`);
  socket.setNoDelay(true);          // un jeu : on veut les petits paquets tout de suite, pas groupes

  const cli = relais.brancher(
    (t) => { if (!socket.destroyed) socket.write(trame(t)); },
    () => socket.destroy(),
  );
  let tampon = Buffer.alloc(0);
  socket.on('data', (bout) => {
    tampon = Buffer.concat([tampon, bout]);
    if (tampon.length > 1 << 20) { socket.destroy(); return; }       // personne n'envoie un mega-octet ici
    tampon = lire(tampon, (t) => {
      if (TRACE) console.log('RECU', cli.n, t.slice(0, 160));
      relais.recevoir(cli, t);
      if (TRACE) console.log('  -> salon', cli.salon, 'id', cli.id, 'etat', JSON.stringify(relais.etat));
    }, (op, charge) => {
      if (op === 9) socket.write(trame(charge.toString('utf8'), 10));   // ping -> pong
      else socket.destroy();                                            // fermeture demandee
    });
  });
  // ECOUTER `end` N'EST PAS UNE PRECAUTION, C'EST LE CAS NORMAL. Quand on reprend une socket au serveur HTTP
  // par l'evenement `upgrade`, Node lui retire ses propres ecouteurs : la socket reste alors en demi-ouverture
  // quand le navigateur envoie son FIN, et `close` n'arrive JAMAIS. Mesure faite : sans la ligne `end`, un
  // joueur qui ferme son onglet restait sur le terrain — les autres voyaient son avatar planté là jusqu'a ce
  // que l'entretien le ramasse, quatre-vingt-dix secondes plus tard. Avec, il disparait dans la seconde.
  // (`pagehide` envoie bien un `leave` quand tout se passe bien ; c'est la coupure brutale qui laissait le
  // fantome — wifi qui tombe, telephone verrouille, onglet tue.)
  const fin = (quoi) => { if (TRACE) console.log('FIN', quoi, cli.n, cli.nom, cli.salon); relais.debrancher(cli); socket.destroy(); };
  socket.on('end', () => fin('end'));
  socket.on('close', () => fin('close'));
  socket.on('error', () => fin('error'));
});

// L'adresse a donner a ses amis. On la CALCULE au lieu de dire « trouve ton adresse IP » : c'est la seule
// etape ou quelqu'un se trompe, et elle est trouvable en trois lignes.
// Un PC de developpeur a souvent sept adresses IPv4 : VMware, WSL, le partage de connexion, Hyper-V... Les
// annoncer toutes, c'est garantir que l'ami en essaiera trois avant la bonne. On ecarte donc les cartes
// virtuelles par leur nom, et on garde en tete de liste les adresses des plages domestiques habituelles.
const CARTE_VIRTUELLE = /vmware|virtualbox|vethernet|hyper-v|wsl|loopback|tunnel|tap-|docker|tailscale|zerotier/i;

function adressesLocales() {
  const vraies = [], autres = [];
  for (const [nom, cartes] of Object.entries(os.networkInterfaces())) {
    for (const c of cartes || []) {
      if (c.family !== 'IPv4' || c.internal) continue;
      (CARTE_VIRTUELLE.test(nom) ? autres : vraies).push({ nom, ip: c.address });
    }
  }
  // 192.168.0.x et 192.168.1.x sont les plages par defaut des box francaises : c'est presque toujours celle-la.
  vraies.sort((x, y) => (/^192\.168\.[01]\./.test(y.ip) ? 1 : 0) - (/^192\.168\.[01]\./.test(x.ip) ? 1 : 0));
  return { vraies, autres };
}

// Sans ce gestionnaire, un port deja pris tuait node sur une trace anglaise, dans une fenetre que le joueur
// venait d'abandonner au profit du navigateur — pendant que la page, elle, continuait d'etre servie par
// l'ANCIEN serveur, celui qui n'a pas de salon. Le jeu conseillait alors de relancer Lancer.bat, c'est-a-dire
// la seule action qui ne pouvait rien y faire. On nomme donc la cause ET le geste.
serveur.on('error', (e) => {
  if (e && e.code === 'EADDRINUSE') {
    console.log(`\n  Le port ${PORT} est deja pris par une AUTRE fenetre du jeu, restee ouverte.`);
    console.log(`  Ferme toutes les fenetres noires du jeu, puis relance Lancer.bat.\n`);
    process.exit(1);
  }
  throw e;
});

serveur.listen(PORT, () => {
  console.log(`\n  IRIS — le jeu ET le serveur en ligne, sur le port ${PORT}.\n`);
  console.log(`  sur cet ordinateur   http://localhost:${PORT}`);
  const { vraies, autres } = adressesLocales();
  vraies.forEach((c, i) => console.log(`  sur le meme wifi     http://${c.ip}:${PORT}${i ? '' : '   <- essaie celle-la en premier'}   [${c.nom}]`));
  if (!vraies.length) for (const c of autres) console.log(`  peut-etre            http://${c.ip}:${PORT}   [${c.nom}]`);
  console.log(`\n  Sur un telephone : tape l'adresse EN ENTIER, avec http:// devant, dans la barre du navigateur`);
  console.log(`  (sans http:// certains telephones font une recherche Google au lieu d'ouvrir la page),`);
  console.log(`  et verifie que le telephone est bien sur le wifi et pas en 4G.`);
  console.log(`\n  Ils ouvrent cette adresse, cliquent EN LIGNE puis JOUER : ils sont dans l'ecole avec toi.`);
  console.log(`  Pour jouer avec des amis qui ne sont PAS chez toi : serveur/LISEZMOI.md\n`);
});
