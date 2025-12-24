import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, ArrowLeft, User, Building, Briefcase, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  company: string | null;
  role: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    company: "",
    role: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          company: data.company || "",
          role: data.role || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          company: formData.company,
          role: formData.role,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
              <Cloud className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">SolsArch</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

          {/* Profile Card */}
          <Card className="bg-card/80 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={user.email || ""} 
                  disabled 
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company
                  </Label>
                  <Input 
                    id="company"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Title
                  </Label>
                  <Input 
                    id="role"
                    placeholder="Your role"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                <div>
                  <p className="font-medium">Sign out</p>
                  <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}