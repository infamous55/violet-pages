import { useSession, signIn, signOut } from "next-auth/react";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const NavBar: React.FC = () => {
  const { data: sessionData } = useSession();
  const { register, handleSubmit } = useForm<{ query: string }>({
    resolver: zodResolver(z.object({ query: z.string() })),
  });

  const searchRef = useRef<HTMLInputElement | null>();
  const { ref, ...rest } = register("query");
  useEffect(() => {
    const element = searchRef.current as HTMLInputElement;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSubmit(onSubmit)();
        element.value = "";
      }
    };
    element?.addEventListener("keydown", handler);
    return () => element?.removeEventListener("keydown", handler);
  });

  const router = useRouter();
  const onSubmit: SubmitHandler<{ query: string }> = (data) => {
    if (data.query.trim()) router.push(`/search?query=${data.query}`);
  };

  const [isHighlighted, setIsHighlighted] = useState(false);

  return (
    <nav className="flex h-14 w-full items-center justify-between">
      {sessionData ? (
        <input
          type="text"
          className="w-42 block rounded-sm border border-gray-600 bg-neutral-900 py-1 px-2 text-sm text-white focus:border-violet-600 focus:outline-none"
          placeholder="Search for a book..."
          autoComplete="off"
          {...rest}
          ref={(e) => {
            ref(e);
            searchRef.current = e;
          }}
        />
      ) : (
        <span className="mr-2 text-lg font-semibold">Logo</span>
      )}
      {!sessionData ? (
        <button
          className="flex rounded-md border border-gray-600 bg-neutral-900 py-1 px-2 text-base"
          onClick={() =>
            signIn("google", {
              callbackUrl: `${window.location.origin}/dashboard`,
            })
          }
        >
          <FontAwesomeIcon
            icon={faGoogle}
            className="mr-2 h-4 w-4 self-center text-violet-600"
          />
          Sign in
        </button>
      ) : (
        <Menu as="div" className="relative inline-block">
          <Menu.Button
            className="focus:outline-none"
            onFocus={() => setIsHighlighted(true)}
            onBlur={() => setIsHighlighted(false)}
          >
            <div
              className={`flex items-center hover:text-gray-300 ${
                isHighlighted ? "text-gray-300" : null
              }`}
            >
              <ChevronDownIcon className="mx-1 h-5 w-5" />
              <Image
                height={40}
                width={40}
                className="h-10 w-10 rounded-full"
                src={sessionData.user.image}
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
                  href={`/users/${sessionData.user?.id}`}
                >
                  Signed in as{" "}
                  <strong className="font-semibold">
                    {sessionData.user.name.slice(0, 10)}
                    {sessionData.user.name.length > 10 && "..."}
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
                  href="/lists"
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
                  href="/settings"
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
