/**
 * Populate Categories Script
 * 
 * This script adds all 35 predefined categories to the MongoDB database.
 * It will create a full set of categories for the AI Tools Directory.
 */

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitools';

// All 35 categories for the AI Tools Directory
const ALL_CATEGORIES = [
  {
    name: "Content Creation",
    slug: "content-creation",
    description: "AI tools for creating various types of content including text, images, and videos.",
    count: 0,
    display_order: 1,
    keywords: ["content", "creation", "generator", "creative"]
  },
  {
    name: "Image Generation",
    slug: "image-generation",
    description: "AI tools for generating images, artwork, and graphics from text descriptions.",
    count: 0,
    display_order: 2,
    keywords: ["image", "art", "generation", "pictures", "create", "midjourney"]
  },
  {
    name: "Text Generation",
    slug: "text-generation",
    description: "AI tools for generating text content such as articles, stories, and reports.",
    count: 0,
    display_order: 3,
    keywords: ["text", "generation", "content", "writing", "create"]
  },
  {
    name: "Chatbots",
    slug: "chatbots",
    description: "AI chatbots and conversational agents for various purposes.",
    count: 0,
    display_order: 4,
    keywords: ["chat", "chatbot", "conversation", "assistant", "messaging"]
  },
  {
    name: "Writing Assistant",
    slug: "writing-assistant",
    description: "AI tools that help with writing, editing, and enhancing text content.",
    count: 0,
    display_order: 5,
    keywords: ["writing", "assistant", "editing", "grammar", "content"]
  },
  {
    name: "Video Creation",
    slug: "video-creation",
    description: "AI tools for creating and editing videos from text or images.",
    count: 0,
    display_order: 6,
    keywords: ["video", "creation", "editing", "animation", "movie"]
  },
  {
    name: "Audio Generation",
    slug: "audio-generation",
    description: "AI tools for generating audio content including speech and music.",
    count: 0,
    display_order: 7,
    keywords: ["audio", "generation", "speech", "music", "sound"]
  },
  {
    name: "Code Generation",
    slug: "code-generation",
    description: "AI tools that generate and assist with programming code.",
    count: 0,
    display_order: 8,
    keywords: ["code", "programming", "development", "generation", "software"]
  },
  {
    name: "Data Analysis",
    slug: "data-analysis",
    description: "AI tools for analyzing and extracting insights from data.",
    count: 0,
    display_order: 9,
    keywords: ["data", "analysis", "analytics", "insights", "statistics"]
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "AI tools to improve productivity and streamline workflows.",
    count: 0,
    display_order: 10,
    keywords: ["productivity", "workflow", "efficiency", "time-saving", "automation"]
  },
  {
    name: "Marketing",
    slug: "marketing",
    description: "AI tools for marketing campaigns, SEO, and customer engagement.",
    count: 0,
    display_order: 11,
    keywords: ["marketing", "SEO", "advertising", "promotion", "customers"]
  },
  {
    name: "Design",
    slug: "design",
    description: "AI tools for graphic design, UI/UX design, and creative work.",
    count: 0,
    display_order: 12,
    keywords: ["design", "graphic", "UI", "UX", "creative", "logo"]
  },
  {
    name: "Education",
    slug: "education",
    description: "AI tools for learning, teaching, and educational content.",
    count: 0,
    display_order: 13,
    keywords: ["education", "learning", "teaching", "study", "student"]
  },
  {
    name: "Translation",
    slug: "translation",
    description: "AI tools for language translation and multilingual content.",
    count: 0,
    display_order: 14,
    keywords: ["translation", "language", "multilingual", "translator"]
  },
  {
    name: "Research",
    slug: "research",
    description: "AI tools for academic and scientific research.",
    count: 0,
    display_order: 15,
    keywords: ["research", "academic", "scientific", "study", "investigation"]
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    description: "AI tools for healthcare, medicine, and wellness.",
    count: 0,
    display_order: 16,
    keywords: ["healthcare", "medical", "medicine", "health", "wellness"]
  },
  {
    name: "Customer Service",
    slug: "customer-service",
    description: "AI tools for customer support and service automation.",
    count: 0,
    display_order: 17,
    keywords: ["customer", "service", "support", "helpdesk", "assistance"]
  },
  {
    name: "Finance",
    slug: "finance",
    description: "AI tools for financial analysis, planning, and management.",
    count: 0,
    display_order: 18,
    keywords: ["finance", "financial", "money", "investment", "banking"]
  },
  {
    name: "Legal",
    slug: "legal",
    description: "AI tools for legal document analysis and legal assistance.",
    count: 0,
    display_order: 19,
    keywords: ["legal", "law", "contract", "document", "attorney"]
  },
  {
    name: "Social Media",
    slug: "social-media",
    description: "AI tools for social media management and content creation.",
    count: 0,
    display_order: 20,
    keywords: ["social", "media", "platform", "content", "posts"]
  },
  {
    name: "E-commerce",
    slug: "e-commerce",
    description: "AI tools for online stores and e-commerce businesses.",
    count: 0,
    display_order: 21,
    keywords: ["ecommerce", "e-commerce", "shop", "store", "retail"]
  },
  {
    name: "Music",
    slug: "music",
    description: "AI tools for music creation, editing, and production.",
    count: 0,
    display_order: 22,
    keywords: ["music", "audio", "sound", "composition", "production"]
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "AI tools for game development and gaming experiences.",
    count: 0,
    display_order: 23,
    keywords: ["gaming", "game", "development", "virtual", "entertainment"]
  },
  {
    name: "Voice Assistant",
    slug: "voice-assistant",
    description: "AI voice assistants and voice command tools.",
    count: 0,
    display_order: 24,
    keywords: ["voice", "assistant", "speech", "command", "recognition"]
  },
  {
    name: "Automation",
    slug: "automation",
    description: "AI tools for automating tasks and processes.",
    count: 0,
    display_order: 25,
    keywords: ["automation", "automate", "workflow", "process", "robot"]
  },
  {
    name: "Email",
    slug: "email",
    description: "AI tools for email management, writing, and campaigns.",
    count: 0,
    display_order: 26,
    keywords: ["email", "mail", "message", "communication", "inbox"]
  },
  {
    name: "Personal Assistant",
    slug: "personal-assistant",
    description: "AI personal assistants for scheduling, reminders, and tasks.",
    count: 0,
    display_order: 27,
    keywords: ["personal", "assistant", "scheduler", "reminder", "task"]
  },
  {
    name: "Image Editing",
    slug: "image-editing",
    description: "AI tools for editing and enhancing images and photos.",
    count: 0,
    display_order: 28,
    keywords: ["image", "editing", "photo", "enhancement", "retouching"]
  },
  {
    name: "Sales",
    slug: "sales",
    description: "AI tools for sales teams, CRM, and lead generation.",
    count: 0,
    display_order: 29,
    keywords: ["sales", "selling", "lead", "CRM", "customer"]
  },
  {
    name: "Speech Recognition",
    slug: "speech-recognition",
    description: "AI tools for converting speech to text and understanding voice commands.",
    count: 0,
    display_order: 30,
    keywords: ["speech", "recognition", "transcription", "voice", "audio"]
  },
  {
    name: "Video Analysis",
    slug: "video-analysis",
    description: "AI tools for analyzing and extracting information from videos.",
    count: 0,
    display_order: 31,
    keywords: ["video", "analysis", "recognition", "detection", "extraction"]
  },
  {
    name: "Networking",
    slug: "networking",
    description: "AI tools for professional networking and connection building.",
    count: 0,
    display_order: 32,
    keywords: ["networking", "professional", "connection", "contact", "social"]
  },
  {
    name: "Language Learning",
    slug: "language-learning",
    description: "AI tools for learning new languages and improving language skills.",
    count: 0,
    display_order: 33,
    keywords: ["language", "learning", "foreign", "skills", "education"]
  },
  {
    name: "SEO",
    slug: "seo",
    description: "AI tools for search engine optimization and website ranking.",
    count: 0,
    display_order: 34,
    keywords: ["SEO", "search", "optimization", "ranking", "website"]
  },
  {
    name: "Other",
    slug: "other",
    description: "Other AI tools that don't fit into the main categories.",
    count: 0,
    display_order: 35,
    keywords: []
  }
];

