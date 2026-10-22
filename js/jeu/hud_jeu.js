// =====================================================================
//  LE HUD DU COMBAT — squelette du socle S0 (22/10), rempli par le lot L-G (vague 3 : L-P)
// =====================================================================
// Ce que Haythem voit de la partie (spec §§ 3.6, 4.5.15 ; CoD § 9.1) : réticule qui dit la vérité, marqueurs de touche,
// « +100 », score et chrono, fil des éliminations, mini-carte, vie, munitions, indicateurs de dégâts, vignette, caméra de
// mort, annonces dans un élément À ELLES (jamais hud.feedback), chevrons des alliés, calque blanc de la flash. Tout le DOM
// est créé par JS sous #hud (marqué `data-jeu` : l'empreinte du HUD de la balade ne le compte pas) ; il ne lit que
// `partie.hud` et les événements, et n'écrit le DOM que si la valeur AFFICHÉE change. Le squelette : un bloc de texte
// (vie, munitions, chrono, scores, annonce).

export class HudJeu {
  constructor(game) {
    this.game = game; this.partie = null; this.el = null; this._txt = '';
  }
  brancher(partie) {
    this.partie = partie;
    const hud = document.getElementById('hud');
    if (!this.el && hud) {
      this.el = document.createElement('div');
      this.el.id = 'hud-jeu'; this.el.className = 'hud-jeu'; this.el.dataset.jeu = '1';
      hud.appendChild(this.el);
    }
    if (this.el) this.el.hidden = false;
    this._txt = '';
  }
  debrancher() { this.partie = null; if (this.el) { this.el.hidden = true; this.el.textContent = ''; } this._txt = ''; }
  maj(dt, hud) {
    if (!this.el || !hud) return;
    const A = hud.arme, mn = Math.floor((hud.chrono || 0) / 60), s = Math.floor((hud.chrono || 0) % 60);
    const sc = hud.scores ? `SISR ${hud.scores.A} – ${hud.scores.B} SLAM · ` : '';
    const ph = hud.phase === 'presentation' ? 'PRÉSENTATION' : hud.phase === 'decompte' ? `${Math.max(1, Math.ceil((hud.phaseDuree || 0) - (hud.phaseT || 0)))}` : '';
    const an = hud.annonce && this.partie && this.partie.t - hud.annonce.t < 2.5 ? ' · ' + hud.annonce.texte : '';
    const txt = `${sc}${mn}:${String(s).padStart(2, '0')} · VIE ${Math.round(hud.vie ?? 0)}` + (A ? ` · ${A.nom} ${A.chargeur} / ${A.reserve}` : '') + (ph ? ' · ' + ph : '') + an
      + (hud.mort ? ' · ÉLIMINÉ' : '') + (hud.reapparitionT > 0 ? ` · réapparition ${hud.reapparitionT.toFixed(1)} s` : '');
    if (txt !== this._txt) { this._txt = txt; this.el.textContent = txt; }
  }
}
