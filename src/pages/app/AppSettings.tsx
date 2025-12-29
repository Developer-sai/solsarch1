import { useState, useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, Users, Trash2, UserPlus, Loader2, Shield, Crown, UserCheck, Eye } from "lucide-react";
import { toast } from "sonner";

type AppRole = "owner" | "admin" | "member" | "viewer";

const roleIcons: Record<AppRole, React.ReactNode> = {
  owner: <Crown className="h-3 w-3" />,
  admin: <Shield className="h-3 w-3" />,
  member: <UserCheck className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

const roleColors: Record<AppRole, string> = {
  owner: "bg-warning text-warning-foreground",
  admin: "bg-info text-info-foreground",
  member: "bg-secondary text-secondary-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export default function AppSettings() {
  const { user } = useAuth();
  const {
    currentOrganization,
    currentRole,
    members,
    isAdmin,
    isOwner,
    updateOrganization,
    deleteOrganization,
    fetchMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
  } = useOrganization();

  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("member");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      setOrgName(currentOrganization.name);
      fetchMembers();
    }
  }, [currentOrganization, fetchMembers]);

  const handleSaveOrg = async () => {
    if (!currentOrganization) return;
    
    setSaving(true);
    const { error } = await updateOrganization(currentOrganization.id, { name: orgName });
    setSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Organization updated");
    }
  };

  const handleDeleteOrg = async () => {
    if (!currentOrganization) return;
    
    const { error } = await deleteOrganization(currentOrganization.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Organization deleted");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setInviting(true);
    const { error } = await inviteMember(inviteEmail, inviteRole);
    setInviting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("member");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: AppRole) => {
    const { error } = await updateMemberRole(memberId, newRole);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Role updated");
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await removeMember(memberId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Member removed");
    }
  };

  if (!currentOrganization) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Organization Selected</h3>
            <p className="text-sm text-muted-foreground">
              Create or select an organization to manage settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization and team members.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Update your organization's information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label>URL Slug</Label>
                <Input value={currentOrganization.slug} disabled />
                <p className="text-xs text-muted-foreground">
                  Slug cannot be changed after creation.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Your Role</Label>
                <div className="flex items-center gap-2">
                  <Badge className={roleColors[currentRole || "viewer"]}>
                    {roleIcons[currentRole || "viewer"]}
                    <span className="ml-1 capitalize">{currentRole}</span>
                  </Badge>
                </div>
              </div>

              {isAdmin && (
                <Button onClick={handleSaveOrg} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Permanently delete this organization and all its data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Organization
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        the organization "{currentOrganization.name}" and all associated
                        projects, architectures, and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteOrg} className="bg-destructive text-destructive-foreground">
                        Delete Organization
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
                <CardDescription>
                  Send an invitation to add a new team member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInvite} disabled={inviting}>
                    {inviting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    Invite
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? "s" : ""} in this organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {member.profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profile?.full_name || "Unnamed User"}
                          {member.user_id === user?.id && (
                            <span className="text-muted-foreground ml-2">(You)</span>
                          )}
                        </p>
                        <Badge variant="outline" className={`${roleColors[member.role]} text-xs`}>
                          {roleIcons[member.role]}
                          <span className="ml-1 capitalize">{member.role}</span>
                        </Badge>
                      </div>
                    </div>

                    {isAdmin && member.user_id !== user?.id && member.role !== "owner" && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(v) => handleRoleChange(member.id, v as AppRole)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.profile?.full_name || "this user"} from the organization?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                ))}

                {members.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No team members yet. Invite someone to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
