# SolsArch Supabase Setup

This directory contains the complete Supabase configuration for SolsArch in a simplified, production-ready structure.

## 📁 File Structure

```
supabase/
├── complete_setup.sql              # Single SQL file with all database schema
└── functions/
    └── generate-architecture/
        └── index.ts                # Edge Function for AI architecture generation
```

## 🚀 Quick Setup

### 1. Database Setup

Execute the single SQL file in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `complete_setup.sql`
4. Click **Run**

This will create:
- ✅ All database tables (profiles, projects, requirements, architectures, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Functions and triggers
- ✅ Complete security setup

### 2. Edge Function Deployment

Deploy the architecture generation function:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the Edge Function
supabase functions deploy generate-architecture
```

### 3. Environment Variables

Set the required environment variable in Supabase:

1. Go to **Project Settings** → **Edge Functions**
2. Add environment variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Google Gemini API key

## 📋 What's Included

### Database Schema (`complete_setup.sql`)

**Tables:**
- `profiles` - User profile information
- `projects` - User projects
- `requirements` - Architecture requirements
- `providers` - Cloud providers (AWS, Azure, GCP, OCI)
- `service_categories` - Service categorization
- `skus` - Pricing catalog for cloud services
- `architectures` - Generated architecture designs
- `architecture_components` - Individual components of architectures
- `cost_scenarios` - Cost simulation scenarios
- `recommendations` - AI-generated recommendations
- `reports` - Generated reports
- `service_mappings` - Generic to provider-specific service mappings

**Security:**
- Row Level Security (RLS) enabled on all tables
- User-based access control policies
- Secure functions with proper search paths

**Functions:**
- `handle_new_user()` - Auto-create profile on signup
- `update_updated_at_column()` - Auto-update timestamps

### Edge Function (`functions/generate-architecture/index.ts`)

**Features:**
- Advanced prompt engineering with industry context
- Chain-of-thought reasoning
- Multi-cloud architecture generation (AWS, Azure, GCP, OCI)
- 3 architecture variants (cost-optimized, balanced, performance)
- Real-time cost calculations
- Compliance validation
- Mermaid diagram generation

**API Endpoint:**
```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-architecture
```

**Request Body:**
```json
{
  "requirements": {
    "appType": "fintech",
    "expectedUsers": 500000,
    "requestsPerSecond": 5000,
    "dataSizeGB": 2500,
    "latencyTargetMs": 100,
    "availabilitySLA": 99.99,
    "regions": ["us-east", "eu-west"],
    "compliance": ["pci-dss", "soc2", "gdpr"],
    "budgetMin": 12000,
    "budgetMax": 18000,
    "additionalNotes": "Real-time fraud detection required"
  }
}
```

## 🔧 Maintenance

### To Update Database Schema:
1. Edit `complete_setup.sql`
2. Re-run in Supabase SQL Editor
3. Use `CREATE OR REPLACE` for functions
4. Use `IF NOT EXISTS` for tables to avoid conflicts

### To Update Edge Function:
```bash
supabase functions deploy generate-architecture
```

### To Test Edge Function Locally:
```bash
supabase functions serve generate-architecture
```

## 📊 Database Relationships

```
auth.users
    ↓
profiles (1:1)
    ↓
projects (1:many)
    ↓
requirements (1:many) ← architectures (many:1)
    ↓
architecture_components (1:many)
cost_scenarios (1:many)
recommendations (1:many)
reports (1:many)
```

## 🔐 Security Features

- **RLS Policies:** Users can only access their own data
- **Public Read:** Providers, SKUs, and service mappings are publicly readable
- **Cascade Deletes:** Deleting a project removes all related data
- **Secure Functions:** All functions use proper security settings
- **Audit Trails:** Automatic timestamps on all records

## 💡 Benefits of This Structure

✅ **Single File Setup:** One SQL file instead of multiple migrations
✅ **Easy Deployment:** Copy-paste into Supabase SQL Editor
✅ **Version Control Friendly:** Clear, readable structure
✅ **Production Ready:** All security and best practices included
✅ **Maintainable:** Easy to update and modify
✅ **Complete:** Everything needed for SolsArch in one place

## 🆘 Troubleshooting

**Issue: Policies already exist**
- Solution: Drop existing policies first or use `DROP POLICY IF EXISTS`

**Issue: Edge Function deployment fails**
- Solution: Check GEMINI_API_KEY is set in environment variables

**Issue: RLS blocking queries**
- Solution: Ensure user is authenticated and owns the resources

## 📚 Next Steps

1. ✅ Execute `complete_setup.sql` in Supabase
2. ✅ Deploy Edge Function
3. ✅ Set GEMINI_API_KEY environment variable
4. ✅ Test architecture generation
5. ✅ Populate providers and service_categories with initial data

---

**Note:** This simplified structure replaces all previous migration files with a single, comprehensive setup file for easier deployment and maintenance.
