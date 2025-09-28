/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prismaClient } from "@/app/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google" && user?.email) {
        try {
          await prismaClient.user.upsert({
            where: {
              email: user.email,
            },
            update: {},
            create: {
              email: user.email,
              provider: "GOOGLE",
            },
          });
        } catch (error) {
          console.error("Error creating/updating user:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }: { session: any }) {
      if (session.user?.email) {
        const user = await prismaClient.user.findUnique({
          where: {
            email: session.user.email,
          },
        });
        if (user) {
          session.user.id = user.id;
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
