import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // For demo purposes, we'll use a simple user check
        // In production, you'd connect to a database
        const demoUser = {
          id: "1",
          email: "demo@example.com",
          name: "Demo User",
          password: await bcrypt.hash("password123", 10),
        };

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          demoUser.password
        );

        if (credentials.email === demoUser.email && isValidPassword) {
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
