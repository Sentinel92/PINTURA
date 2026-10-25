import { useEffect, useMemo, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { FilePlus2, FileDown, HardDrive, Plus, Save, Settings, Trash2 } from 'lucide-react';
import type { Mode, Quote, Rates } from './types/quote';
import { DEFAULT_RATES, calcQuote, money, newQuote, newSpace } from './utils/calculator';
import SpaceCard from './components/SpaceCard';
import PrintableQuoteDocument from './components/PrintableQuoteDocument';
import RateSettingsModal from './components/RateSettingsModal';
import BackupModal from './components/BackupModal';

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* sin espacio */ } }, [key, v]);
  return [v, setV] as const;
}

// Elimina reglas CSS con oklch del documento clonado (html2canvas no las soporta).
function stripOklch(doc: Document) {
  doc.querySelectorAll('style').forEach((s) => { if (s.textContent?.includes('oklch')) s.remove(); });
  Array.from(doc.styleSheets).forEach((sheet) => {
    try {
      for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
        if (sheet.cssRules[i].cssText.includes('oklch')) sheet.deleteRule(i);
      }
    } catch { /* hoja externa */ }
  });
}

export default function App() {
  const [quote, setQuote] = usePersisted<Quote>('mad.quote', newQuote());
  const [rates, setRates] = usePersisted<Rates>('mad.rates', DEFAULT_RATES);
  const [history, setHistory] = usePersisted<Quote[]>('mad.history', []);
  const [showRates, setShowRates] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const totals = useMemo(() => calcQuote(quote, rates), [quote, rates]);

  const save = () => setHistory((h) => [quote, ...h.filter((q) => q.id !== quote.id)]);
  const downloadPdf = async () => {
    if (!docRef.current) return;
    await html2pdf().set({
      margin: 0, filename: `cotizacion-${quote.client || 'cliente'}-${quote.date}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, onclone: (d: Document) => stripOklch(d) },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }).from(docRef.current).save();
  };

  const modes: [Mode, string][] = [['labor_only', 'Solo mano de obra'], ['materials_included', 'Con materiales']];

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-slate-50 pb-44 text-slate-900">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <h1 className="font-bold">Marido a Domicilio</h1>
        <div className="flex gap-1">
          <button className="p-2" aria-label="Respaldo" onClick={() => setShowBackup(true)}><HardDrive size={20} /></button>
          <button className="p-2" aria-label="Tarifas" onClick={() => setShowRates(true)}><Settings size={20} /></button>
        </div>
      </header>

      <main className="space-y-4 p-4">
        <section className="grid grid-cols-2 gap-2">
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Cliente" value={quote.client} onChange={(e) => setQuote({ ...quote, client: e.target.value })} />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Teléfono" inputMode="tel" value={quote.phone} onChange={(e) => setQuote({ ...quote, phone: e.target.value })} />
        </section>

        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-200 p-1">
          {modes.map(([m, label]) => (
            <button key={m} onClick={() => setQuote({ ...quote, mode: m })}
              className={`rounded-lg py-2 text-sm font-semibold ${quote.mode === m ? 'bg-slate-900 text-white' : 'text-slate-600'}`}>{label}</button>))}
        </div>

        {quote.spaces.map((s) => (
          <SpaceCard key={s.id} space={s}
            onChange={(ns) => setQuote({ ...quote, spaces: quote.spaces.map((x) => (x.id === s.id ? ns : x)) })}
            onRemove={() => setQuote({ ...quote, spaces: quote.spaces.filter((x) => x.id !== s.id) })} />))}
        <button onClick={() => setQuote({ ...quote, spaces: [...quote.spaces, newSpace()] })}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 font-semibold text-slate-600"><Plus size={18} />Agregar espacio</button>

        <label className="block text-sm text-slate-600">Traslado / movilización (valor fijo $)
          <input type="number" inputMode="decimal" min={0} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-base text-slate-900"
            value={quote.transport} onChange={(e) => setQuote({ ...quote, transport: parseFloat(e.target.value) || 0 })} />
        </label>

        {history.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold">Historial</h2>
            <ul className="space-y-2">{history.map((h) => (
              <li key={h.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                <button className="text-left" onClick={() => setQuote(h)}>
                  <div className="font-medium">{h.client || 'Sin nombre'}</div>
                  <div className="text-xs text-slate-500">{h.date} · {money(calcQuote(h, rates).total)}</div>
                </button>
                <button aria-label="Eliminar" className="p-2 text-slate-400" onClick={() => setHistory(history.filter((x) => x.id !== h.id))}><Trash2 size={16} /></button>
              </li>))}</ul>
          </section>)}
      </main>

      <footer className="fixed inset-x-0 bottom-0 mx-auto max-w-2xl border-t border-slate-200 bg-white p-4">
        <dl className="mb-3 space-y-0.5 text-sm text-slate-600">
          <div className="flex justify-between"><dt>Mano de obra</dt><dd>{money(totals.costoManoObraTotal)}</dd></div>
          {totals.costoReparacionesTotal > 0 && <div className="flex justify-between"><dt>Reparaciones</dt><dd>{money(totals.costoReparacionesTotal)}</dd></div>}
          {totals.costoMaterialesTotal > 0 && <div className="flex justify-between"><dt>Materiales ({totals.galones} gal.)</dt><dd>{money(totals.costoMaterialesTotal)}</dd></div>}
          {totals.costoTraslado > 0 && <div className="flex justify-between"><dt>Traslado</dt><dd>{money(totals.costoTraslado)}</dd></div>}
          <div className="flex justify-between pt-1 text-xl font-bold text-slate-900"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
        </dl>
        <div className="grid grid-cols-3 gap-2 text-sm font-semibold">
          <button onClick={() => setQuote(newQuote())} className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 py-3"><FilePlus2 size={16} />Nueva</button>
          <button onClick={save} className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 py-3 text-white"><Save size={16} />Guardar</button>
          <button onClick={downloadPdf} className="flex items-center justify-center gap-1 rounded-xl bg-green-500 py-3 text-white"><FileDown size={16} />PDF</button>
        </div>
      </footer>

      {/* Documento imprimible fuera de pantalla (no display:none, para que html2canvas lo renderice) */}
      <div style={{ position: 'fixed', left: -10000, top: 0 }} aria-hidden>
        <PrintableQuoteDocument ref={docRef} quote={quote} totals={totals} />
      </div>

      {showRates && <RateSettingsModal rates={rates} onChange={setRates} onClose={() => setShowRates(false)} />}
      {showBackup && <BackupModal data={{ quote, rates, history }} onClose={() => setShowBackup(false)}
        onImport={(d) => { if (d.rates) setRates(d.rates); if (d.history) setHistory(d.history); if (d.quote) setQuote(d.quote); }} />}
    </div>
  );
}
