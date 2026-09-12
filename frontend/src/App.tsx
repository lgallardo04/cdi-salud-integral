import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ModuloNombre } from './types';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { MobileModulesSheet } from './components/common/MobileModulesSheet';
import { MobileQuickFab } from './components/common/MobileQuickFab';

// Vistas Principales y Asistenciales
import { DashboardView } from './views/DashboardView';
import { PacientesView } from './views/PacientesView';
import { CitasView } from './views/CitasView';
import { TratamientosView } from './views/TratamientosView';
import { MedicamentosView } from './views/MedicamentosView';
import { FarmaciaView } from './views/FarmaciaView';
import { ProveedoresView } from './views/ProveedoresView';
import { DepartamentosView } from './views/DepartamentosView';
import { EmpleadosView } from './views/EmpleadosView';
import { CargosView } from './views/CargosView';
import { HorariosView } from './views/HorariosView';
import { UsuariosView } from './views/UsuariosView';
import { RolesView } from './views/RolesView';

// Nuevas Vistas Clínicas Hospitalarias
import { LaboratorioView } from './views/LaboratorioView';
import { ImagenologiaView } from './views/ImagenologiaView';
import { HospitalizacionView } from './views/HospitalizacionView';
import { TriajeView } from './views/TriajeView';
import { OdontologiaView } from './views/OdontologiaView';
import { TelemedicinaView } from './views/TelemedicinaView';
import { FacturacionView } from './views/FacturacionView';
import { EpidemiologiaView } from './views/EpidemiologiaView';
import { AuditoriaView } from './views/AuditoriaView';
import { PortalPacienteView } from './views/PortalPacienteView';
import { NutricionView } from './views/NutricionView';
import { OftalmologiaView } from './views/OftalmologiaView';

import { ShieldAlert } from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuloNombre>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { hasPermission, currentRole } = useAuth();

  // Scroll to top when active module changes
  useEffect(() => {
    const viewContainer = document.querySelector('.view-container');
    if (viewContainer) {
      viewContainer.scrollTop = 0;
    }
  }, [activeModule]);

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
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Current Active Clinical Module */}
        {renderCurrentModule()}

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
