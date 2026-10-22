// =====================================================================
//  LE HUD DU PROP HUNT — squelette du socle S0 (22/10), rempli par le lot L-G
// =====================================================================
// La forme et son nom, les changements, le verrou et le gel, l'anneau de provocation, la jauge DISCRÉTION, l'ŒIL, les
// étiquettes des alliés, l'aide « E : devenir … », le panneau de cachette du chasseur (#voile-cachette) et la ROUE DES
// PROVOCATIONS — son DESSIN seulement, d'après `hud.prop.roue` (la saisie est à PartieProp ; jamais game.wheel) — spec
// §§ 2.7-2.8, 4.5.15. DOM sous #hud, marqué `data-jeu`. Le squelette : une ligne de texte, la roue en liste.
import { PROVOCATIONS } from './sons_prop.js';

export class HudProp {
  constructor(game) { this.game = game; this.el = null; this.roue = null; this._txt = ''; }
  brancher(partie) {
    const hud = document.getElementById('hud');
    if (!this.el && hud) {
      this.el = document.createElement('div'); this.el.id = 'hud-prop'; this.el.className = 'hud-prop'; this.el.dataset.jeu = '1';
      hud.appendChild(this.el);
      this.roue = new RoueProvocations(hud);
    }
    if (this.el) this.el.hidden = false;
    this._txt = '';
  }
  debrancher() { if (this.el) { this.el.hidden = true; this.el.textContent = ''; } if (this.roue) this.roue.maj(null, PROVOCATIONS); this._txt = ''; }
  maj(dt, hud) {
    if (!this.el) return;
    const P = hud && hud.prop;
    const txt = P ? `${P.role === 'prop' ? 'PROP' : 'CHASSEUR'}${P.nomForme ? ' · ' + P.nomForme : ''}${P.fige ? ' · FIGÉ' : ''}${P.verrou ? ' · VERROU' : ''} · props ${P.propsRestants} · chasseurs ${P.chasseursRestants}` : '';
    if (txt !== this._txt) { this._txt = txt; this.el.textContent = txt; this.el.hidden = !txt; }
    if (this.roue) this.roue.maj(P ? P.roue : null, PROVOCATIONS);
  }
}

// LA ROUE DES PROVOCATIONS (le dessin) : 8 secteurs, le choix en surbrillance — le squelette : une liste, le choix entre crochets
export class RoueProvocations {
  constructor(parent) {
    this.el = document.createElement('div'); this.el.id = 'roue-provocations'; this.el.className = 'roue-provocations'; this.el.dataset.jeu = '1';
    this.el.hidden = true;
    if (parent) parent.appendChild(this.el);
    this._vu = '';
  }
  maj(roue, provocations) {
    const ouverte = !!(roue && roue.ouverte);
    const vu = ouverte ? 'o' + roue.choix : 'f';
    if (vu === this._vu) return;
    this._vu = vu;
    this.el.hidden = !ouverte;
    if (ouverte) this.el.textContent = (provocations || []).map((p, i) => (i === roue.choix ? `[${i + 1}. ${p.label}]` : `${i + 1}. ${p.label}`)).join(' · ');
  }
}
