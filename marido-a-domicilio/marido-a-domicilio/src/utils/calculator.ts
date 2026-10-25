import type { Mode, Quote, Rates, Space, Totals } from '../types/quote';

export const DEFAULT_RATES: Rates = {
  wall: 3500, ceiling: 4000, door: 25000, repair: 6000, paintPrice: 28000, paintYield: 40,
};

export const newSpace = (): Space => ({
  id: crypto.randomUUID(), name: 'Nuevo espacio', wallM2: 0, ceilingM2: 0, doors: 0, repairM2: 0, coats: 2,
});

export const newQuote = (): Quote => ({
  id: crypto.randomUUID(), client: '', phone: '', date: new Date().toISOString().slice(0, 10),
  mode: 'labor_only' as Mode, transport: 0, spaces: [newSpace()],
});

export const money = (v: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(v);

const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);

export function calcQuote(q: Pick<Quote, 'mode' | 'spaces' | 'transport'>, r: Rates): Totals {
  let wallM2 = 0, ceilingM2 = 0, doors = 0, repairM2 = 0, paintM2 = 0;
  for (const s of q.spaces) {
    wallM2 += n(s.wallM2); ceilingM2 += n(s.ceilingM2); doors += n(s.doors); repairM2 += n(s.repairM2);
    paintM2 += (n(s.wallM2) + n(s.ceilingM2)) * Math.max(1, n(s.coats));
  }
  // Base: (m² × tarifa) + (puertas × tarifa de puerta). Sin multiplicadores por estado de superficie.
  const costoManoObraBase = wallM2 * r.wall + ceilingM2 * r.ceiling;
  const costoPuertas = doors * r.door;
  const costoManoObraTotal = costoManoObraBase + costoPuertas;
  const costoReparacionesTotal = repairM2 * r.repair;
  const galones = r.paintYield > 0 ? Math.ceil(paintM2 / r.paintYield) : 0;
  // 'labor_only' fuerza materiales a 0 estrictamente.
  const costoMaterialesTotal = q.mode === 'labor_only' ? 0 : galones * r.paintPrice;
  const costoTraslado = n(q.transport);
  const total = costoManoObraTotal + costoReparacionesTotal + costoMaterialesTotal + costoTraslado;
  return { wallM2, ceilingM2, doors, repairM2, galones, costoManoObraBase, costoPuertas,
    costoManoObraTotal, costoReparacionesTotal, costoMaterialesTotal, costoTraslado, total };
}
