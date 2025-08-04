import { CampaignInputSchema, CampaignOutputSchema } from '../types';
import { generateVslFlow } from './generateVslFlow';
import { generateAdsFlow } from './generateAdsFlow';
import { z } from 'zod';

/**
 * Master Campaign Flow - Main orchestration flow that coordinates
 * VSL and ads generation in parallel for maximum efficiency
 */
export async function masterCampaignFlow(input: z.infer<typeof CampaignInputSchema>): Promise<z.infer<typeof CampaignOutputSchema>> {
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