// =====================================================================
//  LA CADENCE DES POSES (lot L-C, 23/10 ; spec §§ 3.10, 4.3.3, 4.5.10 — squelette du socle S0)
// =====================================================================
// Qui est DESSINÉ et qui est POSÉ à cette image. Les bots sont SIMULÉS à 120 Hz (js/jeu/partie.js pas) mais POSÉS — clips,
// couches, accroupi, arme : ≈ 0,15 ms chacun — une fois par image AU PLUS, et moins quand on les voit mal (la cadence de
// LA CAGE, js/pedestrians.js _animer) :
//   - DESSINÉ = sa zone n'est pas cachée de la caméra (ecole_visibilite.js : `!(zonesCachees(caméra) & zoneDe(x, −z, y + 1))`
//     — un autre étage, une pièce fermée, la rue vue du −1 : ecole_visibilite.js:160-166 ne range jamais un SkinnedMesh ni un
//     objet `dynamique`, un bot à l'autre étage était dessiné à chaque image, carte d'ombre, GTAO et ombres de contact
//     compris) ET dans le cadre (une sphère de 1 m autour de son buste) ; sinon son groupe est caché, son arme aussi, et
//     sa présentation est LÉGÈRE (js/player.js presenter : sa position seulement) ;
//   - POSÉ : à chaque image à moins de 18 m, une image sur deux jusqu'à 34 m, une sur trois au-delà (phases décalées par
//     id) ; à 4 Hz quand il n'est pas dessiné ; au téléphone, les deux bots dessinés les plus proches à chaque image, les
//     autres une sur trois (AVATARS_PLEINS de LA CAGE, presence.js:76). Un acteur qui REDEVIENT dessiné est posé DANS
//     CETTE IMAGE (sinon un bot posé à 4 Hz reparaît dans une pose vieille de 0,25 s). Entre deux poses, son arme reste
//     collée à son corps (js/jeu/pose_arme.js suivreArme). Une poupée de chiffon n'est pas posée (elle tient les os) ;
//   - OMBRE : seulement s'il est au niveau de la caméra (castShadow posé au changement, armes comprises).
// Écrit sur chaque acteur `dessine`, `aPoser`, `ombre`, `poseDt` (le temps depuis sa dernière pose, 0,25 s au plus). Le
// corps de l'acteur local (Haythem : caché en vue à la 1re personne), un prop (js/jeu/deguisements.js majProps), une
// cible du stand ne sont jamais posés ici. La réapparition rend son corps à un bot sorti de sa poupée (poupee.js).
import * as THREE from 'three';
import { niveauDe } from './constantes.js';
import { zoneDe, zonesCachees } from '../ecole_visibilite.js';
import { TELEPHONE } from '../appareil.js';
import { suivreArme, ombreArme3e } from './pose_arme.js';

export const CADENCE = { pres: 18, loin: 34, cache: 0.25, sphere: 1.0, pleinsTelephone: 2, poseMax: 0.25 };
const _v = new THREE.Vector3(), _m = new THREE.Matrix4();

