'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Users, 
  Calendar, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  X,
  MapPin
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

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

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

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
    titulo: 'Hackathon Presencial', 
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
  const crearIconoContacto = (fotoPerfil: string) => {
    if (typeof window === 'undefined') return undefined;
    const L = require('leaflet');
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="
          width: 44px; 
          height: 44px; 
          border-radius: 50%; 
          border: 3px solid #10b981; 
          overflow: hidden; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          background-color: white;
        ">
          <img src="${fotoPerfil}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });
  };

  const crearIconoEvento = () => {
    if (typeof window === 'undefined') return undefined;
    const L = require('leaflet');
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="
          width: 38px; 
          height: 38px; 
          border-radius: 50%; 
          background-color: #10b981; 
          color: white; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
  };

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

  const mostrarContactos = filtro === 'todos' || filtro === 'contactos';
  const mostrarEventos = filtro === 'todos' || filtro === 'eventos';

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-gray-900">
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

      <div className="relative flex-1 w-full h-full z-10">
        <MapContainer
          center={[-12.0463, -77.0427]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mostrarContactos && MOCK_CONTACTOS.map((contacto) => (
            <Marker
              key={contacto.id}
              position={[contacto.lat, contacto.lng]}
              icon={crearIconoContacto(contacto.fotoPerfil)}
              eventHandlers={{
                click: () => setPuntoSeleccionado(contacto),
              }}
            />
          ))}

          {mostrarEventos && eventos.map((evento) => (
            <Marker
              key={evento.id}
              position={[evento.lat, evento.lng]}
              icon={crearIconoEvento()}
              eventHandlers={{
                click: () => setPuntoSeleccionado(evento),
              }}
            />
          ))}
        </MapContainer>
      </div>

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