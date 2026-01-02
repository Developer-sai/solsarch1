# SolsArch - AI Solutions Architect Platform

![Version](https://img.shields.io/badge/version-0.5.0-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)

**AI-powered cloud architecture design platform with multi-cloud cost intelligence**

SolsArch is an enterprise-grade platform that helps architects, developers, and technical teams design optimal cloud architectures across AWS, Azure, GCP, and Oracle Cloud Infrastructure (OCI). Powered by advanced AI, it provides intelligent architecture recommendations, real-time cost comparisons, and production-ready infrastructure-as-code templates.

## 🚀 Key Features

### AI-Powered Architecture Design
- **Interactive Chat Interface**: Conversational AI architect that understands your requirements and designs complete solutions
- **Multi-Variant Generation**: Automatically generates cost-optimized, balanced, and performance-optimized architecture variants
- **Hybrid Multi-Cloud Support**: Design architectures that leverage the best services from multiple cloud providers

### Intelligent Cost Analysis
- **Real-Time Cost Comparison**: Compare costs across AWS, Azure, GCP, and OCI for every component
- **Cost Optimization Recommendations**: AI-driven suggestions to reduce cloud spending by 20-60%
- **Hybrid Cost Breakdown**: Understand costs when using multiple cloud providers together
- **SKU Browser**: Search and compare specific instance types and services across clouds

### Visual Architecture Tools
- **Interactive Mermaid Diagrams**: Auto-generated architecture diagrams that you can customize
- **Component Breakdown**: Detailed view of every service, SKU, and cost estimate
- **Export Options**: Export architectures as PDF, PNG, or infrastructure-as-code (Terraform, Pulumi, CloudFormation)

### Enterprise Features
- **GPU Workload Optimization**: Specialized recommendations for AI/ML workloads
- **Compliance Support**: Architecture templates for SOC2, HIPAA, PCI-DSS, GDPR
- **Multi-Region Design**: Global architecture patterns with latency optimization
- **Version History**: Track and compare architecture iterations
- **Team Collaboration**: Organization-based workspaces (coming soon)
- **Templates Library**: Pre-built architecture templates for common use cases ✨ NEW in v0.5
- **Pricing Plans**: Flexible pricing tiers for individuals and enterprises ✨ NEW in v0.5

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: Google Gemini 2.0 Flash Exp via Google AI API
- **Visualization**: Mermaid.js for architecture diagrams
- **State Management**: TanStack Query (React Query)
- **Authentication**: Supabase Auth

## 📋 Prerequisites

- **Node.js** 18+ and npm (install via [nvm](https://github.com/nvm-sh/nvm))
- **Supabase Account** (for backend and database)
- **Google AI API Key** (for AI-powered features)

## 🚦 Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd solsarch1
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Setup

#### Configure Supabase Secrets

Add your Google AI API key to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Set the Google AI API key
supabase secrets set GOOGLE_AI_API_KEY=your_google_ai_api_key
```

#### Deploy Supabase Functions

```bash
# Deploy the architect-chat function
supabase functions deploy architect-chat

# Deploy the generate-architecture function
supabase functions deploy generate-architecture
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Building for Production

```bash
# Create optimized production build
npm run build

# Preview the production build locally
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service (Vercel, Netlify, Cloudflare Pages, etc.).

## 📦 Project Structure

```
solsarch1/
├── src/
│   ├── components/          # React components
│   │   ├── app/            # Main application components
│   │   ├── auth/           # Authentication components
│   │   ├── chat/           # Chat interface components
│   │   ├── landing/        # Landing page components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Route pages
│   └── App.tsx             # Main application component
├── supabase/
│   ├── functions/          # Edge functions
│   │   ├── architect-chat/ # AI chat endpoint
│   │   └── generate-architecture/ # Architecture generation
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── dist/                   # Production build output
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `GOOGLE_AI_API_KEY` | Google AI API key (Supabase secret) | Yes |

## 🚀 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to Cloudflare Pages

```bash
npm run build
# Upload dist/ folder to Cloudflare Pages dashboard
```

## 📖 Usage Guide

1. **Sign Up/Login**: Create an account or sign in
2. **Start a Chat**: Click "New Chat" to begin a conversation with the AI architect
3. **Describe Your Requirements**: Tell the AI about your application needs in natural language
4. **Review Architecture**: The AI will generate architecture recommendations with diagrams and cost estimates
5. **Iterate**: Ask follow-up questions to refine the architecture
6. **Export**: Download as PDF, diagram, or infrastructure-as-code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues, questions, or feature requests, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for cloud architects and engineering teams**
