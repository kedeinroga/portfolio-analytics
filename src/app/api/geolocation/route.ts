// src/app/api/geolocation/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Intentar obtener la IP real del cliente desde múltiples headers
    const getClientIP = (request: NextRequest): string | null => {
      // Headers comunes que contienen la IP del cliente
      const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'x-client-ip',
        'cf-connecting-ip', // Cloudflare
        'x-vercel-forwarded-for', // Vercel
        'x-forwarded',
        'forwarded-for',
        'forwarded'
      ];
      
      for (const header of headers) {
        const value = request.headers.get(header);
        if (value) {
          // x-forwarded-for puede contener múltiples IPs separadas por comas
          const ip = value.split(',')[0].trim();
          // Verificar que sea una IP válida (no localhost, no private range)
          if (ip && !isLocalOrPrivateIP(ip)) {
            return ip;
          }
        }
      }
      
      return null;
    };

    // Función para verificar si es IP local o privada
    const isLocalOrPrivateIP = (ip: string): boolean => {
      if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
      
      // Rangos de IP privadas IPv4
      const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./
      ];
      
      return privateRanges.some(range => range.test(ip));
    };

    const clientIp = getClientIP(request);

    // Si no encontramos la IP del cliente, no podemos proporcionar geolocalización precisa
    if (!clientIp) {
      return NextResponse.json({
        error: "No se pudo determinar la ubicación del cliente",
        message: "IP del cliente no detectada en los headers de la solicitud",
        source: 'error'
      }, { status: 400 });
    }

    const apiUrl = `http://ip-api.com/json/${clientIp}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Manejar casos donde la IP es inválida o la API falla
    if (data.status === 'fail' || !response.ok) {
      return NextResponse.json({
        error: "Geolocalización fallida",
        message: data.message || response.statusText,
        ip: clientIp,
        source: 'api-error'
      }, { status: 400 });
    }

    // Respuesta exitosa con los datos del visitante.
    return NextResponse.json({
      country: data.country,
      city: data.city,
      lat: data.lat,
      lon: data.lon,
      query: data.query, // La IP que fue geolocalizada
      source: 'client-ip'
    });

  } catch (error) {
    console.error('Error in geolocation API route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}