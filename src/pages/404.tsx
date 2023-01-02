import Head from "next/head";
import Layout from "../components/Layout";

const NotFound: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>404 Not found</title>
      </Head>
      <div className="flex h-full w-full flex-grow items-center justify-center">
        <span className="inline-block">
          <h3 className="mb-2 text-center text-5xl font-semibold">404</h3>
          <p>This page could not be found.</p>
        </span>
      </div>
    </Layout>
  );
};

export default NotFound;
