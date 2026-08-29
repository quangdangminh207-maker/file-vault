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
  LogIn,
  Cloud,
  Zap,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

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

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

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
        sound.success();
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
        onAuthSuccess(data.data.user, data.data.token);
      } else {
        throw new Error(data.message || 'Xác thực Google không thành công');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi đăng nhập bằng Google');
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
        sound.success();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto select-none">
      {/* Background Animated Aurora Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-brand-600/30 via-indigo-500/20 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-bl from-purple-600/30 via-pink-500/20 to-transparent blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md my-8 bg-white/95 dark:bg-slate-900/90 border border-white/20 dark:border-slate-700/60 rounded-[32px] shadow-2xl shadow-brand-500/15 overflow-hidden backdrop-blur-2xl animate-scale-in">
        
        {/* Glowing Top Ambient Header */}
        <div className="relative pt-8 pb-6 px-6 text-center overflow-hidden bg-gradient-to-b from-brand-600/15 via-indigo-600/5 to-transparent">
          {/* Subtle Background Glow Ring */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />
          
          {/* 3D-styled Logo Avatar */}
          <div className="relative w-20 h-20 mx-auto mb-3.5 group">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-pink-500 blur-lg opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/30 border border-white/30 transform group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-10 h-10 drop-shadow-md text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-[11px] font-bold tracking-wide uppercase mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Lưu Trữ Đám Mây</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            ĐMQ <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent">Vault</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Lưu giữ ảnh nét căng, video 4K & tập tin riêng tư an toàn vĩnh viễn
          </p>
        </div>

        {/* Tab Switcher - Glass Pill */}
        <div className="px-6">
          <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                sound.pop();
                setIsRegister(false);
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isRegister
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-md shadow-slate-900/5 dark:shadow-slate-950/20'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.pop();
                setIsRegister(true);
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isRegister
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-md shadow-slate-900/5 dark:shadow-slate-950/20'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tạo tài khoản mới</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nút Đăng nhập bằng Google */}
          <div className="space-y-3">
            {(googleClientId || GOOGLE_CLIENT_ID) ? (
              <div
                ref={googleBtnRef}
                className="flex justify-center [&>div]:!w-full [&_iframe]:!w-full min-h-[44px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  sound.pop();
                  setError('Vui lòng thêm GOOGLE_CLIENT_ID trên Render để kích hoạt xác thực Google.');
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
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
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                hoặc tài khoản riêng
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          {/* Tên đăng nhập */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-white transition-all"
              />
            </div>
          </div>

          {/* Tên hiển thị (chỉ khi đăng ký) */}
          {isRegister && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tên hiển thị (Tùy chọn)
              </label>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="VD: Quang Đặng Minh"
                  className="w-full pl-10 pr-3.5 py-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Mật khẩu */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu bí mật..."
                required
                className="w-full pl-10 pr-11 py-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-white transition-all"
              />
              <button
                type="button"
                onClick={() => {
                  sound.pop();
                  setShowPassword(!showPassword);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Báo lỗi nếu có */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-fade-in flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            onClick={() => sound.pop()}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-2xl text-xs font-bold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý bảo mật...</span>
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký tài khoản ngay</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập vào ĐMQ</span>
              </>
            )}
          </button>

          {/* Feature Badges Footer */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mã hóa 256-bit</span>
            </div>
            <div className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              <span>Đám Mây 25GB</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Siêu Tốc</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
