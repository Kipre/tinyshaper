// @ts-check

export const eps = 1e-5;

export const nbSlices = 30;
export const nbPoints = 15;
export const nbPointsPerSlice = nbPoints * 4 + 1;

/**
 * @typedef {"top" | "side" | "front" | "back"} ProfileKey
 */

/**
 * @typedef {"x" | "y" | "z" | "x0"} PathKey
 */

/**
 * @typedef {Object} ProfileInfo
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} xUp
 * @property {number} yUp
 * @property {number} zUp
 */
