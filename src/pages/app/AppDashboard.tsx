import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ListChecks, Globe, Smartphone, Server, Database, Layers, Sparkles, Layout, Palette } from "lucide-react";

export default function AppDashboard() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to SolsArch</h1>
          <p className="text-muted-foreground">AI-powered Solutions Architect for any application</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
          <Card className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card/80">
            <Link to="/app/chat">
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
            </Link>
          </Card>
          
          <Card className="group hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card/80">
            <Link to="/app/wizard">
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
            </Link>
          </Card>
        </div>

        {/* Capabilities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">What can SolsArch architect?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CapabilityCard icon={<Globe className="w-5 h-5" />} title="Web Apps" />
            <CapabilityCard icon={<Smartphone className="w-5 h-5" />} title="Mobile Apps" />
            <CapabilityCard icon={<Server className="w-5 h-5" />} title="Cloud Infra" />
            <CapabilityCard icon={<Database className="w-5 h-5" />} title="Data Pipelines" />
            <CapabilityCard icon={<Layers className="w-5 h-5" />} title="Microservices" />
            <CapabilityCard icon={<Sparkles className="w-5 h-5" />} title="AI/ML Systems" />
          </div>
        </div>

        {/* Features */}
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
      </div>
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
