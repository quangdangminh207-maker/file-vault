import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes } from '../utils/formatters';
import { sound } from '../utils/audio';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB per chunk

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setError(null);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload 1 file theo phan doan (Chunked Upload)
  const uploadSingleFileChunked = async (file, token, totalBytesUploaded, overallTotalSize) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const chunkFiles = [];
    let fileUploadedBytes = 0;
    const startTime = Date.now();

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunkBlob = file.slice(start, end);

      const chunkFormData = new FormData();
      chunkFormData.append('chunk', chunkBlob, `${file.name}.part${i}`);

      const chunkRes = await fetch('/api/upload/chunk', {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: chunkFormData,
      });

      if (!chunkRes.ok) {
        const errText = await chunkRes.text();
        let errMsg = 'Lỗi phân đoạn upload';
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.message || errMsg;
        } catch {
          errMsg = `Máy chủ phản hồi lỗi (${chunkRes.status})`;
        }
        throw new Error(errMsg);
      }

      const chunkData = await chunkRes.json();
      if (!chunkData.success) {
        throw new Error(chunkData.message || 'Lỗi tải lên phân đoạn');
      }

      chunkFiles.push(chunkData.tempPath);
      fileUploadedBytes += (end - start);

      // Tinh tien trinh tong the & toc do
      const now = Date.now();
      const durationSec = Math.max(0.5, (now - startTime) / 1000);
      const speed = (fileUploadedBytes / (1024 * 1024)) / durationSec;
      setUploadSpeed(`${speed.toFixed(1)} MB/s`);

      const currentTotal = totalBytesUploaded + fileUploadedBytes;
      const overallPercent = Math.min(99, Math.round((currentTotal / overallTotalSize) * 100));
      setProgress(overallPercent);
    }

    // Hoan tat ghep file
    const completeRes = await fetch('/api/upload/chunk-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        originalName: file.name,
        chunkFiles: chunkFiles,
        mimeType: file.type,
        size: file.size,
      }),
    });

    if (!completeRes.ok) {
      throw new Error('Không thể ghép phân đoạn tập tin');
    }

    const completeData = await completeRes.json();
    if (!completeData.success) {
      throw new Error(completeData.message || 'Lỗi hoàn tất tải lên tập tin');
    }

    return completeData.data;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(1);
    setError(null);

    const token = localStorage.getItem('filevault_token');
    const overallTotalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
    let totalBytesUploaded = 0;

    try {
      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        setCurrentFileName(`(${index + 1}/${selectedFiles.length}) ${file.name}`);

        // Neu file nho <= 10MB thi thu dung standard upload, neu lon hon dung Chunked Upload
        if (file.size > 10 * 1024 * 1024 || selectedFiles.length === 1) {
          await uploadSingleFileChunked(file, token, totalBytesUploaded, overallTotalSize);
        } else {
          // Upload Standard
          const formData = new FormData();
          formData.append('files', file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: formData,
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message || 'Lỗi khi tải lên tập tin');
        }

        totalBytesUploaded += file.size;
        const percent = Math.min(99, Math.round((totalBytesUploaded / overallTotalSize) * 100));
        setProgress(percent);
      }

      setProgress(100);
      sound.success();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
      setSelectedFiles([]);
      onUploadSuccess();
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setCurrentFileName('');
        setUploadSpeed('');
        onClose();
      }, 600);
    } catch (err) {
      setError(err.message || 'Không thể tải lên tập tin');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Tải Lên Ảnh & Tập Tin</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hỗ trợ tải lên file lớn (GB) siêu tốc không giới hạn</p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Upload */}
        <div className="p-6 space-y-4">
          {/* Vùng Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 scale-[0.99]'
                : 'border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500/60 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nhấn để chọn file hoặc kéo thả vào đây
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Tải siêu tốc phân đoạn (Chunked): Hình ảnh, Video 4K, File nén ZIP 2GB - 10GB...
            </p>
          </div>

          {/* Danh sách file đã chọn */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span>Danh sách đã chọn ({selectedFiles.length} tập tin)</span>
                <span>
                  Tổng:{' '}
                  {formatBytes(
                    selectedFiles.reduce((acc, f) => acc + f.size, 0)
                  )}
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <File className="w-4 h-4 text-brand-500 shrink-0" />
                      )}
                      <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {file.name}
                      </span>
                      <span className="text-slate-400 shrink-0">
                        ({formatBytes(file.size)})
                      </span>
                    </div>
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thanh tiến trình */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 truncate max-w-[70%]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500 shrink-0" />
                  <span className="truncate">{currentFileName || 'Đang tải lên...'}</span>
                </span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {uploadSpeed && <span className="mr-2 text-slate-400 font-normal">{uploadSpeed}</span>}
                  {progress}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Báo lỗi nếu có */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tải... ({progress}%)</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Tải lên ngay ({selectedFiles.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
