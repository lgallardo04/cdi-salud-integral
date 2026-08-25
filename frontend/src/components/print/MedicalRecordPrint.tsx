import React from 'react';
import { Paciente, Tratamiento, Cita } from '../../types';
import { Printer } from 'lucide-react';

interface MedicalRecordPrintProps {
  paciente: Paciente;
  tratamientos: Tratamiento[];
  citas: Cita[];
  onClose: () => void;
}

export const MedicalRecordPrint: React.FC<MedicalRecordPrintProps> = ({
  paciente,
  tratamientos,
  citas,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
          <Printer size={16} />
          <span>Imprimir Expediente Clínico</span>
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
          color: '#0f172a'
        }}
      >
        {/* Encabezado Oficial */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              CENTRO DE DIAGNÓSTICO INTEGRAL (CDI)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#475569' }}>
              SISTEMA INTEGRAL DE SALUD PÚBLICA Y ASISTENCIA COMUNITARIA
            </p>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
              EXPEDIENTE CLÍNICO INDIVIDUALIZADO DEL PACIENTE
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
              EXP-{paciente.id}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Fecha: {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* Datos Filiatorios */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            1. Datos del Paciente
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Nombre Completo:</span>
              <b>{paciente.nombres} {paciente.apellidos}</b>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Cédula / Documento:</span>
              <b style={{ fontFamily: 'JetBrains Mono' }}>{paciente.cedula}</b>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Edad / Género:</span>
              <b>{paciente.edad} años ({paciente.genero})</b>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Grupo Sanguíneo:</span>
              <b style={{ color: '#dc2626' }}>{paciente.tipoSangre}</b>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Teléfono de Contacto:</span>
              <b>{paciente.telefono}</b>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Estado Clínico:</span>
              <b>{paciente.estado}</b>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Dirección de Habitación:</span>
              <span>{paciente.direccion}</span>
            </div>
          </div>
        </div>

        {/* Antecedentes y Alergias */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            2. Antecedentes Médicos y Alergias
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <b style={{ color: '#dc2626', display: 'block', marginBottom: '0.25rem' }}>Alergias Conocidas:</b>
              {paciente.alergias.length > 0 ? (
                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  {paciente.alergias.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              ) : (
                <span>Sin alergias conocidas</span>
              )}
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <b style={{ color: '#0f172a', display: 'block', marginBottom: '0.25rem' }}>Antecedentes Patológicos:</b>
              {paciente.antecedentes.length > 0 ? (
                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  {paciente.antecedentes.map((ant, i) => (
                    <li key={i}>{ant}</li>
                  ))}
                </ul>
              ) : (
                <span>Sin antecedentes patológicos registrados</span>
              )}
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            3. Contacto de Emergencia
          </h3>
          <div style={{ fontSize: '0.85rem', display: 'flex', gap: '2rem' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Nombre:</span>
              <b>{paciente.contactoEmergencia.nombre}</b>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Parentesco:</span>
              <b>{paciente.contactoEmergencia.parentesco}</b>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Teléfono:</span>
              <b>{paciente.contactoEmergencia.telefono}</b>
            </div>
          </div>
        </div>

        {/* Tratamientos Activos */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2563eb', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
            4. Tratamientos y Prescripciones Registradas
          </h3>
          {tratamientos.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No posee tratamientos activos en sistema.</p>
          ) : (
            tratamientos.map((t) => (
              <div key={t.id} style={{ marginBottom: '1rem', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  <span>{t.codigoTratamiento} - {t.diagnosticoCIE}</span>
                  <span>Médico: {t.medicoNombre}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.25rem 0' }}>{t.diagnosticoDescripcion}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <b style={{ fontSize: '0.78rem' }}>Medicamentos:</b>
                  <ul style={{ fontSize: '0.8rem', paddingLeft: '1.25rem', margin: '0.25rem 0' }}>
                    {t.prescripciones.map((p, pIdx) => (
                      <li key={pIdx}>
                        <b>{p.medicamentoNombre}</b> — {p.dosis}, {p.frecuencia} (Por {p.duracionDias} días).
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.35rem' }}>
                  <b>Indicaciones:</b> {t.indicacionesGenerales}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sello y Firma */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.8rem', textAlign: 'center' }}>
          <div style={{ width: '220px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '0.5rem', height: '40px' }}></div>
            <b>Firma del Médico Tratante</b>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Colegiatura MPPS</div>
          </div>
          <div style={{ width: '220px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '0.5rem', height: '40px' }}></div>
            <b>Sello y Validación CDI</b>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Dirección Asistencial</div>
          </div>
        </div>
      </div>
    </div>
  );
};
