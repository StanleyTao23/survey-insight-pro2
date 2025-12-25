import React, { useMemo } from 'react';
import { ProjectState, DataFlag } from '../types';
import { AlertCircle, CheckCircle, Trash2, Filter, Save } from 'lucide-react';

interface DataCleaningPanelProps {
  projectData: ProjectState;
  onUpdateData: (newData: ProjectState['rawData']) => void;
  onComplete: () => void;
}

export const DataCleaningPanel: React.FC<DataCleaningPanelProps> = ({ projectData, onUpdateData, onComplete }) => {
  const { rawData, mappings } = projectData;

  const invalidCount = useMemo(() => 
    rawData.filter(row => row._flags && row._flags.length > 0 && !row._isExcluded).length, 
    [rawData]
  );
  
  const totalActive = useMemo(() => 
    rawData.filter(row => !row._isExcluded).length, 
    [rawData]
  );

  const handleRemoveInvalid = () => {
    const updated = rawData.map(row => {
      if (row._flags && row._flags.length > 0) {
        return { ...row, _isExcluded: true };
      }
      return row;
    });
    onUpdateData(updated);
  };

  // Only show first 5 columns + any flagged columns + meta for preview
  const displayColumns = useMemo(() => {
    return mappings.slice(0, 6);
  }, [mappings]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-slate-500 text-sm font-medium">總回收樣本</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{rawData.length}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <span className="text-red-600 text-sm font-medium">異常樣本數</span>
          <span className="text-3xl font-bold text-red-700 mt-1">{invalidCount}</span>
          <p className="text-xs text-red-500 mt-2">包含填答一致性高或填答過快者</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <span className="text-emerald-600 text-sm font-medium">有效樣本數</span>
          <span className="text-3xl font-bold text-emerald-700 mt-1">{totalActive}</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-700">
            <Filter size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">資料清理</h3>
            <p className="text-xs text-slate-500">請檢視下方被系統標記的異常資料</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={handleRemoveInvalid}
              disabled={invalidCount === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border
                ${invalidCount > 0 
                  ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                  : 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'}`}
            >
              <Trash2 size={18} />
              排除所有異常 ({invalidCount})
            </button>
            
            <button 
              onClick={onComplete}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm shadow-indigo-200"
            >
              <Save size={18} />
              儲存並開始分析
            </button>
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 border-b w-16 text-center">狀態</th>
                <th className="px-4 py-3 border-b">偵測問題</th>
                {displayColumns.map((col, i) => (
                  <th key={i} className="px-4 py-3 border-b max-w-[200px] truncate" title={col.originalHeader}>
                    {col.variableCode} <span className="block text-[10px] text-slate-400 font-normal truncate">{col.originalHeader}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rawData.map((row) => {
                if (row._isExcluded && invalidCount === 0) return null; // Hide excluded if we just cleaned
                const isFlagged = row._flags.length > 0;
                const isExcluded = row._isExcluded;

                return (
                  <tr 
                    key={row._id} 
                    className={`transition-colors 
                      ${isExcluded ? 'bg-slate-50 opacity-50 grayscale' : ''}
                      ${!isExcluded && isFlagged ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-indigo-50/30'}
                    `}
                  >
                    <td className="px-4 py-3 text-center border-r border-slate-100/50">
                       {isExcluded ? (
                         <span className="inline-block w-2 h-2 rounded-full bg-slate-400" title="已排除"></span>
                       ) : isFlagged ? (
                         <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" title="異常"></span>
                       ) : (
                         <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" title="有效"></span>
                       )}
                    </td>
                    <td className="px-4 py-3 font-medium text-xs">
                       {row._flags.length > 0 ? (
                         <div className="flex gap-1 flex-wrap">
                           {row._flags.map(f => (
                             <span key={f} className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                               {f}
                             </span>
                           ))}
                         </div>
                       ) : <span className="text-emerald-600 flex items-center gap-1"><CheckCircle size={12}/> 正常</span>}
                    </td>
                    {displayColumns.map((col, i) => (
                      <td key={i} className="px-4 py-3 text-slate-600">
                        {String(row[col.originalHeader] || '-')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};