
export enum GeneType {
  MORPH = 'MORPH',
  ACCESSORY = 'ACCESSORY',
  COLOR = 'COLOR'
}

export interface GeneTemplate {
  name: string;
  index: number;
  range: { min: number; max: number };
  mirrors?: string;
  notes?: string[];
}

export interface GeneDefinition {
  id: string;
  name: string;
  group: string;
  type: GeneType;
  min: number;
  max: number;
  // Raw data references for context
  rawAttribute?: string;
  default?: number;
  templates?: GeneTemplate[];
}

export interface GeneValue {
  value: number;
  templateIndex: number;
}

export type GeneState = Record<string, GeneValue>;

export interface GeneGroup {
  id: string;
  name: string;
  icon: string;
}

export interface ReferenceDocument {
  id: string;
  title: string;
  description: string;
  path: string;
  content?: string;
  category?: string; // Folder name for grouping
  deleted?: boolean; // Soft delete flag
}

// --- MORPH TYPES ---
export type MorphMode = 'replace' | 'add' | 'modify' | 'modify_multiply' | 'dna' | 'patch' | '?';
export type MorphValueType = 'value' | 'range';

export interface MorphData {
  mode: MorphMode;
  template: string;
  valData: any; // number or string for ranges
  type: MorphValueType;
}

export interface FileMorphData {
  fileName: string;
  morphs: Record<string, MorphData>;
  isBaseline?: boolean;
  isDefault?: boolean;
  isDnaPaste?: boolean;
  isPatch?: boolean;
  isModified?: boolean; // Track manual edits
  rawText?: string; // Store original text for structure preservation
}

export interface WikiPage {
  id: string;
  title: string;
  content: string;
}

// --- RESTORED TYPES ---

export enum TraitCategory {
  EDUCATION = 'Education',
  PERSONALITY = 'Personality',
  CONGENITAL = 'Congenital',
  LIFESTYLE = 'Lifestyle',
  COMMANDER = 'Commander',
  PHYSICAL = 'Physical',
  INFAMOUS = 'Infamous',
  COPING = 'Coping',
  OTHER = 'Other'
}

export interface Trait {
  id: string;
  name: string;
  cost: number;
  category: TraitCategory;
  description: string;
  opposites?: string[];
}

export interface StoredCharacter {
  id: string;
  name: string;
  birthName?: string;
  titles?: string[];
  culture: string;
  religion: string;
  race?: string;
  traits: string[]; // trait IDs
  dna: string; // Ruler Designer DNA
  persistentDna?: string; // Save File DNA (Base64)
  images: string[];
  bio: string; // The Saga
  events?: string; // The Annals
  achievements?: string; // Deeds & Conquests
  dateStart?: string; // Ascension
  dateBirth?: string; // Nativity
  tags: string[];
  createdAt: string;
  dynastyMotto?: string;
  dynastyName?: string;
  houseName?: string;
  prestigeLevel?: string; // Index 0-4
  pietyLevel?: string; // Index 0-4
  goal?: string;
  category?: 'historical' | 'custom';
  collection?: string; // New field for grouping
  deleted?: boolean; // Soft delete flag for historical overrides or safe deletion
  updatedAt?: string;
}

export interface CharacterBuild {
  name: string;
  culture: string;
  religion: string;
  goal: string;
  traits: string[];
}

export interface AdvisorResponse {
  backstory: string;
  strategy: string;
  dynastyMotto: string;
}

export type DnaData = Record<string, number[]>;
