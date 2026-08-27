import React, { useState } from 'react';
import { ProcessedReagentItem } from '../types';
import { X, ClipboardList, Copy, Check } from 'lucide-react';

interface ReorderModalProps {
  items: ProcessedReagentItem[];
  onClose: () => void;
}

export const ReorderModal: React.FC<ReorderModalProps> = ({ items, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<'reorder' | 'expired' | 'shortage'>('reorder');

  // Filter items based on tab
  const filtered = items.filter(i => {
    if (tab === 'reorder') {
      return i.expiryState === '만료' || i.expiryState === '임박' || i.qtyState === '부족';
    } else if (tab === 'expired') {
      return i.expiryState === '만료' || i.expiryState === '임박';
    } else {
      return i.qtyState === '부족';
    }
  });

  const generateTSV = () => {
    const headers = ['시약코드', '시약명', 'CAS번호', '위험물', '보관위치', '담당자', '유효기간', '잔량', '판정상태'];
    const rows = filtered.map(i => [
      i.reagent_id,
      i.reagent_name,
      i.cas_no,
      i.hazard_class,
      i.location,
      i.emp_name,
      i.expiry_date || '미기재',
      `${i.remain_qty ?? '-'} / ${i.init_qty ?? '-'} ${i.qty_unit}`,
      `${i.expiryState} / ${i.qtyState}`
    ]);
    return [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
  };

  const handleCopy = () => {
    const tsv = generateTSV();
    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-3xl w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black uppercase tracking-tight">발주 및 폐기 후보 목록 복사 (F-08)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition cursor-pointer font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex bg-zinc-100 p-1 border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <button
                onClick={() => setTab('reorder')}
                className={`px-3 py-1.5 transition cursor-pointer uppercase ${
                  tab === 'reorder' ? 'bg-black text-white border-2 border-black' : 'text-zinc-800 hover:text-black'
                }`}
              >
                전체 대상 ({items.filter(i => i.expiryState === '만료' || i.expiryState === '임박' || i.qtyState === '부족').length}건)
              </button>
              <button
                onClick={() => setTab('expired')}
                className={`px-3 py-1.5 transition cursor-pointer uppercase ${
                  tab === 'expired' ? 'bg-black text-white border-2 border-black' : 'text-zinc-800 hover:text-black'
                }`}
              >
                만료·임박 ({items.filter(i => i.expiryState === '만료' || i.expiryState === '임박').length}건)
              </button>
              <button
                onClick={() => setTab('shortage')}
                className={`px-3 py-1.5 transition cursor-pointer uppercase ${
                  tab === 'shortage' ? 'bg-black text-white border-2 border-black' : 'text-zinc-800 hover:text-black'
                }`}
              >
                잔량 부족 ({items.filter(i => i.qtyState === '부족').length}건)
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-wide rounded-none text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '클립보드 복사 완료!' : '탭 구분 텍스트 복사'}</span>
            </button>
          </div>

          <p className="text-xs font-bold text-zinc-600">
            엑셀(Excel) 스프레드시트에 곧바로 붙여넣기(Ctrl+V)할 수 있는 Tab 구분 형식으로 생성됩니다.
          </p>

          <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-zinc-50">
            <div className="max-h-96 overflow-y-auto p-4 font-mono text-xs font-bold text-black whitespace-pre">
              {generateTSV()}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-200 border-t-4 border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase tracking-wide hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

