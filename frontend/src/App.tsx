import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ModuloNombre } from './types';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { MobileModulesSheet } from './components/common/MobileModulesSheet';
import { MobileQuickFab } from './components/common/MobileQuickFab';
import { ShieldAlert, Activity } from 'lucide-react';

// Vistas Principales y Asistenciales (Lazy Loaded para Code Splitting y Bundle Optimization)
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const PacientesView = lazy(() => import('./views/PacientesView').then(m => ({ default: m.PacientesView })));
const CitasView = lazy(() => import('./views/CitasView').then(m => ({ default: m.CitasView })));
const TratamientosView = lazy(() => import('./views/TratamientosView').then(m => ({ default: m.TratamientosView })));
const MedicamentosView = lazy(() => import('./views/MedicamentosView').then(m => ({ default: m.MedicamentosView })));
const FarmaciaView = lazy(() => import('./views/FarmaciaView').then(m => ({ default: m.FarmaciaView })));
const ProveedoresView = lazy(() => import('./views/ProveedoresView').then(m => ({ default: m.ProveedoresView })));
const DepartamentosView = lazy(() => import('./views/DepartamentosView').then(m => ({ default: m.DepartamentosView })));
const EmpleadosView = lazy(() => import('./views/EmpleadosView').then(m => ({ default: m.EmpleadosView })));
const CargosView = lazy(() => import('./views/CargosView').then(m => ({ default: m.CargosView })));
const HorariosView = lazy(() => import('./views/HorariosView').then(m => ({ default: m.HorariosView })));
const UsuariosView = lazy(() => import('./views/UsuariosView').then(m => ({ default: m.UsuariosView })));
const RolesView = lazy(() => import('./views/RolesView').then(m => ({ default: m.RolesView })));

// Vistas Clínicas Hospitalarias Especializadas
const LaboratorioView = lazy(() => import('./views/LaboratorioView').then(m => ({ default: m.LaboratorioView })));
const ImagenologiaView = lazy(() => import('./views/ImagenologiaView').then(m => ({ default: m.ImagenologiaView })));
const HospitalizacionView = lazy(() => import('./views/HospitalizacionView').then(m => ({ default: m.HospitalizacionView })));
const TriajeView = lazy(() => import('./views/TriajeView').then(m => ({ default: m.TriajeView })));
const OdontologiaView = lazy(() => import('./views/OdontologiaView').then(m => ({ default: m.OdontologiaView })));
const TelemedicinaView = lazy(() => import('./views/TelemedicinaView').then(m => ({ default: m.TelemedicinaView })));
const FacturacionView = lazy(() => import('./views/FacturacionView').then(m => ({ default: m.FacturacionView })));
const EpidemiologiaView = lazy(() => import('./views/EpidemiologiaView').then(m => ({ default: m.EpidemiologiaView })));
const AuditoriaView = lazy(() => import('./views/AuditoriaView').then(m => ({ default: m.AuditoriaView })));
const PortalPacienteView = lazy(() => import('./views/PortalPacienteView').then(m => ({ default: m.PortalPacienteView })));
const NutricionView = lazy(() => import('./views/NutricionView').then(m => ({ default: m.NutricionView })));
const OftalmologiaView = lazy(() => import('./views/OftalmologiaView').then(m => ({ default: m.OftalmologiaView })));
const LandingPageView = lazy(() => import('./views/LandingPageView').then(m => ({ default: m.LandingPageView || m.default })));

export type ActiveView = ModuloNombre | 'landing';

