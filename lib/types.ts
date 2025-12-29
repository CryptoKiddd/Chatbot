import { ObjectId } from "mongodb";


export interface Apartment {
  _id?: ObjectId;
  projectId: string;
  projectName: string;
  city: string;
  neighborhood: string;
  totalArea: number;
  rooms: number;
  floor: number;
  viewType: string;
  hasBalcony: boolean;
  balconySize?: number;
  totalPrice: number;
  minInitialInstallment: number;
  monthlyPayment: number;
  installmentDuration: number;
  availabilityStatus: 'available' | 'reserved' | 'sold';
  constructionStatus: 'completed' | 'under-construction' | 'off-plan';
  expectedCompletion?: string;
  developerName: string;
}

export interface Project {
  _id?: ObjectId;
  projectName: string;
  city: string;
  neighborhood: string;
  constructionStatus: 'completed' | 'under-construction' | 'off-plan';
  expectedCompletion?: string;
  developerName: string;
  paymentPlans: string[];
  apartments: Apartment[];
}

export interface UserPreferences {
      _id?: ObjectId;
      name?:string,
      phone?:string ,
      email?:string

  language?: string;
  location?: string;
  maxBudget?: number;
  monthlyPayment?: number;
  downPayment?: number;
  minSize?: number;
  maxSize?: number;
  rooms?: number;
  viewType?: string;
  requiresBalcony?: boolean;
  budgetMax?:number;
  minFloor?: number;
  maxFloor?: number;
  constructionStatus?: string[];
}

export interface Lead {
  _id?: ObjectId;
  name: string;
  phone: string;
  email?: string;
  language: string;
  timestamp?: Date;
  preferences: UserPreferences;
  suggestedApartments: string[];
  conversationSummary: string;
  chatHistory: Message[];

  status: 'new' | 'contacted' | 'qualified' | 'closed';
}

export interface Message {
      _id?: ObjectId;

  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  apartments?: Apartment[];
}

export interface Session {
  _id?: ObjectId;

  sessionId: string;
  preferences: UserPreferences;
  conversationHistory: Message[];
  leadCaptured: boolean;
  createdAt: Date;
  updatedAt: Date;
}