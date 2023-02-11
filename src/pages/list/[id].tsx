import { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import isCUID from "../../utils/isCuid";
import useAuth from "../../utils/useAuth";
import { prisma } from "../../server/db/client";
import { type List } from "@prisma/client";
import Head from "next/head";

const List: NextPage<List> = (list) => {
  return (
    <Layout>
      <Head>
        <title>{list.name}</title>
      </Head>
      <h3>{list.name}</h3>
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

  const list = await prisma.list.findUnique({ where: { id } });
  if (!list)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  const { user } = await useAuth(context);
  if (!list.public && list.authorId !== user?.id)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  return {
    props: {
      ...list,
    },
  };
};

export default List;
