# SolsArch - AI Solutions Architect

**SolsArch** is your professional AI-based Solutions Architect tool for designing production-ready cloud architectures. Whether you're building a small-scale app or an enterprise system, SolsArch provides intelligent architecture recommendations with real-time cost comparisons across AWS, Azure, GCP, and OCI.

## Features

- 🎯 **Dual Input Modes**: Choose between a guided wizard or conversational chat interface
- 🤖 **AI-Powered Architecture Generation**: Get 3 architecture variants (cost-optimized, balanced, performance-optimized)
- 💰 **Multi-Cloud Cost Comparison**: Real-time pricing across AWS, Azure, GCP, and OCI
- 🎨 **Visual Architecture Diagrams**: Auto-generated Mermaid diagrams
- 📊 **GPU Optimization**: Specialized recommendations for AI/ML workloads
- 🔒 **Compliance Support**: SOC2, GDPR, HIPAA, PCI-DSS, ISO 27001, DPDP
- 📈 **Cost Optimization Tools**: Resource rightsizing, spot optimization, bill analyzer
- 🌍 **Multi-Region Support**: Deploy across global regions with latency optimization

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase Edge Functions
- **AI**: Google Gemini API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd solsarch1

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
# VITE_SUPABASE_PROJECT_ID=your_project_id

# Start the development server
npm run dev
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations from `supabase/migrations/` in your Supabase SQL editor
3. Deploy the Edge Function:
   ```sh
   supabase functions deploy generate-architecture
   ```
4. Add the `GEMINI_API_KEY` secret to your Supabase project:
   ```sh
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

## Deployment to Vercel

```sh
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_PUBLISHABLE_KEY
# - VITE_SUPABASE_PROJECT_ID
```

## Usage

### Wizard Mode
1. Click "Start Designing" on the landing page
2. Follow the 4-step wizard to define your requirements
3. Get 3 architecture variants with cost comparisons

### Chat Mode
1. Switch to Chat mode from the header
2. Paste your requirements or upload a document
3. Get instant architecture recommendations

## Project Structure

```
solsarch1/
├── src/
│   ├── components/
│   │   ├── app/          # Main application components
│   │   ├── landing/      # Landing page components
│   │   └── ui/           # shadcn/ui components
│   ├── pages/            # Page components
│   ├── types/            # TypeScript types
│   └── integrations/     # Supabase integration
├── supabase/
│   ├── functions/        # Edge Functions
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## Contributing

SolsArch is designed to be extensible. Feel free to:
- Add new cloud providers
- Enhance cost calculation algorithms
- Improve AI prompts for better recommendations
- Add new compliance frameworks

## License

MIT License - feel free to use for your projects!

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for cloud architects and developers**
