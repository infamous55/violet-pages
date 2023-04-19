import Head from "next/head";
import NavBar from "./NavBar";

type Props = {
  children?: React.ReactNode | React.ReactNode[];
};

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white">
      <div className="mb-4 flex w-full items-center justify-center border-b border-gray-600">
        <div className="z-10 w-11/12 md:w-8/12">
          <NavBar />
        </div>
      </div>
      <div className="m-auto flex w-11/12 flex-col overflow-x-hidden pb-12 md:w-8/12">
        {children}
      </div>
    </div>
  );
};

export default Layout;
