import { type DefaultSession } from "next-auth";
import type DeepNonNullable from "../types/deep-non-nullable";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      setupCompleted: boolean;
      description: string;
    } & DeepNonNullable<Required<DefaultSession["user"]>>;
  }
}
