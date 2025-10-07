import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verificar que las variables críticas estén configuradas
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET', 
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'SET' : 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(envCheck);
}
