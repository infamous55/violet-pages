import { type NextPage, type GetServerSideProps } from "next";
import Head from "next/head";
import Layout from "~/components/Layout";
import useAuth from "~/utils/useAuth";

const Dashboard: NextPage = () => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Layout>
        <p>This is the dashboard.</p>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { redirectDestination, user } = await useAuth(context);
  if (redirectDestination)
    return {
      redirect: {
        destination: redirectDestination,
        permanent: false,
      },
    };

  return {
    props: { user },
  };
};

export default Dashboard;
