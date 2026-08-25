import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RegistroTriaje } from '../types';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  HeartPulse,
  Activity,
  Clock,
  UserCheck,
  Zap,
  ShieldAlert,
  ArrowRight,
  Printer,
  Edit,
  Trash2,
  Bed,
  CheckCircle2
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const TriajeView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterNivel, setFilterNivel] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroTriaje | null>(null);

  // Formulario Triaje con Calculadora NEWS2
  const [formData, setFormData] = useState({
    codigoTriaje: '',
    pacienteId: '',
    motivoUrgencia: '',
    enfermeroTriaje: 'Lic. Patricia Silva',
    pas: 120,
    pad: 80,
    fc: 78,
    fr: 16,
    spo2: 98,
    oxigenoSuplementario: false,
    temperatura: 36.6,
    escalaAVPU: 'Alerta (A)' as 'Alerta (A)' | 'Voz (V)' | 'Dolor (P)' | 'Inconsciente (U)',
    escalaDolorEva: 3,
    destinoRecomendado: 'Consulta de Urgencias' as any,
    nivelTriaje: 'Nivel 3 - Urgencia (Amarillo)' as any,
    estado: 'En Espera' as any
  });

  const canCreate = hasPermission('triaje', 'crear');
  const canEdit = hasPermission('triaje', 'editar');
  const canDelete = hasPermission('triaje', 'eliminar');

  // Algoritmo de Cálculo NEWS2 (National Early Warning Score)
  const calculateNEWS2 = () => {
    let score = 0;

    // 1. Frecuencia Respiratoria (rpm)
    const fr = Number(formData.fr);
    if (fr <= 8) score += 3;
    else if (fr >= 9 && fr <= 11) score += 1;
    else if (fr >= 12 && fr <= 20) score += 0;
    else if (fr >= 21 && fr <= 24) score += 2;
    else if (fr >= 25) score += 3;

    // 2. Saturación de Oxígeno (SpO2 %)
    const spo2 = Number(formData.spo2);
    if (spo2 <= 91) score += 3;
    else if (spo2 >= 92 && spo2 <= 93) score += 2;
    else if (spo2 >= 94 && spo2 <= 95) score += 1;
    else if (spo2 >= 96) score += 0;

    // 3. Oxígeno Suplementario
    if (formData.oxigenoSuplementario) score += 2;

    // 4. Presión Arterial Sistólica (PAS mmHg)
    const pas = Number(formData.pas);
    if (pas <= 90) score += 3;
    else if (pas >= 91 && pas <= 100) score += 2;
    else if (pas >= 101 && pas <= 110) score += 1;
    else if (pas >= 111 && pas <= 219) score += 0;
    else if (pas >= 220) score += 3;

    // 5. Frecuencia Cardíaca (lpm)
    const fc = Number(formData.fc);
    if (fc <= 40) score += 3;
    else if (fc >= 41 && fc <= 50) score += 1;
    else if (fc >= 51 && fc <= 90) score += 0;
    else if (fc >= 91 && fc <= 110) score += 1;
    else if (fc >= 111 && fc <= 130) score += 2;
    else if (fc >= 131) score += 3;

    // 6. Nivel de Conciencia (AVPU)
    if (formData.escalaAVPU !== 'Alerta (A)') score += 3;

    // 7. Temperatura (°C)
    const temp = Number(formData.temperatura);
    if (temp <= 35.0) score += 3;
    else if (temp >= 35.1 && temp <= 36.0) score += 1;
    else if (temp >= 36.1 && temp <= 38.0) score += 0;
    else if (temp >= 38.1 && temp <= 39.0) score += 1;
    else if (temp >= 39.1) score += 2;

    let nivelRiesgo: 'Bajo (0-4)' | 'Medio (5-6 / Monoparámetro 3)' | 'Alto (7+ Alerta Crítica)' = 'Bajo (0-4)';
    if (score >= 7) nivelRiesgo = 'Alto (7+ Alerta Crítica)';
    else if (score >= 5) nivelRiesgo = 'Medio (5-6 / Monoparámetro 3)';

    return { score, nivelRiesgo };
  };

  const { score: currentNEWS2Score, nivelRiesgo: currentNEWS2Riesgo } = calculateNEWS2();

  const handleOpenCreate = () => {
    const nextCode = `TRJ-2025-${String((data.registrosTriaje || []).length + 101).padStart(4, '0')}`;
    setFormData({
      codigoTriaje: nextCode,
      pacienteId: data.pacientes[0]?.id || '',
      motivoUrgencia: '',
      enfermeroTriaje: currentUser.nombreCompleto || 'Lic. Patricia Silva',
      pas: 120,
      pad: 80,
      fc: 76,
      fr: 16,
      spo2: 98,
      oxigenoSuplementario: false,
      temperatura: 36.6,
      escalaAVPU: 'Alerta (A)',
      escalaDolorEva: 3,
      destinoRecomendado: 'Consulta de Urgencias',
      nivelTriaje: 'Nivel 3 - Urgencia (Amarillo)',
      estado: 'En Espera'
    });
    setEditingRegistro(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (reg: RegistroTriaje) => {
    setEditingRegistro(reg);
    setFormData({
      codigoTriaje: reg.codigoTriaje,
      pacienteId: reg.pacienteId,
      motivoUrgencia: reg.motivoUrgencia,
      enfermeroTriaje: reg.enfermeroTriaje,
      pas: reg.signosVitales.pas,
      pad: reg.signosVitales.pad,
      fc: reg.signosVitales.fc,
      fr: reg.signosVitales.fr,
      spo2: reg.signosVitales.spo2,
      oxigenoSuplementario: reg.signosVitales.oxigenoSuplementario,
      temperatura: reg.signosVitales.temperatura,
      escalaAVPU: reg.signosVitales.escalaAVPU,
      escalaDolorEva: reg.signosVitales.escalaDolorEva,
      destinoRecomendado: reg.destinoRecomendado,
      nivelTriaje: reg.nivelTriaje,
      estado: reg.estado
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const paciente = data.pacientes.find((p) => p.id === formData.pacienteId);

    if (!paciente) {
      addToast('Debe seleccionar un paciente', 'error');
      return;
    }

    const { score, nivelRiesgo } = calculateNEWS2();

    const payload: RegistroTriaje = {
      id: editingRegistro ? editingRegistro.id : `tri-${Date.now()}`,
      codigoTriaje: formData.codigoTriaje,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteCedula: paciente.cedula,
      fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      enfermeroTriaje: formData.enfermeroTriaje,
      nivelTriaje: formData.nivelTriaje,
      signosVitales: {
        pas: Number(formData.pas),
        pad: Number(formData.pad),
        fc: Number(formData.fc),
        fr: Number(formData.fr),
        spo2: Number(formData.spo2),
        oxigenoSuplementario: Boolean(formData.oxigenoSuplementario),
        temperatura: Number(formData.temperatura),
        escalaAVPU: formData.escalaAVPU,
        escalaDolorEva: Number(formData.escalaDolorEva)
      },
      scoreNEWS2: score,
      nivelRiesgoNEWS2: nivelRiesgo,
      motivoUrgencia: formData.motivoUrgencia,
      destinoRecomendado: formData.destinoRecomendado,
      tiempoEsperaMinutos: editingRegistro ? editingRegistro.tiempoEsperaMinutos : 5,
      estado: formData.estado
    };

    if (editingRegistro) {
      updateItem('registrosTriaje', editingRegistro.id, payload);
    } else {
      createItem('registrosTriaje', payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este registro de triaje?')) {
      deleteItem('registrosTriaje', id);
    }
  };

  const handleDerivarACamas = (reg: RegistroTriaje) => {
    updateItem('registrosTriaje', reg.id, {
      estado: 'Hospitalizado'
    });
    addToast(`Paciente ${reg.pacienteNombre} derivado a Gestión de Camas / Hospitalización`, 'info');
  };

  const filteredRegistros = (data.registrosTriaje || []).filter((reg) => {
    const matchSearch =
      reg.codigoTriaje?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.pacienteCedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.motivoUrgencia?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchNivel = filterNivel === 'Todos' || reg.nivelTriaje.includes(filterNivel);

    return matchSearch && matchNivel;
  });

  const getNivelTriajeColor = (nivel: string) => {
    if (nivel.includes('Rojo')) return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
    if (nivel.includes('Naranja')) return { bg: '#ffedd5', text: '#ea580c', border: '#f97316' };
    if (nivel.includes('Amarillo')) return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
    if (nivel.includes('Verde')) return { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' };
    return { bg: '#e0f2fe', text: '#0284c7', border: '#38bdf8' };
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h1 className="view-title">Triaje de Urgencias y Alerta Temprana NEWS2</h1>
            <p className="view-subtitle">
              Estratificación clínica Manchester/ESI, calculadora automática NEWS2 y priorización de emergencias en tiempo real.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          {canCreate && (
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Evaluar Paciente (Nuevo Triaje)</span>
            </button>
          )}
        </div>
      </div>

      {/* Escala Visual de Triaje Manchester / ESI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.85rem' }}>Nivel 1 - Resucitación</div>
          <span style={{ fontSize: '0.7rem', color: '#991b1b' }}>Atención Inmediata (0 min)</span>
        </div>
        <div style={{ backgroundColor: '#ffedd5', border: '1px solid #fdba74', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, color: '#ea580c', fontSize: '0.85rem' }}>Nivel 2 - Emergencia</div>
          <span style={{ fontSize: '0.7rem', color: '#9a3412' }}>Atención &lt; 10 min</span>
        </div>
        <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, color: '#d97706', fontSize: '0.85rem' }}>Nivel 3 - Urgencia</div>
          <span style={{ fontSize: '0.7rem', color: '#92400e' }}>Atención &lt; 60 min</span>
        </div>
        <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.85rem' }}>Nivel 4 - Menor</div>
          <span style={{ fontSize: '0.7rem', color: '#166534' }}>Atención &lt; 120 min</span>
        </div>
        <div style={{ backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.85rem' }}>Nivel 5 - No Urgente</div>
          <span style={{ fontSize: '0.7rem', color: '#075985' }}>Atención &lt; 240 min</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card filter-bar no-print" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Buscar por paciente, cédula o motivo de consulta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="input select-input"
              value={filterNivel}
              onChange={(e) => setFilterNivel(e.target.value)}
            >
              <option value="Todos">Todos los Niveles de Urgencia</option>
              <option value="Rojo">Rojo (Resucitación)</option>
              <option value="Naranja">Naranja (Emergencia)</option>
              <option value="Amarillo">Amarillo (Urgencia)</option>
              <option value="Verde">Verde (Menor)</option>
              <option value="Azul">Azul (No Urgente)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista / Tablero de Triaje de Pacientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
        {filteredRegistros.map((reg) => {
          const colors = getNivelTriajeColor(reg.nivelTriaje);
          const isCriticoNEWS2 = reg.scoreNEWS2 >= 7;

          return (
            <div
              key={reg.id}
              className="card"
              style={{
                borderLeft: `5px solid ${colors.border}`,
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isCriticoNEWS2 ? '0 0 15px rgba(220, 38, 38, 0.2)' : undefined
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <span
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {reg.nivelTriaje}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      {reg.pacienteNombre}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      C.I: {reg.pacienteCedula} | Código: <strong className="font-mono">{reg.codigoTriaje}</strong>
                    </span>
                  </div>

                  {/* NEWS2 Score Badge */}
                  <div style={{ textAlign: 'center', backgroundColor: isCriticoNEWS2 ? '#fee2e2' : reg.scoreNEWS2 >= 5 ? '#fef3c7' : '#f1f5f9', padding: '0.4rem 0.6rem', borderRadius: '8px', border: `1px solid ${isCriticoNEWS2 ? '#ef4444' : '#cbd5e1'}` }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', fontWeight: 600 }}>NEWS2</span>
                    <strong style={{ fontSize: '1.1rem', color: isCriticoNEWS2 ? '#dc2626' : reg.scoreNEWS2 >= 5 ? '#d97706' : '#0f172a' }} className="font-mono">
                      {reg.scoreNEWS2}
                    </strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '6px', margin: '0.75rem 0', lineHeight: 1.4 }}>
                  <strong>Motivo:</strong> {reg.motivoUrgencia}
                </div>

                {/* Resumen de Signos Vitales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', fontSize: '0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="text-muted">PA:</span> <strong>{reg.signosVitales.pas}/{reg.signosVitales.pad}</strong>
                  </div>
                  <div>
                    <span className="text-muted">FC:</span> <strong>{reg.signosVitales.fc} lpm</strong>
                  </div>
                  <div>
                    <span className="text-muted">SpO2:</span> <strong style={{ color: reg.signosVitales.spo2 < 94 ? '#dc2626' : undefined }}>{reg.signosVitales.spo2}%</strong>
                  </div>
                  <div>
                    <span className="text-muted">FR:</span> <strong>{reg.signosVitales.fr} rpm</strong>
                  </div>
                  <div>
                    <span className="text-muted">Temp:</span> <strong style={{ color: reg.signosVitales.temperatura > 38 ? '#dc2626' : undefined }}>{reg.signosVitales.temperatura} °C</strong>
                  </div>
                  <div>
                    <span className="text-muted">Dolor (EVA):</span> <strong>{reg.signosVitales.escalaDolorEva}/10</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Destino: <strong style={{ color: '#2563eb' }}>{reg.destinoRecomendado}</strong></span>
                  <span>Espera: <strong className="font-mono">{reg.tiempoEsperaMinutos} min</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <Badge type={reg.estado === 'Hospitalizado' ? 'danger' : reg.estado === 'En Atención' ? 'warning' : 'secondary'}>
                  {reg.estado}
                </Badge>

                <div className="action-buttons-group">
                  {canEdit && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon btn-sm"
                      title="Editar Evaluación de Triaje"
                      onClick={() => handleOpenEdit(reg)}
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  {reg.estado !== 'Hospitalizado' && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      title="Derivar a Camas de Observación"
                      onClick={() => handleDerivarACamas(reg)}
                    >
                      <Bed size={14} />
                      <span>Camas</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon btn-sm text-danger"
                      title="Eliminar Registro"
                      onClick={() => handleDelete(reg.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Creación / Edición con Calculadora NEWS2 */}
      {isModalOpen && (
        <Modal
          title={editingRegistro ? `Modificar Triaje: ${editingRegistro.codigoTriaje}` : 'Evaluación Clínica de Triaje y Score NEWS2'}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSave} className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Código de Triaje</label>
                <input
                  type="text"
                  className="input font-mono"
                  value={formData.codigoTriaje}
                  onChange={(e) => setFormData({ ...formData, codigoTriaje: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select
                  className="input"
                  value={formData.pacienteId}
                  onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
                  required
                >
                  <option value="">Seleccione paciente...</option>
                  {data.pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} ({p.cedula}) - {p.edad} años
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Enfermero/a de Triaje</label>
                <input
                  type="text"
                  className="input"
                  value={formData.enfermeroTriaje}
                  onChange={(e) => setFormData({ ...formData, enfermeroTriaje: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Calculadora Automatizada NEWS2 */}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Parámetros Vitales y Calculadora NEWS2
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    National Early Warning Score (Royal College of Physicians)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Score Total:</span>
                  <span
                    className="font-mono font-bold"
                    style={{
                      fontSize: '1.25rem',
                      color: currentNEWS2Score >= 7 ? '#dc2626' : currentNEWS2Score >= 5 ? '#d97706' : '#16a34a',
                      backgroundColor: '#ffffff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1'
                    }}
                  >
                    {currentNEWS2Score} pts ({currentNEWS2Riesgo})
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>PAS Sistólica (mmHg)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={formData.pas}
                    onChange={(e) => setFormData({ ...formData, pas: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>PAD Diastólica (mmHg)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={formData.pad}
                    onChange={(e) => setFormData({ ...formData, pad: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Frecuencia Cardíaca (lpm)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={formData.fc}
                    onChange={(e) => setFormData({ ...formData, fc: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Frec. Respiratoria (rpm)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={formData.fr}
                    onChange={(e) => setFormData({ ...formData, fr: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>SpO2 (%)</label>
                  <input
                    type="number"
                    className="input font-mono"
                    value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input font-mono"
                    value={formData.temperatura}
                    onChange={(e) => setFormData({ ...formData, temperatura: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Conciencia (AVPU)</label>
                  <select
                    className="input"
                    value={formData.escalaAVPU}
                    onChange={(e) => setFormData({ ...formData, escalaAVPU: e.target.value as any })}
                  >
                    <option value="Alerta (A)">Alerta (A)</option>
                    <option value="Voz (V)">Responde a Voz (V)</option>
                    <option value="Dolor (P)">Responde a Dolor (P)</option>
                    <option value="Inconsciente (U)">Inconsciente (U)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Dolor EVA (0-10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    className="input font-mono"
                    value={formData.escalaDolorEva}
                    onChange={(e) => setFormData({ ...formData, escalaDolorEva: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="chkO2"
                  checked={formData.oxigenoSuplementario}
                  onChange={(e) => setFormData({ ...formData, oxigenoSuplementario: e.target.checked })}
                />
                <label htmlFor="chkO2" style={{ fontSize: '0.8rem', color: '#0f172a', cursor: 'pointer' }}>
                  El paciente requiere / está recibiendo oxígeno suplementario por cánula/mascarilla (+2 pts)
                </label>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Nivel de Triaje Asignado (Manchester / ESI)</label>
                <select
                  className="input"
                  value={formData.nivelTriaje}
                  onChange={(e) => setFormData({ ...formData, nivelTriaje: e.target.value as any })}
                >
                  <option value="Nivel 1 - Resucitación (Rojo)">Nivel 1 - Resucitación (Rojo)</option>
                  <option value="Nivel 2 - Emergencia (Naranja)">Nivel 2 - Emergencia (Naranja)</option>
                  <option value="Nivel 3 - Urgencia (Amarillo)">Nivel 3 - Urgencia (Amarillo)</option>
                  <option value="Nivel 4 - Menor (Verde)">Nivel 4 - Menor (Verde)</option>
                  <option value="Nivel 5 - No Urgente (Azul)">Nivel 5 - No Urgente (Azul)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destino Clínico Recomendado</label>
                <select
                  className="input"
                  value={formData.destinoRecomendado}
                  onChange={(e) => setFormData({ ...formData, destinoRecomendado: e.target.value as any })}
                >
                  <option value="Reanimación / Trauma Shock">Reanimación / Trauma Shock</option>
                  <option value="Observación">Observación de Urgencias</option>
                  <option value="Consulta de Urgencias">Consulta de Urgencias</option>
                  <option value="Sala de Espera">Sala de Espera</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Motivo de Urgencia y Síntomas Principales</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describa el motivo por el cual acude el paciente, tiempo de evolución y antecedentes..."
                value={formData.motivoUrgencia}
                onChange={(e) => setFormData({ ...formData, motivoUrgencia: e.target.value })}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingRegistro ? 'Guardar Cambios' : 'Registrar Triaje'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
