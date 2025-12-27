-- =====================================================
-- SolsArch Complete Database Schema
-- Consolidated from all migrations for clean deployment
-- Generated: 2025-12-27
-- =====================================================

-- =====================================================
-- PART 1: CORE TABLES
-- =====================================================

-- Profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Requirements table
CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  app_type TEXT NOT NULL,
  expected_users INTEGER,
  requests_per_second INTEGER,
  data_size_gb NUMERIC,
  latency_target_ms INTEGER,
  availability_sla NUMERIC,
  regions TEXT[] DEFAULT '{}',
  compliance TEXT[] DEFAULT '{}',
  monthly_budget_min NUMERIC,
  monthly_budget_max NUMERIC,
  additional_notes TEXT,
  raw_input JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cloud providers table
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  regions TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT
);

-- SKUs (pricing catalog) table
CREATE TABLE IF NOT EXISTS public.skus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  region TEXT NOT NULL,
  vcpu INTEGER,
  memory_gb NUMERIC,
  storage_gb NUMERIC,
  gpu_type TEXT,
  gpu_count INTEGER,
  gpu_memory_gb NUMERIC,
  tflops NUMERIC,
  price_per_hour NUMERIC NOT NULL,
  price_per_month NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  specs JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, name, region)
);

-- Architectures table
CREATE TABLE IF NOT EXISTS public.architectures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.requirements(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('cost_optimized', 'balanced', 'performance')),
  description TEXT,
  diagram_data JSONB DEFAULT '{}',
  assumptions TEXT[] DEFAULT '{}',
  trade_offs TEXT[] DEFAULT '{}',
  total_monthly_cost NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Architecture components table
CREATE TABLE IF NOT EXISTS public.architecture_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  architecture_id UUID NOT NULL REFERENCES public.architectures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  provider_id UUID REFERENCES public.providers(id),
  sku_id UUID REFERENCES public.skus(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  hours_per_month INTEGER NOT NULL DEFAULT 730,
  monthly_cost NUMERIC,
  config JSONB DEFAULT '{}',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cost scenarios table
CREATE TABLE IF NOT EXISTS public.cost_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  architecture_id UUID NOT NULL REFERENCES public.architectures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('baseline', 'peak', 'growth', 'custom')),
  parameters JSONB NOT NULL DEFAULT '{}',
  total_monthly_cost NUMERIC,
  cost_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  architecture_id UUID NOT NULL REFERENCES public.architectures(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('cost_saving', 'performance', 'reliability', 'security', 'compliance')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_amount NUMERIC,
  impact_percentage NUMERIC,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  action_items TEXT[] DEFAULT '{}',
  is_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  architecture_id UUID REFERENCES public.architectures(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('solution_design', 'cost_comparison', 'optimization', 'executive_summary')),
  content JSONB NOT NULL DEFAULT '{}',
  format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'markdown', 'pdf')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service mapping table
CREATE TABLE IF NOT EXISTS public.service_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generic_service TEXT NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  provider_service TEXT NOT NULL,
  notes TEXT,
  UNIQUE(generic_service, provider_id)
);

-- =====================================================
-- PART 2: CHAT & CONVERSATIONS
-- =====================================================

-- Conversations table for storing chat sessions
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table for storing chat messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- PART 3: VERSION CONTROL
-- =====================================================

-- Architecture versions table
CREATE TABLE IF NOT EXISTS public.architecture_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  architecture_id UUID REFERENCES public.architectures(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- PART 4: USER SETTINGS (LLM Configuration)
-- =====================================================

-- User settings table for storing API keys and preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  llm_provider TEXT NOT NULL DEFAULT 'gemini' CHECK (llm_provider IN ('gemini', 'openai', 'anthropic', 'grok', 'ollama', 'custom')),
  llm_api_key TEXT, -- Encrypted in production
  llm_model TEXT,
  llm_base_url TEXT, -- For custom/Ollama endpoints
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architecture_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 6: RLS POLICIES
-- =====================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Requirements policies
CREATE POLICY "Users can view requirements of their projects" ON public.requirements FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = requirements.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create requirements for their projects" ON public.requirements FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = requirements.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update requirements of their projects" ON public.requirements FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = requirements.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete requirements of their projects" ON public.requirements FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = requirements.project_id AND projects.user_id = auth.uid()));

-- Providers and SKUs are public read
CREATE POLICY "Anyone can view providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Anyone can view service categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view SKUs" ON public.skus FOR SELECT USING (true);
CREATE POLICY "Anyone can view service mappings" ON public.service_mappings FOR SELECT USING (true);

-- Architectures policies
CREATE POLICY "Users can view architectures of their projects" ON public.architectures FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = architectures.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create architectures for their projects" ON public.architectures FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = architectures.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update architectures of their projects" ON public.architectures FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = architectures.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete architectures of their projects" ON public.architectures FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = architectures.project_id AND projects.user_id = auth.uid()));

-- Architecture components policies
CREATE POLICY "Users can view components of their architectures" ON public.architecture_components FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = architecture_components.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can create components for their architectures" ON public.architecture_components FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = architecture_components.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update components of their architectures" ON public.architecture_components FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = architecture_components.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete components of their architectures" ON public.architecture_components FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = architecture_components.architecture_id AND p.user_id = auth.uid()));

-- Cost scenarios policies
CREATE POLICY "Users can view cost scenarios of their architectures" ON public.cost_scenarios FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = cost_scenarios.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can create cost scenarios for their architectures" ON public.cost_scenarios FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = cost_scenarios.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete cost scenarios of their architectures" ON public.cost_scenarios FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = cost_scenarios.architecture_id AND p.user_id = auth.uid()));

