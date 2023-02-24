import getServerAuthSession from "./getServerAuthSession";
import type { GetServerSidePropsContext } from "next";
import type User from "../types/user";

const result = (redirectDestination: string | null, user: User | null) => {
  return { redirectDestination, user };
};

const useAuth = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  const user = session?.user;

  if (!user) return result("/", null);

  if (context.resolvedUrl !== "/setup" && !user.setupCompleted)
    return result("/setup", user);

  if (context.resolvedUrl === "/setup" && user.setupCompleted)
    return result("/dashboard", user);

  return result(null, user);
};

export default useAuth;
