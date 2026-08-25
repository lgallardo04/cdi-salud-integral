import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  LayoutDashboard,
  Users,
  Activity,
  CalendarCheck,
  Stethoscope,
  Pill,
  HeartPulse,
  Truck,
  FlaskConical,
  Building2,
  UserCheck,
  Clock,
  Briefcase,
  Shield,
  FileText,
  Video,
  DollarSign,
  QrCode,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { ModuloNombre } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface MobileModulesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeModule: ModuloNombre;
  setActiveModule: (mod: ModuloNombre) => void;
}

type CategoryKey = 'todos' | 'urgencias' | 'diagnostico' | 'farmacia' | 'gestion' | 'seguridad';

interface ModuleItem {
  id: ModuloNombre;
  label: string;
  category: CategoryKey;
  icon: React.ElementType;
  description: string;
  badge?: string | number;
  badgeVariant?: 'urgent' | 'warning' | 'info' | 'success';
}

export const MobileModulesSheet: React.FC<MobileModulesSheetProps> = ({
  isOpen,
  onClose,
  activeModule,
  setActiveModule
}) => {
  const { hasPermission, currentUser, currentRole } = useAuth();
  const { kpis } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('todos');

  const allModules: ModuleItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Panel General',
      category: 'urgencias',
      icon: LayoutDashboard,
      description: 'Métricas asistenciales y KPIs en vivo'
    },
    {
      id: 'portal_paciente',
      label: 'Portal Paciente (Kiosko)',
      category: 'urgencias',
      icon: QrCode,
      description: 'Autogestión de citas y recetas con QR'
    },
    {
      id: 'triaje',
      label: 'Triaje Urgencias (NEWS2)',
      category: 'urgencias',
      icon: Activity,
      description: 'Clasificación de riesgo y signos vitales',
      badge: kpis.urgenciasActivas > 0 ? `${kpis.urgenciasActivas} Urg` : undefined,
      badgeVariant: 'urgent'
    },
    {
      id: 'hospitalizacion',
      label: 'Hospitalización y Camas',
      category: 'urgencias',
      icon: Building2,
      description: 'Censo hospitalario y notas SOAP',
      badge: `${kpis.pacientesHospitalizados || 8} Camas`,
      badgeVariant: 'info'
    },
    {
      id: 'pacientes',
      label: 'Registro de Pacientes',
      category: 'urgencias',
      icon: Users,
      description: 'Historias clínicas y antecedentes',
      badge: kpis.totalPacientes,
      badgeVariant: 'info'
    },
    {
      id: 'citas',
      label: 'Agenda de Citas',
      category: 'urgencias',
      icon: CalendarCheck,
      description: 'Consultas programadas y triaje',
      badge: kpis.citasHoy > 0 ? `${kpis.citasHoy} Hoy` : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'tratamientos',
      label: 'Tratamientos y Récipes',
      category: 'urgencias',
      icon: Stethoscope,
      description: 'Planes terapéuticos e impresión médica'
    },
    // Diagnóstico y Especialidades
    {
      id: 'laboratorio',
      label: 'Laboratorio Clínico (LIS)',
      category: 'diagnostico',
      icon: FlaskConical,
      description: 'Bioanálisis, perfiles bioquímicos y QR',
      badge: kpis.laboratoriosPendientes > 0 ? `${kpis.laboratoriosPendientes} Pend` : undefined,
      badgeVariant: 'warning'
    },
    {
      id: 'imagenologia',
      label: 'Imagenología y Rayos X',
      category: 'diagnostico',
      icon: HeartPulse,
      description: 'Visor DICOM, placas y ecografías',
      badge: kpis.imagenesPendientes > 0 ? `${kpis.imagenesPendientes} Pend` : undefined,
      badgeVariant: 'info'
    },
    {
      id: 'odontologia',
      label: 'Odontología y FDI',
      category: 'diagnostico',
      icon: Shield,
      description: 'Odontograma interactivo por caras'
    },
    {
      id: 'telemedicina',
      label: 'Telemedicina Virtual',
      category: 'diagnostico',
      icon: Video,
      description: 'Videoconsultas e interconsultas'
    },
    // Farmacia
    {
      id: 'farmacia',
      label: 'Movimientos de Farmacia',
      category: 'farmacia',
      icon: HeartPulse,
      description: 'Despachos, entradas, lotes y vencimientos'
    },
    {
      id: 'medicamentos',
      label: 'Catálogo Medicamentos',
      category: 'farmacia',
      icon: Pill,
      description: 'Stock, principio activo y alertas',
      badge: kpis.medicamentosCriticos > 0 ? `${kpis.medicamentosCriticos} Alert` : undefined,
      badgeVariant: 'urgent'
    },
    {
      id: 'proveedores',
      label: 'Proveedores y Laboratorios',
      category: 'farmacia',
      icon: Truck,
      description: 'Directorio de compras e insumos'
    },
    // Gestión y Finanzas
    {
      id: 'facturacion',
      label: 'Baremos y Facturación',
      category: 'gestion',
      icon: DollarSign,
      description: 'Tarifario CDI, USD/Bs y exoneraciones'
    },
    {
      id: 'epidemiologia',
      label: 'Epidemiología (EPI-12)',
      category: 'gestion',
      icon: Activity,
      description: 'Vigilancia de brotes y salud pública'
    },
    {
      id: 'departamentos',
      label: 'Departamentos y Áreas',
      category: 'gestion',
      icon: Building2,
      description: 'Servicios médicos y consultorios'
    },
    {
      id: 'empleados',
      label: 'Personal y Empleados',
      category: 'gestion',
      icon: UserCheck,
      description: 'Médicos, enfermeros y colegiatura'
    },
    {
      id: 'horarios',
      label: 'Horarios y Turnos',
      category: 'gestion',
      icon: Clock,
      description: 'Guardias de 24h y rotaciones'
    },
    {
      id: 'cargos',
      label: 'Estructura de Cargos',
      category: 'gestion',
      icon: Briefcase,
      description: 'Jerarquías y descripciones de puesto'
    },
    // Seguridad
    {
      id: 'usuarios',
      label: 'Usuarios y Accesos',
      category: 'seguridad',
      icon: Users,
      description: 'Credenciales y estados de cuenta'
    },
    {
      id: 'roles',
      label: 'Roles y Permisos',
      category: 'seguridad',
      icon: Shield,
      description: 'Matriz RBAC de control asistencial'
    },
    {
      id: 'auditoria',
      label: 'Auditoría HIPAA',
      category: 'seguridad',
      icon: FileText,
      description: 'Trazabilidad inmutable de historias clínicas'
    }
  ], [kpis]);

  const filteredModules = useMemo(() => {
    return allModules.filter((mod) => {
      if (!hasPermission(mod.id, 'ver')) return false;
      if (selectedCategory !== 'todos' && mod.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return (
          mod.label.toLowerCase().includes(term) ||
          mod.description.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [allModules, hasPermission, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  const categories: { id: CategoryKey; label: string }[] = [
    { id: 'todos', label: 'Todos (23)' },
    { id: 'urgencias', label: 'Clínica' },
    { id: 'diagnostico', label: 'Diagnóstico' },
    { id: 'farmacia', label: 'Farmacia' },
    { id: 'gestion', label: 'Gestión' },
    { id: 'seguridad', label: 'Seguridad' }
  ];

  const handleSelect = (modId: ModuloNombre) => {
    setActiveModule(modId);
    onClose();
  };

  return (
    <div className="mobile-sheet-overlay" onClick={onClose}>
      <div className="mobile-sheet-content" onClick={(e) => e.stopPropagation()}>
        {/* Grab Handle */}
        <div className="mobile-sheet-handle-bar">
          <div className="mobile-sheet-handle" />
        </div>

        {/* Header */}
        <div className="mobile-sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-icon-wrapper" style={{ width: '36px', height: '36px' }}>
              <Activity size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                Módulos del Sistema CDI
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Rol activo: <b style={{ color: 'var(--color-secondary)' }}>{currentRole?.nombre || 'Usuario'}</b>
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-icon btn-sm"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div style={{ padding: '0.75rem 1rem 0.5rem 1rem' }}>
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-input"
              style={{ fontSize: '0.9rem', paddingLeft: '2.4rem' }}
              placeholder="Buscar entre los 23 módulos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={false}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="mobile-category-scroll">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`mobile-category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Module Grid List */}
        <div className="mobile-sheet-body">
          {filteredModules.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>No se encontraron módulos disponibles.</p>
              <span style={{ fontSize: '0.78rem' }}>Intenta cambiar el filtro o término de búsqueda.</span>
            </div>
          ) : (
            <div className="mobile-modules-grid">
              {filteredModules.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;

                return (
                  <button
                    key={mod.id}
                    type="button"
                    className={`mobile-module-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelect(mod.id)}
                  >
                    <div className="mobile-module-icon-box">
                      <Icon size={20} />
                    </div>

                    <div className="mobile-module-info">
                      <div className="mobile-module-title-row">
                        <span className="mobile-module-title">{mod.label}</span>
                        {mod.badge && (
                          <span className={`badge badge-${mod.badgeVariant || 'info'}`} style={{ fontSize: '0.65rem' }}>
                            {mod.badge}
                          </span>
                        )}
                      </div>
                      <span className="mobile-module-desc">{mod.description}</span>
                    </div>

                    <ChevronRight size={16} className="mobile-module-arrow" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer User Info */}
        <div className="mobile-sheet-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '0.78rem' }}>
              {currentUser.nombreCompleto.charAt(0)}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {currentUser.nombreCompleto}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                Sesión Segura CDI
              </span>
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
            <CheckCircle2 size={12} /> Local Offline Ready
          </span>
        </div>
      </div>
    </div>
  );
};
