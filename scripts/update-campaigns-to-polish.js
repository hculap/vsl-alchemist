const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateCampaignsToPolish() {
  try {
    console.log('🔄 Updating all existing campaigns to Polish...');
    
    // First, let's check how many campaigns exist
    const countResult = await pool.query('SELECT COUNT(*) FROM campaigns');
    const totalCampaigns = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Found ${totalCampaigns} campaigns to update`);
    
    if (totalCampaigns === 0) {
      console.log('✅ No campaigns to update');
      return;
    }
    
    // Update all campaigns to have Polish language
    const updateResult = await pool.query(`
      UPDATE campaigns 
      SET language = 'pl', updated_at = CURRENT_TIMESTAMP 
      WHERE language IS NULL OR language != 'pl'
    `);
    
    const updatedCount = updateResult.rowCount;
    console.log(`✅ Successfully updated ${updatedCount} campaigns to Polish`);
    
    // Verify the update
    const verifyResult = await pool.query(`
      SELECT language, COUNT(*) as count 
      FROM campaigns 
      GROUP BY language
    `);
    
    console.log('📋 Language distribution after update:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.language || 'NULL'}: ${row.count} campaigns`);
    });
    
  } catch (error) {
    console.error('❌ Error updating campaigns:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
updateCampaignsToPolish()
  .then(() => {
    console.log('🎉 Campaign update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Campaign update failed:', error);
    process.exit(1);
  }); 