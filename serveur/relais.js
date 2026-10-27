// =====================================================================
//  LE SERVEUR DE SALON D'IRIS — repris de LA CAGE (27/10/2026), le coeur, sans dependance a l'hebergeur
// =====================================================================
// Le client reseau (js/net.js) est ecrit depuis le debut pour parler a un serveur qui ne fait presque rien :
// « Le serveur n'a qu'a rediffuser a tout le salon les messages qu'il recoit, et tenir la liste des joueurs. »
// C'est exactement ce fichier. Il ne connait ni WebSocket ni HTTP : on lui passe des objets qui savent
// envoyer du texte, et il s'occupe du reste. Les trois enveloppes (Deno, Cloudflare, Node) ne font que le
// brancher sur leur propre API.
//
// CE QUI N'EST PAS EVIDENT, et qu'un relais naif rate :
//
//   1. L'ECHO. En local, le jeu tourne avec un faux transport qui se renvoie a lui-meme TOUT ce qu'il
//      envoie (LocalTransport, js/net.js). Room compte la-dessus : c'est en recevant son PROPRE message
//      `join` qu'un joueur s'ajoute a sa propre liste, et donc qu'il apprend s'il est l'hote. Un serveur qui
//      ne renvoie qu'aux autres laisse chaque joueur absent de son propre salon.
//
//   2. L'ORDRE D'ARRIVEE. Room designe comme hote « le premier arrive » : le joueur ajoute alors que la
//      liste etait vide. Donc quand quelqu'un arrive, il faut d'abord lui envoyer les membres DEJA presents,
//      dans leur ordre d'arrivee, et seulement APRES diffuser son propre `join`. A l'envers, le dernier
//      arrive se croirait hote, et il y aurait deux hotes qui lancent deux matchs.
//
//   3. LA PRESENCE NE S'ECHOUE PAS. Les paquets `pos` partent douze fois par seconde et par joueur ; le
//      client jette de toute facon les siens. Les renvoyer doublerait le trafic pour rien.
//
//   4. CHANGER DE SALON. L'interface permet de taper un code pour rejoindre ses amis : le meme joueur
//      renvoie alors un `join` avec un autre code. Il faut le sortir proprement de l'ancien salon, sinon il
//      y reste en fantome et les autres continuent de le voir courir.

// UN SEUL SALON, PUBLIC, DIX JOUEURS. C'est ce que Haythem a demande, et c'est le bon choix : un code a
// s'echanger, c'est un obstacle de plus entre deux amis qui veulent jouer, et un salon vide n'a jamais donne
// envie a personne. On garde neanmoins la machinerie des salons — le jour ou il faudra une partie privee,
// il suffira de repasser `salonUnique` a faux.
export const SALON_PUBLIC = 'PUBLIC';
// IRIS (27/10 soir) : un salon PAR MODE en ligne — PUBLIC le match par équipes, PROPHUNT le prop hunt. Toujours rien à taper :
// le mode choisi à l'écran EN LIGNE donne le code ; un code inconnu retombe sur PUBLIC.
export const SALONS = ['PUBLIC', 'PROPHUNT'];

export const LIMITES = {
  parSalon: 10,          // au-dela on refuse : l'ecole tient dix eleves armes, pas mille
  salons: 400,
  octetsParMessage: 16384,
  messagesParSeconde: 160,   // la presence en envoie 20, les tirs groupes par pas jusqu'a 120 : 160 laisse de l'air
  silenceMax: 90000,         // sans le moindre signe de vie, on ferme (proxys qui laissent des sockets mortes)
};

// Les seuls types qu'on accepte. Tout le reste est ignore : un client bricole ne doit pas pouvoir inventer
// un message que les autres traiteraient.
// IRIS (js/jeu/partie_enligne.js) : `pos` (l'etat d'un soldat, 20 fois par seconde), `fx` (ses tirs, ses trajets de balle,
// ses impacts, pour que les autres les voient et les entendent), `touche` (le tireur dit a sa victime ce qu'elle a pris),
// `elim` (la victime annonce sa mort a tous : c'est elle qui fait foi), `sync` (le plus ancien donne le score au nouveau).
const ETAT_SALON = new Set(['join', 'chat']);                                    // renvoyes A TOUS, expediteur compris
const TEMPS_REEL = new Set(['pos', 'fx', 'touche', 'elim', 'sync', 'manche', 'phase']);   // renvoyes aux AUTRES seulement

