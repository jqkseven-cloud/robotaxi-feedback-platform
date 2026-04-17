import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { X, MapPin, Clock, Car, Cloud, User, Navigation, ClipboardList, CheckCircle2 } from 'lucide-react';
import type { Feedback } from '@/types';
import { formatDateTime } from '@/lib/utils';
import { ticketApi } from '@/lib/api';
import StarRating from './StarRating';
import SentimentBadge from './SentimentBadge';

interface FeedbackDetailProps {
  feedback: Feedback | null;
  onClose: () => void;
}

export default function FeedbackDetail({ feedback, onClose }: FeedbackDetailProps) {
  const navigate = useNavigate();
  const [ticketCreated, setTicketCreated] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: () => ticketApi.create(feedback!.id),
    onSuccess: (res) => {
      setTicketCreated(true);
      setAlreadyExists(res.alreadyExists);
    },
  });

  if (!feedback) return null;

  const isLowRating = feedback.rating <= 2;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[480px] bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">反馈详情</h2>
            <p className="text-xs text-gray-400 mt-0.5">{feedback.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Rating & Sentiment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StarRating rating={feedback.rating} size="md" />
              <span className="text-sm text-gray-500">{feedback.rating} / 5 分</span>
            </div>
            <SentimentBadge sentiment={feedback.sentiment} />
          </div>

          {/* Feedback Text */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2 font-medium">乘客反馈</p>
            <p className="text-gray-700 leading-relaxed">{feedback.feedbackText}</p>
          </div>

          {/* Create ticket area — low rating only */}
          {isLowRating && (
            <div className="border border-red-100 bg-red-50 rounded-lg p-3 flex items-center justify-between gap-3">
              <p className="text-xs text-red-600">
                该反馈评分为 <span className="font-semibold">{feedback.rating} 分</span>，建议创建工单跟进处理
              </p>
              {ticketCreated ? (
                <div className="flex items-center gap-2 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <button
                    onClick={() => { onClose(); navigate('/tickets'); }}
                    className="text-xs text-blue-600 hover:underline font-medium whitespace-nowrap"
                  >
                    {alreadyExists ? '已有工单，去查看' : '已创建，去查看'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => createTicket()}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 disabled:opacity-50 transition-colors shrink-0 whitespace-nowrap"
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  {isPending ? '创建中...' : '创建工单'}
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          {feedback.tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">问题标签</p>
              <div className="flex flex-wrap gap-1.5">
                {feedback.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trip Info */}
          <div className="border border-gray-100 rounded-lg divide-y divide-gray-50">
            <InfoRow icon={<User className="w-4 h-4" />} label="乘客 ID" value={feedback.passengerId} />
            <InfoRow icon={<Navigation className="w-4 h-4" />} label="行程 ID" value={feedback.tripId} />
            <InfoRow icon={<Car className="w-4 h-4" />} label="车辆 ID" value={feedback.vehicleId} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="城市" value={feedback.city} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="路线" value={feedback.route} />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="出发时间"
              value={formatDateTime(feedback.tripStartTime)}
            />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="行程时长"
              value={`${feedback.tripDuration} 分钟`}
            />
            <InfoRow icon={<Cloud className="w-4 h-4" />} label="天气" value={feedback.weather} />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="反馈时间"
              value={formatDateTime(feedback.createdAt)}
            />
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">反馈类型</span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
              {feedback.feedbackType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="text-gray-300 shrink-0">{icon}</span>
      <span className="text-xs text-gray-400 w-20 shrink-0">{label}</span>
      <span className="text-sm text-gray-700 font-medium">{value}</span>
    </div>
  );
}
