import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";
import { BreakingNewsTicker } from "@/components/homepage";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <BreakingNewsTicker />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
