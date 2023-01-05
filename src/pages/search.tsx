import { type NextPage, type GetServerSideProps } from "next";
import Layout from "../components/Layout";
import { env } from "../env/server.mjs";

const Search: NextPage<{ query: string; data: any }> = ({ query, data }) => {
  console.log(data);

  if (!query)
    return (
      <Layout>
        <h1>Something went wrong!</h1>
      </Layout>
    );

  return (
    <Layout>
      <h1>{query}</h1>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = context.query["query"];
  if (typeof query !== "string" || !query)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&key=${env.GOOGLE_API_KEY}`
    );
    const data = await response.json();

    return { props: { query: decodeURIComponent(query), data } };
  } catch {
    return { props: { query: "", data: null } };
  }
};

export default Search;
