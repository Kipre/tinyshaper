import { Vector3 } from "three";

// @ts-check
const allZero = { x: 0, y: 0, z: 0, xUp: 0, yUp: 0, zUp: 0 };

/**
 * @typedef {"top" | "side" | "front" | "back"} ProfileKey
 */

/**
 * @typedef {"x" | "y" | "z" | "x0"} PathKey
 */

/**
 * @typedef {Object} ProfileInfo
 * @property {PathKey} profile
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} xUp
 * @property {number} yUp
 * @property {number} zUp
 * @property {number} zoom
 * @property {(x: Vector3) => number} getXPan
 * @property {(x: Vector3) => number} getYPan
 */

/** @type {Object.<ProfileKey, ProfileInfo>} */
export const coords = {
  top: {
    ...allZero,
    profile: "z",
    z: 5,
    xUp: 1,
    zoom: 1,
    getXPan: (x) => x["y"],
    getYPan: (x) => x["x"],
  },
  side: {
    ...allZero,
    profile: "y",
    x: -5,
    zUp: 1,
    zoom: 1,
    getXPan: (x) => x["y"],
    getYPan: (x) => x["z"],
  },
  front: {
    ...allZero,
    profile: "x",
    y: -5,
    zUp: 1,
    zoom: 3,
    getXPan: (x) => -x["x"],
    getYPan: (x) => x["z"],
  },
  back: {
    ...allZero,
    profile: "x0",
    y: 5,
    zUp: 1,
    zoom: 3,
    getXPan: (x) => x["x"],
    getYPan: (x) => x["z"],
  },
};
