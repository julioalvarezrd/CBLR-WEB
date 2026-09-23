import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/modules/auth/password";
import { normalizeEmail } from "@/modules/auth/validations";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credenciales institucionales",
      credentials: {
        email: {
          label: "Correo electrónico",
          type: "email",
        },
        password: {
          label: "Contraseña",
          type: "password",
        },
      },
      async authorize(credentials) {
        const emailValue =
          typeof credentials.email === "string" ? credentials.email : "";
        const password =
          typeof credentials.password === "string" ? credentials.password : "";

        if (!emailValue || !password) {
          return null;
        }

        let email: string;

        try {
          email = normalizeEmail(emailValue);
        } catch {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            isActive: true,
            personnelMember: {
              select: {
                firstNames: true,
                lastNames: true,
              },
            },
          },
        });

        if (!user?.isActive) {
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }),
          prisma.auditLog.create({
            data: {
              actorUserId: user.id,
              action: "auth.login",
              entityType: "User",
              entityId: user.id,
            },
          }),
        ]);

        return {
          id: user.id,
          email: user.email,
          name: user.personnelMember
            ? `${user.personnelMember.firstNames} ${user.personnelMember.lastNames}`
            : user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.userId === "string") {
        session.user.id = token.userId;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
