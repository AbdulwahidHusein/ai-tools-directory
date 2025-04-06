/**
 * Remap Tool Categories Script
 * 
 * This script remaps all tools in the database to the 35 predefined categories
 * using enhanced matching logic for better category distribution.
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitools';

// Import the same categories from populateCategories script
const ALL_CATEGORIES = require('./populateCategories').ALL_CATEGORIES;

// Enhanced mapping function to categorize tools better
async function remapToolCategories() {
  let client;
  
  try {
    console.log('Starting tool category remapping...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Get total tool count
    const totalTools = await db.collection('tools').countDocuments();
    console.log(`Found ${totalTools} tools to remap`);
    
    if (totalTools === 0) {
      console.log('No tools found in database. Please import tools first.');
      return;
    }
    
    // Enhanced mapping function with better text analysis
    async function mapToolToCategories(tool) {
      try {
        // Create a single text to match against for better context
        const textToMatch = [
          tool.name || '',
          tool.description || '',
          tool.what_is || '',
          tool.how_to_use || '',
          ...(tool.categories?.original || []),
          ...(tool.tags || []),
          ...(tool.core_features || []),
          ...(tool.use_cases || [])
        ].join(' ').toLowerCase();
        
        // Store matching categories with their score
        const categoryMatches = [];
        
        // Check each category for keyword matches
        for (const category of ALL_CATEGORIES) {
          let score = 0;
          
          // Add score for name match (highest priority)
          if (tool.categories?.original?.includes(category.name)) {
            score += 10;
          }
          
          // Check keywords - assign higher score for exact matches
          for (const keyword of category.keywords || []) {
            // Exact word match (with word boundaries)
            const wordRegex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
            const matches = textToMatch.match(wordRegex);
            if (matches) {
              score += matches.length * 2;
            }
            
            // Partial match (anywhere in text)
            if (textToMatch.includes(keyword.toLowerCase())) {
              score += 1;
            }
          }
          
          // If there's any score, add to matches
          if (score > 0) {
            categoryMatches.push({ name: category.name, score });
          }
        }
        
        // Sort by score (descending)
        categoryMatches.sort((a, b) => b.score - a.score);
        
        // Take top matches (up to 3)
        const topMatches = categoryMatches.slice(0, 3);
        
        // If no matches, assign to "Other"
        if (topMatches.length === 0) {
          return {
            main: ["Other"],
            primary: "Other",
            original: tool.categories?.original || []
          };
        }
        
        return {
          main: topMatches.map(match => match.name),
          primary: topMatches[0].name,
          original: tool.categories?.original || []
        };
      } catch (error) {
        console.error(`Error mapping categories for ${tool.name}:`, error);
        return {
          main: ["Other"],
          primary: "Other",
          original: tool.categories?.original || []
        };
      }
    }
    
    // Process tools in batches for better performance
    const BATCH_SIZE = 100;
    let processedCount = 0;
    
    // Get all tools from database
    const cursor = db.collection('tools').find({});
    
    // Category counters to track distribution
    const categoryCounts = {};
    ALL_CATEGORIES.forEach(cat => {
      categoryCounts[cat.name] = 0;
    });
    
    // Track stats for logging
    let unmappedTools = 0;
    
    // Process tools
    let batch = [];
    let batchUpdateOps = [];
    
    console.log('Starting tool remapping...');
    
    while (await cursor.hasNext()) {
      const tool = await cursor.next();
      processedCount++;
      
      // Map tool to categories
      const mappedCategories = await mapToolToCategories(tool);
      
      // Update category counts
      if (mappedCategories.main.includes("Other") && mappedCategories.main.length === 1) {
        unmappedTools++;
      }
      
      mappedCategories.main.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      
      // Add to batch update
      batchUpdateOps.push({
        updateOne: {
          filter: { _id: tool._id },
          update: { $set: { categories: mappedCategories } }
        }
      });
      
      // When batch is full, update database
      if (batchUpdateOps.length >= BATCH_SIZE) {
        await db.collection('tools').bulkWrite(batchUpdateOps);
        batchUpdateOps = [];
        
        // Log progress
        const percentComplete = Math.floor((processedCount / totalTools) * 100);
        console.log(`Progress: ${percentComplete}% (${processedCount}/${totalTools})`);
      }
    }
    
    // Process any remaining updates
    if (batchUpdateOps.length > 0) {
      await db.collection('tools').bulkWrite(batchUpdateOps);
    }
    
    // Update category counts in categories collection
    console.log('Updating category counts in database...');
    for (const category of ALL_CATEGORIES) {
      const count = categoryCounts[category.name] || 0;
      await db.collection('categories').updateOne(
        { name: category.name },
        { $set: { count, updated_at: new Date() } }
      );
    }
    
    // Log results
    console.log('\nRemapping completed!');
    console.log(`Total tools processed: ${processedCount}`);
    console.log(`Tools mapped to "Other" only: ${unmappedTools} (${Math.round((unmappedTools / totalTools) * 100)}%)`);
    
    console.log('\nCategory distribution:');
    ALL_CATEGORIES.forEach(cat => {
      const count = categoryCounts[cat.name] || 0;
      const percent = Math.round((count / totalTools) * 100);
      console.log(`${cat.name}: ${count} tools (${percent}%)`);
    });
    
  } catch (error) {
    console.error('Error during remapping:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Make ALL_CATEGORIES available for import
module.exports = { ALL_CATEGORIES };

// Run the remapping function
if (require.main === module) {
  remapToolCategories().catch(console.error);
} 