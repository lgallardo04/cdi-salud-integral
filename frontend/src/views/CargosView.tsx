import React, { useState } from 'react';
import { Cargo } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';

export const CargosView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);

  const [formData, setFormData] = useState<Partial<Cargo>>({
    titulo: '',
    departamentoId: '',
    nivelJerarquico: 'Médico Especialista',
    salarioBase: 800,
    requisitos: '',
    descripcion: '',
    estado: 'Activo'
  });

  const handleOpenCreate = () => {
    setEditingCargo(null);
    setFormData({
      titulo: '',
      departamentoId: data.departamentos[0]?.id || '',
      nivelJerarquico: 'Médico Especialista',
      salarioBase: 800,
      requisitos: '',
      descripcion: '',
      estado: 'Activo'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({ ...cargo });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Deseas eliminar el cargo ${name}?`)) {
      deleteItem('cargos', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const dep = data.departamentos.find((d) => d.id === formData.departamentoId);

    const payload: Partial<Cargo> = {
      ...formData,
      departamentoNombre: dep ? dep.nombre : '',
      salarioBase: Number(formData.salarioBase || 0)
    };

    if (editingCargo) {
      updateItem('cargos', editingCargo.id, payload);
    } else {
      createItem('cargos', {
        ...payload,
        id: `car-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Cargo>[] = [
    {
      header: 'Título del Cargo',
      accessor: (c) => (
        <div>
          <b style={{ color: '#0f172a' }}>{c.titulo}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.descripcion}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'titulo'
    },
    {
      header: 'Nivel Jerárquico',
      accessor: (c) => (
        <Badge variant={c.nivelJerarquico === 'Directivo' ? 'urgent' : c.nivelJerarquico.startsWith('Médico') ? 'info' : 'neutral'}>
          {c.nivelJerarquico}
        </Badge>
      ),
      sortable: true,
      sortKey: 'nivelJerarquico'
    },
    {
      header: 'Departamento',
      accessor: 'departamentoNombre',
      sortable: true
    },
    {
      header: 'Salario Base (USD / Ref)',
      accessor: (c) => (
        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#16a34a' }}>
          ${c.salarioBase.toFixed(2)}
        </span>
      ),
      sortable: true,
      sortKey: 'salarioBase'
    },
    {
      header: 'Requisitos',
      accessor: (c) => (
        <div style={{ fontSize: '0.75rem', color: '#475569', maxWidth: '300px' }}>
          {c.requisitos}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (c) => (
        <Badge variant={c.estado === 'Activo' ? 'success' : 'neutral'}>
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
        data={data.cargos}
        columns={columns}
        searchPlaceholder="Buscar por título de cargo, nivel, departamento..."
        addNewLabel="Crear Nuevo Cargo"
        onAddNew={handleOpenCreate}
        exportTitle="Estructura_Cargos"
        actions={(c) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(c)}
              title="Editar Cargo"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(c.id, c.titulo)}
              title="Eliminar Cargo"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Crear / Editar Cargo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCargo ? 'Editar Definición de Cargo' : 'Crear Nuevo Cargo'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Título del Cargo *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej. Médico Especialista en Traumatología"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nivel Jerárquico *</label>
              <select
                className="form-select"
                value={formData.nivelJerarquico}
                onChange={(e) => setFormData({ ...formData, nivelJerarquico: e.target.value as any })}
              >
                <option value="Directivo">Directivo</option>
                <option value="Médico Especialista">Médico Especialista</option>
                <option value="Asistencial">Asistencial</option>
                <option value="Técnico">Técnico</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Apoyo">Apoyo</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Departamento *</label>
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
              <label className="form-label">Salario Base Mensual ($)</label>
              <input
                type="number"
                className="form-input"
                value={formData.salarioBase}
                onChange={(e) => setFormData({ ...formData, salarioBase: Number(e.target.value) })}
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
              <label className="form-label">Requisitos Profesionales / Académicos</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.requisitos}
                onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                placeholder="Títulos, postgrados, certificaciones requeridas"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Descripción de Funciones</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Responsabilidades y deberes del puesto"
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
              {editingCargo ? 'Guardar Cambios' : 'Crear Cargo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
