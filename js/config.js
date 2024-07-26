const allZero = { x: 0, y: 0, z: 0, xUp: 0, yUp: 0, zUp: 0 };

export const coords = {
  top: { ...allZero, profile: "z", z: 5, xUp: 1, zoom: 1 },
  side: { ...allZero, profile: "y", x: -5, zUp: 1, zoom: 1 },
  front: { ...allZero, profile: "x", y: -5, zUp: 1, zoom: 3 },
  back: { ...allZero, profile: "x0", y: 5, zUp: 1, zoom: 3 },
};
