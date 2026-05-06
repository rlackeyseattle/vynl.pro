import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // BAND or VENUE
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // Creating a new user flow if they don't exist (Login first, verify later)
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const role = credentials.role === "VENUE" ? "VENUE" : "BAND";
          
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              role: role,
            },
          });

          // Create base profile based on role
          if (role === "BAND") {
            await prisma.bandProfile.create({
              data: { userId: newUser.id },
            });
          }

          return {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
          };
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
