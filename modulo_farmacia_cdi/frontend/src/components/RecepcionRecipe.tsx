import React, { useState } from 'react';

interface ItemMedicamento {
  id: string;
  articuloId: string;
  nombre: string;
  posologia: string;
  duracionDias: number;
  cantidad: number;
}

export const RecepcionRecipe: React.FC = () => {
  const [recipeHeader, setRecipeHeader] = useState({
    numeroRecipe: `REC-${Date.now().toString().slice(-6)}`,
    tipoDocumento: 'V',
    cedula: '15842931',
    nombrePaciente: 'Yelitza Rodríguez',
    servicioEmisor: 'OFTALMOLOGIA',
    medicoTratante: 'Dra. María Elena Ramos',
    matriculaMpps: 'MPPS-78432',
    diagnostico: 'Glaucoma primario ángulo abierto',
    fechaEmision: new Date().toISOString().split('T')[0]
  });

  const [catalogoMedicamentos] = useState([
    { id: 'bbbb1111-0000-0000-0000-000000000001', nombre: 'Timolol Maleato 0.5% (Colirio Oftálmico)' },
    { id: 'bbbb1111-0000-0000-0000-000000000002', nombre: 'Tobramicina + Dexametasona 0.3%/0.1% (Colirio)' },
    { id: 'bbbb1111-0000-0000-0000-000000000003', nombre: 'Amoxicilina + Ácido Clavulánico 500/125mg' },
    { id: 'bbbb1111-0000-0000-0000-000000000004', nombre: 'Losartán Potásico 50mg' },
    { id: 'bbbb1111-0000-0000-0000-000000000005', nombre: 'Paracetamol 500mg' }
  ]);

  const [itemsPrescritos, setItemsPrescritos] = useState<ItemMedicamento[]>([
    {
      id: 'item-1',
      articuloId: 'bbbb1111-0000-0000-0000-000000000001',
      nombre: 'Timolol Maleato 0.5% (Colirio Oftálmico)',
      posologia: '1 gota en ojo derecho cada 12 horas',
      duracionDias: 30,
      cantidad: 1
    }
  ]);

  const [nuevoItem, setNuevoItem] = useState({
    articuloId: catalogoMedicamentos[0].id,
    posologia: '',
    duracionDias: 7,
    cantidad: 1
  });

  const agregarMedicamento = () => {
    const med = catalogoMedicamentos.find((m) => m.id === nuevoItem.articuloId);
    if (!med || !nuevoItem.posologia) return;

    setItemsPrescritos([
      ...itemsPrescritos,
      {
        id: `item-${Date.now()}`,
        articuloId: med.id,
        nombre: med.nombre,
        posologia: nuevoItem.posologia,
        duracionDias: nuevoItem.duracionDias,
        cantidad: nuevoItem.cantidad
      }
    ]);

    setNuevoItem({ ...nuevoItem, posologia: '', cantidad: 1 });
  };

  const eliminarItem = (id: string) => {
    setItemsPrescritos(itemsPrescritos.filter((i) => i.id !== id));
  };

  const handleGuardarRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsPrescritos.length === 0) {
      alert('Debe incluir al menos un medicamento prescrito en el récipe.');
      return;
    }
    alert(`Récipe médico ${recipeHeader.numeroRecipe} recibido e ingresado a cola de dispensación.`);
  };

  return (
    <div className="p-6 bg-slate-50 max-w-4xl mx-auto min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Recepción y Radicación de Récipes Médicos
        </h1>
        <p className="text-xs text-slate-500">
          Recepción interdepartamental de prescripciones (Oftalmología, Medicina General, Sala de Urgencias)
        </p>
      </header>

      <form onSubmit={handleGuardarRecipe} className="space-y-6">
        {/* Cabecera del Récipe */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>📋</span> Datos de la Prescripción y Médico Tratante
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Nº Récipe / Orden</label>
              <input
                type="text"
                required
                value={recipeHeader.numeroRecipe}
                onChange={(e) => setRecipeHeader({ ...recipeHeader, numeroRecipe: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono font-bold text-blue-700"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Servicio Emisor</label>
              <select
                value={recipeHeader.servicioEmisor}
                onChange={(e) => setRecipeHeader({ ...recipeHeader, servicioEmisor: e.target.value })}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="OFTALMOLOGIA">Oftalmología (Misión Milagro / CDI)</option>
                <option value="MEDICINA_GENERAL">Medicina General Integral</option>
                <option value="URGENCIAS_TERAPIA">Urgencias / Terapia Intensiva</option>
                <option value="ODONTOLOGIA">Odontología</option>
                <option value="TRAUMATOLOGIA">Traumatología / Fisiatría (SRI)</option>
                <option value="PEDIATRIA">Pediatría</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Fecha Emisión</label>
              <input
                type="date"
                required
                value={recipeHeader.fechaEmision}
                onChange={(e) => setRecipeHeader({ ...recipeHeader, fechaEmision: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Médico Prescriptor</label>
              <input
                type="text"
                required
                value={recipeHeader.medicoTratante}
                onChange={(e) => setRecipeHeader({ ...recipeHeader, medicoTratante: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Matrícula Sanitaria (MPPS)</label>
              <input
                type="text"
                required
                value={recipeHeader.matriculaMpps}
                onChange={(e) => setRecipeHeader({ ...recipeHeader, matriculaMpps: e.target.value })}
                className="w-full p-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Cédula del Paciente</label>
              <div className="flex gap-1">
                <span className="p-2 border rounded-l-lg bg-slate-100 font-bold">V-</span>
                <input
                  type="text"
                  required
                  value={recipeHeader.cedula}
                  onChange={(e) => setRecipeHeader({ ...recipeHeader, cedula: e.target.value })}
                  className="w-full p-2 border rounded-r-lg font-mono"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-600 mb-1">Nombre Completo del Paciente</label>
              <input
                type="text"
                required
                value={recipeHeader.nombrePaciente}
                onChange={(e) => setRecipeHeader({ ...recipeHeader, nombrePaciente: e.target.value })}
                className="w-full p-2 border rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-medium text-slate-600 mb-1">Diagnóstico Clínico</label>
            <input
              type="text"
              required
              value={recipeHeader.diagnostico}
              onChange={(e) => setRecipeHeader({ ...recipeHeader, diagnostico: e.target.value })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Medicamentos Prescritos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>💊</span> Medicamentos e Indicaciones
          </h2>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-600 mb-1">Medicamento</label>
              <select
                value={nuevoItem.articuloId}
                onChange={(e) => setNuevoItem({ ...nuevoItem, articuloId: e.target.value })}
                className="w-full p-2 border rounded bg-white"
              >
                {catalogoMedicamentos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 mb-1">Posología / Dosis</label>
              <input
                type="text"
                placeholder="Ej. 1 gota c/8h"
                value={nuevoItem.posologia}
                onChange={(e) => setNuevoItem({ ...nuevoItem, posologia: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-slate-600 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={nuevoItem.cantidad}
                  onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <button
                type="button"
                onClick={agregarMedicamento}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium"
              >
                + Añadir
              </button>
            </div>
          </div>

          {/* Lista de medicamentos añadidos */}
          <div className="divide-y divide-slate-100 text-xs">
            {itemsPrescritos.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.nombre}</p>
                  <p className="text-slate-500">
                    Posología: <span className="text-slate-800">{item.posologia}</span> • Tratamiento: {item.duracionDias} días
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                    {item.cantidad} frasco(s)/caja(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminarItem(item.id)}
                    className="text-rose-600 hover:text-rose-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition shadow"
          >
            Radicar Récipe en Farmacia
          </button>
        </div>
      </form>
    </div>
  );
};
