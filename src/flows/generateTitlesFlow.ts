import { BusinessProfileSchema } from '../types';
import { z } from 'zod';
import { LANGUAGE_PROMPTS, DEFAULT_MODEL, generateWithOpenAI } from '../lib/models';

const TitleGenerationInputSchema = z.object({
  businessProfile: BusinessProfileSchema
});

const TitleGenerationOutputSchema = z.object({
  titles: z.array(z.string())
});

// Schema for structured title generation
const StructuredTitleResponseSchema = z.object({
  titles: z.array(z.string().min(10).max(200)).length(6), // Increased
  reasoning: z.string().optional()
});

/**
 * Title Generation Flow - Creates compelling VSL titles based on business profile
 */
export async function generateTitlesFlow(input: z.infer<typeof TitleGenerationInputSchema>): Promise<z.infer<typeof TitleGenerationOutputSchema>> {
    const { businessProfile } = input;
    const selectedLanguage = (businessProfile.language || 'pl') as keyof typeof LANGUAGE_PROMPTS;
    const languagePrompt = LANGUAGE_PROMPTS[selectedLanguage] || LANGUAGE_PROMPTS['pl'];

    const titlePrompt = `
You are an expert copywriter specializing in creating compelling, practical titles for educational Video Sales Letters (VSLs).

${languagePrompt}

BUSINESS CONTEXT:
- Offer: ${businessProfile.offer}
- Target Avatar: ${businessProfile.avatar}
- Client Problems: ${businessProfile.problems}
- Client Desires: ${businessProfile.desires}
- Brand Tone: ${businessProfile.tone}

TASK: Generate 6 compelling VSL titles that promise a specific, actionable mini-lesson.

CRITICAL APPROACH:
- Titles must promise a tangible skill or a "quick win" that the viewer can get from the VSL.
- Focus on what the audience will *learn to do*, not just what they will learn *about*.
- The titles should be highly specific and feel like the title of a practical tutorial.
- Example: Instead of "A Guide to Better Sales," a good title would be "Free Lesson: A 3-Step Script to Handle Any Sales Objection."

TITLE REQUIREMENTS:
- Promise a concrete, actionable takeaway.
- Be highly specific. What exact skill will they learn?
- Create curiosity about the mini-lesson.
- Match the ${businessProfile.tone.toLowerCase()} brand tone.
- Length: 8-15 words each (max 200 characters).

PROVEN PRACTICAL TITLE FRAMEWORKS:
1. "Free Lesson: How to [Do a Specific Action] in [Timeframe]"
2. "The [Number]-Step Method to [Achieve a Specific Outcome]"
3. "A 3-Minute Trick to [Solve a Specific Problem]"
4. "How to Use [A Specific Tool] to [Get a Specific Result]"
5. "The One Script You Need to [Handle a Specific Situation]"

Focus on the specific pain points: ${businessProfile.problems}
And the specific desires: ${businessProfile.desires}

Generate exactly 6 unique, compelling, and practical titles. Return ONLY a JSON object with the following structure:
{
  "titles": [
    "Title 1",
    "Title 2", 
    "Title 3",
    "Title 4",
    "Title 5",
    "Title 6"
  ]
}
`;

    const structuredData = await generateWithOpenAI<z.infer<typeof StructuredTitleResponseSchema>>(
      titlePrompt,
      StructuredTitleResponseSchema,
      DEFAULT_MODEL,
      0.8,
      1000
    );
    
    if (!structuredData || !structuredData.titles) {
      throw new Error('Failed to generate structured title response');
    }

    return {
      titles: structuredData.titles
    };
}
