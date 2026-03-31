import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PlatformRole } from "@prisma/client";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const hasEmailProvider = Boolean(
  process.env.EMAIL_SERVER && process.env.EMAIL_FROM,
);
const hasGoogleProvider = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

const providers: NextAuthOptions["providers"] = [];

if (hasEmailProvider) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 15 * 60,
    }),
  );
}

if (hasGoogleProvider) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (providers.length === 0) {
  providers.push(
    CredentialsProvider({
      name: "Local Demo",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
      },
      async authorize(credentials) {
        const emailValue = credentials?.email;
        if (typeof emailValue !== "string" || !emailValue.includes("@")) {
          return null;
        }

        const email = emailValue.toLowerCase();
        const existingUser = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (existingUser) {
          return existingUser;
        }

        const createdUser = await prisma.user.create({
          data: {
            email,
            name: email.split("@")[0],
            role: PlatformRole.USER,
          },
        });

        return createdUser;
      },
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers,
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role =
          (user.role as PlatformRole | undefined) ?? PlatformRole.USER;
      }
      return session;
    },
  },
};
