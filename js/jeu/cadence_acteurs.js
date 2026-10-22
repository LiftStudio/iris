// =====================================================================
//  LA CADENCE DES POSES — squelette du socle S0 (22/10), rempli par le lot L-C
// =====================================================================
// Qui est DESSINÉ et qui est POSÉ à cette image (spec §§ 3.10, 4.5.10) : à chaque image à moins de 18 m et à l'écran,
// une image sur 3 au-delà de 34 m, 4 Hz caché ; un acteur qui REDEVIENT dessiné est posé dans cette image même ; l'ombre
// au niveau de la caméra seulement ; au téléphone, 2 bots pleins. Écrit sur chaque acteur `dessine`, `aPoser`, `ombre`,
// `poseDt` (le temps depuis sa dernière pose). Le squelette : tous dessinés, tous posés à chaque image (sauf le corps de
// l'acteur local, jamais posé : il est caché en vue à la 1re personne), ombre au niveau de la caméra.
import { niveauDe } from './constantes.js';

export class CadenceActeurs {
  maj(acteurs, camera, imageN) {
    const nCam = niveauDe(camera.position.y - 1);
    for (const a of acteurs) {
      const t = a.partie ? a.partie.t : 0;
      a.dessine = !!a.corps;
      a.aPoser = !!a.joueur && a.corps === a.joueur && !a.local && (a.vivant || !!a.poupee);
      a.poseDt = Math.max(1 / 240, Math.min(0.25, t - (a._tPose ?? t - 1 / 60)));
      if (a.aPoser) a._tPose = t;
      a.ombre = a.corps ? niveauDe(a.corps.pos.y + 0.5) === nCam : false;
    }
  }
}
