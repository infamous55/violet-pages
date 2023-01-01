import { type NextPage, type GetServerSideProps } from "next";
import Layout from "../../components/Layout";
import { z } from "zod";
import type User from "../../types/user";
import { prisma } from "../../server/db/client";

type DeepNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
type Props = DeepNonNullable<Required<Omit<User, "setupCompleted" | "email">>>;

const Profile: NextPage<Props> = (user) => {
  return (
    <Layout>
      <h3>{user.name}</h3>
    </Layout>
  );
};

const isCUID = (data: any): data is string => {
  if (z.string().cuid().safeParse(data).success) return true;
  return false;
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
