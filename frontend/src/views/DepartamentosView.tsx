import React, { useState } from 'react';
import { Departamento } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Building2, Plus, Edit2, Trash2, Bed, DoorOpen } from 'lucide-react';

export const DepartamentosView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDep, setEditingDep] = useState<Departamento | null>(null);

  const [formData, setFormData] = useState<Partial<Departamento>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    piso: 'Piso 1',
    responsable: '',
    capacidadCamas: 0,
    consultorios: 1,
    telefonoInterno: '',
    estado: 'Activo'
  });

  const handleOpenCreate = () => {
    setEditingDep(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      piso: 'Piso 1 - Módulo C',
      responsable: '',
      capacidadCamas: 4,
      consultorios: 2,
      telefonoInterno: '108',
      estado: 'Activo'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dep: Departamento) => {
    setEditingDep(dep);
    setFormData({ ...dep });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Deseas eliminar el departamento ${name}?`)) {
      deleteItem('departamentos', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombre) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const payload = {
      ...formData,
      capacidadCamas: Number(formData.capacidadCamas || 0),
      consultorios: Number(formData.consultorios || 1)
    };

    if (editingDep) {
      updateItem('departamentos', editingDep.id, payload);
    } else {
      createItem('departamentos', {
        ...payload,
        id: `dep-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Departamento>[] = [
    {
      header: 'Código',
      accessor: 'codigo',
      isMono: true,
      sortable: true
    },
    {
      header: 'Departamento / Servicio',
      accessor: (d) => (
        <div>
          <b style={{ color: '#0f172a' }}>{d.nombre}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.descripcion}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombre'
    },
    {
      header: 'Ubicación / Piso',
      accessor: 'piso',
      sortable: true
    },
    {
      header: 'Jefe / Responsable',
      accessor: 'responsable',
      sortable: true
    },
    {
      header: 'Infraestructura',
      accessor: (d) => (
        <div style={{ fontSize: '0.78rem' }}>
          <div>🛏️ <b>{d.capacidadCamas}</b> Camas</div>
          <div>🚪 <b>{d.consultorios}</b> Consultorios</div>
        </div>
      )
    },
    {
      header: 'Ext. Telefónica',
      accessor: 'telefonoInterno',
      isMono: true
    },
    {
      header: 'Estado',
      accessor: (d) => (
        <Badge variant={d.estado === 'Activo' ? 'success' : d.estado === 'Mantenimiento' ? 'warning' : 'neutral'}>
          {d.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.departamentos}
        columns={columns}
        searchPlaceholder="Buscar por nombre de departamento, código, responsable..."
        addNewLabel="Crear Nuevo Departamento"
        onAddNew={handleOpenCreate}
        exportTitle="Departamentos_CDI"
        actions={(d) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(d)}
              title="Editar Departamento"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(d.id, d.nombre)}
              title="Eliminar Departamento"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Crear / Editar Departamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDep ? 'Editar Departamento / Área' : 'Crear Nuevo Departamento'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Código de Área *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                placeholder="Ej. PEDIAT"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Departamento *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Pediatría y Neonatología"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Descripción de Servicios</label>
              <input
                type="text"
                className="form-input"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Alcance y atenciones ofrecidas en el área"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ubicación / Piso</label>
              <input
                type="text"
                className="form-input"
                value={formData.piso}
                onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                placeholder="Ej. Piso 2 - Ala Sur"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Médico o Personal Responsable</label>
              <input
                type="text"
                className="form-input"
                value={formData.responsable}
                onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                placeholder="Ej. Dra. Carmen Velásquez"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacidad de Camas</label>
              <input
                type="number"
                className="form-input"
                value={formData.capacidadCamas}
                onChange={(e) => setFormData({ ...formData, capacidadCamas: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número de Consultorios</label>
              <input
                type="number"
                className="form-input"
                value={formData.consultorios}
                onChange={(e) => setFormData({ ...formData, consultorios: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Extensión Telefónica Interna</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefonoInterno}
                onChange={(e) => setFormData({ ...formData, telefonoInterno: e.target.value })}
                placeholder="Ej. 109"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado Operativo</label>
              <select
                className="form-select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              >
                <option value="Activo">Activo y Operativo</option>
                <option value="Mantenimiento">En Mantenimiento</option>
                <option value="Inactivo">Inactivo</option>
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
              {editingDep ? 'Guardar Cambios' : 'Crear Departamento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
