import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage({ text: '重置密码链接已发送到您的邮箱，请查收。', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          // Supabase returns specific error messages for duplicate emails
          if (error.message.toLowerCase().includes('already registered') || 
              error.message.toLowerCase().includes('already exists') ||
              error.message.toLowerCase().includes('user already registered')) {
            setMessage({ text: '该邮箱已被注册，请直接登录。', type: 'error' });
            return;
          }
          throw error;
        }

        // Check if Supabase returned a session (auto-confirm is enabled)
        if (data.session) {
          // Auto-confirmed: user is logged in immediately
          setMessage({ text: '注册成功！正在登录...', type: 'success' });
          // The onAuthStateChange listener in App.tsx will handle the session
          return;
        }

        // Check for fake signUp (email already exists but Supabase doesn't error due to security settings)
        // When "Confirm email" is enabled and user already exists, Supabase returns a user
        // with an empty array of identities
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setMessage({ text: '该邮箱已被注册，请直接登录。', type: 'error' });
          return;
        }

        // Email confirmation is required
        if (data.user && !data.session) {
          setMessage({ text: '注册成功！请查看邮箱确认后再登录。', type: 'success' });
          setIsSignUp(false);
          return;
        }

        setMessage({ text: '注册成功，请登录！', type: 'success' });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setMessage({ text: '邮箱尚未确认，请查看邮箱中的确认链接。', type: 'error' });
            return;
          }
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            setMessage({ text: '邮箱或密码错误，请重试。', type: 'error' });
            return;
          }
          throw error;
        }
        onLogin();
      }
    } catch (error: any) {
      setMessage({ text: error.error_description || error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl font-black text-center mb-8 italic tracking-tighter">
          {isForgotPassword ? '重置密码' : (isSignUp ? '加入自律' : '登录 HABIT')}
        </h1>

        {/* Message display */}
        {message && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'error' 
              ? 'bg-red-50 text-red-600 border border-red-100' 
              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="flex flex-col gap-4">
          <input
            className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            type="email"
            placeholder="邮箱"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          {!isForgotPassword && (
            <>
              <div className="relative">
                <input
                  className="w-full bg-neutral-100 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="密码"
                  value={password}
                  required
                  minLength={6}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setMessage(null);
                  }}
                  className="text-right text-xs text-neutral-400 hover:text-black transition-colors"
                >
                  忘记密码？
                </button>
              )}
            </>
          )}
          <button
            className="w-full bg-black text-white font-bold rounded-xl py-4 mt-4 active:scale-95 transition-transform"
            disabled={loading}
          >
            {loading ? '处理中...' : (isForgotPassword ? '发送重置链接' : (isSignUp ? '注 册' : '登 录'))}
          </button>
        </form>
        {isForgotPassword ? (
          <button
            onClick={() => {
              setIsForgotPassword(false);
              setMessage(null);
            }}
            className="w-full text-center text-sm text-neutral-500 mt-6 hover:text-black transition-colors"
          >
            返回登录
          </button>
        ) : (
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="w-full text-center text-sm text-neutral-500 mt-6 hover:text-black transition-colors"
          >
            {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        )}
      </div>
    </div>
  );
}
