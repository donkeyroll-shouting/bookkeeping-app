import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "production"
    ? undefined
    : "local-bookkeeping-app-secure-jwt-secret-key-123")

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hardcoded username and password directly in the application
        if (credentials?.username === "admin" && credentials?.password === "admin") {
          return { id: "1", name: "Administrator", email: "admin@local" }
        }
        return null
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
  trustHost: true, // Required for production deployment on Render
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login
      return !!auth
    },
  },
})
