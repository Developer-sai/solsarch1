import { Link } from "react-router-dom";
import { Cloud, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is SolsArch?",
        a: "SolsArch is an AI-powered Solutions Architect that helps you design, plan, and optimize software architectures. Whether you're building a web app, mobile app, or complex cloud infrastructure, SolsArch provides expert-level guidance instantly."
      },
      {
        q: "Who is SolsArch for?",
        a: "SolsArch is designed for developers, tech leads, CTOs, startups, and enterprise teams. Anyone who needs to design software architecture can benefit from our AI-powered recommendations."
      },
      {
        q: "Is SolsArch free to use?",
        a: "SolsArch offers a free tier with limited features. For advanced capabilities like unlimited conversations, team collaboration, and priority support, we offer Pro and Enterprise plans."
      }
    ]
  },
  {
    category: "Features",
    questions: [
      {
        q: "What types of architectures can SolsArch design?",
        a: "SolsArch can design web applications, mobile apps, APIs, microservices, cloud infrastructure, data pipelines, AI/ML systems, and more. Our AI understands modern architectural patterns across all major frameworks and cloud providers."
      },
      {
        q: "Does SolsArch support multi-cloud architectures?",
        a: "Yes! SolsArch provides real-time cost comparisons across AWS, Azure, Google Cloud Platform (GCP), and Oracle Cloud Infrastructure (OCI). You can design cloud-agnostic or provider-specific architectures."
      },
      {
        q: "Can I upload my existing requirements or documents?",
        a: "Absolutely. You can upload requirements documents, existing architecture diagrams, cloud bills, and other files. SolsArch will analyze them and provide tailored recommendations."
      },
      {
        q: "Does SolsArch generate diagrams?",
        a: "Yes, SolsArch automatically generates professional architecture diagrams using Mermaid syntax. These can be exported and shared with your team."
      }
    ]
  },
  {
    category: "Security & Privacy",
    questions: [
      {
        q: "Is my data secure?",
        a: "Yes. We use enterprise-grade encryption for all data at rest and in transit. Your conversations and architecture designs are private and accessible only to you and your team members."
      },
      {
        q: "Do you store my conversation history?",
        a: "Yes, we store your conversations securely so you can continue where you left off. You can delete your conversation history at any time from your account settings."
      },
      {
        q: "Is SolsArch SOC 2 compliant?",
        a: "We are currently pursuing SOC 2 Type II certification. Enterprise customers can request our security documentation and compliance reports."
      }
    ]
  },
  {
    category: "Technical",
    questions: [
      {
        q: "What AI model powers SolsArch?",
        a: "SolsArch uses state-of-the-art large language models fine-tuned for software architecture. We continuously update our models with the latest architectural patterns and best practices."
      },
      {
        q: "Can I integrate SolsArch with my existing tools?",
        a: "Enterprise plans include API access for integrating SolsArch into your existing workflows, CI/CD pipelines, and development tools."
      },
      {
        q: "How accurate are the cost estimates?",
        a: "Cost estimates are based on current public pricing from cloud providers. Actual costs may vary based on your specific usage patterns, reserved instances, and negotiated discounts."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      
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
            <Link to="/guide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Guide</Link>
            <Link to="/faq" className="text-sm text-primary font-medium">FAQ</Link>
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
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about SolsArch
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-xl font-semibold mb-4">{section.category}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.questions.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${section.category}-${index}`}
                      className="bg-card/50 border border-border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16 p-8 rounded-2xl bg-card/50 border border-border">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">Can't find the answer you're looking for? We're here to help.</p>
            <Link to="/contact">
              <Button variant="hero">Contact Support</Button>
            </Link>
          </div>
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