const code5 = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'LOBBY';
const texte = (v, n) => String(v === undefined || v === null ? '' : v).slice(0, n);

export class Relais {
  // `journal` : une fonction a qui l'on raconte ce qui se passe (console.log en general).
  constructor({ journal = () => {}, salonUnique = false } = {}) {
    this.salons = new Map();          // code -> [client, ...] dans l'ORDRE D'ARRIVEE (l'hote est le premier)
    this.journal = journal;
    this.salonUnique = salonUnique;
    this.compteur = 0;                // rang de CONNEXION (une socket acceptee)
    // RANG D'ARRIVEE DANS LE SALON, qui n'est pas le meme. Se connecter et entrer sont deux choses : on peut
    // ouvrir la socket en premier et n'entrer qu'en troisieme. C'est l'ENTREE qui designe l'hote, et c'est
    // donc elle qu'il faut pouvoir rejouer apres une hibernation — sinon l'hote change tout seul au reveil.
    this.arrivees = 0;
  }

  // ---------------------------------------------------------------- une connexion s'ouvre
  // `envoyer(texte)` est fourni par l'enveloppe ; `fermer()` aussi.
  brancher(envoyer, fermer) {
    const cli = {
      n: ++this.compteur,
      envoyer, fermer,
      id: null, nom: 'Joueur', perso: null,
      salon: null,
      fenetre: 0, compte: 0,           // limitation de debit
      vu: Date.now(),
    };
    return cli;
  }

  // ---------------------------------------------------------------- un message arrive
  recevoir(cli, brut) {
    cli.vu = Date.now();
    if (typeof brut !== 'string' || brut.length > LIMITES.octetsParMessage) return;
    // Limitation de debit par fenetre d'une seconde. Elle protege autant d'un client bricole que d'une
    // boucle folle chez quelqu'un dont l'onglet rame.
    const t = Date.now();
    if (t - cli.fenetre > 1000) { cli.fenetre = t; cli.compte = 0; }
    if (++cli.compte > LIMITES.messagesParSeconde) return;

    let m = null;
    try { m = JSON.parse(brut); } catch (e) { return; }
    if (!m || typeof m !== 'object' || typeof m.t !== 'string') return;

    if (m.t === 'hello') {
      cli.id = texte(m.id, 64) || cli.id;
      cli.nom = texte(m.name, 16) || cli.nom;
      return;                                     // rien a rediffuser : c'est une presentation, pas un evenement
    }
    if (m.t === 'ping') { this.envoyer(cli, { t: 'pong', at: m.at }); return; }

    if (m.t === 'join') return this.rejoindre(cli, m);
    if (m.t === 'leave') return this.quitter(cli, true);

    if (!cli.salon) return;                       // on ne relaie rien tant qu'on n'est pas dans un salon
    if (m.t === 'char') cli.perso = m.char === undefined ? cli.perso : m.char;
    if (m.t === 'chat') m.txt = texte(m.txt, 140);

    if (ETAT_SALON.has(m.t)) this.diffuser(cli.salon, m, null);
    else if (TEMPS_REEL.has(m.t)) this.diffuser(cli.salon, m, cli);
  }

