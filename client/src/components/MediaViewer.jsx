import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Trash2,
  Star,
  Copy,
  Check,
  FileText,
  ExternalLink,
  Info
} from 'lucide-react';
import { formatBytes, formatDate, getFileCategoryDetails, copyToClipboard } from '../utils/formatters';

export default function MediaViewer({
  file,
  files = [],
  onClose,
  onToggleFavorite,
  onDelete,
  onSelectFile,
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    setZoom(1);
    setRotation(0);
  }, [file]);

  // Phím tắt bàn phím (Esc để đóng, mũi tên trái/phải để chuyển file)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, files]);

  if (!file) return null;

  const currentIndex = files.findIndex((f) => f.id === file.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < files.length - 1;

  const handlePrev = () => {
    if (hasPrev) onSelectFile(files[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onSelectFile(files[currentIndex + 1]);
  };

  const handleCopyLink = async () => {
    const url = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path}`;
    await copyToClipboard(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ext = (file.originalName.split('.').pop() || '').toLowerCase();
  const { Icon, label, color, badgeColor } = getFileCategoryDetails(
    file.category,
    file.originalName,
    file.mimeType
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      {/* Top bar điều khiển */}
      <div className="absolute top-0 inset-x-0 h-16 flex items-center justify-between px-6 z-30 bg-gradient-to-b from-slate-950/80 to-transparent">
        <div className="flex items-center gap-3 truncate max-w-md">
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h3 className="text-sm font-semibold text-white truncate" title={file.originalName}>
              {file.originalName}
            </h3>
            <p className="text-xs text-slate-400">
              {formatBytes(file.size)} • {formatDate(file.createdAt)}
            </p>
          </div>
        </div>

        {/* Nút tác vụ góc trên bên phải */}
        <div className="flex items-center gap-2">
          {/* Zoom controls chỉ dành cho ảnh */}
          {file.category === 'image' && (
            <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/10 text-white mr-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-2">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-1"
                title="Xoay ảnh"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Yêu thích */}
          <button
            onClick={() => onToggleFavorite(file.id)}
            className={`p-2 rounded-xl border border-white/10 backdrop-blur-md transition-colors ${
              file.isFavorite
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Yêu thích"
          >
            <Star className={`w-4 h-4 ${file.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Sao chép link */}
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md transition-colors"
            title="Sao chép link trực tiếp"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Tải về */}
          <a
            href={`/api/files/${file.id}/download`}
            download
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md transition-colors"
            title="Tải xuống tập tin"
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Thông tin chi tiết */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-xl border border-white/10 backdrop-blur-md transition-colors ${
              showInfo ? 'bg-brand-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Thông tin chi tiết"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Nút Đóng */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-rose-500/80 border border-white/10 backdrop-blur-md transition-colors ml-2"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Nút Chuyển trước / sau */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          title="Tập tin trước (Phím ←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
          title="Tập tin tiếp theo (Phím →)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Khu vực hiển thị nội dung chính */}
      <div className="w-full h-full flex items-center justify-center p-8 sm:p-16 overflow-hidden">
        {/* Hình ảnh */}
        {file.category === 'image' && (
          <div className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200">
            <img
              src={file.path}
              alt={file.originalName}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxHeight: '80vh',
                maxWidth: '85vw',
              }}
              className="object-contain rounded-xl shadow-2xl transition-transform duration-200 ease-out"
            />
          </div>
        )}

        {/* Video */}
        {file.category === 'media' && ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext) && (
          <div className="max-w-4xl w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
            <video controls autoPlay className="w-full max-h-[75vh]">
              <source src={file.path} type={file.mimeType || 'video/mp4'} />
              Trình duyệt không hỗ trợ phát video này.
            </video>
          </div>
        )}

        {/* Audio */}
        {file.category === 'media' && ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext) && (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center gap-6 max-w-md w-full">
            <div className="w-24 h-24 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Icon className="w-12 h-12 animate-pulse" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-white mb-1">{file.originalName}</h4>
              <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
            </div>
            <audio controls autoPlay className="w-full">
              <source src={file.path} type={file.mimeType || 'audio/mpeg'} />
              Trình duyệt không hỗ trợ phát âm thanh này.
            </audio>
          </div>
        )}

        {/* PDF / Tài liệu hỗ trợ nhúng */}
        {ext === 'pdf' && (
          <div className="w-full h-full max-w-5xl max-h-[82vh] bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            <iframe
              src={file.path}
              title={file.originalName}
              className="w-full h-full flex-1"
            />
          </div>
        )}

        {/* File không hỗ trợ preview trực tiếp */}
        {file.category !== 'image' &&
          !['mp4', 'webm', 'mov', 'mkv', 'avi', 'mp3', 'wav', 'ogg', 'm4a', 'flac', 'pdf'].includes(ext) && (
            <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center gap-5 max-w-md w-full text-center">
              <div className={`p-6 rounded-3xl ${color}`}>
                <Icon className="w-16 h-16" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">{file.originalName}</h4>
                <p className="text-xs text-slate-400">
                  {formatBytes(file.size)} • Định dạng {ext.toUpperCase()}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Định dạng này không hỗ trợ xem trực tiếp. Bạn có thể tải tập tin về thiết bị để mở.
              </p>
              <a
                href={`/api/files/${file.id}/download`}
                download
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải về ngay</span>
              </a>
            </div>
          )}
      </div>

      {/* Drawer Thông tin chi tiết */}
      {showInfo && (
        <div className="absolute right-0 top-16 bottom-0 w-80 bg-slate-900/95 border-l border-slate-800 p-6 flex flex-col gap-4 text-xs text-slate-300 backdrop-blur-md animate-scale-in z-40 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="font-bold text-sm text-white">Chi tiết tập tin</h4>
            <button
              onClick={() => setShowInfo(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-slate-500 block mb-1">Tên gốc:</span>
              <p className="font-medium text-white break-words">{file.originalName}</p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Phân loại:</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeColor}`}>
                {label} ({ext.toUpperCase()})
              </span>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Kích thước:</span>
              <p className="font-medium text-white">{formatBytes(file.size)}</p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">MIME Type:</span>
              <p className="font-mono text-slate-400">{file.mimeType || 'unknown'}</p>
            </div>

            <div>
              <span className="text-slate-500 block mb-1">Thời gian tải lên:</span>
              <p className="text-white">{formatDate(file.createdAt)}</p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => onDelete(file.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-semibold border border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa tập tin này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
