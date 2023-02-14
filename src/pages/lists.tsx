import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Layout from "../components/Layout";
import useAuth from "../utils/useAuth";
import { PlusIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { Dialog, Switch } from "@headlessui/react";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "../utils/trpc";
import toast from "../utils/toast";
import { TRPCClientError } from "@trpc/client";
import { AppRouter } from "../server/trpc/router/_app";
import Link from "next/link";
import CustomSwitch from "../components/CustomSwitch";
import { PlusCircleIcon } from "@heroicons/react/20/solid";

type Inputs = {
  name: string;
  description: string;
  public: boolean;
};

const Lists: NextPage = () => {
  const utils = trpc.useContext();
  const lists = trpc.list.getAll.useQuery();

  const [focus, setFocus] = useState<string>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) cancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
    reset,
    control,
  } = useForm<Inputs>({
    defaultValues: { name: "", description: "", public: false },
    resolver: zodResolver(
      z.object({
        name: z
          .string()
          .min(1, { message: "List name is required." })
          .max(25, { message: "List name must be 25 characters or less." }),
        description: z.string(),
        public: z.boolean(),
      })
    ),
  });

  const cancel = () => {
    setIsOpen(false);
    reset();
  };

  const { mutateAsync: createList } = trpc.list.create.useMutation();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
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

  const thereAreErrors = () => {
    if (errors.description || errors.public || errors.name) return true;
    return false;
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
              className="relative inline-flex cursor-pointer items-center rounded-md border border-gray-600 bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none"
              onClick={() => setIsOpen(true)}
            >
              <PlusIcon className="-mb-0.5 mr-1 h-4 w-4" />
              New list
            </button>
          </div>
          <Dialog
            as="div"
            className="relative z-20"
            open={isOpen}
            onClose={() => null}
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center">
                <div className="flex w-11/12 items-center justify-center py-4 md:w-8/12">
                  <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-md border border-gray-600 bg-neutral-900 p-4 align-middle text-white drop-shadow-md">
                    <Dialog.Title
                      as="div"
                      className="mb-4 flex text-xl font-semibold"
                    >
                      <PlusCircleIcon className="-mb-0.5 mr-1 h-5 w-5 self-center text-violet-600" />
                      <h3>New list</h3>
                    </Dialog.Title>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-4">
                        <label
                          className="mb-2 block font-medium"
                          htmlFor="name"
                        >
                          Name:
                        </label>
                        <input
                          className={`mb-2 block w-full rounded-sm border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:border-violet-500 focus:outline-none disabled:text-gray-300 ${
                            errors.name ? "border-red-500" : null
                          }`}
                          type="text"
                          {...register("name")}
                          disabled={formState.isSubmitting}
                        />
                        <p className="text-sm text-red-500">
                          {errors.name?.message && errors.name?.message}
                        </p>
                      </div>
                      <div className="mb-4">
                        <label
                          className="mb-2 block font-medium"
                          htmlFor="description"
                        >
                          Description (optional):
                        </label>
                        <input
                          type="text"
                          className={`mb-2 block w-full rounded-sm border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:border-violet-500 focus:outline-none disabled:text-gray-300 ${
                            errors.description ? "border-red-500" : null
                          }`}
                          {...register("description")}
                          disabled={formState.isSubmitting}
                        />
                        <p className="text-sm text-red-500">
                          {errors.description?.message &&
                            errors.description?.message}
                        </p>
                      </div>
                      <Switch.Group as="div" className="mb-4 flex">
                        <Switch.Label className="mr-4 font-medium" passive>
                          Public:
                        </Switch.Label>
                        <CustomSwitch<Inputs> name="public" control={control} />
                      </Switch.Group>
                      <div>
                        <input
                          type="submit"
                          className="mr-4 cursor-pointer rounded-md border border-gray-600 bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none active:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-700 disabled:text-gray-300"
                          disabled={formState.isSubmitting || thereAreErrors()}
                          value="Submit"
                        />
                        <button
                          className="cursor-pointer rounded-md border border-gray-600 py-1 px-4 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-300"
                          disabled={formState.isSubmitting}
                          onClick={cancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </div>
              </div>
            </div>
          </Dialog>
          <div className="w-full">
            {lists.data?.map((list, index) => (
              <Link
                href={`/list/${list.id}`}
                className="focus:outline-none"
                onFocus={() => setFocus(list.id)}
                onBlur={() => setFocus("")}
              >
                <div
                  key={list.id}
                  className={`flex w-full justify-between rounded-md py-2 px-2 font-semibold hover:bg-neutral-800 focus:bg-neutral-800 focus:outline-none ${
                    focus === list.id ? "bg-neutral-800" : null
                  }`}
                  tabIndex={index + 1}
                >
                  <p>{list.name}</p>
                  {/* <button>
                    <ClipboardIcon className="h-4 w-4 text-gray-300" />
                  </button> */}
                </div>
                <div
                  className="border-t border-gray-600"
                  onMouseOver={() => setFocus(list.id)}
                  onMouseLeave={() => setFocus("")}
                ></div>
              </Link>
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
