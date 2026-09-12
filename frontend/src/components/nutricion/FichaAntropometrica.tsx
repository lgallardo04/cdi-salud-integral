import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';

export const FichaAntropometrica: React.FC = () => {
  const { data, createItem, addToast } = useData();
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(data.pacientes[0]?.id || '');
  
  const pacienteSeleccionado = data.pacientes.find((p) => p.id === selectedPacienteId) || {
    id: 'pac-1',
    nombres: 'Yelitza',
    apellidos: 'Rodríguez',
    cedula: 'V-15842931',
    edad: 44,
    genero: 'Femenino'
  };

  const [peso, setPeso] = useState<number | ''>(68.5);
  const [talla, setTalla] = useState<number | ''>(162); // cm
  const [circunferenciaBrazo, setCircunferenciaBrazo] = useState<number | ''>(28);
  const [circunferenciaCintura, setCircunferenciaCintura] = useState<number | ''>(84);
  const [observaciones, setObservaciones] = useState<string>('');

  // Cálculo en tiempo real de IMC y clasificación nutricional
  const evaluacion = useMemo(() => {
    if (!peso || !talla || peso <= 0 || talla <= 0) {
      return null;
    }
    const tallaM = Number(talla) / 100;
    const imc = parseFloat((Number(peso) / (tallaM * tallaM)).toFixed(2));

    let clasificacion = '';
    let colorBadge = '';
    let recomendacionBase = '';

    if (imc < 18.5) {
      clasificacion = 'Bajo Peso (Déficit Nutricional)';
      colorBadge = 'bg-amber-100 text-amber-800 border-amber-300';
      recomendacionBase = 'Priorizar plan hipercalórico e hiperproteico con suplementación de micronutrientes.';
    } else if (imc < 25.0) {
      clasificacion = 'Normopeso (Adecuado)';
      colorBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      recomendacionBase = 'Mantener dieta balanceada rica en fibra y actividad física regular.';
    } else if (imc < 30.0) {
      clasificacion = 'Sobrepeso (Pre-obesidad)';
      colorBadge = 'bg-amber-100 text-amber-800 border-amber-300';
      recomendacionBase = 'Control de porciones de carbohidratos simples y reestructuración de horarios.';
    } else if (imc < 35.0) {
      clasificacion = 'Obesidad Grado I';
      colorBadge = 'bg-rose-100 text-rose-800 border-rose-300';
      recomendacionBase = 'Intervención nutricional estricta y descarte de comorbilidades (diabetes, HTA).';
    } else {
      clasificacion = 'Obesidad Grado II / III (Severa)';
      colorBadge = 'bg-red-200 text-red-900 border-red-400';
      recomendacionBase = 'Manejo multidisciplinario con Medicina Interna del CDI.';
    }

    return { imc, clasificacion, colorBadge, recomendacionBase };
  }, [peso, talla]);

  return (
    <div className="p-6 bg-slate-50 max-w-4xl mx-auto rounded-2xl border border-slate-200 shadow-sm mt-4">
      <div className="border-b border-slate-200 pb-4 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Historia Clínica Nutricional y Antropometría
          </h2>
          <p className="text-xs text-slate-500">
            Protocolo de Evaluación Nutricional INN / CDI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Paciente:</label>
          <select
            value={selectedPacienteId}
            onChange={(e) => setSelectedPacienteId(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium bg-white"
          >
            {data.pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombres} {p.apellidos} ({p.cedula})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Parámetros de Medición */}
        <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <span>⚖️</span> Mediciones Físicas
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Peso Actual (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ej. 65.4"
                className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Talla / Altura (cm) *
              </label>
              <input
                type="number"
                step="0.5"
                value={talla}
                onChange={(e) => setTalla(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ej. 165"
                className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Circunferencia Cintura (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={circunferenciaCintura}
                onChange={(e) => setCircunferenciaCintura(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ej. 82.0"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Circunf. Brazo (MUAC - cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={circunferenciaBrazo}
                onChange={(e) => setCircunferenciaBrazo(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Pediatría / Gestante"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Observaciones Clínicas y Hábitos
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Signos carenciales (uñas, cabello, palidez), consumo de agua, intolerancias..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Diagnóstico Antropométrico en Vivo */}
        <div className="flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Índice de Masa Corporal (IMC)
              </span>
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                Estándar OMS / INN
              </span>
            </div>

            {evaluacion ? (
              <div className="space-y-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-extrabold text-emerald-400">
                    {evaluacion.imc}
                  </span>
                  <span className="text-slate-400 text-sm">kg/m²</span>
                </div>

                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${evaluacion.colorBadge}`}>
                    {evaluacion.clasificacion}
                  </span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 text-xs text-slate-300">
                  <strong className="text-white block mb-1">Orientación Terapéutica:</strong>
                  {evaluacion.recomendacionBase}
                </div>

                {/* Barra de progreso de IMC */}
                <div className="mt-4">
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden flex">
                    <div className="w-[18.5%] bg-amber-400" title="Bajo Peso (<18.5)" />
                    <div className="w-[25%] bg-emerald-500" title="Normal (18.5 - 24.9)" />
                    <div className="w-[25%] bg-amber-500" title="Sobrepeso (25 - 29.9)" />
                    <div className="w-[31.5%] bg-rose-500" title="Obesidad (>=30)" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>16</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40+</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">
                Ingrese el peso y la talla para obtener el cálculo antropométrico automático.
              </p>
            )}
          </div>

          <button
            type="button"
            className="w-full mt-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-lg text-sm text-slate-950 transition shadow"
            onClick={() => {
              if (!evaluacion) {
                addToast('Ingrese peso y talla válidos antes de guardar', 'warning');
                return;
              }
              createItem('evaluacionesNutricionales', {
                pacienteId: pacienteSeleccionado.id,
                pacienteNombre: `${pacienteSeleccionado.nombres} ${pacienteSeleccionado.apellidos}`,
                pacienteCedula: pacienteSeleccionado.cedula,
                fecha: new Date().toISOString().substring(0, 10),
                pesoKg: Number(peso),
                tallaCm: Number(talla),
                imc: evaluacion.imc,
                circunferenciaBrazoCm: circunferenciaBrazo ? Number(circunferenciaBrazo) : undefined,
                circunferenciaCinturaCm: circunferenciaCintura ? Number(circunferenciaCintura) : undefined,
                clasificacion: evaluacion.clasificacion,
                recomendacion: evaluacion.recomendacionBase,
                evaluador: 'Lic. Carmen Briceño (Nutricionista CDI)'
              });
              addToast(`Evaluación antropométrica (IMC ${evaluacion.imc}) guardada en historia clínica`, 'success');
            }}
          >
            Guardar Evaluación en Historia
          </button>
        </div>
      </div>
    </div>
  );
};
