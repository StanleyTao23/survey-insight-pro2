import React, { useState } from 'react';
import { LayoutDashboard, FileUp, Database, BarChart3, Settings, Menu, LogOut } from 'lucide-react';
import { ImportPanel } from './components/ImportPanel';
import { DataCleaningPanel } from './components/DataCleaningPanel';
import { DashboardPanel } from './components/DashboardPanel';
import { LoginPanel } from './components/LoginPanel';
import { AppStep, ProjectState, ProcessedRow, ColumnMapping, DataFlag } from './types';
import { analyzeRowQuality } from './services/surveyService';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState<AppStep>(AppStep.IMPORT);
  const [projectData, setProjectData] = useState<ProjectState>({
    name: 'New Project',
    rawData: [],
    mappings: [],
    totalRespondents: 0,
    validRespondents: 0
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Reset state optionally
    setStep(AppStep.IMPORT);
    setProjectData({
      name: 'New Project',
      rawData: [],
      mappings: [],
      totalRespondents: 0,
      validRespondents: 0
    });
  };

  const handleDataLoaded = (rows: ProcessedRow[], mappings: ColumnMapping[]) => {
    // Initial analysis pass
    const processedRows = rows.map(row => {
      const flags = analyzeRowQuality(row, mappings);
      return { ...row, _flags: flags };
    });

    setProjectData(prev => ({
      ...prev,
      rawData: processedRows,
      mappings: mappings,
      totalRespondents: processedRows.length,
      validRespondents: processedRows.length // Update later
    }));
    setStep(AppStep.CLEANING);
  };

  const handleUpdateData = (newData: ProcessedRow[]) => {
    setProjectData(prev => ({
      ...prev,
      rawData: newData
    }));
  };

  if (!isLoggedIn) {
    return <LoginPanel onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-col hidden md:flex shadow-xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
            <BarChart3 className="text-indigo-500" />
            Survey Insight
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem 
            icon={<FileUp size={20} />} 
            label="匯入與對應" 
            active={step === AppStep.IMPORT} 
            onClick={() => setStep(AppStep.IMPORT)}
          />
          <SidebarItem 
            icon={<Database size={20} />} 
            label="資料清理" 
            active={step === AppStep.CLEANING} 
            disabled={projectData.rawData.length === 0}
            onClick={() => setStep(AppStep.CLEANING)}
            badge={projectData.rawData.filter(r => r._flags.length > 0 && !r._isExcluded).length || undefined}
          />
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="分析儀表板" 
            active={step === AppStep.DASHBOARD} 
            disabled={projectData.rawData.length === 0}
            onClick={() => setStep(AppStep.DASHBOARD)}
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">U</div>
               <div className="text-sm">
                 <p className="text-white">研究員</p>
                 <p className="text-xs text-slate-500">專業版</p>
               </div>
             </div>
             <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors" title="登出">
               <LogOut size={18} />
             </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header (Mobile) */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
            <span className="font-bold text-slate-800">Survey Insight</span>
            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="text-slate-500">
                <LogOut size={20} />
              </button>
              <Menu className="text-slate-500" />
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {step === AppStep.IMPORT && (
            <ImportPanel onDataLoaded={handleDataLoaded} />
          )}
          
          {step === AppStep.CLEANING && (
            <DataCleaningPanel 
              projectData={projectData} 
              onUpdateData={handleUpdateData}
              onComplete={() => setStep(AppStep.DASHBOARD)}
            />
          )}

          {step === AppStep.DASHBOARD && (
            <DashboardPanel projectData={projectData} />
          )}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, disabled, badge }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : disabled 
          ? 'text-slate-600 cursor-not-allowed opacity-50' 
          : 'hover:bg-slate-800 text-slate-400 hover:text-white'
      }
    `}
  >
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>
    {badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{badge}</span>}
  </button>
);

export default App;