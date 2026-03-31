import { PlatformRole } from "@prisma/client";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: PlatformRole;
    };
  }

  interface User extends DefaultUser {
    role?: PlatformRole;
  }
}
