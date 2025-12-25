import { read, utils } from 'xlsx';
import { ProcessedRow, DataFlag, ColumnMapping } from '../types';

export const parseExcelFile = async (file: File): Promise<{ headers: string[], data: any[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Parse to JSON
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error("檔案是空的"));
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = utils.sheet_to_json(sheet); // Standard object array

        resolve({ headers, data: rows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};

export const generateInitialMapping = (headers: string[]): ColumnMapping[] => {
  return headers.map((header, index) => {
    let type: ColumnMapping['type'] = 'ignore';
    let code = `VAR_${index + 1}`;

    // Simple heuristic for auto-detecting types (Updated for Chinese)
    const lower = header.toLowerCase();
    if (lower.includes('time') || lower.includes('duration') || lower.includes('seconds') || lower.includes('時間') || lower.includes('秒')) {
      type = 'meta';
      code = 'DURATION';
    } else if (lower.includes('id') || lower.includes('ip') || lower.includes('編號')) {
      type = 'meta';
      code = 'ID';
    } else if (lower.includes('gender') || lower.includes('age') || lower.includes('sex') || lower.includes('性別') || lower.includes('年齡')) {
      type = 'demographic';
      code = (lower.includes('gender') || lower.includes('性別')) ? 'GENDER' : 'AGE';
    } else if (header.length > 15) { // Adjusted length threshold for Chinese characters
      // Long headers are usually scale questions
      type = 'scale';
    }

    return {
      originalHeader: header,
      variableCode: code,
      type
    };
  });
};

export const analyzeRowQuality = (row: any, mappings: ColumnMapping[]): DataFlag[] => {
  const flags: DataFlag[] = [];
  
  // 1. Check for Straightlining (Invariant responding) on SCALE items
  const scaleValues: number[] = [];
  mappings.filter(m => m.type === 'scale').forEach(m => {
    const val = row[m.originalHeader];
    if (typeof val === 'number') {
      scaleValues.push(val);
    }
  });

  if (scaleValues.length > 4) {
    const allSame = scaleValues.every(val => val === scaleValues[0]);
    if (allSame) {
      flags.push(DataFlag.STRAIGHTLINING);
    } else {
        // Calculate variance (simplified)
        const mean = scaleValues.reduce((a, b) => a + b, 0) / scaleValues.length;
        const variance = scaleValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scaleValues.length;
        if (variance < 0.2) { // Extremely low variance
            flags.push(DataFlag.STRAIGHTLINING);
        }
    }
  }

  // 2. Check for Speeders
  const durationMapping = mappings.find(m => m.variableCode === 'DURATION');
  if (durationMapping) {
    const duration = Number(row[durationMapping.originalHeader]);
    // Threshold: Assume < 60 seconds is invalid for a typical survey
    if (!isNaN(duration) && duration < 60) {
      flags.push(DataFlag.SPEEDER);
    }
  }

  return flags;
};

// Mock data generator for testing (Chinese Version)
export const generateMockData = (): { headers: string[], data: any[] } => {
  const headers = ["問卷編號", "填答時間 (秒)", "性別", "Q1. 我覺得這個系統很有用", "Q2. 使用這個系統能提高我的效率", "Q3. 我打算繼續使用這個系統"];
  const data = [];
  
  for (let i = 1; i <= 50; i++) {
    const isSpeeder = Math.random() < 0.1;
    const isStraightliner = Math.random() < 0.1;
    
    let q1, q2, q3;
    let duration = isSpeeder ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 300) + 120;

    if (isStraightliner) {
      const val = Math.floor(Math.random() * 5) + 1;
      q1 = q2 = q3 = val;
    } else {
      q1 = Math.floor(Math.random() * 5) + 1;
      q2 = Math.floor(Math.random() * 5) + 1;
      q3 = Math.floor(Math.random() * 5) + 1;
    }

    data.push({
      "問卷編號": `RES_${1000 + i}`,
      "填答時間 (秒)": duration,
      "性別": Math.random() > 0.5 ? "男" : "女",
      "Q1. 我覺得這個系統很有用": q1,
      "Q2. 使用這個系統能提高我的效率": q2,
      "Q3. 我打算繼續使用這個系統": q3
    });
  }
  return { headers, data };
};
