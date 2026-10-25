import { Trash2 } from 'lucide-react';
import type { Space } from '../types/quote';

interface Props { space: Space; onChange: (s: Space) => void; onRemove: () => void }

const fields: [keyof Space, string][] = [
  ['wallM2', 'Muros m²'], ['ceilingM2', 'Cielos m²'], ['doors', 'Puertas'], ['repairM2', 'Empaste m²'], ['coats', 'Manos'],
];

export default function SpaceCard({ space, onChange, onRemove }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <input className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 font-semibold"
          value={space.name} onChange={(e) => onChange({ ...space, name: e.target.value })} aria-label="Nombre del espacio" />
        <button onClick={onRemove} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Quitar espacio"><Trash2 size={18} /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {fields.map(([key, label]) => (
          <label key={key} className="text-xs text-slate-500">{label}
            <input type="number" inputMode="decimal" min={0}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-base text-slate-900"
              value={space[key] as number} onChange={(e) => onChange({ ...space, [key]: parseFloat(e.target.value) || 0 })} />
          </label>))}
      </div>
    </div>
  );
}
