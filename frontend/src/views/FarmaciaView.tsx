import React, { useState } from 'react';
import { MovimientoFarmacia } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { HeartPulse, Plus, ArrowDownLeft, ArrowUpRight, AlertOctagon, Trash2, PackageSearch, FileInput, CheckSquare, Layers } from 'lucide-react';
import { InventarioDashboard } from '../components/farmacia/InventarioDashboard';
import { RecepcionRecipe } from '../components/farmacia/RecepcionRecipe';
import { DispensacionEstacion } from '../components/farmacia/DispensacionEstacion';

export const FarmaciaView: React.FC = () => {
  const { data, createItem, deleteItem, addToast } = useData();
  const [activeTab, setActiveTab] = useState<'kardex' | 'fefo' | 'recetas' | 'dispensacion'>('kardex');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<MovimientoFarmacia>>({
    numeroTransaccion: '',
    tipoMovimiento: 'Salida / Despacho',
    medicamentoId: '',
    cantidad: 1,
    lote: 'L-250201',
    fechaVencimiento: '2027-01-01',
    proveedorId: '',
    pacienteId: '',
    responsableEmpleadoId: '',
    fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
    motivo: '',
    observaciones: ''
  });

  const handleOpenCreate = () => {
    setFormData({
      numeroTransaccion: `TRX-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      tipoMovimiento: 'Salida / Despacho',
      medicamentoId: data.medicamentos[0]?.id || '',
      cantidad: 1,
      lote: 'L-250310',
      fechaVencimiento: '2027-06-30',
      proveedorId: data.proveedores[0]?.id || '',
      pacienteId: data.pacientes[0]?.id || '',
      responsableEmpleadoId: data.empleados[4]?.id || data.empleados[0]?.id || '',
      fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      motivo: 'Dispensación médica ambulatoria a paciente',
      observaciones: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, trx: string) => {
    if (window.confirm(`¿Deseas revertir o eliminar el registro de movimiento ${trx}?`)) {
      deleteItem('movimientosFarmacia', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicamentoId || !formData.cantidad || !formData.lote) {
      addToast('Por favor complete todos los campos obligatorios', 'warning');
      return;
    }

    const med = data.medicamentos.find((m) => m.id === formData.medicamentoId);
    const prov = data.proveedores.find((p) => p.id === formData.proveedorId);
    const pac = data.pacientes.find((p) => p.id === formData.pacienteId);
    const resp = data.empleados.find((e) => e.id === formData.responsableEmpleadoId);

    const payload: Partial<MovimientoFarmacia> = {
      ...formData,
      medicamentoNombre: med ? med.nombreComercial : '',
      proveedorNombre: prov ? prov.nombreComercial : undefined,
      pacienteNombre: pac ? `${pac.nombres} ${pac.apellidos}` : undefined,
      responsableNombre: resp ? `${resp.nombres} ${resp.apellidos}` : 'Farmacéutico',
      cantidad: Number(formData.cantidad)
    };

    createItem('movimientosFarmacia', {
      ...payload,
      id: `mov-${Date.now()}`
    });

    addToast('Movimiento de Kardex registrado exitosamente', 'success');
    setIsModalOpen(false);
  };

  const columns: Column<MovimientoFarmacia>[] = [
    {
      header: 'N° Transacción / Fecha',
      accessor: (m) => (
        <div>
          <b style={{ fontFamily: 'JetBrains Mono', color: '#0f172a' }}>{m.numeroTransaccion}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.fechaHora}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'fechaHora'
    },
    {
      header: 'Tipo Movimiento',
      accessor: (m) => {
        if (m.tipoMovimiento.startsWith('Entrada')) {
          return (
            <Badge variant="success" icon={<ArrowDownLeft size={12} />}>
              {m.tipoMovimiento}
            </Badge>
          );
        }
        if (m.tipoMovimiento.startsWith('Salida')) {
          return (
            <Badge variant="info" icon={<ArrowUpRight size={12} />}>
              {m.tipoMovimiento}
            </Badge>
          );
        }
        return (
          <Badge variant="warning" icon={<AlertOctagon size={12} />}>
            {m.tipoMovimiento}
          </Badge>
        );
      },
      sortable: true,
      sortKey: 'tipoMovimiento'
    },
    {
      header: 'Medicamento / Lote',
      accessor: (m) => (
        <div>
          <b style={{ color: '#0f172a' }}>{m.medicamentoNombre}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
            Lote: {m.lote} • Vence: {m.fechaVencimiento}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'medicamentoNombre'
    },
    {
      header: 'Cantidad',
      accessor: (m) => (
        <span
          style={{
            fontWeight: 700,
            fontFamily: 'JetBrains Mono',
            color: m.tipoMovimiento.startsWith('Entrada') ? '#16a34a' : '#dc2626'
          }}
        >
          {m.tipoMovimiento.startsWith('Entrada') ? `+${m.cantidad}` : `-${m.cantidad}`} und.
        </span>
      ),
      sortable: true,
      sortKey: 'cantidad'
    },
    {
      header: 'Destino / Origen',
      accessor: (m) => (
        <div>
          {m.pacienteNombre && <div>👤 Paciente: {m.pacienteNombre}</div>}
          {m.proveedorNombre && <div>🏢 Proveedor: {m.proveedorNombre}</div>}
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Resp: {m.responsableNombre}</div>
        </div>
      )
    },
    {
      header: 'Motivo',
      accessor: 'motivo'
    }
  ];

  return (
    <div className="view-container">
      {/* Sub-pestañas de Farmacia Comunitaria CDI */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'kardex' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('kardex')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Layers size={14} />
          Kardex & Movimientos
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'fefo' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('fefo')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <PackageSearch size={14} />
          Monitor FEFO & Lotes
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'recetas' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('recetas')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <FileInput size={14} />
          Recepción de Récipes
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'dispensacion' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dispensacion')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <CheckSquare size={14} />
          Estación de Dispensación
        </button>
      </div>

      {activeTab === 'kardex' && (
        <DataTable
          data={data.movimientosFarmacia}
          columns={columns}
          searchPlaceholder="Buscar por número de transacción, medicamento, lote, paciente..."
          addNewLabel="Registrar Movimiento de Farmacia"
          onAddNew={handleOpenCreate}
          exportTitle="Movimientos_Farmacia"
          actions={(m) => (
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(m.id, m.numeroTransaccion)}
              title="Eliminar Registro"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          )}
        />
      )}

      {activeTab === 'fefo' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <InventarioDashboard />
        </div>
      )}

      {activeTab === 'recetas' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <RecepcionRecipe />
        </div>
      )}

      {activeTab === 'dispensacion' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <DispensacionEstacion />
        </div>
      )}

      {/* Modal Registrar Movimiento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Movimiento de Farmacia"
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Tipo de Movimiento *</label>
              <select
                className="form-select"
                required
                value={formData.tipoMovimiento}
                onChange={(e) => setFormData({ ...formData, tipoMovimiento: e.target.value as any })}
              >
                <option value="Salida / Despacho">Salida / Despacho a Paciente</option>
                <option value="Entrada / Compra">Entrada / Recepción de Proveedor</option>
                <option value="Ajuste de Inventario">Ajuste de Inventario Físico</option>
                <option value="Merma / Vencimiento">Merma o Descarte por Vencimiento</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Medicamento *</label>
              <select
                className="form-select"
                required
                value={formData.medicamentoId}
                onChange={(e) => setFormData({ ...formData, medicamentoId: e.target.value })}
              >
                {data.medicamentos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombreComercial} (Stock actual: {m.stockActual})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cantidad (Unidades) *</label>
              <input
                type="number"
                className="form-input"
                required
                min={1}
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Lote *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.lote}
                onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                placeholder="Ej. L-250812"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Vencimiento del Lote *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.fechaVencimiento}
                onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Responsable Farmacéutico *</label>
              <select
                className="form-select"
                required
                value={formData.responsableEmpleadoId}
                onChange={(e) => setFormData({ ...formData, responsableEmpleadoId: e.target.value })}
              >
                {data.empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} ({emp.cargoTitulo})
                  </option>
                ))}
              </select>
            </div>

            {formData.tipoMovimiento?.startsWith('Salida') && (
              <div className="form-group">
                <label className="form-label">Paciente Receptor</label>
                <select
                  className="form-select"
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
            )}

            {formData.tipoMovimiento?.startsWith('Entrada') && (
              <div className="form-group">
                <label className="form-label">Proveedor Distribuidor</label>
                <select
                  className="form-select"
                  value={formData.proveedorId}
                  onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                >
                  <option value="">Seleccionar Proveedor</option>
                  {data.proveedores.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.nombreComercial} ({pr.rif})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Motivo o Justificación *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Ej. Despacho por recipe, Reposición mensual"
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
              Registrar Movimiento
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
