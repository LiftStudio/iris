// Emotes (danses, chambrage, célébrations, poses) : roue ouverte avec la touche « emote » (T par défaut).
// clip = nom dans assets/anims/manifest.json (les danses sont des clips Mixamo / Sketchfab retargetés) ; proc = pose de
// secours pour le bonhomme procédural ; loop = elle continue jusqu'à ce qu'on bouge.
// procOnly = pas de clip du tout : la chorégraphie maison pilote aussi l'avatar 3D (Player._poseEmote).
// Dans LA CAGE, la plupart s'achetaient chez le marchand ; dans IRIS elles sont toutes là. La ROUE en montre huit
// (touches 1 à 8) : celles marquées `depart`, ou celles choisies dans Options > Emotes (settings.game.emotes).
import { settings } from './settings.js';

export const EMOTES = [
  { id: 'hiphop',  label: 'Hip-hop',   icon: '🕺', clip: 'dance_hiphop',  proc: 'dance', loop: true,  cat: 'Danses', depart: true },
  { id: 'gangnam', label: 'Gangnam',   icon: '🐎', clip: 'dance_gangnam', proc: 'dance', loop: true,  cat: 'Danses', depart: true },
  { id: 'break',   label: 'Break',     icon: '🌀', clip: 'dance_break',   proc: 'dance', loop: true,  cat: 'Danses', depart: true },
  { id: 'chicken', label: 'Poulet',    icon: '🐔', clip: 'dance_chicken', proc: 'flap',  loop: true,  cat: 'Danses', depart: true },
  { id: 'ymca',    label: 'YMCA',      icon: '🙌', clip: 'dance_ymca',    proc: 'arms',  loop: true,  cat: 'Danses', depart: true },
  { id: 'taunt',   label: 'Chambrer',  icon: '😏', clip: 'taunt',         proc: 'taunt', loop: false, cat: 'Chambrage', depart: true },
  { id: 'clap',    label: 'Applaudir', icon: '👏', clip: 'celebrate_2',   proc: 'clap',  loop: false, cat: 'Célébrations', depart: true },
  { id: 'victory', label: 'Victoire',  icon: '🏆', clip: 'victory',       proc: 'victory', loop: false, cat: 'Célébrations', depart: true },

  { id: 'ovation',  label: 'Ovation',     icon: '📣', clip: 'celebrate_3', proc: 'clap', loop: false, cat: 'Célébrations', desc: 'Tu salues la foule.' },
  { id: 'muscles',  label: 'Muscles',     icon: '💪', proc: 'muscles',  procOnly: true, loop: true,  cat: 'Style', desc: 'Double biceps.' },
  { id: 'robot',    label: 'Le robot',    icon: '🤖', proc: 'robot',    procOnly: true, loop: true,  cat: 'Style', desc: 'Saccadé, très sérieux.' },
  { id: 'facepalm', label: 'Facepalm',    icon: '🤦', proc: 'facepalm', procOnly: true, loop: false, cat: 'Chambrage', desc: 'La main sur le front.' },
  { id: 'sleep',    label: 'Trop facile', icon: '😴', proc: 'sleep',    procOnly: true, loop: true,  cat: 'Chambrage', desc: 'Tu t’endors debout.' },
  { id: 'moonwalk', label: 'Moonwalk',    icon: '🌙', proc: 'moonwalk', procOnly: true, loop: true,  cat: 'Danses', desc: 'Le grand classique, sur place.' },
  { id: 'couronne',  label: 'La couronne',  icon: '👑', proc: 'couronne',  procOnly: true, loop: false, cat: 'Célébrations', desc: 'Tu poses la couronne sur ta tête.' },
  { id: 'telephone', label: 'Appelle-moi',  icon: '🤙', proc: 'telephone', procOnly: true, loop: false, cat: 'Chambrage', desc: 'Tu mimes le téléphone.' },
  { id: 'salut',     label: 'Salut',        icon: '🫡', proc: 'salut',     procOnly: true, loop: false, cat: 'Célébrations', desc: 'Respect, l’ami.' },
  { id: 'squat',     label: 'Flexions',     icon: '🏋', proc: 'squat',     procOnly: true, loop: true,  cat: 'Style', desc: 'Tu t’échauffes.' },
  { id: 'croise',    label: 'Bras croisés',   icon: '🧘', proc: 'croise',    procOnly: true, loop: true,  cat: 'Chambrage', desc: 'Tu attends qu’il finisse.' },
  { id: 'pointer',   label: 'Je te vois',     icon: '👉', proc: 'pointer',   procOnly: true, loop: false, cat: 'Chambrage', desc: 'Le bras tendu.' },
  { id: 'chrono',    label: 'Il est l’heure', icon: '⏱️', proc: 'chrono',    procOnly: true, loop: false, cat: 'Chambrage', desc: 'Tu tapes ton poignet : le temps passe.' },
  { id: 'epaule',    label: 'J’époussette',   icon: '🧹', proc: 'epaule',    procOnly: true, loop: false, cat: 'Chambrage', desc: 'Tu balaies la poussière sur ton épaule.' },
  { id: 'troppetit', label: 'Trop petit',     icon: '🤏', proc: 'troppetit', procOnly: true, loop: false, cat: 'Chambrage', desc: 'Il manquait un tout petit peu.' },
  { id: 'nonnon',    label: 'Non, non',       icon: '☝️', proc: 'nonnon',    procOnly: true, loop: false, cat: 'Chambrage', desc: 'Non.' },
  { id: 'shimmy',    label: 'Shimmy',         icon: '✨', proc: 'shimmy',    procOnly: true, loop: true,  cat: 'Danses', desc: 'Les épaules parlent pour toi.' },
  { id: 'mainor',    label: 'Main chaude',    icon: '🔥', proc: 'mainor',    procOnly: true, loop: false, cat: 'Célébrations', desc: 'Tir imaginaire, poignet cassé.' },
  { id: 'lacets',    label: 'Mes lacets',     icon: '👟', proc: 'lacets',    procOnly: true, loop: false, cat: 'Style', desc: 'Tu renoues tranquillement.' },
  { id: 'etirement', label: 'Échauffement',   icon: '🙆', proc: 'etirement', procOnly: true, loop: true,  cat: 'Style', desc: 'Tu étires les épaules, l’air de rien.' },
  { id: 'ymca2',     label: 'YMCA (l’autre)', icon: '🙋', clip: 'dance_ymca_a', proc: 'arms', loop: true, cat: 'Danses', desc: 'La deuxième chorégraphie du même fichier.' },
  { id: 'pompes',    label: 'Pompes',          icon: '🏋️', proc: 'pompes',    procOnly: true, loop: true,  cat: 'Style', desc: 'De vraies pompes, par terre.' },
  { id: 'tourne',    label: 'Le tour complet', icon: '🔄', clip: 'spin_alt',    proc: 'dance', loop: false, cat: 'Style', desc: 'Un tour sur toi-même.' },
];

// Huit emplacements : exactement les touches 1 à 8, et ce que la roue peut afficher sans chevauchement.
export const EMOTE_SLOTS = 8;
export const EMOTE_CATS = ['Danses', 'Chambrage', 'Célébrations', 'Style'];

// La roue : les emotes choisies dans les Options, sinon celles de départ
export const roueEmotes = () => {
  const eq = (settings.game && settings.game.emotes) || [];
  const l = eq.map((id) => EMOTES.find((e) => e.id === id)).filter(Boolean).slice(0, EMOTE_SLOTS);
  return l.length ? l : EMOTES.filter((e) => e.depart);
};
