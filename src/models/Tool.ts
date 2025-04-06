import { ObjectId } from 'mongodb';

export interface Tool {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  seo_title?: string;
  seo_description?: string;
  website: string;
  toolify_url?: string;
  actual_url?: string;
  added_date?: string;
  monthly_visitors?: string;
  rating: {
    score: number;
    count: number;
  };
  image_url: string;
  what_is: string;
  how_to_use: string;
  
  // Categories
  categories: {
    main: string[];
    primary: string;
    original: string[];
    subcategories?: string[];
  };
  
  // Additional metadata
  tags: string[];
  search_terms: string[];
  core_features: string[];
  use_cases: string[];
  
  // Organization info
  company?: {
    name?: string;
    address?: string;
    website?: string;
    [key: string]: any;
  };
  
  // Links and contact
  links?: {
    login?: string;
    signup?: string;
    pricing?: string;
    about?: string;
    contact?: string;
    [key: string]: string | undefined;
  };
  contact?: {
    email?: string;
    support?: string;
    [key: string]: string | undefined;
  };
  social_media?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    discord?: string;
    github?: string;
    reddit?: string;
    [key: string]: string | undefined;
  };
  
  // Timestamps
  scrape_date?: string;
  created_at: Date;
  updated_at: Date;
} 