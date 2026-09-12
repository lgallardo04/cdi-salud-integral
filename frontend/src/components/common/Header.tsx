import React, { useState } from 'react';
import {
  Menu,
  RotateCcw,
  Download,
  Upload,
  User,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  Database,
  Activity,
  ChevronDown,
  X,
  Radio
} from 'lucide-react';
import { ModuloNombre } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  activeModule: ModuloNombre;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const moduleTitles: Record<ModuloNombre, { title: string; subtitle: string; icon?: string }> = {
  dashboard: { title: 'Panel de Control', subtitle: 'Métricas asistenciales y operativas en tiempo real' },
  farmacia: { title: 'Gestión de Farmacia', subtitle: 'Control de movimientos, lotes, vencimientos y despachos' },
  proveedores: { title: 'Directorio de Proveedores', subtitle: 'Laboratorios y distribuidores farmacéuticos' },
  pacientes: { title: 'Registro de Pacientes', subtitle: 'Fichas médicas, antecedentes y datos filiatorios' },
  empleados: { title: 'Personal y Empleados', subtitle: 'Médicos, enfermeros, técnicos y personal administrativo' },
  cargos: { title: 'Estructura de Cargos', subtitle: 'Jerarquías, escalas salariales y perfiles de puesto' },
  usuarios: { title: 'Usuarios del Sistema', subtitle: 'Gestión de credenciales y cuentas de acceso' },
  departamentos: { title: 'Departamentos y Servicios', subtitle: 'Áreas médicas, camas y consultorios del CDI' },
  horarios: { title: 'Horarios y Turnos', subtitle: 'Programación de guardias, turnos y rotaciones' },
  medicamentos: { title: 'Catálogo de Medicamentos', subtitle: 'Inventario, principios activos, umbrales y alertas' },
  tratamientos: { title: 'Tratamientos y Récipes', subtitle: 'Prescripciones farmacológicas e indicaciones clínicas' },
  citas: { title: 'Agenda de Citas y Consultas', subtitle: 'Gestión de citas programadas y control de agendas' },
  roles: { title: 'Roles y Permisos', subtitle: 'Matriz RBAC de control de acceso asistencial' },
  laboratorio: { title: 'Laboratorio Clínico (LIS)', subtitle: 'Bioanálisis automatizado, perfiles bioquímicos y validación QR' },
  imagenologia: { title: 'Imagenología y Radiología (PACS)', subtitle: 'Visor DICOM interactivo, placas radiológicas y ecografía' },
  hospitalizacion: { title: 'Hospitalización y Camas', subtitle: 'Censo hospitalario en vivo, notas SOAP y Kardex' },
  triaje: { title: 'Triaje Urgencias (NEWS2)', subtitle: 'Clasificación de riesgo Manchester/ESI y signos vitales' },
  odontologia: { title: 'Odontología y Odontograma', subtitle: 'Mapeo dental anatómico FDI por caras y presupuestos' },
  telemedicina: { title: 'Telemedicina e Interconsultas', subtitle: 'Videoconsultas médicas simuladas y concepto asistencial' },
  facturacion: { title: 'Baremos y Facturación', subtitle: 'Tarifario de servicios, conversión USD/Bs y exoneraciones' },
  epidemiologia: { title: 'Epidemiología (EPI-12)', subtitle: 'Vigilancia epidemiológica, canales endémicos y brotes' },
  auditoria: { title: 'Auditoría HIPAA y Trazabilidad', subtitle: 'Registro inmutable de seguridad y accesos a historias' },
  portal_paciente: { title: 'Portal del Paciente / Kiosko', subtitle: 'Autogestión de citas, recetas, exámenes y QR' },
  nutricion: { title: 'Nutrición y Dietética INN', subtitle: 'Evaluación antropométrica IMC, planes alimentarios y suplementos' },
  oftalmologia: { title: 'Oftalmología y Misión Milagro', subtitle: 'Consulta agudeza visual Snellen, PIO, censo quirúrgico y colirios' }
};

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { currentUser, currentRole, switchUser, availableUsers } = useAuth();
  const { resetAllData, exportDatabaseJSON, importDatabaseJSON } = useData();
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);

  const currentInfo = moduleTitles[activeModule] || {
    title: 'CDI Salud Integral',
    subtitle: 'Centro de Diagnóstico Integral'
  };

  const handleExportBackup = () => {
    const json = exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CDI_BaseDatos_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      <header className="top-header">
        <div className="header-left">
          {/* Mobile Menu Trigger Button */}
          <button
            type="button"
            className="mobile-header-menu-btn"
            onClick={() => setIsMobileOpen(true)}
            aria-label="Abrir menú de módulos"
          >
            <Menu size={22} />
          </button>

          {/* CDI Mobile Mini Brand for small screens */}
          <div className="mobile-brand-tag" onClick={() => setIsMobileOpen(true)}>
            <div className="mobile-brand-icon">
              <Activity size={16} />
            </div>
            <span className="mobile-brand-title">CDI</span>
          </div>

          <div className="header-title-container">
            <h1 className="header-page-title">{currentInfo.title}</h1>
            <p className="header-page-subtitle">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Status Badge */}
          <div className="header-sync-badge desktop-only" title="Base de datos reactiva offline-first sincronizada con FastAPI">
            <span className="pulse-indicator-green" />
            <span>Offline Local Activo</span>
          </div>

          {/* Selector interactivo de Rol / Usuario */}
          <button
            type="button"
            className="header-role-btn"
            onClick={() => setIsRoleSheetOpen(true)}
            title="Cambiar usuario o rol simulado"
          >
            <div className="user-avatar-sm">
              {currentUser.nombreCompleto.charAt(0)}
            </div>
            <div className="role-btn-text">
              <span className="role-user-name">{currentUser.nombreCompleto}</span>
              <span className="role-badge-label">{currentRole?.nombre || 'Usuario'}</span>
            </div>
            <ChevronDown size={14} className="role-arrow" />
          </button>

          {/* Selector tradicional en desktop */}
          <div className="desktop-role-select desktop-only">
            <User size={15} color="#2563eb" />
            <select
              className="form-select form-select-sm"
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              aria-label="Seleccionar rol de usuario"
            >
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombreCompleto} — {user.rolNombre}
                </option>
              ))}
            </select>
          </div>

          {/* Acciones de Base de Datos */}
          <div className="header-db-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportBackup}
              title="Descargar copia de seguridad JSON"
            >
              <Download size={14} />
              <span className="desktop-text">Backup</span>
            </button>

            <label
              className="btn btn-secondary btn-sm"
              style={{ cursor: 'pointer', margin: 0 }}
              title="Restaurar base de datos desde JSON"
            >
              <Upload size={14} />
              <span className="desktop-text">Importar</span>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
            </label>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (window.confirm('¿Deseas restaurar la base de datos a los valores médicos predeterminados?')) {
                  resetAllData();
                }
              }}
              title="Restaurar datos clínicos predeterminados"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Role Selection Mobile Bottom Sheet */}
      {isRoleSheetOpen && (
        <div className="mobile-sheet-overlay" onClick={() => setIsRoleSheetOpen(false)}>
          <div className="mobile-sheet-content" style={{ maxHeight: '75vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-handle-bar">
              <div className="mobile-sheet-handle" />
            </div>

            <div className="mobile-sheet-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '36px', height: '36px' }}>
                  <User size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Simulador de Roles Médicos</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Selecciona un usuario para probar permisos asistenciales
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon btn-sm"
                onClick={() => setIsRoleSheetOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-sheet-body" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {availableUsers.map((user) => {
                  const isSelected = currentUser.id === user.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      className={`mobile-role-card ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        switchUser(user.id);
                        setIsRoleSheetOpen(false);
                      }}
                    >
                      <div className="user-avatar" style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}>
                        {user.nombreCompleto.charAt(0)}
                      </div>

                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-main)' }}>
                          {user.nombreCompleto}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          @{user.nombreUsuario} · <b style={{ color: 'var(--color-secondary)' }}>{user.rolNombre}</b>
                        </div>
                      </div>

                      <div className={`role-radio-check ${isSelected ? 'selected' : ''}`}>
                        {isSelected && <div className="role-radio-dot" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mobile-sheet-footer">
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Los cambios aplican instantáneamente en todas las vistas.
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsRoleSheetOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
