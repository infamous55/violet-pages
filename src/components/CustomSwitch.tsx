import { Switch } from "@headlessui/react";
import {
  FieldValues,
  useController,
  UseControllerProps,
} from "react-hook-form";

const CustomSwitch = <Inputs extends FieldValues>(
  props: UseControllerProps<Inputs>
): JSX.Element => {
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
        className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer self-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:border-violet-600 focus:outline-none ${
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

export default CustomSwitch;
