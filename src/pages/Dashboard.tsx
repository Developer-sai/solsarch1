import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, LogOut, Sparkles, MessageSquare, ListChecks, Layout, Globe, Smartphone, Server, Palette, Database, Layers, User, History, HelpCircle, BookOpen, Mail } from "lucide-react";

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

  const handleNewChat = () => {
    navigate("/?mode=chat");
  };

  const handleNewWizard = () => {
    navigate("/?mode=wizard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-info/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Cloud className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SolsArch</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">History</Link>
            <Link to="/guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guide</Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to SolsArch</h1>
          <p className="text-muted-foreground">AI-powered Solutions Architect for any application</p>
        </div>

        {/* Quick actions - Main CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
          <Card 
            className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer bg-card/80 backdrop-blur-sm"
            onClick={handleNewChat}
          >
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-info/20 flex items-center justify-center text-primary mb-4 group-hover:from-primary/30 group-hover:to-info/30 transition-colors">
                <MessageSquare className="w-7 h-7" />
              </div>
              <CardTitle className="text-xl">Chat with AI Architect</CardTitle>
              <CardDescription className="text-base">
                Describe your idea in natural language. The AI will help you design, plan, and architect your solution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">Voice Input</span>
                <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">File Upload</span>
                <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">Diagrams</span>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer bg-card/80 backdrop-blur-sm"
            onClick={handleNewWizard}
          >
            <CardHeader className="pb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-info/20 to-accent/20 flex items-center justify-center text-info mb-4 group-hover:from-info/30 group-hover:to-accent/30 transition-colors">
                <ListChecks className="w-7 h-7" />
              </div>
              <CardTitle className="text-xl">Guided Wizard</CardTitle>
              <CardDescription className="text-base">
                Step-by-step questionnaire to gather your requirements. Perfect for structured planning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">Step by Step</span>
                <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">Cost Comparison</span>
                <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">Export</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What can SolsArch do */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">What can SolsArch architect?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CapabilityCard icon={<Globe className="w-5 h-5" />} title="Web Applications" />
            <CapabilityCard icon={<Smartphone className="w-5 h-5" />} title="Mobile Apps" />
            <CapabilityCard icon={<Server className="w-5 h-5" />} title="Cloud Infrastructure" />
            <CapabilityCard icon={<Database className="w-5 h-5" />} title="Data Pipelines" />
            <CapabilityCard icon={<Layers className="w-5 h-5" />} title="Microservices" />
            <CapabilityCard icon={<Sparkles className="w-5 h-5" />} title="AI/ML Systems" />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/history">
              <Button variant="outline" size="sm" className="gap-2">
                <History className="w-4 h-4" />
                Chat History
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </Button>
            </Link>
            <Link to="/guide">
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Guide
              </Button>
            </Link>
            <Link to="/faq">
              <Button variant="outline" size="sm" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                FAQ
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="w-4 h-4" />
                Contact
              </Button>
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard 
            icon={<Layout className="w-5 h-5" />}
            title="Architecture Diagrams"
            description="Auto-generated Mermaid diagrams for any system"
          />
          <FeatureCard 
            icon={<Globe className="w-5 h-5" />}
            title="Multi-Cloud Support"
            description="Compare AWS, Azure, GCP, OCI pricing"
          />
          <FeatureCard 
            icon={<Palette className="w-5 h-5" />}
            title="Best Practices"
            description="Industry-standard patterns and security"
          />
          <FeatureCard 
            icon={<Database className="w-5 h-5" />}
            title="Tech Stack Selection"
            description="AI-recommended technologies for your needs"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-6 mt-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <span className="font-semibold">SolsArch</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 SolsArch</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CapabilityCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all">
      <div className="text-primary">{icon}</div>
      <span className="text-sm text-center text-muted-foreground">{title}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/50">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}