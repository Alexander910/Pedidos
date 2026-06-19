import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-slate-900 text-white sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-semibold text-white/90 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-orange-500">ENVIOS-YA</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 font-bold">GT</span>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
