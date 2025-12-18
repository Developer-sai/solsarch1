export function Providers() {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-muted-foreground mb-10">
          LIVE PRICING INTELLIGENCE FOR
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
          <ProviderLogo name="AWS" color="text-aws" />
          <ProviderLogo name="Azure" color="text-azure" />
          <ProviderLogo name="GCP" color="text-gcp" />
          <ProviderLogo name="OCI" color="text-oci" />
        </div>
      </div>
    </section>
  );
}

function ProviderLogo({ name, color }: { name: string; color: string }) {
  return (
    <div className={`text-2xl md:text-3xl font-bold ${color} opacity-60 hover:opacity-100 transition-opacity`}>
      {name}
    </div>
  );
}
