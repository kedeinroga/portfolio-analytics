'use client';

import { useState, useEffect } from 'react';

export interface GeolocationData {
  country?: string;
  city?: string;
  lat?: number;
  lon?: number;
  query?: string;
  source: 'server' | 'browser' | 'external-api' | 'error';
  error?: string;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGeolocation = async () => {
      try {
        // Las rutas API de Next.js siempre son relativas, funcionan igual en todos los ambientes
        const apiUrl = '/api/geolocation';
          
        // Primero intentar obtener la geolocalización desde nuestro API del servidor
        const serverResponse = await fetch(apiUrl);
        
        if (serverResponse.ok) {
          const serverData = await serverResponse.json();
          if (!serverData.error) {
            setLocation({
              ...serverData,
              source: 'server'
            });
            setLoading(false);
            return;
          }
        }

        // Si el servidor falla, intentar geolocalización del navegador
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Usar coordenadas para obtener información de país/ciudad
                const { latitude, longitude } = position.coords;
                
                // Usar reverse geocoding para obtener información de ubicación
                const response = await fetch(
                  `http://ip-api.com/json/?lat=${latitude}&lon=${longitude}`
                );
                
                if (response.ok) {
                  const data = await response.json();
                  setLocation({
                    country: data.country,
                    city: data.city,
                    lat: latitude,
                    lon: longitude,
                    source: 'browser'
                  });
                } else {
                  // Solo coordenadas del navegador
                  setLocation({
                    lat: latitude,
                    lon: longitude,
                    source: 'browser'
                  });
                }
              } catch (error) {
                console.error('Error getting location info from coordinates:', error);
                setLocation({
                  lat: position.coords.latitude,
                  lon: position.coords.longitude,
                  source: 'browser'
                });
              }
              setLoading(false);
            },
            async (error) => {
              console.warn('Geolocation permission denied or failed:', error.message);
              
              // Como último recurso, usar un servicio externo que detecte la IP del cliente
              try {
                const response = await fetch('https://ipapi.co/json/');
                if (response.ok) {
                  const data = await response.json();
                  setLocation({
                    country: data.country_name,
                    city: data.city,
                    lat: data.latitude,
                    lon: data.longitude,
                    query: data.ip,
                    source: 'external-api'
                  });
                } else {
                  throw new Error('External API failed');
                }
              } catch (apiError) {
                console.error('All geolocation methods failed:', apiError);
                setLocation({
                  error: 'No se pudo obtener la ubicación',
                  source: 'error'
                });
              }
              setLoading(false);
            },
            {
              timeout: 10000,
              enableHighAccuracy: false
            }
          );
        } else {
          throw new Error('Geolocation not supported');
        }
      } catch (error) {
        console.error('Geolocation error:', error);
        setLocation({
          error: 'Error al obtener la ubicación',
          source: 'error'
        });
        setLoading(false);
      }
    };

    getGeolocation();
  }, []);

  return { location, loading };
}
