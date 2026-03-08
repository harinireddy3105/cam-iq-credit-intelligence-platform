import { LayoutDashboard, Plus, ClipboardList, AlertTriangle, Settings, LogOut, Shield } from 'lucide-react';
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
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="h-7 w-7 text-cam-processing shrink-0" />
          {!collapsed && (
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground">CAM-IQ</span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground leading-none">Credit Intelligence</p>
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
                        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
                        item.highlight && !isActive && 'text-cam-processing'
                      )}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-cam-processing">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{roleLabel}</p>
            </div>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
