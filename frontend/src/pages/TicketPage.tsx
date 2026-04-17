import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList, AlertCircle, Clock, CheckCircle2, X, Save,
} from 'lucide-react';
import { ticketApi, feedbackApi } from '@/lib/api';
import type { Ticket, TicketStatus } from '@/types';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';

const STATUS_LABEL: Record<TicketStatus, string> = {
  open: '待处理',
  in_progress: '处理中',
  resolved: '已解决',
};

const STATUS_STYLE: Record<TicketStatus, string> = {
  open: 'bg-red-50 text-red-600 border-red-200',
  in_progress: 'bg-amber-50 text-amber-600 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const STATUS_ICON: Record<TicketStatus, React.ReactNode> = {
  open: <AlertCircle className="w-3.5 h-3.5" />,
  in_progress: <Clock className="w-3.5 h-3.5" />,
  resolved: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const RATING_COLOR = (r: number) =>
  r <= 2 ? 'text-red-500' : r === 3 ? 'text-amber-500' : 'text-emerald-500';

type TabStatus = 'all' | TicketStatus;

export default function TicketPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [filterType, setFilterType] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [editStatus, setEditStatus] = useState<TicketStatus>('open');
  const [editNotes, setEditNotes] = useState('');
  const [editAssigned, setEditAssigned] = useState('');

  const { data: meta } = useQuery({ queryKey: ['meta'], queryFn: feedbackApi.meta });

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', activeTab, filterType, filterCity],
    queryFn: () => ticketApi.list({
      status: activeTab === 'all' ? undefined : activeTab,
      feedbackType: filterType || undefined,
      city: filterCity || undefined,
    }),
  });

  const { mutate: updateTicket, isPending: isSaving } = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { status?: TicketStatus; assignedTo?: string; notes?: string } }) =>
      ticketApi.update(id, patch),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setSelected(updated);
    },
  });

  const openDetail = (ticket: Ticket) => {
    setSelected(ticket);
    setEditStatus(ticket.status);
    setEditNotes(ticket.notes);
    setEditAssigned(ticket.assignedTo);
  };

  const handleSave = () => {
    if (!selected) return;
    updateTicket({ id: selected.id, patch: { status: editStatus, notes: editNotes, assignedTo: editAssigned } });
  };

  const stats = data?.stats;
  const tickets = data?.tickets ?? [];

  const tabs: { id: TabStatus; label: string; count?: number }[] = [
    { id: 'all', label: '全部', count: (stats?.open ?? 0) + (stats?.in_progress ?? 0) + (stats?.resolved ?? 0) },
    { id: 'open', label: '待处理', count: stats?.open },
    { id: 'in_progress', label: '处理中', count: stats?.in_progress },
    { id: 'resolved', label: '已解决', count: stats?.resolved },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">工单管理</h1>
        <p className="text-sm text-gray-500 mt-0.5">追踪差评处理进度，记录处理措施</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.open}</p>
              <p className="text-xs text-gray-500">待处理</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.in_progress}</p>
              <p className="text-xs text-gray-500">处理中</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
              <p className="text-xs text-gray-500">已解决</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn('ml-1.5 text-xs', activeTab === tab.id ? 'text-blue-500' : 'text-gray-400')}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">全部类型</option>
          {(meta?.feedbackTypes ?? []).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={filterCity}
          onChange={e => setFilterCity(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">全部城市</option>
          {(meta?.cities ?? []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400 text-sm">加载中...</div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">暂无工单</p>
            <p className="text-gray-300 text-xs mt-1">在反馈详情中点击「创建工单」来生成工单</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">工单号</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium min-w-48">标题</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">城市</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">类型</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">评分</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">负责团队</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">状态</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">创建时间</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => openDetail(ticket)}
                    className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{ticket.id}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs max-w-[240px] truncate" title={ticket.title}>
                      {ticket.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{ticket.city}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                        {ticket.feedbackType}
                      </span>
                    </td>
                    <td className={cn('px-4 py-3 font-semibold text-sm', RATING_COLOR(ticket.rating))}>
                      {ticket.rating}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{ticket.assignedTo}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border font-medium', STATUS_STYLE[ticket.status])}>
                        {STATUS_ICON[ticket.status]}
                        {STATUS_LABEL[ticket.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDateTime(ticket.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSelected(null)} />
          <div className="w-[460px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{selected.id}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[340px]">{selected.title}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 p-5 space-y-4">
              {/* Original feedback */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">原始反馈</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selected.feedbackText}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 pt-1">
                  <span>{selected.city}</span>
                  <span>·</span>
                  <span className="truncate max-w-[160px]">{selected.route}</span>
                  <span>·</span>
                  <span className={cn('font-semibold', RATING_COLOR(selected.rating))}>{selected.rating} 分</span>
                </div>
                <p className="text-xs text-gray-400">反馈 ID：{selected.feedbackId}</p>
              </div>

              {/* Edit fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">处理状态</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as TicketStatus)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  >
                    <option value="open">待处理</option>
                    <option value="in_progress">处理中</option>
                    <option value="resolved">已解决</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">负责团队</label>
                  <input
                    type="text"
                    value={editAssigned}
                    onChange={e => setEditAssigned(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    placeholder="团队名称"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1.5">处理备注</label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={5}
                    placeholder="记录处理措施、跟进情况..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none"
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-0.5">
                <p>创建时间：{formatDateTime(selected.createdAt)}</p>
                <p>最近更新：{formatDateTime(selected.updatedAt)}</p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存更改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
