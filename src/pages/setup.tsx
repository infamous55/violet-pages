import { useState } from "react";
import { type NextPage, type GetServerSideProps } from "next";
import useAuth from "~/utils/useAuth";
import type User from "~/types/user";
import { env } from "~/env/client.mjs";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/utils/trpc";
import toast from "~/utils/toast";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";

type Inputs = {
  name: string;
  description: string;
  image: string;
};

const Setup: NextPage<{ user: User }> = ({ user }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    formState,
  } = useForm<Inputs>({
    defaultValues: {
      name: user.name,
      description: user.description,
      image: user.image,
    },
    resolver: zodResolver(
      z.object({
        name: z
          .string()
          .min(1, { message: "Username is required." })
          .max(13, { message: "Username must be 13 characters or less." }),
        description: z.string(),
        image: z.string().url(),
      })
    ),
  });

  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    clearErrors("image");
    if (file && file.size) {
      if (file.type.indexOf("image") === -1)
        setError("image", { message: "Only images are allowed." });
      else if (file.size / 1024 > 5120)
        setError("image", { message: "Maximum file size is 5MB." });
      else setSelectedFile(file);
    }
  };

  const { mutateAsync: getPresignedUrl } =
    trpc.user.getPresignedUrl.useMutation();
  const { mutateAsync: updateUser } = trpc.user.update.useMutation();
  const router = useRouter();

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (selectedFile) {
      try {
        const { url, key } = await getPresignedUrl();
        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": selectedFile.type },
          body: selectedFile,
        });
        data.image = `${env.NEXT_PUBLIC_BUCKET_URL}/${key}`;
        // const body = new FormData();
        // body.append("file", selectedFile);
        // await fetch("/api/upload-profile-picture", { method: "POST", body });
      } catch {
        setError("image", {
          message: "",
        });
        toast.error("Couldn't upload your file.");
        return;
      }
    }
    try {
      await updateUser({ ...data, setupCompleted: true });
      setIsSuccess(true);
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  const thereAreErrors = () => {
    if (errors.description || errors.image || errors.name) return true;
    return false;
  };

  return (
    <>
      <Head>
        <title>Account Setup</title>
      </Head>
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-900 py-12 text-white">
        <div className="w-11/12 rounded-md border border-gray-600 px-8 py-8 drop-shadow-md sm:w-2/3 md:w-1/3">
          {!isSuccess ? (
            <>
              <h3 className="mb-4 text-xl font-semibold">
                Welcome!<span className="select-none"> 🎉</span>
              </h3>
              <p className="mb-4">
                It looks like you're new to this app. Please set up your account
                by filling in the following details:
              </p>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label className="mb-2 block font-medium" htmlFor="name">
                    Username (required):
                  </label>
                  <input
                    className={`mb-2 block w-full rounded-sm border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:border-violet-600 focus:outline-none disabled:text-gray-300 ${
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
                    className={`mb-2 block w-full rounded-sm border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:border-violet-600 focus:outline-none disabled:text-gray-300 ${
                      errors.description ? "border-red-500" : null
                    }`}
                    {...register("description")}
                    disabled={formState.isSubmitting}
                  />
                  <p className="text-sm text-red-500">
                    {errors.description?.message && errors.description?.message}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="mb-2 block font-medium" htmlFor="file">
                    Profile image (optional):
                  </label>
                  <input
                    type="file"
                    className={`mb-2 block w-full cursor-pointer rounded-sm border border-gray-600 bg-gray-700 py-1 px-2 text-white file:mr-4 file:border-0 file:border-r file:border-gray-200 file:bg-gray-700 file:pr-2 file:text-white focus:border-violet-600 focus:outline-none disabled:text-gray-300 ${
                      errors.image ? "border-red-500" : null
                    }`}
                    onChange={handleFileSelect}
                    disabled={formState.isSubmitting}
                  />
                  <p className="text-sm text-red-500">
                    {errors.image?.message && errors.image?.message}
                  </p>
                </div>
                <input
                  type="submit"
                  className="cursor-pointer rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:outline-none active:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-700 disabled:text-gray-300"
                  disabled={formState.isSubmitting || thereAreErrors()}
                  value="Submit"
                />
              </form>
            </>
          ) : (
            <>
              <h3 className="mb-4 text-center text-xl font-semibold">
                Setup completed!<span className="select-none"> 🤗</span>
              </h3>
              <Link
                href="/dashboard"
                className="inline-block w-full text-center"
              >
                Click here if you are not redirected within a few seconds.
              </Link>
            </>
          )}
        </div>
      </div>
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

export default Setup;
