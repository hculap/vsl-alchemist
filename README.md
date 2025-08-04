# VSL-Alchemist

AI-powered marketing automation tool for high-ticket experts and coaches. Automate the creation of Video Sales Letters (VSL) and associated ad campaigns in minutes instead of hours.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase and Google AI credentials
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build and deploy**
   ```bash
   npm run build
   npm run deploy
   ```

## 🏗️ Architecture

Built with Firebase + Genkit for AI workflow orchestration:

- **Backend**: Firebase Functions + Genkit flows
- **Database**: Cloud Firestore
- **AI**: Google AI (Gemini) models
- **Authentication**: Firebase Auth

## 📁 Project Structure

```
src/
├── flows/              # Genkit AI flows
│   ├── masterCampaignFlow.ts
│   ├── generateVslFlow.ts
│   └── generateAdsFlow.ts
├── types/              # TypeScript schemas
└── utils/              # Utility functions
```

## 🔧 Development Commands

- `npm run dev` - Start Genkit development server
- `npm run build` - Build TypeScript to dist/
- `npm run typecheck` - Type checking
- `npm run lint` - Lint code
- `npm run test` - Run tests
- `npm run deploy` - Deploy to Firebase

## 🎯 Core Features (V1.0)

- **Business Profile Setup**: One-time configuration of offer, target avatar, and brand tone
- **Campaign Generation**: Automated creation of complete marketing campaigns
- **VSL Scripts**: Two versions of 15-minute VSL scripts with proven conversion structure
- **Meta Ads Package**: 4 video scripts + 2 ad copy versions + 2 headlines
- **Content Consistency**: All materials maintain thematic and tonal coherence

## 🔮 Roadmap

- **V2.0**: RAG-powered personalization with user's own content
- **V3.0**: Complete text-to-video production pipeline

## 📄 License

MIT