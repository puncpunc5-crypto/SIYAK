import React, { useState } from 'react';
import { Lock, Mail, Key, LogIn, UserPlus, Settings, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabaseClient';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onOpenSupabaseConfig: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onOpenSupabaseConfig,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const config = getStoredSupabaseConfig();
  const isConfigured = Boolean(config.url && config.key);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMsg('Supabase 설정이 완료되지 않았습니다. 우측 상단의 "Supabase 설정" 버튼을 눌러 URL과 API Key를 입력해주세요.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
        if (data.user) {
          setSuccessMsg('회원가입이 완료되었습니다! 로그인된 상태로 대장으로 진입합니다.');
          setTimeout(() => {
            onLoginSuccess(data.user);
          }, 800);
        } else {
          setSuccessMsg('회원가입 요청이 전송되었습니다. 이메일 인증을 확인하시거나 바로 로그인해 주세요.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
        if (data.user) {
          onLoginSuccess(data.user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-black selection:text-white">
      <div className="w-full max-w-md">
        {/* Top badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center justify-center bg-black text-white font-black text-xs px-3 py-1 uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            SECURE AUTH GATEWAY
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase mt-3">
            시약·시료 재고 관리대장
          </h1>
          <p className="text-xs sm:text-sm font-bold text-zinc-600 mt-1">
            Supabase 인증 기반 사용자 전용 시스템
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-black" />
              <h2 className="font-black text-base uppercase">
                {isSignUp ? '신규 사용자 회원가입' : '사용자 로그인'}
              </h2>
            </div>
            <button
              onClick={onOpenSupabaseConfig}
              className="inline-flex items-center gap-1 text-xs font-black bg-zinc-200 hover:bg-zinc-300 px-2.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Supabase 설정</span>
            </button>
          </div>

          {!isConfigured && (
            <div className="mb-6 bg-amber-100 border-2 border-black p-3 text-amber-950 text-xs font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-black block uppercase mb-0.5">Supabase 연결 필요</strong>
                <span>먼저 우측 상단의 <strong className="underline">Supabase 설정</strong> 버튼을 클릭하여 Project URL 및 API Key를 입력해 주세요.</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-rose-100 border-2 border-black p-3 text-rose-950 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-100 border-2 border-black p-3 text-emerald-950 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                이메일 주소 (ID)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="researcher@lab.ac.kr"
                className="w-full px-3 py-2.5 bg-zinc-50 border-2 border-black font-bold text-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-zinc-50 border-2 border-black font-bold text-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-wide border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>처리 중...</span>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Supabase 회원가입 및 로그인</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Supabase 로그인</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-black text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-xs font-black text-black hover:underline cursor-pointer uppercase"
            >
              {isSignUp ? '이미 계정이 있으신가요? 로그인하기' : '계정이 없으신가요? 신규 회원가입'}
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-xs font-bold text-zinc-500">
          연구실 시약·시료 안전 관리 시스템 • Powered by Supabase Auth
        </div>
      </div>
    </div>
  );
};
