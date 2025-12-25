export enum DataFlag {
  STRAIGHTLINING = '填答一致 (Straightlining)', // All answers are identical
  SPEEDER = '填答過快 (Speeder)', // Duration too short
  MISSING_DATA = '缺漏值 (Missing Data)'
}

export interface RawRow {
  [key: string]: any;
}

export interface ProcessedRow extends RawRow {
  _id: string; // Unique ID for internal tracking
  _flags: DataFlag[];
  _isExcluded: boolean;
}

export interface ColumnMapping {
  originalHeader: string;
  variableCode: string; // e.g., PEOU1
  type: 'demographic' | 'scale' | 'ignore' | 'meta'; // meta for time, id
}

export interface ProjectState {
  name: string;
  rawData: ProcessedRow[];
  mappings: ColumnMapping[];
  totalRespondents: number;
  validRespondents: number;
}

export enum AppStep {
  IMPORT = 'import',
  MAPPING = 'mapping',
  CLEANING = 'cleaning',
  DASHBOARD = 'dashboard'
}
