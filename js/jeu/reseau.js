// =====================================================================
//  LE RÉSEAU D'IRIS — la socket du serveur en ligne (27/10/2026, « comme mon jeu de basket »)
// =====================================================================
// Le même principe que LA CAGE : un serveur qui ne fait presque rien (serveur/relais.js : il rediffuse à tout le salon
// ce qu'il reçoit et tient la liste des présents), servi par serveur/node.mjs sur LE MÊME PORT que le jeu. Personne n'a
// donc rien à taper : la socket va à l'adresse qui a envoyé la page (ws://192.168.1.12:8124/ws, wss:// sur https). Une
// autre adresse se donne par ?serveur=… (un tunnel, un serveur ailleurs).
// Ici : ouvrir, se présenter (`hello`, `join`), envoyer, recevoir, se reconnecter. Ce que les messages VEULENT DIRE est
// dans js/jeu/partie_enligne.js.

const CLE_ID = 'iris.enligne.id';
export const CLE_PROFIL = 'iris.enligne.v1';

function lire(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function ecrire(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* stockage refusé : tant pis, on garde en mémoire */ } }

// l'identifiant de CET onglet sur le serveur : gardé pour la session (une reconnexion reprend sa place), neuf par onglet
// (deux onglets du même PC sont deux joueurs — c'est ainsi qu'on essaie à deux sur une seule machine)
let _id = null;
export function idReseau() {
  if (_id) return _id;
  try { _id = sessionStorage.getItem(CLE_ID); } catch (e) { _id = null; }
  if (!_id) { _id = 'j' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); try { sessionStorage.setItem(CLE_ID, _id); } catch (e) { /* ignore */ } }
  return _id;
}
// le pseudo et le personnage choisis à l'écran EN LIGNE (localStorage : retrouvés au prochain lancement)
export function profilEnLigne() {
  let p = null; try { p = JSON.parse(lire(CLE_PROFIL) || 'null'); } catch (e) { p = null; }
  const n = (p && p.pseudo) || '';
  return { pseudo: n || 'Élève-' + idReseau().slice(1, 5).toUpperCase(), avatar: (p && p.avatar) || 'haythem' };
}
export function garderProfil(p) { ecrire(CLE_PROFIL, JSON.stringify({ pseudo: String(p.pseudo || '').slice(0, 16), avatar: p.avatar || 'haythem' })); }

// l'adresse de la socket : ?serveur= (accepte « 192.168.1.12 », « 192.168.1.12:8124 », « http://… », « ws://…/ws »), sinon
// celle de la page
export function adresseServeur() {
  let s = null; try { s = new URLSearchParams(location.search).get('serveur'); } catch (e) { s = null; }
  if (s) {
    s = s.trim();
    if (/^wss?:\/\//i.test(s)) return /\/ws$/.test(s) ? s : s.replace(/\/?$/, '/ws');
    const h = s.replace(/^https?:\/\//i, '').replace(/\/.*$/, ''), sur = /^https:/i.test(s);
    return (sur ? 'wss://' : 'ws://') + (h.includes(':') ? h : h + ':8124') + '/ws';
  }
  return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
}
// l'état du serveur (combien d'élèves en ligne, ses adresses sur le wifi) — null s'il ne répond pas (serve.py, sans Node)
export async function etatServeur(delai = 2500) {
  const ws = adresseServeur(), http = ws.replace(/^ws/, 'http').replace(/\/ws$/, '/etat');
  const c = new AbortController(), t = setTimeout(() => c.abort(), delai);
  try { const r = await fetch(http, { signal: c.signal, cache: 'no-store' }); if (!r.ok) return null; return await r.json(); }
  catch (e) { return null; } finally { clearTimeout(t); }
}

export class Reseau {
  constructor({ nom, perso } = {}) {
    this.id = idReseau(); this.nom = String(nom || 'Élève').slice(0, 16); this.perso = perso || null;
    this.url = adresseServeur();
    this.ws = null; this.ouvert = false; this.ferme = false; this.essais = 0;
    this.presents = [];              // les ids des membres du salon, DANS L'ORDRE D'ARRIVÉE (le premier est l'« ancien »)
    this.noms = new Map(); this.cartes = new Map();   // (id → son `char` : l'avatar et l'ÉQUIPE qu'il a annoncés)
    this.recus = [];                 // les messages reçus, lus à chaque pas par la partie (jamais traités dans le rappel)
    this.etat = 'connexion';
  }
  // ouvrir ; la promesse dit si la PREMIÈRE connexion a réussi dans le délai
  connecter(delai = 5000) {
    return new Promise((ok) => {
      let fini = false;
      const fin = (v) => { if (!fini) { fini = true; ok(v); } };
      setTimeout(() => fin(false), delai);
      this._ouvrir(() => fin(true));
    });
  }
  _ouvrir(surOuvert) {
    if (this.ferme) return;
    let ws;
    try { ws = new WebSocket(this.url); } catch (e) { this._reessayer(); return; }
    this.ws = ws;
    ws.onopen = () => {
      this.ouvert = true; this.essais = 0; this.etat = 'en ligne';
      this._brut({ t: 'hello', id: this.id, name: this.nom });
      this._brut({ t: 'join', id: this.id, name: this.nom, char: this.perso, code: 'PUBLIC' });
      surOuvert?.();
    };
    ws.onmessage = (e) => {
      let m = null; try { m = JSON.parse(e.data); } catch (er) { return; }
      if (!m || typeof m.t !== 'string') return;
      if (m.t === 'join') { if (!this.presents.includes(m.id)) this.presents.push(m.id); this.noms.set(m.id, m.name); if (m.char) this.cartes.set(m.id, m.char); }
      else if (m.t === 'leave') { this.presents = this.presents.filter((x) => x !== m.id); }
      else if (m.t === 'net') { this.etat = m.state; }
      this.recus.push(m);
      if (this.recus.length > 4000) this.recus.splice(0, this.recus.length - 4000);   // (un onglet caché qui ne lit plus)
    };
    ws.onclose = () => { this.ouvert = false; if (this.ws === ws) this.ws = null; if (!this.ferme) { this.etat = 'reconnexion'; this._reessayer(); } };
    ws.onerror = () => { /* onclose suit */ };
  }
  _reessayer() {
    if (this.ferme) return;
    const d = Math.min(8000, 500 * Math.pow(2, this.essais++));
    setTimeout(() => this._ouvrir(), d);
  }
  _brut(m) { if (this.ws && this.ws.readyState === 1) { try { this.ws.send(JSON.stringify(m)); return true; } catch (e) { return false; } } return false; }
  envoyer(m) { m.from = this.id; return this._brut(m); }
  // annoncer un nouveau `char` (l'équipe choisie) : le relais rediffuse la carte de ce joueur à tout le salon
  annoncer(perso) { this.perso = perso; return this._brut({ t: 'join', id: this.id, name: this.nom, char: perso, code: 'PUBLIC' }); }
  // le plus ancien du salon : c'est lui qui donne le score à ceux qui arrivent
  get ancien() { return this.presents[0] || null; }
  get suisAncien() { return this.ancien === this.id; }
  lire() { const L = this.recus; this.recus = []; return L; }
  fermer() {
    this.ferme = true;
    this._brut({ t: 'leave', id: this.id });
    try { this.ws && this.ws.close(); } catch (e) { /* ignore */ }
    this.ws = null; this.ouvert = false;
  }
}
