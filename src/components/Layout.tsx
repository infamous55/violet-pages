import Head from "next/head";
import NavBar from "./NavBar";

type Props = {
  children?: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen w-full bg-black text-lg text-white">
        <div className="m-auto w-8/12">
          <NavBar />
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;