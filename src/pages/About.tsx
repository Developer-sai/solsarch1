import { Link } from "react-router-dom";
import { Cloud, Users, Target, Award, ArrowLeft, Sparkles, Globe, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      
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
            <Link to="/about" className="text-sm text-primary font-medium">About</Link>
            <Link to="/guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guide</Link>
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
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            About <span className="gradient-text">SolsArch</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            We're building the future of software architecture — powered by AI, designed for teams of all sizes.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                SolsArch democratizes software architecture expertise. We believe every team deserves access to world-class 
                architectural guidance, whether you're a solo developer or a Fortune 500 company.
              </p>
              <p className="text-muted-foreground">
                Our AI Solutions Architect combines decades of architectural best practices with real-time cloud pricing 
                intelligence to help you build better, faster, and more cost-effectively.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={<Users className="w-6 h-6" />} value="10,000+" label="Architectures Generated" />
              <StatCard icon={<Globe className="w-6 h-6" />} value="4" label="Cloud Providers" />
              <StatCard icon={<Sparkles className="w-6 h-6" />} value="AI" label="Powered Intelligence" />
              <StatCard icon={<Shield className="w-6 h-6" />} value="Enterprise" label="Grade Security" />
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <ValueCard 
              icon={<Target className="w-6 h-6" />}
              title="Excellence"
              description="We deliver production-ready architectures that meet the highest industry standards."
            />
            <ValueCard 
              icon={<Zap className="w-6 h-6" />}
              title="Innovation"
              description="We continuously evolve our AI to incorporate the latest architectural patterns and best practices."
            />
            <ValueCard 
              icon={<Award className="w-6 h-6" />}
              title="Trust"
              description="Your data and intellectual property are protected with enterprise-grade security."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 px-6 rounded-2xl bg-card/50 border border-border">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of developers and architects who trust SolsArch for their architecture needs.
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg">Get Started Free</Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
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

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border text-center">
      <div className="text-primary mb-2 flex justify-center">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}