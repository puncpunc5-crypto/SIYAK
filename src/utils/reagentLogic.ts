import { ReagentItem, ProcessedReagentItem, DuplicateGroupInfo, ExpiryState, QtyState } from '../types';
import { BASE_DATE } from '../data/defaultReagents';

// Parse date string to timestamp at midnight KST
export function parseDateOnly(dateStr: string): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'n/a') return null;

  // Support YYYY-MM-DD, YYYY/MM/DD, YYYY-MM-DD HH:mm
  const cleanStr = trimmed.split(' ')[0].replace(/\//g, '-');
  const parts = cleanStr.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const d = new Date(Date.UTC(year, month, day));
  return isNaN(d.getTime()) ? null : d.getTime();
}

const baseDateMs = parseDateOnly(BASE_DATE) || Date.UTC(2026, 7, 27);

export function calculateDday(expiryDateStr: string): { dDay: number | null; dDayText: string; expiryState: ExpiryState } {
  const expiryMs = parseDateOnly(expiryDateStr);
  if (expiryMs === null) {
    return { dDay: null, dDayText: '미기재', expiryState: '유효기간 미기재' };
  }

  const diffMs = expiryMs - baseDateMs;
  const dDay = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let expiryState: ExpiryState = '정상';
  let dDayText = '';

  if (dDay <= 0) {
    expiryState = '만료';
    dDayText = dDay === 0 ? 'D-DAY (당일만료)' : `D+${Math.abs(dDay)} (만료)`;
  } else if (dDay <= 30) {
    expiryState = '임박';
    dDayText = `D-${dDay}`;
  } else {
    expiryState = '정상';
    dDayText = `D-${dDay}`;
  }

  return { dDay, dDayText, expiryState };
}

export function calculateRemainQty(initQty: number | null, remainQty: number | null): { remainPct: number | null; qtyState: QtyState } {
  if (remainQty === null || remainQty === undefined || isNaN(Number(remainQty))) {
    return { remainPct: null, qtyState: '잔량 미기재' };
  }

  if (initQty === null || initQty === undefined || isNaN(Number(initQty)) || initQty <= 0) {
    return { remainPct: null, qtyState: '데이터 오류' };
  }

  const rawPct = (Number(remainQty) / Number(initQty)) * 100;
  const remainPct = Math.round(rawPct * 10) / 10;

  let qtyState: QtyState = '정상';
  if (rawPct > 100) {
    qtyState = '데이터 오류';
  } else if (rawPct <= 20) {
    qtyState = '부족';
  } else {
    qtyState = '정상';
  }

  return { remainPct, qtyState };
}

export function analyzeDuplicateCandidates(items: ReagentItem[]): Map<string, DuplicateGroupInfo> {
  const casGroupMap = new Map<string, ReagentItem[]>();

  items.forEach(item => {
    if (!item.cas_no) return;
    const cas = item.cas_no.trim();
    const group = casGroupMap.get(cas) || [];
    group.push(item);
    casGroupMap.set(cas, group);
  });

  const duplicateMap = new Map<string, DuplicateGroupInfo>();

  casGroupMap.forEach((groupItems, casNo) => {
    const nameSet = new Set<string>();
    const rowCounts: Record<string, number> = {};
    const totalRemain: Record<string, number> = {};

    groupItems.forEach(item => {
      const name = item.reagent_name;
      nameSet.add(name);
      rowCounts[name] = (rowCounts[name] || 0) + 1;
      totalRemain[name] = (totalRemain[name] || 0) + (Number(item.remain_qty) || 0);
    });

    if (nameSet.size >= 2) {
      duplicateMap.set(casNo, {
        casNo,
        names: Array.from(nameSet),
        rowCounts,
        totalRemain,
        totalCount: groupItems.length
      });
    }
  });

  return duplicateMap;
}

