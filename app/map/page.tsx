'use client';

import dynamic from 'next/dynamic';

const MapContent = dynamic(() => import('@/components/map/MapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-emerald-500 text-sm font-medium">
      Cargando mapa...
    </div>
  ),
});

export default function MapPage() {
  return <MapContent />;
}