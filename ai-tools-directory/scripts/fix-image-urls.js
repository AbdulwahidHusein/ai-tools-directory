// Script to fix image URLs in MongoDB by restoring original CDN URLs from the JSON data
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../../../.env.local') });

// Use the MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

console.log('MongoDB URI:', MONGODB_URI ? 'Found' : 'Not found');

// Path to the original JSON data file containing correct image URLs
const JSON_DATA_PATH = path.join(__dirname, '../../../AllData/mongodb_import.json');

async function main() {
  console.log('Starting image URL fix process...');
  
  if (!MONGODB_URI) {
    console.error('MongoDB connection string not found in environment variables');
    return;
  }
  
  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const toolsCollection = db.collection('tools');
    
    // Read the original JSON data
    console.log(`Reading JSON data from ${JSON_DATA_PATH}`);
    
    // Check if the JSON file exists
    if (!fs.existsSync(JSON_DATA_PATH)) {
      console.error(`JSON file not found: ${JSON_DATA_PATH}`);
      return;
    }
    
    const jsonData = JSON.parse(fs.readFileSync(JSON_DATA_PATH, 'utf8'));
    
    // Create a map for efficient lookup by slug
    const imageUrlMap = new Map();
    jsonData.forEach(tool => {
      if (tool.slug && tool.image_url) {
        imageUrlMap.set(tool.slug, tool.image_url);
      }
    });
    
    console.log(`Loaded ${imageUrlMap.size} tools with image URLs from JSON`);
    
    // Update the database records
    let updatedCount = 0;
    let notFoundCount = 0;
    
    // Process in batches to avoid overwhelming the database
    const allTools = await toolsCollection.find({}).toArray();
    console.log(`Found ${allTools.length} tools in the database`);
    
    for (const tool of allTools) {
      if (tool.slug && imageUrlMap.has(tool.slug)) {
        const correctImageUrl = imageUrlMap.get(tool.slug);
        
        // Only update if the current URL is different or doesn't exist
        if (!tool.image_url || !tool.image_url.includes('cdn-images.toolify.ai')) {
          console.log(`Updating ${tool.slug}: ${tool.image_url} → ${correctImageUrl}`);
          
          await toolsCollection.updateOne(
            { slug: tool.slug },
            { $set: { image_url: correctImageUrl } }
          );
          
          updatedCount++;
        }
      } else {
        notFoundCount++;
        if (notFoundCount < 10) {  // Limit the log to avoid flooding console
          console.log(`No image URL found for slug: ${tool.slug}`);
        }
      }
    }
    
    console.log(`Image URL fix completed!`);
    console.log(`Updated ${updatedCount} tools with correct image URLs`);
    console.log(`${notFoundCount} tools had no matching entry in the JSON data`);
    
  } catch (error) {
    console.error('Error updating image URLs:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error); 