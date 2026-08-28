import React from 'react';
import {
  FileImage,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  File,
} from 'lucide-react';

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} ngày trước`;

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileCategoryDetails(category, filename = '', mimeType = '') {
  const ext = (filename.split('.').pop() || '').toLowerCase();

  switch (category) {
    case 'image':
      return {
        label: 'Hình ảnh',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        Icon: FileImage,
      };
    case 'media':
      if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext) || mimeType.startsWith('audio/')) {
        return {
          label: 'Âm thanh',
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
          Icon: FileAudio,
        };
      }
      return {
        label: 'Video',
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        Icon: FileVideo,
      };
    case 'document':
      if (['xls', 'xlsx', 'csv'].includes(ext)) {
        return {
          label: 'Bảng tính',
          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          Icon: FileSpreadsheet,
        };
      }
      if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'php', 'sql'].includes(ext)) {
        return {
          label: 'Mã nguồn',
          color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
          badgeColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
          Icon: FileCode,
        };
      }
      return {
        label: 'Tài liệu',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        Icon: FileText,
      };
    case 'archive':
      return {
        label: 'Tập tin nén',
        color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        Icon: FileArchive,
      };
    default:
      return {
        label: 'Khác',
        color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
        badgeColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        Icon: File,
      };
  }
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}
