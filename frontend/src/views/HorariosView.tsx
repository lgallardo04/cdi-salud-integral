import React, { useState } from 'react';
import { Horario } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Clock, Plus, Edit2, Trash2, Calendar } from 'lucide-react';

export const HorariosView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);

  const [formData, setFormData] = useState<Partial<Horario>>({
    nombreTurno: '',
    empleadoId: '',
    departamentoId: '',
    tipoTurno: 'Matutino',
    horaInicio: '07:00',
    horaFin: '13:00',
    diasSemana: ['Lunes', 'Miércoles', 'Viernes'],
    estado: 'Activo',
    observaciones: ''
  });

  const availableDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const handleOpenCreate = () => {
    setEditingHorario(null);
    setFormData({
      nombreTurno: '',
      empleadoId: data.empleados[0]?.id || '',
      departamentoId: data.departamentos[0]?.id || '',
      tipoTurno: 'Matutino',
      horaInicio: '07:00',
      horaFin: '13:00',
      diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      estado: 'Activo',
      observaciones: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (horario: Horario) => {
    setEditingHorario(horario);
    setFormData({ ...horario });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Deseas eliminar la asignación de horario ${name}?`)) {
      deleteItem('horarios', id);
    }
  };

  const handleToggleDay = (day: string) => {
    const current = formData.diasSemana || [];
    if (current.includes(day)) {
      setFormData({ ...formData, diasSemana: current.filter((d) => d !== day) });
    } else {
      setFormData({ ...formData, diasSemana: [...current, day] });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreTurno || !formData.empleadoId) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const emp = data.empleados.find((e) => e.id === formData.empleadoId);
    const dep = data.departamentos.find((d) => d.id === formData.departamentoId);

    const payload: Partial<Horario> = {
      ...formData,
      empleadoNombre: emp ? `${emp.nombres} ${emp.apellidos}` : '',
      departamentoNombre: dep ? dep.nombre : ''
    };

    if (editingHorario) {
      updateItem('horarios', editingHorario.id, payload);
    } else {
      createItem('horarios', {
        ...payload,
        id: `hor-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Horario>[] = [
    {
      header: 'Turno / Descripción',
      accessor: (h) => (
        <div>
          <b style={{ color: '#0f172a' }}>{h.nombreTurno}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.observaciones}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombreTurno'
    },
    {
      header: 'Profesional Asignado',
      accessor: (h) => (
        <div>
          <b style={{ color: '#2563eb' }}>{h.empleadoNombre}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.departamentoNombre}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'empleadoNombre'
    },
    {
      header: 'Tipo de Turno',
      accessor: (h) => (
        <Badge
          variant={
            h.tipoTurno === 'Guardia 24h'
              ? 'urgent'
              : h.tipoTurno === 'Nocturno'
              ? 'warning'
              : 'info'
          }
        >
          {h.tipoTurno}
        </Badge>
      ),
      sortable: true,
      sortKey: 'tipoTurno'
    },
    {
      header: 'Horario',
      accessor: (h) => (
        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
          {h.horaInicio} - {h.horaFin}
        </span>
      )
    },
    {
      header: 'Días de Guardia / Turno',
      accessor: (h) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {h.diasSemana.map((d, idx) => (
            <span
              key={idx}
              style={{
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.7rem',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                border: '1px solid #bfdbfe'
              }}
            >
              {d.substring(0, 3)}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (h) => (
        <Badge variant={h.estado === 'Activo' ? 'success' : 'neutral'}>
          {h.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.horarios}
        columns={columns}
        searchPlaceholder="Buscar por turno, médico, departamento..."
        addNewLabel="Asignar Nuevo Horario"
        onAddNew={handleOpenCreate}
        exportTitle="Horarios_Turnos"
        actions={(h) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(h)}
              title="Editar Horario"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(h.id, h.nombreTurno)}
              title="Eliminar Horario"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Asignar / Editar Horario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHorario ? 'Modificar Asignación de Horario' : 'Asignar Nuevo Horario o Guardia'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Nombre / Etiqueta del Turno *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombreTurno}
                onChange={(e) => setFormData({ ...formData, nombreTurno: e.target.value })}
                placeholder="Ej. Mañana - Consulta Cardiología"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profesional / Empleado *</label>
              <select
                className="form-select"
                required
                value={formData.empleadoId}
                onChange={(e) => {
                  const targetEmp = data.empleados.find((emp) => emp.id === e.target.value);
                  setFormData({
                    ...formData,
                    empleadoId: e.target.value,
                    departamentoId: targetEmp?.departamentoId || formData.departamentoId
                  });
                }}
              >
                <option value="">Seleccionar Empleado</option>
                {data.empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} ({emp.cargoTitulo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Departamento *</label>
              <select
                className="form-select"
                required
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
              <label className="form-label">Tipo de Turno</label>
              <select
                className="form-select"
                value={formData.tipoTurno}
                onChange={(e) => setFormData({ ...formData, tipoTurno: e.target.value as any })}
              >
                <option value="Matutino">Matutino (Mañana)</option>
                <option value="Vespertino">Vespertino (Tarde)</option>
                <option value="Nocturno">Nocturno (Noche)</option>
                <option value="Guardia 24h">Guardia Continua 24 Horas</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              >
                <option value="Activo">Activo</option>
                <option value="Programado">Programado</option>
                <option value="Cubierto">Cubierto</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Hora Inicio</label>
              <input
                type="time"
                className="form-input"
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hora Fin</label>
              <input
                type="time"
                className="form-input"
                value={formData.horaFin}
                onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
              />
            </div>

            {/* Selector de Días de la Semana */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Días de la Semana Aplicables</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {availableDays.map((day) => {
                  const isSelected = formData.diasSemana?.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#2563eb' : 'white',
                        color: isSelected ? 'white' : '#334155',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 150ms'
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Observaciones / Pautas de Guardia</label>
              <input
                type="text"
                className="form-input"
                value={formData.observaciones || ''}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Pautas específicas del turno o cobertura"
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
              {editingHorario ? 'Guardar Cambios' : 'Guardar Horario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