// Function to populate the categories collection
async function populateCategories() {
  let client;
  
  try {
    console.log('Starting category population...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if categories already exist
    const existingCategories = await db.collection('categories').find({}).toArray();
    
    if (existingCategories.length > 0) {
      console.log(`Found ${existingCategories.length} existing categories.`);
      
      // Ask for confirmation before replacing
      console.log('This script will replace all existing categories with 35 predefined categories.');
      console.log('To continue, run with --force flag.');
      
      if (!process.argv.includes('--force')) {
        console.log('Exiting without making changes. Use --force to override.');
        return;
      }
      
      // Delete existing categories
      await db.collection('categories').deleteMany({});
      console.log('Deleted all existing categories.');
    }
    
    // Add timestamp to all categories
    const categoriesToInsert = ALL_CATEGORIES.map(category => ({
      ...category,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    // Insert all categories
    await db.collection('categories').insertMany(categoriesToInsert);
    console.log(`Successfully inserted ${categoriesToInsert.length} categories.`);
    
    // Now update the count for each category
    console.log('Updating category counts...');
    
    for (const category of ALL_CATEGORIES) {
      const count = await db.collection('tools').countDocuments({
        "categories.main": category.name
      });
      
      if (count > 0) {
        await db.collection('categories').updateOne(
          { name: category.name },
          { $set: { count, updated_at: new Date() } }
        );
        console.log(`Updated count for ${category.name}: ${count} tools`);
      }
    }
    
    console.log('All categories have been populated successfully!');
    
  } catch (error) {
    console.error('Error populating categories:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Export the categories for reuse in other scripts
module.exports = { ALL_CATEGORIES };

// Run the population script
if (require.main === module) {
  populateCategories().catch(console.error);
} 