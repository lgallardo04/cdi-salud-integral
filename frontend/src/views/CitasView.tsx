import React, { useState } from 'react';
import { Cita } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { CalendarCheck, Plus, Edit2, Trash2, Activity, Heart, Thermometer, CheckSquare } from 'lucide-react';

export const CitasView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);

  const [formData, setFormData] = useState<Partial<Cita>>({
    codigoCita: '',
    pacienteId: '',
    medicoId: '',
    departamentoId: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '08:00',
    motivoConsulta: '',
    triajePrioridad: 'Consulta Regular',
    signosVitales: {
      presionArterial: '120/80 mmHg',
      frecuenciaCardiaca: 75,
      temperatura: 36.5,
      saturacionOxigeno: 98,
      pesoKg: 70
    },
    estado: 'Pendiente',
    diagnosticoPreliminar: '',
    notas: ''
  });

  const handleOpenCreate = () => {
    setEditingCita(null);
    setFormData({
      codigoCita: `CIT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      pacienteId: data.pacientes[0]?.id || '',
      medicoId: data.empleados[1]?.id || data.empleados[0]?.id || '',
      departamentoId: data.departamentos[0]?.id || '',
      fecha: new Date().toISOString().split('T')[0],
      hora: '08:30',
      motivoConsulta: '',
      triajePrioridad: 'Consulta Regular',
      signosVitales: {
        presionArterial: '120/80 mmHg',
        frecuenciaCardiaca: 75,
        temperatura: 36.5,
        saturacionOxigeno: 98,
        pesoKg: 70
      },
      estado: 'Pendiente',
      diagnosticoPreliminar: '',
      notas: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cita: Cita) => {
    setEditingCita(cita);
    setFormData({ ...cita });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`¿Deseas eliminar la cita ${code}?`)) {
      deleteItem('citas', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.medicoId || !formData.fecha) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const paciente = data.pacientes.find((p) => p.id === formData.pacienteId);
    const medico = data.empleados.find((e) => e.id === formData.medicoId);
    const dep = data.departamentos.find((d) => d.id === formData.departamentoId);

    const payload: Partial<Cita> = {
      ...formData,
      pacienteNombre: paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente',
      pacienteCedula: paciente ? paciente.cedula : '',
      medicoNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico',
      departamentoNombre: dep ? dep.nombre : 'Medicina General'
    };

    if (editingCita) {
      updateItem('citas', editingCita.id, payload);
    } else {
      createItem('citas', {
        ...payload,
        id: `cit-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };

  const getPriorityVariant = (priority: Cita['triajePrioridad']) => {
    switch (priority) {
      case 'Emergencia': return 'urgent';
      case 'Urgencia': return 'warning';
      case 'Consulta Regular': return 'info';
      default: return 'neutral';
    }
  };

  const getStatusVariant = (status: Cita['estado']) => {
    switch (status) {
      case 'Completada': return 'success';
      case 'En Consulta': return 'info';
      case 'En Triaje': return 'warning';
      case 'Confirmada': return 'neutral';
      case 'Cancelada': return 'urgent';
      default: return 'warning';
    }
  };

  const columns: Column<Cita>[] = [
    {
      header: 'Código / Fecha',
      accessor: (c) => (
        <div>
          <b style={{ fontFamily: 'JetBrains Mono', color: '#2563eb' }}>{c.codigoCita}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {c.fecha} • <b>{c.hora}</b>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'fecha'
    },
    {
      header: 'Paciente',
      accessor: (c) => (
        <div>
          <b style={{ color: '#0f172a' }}>{c.pacienteNombre}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>C.I: {c.pacienteCedula}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'pacienteNombre'
    },
    {
      header: 'Médico / Servicio',
      accessor: (c) => (
        <div>
          <div>{c.medicoNombre}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.departamentoNombre}</div>
        </div>
      )
    },
    {
      header: 'Triaje / Prioridad',
      accessor: (c) => (
        <Badge variant={getPriorityVariant(c.triajePrioridad)}>
          {c.triajePrioridad}
        </Badge>
      ),
      sortable: true,
      sortKey: 'triajePrioridad'
    },
    {
      header: 'Signos Vitales',
      accessor: (c) => (
        <div style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono', color: '#475569' }}>
          {c.signosVitales?.presionArterial && <div>PA: {c.signosVitales.presionArterial}</div>}
          {c.signosVitales?.temperatura && <div>T: {c.signosVitales.temperatura}°C • FC: {c.signosVitales.frecuenciaCardiaca}bpm</div>}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (c) => (
        <Badge variant={getStatusVariant(c.estado)}>
          {c.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.citas}
        columns={columns}
        searchPlaceholder="Buscar por paciente, cédula, médico, código de cita..."
        addNewLabel="Programar Nueva Cita"
        onAddNew={handleOpenCreate}
        exportTitle="Citas_Medicas"
        actions={(c) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(c)}
              title="Editar / Atender Cita"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(c.id, c.codigoCita)}
              title="Eliminar Cita"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Programar / Modificar Cita */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCita ? 'Atención / Modificación de Cita Médica' : 'Programar Nueva Cita'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Paciente *</label>
              <select
                className="form-select"
                required
                value={formData.pacienteId}
                onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
              >
                <option value="">Seleccionar Paciente</option>
                {data.pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.apellidos} ({p.cedula})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Médico Tratante *</label>
              <select
                className="form-select"
                required
                value={formData.medicoId}
                onChange={(e) => {
                  const med = data.empleados.find((emp) => emp.id === e.target.value);
                  setFormData({
                    ...formData,
                    medicoId: e.target.value,
                    departamentoId: med?.departamentoId || formData.departamentoId
                  });
                }}
              >
                <option value="">Seleccionar Médico</option>
                {data.empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} ({emp.cargoTitulo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Departamento / Servicio</label>
              <select
                className="form-select"
                value={formData.departamentoId}
                onChange={(e) => setFormData({ ...formData, departamentoId: e.target.value })}
              >
                {data.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({d.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Prioridad Triaje</label>
              <select
                className="form-select"
                value={formData.triajePrioridad}
                onChange={(e) => setFormData({ ...formData, triajePrioridad: e.target.value as any })}
              >
                <option value="Emergencia">Emergencia (Atención Inmediata)</option>
                <option value="Urgencia">Urgencia (Menos de 30 min)</option>
                <option value="Consulta Regular">Consulta Regular</option>
                <option value="Control / Seguimiento">Control / Seguimiento</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Cita *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              >
              </input>
            </div>

            <div className="form-group">
              <label className="form-label">Hora *</label>
              <input
                type="time"
                className="form-input"
                required
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Motivo de Consulta *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.motivoConsulta}
                onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
                placeholder="Descripción del motivo de atención médica"
              />
            </div>

            {/* Bloque de Signos Vitales */}
            <div style={{ gridColumn: 'span 2', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <b style={{ fontSize: '0.85rem', color: '#2563eb', display: 'block', marginBottom: '0.75rem' }}>
                Toma de Signos Vitales (Triaje Asistencial)
              </b>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>P. Arterial (mmHg)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.signosVitales?.presionArterial || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        signosVitales: { ...formData.signosVitales, presionArterial: e.target.value }
                      })
                    }
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Frec. Cardíaca (bpm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.signosVitales?.frecuenciaCardiaca || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        signosVitales: { ...formData.signosVitales, frecuenciaCardiaca: Number(e.target.value) }
                      })
                    }
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.signosVitales?.temperatura || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        signosVitales: { ...formData.signosVitales, temperatura: Number(e.target.value) }
                      })
                    }
                    placeholder="36.5"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Sat. O2 (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.signosVitales?.saturacionOxigeno || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        signosVitales: { ...formData.signosVitales, saturacionOxigeno: Number(e.target.value) }
                      })
                    }
                    placeholder="98"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem' }}>Peso (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={formData.signosVitales?.pesoKg || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        signosVitales: { ...formData.signosVitales, pesoKg: Number(e.target.value) }
                      })
                    }
                    placeholder="70"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Estado de la Cita</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Confirmada">Confirmada</option>
                <option value="En Triaje">En Triaje</option>
                <option value="En Consulta">En Consulta</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnóstico Preliminar</label>
              <input
                type="text"
                className="form-input"
                value={formData.diagnosticoPreliminar || ''}
                onChange={(e) => setFormData({ ...formData, diagnosticoPreliminar: e.target.value })}
                placeholder="Ej. Rinofaringitis, Control HTA"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCita ? 'Actualizar Cita' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
