import { type AppType } from "next/app";
import { useEffect } from "react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { trpc } from "~/utils/trpc";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import "~/styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { toasts } = useToasterStore();
  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= 3)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster position="bottom-right" reverseOrder={false} />
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
