import { type NextPage, type GetServerSideProps } from "next";
import Link from "next/link";
import React, { useState, useEffect, useRef, LegacyRef } from "react";
import Layout from "../components/Layout";
import { env } from "../env/server.mjs";
import { trpc } from "../utils/trpc";
import useAuth from "../utils/useAuth";

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function isNumber(x: any): x is number {
  return typeof x === "number";
}

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

  const totalItems = data.totalItems;
  const [results, setResults] = useState<Data | undefined>(data);
  const [nextResults, setNextResults] = useState<Data | undefined>();
  const [page, setPage] = useState<number>(1);
  let previousPage = usePrevious<number>(page);

  const {
    refetch: fetchNextPageResults,
    isFetching,
    isError,
  } = trpc.search.getResultsPage.useQuery(
    { query, page: page + 1 },
    {
      enabled: false,
      onSettled: (data, error) => {
        if (!error) setNextResults(data);
        else setNextResults(undefined);
      },
    }
  );
  const { refetch: fetchCurrentPageResults } =
    trpc.search.getResultsPage.useQuery(
      { query, page },
      {
        enabled: false,
        onSuccess: (data) => {
          setResults(data);
        },
      }
    );

  useEffect(() => {
    previousPage = undefined;
    setPage(1);
    setResults(data);
    fetchNextPageResults();
  }, [data]);

  useEffect(() => {
    if (isNumber(previousPage)) {
      if (previousPage < page) {
        setResults(nextResults);
        fetchNextPageResults();
      } else {
        setNextResults(results);
        fetchCurrentPageResults();
      }
    }
  }, [page]);

  const [focus, setFocus] = useState<string>();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <Layout>
      <h3 className="mb-2 text-xl font-semibold text-gray-300">
        🔎 Searched for: <span className="text-white">{query}</span>
      </h3>
      <p className="mb-2 ml-2 inline-block text-sm font-semibold text-gray-300">
        {totalItems} entries found
      </p>
      {results?.items.map((item, index) => (
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
                  {new Date(item.volumeInfo.publishedDate)
                    .getFullYear()
                    .toString()}{" "}
                  edition
                </p>
              ) : null}
            </div>
          </Link>
          <div className="border-t border-gray-600"></div>
        </React.Fragment>
      ))}
      <div className="mt-3 flex w-full justify-between">
        <button
          onClick={() => {
            if (page > 1) setPage(page - 1);
          }}
          disabled={page < 2}
          className="rounded-md border border-gray-600 bg-neutral-900 py-1 px-2 text-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-neutral-900"
          ref={ref}
        >
          Previous
        </button>
        <button
          onClick={() => {
            setPage(page + 1);
          }}
          disabled={isFetching || isError}
          className="rounded-md border border-gray-600 bg-neutral-900 py-1 px-2 text-sm hover:bg-neutral-800 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-neutral-900"
          style={{ width: ref.current?.offsetWidth || "70px" }}
        >
          Next
        </button>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { redirectDestination } = await useAuth(context);
  if (redirectDestination)
    return {
      redirect: {
        destination: redirectDestination,
        permanent: false,
      },
    };

  const query = context.query["query"];
  if (typeof query !== "string" || !query.trim())
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
    if (!data.totalItems || !data.items) throw new Error();

    return { props: { query, data } };
  } catch {
    return { props: { query, data: null } };
  }
};

export default Search;
