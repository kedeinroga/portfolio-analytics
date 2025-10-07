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
      // Solo permite el acceso al admin configurado
      return user.email === process.env.ADMIN_EMAIL;
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
});

export { handler as GET, handler as POST };
