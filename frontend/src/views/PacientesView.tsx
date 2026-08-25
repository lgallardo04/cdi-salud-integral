import React, { useState } from 'react';
import { Paciente } from '../types';
import { useData } from '../context/DataContext';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { MedicalRecordPrint } from '../components/print/MedicalRecordPrint';
import { UserPlus, Eye, Edit2, Trash2, Printer, FileText } from 'lucide-react';

export const PacientesView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem } = useData();

  // Estados de modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Paciente | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Paciente>>({
    cedula: '',
    nombres: '',
    apellidos: '',
    fechaNacimiento: '',
    edad: 0,
    genero: 'Masculino',
    tipoSangre: 'O+',
    telefono: '',
    email: '',
    direccion: '',
    contactoEmergencia: { nombre: '', parentesco: '', telefono: '' },
    alergias: [],
    antecedentes: [],
    estado: 'Activo'
  });

  const [alergiasInput, setAlergiasInput] = useState('');
  const [antecedentesInput, setAntecedentesInput] = useState('');

  const handleOpenCreate = () => {
    setEditingPatient(null);
    setFormData({
      cedula: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: '1990-01-01',
      edad: 35,
      genero: 'Masculino',
      tipoSangre: 'O+',
      telefono: '',
      email: '',
      direccion: '',
      contactoEmergencia: { nombre: '', parentesco: '', telefono: '' },
      alergias: [],
      antecedentes: [],
      estado: 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    });
    setAlergiasInput('');
    setAntecedentesInput('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (paciente: Paciente) => {
    setEditingPatient(paciente);
    setFormData({ ...paciente });
    setAlergiasInput(paciente.alergias.join(', '));
    setAntecedentesInput(paciente.antecedentes.join(', '));
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (paciente: Paciente) => {
    setSelectedPatient(paciente);
    setIsDetailModalOpen(true);
  };

  const handleOpenPrint = (paciente: Paciente) => {
    setSelectedPatient(paciente);
    setIsPrintModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el registro de ${name}?`)) {
      deleteItem('pacientes', id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula || !formData.nombres || !formData.apellidos) {
      alert('Por favor complete los campos obligatorios (Cédula, Nombres, Apellidos)');
      return;
    }

    const payload = {
      ...formData,
      alergias: alergiasInput.split(',').map((s) => s.trim()).filter(Boolean),
      antecedentes: antecedentesInput.split(',').map((s) => s.trim()).filter(Boolean)
    };

    if (editingPatient) {
      updateItem('pacientes', editingPatient.id, payload);
    } else {
      createItem('pacientes', {
        ...payload,
        id: `pac-${Date.now()}`,
        fechaRegistro: new Date().toISOString().split('T')[0]
      });
    }

    setIsFormModalOpen(false);
  };

  const columns: Column<Paciente>[] = [
    {
      header: 'Cédula / ID',
      accessor: 'cedula',
      isMono: true,
      sortable: true
    },
    {
      header: 'Paciente',
      accessor: (p) => (
        <div>
          <b style={{ color: '#0f172a' }}>{p.nombres} {p.apellidos}</b>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {p.edad} años • {p.genero}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'nombres'
    },
    {
      header: 'Grupo Sanguíneo',
      accessor: (p) => (
        <span style={{ fontWeight: 700, color: '#dc2626', fontFamily: 'JetBrains Mono' }}>
          {p.tipoSangre}
        </span>
      ),
      sortable: true,
      sortKey: 'tipoSangre'
    },
    {
      header: 'Teléfono / Contacto',
      accessor: (p) => (
        <div>
          <div>{p.telefono}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.direccion}</div>
        </div>
      )
    },
    {
      header: 'Alergias',
      accessor: (p) => (
        <div>
          {p.alergias.length > 0 ? (
            <Badge variant="urgent">
              {p.alergias.length} Alergia(s)
            </Badge>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ninguna</span>
          )}
        </div>
      )
    },
    {
      header: 'Estado',
      accessor: (p) => {
        const variant = p.estado === 'Activo' ? 'success' : p.estado === 'Hospitalizado' ? 'urgent' : 'warning';
        return <Badge variant={variant}>{p.estado}</Badge>;
      },
      sortable: true,
      sortKey: 'estado'
    }
  ];

  return (
    <div className="view-container">
      <DataTable
        data={data.pacientes}
        columns={columns}
        searchPlaceholder="Buscar por cédula, nombre, apellido, teléfono..."
        addNewLabel="Registrar Nuevo Paciente"
        onAddNew={handleOpenCreate}
        exportTitle="Pacientes"
        actions={(p) => (
          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenDetail(p)}
              title="Ver Ficha Médica"
            >
              <Eye size={15} color="#2563eb" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenPrint(p)}
              title="Imprimir Expediente Clínico"
            >
              <Printer size={15} color="#0d9488" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleOpenEdit(p)}
              title="Editar Paciente"
            >
              <Edit2 size={15} color="#475569" />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-icon"
              onClick={() => handleDelete(p.id, `${p.nombres} ${p.apellidos}`)}
              title="Eliminar Paciente"
            >
              <Trash2 size={15} color="#dc2626" />
            </button>
          </div>
        )}
      />

      {/* Modal Crear / Editar Paciente */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingPatient ? 'Editar Ficha del Paciente' : 'Registrar Nuevo Paciente'}
        size="large"
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cédula / Documento de Identidad *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                placeholder="Ej. V-12345678"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha de Nacimiento *</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.fechaNacimiento}
                onChange={(e) => {
                  const birthYear = new Date(e.target.value).getFullYear();
                  const currentYear = new Date().getFullYear();
                  const age = Math.max(0, currentYear - birthYear);
                  setFormData({ ...formData, fechaNacimiento: e.target.value, edad: age });
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nombres *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                placeholder="Ej. Juan Carlos"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Apellidos *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                placeholder="Ej. Pérez Gómez"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Género</label>
              <select
                className="form-select"
                value={formData.genero}
                onChange={(e) => setFormData({ ...formData, genero: e.target.value as any })}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Sangre</label>
              <select
                className="form-select"
                value={formData.tipoSangre}
                onChange={(e) => setFormData({ ...formData, tipoSangre: e.target.value as any })}
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                type="text"
                className="form-input"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="Ej. +58 414-1234567"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej. correo@ejemplo.com"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Dirección de Habitación</label>
              <input
                type="text"
                className="form-input"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Dirección completa y punto de referencia"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Alergias Conocidas (separadas por coma)</label>
              <input
                type="text"
                className="form-input"
                value={alergiasInput}
                onChange={(e) => setAlergiasInput(e.target.value)}
                placeholder="Ej. Penicilina, AINES, Mariscos"
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Antecedentes Patológicos (separados por coma)</label>
              <input
                type="text"
                className="form-input"
                value={antecedentesInput}
                onChange={(e) => setAntecedentesInput(e.target.value)}
                placeholder="Ej. Hipertensión Arterial, Diabetes Mellitus Tipo 2, Asma"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contacto Emergencia (Nombre y Parentesco)</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactoEmergencia?.nombre || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactoEmergencia: {
                      nombre: e.target.value,
                      parentesco: formData.contactoEmergencia?.parentesco || 'Familiar',
                      telefono: formData.contactoEmergencia?.telefono || ''
                    }
                  })
                }
                placeholder="Ej. María Pérez (Hija)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono de Emergencia</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactoEmergencia?.telefono || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    contactoEmergencia: {
                      nombre: formData.contactoEmergencia?.nombre || '',
                      parentesco: formData.contactoEmergencia?.parentesco || 'Familiar',
                      telefono: e.target.value
                    }
                  })
                }
                placeholder="Ej. +58 412-9988776"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingPatient ? 'Guardar Cambios' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalles Clínicos */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Ficha Médica del Paciente"
        size="large"
      >
        {selectedPatient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>
                  {selectedPatient.nombres} {selectedPatient.apellidos}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  C.I: <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{selectedPatient.cedula}</span> • Edad: {selectedPatient.edad} años ({selectedPatient.genero})
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Grupo Sanguíneo:</span>
                <b style={{ fontSize: '1.1rem', color: '#dc2626', fontFamily: 'JetBrains Mono' }}>{selectedPatient.tipoSangre}</b>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ border: '1px solid #fee2e2', backgroundColor: '#fff5f5', padding: '0.85rem', borderRadius: '8px' }}>
                <b style={{ color: '#dc2626', fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>
                  ⚠️ Alergias y Contraindicaciones:
                </b>
                {selectedPatient.alergias.length > 0 ? (
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: '#991b1b' }}>
                    {selectedPatient.alergias.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sin alergias reportadas</span>
                )}
              </div>

              <div style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '8px' }}>
                <b style={{ color: '#0f172a', fontSize: '0.85rem', display: 'block', marginBottom: '0.35rem' }}>
                  📋 Antecedentes Médicos:
                </b>
                {selectedPatient.antecedentes.length > 0 ? (
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.82rem', color: '#334155' }}>
                    {selectedPatient.antecedentes.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sin antecedentes registrados</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-teal btn-sm"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setIsPrintModalOpen(true);
                }}
              >
                <Printer size={15} />
                <span>Imprimir Ficha Completa</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Imprimir Expediente Clínico */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Vista de Impresión - Expediente Clínico CDI"
        size="large"
      >
        {selectedPatient && (
          <MedicalRecordPrint
            paciente={selectedPatient}
            tratamientos={data.tratamientos.filter((t) => t.pacienteId === selectedPatient.id)}
            citas={data.citas.filter((c) => c.pacienteId === selectedPatient.id)}
            onClose={() => setIsPrintModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
};
