import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../lib/auth';
import { BusinessProfileSchema } from '../types';
import { 
  createBusinessProfile, 
  getBusinessProfile, 
  getUserBusinessProfiles, 
  updateBusinessProfile 
} from '../lib/models';

export const profileRoutes = Router();

// All profile routes require authentication
profileRoutes.use(requireAuth);

// Create business profile
profileRoutes.post('/', async (req: AuthRequest, res) => {
  try {
    const profileData = BusinessProfileSchema.parse(req.body);
    
    const result = await createBusinessProfile(req.user!.id, profileData);
    if (!result) {
      return res.status(400).json({ error: 'Failed to create business profile' });
    }

    res.status(201).json({
      message: 'Business profile created successfully',
      profileId: result.id
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all user's business profiles
profileRoutes.get('/', async (req: AuthRequest, res) => {
  try {
    const profiles = await getUserBusinessProfiles(req.user!.id);
    res.json({ profiles });
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific business profile
profileRoutes.get('/:id', async (req: AuthRequest, res) => {
  try {
    const profileId = parseInt(req.params.id);
    if (isNaN(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }

    const profile = await getBusinessProfile(req.user!.id, profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Business profile not found' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update business profile
profileRoutes.put('/:id', async (req: AuthRequest, res) => {
  try {
    const profileId = parseInt(req.params.id);
    if (isNaN(profileId)) {
      return res.status(400).json({ error: 'Invalid profile ID' });
    }

    const profileData = BusinessProfileSchema.parse(req.body);
    
    const success = await updateBusinessProfile(req.user!.id, profileId, profileData);
    if (!success) {
      return res.status(404).json({ error: 'Business profile not found or update failed' });
    }

    res.json({ message: 'Business profile updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});