  // ---------------------------------------------------------------- rejoindre un salon
  rejoindre(cli, m) {
    const c = code5(m.code), code = this.salonUnique || !SALONS.includes(c) ? SALON_PUBLIC : c;
    cli.id = texte(m.id, 64) || cli.id;
    cli.nom = texte(m.name, 16) || cli.nom;
    if (m.char !== undefined) cli.perso = m.char;
    if (!cli.id) return;

    if (cli.salon === code) {
      // Deja dedans : on se contente de rafraichir les autres (changement de pseudo ou de personnage).
      this.diffuser(code, this.carte(cli), null);
      return;
    }
    if (cli.salon) this.quitter(cli, true);       // il change de salon : on l'enleve proprement de l'ancien
    if (this.salons.size >= LIMITES.salons && !this.salons.has(code)) { this.envoyer(cli, { t: 'net', state: 'plein' }); return; }

    let liste = this.salons.get(code);
    if (!liste) { liste = []; this.salons.set(code, liste); }
    // LA PURGE DES DOUBLONS PASSE AVANT LE TEST DE CAPACITE. Dans l'autre sens, un joueur coupe brutalement
    // se voyait refuser l'entree par SON PROPRE fantome quand le salon etait plein : il devait attendre les
    // quatre-vingt-dix secondes de l'entretien pour recuperer sa place.
    // On previent l'evince AVANT de le sortir : sinon il reste connecte, hors du salon, a emettre dans le
    // vide, sans que rien a l'ecran ne le lui dise.
    for (const autre of liste.slice()) {
      if (autre.id === cli.id && autre !== cli) { this.envoyer(autre, { t: 'net', state: 'remplace' }); this.retirer(autre, code, true); }
    }
    if (liste.length >= LIMITES.parSalon) {
      // ON RACCROCHE APRES AVOIR REFUSE. Sans ca, le refuse restait connecte et continuait d'envoyer sa
      // position douze fois par seconde dans le vide — des messages que le relais jette (ligne « pas de
      // salon ») mais que l'hebergeur facture quand meme, indefiniment. Il se reconnectera tout seul, avec
      // une attente croissante, et entrera des qu'une place se libere.
      this.envoyer(cli, { t: 'net', state: `complet (${LIMITES.parSalon} joueurs)` });
      try { cli.fermer(); } catch (e) { /* ignore */ }
      return;
    }

    // `retirer` a pu supprimer la liste de la Map en la vidant (dernier occupant evince) : on la remet, sinon
    // le nouvel arrivant n'aurait recu l'echo de son propre join dans aucun salon.
    this.salons.set(code, liste);
    // 1) D'ABORD les presents, dans l'ordre d'arrivee : c'est ce qui donne le bon hote au nouveau venu.
    for (const autre of liste) this.envoyer(cli, this.carte(autre));
    // 2) ENSUITE seulement, son arrivee pour tout le monde — lui compris, parce que Room s'ajoute a sa
    //    propre liste en recevant son propre `join` (c'est ce que fait le transport local).
    liste.push(cli); cli.salon = code; cli.arrivee = ++this.arrivees;
    this.diffuser(code, this.carte(cli), null);
    this.journal(`+ ${cli.nom} (${cli.id.slice(0, 8)}) dans ${code} — ${liste.length} joueur(s)`);
  }

  carte(cli) { return { t: 'join', id: cli.id, name: cli.nom, char: cli.perso, from: cli.id }; }

  // ---------------------------------------------------------------- partir
  quitter(cli, prevenir) {
    const code = cli.salon;
    if (!code) return;
    this.retirer(cli, code, prevenir);
  }

  retirer(cli, code, prevenir) {
    const liste = this.salons.get(code);
    cli.salon = null;
    if (!liste) return;
    const i = liste.indexOf(cli);
    if (i >= 0) liste.splice(i, 1);
    if (prevenir && cli.id) this.diffuser(code, { t: 'leave', id: cli.id, from: cli.id }, null);
    if (!liste.length) this.salons.delete(code);
    this.journal(`- ${cli.nom} quitte ${code} — ${liste.length} restant(s)`);
  }

  // la socket s'est fermee toute seule
  debrancher(cli) { this.quitter(cli, true); }

  // ---------------------------------------------------------------- envoi
  envoyer(cli, obj) {
    try { cli.envoyer(JSON.stringify(obj)); } catch (e) { /* socket deja morte : le nettoyage suivra */ }
  }

  // `sauf` : le client a qui on ne renvoie pas (la presence ne s'echoue pas).
  diffuser(code, obj, sauf) {
    const liste = this.salons.get(code);
    if (!liste) return;
    const s = JSON.stringify(obj);
    for (const c of liste) {
      if (c === sauf) continue;
      try { c.envoyer(s); } catch (e) { /* idem */ }
    }
  }

  // ---------------------------------------------------------------- entretien
  // A appeler toutes les trente secondes : ferme les sockets muettes que les proxys ont laissees ouvertes.
  entretien() {
    const t = Date.now();
    for (const [code, liste] of [...this.salons]) {
      for (const c of liste.slice()) {
        if (t - c.vu > LIMITES.silenceMax) { try { c.fermer(); } catch (e) { /* ignore */ } this.retirer(c, code, true); }
      }
    }
  }

  get etat() {
    const parSalon = {}; for (const s of SALONS) parSalon[s] = (this.salons.get(s) || []).length;
    return { salons: this.salons.size, joueurs: [...this.salons.values()].reduce((n, l) => n + l.length, 0), parSalon };
  }
}
