import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FacturaHospitalaria, ServicioTarifa, ItemFactura } from '../types';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Printer,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Trash2,
  Building2,
  ShieldCheck,
  Percent,
  Receipt
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const FacturacionView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<'facturas' | 'baremos'>('facturas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalidad, setFilterModalidad] = useState<string>('Todas');

  // Modales
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<FacturaHospitalaria | null>(null);

  // Tasa de cambio oficial USD -> Bs
  const tasaCambioBs = 39.5;

  // Formulario Factura
  const [facturaForm, setFacturaForm] = useState({
    codigoFactura: '',
    pacienteId: '',
    modalidadPago: '100% Gratuito CDI (Exonerado)' as any,
    coberturaSeguroPorcentaje: 0,
    nombreAseguradora: '',
    items: [
      {
        servicioId: 'tar-1',
        concepto: 'Consulta Médica General / Triaje',
        servicioNombre: 'Consulta Médica General / Triaje',
        cantidad: 1,
        precioUnitarioUSD: 0,
        subtotalUSD: 0,
        totalUSD: 0
      }
    ] as ItemFactura[],
    notas: 'Atención médica integral gratuita garantizada por el Sistema Público Nacional de Salud.'
  });

  const canCreate = hasPermission('facturacion', 'crear');
  const facturas = data.facturas || [];
  const tarifas = data.serviciosTarifas || [];

  const handleOpenCreateInvoice = () => {
    const nextCode = `FAC-2025-${String(facturas.length + 101).padStart(4, '0')}`;
    setFacturaForm({
      codigoFactura: nextCode,
      pacienteId: data.pacientes[0]?.id || '',
      modalidadPago: '100% Gratuito CDI (Exonerado)',
      coberturaSeguroPorcentaje: 0,
      nombreAseguradora: '',
      items: [
        {
          servicioId: tarifas[0]?.id || 'tar-1',
          concepto: tarifas[0]?.nombre || 'Consulta Médica',
          servicioNombre: tarifas[0]?.nombre || 'Consulta Médica',
          cantidad: 1,
          precioUnitarioUSD: 0,
          subtotalUSD: 0,
          totalUSD: 0
        }
      ],
      notas: 'Atención médica integral gratuita garantizada por el Sistema Público Nacional de Salud (Misión Barrio Adentro).'
    });
    setIsInvoiceModalOpen(true);
  };

  const handleAddItem = () => {
    const defaultTarifa = tarifas[0];
    const precio = facturaForm.modalidadPago === '100% Gratuito CDI (Exonerado)' ? 0 : defaultTarifa?.precioBaseUSD || 0;
    setFacturaForm({
      ...facturaForm,
      items: [
        ...facturaForm.items,
        {
          servicioId: defaultTarifa?.id || '',
          concepto: defaultTarifa?.nombre || 'Servicio Hospitalario',
          servicioNombre: defaultTarifa?.nombre || 'Servicio Hospitalario',
          cantidad: 1,
          precioUnitarioUSD: precio,
          subtotalUSD: precio,
          totalUSD: precio
        }
      ]
    });
  };


  const handleRemoveItem = (index: number) => {
    if (facturaForm.items.length === 1) return;
    const updated = facturaForm.items.filter((_, i) => i !== index);
    setFacturaForm({ ...facturaForm, items: updated });
  };

  const handleItemTarifaChange = (index: number, tarifaId: string) => {
    const tarifa = tarifas.find((t) => t.id === tarifaId);
    if (!tarifa) return;

    const isExonerado = facturaForm.modalidadPago === '100% Gratuito CDI (Exonerado)';
    const updated = [...facturaForm.items];
    const precio = isExonerado ? 0 : tarifa.precioBaseUSD;
    const sub = precio * (updated[index].cantidad || 1);
    updated[index] = {
      ...updated[index],
      servicioId: tarifa.id,
      concepto: tarifa.nombre,
      servicioNombre: tarifa.nombre,
      precioUnitarioUSD: precio,
      subtotalUSD: sub,
      totalUSD: sub
    };
    setFacturaForm({ ...facturaForm, items: updated });
  };

  const handleItemCantidadChange = (index: number, cantidad: number) => {
    const updated = [...facturaForm.items];
    const cant = Math.max(1, cantidad);
    const sub = (updated[index].precioUnitarioUSD || 0) * cant;
    updated[index] = {
      ...updated[index],
      cantidad: cant,
      subtotalUSD: sub,
      totalUSD: sub
    };
    setFacturaForm({ ...facturaForm, items: updated });
  };

  const handleModalidadPagoChange = (mod: any) => {
    const isExonerado = mod === '100% Gratuito CDI (Exonerado)';
    const updatedItems = facturaForm.items.map((item) => {
      const tarifa = tarifas.find((t) => t.id === item.servicioId);
      const precio = isExonerado ? 0 : tarifa?.precioBaseUSD || 0;
      const sub = precio * item.cantidad;
      return {
        ...item,
        precioUnitarioUSD: precio,
        subtotalUSD: sub,
        totalUSD: sub
      };
    });


    setFacturaForm({
      ...facturaForm,
      modalidadPago: mod,
      items: updatedItems,
      notas: isExonerado
        ? 'Atención médica integral gratuita garantizada por el Sistema Público Nacional de Salud.'
        : 'Facturación hospitalaria estándar.'
    });
  };

  const calculateTotals = () => {
    const totalUSD = facturaForm.items.reduce((sum, it) => sum + (it.subtotalUSD || 0), 0);
    const totalBs = Math.round(totalUSD * tasaCambioBs * 100) / 100;
    return { totalUSD, totalBs };
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const paciente = data.pacientes.find((p) => p.id === facturaForm.pacienteId);
    if (!paciente) {
      addToast('Debe seleccionar un paciente', 'error');
      return;
    }

    const { totalUSD, totalBs } = calculateTotals();

    const newFactura: FacturaHospitalaria = {
      id: `fac-${Date.now()}`,
      codigoFactura: facturaForm.codigoFactura,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteCedula: paciente.cedula,
      fechaEmision: new Date().toISOString().substring(0, 10),
      items: facturaForm.items,
      totalUSD,
      totalBs,
      tasaCambioBs,
      modalidadPago: facturaForm.modalidadPago,
      coberturaSeguroPorcentaje: facturaForm.coberturaSeguroPorcentaje,
      nombreAseguradora: facturaForm.nombreAseguradora,
      estadoPago: facturaForm.modalidadPago === '100% Gratuito CDI (Exonerado)' ? 'Exonerado / Gratuito' : 'Pagada',
      notas: facturaForm.notas
    };

    createItem('facturas', newFactura);
    setIsInvoiceModalOpen(false);
  };

  const handleOpenPreview = (fac: FacturaHospitalaria) => {
    setSelectedFactura(fac);
    setIsPreviewModalOpen(true);
  };

  const totalFacturadoUSD = facturas.reduce((sum, f) => sum + f.totalUSD, 0);
  const totalExoneradas = facturas.filter((f) => f.modalidadPago === '100% Gratuito CDI (Exonerado)').length;

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <Receipt size={24} />
          </div>
          <div>
            <h1 className="view-title">Facturación, Baremos y Servicios Hospitalarios</h1>
            <p className="view-subtitle">
              Gestión de tarifas hospitalarias, facturación multi-moneda (USD/Bs) y exoneraciones de gratuidad CDI 100%.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          {canCreate && (
            <button type="button" className="btn btn-primary" onClick={handleOpenCreateInvoice}>
              <Plus size={16} />
              <span>Emitir Factura / Comprobante</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <Receipt size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Comprobantes</span>
            <span className="kpi-value">{facturas.length}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Atenciones Gratuitas CDI</span>
            <span className="kpi-value">{totalExoneradas} (100% Gratuito)</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <DollarSign size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tarifas Registradas</span>
            <span className="kpi-value">{tarifas.length} Servicios</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
            <Building2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Tasa Oficial BCV</span>
            <span className="kpi-value font-mono">1 USD = {tasaCambioBs} Bs</span>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'facturas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('facturas')}
        >
          <Receipt size={15} />
          <span>Comprobantes y Facturación Hospitalaria</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'baremos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('baremos')}
        >
          <DollarSign size={15} />
          <span>Catálogo de Baremos y Tarifas ({tarifas.length})</span>
        </button>
      </div>

      {/* Pestaña 1: Facturas */}
      {activeTab === 'facturas' && (
        <div className="card table-card">
          <div className="table-container auto-table">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>N° Factura</th>
                  <th>Paciente</th>
                  <th>Fecha</th>
                  <th>Modalidad de Pago</th>
                  <th>Total USD</th>
                  <th>Total Bs</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((fac) => (
                  <tr key={fac.id}>
                    <td>
                      <span className="font-mono font-bold" style={{ color: '#2563eb' }}>
                        {fac.codigoFactura || fac.numeroFactura}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{fac.pacienteNombre}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>C.I: {fac.pacienteCedula}</div>
                      </div>
                    </td>
                    <td className="table-mono font-mono" style={{ fontSize: '0.8rem' }}>{fac.fechaEmision}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: (fac.modalidadPago || fac.modalidadCobertura || '').includes('Gratuito') ? '#dcfce7' : '#eff6ff',
                          color: (fac.modalidadPago || fac.modalidadCobertura || '').includes('Gratuito') ? '#166534' : '#1d4ed8'
                        }}
                      >
                        {fac.modalidadPago || fac.modalidadCobertura}
                      </span>
                    </td>

                    <td className="font-mono font-bold" style={{ color: '#0f172a' }}>
                      ${fac.totalUSD.toFixed(2)}
                    </td>
                    <td className="font-mono text-muted">
                      {fac.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs
                    </td>
                    <td>
                      <Badge type={fac.estadoPago.includes('Exonerado') ? 'success' : 'info'}>
                        {fac.estadoPago}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm"
                          title="Ver / Imprimir Factura Oficial"
                          onClick={() => handleOpenPreview(fac)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm text-danger"
                          title="Eliminar Factura"
                          onClick={() => deleteItem('facturas', fac.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pestaña 2: Catálogo de Baremos y Tarifas */}
      {activeTab === 'baremos' && (
        <div className="card table-card">
          <div className="table-container auto-table">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Servicio / Procedimiento</th>
                  <th>Categoría</th>
                  <th>Precio Referencial USD</th>
                  <th>Precio en Bs (Tasa BCV)</th>
                  <th>Exoneración CDI</th>
                </tr>
              </thead>
              <tbody>
                {tarifas.map((tar) => (
                  <tr key={tar.id}>
                    <td className="font-mono font-bold" style={{ color: '#2563eb' }}>
                      {tar.codigo}
                    </td>
                    <td>
                      <strong>{tar.nombre}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tar.descripcion}</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{tar.categoria}</span>
                    </td>
                    <td className="font-mono font-bold" style={{ color: '#15803d' }}>
                      ${tar.precioBaseUSD.toFixed(2)} USD
                    </td>
                    <td className="font-mono text-muted">
                      {(tar.precioBaseUSD * tasaCambioBs).toFixed(2)} Bs
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={12} />
                        100% Gratuito en CDI
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nueva Factura */}
      {isInvoiceModalOpen && (
        <Modal
          title="Emitir Comprobante / Factura Hospitalaria"
          onClose={() => setIsInvoiceModalOpen(false)}
          size="lg"
        >
          <form onSubmit={handleSaveInvoice} className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Número de Comprobante</label>
                <input
                  type="text"
                  className="input font-mono"
                  value={facturaForm.codigoFactura}
                  onChange={(e) => setFacturaForm({ ...facturaForm, codigoFactura: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Paciente</label>
                <select
                  className="input"
                  value={facturaForm.pacienteId}
                  onChange={(e) => setFacturaForm({ ...facturaForm, pacienteId: e.target.value })}
                  required
                >
                  <option value="">Seleccione paciente...</option>
                  {data.pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} ({p.cedula})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Modalidad de Cobertura</label>
                <select
                  className="input"
                  value={facturaForm.modalidadPago}
                  onChange={(e) => handleModalidadPagoChange(e.target.value)}
                >
                  <option value="100% Gratuito CDI (Exonerado)">100% Gratuito CDI (Exonerado SPNS)</option>
                  <option value="Seguro Médico / Póliza">Seguro Médico / Póliza de Salud</option>
                  <option value="Privado / Particular">Privado / Particular</option>
                </select>
              </div>
            </div>

            {/* Lista de Items / Servicios Facturados */}
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Servicios y Procedimientos</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem}>
                  <Plus size={14} />
                  <span>Agregar Servicio</span>
                </button>
              </div>

              <table className="clinical-table" style={{ fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '45%' }}>Servicio Hospitalario</th>
                    <th style={{ width: '15%' }}>Cantidad</th>
                    <th style={{ width: '20%' }}>Precio Unit. (USD)</th>
                    <th style={{ width: '15%' }}>Subtotal (USD)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {facturaForm.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <select
                          className="input input-sm"
                          value={item.servicioId}
                          onChange={(e) => handleItemTarifaChange(idx, e.target.value)}
                        >
                          {tarifas.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.nombre} ({t.categoria})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          className="input input-sm font-mono"
                          value={item.cantidad}
                          onChange={(e) => handleItemCantidadChange(idx, Number(e.target.value))}
                        />
                      </td>
                      <td className="font-mono">
                        ${item.precioUnitarioUSD.toFixed(2)}
                      </td>
                      <td className="font-mono font-bold" style={{ color: '#15803d' }}>
                        ${(item.subtotalUSD ?? item.totalUSD ?? 0).toFixed(2)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon btn-sm text-danger"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={facturaForm.items.length === 1}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totales de Facturación */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total a Facturar:</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }} className="font-mono">
                    ${calculateTotals().totalUSD.toFixed(2)} USD
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }} className="font-mono">
                    {calculateTotals().totalBs.toFixed(2)} Bs (Tasa: {tasaCambioBs})
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Observaciones y Justificación de Cobertura</label>
              <textarea
                className="input"
                rows={2}
                value={facturaForm.notas}
                onChange={(e) => setFacturaForm({ ...facturaForm, notas: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsInvoiceModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Emitir Comprobante
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Vista Previa / Factura Oficial Imprimible */}
      {isPreviewModalOpen && selectedFactura && (
        <Modal
          title={`Comprobante Hospitalario - ${selectedFactura.codigoFactura || selectedFactura.numeroFactura}`}
          onClose={() => setIsPreviewModalOpen(false)}
          size="lg"
        >
          <div style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  CENTRO DE DIAGNÓSTICO INTEGRAL (CDI)
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Sistema Público Nacional de Salud • RIF: G-20008492-1
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="font-mono font-bold" style={{ fontSize: '1.1rem', color: '#2563eb' }}>
                  {selectedFactura.codigoFactura || selectedFactura.numeroFactura}
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Fecha: {selectedFactura.fechaEmision}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Paciente:</span>
                <strong>{selectedFactura.pacienteNombre}</strong> (C.I: {selectedFactura.pacienteCedula})
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Modalidad de Atención:</span>
                <strong style={{ color: '#166534' }}>{selectedFactura.modalidadPago || selectedFactura.modalidadCobertura}</strong>
              </div>
            </div>

            <table className="clinical-table" style={{ width: '100%', marginBottom: '1.5rem' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th>Concepto / Procedimiento</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Precio Unit. (USD)</th>
                  <th style={{ textAlign: 'right' }}>Subtotal (USD)</th>
                </tr>
              </thead>
              <tbody>
                {selectedFactura.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.servicioNombre || it.concepto}</td>
                    <td style={{ textAlign: 'center' }} className="table-mono">{it.cantidad}</td>
                    <td style={{ textAlign: 'right' }} className="font-mono">${it.precioUnitarioUSD.toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }} className="font-mono font-bold">${(it.subtotalUSD ?? it.totalUSD ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #0f172a', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '350px' }}>
                <strong>Observaciones:</strong> {selectedFactura.notas}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }} className="font-mono">
                  TOTAL: ${selectedFactura.totalUSD.toFixed(2)} USD
                </div>
                <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }} className="font-mono">
                  Equivalente: {selectedFactura.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} Bs
                </div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPreviewModalOpen(false)}>
                Cerrar
              </button>
              <button type="button" className="btn btn-primary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Imprimir Factura / Comprobante</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
