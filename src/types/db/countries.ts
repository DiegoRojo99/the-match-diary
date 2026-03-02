// Database types for Countries table

import type { BaseTable, TableType } from './common';

// Countries table row structure
export interface CountryRow extends BaseTable {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  flag: string | null; // API-Football.com flag URL
}

// Countries table type definition
export interface CountryTable extends TableType<CountryRow> {
  Row: CountryRow;
  Insert: {
    id?: number;
    name: string;
    code: string;
    flag?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: number;
    name?: string;
    code?: string;
    flag?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}