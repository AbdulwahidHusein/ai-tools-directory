/**
 * Fix Image URLs in MongoDB
 * 
 * This script corrects the image_url values in the database by restoring
 * the original CDN URLs from the allData/data directory.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '../../.env.local') });

// Try multiple possible locations for the data directory
const possibleDataPaths = [
  path.resolve(process.cwd(), '../../AllData/data'),
  path.resolve(process.cwd(), '../../../AllData/data'),
  path.resolve(process.cwd(), '../AllData/data'),
  path.resolve(process.cwd(), '../../../../AllData/data'),
];

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;
const BATCH_SIZE = 50;

// Function to create a URL-friendly slug (same as in the original import script)
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Find the correct data directory
async function findDataDir() {
  for (const dirPath of possibleDataPaths) {
    try {
      await fs.access(dirPath);
      console.log(`Found data directory at: ${dirPath}`);
      return dirPath;
    } catch (error) {
      console.log(`Directory not found at: ${dirPath}`);
    }
  }
  throw new Error('Could not find AllData/data directory in any of the expected locations');
}

// Main function to fix all tool image URLs
async function fixImageUrls() {
  let client;
  let updateCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;
  let startTime = Date.now();
  
  try {
    console.log('Starting image URL fix process...');
    console.log('Current working directory:', process.cwd());
    
    // Find the correct data directory
    const DATA_DIR = await findDataDir();
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const toolsCollection = db.collection('tools');
    
    // Get list of all tools in the database
    const dbTools = await toolsCollection.find({}).toArray();
    console.log(`Found ${dbTools.length} tools in the database`);
    
    // Create a map of slug -> image_url for faster lookup
    const toolImageMap = new Map();
    
    // Process each JSON file to extract original image URLs
    console.log(`Reading original data files from ${DATA_DIR}...`);
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON files to process`);
    
    let processedFilesCount = 0;
    
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(DATA_DIR, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (data.name && data.image_url) {
          const slug = createSlug(data.name);
          toolImageMap.set(slug, data.image_url);
        }
        
        processedFilesCount++;
        if (processedFilesCount % 1000 === 0) {
          console.log(`Processed ${processedFilesCount}/${jsonFiles.length} files`);
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`Loaded ${toolImageMap.size} image URLs from JSON files`);
    
    // Update each tool in batches
    let batch = [];
    let processedTools = 0;
    
    for (const tool of dbTools) {
      if (tool.slug && toolImageMap.has(tool.slug)) {
        const originalImageUrl = toolImageMap.get(tool.slug);
        
        // Skip if the image URL is already correct (already a CDN URL)
        if (tool.image_url && tool.image_url.includes('cdn-images.toolify.ai')) {
          continue;
        }
        
        // Add update operation to batch
        batch.push({
          updateOne: {
            filter: { _id: tool._id },
            update: { $set: { image_url: originalImageUrl } }
          }
        });
        
        // When batch size is reached, execute the batch update
        if (batch.length >= BATCH_SIZE) {
          const result = await toolsCollection.bulkWrite(batch);
          updateCount += result.modifiedCount;
          
          processedTools += batch.length;
          batch = [];
          
          // Log progress
          const percentComplete = Math.floor((processedTools / dbTools.length) * 100);
          console.log(`Progress: ${percentComplete}% (${processedTools}/${dbTools.length} tools processed)`);
        }
      } else {
        notFoundCount++;
        if (notFoundCount < 10) { // Limit logging to avoid console flood
          console.log(`No image URL found for tool: ${tool.name} (${tool.slug})`);
        } else if (notFoundCount === 10) {
          console.log('More tools with missing image URLs found (not showing all)...');
        }
      }
    }
    
    // Process any remaining tools in the batch
    if (batch.length > 0) {
      const result = await toolsCollection.bulkWrite(batch);
      updateCount += result.modifiedCount;
    }
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    console.log(`\nImage URL fix completed in ${totalTime} seconds`);
    console.log(`Successfully updated ${updateCount} tool image URLs`);
    
    if (notFoundCount > 0) {
      console.log(`${notFoundCount} tools had no matching image URL in the original data`);
    }
    
    if (errorCount > 0) {
      console.log(`Encountered errors with ${errorCount} files`);
    }
    
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the fix
fixImageUrls().catch(console.error); 