const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateAllToPolish() {
  try {
    console.log('🇵🇱 Updating all existing data to Polish...\n');
    
    // Update Business Profiles
    console.log('🔄 Step 1: Updating business profiles...');
    const profileCountResult = await pool.query('SELECT COUNT(*) FROM business_profiles');
    const totalProfiles = parseInt(profileCountResult.rows[0].count);
    
    if (totalProfiles > 0) {
      const profileUpdateResult = await pool.query(`
        UPDATE business_profiles 
        SET language = 'pl', updated_at = CURRENT_TIMESTAMP 
        WHERE language IS NULL OR language != 'pl'
      `);
      console.log(`✅ Updated ${profileUpdateResult.rowCount} business profiles to Polish`);
    } else {
      console.log('ℹ️  No business profiles to update');
    }
    
    // Update Campaigns
    console.log('\n🔄 Step 2: Updating campaigns...');
    const campaignCountResult = await pool.query('SELECT COUNT(*) FROM campaigns');
    const totalCampaigns = parseInt(campaignCountResult.rows[0].count);
    
    if (totalCampaigns > 0) {
      const campaignUpdateResult = await pool.query(`
        UPDATE campaigns 
        SET language = 'pl', updated_at = CURRENT_TIMESTAMP 
        WHERE language IS NULL OR language != 'pl'
      `);
      console.log(`✅ Updated ${campaignUpdateResult.rowCount} campaigns to Polish`);
    } else {
      console.log('ℹ️  No campaigns to update');
    }
    
    // Final verification
    console.log('\n📋 Final verification:');
    
    const profileVerifyResult = await pool.query(`
      SELECT language, COUNT(*) as count 
      FROM business_profiles 
      GROUP BY language
    `);
    console.log('Business Profiles:');
    profileVerifyResult.rows.forEach(row => {
      console.log(`  - ${row.language || 'NULL'}: ${row.count} profiles`);
    });
    
    const campaignVerifyResult = await pool.query(`
      SELECT language, COUNT(*) as count 
      FROM campaigns 
      GROUP BY language
    `);
    console.log('Campaigns:');
    campaignVerifyResult.rows.forEach(row => {
      console.log(`  - ${row.language || 'NULL'}: ${row.count} campaigns`);
    });
    
    console.log('\n🎉 All data successfully updated to Polish!');
    
  } catch (error) {
    console.error('❌ Error updating data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
updateAllToPolish()
  .then(() => {
    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }); 