-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create requirements table
CREATE TABLE public.requirements (
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

-- Create cloud providers table
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  regions TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service categories table
CREATE TABLE public.service_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT
);

-- Create SKUs (pricing catalog) table
CREATE TABLE public.skus (
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

-- Create architectures table
CREATE TABLE public.architectures (
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

-- Create architecture components table
CREATE TABLE public.architecture_components (
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

-- Create cost scenarios table
CREATE TABLE public.cost_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  architecture_id UUID NOT NULL REFERENCES public.architectures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scenario_type TEXT NOT NULL CHECK (scenario_type IN ('baseline', 'peak', 'growth', 'custom')),
  parameters JSONB NOT NULL DEFAULT '{}',
  total_monthly_cost NUMERIC,
  cost_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recommendations table
CREATE TABLE public.recommendations (
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

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  architecture_id UUID REFERENCES public.architectures(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('solution_design', 'cost_comparison', 'optimization', 'executive_summary')),
  content JSONB NOT NULL DEFAULT '{}',
  format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'markdown', 'pdf')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service mapping table for generic to provider-specific services
CREATE TABLE public.service_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generic_service TEXT NOT NULL,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  provider_service TEXT NOT NULL,
  notes TEXT,
  UNIQUE(generic_service, provider_id)
);

-- Enable RLS on all tables
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

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Requirements policies (through project ownership)
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
CREATE POLICY "Users can update recommendations of their architectures" ON public.recommendations FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.architectures a JOIN public.projects p ON p.id = a.project_id WHERE a.id = recommendations.architecture_id AND p.user_id = auth.uid()));

-- Reports policies
CREATE POLICY "Users can view reports of their projects" ON public.reports FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = reports.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create reports for their projects" ON public.reports FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = reports.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete reports of their projects" ON public.reports FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = reports.project_id AND projects.user_id = auth.uid()));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_skus_updated_at BEFORE UPDATE ON public.skus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_architectures_updated_at BEFORE UPDATE ON public.architectures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();