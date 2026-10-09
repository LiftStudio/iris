// Constantes du jeu IRIS (en mètres et en secondes). LA CAGE avait ici toutes les cotes d'un terrain de basket ;
// IRIS n'en garde que ce que le joueur et la caméra lisent.

export const G = 9.81;                 // la gravité (saut)

// La zone où le joueur peut aller, par défaut : très large. Ce sont les MURS de la carte (js/collisions.js) qui
// arrêtent le joueur ; cette boîte n'est qu'un filet de sécurité (un joueur qui sortirait de la carte par un trou
// dans les murs ne tombe pas dans le vide indéfiniment). Chaque carte pose la sienne (js/carte_ecole.js, `bornes`).
export const BOUNDS = { xMin: -200, xMax: 200, zMin: -200, zMax: 200 };

// Le joueur contre les murs : un disque de ce rayon autour des pieds (épaules comprises, un peu moins large que
// la carrure : on frôle un chambranle sans s'y accrocher).
export const RAYON_JOUEUR = 0.3;
