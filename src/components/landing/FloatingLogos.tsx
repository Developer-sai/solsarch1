import { useEffect, useState } from 'react';

// Cloud provider SVG logos as components
const AWSLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <rect width="80" height="80" rx="16" fill="hsl(var(--aws) / 0.1)" />
    <path d="M24 46c0 1.2.4 2.3 1.2 3.2s1.9 1.5 3.2 1.8l.6-2.4c-.8-.2-1.4-.5-1.9-1s-.7-1-.7-1.6c0-.5.2-.9.5-1.3.3-.4.8-.6 1.4-.6.7 0 1.2.2 1.6.7.4.5.6 1.1.6 1.8h2.4c0-1.3-.4-2.5-1.2-3.4-.8-.9-1.9-1.4-3.4-1.4-1.3 0-2.4.4-3.2 1.2-.8.8-1.2 1.8-1.2 3zM38 50h2.4l.6-2.4h4l.6 2.4H48l-3.6-12h-2.8l-3.6 12zm3.6-4.8l1.4-5.6 1.4 5.6h-2.8zM51 50h2.4l2-6 2 6H60l3.6-12h-2.4l-2.4 8.4-2.4-8.4h-2l-2.4 8.4-2.4-8.4H47L51 50z" fill="hsl(var(--aws))" />
    <path d="M20 55c5.3 2.7 12 4 20 4s14.7-1.3 20-4" stroke="hsl(var(--aws))" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M53 52l7 3-7 3" stroke="hsl(var(--aws))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const AzureLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <rect width="80" height="80" rx="16" fill="hsl(var(--azure) / 0.1)" />
    <path d="M25 56l15-42h7l-18 42H25z" fill="hsl(var(--azure))" />
    <path d="M30 56l23-32h10L30 56z" fill="url(#azure-gradient)" />
    <defs>
      <linearGradient id="azure-gradient" x1="30" y1="40" x2="63" y2="40">
        <stop stopColor="hsl(var(--azure))" />
        <stop offset="1" stopColor="hsl(205 100% 65%)" />
      </linearGradient>
    </defs>
  </svg>
);

const GCPLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <rect width="80" height="80" rx="16" fill="hsl(var(--gcp) / 0.1)" />
    <path d="M48.4 27.6L52.8 23.2L53.2 21.6L44.4 20C42.8 19.6 41.2 19.4 39.6 19.4C32 19.4 25.2 24 22.4 30.8L24 31.6L32.8 30C32.8 30 33.6 28.8 34.4 28C37.2 26 40.8 25.2 44 26.4L48.4 27.6Z" fill="#EA4335"/>
    <path d="M57.6 31.2C56.4 27.6 54 24.4 50.8 22.4L44 29.2C46.8 30.4 48.8 32.8 49.2 35.6L49.6 40H56.4C56.8 36.8 57.6 33.6 57.6 31.2Z" fill="#4285F4"/>
    <path d="M23.6 40C23.6 42.8 24.4 45.6 25.6 48L32.4 41.2C31.6 40 31.2 38.4 31.2 36.8L24 32C23.6 34.4 23.6 37.2 23.6 40Z" fill="#FBBC05"/>
    <path d="M40 48.8C36.8 48.8 34 47.2 32.4 44.8L25.6 51.6C28.8 56 34 58.8 40 58.8C44 58.8 47.6 57.6 50.4 55.6L43.6 48.4C42.4 48.8 41.2 48.8 40 48.8Z" fill="#34A853"/>
    <path d="M56.4 40H49.6C49.6 43.6 47.6 46.8 44.4 48.4L51.2 55.2C55.2 52 57.6 46.8 57.6 40.8L56.4 40Z" fill="#4285F4"/>
  </svg>
);

const OCILogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 80 80" className={className} fill="none">
    <rect width="80" height="80" rx="16" fill="hsl(var(--oci) / 0.1)" />
    <path d="M40 20C29 20 20 29 20 40C20 51 29 60 40 60C51 60 60 51 60 40C60 29 51 20 40 20ZM40 52C33.4 52 28 46.6 28 40C28 33.4 33.4 28 40 28C46.6 28 52 33.4 52 40C52 46.6 46.6 52 40 52Z" fill="hsl(var(--oci))" />
  </svg>
);

