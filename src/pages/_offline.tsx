import Head from "next/head";

const Offline: React.FC = () => {
  return (
    <>
      <Head>
        <title>Offline</title>
      </Head>
      <div className="flex min-h-screen w-full items-center justify-center bg-neutral-900 py-12 text-white">
        <div className="w-11/12 rounded-md border border-gray-600 px-8 py-8 drop-shadow-md sm:w-2/3 md:w-1/3">
          <h3 className="mb-4 text-center text-xl font-semibold">
            Oops!<span className="select-none"> 😔</span>
          </h3>
          <p className="inline-block w-full text-center">
            It looks like you&apos;re offline.
          </p>
        </div>
      </div>
    </>
  );
};

export default Offline;
