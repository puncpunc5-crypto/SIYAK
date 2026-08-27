import React from 'react';
import { AlertOctagon, AlertTriangle, TrendingDown, FileSpreadsheet, Copy, HelpCircle } from 'lucide-react';
import { ProcessedReagentItem, DuplicateGroupInfo } from '../types';

interface DashboardCardsProps {
  items: ProcessedReagentItem[];
  duplicateMap: Map<string, DuplicateGroupInfo>;
  activeFilterKey: string;
  onSelectFilter: (filterKey: string) => void;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({
  items,
  duplicateMap,
  activeFilterKey,
  onSelectFilter
}) => {
  const expiredCount = items.filter(i => i.expiryState === '만료').length;
  const imminentCount = items.filter(i => i.expiryState === '임박').length;
  const shortageCount = items.filter(i => i.qtyState === '부족').length;
  const errorCount = items.filter(i => i.qtyState === '데이터 오류').length;
  const duplicateGroupCount = duplicateMap.size;
  const missingCount = items.filter(i => !i.expiry_date || i.remain_qty === null || i.remain_qty === undefined).length;

  const cards = [
    {
      id: 'expired',
      label: '유효기간 만료',
      count: expiredCount,
      icon: AlertOctagon,
      color: 'bg-rose-100 text-rose-950 border-2 border-black hover:bg-rose-200',
      activeColor: 'bg-rose-300 ring-4 ring-black',
      badgeColor: 'bg-black text-white border border-black',
      desc: '즉시 폐기 및 출고 중지 대상'
    },
    {
      id: 'imminent',
      label: '유효기간 임박',
      count: imminentCount,
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-950 border-2 border-black hover:bg-amber-200',
      activeColor: 'bg-amber-300 ring-4 ring-black',
      badgeColor: 'bg-black text-white border border-black',
      desc: '우선 소진 또는 점검 대상'
    },
    {
      id: 'shortage',
      label: '잔량 부족 (≤20%)',
      count: shortageCount,
      icon: TrendingDown,
      color: 'bg-orange-100 text-orange-950 border-2 border-black hover:bg-orange-200',
      activeColor: 'bg-orange-300 ring-4 ring-black',
      badgeColor: 'bg-black text-white border border-black',
      desc: '재고 보충 및 발주 검토'
    },
    {
      id: 'error',
      label: '데이터 오류',
      count: errorCount,
      icon: FileSpreadsheet,
      color: 'bg-red-200 text-red-950 border-2 border-black hover:bg-red-300',
      activeColor: 'bg-red-400 ring-4 ring-black',
      badgeColor: 'bg-black text-white border border-black',
      desc: '초기량·잔량 입력 정정 대상'
    },
    {
      id: 'duplicate',
      label: '중복 등록 후보',
      count: duplicateGroupCount,
      icon: Copy,
      color: 'bg-indigo-100 text-indigo-950 border-2 border-black hover:bg-indigo-200',
      activeColor: 'bg-indigo-300 ring-4 ring-black',
      badgeColor: 'bg-black text-white border border-black',
      desc: '동일 CAS 명칭 상이 조합'
    },
    {
      id: 'missing',
      label: '정보 결측 행',
      count: missingCount,
      icon: HelpCircle,
      color: 'bg-zinc-100 text-zinc-900 border-2 border-black hover:bg-zinc-200',
      activeColor: 'bg-zinc-300 ring-4 ring-black',
      badgeColor: 'bg-black text-white border border-black',
      desc: '유효일자 또는 잔량 공란'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map(card => {
        const Icon = card.icon;
        const isActive = activeFilterKey === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(isActive ? 'all' : card.id)}
            className={`text-left p-3.5 transition-all cursor-pointer flex flex-col justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${card.color} ${
              isActive ? card.activeColor : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider">
                {card.label.split(' ')[0]}
              </span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 uppercase tracking-wider ${card.badgeColor}`}>
                {card.count}건
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight">
                {card.count} <span className="text-xs font-bold uppercase">건</span>
              </div>
              <p className="text-[11px] font-bold opacity-90 mt-1 line-clamp-1">{card.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