export function processReagents(items: ReagentItem[]): ProcessedReagentItem[] {
  const duplicateMap = analyzeDuplicateCandidates(items);

  return items.map(item => {
    const { dDay, dDayText, expiryState } = calculateDday(item.expiry_date);
    const { remainPct, qtyState } = calculateRemainQty(item.init_qty, item.remain_qty);

    const cas = item.cas_no?.trim() || '';
    const dupInfo = duplicateMap.get(cas);
    const isDuplicateCandidate = !!dupInfo;

    const warnings: string[] = [];
    if (expiryState === '만료') warnings.push('유효기간 만료');
    else if (expiryState === '임박') warnings.push('유효기간 임박');

    if (qtyState === '부족') warnings.push('잔량 부족 (≤20%)');
    else if (qtyState === '데이터 오류') warnings.push('잔량 오류 (>100% 또는 초기값 오류)');

    if (isDuplicateCandidate) warnings.push('중복 등록 후보 (동일 CAS 명칭 상이)');

    // Date inversion check (receipt > expiry)
    const receiptMs = parseDateOnly(item.receipt_date);
    const expiryMs = parseDateOnly(item.expiry_date);
    if (receiptMs !== null && expiryMs !== null && receiptMs > expiryMs) {
      warnings.push('입고일-유효기간 역전');
    }

    // Warn rank: 만료(0) > 데이터 오류(1) > 부족(2) > 임박(3) > 중복 후보(4) > 정상(5)
    let warnRank = 5;
    if (expiryState === '만료' || qtyState === '데이터 오류') {
      warnRank = expiryState === '만료' ? 0 : 1;
    } else if (qtyState === '부족') {
      warnRank = 2;
    } else if (expiryState === '임박') {
      warnRank = 3;
    } else if (isDuplicateCandidate) {
      warnRank = 4;
    }

    return {
      ...item,
      dDay,
      dDayText,
      expiryState,
      remainPct,
      qtyState,
      isDuplicateCandidate,
      duplicateGroupNames: dupInfo ? dupInfo.names : undefined,
      warnRank,
      warnings
    };
  });
}

export function sortProcessedReagents(items: ProcessedReagentItem[]): ProcessedReagentItem[] {
  return [...items].sort((a, b) => {
    // 1. warnRank ascending
    if (a.warnRank !== b.warnRank) {
      return a.warnRank - b.warnRank;
    }
    // 2. dDay ascending (nulls last)
    if (a.dDay !== null && b.dDay !== null) {
      if (a.dDay !== b.dDay) return a.dDay - b.dDay;
    } else if (a.dDay !== null) {
      return -1;
    } else if (b.dDay !== null) {
      return 1;
    }

    // 3. remainPct ascending (nulls last)
    if (a.remainPct !== null && b.remainPct !== null) {
      if (a.remainPct !== b.remainPct) return a.remainPct - b.remainPct;
    }

    // 4. reagent_id ascending
    return a.reagent_id.localeCompare(b.reagent_id, undefined, { numeric: true });
  });
}

// CSV parser helper
export function parseCSVText(csvText: string): ReagentItem[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse CSV line handling quotes if present
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let startValue = 0;
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(line.substring(startValue, i).replace(/^"|"$/g, '').trim());
        startValue = i + 1;
      }
    }
    result.push(line.substring(startValue).replace(/^"|"$/g, '').trim());
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase());
  const items: ReagentItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseLine(line);

    // Map by header index or positional fallback
    const getCol = (names: string[], fallbackIdx: number): string => {
      for (const name of names) {
        const idx = headers.indexOf(name);
        if (idx !== -1 && cols[idx] !== undefined) return cols[idx];
      }
      return cols[fallbackIdx] !== undefined ? cols[fallbackIdx] : '';
    };

    const reagent_id = getCol(['reagent_id', 'id', '시약코드'], 0) || `RG-${String(i).padStart(3, '0')}`;
    const reagent_name = getCol(['reagent_name', 'name', '시약명'], 1);
    const cas_no = getCol(['cas_no', 'cas', 'cas번호'], 2);
    const hazard_class = getCol(['hazard_class', 'hazard', '위험물등급'], 3) || '해당없음';
    const storage_temp = getCol(['storage_temp', 'temp', '보관온도'], 4) || 'RT';
    const location = getCol(['location', 'loc', '보관위치'], 5) || 'LAB-1 A-01';
    
    const initRaw = getCol(['init_qty', '초기량'], 6);
    const init_qty = initRaw === '' || isNaN(Number(initRaw)) ? null : Number(initRaw);

    const remainRaw = getCol(['remain_qty', '잔량'], 7);
    const remain_qty = remainRaw === '' || isNaN(Number(remainRaw)) ? null : Number(remainRaw);

    const qty_unit = getCol(['qty_unit', 'unit', '단위'], 8) || 'mL';
    const receipt_date = getCol(['receipt_date', '입고일'], 9);
    const expiry_date = getCol(['expiry_date', '유효기간'], 10);
    const emp_name = getCol(['emp_name', '담당자'], 11) || '담당자';
    const remark = getCol(['remark', '비고'], 12);

    if (reagent_name) {
      items.push({
        reagent_id,
        reagent_name,
        cas_no,
        hazard_class,
        storage_temp,
        location,
        init_qty,
        remain_qty,
        qty_unit,
        receipt_date,
        expiry_date,
        emp_name,
        remark
      });
    }
  }

  return items;
}
