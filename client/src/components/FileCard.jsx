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
  Heart
} from 'lucide-react';
import { formatBytes, formatDate, getFileCategoryDetails, copyToClipboard } from '../utils/formatters';
import { sound } from '../utils/audio';

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
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const isImage = file.category === 'image' && !imgError;
  const { Icon, color, badgeColor, label } = getFileCategoryDetails(
    file.category,
    file.originalName,
    file.mimeType
  );

  const fileUrl = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path}`;

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    sound.pop();
    await copyToClipboard(fileUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1500);
  };

  // Double click de tha tim (Heart effect)
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    sound.heart();
    setShowHeartAnim(true);
    if (!file.isFavorite) {
      onToggleFavorite(file.id);
    }
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  return (
    <div
      onClick={() => {
        sound.pop();
        onPreview(file);
      }}
      onDoubleClick={handleDoubleClick}
      className={`group relative flex flex-col justify-between glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-brand-500 bg-brand-50/30 dark:bg-brand-950/30 shadow-lg shadow-brand-500/10'
          : ''
      }`}
    >
      {/* Heart burst animation khi Double-Click */}
      {showHeartAnim && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <Heart className="w-16 h-16 text-rose-500 fill-rose-500 drop-shadow-xl animate-heart-burst" />
        </div>
      )}

      {/* Nút chọn (Checkbox) và Yêu thích (Star) ở góc trên */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.pop();
            onToggleSelect(file.id);
          }}
          className={`pointer-events-auto w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30 scale-105'
              : 'bg-white/80 dark:bg-slate-900/80 text-transparent hover:text-slate-400 opacity-0 group-hover:opacity-100 backdrop-blur-xs border border-slate-200/50 dark:border-slate-700/50'
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.heart();
            onToggleFavorite(file.id);
          }}
          className={`pointer-events-auto w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
            file.isFavorite
              ? 'bg-white/90 dark:bg-slate-900/90 text-amber-500 shadow-sm'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500 backdrop-blur-xs'
          }`}
          title={file.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích (hoặc nhấp đúp để thả tim)'}
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
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className={`p-3.5 rounded-2xl ${color} shadow-inner`}>
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
              sound.pop();
              onPreview(file);
            }}
            className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-md transition-transform hover:scale-110 active:scale-95"
            title="Xem trước"
          >
            <Eye className="w-4 h-4" />
          </button>
          <a
            href={`/api/files/${file.id}/download`}
            onClick={(e) => e.stopPropagation()}
            download
            className="p-2 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-md transition-transform hover:scale-110 active:scale-95"
            title="Tải xuống"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Thông tin File */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.originalName}>
              {file.originalName}
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{formatBytes(file.size)}</span>
              <span>•</span>
              <span>{formatDate(file.createdAt)}</span>
            </div>
          </div>

          {/* Menu 3 chấm context */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.pop();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
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
                <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onPreview(file);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem chi tiết</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onRename(file);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Đổi tên</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Link className="w-3.5 h-3.5" />
                        <span>Sao chép link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`/api/files/${file.id}/download`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                    download
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải xuống</span>
                  </a>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(file.id);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tập tin</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
