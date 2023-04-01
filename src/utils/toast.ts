import toast from "react-hot-toast";

const style = {
  border: "1px solid #4b5563",
  backgroundColor: "#171717",
  borderRadius: "0.375rem",
  color: "#fff",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
};

const error = (message: string) => {
  toast.error(message, {
    icon: "❌",
    style,
  });
};

const success = (message: string) => {
  toast.success(message, {
    icon: "✅",
    style,
  });
};

const loading = (message: string) => {
  return toast.loading(message, {
    style,
  });
};

const dismiss = (toastId: string) => {
  return toast.dismiss(toastId);
};

export default { error, success, loading, dismiss };
