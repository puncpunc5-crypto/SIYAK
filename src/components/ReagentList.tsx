import React from 'react';
import { ProcessedReagentItem } from '../types';
import { AlertCircle, Clock, Layers, MapPin, User, ArrowUpDown } from 'lucide-react';

interface ReagentListProps {
  items: ProcessedReagentItem[];
  onSelectItem: (item: ProcessedReagentItem) => void;
}

export const ReagentList: React.FC<ReagentListProps> = ({ items, onSelectItem }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white border-2 border-black p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-12 h-12 border-2 border-black bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-black">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-black uppercase text-black">조건에 해당하는 시약이 없습니다</h3>
        <p className="text-sm font-bold text-zinc-600 mt-1">검색어나 필터 조건을 변경하거나 초기화해 주세요.</p>
      </div>
    );
  }

  // Helper for hazard badge style
  const getHazardBadgeStyle = (hazard: string) => {
    switch (hazard) {
      case '인화성':
        return 'bg-red-200 text-red-950 border-2 border-black font-black';
      case '독성':
        return 'bg-purple-200 text-purple-950 border-2 border-black font-black';
      case '부식성':
        return 'bg-amber-200 text-amber-950 border-2 border-black font-black';
      case '산화성':
        return 'bg-blue-200 text-blue-950 border-2 border-black font-black';
      case '해당없음':
        return 'bg-zinc-100 text-zinc-800 border-2 border-black font-bold';
      default:
        return 'bg-zinc-100 text-zinc-800 border-2 border-black font-bold';
    }
  };

  // Helper for storage temp style
  const getTempBadgeStyle = (temp: string) => {
    switch (temp) {
      case '-20℃':
        return 'bg-sky-950 text-white border-2 border-black font-black';
      case '4℃':
        return 'bg-sky-200 text-sky-950 border-2 border-black font-black';
      case 'RT':
        return 'bg-zinc-100 text-zinc-800 border-2 border-black font-bold';
      default:
        return 'bg-zinc-100 text-zinc-800 border-2 border-black font-bold';
    }
  };

  // Helper for expiry badge style
  const getExpiryBadgeStyle = (state: string) => {
    switch (state) {
      case '만료':
        return 'bg-rose-600 text-white font-black border-2 border-black';
      case '임박':
        return 'bg-amber-400 text-amber-950 font-black border-2 border-black';
      case '정상':
        return 'bg-emerald-200 text-emerald-950 border-2 border-black font-black';
      default:
        return 'bg-zinc-100 text-zinc-800 border-2 border-black font-bold';
    }
  };

  // Helper for quantity bar color
  const getQtyBarStyle = (state: string) => {
    switch (state) {
      case '부족':
        return 'bg-orange-500 border border-black';
      case '데이터 오류':
        return 'bg-rose-600 border border-black bg-[linear-gradient(45deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]';
      case '정상':
        return 'bg-emerald-600 border border-black';
      default:
        return 'bg-zinc-400 border border-black';
    }
  };

  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white border-b-2 border-black text-xs font-black uppercase tracking-wider">
              <th className="py-3.5 px-4 border-r-2 border-zinc-800">시약코드 / 시약명</th>
              <th className="py-3.5 px-4 border-r-2 border-zinc-800">CAS 번호</th>
              <th className="py-3.5 px-4 border-r-2 border-zinc-800">위험물 / 보관</th>
              <th className="py-3.5 px-4 border-r-2 border-zinc-800">보관위치 / 담당자</th>
              <th className="py-3.5 px-4 border-r-2 border-zinc-800">유효기간 (D-day)</th>
              <th className="py-3.5 px-4 border-r-2 border-zinc-800">잔량 현황</th>
              <th className="py-3.5 px-4 text-right">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black text-sm">
            {items.map(item => {
              return (
                <tr
                  key={item.reagent_id}
                  onClick={() => onSelectItem(item)}
                  className="hover:bg-amber-50 transition cursor-pointer group"
                >
                  {/* ID & Name */}
                  <td className="py-3.5 px-4 border-r border-zinc-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 border border-black">
                        {item.reagent_id}
                      </span>
                      {item.isDuplicateCandidate && (
                        <span
                          className="inline-flex items-center gap-1 bg-indigo-200 text-indigo-950 border-2 border-black text-[10px] font-black uppercase px-1.5 py-0.5"
                          title="동일 CAS 번호 내 명칭이 상이한 중복 등록 후보입니다."
                        >
                          <Layers className="w-3 h-3" />
                          중복후보
                        </span>
                      )}
                    </div>
                    <div className="font-black text-black mt-1 group-hover:text-emerald-700 transition">
                      {item.reagent_name}
                    </div>
                    {item.remark && (
                      <div className="text-xs font-bold text-zinc-500 mt-0.5 line-clamp-1">
                        비고: {item.remark}
                      </div>
                    )}
                  </td>

                  {/* CAS */}
                  <td className="py-3.5 px-4 border-r border-zinc-200">
                    <span className="font-mono text-xs font-black text-black bg-zinc-100 px-2 py-1 border-2 border-black">
                      {item.cas_no || '미기재'}
                    </span>
                  </td>

                  {/* Hazard & Temp */}
                  <td className="py-3.5 px-4 border-r border-zinc-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[11px] px-2 py-0.5 ${getHazardBadgeStyle(item.hazard_class)}`}>
                        {item.hazard_class || '미분류'}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 ${getTempBadgeStyle(item.storage_temp)}`}>
                        {item.storage_temp || 'RT'}
                      </span>
                    </div>
                  </td>

                  {/* Location & Emp */}
                  <td className="py-3.5 px-4 border-r border-zinc-200 text-xs">
                    <div className="flex items-center gap-1 font-black text-black">
                      <MapPin className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-zinc-700 mt-1">
                      <User className="w-3 h-3 text-zinc-600 shrink-0" />
                      <span>{item.emp_name}</span>
                    </div>
                  </td>

                  {/* Expiry & D-day */}
                  <td className="py-3.5 px-4 border-r border-zinc-200">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 ${getExpiryBadgeStyle(item.expiryState)}`}>
                        {item.expiryState}
                      </span>
                      <span className="text-xs font-mono font-black text-black">
                        {item.dDayText}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-zinc-600 mt-1">
                      만료일: {item.expiry_date || '미기재'}
                    </div>
                  </td>

                  {/* Remain Qty */}
                  <td className="py-3.5 px-4 border-r border-zinc-200 w-48">
                    {item.remain_qty === null || item.remain_qty === undefined ? (
                      <span className="text-xs font-bold text-zinc-400 italic">잔량 미기재</span>
                    ) : (
                      <div>
                        <div className="flex justify-between text-xs font-black mb-1">
                          <span className="text-black font-mono">
                            {item.remain_qty} / {item.init_qty} {item.qty_unit}
                          </span>
                          <span className={`font-black ${item.qtyState === '부족' ? 'text-orange-700' : item.qtyState === '데이터 오류' ? 'text-rose-700' : 'text-black'}`}>
                            {item.remainPct !== null ? `${item.remainPct}%` : '오류'}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-200 h-2.5 border-2 border-black overflow-hidden">
                          <div
                            className={`h-full ${getQtyBarStyle(item.qtyState)}`}
                            style={{ width: `${Math.min(Math.max(item.remainPct || 0, 0), 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] font-black text-zinc-600 mt-0.5">
                          상태: <strong className={item.qtyState !== '정상' ? 'text-rose-700 font-black underline' : 'text-black'}>{item.qtyState}</strong>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Actions / Detail */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
                    >
                      상세·수정
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

