import React, { useState } from 'react';
import { ProcessedReagentItem, DuplicateGroupInfo } from '../types';
import { X, Save, Trash2, AlertTriangle, CheckCircle2, Calculator, Layers, Calendar, MapPin, User, Tag } from 'lucide-react';
import { BASE_DATE } from '../data/defaultReagents';

interface ReagentDetailModalProps {
  item: ProcessedReagentItem;
  duplicateMap: Map<string, DuplicateGroupInfo>;
  onClose: () => void;
  onSave: (updated: ProcessedReagentItem) => void;
  onDelete: (reagentId: string) => void;
}

export const ReagentDetailModal: React.FC<ReagentDetailModalProps> = ({
  item,
  duplicateMap,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<ProcessedReagentItem>({ ...item });
  const [isEditing, setIsEditing] = useState(false);

  const dupInfo = duplicateMap.get(formData.cas_no?.trim());

  const handleChange = (field: keyof ProcessedReagentItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs bg-white text-black font-black px-2.5 py-1 border-2 border-black">
              {formData.reagent_id}
            </span>
            <h2 className="text-lg font-black tracking-tight uppercase">{formData.reagent_name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition cursor-pointer font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Warnings Banner */}
          {formData.warnings && formData.warnings.length > 0 && (
            <div className="bg-rose-100 border-2 border-black p-4 text-rose-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 font-black text-sm mb-1 uppercase">
                <AlertTriangle className="w-4 h-4 text-rose-700" />
                <span>자동 판정 경고 ({formData.warnings.length}건)</span>
              </div>
              <ul className="list-disc list-inside text-xs font-bold space-y-1 mt-1 text-rose-900">
                {formData.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Duplicate Candidate Info Box */}
          {formData.isDuplicateCandidate && dupInfo && (
            <div className="bg-indigo-100 border-2 border-black p-4 text-indigo-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 font-black text-sm mb-2 uppercase">
                <Layers className="w-4 h-4 text-indigo-700" />
                <span>중복 등록 후보 상세 (CAS: {dupInfo.casNo})</span>
              </div>
              <p className="text-xs font-bold text-indigo-900 mb-3">
                동일 CAS 번호에 서로 다른 시약명 표기가 존재하여 집계 왜곡 방지를 위해 경고되었습니다.
              </p>
              <div className="space-y-2 text-xs">
                {dupInfo.names.map((name, i) => (
                  <div key={i} className="bg-white p-2.5 border-2 border-black flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div>
                      <strong className="text-black font-black">{name}</strong>
                      <span className="text-zinc-600 font-bold ml-2">({dupInfo.rowCounts[name]}건 등록)</span>
                    </div>
                    <div className="font-mono font-black text-black">
                      잔량 합산: {dupInfo.totalRemain[name]?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculation Basis Box */}
          <div className="bg-zinc-100 border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 font-black text-sm text-black mb-2 uppercase">
              <Calculator className="w-4 h-4 text-black" />
              <span>판정 근거 및 산출식</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-zinc-800">
              <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="font-black text-black mb-1 uppercase">유효기간 D-day 산출</div>
                <div>기준일: <code className="text-black font-mono font-black">{BASE_DATE}</code></div>
                <div>유효일자: <code className="text-black font-mono font-black">{formData.expiry_date || '미기재'}</code></div>
                <div>산출 D-day: <strong className="text-black font-black">{formData.dDayText}</strong></div>
                <div>판정 결과: <span className="font-black text-emerald-800 bg-emerald-100 px-1 border border-emerald-400">{formData.expiryState}</span></div>
              </div>
              <div className="bg-white p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="font-black text-black mb-1 uppercase">잔량률 산출</div>
                <div>초기량 / 잔량: <code className="text-black font-mono font-black">{formData.init_qty ?? '-'} / {formData.remain_qty ?? '-'} {formData.qty_unit}</code></div>
                <div>산출 잔량률: <strong className="text-black font-black">{formData.remainPct !== null ? `${formData.remainPct}%` : '산출 불가'}</strong></div>
                <div>판정 결과: <span className="font-black text-black">{formData.qtyState}</span></div>
              </div>
            </div>
          </div>

          {/* Form or View Details */}
          {isEditing ? (
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block font-black text-black uppercase mb-1">시약명</label>
                  <input
                    type="text"
                    value={formData.reagent_name}
                    onChange={e => handleChange('reagent_name', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">CAS 번호</label>
                  <input
                    type="text"
                    value={formData.cas_no}
                    onChange={e => handleChange('cas_no', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">위험물 등급</label>
                  <select
                    value={formData.hazard_class}
                    onChange={e => handleChange('hazard_class', e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    <option value="인화성">인화성</option>
                    <option value="독성">독성</option>
                    <option value="부식성">부식성</option>
                    <option value="산화성">산화성</option>
                    <option value="해당없음">해당없음</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">보관 온도</label>
                  <select
                    value={formData.storage_temp}
                    onChange={e => handleChange('storage_temp', e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    <option value="RT">RT (상온)</option>
                    <option value="4℃">4℃ (냉장)</option>
                    <option value="-20℃">-20℃ (냉동)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">보관 위치</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => handleChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">담당자</label>
                  <input
                    type="text"
                    value={formData.emp_name}
                    onChange={e => handleChange('emp_name', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">초기 입고량</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.init_qty ?? ''}
                    onChange={e => handleChange('init_qty', e.target.value === '' ? null : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">현재 잔량</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.remain_qty ?? ''}
                    onChange={e => handleChange('remain_qty', e.target.value === '' ? null : Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">단위</label>
                  <input
                    type="text"
                    value={formData.qty_unit}
                    onChange={e => handleChange('qty_unit', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
                <div>
                  <label className="block font-black text-black uppercase mb-1">유효기간 (YYYY-MM-DD)</label>
                  <input
                    type="text"
                    value={formData.expiry_date}
                    onChange={e => handleChange('expiry_date', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="2027-01-01"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-black text-black uppercase mb-1">비고</label>
                  <input
                    type="text"
                    value={formData.remark || ''}
                    onChange={e => handleChange('remark', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-white border-2 border-black text-black rounded-none text-xs font-black uppercase tracking-wide hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-none text-xs font-black uppercase tracking-wide border-2 border-black hover:bg-zinc-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  저장
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
              <div className="bg-zinc-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-zinc-600 font-black uppercase block mb-0.5">CAS 번호</span>
                <span className="font-mono font-black text-black">{formData.cas_no}</span>
              </div>
              <div className="bg-zinc-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-zinc-600 font-black uppercase block mb-0.5">위험물 등급</span>
                <span className="font-black text-black">{formData.hazard_class}</span>
              </div>
              <div className="bg-zinc-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-zinc-600 font-black uppercase block mb-0.5">보관 온도 및 위치</span>
                <span className="font-black text-black">{formData.storage_temp} / {formData.location}</span>
              </div>
              <div className="bg-zinc-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-zinc-600 font-black uppercase block mb-0.5">관리 담당자</span>
                <span className="font-black text-black">{formData.emp_name}</span>
              </div>
              <div className="bg-zinc-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-zinc-600 font-black uppercase block mb-0.5">입고일 및 유효기간</span>
                <span className="font-mono font-black text-black">{formData.receipt_date} ~ {formData.expiry_date || '미기재'}</span>
              </div>
              <div className="bg-zinc-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-zinc-600 font-black uppercase block mb-0.5">초기량 / 잔량</span>
                <span className="font-mono font-black text-black">{formData.init_qty ?? '-'} / {formData.remain_qty ?? '-'} {formData.qty_unit}</span>
              </div>
              {formData.remark && (
                <div className="bg-zinc-100 p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:col-span-2">
                  <span className="text-zinc-600 font-black uppercase block mb-0.5">비고</span>
                  <span className="font-bold text-black">{formData.remark}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-zinc-200 border-t-4 border-black flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`정말 시약 [${formData.reagent_id}: ${formData.reagent_name}] 항목을 삭제하시겠습니까?`)) {
                onDelete(formData.reagent_id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-200 text-rose-950 border-2 border-black text-xs font-black uppercase tracking-wide hover:bg-rose-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            항목 삭제
          </button>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800 transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
              >
                수정하기
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-black text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100 transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

