import type User from "./user";

declare module "next-auth" {
  interface Session {
    user: User;
  }
}
