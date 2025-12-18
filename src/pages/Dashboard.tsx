import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Plus, FolderOpen, LogOut, Sparkles, BarChart3, Cpu } from "lucide-react";

export default function Dashboard() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Cloud className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SolsArch</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to SolsArch</h1>
          <p className="text-muted-foreground">Design, compare, and optimize cloud architectures with AI</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="group hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">Generate Architecture</CardTitle>
              <CardDescription>Describe your requirements and get AI-generated architectures</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="group hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center text-info mb-2 group-hover:bg-info/20 transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">Compare Costs</CardTitle>
              <CardDescription>Side-by-side pricing across AWS, Azure, GCP, and OCI</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="group hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-2 group-hover:bg-accent/20 transition-colors">
                <Cpu className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">GPU Intelligence</CardTitle>
              <CardDescription>Compare GPU pricing per TFLOP across all providers</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Projects section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <Button variant="default" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Create your first project to start designing architectures</p>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
