import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Check, ChevronDown, Plus, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function OrgSwitcher() {
  const navigate = useNavigate();
  const {
    organizations,
    currentOrganization,
    switchOrganization,
    createOrganization,
    loading,
  } = useOrganization();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newOrgName.trim() || !newOrgSlug.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    const { data, error } = await createOrganization(newOrgName, newOrgSlug.toLowerCase().replace(/\s+/g, "-"));
    setCreating(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Organization created!");
    setShowCreateDialog(false);
    setNewOrgName("");
    setNewOrgSlug("");
    
    if (data) {
      switchOrganization(data.id);
    }
  };

  const handleSlugChange = (value: string) => {
    // Auto-generate slug from name
    setNewOrgSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    );
  }

  if (!currentOrganization && organizations.length === 0) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Organization</span>
        </Button>

        <CreateOrgDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          newOrgName={newOrgName}
          setNewOrgName={setNewOrgName}
          newOrgSlug={newOrgSlug}
          handleSlugChange={handleSlugChange}
          handleCreate={handleCreate}
          creating={creating}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 max-w-[200px]">
            <Building2 className="h-4 w-4 flex-shrink-0" />
            <span className="truncate hidden sm:inline">
              {currentOrganization?.name || "Select Organization"}
            </span>
            <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Organizations</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => switchOrganization(org.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{org.name}</span>
              </div>
              {currentOrganization?.id === org.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </DropdownMenuItem>
          
          {currentOrganization && (
            <DropdownMenuItem onClick={() => navigate("/app/settings/team")}>
              <Settings className="h-4 w-4 mr-2" />
              Organization Settings
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrgDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        newOrgName={newOrgName}
        setNewOrgName={setNewOrgName}
        newOrgSlug={newOrgSlug}
        handleSlugChange={handleSlugChange}
        handleCreate={handleCreate}
        creating={creating}
      />
    </>
  );
}

function CreateOrgDialog({
  open,
  onOpenChange,
  newOrgName,
  setNewOrgName,
  newOrgSlug,
  handleSlugChange,
  handleCreate,
  creating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newOrgName: string;
  setNewOrgName: (name: string) => void;
  newOrgSlug: string;
  handleSlugChange: (slug: string) => void;
  handleCreate: () => void;
  creating: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Inc"
              value={newOrgName}
              onChange={(e) => {
                setNewOrgName(e.target.value);
                handleSlugChange(e.target.value);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">URL Slug</Label>
            <Input
              id="org-slug"
              placeholder="acme-inc"
              value={newOrgSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your organization will be accessible at /{newOrgSlug || "your-slug"}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Organization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
