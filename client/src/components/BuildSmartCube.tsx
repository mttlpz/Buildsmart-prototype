const ORANGE = "#E07B39";
const LEFT_FACE_COLOR = "#B85E2A";
const RIGHT_FACE_COLOR = "#CC6D31";
const EMPTY_OPACITY = 0.1;

const DX = 17, DY = 10, DZ = 20;

function iso(x: number, y: number, z: number, ox: number, oy: number) {
  return {
    x: (x - y) * DX + ox,
    y: -(z * DZ) + (x + y) * DY + oy,
  };
}

function shrinkPoly(pts: { x: number; y: number }[], s = 0.80) {
  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
  return pts
    .map((p) => `${(cx + (p.x - cx) * s).toFixed(1)},${(cy + (p.y - cy) * s).toFixed(1)}`)
    .join(" ");
}

// Cell ID grids per face — 4×4 = 16 bricks each, 48 total
const TOP_CELLS: string[][] = [
  ["A1", "A2", "A3", "A4"],
  ["B1", "B2", "B3", "B4"],
  ["C1", "C2", "C3", "C4"],
  ["D1", "D2", "D3", "D4"],
];

// Left face (x=0), row 0 = top (z=3), col 0 = front (y=0)
const LEFT_CELLS: string[][] = [
  ["A5", "A6", "B5", "B6"],
  ["C5", "C6", "D5", "D6"],
  ["E1", "E2", "E3", "E4"],
  ["E5", "E6", "F1", "F2"],
];

// Right face (y=0), row 0 = top (z=3), col 0 = left (x=0)
const RIGHT_CELLS: string[][] = [
  ["F3", "F4", "F5", "F6"],
  ["G1", "G2", "G3", "G4"],
  ["G5", "G6", "H1", "H2"],
  ["H3", "H4", "H5", "H6"],
];

interface BrickDef {
  cellId: string;
  points: string;
  faceColor: string;
}

function buildBricks(ox: number, oy: number): BrickDef[] {
  const bricks: BrickDef[] = [];

  // Left face (x=0): bricks at (y, z), rendered leftmost in screen
  LEFT_CELLS.forEach((row, rz) => {
    const z = 3 - rz;
    row.forEach((cellId, cy) => {
      const pts = [
        iso(0, cy, z + 1, ox, oy),
        iso(0, cy + 1, z + 1, ox, oy),
        iso(0, cy + 1, z, ox, oy),
        iso(0, cy, z, ox, oy),
      ];
      bricks.push({ cellId, points: shrinkPoly(pts), faceColor: LEFT_FACE_COLOR });
    });
  });

  // Right face (y=0): bricks at (x, z), rendered rightmost in screen
  RIGHT_CELLS.forEach((row, rz) => {
    const z = 3 - rz;
    row.forEach((cellId, cx) => {
      const pts = [
        iso(cx, 0, z + 1, ox, oy),
        iso(cx + 1, 0, z + 1, ox, oy),
        iso(cx + 1, 0, z, ox, oy),
        iso(cx, 0, z, ox, oy),
      ];
      bricks.push({ cellId, points: shrinkPoly(pts), faceColor: RIGHT_FACE_COLOR });
    });
  });

  // Top face (z=4): bricks at (x, y), rendered on top
  TOP_CELLS.forEach((row, ry) => {
    row.forEach((cellId, cx) => {
      const pts = [
        iso(cx, ry, 4, ox, oy),
        iso(cx + 1, ry, 4, ox, oy),
        iso(cx + 1, ry + 1, 4, ox, oy),
        iso(cx, ry + 1, 4, ox, oy),
      ];
      bricks.push({ cellId, points: shrinkPoly(pts), faceColor: ORANGE });
    });
  });

  return bricks;
}

interface Props {
  filledCells: string[];
  size?: number;
}

export function BuildSmartCube({ filledCells, size = 1 }: Props) {
  const OX = 90, OY = 108;
  const bricks = buildBricks(OX, OY);
  const filledSet = new Set(filledCells);

  return (
    <svg
      viewBox="0 0 180 215"
      width={180 * size}
      height={215 * size}
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      {bricks.map(({ cellId, points, faceColor }) => {
        const filled = filledSet.has(cellId);
        return (
          <polygon
            key={cellId}
            points={points}
            fill={faceColor}
            opacity={filled ? 1 : EMPTY_OPACITY}
            style={{ transition: "opacity 150ms ease-in" }}
          />
        );
      })}
    </svg>
  );
}

// All 48 cell IDs in visual order (useful for "all filled" state)
export const ALL_CELLS: string[] = [
  ...LEFT_CELLS.flat(),
  ...RIGHT_CELLS.flat(),
  ...TOP_CELLS.flat(),
];
