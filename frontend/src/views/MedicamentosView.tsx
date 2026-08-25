import React, { useState } from 'react';
import { Medicamento } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Pill, Plus, Edit2, Trash2, AlertTriangle, ShieldCheck, ThermometerSnowflake } from 'lucide-react';

export const MedicamentosView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicamento | null>(null);

  const [formData, setFormData] = useState<Partial<Medicamento>>({
    codigo: '',
    nombreComercial: '',
    principioActivo: '',
    concentracion: '',
    presentacion: 'Tabletas',
    viaAdministracion: 'Oral',
    categoriaTerapeutica: '',
    stockActual: 100,
    stockMinimo: 50,
    stockMaximo: 500,
    ubicacionEstante: 'Estante A-1',
    requiereReceta: true,
    temperaturaAlmacenamiento: 'Ambiente (15-25°C)',
    estado: 'Disponible'
  });

  const handleOpenCreate = () => {
    setEditingMed(null);
    setFormData({
      codigo: `MED-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      nombreComercial: '',
      principioActivo: '',
      concentracion: '',
      presentacion: 'Tabletas',
      viaAdministracion: 'Oral',
      categoriaTerapeutica: '',
      stockActual: 100,
      stockMinimo: 50,
      stockMaximo: 500,
      ubicacionEstante: 'Estante A-1, Nivel 1',
      requiereReceta: true,
      temperaturaAlmacenamiento: 'Ambiente (15-25°C)',
      estado: 'Disponible'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med: Medicamento) => {
    setEditingMed(med);
    setFormData({ ...med });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Deseas eliminar el medicamento ${name}?`)) {
      deleteItem('medicamentos', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombreComercial || !formData.principioActivo) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const stockActual = Number(formData.stockActual || 0);
    const stockMinimo = Number(formData.stockMinimo || 0);
    let estado: Medicamento['estado'] = 'Disponible';
    if (stockActual === 0) estado = 'Agotado';
    else if (stockActual <= stockMinimo) estado = 'Stock Bajo';

    const payload = {
      ...formData,
      stockActual,
      stockMinimo,
      stockMaximo: Number(formData.stockMaximo || 500),
      estado
    };

    if (editingMed) {
      updateItem('medicamentos', editingMed.id, payload);
    } else {
      createItem('medicamentos', {
        ...payload,
        id: `med-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };

  const columns: Column<Medicamento>[] = [
    {
      header: 'Código / Fármaco',
      accessor: (m) => (
        <div>
          <b style={{ color: '#0f172a' }}>{m.nombreComercial}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <span style={{ fontFamily: 'JetBrains Mono', color: '#2563eb' }}>{m.codigo}</span> • {m.principioActivo} ({m.concentracion})
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombreComercial'
    },
    {
      header: 'Presentación / Vía',
      accessor: (m) => (
        <div>
          <div>{m.presentacion}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.viaAdministracion}</div>
        </div>
      )
    },
    {
      header: 'Categoría Terapéutica',
      accessor: 'categoriaTerapeutica',
      sortable: true
    },
    {
      header: 'Stock Actual / Mínimo',
      accessor: (m) => {
        const isLow = m.stockActual <= m.stockMinimo;
        return (
          <div>
            <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono', color: isLow ? '#dc2626' : '#0f172a' }}>
              {m.stockActual}
            </span>{' '}
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ min: {m.stockMinimo}</span>
          </div>
        );
      },
      sortable: true,
      sortKey: 'stockActual'
    },
    {
      header: 'Ubicación / Temp',
      accessor: (m) => (
        <div style={{ fontSize: '0.78rem' }}>
          <div>📍 {m.ubicacionEstante}</div>
          <div style={{ color: '#64748b' }}>❄️ {m.temperaturaAlmacenamiento}</div>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (m) => {
        const variant = m.estado === 'Disponible' ? 'success' : m.estado === 'Stock Bajo' ? 'urgent' : 'warning';
        return <Badge variant={variant}>{m.estado}</Badge>;
      },
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.medicamentos}
        columns={columns}
        searchPlaceholder="Buscar por nombre comercial, principio activo, código o categoría..."
        addNewLabel="Registrar Nuevo Medicamento"
        onAddNew={handleOpenCreate}
        exportTitle="Catalogo_Medicamentos"
        actions={(m) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(m)}
              title="Editar Medicamento"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(m.id, m.nombreComercial)}
              title="Eliminar Medicamento"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Crear / Editar Medicamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMed ? 'Editar Medicamento del Catálogo' : 'Registrar Nuevo Medicamento'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Código de Inventario *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej. MED-LOS-50"
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
                placeholder="Ej. Losartán Potásico 50mg"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Principio Activo *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.principioActivo}
                onChange={(e) => setFormData({ ...formData, principioActivo: e.target.value })}
                placeholder="Ej. Losartán"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Concentración</label>
              <input
                type="text"
                className="form-input"
                value={formData.concentracion}
                onChange={(e) => setFormData({ ...formData, concentracion: e.target.value })}
                placeholder="Ej. 50 mg o 100 UI/ml"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Presentación</label>
              <select
                className="form-select"
                value={formData.presentacion}
                onChange={(e) => setFormData({ ...formData, presentacion: e.target.value as any })}
              >
                <option value="Tabletas">Tabletas</option>
                <option value="Cápsulas">Cápsulas</option>
                <option value="Jarabe">Jarabe</option>
                <option value="Ampollas / Inyectable">Ampollas / Inyectable</option>
                <option value="Suspensión">Suspensión</option>
                <option value="Gotas">Gotas</option>
                <option value="Crema / Pomada">Crema / Pomada</option>
                <option value="Solución Intravenosa">Solución Intravenosa</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vía de Administración</label>
              <select
                className="form-select"
                value={formData.viaAdministracion}
                onChange={(e) => setFormData({ ...formData, viaAdministracion: e.target.value as any })}
              >
                <option value="Oral">Oral</option>
                <option value="Intravenosa">Intravenosa</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Tópica">Tópica</option>
                <option value="Sublingual">Sublingual</option>
                <option value="Oftálmica">Oftálmica</option>
                <option value="Inhalatoria">Inhalatoria</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Categoría Terapéutica</label>
              <input
                type="text"
                className="form-input"
                value={formData.categoriaTerapeutica}
                onChange={(e) => setFormData({ ...formData, categoriaTerapeutica: e.target.value })}
                placeholder="Ej. Antihipertensivo, Antibiótico"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ubicación en Estantería</label>
              <input
                type="text"
                className="form-input"
                value={formData.ubicacionEstante}
                onChange={(e) => setFormData({ ...formData, ubicacionEstante: e.target.value })}
                placeholder="Ej. Estante A-1, Nivel 2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Actual *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.stockActual}
                onChange={(e) => setFormData({ ...formData, stockActual: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Mínimo de Alerta *</label>
              <input
                type="number"
                className="form-input"
                required
                value={formData.stockMinimo}
                onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Temperatura de Almacenamiento</label>
              <select
                className="form-select"
                value={formData.temperaturaAlmacenamiento}
                onChange={(e) => setFormData({ ...formData, temperaturaAlmacenamiento: e.target.value as any })}
              >
                <option value="Ambiente (15-25°C)">Ambiente (15-25°C)</option>
                <option value="Refrigerado (2-8°C)">Refrigerado (2-8°C - Nevera)</option>
                <option value="Congelado">Congelado</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Requiere Receta Médica</label>
              <select
                className="form-select"
                value={formData.requiereReceta ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, requiereReceta: e.target.value === 'true' })}
              >
                <option value="true">Sí, requiere receta médica</option>
                <option value="false">No, venta/dispensación libre</option>
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
              {editingMed ? 'Guardar Cambios' : 'Registrar Fármaco'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
