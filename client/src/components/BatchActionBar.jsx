import React, { useState } from 'react';
import { Download, Trash2, X, Archive, Check, Loader2 } from 'lucide-react';

export default function BatchActionBar({
  selectedIds,
  onClearSelection,
  onBatchDelete,
  onBatchDownload,
}) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (selectedIds.length === 0) return null;

  const handleDownload = async () => {
    setDownloading(true);
    await onBatchDownload();
    setDownloading(false);
  };

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} tập tin đã chọn?`)) {
      setDeleting(true);
      await onBatchDelete();
      setDeleting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md animate-scale-in text-xs">
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700">
        <span className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-[11px]">
          {selectedIds.length}
        </span>
        <span className="font-medium text-slate-200">Đã chọn</span>
      </div>

      {/* Tải về ZIP */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold transition-all"
        title="Tải về file ZIP nén"
      >
        {downloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Archive className="w-3.5 h-3.5" />
        )}
        <span>Tải về file ZIP</span>
      </button>

      {/* Xóa hàng loạt */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 disabled:opacity-50 font-semibold transition-all"
        title="Xóa tất cả file đã chọn"
      >
        {deleting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Trash2 className="w-3.5 h-3.5" />
        )}
        <span>Xóa ({selectedIds.length})</span>
      </button>

      {/* Bỏ chọn */}
      <button
        onClick={onClearSelection}
        className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
        title="Bỏ chọn tất cả"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
