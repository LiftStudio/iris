// =====================================================================
//  LE TABLEAU DES SCORES — squelette du socle S0 (22/10), rempli par le lot L-G
// =====================================================================
// Tenu par Tab (ou Back) : rang, portrait, nom, score, É / M / A, ratio, série ; deux colonnes d'équipe ; les colonnes du
// prop hunt (spec § 4.5.15). Non interactif, PAS dans les racines de la manette. Le squelette : une liste de texte.

export class TableauScores {
  constructor(game) { this.game = game; this.el = null; this._vu = ''; this._force = false; }
  _creer() {
    if (this.el) return;
    const hud = document.getElementById('hud'); if (!hud) return;
    this.el = document.createElement('div'); this.el.id = 'tableau-scores'; this.el.className = 'tableau-scores'; this.el.dataset.jeu = '1';
    this.el.hidden = true; hud.appendChild(this.el);
  }
  basculer(partie) { this._force = !this._force; this.maj(partie, false); }
  maj(partie, montre) {
    this._creer(); if (!this.el) return;
    const on = (montre || this._force) && !!partie;
    const L = on ? partie.hud.classement || [] : [];
    const vu = on ? L.map((c) => `${c.nom} ${c.score} ${c.elims}/${c.morts}/${c.assists}`).join(' | ') : '';
    if (vu === this._vu) return;
    this._vu = vu; this.el.hidden = !on;
    if (on) this.el.textContent = L.map((c, i) => `${i + 1}. ${c.nom}${c.equipe ? ' (' + c.equipe + ')' : ''} — ${c.score} pts · É ${c.elims} · M ${c.morts} · A ${c.assists}`).join('\n');
  }
}
