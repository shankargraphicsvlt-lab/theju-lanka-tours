/**
 * Simplified, hand-traced outline of Sri Lanka for the illustrative
 * destination map. Not to scale for navigation; good enough to place pins.
 * Projection: equirectangular, 100 units per degree (cos(7.5°) ≈ 0.99, so
 * longitude and latitude degrees are nearly equal in distance here).
 */

export const MAP_VIEWBOX = { width: 260, height: 420 } as const;
const ORIGIN = { lng: 79.5, lat: 9.95 };
const SCALE = 100;

export function project(lat: number, lng: number): { x: number; y: number } {
  return { x: (lng - ORIGIN.lng) * SCALE, y: (ORIGIN.lat - lat) * SCALE };
}

/** [lng, lat] coastline points, clockwise from the Jaffna peninsula. */
const COASTLINE: ReadonlyArray<readonly [number, number]> = [
  [80.05, 9.8], [80.25, 9.83], [80.45, 9.6], [80.8, 9.25], [81.1, 8.8], [81.23, 8.58],
  [81.4, 8.2], [81.7, 7.72], [81.85, 7.2], [81.85, 6.9], [81.65, 6.45], [81.3, 6.2],
  [81.0, 6.07], [80.75, 5.95], [80.59, 5.92], [80.42, 5.93], [80.2, 6.0], [80.05, 6.25],
  [79.95, 6.55], [79.86, 6.93], [79.83, 7.2], [79.8, 7.6], [79.72, 8.05], [79.82, 8.4],
  [79.88, 8.75], [79.92, 9.05], [80.1, 9.3], [79.95, 9.55],
];

/** Closed Catmull-Rom spline through the coastline points, as an SVG path. */
function smoothClosedPath(points: { x: number; y: number }[], tension = 0.5): string {
  const n = points.length;
  const at = (i: number) => points[((i % n) + n) % n]!;
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(at(0).x)},${f(at(0).y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + ((p2.x - p0.x) * tension) / 3;
    const c1y = p1.y + ((p2.y - p0.y) * tension) / 3;
    const c2x = p2.x - ((p3.x - p1.x) * tension) / 3;
    const c2y = p2.y - ((p3.y - p1.y) * tension) / 3;
    d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(p2.x)},${f(p2.y)}`;
  }
  return `${d} Z`;
}

export const SRI_LANKA_PATH = smoothClosedPath(COASTLINE.map(([lng, lat]) => project(lat, lng)));
