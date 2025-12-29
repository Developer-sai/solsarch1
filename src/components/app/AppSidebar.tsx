import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "@/components/NavLink";
import { formatDistanceToNow } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  MessageSquare, 
  ListChecks, 
  History, 
  User, 
  HelpCircle, 
  BookOpen, 
  Mail,
  Info,
  Plus,
  Loader2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const mainNavItems = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "New Chat", url: "/app/chat", icon: MessageSquare },
  { title: "Wizard", url: "/app/wizard", icon: ListChecks },
];

const resourceItems = [
  { title: "Guide", url: "/guide", icon: BookOpen },
  { title: "FAQ", url: "/faq", icon: HelpCircle },
  { title: "About", url: "/about", icon: Info },
  { title: "Contact", url: "/contact", icon: Mail },
];

import { Settings } from "lucide-react";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success("Conversation deleted");
      
      // If we're viewing this conversation, go to new chat
      if (location.pathname === `/app/chat/${id}`) {
        navigate("/app/chat");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-card/50">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} className="flex items-center gap-2" activeClassName="bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Conversations */}
        {!collapsed && (
          <SidebarGroup className="flex-1">
            <SidebarGroupLabel className="flex items-center justify-between">
              <span>Recent Chats</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-5 w-5"
                onClick={() => navigate("/app/chat")}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-[200px]">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : conversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2 py-4">No conversations yet</p>
                ) : (
                  <SidebarMenu>
                    {conversations.map((conv) => (
                      <SidebarMenuItem key={conv.id}>
                        <SidebarMenuButton 
                          asChild
                          isActive={location.pathname === `/app/chat/${conv.id}`}
                          className="group pr-1"
                        >
                          <Link to={`/app/chat/${conv.id}`} className="flex items-center justify-between w-full">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleDeleteConversation(e, conv.id)}
                              disabled={deletingId === conv.id}
                            >
                              {deletingId === conv.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              )}
                            </Button>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                )}
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className="flex items-center gap-2" activeClassName="bg-primary/10 text-primary">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <NavLink to="/app/settings" className="flex items-center gap-2" activeClassName="bg-primary/10 text-primary">
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile">
              <NavLink to="/app/profile" className="flex items-center gap-2" activeClassName="bg-primary/10 text-primary">
                <User className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Profile</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
