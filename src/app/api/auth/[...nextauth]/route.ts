import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Durante el build, usar valores por defecto para evitar errores
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET;

// Verificar variables de entorno críticas
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || (isBuildTime ? "build-placeholder" : ""),
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || (isBuildTime ? "build-placeholder" : ""),
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || (isBuildTime ? "build-placeholder-secret" : ""),
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || (isBuildTime ? "https://kedein.com" : ""),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || (isBuildTime ? "admin@example.com" : ""),
};

// Solo verificar variables críticas si NO estamos en build time
if (!isBuildTime) {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value || value.includes('build-placeholder'))
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('NextAuth: Missing required environment variables:', missingVars);
  }

  // Log para debug
  console.log('NextAuth Environment Check:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'SET' : 'NOT SET',
    isBuildTime
  });
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: requiredEnvVars.GOOGLE_CLIENT_ID,
      clientSecret: requiredEnvVars.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn attempt:', { 
        userEmail: user.email, 
        adminEmail: process.env.ADMIN_EMAIL,
        match: user.email === process.env.ADMIN_EMAIL 
      });
      
      if (user.email === process.env.ADMIN_EMAIL) {
        return true;
      } else {
        return false;
      }
    },
    async jwt({ token, account }) {
      // Persistir el access_token en el token JWT
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Mantener la sesión simple
      return session;
    },
  },
  // Configuraciones esenciales para producción
  secret: requiredEnvVars.NEXTAUTH_SECRET,
  pages: {
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: true, // Habilitamos debug temporalmente para ver los logs
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', { code, metadata });
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', { code, metadata });
    }
  }
});

export { handler as GET, handler as POST };
