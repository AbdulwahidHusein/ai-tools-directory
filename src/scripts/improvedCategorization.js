/**
 * Improved Tool Categorization Script
 * 
 * This script implements a more accurate categorization system:
 * - Maximum 2 main categories per tool from the 35 predefined categories
 * - Preserves original scraped categories as subcategories
 * - Higher threshold for category matching for accuracy
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitools';

// Import the 35 main categories
const { ALL_CATEGORIES } = require('./populateCategories');

// Enhanced tool categorization function
async function improvedCategorization() {
  let client;
  
  try {
    console.log('Starting improved tool categorization...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Get total tool count
    const totalTools = await db.collection('tools').countDocuments();
    console.log(`Found ${totalTools} tools to categorize`);
    
    if (totalTools === 0) {
      console.log('No tools found in database. Please import tools first.');
      return;
    }
    
    // Improved mapping function with stricter criteria
    async function mapToolToCategories(tool) {
      try {
        // Create a comprehensive text to match against for better context
        const textToMatch = [
          (tool.name || '').repeat(3), // Give name higher weight by repeating it
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
        
        // Check each category for keyword matches with enhanced scoring
        for (const category of ALL_CATEGORIES) {
          let score = 0;
          const categoryNameLower = category.name.toLowerCase();
          
          // Direct match with category name (highest priority)
          if (textToMatch.includes(categoryNameLower)) {
            const exactMatches = (textToMatch.match(new RegExp(`\\b${categoryNameLower}\\b`, 'g')) || []).length;
            score += exactMatches * 15;
          }
          
          // Match with original categories (now treating these as important signals)
          const originalCategories = tool.categories?.original || [];
          for (const origCat of originalCategories) {
            const origCatLower = origCat.toLowerCase();
            
            // Check if original category contains main category name or vice versa
            if (origCatLower.includes(categoryNameLower) || 
                categoryNameLower.includes(origCatLower)) {
              score += 12;
              break;
            }
          }
          
          // Check keywords with weighted scoring
          for (const keyword of category.keywords || []) {
            const keywordLower = keyword.toLowerCase();
            
            // Exact word match with boundaries (highest keyword priority)
            const wordRegex = new RegExp(`\\b${keywordLower}\\b`, 'g');
            const exactMatches = (textToMatch.match(wordRegex) || []).length;
            if (exactMatches > 0) {
              // Higher score for matches in name/title (if they exist in first part of textToMatch)
              const inTitle = textToMatch.substring(0, tool.name?.length * 3 || 0).match(wordRegex);
              score += exactMatches * 3 + (inTitle ? 5 : 0);
            }
            
            // Partial match (less priority)
            if (textToMatch.includes(keywordLower)) {
              score += 1;
            }
          }
          
          // Apply category-specific logic to improve accuracy
          if (category.name === "Code Generation" && 
             (textToMatch.includes("code") || textToMatch.includes("programming") || 
              textToMatch.includes("developer") || textToMatch.includes("software"))) {
            score += 5;
          }
          
          if (category.name === "Image Generation" &&
             (textToMatch.includes("image") || textToMatch.includes("picture") || 
              textToMatch.includes("photo") || textToMatch.includes("art"))) {
            score += 5;
          }
          
          // Text generation often gets incorrectly categorized due to general terms
          // Add contextual checks to ensure it's actually about generating text
          if (category.name === "Text Generation") {
            if (textToMatch.includes("generate text") || 
                textToMatch.includes("text generator") || 
                textToMatch.includes("content writer") ||
                textToMatch.includes("writing assistant")) {
              score += 8;
            }
          }
          
          // Only consider categories with significant relevance (higher threshold)
          if (score >= 7) { // Higher threshold than before for stricter matching
            categoryMatches.push({ name: category.name, score });
          }
        }
        
        // Sort by score (descending)
        categoryMatches.sort((a, b) => b.score - a.score);
        
        // Take top 2 matches only if they have significant scores
        const topMatches = categoryMatches.slice(0, 2).filter(match => match.score >= 7);
        
        // If no strong matches, assign only to most relevant category or "Other"
        if (topMatches.length === 0) {
          return {
            main: categoryMatches.length > 0 ? [categoryMatches[0].name] : ["Other"],
            primary: categoryMatches.length > 0 ? categoryMatches[0].name : "Other",
            original: tool.categories?.original || [],
            subcategories: tool.categories?.original || [] // Use original categories as subcategories
          };
        }
        
        return {
          main: topMatches.map(match => match.name),
          primary: topMatches[0].name,
          original: tool.categories?.original || [],
          subcategories: tool.categories?.original || [] // Use original categories as subcategories
        };
      } catch (error) {
        console.error(`Error mapping categories for ${tool.name}:`, error);
        return {
          main: ["Other"],
          primary: "Other",
          original: tool.categories?.original || [],
          subcategories: tool.categories?.original || []
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
    let singleCategoryTools = 0;
    let dualCategoryTools = 0;
    let uncategorizedTools = 0;
    
    // Process tools
    let batchUpdateOps = [];
    
    console.log('Starting tool categorization...');
    
    while (await cursor.hasNext()) {
      const tool = await cursor.next();
      processedCount++;
      
      // Map tool to categories with improved logic
      const mappedCategories = await mapToolToCategories(tool);
      
      // Update statistics
      if (mappedCategories.main.length === 1) {
        if (mappedCategories.main[0] === "Other") {
          uncategorizedTools++;
        } else {
          singleCategoryTools++;
        }
      } else if (mappedCategories.main.length === 2) {
        dualCategoryTools++;
      }
      
      // Update category counts
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
    console.log('\nImproved categorization completed!');
    console.log(`Total tools processed: ${processedCount}`);
    console.log(`Tools with 1 category: ${singleCategoryTools} (${Math.round((singleCategoryTools / totalTools) * 100)}%)`);
    console.log(`Tools with 2 categories: ${dualCategoryTools} (${Math.round((dualCategoryTools / totalTools) * 100)}%)`);
    console.log(`Tools assigned to "Other" only: ${uncategorizedTools} (${Math.round((uncategorizedTools / totalTools) * 100)}%)`);
    
    console.log('\nMain category distribution:');
    ALL_CATEGORIES.forEach(cat => {
      const count = categoryCounts[cat.name] || 0;
      const percent = Math.round((count / totalTools) * 100);
      console.log(`${cat.name}: ${count} tools (${percent}%)`);
    });
    
    // Sample some tools to check categorization quality
    console.log('\nSampling 5 random tools to check categorization:');
    const sampleTools = await db.collection('tools').aggregate([{ $sample: { size: 5 } }]).toArray();
    
    for (const tool of sampleTools) {
      console.log(`\nTool: ${tool.name}`);
      console.log(`Main categories: ${tool.categories.main.join(', ')}`);
      console.log(`Primary category: ${tool.categories.primary}`);
      console.log(`Original categories: ${tool.categories.original.join(', ')}`);
    }
    
  } catch (error) {
    console.error('Error during categorization:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the improved categorization function
if (require.main === module) {
  improvedCategorization().catch(console.error);
}

module.exports = { improvedCategorization }; 