-- Recommendations policies
CREATE POLICY "Users can view recommendations of their architectures" ON public.recommendations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = recommendations.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can create recommendations for their architectures" ON public.recommendations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = recommendations.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update recommendations of their architectures" ON public.recommendations FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = recommendations.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete recommendations of their architectures" ON public.recommendations FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = recommendations.architecture_id AND p.user_id = auth.uid()));

-- Reports policies
CREATE POLICY "Users can view reports of their projects" ON public.reports FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = reports.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create reports for their projects" ON public.reports FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = reports.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete reports of their projects" ON public.reports FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = reports.project_id AND projects.user_id = auth.uid()));

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can create messages in their conversations" ON public.messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete messages in their conversations" ON public.messages FOR DELETE
USING (EXISTS (SELECT 1 FROM public.conversations WHERE id = messages.conversation_id AND user_id = auth.uid()));

-- Version policies
CREATE POLICY "Users can view versions of their architectures" ON public.architecture_versions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = architecture_versions.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can create versions for their architectures" ON public.architecture_versions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = architecture_versions.architecture_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete versions of their architectures" ON public.architecture_versions FOR DELETE
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = architecture_versions.architecture_id AND p.user_id = auth.uid()));

-- User settings policies
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PART 7: FUNCTIONS & TRIGGERS
-- =====================================================

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Also create default user settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Get next version number
CREATE OR REPLACE FUNCTION public.get_next_version_number(arch_id UUID)
RETURNS INTEGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM public.architecture_versions
  WHERE architecture_id = arch_id;
  
  RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Drop triggers if exist and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_requirements_updated_at ON public.requirements;
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_skus_updated_at ON public.skus;
CREATE TRIGGER update_skus_updated_at BEFORE UPDATE ON public.skus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_architectures_updated_at ON public.architectures;
CREATE TRIGGER update_architectures_updated_at BEFORE UPDATE ON public.architectures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PART 8: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_architecture_versions_architecture_id ON public.architecture_versions(architecture_id);
CREATE INDEX IF NOT EXISTS idx_architecture_versions_created_at ON public.architecture_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skus_provider_category ON public.skus(provider_id, category_id);
CREATE INDEX IF NOT EXISTS idx_skus_category ON public.skus(category_id);
CREATE INDEX IF NOT EXISTS idx_skus_region ON public.skus(region);

-- =====================================================
-- PART 9: SEED DATA
-- =====================================================

-- Insert cloud providers
INSERT INTO public.providers (id, name, display_name, logo_url, regions, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'aws', 'Amazon Web Services', '/logos/aws.svg', ARRAY['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-southeast-1'], true),
  ('22222222-2222-2222-2222-222222222222', 'azure', 'Microsoft Azure', '/logos/azure.svg', ARRAY['eastus', 'westus2', 'westeurope', 'centralindia', 'southeastasia'], true),
  ('33333333-3333-3333-3333-333333333333', 'gcp', 'Google Cloud Platform', '/logos/gcp.svg', ARRAY['us-central1', 'us-west1', 'europe-west1', 'asia-south1', 'asia-southeast1'], true),
  ('44444444-4444-4444-4444-444444444444', 'oci', 'Oracle Cloud Infrastructure', '/logos/oci.svg', ARRAY['us-ashburn-1', 'us-phoenix-1', 'eu-frankfurt-1', 'ap-mumbai-1', 'ap-singapore-1'], true)
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name, regions = EXCLUDED.regions;

-- Insert service categories
INSERT INTO public.service_categories (id, name, display_name, description)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'compute', 'Compute', 'Virtual machines and compute instances'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'database', 'Database', 'Managed database services'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'storage', 'Storage', 'Object and block storage'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'cache', 'Cache', 'In-memory caching services'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'networking', 'Networking', 'Load balancers, VPCs, CDN'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'container', 'Containers', 'Kubernetes and container services'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'serverless', 'Serverless', 'Function-as-a-Service'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'gpu', 'GPU Compute', 'GPU instances for ML/AI'),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'queue', 'Message Queue', 'Message queuing services'),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'analytics', 'Analytics', 'Data analytics and processing')
ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description;
