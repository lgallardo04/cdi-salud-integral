import React, { useState } from 'react';

interface RecipePendiente {
  numeroRecipe: string;
  paciente: string;
  cedula: string;
  servicio: string;
  fechaEmision: string;
  medicamentos: {
    detalleId: string;
    articuloId: string;
    nombre: string;
    posologia: string;
    prescrito: number;
    despachado: number;
    aDespachar: number;
    loteSugerido: string;
    vencimientoLote: string;
    stockDisponible: number;
  }[];
}

export const DispensacionEstacion: React.FC = () => {
  const [criterioBusqueda, setCriterioBusqueda] = useState('REC-OFT-2026-0089');
  const [recipeActivo, setRecipeActivo] = useState<RecipePendiente | null>({
    numeroRecipe: 'REC-OFT-2026-0089',
    paciente: 'Yelitza Rodríguez',
    cedula: 'V-15842931',
    servicio: 'OFTALMOLOGIA',
    fechaEmision: '2026-09-10',
    medicamentos: [
      {
        detalleId: 'det-1',
        articuloId: 'bbbb1111-0000-0000-0000-000000000001',
        nombre: 'Timolol Maleato 0.5% (Colirio)',
        posologia: '1 gota en ojo derecho c/12h',
        prescrito: 1,
        despachado: 0,
        aDespachar: 1,
        loteSugerido: 'LOTE-TIM-2026A',
        vencimientoLote: '2026-11-30',
        stockDisponible: 30
      },
      {
        detalleId: 'det-2',
        articuloId: 'bbbb1111-0000-0000-0000-000000000002',
        nombre: 'Tobramicina + Dexametasona (Colirio)',
        posologia: '1 gota en ambos ojos c/8h por 7 días',
        prescrito: 1,
        despachado: 0,
        aDespachar: 1,
        loteSugerido: 'LOTE-TOB-2026F',
        vencimientoLote: '2026-10-15',
        stockDisponible: 45
      }
    ]
  });

  const [personaRetira, setPersonaRetira] = useState({
    nombre: 'Yelitza Rodríguez',
    cedula: 'V-15842931',
    parentesco: 'TITULAR',
    farmaceuta: 'Lcda. María Suárez'
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Buscando récipe o cédula: ${criterioBusqueda}`);
  };

  const handleDispensar = () => {
    if (!recipeActivo) return;
    alert(
      `Dispensación completada para ${personaRetira.nombre}.\nDescarga de inventario efectuada mediante FEFO.\nComprobante DISP-${Date.now()} generado.`
    );
  };

  return (
    <div className="p-6 bg-slate-50 max-w-5xl mx-auto min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Estación de Dispensación y Entrega a Pacientes
        </h1>
        <p className="text-xs text-slate-500">
          Validación en ventanilla, asignación estricta FEFO y comprobante de entrega
        </p>
      </header>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por Nº de Récipe o Cédula de Identidad (ej. V-15842931)..."
            value={criterioBusqueda}
            onChange={(e) => setCriterioBusqueda(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition"
          >
            Buscar Récipe
          </button>
        </form>
      </div>

      {recipeActivo && (
        <div className="space-y-6">
          {/* Ficha Resumen del Récipe */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                  {recipeActivo.numeroRecipe}
                </span>
                <span className="ml-2 text-xs text-slate-500">
                  Emitido por: <strong className="text-slate-800">{recipeActivo.servicio}</strong> ({recipeActivo.fechaEmision})
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{recipeActivo.paciente}</p>
                <p className="text-xs font-mono text-slate-500">{recipeActivo.cedula}</p>
              </div>
            </div>

            {/* Listado de Medicamentos con Lote FEFO asignado */}
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Medicamentos a Despachar (Asignación Automática FEFO)
            </h3>

            <div className="divide-y divide-slate-100">
              {recipeActivo.medicamentos.map((med) => (
                <div key={med.detalleId} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{med.nombre}</h4>
                    <p className="text-xs text-slate-500">{med.posologia}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Lote: {med.loteSugerido}
                      </span>
                      <span className="text-[11px] text-amber-700 font-medium">
                        Vence: {med.vencimientoLote}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-slate-500 block">Prescrito / Pendiente</span>
                      <span className="font-bold text-slate-800">{med.prescrito} un.</span>
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[10px] mb-0.5">A Entregar</label>
                      <input
                        type="number"
                        min="0"
                        max={med.prescrito - med.despachado}
                        value={med.aDespachar}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setRecipeActivo({
                            ...recipeActivo,
                            medicamentos: recipeActivo.medicamentos.map((m) =>
                              m.detalleId === med.detalleId ? { ...m, aDespachar: val } : m
                            )
                          });
                        }}
                        className="w-16 p-1.5 border rounded text-center font-bold text-blue-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario de Retiro y Confirmación */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>👤</span> Identificación de la Persona que Retira
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Nombre de Quien Retira</label>
                <input
                  type="text"
                  value={personaRetira.nombre}
                  onChange={(e) => setPersonaRetira({ ...personaRetira, nombre: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Cédula de Identidad</label>
                <input
                  type="text"
                  value={personaRetira.cedula}
                  onChange={(e) => setPersonaRetira({ ...personaRetira, cedula: e.target.value })}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Parentesco con Paciente</label>
                <select
                  value={personaRetira.parentesco}
                  onChange={(e) => setPersonaRetira({ ...personaRetira, parentesco: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="TITULAR">Titular / Mismo Paciente</option>
                  <option value="HIJO_A">Hijo(a)</option>
                  <option value="CONYUGE">Cónyuge / Pareja</option>
                  <option value="MADRE_PADRE">Madre / Padre</option>
                  <option value="VECINO_COMUNITARIO">Vocero Comunal / Vecino</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Farmaceuta Despachador</label>
                <input
                  type="text"
                  value={personaRetira.farmaceuta}
                  onChange={(e) => setPersonaRetira({ ...personaRetira, farmaceuta: e.target.value })}
                  className="w-full p-2 border rounded-lg bg-slate-50"
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleDispensar}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition shadow flex items-center gap-2"
              >
                <span>✅</span> Confirmar Entrega y Descargar de Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
