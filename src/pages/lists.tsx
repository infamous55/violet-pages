import { type GetServerSideProps, type NextPage } from "next";
import Layout from "../components/Layout";
import useAuth from "../utils/useAuth";

const Lists: NextPage = () => {
  return (
    <Layout>
      <p>Lists</p>
    </Layout>
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

export default Lists;
