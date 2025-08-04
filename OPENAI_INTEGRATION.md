# OpenAI Integration for VSL-Alchemist

## Overview

This document describes the OpenAI API integration added to VSL-Alchemist, allowing the application to use both Google AI (Gemini) and OpenAI (GPT) models for content generation.

## Changes Made

### 1. Added OpenAI Support

- **Package Installation**: Added `@genkit-ai/compat-oai` package for OpenAI compatibility
- **Configuration Updates**: Updated `genkit.config.js` and `src/lib/genkit.ts` to support both Google AI and OpenAI plugins
- **Model Management**: Created a centralized model configuration system in `src/lib/models.ts`

### 2. Model Configuration

The application now supports multiple AI models:

```typescript
// Available Models
export const MODELS = {
  GOOGLE: {
    GEMINI_20_FLASH_LITE: gemini20FlashLite,
  },
  OPENAI: {
    GPT_4O: openAICompatible('gpt-4o'), // Coming soon
  }
} as const;

// Default model selection
export const DEFAULT_MODEL = MODELS.GOOGLE.GEMINI_20_FLASH_LITE;
```

### 3. Updated Flows

All generation flows have been updated to use the centralized model system:

- `generateVslFlow.ts` - VSL script generation
- `generateAdsFlow.ts` - Ad copy and video script generation  
- `generateTitlesFlow.ts` - Title generation

### 4. Language Support

Added comprehensive language support with prompts for 100+ languages:

```typescript
export const LANGUAGE_PROMPTS = {
  en: 'Write in English with a natural, conversational tone suitable for video content.',
  pl: 'Write in Polish with a natural, conversational tone suitable for video content.',
  // ... 100+ more languages
} as const;
```

## Environment Variables

To use OpenAI models, add the following environment variables:

```bash
# Google AI API Key (required for Gemini models)
GOOGLE_API_KEY=your_google_api_key_here

# OpenAI API Key (required for GPT models)
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

### Current State

Currently, the application uses Google's Gemini model as the default. To switch to OpenAI models:

1. **Set up OpenAI API Key**: Add your OpenAI API key to the environment variables
2. **Update Default Model**: Modify `DEFAULT_MODEL` in `src/lib/models.ts` to use OpenAI models
3. **Test Integration**: Ensure all flows work correctly with the new model

### Model Selection

You can easily switch between models by updating the `DEFAULT_MODEL` constant:

```typescript
// Use Google AI (current default)
export const DEFAULT_MODEL = MODELS.GOOGLE.GEMINI_20_FLASH_LITE;

// Use OpenAI (when configured)
export const DEFAULT_MODEL = MODELS.OPENAI.GPT_4O;
```

## Future Enhancements

### 1. Model Selection UI

Add a user interface to allow users to choose their preferred AI model:

```typescript
interface ModelSelection {
  provider: 'google' | 'openai';
  model: string;
  cost: number;
  quality: 'fast' | 'balanced' | 'high';
}
```

### 2. Cost Optimization

Implement intelligent model selection based on:

- **Task Complexity**: Use faster models for simple tasks
- **Budget Constraints**: Allow users to set cost limits
- **Quality Requirements**: Match model capabilities to task needs

### 3. A/B Testing

Enable automatic A/B testing between different models:

```typescript
interface ABTestConfig {
  modelA: ModelConfig;
  modelB: ModelConfig;
  testDuration: number;
  successMetrics: string[];
}
```

### 4. Model Performance Monitoring

Track and compare model performance:

- **Response Time**: Measure generation speed
- **Quality Metrics**: User satisfaction scores
- **Cost Analysis**: Per-request and monthly costs
- **Error Rates**: Model reliability tracking

## Technical Implementation

### Genkit Configuration

The application uses Genkit's plugin system for model management:

```typescript
export const g = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
      apiVersion: 'v1'
    }),
    openai({
      apiKey: process.env.OPENAI_API_KEY
    })
  ]
});
```

### Flow Updates

All generation flows now use the centralized model system:

```typescript
// Before
model: gemini20FlashLite

// After  
model: DEFAULT_MODEL
```

### Language Handling

Improved language support with type-safe language selection:

```typescript
const selectedLanguage = (language || businessProfile.language || 'en') as keyof typeof LANGUAGE_PROMPTS;
const languagePrompt = LANGUAGE_PROMPTS[selectedLanguage] || LANGUAGE_PROMPTS['en'];
```

## Benefits

1. **Model Flexibility**: Users can choose between Google AI and OpenAI models
2. **Cost Optimization**: Different models for different use cases
3. **Quality Control**: A/B testing between models
4. **Future-Proof**: Easy to add new AI providers
5. **Global Support**: 100+ languages supported

## Next Steps

1. **Complete OpenAI Integration**: Finalize the OpenAI model configuration
2. **Add Model Selection UI**: Allow users to choose their preferred model
3. **Implement Cost Tracking**: Monitor and display usage costs
4. **Add Performance Metrics**: Track model performance and quality
5. **Enable A/B Testing**: Compare different models automatically

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure both `GOOGLE_API_KEY` and `OPENAI_API_KEY` are set
2. **Model Not Found**: Check that the model name is correct in the configuration
3. **Language Errors**: Verify that the language code exists in `LANGUAGE_PROMPTS`

### Debug Mode

Enable debug logging to troubleshoot model issues:

```typescript
// Add to genkit configuration
debug: true
```

## Contributing

When adding new AI providers:

1. **Install Provider Package**: Add the Genkit plugin for the new provider
2. **Update Configuration**: Add the provider to `genkit.config.js`
3. **Add Model Constants**: Define models in `src/lib/models.ts`
4. **Update Documentation**: Document the new provider in this file
5. **Test Integration**: Ensure all flows work with the new provider 