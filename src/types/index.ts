import { z } from 'zod';

// Business Profile Schema
export const BusinessProfileSchema = z.object({
  offer: z.string().describe('Description of the high-ticket offer'),
  avatar: z.string().describe('Detailed description of ideal client avatar'),
  problems: z.string().describe('Main problems and frustrations of the client'),
  desires: z.string().describe('Client desires and wanted outcomes'),
  tone: z.enum(['Professional', 'Funny', 'Inspiring', 'Direct']).describe('Brand voice tone'),
  language: z.string().default('en').describe('Language for content generation')
});

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

// Campaign Input Schema
export const CampaignInputSchema = z.object({
  businessProfile: BusinessProfileSchema,
  vslTitle: z.string().describe('Selected VSL title for the campaign'),
  language: z.string().default('en').describe('Language for campaign generation')
});

export type CampaignInput = z.infer<typeof CampaignInputSchema>;

// VSL Output Schema
export const VslOutputSchema = z.object({
  vslScriptA: z.string().describe('First version of VSL script'),
  vslScriptB: z.string().describe('Second version of VSL script')
});

export type VslOutput = z.infer<typeof VslOutputSchema>;

// Ads Output Schema
export const AdsOutputSchema = z.object({
  videoScripts: z.array(z.string()).length(4).describe('Four video ad scripts'),
  adCopyA: z.string().describe('First version of ad copy'),
  adCopyB: z.string().describe('Second version of ad copy'),
  headlineA: z.string().describe('First version of ad headline'),
  headlineB: z.string().describe('Second version of ad headline')
});

export type AdsOutput = z.infer<typeof AdsOutputSchema>;

// Complete Campaign Output Schema
export const CampaignOutputSchema = z.object({
  vsl: VslOutputSchema,
  ads: AdsOutputSchema,
  metadata: z.object({
    title: z.string(),
    generatedAt: z.string(),
    businessProfile: BusinessProfileSchema,
    language: z.string()
  })
});

export type CampaignOutput = z.infer<typeof CampaignOutputSchema>;