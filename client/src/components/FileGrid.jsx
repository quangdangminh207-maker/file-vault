import React from 'react';
import FileCard from './FileCard';
import { UploadCloud, FolderSearch } from 'lucide-react';

export default function FileGrid({
  files,
  selectedIds,
  onToggleSelect,
  onPreview,
  onToggleFavorite,
  onDelete,
  onRename,
  onOpenUpload,
  searchQuery,
}) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mb-4">
          {searchQuery ? <FolderSearch className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
        </div>
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
          {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có tập tin nào ở đây'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
          {searchQuery
            ? `Không có file nào khớp với từ khóa "${searchQuery}". Hãy thử tìm kiếm bằng từ khóa khác.`
            : 'Hãy tải lên những hình ảnh hoặc tài liệu đầu tiên để bắt đầu lưu trữ an toàn.'}
        </p>
        {!searchQuery && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            Tải lên ngay bây giờ
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isSelected={selectedIds.includes(file.id)}
          onToggleSelect={onToggleSelect}
          onPreview={onPreview}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
}
