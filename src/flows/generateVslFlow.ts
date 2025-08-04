import { defineAction } from '@genkit-ai/core';
import { generate } from '@genkit-ai/ai';
import { registry } from '../lib/genkit';
import { CampaignInputSchema, VslOutputSchema } from '../types';
import { z } from 'zod';
import { LANGUAGE_PROMPTS, DEFAULT_MODEL } from '../lib/models';

// Schema for structured VSL generation - shorter version
const StructuredVslResponseSchema = z.object({
  vslScript: z.object({
    hook: z.string().min(50).max(300),
    problemAgitation: z.string().min(100).max(600),
    authorityStory: z.string().min(100).max(600),
    solutionReveal: z.string().min(150).max(1200), // Increased
    socialProof: z.string().min(100).max(500),
    offer: z.string().min(100).max(500),
    callToAction: z.string().min(50).max(400) // Increased
  }),
  version: z.string().optional()
});

/**
 * VSL Generation Flow - Creates two versions of complete VSL scripts
 * following proven conversion frameworks (3-4 minutes)
 */
export const generateVslFlow = defineAction(
  registry,
  {
    name: 'generateVslFlow',
    inputSchema: CampaignInputSchema,
    outputSchema: VslOutputSchema,
    actionType: 'flow'
  },
  async (input) => {
    const { businessProfile, vslTitle, language } = input;
    const selectedLanguage = (language || businessProfile.language || 'pl') as keyof typeof LANGUAGE_PROMPTS;
    const languagePrompt = LANGUAGE_PROMPTS[selectedLanguage] || LANGUAGE_PROMPTS['pl'];

    const vslPrompt = `
You are an expert copywriter specializing in creating practical, educational Video Sales Letters (VSL) that deliver immediate value.

${languagePrompt}

BUSINESS CONTEXT:
- Offer: ${businessProfile.offer}
- Target Avatar: ${businessProfile.avatar}
- Client Problems: ${businessProfile.problems}
- Client Desires: ${businessProfile.desires}
- Brand Tone: ${businessProfile.tone}

TASK: Create a complete 3-4 minute VSL script based on the title: "${vslTitle}" that feels like a valuable, actionable mini-lesson.

CRITICAL APPROACH:
- The core of this VSL MUST be a practical, actionable mini-lesson.
- Teach a specific skill, a tangible technique, or a step-by-step micro-process that the viewer can apply immediately.
- Instead of talking *about* concepts, *show* them how to do something concrete.
- Example: If the offer is about lead generation, the mini-lesson could be "How to find 5 qualified leads in 10 minutes using LinkedIn Sales Navigator's boolean search."

STRUCTURE:
1. Hook (0-15 seconds) - Grab attention with a specific, practical promise. What concrete skill will they learn in the next 3 minutes?
2. Problem Agitation (15 seconds - 1 minute) - Deep dive into the pain points that the mini-lesson will solve.
3. Authority/Story (1-2 minutes) - Establish credibility by showing how you discovered or use this specific technique.
4. Educational Value / Mini-Lesson (2-3 minutes) - **This is the most important part.** Teach the specific, actionable mini-lesson. Provide a step-by-step guide, a quick tutorial on a tool, or a concrete technique. The viewer should leave with a new skill they can use right away.
5. Social Proof (3-3.5 minutes) - Share results from others who have used this specific technique.
6. Offer (3.5-4 minutes) - Present your main offer as the logical next step to mastering this and other skills.
7. Call to Action (4 minutes) - Drive to a free consultation/call to implement this on a deeper level.

REQUIREMENTS:
- Write in a ${businessProfile.tone.toLowerCase()} and conversational tone for video.
- The educational content must be a practical mini-lesson that delivers a quick win. Be specific, not general.
- Example: Instead of "how to improve sales," the lesson should be "a 3-step script to handle the 'it's too expensive' objection."
- Hook: 50-300 characters
- Problem Agitation: 100-600 characters
- Authority Story: 100-600 characters
- Educational Value: 150-1200 characters
- Social Proof: 100-500 characters
- Offer: 100-500 characters
- Call to Action: 50-400 characters

Return ONLY a JSON object with the following structure:
{
  "vslScript": {
    "hook": "Hook section (0-15 seconds, 50-300 chars)",
    "problemAgitation": "Problem agitation section (15 seconds - 1 minute, 100-600 chars)",
    "authorityStory": "Authority/story section (1-2 minutes, 100-600 chars)",
    "solutionReveal": "The practical, step-by-step mini-lesson (2-3 minutes, 150-1200 chars)",
    "socialProof": "Social proof section (3-3.5 minutes, 100-500 chars)",
    "offer": "Offer section (3.5-4 minutes, 100-500 chars)",
    "callToAction": "Call to action section (4 minutes, 50-400 chars)"
  }
}
`;

    // Generate two different versions for A/B testing
    const [responseA, responseB] = await Promise.all([
      generate(
        registry,
        {
          model: DEFAULT_MODEL,
          prompt: vslPrompt + "\n\nCreate VERSION A with emphasis on transformation and results:",
          config: { 
            temperature: 0.8,
            maxOutputTokens: 2000 // Increased
          },
          output: {
            schema: StructuredVslResponseSchema
          }
        }
      ).catch(error => {
        console.error('VSL Version A generation failed:', error.message);
        throw new Error(`VSL Version A generation failed: ${error.message}`);
      }),
      generate(
        registry,
        {
          model: DEFAULT_MODEL, 
          prompt: vslPrompt + "\n\nCreate VERSION B with emphasis on methodology and expertise:",
          config: { 
            temperature: 0.8,
            maxOutputTokens: 2000 // Increased
          },
          output: {
            schema: StructuredVslResponseSchema
          }
        }
      ).catch(error => {
        console.error('VSL Version B generation failed:', error.message);
        throw new Error(`VSL Version B generation failed: ${error.message}`);
      })
    ]);

    // Parse the structured responses
    const vslDataA = responseA.output;
    const vslDataB = responseB.output;

    if (!vslDataA?.vslScript || !vslDataB?.vslScript) {
      throw new Error('Failed to generate structured VSL response');
    }

    // Format the VSL scripts
    const formatVslScript = (vslData: any) => {
      return `## Educational VSL Script: ${vslTitle}

**Video Length:** Approximately 3-4 Minutes
**Target Avatar:** ${businessProfile.avatar}
**Educational Approach:** Alex Hormozi Style - Value First, Offer Last
**Brand Tone:** ${businessProfile.tone}

---

### **SECTION 1: HOOK (0-15 seconds)**

${vslData.vslScript.hook}

---

### **SECTION 2: PROBLEM AGITATION (15 seconds - 1 minute)**

${vslData.vslScript.problemAgitation}

---

### **SECTION 3: AUTHORITY/STORY (1-2 minutes)**

${vslData.vslScript.authorityStory}

---

### **SECTION 4: EDUCATIONAL VALUE (2-3 minutes)**

${vslData.vslScript.solutionReveal}

---

### **SECTION 5: SOCIAL PROOF (3-3.5 minutes)**

${vslData.vslScript.socialProof}

---

### **SECTION 6: OFFER (3.5-4 minutes)**

${vslData.vslScript.offer}

---

### **SECTION 7: CALL TO ACTION (4 minutes)**

${vslData.vslScript.callToAction}

---`;
    };

    return {
      vslScriptA: formatVslScript(vslDataA),
      vslScriptB: formatVslScript(vslDataB)
    };
  }
);
