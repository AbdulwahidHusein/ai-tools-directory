/**
 * Enhanced Tool Categorization Script
 * 
 * This script implements a stricter, more accurate categorization system:
 * - Maximum 2 main categories per tool
 * - Higher threshold for category matching
 * - Support for subcategories
 * - Improved keyword relevance scoring
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitools';

// Import the 35 main categories
const { ALL_CATEGORIES } = require('./populateCategories');

// Define subcategories for each main category
const SUBCATEGORIES = {
  "Content Creation": [
    "Blog Content", "Social Media Content", "Marketing Content", "Creative Writing", 
    "Content Automation", "Content Optimization", "Multimedia Content"
  ],
  "Image Generation": [
    "Portrait Generation", "Art Generation", "Background Generation", "Product Images",
    "Logo Design", "Icon Generation", "Pattern Generation", "3D Image Generation"
  ],
  "Text Generation": [
    "Article Writing", "Story Generation", "Copywriting", "Script Writing",
    "Email Writing", "Report Generation", "Resume Writing", "Technical Writing"
  ],
  "Chatbots": [
    "Customer Support Bots", "Sales Bots", "Personal Assistant Bots", "Healthcare Bots",
    "Education Bots", "Entertainment Bots", "FAQ Bots", "HR Bots"
  ],
  "Writing Assistant": [
    "Grammar Checking", "Style Improvement", "Paraphrasing", "Summarization",
    "Content Expansion", "Plagiarism Detection", "Readability Improvement"
  ],
  "Video Creation": [
    "Video Animation", "Text-to-Video", "Video Editing", "Social Media Videos",
    "Explainer Videos", "Product Videos", "Educational Videos", "Marketing Videos"
  ],
  "Audio Generation": [
    "Voice Synthesis", "Text-to-Speech", "Music Generation", "Sound Effects",
    "Podcast Creation", "Audio Editing", "Audio Enhancement"
  ],
  "Code Generation": [
    "Web Development", "App Development", "Database Queries", "API Integration",
    "Testing Code", "Documentation Generation", "Code Optimization", "Code Refactoring"
  ],
  "Data Analysis": [
    "Data Visualization", "Statistical Analysis", "Predictive Analytics", "Data Mining",
    "Business Intelligence", "Data Cleaning", "Data Extraction", "Anomaly Detection"
  ],
  "Productivity": [
    "Task Management", "Time Tracking", "Note Taking", "Calendar Management",
    "Project Management", "Meeting Assistance", "Focus Improvement", "Workflow Automation"
  ],
  "Marketing": [
    "Email Marketing", "Content Marketing", "Social Media Marketing", "Influencer Marketing",
    "Ad Creation", "Market Research", "Campaign Analysis", "Audience Targeting"
  ],
  "Design": [
    "UI Design", "UX Design", "Graphic Design", "Web Design",
    "Product Design", "Logo Design", "Branding", "Prototyping"
  ],
  "Education": [
    "Learning Assistance", "Study Tools", "Language Learning", "Test Preparation",
    "Educational Content", "Tutoring", "Knowledge Management", "Academic Research"
  ],
  "Translation": [
    "Text Translation", "Real-time Translation", "Document Translation", "Website Translation",
    "Multilingual Content", "Localization", "Dialect Translation", "Technical Translation"
  ],
  "Research": [
    "Literature Review", "Data Collection", "Academic Writing", "Research Summarization",
    "Citation Management", "Scientific Analysis", "Hypothesis Testing", "Research Planning"
  ],
  "Healthcare": [
    "Medical Diagnosis", "Patient Management", "Healthcare Administration", "Mental Health",
    "Medical Research", "Fitness Planning", "Diet & Nutrition", "Health Monitoring"
  ],
  "Customer Service": [
    "Help Desk", "Ticketing Systems", "Customer Feedback", "Support Automation",
    "Call Center", "Customer Experience", "Knowledge Base", "Complaint Resolution"
  ],
  "Finance": [
    "Financial Analysis", "Investment Planning", "Accounting", "Budgeting",
    "Tax Preparation", "Financial Forecasting", "Risk Assessment", "Expense Tracking"
  ],
  "Legal": [
    "Document Analysis", "Contract Review", "Legal Research", "Compliance Checking",
    "Case Law", "IP Management", "Legal Writing", "Regulatory Updates"
  ],
  "Social Media": [
    "Content Scheduling", "Analytics", "Engagement", "Social Listening",
    "Profile Management", "Hashtag Generation", "Trend Analysis", "Audience Growth"
  ],
  "E-commerce": [
    "Product Listings", "Inventory Management", "Pricing Optimization", "Customer Reviews",
    "Shopping Assistants", "Recommendation Systems", "Order Processing", "Marketplace Integration"
  ],
  "Music": [
    "Music Composition", "Beat Making", "Lyric Generation", "Song Structure",
    "Melody Creation", "Music Arrangement", "Audio Mixing", "Voice Training"
  ],
  "Gaming": [
    "Game Development", "Character Design", "Level Generation", "Game Assets",
    "Game Testing", "Game Storytelling", "Game AI", "Multiplayer Systems"
  ],
  "Voice Assistant": [
    "Voice Commands", "Smart Home Control", "Voice Scheduling", "Voice Navigation",
    "Voice Search", "Voice Reminders", "Voice Dictation", "Voice Analytics"
  ],
  "Automation": [
    "Task Automation", "Process Automation", "Workflow Management", "Data Entry Automation",
    "Robotic Process Automation", "Scheduling Automation", "Email Automation", "Document Processing"
  ],
  "Email": [
    "Email Writing", "Email Management", "Email Automation", "Email Marketing",
    "Email Analysis", "Email Scheduling", "Email Templates", "Spam Detection"
  ],
  "Personal Assistant": [
    "Task Management", "Calendar Management", "Reminders", "Meeting Scheduling",
    "Travel Planning", "Information Lookup", "Personal Organization", "Daily Briefings"
  ],
  "Image Editing": [
    "Photo Enhancement", "Background Removal", "Color Correction", "Image Restoration",
    "Photo Manipulation", "Batch Processing", "Image Resizing", "Photo Filters"
  ],
  "Sales": [
    "Lead Generation", "Sales Outreach", "CRM Management", "Sales Analytics",
    "Deal Closing", "Sales Forecasting", "Sales Presentation", "Customer Tracking"
  ],
  "Speech Recognition": [
    "Transcription", "Voice Commands", "Voice Identification", "Accent Processing",
    "Meeting Transcription", "Voicemail to Text", "Dictation", "Multilingual Recognition"
  ],
  "Video Analysis": [
    "Object Detection", "Facial Recognition", "Scene Analysis", "Action Recognition",
    "Video Summarization", "Content Moderation", "Motion Tracking", "Sport Analysis"
  ],
  "Networking": [
    "Professional Connections", "Contact Management", "Event Networking", "Industry Groups",
    "Talent Sourcing", "Mentorship Matching", "Job Matching", "Community Building"
  ],
  "Language Learning": [
    "Vocabulary Building", "Grammar Learning", "Conversation Practice", "Translation Assistance",
    "Pronunciation Training", "Language Exercises", "Reading Comprehension", "Writing Improvement"
  ],
  "SEO": [
    "Keyword Research", "Content Optimization", "Link Building", "Technical SEO",
    "SEO Auditing", "Ranking Tracking", "Competitor Analysis", "Local SEO"
  ],
  "Other": [
    "Miscellaneous", "Experimental", "Multi-purpose", "Specialized Tools"
  ]
};

// Function to get subcategories for a tool based on its description and properties
function getSubcategories(tool, mainCategory) {
  if (!SUBCATEGORIES[mainCategory]) {
    return [];
  }
  
  const textToMatch = [
    tool.name || '',
    tool.description || '',
    tool.what_is || '',
    tool.how_to_use || '',
    ...(tool.categories?.original || []),
    ...(tool.tags || []),
  ].join(' ').toLowerCase();

  // Match subcategories based on text content
  return SUBCATEGORIES[mainCategory].filter(subcategory => {
    const keywords = subcategory.toLowerCase().split(' ');
    // Check if any keyword is present in the text
    return keywords.some(keyword => 
      textToMatch.includes(keyword) || 
      // Check for singular/plural variations
      (keyword.endsWith('s') && textToMatch.includes(keyword.slice(0, -1))) ||
      (!keyword.endsWith('s') && textToMatch.includes(keyword + 's'))
    );
  });
}

// Enhanced tool categorization function
async function enhancedCategorization() {
  let client;
  
  try {
    console.log('Starting enhanced tool categorization...');
    
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
    
    // Enhanced mapping function with stricter criteria
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
          
          // Match with original categories
          if (tool.categories?.original?.some(cat => 
              cat.toLowerCase().includes(categoryNameLower) || 
              categoryNameLower.includes(cat.toLowerCase())
          )) {
            score += 12;
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
          
          // Only consider categories with significant relevance (higher threshold)
          if (score >= 5) {
            categoryMatches.push({ name: category.name, score });
          }
        }
        
        // Sort by score (descending)
        categoryMatches.sort((a, b) => b.score - a.score);
        
        // Take top 2 matches only if they have significant scores
        const topMatches = categoryMatches.slice(0, 2).filter(match => match.score >= 5);
        
        // If no strong matches, assign only to most relevant category or "Other"
        if (topMatches.length === 0) {
          return {
            main: categoryMatches.length > 0 ? [categoryMatches[0].name] : ["Other"],
            primary: categoryMatches.length > 0 ? categoryMatches[0].name : "Other",
            original: tool.categories?.original || [],
            subcategories: []
          };
        }
        
        // Get subcategories for each main category
        const subcategories = [];
        for (const match of topMatches) {
          const cats = getSubcategories(tool, match.name);
          subcategories.push(...cats);
        }
        
        return {
          main: topMatches.map(match => match.name),
          primary: topMatches[0].name,
          original: tool.categories?.original || [],
          subcategories: [...new Set(subcategories)] // Remove duplicates
        };
      } catch (error) {
        console.error(`Error mapping categories for ${tool.name}:`, error);
        return {
          main: ["Other"],
          primary: "Other",
          original: tool.categories?.original || [],
          subcategories: []
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
    
    // Subcategory counters
    const subcategoryCounts = {};
    
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
      
      // Map tool to categories with enhanced logic
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
      
      // Update subcategory counts
      mappedCategories.subcategories.forEach(subcat => {
        subcategoryCounts[subcat] = (subcategoryCounts[subcat] || 0) + 1;
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
    console.log('\nEnhanced categorization completed!');
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
    
    console.log('\nTop subcategories:');
    Object.entries(subcategoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([subcat, count]) => {
        console.log(`${subcat}: ${count} tools`);
      });
    
  } catch (error) {
    console.error('Error during categorization:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the enhanced categorization function
if (require.main === module) {
  enhancedCategorization().catch(console.error);
}

module.exports = { enhancedCategorization }; 