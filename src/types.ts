export type HazardClass = '인화성' | '독성' | '부식성' | '산화성' | '해당없음' | string;
export type StorageTemp = 'RT' | '4℃' | '-20℃' | string;
export type ExpiryState = '만료' | '임박' | '정상' | '유효기간 미기재';
export type QtyState = '데이터 오류' | '부족' | '정상' | '잔량 미기재';

export interface ReagentItem {
  reagent_id: string;
  reagent_name: string;
  cas_no: string;
  hazard_class: string;
  storage_temp: string;
  location: string;
  init_qty: number | null;
  remain_qty: number | null;
  qty_unit: string;
  receipt_date: string;
  expiry_date: string;
  emp_name: string;
  remark?: string;
}

export interface ProcessedReagentItem extends ReagentItem {
  dDay: number | null;
  dDayText: string;
  expiryState: ExpiryState;
  remainPct: number | null;
  qtyState: QtyState;
  isDuplicateCandidate: boolean;
  duplicateGroupNames?: string[];
  warnRank: number;
  warnings: string[];
}

export interface DuplicateGroupInfo {
  casNo: string;
  names: string[];
  rowCounts: Record<string, number>;
  totalRemain: Record<string, number>;
  totalCount: number;
}

export interface FilterState {
  search: string;
  expiryState: string; // 'all' | ExpiryState
  qtyState: string; // 'all' | QtyState
  hazardClass: string; // 'all' | HazardClass
  storageTemp: string; // 'all' | StorageTemp
  lab: string; // 'all' | 'LAB-1' | 'LAB-2' | 'LAB-3'
  duplicateOnly: boolean;
  missingOnly: boolean;
}

export type ViewMode = 'list' | 'import' | 'detail' | 'reorder';
