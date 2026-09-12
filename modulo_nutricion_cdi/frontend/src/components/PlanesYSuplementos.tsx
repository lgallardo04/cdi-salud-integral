import React, { useState } from 'react';

export const PlanesYSuplementos: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<'PLAN' | 'SUPLEMENTOS'>('PLAN');

  // Estado del plan nutricional adaptado a disponibilidad nacional venezolana
  const [plan, setPlan] = useState({
    calorias: 1800,
    carbohidratos: 55,
    proteinas: 20,
    grasas: 25,
    desayuno: '1 arepa asada de maíz rellena con revuelto de huevo o sardina fresca + café o infusión sin azúcar.',
    meriendaManana: '1 fruta de temporada (cambur, guayaba o lechosa) + vaso de agua.',
    almuerzo: '1 taza de caraotas o lentejas guisadas con aliño criollo (cebollín, ají dulce, ajo) + 1 taza de arroz blanco o yuca hervida + ensalada verde.',
    meriendaTarde: '1 vaso de Nutrichicha enriquecida bien diluida o infusión.',
    cena: '1 arepa asada pequeña o batata cocida con queso blanco rallado bajo en sal y rodajas de tomate.',
    recomendaciones: 'Evitar frituras y refrescos. Aprovechar granos y tubérculos autóctonos (ocumo, yuca, topocho) como fuentes energéticas limpias.'
  });

  // Estado para entrega de suplementos
  const [suplementosDisponibles] = useState([
    { id: '1', nombre: 'Sulfato Ferroso + Ácido Fólico (200mg / 1mg)', stock: 250, tipo: 'Tabletas' },
    { id: '2', nombre: 'Nutrichicha Enriquecida INN', stock: 95, tipo: 'Bolsa 1kg' },
    { id: '3', nombre: 'Micronutrientes en Polvo (Chispitas)', stock: 300, tipo: 'Sobres' },
    { id: '4', nombre: 'Vitamina A (Megadosis 100.000 UI)', stock: 180, tipo: 'Perlas' }
  ]);

  const [entregaForm, setEntregaForm] = useState({
    suplementoId: '1',
    cantidad: 1,
    dosis: '1 tableta diaria en ayunas con jugo de frutas cítricas',
    duracionDias: 60,
    lote: 'LOTE-SULF-2026B',
    responsable: 'Lic. Carmen Briceño'
  });

  const [historialEntregas, setHistorialEntregas] = useState([
    {
      id: 'E-01',
      suplemento: 'Sulfato Ferroso + Ácido Fólico',
      cantidad: 1,
      fecha: '2026-09-01',
      lote: 'LOTE-SULF-2026B',
      responsable: 'Lic. Carmen Briceño',
      estado: 'ENTREGADO'
    }
  ]);

  const handleEntregaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supSeleccionado = suplementosDisponibles.find(s => s.id === entregaForm.suplementoId);
    if (!supSeleccionado) return;

    const nuevaEntrega = {
      id: `E-0${historialEntregas.length + 1}`,
      suplemento: supSeleccionado.nombre,
      cantidad: entregaForm.cantidad,
      fecha: new Date().toISOString().split('T')[0],
      lote: entregaForm.lote,
      responsable: entregaForm.responsable,
      estado: 'ENTREGADO'
    };

    setHistorialEntregas([nuevaEntrega, ...historialEntregas]);
    alert(`Entrega de ${supSeleccionado.nombre} procesada correctamente.`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex border-b border-slate-200 mb-6 gap-4">
        <button
          onClick={() => setTabActiva('PLAN')}
          className={`pb-3 font-semibold text-sm transition border-b-2 ${
            tabActiva === 'PLAN'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          🥗 Plan de Alimentación Personalizado
        </button>
        <button
          onClick={() => setTabActiva('SUPLEMENTOS')}
          className={`pb-3 font-semibold text-sm transition border-b-2 ${
            tabActiva === 'SUPLEMENTOS'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          💊 Entrega de Suplementos (INN / CDI)
        </button>
      </div>

      {tabActiva === 'PLAN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metas Macronutricionales */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Metas Calóricas y Macronutrientes</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Requerimiento Calórico Total (Kcal/día)
              </label>
              <input
                type="number"
                value={plan.calorias}
                onChange={(e) => setPlan({ ...plan, calorias: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg text-sm font-semibold text-emerald-700"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500">CHO (%)</label>
                <input
                  type="number"
                  value={plan.carbohidratos}
                  onChange={(e) => setPlan({ ...plan, carbohidratos: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border rounded text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">PROT (%)</label>
                <input
                  type="number"
                  value={plan.proteinas}
                  onChange={(e) => setPlan({ ...plan, proteinas: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border rounded text-xs text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500">GRASAS (%)</label>
                <input
                  type="number"
                  value={plan.grasas}
                  onChange={(e) => setPlan({ ...plan, grasas: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1.5 border rounded text-xs text-center"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
              💡 <strong>Criterio Adaptativo:</strong> Diseñado con base en ingredientes de acceso común y canasta comunitaria (arepa, caraotas, sardina enlatada o fresca, ocumo, plátano verde).
            </div>
          </div>

          {/* Menú y Guía Diaria */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Estructura del Menú Diario Adaptado</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Desayuno Principal:</span>
                <textarea
                  rows={2}
                  value={plan.desayuno}
                  onChange={(e) => setPlan({ ...plan, desayuno: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg text-slate-800"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700">Almuerzo Nutricional:</span>
                <textarea
                  rows={2}
                  value={plan.almuerzo}
                  onChange={(e) => setPlan({ ...plan, almuerzo: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg text-slate-800"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700">Cena Liviana:</span>
                <textarea
                  rows={2}
                  value={plan.cena}
                  onChange={(e) => setPlan({ ...plan, cena: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg text-slate-800"
                />
              </div>
              <div>
                <span className="font-semibold text-slate-700">Recomendaciones y Sustitutos Comunitarios:</span>
                <textarea
                  rows={2}
                  value={plan.recomendaciones}
                  onChange={(e) => setPlan({ ...plan, recomendaciones: e.target.value })}
                  className="w-full mt-1 p-2 border rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => window.print()}
              >
                Imprimir Guía para Paciente
              </button>
              <button
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                onClick={() => alert('Plan alimentario guardado exitosamente.')}
              >
                Guardar y Asignar Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {tabActiva === 'SUPLEMENTOS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de entrega */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Dispensar Suplemento Nutricional
            </h3>
            <form onSubmit={handleEntregaSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Suplemento</label>
                <select
                  value={entregaForm.suplementoId}
                  onChange={(e) => setEntregaForm({ ...entregaForm, suplementoId: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  {suplementosDisponibles.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (Stock: {s.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={entregaForm.cantidad}
                    onChange={(e) => setEntregaForm({ ...entregaForm, cantidad: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lote</label>
                  <input
                    type="text"
                    value={entregaForm.lote}
                    onChange={(e) => setEntregaForm({ ...entregaForm, lote: e.target.value })}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Indicación y Posología</label>
                <input
                  type="text"
                  value={entregaForm.dosis}
                  onChange={(e) => setEntregaForm({ ...entregaForm, dosis: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Profesional Responsable</label>
                <input
                  type="text"
                  value={entregaForm.responsable}
                  onChange={(e) => setEntregaForm({ ...entregaForm, responsable: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs"
              >
                Procesar Entrega a Paciente
              </button>
            </form>
          </div>

          {/* Historial de entregas */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3">
              Historial de Suplementación Registrada
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2">Código</th>
                    <th>Suplemento</th>
                    <th>Cant.</th>
                    <th>Lote</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historialEntregas.map((h) => (
                    <tr key={h.id} className="text-slate-700">
                      <td className="py-2 font-mono">{h.id}</td>
                      <td className="font-medium text-slate-900">{h.suplemento}</td>
                      <td>{h.cantidad}</td>
                      <td className="font-mono text-slate-500">{h.lote}</td>
                      <td>{h.fecha}</td>
                      <td>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          {h.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
