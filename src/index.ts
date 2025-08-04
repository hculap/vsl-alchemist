import './lib/genkit'; // Import the shared genkit instance
import dotenv from 'dotenv';

dotenv.config();

// Import and register flows
import './flows/masterCampaignFlow';
import './flows/generateVslFlow';
import './flows/generateAdsFlow';
import './flows/generateTitlesFlow';