import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role: UserRole; // Ensures NextAuth recognizes this property
    };
  }
}