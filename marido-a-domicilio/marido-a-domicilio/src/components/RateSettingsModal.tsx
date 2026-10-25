import { X } from 'lucide-react';
import type { Rates } from '../types/quote';

const labels: Record<keyof Rates, string> = {
  wall: 'Muros ($/m²)', ceiling: 'Cielos ($/m²)', door: 'Puerta ($ c/u)', repair: 'Reparaciones/empastes ($/m²)',
  paintPrice: 'Precio galón/tineta ($)', paintYield: 'Rendimiento (m² por galón y mano)',
};

interface Props { rates: Rates; onChange: (r: Rates) => void; onClose: () => void }

export default function RateSettingsModal({ rates, onChange, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Tarifas</h2>
          <button onClick={onClose} aria-label="Cerrar"><X /></button></div>
        <div className="space-y-3">
          {(Object.keys(labels) as (keyof Rates)[]).map((k) => (
            <label key={k} className="block text-sm text-slate-600">{labels[k]}
              <input type="number" inputMode="decimal" min={0} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900"
                value={rates[k]} onChange={(e) => onChange({ ...rates, [k]: parseFloat(e.target.value) || 0 })} />
            </label>))}
        </div>
        <button onClick={onClose} className="mt-4 w-full rounded-xl bg-green-500 py-3 font-semibold text-white">Listo</button>
      </div>
    </div>
  );
}
