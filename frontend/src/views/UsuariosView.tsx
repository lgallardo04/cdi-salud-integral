import React, { useState } from 'react';
import { Usuario } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Users, Plus, Edit2, Trash2, Key, Shield } from 'lucide-react';

export const UsuariosView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState<Partial<Usuario>>({
    nombreUsuario: '',
    nombreCompleto: '',
    email: '',
    telefono: '',
    rolId: '',
    empleadoId: '',
    estado: 'Activo'
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      nombreUsuario: '',
      nombreCompleto: '',
      email: '',
      telefono: '',
      rolId: data.roles[0]?.id || '',
      empleadoId: data.empleados[0]?.id || '',
      estado: 'Activo',
      fechaCreacion: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Deseas deshabilitar o eliminar la cuenta de ${name}?`)) {
      deleteItem('usuarios', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreUsuario || !formData.nombreCompleto || !formData.rolId) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const role = data.roles.find((r) => r.id === formData.rolId);

    const payload: Partial<Usuario> = {
      ...formData,
      rolNombre: role ? role.nombre : 'Usuario'
    };

    if (editingUser) {
      updateItem('usuarios', editingUser.id, payload);
    } else {
      createItem('usuarios', {
        ...payload,
        id: `usr-${Date.now()}`,
        fechaCreacion: new Date().toISOString().split('T')[0],
        ultimoAcceso: 'Nunca'
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Usuario>[] = [
    {
      header: 'Usuario / Login',
      accessor: (u) => (
        <div>
          <b style={{ color: '#2563eb', fontFamily: 'JetBrains Mono' }}>@{u.nombreUsuario}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Creado: {u.fechaCreacion}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombreUsuario'
    },
    {
      header: 'Nombre Completo',
      accessor: (u) => (
        <div>
          <b style={{ color: '#0f172a' }}>{u.nombreCompleto}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombreCompleto'
    },
    {
      header: 'Rol Asignado',
      accessor: (u) => (
        <Badge variant={u.rolNombre === 'Administrador' ? 'urgent' : u.rolNombre === 'Médico' ? 'info' : 'neutral'}>
          {u.rolNombre}
        </Badge>
      ),
      sortable: true,
      sortKey: 'rolNombre'
    },
    {
      header: 'Último Acceso',
      accessor: 'ultimoAcceso',
      isMono: true
    },
    {
      header: 'Estado',
      accessor: (u) => (
        <Badge variant={u.estado === 'Activo' ? 'success' : 'neutral'}>
          {u.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.usuarios}
        columns={columns}
        searchPlaceholder="Buscar por usuario, nombre, rol, email..."
        addNewLabel="Crear Nuevo Usuario"
        onAddNew={handleOpenCreate}
        exportTitle="Usuarios_Sistema"
        actions={(u) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(u)}
              title="Editar Cuenta"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(u.id, u.nombreUsuario)}
              title="Eliminar Cuenta"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Crear / Editar Usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Cuenta de Usuario' : 'Crear Nueva Cuenta de Usuario'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre de Usuario (Login) *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombreUsuario}
                onChange={(e) => setFormData({ ...formData, nombreUsuario: e.target.value })}
                placeholder="Ej. dra.elena"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Rol del Sistema *</label>
              <select
                className="form-select"
                required
                value={formData.rolId}
                onChange={(e) => setFormData({ ...formData, rolId: e.target.value })}
              >
                {data.roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} - {r.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                placeholder="Ej. Dra. Elena Ramos"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vincular a Empleado (Opcional)</label>
              <select
                className="form-select"
                value={formData.empleadoId || ''}
                onChange={(e) => {
                  const emp = data.empleados.find((em) => em.id === e.target.value);
                  setFormData({
                    ...formData,
                    empleadoId: e.target.value,
                    nombreCompleto: emp ? `${emp.nombres} ${emp.apellidos}` : formData.nombreCompleto,
                    email: emp ? emp.email : formData.email,
                    telefono: emp ? emp.telefono : formData.telefono
                  });
                }}
              >
                <option value="">Sin vincular</option>
                {data.empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} ({emp.cargoTitulo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej. usuario@cdisalud.gob"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej. +58 414-1234567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado de la Cuenta</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Bloqueado">Bloqueado</option>
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
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
