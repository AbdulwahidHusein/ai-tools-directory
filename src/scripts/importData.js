/**
 * Import script for AI Tools Directory
 * 
 * This script imports sample categories and tools data into MongoDB.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aitools';

// Sample categories data
const categories = [
  {
    name: "Content Creation",
    slug: "content-creation",
    description: "AI tools for creating various types of content including text, images, and videos.",
    count: 0,
    display_order: 1,
    keywords: ["content", "creation", "generator", "creative"],
    icon: "📝",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Image Generation & Editing",
    slug: "image-generation-editing",
    description: "AI tools for generating and editing images, photos, and graphics.",
    count: 0,
    display_order: 2,
    keywords: ["image", "photo", "art", "editing", "pictures"],
    icon: "🖼️",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Text Generation & Writing",
    slug: "text-generation-writing",
    description: "AI tools for writing, editing, and enhancing text content.",
    count: 0,
    display_order: 3,
    keywords: ["text", "writing", "content", "copy"],
    icon: "✍️",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Chatbots & Conversational AI",
    slug: "chatbots-conversational-ai",
    description: "AI chatbots and conversational agents for various purposes.",
    count: 0,
    display_order: 4,
    keywords: ["chat", "chatbot", "conversation", "assistant"],
    icon: "💬",
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "Productivity & Workflow",
    slug: "productivity-workflow",
    description: "AI tools to improve productivity and streamline workflows.",
    count: 0,
    display_order: 5,
    keywords: ["productivity", "workflow", "automation", "efficiency"],
    icon: "⚡",
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Sample tools data
const tools = [
  {
    name: "AI Content Generator",
    slug: "ai-content-generator",
    description: "Generate high-quality content for blogs, articles, and social media posts with AI.",
    website: "https://example.com/contentgenerator",
    rating: { score: 4.7, count: 253 },
    image_url: "/placeholder-tool.svg",
    what_is: "AI Content Generator is an advanced tool that uses artificial intelligence to create various types of content. It can generate blog posts, articles, product descriptions, and social media content in seconds.",
    how_to_use: "Simply input your topic or keywords, select the type of content you want to create, and the AI will generate unique, engaging content for you. You can then edit and refine the output as needed.",
    categories: {
      main: ["Content Creation", "Text Generation & Writing"],
      primary: "Content Creation",
      original: ["Content Creation", "AI Writing", "Blog Writing"]
    },
    tags: ["content writing", "blog generator", "AI writer", "article writer"],
    search_terms: ["AI content", "blog writing", "article generator", "content creation"],
    core_features: [
      "AI-powered content generation",
      "Multiple content formats supported",
      "Customizable tone and style",
      "Plagiarism-free content",
      "Export in various formats"
    ],
    use_cases: [
      "Creating blog posts and articles",
      "Writing product descriptions",
      "Generating social media content",
      "Creating marketing copy"
    ],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "ImageMind AI",
    slug: "imagemind-ai",
    description: "Create stunning images from text descriptions with this powerful AI image generation tool.",
    website: "https://example.com/imagemind",
    rating: { score: 4.9, count: 312 },
    image_url: "/placeholder-tool.svg",
    what_is: "ImageMind AI is a cutting-edge image generation tool that creates high-quality, unique images based on text descriptions. It uses advanced deep learning algorithms to understand your prompts and generate detailed visuals.",
    how_to_use: "Enter a descriptive text prompt detailing what you want to see in your image. You can specify style, colors, subjects, and more. Adjust settings for detail level and creativity, then generate your image.",
    categories: {
      main: ["Image Generation & Editing", "Content Creation"],
      primary: "Image Generation & Editing",
      original: ["AI Art", "Image Generator", "Text to Image"]
    },
    tags: ["image generation", "AI art", "text to image", "creative tool"],
    search_terms: ["AI image generator", "text to image", "art generator", "image creation"],
    core_features: [
      "Text-to-image generation",
      "Multiple artistic styles",
      "High-resolution output",
      "Batch image creation",
      "Image editing capabilities"
    ],
    use_cases: [
      "Creating illustrations for content",
      "Generating concept art",
      "Designing marketing materials",
      "Creating unique social media visuals"
    ],
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function importData() {
  let client;

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('categories')) {
      await db.createCollection('categories');
    }
    
    if (!collectionNames.includes('tools')) {
      await db.createCollection('tools');
    }
    
    // Create text indexes for search functionality
    await db.collection('tools').createIndex({ 
      name: "text", 
      description: "text", 
      "categories.main": "text",
      tags: "text",
      search_terms: "text" 
    });

    // Insert categories
    const categoriesResult = await db.collection('categories').insertMany(categories);
    console.log(`${categoriesResult.insertedCount} categories inserted`);

    // Insert tools
    const toolsResult = await db.collection('tools').insertMany(tools);
    console.log(`${toolsResult.insertedCount} tools inserted`);

    // Update category counts
    const categoryCountUpdates = [];
    for (const category of categories) {
      const count = await db.collection('tools').countDocuments({
        "categories.main": category.name
      });
      
      categoryCountUpdates.push({
        updateOne: {
          filter: { name: category.name },
          update: { $set: { count } }
        }
      });
    }
    
    if (categoryCountUpdates.length > 0) {
      await db.collection('categories').bulkWrite(categoryCountUpdates);
      console.log('Category counts updated');
    }

    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the import
importData().catch(console.error); 