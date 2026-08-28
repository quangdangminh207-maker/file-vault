import React from 'react';
import {
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Film,
  Archive,
  Star,
  HardDrive,
  Plus,
  Files,
  X
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';

const NAV_ITEMS = [
  { id: 'all', label: 'Tất cả tập tin', icon: Files, color: 'text-brand-500' },
  { id: 'image', label: 'Hình ảnh', icon: ImageIcon, color: 'text-rose-500' },
  { id: 'document', label: 'Tài liệu', icon: FileText, color: 'text-blue-500' },
  { id: 'media', label: 'Video & Audio', icon: Film, color: 'text-purple-500' },
  { id: 'archive', label: 'Tập tin nén', icon: Archive, color: 'text-amber-500' },
];

export default function Sidebar({
  activeCategory,
  setActiveCategory,
  favoriteOnly,
  setFavoriteOnly,
  stats,
  isOpen,
  onClose,
  onOpenUpload,
  onOpenStats,
}) {
  const totalUsed = stats?.totalSize || 0;
  const maxStorage = 100 * 1024 * 1024 * 1024; // Hạn mức 100GB
  const usedPercent = Math.min(100, Math.round((totalUsed / maxStorage) * 100));

  const getItemCount = (id) => {
    if (!stats) return 0;
    if (id === 'all') return stats.totalFiles || 0;
    return stats.categories?.[id]?.count || 0;
  };

  return (
    <>
      {/* Backdrop trên mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 w-64 glass-panel border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Header trên mobile */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-white">Danh mục</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Nút Tải lên nổi bật */}
          <button
            onClick={() => {
              onOpenUpload();
              if (isOpen) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 active:scale-98 text-white rounded-xl font-medium shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Tải lên tập tin</span>
          </button>

          {/* Menu danh mục */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Bộ sưu tập
            </p>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = !favoriteOnly && activeCategory === item.id;
              const count = getItemCount(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setFavoriteOnly(false);
                    setActiveCategory(item.id);
                    if (isOpen) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? 'bg-brand-200/60 dark:bg-brand-900 text-brand-700 dark:text-brand-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-3">
              <p className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Bộ lọc nhanh
              </p>
              <button
                onClick={() => {
                  setFavoriteOnly(true);
                  if (isOpen) onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  favoriteOnly
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star className={`w-4 h-4 ${favoriteOnly ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
                  <span>Đã gắn sao yêu thích</span>
                </div>
                {stats?.favoritesCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-medium">
                    {stats.favoritesCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Khối thống kê dung lượng Mini */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-slate-800/80 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <HardDrive className="w-4 h-4 text-brand-500" />
              <span>Dung lượng đã dùng</span>
            </div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{usedPercent}%</span>
          </div>

          {/* Thanh tiến trình */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(usedPercent, 2)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{formatBytes(totalUsed)} đã dùng</span>
            <button
              onClick={onOpenStats}
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer"
            >
              Chi tiết
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
