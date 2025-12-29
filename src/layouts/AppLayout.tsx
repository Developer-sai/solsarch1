import { useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { OrgSwitcher } from "@/components/app/OrgSwitcher";
import { Button } from "@/components/ui/button";
import { Cloud, LogOut, Loader2 } from "lucide-react";

export default function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const { organizations, loading: orgLoading } = useOrganization();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/sign-in");
    }
  }, [user, loading, navigate]);

  // Redirect to create org if user has no organizations
  useEffect(() => {
    if (!loading && !orgLoading && user && organizations.length === 0) {
      navigate("/app/create-org");
    }
  }, [loading, orgLoading, user, organizations, navigate]);

  if (loading || orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 border-b border-border bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                  <Cloud className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold hidden sm:inline">SolsArch</span>
              </Link>
              <div className="hidden sm:block h-4 w-px bg-border mx-2" />
              <OrgSwitcher />
            </div>
            
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </header>
          
          {/* Main content */}
          <main className="flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
