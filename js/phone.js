// Le téléphone (comme dans GTA) : on le sort d'une touche, il glisse dans le coin de l'écran et donne accès au groupe de
// messages « IRIS » — la classe. Haythem écrit, les autres répondent avec un petit délai. Repris de LA CAGE (le groupe
// « LA CAGE »), sans l'appli Plan du parc ni le salon en ligne. Tout est local (localStorage) ; le fil est gardé
// (80 messages) et une pastille rouge signale les messages non lus quand le téléphone est rangé.
const KEY = 'iris.phone.v1';
const MAX = 80;

// Les membres du groupe : les potes de Haythem (les personnages de LA CAGE)
const MEMBRES = ['Ethan', 'Clovis', 'Lamine', 'Djafar', 'Massyl', 'Yazid', 'Imad', 'Gabriel', 'Antoine'];
const REPLIES = {
  hello: ['yo', 'wesh', 'salut', 'présent', 'je suis là'],
  cours: ['on a cours à quelle heure ?', 'c’est quelle salle déjà ?', 'le prof est là ?', 'je suis en retard, gardez-moi une place', 't’as fait le TP ?'],
  pause: ['on se retrouve en bas ?', 'je descends à la pause', 'quelqu’un à la machine à café ?', 'on mange où ce midi ?'],
  ok: ['ok', 'ça marche', 'vas-y', 'grave', 'bien vu'],
  idle: ['quelqu’un a les notes du dernier cours ?', 'je suis à l’accueil', 'le wifi rame encore', 'on se fait un five ce soir ?', 'trop long cette journée'],
};
const QUICK = ['Yo 👋', 'T’es où ?', 'Je suis à l’école', 'On a cours ?', 'Pause ?', '👍'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const $ = (id) => document.getElementById(id);
// La hauteur de l'encoche (env(safe-area-inset-top), par la variable --sa-t de css/style.css), mesurée sur un témoin
const zoneHaute = () => {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:0;left:0;width:0;height:var(--sa-t, 0px);visibility:hidden;pointer-events:none';
  document.body.appendChild(d); const h = d.offsetHeight; d.remove(); return h;
};

export class Phone {
  // cb.onOpen / cb.onClose bloquent les commandes du jeu ; cb.onType fait taper Haythem sur son téléphone
  constructor(cb = {}) {
    this.cb = cb;
    this.members = MEMBRES;
    this.el = $('phone'); this.listEl = $('phone-msgs'); this.badgeEl = $('phone-badge');
    this.open = false; this.unread = 0; this.clock = 0; this.queue = [];
    this.msgs = [];
    try { const raw = localStorage.getItem(KEY); if (raw) this.msgs = JSON.parse(raw).slice(-MAX); } catch (e) { /* stockage indisponible */ }
    if (!this.msgs.length) {
      this.msgs = [
        { who: 'Ethan', txt: 'groupe créé 📚', t: 0 },
        { who: 'Clovis', txt: 'on se retrouve à l’école demain matin', t: 0 },
      ];
    }
    $('phone-close').onclick = () => this.hide();
    const input = $('phone-input');
    $('phone-send').onclick = () => this.sendFromInput();
    input.addEventListener('input', () => this.cb.onType?.());
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.code === 'Enter') { e.preventDefault(); this.sendFromInput(); }
      if (e.code === 'Escape') { e.preventDefault(); this.hide(); }
    });
    const quick = $('phone-quick');
    for (const q of QUICK) {
      const b = document.createElement('button'); b.className = 'phone-q'; b.textContent = q;
      b.onclick = () => { this.cb.onType?.(); this.send(q); };
      quick.appendChild(b);
    }
    this.render();
  }

  save() { try { localStorage.setItem(KEY, JSON.stringify(this.msgs.slice(-MAX))); } catch (e) { /* ignore */ } }

  push(who, txt, mine = false) {
    this.msgs.push({ who, txt, mine, t: Date.now() });
    if (this.msgs.length > MAX) this.msgs = this.msgs.slice(-MAX);
    this.save();
    if (!this.open) { this.unread++; this.badge(); } else this.render();
  }

  // un membre du groupe répond après un court délai
  bot(kind, delay = 1.2) {
    this.queue.push({ who: pick(this.members), txt: pick(REPLIES[kind] || REPLIES.idle), at: this.clock + delay });
  }

  sendFromInput() {
    const i = $('phone-input'), v = i.value.trim();
    if (!v) return;
    i.value = '';
    this.send(v);
  }
  send(txt) {
    this.push('Toi', txt, true);
    // une à deux réponses
    this.bot(/cours|salle|prof|tp|exam|partiel/i.test(txt) ? 'cours' : /pause|manger|caf|midi/i.test(txt) ? 'pause'
      : /\?/.test(txt) ? 'ok' : 'hello', 0.9 + Math.random());
    if (Math.random() < 0.5) this.bot('idle', 2.2 + Math.random() * 2);
  }

  badge() {
    this.badgeEl.textContent = this.unread > 9 ? '9+' : String(this.unread);
    this.badgeEl.hidden = this.unread === 0;
  }

  // Comme une vraie messagerie : une date, l'heure dans chaque bulle, le nom en couleur, et les messages qui se suivent du
  // même auteur regroupés (seul le dernier a sa « queue »).
  render() {
    const l = this.listEl;
    let html = '<div class="ph-day">Aujourd’hui</div>', prev = null;
    this.msgs.forEach((m, i) => {
      const next = this.msgs[i + 1];
      const suite = next && next.who === m.who && !!next.mine === !!m.mine;
      const heure = m.t ? new Date(m.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
      const t = `<span class="ph-t">${heure}${m.mine ? ' ✓✓' : ''}</span>`;
      if (m.mine) html += `<div class="pm me${suite ? ' suite' : ''}"><div class="pb">${esc(m.txt)}${t}</div></div>`;
      else {
        const nom = !prev || prev.who !== m.who || prev.mine ? `<div class="pw" style="color:${couleur(m.who)}">${esc(m.who)}</div>` : '';
        html += `<div class="pm${suite ? ' suite' : ''}">${nom}<div class="pb">${esc(m.txt)}${t}</div></div>`;
      }
      prev = m;
    });
    l.innerHTML = html;
    l.scrollTop = l.scrollHeight;
  }
  horloge() {
    const el = $('phone-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  // Un vrai téléphone fait 300 × 612 ici. Sur un écran bas, on le réduit d'un bloc (jamais sous 72 %) ; sous 560 px de
  // haut (téléphone en paysage), il garde sa taille et c'est lui qui raccourcit (classe `compact`).
  taille() {
    const body = this.el.querySelector('.phone-body');
    if (!body) return;
    const compact = window.innerHeight < 560;
    this.el.classList.toggle('compact', compact);
    const bas = parseFloat(getComputedStyle(this.el).bottom) || 0, haut = Math.max(compact ? 8 : 10, zoneHaute());
    const H = window.innerHeight - bas - haut, W = window.innerWidth * 0.92;
    const s = compact ? Math.min(1, W / 300) : Math.max(0.6, Math.min(1, W / 300, Math.max(0.72, H / 612)));
    body.style.zoom = s.toFixed(3);
    body.style.height = Math.round(Math.min(612, H / s)) + 'px';
  }
  show() {
    this.open = true; this.unread = 0; this.badge();
    this.taille();
    if (!this._tailleOn) { this._tailleOn = true; window.addEventListener('resize', () => { if (this.open) this.taille(); }); }
    this.el.hidden = false;
    requestAnimationFrame(() => this.el.classList.add('on'));
    this.horloge(); clearInterval(this._hT); this._hT = setInterval(() => this.horloge(), 10000);
    this.render();
    this.cb.onOpen?.();
  }
  hide() {
    if (!this.open) return;
    this.open = false; this.el.classList.remove('on'); clearInterval(this._hT);
    setTimeout(() => { if (!this.open) this.el.hidden = true; }, 340);
    $('phone-input').blur();
    this.cb.onClose?.();
  }
  toggle() { this.open ? this.hide() : this.show(); }

  update(dt) {
    if (!(dt > 0)) return;
    this.clock += dt;
    if (!this.queue.length) return;
    const due = this.queue.filter((q) => q.at <= this.clock);
    if (!due.length) return;
    this.queue = this.queue.filter((q) => q.at > this.clock);
    for (const q of due) this.push(q.who, q.txt, false);
  }
}

// une couleur stable par nom, comme les groupes WhatsApp
const COULEURS = ['#ff9f43', '#4cd4a0', '#ff6b8b', '#6fb7ff', '#c89bff', '#ffd166', '#5fd9e8', '#ff8a5c'];
function couleur(nom) { let h = 0; for (const c of String(nom)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COULEURS[h % COULEURS.length]; }

function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
