import type { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import { env } from "../../env/server.mjs";
import type { BookData } from "../../types/google-api-data";
import openai from "../../utils/openai";

const Book: NextPage<{ book: BookData }> = ({ book }) => {
  return (
    <Layout>
      <h3 className="mb-2 text-xl font-semibold">{book.volumeInfo.title}</h3>
      {book.volumeInfo.subtitle && (
        <h5 className="mb-2 font-semibold text-gray-300">
          {book.volumeInfo.subtitle}
        </h5>
      )}
      <p className="mb-2 italic">
        <span className="not-italic text-gray-300">by</span>{" "}
        {!book.volumeInfo.authors
          ? "Unknown"
          : book.volumeInfo.authors.map(
              (author, index) =>
                `${author}${
                  index !== (book.volumeInfo.authors?.length as number) - 1
                    ? ", "
                    : ""
                }`
            )}
      </p>
      <p>{book.volumeInfo.description}</p>
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
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${env.GOOGLE_API_KEY}`
    );
    const book = await response.json();

    //   try {
    //     if (book.volumeInfo.description) {
    //       const response = await openai.createEdit({
    //         model: "text-davinci-edit-001",
    //         instruction:
    //           "Edit the following text such that it follows standard grammar. Remove extra characters, remove markdown tags, use proper capitalization, and fix the punctuation. Make sure it follows a clean and correct writing style.",
    //         input: book.volumeInfo.description,
    //       });

    //       book.volumeInfo.description = response.data.choices[0]?.text;
    //     }
    //   } catch (error) {
    //     console.error(error);
    //   }

    return {
      props: {
        book,
      },
    };
  } catch {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
};

export default Book;
