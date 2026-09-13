import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { RegistroAuditoria } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Clock,
  User,
  Monitor,
  FileText,
  Activity,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const AuditoriaView: React.FC = () => {
  const { data } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeveridad, setFilterSeveridad] = useState<string>('Todas');
  const [filterAccion, setFilterAccion] = useState<string>('Todas');

  const logs = data.registrosAuditoria || [];

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.modulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress?.includes(searchTerm);

    const matchSev = filterSeveridad === 'Todas' || log.severidad === filterSeveridad;
    const matchAcc = filterAccion === 'Todas' || log.accion === filterAccion;

    return matchSearch && matchSev && matchAcc;
  });

  const handleExportCSV = () => {
    const headers = ['ID,Fecha/Hora,Usuario,Rol,Accion,Modulo,RegistroID,IP,Severidad,Detalles'];
    const rows = filteredLogs.map((l) =>
      `"${l.id}","${l.fechaHora}","${l.usuarioNombre || l.nombreUsuario || ''}","${l.rol || l.rolNombre || ''}","${l.accion}","${l.modulo}","${l.registroId || ''}","${l.ipAddress || l.direccionIP || ''}","${l.severidad}","${(l.detalles || l.detalle || '').replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_cdi_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeTypeSeveridad = (s: string) => {
    switch (s) {
      case 'CRITICO':
        return 'danger';
      case 'AVISO':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
            <Lock size={24} />
          </div>
          <div>
            <h1 className="view-title">Auditoría Clínica y Trazabilidad HIPAA</h1>
            <p className="view-subtitle">
              Registro inmutable de accesos a historias médicas, modificaciones de prescripciones y eventos de seguridad.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            <span>Exportar Registro (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Eventos Registrados</span>
            <span className="kpi-value">{logs.length}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Operaciones Ordinarias</span>
            <span className="kpi-value">
              {logs.filter((l) => l.severidad === 'INFO').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Alertas y Modificaciones</span>
            <span className="kpi-value">
              {logs.filter((l) => l.severidad === 'AVISO').length}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <Lock size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Eventos Críticos / Seguridad</span>
            <span className="kpi-value">
              {logs.filter((l) => l.severidad === 'CRITICO').length}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="card filter-bar no-print" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-input search-input"
              placeholder="Buscar por usuario, módulo, detalles o IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} style={{ color: '#64748b' }} />
            <select
              className="form-input select-input"
              value={filterSeveridad}
              onChange={(e) => setFilterSeveridad(e.target.value)}
            >
              <option value="Todas">Todas las Severidades</option>
              <option value="INFO">INFO (Normal)</option>
              <option value="AVISO">AVISO (Advertencia)</option>
              <option value="CRITICO">CRÍTICO (Seguridad)</option>
            </select>
          </div>

          <div>
            <select
              className="form-input select-input"
              value={filterAccion}
              onChange={(e) => setFilterAccion(e.target.value)}
            >
              <option value="Todas">Todas las Acciones</option>
              <option value="CREAR">CREAR</option>
              <option value="ACTUALIZAR">ACTUALIZAR</option>
              <option value="ELIMINAR">ELIMINAR</option>
              <option value="CONSULTA">CONSULTA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Logs de Auditoría */}
      <div className="card table-card">
        <div className="table-container auto-table">
          <table className="clinical-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Detalles de la Operación</th>
                <th>IP & Terminal</th>
                <th>Severidad</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="table-mono font-mono text-muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.fechaHora}</td>
                  <td>
                    <strong>{log.usuarioNombre}</strong>
                  </td>
                  <td>
                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                      {log.rol}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono font-bold" style={{ color: log.accion === 'ELIMINAR' ? '#dc2626' : '#2563eb' }}>
                      {log.accion}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {log.modulo}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '0.8rem', color: '#334155' }}>
                    {log.detalles}
                  </td>
                  <td className="font-mono text-muted" style={{ fontSize: '0.75rem' }}>
                    {log.ipAddress || '192.168.1.100'}
                  </td>
                  <td>
                    <Badge type={getBadgeTypeSeveridad(log.severidad)}>{log.severidad}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
