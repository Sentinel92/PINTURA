import { useRef } from 'react';
import { Download, Upload, X } from 'lucide-react';

interface Props { data: unknown; onImport: (d: any) => void; onClose: () => void }

export default function BackupModal({ data, onImport, onClose }: Props) {
  const file = useRef<HTMLInputElement>(null);
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url; a.download = `respaldo-marido-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const importJson = async (f?: File) => {
    if (!f) return;
    try { onImport(JSON.parse(await f.text())); onClose(); }
    catch { alert('El archivo no es un respaldo válido (.json).'); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Copia de seguridad</h2>
          <button onClick={onClose} aria-label="Cerrar"><X /></button></div>
        <p className="mb-4 text-sm text-slate-600">Guarda tus cotizaciones y tarifas en un archivo, o restaura uno anterior. Importar reemplaza los datos actuales.</p>
        <button onClick={exportJson} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white"><Download size={18} />Exportar respaldo</button>
        <button onClick={() => file.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 font-semibold"><Upload size={18} />Importar respaldo</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => importJson(e.target.files?.[0])} />
      </div>
    </div>
  );
}
