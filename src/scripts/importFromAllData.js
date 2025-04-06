/**
 * Import Data from AllData Directory
 * 
 * This script efficiently imports all 6823 JSON tool files from the allData/data directory
 * directly into MongoDB. It uses batching for optimal performance.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitools';
const DATA_DIR = path.resolve(process.cwd(), '../allData/data');
const BATCH_SIZE = 100; // Number of tools to insert in a single batch

// Main categories to map tools to
const MAIN_CATEGORIES = [
  {
    name: "Content Creation",
    slug: "content-creation",
    description: "AI tools for creating various types of content including text, images, and videos.",
    keywords: ["content", "creation", "generator", "creative"]
  },
  {
    name: "Image Generation & Editing",
    slug: "image-generation-editing", 
    description: "AI tools for generating and editing images, photos, and graphics.",
    keywords: ["image", "photo", "art", "editing", "pictures", "avatar", "background"]
  },
  {
    name: "Text Generation & Writing",
    slug: "text-generation-writing",
    description: "AI tools for writing, editing, and enhancing text content.",
    keywords: ["text", "writing", "content", "copy", "paraphrase", "rewrite", "summarize"]
  },
  {
    name: "Video Creation & Editing",
    slug: "video-creation-editing",
    description: "AI tools for creating and editing videos.",
    keywords: ["video", "editing", "animation", "film", "movie"]
  },
  {
    name: "Audio & Voice Tools",
    slug: "audio-voice-tools",
    description: "AI tools for audio processing, voice synthesis, and speech recognition.",
    keywords: ["audio", "voice", "speech", "sound", "music", "podcast"]
  },
  {
    name: "Chatbots & Conversational AI",
    slug: "chatbots-conversational-ai",
    description: "AI chatbots and conversational agents for various purposes.",
    keywords: ["chat", "chatbot", "conversation", "assistant", "messaging"]
  },
  {
    name: "Productivity & Workflow",
    slug: "productivity-workflow",
    description: "AI tools to improve productivity and streamline workflows.",
    keywords: ["productivity", "workflow", "automation", "efficiency", "organization"]
  },
  {
    name: "Code & Development",
    slug: "code-development",
    description: "AI tools for coding, programming, and software development.",
    keywords: ["code", "programming", "developer", "development", "software"]
  },
  {
    name: "Data Analysis & Visualization",
    slug: "data-analysis-visualization",
    description: "AI tools for analyzing and visualizing data.",
    keywords: ["data", "analysis", "analytics", "visualization", "insights"]
  },
  {
    name: "Business & Marketing",
    slug: "business-marketing",
    description: "AI tools for business operations and marketing.",
    keywords: ["business", "marketing", "SEO", "sales", "advertising", "promotion"]
  },
  {
    name: "Design & Creative Tools",
    slug: "design-creative-tools", 
    description: "AI tools for design and creative work.",
    keywords: ["design", "creative", "UI", "UX", "graphic", "logo"]
  },
  {
    name: "Education & Learning",
    slug: "education-learning",
    description: "AI tools for education and learning.",
    keywords: ["education", "learning", "teaching", "study", "tutor", "student"]
  },
  {
    name: "Language & Translation",
    slug: "language-translation",
    description: "AI tools for language processing and translation.",
    keywords: ["language", "translation", "translator", "multilingual"]
  },
  {
    name: "Research & Knowledge",
    slug: "research-knowledge",
    description: "AI tools for research and knowledge management.",
    keywords: ["research", "knowledge", "information", "academic", "study"]
  },
  {
    name: "Healthcare & Medicine",
    slug: "healthcare-medicine",
    description: "AI tools for healthcare and medicine.",
    keywords: ["health", "medical", "medicine", "healthcare", "diagnosis"]
  },
  {
    name: "AI Assistants",
    slug: "ai-assistants",
    description: "General AI assistants for various tasks.",
    keywords: ["assistant", "help", "support", "virtual assistant"]
  },
  {
    name: "Other",
    slug: "other",
    description: "Other AI tools that don't fit into the main categories.",
    keywords: []
  }
];

// Function to create a URL-friendly slug
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Function to map tool to main categories based on keywords
function mapToolToMainCategories(toolData) {
  try {
    // Extract categories from the tool data
    const categories = toolData.categories || [];
    
    // Remove the last category as it's typically the tool name
    const relevantCategories = categories.length > 1 ? categories.slice(0, -1) : categories;
    
    // Map to find matching main categories
    const matchedCategories = [];
    const originalCategories = [...relevantCategories];
    let primaryCategory = null;
    
    // First try direct matching with main category names
    for (const mainCategory of MAIN_CATEGORIES) {
      if (relevantCategories.includes(mainCategory.name)) {
        matchedCategories.push(mainCategory.name);
        if (!primaryCategory) primaryCategory = mainCategory.name;
      }
    }
    
    // If no direct matches, try keyword matching
    if (matchedCategories.length === 0) {
      // Create a single string from all categories and description for keyword matching
      const textToMatch = [
        ...relevantCategories,
        toolData.description || '',
        toolData.what_is || ''
      ].join(' ').toLowerCase();
      
      for (const mainCategory of MAIN_CATEGORIES) {
        if (!mainCategory.keywords || mainCategory.keywords.length === 0) continue;
        
        for (const keyword of mainCategory.keywords) {
          if (textToMatch.includes(keyword.toLowerCase())) {
            if (!matchedCategories.includes(mainCategory.name)) {
              matchedCategories.push(mainCategory.name);
              if (!primaryCategory) primaryCategory = mainCategory.name;
            }
            break; // Once a keyword matches, move to next category
          }
        }
      }
    }
    
    // If still no matches, assign to "Other"
    if (matchedCategories.length === 0) {
      matchedCategories.push("Other");
      primaryCategory = "Other";
    }
    
    return {
      main: matchedCategories,
      primary: primaryCategory,
      original: originalCategories
    };
  } catch (error) {
    console.error(`Error mapping categories for ${toolData.name}:`, error);
    return {
      main: ["Other"],
      primary: "Other",
      original: toolData.categories || []
    };
  }
}

// Function to transform a single tool's data
function transformToolData(data) {
  try {
    // Map the tool to main categories
    const mappedCategories = mapToolToMainCategories(data);
    
    // Generate a slug if none exists
    const slug = createSlug(data.name);
    
    // Transform data to our schema
    return {
      name: data.name,
      slug,
      description: data.description || '',
      website: data.actual_url || data.website || '',
      rating: data.rating ? { 
        score: parseFloat(data.rating) || 0,
        count: Math.floor(Math.random() * 500) + 50 // Random count for demo purposes
      } : { score: 0, count: 0 },
      image_url: data.image_url ? `/custom-images/${slug}.jpg` : "/placeholder-tool.svg",
      what_is: data.what_is || data.product_info?.what_is || '',
      how_to_use: data.how_to_use || data.product_info?.how_to_use || '',
      categories: mappedCategories,
      tags: data.tags || [],
      search_terms: [data.name, ...mappedCategories.main],
      core_features: data.core_features || [],
      use_cases: data.use_cases || [],
      created_at: new Date(),
      updated_at: new Date()
    };
  } catch (error) {
    console.error(`Error transforming data for ${data.name}:`, error);
    return null;
  }
}

// Checks if a directory exists
async function directoryExists(directoryPath) {
  try {
    const stats = await fs.stat(directoryPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

// Main function to import all tools
async function importAllTools() {
  let client;
  let successCount = 0;
  let errorCount = 0;
  let startTime = Date.now();
  
  try {
    console.log('Starting import process for all data...');
    
    // Verify the data directory exists
    if (!(await directoryExists(DATA_DIR))) {
      throw new Error(`Data directory not found at ${DATA_DIR}`);
    }
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Ensure the collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('categories')) {
      await db.createCollection('categories');
      console.log('Created categories collection');
    }
    
    if (!collectionNames.includes('tools')) {
      await db.createCollection('tools');
      console.log('Created tools collection');
    }
    
    // Create text indexes for search functionality if they don't exist
    try {
      const toolsIndexes = await db.collection('tools').indexes();
      const hasTextIndex = toolsIndexes.some(index => 
        index.name === 'text_search_index' || 
        (index.weights && index.weights.name && index.weights.description)
      );
      
      if (!hasTextIndex) {
        await db.collection('tools').createIndex({ 
          name: "text", 
          description: "text", 
          "categories.main": "text",
          tags: "text",
          search_terms: "text" 
        }, { name: "text_search_index" });
        console.log('Created text search index');
      } else {
        console.log('Text search index already exists');
      }
    } catch (error) {
      console.warn('Warning: Error checking or creating text index:', error.message);
      console.log('Continuing with import process...');
    }
    
    // Import categories if they don't exist yet
    const categoryCount = await db.collection('categories').countDocuments();
    if (categoryCount === 0) {
      const categoriesToInsert = MAIN_CATEGORIES.map(category => ({
        ...category,
        count: 0, // Will update counts later
        created_at: new Date(),
        updated_at: new Date()
      }));
      
      await db.collection('categories').insertMany(categoriesToInsert);
      console.log(`Inserted ${categoriesToInsert.length} categories`);
    } else {
      console.log(`Categories already exist (${categoryCount} found)`);
    }
    
    // Delete existing tools if requested
    const deleteExisting = process.argv.includes('--delete-existing');
    if (deleteExisting) {
      await db.collection('tools').deleteMany({});
      console.log('Deleted all existing tools');
    }
    
    // Get list of all JSON files
    const files = await fs.readdir(DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    console.log(`Found ${jsonFiles.length} JSON files to process in ${DATA_DIR}`);
    
    // Process files in batches
    let currentBatch = [];
    let processedCount = 0;
    
    for (const file of jsonFiles) {
      const filePath = path.join(DATA_DIR, file);
      
      try {
        // Read and parse the file
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        // Transform the data
        const transformedData = transformToolData(data);
        
        if (transformedData) {
          currentBatch.push(transformedData);
          
          // When batch size reached, insert to database
          if (currentBatch.length >= BATCH_SIZE) {
            try {
              const result = await db.collection('tools').insertMany(currentBatch, { ordered: false });
              successCount += result.insertedCount;
            } catch (insertError) {
              // Handle duplicate key errors (tools with the same slug)
              if (insertError.code === 11000) {
                console.warn(`Batch contains duplicate keys - some tools may be skipped`);
                // Even with errors, some documents may have been inserted
                successCount += insertError.result?.nInserted || 0;
              } else {
                throw insertError;
              }
            }
            
            processedCount += currentBatch.length;
            currentBatch = [];
            
            // Log progress
            const percentComplete = Math.floor((processedCount / jsonFiles.length) * 100);
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            console.log(`Progress: ${percentComplete}% (${processedCount}/${jsonFiles.length}), Time elapsed: ${elapsedSeconds}s`);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    // Insert any remaining tools in the last batch
    if (currentBatch.length > 0) {
      try {
        const result = await db.collection('tools').insertMany(currentBatch, { ordered: false });
        successCount += result.insertedCount;
      } catch (insertError) {
        // Handle duplicate key errors
        if (insertError.code === 11000) {
          console.warn(`Final batch contains duplicate keys - some tools may be skipped`);
          successCount += insertError.result?.nInserted || 0;
        } else {
          throw insertError;
        }
      }
    }
    
    // Update category counts
    console.log('Updating category counts...');
    for (const category of MAIN_CATEGORIES) {
      const count = await db.collection('tools').countDocuments({
        "categories.main": category.name
      });
      
      await db.collection('categories').updateOne(
        { name: category.name },
        { $set: { count, updated_at: new Date() } }
      );
    }
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    console.log(`\nImport completed in ${totalTime} seconds`);
    console.log(`Successfully imported ${successCount} tools`);
    
    if (errorCount > 0) {
      console.log(`Encountered errors with ${errorCount} files`);
    }
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the import
importAllTools().catch(console.error); 