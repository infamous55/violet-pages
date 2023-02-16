import { GetServerSideProps, NextPage } from "next";
import Layout from "../../components/Layout";
import isCUID from "../../utils/isCuid";
import useAuth from "../../utils/useAuth";
import { prisma } from "../../server/db/client";
import { type List, type Book } from "@prisma/client";
import Head from "next/head";
import { PencilIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import CustomSwitch from "../../components/CustomSwitch";
import { Switch } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

type ExtendedList = List & {
  books: Book[];
};

type Props = {
  list: ExtendedList;
  isAuthor: boolean;
};

// type Inputs = {
//   name: string;
//   description: string;
//   public: boolean;
// };

const List: NextPage<Props> = ({ list, isAuthor }) => {
  // const { control } = useForm<Inputs>({
  //   defaultValues: {
  //     name: list.name,
  //     description: list.description,
  //     public: list.public,
  //   },
  //   resolver: zodResolver(
  //     z.object({
  //       name: z
  //         .string()
  //         .min(1, { message: "List name is required." })
  //         .max(25, { message: "List name must be 25 characters or less." }),
  //       description: z.string(),
  //       public: z.boolean(),
  //     })
  //   ),
  // });

  return (
    <Layout>
      <Head>
        <title>{list.name}</title>
      </Head>
      <div>
        <div className="flex items-start justify-between">
          {/* <div className="inline-flex"> */}
          {/* {isAuthor && (
              <PencilSquareIcon className="mr-1 -mt-1.5 h-5 w-5 cursor-pointer self-center text-violet-600 hover:text-violet-700" />
            )} */}
          <h3 className="mb-2 text-xl font-semibold">{list.name}</h3>
          {/* </div> */}
          {/* {isAuthor && (
            <div>
              <Switch.Group as="div" className="mb-4 flex">
                <Switch.Label className="mr-2 font-medium" passive>
                  Public:
                </Switch.Label>
                <CustomSwitch name="public" control={control} />
              </Switch.Group>
            </div>
          )} */}
          {isAuthor && (
            <button className="relative inline-flex cursor-pointer items-center rounded-md border border-gray-600 bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none">
              <PencilSquareIcon className="-mb-0.5 mr-1 h-4 w-4" />
              Edit list
            </button>
          )}
        </div>
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
