import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href="/"
            className="inline-flex items-center mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
