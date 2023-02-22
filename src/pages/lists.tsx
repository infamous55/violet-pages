import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Layout from "../components/Layout";
import useAuth from "../utils/useAuth";
import {
  PlusIcon,
  ClipboardIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { trpc } from "../utils/trpc";
import toast from "../utils/toast";
import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "../server/trpc/router/_app";
import Link from "next/link";
import { PlusCircleIcon, MinusCircleIcon } from "@heroicons/react/20/solid";
import { env } from "../env/client.mjs";
import DialogWindow from "../components/DialogWindow";
import ListForm from "../components/ListForm";
import type ListFormInputs from "../types/list-form-inputs";

const Lists: NextPage = () => {
  const utils = trpc.useContext();
  const lists = trpc.list.getAll.useQuery();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) cancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const cancel = () => {
    setIsOpen(false);
    if (selectedList) setSelectedList(null);
  };

  const { mutateAsync: createList } = trpc.list.create.useMutation();
  const submit: SubmitHandler<ListFormInputs> = async (data) => {
    try {
      await createList(data);
      cancel();
      toast.success("New list created!");
      utils.list.getAll.invalidate();
    } catch (error) {
      if (error instanceof TRPCClientError<AppRouter> && error.message)
        toast.error(error.message);
      else toast.error("Something went wrong!");
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard
      .writeText(`${env.NEXT_PUBLIC_APP_URL}/list/${id}`)
      .then(() => toast.success("Copied link to clipboard!"))
      .catch(() => toast.error("Something went wrong!"));
  };

  const { mutateAsync: deleteList } = trpc.list.delete.useMutation();
  const handleDelete = async () => {
    try {
      await deleteList({ id: selectedList?.id as string });
      cancel();
      toast.success("List deleted!");
      utils.list.getAll.invalidate();
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <Head>
        <title>Lists</title>
      </Head>
      <Layout>
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="mb-2 text-xl font-semibold">
                <span className="select-none">📋 </span>Lists
              </h3>
              <p className="mb-2 ml-2 inline-block text-sm font-semibold text-gray-300">
                {lists.data?.length || 0} lists in total
              </p>
            </div>
            <button
              className="relative inline-flex cursor-pointer items-center rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none"
              onClick={() => setIsOpen(true)}
            >
              <PlusIcon className="-mb-0.5 mr-1 h-4 w-4" />
              New list
            </button>
          </div>
          <DialogWindow open={isOpen}>
            <Dialog.Title as="div" className="mb-4 flex text-xl font-semibold">
              {!selectedList ? (
                <>
                  <PlusCircleIcon className="-mb-0.5 mr-1 h-5 w-5 self-center text-violet-600" />
                  <h3>New list</h3>
                </>
              ) : (
                <>
                  <MinusCircleIcon className="-mb-0.5 mr-1 h-5 w-5 self-center text-red-700" />
                  <h3>Delete list</h3>
                </>
              )}
            </Dialog.Title>
            {!selectedList ? (
              <ListForm onCancel={cancel} onSubmit={submit} />
            ) : (
              <>
                <Dialog.Description>
                  <p className="mb-4">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">{selectedList.name}</span>?
                    This action cannot be undone.
                  </p>
                </Dialog.Description>
                <div>
                  <button
                    className="mr-4 cursor-pointer rounded-md border border-gray-600 py-1 px-4 focus:outline-none"
                    onClick={cancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="cursor-pointer rounded-md bg-red-700 py-1 px-4 hover:bg-red-800 focus:bg-red-800 focus:outline-none"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </DialogWindow>
          <div className="w-full">
            {lists.data?.map((list) => (
              <div
                key={list.id}
                className="flex w-full justify-between border-b border-gray-600 py-2 px-2 font-semibold"
              >
                <Link href={`/list/${list.id}`}>
                  <p>{list.name}</p>
                </Link>
                <div>
                  <button
                    disabled={!list.public}
                    className="mr-1 text-gray-300 disabled:cursor-not-allowed disabled:text-gray-600"
                    onClick={() => handleCopy(list.id)}
                  >
                    <ClipboardIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => {
                      setSelectedList({ id: list.id, name: list.name });
                      setIsOpen(true);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { redirectDestination, user } = await useAuth(context);
  if (redirectDestination)
    return {
      redirect: {
        destination: redirectDestination,
        permanent: false,
      },
    };

  return {
    props: { user },
  };
};

export default Lists;
