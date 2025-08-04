import { defineAction } from '@genkit-ai/core';
import { CampaignInputSchema, CampaignOutputSchema } from '../types';
import { generateVslFlow } from './generateVslFlow';
import { generateAdsFlow } from './generateAdsFlow';
import { registry } from '../lib/genkit';

/**
 * Master Campaign Flow - Main orchestration flow that coordinates
 * VSL and ads generation in parallel for maximum efficiency
 */
export const masterCampaignFlow = defineAction(
  registry,
  {
    name: 'masterCampaignFlow',
    inputSchema: CampaignInputSchema,
    outputSchema: CampaignOutputSchema,
    actionType: 'flow'
  },
  async (input) => {
    const { businessProfile, vslTitle, language } = input;

    // Execute VSL and Ads generation in parallel
    const [vslResult, adsResult] = await Promise.all([
      // Generate two versions of VSL script
      generateVslFlow({ businessProfile, vslTitle, language }),
      // Generate complete ads package  
      generateAdsFlow({ businessProfile, vslTitle, language })
    ]);

    return {
      vsl: vslResult,
      ads: adsResult,
      metadata: {
        title: vslTitle,
        generatedAt: new Date().toISOString(),
        businessProfile,
        language
      }
    };
  }
);