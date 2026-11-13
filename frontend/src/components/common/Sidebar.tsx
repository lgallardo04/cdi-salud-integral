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
  Apple,
  Sparkles,
  LucideIcon
} from 'lucide-react';
import { ModuloNombre } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  activeModule: ModuloNombre | 'landing';
  setActiveModule: (mod: ModuloNombre | 'landing') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: ModuloNombre | 'landing';
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
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
  const { kpis, cloudStatus } = useData();

  const handleNavClick = (mod: ModuloNombre | 'landing') => {
    setActiveModule(mod);
    setIsMobileOpen(false);
  };

  const navSections: NavSection[] = [
    {
      title: 'Principal & Presentación',
      items: [
        { id: 'dashboard' as ModuloNombre, label: 'Panel General', icon: LayoutDashboard },
        { id: 'landing' as any, label: 'Landing / Presentación', icon: Sparkles },
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
    <aside className={`sidebar sidebar-glass-glow ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-wrapper heartbeat-anim" style={{ boxShadow: '0 0 14px rgba(6, 182, 212, 0.45)' }}>
            <Activity size={22} />
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-title text-gradient-cyan-emerald">CDI SALUD</span>
              <span className="brand-subtitle" style={{ letterSpacing: '0.08em', color: '#38bdf8' }}>Alta Tecnología</span>
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

      {/* Banner de Acceso Rápido y Alta Visibilidad a Landing / Presentación */}
      <div
        className={`landing-sidebar-banner ${activeModule === 'landing' ? 'active' : ''}`}
        onClick={() => handleNavClick(activeModule === 'landing' ? 'dashboard' : 'landing')}
        title={activeModule === 'landing' ? 'Volver al Sistema Clínico Interno' : 'Ver Presentación y Landing Page Oficial'}
      >
        <Sparkles size={18} className="particle-glow-anim" style={{ color: '#22d3ee', flexShrink: 0 }} />
        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e0f2fe' }}>
                {activeModule === 'landing' ? 'Sistema Clínico' : 'Presentación / Landing'}
              </span>
              <span className="badge-prestigious" style={{ fontSize: '0.58rem', padding: '0.05rem 0.35rem' }}>
                {activeModule === 'landing' ? 'ACTIVO' : 'SHOWCASE'}
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeModule === 'landing' ? '← Volver al panel de control' : 'Póster médico dinámico 3D'}
            </span>
          </div>
        )}
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
        <div
          className="user-avatar"
          title={`${currentUser.nombreCompleto} — ${cloudStatus.state === 'connected' ? 'Supabase Online' : 'Modo Offline'}`}
          style={{ position: 'relative' }}
        >
          {currentUser.nombreCompleto.charAt(0)}
          <span
            className={cloudStatus.state === 'connected' ? 'pulse-indicator-green' : 'pulse-indicator-amber'}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              border: '1.5px solid #0f172a'
            }}
          />
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <span
                className={cloudStatus.state === 'connected' ? 'pulse-indicator-green' : 'pulse-indicator-amber'}
                style={{ width: 6, height: 6 }}
              />
              <span style={{ fontSize: '0.65rem', color: cloudStatus.state === 'connected' ? '#86efac' : '#cbd5e1' }}>
                {cloudStatus.state === 'connected' ? 'Supabase Online' : 'Modo Offline'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
