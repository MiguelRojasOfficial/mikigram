'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface ContactoReal {
  id: string;
  nombre: string;
  fotoPerfil: string;
  lat: number;
  lng: number;
}

interface MapContentProps {
  contactos: ContactoReal[];
}

export default function MapContent({ contactos }: MapContentProps) {
  const crearIconoContacto = (fotoUrl: string) =>
    L.divIcon({
      className: 'custom-map',
      html: `
        <div style="width: 42px; height: 42px; border-radius: 50%; border: 3px solid #10b981; overflow: hidden; background: #1f2937; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);">
          <img src="${fotoUrl}" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <MapContainer
        center={[-12.0463, -77.0427]}
        zoom={12}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {contactos.map((contacto) => (
          <Marker
            key={contacto.id}
            position={[contacto.lat, contacto.lng]}
            icon={crearIconoContacto(contacto.fotoPerfil)}
          >
            <Popup>
              <div className="flex items-center gap-2 p-1">
                <img
                  src={contacto.fotoPerfil}
                  alt={contacto.nombre}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-semibold text-gray-800">
                  {contacto.nombre}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}