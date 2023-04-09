import { faCheckSquare, faSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Dispatch, SetStateAction } from "react";

type Option = {
  value: string;
  label: string;
};

const MultiSelect = ({
  options,
  selected,
  setSelected,
  ...rest
}: {
  options: Option[];
  selected: string[];
  setSelected: Dispatch<SetStateAction<string[]>>;
  [key: string]: any;
}) => {
  const toggleOption = (value: string) => {
    const updatedSelectedValues = selected.includes(value)
      ? selected.filter((selected) => selected !== value)
      : [...selected, value];
    setSelected(updatedSelectedValues);
  };

  return (
    <div {...rest}>
      {options.map((option, index) => {
        return (
          <p
            key={option.value}
            onClick={() => toggleOption(option.value)}
            tabIndex={index + 1}
            className="flex w-fit cursor-pointer items-center font-medium hover:text-gray-300  focus:text-gray-300 focus:outline-none"
            onKeyDown={(event) => {
              if (event.key === " ") toggleOption(option.value);
            }}
          >
            {selected.includes(option.value) ? (
              <FontAwesomeIcon
                icon={faCheckSquare}
                className="mr-2 h-4 w-4 align-middle text-violet-600"
              />
            ) : (
              <FontAwesomeIcon
                icon={faSquare}
                className="mr-2 h-4 w-4 align-middle text-white"
              />
            )}
            <span>{option.label}</span>
          </p>
        );
      })}
    </div>
  );
};

export default MultiSelect;