export class CadenceActeurs {
  constructor() {
    this.frustum = new THREE.Frustum(); this.sphere = new THREE.Sphere(new THREE.Vector3(), CADENCE.sphere);
    this._cle = NaN; this._H = 0;
    this.stats = { image: -1, poses: 0, dessines: 0, caches: 0 };   // (lus par les tests)
    this._L = [];
  }
  // le masque des zones cachées vu de la caméra (recalculé quand elle a bougé de 2 cm, comme ecole_visibilite.js)
  caches(camera) {
    const V = typeof window !== 'undefined' ? window.__visibilite : null;
    if (V && V.actif === false) return 0;
    const p = camera.position, k = Math.round(p.x * 50) * 1e8 + Math.round(p.y * 50) * 1e4 + Math.round(p.z * 50);
    if (k !== this._cle || (V && V.regles)) { this._cle = k; this._H = ((V && V.regles) || zonesCachees)(p.x, p.y, p.z); }
    return this._H;
  }
  maj(acteurs, camera, imageN) {
    camera.updateMatrixWorld();
    _m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(_m);
    const H = this.caches(camera), nCam = niveauDe(camera.position.y - 1), cp = camera.position;
    const S = this.stats; S.image = imageN; S.poses = 0; S.dessines = 0; S.caches = 0;
    const L = this._L; L.length = 0;
    for (const a of acteurs) {
      const t = a.partie ? a.partie.t : 0, c = a.corps;
      if (!c) { a.dessine = false; a.aPoser = false; a.ombre = false; continue; }
      const j = a.joueur, corps = !!j && c === j;
      a.ombre = niveauDe(c.pos.y + 0.5) === nCam;
      if (!corps || a.local) { a.dessine = true; a.aPoser = false; a.poseDt = 0; continue; }
      // (la réapparition : la poupée quittée, le corps rendu au mélangeur)
      if (j._poupee && (a.vivant || a.poupee !== j._poupee)) j._poupee.liberer(true);
      // DESSINÉ : sa zone vue de la caméra, et dans le cadre
      const x = j.posAff.x, z = j.posAff.z, sol = Number.isFinite(j.solAff) ? j.solAff : j.pos.y;
      const vu = !H || !(H & zoneDe(x, -z, sol + 1));
      this.sphere.center.set(x, sol + 0.9, z);
      const cache = !!(a.poupee && a.poupee.cachee);
      const dessine = vu && !cache && this.frustum.intersectsSphere(this.sphere);
      const redevient = dessine && !a._dessinePrec;
      a._dessinePrec = dessine; a.dessine = dessine;
      j.mesh.visible = dessine; j.leger = !dessine;
      // L'OMBRE (au changement ; un avatar arrivé depuis reçoit la sienne)
      if (j._ombre !== a.ombre || j._ombreModele !== j.avatarModel) {
        j._ombre = a.ombre; j._ombreModele = j.avatarModel;
        j.mesh.traverse((o) => { if (o.isMesh && !o.userData.brassard) o.castShadow = a.ombre; });
      }
      ombreArme3e(a, a.ombre);
      const d = dessine ? Math.hypot(x - cp.x, sol + 0.9 - cp.y, z - cp.z) : Infinity;
      a._d = d;
      if (dessine) { S.dessines++; L.push(a); } else S.caches++;
      // POSÉ ?
      let poser;
      if (a.poupee || !a.vivant) poser = false;
      else if (!dessine) poser = a._tPose === undefined || t - a._tPose >= CADENCE.cache - 1e-9;
      else if (redevient || a._tPose === undefined) poser = true;
      else if (d < CADENCE.pres) poser = true;
      else if (d < CADENCE.loin) poser = (imageN + a.id) % 2 === 0;
      else poser = (imageN + a.id) % 3 === 0;
      a.aPoser = poser;
    }
    // au téléphone : les deux bots dessinés les plus proches à chaque image, les autres une image sur trois
    if (TELEPHONE && L.length > CADENCE.pleinsTelephone) {
      L.sort((p, q) => p._d - q._d);
      for (let i = CADENCE.pleinsTelephone; i < L.length; i++) {
        const a = L[i];
        if (a.aPoser && a._tPose !== undefined && a._dessineAvantPose) a.aPoser = (imageN + a.id) % 3 === 0;
      }
    }
    for (const a of acteurs) {
      if (!a.joueur || a.corps !== a.joueur || a.local) continue;
      const t = a.partie ? a.partie.t : 0;
      if (a.aPoser) {
        a.poseDt = Math.max(1 / 240, Math.min(CADENCE.poseMax, a._tPose === undefined ? 1 / 60 : t - a._tPose));
        a._tPose = t; S.poses++;
      } else {
        a.poseDt = 0;
        suivreArme(a, a.dessine);
      }
      a._dessineAvantPose = a.dessine;
    }
  }
}
