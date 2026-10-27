// Enveloppe Cloudflare du relais d'IRIS (reprise de LA CAGE, 27/10/2026) — c'est CELLE-CI qui tourne en ligne,
// derrière la version web du jeu (https://liftstudio.github.io/iris/ : js/jeu/reseau.js adresseServeur).
//
//     npx wrangler deploy            (depuis le dossier serveur/)
//
// Pourquoi Cloudflare plutot qu'un serveur Node loue quelque part : le plan gratuit ne demande pas de carte
// bancaire, il donne le HTTPS/WSS sans rien configurer, et surtout il ne S'ENDORT PAS. Les hebergeurs gratuits
// classiques eteignent le processus apres quelques minutes sans trafic et mettent ensuite une minute a le
// rallumer — une minute d'ecran noir pour le premier ami qui se connecte, a chaque fois.
//
// ------------------------------------------------------------------------------------------------
// CE QU'IL FAUT COMPRENDRE AVANT DE LIRE : un Worker ne garde AUCUNE memoire entre deux requetes. Un relais de
// salon, lui, n'est QUE de la memoire partagee : la liste des joueurs. C'est exactement le probleme que
// resolvent les Durable Objects — un objet unique, nomme, chez qui tout le monde est route. Un objet = un
// salon. Le Worker ci-dessous ne fait donc rien d'autre que d'aiguiller vers lui.
//
// LE PIEGE, et il coute cher : garder mille sockets ouvertes signifie normalement garder l'objet EVEILLE, et
// Cloudflare facture la duree d'eveil (13 000 GB-s par jour sur le plan gratuit ; un objet eveille en
// permanence en consomme environ 10 800 — on frolerait le plafond sans qu'un seul joueur soit connecte).
// D'ou l'API d'HIBERNATION : `state.acceptWebSocket()` au lieu de `server.accept()`. Les sockets restent
// ouvertes, mais l'objet est mis en sommeil entre deux messages et ne coute plus rien.
//
// Le prix a payer est la raison d'etre de la moitie de ce fichier : PENDANT L'HIBERNATION, LA MEMOIRE EST
// PERDUE. Au reveil, `this.relais` est vide alors que les sockets, elles, sont toujours la. Il faut donc
// pouvoir reconstruire la liste des joueurs a partir des seules sockets. Cloudflare offre pour cela un
// « attachement » par socket, qui survit au sommeil : on y range l'identite du joueur et son RANG d'arrivee.
// Le rang n'est pas un detail — c'est lui qui designe l'hote (voir relais.js), et sans lui un reveil pourrait
// changer l'hote au milieu d'une soiree.
// ------------------------------------------------------------------------------------------------
import { Relais, SALON_PUBLIC, LIMITES } from './relais.js';

const ACCUEIL = `IRIS — serveur en ligne.
L'école est ouverte. Ouvre le jeu (https://liftstudio.github.io/iris/), clique EN LIGNE puis JOUER : il se branche tout seul.
`;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/etat' || url.pathname === '/ws') {
      // Un seul nom => un seul objet => un seul terrain, pour tout le monde, partout.
      const id = env.SALON.idFromName(SALON_PUBLIC);
      return env.SALON.get(id).fetch(req);
    }
    return new Response(ACCUEIL, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};

