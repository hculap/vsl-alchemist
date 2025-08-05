import express from 'express';
import { requireAuth, AuthRequest } from '../lib/auth';
import { pool } from '../lib/database';
import { masterCampaignFlow } from '../flows/masterCampaignFlow';
import { generateTitlesFlow } from '../flows/generateTitlesFlow';
import { LANGUAGE_NAMES, LANGUAGE_PROMPTS, createCampaign, getUserCampaigns } from '../lib/models';

const router = express.Router();

// Get available languages
router.get('/languages', (req, res) => {
  res.json({ 
    languages: Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
      code,
      name
    }))
  });
});

// Get all campaigns for the authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const campaigns = await getUserCampaigns(req.user!.id);
    res.json({ campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Generate titles for a business profile
router.post('/generate-titles', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { businessProfileId } = req.body;
    
    // Get the business profile
    const profileResult = await pool.query(
      'SELECT * FROM business_profiles WHERE id = $1 AND user_id = $2',
      [businessProfileId, req.user!.id]
    );
    
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business profile not found' });
    }
    
    const businessProfile = profileResult.rows[0];
    
    // Generate titles using the detected language
    const result = await generateTitlesFlow({
      businessProfile: {
        ...businessProfile,
        language: businessProfile.language || 'pl'
      }
    });
    
    res.json({ titles: result.titles });
  } catch (error) {
    console.error('Generate titles error:', error);
    res.status(500).json({ error: 'Failed to generate titles' });
  }
});

// Generate a complete campaign
router.post('/generate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { businessProfileId, vslTitle, language } = req.body;
    
    // Get the business profile
    const profileResult = await pool.query(
      'SELECT * FROM business_profiles WHERE id = $1 AND user_id = $2',
      [businessProfileId, req.user!.id]
    );
    
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business profile not found' });
    }
    
    const businessProfile = profileResult.rows[0];
    
    // Use provided language or fall back to detected language from profile
    const campaignLanguage = language || businessProfile.language || 'pl';
    
    // Generate campaign using the selected language
    const result = await masterCampaignFlow({
      businessProfile: {
        ...businessProfile,
        language: campaignLanguage
      },
      vslTitle,
      language: campaignLanguage
    });
    
    // Save campaign to database using the correct schema
    const campaignResult = await createCampaign(
      req.user!.id,
      businessProfileId,
      vslTitle,
      result
    );
    
    if (!campaignResult) {
      return res.status(500).json({ error: 'Failed to save campaign' });
    }
    
    res.json({ 
      campaign: {
        ...result,
        id: campaignResult.id,
        metadata: {
          ...result.metadata,
          language: campaignLanguage,
          languageName: LANGUAGE_NAMES[campaignLanguage as keyof typeof LANGUAGE_NAMES] || 'English'
        }
      }
    });
  } catch (error) {
    console.error('Generate campaign error:', error);
    res.status(500).json({ error: 'Failed to generate campaign' });
  }
});

// Get a specific campaign
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, bp.offer, bp.avatar, bp.problems, bp.desires, bp.tone
       FROM campaigns c
       JOIN business_profiles bp ON c.business_profile_id = bp.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [req.params.id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    const row = result.rows[0];
    
    // Reconstruct the campaign data from individual columns
    const campaign = {
      vsl: {
        vslScriptA: row.vsl_script_a,
        vslScriptB: row.vsl_script_b
      },
      ads: {
        videoScripts: row.video_scripts,
        adCopyA: row.ad_copy_a,
        adCopyB: row.ad_copy_b,
        headlineA: row.headline_a,
        headlineB: row.headline_b
      },
      metadata: {
        title: row.vsl_title,
        generatedAt: row.created_at.toISOString(),
        businessProfile: {
          offer: row.offer,
          avatar: row.avatar,
          problems: row.problems,
          desires: row.desires,
          tone: row.tone,
          language: row.language || 'pl'
        },
        language: row.language || 'pl'
      }
    };
    
    res.json({ campaign });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Delete a campaign
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user!.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

export default router;