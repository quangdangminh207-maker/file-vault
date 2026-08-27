import React, { useState } from 'react';
import {
  Search,
  Upload,
  LayoutGrid,
  List,
  Sun,
  Moon,
  HardDrive,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  isDark,
  setIsDark,
  onOpenUpload,
  onOpenStats,
  onToggleSidebar,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userInitial = (user?.displayName || user?.username || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Nút mở sidebar cho mobile & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Menu danh mục"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent leading-tight">
                FileVault
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                Lưu trữ ảnh & tập tin
              </p>
            </div>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ảnh, tài liệu, file..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-100/90 dark:bg-slate-800/90 border border-transparent focus:border-brand-500/50 dark:focus:border-brand-500/50 focus:bg-white dark:focus:bg-slate-900 rounded-xl focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Công cụ & Hành động */}
        <div className="flex items-center gap-2">
          {/* Bộ lọc sắp xếp */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 text-xs">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="bg-transparent border-none text-slate-600 dark:text-slate-300 font-medium px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="createdAt-desc" className="dark:bg-slate-900">Mới nhất trước</option>
              <option value="createdAt-asc" className="dark:bg-slate-900">Cũ nhất trước</option>
              <option value="originalName-asc" className="dark:bg-slate-900">Tên (A → Z)</option>
              <option value="originalName-desc" className="dark:bg-slate-900">Tên (Z → A)</option>
              <option value="size-desc" className="dark:bg-slate-900">Dung lượng giảm dần</option>
              <option value="size-asc" className="dark:bg-slate-900">Dung lượng tăng dần</option>
            </select>
          </div>

          {/* Chuyển đổi hiển thị Grid / List */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Chế độ Lưới (Grid)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Chế độ Danh sách (List)"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Xem thống kê dung lượng */}
          <button
            onClick={onOpenStats}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
            title="Thống kê bộ nhớ"
          >
            <HardDrive className="w-4 h-4 text-brand-500" />
          </button>

          {/* Chế độ Sáng / Tối */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition-colors"
            title={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Nút Tải lên chính */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-brand-500/25 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Tải lên</span>
          </button>

          {/* User Profile Menu */}
          {user && (
            <div className="relative ml-1">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200/60 dark:border-slate-700/60"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
                  style={{ backgroundColor: user.avatarColor || '#6366f1' }}
                >
                  {userInitial}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden md:inline truncate max-w-[90px]">
                  {user.displayName || user.username}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 animate-scale-in text-xs">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {user.displayName || user.username}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
