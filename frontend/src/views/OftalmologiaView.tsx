import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Eye,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Printer,
  Pill,
  Sparkles,
  ClipboardList,
  Search,
  Plus,
  X,
  User,
  Check
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const OftalmologiaView: React.FC = () => {
  const { data, createItem, addToast } = useData();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'consulta' | 'milagro' | 'farmacia' | 'suite'>('consulta');
  const [isModalMilagroOpen, setIsModalMilagroOpen] = useState(false);

  // Estado para la consulta oftálmica rápida OD / OS
  const [consultaForm, setConsultaForm] = useState({
    pacienteId: data.pacientes[0]?.id || '',
    avOD_SC: '20/40',
    avOD_CC: '20/20',
    avOS_SC: '20/60',
    avOS_CC: '20/25',
    pioOD: 16,
    pioOS: 18,
    biomicroscopia: 'Córnea transparente, cámara anterior amplia sin células. Cristalino con esclerosis nuclear incipiente OD.',
    fondoOjo: 'Papila de bordes netos, relación E/P 0.3 en ambos ojos. Mácula normal con brillo foveal conservado.',
    diagnostico: 'Presbicia y Catarata senil incipiente OD',
    tratamiento: 'Lágrimas artificiales 1 gota c/6h y control anual.'
  });

  // Estado para captar nuevo candidato de Misión Milagro
  const [nuevoMilagro, setNuevoMilagro] = useState({
    pacienteId: data.pacientes[0]?.id || '',
    nombreManual: '',
    cedulaManual: '',
    edad: 65,
    ojo: 'OD',
    patologia: 'Catarata Senil Grado III',
    poderLIO: '+21.5 D',
    checklistLaboratorio: 'Completo (Glicemia, TP/TPT, VIH/VDRL)',
    checklistCardio: 'Apto Quirúrgico Clase II',
    estado: 'Apto para Quirófano',
    fechaJornada: '2026-10-15'
  });

  const defaultCandidatos = [
    {
      id: 'mm-1',
      pacienteId: 'p-1',
      pacienteNombre: 'Yelitza Rodríguez',
      pacienteCedula: 'V-15842931',
      edad: 64,
      ojo: 'OD',
      patologia: 'Catarata Senil Grado III',
      poderLIO: '+21.5 D',
      checklistLaboratorio: 'Completo (Glicemia, TP/TPT)',
      checklistCardio: 'Apto Clase II',
      estado: 'Apto para Quirófano',
      fechaJornada: '2026-09-25'
    },
    {
      id: 'mm-2',
      pacienteId: 'p-2',
      pacienteNombre: 'Carlos Ramón Mendoza',
      pacienteCedula: 'V-12948112',
      edad: 58,
      ojo: 'OS',
      patologia: 'Pterigión Grado III con Astigmatismo',
      poderLIO: 'N/A (Autoinjerto conjuntival)',
      checklistLaboratorio: 'Pendiente Hematología',
      checklistCardio: 'En Espera EKG',
      estado: 'Pendiente Laboratorio',
      fechaJornada: '2026-10-02'
    },
    {
      id: 'mm-3',
      pacienteId: 'p-3',
      pacienteNombre: 'Mercedes Valera',
      pacienteCedula: 'V-8451203',
      edad: 71,
      ojo: 'OU (Bilateral)',
      patologia: 'Catarata Madura Bilateral',
      poderLIO: 'OD: +22.0 D / OS: +22.5 D',
      checklistLaboratorio: 'Completo',
      checklistCardio: 'Apto Quirúrgico',
      estado: 'Programado para Jornada',
      fechaJornada: '2026-09-18'
    }
  ];

  const candidatosMilagro = (data.candidatosMisionMilagro && data.candidatosMisionMilagro.length > 0)
    ? data.candidatosMisionMilagro
    : defaultCandidatos;

  // Semáforo dinámico de tonometría (PIO)
  const getPioColor = (val: number) => {
    if (val <= 21) return { color: '#16a34a', bg: '#f0fdf4', label: 'Normal (10-21 mmHg)' };
    if (val <= 24) return { color: '#d97706', bg: '#fffbeb', label: 'Sospecha HTO (22-24 mmHg)' };
    return { color: '#dc2626', bg: '#fef2f2', label: 'Alerta Glaucoma (>25 mmHg)' };
  };

  const pioODInfo = getPioColor(consultaForm.pioOD);
  const pioOSInfo = getPioColor(consultaForm.pioOS);

  const handleGuardarConsulta = async () => {
    if (!consultaForm.pacienteId) {
      addToast('Por favor seleccione un paciente para registrar la consulta', 'warning');
      return;
    }
    const pac = data.pacientes.find((p) => p.id === consultaForm.pacienteId);
    const pacNombre = pac ? `${pac.nombres} ${pac.apellidos}` : 'Paciente CDI';
    try {
      await createItem('consultasOftalmicas', {
        pacienteId: consultaForm.pacienteId,
        pacienteNombre: pacNombre,
        pacienteCedula: pac?.cedula || '',
        fecha: new Date().toISOString().split('T')[0],
        medicoTratante: 'Dra. Elena Ramos (Oftalmóloga CDI)',
        avOD: `${consultaForm.avOD_SC} (SC) / ${consultaForm.avOD_CC} (CC)`,
        avOS: `${consultaForm.avOS_SC} (SC) / ${consultaForm.avOS_CC} (CC)`,
        pioOD: consultaForm.pioOD,
        pioOS: consultaForm.pioOS,
        biomicroscopia: consultaForm.biomicroscopia,
        fondoOjo: consultaForm.fondoOjo,
        diagnostico: consultaForm.diagnostico,
        planTratamiento: consultaForm.tratamiento
      });
      addToast(
        `Examen OD/OS de ${pacNombre} registrado exitosamente en Historia Digital`,
        'success'
      );
    } catch (err) {
      addToast('Error al registrar la consulta oftalmológica', 'error');
    }
  };

  const handleGuardarCandidato = async (e: React.FormEvent) => {
    e.preventDefault();
    const pac = data.pacientes.find((p) => p.id === nuevoMilagro.pacienteId);
    const pacNombre = pac ? `${pac.nombres} ${pac.apellidos}` : nuevoMilagro.nombreManual || 'Paciente CDI';
    try {
      await createItem('candidatosMisionMilagro', {
        pacienteId: nuevoMilagro.pacienteId,
        pacienteNombre: pacNombre,
        pacienteCedula: pac?.cedula || nuevoMilagro.cedulaManual || 'V-00000000',
        ojo: nuevoMilagro.ojo,
        patologia: nuevoMilagro.patologia,
        poderLIO: nuevoMilagro.poderLIO,
        checklistLaboratorio: nuevoMilagro.checklistLaboratorio,
        checklistCardio: nuevoMilagro.checklistCardio,
        estado: nuevoMilagro.estado,
        fechaJornada: nuevoMilagro.fechaJornada
      });
      addToast('Candidato quirúrgico incorporado exitosamente al Censo Misión Milagro', 'success');
      setIsModalMilagroOpen(false);
    } catch (err) {
      addToast('Error al captar candidato para Misión Milagro', 'error');
    }
  };

  return (
    <div className="view-container">
      {/* Banner Principal de Oftalmología y Misión Milagro */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Eye size={26} color="#93c5fd" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Módulo de Oftalmología CDI
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#f59e0b',
                  color: '#0f172a',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  letterSpacing: '0.03em'
                }}
              >
                ☀️ MISIÓN MILAGRO
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: '0.2rem 0 0' }}>
              Consulta Especializada OD/OS • Agudeza Snellen • Tonometría PIO • Captación Quirúrgica
            </p>
          </div>
        </div>

        {/* Indicadores Clave */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#94a3b8', display: 'block' }}>
              Censo Milagro
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#facc15' }}>
              {candidatosMilagro.length} Aptos
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#94a3b8', display: 'block' }}>
              Tonometría PIO
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>
              Normal
            </span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => window.open('/oftalmologia/index.html', '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ExternalLink size={14} />
            Abrir Suite Oftálmica
          </button>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'consulta' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('consulta')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <Eye size={15} />
          Consulta Especializada (OD / OS)
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'milagro' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('milagro')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <ClipboardList size={15} />
          Censo Misión Milagro ({candidatosMilagro.length})
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'farmacia' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('farmacia')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <Pill size={15} />
          Colirios y Farmacia Ocular
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'suite' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('suite')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <Sparkles size={15} />
          Suite Completa & Cartilla Snellen
        </button>
      </div>

      {/* PESTAÑA 1: CONSULTA OD / OS */}
      {activeTab === 'consulta' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Tarjeta de Agudeza Visual y Tonometría */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={18} color="#2563eb" /> Examen de Agudeza Visual Snellen & Presión Intraocular
            </h3>

            {/* Selector de Paciente */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>
                Paciente en Consulta
              </label>
              <select
                className="form-input"
                value={consultaForm.pacienteId}
                onChange={(e) => setConsultaForm({ ...consultaForm, pacienteId: e.target.value })}
              >
                {data.pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.cedula} - {p.nombres} {p.apellidos} ({p.edad} años)
                  </option>
                ))}
              </select>
            </div>

            {/* Comparativa OD vs OS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Ojo Derecho */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '0.5rem' }}>
                  OJO DERECHO (OD)
                </h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>AV Sin Corrección (SC)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={consultaForm.avOD_SC}
                    onChange={(e) => setConsultaForm({ ...consultaForm, avOD_SC: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>AV Con Corrección (CC)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={consultaForm.avOD_CC}
                    onChange={(e) => setConsultaForm({ ...consultaForm, avOD_CC: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>PIO Tonometría (mmHg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={consultaForm.pioOD}
                    onChange={(e) => setConsultaForm({ ...consultaForm, pioOD: Number(e.target.value) })}
                  />
                  <div
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: pioODInfo.bg,
                      color: pioODInfo.color
                    }}
                  >
                    {pioODInfo.label}
                  </div>
                </div>
              </div>

              {/* Ojo Izquierdo */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', marginBottom: '0.5rem' }}>
                  OJO IZQUIERDO (OS)
                </h4>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>AV Sin Corrección (SC)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={consultaForm.avOS_SC}
                    onChange={(e) => setConsultaForm({ ...consultaForm, avOS_SC: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>AV Con Corrección (CC)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={consultaForm.avOS_CC}
                    onChange={(e) => setConsultaForm({ ...consultaForm, avOS_CC: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>PIO Tonometría (mmHg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={consultaForm.pioOS}
                    onChange={(e) => setConsultaForm({ ...consultaForm, pioOS: Number(e.target.value) })}
                  />
                  <div
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: pioOSInfo.bg,
                      color: pioOSInfo.color
                    }}
                  >
                    {pioOSInfo.label}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleGuardarConsulta}
              style={{ width: '100%' }}
            >
              Guardar Examen OD/OS en Historia
            </button>
          </div>

          {/* Biomicroscopía y Fondo de Ojo */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#0d9488" /> Lámpara de Hendidura & Fondo de Ojo
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Biomicroscopía (Segmento Anterior, Córnea, Cristalino)</label>
              <textarea
                className="form-input"
                rows={3}
                value={consultaForm.biomicroscopia}
                onChange={(e) => setConsultaForm({ ...consultaForm, biomicroscopia: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Oftalmoscopía Indirecta / Fondo de Ojo (Papila, E/P, Retina)</label>
              <textarea
                className="form-input"
                rows={3}
                value={consultaForm.fondoOjo}
                onChange={(e) => setConsultaForm({ ...consultaForm, fondoOjo: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Diagnóstico Clínico (CIE-10 Oftalmología)</label>
              <input
                type="text"
                className="form-input"
                value={consultaForm.diagnostico}
                onChange={(e) => setConsultaForm({ ...consultaForm, diagnostico: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Tratamiento y Recomendaciones</label>
              <input
                type="text"
                className="form-input"
                value={consultaForm.tratamiento}
                onChange={(e) => setConsultaForm({ ...consultaForm, tratamiento: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CENSO MISIÓN MILAGRO */}
      {activeTab === 'milagro' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Censo Quirúrgico - Misión Milagro CDI
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                Protocolo preoperatorio de Cataratas, Pterigión y Glaucoma con biometría y LIO
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalMilagroOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={15} />
              Captar Nuevo Candidato
            </button>
          </div>

          {/* Tabla de Candidatos */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem' }}>Cédula / Paciente</th>
                  <th style={{ padding: '0.75rem' }}>Ojo / Patología</th>
                  <th style={{ padding: '0.75rem' }}>Poder LIO</th>
                  <th style={{ padding: '0.75rem' }}>Paraclínicos</th>
                  <th style={{ padding: '0.75rem' }}>Riesgo Cardio</th>
                  <th style={{ padding: '0.75rem' }}>Estatus</th>
                  <th style={{ padding: '0.75rem' }}>Jornada</th>
                </tr>
              </thead>
              <tbody>
                {candidatosMilagro.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <b style={{ color: '#0f172a' }}>{c.pacienteNombre || c.nombre}</b>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                        {c.pacienteCedula || c.cedula} • {c.edad || 65} años
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: '#1e3a8a' }}>{c.ojo}</span> - {c.patologia}
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'JetBrains Mono', color: '#0d9488', fontWeight: 600 }}>
                      {c.poderLIO || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{c.checklistLaboratorio || c.laboratorio}</td>
                    <td style={{ padding: '0.75rem' }}>{c.checklistCardio || c.cardio}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <Badge
                        variant={c.estado.includes('Apto') || c.estado.includes('Programado') ? 'success' : 'warning'}
                      >
                        {c.estado}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'JetBrains Mono' }}>{c.fechaJornada || 'Por definir'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: FARMACIA OFTALMOLÓGICA */}
      {activeTab === 'farmacia' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Vademécum Especializado de Colirios & Soluciones Oculares (SUMED)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Medicamentos oftálmicos de alta rotación dotados para Centros de Diagnóstico Integral
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              {
                nombre: 'Timolol Maleato 0.5%',
                forma: 'Colirio Frasco Gotero 5ml',
                clase: 'Hipotensor Ocular / Betabloqueante',
                posologia: '1 gota en ojo afectado cada 12 horas',
                stock: 60,
                lote: 'LOTE-TIM-2026A'
              },
              {
                nombre: 'Tobramicina + Dexametasona (0.3% / 0.1%)',
                forma: 'Colirio Frasco Gotero 5ml',
                clase: 'Antibiótico + Antiinflamatorio Corticoide',
                posologia: '1 gota cada 8 horas por 7 a 10 días',
                stock: 45,
                lote: 'LOTE-TOB-2026F'
              },
              {
                nombre: 'Latanoprost 0.005%',
                forma: 'Colirio Frasco Gotero 2.5ml',
                clase: 'Análogo de Prostaglandina (Antiglaucomatoso)',
                posologia: '1 gota en ojo afectado una vez al día (Noche)',
                stock: 22,
                lote: 'LOTE-LAT-2026M'
              },
              {
                nombre: 'Carboximetilcelulosa 0.5% (Lágrimas)',
                forma: 'Colirio Frasco Gotero 15ml',
                clase: 'Lubricante Ocular / Ojo Seco',
                posologia: '1 gota en ambos ojos cada 4 a 6 horas según necesidad',
                stock: 90,
                lote: 'LOTE-CARB-2027A'
              }
            ].map((med, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{med.nombre}</h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', backgroundColor: '#f0fdf4', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                      {med.stock} und
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>{med.forma}</div>
                  <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.5rem' }}>{med.clase}</div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', backgroundColor: '#ffffff', padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <b>Posología:</b> {med.posologia}
                  </div>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{med.lote}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => addToast(`Prescripción de ${med.nombre} añadida al récipe del paciente`, 'success')}
                  >
                    Prescribir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PESTAÑA 4: SUITE OFTALMOLÓGICA INTERACTIVA */}
      {activeTab === 'suite' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Suite Oftalmológica Standalone Integrada
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                Cartilla Snellen digital en pantalla, refracción subjetiva y formatos de impresión MPPS
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const iframe = document.getElementById('oftalmo-frame') as HTMLIFrameElement;
                  if (iframe) iframe.src = iframe.src;
                }}
              >
                Recargar
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => window.open('/oftalmologia/index.html', '_blank')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ExternalLink size={14} />
                Abrir en Ventana Nueva
              </button>
            </div>
          </div>

          <div
            style={{
              width: '100%',
              height: '750px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              backgroundColor: '#0f172a'
            }}
          >
            <iframe
              id="oftalmo-frame"
              src="/oftalmologia/index.html"
              title="Suite Oftalmológica CDI"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* MODAL CAPTAR CANDIDATO MISIÓN MILAGRO */}
      {isModalMilagroOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardList size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Captar Candidato - Misión Milagro
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalMilagroOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarCandidato} style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600 }}>Paciente Registrado</label>
                  <select
                    className="form-input"
                    value={nuevoMilagro.pacienteId}
                    onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, pacienteId: e.target.value })}
                  >
                    {data.pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.cedula} - {p.nombres} {p.apellidos} ({p.edad} años)
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Ojo a Intervenir</label>
                    <select
                      className="form-input"
                      value={nuevoMilagro.ojo}
                      onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, ojo: e.target.value })}
                    >
                      <option value="OD">OD (Ojo Derecho)</option>
                      <option value="OS">OS (Ojo Izquierdo)</option>
                      <option value="OU">OU (Bilateral)</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Poder LIO (Biometría)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={nuevoMilagro.poderLIO}
                      onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, poderLIO: e.target.value })}
                      placeholder="+21.5 D"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Diagnóstico Quirúrgico</label>
                  <select
                    className="form-input"
                    value={nuevoMilagro.patologia}
                    onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, patologia: e.target.value })}
                  >
                    <option value="Catarata Senil Grado III">Catarata Senil Grado III</option>
                    <option value="Catarata Madura Bilateral">Catarata Madura Bilateral</option>
                    <option value="Pterigión Grado III con Astigmatismo">Pterigión Grado III con Astigmatismo</option>
                    <option value="Glaucoma de Ángulo Abierto">Glaucoma de Ángulo Abierto</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Paraclínicos Preop</label>
                    <select
                      className="form-input"
                      value={nuevoMilagro.checklistLaboratorio}
                      onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, checklistLaboratorio: e.target.value })}
                    >
                      <option value="Completo (Glicemia, TP/TPT)">Completo (Glicemia, TP/TPT)</option>
                      <option value="Pendiente Hematología">Pendiente Hematología</option>
                      <option value="En Espera Serología">En Espera Serología</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Riesgo Cardiovascular</label>
                    <select
                      className="form-input"
                      value={nuevoMilagro.checklistCardio}
                      onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, checklistCardio: e.target.value })}
                    >
                      <option value="Apto Clase I / II">Apto Clase I / II</option>
                      <option value="Apto Quirúrgico">Apto Quirúrgico</option>
                      <option value="En Espera EKG">En Espera EKG</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Estatus de Admisión</label>
                    <select
                      className="form-input"
                      value={nuevoMilagro.estado}
                      onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, estado: e.target.value })}
                    >
                      <option value="Apto para Quirófano">Apto para Quirófano</option>
                      <option value="Programado para Jornada">Programado para Jornada</option>
                      <option value="Pendiente Laboratorio">Pendiente Laboratorio</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Fecha de Jornada</label>
                    <input
                      type="date"
                      className="form-input"
                      value={nuevoMilagro.fechaJornada}
                      onChange={(e) => setNuevoMilagro({ ...nuevoMilagro, fechaJornada: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalMilagroOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Candidato en Censo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
