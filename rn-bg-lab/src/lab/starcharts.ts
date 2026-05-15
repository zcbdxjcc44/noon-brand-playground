/**
 * Hand-authored star graphs — one per subject. Direct port of STAR_CHARTS
 * from noon-bg-lab.html. Coordinates live in a normalised [-1,1] cube.
 * Each graph traces the same recognisable 3D form the constellation style
 * uses (see SUBJECTS): rings become star loops, bars become star pairs,
 * sphere cores become bright anchor stars. `anchor` stars render
 * brighter/larger; `broken` edges stop partway and dissolve into the dark.
 */

export interface StarNode {
  x: number;
  y: number;
  z: number;
  anchor?: boolean;
}

export interface StarEdge {
  a: number;
  b: number;
  broken?: boolean;
}

export interface StarChartData {
  name: string;
  stars: StarNode[];
  edges: StarEdge[];
}

export const STAR_CHARTS: Record<string, StarChartData> = {
  // paraboloid bowl + 3 crossing axes
  math: {
    name: 'Mathematics',
    stars: [
      { x: -0.78, y:  0.42, z:  0.00 },
      { x: -0.40, y: -0.06, z:  0.00 },
      { x:  0.00, y: -0.30, z:  0.00, anchor: true },
      { x:  0.40, y: -0.06, z:  0.00 },
      { x:  0.78, y:  0.42, z:  0.00 },
      { x: -0.95, y: -0.12, z:  0.00 },
      { x:  0.95, y: -0.12, z:  0.00 },
      { x:  0.00, y:  0.68, z:  0.00 },
      { x:  0.00, y: -0.80, z:  0.00 },
      { x:  0.00, y: -0.12, z: -0.95 },
      { x:  0.00, y: -0.12, z:  0.95 },
      { x:  0.00, y: -0.12, z:  0.00, anchor: true },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 },
      { a: 5, b: 11 }, { a: 11, b: 6 },
      { a: 7, b: 11, broken: true }, { a: 11, b: 8 },
      { a: 9, b: 11 }, { a: 11, b: 10, broken: true },
    ],
  },
  // nucleus + 3 mutually-perpendicular orbit rings
  physics: {
    name: 'Physics',
    stars: [
      { x:  0.00, y:  0.00, z:  0.00, anchor: true },
      { x:  0.78, y:  0.00, z:  0.00, anchor: true },
      { x:  0.24, y:  0.74, z:  0.00 },
      { x: -0.63, y:  0.46, z:  0.00 },
      { x: -0.63, y: -0.46, z:  0.00 },
      { x:  0.24, y: -0.74, z:  0.00 },
      { x:  0.63, y:  0.00, z:  0.46 },
      { x: -0.24, y:  0.00, z:  0.74 },
      { x: -0.78, y:  0.00, z:  0.00 },
      { x: -0.24, y:  0.00, z: -0.74 },
      { x:  0.63, y:  0.00, z: -0.46 },
      { x:  0.00, y:  0.00, z:  0.78 },
      { x:  0.00, y:  0.74, z:  0.24 },
      { x:  0.00, y:  0.46, z: -0.63 },
      { x:  0.00, y: -0.46, z: -0.63 },
      { x:  0.00, y: -0.74, z:  0.24 },
    ],
    edges: [
      { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4 }, { a: 4, b: 5 }, { a: 5, b: 1, broken: true },
      { a: 6, b: 7 }, { a: 7, b: 8 }, { a: 8, b: 9 }, { a: 9, b: 10 }, { a: 10, b: 6, broken: true },
      { a: 11, b: 12 }, { a: 12, b: 13 }, { a: 13, b: 14 }, { a: 14, b: 15 }, { a: 15, b: 11, broken: true },
      { a: 0, b: 1, broken: true }, { a: 0, b: 8, broken: true },
    ],
  },
  // a central hexagon hub with 4 outer stars bonded outward at even
  // tetrahedral angles — the centre connection point is a 6-sided ring
  chemistry: {
    name: 'Chemistry',
    stars: [
      { x:  0.000, y:  0.200, z:  0.000 },
      { x: -0.173, y:  0.100, z:  0.000 },
      { x: -0.173, y: -0.100, z:  0.000 },
      { x:  0.000, y: -0.200, z:  0.000 },
      { x:  0.173, y: -0.100, z:  0.000 },
      { x:  0.173, y:  0.100, z:  0.000 },
      { x:  0.000, y:  0.660, z:  0.000, anchor: true },
      { x:  0.622, y: -0.220, z:  0.000, anchor: true },
      { x: -0.311, y: -0.220, z:  0.539, anchor: true },
      { x: -0.311, y: -0.220, z: -0.539, anchor: true },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3, broken: true }, { a: 3, b: 4 }, { a: 4, b: 5 }, { a: 5, b: 0 },
      { a: 0, b: 6 }, { a: 4, b: 7 }, { a: 2, b: 8 }, { a: 3, b: 9, broken: true },
    ],
  },
  // two large tilted rings (crossing in 3D) with cell bodies scattered
  // around them — the bright anchor stars are the free-floating cells,
  // not connected to anything
  biology: {
    name: 'Biology',
    stars: [
      { x:  0.880, y:  0.000, z:  0.000 },
      { x:  0.622, y:  0.573, z:  0.242 },
      { x:  0.000, y:  0.811, z:  0.342 },
      { x: -0.622, y:  0.573, z:  0.242 },
      { x: -0.880, y:  0.000, z:  0.000 },
      { x: -0.622, y: -0.573, z: -0.242 },
      { x:  0.000, y: -0.811, z: -0.342 },
      { x:  0.622, y: -0.573, z: -0.242 },
      { x:  0.660, y:  0.000, z:  0.000 },
      { x:  0.467, y:  0.342, z:  0.318 },
      { x:  0.000, y:  0.483, z:  0.450 },
      { x: -0.467, y:  0.342, z:  0.318 },
      { x: -0.660, y:  0.000, z:  0.000 },
      { x: -0.467, y: -0.342, z: -0.318 },
      { x:  0.000, y: -0.483, z: -0.450 },
      { x:  0.467, y: -0.342, z: -0.318 },
      { x:  0.10, y:  0.34, z:  0.12, anchor: true },
      { x:  0.36, y:  0.00, z: -0.14, anchor: true },
      { x: -0.50, y: -0.40, z:  0.18, anchor: true },
      { x:  0.80, y:  0.30, z: -0.10, anchor: true },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4, broken: true },
      { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 0, broken: true },
      { a: 8, b: 9 }, { a: 9, b: 10 }, { a: 10, b: 11, broken: true }, { a: 11, b: 12 },
      { a: 12, b: 13 }, { a: 13, b: 14 }, { a: 14, b: 15, broken: true }, { a: 15, b: 8 },
    ],
  },
  // a 3D planet ball (octahedron cage) wrapped by a smaller strongly-tilted
  // halo ring — a ringed-planet read. Ball and ring are not connected.
  geography: {
    name: 'Geography',
    stars: [
      { x:  0.437, y:  0.000, z:  0.000 },
      { x:  0.000, y:  0.437, z:  0.000, anchor: true },
      { x:  0.000, y:  0.000, z:  0.437 },
      { x: -0.437, y:  0.000, z:  0.000 },
      { x:  0.000, y: -0.437, z:  0.000 },
      { x:  0.000, y:  0.000, z: -0.437 },
      { x:  0.595, y:  0.122, z:  0.000, anchor: true },
      { x:  0.384, y:  0.256, z:  0.390 },
      { x: -0.051, y:  0.243, z:  0.557 },
      { x: -0.454, y:  0.090, z:  0.390 },
      { x: -0.595, y: -0.122, z:  0.000 },
      { x: -0.384, y: -0.256, z: -0.390 },
      { x:  0.051, y: -0.243, z: -0.557 },
      { x:  0.454, y: -0.090, z: -0.390 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 0, b: 2 }, { a: 0, b: 4, broken: true }, { a: 0, b: 5 },
      { a: 1, b: 2 }, { a: 1, b: 3 }, { a: 1, b: 5 }, { a: 2, b: 3, broken: true },
      { a: 2, b: 4 }, { a: 3, b: 4 }, { a: 3, b: 5 }, { a: 4, b: 5 },
      { a: 6, b: 7 }, { a: 7, b: 8 }, { a: 8, b: 9 }, { a: 9, b: 10, broken: true },
      { a: 10, b: 11 }, { a: 11, b: 12 }, { a: 12, b: 13 }, { a: 13, b: 6, broken: true },
    ],
  },
  // bar chart: four bars rising from a common baseline to varying heights
  quant: {
    name: 'Qudrat Quant',
    stars: [
      { x: -0.60, y: -0.65, z:  0.00 },
      { x: -0.60, y: -0.15, z:  0.00 },
      { x: -0.20, y: -0.65, z:  0.00 },
      { x: -0.20, y:  0.30, z:  0.00 },
      { x:  0.20, y: -0.65, z:  0.00, anchor: true },
      { x:  0.20, y:  0.60, z:  0.00, anchor: true },
      { x:  0.60, y: -0.65, z:  0.00 },
      { x:  0.60, y:  0.05, z:  0.00 },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 2, b: 3 }, { a: 4, b: 5 }, { a: 6, b: 7 },
      { a: 0, b: 2, broken: true }, { a: 2, b: 4 }, { a: 4, b: 6, broken: true },
      { a: 1, b: 3 }, { a: 3, b: 5, broken: true }, { a: 5, b: 7 },
    ],
  },
  // speech-bubble ring + a tail pointing down-left
  verbal: {
    name: 'Qudrat Verbal',
    stars: [
      { x:  0.58, y:  0.10, z:  0.00 },
      { x:  0.29, y:  0.60, z: -0.10 },
      { x: -0.29, y:  0.60, z:  0.10, anchor: true },
      { x: -0.58, y:  0.10, z:  0.00 },
      { x: -0.29, y: -0.40, z: -0.10 },
      { x:  0.29, y: -0.40, z:  0.10 },
      { x: -0.34, y: -0.46, z:  0.00 },
      { x: -0.50, y: -0.78, z:  0.00, anchor: true },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 4, broken: true },
      { a: 4, b: 5 }, { a: 5, b: 0 },
      { a: 4, b: 6 }, { a: 6, b: 7 },
    ],
  },
  // capital letter 'A' — two diagonal legs meeting at an apex + a crossbar
  esl: {
    name: 'ESL',
    stars: [
      { x:  0.00, y:  0.88, z:  0.00, anchor: true },
      { x: -0.18, y:  0.40, z:  0.06 },
      { x: -0.32, y:  0.02, z: -0.05 },
      { x: -0.45, y: -0.40, z:  0.05 },
      { x: -0.58, y: -0.80, z: -0.04, anchor: true },
      { x:  0.18, y:  0.40, z: -0.06 },
      { x:  0.32, y:  0.02, z:  0.05 },
      { x:  0.45, y: -0.40, z: -0.05 },
      { x:  0.58, y: -0.80, z:  0.04, anchor: true },
    ],
    edges: [
      { a: 0, b: 1 }, { a: 1, b: 2, broken: true }, { a: 2, b: 3 }, { a: 3, b: 4 },
      { a: 0, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 8, broken: true },
      { a: 2, b: 6 },
    ],
  },
};

export const STARCHART_SUBJECTS = Object.keys(STAR_CHARTS);
