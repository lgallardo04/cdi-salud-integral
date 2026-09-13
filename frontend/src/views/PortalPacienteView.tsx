import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Calendar,
  Pill,
  FlaskConical,
  Activity,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Sparkles,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const PortalPacienteView: React.FC = () => {
  const { data, addToast } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'resumen' | 'citas' | 'medicamentos' | 'examenes' | 'sintomas'>('resumen');

  // Identificar el paciente (si el usuario actual es paciente o seleccionar el primero para la simulación)
  const currentPaciente =
    data.pacientes.find((p) => p.nombres.includes(currentUser.nombreCompleto.split(' ')[0]) || p.id === currentUser.id) ||
    data.pacientes[0];


  // Citas del paciente
  const misCitas = (data.citas || []).filter(
    (c) => c.pacienteId === currentPaciente?.id || c.pacienteNombre?.includes(currentPaciente?.nombres || '')
  );

  // Tratamientos y recetas del paciente
  const misTratamientos = (data.tratamientos || []).filter(
    (t) => t.pacienteId === currentPaciente?.id || t.pacienteNombre?.includes(currentPaciente?.nombres || '')
  );

  // Órdenes de laboratorio del paciente
  const misLaboratorios = (data.ordenesLaboratorio || []).filter(
    (l) => l.pacienteId === currentPaciente?.id || l.pacienteNombre?.includes(currentPaciente?.nombres || '')
  );

  // Estudios de imagen del paciente
  const misImagenes = (data.estudiosImagen || []).filter(
    (i) => i.pacienteId === currentPaciente?.id || i.pacienteNombre?.includes(currentPaciente?.nombres || '')
  );

  // Estados del Evaluador de Síntomas
  const [sintomaSeleccionado, setSintomaSeleccionado] = useState<string>('');
  const [intensidadDolor, setIntensidadDolor] = useState<number>(3);
  const [diasEvolucion, setDiasEvolucion] = useState<number>(2);
  const [tieneFiebre, setTieneFiebre] = useState<boolean>(false);
  const [resultadoTriageAuto, setResultadoTriageAuto] = useState<{
    nivel: string;
    color: string;
    recomendacion: string;
  } | null>(null);

  const evaluarSintomas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sintomaSeleccionado) {
      addToast('Seleccione su síntoma principal', 'warning');
      return;
    }

    if (sintomaSeleccionado === 'Dolor en el Pecho / Opresión Torácica' || (sintomaSeleccionado === 'Dificultad Respiratoria Severa')) {
      setResultadoTriageAuto({
        nivel: 'Nivel 1 - Emergencia Inmediata (Código Rojo)',
        color: '#dc2626',
        recomendacion: 'Acuda de inmediato al área de Trauma Shock / Urgencias del CDI o llame al servicio de ambulancias. No conduzca usted mismo.'
      });
    } else if (intensidadDolor >= 7 || (tieneFiebre && diasEvolucion >= 3)) {
      setResultadoTriageAuto({
        nivel: 'Nivel 3 - Urgencia Médica (Atención Hoy)',
        color: '#d97706',
        recomendacion: 'Se recomienda acudir a la Consulta de Urgencias del CDI para evaluación médica presencial y toma de signos vitales.'
      });
    } else {
      setResultadoTriageAuto({
        nivel: 'Nivel 4 - Consulta Médica General / Rutinaria',
        color: '#16a34a',
        recomendacion: 'Sus síntomas no presentan signos de alarma inmediata. Puede agendar una cita médica en consulta externa y mantener reposo e hidratación.'
      });
    }
  };

  return (
    <div className="view-container">
      {/* Banner de Bienvenida al Portal del Paciente */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: 'white',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <ShieldCheck size={14} /> Portal Oficial Mi Salud CDI
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
              Bienvenido(a), {currentPaciente ? `${currentPaciente.nombres} ${currentPaciente.apellidos}` : 'Paciente'}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem' }}>
              Cédula: <strong>{currentPaciente?.cedula}</strong> | Tipo de Sangre: <strong>{currentPaciente?.tipoSangre}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}
              onClick={() => setActiveTab('sintomas')}
            >
              <HeartPulse size={16} />
              <span>Evaluador de Síntomas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas del Portal */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'resumen' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('resumen')}
        >
          <Activity size={15} />
          <span>Resumen de Salud</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'citas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('citas')}
        >
          <Calendar size={15} />
          <span>Mis Citas ({misCitas.length})</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'medicamentos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('medicamentos')}
        >
          <Pill size={15} />
          <span>Recetas y Medicamentos ({misTratamientos.length})</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'examenes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('examenes')}
        >
          <FlaskConical size={15} />
          <span>Laboratorios e Imágenes ({misLaboratorios.length + misImagenes.length})</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'sintomas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('sintomas')}
        >
          <Sparkles size={15} />
          <span>Evaluador de Síntomas</span>
        </button>
      </div>

      {/* Pestaña 1: Resumen General */}
      {activeTab === 'resumen' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* Tarjeta de Alergias y Antecedentes */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={18} style={{ color: '#dc2626' }} />
              Alergias y Condiciones Médicas
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Alergias Conocidas:</span>
                <strong style={{ color: currentPaciente?.alergias?.length ? '#dc2626' : '#16a34a' }}>
                  {currentPaciente?.alergias?.length ? currentPaciente.alergias.join(', ') : 'Ninguna alergia registrada.'}
                </strong>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Enfermedades Crónicas / Antecedentes:</span>
                <strong>{currentPaciente?.antecedentes?.length ? currentPaciente.antecedentes.join(', ') : 'Sin antecedentes crónicos.'}</strong>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Contacto de Emergencia:</span>
                <strong>{currentPaciente?.contactoEmergencia?.nombre || 'Familiar'} ({currentPaciente?.contactoEmergencia?.telefono || 'N/A'})</strong>
              </div>
            </div>
          </div>

          {/* Tarjeta de Próxima Cita */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={18} style={{ color: '#2563eb' }} />
              Próxima Cita Médica
            </h3>
            {misCitas.length > 0 ? (
              <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb' }}>
                <strong style={{ fontSize: '0.95rem', color: '#1e3a8a', display: 'block' }}>
                  {misCitas[0].departamentoNombre || 'Consulta Médica'}
                </strong>
                <div style={{ fontSize: '0.8rem', color: '#2563eb', margin: '0.25rem 0' }}>
                  Dr(a). {misCitas[0].medicoNombre}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Fecha: <strong>{misCitas[0].fecha}</strong> a las <strong>{misCitas[0].hora}</strong>
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>
                No tiene citas pendientes programadas.
              </div>
            )}
          </div>

          {/* Tarjeta de Medicación Activa */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={18} style={{ color: '#16a34a' }} />
              Tratamientos Activos
            </h3>
            {misTratamientos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {misTratamientos.map((tr) => (
                  <div key={tr.id} style={{ backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                    <strong style={{ color: '#0f172a' }}>{tr.diagnosticoCIE}</strong>
                    <div style={{ color: '#16a34a', fontWeight: 600 }}>{tr.indicacionesGenerales}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>
                No tiene tratamientos activos registrados actualmente.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pestaña 2: Mis Citas */}
      {activeTab === 'citas' && (
        <div className="card table-card">
          <div className="table-container auto-table">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Servicio / Departamento</th>
                  <th>Médico</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {misCitas.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No posee citas agendadas en el sistema.
                    </td>
                  </tr>
                ) : (
                  misCitas.map((c) => (
                    <tr key={c.id}>
                      <td className="font-mono font-bold" style={{ color: '#2563eb' }}>{c.codigoCita}</td>
                      <td><strong>{c.departamentoNombre || 'Consulta'}</strong></td>
                      <td>Dr. {c.medicoNombre}</td>
                      <td className="table-mono font-mono">{c.fecha}</td>
                      <td className="font-mono">{c.hora}</td>
                      <td style={{ fontSize: '0.8rem' }}>{c.motivoConsulta}</td>
                      <td>
                        <Badge variant={c.estado === 'Confirmada' ? 'success' : 'warning'}>{c.estado}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pestaña 3: Mis Medicamentos y Recetas */}
      {activeTab === 'medicamentos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {misTratamientos.map((tr) => (
            <div key={tr.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="font-mono font-bold" style={{ color: '#2563eb' }}>{tr.codigoTratamiento}</span>
                <Badge variant="success">{tr.estado}</Badge>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>
                {tr.diagnosticoCIE}
              </h4>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Prescrito por Dr. {tr.medicoNombre} el {tr.fechaInicio}</span>

              <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '6px', margin: '0.75rem 0', fontSize: '0.85rem' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '0.25rem' }}>Posología e Indicaciones:</strong>
                <p style={{ margin: 0, color: '#14532d' }}>{tr.indicacionesGenerales}</p>
                {tr.prescripciones && tr.prescripciones.length > 0 && (
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem' }}>
                    {tr.prescripciones.map((p, pIdx) => (
                      <li key={pIdx}>
                        <strong>{p.medicamentoNombre}</strong>: {p.dosis} ({p.frecuencia}) por {p.duracionDias} días.
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Pestaña 4: Exámenes e Informes Diagnósticos */}
      {activeTab === 'examenes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Resultados de Laboratorio Clínico
          </h3>
          <div className="card table-card">
            <div className="table-container auto-table">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Perfil Solicitado</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Bioanalista Responsable</th>
                    <th className="text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {misLaboratorios.map((lab) => (
                    <tr key={lab.id}>
                      <td className="font-mono font-bold" style={{ color: '#2563eb' }}>{lab.codigoOrden}</td>
                      <td><strong>{lab.perfil}</strong></td>
                      <td className="table-mono font-mono">{lab.fechaResultado || lab.fechaOrden}</td>
                      <td><Badge type={lab.estado === 'Validado' ? 'success' : 'warning'}>{lab.estado}</Badge></td>
                      <td style={{ fontSize: '0.85rem' }}>{lab.bioanalistaResponsable}</td>
                      <td className="text-right">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                          <Download size={14} />
                          <span>Descargar PDF</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '1rem 0 0' }}>
            Estudios de Imagenología y Radiología
          </h3>
          <div className="card table-card">
            <div className="table-container auto-table">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Modalidad</th>
                    <th>Región Anatómica</th>
                    <th>Fecha</th>
                    <th>Impresión Diagnóstica</th>
                    <th className="text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {misImagenes.map((img) => (
                    <tr key={img.id}>
                      <td className="font-mono font-bold" style={{ color: '#2563eb' }}>{img.codigoEstudio}</td>
                      <td><span className="badge badge-info">{img.modalidad}</span></td>
                      <td><strong>{img.regionAnatomica}</strong></td>
                      <td className="table-mono font-mono">{img.fechaRealizacion || img.fechaSolicitud}</td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '250px' }}>{img.impresionDiagnostica || 'En proceso de informe'}</td>
                      <td className="text-right">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                          <Download size={14} />
                          <span>Ver Informe</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pestaña 5: Evaluador Interactivo de Síntomas */}
      {activeTab === 'sintomas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} style={{ color: '#2563eb' }} />
              Evaluador de Síntomas y Orientación Clínica
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Responda estas preguntas para recibir recomendaciones clínicas inmediatas y nivel de urgencia sugerido.
            </p>

            <form onSubmit={evaluarSintomas} className="form-grid">
              <div className="form-group">
                <label className="form-label">¿Cuál es su síntoma principal hoy?</label>
                <select
                  className="input"
                  value={sintomaSeleccionado}
                  onChange={(e) => setSintomaSeleccionado(e.target.value)}
                  required
                >
                  <option value="">Seleccione síntoma...</option>
                  <option value="Fiebre y Malestar General">Fiebre y Malestar General</option>
                  <option value="Dolor en el Pecho / Opresión Torácica">Dolor en el Pecho / Opresión Torácica</option>
                  <option value="Dificultad Respiratoria Severa">Dificultad Respiratoria / Falta de Aire</option>
                  <option value="Cefalea / Dolor de Cabeza Intenso">Cefalea / Dolor de Cabeza Intenso</option>
                  <option value="Dolor Abdominal Agudo">Dolor Abdominal Agudo</option>
                  <option value="Tos y Congestión Nasal">Tos y Congestión Nasal</option>
                  <option value="Dolor Dental / Muela">Dolor Dental / Inflamación en Encía</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Intensidad del Dolor o Molestia (0 a 10): {intensidadDolor}</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={intensidadDolor}
                  onChange={(e) => setIntensidadDolor(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Días de Evolución del Síntoma</label>
                <input
                  type="number"
                  min="1"
                  className="input font-mono"
                  value={diasEvolucion}
                  onChange={(e) => setDiasEvolucion(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                <input
                  type="checkbox"
                  id="chkFiebre"
                  checked={tieneFiebre}
                  onChange={(e) => setTieneFiebre(e.target.checked)}
                />
                <label htmlFor="chkFiebre" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Presenta fiebre cuantificada mayor a 38.0 °C
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Activity size={16} />
                <span>Analizar Síntomas con Algoritmo Clínico</span>
              </button>
            </form>
          </div>

          {/* Resultado del Algoritmo */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {resultadoTriageAuto ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${resultadoTriageAuto.color}15`, color: resultadoTriageAuto.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <HeartPulse size={36} />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: resultadoTriageAuto.color, marginBottom: '0.5rem' }}>
                  {resultadoTriageAuto.nivel}
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {resultadoTriageAuto.recomendacion}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '1rem' }}>
                  * Esta herramienta es informativa y no sustituye el criterio médico directo en emergencias.
                </span>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 1rem' }}>
                <HelpCircle size={48} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>
                  Esperando selección de síntomas
                </h4>
                <p style={{ fontSize: '0.8rem' }}>Complete el formulario de la izquierda para obtener la recomendación.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
