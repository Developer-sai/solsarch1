import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, ArrowLeft, MessageSquare, Trash2, Clock, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function ChatHistory() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setConversations(conversations.filter(c => c.id !== id));
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setDeleting(null);
    }
  };

  const handleContinue = (id: string) => {
    navigate(`/?mode=chat&conversation=${id}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-[128px] pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Cloud className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SolsArch</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Chat History</h1>
              <p className="text-muted-foreground">Your saved architecture conversations</p>
            </div>
            <Link to="/?mode=chat">
              <Button variant="hero" className="gap-2">
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </Link>
          </div>

          {conversations.length === 0 ? (
            <Card className="bg-card/50 border-dashed">
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                <p className="text-muted-foreground mb-4">Start a new chat with the AI architect</p>
                <Link to="/?mode=chat">
                  <Button variant="hero">
                    <Plus className="w-4 h-4 mr-2" />
                    Start New Chat
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id} 
                  className="bg-card/50 hover:bg-card/80 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{conversation.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleContinue(conversation.id)}
                        >
                          Continue
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(conversation.id)}
                          disabled={deleting === conversation.id}
                        >
                          {deleting === conversation.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}