import React from 'react';
import {
  X,
  HardDrive,
  Image as ImageIcon,
  FileText,
  Film,
  Archive,
  File,
  Star
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

const CATEGORIES_CONFIG = [
  { id: 'image', label: 'Hình ảnh', icon: ImageIcon, color: 'bg-rose-500', text: 'text-rose-500' },
  { id: 'document', label: 'Tài liệu', icon: FileText, color: 'bg-blue-500', text: 'text-blue-500' },
  { id: 'media', label: 'Video & Audio', icon: Film, color: 'bg-purple-500', text: 'text-purple-500' },
  { id: 'archive', label: 'Tập tin nén', icon: Archive, color: 'bg-amber-500', text: 'text-amber-500' },
  { id: 'other', label: 'Khác', icon: File, color: 'bg-slate-500', text: 'text-slate-500' },
];

export default function StorageStatsModal({ stats, isOpen, onClose }) {
  if (!isOpen || !stats) return null;

  const totalUsed = stats.totalSize || 0;
  const maxStorage = 100 * 1024 * 1024 * 1024; // 100GB
  const percentUsed = Math.min(100, ((totalUsed / maxStorage) * 100).toFixed(1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Thống Kê Bộ Nhớ</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Phân tích lưu lượng và số lượng tập tin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung */}
        <div className="p-6 space-y-6">
          {/* Tổng quan */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Đã sử dụng</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatBytes(totalUsed)}
                  <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">
                    / {formatBytes(maxStorage)}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Tổng tập tin</p>
                <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                  {stats.totalFiles}
                </p>
              </div>
            </div>

            {/* Thanh tiến trình đa màu */}
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              {CATEGORIES_CONFIG.map((cat) => {
                const catSize = stats.categories?.[cat.id]?.size || 0;
                if (totalUsed === 0 || catSize === 0) return null;
                const widthPercent = (catSize / totalUsed) * 100;
                return (
                  <div
                    key={cat.id}
                    className={`h-full ${cat.color}`}
                    style={{ width: `${widthPercent}%` }}
                    title={`${cat.label}: ${formatBytes(catSize)}`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-right">
              Đã sử dụng {percentUsed}% tổng dung lượng được cấp
            </p>
          </div>

          {/* Chi tiết từng danh mục */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Chi tiết theo định dạng
            </h3>

            <div className="space-y-2">
              {CATEGORIES_CONFIG.map((cat) => {
                const catData = stats.categories?.[cat.id] || { count: 0, size: 0 };
                const Icon = cat.icon;
                const sizePercent =
                  totalUsed > 0 ? ((catData.size / totalUsed) * 100).toFixed(0) : 0;

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cat.color}/10 ${cat.text}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {cat.label}
                        </p>
                        <p className="text-[11px] text-slate-400">{catData.count} tập tin</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        {formatBytes(catData.size)}
                      </p>
                      <p className="text-[10px] text-slate-400">{sizePercent}% dung lượng</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
