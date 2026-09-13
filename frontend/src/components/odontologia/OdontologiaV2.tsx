import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Printer, Save, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface TratamientoV2 {
  id: number;
  pieza: number;
  diagnostico: string;
  codigo: string;
  costo: number;
}

export const OdontologiaV2: React.FC = () => {
  const { data, createItem, updateItem, addToast } = useData();
  const { currentUser } = useAuth();

  // Piezas dentales según sistema FDI
  const piezasSuperiores = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const piezasInferiores = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  // Estado del paciente
  const [pacienteNombre, setPacienteNombre] = useState<string>(
    data.pacientes[1] ? `${data.pacientes[1].nombres} ${data.pacientes[1].apellidos}` : 'Yelitza Rodríguez'
  );
  const [pacienteCedula, setPacienteCedula] = useState<string>(
    data.pacientes[1]?.cedula || 'V-15842931'
  );
  const [fechaEvaluacion, setFechaEvaluacion] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [observaciones, setObservaciones] = useState<string>(
    'Paciente acude para evaluación odontológica general preventiva. Presenta sensibilidad moderada en cuadrante superior.'
  );

  // Estado del odontograma
  const [piezaSeleccionada, setPiezaSeleccionada] = useState<number | null>(null);
  const [diagnosticoSeleccionado, setDiagnosticoSeleccionado] = useState<string>('');
  const [costoInput, setCostoInput] = useState<string>('');
  const [patologiasPiezas, setPatologiasPiezas] = useState<Record<number, string>>({
    16: 'caries',
    21: 'restauracion',
    36: 'endodoncia',
    48: 'ausente'
  });

  const [tratamientos, setTratamientos] = useState<TratamientoV2[]>([
    {
      id: 1,
      pieza: 16,
      diagnostico: 'Caries (Requiere tratamiento)',
      codigo: 'caries',
      costo: 25
    },
    {
      id: 2,
      pieza: 21,
      diagnostico: 'Restauración / Resina',
      codigo: 'restauracion',
      costo: 20
    },
    {
      id: 3,
      pieza: 36,
      diagnostico: 'Tratamiento de Conducto',
      codigo: 'endodoncia',
      costo: 45
    },
    {
      id: 4,
      pieza: 48,
      diagnostico: 'Pieza Ausente / Extracción',
      codigo: 'ausente',
      costo: 15
    }
  ]);

  // Selección de paciente desde el CDI
  const handleSelectPaciente = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pacId = e.target.value;
    const pac = data.pacientes.find((p) => p.id === pacId);
    if (pac) {
      setPacienteNombre(`${pac.nombres} ${pac.apellidos}`);
      setPacienteCedula(pac.cedula);
      addToast(`Paciente ${pac.nombres} ${pac.apellidos} cargado en Odontología`, 'info');
    }
  };

  // Click en diente
  const seleccionarDiente = (num: number) => {
    setPiezaSeleccionada(num);
  };

  // Costo sugerido según diagnóstico
  const handleDiagnosticoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDiagnosticoSeleccionado(val);
    switch (val) {
      case 'caries':
        setCostoInput('25');
        break;
      case 'restauracion':
        setCostoInput('20');
        break;
      case 'endodoncia':
        setCostoInput('45');
        break;
      case 'ausente':
        setCostoInput('15');
        break;
      case 'sano':
        setCostoInput('0');
        break;
      default:
        break;
    }
  };

  // Añadir tratamiento
  const agregarTratamiento = () => {
    if (!piezaSeleccionada || !diagnosticoSeleccionado) {
      addToast('Por favor, seleccione una pieza en el odontograma y asigne un diagnóstico.', 'warning');
      return;
    }

    const selectEl = document.getElementById('od-diagnostico') as HTMLSelectElement;
    const diagTexto = selectEl?.options[selectEl.selectedIndex]?.text || diagnosticoSeleccionado;
    const costo = parseFloat(costoInput) || 0;

    // Actualizar patología visual de la pieza
    if (diagnosticoSeleccionado === 'sano') {
      const updated = { ...patologiasPiezas };
      delete updated[piezaSeleccionada];
      setPatologiasPiezas(updated);
    } else {
      setPatologiasPiezas((prev) => ({
        ...prev,
        [piezaSeleccionada]: diagnosticoSeleccionado
      }));
    }

    // Agregar tratamiento
    const nuevo: TratamientoV2 = {
      id: Date.now(),
      pieza: piezaSeleccionada,
      diagnostico: diagTexto,
      codigo: diagnosticoSeleccionado,
      costo: costo
    };

    setTratamientos((prev) => [...prev, nuevo]);
    addToast(`Pieza ${piezaSeleccionada}: ${diagTexto} agregada al plan`, 'success');

    // Limpiar selección
    setPiezaSeleccionada(null);
    setDiagnosticoSeleccionado('');
    setCostoInput('');
  };

  // Eliminar tratamiento
  const eliminarTratamiento = (id: number) => {
    const item = tratamientos.find((t) => t.id === id);
    if (item) {
      setTratamientos((prev) => prev.filter((t) => t.id !== id));
      // Si no quedan más tratamientos para esa pieza, limpiar su estilo
      const quedanOtros = tratamientos.filter((t) => t.id !== id && t.pieza === item.pieza);
      if (quedanOtros.length === 0) {
        setPatologiasPiezas((prev) => {
          const updated = { ...prev };
          delete updated[item.pieza];
          return updated;
        });
      }
      addToast(`Procedimiento de Pieza ${item.pieza} eliminado del plan`, 'info');
    }
  };

  const totalPresupuesto = tratamientos.reduce((acc, curr) => acc + curr.costo, 0);

  // Guardar en la historia digital del CDI
  const handleGuardarHistoria = () => {
    const pac = data.pacientes.find((p) => p.cedula === pacienteCedula);
    const pacId = pac ? pac.id : (data.pacientes[0]?.id || 'p-gen');

    const defaultDientes: any = {};
    [...piezasSuperiores, ...piezasInferiores].forEach((num) => {
      const pat = patologiasPiezas[num];
      let estadoGen = 'Sano';
      if (pat === 'caries') estadoGen = 'Caries';
      else if (pat === 'restauracion') estadoGen = 'Obturacion Resina';
      else if (pat === 'endodoncia') estadoGen = 'Endodoncia';
      else if (pat === 'ausente') estadoGen = 'Ausente';

      defaultDientes[num] = {
        numeroDiente: num,
        estadoGeneral: estadoGen,
        caras: {
          oclusal: pat === 'caries' ? 'Caries' : 'Sana',
          vestibular: 'Sana',
          lingual: 'Sana',
          mesial: 'Sana',
          distal: 'Sana'
        }
      };
    });

    const planItems = tratamientos.map((t) => ({
      id: `td-${t.id}`,
      dienteNumero: t.pieza,
      procedimiento: t.diagnostico,
      costoEstimadoUSD: t.costo,
      estado: 'Planificado' as const
    }));

    const existente = data.odontogramas?.find((o) => o.pacienteId === pacId);
    if (existente) {
      updateItem('odontogramas', existente.id, {
        pacienteNombre,
        pacienteCedula,
        fechaEvaluacion,
        dientes: defaultDientes,
        planTratamiento: planItems,
        diagnosticoPeriodontal: observaciones
      });
      addToast(`Historia clínica odontológica de ${pacienteNombre} actualizada con éxito`, 'success');
    } else {
      createItem('odontogramas', {
        id: `odo-${Date.now()}`,
        pacienteId: pacId,
        pacienteNombre,
        pacienteCedula,
        odontologoId: 'emp-9',
        odontologoNombre: 'Dra. Valeria Fuentes (Odontóloga Integral CDI)',
        fechaEvaluacion,
        dientes: defaultDientes,
        indiceHigieneOral: 'Bueno',
        diagnosticoPeriodontal: observaciones,
        planTratamiento: planItems,
        estado: 'Activo'
      });
      addToast(`Historia clínica odontológica registrada para ${pacienteNombre}`, 'success');
    }
  };

  // Exposición de API Pública en window para interoperabilidad
  useEffect(() => {
    (window as any).OdontogramaAPI = {
      obtenerDatos: function () {
        return {
          paciente: (document.getElementById('od-paciente') as HTMLInputElement)?.value || pacienteNombre,
          cedula: (document.getElementById('od-cedula') as HTMLInputElement)?.value || pacienteCedula,
          fecha: (document.getElementById('od-fecha') as HTMLInputElement)?.value || fechaEvaluacion,
          observaciones: (document.getElementById('od-observaciones') as HTMLTextAreaElement)?.value || observaciones,
          tratamientos: tratamientos,
          totalPresupuesto: tratamientos.reduce((acc, curr) => acc + curr.costo, 0)
        };
      }
    };

    return () => {
      delete (window as any).OdontogramaAPI;
    };
  }, [pacienteNombre, pacienteCedula, fechaEvaluacion, observaciones, tratamientos]);

  return (
    <div id="modulo-dental-v2">
      <style>{`
        /* ==========================================================================
           CDI CLINICAL PRECISION - MÓDULO ODONTOLOGÍA V2 (STITCH THEME)
           ========================================================================== */
        #modulo-dental-v2 {
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --navy: #0f172a;
          --surface: #ffffff;
          --background: #f8fafc;
          --surface-container-low: #f1f5f9;
          --border: #e2e8f0;
          --border-strong: #cbd5e1;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --danger: #dc2626;
          --danger-bg: #fef2f2;
          --warning: #d97706;
          --warning-bg: #fffbeb;
          --success: #16a34a;
          --success-bg: #f0fdf4;
          --teal: #0d9488;
          --radius: 8px;
          --radius-sm: 6px;
          --radius-full: 9999px;
          --shadow-subtle: 0 4px 12px rgba(15, 23, 42, 0.06);
          
          font-family: var(--font-sans, 'Inter', system-ui, -apple-system, sans-serif);
          max-width: 100%;
          margin: 0 auto;
          padding: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-subtle);
          color: var(--text-main);
        }
        #modulo-dental-v2 * { box-sizing: border-box; }
        
        /* Layout y Formularios */
        #modulo-dental-v2 h2 {
          margin: 0 0 6px;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--navy);
          letter-spacing: -0.01em;
        }
        #modulo-dental-v2 .grid-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        #modulo-dental-v2 .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        #modulo-dental-v2 label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        #modulo-dental-v2 input,
        #modulo-dental-v2 select,
        #modulo-dental-v2 textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--border-strong);
          border-radius: var(--radius-sm);
          font-size: 14px;
          background: #ffffff;
          color: var(--text-main);
          transition: all 0.2s ease;
        }
        #modulo-dental-v2 input:focus,
        #modulo-dental-v2 select:focus,
        #modulo-dental-v2 textarea:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        #modulo-dental-v2 textarea {
          resize: vertical;
          min-height: 85px;
          line-height: 1.5;
        }

        /* Odontograma Flex Layout */
        #modulo-dental-v2 .odontograma-container {
          background: var(--background);
          padding: 20px 16px;
          border-radius: var(--radius);
          margin-bottom: 24px;
          border: 1px solid var(--border);
        }
        #modulo-dental-v2 .arcada-title {
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin: 14px 0 10px;
        }
        #modulo-dental-v2 .arcada-grid {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        /* Botones Diente */
        #modulo-dental-v2 .tooth-card {
          width: 44px;
          height: 58px;
          background: var(--surface);
          border: 1.5px solid var(--border-strong);
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-evenly;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          transition: all 0.18s ease;
          user-select: none;
        }
        #modulo-dental-v2 .tooth-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.12);
        }
        #modulo-dental-v2 .tooth-card.active {
          border-color: var(--primary);
          background: #eff6ff;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.22);
          transform: translateY(-2px);
        }
        #modulo-dental-v2 .tooth-icon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #94a3b8;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        /* Patologías Clínicas (Semántica Stitch) */
        #modulo-dental-v2 .path-caries {
          border-color: #dc2626;
          background: #fef2f2;
          color: #b91c1c;
        }
        #modulo-dental-v2 .path-caries .tooth-icon {
          background: #dc2626;
          border-color: #991b1b;
        }
        #modulo-dental-v2 .path-restauracion {
          border-color: #2563eb;
          background: #eff6ff;
          color: #1d4ed8;
        }
        #modulo-dental-v2 .path-restauracion .tooth-icon {
          background: #2563eb;
          border-color: #1e40af;
        }
        #modulo-dental-v2 .path-endodoncia {
          border-color: #d97706;
          background: #fffbeb;
          color: #b45309;
        }
        #modulo-dental-v2 .path-endodoncia .tooth-icon {
          background: #d97706;
          border-color: #92400e;
        }
        #modulo-dental-v2 .path-ausente {
          opacity: 0.6;
          border-style: dashed;
          border-color: #94a3b8;
          background: #f1f5f9;
        }
        #modulo-dental-v2 .path-ausente .tooth-icon {
          background: #cbd5e1;
          border-color: #94a3b8;
        }

        /* Leyenda de Patologías */
        #modulo-dental-v2 .pathology-legend {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 8px 12px;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          margin-top: 14px;
        }
        #modulo-dental-v2 .legend-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.02em;
        }
        #modulo-dental-v2 .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        /* Panel de Acción y Controles */
        #modulo-dental-v2 .action-panel {
          display: grid;
          grid-template-columns: 100px 1fr 140px auto;
          gap: 12px;
          align-items: end;
          margin-bottom: 24px;
          background: #f8fafc;
          padding: 16px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
        }
        #modulo-dental-v2 .btn-primary {
          background: var(--primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 42px;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
        }
        #modulo-dental-v2 .btn-primary:hover {
          background: var(--primary-hover);
          box-shadow: 0 4px 10px rgba(37, 99, 235, 0.28);
        }
        
        /* Tabla Clínica */
        #modulo-dental-v2 .table-responsive {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: #ffffff;
        }
        #modulo-dental-v2 table {
          width: 100%;
          border-collapse: collapse;
          min-width: 580px;
        }
        #modulo-dental-v2 th, #modulo-dental-v2 td {
          text-align: left;
          padding: 11px 16px;
          border-bottom: 1px solid var(--border);
        }
        #modulo-dental-v2 th {
          background: var(--background);
          color: #475569;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        #modulo-dental-v2 tbody tr:hover {
          background: #f8fafc;
        }
        #modulo-dental-v2 .price-cell {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-weight: 600;
          color: var(--navy);
        }
        #modulo-dental-v2 .btn-delete {
          background: #fef2f2;
          color: var(--danger);
          border: 1px solid #fecaca;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.15s ease;
        }
        #modulo-dental-v2 .btn-delete:hover {
          background: #fee2e2;
          border-color: #f87171;
        }
        
        /* Footer de Resumen */
        #modulo-dental-v2 .summary-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px dashed var(--border);
        }
        #modulo-dental-v2 .total-amount {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 1.55rem;
          font-weight: 800;
          color: var(--navy);
          letter-spacing: -0.02em;
        }

        /* Adaptación Responsiva Mobile/Tablet */
        @media (max-width: 768px) {
          #modulo-dental-v2 { padding: 16px; margin: 0 auto; }
          #modulo-dental-v2 .action-panel { grid-template-columns: 1fr 1fr; }
          #modulo-dental-v2 .action-panel button { grid-column: 1 / -1; }
          #modulo-dental-v2 .arcada-grid { gap: 4px; }
          #modulo-dental-v2 .tooth-card { width: 38px; height: 52px; font-size: 12px; }
        }
        @media (max-width: 520px) {
          #modulo-dental-v2 .action-panel { grid-template-columns: 1fr; }
          #modulo-dental-v2 .summary-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
          #modulo-dental-v2 .tooth-card { width: 34px; height: 48px; font-size: 11px; }
          #modulo-dental-v2 .tooth-icon { width: 14px; height: 14px; }
        }
      `}</style>

      {/* Barra de Cabecera con sincronización CDI */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h2>Historia Clínica Odontológica</h2>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Centro de Diagnóstico Integral (CDI) • Sistema Estomatológico Comunitario
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleGuardarHistoria}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#16a34a',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
            }}
          >
            <Save size={15} />
            <span>Guardar en Historia Digital</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)'
            }}
          >
            <Printer size={15} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Selector rápido de paciente registrado */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Vincular Paciente del CDI:
        </span>
        <select
          onChange={handleSelectPaciente}
          style={{ maxWidth: '380px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }}
          defaultValue=""
        >
          <option value="" disabled>Seleccione un paciente de la base de datos...</option>
          {data.pacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.cedula} - {p.nombres} {p.apellidos} ({p.edad} años)
            </option>
          ))}
        </select>
      </div>

      <div className="grid-form">
        <div className="form-group">
          <label>Paciente</label>
          <input
            type="text"
            id="od-paciente"
            placeholder="Nombre completo"
            value={pacienteNombre}
            onChange={(e) => setPacienteNombre(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Documento de Identidad</label>
          <input
            type="text"
            id="od-cedula"
            placeholder="V- / E-"
            value={pacienteCedula}
            onChange={(e) => setPacienteCedula(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Fecha de Evaluación</label>
          <input
            type="date"
            id="od-fecha"
            value={fechaEvaluacion}
            onChange={(e) => setFechaEvaluacion(e.target.value)}
          />
        </div>
      </div>

      <div className="odontograma-container">
        <div className="arcada-title">Arcada Superior</div>
        <div className="arcada-grid" id="od-arcada-sup">
          {piezasSuperiores.map((num) => {
            const pat = patologiasPiezas[num];
            const isActive = piezaSeleccionada === num;
            const classes = `tooth-card ${isActive ? 'active' : ''} ${pat ? `path-${pat}` : ''}`.trim();

            return (
              <div
                key={num}
                className={classes}
                data-diente={num}
                onClick={() => seleccionarDiente(num)}
                title={`Pieza ${num} ${pat ? `- Patología: ${pat}` : '- Sana'}`}
              >
                <div className="tooth-icon"></div>
                <div>{num}</div>
              </div>
            );
          })}
        </div>

        <div className="arcada-title">Arcada Inferior</div>
        <div className="arcada-grid" id="od-arcada-inf">
          {piezasInferiores.map((num) => {
            const pat = patologiasPiezas[num];
            const isActive = piezaSeleccionada === num;
            const classes = `tooth-card ${isActive ? 'active' : ''} ${pat ? `path-${pat}` : ''}`.trim();

            return (
              <div
                key={num}
                className={classes}
                data-diente={num}
                onClick={() => seleccionarDiente(num)}
                title={`Pieza ${num} ${pat ? `- Patología: ${pat}` : '- Sana'}`}
              >
                <div className="tooth-icon"></div>
                <div>{num}</div>
              </div>
            );
          })}
        </div>

        {/* Leyenda de Patologías Clínicas Stitch */}
        <div className="pathology-legend">
          <span className="legend-pill">
            <span className="legend-dot" style={{ background: '#16a34a' }}></span>
            Sano
          </span>
          <span className="legend-pill">
            <span className="legend-dot" style={{ background: '#dc2626' }}></span>
            Caries
          </span>
          <span className="legend-pill">
            <span className="legend-dot" style={{ background: '#2563eb' }}></span>
            Restauración
          </span>
          <span className="legend-pill">
            <span className="legend-dot" style={{ background: '#d97706' }}></span>
            Endodoncia
          </span>
          <span className="legend-pill">
            <span className="legend-dot" style={{ background: '#94a3b8', border: '1px dashed #64748b' }}></span>
            Ausente
          </span>
        </div>
      </div>

      <div className="action-panel">
        <div className="form-group">
          <label>Pieza</label>
          <input
            type="text"
            id="od-pieza-input"
            placeholder="Ej: 18"
            value={piezaSeleccionada !== null ? piezaSeleccionada : ''}
            readOnly
            style={{ background: '#f1f5f9', textAlign: 'center', fontWeight: 'bold', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
          />
        </div>
        <div className="form-group">
          <label>Diagnóstico / Procedimiento</label>
          <select
            id="od-diagnostico"
            value={diagnosticoSeleccionado}
            onChange={handleDiagnosticoChange}
          >
            <option value="">Seleccione...</option>
            <option value="caries">Caries (Requiere tratamiento)</option>
            <option value="restauracion">Restauración / Resina</option>
            <option value="endodoncia">Tratamiento de Conducto</option>
            <option value="ausente">Pieza Ausente / Extracción</option>
            <option value="sano">Diente Sano</option>
          </select>
        </div>
        <div className="form-group">
          <label>Costo (USD)</label>
          <input
            type="number"
            id="od-costo"
            placeholder="0.00"
            min="0"
            step="1"
            value={costoInput}
            onChange={(e) => setCostoInput(e.target.value)}
            style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}
          />
        </div>
        <button
          type="button"
          className="btn-primary"
          id="od-btn-agregar"
          onClick={agregarTratamiento}
        >
          Añadir al Plan
        </button>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Pieza</th>
              <th>Procedimiento Médico</th>
              <th>Costo Unit.</th>
              <th style={{ textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>
          <tbody id="od-tabla-body">
            {tratamientos.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>
                  No hay tratamientos registrados.
                </td>
              </tr>
            ) : (
              tratamientos.map((item) => (
                <tr key={item.id}>
                  <td className="price-cell">Pieza {item.pieza}</td>
                  <td>{item.diagnostico}</td>
                  <td className="price-cell">${item.costo.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-delete"
                      data-id={item.id}
                      onClick={() => eliminarTratamiento(item.id)}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="grid-form" style={{ marginTop: '24px' }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Observaciones Generales</label>
          <textarea
            id="od-observaciones"
            placeholder="Alergias, notas médicas, condiciones previas..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="summary-footer">
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Elaborado mediante Sistema Automatizado CDI
        </div>
        <div>
          Total Presupuesto: <span className="total-amount" id="od-total">${totalPresupuesto.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
