import React, { useState } from 'react';
import {
  Plus,
  X,
  Activity,
  UserPlus,
  CalendarPlus,
  Pill,
  FlaskConical,
  HeartPulse
} from 'lucide-react';
import { ModuloNombre } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface MobileQuickFabProps {
  setActiveModule: (mod: ModuloNombre) => void;
}

export const MobileQuickFab: React.FC<MobileQuickFabProps> = ({ setActiveModule }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasPermission } = useAuth();

  const actions = [
    {
      label: 'Triaje Urgencias',
      icon: Activity,
      module: 'triaje' as ModuloNombre,
      color: '#dc2626',
      bg: '#fee2e2'
    },
    {
      label: 'Nuevo Paciente',
      icon: UserPlus,
      module: 'pacientes' as ModuloNombre,
      color: '#2563eb',
      bg: '#eff6ff'
    },
    {
      label: 'Agendar Cita',
      icon: CalendarPlus,
      module: 'citas' as ModuloNombre,
      color: '#0d9488',
      bg: '#f0fdfa'
    },
    {
      label: 'Despacho Farmacia',
      icon: Pill,
      module: 'farmacia' as ModuloNombre,
      color: '#d97706',
      bg: '#fffbeb'
    },
    {
      label: 'Orden Laboratorio',
      icon: FlaskConical,
      module: 'laboratorio' as ModuloNombre,
      color: '#7c3aed',
      bg: '#f5f3ff'
    }
  ];

  const handleTrigger = (mod: ModuloNombre) => {
    setActiveModule(mod);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div
          className="mobile-fab-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`mobile-fab-container ${isOpen ? 'open' : ''}`}>
        {isOpen && (
          <div className="mobile-fab-menu">
            {actions.map((act, idx) => {
              if (!hasPermission(act.module, 'crear') && !hasPermission(act.module, 'ver')) {
                return null;
              }
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  className="mobile-fab-action-btn"
                  onClick={() => handleTrigger(act.module)}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className="mobile-fab-action-label">{act.label}</span>
                  <div
                    className="mobile-fab-action-icon"
                    style={{ backgroundColor: act.bg, color: act.color }}
                  >
                    <Icon size={18} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          className={`mobile-fab-main-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar menú rápido' : 'Acciones clínicas rápidas'}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </>
  );
};
