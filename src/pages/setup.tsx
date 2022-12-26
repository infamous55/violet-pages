import { useState } from "react";
import { type NextPage, type GetServerSideProps } from "next";
import authRequired from "../utils/auth-required";
import type User from "../types/user";
import { env } from "../env/client.mjs";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "../utils/trpc";
import { toast } from "react-hot-toast";

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
    formState,
  } = useForm<Inputs>({
    defaultValues: {
      name: user.name as string,
      description: user.description,
      image: user.image as string,
    },
    resolver: zodResolver(
      z.object({
        name: z
          .string()
          .min(1, { message: "Name is required." })
          .max(20, { message: "Name must be 20 characters or less." }),
        description: z.string(),
        image: z.string().url(),
      })
    ),
  });

  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    setError("image", { message: "" });
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
      } catch {
        setError("image", {
          message: "There was a problem uploading your file.",
        });
        return;
      }
    }
    try {
      await updateUser({ ...data, setupCompleted: true });
      setIsSuccess(true);
    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-black text-lg text-white">
        <div>
          {isSuccess ? (
            <p>Success</p>
          ) : (
            <div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <input
                  type="text"
                  {...register("name")}
                  disabled={formState.isSubmitting}
                />
                {errors.name?.message && <span>{errors.name?.message}</span>}
                <input
                  type="text"
                  {...register("description")}
                  disabled={formState.isSubmitting}
                />
                {errors.description?.message && (
                  <span>{errors.description?.message}</span>
                )}
                <input
                  type="file"
                  onChange={handleFileSelect}
                  disabled={formState.isSubmitting}
                />
                {errors.image?.message && <span>{errors.image?.message}</span>}
                <input
                  type="submit"
                  disabled={formState.isSubmitting}
                  value="Submit"
                />
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return await authRequired(context);
};

export default Setup;
