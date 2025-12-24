import { Link } from "react-router-dom";
import { Cloud, ArrowLeft, BookOpen, MessageSquare, ListChecks, Sparkles, FileUp, Mic, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    step: 1,
    title: "Create an Account",
    description: "Sign up for free to get started with SolsArch. Your conversations and architectures will be saved securely.",
    icon: <Cloud className="w-6 h-6" />
  },
  {
    step: 2,
    title: "Choose Your Mode",
    description: "Use the AI Chat for conversational architecture design, or the Guided Wizard for a structured step-by-step approach.",
    icon: <MessageSquare className="w-6 h-6" />
  },
  {
    step: 3,
    title: "Describe Your Needs",
    description: "Tell SolsArch about your project. Be as detailed or as vague as you like — the AI will ask clarifying questions.",
    icon: <ListChecks className="w-6 h-6" />
  },
  {
    step: 4,
    title: "Review & Iterate",
    description: "SolsArch generates architecture recommendations with diagrams and cost estimates. Ask follow-up questions to refine.",
    icon: <Sparkles className="w-6 h-6" />
  }
];

const features = [
  {
    title: "File Upload",
    description: "Upload requirements documents, existing architecture diagrams, or cloud bills for analysis.",
    icon: <FileUp className="w-5 h-5" />
  },
  {
    title: "Voice Input",
    description: "Speak your requirements naturally using voice input for faster interaction.",
    icon: <Mic className="w-5 h-5" />
  },
  {
    title: "Export Designs",
    description: "Export your architecture as PDF, PNG, or Mermaid code for documentation.",
    icon: <Download className="w-5 h-5" />
  },
  {
    title: "Share & Collaborate",
    description: "Share your architecture designs with team members for feedback.",
    icon: <Share2 className="w-5 h-5" />
  }
];

const tips = [
  "Be specific about your scale requirements (users, requests per second, data size)",
  "Mention your budget constraints upfront for cost-optimized recommendations",
  "Share any compliance requirements (HIPAA, SOC 2, GDPR) early in the conversation",
  "Ask for trade-off comparisons between different approaches",
  "Request diagrams to visualize complex architectures",
  "Upload existing cloud bills for optimization suggestions"
];

export default function Guide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      
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
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/guide" className="text-sm text-primary font-medium">Guide</Link>
            <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </nav>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            How to Use <span className="gradient-text">SolsArch</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Get the most out of your AI Solutions Architect with this comprehensive guide.
          </p>
        </div>

        {/* Getting Started Steps */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Getting Started</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <Card key={step.step} className="bg-card/50 border-border relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10">
                  {step.step}
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <div key={feature.title} className="p-6 rounded-xl bg-card/50 border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Tips */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Pro Tips</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-card/50 border border-border rounded-xl p-6">
              <ul className="space-y-4">
                {tips.map((tip, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Example Prompts */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 text-center">Example Prompts</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <ExamplePrompt 
              category="Web App"
              prompt="I need to build a SaaS platform for project management with real-time collaboration. Expecting 10,000 users, budget around $5,000/month."
            />
            <ExamplePrompt 
              category="Mobile App"
              prompt="Design the backend for a food delivery app with real-time order tracking, supporting 100,000 daily orders."
            />
            <ExamplePrompt 
              category="AI/ML"
              prompt="I want to deploy a RAG-based chatbot using our company documents. Need low latency and high availability."
            />
            <ExamplePrompt 
              category="Migration"
              prompt="Help me migrate our monolithic Node.js app to microservices on Kubernetes with minimal downtime."
            />
          </div>
        </section>

        {/* CTA */}
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-info/10 border border-primary/20">
          <h3 className="text-2xl font-bold mb-4">Ready to start building?</h3>
          <p className="text-muted-foreground mb-6">Put these tips into practice with SolsArch.</p>
          <Link to="/dashboard">
            <Button variant="hero" size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Start Designing
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8 mt-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <span className="font-semibold">SolsArch</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/guide" className="hover:text-foreground transition-colors">Guide</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 SolsArch. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ExamplePrompt({ category, prompt }: { category: string; prompt: string }) {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border">
      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
        {category}
      </span>
      <p className="mt-3 text-sm text-muted-foreground italic">"{prompt}"</p>
    </div>
  );
}