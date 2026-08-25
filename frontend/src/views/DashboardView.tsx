import React from 'react';
import {
  Users,
  CalendarCheck,
  HeartPulse,
  Pill,
  Clock,
  Activity,
  AlertTriangle,
  Building2,
  Stethoscope,
  Plus,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  Truck,
  FlaskConical,
  Video,
  DollarSign,
  QrCode
} from 'lucide-react';
import { ModuloNombre, Cita, Medicamento } from '../types';
import { useData } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';

interface DashboardViewProps {
  setActiveModule: (mod: ModuloNombre) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveModule }) => {
  const { data, kpis, updateItem } = useData();

  // Filtrar citas del día o recientes
  const upcomingAppointments = data.citas.slice(0, 5);

  // Filtrar medicamentos críticos / stock bajo
  const criticalMedicamentos = data.medicamentos
    .filter((m) => m.stockActual <= m.stockMinimo)
    .slice(0, 5);

  // Movimientos recientes de farmacia
  const recentMovements = data.movimientosFarmacia.slice(0, 4);

  const handleQuickStatusChange = (cita: Cita, newStatus: Cita['estado']) => {
    updateItem('citas', cita.id, { estado: newStatus });
  };

  const getPriorityVariant = (priority: Cita['triajePrioridad']) => {
    switch (priority) {
      case 'Emergencia': return 'urgent';
      case 'Urgencia': return 'warning';
      case 'Consulta Regular': return 'info';
      default: return 'neutral';
    }
  };

  const getStatusVariant = (status: Cita['estado']) => {
    switch (status) {
      case 'Completada': return 'success';
      case 'En Consulta': return 'info';
      case 'En Triaje': return 'warning';
      case 'Confirmada': return 'neutral';
      case 'Cancelada': return 'urgent';
      default: return 'warning';
    }
  };

  return (
    <div className="view-container">
      {/* Alerta de Medicamentos Críticos si existen */}
      {kpis.medicamentosCriticos > 0 && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.35rem', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626', flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <b style={{ color: '#991b1b', fontSize: '0.86rem' }}>
                Alerta de Stock: {kpis.medicamentosCriticos} medicamentos en umbral crítico.
              </b>
              <p style={{ color: '#b91c1c', fontSize: '0.75rem', margin: 0 }}>
                Generar reposición a proveedores para asegurar abastecimiento.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => setActiveModule('medicamentos')}
          >
            <span>Ver Stock</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Grid de KPIs Principales */}
      <div className="grid-12">
        <div className="col-3">
          <StatCard
            title="Pacientes Registrados"
            value={kpis.totalPacientes}
            icon={<Users size={22} />}
            iconVariant="blue"
            trend="+12% este mes"
            trendType="positive"
            onClick={() => setActiveModule('pacientes')}
          />
        </div>

        <div className="col-3">
          <StatCard
            title="Urgencias NEWS2"
            value={kpis.urgenciasActivas || (data.registrosTriaje || []).length}
            icon={<AlertTriangle size={22} />}
            iconVariant="red"
            trend="Monitoreo en tiempo real"
            trendType="warning"
            onClick={() => setActiveModule('triaje')}
          />
        </div>

        <div className="col-3">
          <StatCard
            title="Camas Hospitalarias"
            value={`${kpis.pacientesHospitalizados || 8} Ocupadas`}
            icon={<Building2 size={22} />}
            iconVariant="amber"
            trend={`${kpis.ocupacionCamasPorcentaje}% de ocupación`}
            trendType="positive"
            onClick={() => setActiveModule('hospitalizacion')}
          />
        </div>

        <div className="col-3">
          <StatCard
            title="Laboratorio & PACS"
            value={`${kpis.laboratoriosPendientes || 2} Pendientes`}
            icon={<FlaskConical size={22} />}
            iconVariant="teal"
            trend={`${(data.ordenesLaboratorio || []).length} órdenes activas`}
            trendType="positive"
            onClick={() => setActiveModule('laboratorio')}
          />
        </div>
      </div>

      {/* Atajos Rápidos de Atención Clínica Hospitalaria */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} color="#2563eb" />
            <span>Módulos de Atención Rápida</span>
          </div>
        </div>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveModule('triaje')}
          >
            <AlertTriangle size={15} />
            <span>Triaje Urgencias (NEWS2)</span>
          </button>

          <button
            type="button"
            className="btn btn-teal btn-sm"
            onClick={() => setActiveModule('hospitalizacion')}
          >
            <Building2 size={15} />
            <span>Gestión de Camas</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('laboratorio')}
          >
            <FlaskConical size={15} />
            <span>Laboratorio (LIS)</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('imagenologia')}
          >
            <HeartPulse size={15} />
            <span>Imagenología (PACS)</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('odontologia')}
          >
            <CheckCircle size={15} />
            <span>Odontograma FDI</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('telemedicina')}
          >
            <Video size={15} />
            <span>Telemedicina</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('facturacion')}
          >
            <DollarSign size={15} />
            <span>Facturación</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('portal_paciente')}
          >
            <QrCode size={15} />
            <span>Portal Paciente (Kiosko)</span>
          </button>
        </div>
      </div>

      {/* Sección en 2 Columnas: Agenda de Citas y Alertas de Stock Farmacia */}
      <div className="grid-12">
        {/* Columna Izquierda: Agenda del Día */}
        <div className="col-8">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">
                <CalendarCheck size={18} color="#0d9488" />
                <span>Flujo de Pacientes y Citas ({upcomingAppointments.length})</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveModule('citas')}
              >
                <span>Ver Todas ({data.citas.length})</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Desktop Table View */}
            <div className="table-container auto-table">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Especialidad / Médico</th>
                    <th>Triaje</th>
                    <th>Estado</th>
                    <th style={{ textAlign: 'right' }}>Cambiar Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.map((cita) => (
                    <tr key={cita.id}>
                      <td className="table-mono" style={{ fontWeight: 700 }}>
                        {cita.hora}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{cita.pacienteNombre}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cita.pacienteCedula}</div>
                      </td>
                      <td>
                        <div>{cita.departamentoNombre}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cita.medicoNombre}</div>
                      </td>
                      <td>
                        <Badge variant={getPriorityVariant(cita.triajePrioridad)}>
                          {cita.triajePrioridad}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={getStatusVariant(cita.estado)}>
                          {cita.estado}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 'auto' }}
                          value={cita.estado}
                          onChange={(e) => handleQuickStatusChange(cita, e.target.value as any)}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="En Triaje">En Triaje</option>
                          <option value="En Consulta">En Consulta</option>
                          <option value="Completada">Completada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="mobile-cards-container auto-cards">
              <div className="mobile-record-card-list">
                {upcomingAppointments.map((cita) => (
                  <div key={cita.id} className="mobile-record-card">
                    <div className="mobile-record-header">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-primary)' }}>
                          {cita.pacienteNombre}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          C.I. {cita.pacienteCedula} · Hora: <b className="table-mono">{cita.hora}</b>
                        </span>
                      </div>
                      <Badge variant={getPriorityVariant(cita.triajePrioridad)}>
                        {cita.triajePrioridad}
                      </Badge>
                    </div>

                    <div className="mobile-record-fields-grid">
                      <div className="mobile-record-field">
                        <span className="mobile-field-label">Área / Depto</span>
                        <span className="mobile-field-value">{cita.departamentoNombre}</span>
                      </div>
                      <div className="mobile-record-field">
                        <span className="mobile-field-label">Médico Tratante</span>
                        <span className="mobile-field-value">{cita.medicoNombre}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                      <Badge variant={getStatusVariant(cita.estado)}>
                        {cita.estado}
                      </Badge>
                      <select
                        className="form-select form-select-sm"
                        style={{ width: 'auto', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                        value={cita.estado}
                        onChange={(e) => handleQuickStatusChange(cita, e.target.value as any)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Confirmada">Confirmada</option>
                        <option value="En Triaje">En Triaje</option>
                        <option value="En Consulta">En Consulta</option>
                        <option value="Completada">Completada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Alertas de Stock Farmacia */}
        <div className="col-4">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">
                <Pill size={18} color="#dc2626" />
                <span>Niveles de Stock Crítico</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveModule('medicamentos')}
              >
                <span>Catálogo</span>
              </button>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {criticalMedicamentos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#16a34a' }}>
                  <CheckCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 600 }}>Todos los medicamentos tienen stock óptimo</div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    No hay alertas de desabastecimiento en farmacia.
                  </p>
                </div>
              ) : (
                criticalMedicamentos.map((med) => {
                  const percent = Math.min(100, Math.round((med.stockActual / med.stockMaximo) * 100));
                  const isVeryCritical = med.stockActual <= med.stockMinimo / 2;

                  return (
                    <div
                      key={med.id}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: isVeryCritical ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${isVeryCritical ? '#fecaca' : '#fde68a'}`,
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <div>
                          <b style={{ fontSize: '0.86rem', color: '#0f172a' }}>{med.nombreComercial}</b>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{med.principioActivo} ({med.presentacion})</div>
                        </div>
                        <Badge variant={isVeryCritical ? 'urgent' : 'warning'}>
                          {med.stockActual} Unids
                        </Badge>
                      </div>

                      <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            backgroundColor: isVeryCritical ? '#dc2626' : '#d97706',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                        <span>Mínimo: {med.stockMinimo}</span>
                        <span>Máximo: {med.stockMaximo}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Movimientos Recientes de Farmacia */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <HeartPulse size={18} color="#2563eb" />
            <span>Últimos Movimientos de Farmacia</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveModule('farmacia')}
          >
            <span>Ver Todos</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container auto-table">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Medicamento</th>
                <th>Cantidad</th>
                <th>Lote</th>
                <th>Destino / Beneficiario</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.map((mov) => (
                <tr key={mov.id}>
                  <td className="table-mono" style={{ fontSize: '0.78rem' }}>
                    {mov.fechaHora}
                  </td>
                  <td>
                    <Badge variant={mov.tipoMovimiento === 'Entrada / Compra' ? 'success' : mov.tipoMovimiento === 'Salida / Despacho' ? 'info' : 'warning'}>
                      {mov.tipoMovimiento}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 600 }}>{mov.medicamentoNombre}</td>
                  <td className="table-mono" style={{ fontWeight: 700 }}>
                    {mov.tipoMovimiento === 'Entrada / Compra' ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                  </td>
                  <td className="table-mono">{mov.lote}</td>
                  <td>{mov.pacienteNombre || mov.proveedorNombre || '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{mov.responsableNombre || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards-container auto-cards">
          <div className="mobile-record-card-list">
            {recentMovements.map((mov) => (
              <div key={mov.id} className="mobile-record-card">
                <div className="mobile-record-header">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                      {mov.medicamentoNombre}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                      {mov.fechaHora} · Lote: <b className="table-mono">{mov.lote}</b>
                    </span>
                  </div>
                  <Badge variant={mov.tipoMovimiento === 'Entrada / Compra' ? 'success' : mov.tipoMovimiento === 'Salida / Despacho' ? 'info' : 'warning'}>
                    {mov.tipoMovimiento}
                  </Badge>
                </div>
                <div className="mobile-record-fields-grid">
                  <div className="mobile-record-field">
                    <span className="mobile-field-label">Cantidad</span>
                    <span className="mobile-field-value table-mono" style={{ fontWeight: 700 }}>
                      {mov.tipoMovimiento === 'Entrada / Compra' ? `+${mov.cantidad}` : `-${mov.cantidad}`}
                    </span>
                  </div>
                  <div className="mobile-record-field">
                    <span className="mobile-field-label">Destino / Proveedor</span>
                    <span className="mobile-field-value">{mov.pacienteNombre || mov.proveedorNombre || '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
