import React, { useState } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, Table as TableIcon, Wand2 } from 'lucide-react';
import { parseExcelFile, generateInitialMapping, generateMockData } from '../services/surveyService';
import { ColumnMapping, ProcessedRow, DataFlag } from '../types';

interface ImportPanelProps {
  onDataLoaded: (data: ProcessedRow[], mapping: ColumnMapping[]) => void;
}

export const ImportPanel: React.FC<ImportPanelProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intermediate state before finalizing import
  const [tempData, setTempData] = useState<any[] | null>(null);
  const [tempMapping, setTempMapping] = useState<ColumnMapping[] | null>(null);

  const processData = (headers: string[], rows: any[]) => {
    const mapping = generateInitialMapping(headers);
    const processedRows: ProcessedRow[] = rows.map((r, idx) => ({
      ...r,
      _id: `row_${idx}`,
      _flags: [],
      _isExcluded: false
    }));
    
    setTempData(processedRows);
    setTempMapping(mapping);
    setIsLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsLoading(true);
      setError(null);
      try {
        const { headers, data } = await parseExcelFile(selectedFile);
        processData(headers, data);
      } catch (err) {
        setError("解析檔案失敗，請確認檔案為有效的 Excel 或 CSV 格式。");
        setIsLoading(false);
      }
    }
  };

  const handleLoadMock = () => {
    setIsLoading(true);
    setTimeout(() => {
      const { headers, data } = generateMockData();
      processData(headers, data);
    }, 800);
  };

  const handleMappingChange = (index: number, field: keyof ColumnMapping, value: string) => {
    if (!tempMapping) return;
    const newMapping = [...tempMapping];
    newMapping[index] = { ...newMapping[index], [field]: value };
    setTempMapping(newMapping);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setIsLoading(true);
      try {
        const { headers, data } = await parseExcelFile(droppedFile);
        processData(headers, data);
      } catch (err) {
        setError("檔案格式無效。");
        setIsLoading(false);
      }
    }
  };

  const handleContinue = () => {
    if (tempData && tempMapping) {
      onDataLoaded(tempData as ProcessedRow[], tempMapping);
    }
  };

  if (tempMapping && tempData) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">變數對應設定</h2>
              <p className="text-slate-500 text-sm">將您的原始問卷題目對應至分析用的變數代碼。</p>
            </div>
            <button 
              onClick={handleContinue}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              確認並繼續 <ArrowRight size={18} />
            </button>
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 border-b">原始標題 (題目)</th>
                  <th className="px-4 py-3 border-b">變數類型</th>
                  <th className="px-4 py-3 border-b">變數代碼</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tempMapping.map((map, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 max-w-md truncate" title={map.originalHeader}>
                      {map.originalHeader}
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={map.type}
                        onChange={(e) => handleMappingChange(idx, 'type', e.target.value)}
                        className="bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="ignore">忽略 (不分析)</option>
                        <option value="scale">量表題 (Scale)</option>
                        <option value="demographic">人口變項</option>
                        <option value="meta">系統資訊 (Meta)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text"
                        value={map.variableCode}
                        onChange={(e) => handleMappingChange(idx, 'variableCode', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm font-mono text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[600px] w-full max-w-4xl mx-auto">
      <div 
        className={`w-full p-12 rounded-2xl border-2 border-dashed transition-all duration-300 bg-white shadow-sm flex flex-col items-center
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="bg-indigo-100 p-4 rounded-full mb-6 text-indigo-600">
          <Upload size={40} />
        </div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">上傳您的問卷資料</h3>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          請將您的 Excel (.xlsx) 或 CSV 檔案拖曳至此處。
          我們會自動偵測標題並協助您設定變數對應。
        </p>

        <div className="flex gap-4">
          <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-transform active:scale-95 flex items-center gap-2">
            <FileSpreadsheet size={20} />
            選擇檔案
            <input 
              type="file" 
              accept=".xlsx,.csv" 
              className="hidden" 
              onChange={handleFileChange} 
            />
          </label>
          <button 
            onClick={handleLoadMock}
            className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Wand2 size={20} />
            使用範例資料
          </button>
        </div>

        {isLoading && (
          <div className="mt-8 flex items-center gap-3 text-indigo-600 animate-pulse">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
            <span className="font-medium">正在處理檔案...</span>
          </div>
        )}
        
        {error && (
          <div className="mt-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};