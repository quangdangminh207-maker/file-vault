import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';

const GOOGLE_CLIENT_ID = window.__GOOGLE_CLIENT_ID__ || '';

export default function AuthModal({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(GOOGLE_CLIENT_ID);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const googleBtnRef = useRef(null);

  // Lay Client ID tu server neu chua co
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.googleClientId) {
          setGoogleClientId(data.data.googleClientId);
        }
      })
      .catch(() => {});
  }, []);

  // Khoi tao Google Sign-In
  useEffect(() => {
    const activeClientId = googleClientId || GOOGLE_CLIENT_ID;
    if (!activeClientId) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: activeClientId,
        callback: handleGoogleResponse,
        auto_select: false,
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
        });
      }
    };

    // Neu script da tai xong
    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    // Tai script Google Identity Services
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', initGoogle);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }, [googleClientId, isRegister]);

  const handleGoogleResponse = async (response) => {
    if (!response.credential) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        onAuthSuccess(data.data.user, data.data.token);
      } else {
        throw new Error(data.message || 'Xac thuc Google khong thanh cong');
      }
    } catch (err) {
      setError(err.message || 'Loi khi dang nhap bang Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    if (isRegister && username.trim().length < 3) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    if (isRegister && password.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? { username: username.trim(), displayName: displayName.trim(), password }
        : { username: username.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        onAuthSuccess(data.data.user, data.data.token);
      } else {
        throw new Error(data.message || 'Xác thực không thành công');
      }
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
        {/* Banner Header */}
        <div className="relative bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 p-6 text-white text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Kho Lưu Trữ Nhóm Nói Xấu X2</h2>
          <p className="text-xs text-brand-100 mt-1">
            Đăng nhập để truy cập kho ảnh & tập tin riêng tư của bạn
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-1.5">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              !isRegister
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isRegister
                ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tạo tài khoản mới</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nut Dang nhap bang Google */}
          <div className="space-y-3">
            {(googleClientId || GOOGLE_CLIENT_ID) ? (
              <div
                ref={googleBtnRef}
                className="flex justify-center [&>div]:!w-full [&_iframe]:!w-full min-h-[40px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError('Vui lòng thêm GOOGLE_CLIENT_ID trên Render để kích hoạt xác thực Google.');
                }}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập bằng Google</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">
                hoặc
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Tên đăng nhập */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tên tài khoản (Username)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: quang, user123..."
                required
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Tên hiển thị (chỉ khi đăng ký) */}
          {isRegister && (
            <div className="animate-fade-in">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên hiển thị (Tùy chọn)
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="VD: Quang Nguyễn"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Mật khẩu */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-brand-500 text-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Báo lỗi nếu có */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium animate-fade-in">
              {error}
            </div>
          )}

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký tài khoản</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập ngay</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
