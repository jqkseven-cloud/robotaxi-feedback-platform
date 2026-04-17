import { useState } from 'react';
import { Tag, FileText, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import ClassifyPanel from '@/components/ai/ClassifyPanel';
import SummaryPanel from '@/components/ai/SummaryPanel';
import SuggestPanel from '@/components/ai/SuggestPanel';

const tabs = [
  { id: 'classify', label: '自动分类', icon: Tag, description: '对反馈文本进行自动类型识别' },
  { id: 'summary', label: '摘要生成', icon: FileText, description: '提炼批量反馈的核心问题与用户说词' },
  { id: 'suggestions', label: '产品建议', icon: Lightbulb, description: '基于反馈分析生成优化建议' },
];

export default function AIAnalysisPage() {
  const [activeTab, setActiveTab] = useState('classify');

  const activeTabInfo = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-800">AI 智能分析</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          基于通义千问大模型，为反馈数据提供智能分析能力
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border',
                isActive
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <activeTabInfo.icon className="w-4 h-4 text-gray-400" />
        <span>{activeTabInfo.description}</span>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'classify' && <ClassifyPanel />}
        {activeTab === 'summary' && <SummaryPanel />}
        {activeTab === 'suggestions' && <SuggestPanel />}
      </div>
    </div>
  );
}
