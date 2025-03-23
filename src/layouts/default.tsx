import { Link } from "@nextui-org/link";

import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      <Navbar />
      <main className="container mx-auto max-w-8xl px-2 flex-grow pt-2 md:pt-8">
        {children}
      </main>
      <footer className="w-full flex items-center justify-center py-8">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://mdfriday.com"
          title="MDFriday"
        >
          <span className="text-default-600">Made by</span>
          <p className="text-primary">MDFriday</p>
        </Link>
      </footer>
    </div>
  );
}
