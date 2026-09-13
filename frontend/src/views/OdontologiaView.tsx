import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { OdontogramaPaciente, DetalleDiente, TratamientoDentalItem } from '../types';
import {
  Smile,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Sparkles,
  Edit,
  Trash2,
  DollarSign,
  Shield,
  Activity,
  Layers
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { OdontologiaV2 } from '../components/odontologia/OdontologiaV2';

export const OdontologiaView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'v2' | 'anatomico' | 'presupuesto'>('v2');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(
    data.pacientes[1]?.id || data.pacientes[0]?.id || ''
  );
  const [selectedToothNumber, setSelectedToothNumber] = useState<number | null>(null);
  const [isToothModalOpen, setIsToothModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Nuevo item de tratamiento dental
  const [newPlanItem, setNewPlanItem] = useState({
    dienteNumero: 14,
    procedimiento: 'Restauración con Resina Fotocurada',
    costoEstimadoUSD: 15
  });

  const canEdit = hasPermission('odontologia', 'editar');

  const odontogramas = data.odontogramas || [];
  const currentOdontograma = odontogramas.find((o) => o.pacienteId === selectedPacienteId);
  const selectedPaciente = data.pacientes.find((p) => p.id === selectedPacienteId);

  // Crear odontograma inicial si el paciente no tiene uno
  const getOrCreateOdontograma = (): OdontogramaPaciente => {
    if (currentOdontograma) return currentOdontograma;

    const defaultDientes: Record<number, DetalleDiente> = {};
    const permanentTeeth = [
      18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
      48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
    ];

    permanentTeeth.forEach((num) => {
      defaultDientes[num] = {
        numeroDiente: num,
        estadoGeneral: 'Sano',
        caras: {
          oclusal: 'Sana',
          vestibular: 'Sana',
          lingual: 'Sana',
          mesial: 'Sana',
          distal: 'Sana'
        }
      };
    });

    const newOdo: OdontogramaPaciente = {
      id: `odo-${Date.now()}`,
      pacienteId: selectedPacienteId,
      pacienteNombre: selectedPaciente ? `${selectedPaciente.nombres} ${selectedPaciente.apellidos}` : 'Paciente',
      pacienteCedula: selectedPaciente?.cedula || '',
      odontologoId: 'emp-9',
      odontologoNombre: 'Dra. Valeria Fuentes (Odontóloga Integral)',
      fechaEvaluacion: new Date().toISOString().substring(0, 10),
      dientes: defaultDientes,
      indiceHigieneOral: 'Bueno',
      diagnosticoPeriodontal: 'Encías con leve inflamación marginal.',
      planTratamiento: [],
      estado: 'Activo'
    };

    return newOdo;
  };

  const activeOdontograma = getOrCreateOdontograma();

  const handleToothClick = (toothNumber: number) => {
    setSelectedToothNumber(toothNumber);
    setIsToothModalOpen(true);
  };

  const handleUpdateTooth = (
    estadoGeneral: DetalleDiente['estadoGeneral'],
    carasUpdate?: DetalleDiente['caras']
  ) => {
    if (!selectedToothNumber) return;

    const currentDientes = { ...activeOdontograma.dientes };
    const tooth = currentDientes[selectedToothNumber] || {
      numeroDiente: selectedToothNumber,
      estadoGeneral: 'Sano',
      caras: {}
    };

    tooth.estadoGeneral = estadoGeneral;
    if (carasUpdate) {
      tooth.caras = { ...tooth.caras, ...carasUpdate };
    }

    currentDientes[selectedToothNumber] = tooth;

    if (currentOdontograma) {
      updateItem('odontogramas', currentOdontograma.id, {
        dientes: currentDientes
      });
    } else {
      createItem('odontogramas', {
        ...activeOdontograma,
        dientes: currentDientes
      });
    }

    setIsToothModalOpen(false);
  };

  const handleAddPlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: TratamientoDentalItem = {
      id: `td-${Date.now()}`,
      dienteNumero: Number(newPlanItem.dienteNumero) || undefined,
      procedimiento: newPlanItem.procedimiento,
      costoEstimadoUSD: Number(newPlanItem.costoEstimadoUSD),
      estado: 'Planificado'
    };

    const updatedPlan = [...(activeOdontograma.planTratamiento || []), newItem];

    if (currentOdontograma) {
      updateItem('odontogramas', currentOdontograma.id, {
        planTratamiento: updatedPlan
      });
    } else {
      createItem('odontogramas', {
        ...activeOdontograma,
        planTratamiento: updatedPlan
      });
    }

    setIsPlanModalOpen(false);
  };

  const handleRemovePlanItem = (id: string) => {
    const updatedPlan = (activeOdontograma.planTratamiento || []).filter((item) => item.id !== id);
    if (currentOdontograma) {
      updateItem('odontogramas', currentOdontograma.id, {
        planTratamiento: updatedPlan
      });
    }
  };

  // Renderizador SVG de cada Diente Anatómico
  const renderToothSVG = (toothNumber: number) => {
    const tooth = activeOdontograma.dientes[toothNumber] || {
      numeroDiente: toothNumber,
      estadoGeneral: 'Sano',
      caras: {}
    };

    const getSurfaceColor = (surfaceStatus?: string) => {
      switch (surfaceStatus) {
        case 'Caries':
          return '#ef4444'; // Rojo
        case 'Obturacion Resina':
          return '#3b82f6'; // Azul
        case 'Obturacion Amalgama':
          return '#1e3a8a'; // Azul oscuro
        case 'Sellante':
          return '#06b6d4'; // Cian
        default:
          return '#ffffff'; // Sano
      }
    };

    const isAusente = tooth.estadoGeneral === 'Ausente' || tooth.estadoGeneral === 'Exodoncia Indicada';
    const isCorona = tooth.estadoGeneral === 'Corona';
    const isEndodoncia = tooth.estadoGeneral === 'Endodoncia';
    const isImplante = tooth.estadoGeneral === 'Implante';

    return (
      <div
        key={toothNumber}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '6px',
          backgroundColor: selectedToothNumber === toothNumber ? '#e0f2fe' : 'transparent',
          transition: 'background-color 0.15s ease'
        }}
        onClick={() => handleToothClick(toothNumber)}
        title={`Diente ${toothNumber} - Estado: ${tooth.estadoGeneral}`}
      >
        <span className="font-mono font-bold" style={{ fontSize: '0.75rem', color: '#0f172a' }}>
          {toothNumber}
        </span>

        {/* SVG Representación FDI de 5 Caras */}
        <div style={{ position: 'relative', width: '38px', height: '38px' }}>
          <svg width="38" height="38" viewBox="0 0 40 40">
            {/* Cara Vestibular (Superior) */}
            <polygon
              points="0,0 40,0 30,10 10,10"
              fill={getSurfaceColor(tooth.caras?.vestibular)}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Cara Distal (Derecha) */}
            <polygon
              points="40,0 40,40 30,30 30,10"
              fill={getSurfaceColor(tooth.caras?.distal)}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Cara Lingual / Palatina (Inferior) */}
            <polygon
              points="40,40 0,40 10,30 30,30"
              fill={getSurfaceColor(tooth.caras?.lingual)}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Cara Mesial (Izquierda) */}
            <polygon
              points="0,0 0,40 10,30 10,10"
              fill={getSurfaceColor(tooth.caras?.mesial)}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            {/* Cara Oclusal / Incisal (Centro) */}
            <polygon
              points="10,10 30,10 30,30 10,30"
              fill={getSurfaceColor(tooth.caras?.oclusal)}
              stroke="#0f172a"
              strokeWidth="1.2"
            />
          </svg>

          {/* Overlays de Estado General (Cruz para Ausente, Corona, Endodoncia, Implante) */}
          {isAusente && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                fontWeight: 900,
                fontSize: '1.4rem',
                lineHeight: 1
              }}
            >
              ✕
            </div>
          )}

          {isCorona && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '2px solid #d97706',
                borderRadius: '4px',
                pointerEvents: 'none'
              }}
            />
          )}

          {isEndodoncia && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#9333ea'
              }}
            />
          )}

          {isImplante && (
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '12px',
                height: '3px',
                backgroundColor: '#16a34a'
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const totalPresupuestoUSD = (activeOdontograma.planTratamiento || []).reduce(
    (sum, item) => sum + (item.costoEstimadoUSD || 0),
    0
  );

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Smile size={24} />
          </div>
          <div>
            <h1 className="view-title">Odontología y Odontograma Anatómico (FDI)</h1>
            <p className="view-subtitle">
              Mapeo gráfico dental por superficies (oclusal, vestibular, lingual, mesial, distal), periodoncia y presupuestos.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          <button type="button" className="btn btn-primary" onClick={() => setIsPlanModalOpen(true)}>
            <Plus size={16} />
            <span>Agregar Tratamiento Dental</span>
          </button>
        </div>
      </div>

      {/* Selector de Pestañas Stitch Clinical Precision */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0.65rem',
          overflowX: 'auto'
        }}
      >
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'v2' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('v2')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <Sparkles size={15} />
          <span>Módulo Odontología V2</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'v2' ? 'rgba(255, 255, 255, 0.25)' : '#e0f2fe',
              color: activeTab === 'v2' ? '#ffffff' : '#0284c7',
              fontWeight: 700
            }}
          >
            PROD
          </span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'anatomico' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('anatomico')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <Smile size={15} />
          <span>Odontograma Anatómico FDI (5 Caras)</span>
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'presupuesto' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('presupuesto')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
        >
          <DollarSign size={15} />
          <span>Plan y Presupuesto Odontológico</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'presupuesto' ? 'rgba(255, 255, 255, 0.25)' : '#f1f5f9',
              color: activeTab === 'presupuesto' ? '#ffffff' : '#475569',
              fontWeight: 700
            }}
          >
            {activeOdontograma.planTratamiento?.length || 0}
          </span>
        </button>
      </div>

      {/* PESTAÑA 1: MÓDULO ODONTOLOGÍA V2 */}
      {activeTab === 'v2' && <OdontologiaV2 />}

      {/* PESTAÑA 2: ODONTOGRAMA ANATÓMICO FDI */}
      {activeTab === 'anatomico' && (
        <>
          {/* Selector de Paciente y Resumen Clínico */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Seleccionar Paciente para Odontograma:</label>
                <select
                  className="input select-input"
                  value={selectedPacienteId}
                  onChange={(e) => setSelectedPacienteId(e.target.value)}
                >
                  {data.pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} ({p.cedula}) - {p.edad} años
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div><strong>Odontólogo Tratante:</strong> {activeOdontograma.odontologoNombre}</div>
                <div><strong>Índice Higiene Oral:</strong> <Badge type="success">{activeOdontograma.indiceHigieneOral || 'Bueno'}</Badge></div>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ color: '#166534' }}><strong>Plan de Tratamiento Total:</strong></div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d' }} className="font-mono">
                  ${totalPresupuestoUSD} USD <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>({activeOdontograma.planTratamiento?.length || 0} procedimientos)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Convenciones / Leyenda Clínica Dental */}
          <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.25rem', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>Leyenda Dental:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#ffffff', border: '1px solid #0f172a' }}></div>
                <span>Sano</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#ef4444' }}></div>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>Caries</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#3b82f6' }}></div>
                <span style={{ color: '#2563eb' }}>Resina</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#1e3a8a' }}></div>
                <span>Amalgama</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', background: '#9333ea' }}></div>
                <span>Endodoncia</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', border: '2px solid #d97706' }}></div>
                <span>Corona</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#dc2626', fontWeight: 900 }}>✕</span>
                <span>Ausente / Extracción</span>
              </div>
            </div>
          </div>

          {/* Odontograma Anatómico Gráfico Completo */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', textAlign: 'center', marginBottom: '1rem' }}>
              Arcada Superior (Maxilar)
            </h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem', minWidth: '680px' }}>
              {/* Cuadrante 1 (Superior Derecho) */}
              <div style={{ display: 'flex', gap: '0.4rem', borderRight: '2px solid #0f172a', paddingRight: '1rem' }}>
                {upperRight.map((num) => renderToothSVG(num))}
              </div>

              {/* Cuadrante 2 (Superior Izquierdo) */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {upperLeft.map((num) => renderToothSVG(num))}
              </div>
            </div>

            <div style={{ height: '2px', backgroundColor: '#e2e8f0', margin: '1rem auto', maxWidth: '720px' }}></div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', textAlign: 'center', margin: '1rem 0' }}>
              Arcada Inferior (Mandíbula)
            </h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', minWidth: '680px' }}>
              {/* Cuadrante 4 (Inferior Derecho) */}
              <div style={{ display: 'flex', gap: '0.4rem', borderRight: '2px solid #0f172a', paddingRight: '1rem' }}>
                {lowerRight.map((num) => renderToothSVG(num))}
              </div>

              {/* Cuadrante 3 (Inferior Izquierdo) */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {lowerLeft.map((num) => renderToothSVG(num))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* PESTAÑA 3: PLAN Y PRESUPUESTO */}
      {activeTab === 'presupuesto' && (
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Plan de Tratamiento Odontológico y Procedimientos
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Procedimientos programados para este paciente
            </span>
          </div>

          <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Imprimir Presupuesto Odontológico</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Diente / Sector</th>
                <th>Procedimiento Dental</th>
                <th>Costo Estimado (USD)</th>
                <th>Estado</th>
                <th className="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {(activeOdontograma.planTratamiento || []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                    No hay procedimientos agregados al plan de tratamiento.
                  </td>
                </tr>
              ) : (
                activeOdontograma.planTratamiento.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="badge badge-primary font-mono">
                        {item.dienteNumero ? `Pieza ${item.dienteNumero}` : 'General / Boca Completa'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.procedimiento}</td>
                    <td className="font-mono font-bold" style={{ color: '#15803d' }}>
                      ${item.costoEstimadoUSD} USD
                    </td>
                    <td>
                      <Badge type={item.estado === 'Completado' ? 'success' : 'warning'}>
                        {item.estado}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-secondary btn-icon btn-sm text-danger"
                        title="Eliminar Procedimiento"
                        onClick={() => handleRemovePlanItem(item.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal Inspector y Modificador de Diente */}
      {isToothModalOpen && selectedToothNumber && (
        <Modal
          title={`Inspección Dental: Pieza ${selectedToothNumber} (FDI)`}
          onClose={() => setIsToothModalOpen(false)}
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">Estado General de la Pieza Dental</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUpdateTooth('Sano')}
                >
                  Diente Sano
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUpdateTooth('Corona')}
                >
                  Corona / Prótesis Fija
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUpdateTooth('Endodoncia')}
                >
                  Endodoncia / Conducto
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleUpdateTooth('Implante')}
                >
                  Implante Dental
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-danger"
                  onClick={() => handleUpdateTooth('Ausente')}
                >
                  Ausente / Exodoncia
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm text-danger"
                  onClick={() => handleUpdateTooth('Exodoncia Indicada')}
                >
                  Exodoncia Indicada
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <label className="form-label">Afectación Rápida por Caras</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#dc2626' }}
                  onClick={() => handleUpdateTooth('Sano', { oclusal: 'Caries' })}
                >
                  Caries en Oclusal
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#2563eb' }}
                  onClick={() => handleUpdateTooth('Sano', { oclusal: 'Obturacion Resina' })}
                >
                  Resina en Oclusal
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#dc2626' }}
                  onClick={() => handleUpdateTooth('Sano', { vestibular: 'Caries' })}
                >
                  Caries en Vestibular
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#2563eb' }}
                  onClick={() => handleUpdateTooth('Sano', { vestibular: 'Obturacion Resina' })}
                >
                  Resina en Vestibular
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Agregar Procedimiento al Plan */}
      {isPlanModalOpen && (
        <Modal
          title="Agregar Procedimiento al Plan de Tratamiento Dental"
          onClose={() => setIsPlanModalOpen(false)}
          size="md"
        >
          <form onSubmit={handleAddPlanItem} className="form-grid">
            <div className="form-group">
              <label className="form-label">Pieza Dental (Opcional)</label>
              <input
                type="number"
                className="input font-mono"
                placeholder="Ej. 14, 21, 36 (o dejar vacío para boca completa)..."
                value={newPlanItem.dienteNumero || ''}
                onChange={(e) => setNewPlanItem({ ...newPlanItem, dienteNumero: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Procedimiento Odontológico</label>
              <input
                type="text"
                className="input"
                placeholder="Ej. Restauración con Resina Fotocurada, Profilaxis..."
                value={newPlanItem.procedimiento}
                onChange={(e) => setNewPlanItem({ ...newPlanItem, procedimiento: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Costo Estimado (USD)</label>
              <input
                type="number"
                className="input font-mono"
                value={newPlanItem.costoEstimadoUSD}
                onChange={(e) => setNewPlanItem({ ...newPlanItem, costoEstimadoUSD: Number(e.target.value) })}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsPlanModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Agregar al Plan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
