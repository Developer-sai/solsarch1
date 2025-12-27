import { EnhancedGPUDashboard } from "@/components/app/EnhancedGPUDashboard";

export default function AppGPU() {
  return (
    <div className="h-full overflow-auto">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">GPU Intelligence</h1>
          <p className="text-muted-foreground">
            Compare GPU pricing across AWS, Azure, GCP, and OCI with TFLOPS/$ analysis
          </p>
        </div>
        
        <EnhancedGPUDashboard />
      </div>
    </div>
  );
}
