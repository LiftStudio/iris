// =====================================================================
//  LES SONS DU JEU — squelette du socle S0 (22/10), rempli par le lot L-H
// =====================================================================
// Les tirs, les pas des acteurs, les rechargements, les impacts, les explosions… spatialisés (PannerNode), occultés par
// la balistique, retardés de d / 343 s, 24 voix au plus (12 au téléphone ; spec § 4.5.17), nourris par les ÉVÉNEMENTS.
// Une voix est LIBÉRÉE sur l'horloge de SonsJeu (`t`, avancée par `maj`) quand t ≥ fin — jamais sur `onended` (sous
// ?test=1 l'OfflineAudioContext n'avance pas : currentTime reste à 0, onended ne vient jamais). Le squelette : la recette
// jouée NON spatialisée sur la sortie d'`audio`, un claquement de tir sur l'événement `tir`.
import { TELEPHONE } from '../appareil.js';

const MAX_VOIX = TELEPHONE ? 12 : 24;

// un claquement de tir (bruit filtré bref) : la recette (ctx, sortie, quand) → durée
function claquement(ctx, sortie, quand) {
  const n = Math.floor(ctx.sampleRate * 0.12), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.18));
  const s = ctx.createBufferSource(); s.buffer = b;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.5, quand); g.gain.exponentialRampToValueAtTime(0.001, quand + 0.12);
  s.connect(g); g.connect(sortie); s.start(quand); s.stop(quand + 0.13);
  return 0.13;
}

export class SonsJeu {
  constructor(audio) { this.audio = audio; this.t = 0; this._voix = []; this.partie = null; this._des = []; }
  get voix() { return this._voix; }
  brancher(partie) {
    this.debrancher(); this.partie = partie;
    this._des.push(partie.sur('tir', (e) => {
      const a = partie.acteurParId(e.a);
      this.jouer3d(e.ox, e.oy, e.oz, claquement, { gain: a && a.local ? 0.6 : 0.35, rayon: 60 });
    }));
  }
  debrancher() { for (const d of this._des) d(); this._des = []; this.partie = null; }
  // `o` = { gain = 1, rayon = 30, bas = false, prioritaire = false } ; rend la voix (ou null : pas de contexte, trop de voix)
  jouer3d(x, y, z, recette, o) {
    const { gain = 1, rayon = 30, bas = false, prioritaire = false } = o || {};
    const A = this.audio, ctx = A && A.ctx;
    if (!ctx || !A.master) return null;
    if (this._voix.length >= MAX_VOIX) {
      if (!prioritaire) return null;
      const v = this._voix.shift(); try { v.gain.disconnect(); } catch (e) { /* déjà débranchée */ }
    }
    const g = ctx.createGain(); g.gain.value = gain * (A.vol ? A.vol.sfx ?? 1 : 1);
    g.connect(A.master);
    const quand = ctx.currentTime;
    let duree = 0;
    try { duree = recette(ctx, g, quand) || 0; } catch (e) { console.warn('[sons]', e); }
    const v = { x, y, z, panner: null, filtre: null, gain: g, debut: this.t, fin: this.t + duree, niveauDb: 0, rayon, bas };
    this._voix.push(v);
    return v;
  }
  // l'horloge des sons : les voix finies libérées (jamais par onended)
  maj(dt, camera) {
    this.t += dt;
    for (let i = this._voix.length - 1; i >= 0; i--) {
      const v = this._voix[i];
      if (this.t >= v.fin) { this._voix.splice(i, 1); try { v.gain.disconnect(); } catch (e) { /* déjà */ } }
    }
  }
}
