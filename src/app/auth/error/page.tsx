'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const errorMessages: Record<string, string> = {
    'Configuration': 'Hay un problema de configuración con el proveedor OAuth.',
    'AccessDenied': 'Acceso denegado. Solo el administrador puede acceder.',
    'Verification': 'No se pudo verificar la cuenta.',
    'Signin': 'Error durante el inicio de sesión.',
    'OAuthSignin': 'Error al conectar con el proveedor OAuth.',
    'OAuthCallback': 'Error en el callback de OAuth.',
    'OAuthCreateAccount': 'Error al crear la cuenta OAuth.',
    'EmailCreateAccount': 'Error al crear la cuenta con email.',
    'Callback': 'Error en el callback de autenticación.',
    'OAuthAccountNotLinked': 'La cuenta OAuth no está vinculada.',
    'EmailSignin': 'Error al enviar el email de verificación.',
    'CredentialsSignin': 'Error en las credenciales proporcionadas.',
    'SessionRequired': 'Se requiere una sesión válida.',
    'Default': 'Error de autenticación desconocido.',
  };

  const message = errorMessages[error || 'Default'] || errorMessages['Default'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de Autenticación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
          {error && (
            <p className="mt-1 text-center text-xs text-gray-400">
              Código de error: {error}
            </p>
          )}
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
