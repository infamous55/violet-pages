import type { NextPage, GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import type User from "../../types/user";
import { prisma } from "../../server/db/client";
import Head from "next/head";
import isCUID from "../../utils/isCuid";

const Profile: NextPage<Omit<User, "setupCompleted" | "email">> = (user) => {
  return (
    <Layout>
      <Head>
        <title>{user.name}</title>
      </Head>
      <h3>{user.name}</h3>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  if (!isCUID(id))
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true, image: true, description: true },
  });
  if (!user)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  return {
    props: {
      id,
      ...user,
    },
  };
};

export default Profile;
