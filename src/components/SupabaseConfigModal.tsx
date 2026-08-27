import React, { useState } from 'react';
import { Key, Globe, X, Save, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getStoredSupabaseConfig, saveSupabaseConfig } from '../lib/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const current = getStoredSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [key, setKey] = useState(current.key);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      alert('Supabase URL과 Anon Key를 모두 입력해주세요.');
      return;
    }
    saveSupabaseConfig(url, key);
    setSuccessMsg('Supabase 설정이 성공적으로 저장되었습니다!');
    setTimeout(() => {
      setSuccessMsg('');
      onConfigSaved();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-lg w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-8">
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black uppercase tracking-tight">Supabase 연동 설정</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition cursor-pointer font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="bg-amber-100 border-2 border-black p-4 text-amber-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 font-black text-sm uppercase mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Supabase 프로젝트 자격 증명 입력</span>
            </div>
            <p className="text-xs font-bold text-amber-900 mt-1">
              Supabase 대시보드(Project Settings &gt; API)에서 <strong className="font-black">Project URL</strong>과 <strong className="font-black">anon public API key</strong>를 복사하여 입력해주세요. 입력된 정보는 브라우저에 안전하게 저장됩니다.
            </p>
          </div>

          {successMsg && (
            <div className="bg-emerald-100 border-2 border-black p-3 text-emerald-950 text-xs font-black flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4 text-xs font-bold">
            <div>
              <label className="block font-black text-black uppercase mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-black" />
                Supabase Project URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full px-3 py-2.5 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-black text-black uppercase mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-black" />
                Supabase Anon / Public Key *
              </label>
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2.5 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase tracking-wide hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              설정 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
