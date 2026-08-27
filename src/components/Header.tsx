import React from 'react';
import { Upload, Plus, FileText, RotateCcw, Download, ClipboardList, LogOut, User, Settings } from 'lucide-react';

interface HeaderProps {
  totalCount: number;
  user: any;
  onOpenImport: () => void;
  onOpenDirectAdd: () => void;
  onOpenReorder: () => void;
  onResetDefault: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onOpenSupabaseConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  user,
  onOpenImport,
  onOpenDirectAdd,
  onOpenReorder,
  onResetDefault,
  onExportCSV,
  onLogout,
  onOpenSupabaseConfig,
}) => {
  return (
    <header className="bg-white border-b-4 border-black sticky top-0 z-20 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center bg-black text-white font-black text-xs px-2.5 py-1 uppercase tracking-widest border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                PRD-R02
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
                시약·시료 재고 관리대장
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 font-bold mt-1.5 flex flex-wrap items-center gap-2">
              <span>기준일: <strong className="text-black font-black">2026-08-27</strong></span>
              <span>•</span>
              <span>총 관리 품목: <strong className="text-black font-black">{totalCount}건</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-black uppercase bg-emerald-100 px-1.5 py-0.5 border border-emerald-400">자동 판정 활성</span>
              {user && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 bg-zinc-200 text-black px-2 py-0.5 border border-black font-mono text-xs font-black">
                    <User className="w-3 h-3" />
                    {user.email}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenSupabaseConfig}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 text-black text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-200 transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              title="Supabase 연동 설정"
            >
              <Settings className="w-4 h-4 text-black" />
              Supabase 설정
            </button>

            <button
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black text-white text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              대장 반입
            </button>

            <button
              onClick={onOpenDirectAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-black text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              단건 추가
            </button>

            <button
              onClick={onOpenReorder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-black text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              title="만료·임박·부족 항목 발주 후보 복사"
            >
              <ClipboardList className="w-4 h-4 text-emerald-700" />
              발주·폐기 목록
            </button>

            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-black text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              title="현재 대장 CSV 다운로드"
            >
              <Download className="w-4 h-4 text-black" />
              내보내기
            </button>

            <button
              onClick={onResetDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-200 text-rose-900 text-xs font-black uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-rose-300 transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              title="원본 80행 데이터셋으로 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-300 text-black text-xs font-black uppercase tracking-wide border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-400 transition active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
