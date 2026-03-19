import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AIChatbot } from './AIChatbot';
import { Bell } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border/40 px-5 bg-card/90 backdrop-blur-xl shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
            </div>
            <div className="text-xs font-medium text-muted-foreground hidden sm:block tracking-wide">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2.5 rounded-xl hover:bg-secondary">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center shadow-sm">3</span>
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-5 md:p-6 bg-grid-pattern">
            {children}
          </main>
        </div>
      </div>
      <AIChatbot />
    </SidebarProvider>
  );
}
