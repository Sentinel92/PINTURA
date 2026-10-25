export type Mode = 'labor_only' | 'materials_included';

export interface Space {
  id: string;
  name: string;
  wallM2: number;
  ceilingM2: number;
  doors: number;
  repairM2: number; // m² de empaste/reparación (explícito e independiente)
  coats: number; // manos de pintura
}

export interface Rates {
  wall: number; // $/m² muros
  ceiling: number; // $/m² cielos
  door: number; // $ por puerta
  repair: number; // $/m² reparaciones y empastes
  paintPrice: number; // $ por galón/tineta
  paintYield: number; // m² que rinde un galón/tineta (por mano)
}

export interface Quote {
  id: string;
  client: string;
  phone: string;
  date: string;
  mode: Mode;
  transport: number; // valor fijo en $, sin porcentajes ocultos
  spaces: Space[];
}

export interface Totals {
  wallM2: number;
  ceilingM2: number;
  doors: number;
  repairM2: number;
  galones: number;
  costoManoObraBase: number; // muros + cielos
  costoPuertas: number;
  costoManoObraTotal: number; // base + puertas
  costoReparacionesTotal: number;
  costoMaterialesTotal: number;
  costoTraslado: number;
  total: number;
}
