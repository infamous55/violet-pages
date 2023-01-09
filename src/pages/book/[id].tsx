import { type GetServerSideProps, type NextPage } from "next";
import Layout from "../../components/Layout";
import { env } from "../../env/server.mjs";

const Book: NextPage = () => {
  return (
    <Layout>
      <h3>book</h3>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  if (typeof id !== "string" || !id.trim())
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}&key=${env.GOOGLE_API_KEY}`
    );
    const book = await response.json();
    if (book.error) throw new Error();

    return {
      props: {
        id,
        book,
      },
    };
  } catch {
    return {
      props: {
        id,
        book: null,
      },
    };
  }
};

export default Book;
