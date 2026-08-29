import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FileGrid from './components/FileGrid';
import FileList from './components/FileList';
import UploadModal from './components/UploadModal';
import MediaViewer from './components/MediaViewer';
import RenameModal from './components/RenameModal';
import StorageStatsModal from './components/StorageStatsModal';
import BatchActionBar from './components/BatchActionBar';
import AuthModal from './components/AuthModal';
import { Loader2, Sparkles, Flame, Heart, Star, UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from './utils/audio';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('filevault_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('filevault_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('filevault_theme', 'light');
    }
  }, [isDark]);

  // Auth states
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('filevault_token') || null);
  const [authChecking, setAuthChecking] = useState(true);

  // Data states
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters & View states
  const [activeCategory, setActiveCategory] = useState('all');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Kiểm tra phiên đăng nhập hiện tại
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('filevault_token');
      if (!savedToken) {
        setAuthChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setCurrentUser(data.data);
          setToken(savedToken);
        } else {
          localStorage.removeItem('filevault_token');
          setToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra đăng nhập:', err);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (user, authToken) => {
    localStorage.setItem('filevault_token', authToken);
    setToken(authToken);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Lỗi đăng xuất:', e);
      }
    }
    localStorage.removeItem('filevault_token');
    setToken(null);
    setCurrentUser(null);
    setFiles([]);
    setStats(null);
  };

  // Helper fetch with auth
  const authFetch = useCallback(
    async (url, options = {}) => {
      const currentToken = token || localStorage.getItem('filevault_token');
      const headers = {
        ...options.headers,
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {})
      };
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        handleLogout();
      }
      return res;
    },
    [token]
  );

  // Fetch dữ liệu từ máy chủ
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'all') params.append('category', activeCategory);
      if (favoriteOnly) params.append('favoriteOnly', 'true');
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const [filesRes, statsRes] = await Promise.all([
        authFetch(`/api/files?${params.toString()}`),
        authFetch('/api/stats')
      ]);

      const filesJson = await filesRes.json();
      const statsJson = await statsRes.json();

      if (filesJson.success) setFiles(filesJson.data);
      if (statsJson.success) setStats(statsJson.data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  }, [token, activeCategory, favoriteOnly, searchQuery, sortBy, sortOrder, authFetch]);

  useEffect(() => {
    if (currentUser && token) {
      fetchData();
    }
  }, [currentUser, token, fetchData]);

  // Lắng nghe sự kiện kéo thả file vào toàn màn hình
  useEffect(() => {
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => {
      e.preventDefault();
      if (currentUser && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setIsUploadOpen(true);
      }
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [currentUser]);

  // Xử lý chọn nhiều file
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((f) => f.id));
    }
  };

  // Cập nhật yêu thích
  const handleToggleFavorite = async (id) => {
    try {
      const res = await authFetch(`/api/files/${id}/favorite`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, isFavorite: !f.isFavorite } : f))
        );
        if (previewFile && previewFile.id === id) {
          setPreviewFile((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
        }
        // Cập nhật stats
        authFetch('/api/stats')
          .then((r) => r.json())
          .then((d) => d.success && setStats(d.data));
      }
    } catch (e) {
      console.error('Lỗi khi cập nhật yêu thích:', e);
    }
  };

  // Xóa 1 file
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tập tin này?')) return;
    try {
      const res = await authFetch(`/api/files/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedIds((prev) => prev.filter((i) => i !== id));
        if (previewFile && previewFile.id === id) setPreviewFile(null);
        fetchData();
      }
    } catch (e) {
      console.error('Lỗi khi xóa file:', e);
    }
  };

  // Xóa hàng loạt
  const handleBatchDelete = async () => {
    try {
      const res = await authFetch('/api/files/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]);
        fetchData();
      }
    } catch (e) {
      console.error('Lỗi khi xóa hàng loạt:', e);
    }
  };

  // Tải về ZIP hàng loạt
  const handleBatchDownload = async () => {
    try {
      const res = await authFetch('/api/files/batch-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FileVault-Archive-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Lỗi khi tải zip hàng loạt:', e);
    }
  };

  const getCategoryTitle = () => {
    if (favoriteOnly) return '⭐ Tập tin yêu thích';
    switch (activeCategory) {
      case 'image':
        return '🖼️ Hình ảnh';
      case 'document':
        return '📄 Tài liệu & Văn bản';
      case 'media':
        return '🎬 Video & Âm thanh';
      case 'archive':
        return '📦 Tập tin nén';
      default:
        return '📁 Tất cả tập tin';
    }
  };

  if (authChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <p className="text-xs font-semibold">Đang kiểm tra thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, hiển thị modal Auth
  if (!currentUser || !token) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      {/* Sidebar bên trái */}
      <Sidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        favoriteOnly={favoriteOnly}
        setFavoriteOnly={setFavoriteOnly}
        stats={stats}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
      />

      {/* Vùng nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isDark={isDark}
          setIsDark={setIsDark}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Nội dung cuộn được */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          {/* Aurora Dynamic Glowing Blobs in Background */}
          <div className="aurora-bg">
            <div className="aurora-blob-1" />
            <div className="aurora-blob-2" />
            <div className="aurora-blob-3" />
          </div>

          {/* Banner chào mừng vui nhộn & Thống kê nhanh */}
          {!searchQuery && activeCategory === 'all' && !favoriteOnly && (
            <div className="relative mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-brand-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-xl shadow-brand-500/15 overflow-hidden backdrop-blur-md border border-white/10 animate-fade-in">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
                <Sparkles className="w-64 h-64 text-white" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Kho Lưu Trữ ĐMQ • Siêu Nhanh & Vĩnh Viễn</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {(() => {
                      const h = new Date().getHours();
                      if (h < 12) return 'Chào buổi sáng 🌅';
                      if (h < 18) return 'Chào buổi chiều ☀️';
                      return 'Chào buổi tối 🌙';
                    })()},{' '}
                    <span className="text-amber-200">
                      {currentUser.displayName || currentUser.username}
                    </span>
                    !
                  </h1>
                  <p className="text-xs sm:text-sm text-brand-100 mt-1 max-w-xl">
                    Nơi lưu giữ ảnh nét căng, video chất lượng cao & những khoảnh khắc bất tử của nhóm! 📸✨
                  </p>
                </div>

                {/* Mood reaction emojis vui nhộn */}
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md p-2 rounded-2xl border border-white/15 self-start md:self-auto">
                  <span className="text-[11px] font-medium text-brand-100 mr-1 hidden sm:inline">Tâm trạng:</span>
                  {['😎', '🔥', '🥳', '🚀', '❤️'].map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.heart();
                        confetti({
                          particleCount: 50,
                          spread: 50,
                          origin: { y: 0.6 },
                        });
                      }}
                      className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/30 hover:scale-125 active:scale-95 transition-all text-sm flex items-center justify-center cursor-pointer"
                      title="Bấm để bung pháo hoa!"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Header khu vực nội dung */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <span>{getCategoryTitle()}</span>
                {searchQuery && (
                  <span className="text-xs font-normal text-slate-400">
                    — Kết quả cho: "{searchQuery}"
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Hiển thị {files.length} tập tin của {currentUser.displayName || currentUser.username}
              </p>
            </div>

            {files.length > 0 && (
              <button
                onClick={handleSelectAll}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                {selectedIds.length === files.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            )}
          </div>

          {/* Trạng thái tải dữ liệu */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <p className="text-xs font-medium">Đang tải danh sách tập tin...</p>
            </div>
          ) : viewMode === 'grid' ? (
            <FileGrid
              files={files}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onPreview={(file) => setPreviewFile(file)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
              onRename={(file) => setRenameTarget(file)}
              onOpenUpload={() => setIsUploadOpen(true)}
              searchQuery={searchQuery}
            />
          ) : (
            <FileList
              files={files}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onPreview={(file) => setPreviewFile(file)}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleDelete}
              onRename={(file) => setRenameTarget(file)}
              onOpenUpload={() => setIsUploadOpen(true)}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Floating Batch Actions Bar */}
      <BatchActionBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onBatchDelete={handleBatchDelete}
        onBatchDownload={handleBatchDownload}
      />

      {/* Modal Tải lên */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={fetchData}
      />

      {/* Lightbox / Trình xem Media & Ảnh */}
      <MediaViewer
        file={previewFile}
        files={files}
        onClose={() => setPreviewFile(null)}
        onToggleFavorite={handleToggleFavorite}
        onDelete={(id) => handleDelete(id)}
        onSelectFile={(f) => setPreviewFile(f)}
      />

      {/* Modal Đổi tên tập tin */}
      <RenameModal
        file={renameTarget}
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        onRenameSuccess={fetchData}
      />

      {/* Modal Thống kê bộ nhớ */}
      <StorageStatsModal
        stats={stats}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />
    </div>
  );
}
