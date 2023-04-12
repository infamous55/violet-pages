import type { NextPage, GetServerSideProps } from "next";
import Layout from "~/components/Layout";
import type User from "~/types/user";
import { prisma } from "~/server/db/client";
import Head from "next/head";
import isCUID from "~/utils/isCuid";
import Image from "next/image";
import type { List } from "@prisma/client";
import useAuth from "~/utils/useAuth";
import Link from "next/link";

type ProfileData = {
  user: Omit<User, "setupCompleted" | "email">;
  lists: List[];
};

const Profile: NextPage<ProfileData> = ({ user, lists }) => {
  return (
    <Layout>
      <Head>
        <title>{user.name}</title>
      </Head>
      <div className="mb-4 w-full md:w-3/5">
        <div className="mb-2 flex items-center">
          <Image
            height={40}
            width={40}
            className="mr-4 flex-shrink-0 flex-grow-0 rounded-full"
            src={user.image}
            alt="profile-picture"
          />
          <h3 className="break-words text-xl font-semibold">{user.name}</h3>
        </div>
        {user.description && (
          <p className="rounded-sm border border-gray-600 py-1 px-2">
            {user.description}
          </p>
        )}
      </div>
      {lists.length ? (
        <h3 className="mb-2 text-xl font-semibold">
          <span className="select-none">📋 </span>Public Lists
        </h3>
      ) : (
        <h3 className="font-semibold text-gray-300">
          No public lists to show.
        </h3>
      )}
      <div className="w-full">
        {lists?.map((list) => (
          <Link
            key={list.id}
            href={`/lists/${list.id}`}
            className="flex w-full flex-wrap justify-between border-b border-gray-600 py-2 px-2 font-semibold hover:bg-neutral-800"
          >
            <p className="break-words">{list.name}</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;
  if (!isCUID(id))
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  const user = await prisma.user.findUnique({
    where: { id },
    select: { description: true, name: true, image: true },
  });
  if (!user)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  const lists = await prisma.list.findMany({
    where: { authorId: id, public: true },
  });

  return {
    props: {
      user,
      lists,
    },
  };
};

export default Profile;
