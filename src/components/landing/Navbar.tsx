import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Cloud, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Cloud className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SolsArch</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#docs">Docs</NavLink>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild variant="default">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
            <NavLink href="#features" mobile>Features</NavLink>
            <NavLink href="#pricing" mobile>Pricing</NavLink>
            <NavLink href="#docs" mobile>Docs</NavLink>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button asChild variant="outline" className="w-full">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="default" className="w-full">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  children,
  mobile,
}: {
  href: string;
  children: React.ReactNode;
  mobile?: boolean;
}) {
  return (
    <a
      href={href}
      className={`text-muted-foreground hover:text-foreground transition-colors ${
        mobile ? "text-base py-2" : "text-sm font-medium"
      }`}
    >
      {children}
    </a>
  );
}
