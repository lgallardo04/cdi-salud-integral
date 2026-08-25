import React from 'react';
import { Tratamiento, Paciente } from '../../types';
import { Printer } from 'lucide-react';

interface PrescriptionPrintProps {
  tratamiento: Tratamiento;
  paciente?: Paciente;
  onClose: () => void;
}

export const PrescriptionPrint: React.FC<PrescriptionPrintProps> = ({
  tratamiento,
  paciente,
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
          <span>Imprimir Recipe Médico</span>
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          fontFamily: 'Inter, sans-serif',
          color: '#0f172a',
          maxWidth: '700px',
          margin: '0 auto'
        }}
      >
        {/* Encabezado Récipe */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              CENTRO DE DIAGNÓSTICO INTEGRAL (CDI)
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#475569' }}>
              SERVICIO DE SALUD COMUNITARIA • RECETA MÉDICA OFICIAL
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', fontFamily: 'JetBrains Mono' }}>
            <b>{tratamiento.codigoTratamiento}</b>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Fecha: {tratamiento.fechaInicio}</div>
          </div>
        </div>

        {/* Datos Paciente y Médico */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.82rem' }}>
          <div>
            <div><span style={{ color: '#64748b' }}>Paciente:</span> <b>{tratamiento.pacienteNombre}</b></div>
            <div><span style={{ color: '#64748b' }}>Cédula:</span> <b>{tratamiento.pacienteCedula}</b></div>
            {paciente && <div><span style={{ color: '#64748b' }}>Edad:</span> <b>{paciente.edad} años</b></div>}
          </div>
          <div>
            <div><span style={{ color: '#64748b' }}>Médico Tratante:</span> <b>{tratamiento.medicoNombre}</b></div>
            <div><span style={{ color: '#64748b' }}>Diagnóstico CIE:</span> <b>{tratamiento.diagnosticoCIE}</b></div>
            <div><span style={{ color: '#64748b' }}>Vigencia:</span> Hasta {tratamiento.fechaFin}</div>
          </div>
        </div>

        {/* Cuerpo del Recipe (Rp.) */}
        <div style={{ marginBottom: '1.5rem', minHeight: '180px' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb', fontFamily: 'JetBrains Mono', marginBottom: '0.5rem' }}>
            Rp. / Prescripción Médica:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {tratamiento.prescripciones.map((p, idx) => (
              <div key={idx} style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700 }}>
                  <span>{idx + 1}. {p.medicamentoNombre}</span>
                  <span style={{ color: '#2563eb', fontFamily: 'JetBrains Mono' }}>Cant: {p.cantidadTotal} und.</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginTop: '0.2rem' }}>
                  • <b>Dosis y Pauta:</b> {p.dosis} — {p.frecuencia} por {p.duracionDias} días.
                </div>
                {p.instruccionesEspeciales && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.1rem' }}>
                    Nota: {p.instruccionesEspeciales}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Indicaciones No Farmacológicas */}
        <div style={{ backgroundColor: '#eff6ff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #bfdbfe', marginBottom: '2rem', fontSize: '0.8rem' }}>
          <b style={{ color: '#1e40af', display: 'block', marginBottom: '0.25rem' }}>Indicaciones Clínicas Adicionales:</b>
          <p style={{ color: '#1e3a8a', margin: 0 }}>{tratamiento.indicacionesGenerales}</p>
        </div>

        {/* Firma */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid #0f172a' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            CDI Farmacia Central • Dispensación Gratuita
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '0.25rem', height: '35px' }}></div>
            <b style={{ fontSize: '0.8rem' }}>Firma y Sello del Médico</b>
          </div>
        </div>
      </div>
    </div>
  );
};
