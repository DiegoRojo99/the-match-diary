// Common database types and Supabase configuration

// Base database table structure
export interface BaseTable {
  id: number;
  created_at?: string;
  updated_at?: string;
}

export interface BaseUserTable {
  id: string; // UUID
  user_id: string; // UUID foreign key
  created_at?: string;
  updated_at?: string;
}

// Generic database table type structure
export interface TableType<T = any> {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
}