// Fallback de carga con diseño asistencial profesional
const ModuleLoadingFallback: React.FC = () => (
  <div
    className="view-container"
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <div
      style={{
        textAlign: 'center',
        maxWidth: '320px',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}
      >
        <Activity size={22} className="spin-slow" />
      </div>
      <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.35rem', fontWeight: 600 }}>
        Cargando módulo clínico
      </h3>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
        Cargando componentes asistenciales bajo demanda...
      </p>
    </div>
  </div>
);

const MainContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ActiveView>(() => {
    // Si el usuario especificó un módulo en el hash de la URL (#dashboard, etc.), respetarlo
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== 'landing') {
        return hash as ActiveView;
      }
    }
    // Por defecto, mostrar la nueva Landing Page de alta tecnología
    return 'landing';
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { hasPermission, currentRole } = useAuth();

  // Sincronizar hash con el módulo activo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = activeModule;
    }
  }, [activeModule]);

  // Manejar clases de scroll globales para permitir desplazamiento vertical fluido en Landing y contención en Dashboard
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (activeModule === 'landing') {
        document.documentElement.classList.add('landing-active');
        document.body.classList.add('landing-active');
      } else {
        document.documentElement.classList.remove('landing-active');
        document.body.classList.remove('landing-active');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('landing-active');
        document.body.classList.remove('landing-active');
      }
    };
  }, [activeModule]);

  // Scroll to top when active module changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const viewContainer = document.querySelector('.view-container') || document.querySelector('.landing-fullscreen-wrapper') || document.querySelector('.landing-view-scroll');
    if (viewContainer) {
      viewContainer.scrollTop = 0;
    }
  }, [activeModule]);

  // Si el módulo activo es la Landing Page, mostrarla a pantalla completa (full-bleed) estilo website de alta tecnología
  if (activeModule === 'landing') {
    return (
      <div className="landing-fullscreen-wrapper w-full bg-[#050b14] text-white">
        <Suspense fallback={<ModuleLoadingFallback />}>
          <LandingPageView
            setActiveModule={(mod) => setActiveModule(mod as ActiveView)}
            onNavigate={(mod) => setActiveModule(mod as ActiveView)}
          />
        </Suspense>
        <ToastContainer />
      </div>
    );
  }

  const canViewCurrent = hasPermission(activeModule, 'ver');

  const renderCurrentModule = () => {
    if (!canViewCurrent) {
      return (
        <div className="view-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', maxWidth: '460px', padding: '2rem', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #fee2e2', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <ShieldAlert size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Acceso Restringido</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              El perfil de <b>{currentRole?.nombre || 'Usuario'}</b> no cuenta con permisos asignados para visualizar el módulo de <b>{activeModule}</b> en este CDI.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveModule('dashboard')}
            >
              Volver al Panel Principal
            </button>
          </div>
        </div>
      );
    }

    switch (activeModule) {
      case 'dashboard':
        return <DashboardView setActiveModule={setActiveModule} />;
      case 'pacientes':
        return <PacientesView />;
      case 'citas':
        return <CitasView />;
      case 'tratamientos':
        return <TratamientosView />;
      case 'medicamentos':
        return <MedicamentosView />;
      case 'farmacia':
        return <FarmaciaView />;
      case 'proveedores':
        return <ProveedoresView />;
      case 'departamentos':
        return <DepartamentosView />;
      case 'empleados':
        return <EmpleadosView />;
      case 'cargos':
        return <CargosView />;
      case 'horarios':
        return <HorariosView />;
      case 'usuarios':
        return <UsuariosView />;
      case 'roles':
        return <RolesView />;
      // Nuevos Módulos Hospitalarios
      case 'laboratorio':
        return <LaboratorioView />;
      case 'imagenologia':
        return <ImagenologiaView />;
      case 'hospitalizacion':
        return <HospitalizacionView />;
      case 'triaje':
        return <TriajeView />;
      case 'odontologia':
        return <OdontologiaView />;
      case 'telemedicina':
        return <TelemedicinaView />;
      case 'facturacion':
        return <FacturacionView />;
      case 'epidemiologia':
        return <EpidemiologiaView />;
      case 'auditoria':
        return <AuditoriaView />;
      case 'portal_paciente':
        return <PortalPacienteView />;
      case 'nutricion':
        return <NutricionView />;
      case 'oftalmologia':
        return <OftalmologiaView />;
      default:
        return <DashboardView setActiveModule={setActiveModule} />;
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Persistent Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="main-wrapper">
        {/* Responsive Header */}
        <Header
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Current Active Clinical Module with Suspense Lazy Loading */}
        <Suspense fallback={<ModuleLoadingFallback />}>
          {renderCurrentModule()}
        </Suspense>

        {/* Floating Action Button for Mobile Fast Operations */}
        <MobileQuickFab setActiveModule={setActiveModule} />

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>

      {/* Full Sheet for Exploring all 23 Modules on Mobile */}
      <MobileModulesSheet
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* Global Clinical Toast Feedback */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
