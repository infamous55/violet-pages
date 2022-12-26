import { useSession, signIn, signOut } from "next-auth/react";

const NavBar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <nav className="flex h-14 w-full items-center justify-between">
      <span>Logo</span>
      <div className="flex">
        <p className="mr-4">{sessionData?.user?.name}</p>
        <button
          className="inline-block"
          onClick={
            sessionData
              ? () =>
                  signOut({
                    callbackUrl: `${window.location.origin}/`,
                  })
              : () =>
                  signIn("google", {
                    callbackUrl: `${window.location.origin}/dashboard`,
                  })
          }
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
