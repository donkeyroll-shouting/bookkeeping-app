import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === "production"
    ? undefined
    : "local-bookkeeping-app-secure-jwt-secret-key-123")

const configuredUsername =
  process.env.USERNAME ||
  (process.env.NODE_ENV === "production" ? undefined : "admin")

const configuredPassword =
  process.env.PASSWORD ||
  (process.env.NODE_ENV === "production" ? undefined : "admin")

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (
          configuredUsername &&
          configuredPassword &&
          credentials?.username === configuredUsername &&
          credentials?.password === configuredPassword
        ) {
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
