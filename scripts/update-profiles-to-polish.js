const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateProfilesToPolish() {
  try {
    console.log('🔄 Updating all existing business profiles to Polish...');
    
    // First, let's check how many profiles exist
    const countResult = await pool.query('SELECT COUNT(*) FROM business_profiles');
    const totalProfiles = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Found ${totalProfiles} business profiles to update`);
    
    if (totalProfiles === 0) {
      console.log('✅ No profiles to update');
      return;
    }
    
    // Update all profiles to have Polish language
    const updateResult = await pool.query(`
      UPDATE business_profiles 
      SET language = 'pl', updated_at = CURRENT_TIMESTAMP 
      WHERE language IS NULL OR language != 'pl'
    `);
    
    const updatedCount = updateResult.rowCount;
    console.log(`✅ Successfully updated ${updatedCount} profiles to Polish`);
    
    // Verify the update
    const verifyResult = await pool.query(`
      SELECT language, COUNT(*) as count 
      FROM business_profiles 
      GROUP BY language
    `);
    
    console.log('📋 Language distribution after update:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.language || 'NULL'}: ${row.count} profiles`);
    });
    
  } catch (error) {
    console.error('❌ Error updating profiles:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
updateProfilesToPolish()
  .then(() => {
    console.log('🎉 Profile update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Profile update failed:', error);
    process.exit(1);
  }); 