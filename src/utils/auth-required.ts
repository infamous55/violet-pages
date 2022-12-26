import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { type GetServerSidePropsContext } from "next";

const authRequired = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  const user = session?.user;

  if (!user)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  if (context.resolvedUrl !== "/setup" && !user.setupCompleted)
    return {
      redirect: {
        destination: "/setup",
        permanent: false,
      },
    };

  if (context.resolvedUrl === "/setup" && user.setupCompleted)
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };

  return {
    props: {
      user,
    },
  };
};

export default authRequired;
