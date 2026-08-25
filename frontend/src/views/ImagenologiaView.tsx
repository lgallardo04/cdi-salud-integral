import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { EstudioImagen } from '../types';
import {
  Activity,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Printer,
  ZoomIn,
  ZoomOut,
  Sun,
  Contrast,
  Maximize2,
  RefreshCw,
  Sliders,
  Grid,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const ImagenologiaView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState<string>('Todas');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedEstudio, setSelectedEstudio] = useState<EstudioImagen | null>(null);
  const [editingEstudio, setEditingEstudio] = useState<EstudioImagen | null>(null);

  // Estados del Visor PACS
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Formulario
  const [formData, setFormData] = useState<Partial<EstudioImagen>>({
    codigoEstudio: '',
    pacienteId: '',
    medicoSolicitanteId: '',
    modalidad: 'Rayos X',
    regionAnatomica: '',
    motivoEstudio: '',
    hallazgos: '',
    impresionDiagnostica: '',
    clasificacionEspecial: '',
    prioridad: 'Programada',
    estado: 'Pendiente',
    imagenesUrls: []
  });

  const canCreate = hasPermission('imagenologia', 'crear');
  const canEdit = hasPermission('imagenologia', 'editar');
  const canDelete = hasPermission('imagenologia', 'eliminar');

  const handleOpenCreate = () => {
    const nextCode = `RAD-2025-${String((data.estudiosImagen || []).length + 101).padStart(4, '0')}`;
    setFormData({
      codigoEstudio: nextCode,
      pacienteId: data.pacientes[0]?.id || '',
      medicoSolicitanteId: data.empleados[0]?.id || '',
      modalidad: 'Rayos X',
      regionAnatomica: 'Tórax PA y Lateral',
      motivoEstudio: '',
      hallazgos: '',
      impresionDiagnostica: '',
      clasificacionEspecial: '',
      prioridad: 'Programada',
      estado: 'Pendiente',
      fechaSolicitud: new Date().toISOString().substring(0, 16),
      radiologoResponsable: 'Dr. Fernando Ruiz / Téc. Andrés Paredes',
      imagenesUrls: [
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
      ]
    });
    setEditingEstudio(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (estudio: EstudioImagen) => {
    setEditingEstudio(estudio);
    setFormData({ ...estudio });
    setIsModalOpen(true);
  };

  const handleOpenViewer = (estudio: EstudioImagen) => {
    setSelectedEstudio(estudio);
    setZoomLevel(1);
    setIsInverted(false);
    setBrightness(100);
    setContrast(100);
    setShowGrid(false);
    setActiveImageIndex(0);
    setIsViewerOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId) {
      addToast('Debe seleccionar un paciente', 'error');
      return;
    }

    const paciente = data.pacientes.find((p) => p.id === formData.pacienteId);
    const medico = data.empleados.find((e) => e.id === formData.medicoSolicitanteId);

    const payload: EstudioImagen = {
      id: editingEstudio ? editingEstudio.id : `img-${Date.now()}`,
      codigoEstudio: formData.codigoEstudio || `RAD-${Date.now()}`,
      pacienteId: formData.pacienteId,
      pacienteNombre: paciente ? `${paciente.nombres} ${paciente.apellidos}` : '',
      pacienteCedula: paciente?.cedula || '',
      medicoSolicitanteId: formData.medicoSolicitanteId || '',
      medicoSolicitanteNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico Tratante',
      modalidad: (formData.modalidad as any) || 'Rayos X',
      regionAnatomica: formData.regionAnatomica || 'Tórax',
      fechaSolicitud: formData.fechaSolicitud || new Date().toISOString().substring(0, 16),
      fechaRealizacion: formData.estado !== 'Pendiente' ? (formData.fechaRealizacion || new Date().toISOString().substring(0, 16)) : undefined,
      radiologoResponsable: formData.radiologoResponsable || 'Dr. Fernando Ruiz',
      motivoEstudio: formData.motivoEstudio || '',
      hallazgos: formData.hallazgos || '',
      impresionDiagnostica: formData.impresionDiagnostica || '',
      clasificacionEspecial: formData.clasificacionEspecial || '',
      imagenesUrls: formData.imagenesUrls && formData.imagenesUrls.length > 0 ? formData.imagenesUrls : [
        'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
      ],
      prioridad: (formData.prioridad as any) || 'Programada',
      estado: (formData.estado as any) || 'Pendiente'
    };

    if (editingEstudio) {
      updateItem('estudiosImagen', editingEstudio.id, payload);
    } else {
      createItem('estudiosImagen', payload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este estudio de imagenología?')) {
      deleteItem('estudiosImagen', id);
    }
  };

  const filteredEstudios = (data.estudiosImagen || []).filter((estudio) => {
    const matchSearch =
      estudio.codigoEstudio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudio.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudio.pacienteCedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudio.regionAnatomica?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchModalidad = filterModalidad === 'Todas' || estudio.modalidad === filterModalidad;
    const matchEstado = filterEstado === 'Todos' || estudio.estado === filterEstado;

    return matchSearch && matchModalidad && matchEstado;
  });

  const getBadgeTypeEstado = (estado: string) => {
    switch (estado) {
      case 'Informado':
      case 'Entregado':
        return 'success';
      case 'Adquirido':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="view-container">
      {/* Encabezado */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <Activity size={24} />
          </div>
          <div>
            <h1 className="view-title">Imagenología y Radiología Digital (RIS / PACS)</h1>
            <p className="view-subtitle">
              Estudios de Rayos X, Ecografía Doppler, Tomografía (TAC), Electrocardiografía y Visor DICOM clínico interactivo.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          {canCreate && (
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Solicitar Estudio Radiológico</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <Activity size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Estudios</span>
            <span className="kpi-value">{(data.estudiosImagen || []).length}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Informados con Dictamen</span>
            <span className="kpi-value">
              {(data.estudiosImagen || []).filter((e) => e.estado === 'Informado' || e.estado === 'Entregado').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pendientes por Informar</span>
            <span className="kpi-value">
              {(data.estudiosImagen || []).filter((e) => e.estado === 'Pendiente' || e.estado === 'Adquirido').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertCircle size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Urgencias / Emergencias</span>
            <span className="kpi-value">
              {(data.estudiosImagen || []).filter((e) => e.prioridad !== 'Programada').length}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card filter-bar no-print" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Buscar por código, paciente, región anatómica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="input select-input"
              value={filterModalidad}
              onChange={(e) => setFilterModalidad(e.target.value)}
            >
              <option value="Todas">Todas las Modalidades</option>
              <option value="Rayos X">Rayos X</option>
              <option value="Ecografía / Ultrasonido">Ecografía / Ultrasonido</option>
              <option value="Tomografía Axial (TAC)">Tomografía Axial (TAC)</option>
              <option value="Electrocardiograma (ECG)">Electrocardiograma (ECG)</option>
              <option value="Resonancia Magnética (RMN)">Resonancia Magnética (RMN)</option>
            </select>
          </div>

          <div>
            <select
              className="input select-input"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Adquirido">Adquirido</option>
              <option value="Informado">Informado</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Estudios Radiológicos con Tarjetas Visuales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredEstudios.map((estudio) => {
          const mainImage = estudio.imagenesUrls && estudio.imagenesUrls.length > 0 ? estudio.imagenesUrls[0] : null;

          return (
            <div key={estudio.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Thumbnail Radiológico con Overlay de Modalidad */}
              <div
                style={{
                  height: '160px',
                  backgroundColor: '#020617',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundImage: mainImage ? `url(${mainImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={() => handleOpenViewer(estudio)}
              >
                {!mainImage && (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <Activity size={36} style={{ margin: '0 auto 0.25rem', opacity: 0.5 }} />
                    <span style={{ fontSize: '0.75rem' }}>Imagen en proceso</span>
                  </div>
                )}

                <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                  <span className="badge badge-primary font-mono" style={{ fontSize: '0.7rem' }}>
                    {estudio.modalidad}
                  </span>
                </div>

                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <Badge type={getBadgeTypeEstado(estudio.estado)}>{estudio.estado}</Badge>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    background: 'linear-gradient(transparent, rgba(2,6,23,0.9))',
                    padding: '0.5rem 0.75rem',
                    color: 'white',
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span className="font-mono">{estudio.codigoEstudio}</span>
                  <span>{estudio.fechaRealizacion || estudio.fechaSolicitud}</span>
                </div>
              </div>

              {/* Contenido Clínico */}
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {estudio.regionAnatomica}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {estudio.pacienteNombre} <span style={{ color: '#64748b', fontWeight: 400 }}>({estudio.pacienteCedula})</span>
                </div>

                {estudio.impresionDiagnostica ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.75rem', borderLeft: '3px solid #2563eb', flex: 1 }}>
                    <strong style={{ display: 'block', color: '#0f172a', marginBottom: '0.2rem' }}>Impresión Diagnóstica:</strong>
                    <p style={{ margin: 0, color: '#334155', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {estudio.impresionDiagnostica}
                    </p>
                  </div>
                ) : (
                  <div style={{ padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.75rem', flex: 1 }}>
                    Pendiente de informe por el médico radiólogo...
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Dr. {estudio.radiologoResponsable}
                  </span>

                  <div className="action-buttons-group">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleOpenViewer(estudio)}
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Eye size={14} />
                      <span>Visor PACS</span>
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon btn-sm"
                        title="Editar / Redactar Informe"
                        onClick={() => handleOpenEdit(estudio)}
                      >
                        <Edit size={14} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon btn-sm text-danger"
                        title="Eliminar Estudio"
                        onClick={() => handleDelete(estudio.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Visor PACS Clínico Interactivo */}
      {isViewerOpen && selectedEstudio && (
        <Modal
          title={`Visor PACS Radiológico - ${selectedEstudio.codigoEstudio} (${selectedEstudio.modalidad})`}
          onClose={() => setIsViewerOpen(false)}
          size="lg"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', height: '620px' }}>
            {/* Pantalla del Visor de Placas */}
            <div
              style={{
                backgroundColor: '#020617',
                borderRadius: '8px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                userSelect: 'none'
              }}
            >
              {/* Imagen con transformaciones activas de zoom/brillo/contraste/inversión */}
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  filter: `${isInverted ? 'invert(1)' : ''} brightness(${brightness}%) contrast(${contrast}%)`,
                  transition: 'transform 0.15s ease-out, filter 0.15s ease-out',
                  maxWidth: '90%',
                  maxHeight: '90%'
                }}
              >
                <img
                  src={
                    selectedEstudio.imagenesUrls && selectedEstudio.imagenesUrls[activeImageIndex]
                      ? selectedEstudio.imagenesUrls[activeImageIndex]
                      : 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'
                  }
                  alt="Estudio Radiológico"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '520px',
                    borderRadius: '4px',
                    boxShadow: '0 0 20px rgba(0,0,0,0.8)'
                  }}
                />
              </div>

              {/* Cuadrícula de calibración milimétrica opcional */}
              {showGrid && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Barra flotante de herramientas PACS */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 12px',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  zIndex: 10
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-sm"
                  style={{ background: 'transparent', color: 'white', borderColor: 'transparent' }}
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                  title="Acercar Zoom"
                >
                  <ZoomIn size={16} />
                </button>
                <span className="font-mono" style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-sm"
                  style={{ background: 'transparent', color: 'white', borderColor: 'transparent' }}
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  title="Alejar Zoom"
                >
                  <ZoomOut size={16} />
                </button>
                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }}></div>

                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-sm"
                  style={{
                    background: isInverted ? '#2563eb' : 'transparent',
                    color: 'white',
                    borderColor: 'transparent'
                  }}
                  onClick={() => setIsInverted((inv) => !inv)}
                  title="Invertir Negativo / Positivo"
                >
                  <Contrast size={16} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-sm"
                  style={{
                    background: showGrid ? '#2563eb' : 'transparent',
                    color: 'white',
                    borderColor: 'transparent'
                  }}
                  onClick={() => setShowGrid((g) => !g)}
                  title="Activar Rejilla de Medición Milimétrica"
                >
                  <Grid size={16} />
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-icon btn-sm"
                  style={{ background: 'transparent', color: 'white', borderColor: 'transparent' }}
                  onClick={() => {
                    setZoomLevel(1);
                    setIsInverted(false);
                    setBrightness(100);
                    setContrast(100);
                    setShowGrid(false);
                  }}
                  title="Restablecer Valores"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* Datos Overlay en Pantalla */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', color: '#38bdf8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <div>PACIENTE: {selectedEstudio.pacienteNombre}</div>
                <div>ID: {selectedEstudio.pacienteCedula}</div>
                <div>MODALIDAD: {selectedEstudio.modalidad}</div>
              </div>

              <div style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'right' }}>
                <div>CDI SALUD PACS v2.4</div>
                <div>{selectedEstudio.regionAnatomica}</div>
              </div>
            </div>

            {/* Panel Lateral de Informe Radiológico */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', paddingRight: '0.25rem' }}>
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Informe Radiológico Oficial
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Dictamen por {selectedEstudio.radiologoResponsable}
                </span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Motivo del Estudio:</strong>
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a' }}>{selectedEstudio.motivoEstudio || 'Evaluación diagnóstica.'}</p>
                </div>

                <div>
                  <strong style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Hallazgos Radiológicos:</strong>
                  <p style={{ margin: '0.2rem 0 0', color: '#334155', lineHeight: 1.4, backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px' }}>
                    {selectedEstudio.hallazgos || 'Sin hallazgos patológicos descritos.'}
                  </p>
                </div>

                <div>
                  <strong style={{ color: '#2563eb', fontSize: '0.75rem', display: 'block' }}>Impresión Diagnóstica:</strong>
                  <p style={{ margin: '0.2rem 0 0', color: '#0f172a', fontWeight: 600, backgroundColor: '#eff6ff', padding: '0.5rem', borderRadius: '6px', borderLeft: '3px solid #2563eb' }}>
                    {selectedEstudio.impresionDiagnostica || 'Estudio dentro de límites normales.'}
                  </p>
                </div>

                {selectedEstudio.clasificacionEspecial && (
                  <div>
                    <strong style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Clasificación / Score:</strong>
                    <span className="badge badge-info" style={{ marginTop: '0.25rem' }}>
                      {selectedEstudio.clasificacionEspecial}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                  <Printer size={16} />
                  <span>Imprimir Informe Radiológico</span>
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsViewerOpen(false)}>
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <Modal
          title={editingEstudio ? `Editar Estudio: ${editingEstudio.codigoEstudio}` : 'Solicitar Nuevo Estudio de Imagenología'}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSave} className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Código del Estudio</label>
                <input
                  type="text"
                  className="input font-mono"
                  value={formData.codigoEstudio || ''}
                  onChange={(e) => setFormData({ ...formData, codigoEstudio: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select
                  className="input"
                  value={formData.pacienteId || ''}
                  onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
                  required
                >
                  <option value="">Seleccione un paciente...</option>
                  {data.pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} ({p.cedula})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Médico Solicitante</label>
                <select
                  className="input"
                  value={formData.medicoSolicitanteId || ''}
                  onChange={(e) => setFormData({ ...formData, medicoSolicitanteId: e.target.value })}
                  required
                >
                  <option value="">Seleccione médico...</option>
                  {data.empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombres} {emp.apellidos} ({emp.cargoTitulo || 'Médico'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Modalidad Radiológica</label>
                <select
                  className="input"
                  value={formData.modalidad || 'Rayos X'}
                  onChange={(e) => setFormData({ ...formData, modalidad: e.target.value as any })}
                  required
                >
                  <option value="Rayos X">Rayos X</option>
                  <option value="Ecografía / Ultrasonido">Ecografía / Ultrasonido</option>
                  <option value="Tomografía Axial (TAC)">Tomografía Axial (TAC)</option>
                  <option value="Electrocardiograma (ECG)">Electrocardiograma (ECG)</option>
                  <option value="Resonancia Magnética (RMN)">Resonancia Magnética (RMN)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Región Anatómica</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej. Tórax PA y Lateral, Abdomen Superior..."
                  value={formData.regionAnatomica || ''}
                  onChange={(e) => setFormData({ ...formData, regionAnatomica: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select
                  className="input"
                  value={formData.prioridad || 'Programada'}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                >
                  <option value="Programada">Programada</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Emergencia">Emergencia / Stat</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="input"
                  value={formData.estado || 'Pendiente'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Adquirido">Adquirido</option>
                  <option value="Informado">Informado</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Motivo del Estudio / Datos Clínicos</label>
              <input
                type="text"
                className="input"
                placeholder="Sospecha diagnóstica o síntomas que justifican el estudio..."
                value={formData.motivoEstudio || ''}
                onChange={(e) => setFormData({ ...formData, motivoEstudio: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Hallazgos Radiológicos (Informe)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Descripción detallada de estructuras y hallazgos imagenológicos..."
                value={formData.hallazgos || ''}
                onChange={(e) => setFormData({ ...formData, hallazgos: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Impresión Diagnóstica / Conclusión</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Conclusión diagnóstica..."
                value={formData.impresionDiagnostica || ''}
                onChange={(e) => setFormData({ ...formData, impresionDiagnostica: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingEstudio ? 'Guardar Cambios' : 'Registrar Estudio'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
