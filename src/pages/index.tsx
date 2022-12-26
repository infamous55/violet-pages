import { type NextPage } from "next";
import Head from "next/head";
import Layout from "../components/Layout";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Layout>
        <p>This is the home page.</p>
      </Layout>
    </>
  );
};

export default Home;
