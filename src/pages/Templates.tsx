import { useState } from "react";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const Templates = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Sample templates data
    const templates = [
        {
            id: "1",
            title: "E-Commerce Platform",
            description: "Complete multi-cloud e-commerce architecture with auto-scaling and CDN",
            category: "E-Commerce",
            difficulty_level: "intermediate",
            estimated_cost_monthly: 850,
            tags: ["AWS", "Azure", "Kubernetes", "Redis"],
            highlights: [
                "Auto-scaling infrastructure",
                "Global CDN distribution",
                "PCI-DSS compliant",
            ],
        },
        {
            id: "2",
            title: "AI/ML Training Pipeline",
            description: "GPU-optimized architecture for machine learning model training",
            category: "AI/ML",
            difficulty_level: "advanced",
            estimated_cost_monthly: 2400,
            tags: ["GCP", "GPU", "TensorFlow", "Kubernetes"],
            highlights: [
                "GPU cluster management",
                "Distributed training support",
                "Model versioning",
            ],
        },
        {
            id: "3",
            title: "Serverless Web App",
            description: "Cost-effective serverless architecture for web applications",
            category: "Web Application",
            difficulty_level: "beginner",
            estimated_cost_monthly: 120,
            tags: ["AWS Lambda", "DynamoDB", "CloudFront"],
            highlights: [
                "Pay-per-use pricing",
                "Auto-scaling by default",
                "Low maintenance",
            ],
        },
        {
            id: "4",
            title: "Healthcare Data Platform",
            description: "HIPAA-compliant healthcare data processing and storage",
            category: "Healthcare",
            difficulty_level: "advanced",
            estimated_cost_monthly: 1800,
            tags: ["AWS", "HIPAA", "Encryption", "Audit"],
            highlights: [
                "HIPAA compliance built-in",
                "End-to-end encryption",
                "Comprehensive audit logging",
            ],
        },
        {
            id: "5",
            title: "IoT Data Pipeline",
            description: "Real-time IoT data ingestion and processing architecture",
            category: "IoT",
            difficulty_level: "intermediate",
            estimated_cost_monthly: 950,
            tags: ["Azure", "IoT Hub", "Stream Analytics"],
            highlights: [
                "Real-time data processing",
                "Device management",
                "Time-series analytics",
            ],
        },
        {
            id: "6",
            title: "Multi-Region SaaS",
            description: "Global SaaS platform with multi-region deployment",
            category: "SaaS",
            difficulty_level: "advanced",
            estimated_cost_monthly: 3200,
            tags: ["Multi-Cloud", "Global", "HA"],
            highlights: [
                "Active-active multi-region",
                "Global load balancing",
                "99.99% uptime SLA",
            ],
        },
    ];

    const categories = ["all", "E-Commerce", "AI/ML", "Web Application", "Healthcare", "IoT", "SaaS"];

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleUseTemplate = (templateId: string) => {
        console.log("Using template:", templateId);
        // TODO: Navigate to architecture generation with template
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                            Architecture Templates
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Start with pre-built, production-ready architecture templates for common use cases
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category === "all" ? "All Categories" : category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {filteredTemplates.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onUse={handleUseTemplate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No templates found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Templates;
