// MongoDB script to delete duplicate "The Gym Armenia" leads
// Run with: node cleanup-duplicates.js

const { MongoClient } = require('mongodb');

async function cleanupDuplicates() {
  // Use the correct MongoDB URI
  const mongoUri = 'mongodb://localhost:3979/clozzet_v2';

  console.log(`[CLEANUP] Connecting to: ${mongoUri}`);
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    console.log('[CLEANUP] Connected to MongoDB');

    const db = client.db();
    const customersCollection = db.collection('customers');

    // Find all customers with company name "The Gym Armenia"
    const companyName = 'The Gym Armenia';
    const duplicates = await customersCollection.find({ companyName: companyName }).toArray();

    console.log(`[CLEANUP] Found ${duplicates.length} customers with name: "${companyName}"`);

    if (duplicates.length > 0) {
      console.log('[CLEANUP] Customer IDs to delete:');
      duplicates.forEach((customer, index) => {
        console.log(`  ${index + 1}. ID: ${customer._id}, Contact: ${customer.contactPerson || 'N/A'}`);
      });

      // Delete ALL of them
      const result = await customersCollection.deleteMany({ companyName: companyName });
      console.log(`[CLEANUP] ✓ Deleted ${result.deletedCount} customers`);

      // Also delete their interactions
      const interactionsCollection = db.collection('interactions');
      const customerIds = duplicates.map(c => c._id);
      const interactionsResult = await interactionsCollection.deleteMany({
        customerId: { $in: customerIds }
      });
      console.log(`[CLEANUP] ✓ Deleted ${interactionsResult.deletedCount} related interactions`);
    } else {
      console.log('[CLEANUP] No duplicates found to delete');
    }

  } catch (error) {
    console.error('[CLEANUP] Error:', error.message);
  } finally {
    await client.close();
    console.log('[CLEANUP] Connection closed');
  }
}

cleanupDuplicates();
