import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, BrainCircuit, Car, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '数据仪表盘' },
  { to: '/feedback', icon: MessageSquare, label: '反馈列表' },
  { to: '/tickets', icon: ClipboardList, label: '工单管理' },
  { to: '/ai', icon: BrainCircuit, label: 'AI 智能分析' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-gray-900 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Robotaxi</p>
            <p className="text-gray-400 text-xs">反馈管理平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-gray-500 text-xs">v1.0.0 · 内部工具</p>
      </div>
    </aside>
  );
}
