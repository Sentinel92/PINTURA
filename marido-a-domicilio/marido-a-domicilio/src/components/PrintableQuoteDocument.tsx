import { forwardRef } from 'react';
import type { Quote, Totals } from '../types/quote';
import { money } from '../utils/calculator';

// Solo estilos en línea con HEX: html2canvas no soporta oklch (Tailwind v4).
const C = { ink: '#0f172a', white: '#ffffff', line: '#e2e8f0', green: '#22c55e', soft: '#f8fafc', mute: '#64748b' };

interface Props { quote: Quote; totals: Totals }

const PrintableQuoteDocument = forwardRef<HTMLDivElement, Props>(({ quote, totals: t }, ref) => {
  const rows: [string, number][] = [['Mano de Obra (Muros, Cielos y Puertas)', t.costoManoObraTotal]];
  if (t.costoReparacionesTotal > 0) rows.push(['Reparaciones & Tratamientos (Empastes/Humedad)', t.costoReparacionesTotal]);
  if (quote.mode !== 'labor_only' && t.costoMaterialesTotal > 0) rows.push(['Materiales e Insumos de Pintura', t.costoMaterialesTotal]);
  if (t.costoTraslado > 0) rows.push(['Gastos de Traslado / Movilización', t.costoTraslado]);

  return (
    <div ref={ref} style={{ width: 720, background: C.white, color: C.ink, fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 13 }}>
      <div style={{ background: C.ink, color: C.white, padding: '28px 32px', borderBottom: `4px solid ${C.green}` }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Marido a Domicilio</div>
        <div style={{ fontSize: 12, color: C.line, marginTop: 4 }}>Cotización de pintura y remodelación</div>
      </div>
      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', background: C.soft, border: `1px solid ${C.line}`, padding: 16, borderRadius: 8 }}>
          <div><div style={{ color: C.mute, fontSize: 11 }}>Cliente</div><div style={{ fontWeight: 700 }}>{quote.client || '—'}</div>
            <div style={{ color: C.mute }}>{quote.phone}</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ color: C.mute, fontSize: 11 }}>Fecha</div><div style={{ fontWeight: 700 }}>{quote.date}</div>
            <div style={{ color: C.mute }}>{quote.mode === 'labor_only' ? 'Solo mano de obra' : 'Con materiales'}</div></div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
          <thead><tr style={{ background: C.ink, color: C.white }}>
            {['Espacio', 'Muros m²', 'Cielo m²', 'Puertas', 'Repar. m²'].map((h, i) => (
              <th key={h} style={{ padding: 8, textAlign: i ? 'right' : 'left', fontSize: 11 }}>{h}</th>))}
          </tr></thead>
          <tbody>{quote.spaces.map((s, i) => (
            <tr key={s.id} style={{ background: i % 2 ? C.soft : C.white, borderBottom: `1px solid ${C.line}` }}>
              <td style={{ padding: 8 }}>{s.name}</td>
              {[s.wallM2, s.ceilingM2, s.doors, s.repairM2].map((v, j) => <td key={j} style={{ padding: 8, textAlign: 'right' }}>{v}</td>)}
            </tr>))}</tbody>
        </table>

        <div style={{ marginTop: 24, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden' }}>
          {rows.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.line}` }}>
              <span>{label}</span><span style={{ fontWeight: 700 }}>{money(value)}</span>
            </div>))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: C.ink, color: C.white, fontSize: 16, fontWeight: 700 }}>
            <span>Total</span><span style={{ color: C.green }}>{money(t.total)}</span>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: C.mute }}>Cotización referencial sujeta a visita técnica.</div>
      </div>
    </div>
  );
});
export default PrintableQuoteDocument;
