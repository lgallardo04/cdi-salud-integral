import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Apple,
  Scale,
  CalendarCheck,
  HeartHandshake,
  Layers,
  Award,
  AlertCircle,
  FileText
} from 'lucide-react';
import { FichaAntropometrica } from '../components/nutricion/FichaAntropometrica';
import { PlanesYSuplementos } from '../components/nutricion/PlanesYSuplementos';
import { AgendaCitas } from '../components/nutricion/AgendaCitas';

export const NutricionView: React.FC = () => {
  const { data } = useData();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'antropometria' | 'planes' | 'agenda'>('antropometria');

  return (
    <div className="view-container">
      {/* Banner Superior Clínico Nutricional */}
      <div
        style={{
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(6, 95, 70, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Apple size={24} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
              Módulo de Nutrición y Dietética Comunitaria
            </h2>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: '0.2rem 0 0' }}>
              Sistema Integrado INN / CDI • Vigilancia Nutricional, Antropometría y Suplementación
            </p>
          </div>
        </div>

        {/* Mini KPIs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, display: 'block', fontWeight: 700 }}>
              Pacientes Fichados
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>{data.pacientes?.length || 24}</span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, display: 'block', fontWeight: 700 }}>
              Suplementos INN
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>4 Activos</span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.45rem 0.85rem',
              borderRadius: '6px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85, display: 'block', fontWeight: 700 }}>
              Turnos Asistenciales
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>M / T</span>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}
      >
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'antropometria' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('antropometria')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Scale size={15} />
          Evaluación Antropométrica & IMC (OMS / INN)
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'planes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('planes')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Apple size={15} />
          Planes Alimentarios & Suplementos INN
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'agenda' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('agenda')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <CalendarCheck size={15} />
          Agenda y Citas por Turno
        </button>
      </div>

      {/* Contenido de la pestaña activa */}
      {activeTab === 'antropometria' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>
          <FichaAntropometrica />
        </div>
      )}

      {activeTab === 'planes' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>
          <PlanesYSuplementos />
        </div>
      )}

      {activeTab === 'agenda' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.06)' }}>
          <AgendaCitas />
        </div>
      )}
    </div>
  );
};
