import { ObjectId } from 'mongodb';

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  count: number;
  display_order: number;
  keywords: string[];
  icon?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CategoryWithTools extends Category {
  tools: Tool[];
}

export interface Tool {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  categories: {
    main: string[];
    primary: string;
    original: string[];
  };
  image_url: string;
  rating?: number | { score: number; count: number };
} 