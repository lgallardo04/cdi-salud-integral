import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Teleconsulta, InterconsultaMedica, MensajeChatClinico } from '../types';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Plus,
  Send,
  MessageSquare,
  FileText,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
  Monitor,
  Calendar,
  Sparkles,
  Stethoscope,
  Building2,
  Activity
} from 'lucide-react';

import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';

export const TelemedicinaView: React.FC = () => {
  const { data, createItem, updateItem, deleteItem, addToast } = useData();
  const { hasPermission, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'consultas' | 'interconsultas' | 'sala'>('consultas');
  const [activeTeleconsulta, setActiveTeleconsulta] = useState<Teleconsulta | null>(
    (data.teleconsultas && data.teleconsultas[0]) || null
  );

  // Estados de la Sala Virtual
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessageText, setChatMessageText] = useState('');
  const [liveDoctorNotes, setLiveDoctorNotes] = useState(
    activeTeleconsulta?.resumenClinico || 'Paciente en teleconsulta de control. Refiere mejoría clínica.'
  );
  const [callSeconds, setCallSeconds] = useState(145);

  // Modales
  const [isNewConsultaModalOpen, setIsNewConsultaModalOpen] = useState(false);
  const [isNewInterconsultaModalOpen, setIsNewInterconsultaModalOpen] = useState(false);

  // Formulario nueva consulta
  const [consultaForm, setConsultaForm] = useState({
    pacienteId: '',
    medicoId: '',
    especialidad: 'Medicina General y Preventiva',
    fechaProgramada: new Date().toISOString().substring(0, 10),
    horaProgramada: '10:00',
    motivo: ''
  });

  // Formulario nueva interconsulta
  const [interconsultaForm, setInterconsultaForm] = useState({
    pacienteId: '',
    medicoSolicitanteId: '',
    departamentoOrigen: 'Medicina General',
    especialidadDestino: 'Cardiología',
    prioridad: 'Alta' as any,
    motivoConsulta: '',
    antecedentesRelevantes: ''
  });

  const canCreate = hasPermission('telemedicina', 'crear');

  // Cronómetro de llamada virtual
  useEffect(() => {
    let interval: any = null;
    if (activeTab === 'sala') {
      interval = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
  };

  const handleStartCall = (tc: Teleconsulta) => {
    setActiveTeleconsulta(tc);
    setLiveDoctorNotes(tc.resumenClinico || 'Paciente en teleconsulta virtual.');
    setActiveTab('sala');
    setCallSeconds(10);
    addToast(`Conectando con la sala virtual del paciente ${tc.pacienteNombre}...`, 'info');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeTeleconsulta) return;

    const newMsg: MensajeChatClinico = {
      id: `msg-${Date.now()}`,
      remitente: 'medico',
      remitenteNombre: currentUser.nombreCompleto || 'Médico Tratante',
      texto: chatMessageText.trim(),
      fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedMessages = [...(activeTeleconsulta.chatMensajes || []), newMsg];
    updateItem('teleconsultas', activeTeleconsulta.id, {
      chatMensajes: updatedMessages,
      resumenClinico: liveDoctorNotes
    });

    setActiveTeleconsulta({
      ...activeTeleconsulta,
      chatMensajes: updatedMessages,
      resumenClinico: liveDoctorNotes
    });

    setChatMessageText('');
  };

  const handleSaveConsulta = (e: React.FormEvent) => {
    e.preventDefault();
    const paciente = data.pacientes.find((p) => p.id === consultaForm.pacienteId);
    const medico = data.empleados.find((e) => e.id === consultaForm.medicoId);

    if (!paciente) {
      addToast('Seleccione un paciente', 'error');
      return;
    }

    const nextCode = `TEL-2025-${String((data.teleconsultas || []).length + 101).padStart(4, '0')}`;

    const newTC: Teleconsulta = {
      id: `tel-${Date.now()}`,
      codigoConsulta: nextCode,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteCedula: paciente.cedula,
      medicoId: medico?.id || '',
      medicoNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico General',
      especialidad: consultaForm.especialidad,
      fechaProgramada: consultaForm.fechaProgramada,
      horaProgramada: consultaForm.horaProgramada,
      enlaceSalaVirtual: `https://cdi-salud.telemed/sala-${paciente.id}-${Date.now().toString().slice(-4)}`,
      motivo: consultaForm.motivo,
      estadoLlamada: 'Programada',
      chatMensajes: [
        {
          id: `msg-0`,
          remitente: 'medico',
          remitenteNombre: 'Sistema CDI',
          texto: 'Sala de teleconsulta creada exitosamente.',
          fechaHora: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };

    createItem('teleconsultas', newTC);
    setIsNewConsultaModalOpen(false);
  };

  const handleSaveInterconsulta = (e: React.FormEvent) => {
    e.preventDefault();
    const paciente = data.pacientes.find((p) => p.id === interconsultaForm.pacienteId);
    const medico = data.empleados.find((e) => e.id === interconsultaForm.medicoSolicitanteId);

    if (!paciente) {
      addToast('Seleccione un paciente', 'error');
      return;
    }

    const nextCode = `ITC-2025-${String((data.interconsultas || []).length + 101).padStart(4, '0')}`;

    const newITC: InterconsultaMedica = {
      id: `itc-${Date.now()}`,
      codigoInterconsulta: nextCode,
      pacienteId: paciente.id,
      pacienteNombre: `${paciente.nombres} ${paciente.apellidos}`,
      pacienteCedula: paciente.cedula,
      medicoSolicitanteId: medico?.id || '',
      medicoSolicitanteNombre: medico ? `${medico.nombres} ${medico.apellidos}` : 'Médico Tratante',
      departamentoOrigen: interconsultaForm.departamentoOrigen,
      especialidadDestino: interconsultaForm.especialidadDestino,
      prioridad: interconsultaForm.prioridad,
      motivoConsulta: interconsultaForm.motivoConsulta,
      antecedentesRelevantes: interconsultaForm.antecedentesRelevantes,
      fechaSolicitud: new Date().toISOString().replace('T', ' ').substring(0, 16),
      estado: 'Solicitada'
    };

    createItem('interconsultas', newITC);
    setIsNewInterconsultaModalOpen(false);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div className="view-title-group">
          <div className="view-icon-badge" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Video size={24} />
          </div>
          <div>
            <h1 className="view-title">Telemedicina y Red de Interconsultas Especializadas</h1>
            <p className="view-subtitle">
              Videoconsultas médicas en tiempo real, chat clínico sincrónico e interconsultas hospitalarias entre especialistas.
            </p>
          </div>
        </div>

        <div className="view-actions no-print">
          {activeTab === 'consultas' && canCreate && (
            <button type="button" className="btn btn-primary" onClick={() => setIsNewConsultaModalOpen(true)}>
              <Plus size={16} />
              <span>Programar Teleconsulta</span>
            </button>
          )}

          {activeTab === 'interconsultas' && canCreate && (
            <button type="button" className="btn btn-primary" onClick={() => setIsNewInterconsultaModalOpen(true)}>
              <Plus size={16} />
              <span>Nueva Solicitud de Interconsulta</span>
            </button>
          )}
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'consultas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('consultas')}
        >
          <Video size={15} />
          <span>Agenda de Teleconsultas</span>
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'interconsultas' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('interconsultas')}
        >
          <Stethoscope size={15} />
          <span>Interconsultas entre Especialistas ({(data.interconsultas || []).length})</span>
        </button>
        {activeTeleconsulta && (
          <button
            type="button"
            className={`btn ${activeTab === 'sala' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ backgroundColor: activeTab === 'sala' ? '#dc2626' : undefined, color: activeTab === 'sala' ? 'white' : undefined }}
            onClick={() => setActiveTab('sala')}
          >
            <Activity size={15} />
            <span>Sala Virtual en Vivo ({formatTimer(callSeconds)})</span>
          </button>
        )}
      </div>

      {/* Pestaña 1: Agenda de Teleconsultas */}
      {activeTab === 'consultas' && (
        <div className="card table-card">
          <div className="table-container auto-table">
            <table className="clinical-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Paciente</th>
                  <th>Especialidad</th>
                  <th>Médico</th>
                  <th>Fecha / Hora</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th className="text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {(data.teleconsultas || []).length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No hay teleconsultas programadas.
                    </td>
                  </tr>
                ) : (
                  data.teleconsultas.map((tc) => (
                    <tr key={tc.id}>
                      <td>
                        <span className="font-mono font-bold" style={{ color: '#2563eb' }}>
                          {tc.codigoConsulta}
                        </span>
                      </td>
                      <td>
                        <div>
                          <strong>{tc.pacienteNombre}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>C.I: {tc.pacienteCedula}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{tc.especialidad}</span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>Dr. {tc.medicoNombre}</td>
                      <td className="font-mono" style={{ fontSize: '0.8rem' }}>
                        {tc.fechaProgramada} {tc.horaProgramada}
                      </td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '200px' }}>{tc.motivo}</td>
                      <td>
                        <Badge type={tc.estadoLlamada === 'En Curso' ? 'danger' : 'success'}>
                          {tc.estadoLlamada}
                        </Badge>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem' }}
                          onClick={() => handleStartCall(tc)}
                        >
                          <Video size={14} />
                          <span>Entrar a Sala</span>
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

      {/* Pestaña 2: Interconsultas Médicas entre Especialistas */}
      {activeTab === 'interconsultas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
          {(data.interconsultas || []).map((itc) => (
            <div key={itc.id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="font-mono font-bold" style={{ color: '#2563eb' }}>
                    {itc.codigoInterconsulta}
                  </span>
                  <Badge type={itc.prioridad === 'Emergencia' ? 'danger' : 'warning'}>
                    Prioridad {itc.prioridad}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {itc.pacienteNombre}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  C.I: {itc.pacienteCedula} | Solicitado por: <strong>{itc.medicoSolicitanteNombre}</strong>
                </span>

                <div style={{ margin: '0.75rem 0', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div style={{ color: '#2563eb', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Destino: {itc.especialidadDestino}
                  </div>
                  <p style={{ margin: 0, color: '#334155', lineHeight: 1.4 }}>
                    <strong>Motivo:</strong> {itc.motivoConsulta}
                  </p>
                </div>

                {itc.respuestaEspecialista ? (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#166534', display: 'block', marginBottom: '0.2rem' }}>
                      Concepto del Especialista ({itc.medicoConsultadoNombre || 'Especialista'}):
                    </strong>
                    <p style={{ margin: 0, color: '#14532d', lineHeight: 1.4 }}>{itc.respuestaEspecialista}</p>
                  </div>
                ) : (
                  <div style={{ padding: '0.5rem', backgroundColor: '#fffbeb', borderRadius: '6px', fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                    En espera de revisión por el especialista...
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{itc.fechaSolicitud}</span>
                <Badge type={itc.estado === 'Respondida' ? 'success' : 'warning'}>{itc.estado}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pestaña 3: Sala de Videoconsulta Virtual Interactiva en Vivo */}
      {activeTab === 'sala' && activeTeleconsulta && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', height: '640px' }}>
          {/* Lado Izquierdo: Feeds de Video de Alta Definición Simulados */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
            {/* Pantalla Principal del Paciente */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#020617',
                borderRadius: '12px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
                alt="Paciente en Video"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Feed Flotante de Cámara del Médico (PiP) */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '140px',
                  height: '105px',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
              >
                {isCameraOn ? (
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80"
                    alt="Médico"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                    <VideoOff size={20} />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', padding: '2px 4px', borderRadius: '3px', color: 'white', fontSize: '0.65rem' }}>
                  Tú (Médico)
                </div>
              </div>

              {/* Info Overlay */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                  EN VIVO: {formatTimer(callSeconds)}
                </span>
                <span style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px' }}>
                  {activeTeleconsulta.pacienteNombre}
                </span>
              </div>

              {/* Barra de Controles de Telemedicina */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 16px',
                  borderRadius: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  style={{
                    backgroundColor: isMicOn ? 'rgba(255,255,255,0.1)' : '#dc2626',
                    color: 'white',
                    borderColor: 'transparent'
                  }}
                  onClick={() => setIsMicOn(!isMicOn)}
                  title={isMicOn ? 'Silenciar Micrófono' : 'Activar Micrófono'}
                >
                  {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  style={{
                    backgroundColor: isCameraOn ? 'rgba(255,255,255,0.1)' : '#dc2626',
                    color: 'white',
                    borderColor: 'transparent'
                  }}
                  onClick={() => setIsCameraOn(!isCameraOn)}
                  title={isCameraOn ? 'Apagar Cámara' : 'Encender Cámara'}
                >
                  {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  style={{
                    backgroundColor: isScreenSharing ? '#2563eb' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderColor: 'transparent'
                  }}
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  title="Compartir Pantalla"
                >
                  <Monitor size={18} />
                </button>

                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  style={{ backgroundColor: '#dc2626' }}
                  onClick={() => {
                    setActiveTab('consultas');
                    addToast('Teleconsulta finalizada y guardada en el historial.', 'info');
                  }}
                  title="Finalizar Teleconsulta"
                >
                  <PhoneOff size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Bloc de Notas Clínico y Chat en Vivo */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
            {/* Bloc de Notas Clínicas del Médico */}
            <div className="card" style={{ padding: '0.75rem 1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                <FileText size={16} style={{ color: '#2563eb' }} />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Notas Clínicas en Vivo (Médico)
                </h4>
              </div>

              <textarea
                className="form-input"
                style={{ flex: 1, fontSize: '0.8rem', resize: 'none' }}
                placeholder="Escriba aquí los síntomas, impresiones diagnósticas e indicaciones mientras conversa con el paciente..."
                value={liveDoctorNotes}
                onChange={(e) => setLiveDoctorNotes(e.target.value)}
              />
            </div>

            {/* Chat Clínico Seguro */}
            <div className="card" style={{ padding: '0.75rem 1rem', flex: 1.2, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                <MessageSquare size={16} style={{ color: '#16a34a' }} />
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Chat Clínico con Paciente
                </h4>
              </div>

              {/* Mensajes del Chat */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', paddingRight: '0.25rem', marginBottom: '0.5rem' }}>
                {(activeTeleconsulta.chatMensajes || []).map((msg) => {
                  const isMe = msg.remitente === 'medico';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        backgroundColor: isMe ? '#eff6ff' : '#f1f5f9',
                        color: '#0f172a',
                        padding: '0.4rem 0.6rem',
                        borderRadius: '8px',
                        maxWidth: '85%',
                        border: isMe ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
                      }}
                    >
                      <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>
                        {msg.remitenteNombre} • {msg.fechaHora.split(' ')[1] || ''}
                      </span>
                      {msg.texto}
                    </div>
                  );
                })}
              </div>

              {/* Input para enviar mensaje */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  type="text"
                  className="form-input input-sm"
                  placeholder="Escriba un mensaje al paciente..."
                  value={chatMessageText}
                  onChange={(e) => setChatMessageText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm btn-icon">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Programar Teleconsulta */}
      {isNewConsultaModalOpen && (
        <Modal
          title="Programar Nueva Teleconsulta Médica"
          onClose={() => setIsNewConsultaModalOpen(false)}
          size="md"
        >
          <form onSubmit={handleSaveConsulta} className="form-grid">
            <div className="form-group">
              <label className="form-label">Paciente</label>
              <select
                className="form-input"
                value={consultaForm.pacienteId}
                onChange={(e) => setConsultaForm({ ...consultaForm, pacienteId: e.target.value })}
                required
              >
                <option value="">Seleccione paciente...</option>
                {data.pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.apellidos} ({p.cedula})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Médico Especialista</label>
              <select
                className="form-input"
                value={consultaForm.medicoId}
                onChange={(e) => setConsultaForm({ ...consultaForm, medicoId: e.target.value })}
                required
              >
                <option value="">Seleccione médico...</option>
                {data.empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombres} {emp.apellidos} ({emp.cargoTitulo || 'Médico'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-input"
                  value={consultaForm.fechaProgramada}
                  onChange={(e) => setConsultaForm({ ...consultaForm, fechaProgramada: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hora</label>
                <input
                  type="time"
                  className="form-input"
                  value={consultaForm.horaProgramada}
                  onChange={(e) => setConsultaForm({ ...consultaForm, horaProgramada: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo de la Teleconsulta</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Motivo de la consulta virtual..."
                value={consultaForm.motivo}
                onChange={(e) => setConsultaForm({ ...consultaForm, motivo: e.target.value })}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsNewConsultaModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Programar Teleconsulta
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Nueva Solicitud de Interconsulta */}
      {isNewInterconsultaModalOpen && (
        <Modal
          title="Nueva Solicitud de Interconsulta Médica Especializada"
          onClose={() => setIsNewInterconsultaModalOpen(false)}
          size="md"
        >
          <form onSubmit={handleSaveInterconsulta} className="form-grid">
            <div className="form-group">
              <label className="form-label">Paciente</label>
              <select
                className="form-input"
                value={interconsultaForm.pacienteId}
                onChange={(e) => setInterconsultaForm({ ...interconsultaForm, pacienteId: e.target.value })}
                required
              >
                <option value="">Seleccione paciente...</option>
                {data.pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombres} {p.apellidos} ({p.cedula})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Especialidad Requerida</label>
                <select
                  className="form-input"
                  value={interconsultaForm.especialidadDestino}
                  onChange={(e) => setInterconsultaForm({ ...interconsultaForm, especialidadDestino: e.target.value })}
                >
                  <option value="Cardiología">Cardiología</option>
                  <option value="Neumología">Neumología</option>
                  <option value="Neurología">Neurología</option>
                  <option value="Gastroenterología">Gastroenterología</option>
                  <option value="Traumatología">Traumatología</option>
                  <option value="Infectología">Infectología</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select
                  className="form-input"
                  value={interconsultaForm.prioridad}
                  onChange={(e) => setInterconsultaForm({ ...interconsultaForm, prioridad: e.target.value as any })}
                >
                  <option value="Emergencia">Emergencia (Inmediata)</option>
                  <option value="Alta">Alta (&lt; 24h)</option>
                  <option value="Rutinaria">Rutinaria</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Motivo y Pregunta Clínica Específica</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Indique claramente la duda clínica o solicitud de concepto..."
                value={interconsultaForm.motivoConsulta}
                onChange={(e) => setInterconsultaForm({ ...interconsultaForm, motivoConsulta: e.target.value })}
                required
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsNewInterconsultaModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Enviar Solicitud
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
