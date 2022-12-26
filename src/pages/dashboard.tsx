import { type NextPage, type GetServerSideProps } from "next";
import Head from "next/head";
import Layout from "../components/Layout";
import authRequired from "../utils/auth-required";

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
  return await authRequired(context);
};

export default Dashboard;
