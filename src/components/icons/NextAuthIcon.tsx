import Link from "next/link";
import Image from "next/image";

export default function NextAuthIcon() {
  return (
    <Link href="https://next-auth.js.org/" target="blank">
      <Image
        src="/nextauth.webp"
        className="select-none"
        height={40}
        width={32}
        alt="NextAuth.js"
      />
    </Link>
  );
}
