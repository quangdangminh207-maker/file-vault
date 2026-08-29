import React, { useState } from 'react';
import {
  Download,
  Trash2,
  Star,
  Eye,
  MoreVertical,
  Link,
  Edit2,
  Check
} from 'lucide-react';
import { formatBytes, formatDate, getFileCategoryDetails, copyToClipboard } from '../utils/formatters';

export default function FileCard({
  file,
  isSelected,
  onToggleSelect,
  onPreview,
  onToggleFavorite,
  onDelete,
  onRename,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isImage = file.category === 'image' && !imgError;
  const { Icon, color, badgeColor, label } = getFileCategoryDetails(
    file.category,
    file.originalName,
    file.mimeType
  );

  const fileUrl = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path}`;

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    await copyToClipboard(fileUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1500);
  };

  return (
    <div
      onClick={() => onPreview(file)}
      className={`group relative flex flex-col justify-between glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
        isSelected
          ? 'ring-2 ring-brand-500 bg-brand-50/20 dark:bg-brand-950/20'
          : ''
      }`}
    >
      {/* Nút chọn (Checkbox) và Yêu thích (Star) ở góc trên */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(file.id);
          }}
          className={`pointer-events-auto w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 dark:hover:text-white backdrop-blur-xs'
          }`}
        >
          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(file.id);
          }}
          className={`pointer-events-auto p-1.5 rounded-lg transition-all ${
            file.isFavorite
              ? 'bg-white/90 dark:bg-slate-900/90 text-amber-500 shadow-sm'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500 backdrop-blur-xs'
          }`}
          title={file.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-amber-500' : ''}`} />
        </button>
      </div>

      {/* Khu vực Thumbnail / Preview Icon */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-center">
        {isImage ? (
          <img
            src={file.path}
            alt={file.originalName}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className={`p-3.5 rounded-2xl ${color}`}>
              <Icon className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {file.originalName.split('.').pop() || label}
            </span>
          </div>
        )}

        {/* Lớp phủ hành động nhanh khi hover */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-md transition-transform hover:scale-110"
            title="Xem trước"
          >
            <Eye className="w-4 h-4" />
          </button>
          <a
            href={`/api/files/${file.id}/download`}
            onClick={(e) => e.stopPropagation()}
            download
            className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-md transition-transform hover:scale-110"
            title="Tải xuống"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Thông tin chi tiết file */}
      <div className="p-3.5 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-1">
          <p
            className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate flex-1 title-hover"
            title={file.originalName}
          >
            {file.originalName}
          </p>

          {/* Menu ba chấm */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 bottom-full mb-1 z-30 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 text-xs animate-scale-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onRename(file);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đổi tên</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Link className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(file.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa file</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
