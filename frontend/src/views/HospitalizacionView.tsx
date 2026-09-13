import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CamaHospitalaria, AdmisionHospitalaria, NotaSOAP, OrdenEnfermeria } from '../types';
import {
  Bed,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  FileText,
  Activity,
  HeartPulse,
  Eye,
  Edit,
  Trash2,
  Printer,
  Sparkles,
  ArrowRight,
  LogOut,
  ClipboardList
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const HospitalizacionView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'camas' | 'admisiones'>('camas');

  const [filterSala, setFilterSala] = useState<string>('Todas');
  const [filterEstadoCama, setFilterEstadoCama] = useState<string>('Todos');

  // Modales
  const [isAdmisionModalOpen, setIsAdmisionModalOpen] = useState(false);
  const [isSOAPModalOpen, setIsSOAPModalOpen] = useState(false);
  const [isEpicrisisModalOpen, setIsEpicrisisModalOpen] = useState(false);
  const [selectedAdmision, setSelectedAdmision] = useState<AdmisionHospitalaria | null>(null);
  const [selectedCama, setSelectedCama] = useState<CamaHospitalaria | null>(null);

  // Formulario de Admisión
  const [admisionForm, setAdmisionForm] = useState({
    pacienteId: '',
    camaId: '',
    diagnosticoIngreso: '',
    medicoTratanteId: ''
  });

  // Formulario de Nota SOAP
  const [soapForm, setSoapForm] = useState({
    subjetivo: '',
    objetivo: '',
    analisis: '',
    plan: '',
    pa: '120/80 mmHg',
    fc: 75,
    fr: 18,
    temp: 36.5,
    spo2: 98
  });

  const canCreate = hasPermission('hospitalizacion', 'crear');
  const canEdit = hasPermission('hospitalizacion', 'editar');

  const camas = data.camasHospitalarias || [];
  const admisiones = data.admisionesHospitalarias || [];

  const totalCamas = camas.length;
  const camasOcupadas = camas.filter((c) => c.estado === 'Ocupada').length;
  const camasDisponibles = camas.filter((c) => c.estado === 'Disponible').length;
  const porcentajeOcupacion = totalCamas > 0 ? Math.round((camasOcupadas / totalCamas) * 100) : 0;

  const handleOpenAdmision = (camaPreset?: CamaHospitalaria) => {
    setAdmisionForm({
      pacienteId: data.pacientes[0]?.id || '',
      camaId: camaPreset?.id || camas.find((c) => c.estado === 'Disponible')?.id || '',
      diagnosticoIngreso: '',
      medicoTratanteId: data.empleados.find((e) => e.cargoTitulo?.includes('Médico'))?.id || data.empleados[0]?.id || ''
    });
    setIsAdmisionModalOpen(true);
  };

  const handleSaveAdmision = (e: React.FormEvent) => {
    e.preventDefault();
    const paciente = data.pacientes.find((p) => p.id === admisionForm.pacienteId);
    const cama = camas.find((c) => c.id === admisionForm.camaId);
    const medico = data.empleados.find((e) => e.id === admisionForm.medicoTratanteId);

    if (!paciente || !cama) {
      addToast('Datos incompletos para admisión', 'error');
      return;
    }

    const nextCode = `ADM-2025-${String(admisiones.length + 101).padStart(4, '0')}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newAdmision: AdmisionHospitalaria = {
      id: `adm-${Date.now()}`,
      codigoAdmision: nextCode,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteCedula: paciente.cedula,
      camaId: cama.id,
      camaCodigo: cama.codigoCama,
      salaNombre: cama.salaNombre,
      fechaIngreso: now,
      diagnosticoIngreso: admisionForm.diagnosticoIngreso,
      medicoTratanteId: medico?.id || '',
      medicoTratanteNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico de Guardia',
      estado: 'Ingresado',
      notasEvolucionSOAP: [
        {
          id: `soap-${Date.now()}`,
          fechaHora: now,
          medicoNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico de Guardia',
          subjetivo: 'Paciente ingresa por área de admisión hospitalaria.',
          objetivo: 'Signos vitales estables al ingreso.',
          analisis: admisionForm.diagnosticoIngreso,
          plan: '1. Reposo en cama. 2. Control de constantes vitales por turno. 3. Dieta según tolerancia.',
          signosVitales: { pa: '120/80', fc: 75, fr: 18, temp: 36.5, spo2: 98 }
        }
      ],
      ordenesEnfermeria: [
        {
          id: `ord-${Date.now()}`,
          fechaHora: now,
          enfermeroNombre: 'Lic. Patricia Silva',
          indicacion: 'Monitoreo de Signos Vitales y Balance Hídrico',
          via: 'Monitorización',
          horario: 'Cada 6 horas',
          estado: 'Cumplida'
        }
      ]
    };

    createItem('admisionesHospitalarias', newAdmision);

    // Actualizar estado de la cama
    updateItem('camasHospitalarias', cama.id, {
      estado: 'Ocupada',
      pacienteActualId: paciente.id,
      pacienteActualNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteCedula: paciente.cedula,
      fechaIngreso: now,
      medicoTratante: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico de Guardia',
      diagnosticoActual: admisionForm.diagnosticoIngreso
    });

    // Actualizar estado del paciente
    updateItem('pacientes', paciente.id, {
      estado: 'Hospitalizado'
    });

    setIsAdmisionModalOpen(false);
  };

  const handleOpenSOAP = (adm: AdmisionHospitalaria) => {
    setSelectedAdmision(adm);
    setSoapForm({
      subjetivo: '',
      objetivo: '',
      analisis: '',
      plan: '',
      pa: '125/80 mmHg',
      fc: 76,
      fr: 17,
      temp: 36.6,
      spo2: 98
    });
    setIsSOAPModalOpen(true);
  };

  const handleSaveSOAP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmision) return;

    const newNota: NotaSOAP = {
      id: `soap-${Date.now()}`,
      fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      medicoNombre: currentUser.nombreCompleto || 'Médico Tratante',
      subjetivo: soapForm.subjetivo,
      objetivo: soapForm.objetivo,
      analisis: soapForm.analisis,
      plan: soapForm.plan,
      signosVitales: {
        pa: soapForm.pa,
        fc: Number(soapForm.fc),
        fr: Number(soapForm.fr),
        temp: Number(soapForm.temp),
        spo2: Number(soapForm.spo2)
      }
    };

    const updatedNotas = [newNota, ...(selectedAdmision.notasEvolucionSOAP || [])];
    updateItem('admisionesHospitalarias', selectedAdmision.id, {
      notasEvolucionSOAP: updatedNotas
    });

    setIsSOAPModalOpen(false);
  };

  const handleDarAlta = (adm: AdmisionHospitalaria) => {
    if (window.confirm(`¿Confirmar Alta Médica para ${adm.pacienteNombre}?`)) {
      const now = new Date().toISOString().substring(0, 10);
      updateItem('admisionesHospitalarias', adm.id, {
        estado: 'Alta Médica',
        fechaAltaReal: now
      });

      // Liberar cama a estado En Limpieza
      const cama = camas.find((c) => c.id === adm.camaId);
      if (cama) {
        updateItem('camasHospitalarias', cama.id, {
          estado: 'En Limpieza',
          pacienteActualId: undefined,
          pacienteActualNombre: undefined,
          pacienteCedula: undefined,
          fechaIngreso: undefined,
          medicoTratante: undefined,
          diagnosticoActual: undefined
        });
      }

      // Actualizar paciente a De Alta
      updateItem('pacientes', adm.pacienteId, {
        estado: 'De Alta'
      });

      addToast(`Alta médica procesada para ${adm.pacienteNombre}. Cama ${adm.camaCodigo} en desinfección.`, 'success');
    }
  };

  const handleChangeEstadoCama = (camaId: string, nuevoEstado: 'Disponible' | 'En Limpieza' | 'Mantenimiento') => {
    updateItem('camasHospitalarias', camaId, {
      estado: nuevoEstado,
      pacienteActualId: nuevoEstado === 'Disponible' ? undefined : undefined,
      pacienteActualNombre: nuevoEstado === 'Disponible' ? undefined : undefined
    });
  };

  const handleOpenEpicrisis = (adm: AdmisionHospitalaria) => {
    setSelectedAdmision(adm);
    setIsEpicrisisModalOpen(true);
  };

  const filteredCamas = camas.filter((c) => {
    const matchSala = filterSala === 'Todas' || c.salaNombre.includes(filterSala);
    const matchEstado = filterEstadoCama === 'Todos' || c.estado === filterEstadoCama;
    return matchSala && matchEstado;
  });

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <Bed size={24} />
          </div>
          <div>
            <h1 className="view-title">Hospitalización, Gestión de Camas y Censo Clínico</h1>
            <p className="view-subtitle">
              Monitoreo en tiempo real de ocupación de camas, notas de evolución SOAP, órdenes de enfermería y altas hospitalarias.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          {canCreate && (
            <button type="button" className="btn btn-primary" onClick={() => handleOpenAdmision()}>
              <Plus size={16} />
              <span>Nueva Admisión Hospitalaria</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Bed size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Capacidad Total</span>
            <span className="kpi-value">{totalCamas} Camas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <Activity size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Camas Ocupadas</span>
            <span className="kpi-value">{camasOcupadas}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Camas Disponibles</span>
            <span className="kpi-value">{camasDisponibles}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <HeartPulse size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tasa de Ocupación</span>
            <span className="kpi-value">{porcentajeOcupacion}%</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'camas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('camas')}
        >
          <Bed size={15} />
          <span>Mapa de Camas en Tiempo Real</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'admisiones' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('admisiones')}
        >
          <ClipboardList size={15} />
          <span>Censo de Pacientes e Historias SOAP ({admisiones.filter((a) => a.estado === 'Ingresado' || a.estado === 'En Observación').length})</span>
        </button>
      </div>

      {activeTab === 'camas' && (
        <>
          {/* Filtros de Camas */}
          <div className="card filter-bar no-print" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Sala / Pabellón:</span>
                <select
                  className="form-input select-input"
                  style={{ width: 'auto' }}
                  value={filterSala}
                  onChange={(e) => setFilterSala(e.target.value)}
                >
                  <option value="Todas">Todas las Salas</option>
                  <option value="Observación">Observación Urgencias</option>
                  <option value="Medicina Interna">Medicina Interna</option>
                  <option value="Terapia Intensiva">Cuidados Intensivos (UCI)</option>
                  <option value="Aislamiento">Aislamiento</option>
                  <option value="Trauma Shock">Trauma Shock</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Estado:</span>
                <select
                  className="form-input select-input"
                  style={{ width: 'auto' }}
                  value={filterEstadoCama}
                  onChange={(e) => setFilterEstadoCama(e.target.value)}
                >
                  <option value="Todos">Todos los Estados</option>
                  <option value="Disponible">Disponible (Verde)</option>
                  <option value="Ocupada">Ocupada (Rojo)</option>
                  <option value="En Limpieza">En Limpieza / Desinfección</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Interactivo del Mapa de Camas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {filteredCamas.map((cama) => {
              const isOcupada = cama.estado === 'Ocupada';
              const isDisponible = cama.estado === 'Disponible';
              const isLimpieza = cama.estado === 'En Limpieza';

              let borderColor = '#22c55e';
              let badgeBg = '#dcfce7';
              let badgeColor = '#16a34a';

              if (isOcupada) {
                borderColor = '#ef4444';
                badgeBg = '#fee2e2';
                badgeColor = '#dc2626';
              } else if (isLimpieza) {
                borderColor = '#f59e0b';
                badgeBg = '#fef3c7';
                badgeColor = '#d97706';
              } else if (cama.estado === 'Mantenimiento') {
                borderColor = '#94a3b8';
                badgeBg = '#f1f5f9';
                badgeColor = '#64748b';
              }

              return (
                <div
                  key={cama.id}
                  className="card"
                  style={{
                    borderTop: `4px solid ${borderColor}`,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isOcupada ? '0 4px 12px rgba(239, 68, 68, 0.08)' : undefined
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="font-mono font-bold" style={{ fontSize: '1.1rem', color: '#0f172a' }}>
                        {cama.codigoCama}
                      </span>
                      <span
                        style={{
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {cama.estado}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      {cama.salaNombre} ({cama.tipoCama})
                    </div>

                    {isOcupada ? (
                      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                        <strong style={{ display: 'block', color: '#991b1b', fontSize: '0.85rem' }}>
                          {cama.pacienteActualNombre}
                        </strong>
                        <div style={{ color: '#7f1d1d', fontSize: '0.75rem' }}>
                          C.I: {cama.pacienteCedula} | Ingreso: {cama.fechaIngreso}
                        </div>
                        <div style={{ color: '#475569', marginTop: '0.35rem', fontStyle: 'italic' }}>
                          Dx: {cama.diagnosticoActual || 'Bajo observación médica'}
                        </div>
                        <div style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          Tratante: {cama.medicoTratante}
                        </div>
                      </div>
                    ) : isDisponible ? (
                      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8rem', color: '#166534', marginBottom: '0.75rem', textAlign: 'center' }}>
                        Cama higienizada y disponible para asignación inmediata.
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', textAlign: 'center' }}>
                        {isLimpieza ? 'En proceso de desinfección terminal.' : 'Fuera de servicio por mantenimiento.'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    {isDisponible && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', fontSize: '0.75rem' }}
                        onClick={() => handleOpenAdmision(cama)}
                      >
                        <UserCheck size={14} />
                        <span>Admitir Paciente</span>
                      </button>
                    )}

                    {isOcupada && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, fontSize: '0.75rem' }}
                          onClick={() => {
                            const adm = admisiones.find((a) => a.camaId === cama.id && a.estado !== 'Alta Médica');
                            if (adm) handleOpenSOAP(adm);
                          }}
                        >
                          <Edit size={13} />
                          <span>SOAP</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm text-danger"
                          style={{ fontSize: '0.75rem' }}
                          title="Dar Alta Médica"
                          onClick={() => {
                            const adm = admisiones.find((a) => a.camaId === cama.id && a.estado !== 'Alta Médica');
                            if (adm) handleDarAlta(adm);
                          }}
                        >
                          <LogOut size={13} />
                          <span>Alta</span>
                        </button>
                      </>
                    )}

                    {isLimpieza && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', fontSize: '0.75rem', color: '#16a34a' }}
                        onClick={() => handleChangeEstadoCama(cama.id, 'Disponible')}
                      >
                        <CheckCircle2 size={14} />
                        <span>Marcar Lista / Disponible</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'admisiones' && (
        <div className="card table-card">
          <div className="table-container auto-table">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Paciente</th>
                  <th>Cama / Sala</th>
                  <th>Fecha Ingreso</th>
                  <th>Diagnóstico de Ingreso</th>
                  <th>Médico Tratante</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {admisiones.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No hay registros de admisiones hospitalarias.
                    </td>
                  </tr>
                ) : (
                  admisiones.map((adm) => (
                    <tr key={adm.id}>
                      <td>
                        <span className="font-mono font-bold" style={{ color: '#2563eb' }}>
                          {adm.codigoAdmision}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong style={{ color: '#0f172a' }}>{adm.pacienteNombre}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>C.I: {adm.pacienteCedula}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary font-mono">{adm.camaCodigo}</span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{adm.salaNombre}</div>
                      </td>
                      <td className="table-mono font-mono" style={{ fontSize: '0.8rem' }}>{adm.fechaIngreso}</td>
                      <td style={{ maxWidth: '240px', fontSize: '0.8rem' }}>
                        {adm.diagnosticoIngreso}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        Dr. {adm.medicoTratanteNombre}
                      </td>
                      <td>
                        <Badge type={adm.estado === 'Ingresado' ? 'danger' : adm.estado === 'En Observación' ? 'warning' : 'success'}>
                          {adm.estado}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Registrar Nota de Evolución Diaria SOAP"
                            onClick={() => handleOpenSOAP(adm)}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Ver Resumen de Epicrisis / Ficha de Hospitalización"
                            onClick={() => handleOpenEpicrisis(adm)}
                          >
                            <Eye size={14} />
                          </button>
                          {adm.estado !== 'Alta Médica' && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon btn-sm text-danger"
                              title="Emitir Alta Médica"
                              onClick={() => handleDarAlta(adm)}
                            >
                              <LogOut size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Nueva Admisión */}
      {isAdmisionModalOpen && (
        <Modal
          title="Nueva Admisión y Asignación de Cama Hospitalaria"
          onClose={() => setIsAdmisionModalOpen(false)}
          size="md"
        >
          <form onSubmit={handleSaveAdmision} className="form-grid">
            <div className="form-group">
              <label className="form-label">Paciente a Hospitalizar</label>
              <select
                className="form-input"
                value={admisionForm.pacienteId}
                onChange={(e) => setAdmisionForm({ ...admisionForm, pacienteId: e.target.value })}
                required
              >
                <option value="">Seleccione paciente...</option>
                {data.pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.apellidos} ({p.cedula}) - Estado: {p.estado}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cama Hospitalaria Disponible</label>
              <select
                className="form-input"
                value={admisionForm.camaId}
                onChange={(e) => setAdmisionForm({ ...admisionForm, camaId: e.target.value })}
                required
              >
                <option value="">Seleccione cama...</option>
                {camas.filter((c) => c.estado === 'Disponible' || c.id === admisionForm.camaId).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.codigoCama} - {c.salaNombre} ({c.tipoCama})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Médico Tratante Responsable</label>
              <select
                className="form-input"
                value={admisionForm.medicoTratanteId}
                onChange={(e) => setAdmisionForm({ ...admisionForm, medicoTratanteId: e.target.value })}
                required
              >
                <option value="">Seleccione médico...</option>
                {data.empleados.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombres} {e.apellidos} ({e.cargoTitulo || 'Médico'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnóstico de Ingreso / Criterio de Hospitalización</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Indique el motivo y diagnóstico de admisión..."
                value={admisionForm.diagnosticoIngreso}
                onChange={(e) => setAdmisionForm({ ...admisionForm, diagnosticoIngreso: e.target.value })}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAdmisionModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Confirmar Admisión
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Nota de Evolución Diaria SOAP */}
      {isSOAPModalOpen && selectedAdmision && (
        <Modal
          title={`Evolución Médica Diaria (SOAP) - ${selectedAdmision.pacienteNombre}`}
          onClose={() => setIsSOAPModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSaveSOAP} className="form-grid">
            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <div>
                <strong>Cama:</strong> {selectedAdmision.camaCodigo} ({selectedAdmision.salaNombre})
              </div>
              <div>
                <strong>Ingreso:</strong> {selectedAdmision.fechaIngreso}
              </div>
              <div>
                <strong>Dx:</strong> {selectedAdmision.diagnosticoIngreso}
              </div>
            </div>

            {/* Signos Vitales de la Evolución */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Constantes Vitales Actuales</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>P.A (mmHg)</span>
                  <input
                    type="text"
                    className="form-input input-sm font-mono"
                    value={soapForm.pa}
                    onChange={(e) => setSoapForm({ ...soapForm, pa: e.target.value })}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>F.C (lpm)</span>
                  <input
                    type="number"
                    className="form-input input-sm font-mono"
                    value={soapForm.fc}
                    onChange={(e) => setSoapForm({ ...soapForm, fc: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>F.R (rpm)</span>
                  <input
                    type="number"
                    className="form-input input-sm font-mono"
                    value={soapForm.fr}
                    onChange={(e) => setSoapForm({ ...soapForm, fr: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Temp (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input input-sm font-mono"
                    value={soapForm.temp}
                    onChange={(e) => setSoapForm({ ...soapForm, temp: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>SpO2 (%)</span>
                  <input
                    type="number"
                    className="form-input input-sm font-mono"
                    value={soapForm.spo2}
                    onChange={(e) => setSoapForm({ ...soapForm, spo2: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Estructura SOAP */}
            <div className="form-group">
              <label className="form-label">
                <span style={{ color: '#2563eb', fontWeight: 800 }}>S</span> - Subjetivo (Síntomas referidos por el paciente)
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Paciente refiere sentirse mejor, sin dolor torácico, buena tolerancia oral..."
                value={soapForm.subjetivo}
                onChange={(e) => setSoapForm({ ...soapForm, subjetivo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ color: '#2563eb', fontWeight: 800 }}>O</span> - Objetivo (Hallazgos al examen físico y paraclínicos)
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Abdomen blando depresible, ruidos hidroaéreos presentes, sin edemas..."
                value={soapForm.objetivo}
                onChange={(e) => setSoapForm({ ...soapForm, objetivo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ color: '#2563eb', fontWeight: 800 }}>A</span> - Análisis / Evaluación Clínica
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Evolución clínica satisfactoria en su 2do día de hospitalización..."
                value={soapForm.analisis}
                onChange={(e) => setSoapForm({ ...soapForm, analisis: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span style={{ color: '#2563eb', fontWeight: 800 }}>P</span> - Plan Terapéutico y Órdenes Médicas
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="1. Continuar antibiótico. 2. Repetir hematología en 24h. 3. Deambulación asistida..."
                value={soapForm.plan}
                onChange={(e) => setSoapForm({ ...soapForm, plan: e.target.value })}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsSOAPModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar Evolución SOAP
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Epicrisis e Historial Hospitalario */}
      {isEpicrisisModalOpen && selectedAdmision && (
        <Modal
          title={`Expediente de Hospitalización - ${selectedAdmision.pacienteNombre}`}
          onClose={() => setIsEpicrisisModalOpen(false)}
          size="lg"
        >
          <div style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
            <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  CENTRO DE DIAGNÓSTICO INTEGRAL (CDI)
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Ficha de Hospitalización y Resumen de Estancia</span>
              </div>
              <div className="font-mono font-bold" style={{ color: '#2563eb' }}>
                {selectedAdmision.codigoAdmision}
              </div>
            </div>

            {/* Evoluciones SOAP Históricas */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Historial de Evoluciones SOAP
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {(selectedAdmision.notasEvolucionSOAP || []).map((nota, idx) => (
                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <strong style={{ color: '#2563eb' }}>Dr. {nota.medicoNombre}</strong>
                    <span className="font-mono text-muted">{nota.fechaHora}</span>
                  </div>

                  {nota.signosVitales && (
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#475569', marginBottom: '0.5rem', backgroundColor: '#ffffff', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                      <span><strong>PA:</strong> {nota.signosVitales.pa}</span>
                      <span><strong>FC:</strong> {nota.signosVitales.fc} lpm</span>
                      <span><strong>FR:</strong> {nota.signosVitales.fr} rpm</span>
                      <span><strong>Temp:</strong> {nota.signosVitales.temp} °C</span>
                      <span><strong>SpO2:</strong> {nota.signosVitales.spo2}%</span>
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div><strong>S:</strong> {nota.subjetivo}</div>
                    <div><strong>O:</strong> {nota.objetivo}</div>
                    <div><strong>A:</strong> {nota.analisis}</div>
                    <div><strong>P:</strong> {nota.plan}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Órdenes de Enfermería */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Kardex de Enfermería / eMAR
            </h4>
            <table className="clinical-table" style={{ fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Enfermero/a</th>
                  <th>Indicación</th>
                  <th>Vía</th>
                  <th>Horario</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {(selectedAdmision.ordenesEnfermeria || []).map((ord, idx) => (
                  <tr key={idx}>
                    <td className="table-mono font-mono">{ord.fechaHora}</td>
                    <td>{ord.enfermeroNombre}</td>
                    <td>{ord.indicacion}</td>
                    <td>{ord.via}</td>
                    <td>{ord.horario}</td>
                    <td>
                      <Badge type="success">{ord.estado}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEpicrisisModalOpen(false)}>
                Cerrar
              </button>
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Imprimir Resumen de Epicrisis</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
