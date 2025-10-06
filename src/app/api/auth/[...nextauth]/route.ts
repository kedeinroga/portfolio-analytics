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

// Log para debug (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('NextAuth Environment Check:', {
    ...requiredEnvVars,
    GOOGLE_CLIENT_SECRET: requiredEnvVars.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
  });
}

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
  },
  // Configuraciones esenciales para producción
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
