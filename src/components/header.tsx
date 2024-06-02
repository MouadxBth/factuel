import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";

export function Header() {
  return (
    <nav className="relative z-10 border-b py-2 bg-background ">
      <div className="items-center container justify-between flex">
        <Link href="/" className="flex gap-2 items-center text-xl text-black">
          <Image
            src="/logo.png"
            width={115}
            height={115}
            className="h-auto w-full"
            alt="file drive logo"
          />
        </Link>

        <div className="flex gap-2">
          <OrganizationSwitcher />
          <UserButton />
        </div>

        <ModeToggle />
      </div>
    </nav>
  );
}
