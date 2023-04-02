import getServerAuthSession from "./getServerAuthSession";
import type { GetServerSidePropsContext } from "next";
import type User from "../types/user";
import type { Session } from "next-auth";

const result = (
  redirectDestination: string | null,
  user: User | null,
  session: Session | null
) => {
  return { redirectDestination, user, session };
};

const useAuth = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  const user = session?.user;

  if (!user) return result("/", null, session);

  if (context.resolvedUrl !== "/setup" && !user.setupCompleted)
    return result("/setup", user, session);

  if (context.resolvedUrl === "/setup" && user.setupCompleted)
    return result("/dashboard", user, session);

  return result(null, user, session);
};

export default useAuth;
