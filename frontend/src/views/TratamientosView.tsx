import React, { useState } from 'react';
import { Tratamiento, PrescripcionItem, Paciente } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { PrescriptionPrint } from '../components/print/PrescriptionPrint';
import { Stethoscope, Plus, Edit2, Trash2, Printer, PlusCircle, MinusCircle, CheckCircle } from 'lucide-react';

export const TratamientosView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingTratamiento, setEditingTratamiento] = useState<Tratamiento | null>(null);
  const [selectedTratamiento, setSelectedTratamiento] = useState<Tratamiento | null>(null);

  const [formData, setFormData] = useState<Partial<Tratamiento>>({
    codigoTratamiento: '',
    pacienteId: '',
    medicoId: '',
    diagnosticoCIE: '',
    diagnosticoDescripcion: '',
    prescripciones: [],
    indicacionesGenerales: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estado: 'Activo'
  });

  const [currentPrescripciones, setCurrentPrescripciones] = useState<PrescripcionItem[]>([
    {
      medicamentoId: data.medicamentos[0]?.id || '',
      medicamentoNombre: data.medicamentos[0]?.nombreComercial || '',
      dosis: '1 tableta',
      frecuencia: 'Cada 12 horas',
      duracionDias: 30,
      cantidadTotal: 60,
      instruccionesEspeciales: 'Tomar con las comidas'
    }
  ]);

  const handleOpenCreate = () => {
    setEditingTratamiento(null);
    setFormData({
      codigoTratamiento: `TRAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      pacienteId: data.pacientes[0]?.id || '',
      medicoId: data.empleados[1]?.id || data.empleados[0]?.id || '',
      diagnosticoCIE: 'I10 - Hipertensión esencial (primaria)',
      diagnosticoDescripcion: '',
      indicacionesGenerales: 'Reposo relativo y dieta balanceada',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'Activo'
    });
    setCurrentPrescripciones([
      {
        medicamentoId: data.medicamentos[0]?.id || '',
        medicamentoNombre: data.medicamentos[0]?.nombreComercial || '',
        dosis: '1 tableta',
        frecuencia: 'Cada 12 horas',
        duracionDias: 30,
        cantidadTotal: 60,
        instruccionesEspeciales: 'Tomar con las comidas'
      }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (trat: Tratamiento) => {
    setEditingTratamiento(trat);
    setFormData({ ...trat });
    setCurrentPrescripciones(trat.prescripciones || []);
    setIsModalOpen(true);
  };

  const handleOpenPrint = (trat: Tratamiento) => {
    setSelectedTratamiento(trat);
    setIsPrintModalOpen(true);
  };

  const handleDelete = (id: string, code: string) => {
    if (window.confirm(`¿Deseas eliminar el tratamiento ${code}?`)) {
      deleteItem('tratamientos', id);
    }
  };

  const handleAddPrescripcionRow = () => {
    const defaultMed = data.medicamentos[0];
    setCurrentPrescripciones([
      ...currentPrescripciones,
      {
        medicamentoId: defaultMed ? defaultMed.id : '',
        medicamentoNombre: defaultMed ? defaultMed.nombreComercial : '',
        dosis: '1 tableta',
        frecuencia: 'Cada 8 horas',
        duracionDias: 7,
        cantidadTotal: 21,
        instruccionesEspeciales: ''
      }
    ]);
  };

  const handleRemovePrescripcionRow = (idx: number) => {
    setCurrentPrescripciones(currentPrescripciones.filter((_, i) => i !== idx));
  };

  const handlePrescripcionChange = (idx: number, field: keyof PrescripcionItem, val: any) => {
    const updated = [...currentPrescripciones];
    if (field === 'medicamentoId') {
      const med = data.medicamentos.find((m) => m.id === val);
      updated[idx].medicamentoId = val;
      updated[idx].medicamentoNombre = med ? med.nombreComercial : '';
    } else {
      (updated[idx] as any)[field] = val;
    }
    setCurrentPrescripciones(updated);
  };

  // Motor Clínico de Seguridad Farmacológica (Alergias e Interacciones Medicamentosas)
  const getDrugSafetyAlerts = () => {
    const alerts: { tipo: 'alergia' | 'interaccion'; severidad: 'critico' | 'aviso'; mensaje: string }[] = [];
    const paciente = data.pacientes.find((p) => p.id === formData.pacienteId);

    if (!paciente) return alerts;

    // 1. Chequeo Cruzado de Alergias del Paciente
    const patientAllergies = (paciente.alergias || []).map((a) => a.toLowerCase());

    currentPrescripciones.forEach((p) => {
      const med = data.medicamentos.find((m) => m.id === p.medicamentoId);
      if (!med) return;

      const medName = `${med.nombreComercial} ${med.principioActivo}`.toLowerCase();

      // Chequeo Penicilinas / Betalactámicos
      if (patientAllergies.some((a) => a.includes('penicilina') || a.includes('betalactam'))) {
        if (medName.includes('amoxicilina') || medName.includes('ampicilina') || medName.includes('penicilina') || medName.includes('cefalexina')) {
          alerts.push({
            tipo: 'alergia',
            severidad: 'critico',
            mensaje: `¡ALERTA CRÍTICA DE ALERGIA! El paciente es alérgico a Penicilinas y se está prescribiendo ${med.nombreComercial} (${med.principioActivo}).`
          });
        }
      }

      // Chequeo AINEs / Aspirina
      if (patientAllergies.some((a) => a.includes('aine') || a.includes('aspirina') || a.includes('ibuprofeno'))) {
        if (medName.includes('ibuprofeno') || medName.includes('diclofenac') || medName.includes('ketoprofeno') || medName.includes('aspirina')) {
          alerts.push({
            tipo: 'alergia',
            severidad: 'critico',
            mensaje: `¡ALERTA DE ALERGIA A AINES! El paciente tiene antecedentes de hipersensibilidad a antiinflamatorios no esteroideos (${med.nombreComercial}).`
          });
        }
      }
    });

    // 2. Chequeo de Interacciones Medicamento - Medicamento
    const medNames = currentPrescripciones
      .map((p) => {
        const med = data.medicamentos.find((m) => m.id === p.medicamentoId);
        return med ? `${med.nombreComercial} ${med.principioActivo}`.toLowerCase() : '';
      })
      .filter(Boolean);

    // Warfarina / Anticoagulantes + AINEs
    const hasAnticoagulant = medNames.some((m) => m.includes('warfarina') || m.includes('enoxaparina') || m.includes('aspirina'));
    const hasNSAID = medNames.some((m) => m.includes('ibuprofeno') || m.includes('diclofenac') || m.includes('ketoprofeno'));
    if (hasAnticoagulant && hasNSAID) {
      alerts.push({
        tipo: 'interaccion',
        severidad: 'critico',
        mensaje: 'INTERACCIÓN GRAVE: Coadministración de Anticoagulante/Antiagregante con AINEs incrementa drásticamente el riesgo de hemorragia digestiva.'
      });
    }

    // IECAs + ARA-II
    const hasIECA = medNames.some((m) => m.includes('enalapril') || m.includes('captopril') || m.includes('lisinopril'));
    const hasARA = medNames.some((m) => m.includes('losartan') || m.includes('valsartan'));
    if (hasIECA && hasARA) {
      alerts.push({
        tipo: 'interaccion',
        severidad: 'aviso',
        mensaje: 'PRECAUCIÓN: Bloqueo dual del SRAA (IECA + ARA-II) no recomendado por riesgo de hiperpotasemia e hipotensión severa.'
      });
    }

    return alerts;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pacienteId || !formData.medicoId || currentPrescripciones.length === 0) {
      alert('Por favor complete los campos y agregue al menos un medicamento');
      return;
    }

    const safetyAlerts = getDrugSafetyAlerts();
    const criticalAlert = safetyAlerts.find((a) => a.severidad === 'critico');
    if (criticalAlert) {
      const confirmOverride = window.confirm(
        `ADVERTENCIA DE SEGURIDAD FARMACOLÓGICA:\n\n${criticalAlert.mensaje}\n\n¿Desea proceder bajo justificación y supervisión médica estricta?`
      );
      if (!confirmOverride) return;
    }

    const paciente = data.pacientes.find((p) => p.id === formData.pacienteId);
    const medico = data.empleados.find((e) => e.id === formData.medicoId);

    const payload: Partial<Tratamiento> = {
      ...formData,
      pacienteNombre: paciente ? `${paciente.nombres} ${paciente.apellidos}` : 'Paciente',
      pacienteCedula: paciente ? paciente.cedula : '',
      medicoNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico',
      prescripciones: currentPrescripciones
    };

    if (editingTratamiento) {
      updateItem('tratamientos', editingTratamiento.id, payload);
    } else {
      createItem('tratamientos', {
        ...payload,
        id: `tra-${Date.now()}`
      });
    }

    setIsModalOpen(false);
  };


  const columns: Column<Tratamiento>[] = [
    {
      header: 'Código / Fecha',
      accessor: (t) => (
        <div>
          <b style={{ fontFamily: 'JetBrains Mono', color: '#2563eb' }}>{t.codigoTratamiento}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Inicio: {t.fechaInicio}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'fechaInicio'
    },
    {
      header: 'Paciente',
      accessor: (t) => (
        <div>
          <b style={{ color: '#0f172a' }}>{t.pacienteNombre}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>C.I: {t.pacienteCedula}</div>
        </div>
      ),
      sortable: true,
      sortKey: 'pacienteNombre'
    },
    {
      header: 'Médico Tratante',
      accessor: 'medicoNombre',
      sortable: true
    },
    {
      header: 'Diagnóstico CIE',
      accessor: (t) => (
        <div>
          <b style={{ fontSize: '0.8rem', color: '#0f172a' }}>{t.diagnosticoCIE}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.diagnosticoDescripcion}</div>
        </div>
      )
    },
    {
      header: 'Fármacos Prescritos',
      accessor: (t) => (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0d9488' }}>
            {t.prescripciones.length} Fármaco(s)
          </span>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {t.prescripciones.map((p) => p.medicamentoNombre).slice(0, 2).join(', ')}
            {t.prescripciones.length > 2 && '...'}
          </div>
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (t) => (
        <Badge variant={t.estado === 'Activo' ? 'success' : 'neutral'}>
          {t.estado}
        </Badge>
      ),
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.tratamientos}
        columns={columns}
        searchPlaceholder="Buscar por código, paciente, médico o diagnóstico..."
        addNewLabel="Emitir Nuevo Tratamiento"
        onAddNew={handleOpenCreate}
        exportTitle="Tratamientos"
        actions={(t) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenPrint(t)}
              title="Imprimir Recipe Médico Oficial"
            >
              <Printer size={15} color="#0d9488" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(t)}
              title="Editar Tratamiento"
            >
              <Edit2 size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(t.id, t.codigoTratamiento)}
              title="Eliminar Tratamiento"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Emitir / Editar Tratamiento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTratamiento ? 'Modificar Plan Terapéutico' : 'Emitir Nuevo Plan Terapéutico y Recipe'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Paciente *</label>
              <select
                className="form-select"
                required
                value={formData.pacienteId}
                onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
              >
                <option value="">Seleccionar Paciente</option>
                {data.pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.apellidos} ({p.cedula})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Médico Tratante *</label>
              <select
                className="form-select"
                required
                value={formData.medicoId}
                onChange={(e) => setFormData({ ...formData, medicoId: e.target.value })}
              >
                <option value="">Seleccionar Médico</option>
                {data.empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} ({emp.cargoTitulo})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnóstico CIE-10 / Principal *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.diagnosticoCIE}
                onChange={(e) => setFormData({ ...formData, diagnosticoCIE: e.target.value })}
                placeholder="Ej. I10 Hipertensión Arterial"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción Clínica</label>
              <input
                type="text"
                className="form-input"
                value={formData.diagnosticoDescripcion}
                onChange={(e) => setFormData({ ...formData, diagnosticoDescripcion: e.target.value })}
                placeholder="Detalle o evolución del cuadro clínico"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Inicio *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Fin / Próximo Control</label>
              <input
                type="date"
                className="form-input"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              />
            </div>

            {/* Motor de Seguridad Farmacológica y Alerta de Interacciones */}
            {(() => {
              const alerts = getDrugSafetyAlerts();
              if (alerts.length === 0) return null;

              return (
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {alerts.map((al, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: al.severidad === 'critico' ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${al.severidad === 'critico' ? '#f87171' : '#fcd34d'}`,
                        color: al.severidad === 'critico' ? '#991b1b' : '#92400e',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                      <div style={{ fontWeight: 600 }}>{al.mensaje}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Prescripción Dinámica de Fármacos */}
            <div style={{ gridColumn: 'span 2', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <b style={{ fontSize: '0.9rem', color: '#2563eb' }}>
                  Prescripciones Farmacológicas (Rp.)
                </b>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddPrescripcionRow}
                >
                  <PlusCircle size={14} />
                  <span>Agregar Fármaco</span>
                </button>
              </div>


              {currentPrescripciones.map((pItem, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <div>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Medicamento</label>
                    <select
                      className="form-select"
                      style={{ fontSize: '0.78rem' }}
                      value={pItem.medicamentoId}
                      onChange={(e) => handlePrescripcionChange(idx, 'medicamentoId', e.target.value)}
                    >
                      {data.medicamentos.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nombreComercial} ({m.concentracion} - {m.presentacion})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Dosis</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.78rem' }}
                      value={pItem.dosis}
                      onChange={(e) => handlePrescripcionChange(idx, 'dosis', e.target.value)}
                      placeholder="1 tableta"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Frecuencia</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.78rem' }}
                      value={pItem.frecuencia}
                      onChange={(e) => handlePrescripcionChange(idx, 'frecuencia', e.target.value)}
                      placeholder="C/ 8 hrs"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.7rem' }}>Total Unidades</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ fontSize: '0.78rem' }}
                      value={pItem.cantidadTotal}
                      onChange={(e) => handlePrescripcionChange(idx, 'cantidadTotal', Number(e.target.value))}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-icon btn-sm"
                      onClick={() => handleRemovePrescripcionRow(idx)}
                      disabled={currentPrescripciones.length === 1}
                      title="Quitar fármaco"
                    >
                      <MinusCircle size={15} color="#dc2626" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Indicaciones Generales y Cuidados</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.indicacionesGenerales}
                onChange={(e) => setFormData({ ...formData, indicacionesGenerales: e.target.value })}
                placeholder="Pautas dietéticas, descanso, hidratación o señales de alarma"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTratamiento ? 'Guardar Tratamiento' : 'Emitir Recipe Oficial'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Imprimir Recipe */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Vista de Impresión - Recipe Médico Oficial"
        size="large"
      >
        {selectedTratamiento && (
          <PrescriptionPrint
            tratamiento={selectedTratamiento}
            paciente={data.pacientes.find((p) => p.id === selectedTratamiento.pacienteId)}
            onClose={() => setIsPrintModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};
