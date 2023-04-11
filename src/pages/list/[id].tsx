import type { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import isCUID from "../../utils/isCuid";
import useAuth from "../../utils/useAuth";
import { prisma } from "../../server/db/client";
import type { List, Book, Author } from "@prisma/client";
import Head from "next/head";
import {
  PencilSquareIcon,
  EllipsisHorizontalCircleIcon,
} from "@heroicons/react/20/solid";
import type { SubmitHandler } from "react-hook-form";
import { useEffect, useState } from "react";
import DialogWindow from "../../components/DialogWindow";
import { Dialog } from "@headlessui/react";
import ListForm from "../../components/ListForm";
import type ListFormInputs from "../../types/list-form-inputs";
import { trpc } from "../../utils/trpc";
import toast from "../../utils/toast";
import { useRouter } from "next/router";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

type ExtendedBook = Book & {
  authors: Author[];
};

type ExtendedList = List & {
  books: ExtendedBook[];
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
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const [books, setBooks] = useState(list.books);

  const { mutateAsync } = trpc.book.removeFromList.useMutation();
  const handleDelete = async (bookId: string) => {
    try {
      const updatedList = await mutateAsync({ bookId, listId: list.id });
      console.log(updatedList);
      setBooks(updatedList.books);
      toast.success("Removed book!");
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
        <div className="mb-2 flex flex-col-reverse flex-wrap items-start justify-between md:flex-row">
          <div className="w-full md:w-3/5">
            <h3 className="mb-2 max-w-full break-words text-xl font-semibold">
              {list.name}
            </h3>
            <p className="mb-2 inline-block text-sm font-semibold text-gray-300">
              {books.length} books in total
            </p>
            <p>{list.description}</p>
          </div>
          {isAuthor && (
            <button
              className="mb-2 inline-flex cursor-pointer items-center self-end rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none md:self-auto"
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
        <div className="mt-4"></div>
        <div>
          {books.map((book, index) => (
            <div
              key={book.googleId}
              className="flex w-full flex-wrap justify-between border-b border-gray-600 font-semibold"
            >
              <Link
                href={`/book/${book.googleId}`}
                className={`py-2 pl-2 ${
                  isAuthor ? "w-fit" : "w-full hover:bg-neutral-800"
                }`}
              >
                <h3 className="break-words">{book.title}</h3>
                <h5 className="text-sm text-gray-300">{book.subtitle}</h5>
                <p className="text-sm italic">
                  <span className="not-italic text-gray-300">by</span>{" "}
                  {!book.authors?.length
                    ? "Unknown"
                    : book.authors.map(
                        (author, index) =>
                          `${author.name}${
                            index !== (book.authors?.length as number) - 1
                              ? ", "
                              : ""
                          }`
                      )}
                </p>
                <p className="text-sm text-gray-300">
                  {book.publishedDate.getFullYear().toString()} edition
                </p>
              </Link>
              {isAuthor && (
                <button
                  className="mr-2 text-red-500"
                  onClick={() => handleDelete(book.googleId)}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
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
    include: { books: { include: { authors: true } } },
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
