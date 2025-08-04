import { defineAction } from '@genkit-ai/core';
import { generate } from '@genkit-ai/ai';
import { registry } from '../lib/genkit';
import { CampaignInputSchema, AdsOutputSchema } from '../types';
import { z } from 'zod';
import { LANGUAGE_PROMPTS, DEFAULT_MODEL } from '../lib/models';

// Schema for structured video scripts
const StructuredVideoScriptsSchema = z.object({
  videoScripts: z.array(z.object({
    title: z.string(),
    script: z.string().min(100).max(1200), // Increased
    duration: z.string().optional()
  })).length(4)
});

// Schema for structured ad copy - increased limits
const StructuredAdCopySchema = z.object({
  adCopyA: z.string().min(100).max(800), // Increased
  adCopyB: z.string().min(100).max(800) // Increased
});

// Schema for structured headlines - increased character limit for non-English languages
const StructuredHeadlinesSchema = z.object({
  headlineA: z.string().min(5).max(50), // Increased
  headlineB: z.string().min(5).max(50) // Increased
});

/**
 * Ads Generation Flow - Creates complete Meta Ads package
 * including video scripts, copy, and headlines
 */
export const generateAdsFlow = defineAction(
  registry,
  {
    name: 'generateAdsFlow',
    inputSchema: CampaignInputSchema,
    outputSchema: AdsOutputSchema,
    actionType: 'flow'
  },
  async (input) => {
    const { businessProfile, vslTitle, language } = input;
    const selectedLanguage = (language || businessProfile.language || 'pl') as keyof typeof LANGUAGE_PROMPTS;
    const languagePrompt = LANGUAGE_PROMPTS[selectedLanguage] || LANGUAGE_PROMPTS['pl'];

    const baseContext = `
${languagePrompt}

BUSINESS CONTEXT:
- Offer: ${businessProfile.offer}
- Target Avatar: ${businessProfile.avatar}  
- Client Problems: ${businessProfile.problems}
- Client Desires: ${businessProfile.desires}
- Brand Tone: ${businessProfile.tone}
- VSL Title: ${vslTitle}

TARGET: Drive clicks to a free VSL that teaches a practical mini-lesson.
PLATFORM: Meta (Facebook/Instagram) Ads
`;

    // Generate video ad scripts (30-60 seconds each)
    const videoScriptsPrompt = `${baseContext}

TASK: Create 4 different video ad scripts (30-45 seconds each) that promote the practical mini-lesson in the VSL.

CRITICAL APPROACH:
- These ads must tease the tangible skill or "quick win" taught in the VSL.
- Focus on the concrete knowledge the viewer will gain.
- Example: "In the next 45 seconds, I'll show you the hook of a 3-step framework to handle price objections. Watch the full free lesson to get the other 2 steps."
- Do NOT mention the full offer, only the free lesson.

REQUIREMENTS:
- Hook within the first 3 seconds with a specific, practical promise.
- Build curiosity about the mini-lesson and its outcome.
- Address a specific pain point that the lesson solves.
- Strong CTA to "watch the free lesson" or "learn the 3 steps now."
- Each script must have a distinct angle on the same mini-lesson.
- Keep each script under 1200 characters.

Return ONLY a JSON object with the following structure:
{
  "videoScripts": [
    {
      "title": "Script 1 Title",
      "script": "Full video script content (max 1200 chars)",
      "duration": "30-45 seconds"
    },
    {
      "title": "Script 2 Title", 
      "script": "Full video script content (max 1200 chars)",
      "duration": "30-45 seconds"
    },
    {
      "title": "Script 3 Title",
      "script": "Full video script content (max 1200 chars)", 
      "duration": "30-45 seconds"
    },
    {
      "title": "Script 4 Title",
      "script": "Full video script content (max 1200 chars)",
      "duration": "30-45 seconds"
    }
  ]
}`;

    // Generate ad copy (main text)
    const adCopyPrompt = `${baseContext}

TASK: Create 2 versions of Meta ad copy that promote the practical mini-lesson in the VSL.

CRITICAL APPROACH:
- The copy must highlight the immediate, tangible value of the mini-lesson.
- Focus on the "quick win" the viewer will get.
- Example: "Tired of hearing 'it's too expensive'? In our new free lesson, you'll learn a 3-step script to handle this objection. Click to watch now."

REQUIREMENTS:
- A hook that stops the scroll with a practical promise.
- Clearly state what the user will learn to do.
- Strong CTA to watch the free lesson.
- Keep under 800 characters.

Return ONLY a JSON object with the following structure:
{
  "adCopyA": "First version of ad copy text (max 800 chars)",
  "adCopyB": "Second version of ad copy text (max 800 chars)"
}`;

    // Generate headlines
    const headlinePrompt = `${baseContext}

TASK: Create 2 versions of Meta ad headlines that promote the practical mini-lesson.

CRITICAL APPROACH:
- Headlines must be ultra-specific and promise a tangible takeaway.
- Example: "Free Lesson: 3-Step Objection Script" or "Handle Price Objections Today".

REQUIREMENTS:
- Maximum 50 characters.
- Curiosity-driven and benefit-focused.
- No clickbait.
- Must clearly communicate the practical value.

Return ONLY a JSON object with the following structure:
{
  "headlineA": "First headline (max 50 chars)",
  "headlineB": "Second headline (max 50 chars)"
}`;

    // Execute all generations in parallel with error handling
    const [videoResponse, copyResponse, headlineResponse] = await Promise.all([
      generate(
        registry,
        {
          model: DEFAULT_MODEL,
          prompt: videoScriptsPrompt,
          config: { 
            temperature: 0.9,
            maxOutputTokens: 2000 // Increased
          },
          output: {
            schema: StructuredVideoScriptsSchema
          }
        }
      ).catch(error => {
        console.error('Video scripts generation failed:', error.message);
        throw new Error(`Video scripts generation failed: ${error.message}`);
      }),
      generate(
        registry,
        {
          model: DEFAULT_MODEL,
          prompt: adCopyPrompt,
          config: { 
            temperature: 0.8,
            maxOutputTokens: 1200 // Increased
          },
          output: {
            schema: StructuredAdCopySchema
          }
        }
      ).catch(error => {
        console.error('Ad copy generation failed:', error.message);
        throw new Error(`Ad copy generation failed: ${error.message}`);
      }),
      generate(
        registry,
        {
          model: DEFAULT_MODEL,
          prompt: headlinePrompt,
          config: { 
            temperature: 0.7,
            maxOutputTokens: 400 // Increased
          },
          output: {
            schema: StructuredHeadlinesSchema
          }
        }
      ).catch(error => {
        console.error('Headlines generation failed:', error.message);
        throw new Error(`Headlines generation failed: ${error.message}`);
      })
    ]);

    // Parse structured responses
    const videoData = videoResponse.output;
    const copyData = copyResponse.output;
    const headlineData = headlineResponse.output;

    if (!videoData?.videoScripts || !copyData?.adCopyA || !headlineData?.headlineA) {
      throw new Error('Failed to generate structured ad response');
    }

    // Format video scripts
    const videoScripts = videoData.videoScripts.map((script: any, index: number) => 
      `**Video Script ${index + 1}**\n\n${script.script}`
    );

    return {
      videoScripts,
      adCopyA: copyData.adCopyA,
      adCopyB: copyData.adCopyB,
      headlineA: headlineData.headlineA,
      headlineB: headlineData.headlineB
    };
  }
);