export class Salon {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.relais = new Relais({ journal: () => {} });
    this.parSocket = new Map();      // WebSocket -> le client de relais.js
    this.restaure = false;
  }

  // ---------------------------------------------------------------- reveil
  // Rebatit la liste des joueurs a partir des sockets survivantes, DANS L'ORDRE D'ARRIVEE. On court-circuite
  // volontairement `relais.rejoindre()` : il diffuserait a tout le monde des arrivees qui n'ont pas lieu.
  restaurer() {
    if (this.restaure) return;
    this.restaure = true;

    // UNE SOCKET SANS IDENTITE N'EST PAS UNE SOCKET PERDUE. Entre l'acceptation de la socket et le premier
    // message du client, l'attachement ne porte pas encore d'identifiant. La fermer reviendrait a couper la
    // ligne d'un joueur qui vient juste d'arriver, sans rien lui dire. On la garde : il se presentera a son
    // prochain message.
    const vivants = [];
    for (const ws of this.state.getWebSockets()) {
      let a = null;
      try { a = ws.deserializeAttachment(); } catch (e) { a = null; }
      vivants.push({ ws, a: a || { rang: 0, arrivee: 0, id: null, nom: 'Joueur', perso: null, salon: null, vu: 0 } });
    }
    // ON TRIE PAR ORDRE D'ARRIVEE DANS LE SALON, pas par ordre de connexion. Les deux different des qu'un
    // joueur ouvre sa socket avant d'entrer — et c'est l'entree qui designe l'hote. Trier sur le mauvais
    // des deux faisait changer d'hote au premier reveil.
    vivants.sort((x, y) => (x.a.arrivee || 0) - (y.a.arrivee || 0) || (x.a.rang || 0) - (y.a.rang || 0));

    // DEUX SOCKETS VIVANTES POUR UN MEME JOUEUR : c'est le cas 4G, et c'est le defaut le plus grave de cette
    // enveloppe. Quand un telephone passe du wifi aux donnees mobiles, l'ancienne socket reste ouverte cote
    // Cloudflare — aucune fermeture n'arrive. Le client se reconnecte tout seul et renvoie son `join` avec le
    // MEME identifiant ; `rejoindre()` sort alors l'ancien du salon EN MEMOIRE, mais son ATTACHEMENT, lui,
    // n'est jamais reecrit : `graver()` ne connait que la socket du message en cours. Au reveil suivant, les
    // DEUX revenaient donc dans la liste avec le meme identifiant — et le jour ou la socket morte se ferme
    // enfin, son `leave` emportait le joueur REEL de la liste de tout le monde. On ne garde donc, par
    // identifiant, que la socket la plus recemment entree, et on corrige l'attachement de l'autre pour
    // qu'elle ne ressuscite pas au reveil d'apres.
    const dernier = new Map();
    for (const v of vivants) if (v.a.id && v.a.salon) dernier.set(v.a.id, v);

    for (const v of vivants) {
      const { ws, a } = v;
      const cli = this.nouveauClient(ws);
      cli.n = a.rang || cli.n;
      cli.id = a.id; cli.nom = a.nom || 'Joueur'; cli.perso = a.perso ?? null;
      cli.arrivee = a.arrivee || 0;
      // `vu` doit etre RESTAURE, pas remis a l'heure : le redater a chaque reveil rendait les fantomes
      // immortels, puisque l'entretien compare `vu` a maintenant et ne trouvait jamais personne de muet.
      if (a.vu) cli.vu = a.vu;
      const evince = !!(a.salon && a.id && dernier.get(a.id) !== v);
      if (a.salon && !evince) {
        let liste = this.relais.salons.get(a.salon);
        if (!liste) { liste = []; this.relais.salons.set(a.salon, liste); }
        liste.push(cli);
        cli.salon = a.salon;
      }
      // On NE FERME PAS l'evince : il a deja recu « remplace », et le fermer le ferait se reconnecter puis
      // evincer l'autre a son tour, en boucle. Son `salon` reste nul, donc sa fermeture ne diffusera rien.
      if (evince) this.graver(ws, cli);
      this.relais.compteur = Math.max(this.relais.compteur, a.rang || 0);
      this.relais.arrivees = Math.max(this.relais.arrivees, a.arrivee || 0);
    }
  }

  nouveauClient(ws) {
    const cli = this.relais.brancher(
      (t) => { try { ws.send(t); } catch (e) { /* socket morte : webSocketClose fera le menage */ } },
      () => { try { ws.close(1000, 'inactif'); } catch (e) { /* ignore */ } },
    );
    this.parSocket.set(ws, cli);
    return cli;
  }

  // L'attachement est ce qui survit au sommeil. On le reecrit apres chaque message : c'est une ecriture en
  // memoire, pas un acces au disque, donc c'est gratuit — et l'oublier une seule fois suffirait a faire
  // disparaitre un joueur de la liste au premier reveil.
  graver(ws, cli) {
    try {
      ws.serializeAttachment({ rang: cli.n, arrivee: cli.arrivee || 0, id: cli.id, nom: cli.nom, perso: cli.perso, salon: cli.salon, vu: cli.vu });
    } catch (e) { /* ignore */ }
  }

  // ---------------------------------------------------------------- entree
  async fetch(req) {
    this.restaurer();
    const url = new URL(req.url);

    if (url.pathname === '/etat') {
      return new Response(JSON.stringify({ ...this.relais.etat, max: LIMITES.parSalon }), {
        headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      });
    }
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket attendu', { status: 426 });

    const paire = new WebSocketPair();
    const [client, serveur] = Object.values(paire);
    this.state.acceptWebSocket(serveur);          // hibernation : surtout PAS serveur.accept()

    const cli = this.nouveauClient(serveur);
    this.graver(serveur, cli);
    // Un objet qui vient de naitre n'a pas d'alarme : on en pose une, c'est elle qui fera le menage.
    await this.programmerMenage();

    return new Response(null, { status: 101, webSocket: client });
  }

  // ---------------------------------------------------------------- messages
  async webSocketMessage(ws, brut) {
    this.restaurer();
    const cli = this.parSocket.get(ws);
    if (!cli) { try { ws.close(1011, 'client inconnu'); } catch (e) { /* ignore */ } return; }
    this.relais.recevoir(cli, typeof brut === 'string' ? brut : '');
    this.graver(ws, cli);
  }

  // Il FAUT rappeler ws.close() ici : sans lui la socket reste a moitie fermee cote Cloudflare, elle
  // continue d'apparaitre dans getWebSockets(), et le joueur revient comme fantome a chaque reveil.
  async webSocketClose(ws, code, raison) {
    this.partir(ws);
    try { ws.close(code >= 1000 && code < 5000 && code !== 1005 ? code : 1000, raison || ''); } catch (e) { /* deja fermee */ }
  }
  async webSocketError(ws) { this.partir(ws); try { ws.close(1011, 'erreur'); } catch (e) { /* ignore */ } }

  partir(ws) {
    this.restaurer();
    const cli = this.parSocket.get(ws);
    if (!cli) return;
    this.parSocket.delete(ws);
    this.relais.debrancher(cli);                  // previent les autres : l'avatar disparait tout de suite
  }

  // ---------------------------------------------------------------- menage
  // `setInterval` n'a aucun sens ici : l'objet dort. C'est l'alarme qui le reveille, et elle ne se reprogramme
  // que s'il reste quelqu'un — un terrain vide ne doit rien couter.
  async programmerMenage() {
    try {
      if (await this.state.storage.getAlarm() === null) {
        await this.state.storage.setAlarm(Date.now() + 60000);
      }
    } catch (e) { /* ignore */ }
  }

  async alarm() {
    this.restaurer();
    this.relais.entretien();
    if (this.state.getWebSockets().length) await this.state.storage.setAlarm(Date.now() + 60000);
  }
}
