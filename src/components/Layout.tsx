import Head from "next/head";
import NavBar from "./NavBar";

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full bg-neutral-900 text-white">
        <div className="m-auto flex min-h-screen w-11/12 flex-col pb-12 md:w-8/12">
          <NavBar />
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
