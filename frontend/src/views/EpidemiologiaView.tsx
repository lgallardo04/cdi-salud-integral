import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CasoEpidemiologico } from '../types';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Activity,
  MapPin,
  FileText,
  Printer,
  Users,
  Eye,
  Trash2,
  BarChart2
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const EpidemiologiaView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnfermedad, setFilterEnfermedad] = useState<string>('Todas');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaso, setEditingCaso] = useState<CasoEpidemiologico | null>(null);

  // Formulario
  const [formData, setFormData] = useState<Partial<CasoEpidemiologico>>({
    codigoCaso: '',
    pacienteId: '',
    enfermedad: 'Dengue con Signos de Alarma (CIE-10: A97.1)',
    semanaEpidemiologica: 33,
    ano: 2025,
    canalEndemicoZona: 'Zona de Alarma (Alerta Preventiva)',
    sectorComunidad: 'Sector 23 de Enero - Bloque 12',
    estadoCaso: 'En Investigación',
    notificadoMPPS: true,
    medidasTomadas: ''
  });

  const canCreate = hasPermission('epidemiologia', 'crear');
  const canDelete = hasPermission('epidemiologia', 'eliminar');

  const casos = data.casosEpidemiologicos || [];

  const handleOpenCreate = () => {
    const nextCode = `EPI-2025-${String(casos.length + 101).padStart(4, '0')}`;
    setFormData({
      codigoCaso: nextCode,
      pacienteId: data.pacientes[0]?.id || '',
      enfermedad: 'Dengue con Signos de Alarma (CIE-10: A97.1)',
      semanaEpidemiologica: 33,
      ano: 2025,
      fechaNotificacion: new Date().toISOString().substring(0, 10),
      canalEndemicoZona: 'Zona de Alarma (Alerta Preventiva)',
      sectorComunidad: 'Sector 23 de Enero - Zona Central',
      estadoCaso: 'En Investigación',
      notificadoMPPS: true,
      medidasTomadas: 'Visita de salud comunitaria, abatización focal y cerco epidemiológico.'
    });
    setEditingCaso(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const paciente = data.pacientes.find((p) => p.id === formData.pacienteId);

    if (!paciente) {
      addToast('Debe seleccionar un paciente', 'error');
      return;
    }

    const payload: CasoEpidemiologico = {
      id: editingCaso ? editingCaso.id : `epi-${Date.now()}`,
      codigoCaso: formData.codigoCaso || `EPI-${Date.now()}`,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteCedula: paciente.cedula,
      pacienteEdad: paciente.edad,
      enfermedad: formData.enfermedad || 'Dengue',
      semanaEpidemiologica: Number(formData.semanaEpidemiologica) || 33,
      ano: 2025,
      fechaNotificacion: formData.fechaNotificacion || new Date().toISOString().substring(0, 10),
      canalEndemicoZona: formData.canalEndemicoZona as any || 'Zona de Seguridad',
      sectorComunidad: formData.sectorComunidad || 'Comunidad Local',
      estadoCaso: formData.estadoCaso as any || 'En Investigación',
      notificadoMPPS: Boolean(formData.notificadoMPPS),
      medidasTomadas: formData.medidasTomadas || ''
    };

    if (editingCaso) {
      updateItem('casosEpidemiologicos', editingCaso.id, payload);
    } else {
      createItem('casosEpidemiologicos', payload);
    }

    setIsModalOpen(false);
  };

  const filteredCasos = casos.filter((c) => {
    const matchSearch =
      c.codigoCaso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.codigoNotificacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.enfermedad || c.enfermedadNotificable || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.sectorComunidad || c.comunidadSector || '').toLowerCase().includes(searchTerm.toLowerCase());

    const enf = c.enfermedad || c.enfermedadNotificable || '';
    const matchEnf = filterEnfermedad === 'Todas' || enf.includes(filterEnfermedad);
    const matchEst = filterEstado === 'Todos' || c.estadoCaso === filterEstado;

    return matchSearch && matchEnf && matchEst;
  });

  const getZonaBadgeColor = (zona?: string) => {
    const z = zona || 'Zona de Seguridad';
    if (z.includes('Epidemia')) return { bg: '#fee2e2', text: '#dc2626' };
    if (z.includes('Alarma')) return { bg: '#fef3c7', text: '#d97706' };
    if (z.includes('Seguridad')) return { bg: '#eff6ff', text: '#2563eb' };
    return { bg: '#dcfce7', text: '#16a34a' };
  };


  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="view-title">Epidemiología y Vigilancia en Salud Pública (EPI-12)</h1>
            <p className="view-subtitle">
              Canales endémicos semanales, notificación obligatoria MPPS, cercos epidemiológicos y detección de brotes.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          {canCreate && (
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Notificar Caso Epidemiológico</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Casos Notificados (Semana 33)</span>
            <span className="kpi-value">{casos.length}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Activity size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">En Investigación / Cerco</span>
            <span className="kpi-value">
              {casos.filter((c) => c.estadoCaso === 'En Investigación').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Confirmados por Laboratorio</span>
            <span className="kpi-value">
              {casos.filter((c) => c.estadoCaso === 'Confirmado').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <ShieldAlert size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Reporte Oficial MPPS</span>
            <span className="kpi-value">100% Sincronizado</span>
          </div>
        </div>
      </div>

      {/* Visualizador de Canal Endémico */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Canal Endémico - Vigilancia Dengue e Infecciones Transmisibles
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
          Estratificación epidemiológica semanal basada en la mediana histórica de los últimos 5 años.
        </p>

        <div className="epidemiologia-corredor-grid">
          <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
            <strong style={{ color: '#dc2626', fontSize: '0.85rem' }}>Zona de Epidemia</strong>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#7f1d1d' }}>&gt; 25 casos/sem</span>
          </div>
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
            <strong style={{ color: '#d97706', fontSize: '0.85rem' }}>Zona de Alarma</strong>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#78350f' }}>15 - 25 casos/sem</span>
          </div>
          <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
            <strong style={{ color: '#2563eb', fontSize: '0.85rem' }}>Zona de Seguridad</strong>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#1e3a8a' }}>8 - 14 casos/sem</span>
          </div>
          <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
            <strong style={{ color: '#16a34a', fontSize: '0.85rem' }}>Zona de Éxito</strong>
            <span style={{ display: 'block', fontSize: '0.7rem', color: '#14532d' }}>&lt; 8 casos/sem</span>
          </div>
        </div>
      </div>

      {/* Tabla de Casos Notificados */}
      <div className="card table-card">
        <div className="table-container auto-table">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Código EPI</th>
                <th>Paciente</th>
                <th>Enfermedad / CIE-10</th>
                <th>Comunidad / Sector</th>
                <th>Semana EPI</th>
                <th>Canal Endémico</th>
                <th>Estado del Caso</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCasos.map((caso) => {
                const zonaStyle = getZonaBadgeColor(caso.canalEndemicoZona);
                return (
                  <tr key={caso.id}>
                    <td>
                      <span className="font-mono font-bold" style={{ color: '#2563eb' }}>
                        {caso.codigoCaso}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{caso.pacienteNombre}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          C.I: {caso.pacienteCedula} | {caso.pacienteEdad} años
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a' }}>{caso.enfermedad}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fecha: {caso.fechaNotificacion}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <MapPin size={13} style={{ color: '#64748b' }} />
                        {caso.sectorComunidad}
                      </div>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.85rem' }}>
                      Semana {caso.semanaEpidemiologica} ({caso.ano})
                    </td>
                    <td>
                      <span
                        style={{
                          backgroundColor: zonaStyle.bg,
                          color: zonaStyle.text,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {(caso.canalEndemicoZona || 'Seguridad').split('(')[0]}
                      </span>

                    </td>
                    <td>
                      <Badge type={caso.estadoCaso === 'Confirmado' ? 'danger' : caso.estadoCaso === 'En Investigación' ? 'warning' : 'success'}>
                        {caso.estadoCaso}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Imprimir Ficha Epidemiológica EPI-12"
                          onClick={() => window.print()}
                        >
                          <Printer size={14} />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm text-danger"
                            title="Eliminar Caso"
                            onClick={() => deleteItem('casosEpidemiologicos', caso.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Caso Epidemiológico */}
      {isModalOpen && (
        <Modal
          title="Ficha de Notificación Epidemiológica Individual (EPI-12)"
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSave} className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Código EPI</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value={formData.codigoCaso}
                  onChange={(e) => setFormData({ ...formData, codigoCaso: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Paciente Afectado</label>
                <select
                  className="form-input"
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
                <label className="form-label">Enfermedad / Evento Bajo Vigilancia</label>
                <select
                  className="form-input"
                  value={formData.enfermedad}
                  onChange={(e) => setFormData({ ...formData, enfermedad: e.target.value })}
                  required
                >
                  <option value="Dengue con Signos de Alarma (CIE-10: A97.1)">Dengue con Signos de Alarma</option>
                  <option value="Dengue Grave / Hemorrágico (CIE-10: A97.2)">Dengue Grave / Hemorrágico</option>
                  <option value="Malaria por P. vivax (CIE-10: B51)">Malaria por P. vivax</option>
                  <option value="Infección Respiratoria Aguda Grave (IRAG)">Infección Respiratoria Aguda Grave</option>
                  <option value="COVID-19 Confirmado">COVID-19 Confirmado</option>
                  <option value="Gastroenteritis Infecciosa Aguda">Gastroenteritis Infecciosa Aguda</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Sector / Comunidad de Residencia</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Sector 23 de Enero, Bloque 12..."
                  value={formData.sectorComunidad}
                  onChange={(e) => setFormData({ ...formData, sectorComunidad: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Zona del Canal Endémico</label>
                <select
                  className="form-input"
                  value={formData.canalEndemicoZona}
                  onChange={(e) => setFormData({ ...formData, canalEndemicoZona: e.target.value as any })}
                >
                  <option value="Zona de Éxito">Zona de Éxito (Verde)</option>
                  <option value="Zona de Seguridad">Zona de Seguridad (Azul)</option>
                  <option value="Zona de Alarma (Alerta Preventiva)">Zona de Alarma (Amarillo)</option>
                  <option value="Zona de Epidemia (Brote Activo)">Zona de Epidemia (Rojo)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado del Caso</label>
                <select
                  className="form-input"
                  value={formData.estadoCaso}
                  onChange={(e) => setFormData({ ...formData, estadoCaso: e.target.value as any })}
                >
                  <option value="En Investigación">En Investigación / Sospechoso</option>
                  <option value="Confirmado">Confirmado por Laboratorio / PCR</option>
                  <option value="Descartado">Descartado</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Medidas de Salud Pública / Cerco Epidemiológico</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Acciones realizadas: abatización, búsqueda activa de febriles, aislamiento..."
                value={formData.medidasTomadas}
                onChange={(e) => setFormData({ ...formData, medidasTomadas: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar Notificación EPI
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
