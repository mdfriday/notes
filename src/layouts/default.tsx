import { Link } from "@nextui-org/link";
import IntegratedNavbar from "@/components/integrated-navbar";

interface DefaultLayoutProps {
  children: React.ReactNode;
  markdown?: string;
}

export default function DefaultLayout({
  children,
  markdown = "",
}: DefaultLayoutProps) {
  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
      <IntegratedNavbar markdown={markdown} />
      <main className="w-full flex-grow overflow-hidden">
        {children}
      </main>
      <footer className="w-full bg-white border-t border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-2 flex justify-end items-center">
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://mdfriday.com"
            title="MDFriday"
          >
            <span className="text-default-600 text-sm">Made by</span>
            <p className="text-primary text-sm font-medium">MDFriday</p>
          </Link>
        </div>
      </footer>
    </div>
  );
}
