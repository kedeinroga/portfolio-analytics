'use client';

import { useState } from 'react';
import { GeolocationInfo } from './geolocation-info';

export function GeolocationTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testServerAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/geolocation');
      const data = await response.json();
      setTestResults({
        type: 'Server API',
        status: response.status,
        data
      });
    } catch (error) {
      setTestResults({
        type: 'Server API',
        status: 'Error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    setLoading(false);
  };

  const testExternalAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      setTestResults({
        type: 'External API (ipapi.co)',
        status: response.status,
        data
      });
    } catch (error) {
      setTestResults({
        type: 'External API',
        status: 'Error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Prueba de Geolocalización</h2>
      
      {/* Componente principal de geolocalización */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Geolocalización Automática</h3>
        <GeolocationInfo />
      </div>

      {/* Botones de prueba manual */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Pruebas Manuales</h3>
        <div className="flex gap-3">
          <button
            onClick={testServerAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Probar API del Servidor
          </button>
          <button
            onClick={testExternalAPI}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Probar API Externa
          </button>
        </div>
      </div>

      {/* Resultados de las pruebas */}
      {testResults && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Resultado de {testResults.type}</h4>
          <p className="text-sm mb-2"><strong>Status:</strong> {testResults.status}</p>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(testResults.data, null, 2)}
          </pre>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Ejecutando prueba...</p>
        </div>
      )}
    </div>
  );
}
