import { type NextPage, type GetServerSideProps } from "next";
import Head from "next/head";
import Layout from "~/components/Layout";
import User from "~/types/user";
import useAuth from "~/utils/useAuth";
import { searchRouter } from "~/server/trpc/router/search";
import { prisma } from "~/server/db/client";
import { Search } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "~/utils/trpc";
import { userRouter } from "~/server/trpc/router/user";

const Dashboard: NextPage<{
  user: User;
  history: Search[];
  listInfo: {
    totalLists: number;
    publicLists: number;
    privateLists: number;
  };
}> = ({ user, history: initialHistory, listInfo: initialListInfo }) => {
  let greeting;
  const currentHour = new Date().getHours();
  if (currentHour < 12) greeting = "Good morning";
  else if (currentHour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  const [history, setHistory] = useState(initialHistory);
  trpc.search.getHistory.useQuery(undefined, {
    onSuccess(data) {
      setHistory(data);
    },
  });

  const [listInfo, setListinfo] = useState(initialListInfo);
  trpc.user.getListInfo.useQuery(undefined, {
    onSuccess(data) {
      setListinfo(data);
    },
  });

  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <Layout>
        <h3 className="mb-2 text-xl font-semibold">
          <span className="select-none">📚 </span>Dashboard
        </h3>
        <p className="mb-4 ml-2 inline-block text-sm font-semibold text-gray-300">
          {greeting}, {user.name}!
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex h-52 flex-col items-center justify-center rounded-sm border border-gray-600 px-4 py-4">
            <h3 className="mb-2 text-2xl font-semibold">
              {listInfo.totalLists} Lists
            </h3>
            <div className="flex gap-x-2 text-gray-300">
              <p>{listInfo.publicLists} Public</p>
              <p>{listInfo.privateLists} Private</p>
            </div>
          </div>
          <div className="flex h-52 flex-col items-center justify-center rounded-sm border border-gray-600 px-4 py-4">
            <h3 className="mb-2 text-center text-2xl font-semibold">
              Recently Searched
            </h3>
            {history.map((search) => (
              <div className="max-w-full">
                <Link href={`/search?query=${search.query}`}>
                  <p className="overflow-x-hidden text-ellipsis whitespace-nowrap hover:text-gray-300">
                    {search.query}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { redirectDestination, user, session } = await useAuth(context);
  if (redirectDestination)
    return {
      redirect: {
        destination: redirectDestination,
        permanent: false,
      },
    };

  const searchCaller = searchRouter.createCaller({ prisma, session });
  const history = await searchCaller.getHistory();

  const userCaller = userRouter.createCaller({ prisma, session });
  const listInfo = await userCaller.getListInfo();

  return {
    props: {
      user,
      history,
      listInfo,
    },
  };
};

export default Dashboard;
