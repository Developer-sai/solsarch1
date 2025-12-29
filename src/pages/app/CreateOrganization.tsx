import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { createOrganization, switchOrganization } = useOrganization();
  
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSlugChange = (value: string) => {
    setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter an organization name");
      return;
    }
    
    if (!slug.trim()) {
      toast.error("Please enter a URL slug");
      return;
    }

    setCreating(true);
    const { data, error } = await createOrganization(name, slug);
    setCreating(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Organization created successfully!");
    
    if (data) {
      switchOrganization(data.id);
    }
    
    navigate("/app");
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Create Your Organization</CardTitle>
          <CardDescription>
            Set up your team workspace to start collaborating on cloud architectures.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Corporation"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                handleSlugChange(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">solsarch.com/</span>
              <Input
                id="org-slug"
                placeholder="acme-corp"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This will be used in URLs and cannot be changed later.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">What's included:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Unlimited team members</li>
              <li>✓ Shared projects & architectures</li>
              <li>✓ Role-based access control</li>
              <li>✓ Team collaboration features</li>
            </ul>
          </div>

          <Button
            onClick={handleCreate}
            disabled={creating}
            className="w-full"
            size="lg"
          >
            {creating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Create Organization
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
