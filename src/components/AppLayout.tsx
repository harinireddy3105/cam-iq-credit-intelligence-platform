import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AIChatbot } from './AIChatbot';
import { Bell, Search } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 bg-card/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
            </div>
            <div className="text-xs font-mono text-muted-foreground/60 hidden sm:block tracking-wide">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary/50">
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground flex items-center justify-center shadow-sm shadow-destructive/30">3</span>
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-grid-pattern">
            {children}
          </main>
        </div>
      </div>
      <AIChatbot />
    </SidebarProvider>
  );
}
