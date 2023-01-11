import { type NextPage, type GetServerSideProps } from "next";
import Link from "next/link";
import React, { useState } from "react";
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
        // description: string;
        // imageLinks?: {
        //   thumbnail?: string;
        // };
        publishedDate: string;
        // pageCount: number;
      };
    }
  ];
};

const generatePageList = (center: number) => {
  const start = Math.max(1, center - 3);
  return Array.from({ length: 7 }, (_, i) => start + i);
};

const Search: NextPage<{ query: string; page: number; data: Data | null }> = ({
  query,
  page,
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

  const pageList = generatePageList(page);
  const [focus, setFocus] = useState<string>();
  return (
    <Layout>
      <h3 className="mb-2 text-xl font-semibold text-gray-300">
        🔎 Searched for: <span className="text-white">{query}</span>
      </h3>
      <p className="mb-2 ml-2 inline-block text-sm font-semibold text-gray-300">
        {data.totalItems} entries found
      </p>
      {data.items.map((item, index) => (
        <React.Fragment key={item.id}>
          <Link
            href={`/book/${item.id}`}
            className="focus:outline-none"
            onFocus={() => setFocus(item.id)}
            onBlur={() => setFocus("")}
          >
            <div
              className={`w-full rounded-md bg-neutral-900 py-2 px-2 font-semibold hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none ${
                focus === item.id ? "bg-neutral-800" : null
              }`}
              tabIndex={index + 1}
            >
              <h3>{item.volumeInfo.title}</h3>
              <h5 className="text-sm text-gray-300">
                {item.volumeInfo.subtitle}
              </h5>
              <p className="text-sm italic">
                <span className="not-italic text-gray-300">by</span>{" "}
                {!item.volumeInfo.authors
                  ? "Unknown"
                  : item.volumeInfo.authors.map(
                      (author, index) =>
                        `${author}${
                          index !==
                          (item.volumeInfo.authors?.length as number) - 1
                            ? ", "
                            : ""
                        }`
                    )}
              </p>
              {!isNaN(new Date(item.volumeInfo.publishedDate).getTime()) ? (
                <p className="text-sm text-gray-300">
                  from{" "}
                  {new Date(item.volumeInfo.publishedDate)
                    .getFullYear()
                    .toString()}
                </p>
              ) : null}
            </div>
          </Link>
          <div className="border-t border-gray-600"></div>
        </React.Fragment>
      ))}
      <div className="mt-2 flex w-full justify-center">
        {pageList.map((pageNumber) => (
          <Link
            href={
              pageNumber <= Math.ceil(data.totalItems / 10)
                ? `/search?query=${query}&page=${pageNumber}`
                : "#"
            }
          >
            <span
              className={`mr-2 inline-block rounded-md border border-gray-600 bg-neutral-900 px-1.5 py-0.5 text-sm hover:bg-neutral-800 ${
                page === pageNumber ? "border-violet-500" : null
              } ${
                pageNumber <= Math.ceil(data.totalItems / 10)
                  ? "bg-neutral-800 text-gray-300"
                  : null
              }`}
            >
              {pageNumber}
            </span>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = context.query["query"];
  if (typeof query !== "string" || !query.trim())
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  let page;
  if (
    typeof context.query["page"] !== "string" ||
    isNaN(parseInt(context.query["page"])) ||
    parseInt(context.query["page"]) < 1
  )
    page = 1;
  else page = parseInt(context.query["page"]);

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&startIndex=${(page - 1) * 10}&key=${env.GOOGLE_API_KEY}`
    );
    const data = await response.json();
    if (!data.totalItems || !data.items) throw new Error();

    return { props: { query, page, data } };
  } catch {
    return { props: { query, page, data: null } };
  }
};

export default Search;
