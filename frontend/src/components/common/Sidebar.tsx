import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Truck,
  Users,
  Briefcase,
  UserCheck,
  Building2,
  Clock,
  FlaskConical,
  Stethoscope,
  CalendarCheck,
  Shield,
  Menu,
  ChevronLeft,
  ChevronRight,
  Activity,
  HeartPulse,
  Eye,
  Apple
} from 'lucide-react';
import { ModuloNombre } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  activeModule: ModuloNombre;
  setActiveModule: (mod: ModuloNombre) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const { currentUser, currentRole, switchUser, availableUsers, hasPermission } = useAuth();
  const { kpis } = useData();

  const handleNavClick = (mod: ModuloNombre) => {
    setActiveModule(mod);
    setIsMobileOpen(false);
  };

  const navSections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard' as ModuloNombre, label: 'Panel General', icon: LayoutDashboard },
        { id: 'portal_paciente' as ModuloNombre, label: 'Portal Paciente (Kiosko)', icon: UserCheck }
      ]
    },
    {
      title: 'Urgencias y Hospitalización',
      items: [
        { id: 'triaje' as ModuloNombre, label: 'Triaje Urgencias (NEWS2)', icon: Activity, badge: kpis.urgenciasActivas },
        { id: 'hospitalizacion' as ModuloNombre, label: 'Gestión de Camas', icon: Building2, badge: `${kpis.pacientesHospitalizados || 8}` },
        { id: 'citas' as ModuloNombre, label: 'Citas Médicas', icon: CalendarCheck, badge: kpis.citasHoy },
        { id: 'pacientes' as ModuloNombre, label: 'Pacientes e Historias', icon: Users, badge: kpis.totalPacientes },
        { id: 'tratamientos' as ModuloNombre, label: 'Tratamientos y Récipes', icon: Stethoscope }
      ]
    },
    {
      title: 'Diagnóstico y Especialidades',
      items: [
        { id: 'laboratorio' as ModuloNombre, label: 'Laboratorio Clínico (LIS)', icon: FlaskConical, badge: kpis.laboratoriosPendientes },
        { id: 'imagenologia' as ModuloNombre, label: 'Imagenología (PACS)', icon: HeartPulse, badge: kpis.imagenesPendientes },
        { id: 'odontologia' as ModuloNombre, label: 'Odontología (FDI)', icon: Shield },
        { id: 'oftalmologia' as ModuloNombre, label: 'Oftalmología (Misión Milagro)', icon: Eye },
        { id: 'nutricion' as ModuloNombre, label: 'Nutrición y Dietética (INN)', icon: Apple },
        { id: 'telemedicina' as ModuloNombre, label: 'Telemedicina Virtual', icon: Activity }
      ]
    },
    {
      title: 'Farmacia e Insumos',
      items: [
        { id: 'farmacia' as ModuloNombre, label: 'Farmacia (Movs)', icon: HeartPulse },
        { id: 'medicamentos' as ModuloNombre, label: 'Medicamentos', icon: Pill, badge: kpis.medicamentosCriticos > 0 ? `${kpis.medicamentosCriticos} alert` : undefined },
        { id: 'proveedores' as ModuloNombre, label: 'Proveedores', icon: Truck }
      ]
    },
    {
      title: 'Facturación y Epidemiología',
      items: [
        { id: 'facturacion' as ModuloNombre, label: 'Baremos y Facturación', icon: Truck },
        { id: 'epidemiologia' as ModuloNombre, label: 'Epidemiología (EPI-12)', icon: Shield }
      ]
    },
    {
      title: 'Gestión y Seguridad',
      items: [
        { id: 'departamentos' as ModuloNombre, label: 'Departamentos', icon: Building2 },
        { id: 'empleados' as ModuloNombre, label: 'Empleados', icon: UserCheck },
        { id: 'horarios' as ModuloNombre, label: 'Horarios / Turnos', icon: Clock },
        { id: 'cargos' as ModuloNombre, label: 'Cargos', icon: Briefcase },
        { id: 'usuarios' as ModuloNombre, label: 'Usuarios', icon: Users },
        { id: 'roles' as ModuloNombre, label: 'Roles y Permisos', icon: Shield },
        { id: 'auditoria' as ModuloNombre, label: 'Auditoría HIPAA', icon: Shield }
      ]
    }
  ];


  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper">
            <Activity size={22} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-title">CDI SALUD</span>
              <span className="brand-subtitle">Gestión Integral</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-icon btn-sm no-print"
          style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.15)', color: 'white' }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, sIdx) => {
          // Filtrar items según permisos
          const visibleItems = section.items.filter((item) => hasPermission(item.id, 'ver'));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {!isCollapsed && <div className="nav-section-label">{section.title}</div>}
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    style={{ textAlign: 'left', width: '100%', background: isActive ? undefined : 'transparent' }}
                  >
                    <Icon size={18} className="nav-icon" />
                    {!isCollapsed && (
                      <>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer de Usuario y Selector de Rol Rápido */}
      <div className="sidebar-footer">
        <div className="user-avatar" title={currentUser.nombreCompleto}>
          {currentUser.nombreCompleto.charAt(0)}
        </div>
        {!isCollapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.nombreCompleto}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 500 }}>
                {currentRole?.nombre || 'Usuario'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
