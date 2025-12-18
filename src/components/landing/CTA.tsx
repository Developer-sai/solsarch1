import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function CTA() {
  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/30" />
      
      <div className="container relative mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 md:p-16 rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-info/20" />
            <div className="absolute inset-0 border border-primary/20 rounded-3xl" />
            
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-primary/30 blur-[80px]" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Ready to Optimize Your Cloud?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of engineers and architects who trust SolsArch to design, compare, and optimize cloud architectures with real pricing intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="xl">
                  <Link to="/auth">
                    Start Free Today
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link to="/auth">Schedule Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
