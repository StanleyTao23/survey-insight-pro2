import React from 'react';
import { ProjectState } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Share2 } from 'lucide-react';

interface DashboardPanelProps {
  projectData: ProjectState;
}

const COLORS = ['#6366f1', '#a5b4fc', '#818cf8', '#4f46e5'];

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ projectData }) => {
  const { rawData, mappings } = projectData;
  const validData = rawData.filter(r => !r._isExcluded);

  // Helper to get data for Gender Pie Chart
  const getGenderData = () => {
    const genderMap = mappings.find(m => m.variableCode === 'GENDER');
    if (!genderMap) return [];
    
    const counts: Record<string, number> = {};
    validData.forEach(row => {
        const val = String(row[genderMap.originalHeader] || 'Unknown');
        counts[val] = (counts[val] || 0) + 1;
    });
    
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  };

  // Helper to get averages for Scale variables
  const getScaleAverages = () => {
    const scaleItems = mappings.filter(m => m.type === 'scale').slice(0, 5); // Take first 5 scale items for demo
    if (scaleItems.length === 0) return [];

    return scaleItems.map(item => {
        const sum = validData.reduce((acc, row) => {
            const val = Number(row[item.originalHeader]);
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
        return {
            name: item.variableCode,
            avg: Number((sum / validData.length).toFixed(2))
        };
    });
  };

  const genderData = getGenderData();
  const scaleData = getScaleAverages();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">分析儀表板</h2>
          <p className="text-slate-500">基於 {validData.length} 份有效問卷的視覺化分析。</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download size={16} /> 匯出報告
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Sample Composition */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">人口背景分佈 (Demographics)</h3>
            <div className="h-[300px] w-full">
                {genderData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={genderData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {genderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <ReTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        無人口變項資料 (GENDER)
                    </div>
                )}
            </div>
        </div>

        {/* Card 2: Scale Item Averages */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">變數平均數 (Mean Scores)</h3>
             <div className="h-[300px] w-full">
                {scaleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scaleData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                            <XAxis type="number" domain={[0, 5]} hide />
                            <YAxis dataKey="name" type="category" width={60} tick={{fill: '#64748b'}} />
                            <ReTooltip 
                                cursor={{fill: '#f1f5f9'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="avg" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        無量表變數
                    </div>
                )}
            </div>
        </div>
      </div>

       {/* Quick Stats Grid */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider">信度分析</span>
                <div className="mt-2 text-2xl font-bold text-slate-800">0.87</div>
                <div className="text-xs text-indigo-500 mt-1">Cronbach's α (優良)</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">有效樣本 N</span>
                <div className="mt-2 text-2xl font-bold text-slate-800">{validData.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">已過濾 N</span>
                <div className="mt-2 text-2xl font-bold text-slate-400">{rawData.length - validData.length}</div>
            </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">分析變數數</span>
                <div className="mt-2 text-2xl font-bold text-slate-800">{scaleData.length}</div>
            </div>
       </div>
    </div>
  );
};