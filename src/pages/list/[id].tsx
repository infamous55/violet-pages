import type { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import isCUID from "../../utils/isCuid";
import useAuth from "../../utils/useAuth";
import { prisma } from "../../server/db/client";
import type { List, Book } from "@prisma/client";
import Head from "next/head";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import type { SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import DialogWindow from "../../components/DialogWindow";
import { Dialog } from "@headlessui/react";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/20/solid";
import ListForm from "../../components/ListForm";
import type ListFormInputs from "../../types/list-form-inputs";
import { trpc } from "../../utils/trpc";
import toast from "../../utils/toast";
import { useRouter } from "next/router";

type ExtendedList = List & {
  books: Book[];
};

const List: NextPage<{ list: ExtendedList; isAuthor: boolean }> = ({
  list,
  isAuthor,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const router = useRouter();
  const { mutateAsync: updateList } = trpc.list.update.useMutation();
  const submit: SubmitHandler<ListFormInputs> = async (data) => {
    try {
      await updateList({ ...data, id: list.id });
      setIsOpen(false);
      toast.success("List updated!");
      router.replace(router.asPath);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <Layout>
      <Head>
        <title>{list.name}</title>
      </Head>
      <div>
        <div className="flex items-start justify-between">
          <h3 className="mb-2 text-xl font-semibold">{list.name}</h3>
          {isAuthor && (
            <button
              className="relative inline-flex cursor-pointer items-center rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none"
              onClick={() => setIsOpen(true)}
            >
              <PencilSquareIcon className="-mb-0.5 mr-1 h-4 w-4" />
              Edit list
            </button>
          )}
        </div>
        <DialogWindow open={isOpen}>
          <Dialog.Title as="div" className="mb-4 flex text-xl font-semibold">
            <EllipsisHorizontalCircleIcon className="-mb-0.5 mr-1 h-5 w-5 self-center text-violet-600" />
            <h3>Edit list</h3>
          </Dialog.Title>
          <ListForm
            onSubmit={submit}
            onCancel={() => setIsOpen(false)}
            defaultValues={{ ...list }}
          />
        </DialogWindow>
        <p>{list.description}</p>
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

  const list = await prisma.list.findUnique({
    where: { id },
    include: { books: true },
  });
  if (!list)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  const { user } = await useAuth(context);
  if (!list.public && list.authorId !== user?.id)
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };

  let isAuthor = false;
  if (list.authorId === user?.id) isAuthor = true;

  return {
    props: {
      list,
      isAuthor,
    },
  };
};

export default List;
