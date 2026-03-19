import { LayoutDashboard, Plus, ClipboardList, AlertTriangle, Settings, LogOut, Shield, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'New Assessment', url: '/assessment/new', icon: Plus, highlight: true },
  { title: 'Assessment Register', url: '/register', icon: ClipboardList },
  { title: 'Fraud Intelligence', url: '/fraud-intelligence', icon: AlertTriangle },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleLabel = profile?.role
    ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Officer';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:bg-primary/30 transition-colors" />
            <div className="relative bg-gradient-to-br from-primary/20 to-accent/10 rounded-xl p-2 border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-extrabold tracking-tight text-foreground">CAM-IQ</span>
              <p className="text-[9px] uppercase tracking-[0.2em] text-primary/70 font-semibold leading-none">Credit Intelligence</p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'transition-all duration-200 rounded-lg h-11',
                        isActive && 'bg-primary/15 text-primary border-l-4 border-l-primary shadow-sm',
                        !isActive && 'hover:bg-secondary/80 border-l-4 border-l-transparent',
                        item.highlight && !isActive && 'text-primary'
                      )}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className={cn('h-[18px] w-[18px]', isActive ? 'text-primary' : 'text-muted-foreground')} />
                        {!collapsed && (
                          <>
                            <span className={cn('flex-1 text-sm font-medium', isActive && 'font-semibold')}>{item.title}</span>
                            {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary/60" />}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground shadow-lg">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">{roleLabel}</p>
            </div>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
