import { Dialog } from "@headlessui/react";

const DialogWindow = ({
  open,
  children,
}: {
  open: boolean;
  children?: JSX.Element | JSX.Element[];
}) => (
  <Dialog as="div" className="relative z-20" open={open} onClose={() => null}>
    <div className="fixed inset-0 bg-black bg-opacity-50" />
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center">
        <div className="flex w-11/12 items-center justify-center py-4 md:w-8/12">
          <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-md border border-gray-600 bg-neutral-900 p-4 align-middle text-white drop-shadow-md">
            {children}
          </Dialog.Panel>
        </div>
      </div>
    </div>
  </Dialog>
);

export default DialogWindow;
