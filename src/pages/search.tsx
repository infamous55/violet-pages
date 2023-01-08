import { type NextPage, type GetServerSideProps } from "next";
import Link from "next/link";
import React from "react";
import Layout from "../components/Layout";
import { env } from "../env/server.mjs";

type Data = {
  totalItems: number;
  items: [
    {
      id: string;
      searchInfo?: {
        textSnippet: string;
      };
      volumeInfo: {
        title: string;
        subtitle?: string;
        authors?: [string];
        description: string;
        imageLinks?: {
          thumbnail?: string;
        };
        publishedDate: string;
        pageCount: number;
      };
    }
  ];
};

const Search: NextPage<{ query: string; data: Data | null }> = ({
  query,
  data,
}) => {
  if (!data)
    return (
      <Layout>
        <h3 className="mb-2 text-xl font-semibold text-gray-300">
          🔎 Searched for: <span className="text-white">{query}</span>
        </h3>
        <p>Something went wrong. Please try again later!</p>
      </Layout>
    );

  return (
    <Layout>
      <h3 className="mb-2 text-xl font-semibold text-gray-300">
        🔎 Searched for: <span className="text-white">{query}</span>
      </h3>
      {data.items.map((item, index) => (
        <React.Fragment key={item.id}>
          <Link href={`/book/${item.id}}`}>
            <div
              className="w-full rounded-md border border-gray-600 bg-neutral-900 py-1 px-2 hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none focus:ring-0"
              tabIndex={index + 1}
            >
              <h3 className="font-semibold">{item.volumeInfo.title}</h3>
              {/* <p
                dangerouslySetInnerHTML={{
                  __html: item.searchInfo?.textSnippet || "",
                }}
              ></p> */}
            </div>
          </Link>
          <div className="mb-2"></div>
        </React.Fragment>
      ))}
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
    const data: Data = await response.json();

    return { props: { query: decodeURIComponent(query), data } };
  } catch {
    return { props: { query: decodeURIComponent(query), data: null } };
  }
};

export default Search;
