import React from 'react';
import { Search, Filter, RotateCcw, Layers } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filter: FilterState;
  onChangeFilter: (updater: Partial<FilterState>) => void;
  onResetFilter: () => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  onResetFilter,
  totalFilteredCount,
  totalCount
}) => {
  return (
    <div className="bg-white border-2 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
          <input
            type="text"
            value={filter.search}
            onChange={e => onChangeFilter({ search: e.target.value })}
            placeholder="시약명, CAS 번호, 보관 위치, 담당자명 검색..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-2 border-black font-bold text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>

        {/* Filters and Count */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Expiry Filter */}
          <select
            value={filter.expiryState}
            onChange={e => onChangeFilter({ expiryState: e.target.value })}
            className="px-3 py-2 bg-white border-2 border-black font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all">유효기간: 전체</option>
            <option value="만료">만료됨</option>
            <option value="임박">임박 (30일 이내)</option>
            <option value="정상">정상</option>
            <option value="유효기간 미기재">미기재</option>
          </select>

          {/* Quantity Filter */}
          <select
            value={filter.qtyState}
            onChange={e => onChangeFilter({ qtyState: e.target.value })}
            className="px-3 py-2 bg-white border-2 border-black font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all">잔량: 전체</option>
            <option value="부족">부족 (≤20%)</option>
            <option value="데이터 오류">데이터 오류</option>
            <option value="정상">정상</option>
            <option value="잔량 미기재">미기재</option>
          </select>

          {/* Hazard Class Filter */}
          <select
            value={filter.hazardClass}
            onChange={e => onChangeFilter({ hazardClass: e.target.value })}
            className="px-3 py-2 bg-white border-2 border-black font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all">위험물: 전체</option>
            <option value="인화성">인화성</option>
            <option value="독성">독성</option>
            <option value="부식성">부식성</option>
            <option value="산화성">산화성</option>
            <option value="해당없음">해당없음</option>
          </select>

          {/* Storage Temp Filter */}
          <select
            value={filter.storageTemp}
            onChange={e => onChangeFilter({ storageTemp: e.target.value })}
            className="px-3 py-2 bg-white border-2 border-black font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all">보관온도: 전체</option>
            <option value="RT">RT (상온)</option>
            <option value="4℃">4℃ (냉장)</option>
            <option value="-20℃">-20℃ (냉동)</option>
          </select>

          {/* Lab Filter */}
          <select
            value={filter.lab}
            onChange={e => onChangeFilter({ lab: e.target.value })}
            className="px-3 py-2 bg-white border-2 border-black font-black text-xs text-black focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all">연구실: 전체</option>
            <option value="LAB-1">LAB-1</option>
            <option value="LAB-2">LAB-2</option>
            <option value="LAB-3">LAB-3</option>
          </select>

          {/* Duplicate candidate toggle */}
          <button
            onClick={() => onChangeFilter({ duplicateOnly: !filter.duplicateOnly })}
            className={`px-3 py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition cursor-pointer inline-flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
              filter.duplicateOnly
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            중복후보만
          </button>

          {/* Reset button */}
          <button
            onClick={onResetFilter}
            className="p-2.5 bg-zinc-200 hover:bg-zinc-300 text-black border-2 border-black transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
            title="필터 초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-black text-xs font-bold text-black">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-black" />
          <span>조회 결과: <strong className="text-black font-black underline">{totalFilteredCount}건</strong> (전체 {totalCount}건 중)</span>
        </div>
        {totalFilteredCount === 0 && (
          <span className="text-rose-700 font-black uppercase bg-rose-100 px-2 py-0.5 border border-rose-400">조건에 해당하는 시약이 없습니다. 필터를 초기화해 보세요.</span>
        )}
      </div>
    </div>
  );
};

