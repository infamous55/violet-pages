import type { DefaultSession } from "next-auth";
import type DeepNonNullable from "./deep-non-nullable";

type User = {
  id: string;
  setupCompleted: boolean;
  description: string;
} & DeepNonNullable<Required<DefaultSession["user"]>>;

export default User;
