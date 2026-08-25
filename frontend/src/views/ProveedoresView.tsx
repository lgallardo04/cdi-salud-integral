import React, { useState } from 'react';
import { Proveedor } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Truck, Plus, Edit2, Trash2, Star } from 'lucide-react';

export const ProveedoresView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProv, setEditingProv] = useState<Proveedor | null>(null);

  const [formData, setFormData] = useState<Partial<Proveedor>>({
    rif: '',
    razonSocial: '',
    nombreComercial: '',
    contactoPrincipal: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: 'Caracas',
    categoria: 'Medicamentos',
    plazoPagoDias: 30,
    calificacion: 5,
    estado: 'Activo'
  });

  const handleOpenCreate = () => {
    setEditingProv(null);
    setFormData({
      rif: 'J-00000000-0',
      razonSocial: '',
      nombreComercial: '',
      contactoPrincipal: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: 'Caracas',
      categoria: 'Medicamentos',
      plazoPagoDias: 30,
      calificacion: 5,
      estado: 'Activo'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prov: Proveedor) => {
    setEditingProv(prov);
    setFormData({ ...prov });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Deseas eliminar el proveedor ${name}?`)) {
      deleteItem('proveedores', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.rif || !formData.razonSocial) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const payload = {
      ...formData,
      plazoPagoDias: Number(formData.plazoPagoDias || 30),
      calificacion: Number(formData.calificacion || 5) as any
    };

    if (editingProv) {
      updateItem('proveedores', editingProv.id, payload);
    } else {
      createItem('proveedores', {
        ...payload,
        id: `prov-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Proveedor>[] = [
    {
      header: 'RIF / RUC',
      accessor: 'rif',
      isMono: true,
      sortable: true
    },
    {
      header: 'Empresa / Razón Social',
      accessor: (p) => (
        <div>
          <b style={{ color: '#0f172a' }}>{p.nombreComercial}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.razonSocial}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombreComercial'
    },
    {
      header: 'Categoría',
      accessor: (p) => (
        <Badge variant="info">
          {p.categoria}
        </Badge>
      ),
      sortable: true,
      sortKey: 'categoria'
    },
    {
      header: 'Contacto / Teléfono',
      accessor: (p) => (
        <div>
          <div>{p.contactoPrincipal}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.telefono} • {p.email}</div>
        </div>
      )
    },
    {
      header: 'Ubicación / Ciudad',
      accessor: (p) => `${p.ciudad} - ${p.direccion}`
    },
    {
      header: 'Calificación',
      accessor: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#eab308' }}>
          <Star size={14} fill="#eab308" />
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.calificacion} / 5</span>
        </div>
      ),
      sortable: true,
      sortKey: 'calificacion'
    },
    {
      header: 'Estado',
      accessor: (p) => (
        <Badge variant={p.estado === 'Activo' ? 'success' : 'neutral'}>
          {p.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.proveedores}
        columns={columns}
        searchPlaceholder="Buscar por RIF, empresa, contacto o ciudad..."
        addNewLabel="Registrar Nuevo Proveedor"
        onAddNew={handleOpenCreate}
        exportTitle="Proveedores"
        actions={(p) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(p)}
              title="Editar Proveedor"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(p.id, p.nombreComercial)}
              title="Eliminar Proveedor"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Crear / Editar Proveedor */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProv ? 'Editar Proveedor Farmacéutico' : 'Registrar Nuevo Proveedor'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">RIF / Identificación Fiscal *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.rif}
                onChange={(e) => setFormData({ ...formData, rif: e.target.value })}
                placeholder="Ej. J-12345678-9"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombre Comercial *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombreComercial}
                onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                placeholder="Ej. Laboratorios Behrens"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Razón Social *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                placeholder="Ej. Laboratorios Behrens C.A."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Persona de Contacto</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactoPrincipal}
                onChange={(e) => setFormData({ ...formData, contactoPrincipal: e.target.value })}
                placeholder="Ej. Lic. Carlos Morales"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría de Suministro</label>
              <select
                className="form-select"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
              >
                <option value="Medicamentos">Medicamentos</option>
                <option value="Material Médico-Quirúrgico">Material Médico-Quirúrgico</option>
                <option value="Reactivos de Laboratorio">Reactivos de Laboratorio</option>
                <option value="Equipos y Mantenimiento">Equipos y Mantenimiento</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej. +58 212-2081111"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej. ventas@laboratorio.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <input
                type="text"
                className="form-input"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                placeholder="Ej. Caracas"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dirección Fiscal / Galpón</label>
              <input
                type="text"
                className="form-input"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Zona industrial o avenida"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Plazo de Pago (Días)</label>
              <input
                type="number"
                className="form-input"
                value={formData.plazoPagoDias}
                onChange={(e) => setFormData({ ...formData, plazoPagoDias: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Calificación (1 a 5 estrellas)</label>
              <select
                className="form-select"
                value={formData.calificacion}
                onChange={(e) => setFormData({ ...formData, calificacion: Number(e.target.value) as any })}
              >
                <option value={5}>5 Estrellas - Excelente cumplimiento</option>
                <option value={4}>4 Estrellas - Muy bueno</option>
                <option value={3}>3 Estrellas - Regular</option>
                <option value={2}>2 Estrellas - Deficiente</option>
                <option value={1}>1 Estrella - No recomendado</option>
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
              {editingProv ? 'Guardar Cambios' : 'Registrar Proveedor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
