// src/types/next-auth.d.ts
// SECURITY FIX #11: Extend NextAuth types so session.user.id and session.user.role
// are strongly typed — eliminates unsafe `as any` casts throughout the codebase.

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: string;
  }
}
