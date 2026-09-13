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
        /* Uso de Variables CSS para fácil tematización */
        #modulo-dental-v2 {
          --primary: #0284c7;
          --primary-hover: #0369a1;
          --surface: #ffffff;
          --background: #f8fafc;
          --border: #cbd5e1;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --danger: #ef4444;
          --radius: 8px;
          
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 1000px;
          margin: 20px auto;
          padding: 24px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          color: var(--text-main);
        }
        #modulo-dental-v2 * { box-sizing: border-box; }
        
        /* Layout y Formularios */
        #modulo-dental-v2 h2 { margin: 0 0 20px; font-size: 1.5rem; border-bottom: 2px solid var(--background); padding-bottom: 10px; }
        #modulo-dental-v2 .grid-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
        #modulo-dental-v2 .form-group { display: flex; flex-direction: column; gap: 6px; }
        #modulo-dental-v2 label { font-size: 13px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        #modulo-dental-v2 input, #modulo-dental-v2 select, #modulo-dental-v2 textarea {
          width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius); font-size: 14px; transition: border 0.2s;
        }
        #modulo-dental-v2 input:focus, #modulo-dental-v2 select:focus, #modulo-dental-v2 textarea:focus {
          border-color: var(--primary); outline: none; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
        }
        #modulo-dental-v2 textarea { resize: vertical; min-height: 80px; }

        /* Odontograma Flex Layout */
        #modulo-dental-v2 .odontograma-container { background: var(--background); padding: 20px; border-radius: var(--radius); margin-bottom: 24px; border: 1px solid var(--border); }
        #modulo-dental-v2 .arcada-title { text-align: center; font-size: 14px; font-weight: bold; color: var(--text-muted); margin: 15px 0 10px; }
        #modulo-dental-v2 .arcada-grid { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; }
        
        /* Botones Diente */
        #modulo-dental-v2 .tooth-card {
          width: 44px; height: 56px; background: var(--surface); border: 2px solid var(--border);
          border-radius: 6px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly;
          font-size: 12px; font-weight: bold; color: var(--text-main); transition: all 0.2s ease;
        }
        #modulo-dental-v2 .tooth-card:hover { transform: translateY(-2px); border-color: var(--primary); }
        #modulo-dental-v2 .tooth-card.active { border-color: var(--primary); background: #e0f2fe; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.2); }
        #modulo-dental-v2 .tooth-icon { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #94a3b8; }

        /* Patologías */
        #modulo-dental-v2 .path-caries { border-color: #ef4444; background: #fef2f2; }
        #modulo-dental-v2 .path-caries .tooth-icon { background: #ef4444; border-color: #dc2626; }
        #modulo-dental-v2 .path-restauracion { border-color: #3b82f6; background: #eff6ff; }
        #modulo-dental-v2 .path-restauracion .tooth-icon { background: #3b82f6; border-color: #2563eb; }
        #modulo-dental-v2 .path-endodoncia { border-color: #f59e0b; background: #fffbeb; }
        #modulo-dental-v2 .path-endodoncia .tooth-icon { background: #f59e0b; border-color: #d97706; }
        #modulo-dental-v2 .path-ausente { opacity: 0.5; border-style: dashed; }
        #modulo-dental-v2 .path-ausente .tooth-icon { background: #cbd5e1; border-color: #94a3b8; }

        /* Controles y Tabla */
        #modulo-dental-v2 .action-panel { display: grid; grid-template-columns: 1fr 2fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 24px; }
        #modulo-dental-v2 .btn-primary { background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: var(--radius); font-weight: 600; cursor: pointer; transition: 0.2s; height: 42px;}
        #modulo-dental-v2 .btn-primary:hover { background: var(--primary-hover); }
        
        #modulo-dental-v2 .table-responsive { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); }
        #modulo-dental-v2 table { width: 100%; border-collapse: collapse; min-width: 600px; }
        #modulo-dental-v2 th, #modulo-dental-v2 td { text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--border); }
        #modulo-dental-v2 th { background: var(--background); color: var(--text-muted); font-size: 13px; text-transform: uppercase; }
        #modulo-dental-v2 tbody tr:hover { background: #f8fafc; }
        
        #modulo-dental-v2 .btn-delete { background: #fee2e2; color: var(--danger); border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        #modulo-dental-v2 .btn-delete:hover { background: #fca5a5; }
        
        #modulo-dental-v2 .summary-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 2px dashed var(--border); }
        #modulo-dental-v2 .total-amount { font-size: 1.5rem; font-weight: 800; color: var(--primary); }

        /* Adaptación Responsiva para Pantallas Pequeñas */
        @media (max-width: 768px) {
          #modulo-dental-v2 { padding: 16px; margin: 10px auto; }
          #modulo-dental-v2 .action-panel { grid-template-columns: 1fr 1fr; }
          #modulo-dental-v2 .action-panel button { grid-column: 1 / -1; }
        }
        @media (max-width: 520px) {
          #modulo-dental-v2 .action-panel { grid-template-columns: 1fr; }
          #modulo-dental-v2 .summary-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
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
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#059669' }}
          >
            <Save size={16} />
            <span>Guardar en Historia Digital</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#475569' }}
          >
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Selector rápido de paciente registrado */}
      <div style={{ backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
          Vincular Paciente del CDI:
        </span>
        <select
          onChange={handleSelectPaciente}
          style={{ maxWidth: '380px', background: '#ffffff' }}
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
            style={{ background: '#f1f5f9', textAlign: 'center', fontWeight: 'bold' }}
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
                  <td style={{ fontWeight: 'bold' }}>Pieza {item.pieza}</td>
                  <td>{item.diagnostico}</td>
                  <td>${item.costo.toFixed(2)}</td>
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
