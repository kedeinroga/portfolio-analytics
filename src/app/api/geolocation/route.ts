// src/app/api/geolocation/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    // Log para depuración
    console.log("Header 'x-forwarded-for':", forwardedFor);
    console.log("Determined client IP:", clientIp);

    // Si no encontramos la IP, la API usará la del servidor como fallback.
    const apiUrl = `http://ip-api.com/json/${clientIp || ''}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Manejar casos donde la IP es inválida (como en localhost), privada, o la API falla.
    if (data.status === 'fail' || !response.ok) {
        if (clientIp) {
            console.warn(`Geolocation failed for IP: ${clientIp}. Reason: ${data.message || response.statusText}. Falling back to server IP.`);
        } else {
            console.warn(`Client IP not found in 'x-forwarded-for' header. Falling back to server IP.`);
        }
      
      // Fallback: geolocalizar el servidor.
      const fallbackResponse = await fetch('http://ip-api.com/json');
      const fallbackData = await fallbackResponse.json();
      return NextResponse.json({
        country: fallbackData.country,
        city: `Fallback: ${fallbackData.city}`,
        lat: fallbackData.lat,
        lon: fallbackData.lon,
        query: fallbackData.query,
        source: 'server-fallback'
      });
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