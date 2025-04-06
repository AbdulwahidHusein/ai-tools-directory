const { MongoClient } = require('mongodb');

async function checkCategories() {
  const uri = 'mongodb://localhost:27017/aitools';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Count categories
    const categoriesCount = await db.collection('categories').countDocuments();
    console.log(`Total categories in database: ${categoriesCount}`);
    
    // Get all categories
    const categories = await db.collection('categories').find({}).toArray();
    console.log('Category names:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}): ${cat.count || 0} tools`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

checkCategories().catch(console.error); 