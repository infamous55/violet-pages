import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import NextIcon from "~/components/icons/NextIcon";
import PrismaIcon from "~/components/icons/PrismaIcon";
import TailwindIcon from "~/components/icons/TailwindIcon";
import TRPCIcon from "../components/icons/TRPCIcon";
import TypeScriptIcon from "~/components/icons/TypeScriptIcon";
import NextAuthIcon from "~/components/icons/NextAuthIcon";
import Link from "next/link";

const Home: NextPage = () => {
  const router = useRouter();
  const { status } = useSession();

  const handleSignIn = () => {
    if (status === "authenticated") router.push("/dashboard");
    else
      signIn("google", {
        callbackUrl: `${window.location.origin}/dashboard`,
      });
  };

  return (
    <>
      <Head>
        <title>Violet Pages</title>
      </Head>
      <div className="min-h-screen w-full bg-neutral-900 text-white">
        <div className="mb-4 flex w-full items-center justify-center border-b border-gray-600">
          <div className="w-11/12 md:w-8/12">
            <nav className="flex h-14 w-full items-center justify-between">
              {/* <span className="mr-2 text-lg font-semibold">Logo</span> */}
              <Image
                src="/favicon.png"
                alt="logo"
                height={40}
                width={40}
                className="h-10 w-10 select-none"
              />
              <button
                className="flex rounded-md border border-gray-600 bg-neutral-900 py-1 px-2 text-base focus:border-violet-600 focus:outline-none"
                onClick={handleSignIn}
              >
                <FontAwesomeIcon
                  icon={faGoogle}
                  className="mr-2 h-4 w-4 self-center text-violet-600"
                />
                Sign in
              </button>
            </nav>
          </div>
        </div>
        <div className="m-auto flex w-11/12 flex-col overflow-x-hidden pb-12 md:w-8/12">
          <div className="my-4 flex min-h-[24rem] w-full flex-col items-center justify-center text-center">
            <Image
              src="/favicon.png"
              alt="logo"
              width={80}
              height={80}
              className="mb-2 h-20 w-20 select-none rounded-full"
            />
            <h3 className="mb-2 text-2xl font-semibold">Violet Pages</h3>
            <p className="mb-4 text-lg">
              A minimalist app to manage your readings!
            </p>
            <button
              className="cursor-pointer rounded-md bg-violet-600 py-1 px-4 hover:bg-violet-700 focus:bg-violet-700 focus:outline-none"
              onClick={() =>
                signIn("google", {
                  callbackUrl: `${window.location.origin}/dashboard`,
                })
              }
            >
              Get started
            </button>
          </div>
          <div className="flex w-full flex-col items-center justify-between border-t border-gray-600 py-12 md:flex-row">
            <div className="mb-8 flex w-full flex-col text-center md:mb-0 md:max-w-[40%] md:text-left">
              <h3 className="mb-2 text-xl font-semibold text-gray-300">
                Organize Books Into Lists.
              </h3>
              <p>
                With Violet Pages you can effortlessly create private or public
                lists and add books to them, allowing you to easily organize
                your readings and share them with others.
              </p>
            </div>
            <Image
              src="/lists-screenshot.png"
              width={475}
              height={250}
              alt="screnshot"
              className="w-full rounded-sm border border-gray-600 md:max-w-[50%]"
            />
          </div>
          <div className="grid w-full grid-cols-1 place-items-center gap-12 border-t border-gray-600 py-12 text-center md:grid-cols-3 md:text-left">
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-300">
                Open Source.
              </h3>
              <p>
                The application source code is available on GitHub for anyone to
                access and contribute to.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-300">
                Keyboard Accessible.
              </h3>
              <p>
                Violet Pages offers an intuitive keyboard interface for
                efficient navigation.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-semibold text-gray-300">
                Progressive Web App.
              </h3>
              <p>
                Use the application from any device, without the need to
                download anything.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col-reverse items-center justify-between border-t border-gray-600 py-12 md:flex-row">
            <Image
              src="/description-diagram.png"
              width={475}
              height={250}
              alt="screnshot"
              className="w-full rounded-sm border border-gray-600 md:max-w-[50%]"
            />
            <div className="mb-8 flex w-full flex-col text-center md:mb-0 md:max-w-[40%] md:text-left">
              <h3 className="mb-2 text-xl font-semibold text-gray-300">
                Useful Descriptions.
              </h3>
              <p>
                The book descriptions are retrieved from the Google Books API.
                To ensure consistency, ChatGPT corrects and formats the data
                before caching it in a Serverless Redis Database.
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center justify-center rounded-sm border-t border-gray-600 py-12">
            <h3 className="mb-4 text-xl font-semibold text-gray-300">
              Made with the{" "}
              <Link
                href="https://create.t3.gg/"
                target="blank"
                className="text-white"
              >
                T3 Stack
              </Link>
            </h3>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
              <NextIcon />
              <TypeScriptIcon />
              <PrismaIcon />
              <TailwindIcon />
              <TRPCIcon />
              <NextAuthIcon />
            </div>
            <p className="font-semibold text-gray-300">
              by{" "}
              <Link
                href="https://github.com/infamous55/"
                target="blank"
                className="text-white"
              >
                infamous55
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
