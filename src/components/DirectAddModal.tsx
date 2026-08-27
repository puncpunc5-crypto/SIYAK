import React, { useState } from 'react';
import { ReagentItem } from '../types';
import { X, Plus, Save } from 'lucide-react';

interface DirectAddModalProps {
  existingCount: number;
  onClose: () => void;
  onAdd: (newItem: ReagentItem) => void;
}

export const DirectAddModal: React.FC<DirectAddModalProps> = ({
  existingCount,
  onClose,
  onAdd
}) => {
  const nextId = `RG-${String(existingCount + 1).padStart(3, '0')}`;
  const [formData, setFormData] = useState<ReagentItem>({
    reagent_id: nextId,
    reagent_name: '',
    cas_no: '',
    hazard_class: '인화성',
    storage_temp: 'RT',
    location: 'LAB-1 A-01',
    init_qty: 100.0,
    remain_qty: 100.0,
    qty_unit: 'mL',
    receipt_date: '2026-08-27',
    expiry_date: '2028-12-31',
    emp_name: '홍길동',
    remark: ''
  });

  const handleChange = (field: keyof ReagentItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reagent_name || !formData.cas_no) {
      alert('시약명과 CAS 번호는 필수 입력 항목입니다.');
      return;
    }
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-xl w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black uppercase tracking-tight">신규 시약 단건 추가</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition cursor-pointer font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
            <div>
              <label className="block font-black text-black uppercase mb-1">시약 코드</label>
              <input
                type="text"
                value={formData.reagent_id}
                onChange={e => handleChange('reagent_id', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-100 border-2 border-black font-mono font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                required
              />
            </div>
            <div>
              <label className="block font-black text-black uppercase mb-1">시약명 *</label>
              <input
                type="text"
                value={formData.reagent_name}
                onChange={e => handleChange('reagent_name', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                placeholder="예: TOL-Y"
                required
              />
            </div>
            <div>
              <label className="block font-black text-black uppercase mb-1">CAS 번호 *</label>
              <input
                type="text"
                value={formData.cas_no}
                onChange={e => handleChange('cas_no', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                placeholder="예: 900-06-6"
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
                placeholder="예: LAB-3 B-05"
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
              <label className="block font-black text-black uppercase mb-1">유효기간</label>
              <input
                type="text"
                value={formData.expiry_date}
                onChange={e => handleChange('expiry_date', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-mono font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                placeholder="2029-03-19"
              />
            </div>
            <div>
              <label className="block font-black text-black uppercase mb-1">관리 담당자</label>
              <input
                type="text"
                value={formData.emp_name}
                onChange={e => handleChange('emp_name', e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border-2 border-black font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              />
            </div>
            <div>
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
              onClick={onClose}
              className="px-4 py-2 bg-white text-black border-2 border-black text-xs font-black uppercase tracking-wide hover:bg-zinc-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-black uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition active:translate-x-[1px] active:translate-y-[1px] cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              추가하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

