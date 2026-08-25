import React, { useState } from 'react';
import { Empleado } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { UserCheck, Plus, Edit2, Trash2, Shield, Phone, Mail } from 'lucide-react';

export const EmpleadosView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Empleado | null>(null);

  const [formData, setFormData] = useState<Partial<Empleado>>({
    cedula: '',
    nombres: '',
    apellidos: '',
    genero: 'Femenino',
    fechaNacimiento: '1990-01-01',
    email: '',
    telefono: '',
    direccion: '',
    cargoId: '',
    departamentoId: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    colegiaturaMedica: '',
    estado: 'Activo'
  });

  const handleOpenCreate = () => {
    setEditingEmp(null);
    setFormData({
      cedula: 'V-',
      nombres: '',
      apellidos: '',
      genero: 'Femenino',
      fechaNacimiento: '1990-01-01',
      email: '',
      telefono: '+58 ',
      direccion: '',
      cargoId: data.cargos[0]?.id || '',
      departamentoId: data.departamentos[0]?.id || '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      colegiaturaMedica: '',
      estado: 'Activo'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Empleado) => {
    setEditingEmp(emp);
    setFormData({ ...emp });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Deseas dar de baja o eliminar el registro de ${name}?`)) {
      deleteItem('empleados', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula || !formData.nombres || !formData.apellidos) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const cargo = data.cargos.find((c) => c.id === formData.cargoId);
    const dep = data.departamentos.find((d) => d.id === formData.departamentoId);

    const payload: Partial<Empleado> = {
      ...formData,
      cargoTitulo: cargo ? cargo.titulo : '',
      departamentoNombre: dep ? dep.nombre : ''
    };

    if (editingEmp) {
      updateItem('empleados', editingEmp.id, payload);
    } else {
      createItem('empleados', {
        ...payload,
        id: `emp-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Empleado>[] = [
    {
      header: 'Cédula',
      accessor: 'cedula',
      isMono: true,
      sortable: true
    },
    {
      header: 'Empleado / Profesional',
      accessor: (e) => (
        <div>
          <b style={{ color: '#0f172a' }}>{e.nombres} {e.apellidos}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {e.email} • {e.telefono}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombres'
    },
    {
      header: 'Cargo / Jerarquía',
      accessor: (e) => (
        <div>
          <b style={{ color: '#2563eb', fontSize: '0.85rem' }}>{e.cargoTitulo}</b>
          {e.colegiaturaMedica && (
            <div style={{ fontSize: '0.72rem', color: '#0d9488', fontFamily: 'JetBrains Mono' }}>
              Col: {e.colegiaturaMedica}
            </div>
          )}
        </div>
      ),
      sortable: true,
      sortKey: 'cargoTitulo'
    },
    {
      header: 'Departamento',
      accessor: 'departamentoNombre',
      sortable: true
    },
    {
      header: 'Ingreso',
      accessor: 'fechaIngreso',
      isMono: true
    },
    {
      header: 'Estado',
      accessor: (e) => (
        <Badge variant={e.estado === 'Activo' ? 'success' : e.estado === 'Vacaciones' ? 'info' : 'warning'}>
          {e.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.empleados}
        columns={columns}
        searchPlaceholder="Buscar por cédula, nombre, cargo, colegiatura..."
        addNewLabel="Registrar Empleado"
        onAddNew={handleOpenCreate}
        exportTitle="Personal_Empleados"
        actions={(e) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(e)}
              title="Editar Ficha de Empleado"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(e.id, `${e.nombres} ${e.apellidos}`)}
              title="Eliminar Registro"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Crear / Editar Empleado */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? 'Editar Ficha del Personal' : 'Registrar Nuevo Empleado'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cédula de Identidad *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="Ej. V-18451290"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Ingreso</label>
              <input
                type="date"
                className="form-input"
                value={formData.fechaIngreso}
                onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombres *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                placeholder="Ej. Elena Beatriz"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellidos *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                placeholder="Ej. Ramos Salazar"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cargo *</label>
              <select
                className="form-select"
                required
                value={formData.cargoId}
                onChange={(e) => {
                  const targetCargo = data.cargos.find((c) => c.id === e.target.value);
                  setFormData({
                    ...formData,
                    cargoId: e.target.value,
                    departamentoId: targetCargo?.departamentoId || formData.departamentoId
                  });
                }}
              >
                <option value="">Seleccionar Cargo</option>
                {data.cargos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titulo} ({c.nivelJerarquico})
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
                <option value="">Seleccionar Departamento</option>
                {data.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({d.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Colegiatura / Matrícula Profesional</label>
              <input
                type="text"
                className="form-input"
                value={formData.colegiaturaMedica || ''}
                onChange={(e) => setFormData({ ...formData, colegiaturaMedica: e.target.value })}
                placeholder="Ej. MPPS-58492 / CMD-1420"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Género</label>
              <select
                className="form-select"
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value as any })}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej. +58 414-2345678"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej. elena.ramos@cdisalud.gob"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Dirección de Residencia</label>
              <input
                type="text"
                className="form-input"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección completa de habitación"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado Laboral</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              >
                <option value="Activo">Activo</option>
                <option value="Vacaciones">De Vacaciones</option>
                <option value="Permiso">Permiso Médico</option>
                <option value="Inactivo">Inactivo / Baja</option>
              </select>
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
              {editingEmp ? 'Guardar Cambios' : 'Registrar Empleado'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
