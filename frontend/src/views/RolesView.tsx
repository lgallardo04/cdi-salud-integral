import React, { useState } from 'react';
import { Rol, ModuloNombre, PermisosRol } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Shield, Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

const allModules: { id: ModuloNombre; label: string }[] = [
  { id: 'dashboard', label: 'Panel General' },
  { id: 'pacientes', label: 'Pacientes' },
  { id: 'citas', label: 'Citas Médicas' },
  { id: 'tratamientos', label: 'Tratamientos' },
  { id: 'medicamentos', label: 'Medicamentos' },
  { id: 'farmacia', label: 'Farmacia (Movs)' },
  { id: 'proveedores', label: 'Proveedores' },
  { id: 'empleados', label: 'Empleados' },
  { id: 'horarios', label: 'Horarios' },
  { id: 'cargos', label: 'Cargos' },
  { id: 'departamentos', label: 'Departamentos' },
  { id: 'usuarios', label: 'Usuarios' },
  { id: 'roles', label: 'Roles' },
  { id: 'laboratorio', label: 'Laboratorio (LIS)' },
  { id: 'imagenologia', label: 'Imagenología (PACS)' },
  { id: 'hospitalizacion', label: 'Hospitalización y Camas' },
  { id: 'triaje', label: 'Triaje Urgencias (NEWS2)' },
  { id: 'odontologia', label: 'Odontología (FDI)' },
  { id: 'telemedicina', label: 'Telemedicina' },
  { id: 'facturacion', label: 'Baremos y Facturación' },
  { id: 'epidemiologia', label: 'Epidemiología (EPI-12)' },
  { id: 'auditoria', label: 'Auditoría HIPAA' },
  { id: 'portal_paciente', label: 'Portal del Paciente' }
];

export const RolesView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  const defaultPerms: Record<ModuloNombre, PermisosRol> = {
    dashboard: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
    pacientes: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    citas: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    tratamientos: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    medicamentos: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
    farmacia: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
    proveedores: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
    empleados: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
    horarios: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
    cargos: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
    departamentos: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
    usuarios: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
    roles: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
    laboratorio: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    imagenologia: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    hospitalizacion: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    triaje: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    odontologia: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    telemedicina: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    facturacion: { ver: true, crear: false, editar: false, eliminar: false, exportar: true },
    epidemiologia: { ver: true, crear: true, editar: false, eliminar: false, exportar: true },
    auditoria: { ver: false, crear: false, editar: false, eliminar: false, exportar: false },
    portal_paciente: { ver: true, crear: false, editar: false, eliminar: false, exportar: false },
    nutricion: { ver: true, crear: true, editar: true, eliminar: false, exportar: true },
    oftalmologia: { ver: true, crear: true, editar: true, eliminar: false, exportar: true }
  };


  const [formData, setFormData] = useState<Partial<Rol>>({
    nombre: 'Médico',
    descripcion: '',
    permisos: defaultPerms,
    estado: 'Activo'
  });

  const handleOpenCreate = () => {
    setEditingRol(null);
    setFormData({
      nombre: 'Médico',
      descripcion: '',
      permisos: defaultPerms,
      estado: 'Activo',
      fechaCreacion: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rol: Rol) => {
    setEditingRol(rol);
    setFormData({ ...rol });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (name === 'Administrador') {
      alert('No se puede eliminar el rol Administrador del sistema');
      return;
    }
    if (window.confirm(`¿Deseas eliminar el rol ${name}?`)) {
      deleteItem('roles', id);
    }
  };

  const handleTogglePermiso = (mod: ModuloNombre, action: keyof PermisosRol) => {
    const currentPerms = formData.permisos || defaultPerms;
    const modPerm = currentPerms[mod] || { ver: false, crear: false, editar: false, eliminar: false, exportar: false };
    
    setFormData({
      ...formData,
      permisos: {
        ...currentPerms,
        [mod]: {
          ...modPerm,
          [action]: !modPerm[action]
        }
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre) {
      alert('Por favor especifique el nombre del rol');
      return;
    }

    if (editingRol) {
      updateItem('roles', editingRol.id, formData);
    } else {
      createItem('roles', {
        ...formData,
        id: `rol-${Date.now()}`,
        fechaCreacion: new Date().toISOString().split('T')[0]
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Rol>[] = [
    {
      header: 'Nombre del Rol',
      accessor: (r) => (
        <div>
          <b style={{ color: '#0f172a' }}>{r.nombre}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.descripcion}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombre'
    },
    {
      header: 'Permisos Habilitados',
      accessor: (r) => {
        const allowedModules = Object.entries(r.permisos || {}).filter(([_, p]) => p.ver).length;
        return (
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb' }}>
            Acceso a {allowedModules} de 13 Módulos
          </span>
        );
      }
    },
    {
      header: 'Creación',
      accessor: 'fechaCreacion',
      isMono: true
    },
    {
      header: 'Estado',
      accessor: (r) => (
        <Badge variant={r.estado === 'Activo' ? 'success' : 'neutral'}>
          {r.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.roles}
        columns={columns}
        searchPlaceholder="Buscar por rol, descripción..."
        addNewLabel="Definir Nuevo Rol"
        onAddNew={handleOpenCreate}
        exportTitle="Roles_Permisos"
        actions={(r) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(r)}
              title="Configurar Matriz de Permisos"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            {r.nombre !== 'Administrador' && (
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-icon"
                onClick={() => handleDelete(r.id, r.nombre)}
                title="Eliminar Rol"
              >
                <Trash2 size={15} color="#dc2626" />
              </button>
            )}
          </div>
        )}
      />

      {/* Modal Matriz de Permisos */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRol ? `Configurar Permisos: ${editingRol.nombre}` : 'Definir Nuevo Rol y Matriz de Acceso'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Nombre del Rol *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value as any })}
                placeholder="Ej. Médico de Triaje"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Descripción del Perfil</label>
              <input
                type="text"
                className="form-input"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Funciones y responsabilidades de este rol en el CDI"
              />
            </div>
          </div>

          {/* Matriz de Permisos por Módulo */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.85rem' }}>
              Matriz de Permisos Granulares por Módulo
            </div>

            <div className="table-container" style={{ border: 'none' }}>
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Módulo del CDI</th>
                    <th style={{ textAlign: 'center' }}>Ver</th>
                    <th style={{ textAlign: 'center' }}>Crear</th>
                    <th style={{ textAlign: 'center' }}>Editar</th>
                    <th style={{ textAlign: 'center' }}>Eliminar</th>
                    <th style={{ textAlign: 'center' }}>Exportar</th>
                  </tr>
                </thead>
                <tbody>
                  {allModules.map((mod) => {
                    const p = formData.permisos?.[mod.id] || { ver: false, crear: false, editar: false, eliminar: false, exportar: false };
                    return (
                      <tr key={mod.id}>
                        <td>
                          <b>{mod.label}</b>
                        </td>
                        {(['ver', 'crear', 'editar', 'eliminar', 'exportar'] as (keyof PermisosRol)[]).map((action) => (
                          <td key={action} style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={Boolean(p[action])}
                              onChange={() => handleTogglePermiso(mod.id, action)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              Guardar Configuración de Rol
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
