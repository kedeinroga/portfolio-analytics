import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Verificar variables de entorno críticas
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};

// Verificar que todas las variables críticas estén configuradas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('NextAuth: Missing required environment variables:', missingVars);
}

// Log para debug
console.log('NextAuth Environment Check:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: requiredEnvVars.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
  GOOGLE_CLIENT_SECRET: requiredEnvVars.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
  NEXTAUTH_SECRET: requiredEnvVars.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
  ADMIN_EMAIL: requiredEnvVars.ADMIN_EMAIL ? 'SET' : 'NOT SET',
  missingVars: missingVars.length > 0 ? missingVars : 'none'
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
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
  secret: process.env.NEXTAUTH_SECRET,
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
