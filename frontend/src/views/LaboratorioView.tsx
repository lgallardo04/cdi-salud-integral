import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { OrdenLaboratorio, ItemResultadoLaboratorio } from '../types';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  FileText,
  Eye,
  Edit,
  Trash2,
  Download,
  Activity,
  Microscope,
  Stethoscope
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const LaboratorioView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState<string>('Todas');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');
  const [filterPerfil, setFilterPerfil] = useState<string>('Todos');

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<OrdenLaboratorio | null>(null);
  const [editingOrden, setEditingOrden] = useState<OrdenLaboratorio | null>(null);

  // Formulario de creación / edición
  const [formData, setFormData] = useState<Partial<OrdenLaboratorio>>({
    codigoOrden: '',
    pacienteId: '',
    medicoId: '',
    prioridad: 'Rutina',
    perfil: 'Hematología Completa',
    muestra: 'Sangre Total',
    observacionesClinicas: '',
    estado: 'Solicitado',
    resultados: []
  });

  const canCreate = hasPermission('laboratorio', 'crear');
  const canEdit = hasPermission('laboratorio', 'editar');
  const canDelete = hasPermission('laboratorio', 'eliminar');
  const canExport = hasPermission('laboratorio', 'exportar');

  // Plantillas de resultados por perfil
  const getTemplateResultados = (perfil: string): ItemResultadoLaboratorio[] => {
    switch (perfil) {
      case 'Hematología Completa':
        return [
          { parametro: 'Glóbulos Blancos (Leucocitos)', valor: '7.2', unidad: 'x10³/µL', rangoReferencia: '4.5 - 11.0', estado: 'Normal' },
          { parametro: 'Glóbulos Rojos (Hematíes)', valor: '4.5', unidad: 'x10⁶/µL', rangoReferencia: '4.0 - 5.5', estado: 'Normal' },
          { parametro: 'Hemoglobina', valor: '13.5', unidad: 'g/dL', rangoReferencia: '12.0 - 16.0', estado: 'Normal' },
          { parametro: 'Hematocrito', valor: '40.2', unidad: '%', rangoReferencia: '36.0 - 48.0', estado: 'Normal' },
          { parametro: 'VCM', valor: '88', unidad: 'fL', rangoReferencia: '80 - 100', estado: 'Normal' },
          { parametro: 'HCM', valor: '29.5', unidad: 'pg', rangoReferencia: '27 - 33', estado: 'Normal' },
          { parametro: 'Plaquetas', valor: '250', unidad: 'x10³/µL', rangoReferencia: '150 - 450', estado: 'Normal' },
          { parametro: 'Neutrófilos', valor: '60', unidad: '%', rangoReferencia: '45 - 70', estado: 'Normal' },
          { parametro: 'Linfocitos', valor: '32', unidad: '%', rangoReferencia: '20 - 40', estado: 'Normal' }
        ];
      case 'Química Sanguínea General':
        return [
          { parametro: 'Glucosa en Ayunas', valor: '95', unidad: 'mg/dL', rangoReferencia: '70 - 100', estado: 'Normal' },
          { parametro: 'Urea Sérica', valor: '30', unidad: 'mg/dL', rangoReferencia: '15 - 45', estado: 'Normal' },
          { parametro: 'Creatinina Sérica', valor: '0.9', unidad: 'mg/dL', rangoReferencia: '0.7 - 1.3', estado: 'Normal' },
          { parametro: 'Ácido Úrico', valor: '5.2', unidad: 'mg/dL', rangoReferencia: '3.4 - 7.0', estado: 'Normal' },
          { parametro: 'TGO / AST', valor: '22', unidad: 'U/L', rangoReferencia: '10 - 40', estado: 'Normal' },
          { parametro: 'TGP / ALT', valor: '25', unidad: 'U/L', rangoReferencia: '10 - 45', estado: 'Normal' }
        ];
      case 'Perfil Lipídico':
        return [
          { parametro: 'Colesterol Total', valor: '185', unidad: 'mg/dL', rangoReferencia: '< 200', estado: 'Normal' },
          { parametro: 'Triglicéridos', valor: '130', unidad: 'mg/dL', rangoReferencia: '< 150', estado: 'Normal' },
          { parametro: 'Colesterol HDL', valor: '45', unidad: 'mg/dL', rangoReferencia: '> 40', estado: 'Normal' },
          { parametro: 'Colesterol LDL', valor: '98', unidad: 'mg/dL', rangoReferencia: '< 100', estado: 'Normal' }
        ];
      case 'Uroanálisis / Orina Simple':
        return [
          { parametro: 'Aspecto', valor: 'Transparente', unidad: 'Físico', rangoReferencia: 'Límpido', estado: 'Normal' },
          { parametro: 'Color', valor: 'Amarillo Claro', unidad: 'Físico', rangoReferencia: 'Amarillo Claro', estado: 'Normal' },
          { parametro: 'Densidad', valor: '1.015', unidad: 'g/mL', rangoReferencia: '1.010 - 1.030', estado: 'Normal' },
          { parametro: 'pH', valor: '6.0', unidad: 'pH', rangoReferencia: '5.0 - 7.5', estado: 'Normal' },
          { parametro: 'Proteínas', valor: 'Negativo', unidad: 'Tira', rangoReferencia: 'Negativo', estado: 'Normal' },
          { parametro: 'Glucosa', valor: 'Negativo', unidad: 'Tira', rangoReferencia: 'Negativo', estado: 'Normal' },
          { parametro: 'Leucocitos', valor: '0 - 2 por campo', unidad: 'x campo', rangoReferencia: '0 - 4 por campo', estado: 'Normal' },
          { parametro: 'Bacterias', valor: 'Escasas', unidad: 'Microscopía', rangoReferencia: 'Ausentes / Escasas', estado: 'Normal' }
        ];
      case 'Inmunología y Serología':
        return [
          { parametro: 'Antígeno Dengue NS1', valor: 'NEGATIVO (-)', unidad: 'Cualitativo', rangoReferencia: 'Negativo', estado: 'Normal' },
          { parametro: 'Anticuerpos Dengue IgM', valor: 'NEGATIVO (-)', unidad: 'Cualitativo', rangoReferencia: 'Negativo', estado: 'Normal' },
          { parametro: 'Anticuerpos Dengue IgG', valor: 'NEGATIVO (-)', unidad: 'Cualitativo', rangoReferencia: 'Negativo', estado: 'Normal' },
          { parametro: 'Proteína C Reactiva (PCR)', valor: '2.1', unidad: 'mg/L', rangoReferencia: '< 5.0', estado: 'Normal' }
        ];
      default:
        return [
          { parametro: 'Parámetro Principal', valor: 'Normal', unidad: 'Unidad', rangoReferencia: 'Valor estándar', estado: 'Normal' }
        ];
    }
  };

  const handleOpenCreate = () => {
    const nextCode = `LAB-2025-${String((data.ordenesLaboratorio || []).length + 101).padStart(4, '0')}`;
    const defaultPerfil = 'Hematología Completa';
    setFormData({
      codigoOrden: nextCode,
      pacienteId: data.pacientes[0]?.id || '',
      medicoId: data.empleados.find((e) => e.cargoTitulo?.includes('Médico'))?.id || data.empleados[0]?.id || '',
      prioridad: 'Rutina',
      perfil: defaultPerfil,
      muestra: 'Sangre Total',
      fechaOrden: new Date().toISOString().replace('T', ' ').substring(0, 16),
      observacionesClinicas: '',
      estado: 'Solicitado',
      resultados: getTemplateResultados(defaultPerfil)
    });
    setEditingOrden(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (orden: OrdenLaboratorio) => {
    setEditingOrden(orden);
    setFormData({ ...orden });
    setIsModalOpen(true);
  };

  const handleOpenPreview = (orden: OrdenLaboratorio) => {
    setSelectedOrden(orden);
    setIsPreviewOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId) {
      addToast('Debe seleccionar un paciente', 'error');
      return;
    }

    const paciente = data.pacientes.find((p) => p.id === formData.pacienteId);
    const medico = data.empleados.find((e) => e.id === formData.medicoId);

    const ordenPayload: OrdenLaboratorio = {
      id: editingOrden ? editingOrden.id : `lab-${Date.now()}`,
      codigoOrden: formData.codigoOrden || `LAB-${Date.now()}`,
      pacienteId: formData.pacienteId,
      pacienteNombre: paciente ? `${paciente.nombres} ${paciente.apellidos}` : '',
      pacienteCedula: paciente?.cedula || '',
      pacienteEdad: paciente?.edad || 0,
      pacienteGenero: paciente?.genero || 'Otro',
      medicoId: formData.medicoId || '',
      medicoNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico Tratante',
      fechaOrden: formData.fechaOrden || new Date().toISOString().substring(0, 16),
      fechaResultado: formData.estado === 'Validado' ? (formData.fechaResultado || new Date().toISOString().substring(0, 16)) : undefined,
      prioridad: (formData.prioridad as any) || 'Rutina',
      perfil: (formData.perfil as any) || 'Hematología Completa',
      muestra: (formData.muestra as any) || 'Sangre Total',
      resultados: formData.resultados || getTemplateResultados(formData.perfil || 'Hematología Completa'),
      bioanalistaResponsable: formData.bioanalistaResponsable || 'Lcda. Mariana Rivas (CBV-8942)',
      observacionesClinicas: formData.observacionesClinicas || '',
      codigoValidacionQR: `CDI-LAB-VAL-${paciente?.cedula?.replace(/[^0-9]/g, '') || '00'}-${Date.now().toString().slice(-4)}`,
      estado: (formData.estado as any) || 'Solicitado'
    };

    if (editingOrden) {
      updateItem('ordenesLaboratorio', editingOrden.id, ordenPayload);
    } else {
      createItem('ordenesLaboratorio', ordenPayload);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta orden de laboratorio?')) {
      deleteItem('ordenesLaboratorio', id);
    }
  };

  const handleResultParamChange = (index: number, field: keyof ItemResultadoLaboratorio, value: any) => {
    const updated = [...(formData.resultados || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, resultados: updated });
  };

  const handlePerfilChange = (perfil: string) => {
    setFormData({
      ...formData,
      perfil: perfil as any,
      resultados: getTemplateResultados(perfil)
    });
  };

  const filteredOrdenes = (data.ordenesLaboratorio || []).filter((orden) => {
    const matchSearch =
      orden.codigoOrden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.pacienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.pacienteCedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.perfil?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchPrioridad = filterPrioridad === 'Todas' || orden.prioridad === filterPrioridad;
    const matchEstado = filterEstado === 'Todos' || orden.estado === filterEstado;
    const matchPerfil = filterPerfil === 'Todos' || orden.perfil === filterPerfil;

    return matchSearch && matchPrioridad && matchEstado && matchPerfil;
  });

  const getBadgeTypePrioridad = (p: string) => {
    if (p.includes('Emergencia') || p.includes('Stat')) return 'danger';
    if (p.includes('Urgente')) return 'warning';
    return 'info';
  };

  const getBadgeTypeEstado = (e: string) => {
    switch (e) {
      case 'Validado':
      case 'Entregado':
        return 'success';
      case 'En Proceso':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="view-container">
      {/* Header del Módulo */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="view-title">Laboratorio Clínico y Bioanálisis (LIS)</h1>
            <p className="view-subtitle">
              Gestión automatizada de órdenes de laboratorio, perfiles bioquímicos y validación con código QR.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          {canCreate && (
            <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
              <Plus size={16} />
              <span>Nueva Orden de Análisis</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de Resumen Rápido LIS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <FlaskConical size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Órdenes</span>
            <span className="kpi-value">{(data.ordenesLaboratorio || []).length}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">En Proceso / Pendientes</span>
            <span className="kpi-value">
              {(data.ordenesLaboratorio || []).filter((o) => o.estado === 'Solicitado' || o.estado === 'En Proceso').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Resultados Validados</span>
            <span className="kpi-value">
              {(data.ordenesLaboratorio || []).filter((o) => o.estado === 'Validado' || o.estado === 'Entregado').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Urgencias / Stat</span>
            <span className="kpi-value">
              {(data.ordenesLaboratorio || []).filter((o) => o.prioridad !== 'Rutina').length}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="card filter-bar no-print" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input search-input"
              placeholder="Buscar por código, paciente, cédula o perfil..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="input select-input"
              value={filterPerfil}
              onChange={(e) => setFilterPerfil(e.target.value)}
            >
              <option value="Todos">Todos los Perfiles</option>
              <option value="Hematología Completa">Hematología Completa</option>
              <option value="Química Sanguínea General">Química Sanguínea</option>
              <option value="Perfil Lipídico">Perfil Lipídico</option>
              <option value="Uroanálisis / Orina Simple">Uroanálisis</option>
              <option value="Inmunología y Serología">Inmunología y Serología</option>
            </select>
          </div>

          <div>
            <select
              className="input select-input"
              value={filterPrioridad}
              onChange={(e) => setFilterPrioridad(e.target.value)}
            >
              <option value="Todas">Todas las Prioridades</option>
              <option value="Rutina">Rutina</option>
              <option value="Urgente">Urgente</option>
              <option value="Emergencia / Stat">Emergencia / Stat</option>
            </select>
          </div>

          <div>
            <select
              className="input select-input"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Solicitado">Solicitado</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Validado">Validado</option>
              <option value="Entregado">Entregado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="card table-card">
        <div className="table-container auto-table">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Paciente</th>
                <th>Perfil Clínico</th>
                <th>Muestra</th>
                <th>Fecha Orden</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrdenes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    <FlaskConical size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p>No se encontraron órdenes de laboratorio con los filtros aplicados.</p>
                  </td>
                </tr>
              ) : (
                filteredOrdenes.map((orden) => (
                  <tr key={orden.id}>
                    <td>
                      <span className="font-mono font-bold" style={{ color: '#2563eb' }}>
                        {orden.codigoOrden}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{orden.pacienteNombre}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          C.I: {orden.pacienteCedula} | {orden.pacienteEdad} años ({orden.pacienteGenero})
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{orden.perfil}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dr. {orden.medicoNombre}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                        {orden.muestra}
                      </span>
                    </td>
                    <td className="table-mono font-mono" style={{ fontSize: '0.8rem' }}>{orden.fechaOrden}</td>
                    <td>
                      <Badge type={getBadgeTypePrioridad(orden.prioridad)}>{orden.prioridad}</Badge>
                    </td>
                    <td>
                      <Badge type={getBadgeTypeEstado(orden.estado)}>{orden.estado}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Ver / Imprimir Resultados Oficiales"
                          onClick={() => handleOpenPreview(orden)}
                        >
                          <Eye size={14} />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Ingresar / Editar Resultados"
                            onClick={() => handleOpenEdit(orden)}
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm text-danger"
                            title="Eliminar Orden"
                            onClick={() => handleDelete(orden.id)}
                          >
                            <Trash2 size={14} />
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

      {/* Modal de Creación / Edición de Orden y Captura de Resultados */}
      {isModalOpen && (
        <Modal
          title={editingOrden ? `Editar Orden: ${editingOrden.codigoOrden}` : 'Nueva Orden de Análisis de Laboratorio'}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSave} className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Código de Orden</label>
                <input
                  type="text"
                  className="input font-mono"
                  value={formData.codigoOrden || ''}
                  onChange={(e) => setFormData({ ...formData, codigoOrden: e.target.value })}
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
                  value={formData.medicoId || ''}
                  onChange={(e) => setFormData({ ...formData, medicoId: e.target.value })}
                  required
                >
                  <option value="">Seleccione un médico...</option>
                  {data.empleados.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nombres} {emp.apellidos} ({emp.cargoTitulo || 'Personal'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label className="form-label">Perfil de Exámenes</label>
                <select
                  className="input"
                  value={formData.perfil || 'Hematología Completa'}
                  onChange={(e) => handlePerfilChange(e.target.value)}
                  required
                >
                  <option value="Hematología Completa">Hematología Completa</option>
                  <option value="Química Sanguínea General">Química Sanguínea General</option>
                  <option value="Perfil Lipídico">Perfil Lipídico</option>
                  <option value="Electrolitos y Gases Arteriales">Electrolitos y Gases Arteriales</option>
                  <option value="Uroanálisis / Orina Simple">Uroanálisis / Orina Simple</option>
                  <option value="Inmunología y Serología">Inmunología y Serología</option>
                  <option value="Pruebas de Coagulación (PT/PTT)">Pruebas de Coagulación (PT/PTT)</option>
                  <option value="Coprología">Coprología</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Muestra</label>
                <select
                  className="input"
                  value={formData.muestra || 'Sangre Total'}
                  onChange={(e) => setFormData({ ...formData, muestra: e.target.value as any })}
                  required
                >
                  <option value="Sangre Total">Sangre Total</option>
                  <option value="Suero">Suero</option>
                  <option value="Plasma">Plasma</option>
                  <option value="Orina">Orina</option>
                  <option value="Heces">Heces</option>
                  <option value="LCR">Líquido Cefalorraquídeo</option>
                  <option value="Exudado">Exudado Faríngeo / Herida</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select
                  className="input"
                  value={formData.prioridad || 'Rutina'}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                >
                  <option value="Rutina">Rutina</option>
                  <option value="Urgente">Urgente</option>
                  <option value="Emergencia / Stat">Emergencia / Stat</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estado de la Orden</label>
                <select
                  className="input"
                  value={formData.estado || 'Solicitado'}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                >
                  <option value="Solicitado">Solicitado</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Validado">Validado (Firma Bioanálisis)</option>
                  <option value="Entregado">Entregado al Paciente</option>
                </select>
              </div>
            </div>

            {/* Captura de Parámetros y Resultados */}
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                  Resultados y Valores de Referencia ({formData.perfil})
                </h4>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  El sistema resalta automáticamente los valores fuera de rango.
                </span>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="clinical-table" style={{ margin: 0, fontSize: '0.85rem' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ width: '35%' }}>Parámetro</th>
                      <th style={{ width: '20%' }}>Valor Obtenido</th>
                      <th style={{ width: '15%' }}>Unidad</th>
                      <th style={{ width: '20%' }}>Rango Ref.</th>
                      <th style={{ width: '10%' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.resultados || []).map((res, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{res.parametro}</td>
                        <td>
                          <input
                            type="text"
                            className="input input-sm font-mono"
                            value={res.valor}
                            onChange={(e) => handleResultParamChange(idx, 'valor', e.target.value)}
                            style={{
                              borderColor: res.estado === 'Crítico' ? '#dc2626' : res.estado === 'Alto' || res.estado === 'Bajo' ? '#f59e0b' : '#e2e8f0',
                              backgroundColor: res.estado === 'Crítico' ? '#fef2f2' : undefined
                            }}
                          />
                        </td>
                        <td className="table-mono text-muted font-mono">{res.unidad}</td>
                        <td className="text-muted font-mono">{res.rangoReferencia}</td>
                        <td>
                          <select
                            className="input input-sm"
                            value={res.estado}
                            onChange={(e) => handleResultParamChange(idx, 'estado', e.target.value as any)}
                            style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
                          >
                            <option value="Normal">Normal</option>
                            <option value="Bajo">Bajo</option>
                            <option value="Alto">Alto</option>
                            <option value="Crítico">Crítico</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Observaciones Clínicas / Diagnósticas</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Observaciones adicionales del bioanalista o médico..."
                value={formData.observacionesClinicas || ''}
                onChange={(e) => setFormData({ ...formData, observacionesClinicas: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editingOrden ? 'Guardar Cambios' : 'Registrar Orden'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de Vista Previa / Impresión Oficial de Resultados (LIS Sheet) */}
      {isPreviewOpen && selectedOrden && (
        <Modal
          title={`Informe Oficial de Laboratorio - ${selectedOrden.codigoOrden}`}
          onClose={() => setIsPreviewOpen(false)}
          size="lg"
        >
          <div className="print-laboratory-container" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            {/* Cabecera Oficial del Informe */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlaskConical size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    CDI - SALUD INTEGRAL
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Departamento de Bioanálisis y Laboratorio Clínico Automatizado
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="font-mono font-bold" style={{ fontSize: '1rem', color: '#2563eb' }}>
                  {selectedOrden.codigoOrden}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Fecha: {selectedOrden.fechaResultado || selectedOrden.fechaOrden}
                </div>
              </div>
            </div>

            {/* Ficha Filiatoria del Paciente */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Paciente:</span>
                <strong>{selectedOrden.pacienteNombre}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Cédula / Documento:</span>
                <strong className="font-mono">{selectedOrden.pacienteCedula}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Edad / Género:</span>
                <strong>{selectedOrden.pacienteEdad} años ({selectedOrden.pacienteGenero})</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Médico Solicitante:</span>
                <strong>Dr. {selectedOrden.medicoNombre}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Perfil Solicitado:</span>
                <strong style={{ color: '#2563eb' }}>{selectedOrden.perfil}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Tipo de Muestra:</span>
                <strong>{selectedOrden.muestra}</strong>
              </div>
            </div>

            {/* Tabla de Resultados Clínicos */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Resultados Analíticos
            </h3>

            <table className="clinical-table" style={{ width: '100%', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ textAlign: 'left' }}>Parámetro</th>
                  <th style={{ textAlign: 'center' }}>Resultado</th>
                  <th style={{ textAlign: 'center' }}>Unidad</th>
                  <th style={{ textAlign: 'center' }}>Valores de Referencia</th>
                  <th style={{ textAlign: 'center' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrden.resultados.map((res, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{res.parametro}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: res.estado === 'Crítico' ? '#dc2626' : res.estado !== 'Normal' ? '#d97706' : '#0f172a' }} className="font-mono">
                      {res.valor}
                    </td>
                    <td style={{ textAlign: 'center' }} className="table-mono font-mono text-muted">{res.unidad}</td>
                    <td style={{ textAlign: 'center' }} className="font-mono text-muted">{res.rangoReferencia}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge type={res.estado === 'Crítico' ? 'danger' : res.estado === 'Alto' || res.estado === 'Bajo' ? 'warning' : 'success'}>
                        {res.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedOrden.observacionesClinicas && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <strong style={{ color: '#92400e' }}>Observaciones del Bioanalista:</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#78350f' }}>{selectedOrden.observacionesClinicas}</p>
              </div>
            )}

            {/* Pie de Firma y Código QR de Validación */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ border: '2px solid #0f172a', padding: '6px', borderRadius: '6px' }}>
                  <QrCode size={48} />
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', maxWidth: '240px' }}>
                  <strong style={{ display: 'block', color: '#0f172a' }}>Verificación Digital CDI</strong>
                  Código QR único de trazabilidad e inviolabilidad clínica.
                  <span className="font-mono" style={{ display: 'block', marginTop: '2px', color: '#2563eb' }}>
                    {selectedOrden.codigoValidacionQR || 'CDI-VAL-LAB-OK'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <div style={{ borderBottom: '1px solid #0f172a', width: '180px', margin: '0 auto 0.5rem', height: '35px' }}></div>
                <strong style={{ fontSize: '0.85rem', display: 'block', color: '#0f172a' }}>
                  {selectedOrden.bioanalistaResponsable || 'Lcda. Mariana Rivas'}
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bioanalista Regente / Firma Digital</span>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPreviewOpen(false)}>
                Cerrar
              </button>
              <button type="button" className="btn btn-primary" onClick={handlePrintReport}>
                <Printer size={16} />
                <span>Imprimir Informe Oficial</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
