import { type GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import Layout from "../components/Layout";
import useAuth from "../utils/useAuth";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { useState } from "react";

const Lists: NextPage = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

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
              className="relative inline-flex cursor-pointer items-center rounded-md border border-gray-600 bg-violet-500 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none"
              onClick={() => setIsOpen(true)}
            >
              {/* <PlusIcon className="-mb-0.5 mr-1 h-4 w-4" /> */}
              New list
            </button>
          </div>
          <Dialog
            as="div"
            className="relative z-20"
            open={isOpen}
            onClose={() => setIsOpen(false)}
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center">
                <div className="flex w-11/12 items-center justify-center py-4 md:w-8/12">
                  <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-md border border-gray-600 bg-gray-700 p-4 align-middle text-white drop-shadow-md">
                    <Dialog.Title>Title</Dialog.Title>
                    <Dialog.Description>Description</Dialog.Description>
                    <button onClick={() => setIsOpen(false)}>Cancel</button>
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
