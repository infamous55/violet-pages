import { useSession, signIn, signOut } from "next-auth/react";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";

const NavBar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <nav className="flex h-14 w-full items-center justify-between">
      <span className="text-lg font-semibold">Logo</span>
      {!sessionData ? (
        <button
          className="inline-block rounded-md border border-gray-600 bg-neutral-900 py-1 px-2 text-base"
          onClick={() =>
            signIn("google", {
              callbackUrl: `${window.location.origin}/dashboard`,
            })
          }
        >
          Sign in
        </button>
      ) : (
        <Menu as="div" className="relative inline-block">
          <Menu.Button>
            <div className="flex items-center hover:text-gray-300">
              <ChevronDownIcon className="mx-1 h-5 w-5" />
              <Image
                height={40}
                width={40}
                className="h-10 w-10 rounded-full"
                src={sessionData.user?.image as string}
                alt="profile-picture"
              />
            </div>
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 grid w-36 origin-top-right grid-cols-1 rounded-md border border-gray-600 bg-neutral-900 text-left text-base drop-shadow-md focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <Link
                  className={`inline-block w-full py-2 px-4 hover:bg-neutral-800 ${
                    active ? "bg-neutral-800" : null
                  }`}
                  href="#"
                >
                  Signed in as{" "}
                  <strong className="font-semibold">
                    {sessionData.user?.name?.slice(0, 10)}
                    {(sessionData.user?.name as string).length > 10 && "..."}
                  </strong>
                </Link>
              )}
            </Menu.Item>
            <div className="w-full border-t border-gray-600"></div>
            <Menu.Item>
              {({ active }) => (
                <Link
                  className={`inline-block py-2 px-4 hover:bg-neutral-800 ${
                    active ? "bg-neutral-800" : null
                  }`}
                  href="/dashboard"
                >
                  Dashboard
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  className={`inline-block py-2 px-4 hover:bg-neutral-800 ${
                    active ? "bg-neutral-800" : null
                  }`}
                  href="#"
                >
                  Lists
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  className={`inline-block py-2 px-4 hover:bg-neutral-800 ${
                    active ? "bg-neutral-800" : null
                  }`}
                  href="#"
                >
                  Settings
                </Link>
              )}
            </Menu.Item>
            <div className="w-full border-t border-gray-600"></div>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`inline-block py-2 px-4 text-left hover:bg-neutral-800 ${
                    active ? "bg-neutral-800" : null
                  }`}
                  onClick={() =>
                    signOut({
                      callbackUrl: `${window.location.origin}/`,
                    })
                  }
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )}
    </nav>
  );
};

export default NavBar;
