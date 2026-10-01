'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Users, 
  Calendar, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  X
} from 'lucide-react';

interface ContactoMarker {
  id: string;
  type: 'contacto';
  nombre: string;
  fotoPerfil: string;
  estado: string;
  distancia: string;
  lat: number;
  lng: number;
}

interface EventoMarker {
  id: string;
  type: 'evento';
  titulo: string;
  categoria: string;
  hora: string;
  ubicacion: string;
  asistentesCount: number;
  usuarioAsistira: boolean;
  lat: number;
  lng: number;
  descripcion: string;
}

type PuntoSeleccionado = ContactoMarker | EventoMarker | null;

const MOCK_CONTACTOS: ContactoMarker[] = [
  { 
    id: 'c1', 
    type: 'contacto', 
    nombre: 'Carlos R.', 
    fotoPerfil: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 
    estado: 'En una cafetería', 
    distancia: '300 m', 
    lat: -12.0463, 
    lng: -77.0427 
  },
  { 
    id: 'c2', 
    type: 'contacto', 
    nombre: 'Ana M.', 
    fotoPerfil: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 
    estado: 'Entrenando', 
    distancia: '1.2 km', 
    lat: -12.0490, 
    lng: -77.0390 
  },
];

const MOCK_EVENTOS: EventoMarker[] = [
  { 
    id: 'e1', 
    type: 'evento', 
    titulo: 'Hackathon Presencial 2026', 
    categoria: 'Tecnología', 
    hora: 'Hoy, 18:00 hrs', 
    ubicacion: 'Coworking Central', 
    asistentesCount: 24, 
    usuarioAsistira: false, 
    lat: -12.0430, 
    lng: -77.0410,
    descripcion: 'Encuentro de desarrolladores y creativos para prototipar ideas en 4 horas.'
  },
  { 
    id: 'e2', 
    type: 'evento', 
    titulo: 'Torneo de Pádel Nocturno', 
    categoria: 'Deportes', 
    hora: 'Mañana, 20:00 hrs', 
    ubicacion: 'Club Deportivo Sur', 
    asistentesCount: 12, 
    usuarioAsistira: true, 
    lat: -12.0480, 
    lng: -77.0450,
    descripcion: 'Partidos relámpago con hidratación y premios para los ganadores.'
  }
];

export default function MapPage() {
  const [filtro, setFiltro] = useState<'todos' | 'contactos' | 'eventos'>('todos');
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PuntoSeleccionado>(null);
  const [eventos, setEventos] = useState<EventoMarker[]>(MOCK_EVENTOS);

  const alternarAsistencia = (eventoId: string) => {
    setEventos(prev => prev.map(ev => {
      if (ev.id === eventoId) {
        const nuevaAsistencia = !ev.usuarioAsistira;
        return {
          ...ev,
          usuarioAsistira: nuevaAsistencia,
          asistentesCount: nuevaAsistencia ? ev.asistentesCount + 1 : ev.asistentesCount - 1
        };
      }
      return ev;
    }));

    if (puntoSeleccionado?.type === 'evento' && puntoSeleccionado.id === eventoId) {
      setPuntoSeleccionado(prev => {
        if (!prev || prev.type !== 'evento') return prev;
        const nuevaAsistencia = !prev.usuarioAsistira;
        return {
          ...prev,
          usuarioAsistira: nuevaAsistencia,
          asistentesCount: nuevaAsistencia ? prev.asistentesCount + 1 : prev.asistentesCount - 1
        };
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-gray-900">
      
      {/* Filtros Superiores */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
        <div className="flex bg-white/90 dark:bg-[#111b20]/90 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              filtro === 'todos' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('contactos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              filtro === 'contactos' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Users size={14} /> Contactos
          </button>
          <button
            onClick={() => setFiltro('eventos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              filtro === 'eventos' ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Calendar size={14} /> Eventos
          </button>
        </div>

        <button 
          className="p-3 bg-white/90 dark:bg-[#111b20]/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 text-emerald-500 active:scale-95 transition-all"
          title="Centrar en mi ubicación"
        >
          <Navigation size={18} />
        </button>
      </div>

      {/* Área del Mapa */}
      <div className="relative flex-1 w-full h-full bg-[#1e293b]">
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          <span>Área de Renderizado de Mapa</span>
        </div>
      </div>

      {/* Panel Inferior de Información */}
      {puntoSeleccionado && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-white dark:bg-[#111b20] border border-gray-200 dark:border-gray-800 p-5 rounded-3xl shadow-2xl transition-all animate-in slide-in-from-bottom duration-300 max-w-lg mx-auto">
          <button 
            onClick={() => setPuntoSeleccionado(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1"
          >
            <X size={20} />
          </button>

          {puntoSeleccionado.type === 'contacto' ? (
            <div className="flex items-center gap-4">
              <img 
                src={puntoSeleccionado.fotoPerfil} 
                alt={puntoSeleccionado.nombre} 
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500" 
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Contacto Cercano</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{puntoSeleccionado.nombre}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{puntoSeleccionado.estado}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <MapPin size={12} />
                  <span>A {puntoSeleccionado.distancia} de ti</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {puntoSeleccionado.categoria}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={12} /> {puntoSeleccionado.hora}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{puntoSeleccionado.titulo}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{puntoSeleccionado.descripcion}</p>
              
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <MapPin size={14} className="text-emerald-500" />
                <span>{puntoSeleccionado.ubicacion}</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-white">{puntoSeleccionado.asistentesCount}</strong> personas asistirán
                </span>

                <button
                  onClick={() => alternarAsistencia(puntoSeleccionado.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                    puntoSeleccionado.usuarioAsistira
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  {puntoSeleccionado.usuarioAsistira ? 'Asistiré' : 'Confirmar Asistencia'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}