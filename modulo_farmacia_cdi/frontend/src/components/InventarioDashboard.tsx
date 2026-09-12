import React, { useState } from 'react';

interface Articulo {
  id: string;
  codigo: string;
  nombreGenerico: string;
  concentracion: string;
  forma: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  loteActivo: string;
  vencimiento: string;
  diasParaVencer: number;
}

export const InventarioDashboard: React.FC = () => {
  const [articulos, setArticulos] = useState<Articulo[]>([
    {
      id: '1',
      codigo: 'MED-OFT-01',
      nombreGenerico: 'Timolol Maleato',
      concentracion: '0.5%',
      forma: 'Colirio Oftálmico',
      categoria: 'OFTALMOLOGICO',
      stockActual: 60,
      stockMinimo: 15,
      loteActivo: 'LOTE-TIM-2026A',
      vencimiento: '2026-11-30',
      diasParaVencer: 79
    },
    {
      id: '2',
      codigo: 'MED-OFT-02',
      nombreGenerico: 'Tobramicina + Dexametasona',
      concentracion: '0.3% / 0.1%',
      forma: 'Colirio Oftálmico',
      categoria: 'OFTALMOLOGICO',
      stockActual: 45,
      stockMinimo: 10,
      loteActivo: 'LOTE-TOB-2026F',
      vencimiento: '2026-10-15',
      diasParaVencer: 34
    },
    {
      id: '3',
      codigo: 'MED-GEN-04',
      nombreGenerico: 'Metformina Clorhidrato',
      concentracion: '850mg',
      forma: 'Tabletas',
      categoria: 'HIPOGLUCEMIANTE',
      stockActual: 15,
      stockMinimo: 40,
      loteActivo: 'LOTE-MET-2026X',
      vencimiento: '2026-09-30',
      diasParaVencer: 19 // Crítico
    },
    {
      id: '4',
      codigo: 'MED-GEN-02',
      nombreGenerico: 'Losartán Potásico',
      concentracion: '50mg',
      forma: 'Tabletas',
      categoria: 'ANTIHIPERTENSIVO',
      stockActual: 200,
      stockMinimo: 50,
      loteActivo: 'LOTE-LOS-2027K',
      vencimiento: '2027-08-30',
      diasParaVencer: 350
    }
  ]);

  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [busqueda, setBusqueda] = useState<string>('');

  // Formulario de nueva entrada por donación / dotación central
  const [nuevaEntrada, setNuevaEntrada] = useState({
    articuloId: '1',
    numeroLote: '',
    vencimiento: '',
    cantidad: 50,
    guia: 'GUIA-MPPS-2026-88',
    responsable: 'Lcda. María Suárez (Farmacéutica CDI)'
  });

  const handleEntradaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Entrada registrada. Se aumentó el stock bajo política FEFO y se actualizó el Kardex.`);
    setMostrarModalEntrada(false);
  };

  const articulosFiltrados = articulos.filter((a) => {
    const coincideCat = filtroCategoria === 'TODAS' || a.categoria === filtroCategoria;
    const coincideTexto = a.nombreGenerico.toLowerCase().includes(busqueda.toLowerCase()) ||
                          a.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCat && coincideTexto;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Control de Inventario y Kardex - Farmacia CDI
          </h1>
          <p className="text-xs text-slate-500">
            Trazabilidad de Medicamentos e Insumos bajo normativa sanitaria venezolana (FEFO)
          </p>
        </div>
        <button
          onClick={() => setMostrarModalEntrada(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-2"
        >
          <span>📦</span> Registrar Entrada de Dotación / Lote
        </button>
      </div>

      {/* Tarjetas de Alerta Rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
            🚨 Alerta Vencimiento Crítico (&lt; 30 días)
          </span>
          <p className="text-2xl font-black text-rose-700 mt-1">1 Lote</p>
          <p className="text-xs text-rose-600">Metformina 850mg (Lote: MET-2026X)</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            ⚠️ Vencimiento Próximo (&lt; 90 días)
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">2 Lotes</p>
          <p className="text-xs text-amber-600">Tobramicina colirio y Timolol maleato</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
          <span className="text-xs font-bold text-orange-800 uppercase tracking-wide">
            📉 Quiebre de Stock Mínimo
          </span>
          <p className="text-2xl font-black text-orange-700 mt-1">1 Artículo</p>
          <p className="text-xs text-orange-600">Metformina: 15 disp. / 40 requeridos</p>
        </div>
      </div>

      {/* Tabla y Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2 w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar por principio activo o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-medium">Categoría:</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-700"
            >
              <option value="TODAS">Todas las áreas</option>
              <option value="OFTALMOLOGICO">Oftalmología</option>
              <option value="ANTIBIOTICO">Antibióticos</option>
              <option value="ANTIHIPERTENSIVO">Antihipertensivos</option>
              <option value="HIPOGLUCEMIANTE">Hipoglucemiantes</option>
              <option value="ANALGESICO_ANTIINFLAMATORIO">Analgésicos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">Código</th>
                <th className="px-3">Medicamento / Principio Activo</th>
                <th className="px-3">Presentación</th>
                <th className="px-3 text-center">Stock Actual</th>
                <th className="px-3 text-center">Stock Mínimo</th>
                <th className="px-3">Lote Activo (FEFO)</th>
                <th className="px-3">Vencimiento</th>
                <th className="px-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articulosFiltrados.map((item) => {
                const stockCritico = item.stockActual <= item.stockMinimo;
                const venceCritico = item.diasParaVencer <= 30;
                const venceAlerta = item.diasParaVencer > 30 && item.diasParaVencer <= 90;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition text-slate-700">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.codigo}</td>
                    <td className="px-3 font-semibold text-slate-900">
                      {item.nombreGenerico}
                      <span className="block text-[11px] font-normal text-slate-500">{item.concentracion}</span>
                    </td>
                    <td className="px-3">{item.forma}</td>
                    <td className="px-3 text-center font-bold text-slate-900">
                      <span className={stockCritico ? 'text-rose-600' : 'text-emerald-700'}>
                        {item.stockActual}
                      </span>
                    </td>
                    <td className="px-3 text-center text-slate-500">{item.stockMinimo}</td>
                    <td className="px-3 font-mono text-slate-600">{item.loteActivo}</td>
                    <td className="px-3 font-mono">
                      {item.vencimiento}
                      <span className="block text-[10px] text-slate-500">
                        ({item.diasParaVencer} días)
                      </span>
                    </td>
                    <td className="px-3 text-right">
                      {venceCritico ? (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Vence Pronto
                        </span>
                      ) : venceAlerta ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Alerta &lt;90d
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          Óptimo
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Registro de Entrada de Lote */}
      {mostrarModalEntrada && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Registrar Entrada de Dotación de Medicamentos
            </h3>
            <form onSubmit={handleEntradaSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Medicamento</label>
                <select
                  value={nuevaEntrada.articuloId}
                  onChange={(e) => setNuevaEntrada({ ...nuevaEntrada, articuloId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  {articulos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombreGenerico} {a.concentracion} ({a.codigo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Número de Lote</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. LOTE-2026-X"
                    value={nuevaEntrada.numeroLote}
                    onChange={(e) => setNuevaEntrada({ ...nuevaEntrada, numeroLote: e.target.value })}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={nuevaEntrada.vencimiento}
                    onChange={(e) => setNuevaEntrada({ ...nuevaEntrada, vencimiento: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cantidad Recibida</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={nuevaEntrada.cantidad}
                    onChange={(e) => setNuevaEntrada({ ...nuevaEntrada, cantidad: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Guía SADA / Soporte</label>
                  <input
                    type="text"
                    required
                    value={nuevaEntrada.guia}
                    onChange={(e) => setNuevaEntrada({ ...nuevaEntrada, guia: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarModalEntrada(false)}
                  className="px-3 py-2 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                >
                  Guardar en Kardex
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
