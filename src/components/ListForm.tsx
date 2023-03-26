import { type SubmitHandler, useForm } from "react-hook-form";
import { Switch } from "@headlessui/react";
import CustomSwitch from "./CustomSwitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type ListFormInputs from "../types/list-form-inputs";

const ListForm = ({
  defaultValues,
  onSubmit,
  onCancel: handleCancel,
}: {
  defaultValues?: ListFormInputs;
  onSubmit: SubmitHandler<ListFormInputs>;
  onCancel: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    formState,
    reset,
    control,
  } = useForm<ListFormInputs>({
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      public: false,
    },
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

  const thereAreErrors = () => {
    if (errors.description || errors.public || errors.name) return true;
    return false;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <label className="mb-2 block font-medium" htmlFor="name">
          Name:
        </label>
        <input
          className={`mb-2 block w-full rounded-sm border border-gray-600 bg-gray-700 py-1 px-2 text-white focus:border-violet-600 focus:outline-none disabled:text-gray-300 ${
            errors.name ? "border-red-500" : null
          }`}
          type="text"
          {...register("name")}
          disabled={formState.isSubmitting}
        />
        <p className="text-sm text-red-500">{errors.name?.message}</p>
      </div>
      <div className="mb-4">
        <label className="mb-2 block font-medium" htmlFor="description">
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
        <p className="text-sm text-red-500">{errors.description?.message}</p>
      </div>
      <Switch.Group as="div" className="mb-4 flex">
        <Switch.Label className="mr-4 font-medium" passive>
          Public:
        </Switch.Label>
        <CustomSwitch<ListFormInputs> name="public" control={control} />
      </Switch.Group>
      <div>
        <input
          type="submit"
          className="mr-4 cursor-pointer rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none active:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-700 disabled:text-gray-300"
          disabled={formState.isSubmitting || thereAreErrors()}
          value="Submit"
        />
        <button
          className="cursor-pointer rounded-md border border-gray-600 py-1 px-4 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-300"
          disabled={formState.isSubmitting}
          onClick={() => {
            handleCancel();
            reset();
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ListForm;
