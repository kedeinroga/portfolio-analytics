'use client';

import { useGeolocation } from '@/hooks/use-geolocation';

export function GeolocationInfo() {
  const { location, loading } = useGeolocation();

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">Obteniendo ubicación...</p>
      </div>
    );
  }

  if (!location || location.error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600">
          {location?.error || 'No se pudo obtener la ubicación'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="font-semibold text-green-800 mb-2">Información de Ubicación</h3>
      <div className="text-sm text-green-700 space-y-1">
        {location.country && (
          <p><strong>País:</strong> {location.country}</p>
        )}
        {location.city && (
          <p><strong>Ciudad:</strong> {location.city}</p>
        )}
        {location.lat && location.lon && (
          <p><strong>Coordenadas:</strong> {location.lat.toFixed(4)}, {location.lon.toFixed(4)}</p>
        )}
        {location.query && (
          <p><strong>IP:</strong> {location.query}</p>
        )}
        <p><strong>Fuente:</strong> {
          location.source === 'server' ? 'Servidor (IP)' :
          location.source === 'browser' ? 'Navegador (GPS)' :
          location.source === 'external-api' ? 'API Externa' :
          'Error'
        }</p>
      </div>
    </div>
  );
}
