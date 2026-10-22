// PROTOTYPE JETABLE : les BRAS de la vue à la 1re personne, taillés dans l'avatar de Haythem lui-même.
// On garde du maillage du corps et de la tenue les seuls triangles portés par les os des bras (épaule exclue : la
// clavicule tire le cou), on accroche le modèle à la caméra, l'œil sur l'objectif, et la cinématique inverse pose les
// deux mains sur l'arme, elle-même placée dans le repère de la caméra.
import * as THREE from 'three';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import { AvatarRig } from '/iris/js/avatar.js';

const OS_BRAS = /^(Left|Right)(Arm|ForeArm|Hand)/;

// ne garde que les triangles dont les trois sommets sont « bras » à plus de `seuil`
export function couperBras(mesh, seuil = 0.5) {
  const geo = mesh.geometry = mesh.geometry.clone();          // (la géométrie du GLB en cache est partagée : on la copie)
  const sk = mesh.skeleton, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight, idx = geo.index;
  const bras = sk.bones.map((b) => OS_BRAS.test(b.name));
  const n = geo.attributes.position.count, w = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0, t = 0; for (let k = 0; k < 4; k++) { const x = sw.getComponent(i, k); t += x; if (bras[si.getComponent(i, k)]) s += x; } w[i] = t > 0 ? s / t : 0; }
  const a = idx.array, garde = [];
  for (let t = 0; t < a.length; t += 3) if (w[a[t]] > seuil && w[a[t + 1]] > seuil && w[a[t + 2]] > seuil) garde.push(a[t], a[t + 1], a[t + 2]);
  geo.setIndex(garde);
  return garde.length / 3;
}

const _e = new THREE.Vector3(), _q = new THREE.Quaternion();
export function brasFps(gltf, hauteur = 1.73, hModele = 1.84) {
  const model = skClone(gltf.scene);
  const rig = new AvatarRig(model);
  const vus = new Map(); let tri = 0;
  model.traverse((o) => {
    if (!o.isSkinnedMesh) return;
    const nm = (o.material && o.material.name) || '';
    if (/body|look/i.test(nm)) {
      if (!vus.has(o.material)) vus.set(o.material, o.material.clone());
      o.material = vus.get(o.material);
      tri += couperBras(o);
      o.frustumCulled = false; o.castShadow = false; o.receiveShadow = false;
    } else o.visible = false;                                  // cheveux, chaussures
  });
  model.scale.setScalar(hauteur / hModele);
  model.rotation.y = Math.PI;                                  // l'avatar regarde +z, la caméra -z
  const groupe = new THREE.Group(); groupe.add(model);
  // l'œil (os Head + 9 cm vers le haut, 9 cm devant) sur l'objectif
  model.updateMatrixWorld(true);
  rig.bone('Head').getWorldPosition(_e);
  _e.y += 0.09; _e.z -= 0.09;                                  // (modèle tourné : « devant » = -z du groupe)
  model.position.set(-_e.x, -_e.y, -_e.z);
  return { groupe, model, rig, triangles: tri };
}
