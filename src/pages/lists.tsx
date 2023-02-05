import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Layout from "../components/Layout";
import useAuth from "../utils/useAuth";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Dialog, Switch } from "@headlessui/react";
import { useState } from "react";
import {
  type UseControllerProps,
  SubmitHandler,
  useController,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "../utils/trpc";
import toast from "../utils/toast";
import { TRPCClientError } from "@trpc/client";
import { AppRouter } from "../server/trpc/router/_app";

const CustomSwitch = (props: UseControllerProps<Inputs>) => {
  const {
    field: { value, onChange },
    formState: { isSubmitting },
  } = useController(props);

  return (
    <>
      <Switch
        checked={Boolean(value)}
        onChange={onChange}
        disabled={isSubmitting}
        className={`relative	inline-flex h-5 w-10 flex-shrink-0 cursor-pointer self-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          value ? "bg-violet-700" : "bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
            isSubmitting ? "bg-gray-300" : "bg-white"
          } ${value ? "translate-x-5" : "translate-x-0"}`}
        />
      </Switch>
    </>
  );
};

type Inputs = {
  name: string;
  description: string;
  public: boolean;
};

const Lists: NextPage = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
              <h3 className="mb-2 text-xl font-semibold">📋 Lists</h3>
              <p>
                <span className="text-gray-300">Total number of lists:</span> 3
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
                    <Dialog.Title className="mb-4 text-xl font-semibold">
                      📋 New list
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
                        <CustomSwitch name="public" control={control} />
                      </Switch.Group>
                      <div>
                        <input
                          type="submit"
                          className="mr-4 cursor-pointer rounded-md border border-gray-600 bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:outline-none active:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-700 disabled:text-gray-300"
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