// Service icons
const ServiceIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, JSX.Element> = {
    compute: (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <rect width="40" height="40" rx="8" fill="hsl(var(--primary) / 0.15)" />
        <rect x="10" y="10" width="20" height="20" rx="2" stroke="hsl(var(--primary))" strokeWidth="2" />
        <rect x="14" y="14" width="12" height="12" rx="1" fill="hsl(var(--primary) / 0.3)" />
        <circle cx="20" cy="20" r="3" fill="hsl(var(--primary))" />
      </svg>
    ),
    database: (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <rect width="40" height="40" rx="8" fill="hsl(var(--info) / 0.15)" />
        <ellipse cx="20" cy="13" rx="10" ry="4" stroke="hsl(var(--info))" strokeWidth="2" />
        <path d="M10 13v14c0 2.2 4.5 4 10 4s10-1.8 10-4V13" stroke="hsl(var(--info))" strokeWidth="2" />
        <path d="M10 20c0 2.2 4.5 4 10 4s10-1.8 10-4" stroke="hsl(var(--info))" strokeWidth="2" />
      </svg>
    ),
    storage: (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <rect width="40" height="40" rx="8" fill="hsl(var(--success) / 0.15)" />
        <rect x="8" y="10" width="24" height="6" rx="1" stroke="hsl(var(--success))" strokeWidth="2" />
        <rect x="8" y="17" width="24" height="6" rx="1" stroke="hsl(var(--success))" strokeWidth="2" />
        <rect x="8" y="24" width="24" height="6" rx="1" stroke="hsl(var(--success))" strokeWidth="2" />
        <circle cx="12" cy="13" r="1" fill="hsl(var(--success))" />
        <circle cx="12" cy="20" r="1" fill="hsl(var(--success))" />
        <circle cx="12" cy="27" r="1" fill="hsl(var(--success))" />
      </svg>
    ),
    network: (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <rect width="40" height="40" rx="8" fill="hsl(var(--accent) / 0.15)" />
        <circle cx="20" cy="20" r="4" stroke="hsl(var(--accent))" strokeWidth="2" />
        <circle cx="10" cy="12" r="3" stroke="hsl(var(--accent))" strokeWidth="1.5" />
        <circle cx="30" cy="12" r="3" stroke="hsl(var(--accent))" strokeWidth="1.5" />
        <circle cx="10" cy="28" r="3" stroke="hsl(var(--accent))" strokeWidth="1.5" />
        <circle cx="30" cy="28" r="3" stroke="hsl(var(--accent))" strokeWidth="1.5" />
        <path d="M13 14l4 4m6-4l-4 4m-6 6l4-4m10 4l-4-4" stroke="hsl(var(--accent))" strokeWidth="1.5" />
      </svg>
    ),
    kubernetes: (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <rect width="40" height="40" rx="8" fill="hsl(var(--warning) / 0.15)" />
        <path d="M20 8l10 6v12l-10 6-10-6V14l10-6z" stroke="hsl(var(--warning))" strokeWidth="2" />
        <circle cx="20" cy="20" r="4" fill="hsl(var(--warning) / 0.3)" stroke="hsl(var(--warning))" strokeWidth="1.5" />
        <path d="M20 12v4m0 8v4m-6.9-12l3.5 2m6.8 4l3.5 2m-13.8 0l3.5-2m6.8-4l3.5-2" stroke="hsl(var(--warning))" strokeWidth="1.5" />
      </svg>
    ),
    lambda: (
      <svg viewBox="0 0 40 40" className={className} fill="none">
        <rect width="40" height="40" rx="8" fill="hsl(var(--destructive) / 0.15)" />
        <path d="M12 28l8-16 4 8 4-8" stroke="hsl(var(--destructive))" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[type] || icons.compute;
};

interface FloatingElement {
  id: number;
  type: 'aws' | 'azure' | 'gcp' | 'oci' | 'compute' | 'database' | 'storage' | 'network' | 'kubernetes' | 'lambda';
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const generateFloatingElements = (): FloatingElement[] => {
  const elements: FloatingElement[] = [
    // Cloud provider logos - larger and more prominent
    { id: 1, type: 'aws', x: 5, y: 15, size: 64, delay: 0, duration: 20 },
    { id: 2, type: 'azure', x: 85, y: 25, size: 56, delay: 2, duration: 22 },
    { id: 3, type: 'gcp', x: 10, y: 70, size: 52, delay: 4, duration: 18 },
    { id: 4, type: 'oci', x: 90, y: 65, size: 48, delay: 1, duration: 24 },
    // Service icons - smaller and scattered
    { id: 5, type: 'compute', x: 20, y: 40, size: 36, delay: 3, duration: 25 },
    { id: 6, type: 'database', x: 75, y: 45, size: 32, delay: 5, duration: 21 },
    { id: 7, type: 'storage', x: 15, y: 85, size: 28, delay: 2, duration: 23 },
    { id: 8, type: 'network', x: 80, y: 80, size: 32, delay: 4, duration: 19 },
    { id: 9, type: 'kubernetes', x: 30, y: 20, size: 28, delay: 1, duration: 26 },
    { id: 10, type: 'lambda', x: 70, y: 15, size: 28, delay: 3, duration: 20 },
    // More scattered elements
    { id: 11, type: 'aws', x: 50, y: 5, size: 40, delay: 6, duration: 22 },
    { id: 12, type: 'gcp', x: 95, y: 45, size: 36, delay: 2, duration: 24 },
    { id: 13, type: 'compute', x: 3, y: 50, size: 24, delay: 4, duration: 21 },
    { id: 14, type: 'database', x: 45, y: 90, size: 28, delay: 1, duration: 23 },
  ];
  return elements;
};

export function FloatingLogos() {
  const [elements] = useState<FloatingElement[]>(generateFloatingElements);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const renderElement = (el: FloatingElement) => {
    const style: React.CSSProperties = {
      width: el.size,
      height: el.size,
      left: `${el.x}%`,
      top: `${el.y}%`,
      animationDelay: `${el.delay}s`,
      animationDuration: `${el.duration}s`,
      transform: `translate(${mousePos.x * (el.size / 80)}px, ${mousePos.y * (el.size / 80)}px)`,
    };

    const className = "w-full h-full transition-transform duration-300";

    switch (el.type) {
      case 'aws':
        return <AWSLogo className={className} />;
      case 'azure':
        return <AzureLogo className={className} />;
      case 'gcp':
        return <GCPLogo className={className} />;
      case 'oci':
        return <OCILogo className={className} />;
      default:
        return <ServiceIcon type={el.type} className={className} />;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute animate-float-drift opacity-40 hover:opacity-70 transition-opacity"
          style={{
            width: el.size,
            height: el.size,
            left: `${el.x}%`,
            top: `${el.y}%`,
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
            transform: `translate(${mousePos.x * (el.size / 100)}px, ${mousePos.y * (el.size / 100)}px)`,
          }}
        >
          {renderElement(el)}
        </div>
      ))}
    </div>
  );
}

// Compact horizontal logo strip for sections
export function LogoStrip() {
  return (
    <div className="flex items-center justify-center gap-8 py-8">
      <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <AWSLogo className="w-10 h-10" />
        <span className="text-sm font-medium text-muted-foreground">AWS</span>
      </div>
      <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <AzureLogo className="w-10 h-10" />
        <span className="text-sm font-medium text-muted-foreground">Azure</span>
      </div>
      <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <GCPLogo className="w-10 h-10" />
        <span className="text-sm font-medium text-muted-foreground">GCP</span>
      </div>
      <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
        <OCILogo className="w-10 h-10" />
        <span className="text-sm font-medium text-muted-foreground">OCI</span>
      </div>
    </div>
  );
}