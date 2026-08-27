import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Star,
  Eye,
  MoreVertical,
  Link,
  Edit2,
  Check,
  UploadCloud,
  FolderSearch
} from 'lucide-react';
import { formatBytes, formatDate, getFileCategoryDetails, copyToClipboard } from '../utils/formatters';

export default function FileList({
  files,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onPreview,
  onToggleFavorite,
  onDelete,
  onRename,
  onOpenUpload,
  searchQuery,
}) {
  const [copiedId, setCopiedId] = useState(null);

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
            ? `Không có file nào khớp với từ khóa "${searchQuery}".`
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

  const allSelected = files.length > 0 && files.every((f) => selectedIds.includes(f.id));

  const handleCopyLink = async (file) => {
    const fileUrl = `${window.location.origin}${file.path}`;
    await copyToClipboard(fileUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="overflow-x-auto rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold bg-slate-50/50 dark:bg-slate-900/50">
            <th className="p-3.5 w-10 text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
            </th>
            <th className="p-3.5">Tên tập tin</th>
            <th className="p-3.5 hidden sm:table-cell">Phân loại</th>
            <th className="p-3.5 hidden md:table-cell">Kích thước</th>
            <th className="p-3.5 hidden lg:table-cell">Ngày tải lên</th>
            <th className="p-3.5 text-right pr-4">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {files.map((file) => {
            const isSelected = selectedIds.includes(file.id);
            const { Icon, color, badgeColor, label } = getFileCategoryDetails(
              file.category,
              file.originalName,
              file.mimeType
            );

            return (
              <tr
                key={file.id}
                onClick={() => onPreview(file)}
                className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                  isSelected ? 'bg-brand-50/30 dark:bg-brand-950/30' : ''
                }`}
              >
                {/* Checkbox */}
                <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(file.id)}
                    className="rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                {/* Tên file & Thumbnail */}
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {file.category === 'image' ? (
                        <img
                          src={file.path}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className={color}>
                          <Icon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 max-w-xs md:max-w-md">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-[11px] text-slate-400 sm:hidden">
                        {formatBytes(file.size)} • {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Phân loại */}
                <td className="p-3.5 hidden sm:table-cell">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${badgeColor}`}>
                    {label}
                  </span>
                </td>

                {/* Kích thước */}
                <td className="p-3.5 hidden md:table-cell text-slate-500 dark:text-slate-400 font-medium">
                  {formatBytes(file.size)}
                </td>

                {/* Ngày tải lên */}
                <td className="p-3.5 hidden lg:table-cell text-slate-500 dark:text-slate-400">
                  {formatDate(file.createdAt)}
                </td>

                {/* Thao tác nhanh */}
                <td className="p-3.5 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* Yêu thích */}
                    <button
                      onClick={() => onToggleFavorite(file.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        file.isFavorite
                          ? 'text-amber-500'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={file.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                    >
                      <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>

                    {/* Xem trước */}
                    <button
                      onClick={() => onPreview(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Xem trước"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Sao chép link */}
                    <button
                      onClick={() => handleCopyLink(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Sao chép link tải"
                    >
                      {copiedId === file.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Link className="w-4 h-4" />
                      )}
                    </button>

                    {/* Đổi tên */}
                    <button
                      onClick={() => onRename(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Đổi tên"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Tải xuống */}
                    <a
                      href={`/api/files/${file.id}/download`}
                      download
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Tải xuống"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    {/* Xóa */}
                    <button
                      onClick={() => onDelete(file.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Xóa file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
