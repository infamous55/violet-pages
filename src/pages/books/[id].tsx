import type { GetServerSideProps, NextPage } from "next";
import Layout from "~/components/Layout";
import { env } from "~/env/server.mjs";
import type { BookData } from "~/types/google-api-data";
import { PlusCircleIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState, useRef, useEffect } from "react";
import { trpc } from "~/utils/trpc";
import { PlusIcon } from "@heroicons/react/20/solid";
import DialogWindow from "~/components/DialogWindow";
import { Dialog } from "@headlessui/react";
import withAuth from "~/utils/withAuth";
import toast from "~/utils/toast";
import type ListSelectItem from "~/types/list-select-item";
import MultiSelect from "~/components/MultiSelect";
import Head from "next/head";
import Link from "next/link";

const Book: NextPage<{ book: BookData }> = ({ book }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) cancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState(book.volumeInfo.description);
  const [showDescription, setShowDescription] = useState(false);
  const [isFirst, setIsFirst] = useState(true);

  const { isFetching: isFetchingDescription, refetch: fetchDescription } =
    trpc.book.getDescription.useQuery(
      { id: book.id, description: description as string },
      {
        enabled: false,
        onSuccess: (data) => {
          setDescription(data);
        },
      }
    );

  const handleShowDescription = async () => {
    if (isFetchingDescription) return;
    if (isFirst && description) {
      const toastId = toast.loading("Loading description!");
      try {
        await fetchDescription();
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

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  useEffect(() => {
    const element = descriptionRef.current as HTMLDivElement | null;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.code === "Space") {
        event.preventDefault();
        handleShowDescription();
      }
    };
    element?.addEventListener("keydown", handler);
    return () => element?.removeEventListener("keydown", handler);
  });

  const [lists, setLists] = useState<ListSelectItem[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  const updateListData = (data: ListSelectItem[]) => {
    setLists(data);
    setSelectedLists(
      data
        .map((list) => list.hasBook && list.id)
        .filter((value) => typeof value === "string") as string[]
    );
  };

  const { refetch: fetchLists } = trpc.book.getLists.useQuery(
    { id: book.id },
    {
      // enabled: false,
      onSuccess: (data) => {
        updateListData(data);
      },
    }
  );

  useEffect(() => {
    fetchLists();
  }, []);

  const { mutateAsync, isLoading } = trpc.book.addToLists.useMutation();
  const handleSave = async () => {
    try {
      const data = await mutateAsync({
        id: book.id,
        selectedLists,
      });
      setIsOpen(false);
      toast.success("Added book!");
      updateListData(data);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const cancel = () => {
    setIsOpen(false);
    fetchLists();
  };

  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Head>
        <title>{book.volumeInfo.title}</title>
      </Head>
      <Layout>
        <div className="flex flex-col-reverse flex-wrap items-start justify-between md:flex-row">
          <div className="w-full md:w-3/5">
            <h3 className="mb-2 text-xl font-semibold">
              {book.volumeInfo.title}
            </h3>
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
                        index !==
                        (book.volumeInfo.authors?.length as number) - 1
                          ? ", "
                          : ""
                      }`
                  )}
            </p>

            {book.volumeInfo.description && (
              <div
                className="mb-2 w-fit max-w-full rounded-sm border border-gray-600 bg-neutral-900 py-1 px-2 focus:outline-none"
                tabIndex={1}
                onFocus={() => setIsHighlighted(true)}
                onBlur={() => setIsHighlighted(false)}
                ref={descriptionRef}
              >
                <div
                  className="flex w-fit cursor-pointer"
                  onClick={handleShowDescription}
                  onMouseEnter={() => setIsHighlighted(true)}
                  onMouseLeave={() => setIsHighlighted(false)}
                >
                  <p>Description</p>
                  <ChevronDownIcon
                    className={`mx-1 mt-1 h-5 w-5 ${
                      isHighlighted ? "text-gray-300" : null
                    }`}
                  />
                </div>
                {showDescription && <p>{description}</p>}
              </div>
            )}
            <p className="text-gray-300">
              {book.volumeInfo.pageCount} pages · published{" "}
              {new Date(book.volumeInfo.publishedDate).toLocaleDateString()}
            </p>
          </div>
          <button
            className="mb-2 inline-flex cursor-pointer items-center self-end rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none md:self-auto"
            onClick={() => setIsOpen(true)}
          >
            <PlusIcon className="-mb-0.5 mr-1 h-4 w-4" />
            Add book
          </button>
        </div>
        <DialogWindow open={isOpen} initialFocus={cancelRef}>
          <Dialog.Title as="div" className="mb-4 flex text-xl font-semibold">
            <PlusCircleIcon className="-mb-0.5 mr-1 h-5 w-5 self-center text-violet-600" />{" "}
            Add book
          </Dialog.Title>
          <>
            {!lists.length && (
              <h3 className="font-semibold text-gray-300">
                You don&apos;t have any lists. Try creating a new one first.
              </h3>
            )}
            <MultiSelect
              options={lists.map((list) => ({
                value: list.id,
                label: list.name,
              }))}
              selected={selectedLists}
              setSelected={setSelectedLists}
              className="mb-4"
            />
          </>
          <div>
            <button
              className=" mr-4 w-20 cursor-pointer rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none active:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-700 disabled:text-gray-300"
              onClick={handleSave}
              disabled={!lists.length || isLoading}
              tabIndex={lists.length + 1}
            >
              Save
            </button>
            <button
              className="cursor-pointer rounded-md border border-gray-600 py-1 px-4 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-300"
              onClick={cancel}
              tabIndex={lists.length + 2}
              ref={cancelRef}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </DialogWindow>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { redirectDestination } = await withAuth(context);
  if (redirectDestination)
    return {
      redirect: {
        destination: redirectDestination,
        permanent: false,
      },
    };

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
