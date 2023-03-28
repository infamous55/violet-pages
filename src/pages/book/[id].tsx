import type { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import { env } from "../../env/server.mjs";
import type { BookData } from "../../types/google-api-data";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import toast from "../../utils/toast";

const Book: NextPage<{ book: BookData }> = ({ book }) => {
  const [description, setDescription] = useState(book.volumeInfo.description);
  const [showDescription, setShowDescription] = useState(false);
  const [isFirst, setIsFirst] = useState(true);

  const { refetch } = trpc.book.getDescription.useQuery(
    { id: book.id, description: description as string },
    {
      enabled: false,
      onSuccess: (data) => {
        setDescription(data);
      },
    }
  );

  const handleShowDescription = async () => {
    if (isFirst && description) {
      const toastId = toast.loading("Loading description!");
      try {
        await refetch();
        setIsFirst(false);
        toast.dismiss(toastId);
        toast.success("Fetched description!");
      } catch {
        toast.dismiss(toastId);
        toast.error("Something went wrong!");
      }
    }
    setShowDescription(!showDescription);
  };

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
      <p className="mb-2 text-gray-300">
        {book.volumeInfo.pageCount} pages · published{" "}
        {new Date(book.volumeInfo.publishedDate).toLocaleDateString()}
      </p>
      {book.volumeInfo.description && (
        <div className="w-fit max-w-full rounded-sm border border-gray-600 bg-neutral-900 py-1 px-2">
          <div
            className="flex w-fit cursor-pointer"
            onClick={handleShowDescription}
          >
            <p>Show Description</p>
            <ChevronDownIcon className="mx-1 mt-1 h-5 w-5" />
          </div>
          {showDescription && <p className="mt-2">{description}</p>}
        </div>
      )}
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
