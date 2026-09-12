import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

interface Cita {
  id: string;
  cedula: string;
  nombre: string;
  fecha: string;
  hora: string;
  turno: 'MANANA' | 'TARDE';
  tipo: 'PRIMERA_VEZ' | 'CONTROL' | 'EMERGENCIA_NUTRICIONAL';
  estado: 'PROGRAMADA' | 'ATENDIDA' | 'CANCELADA';
  comunidad: string;
}

export const AgendaCitas: React.FC = () => {
  const { addToast } = useData();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [turnoFiltro, setTurnoFiltro] = useState<'TODOS' | 'MANANA' | 'TARDE'>('TODOS');
  
  // Datos de ejemplo para renderizado interactivo
  const [citas, setCitas] = useState<Cita[]>([
    {
      id: '1',
      cedula: 'V-15842931',
      nombre: 'Yelitza Rodríguez',
      fecha: new Date().toISOString().split('T')[0],
      hora: '08:30',
      turno: 'MANANA',
      tipo: 'CONTROL',
      estado: 'PROGRAMADA',
      comunidad: 'Consejo Comunal Las Flores'
    },
    {
      id: '2',
      cedula: 'V-32145678',
      nombre: 'Diego Hernández (Menor)',
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:15',
      turno: 'MANANA',
      tipo: 'EMERGENCIA_NUTRICIONAL',
      estado: 'PROGRAMADA',
      comunidad: 'Consejo Comunal El Mirador'
    }
  ]);

  const [formData, setFormData] = useState({
    tipoDocumento: 'V',
    cedula: '',
    nombre: '',
    hora: '08:00',
    turno: 'MANANA' as 'MANANA' | 'TARDE',
    tipo: 'PRIMERA_VEZ' as 'PRIMERA_VEZ' | 'CONTROL' | 'EMERGENCIA_NUTRICIONAL',
    motivo: '',
    profesional: 'Lic. Carmen Briceño (Nutricionista CDI)'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula || !formData.nombre) return;

    const nuevaCita: Cita = {
      id: Date.now().toString(),
      cedula: `${formData.tipoDocumento}-${formData.cedula}`,
      nombre: formData.nombre,
      fecha: fechaSeleccionada,
      hora: formData.hora,
      turno: formData.turno,
      tipo: formData.tipo,
      estado: 'PROGRAMADA',
      comunidad: 'Comunidad Sector CDI'
    };

    setCitas([...citas, nuevaCita]);
    addToast(`Cita asignada exitosamente para ${formData.nombre}`, 'success');
    setFormData({ ...formData, cedula: '', nombre: '', motivo: '' });
  };

  const handleAtenderCita = (id: string, nombre: string) => {
    setCitas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: 'ATENDIDA' as const } : c))
    );
    addToast(`Paciente ${nombre} marcado como ATENDIDO en consulta nutricional`, 'success');
  };

  const citasFiltradas = citas.filter(
    (c) => c.fecha === fechaSeleccionada && (turnoFiltro === 'TODOS' || c.turno === turnoFiltro)
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Módulo de Nutrición - Agenda y Asignación de Citas
        </h1>
        <p className="text-sm text-slate-600">
          Centro de Diagnóstico Integral (CDI) - Área de Salud Integral Comunitaria (ASIC)
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de agendamiento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>📅</span> Asignar Nueva Cita
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Documento de Identidad (Cédula)
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.tipoDocumento}
                  onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                  className="w-20 px-2 py-2 border rounded-lg bg-slate-50 text-sm font-medium"
                >
                  <option value="V">V-</option>
                  <option value="E">E-</option>
                  <option value="MN">MN-</option>
                </select>
                <input
                  type="text"
                  placeholder="Número de cédula"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nombre y Apellidos del Paciente
              </label>
              <input
                type="text"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Turno</label>
                <select
                  value={formData.turno}
                  onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="MANANA">Mañana (08:00 - 12:00)</option>
                  <option value="TARDE">Tarde (13:00 - 17:00)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Hora Estimada</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de Consulta</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="PRIMERA_VEZ">Primera Vez (Captación)</option>
                <option value="CONTROL">Control Periódico</option>
                <option value="EMERGENCIA_NUTRICIONAL">Emergencia / Vulnerabilidad Severa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Motivo / Referencia Clínica
              </label>
              <textarea
                placeholder="Remitido por Medicina General, pesquisa comunitaria, etc."
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition shadow"
            >
              Confirmar y Agendar Cita
            </button>
          </form>
        </div>

        {/* Lista de citas programadas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Citas Nutricionales del Día</h2>
              <p className="text-xs text-slate-500">Filtradas por fecha y turno</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm"
              />
              <div className="flex bg-slate-100 rounded-lg p-1 text-xs font-medium">
                {(['TODOS', 'MANANA', 'TARDE'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTurnoFiltro(t)}
                    className={`px-3 py-1 rounded-md transition ${
                      turnoFiltro === t ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    {t === 'TODOS' ? 'Todos' : t === 'MANANA' ? 'Mañana' : 'Tarde'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {citasFiltradas.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-500">
                No hay citas registradas para los filtros seleccionados.
              </p>
            ) : (
              citasFiltradas.map((cita) => (
                <div key={cita.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{cita.nombre}</span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                        {cita.cedula}
                      </span>
                      {cita.tipo === 'EMERGENCIA_NUTRICIONAL' && (
                        <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                          Prioritario INN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Hora: <strong className="text-slate-700">{cita.hora}</strong> ({cita.turno}) • {cita.comunidad}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        cita.estado === 'ATENDIDA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {cita.estado}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAtenderCita(cita.id, cita.nombre)}
                      disabled={cita.estado === 'ATENDIDA'}
                      className={`text-xs px-3 py-1.5 rounded-md transition font-medium ${
                        cita.estado === 'ATENDIDA'
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                    >
                      {cita.estado === 'ATENDIDA' ? '✓ Atendida' : 'Atender / Ficha'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
