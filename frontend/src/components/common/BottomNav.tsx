import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  HeartPulse,
  Grid,
  Activity,
  Pill
} from 'lucide-react';
import { ModuloNombre } from '../../types';
import { useData } from '../../context/DataContext';

interface BottomNavProps {
  activeModule: ModuloNombre;
  setActiveModule: (mod: ModuloNombre) => void;
  setIsMobileOpen: (open: boolean) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeModule,
  setActiveModule,
  setIsMobileOpen
}) => {
  const { kpis } = useData();

  return (
    <nav className="mobile-bottom-nav">
      <button
        type="button"
        className={`mobile-nav-btn ${activeModule === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveModule('dashboard')}
      >
        <div className="mobile-nav-icon-container">
          <LayoutDashboard size={20} />
        </div>
        <span>Inicio</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeModule === 'triaje' ? 'active' : ''}`}
        onClick={() => setActiveModule('triaje')}
      >
        <div className="mobile-nav-icon-container">
          <Activity size={20} />
          {kpis.urgenciasActivas > 0 && (
            <span className="mobile-nav-badge-dot" />
          )}
        </div>
        <span>Triaje</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeModule === 'pacientes' ? 'active' : ''}`}
        onClick={() => setActiveModule('pacientes')}
      >
        <div className="mobile-nav-icon-container">
          <Users size={20} />
        </div>
        <span>Pacientes</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeModule === 'citas' ? 'active' : ''}`}
        onClick={() => setActiveModule('citas')}
      >
        <div className="mobile-nav-icon-container">
          <CalendarCheck size={20} />
          {kpis.citasHoy > 0 && (
            <span className="mobile-nav-badge-pill">{kpis.citasHoy}</span>
          )}
        </div>
        <span>Citas</span>
      </button>

      <button
        type="button"
        className={`mobile-nav-btn ${activeModule === 'farmacia' ? 'active' : ''}`}
        onClick={() => setActiveModule('farmacia')}
      >
        <div className="mobile-nav-icon-container">
          <HeartPulse size={20} />
          {kpis.medicamentosCriticos > 0 && (
            <span className="mobile-nav-badge-dot alert" />
          )}
        </div>
        <span>Farmacia</span>
      </button>

      <button
        type="button"
        className="mobile-nav-btn"
        onClick={() => setIsMobileOpen(true)}
      >
        <div className="mobile-nav-icon-container">
          <Grid size={20} />
        </div>
        <span>Módulos</span>
      </button>
    </nav>
  );
};
