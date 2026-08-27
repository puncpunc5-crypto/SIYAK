import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabaseClient';

interface ReagentNotesProps {
  reagentId: string;
  user: any;
}

interface MemoItem {
  id: string;
  user_id: string;
  reagent_id: string;
  content: string;
  updated_at: string;
}

export const ReagentNotes: React.FC<ReagentNotesProps> = ({ reagentId, user }) => {
  const [notes, setNotes] = useState<MemoItem[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tableMissing, setTableMissing] = useState(false);

  const fetchNotes = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('reagent_notes')
        .select('*')
        .eq('reagent_id', reagentId)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          setTableMissing(true);
        } else {
          throw error;
        }
      } else {
        setTableMissing(false);
        setNotes(data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch memos:', err);
      setErrorMsg(err.message || '메모를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [reagentId, user]);

  const handleAddMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const supabase = getSupabaseClient();
    if (!supabase || !user) {
      alert('Supabase 연결 또는 로그인 상태를 확인해주세요.');
      return;
    }

    try {
      const { error } = await supabase.from('reagent_notes').insert([
        {
          user_id: user.id,
          reagent_id: reagentId,
          content: newContent.trim(),
        }
      ]);

      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation')) {
          setTableMissing(true);
          throw new Error('Supabase에 "reagent_notes" 테이블이 생성되어 있지 않습니다. 아래 안내된 SQL 쿼리를 Supabase 대시보드에서 실행해주세요.');
        }
        throw error;
      }

      setNewContent('');
      fetchNotes();
    } catch (err: any) {
      alert(err.message || '메모 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteMemo = async (id: string) => {
    if (!confirm('이 개인 메모를 삭제하시겠습니까?')) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('reagent_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      fetchNotes();
    } catch (err: any) {
      alert(err.message || '메모 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-amber-50/70 border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-black text-sm uppercase text-black">
          <MessageSquare className="w-4 h-4 text-amber-700" />
          <span>연구원 전용 비공개 메모 ({notes.length})</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-200 text-amber-900 px-2 py-0.5 border border-amber-500 uppercase">
          <ShieldCheck className="w-3 h-3 text-amber-800" />
          본인만 열람 가능
        </span>
      </div>

      <p className="text-xs font-bold text-amber-900">
        본 시약에 대해 연구원님이 기록하는 비공개 개인 메모입니다. 다른 연구원에게는 절대 노출되지 않으며 Supabase 계정별로 안전하게 분리 저장됩니다.
      </p>

      {tableMissing && (
        <div className="bg-rose-100 border-2 border-black p-3 text-rose-950 text-xs font-bold space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-1.5 font-black uppercase text-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Supabase 'reagent_notes' 테이블 생성 필요</span>
          </div>
          <p className="text-[11px]">
            Supabase SQL Editor에서 아래 쿼리를 실행하여 메모 테이블과 보안 정책(RLS)을 생성해주세요.
          </p>
          <pre className="bg-black text-emerald-400 p-2 font-mono text-[10px] overflow-x-auto border border-black select-all">
{`create table if not exists reagent_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  reagent_id text not null,
  content text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table reagent_notes enable row level security;

create policy "Users can view own notes" on reagent_notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on reagent_notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on reagent_notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on reagent_notes for delete using (auth.uid() = user_id);`}
          </pre>
        </div>
      )}

      {errorMsg && !tableMissing && (
        <div className="bg-rose-100 border-2 border-black p-3 text-rose-950 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Add memo form */}
      <form onSubmit={handleAddMemo} className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="이 시약에 대한 개인 메모를 입력하세요 (예: 3번 후드 실험 시 사용 주의)..."
            className="flex-1 px-3 py-2 bg-white border-2 border-black text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            메모 저장
          </button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-2 pt-1">
        {loading ? (
          <div className="text-xs font-bold text-zinc-500 text-center py-2 animate-pulse">메모 불러오는 중...</div>
        ) : notes.length === 0 ? (
          <div className="text-xs font-bold text-zinc-500 text-center py-3 bg-white/50 border border-dashed border-zinc-400">
            작성된 개인 메모가 없습니다.
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="bg-white p-3 border-2 border-black flex items-start justify-between gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-black whitespace-pre-wrap">{note.content}</p>
                <span className="text-[10px] font-mono font-bold text-zinc-500 block">
                  {new Date(note.updated_at).toLocaleString('ko-KR')}
                </span>
              </div>
              <button
                onClick={() => handleDeleteMemo(note.id)}
                className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-black transition cursor-pointer shrink-0"
                title="메모 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
