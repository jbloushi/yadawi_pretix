import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/** branch: 'KWT' | 'KSA' | 'ALL' */
const admins = [
  { id: '1', name: 'Admin (All)', email: 'admin@yadawi.com', password: 'admin123', role: 'admin', branch: 'ALL' },
  { id: '2', name: 'Admin KW', email: 'admin-kw@yadawi.com', password: 'admin123', role: 'admin', branch: 'KWT' },
  { id: '3', name: 'Admin SA', email: 'admin-sa@yadawi.com', password: 'admin123', role: 'admin', branch: 'KSA' },
  { id: '4', name: 'Event Usher KW', email: 'usher-kw@yadawi.com', password: 'usher123', role: 'usher', branch: 'KWT' },
  { id: '5', name: 'Event Usher SA', email: 'usher-sa@yadawi.com', password: 'usher123', role: 'usher', branch: 'KSA' },
  { id: '6', name: 'Viewer', email: 'viewer@yadawi.com', password: 'viewer123', role: 'viewer', branch: 'ALL' },
];

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = admins.find(
          (a) => a.email === credentials.email && a.password === credentials.password
        );

        if (user) {
          return { id: user.id, name: user.name, email: user.email, role: user.role, branch: user.branch } as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.branch = (user as any).branch ?? 'ALL';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).email = token.email;
        (session.user as any).branch = token.branch ?? 'ALL';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || 'yadawi-admin-secret-key',
};

/** Alias kept for backward compatibility with imports using `authOptions` */
export const authOptions = adminAuthOptions;
