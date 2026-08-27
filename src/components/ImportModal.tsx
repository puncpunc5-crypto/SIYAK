import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ReagentItem } from '../types';
import { parseCSVText } from '../utils/reagentLogic';
import * as XLSX from 'xlsx';

interface ImportModalProps {
  onClose: () => void;
  onImportSuccess: (items: ReagentItem[], mode: 'replace' | 'merge') => void;
  onLoadDefault: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  onClose,
  onImportSuccess,
  onLoadDefault
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [previewItems, setPreviewItems] = useState<ReagentItem[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = parseCSVText(text);
          if (parsed.length === 0) {
            setErrorMessage('CSV 파일에서 파싱된 데이터가 없습니다. 헤더 형식을 확인하세요.');
          } else {
            setPreviewItems(parsed);
          }
        } catch (err: any) {
          setErrorMessage(`CSV 파싱 오류: ${err.message}`);
        }
      };
      reader.readAsText(file, 'UTF-8');
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonArr = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });

          if (jsonArr.length < 2) {
            setErrorMessage('엑셀 파일에 데이터 행이 부족합니다.');
            return;
          }

          const csvText = XLSX.utils.sheet_to_csv(worksheet);
          const parsed = parseCSVText(csvText);

          if (parsed.length === 0) {
            setErrorMessage('엑셀 파싱 결과 유효한 데이터가 없습니다.');
          } else {
            setPreviewItems(parsed);
          }
        } catch (err: any) {
          setErrorMessage(`엑셀 파싱 오류: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrorMessage('지원하지 않는 파일 형식입니다. CSV 또는 XLSX 파일을 업로드하세요.');
    }
  };

  const handlePasteParse = () => {
    if (!pastedText.trim()) {
      setErrorMessage('붙여넣은 텍스트가 없습니다.');
      return;
    }
    try {
      const parsed = parseCSVText(pastedText);
      if (parsed.length === 0) {
        setErrorMessage('텍스트에서 파싱된 유효한 데이터가 없습니다.');
      } else {
        setPreviewItems(parsed);
        setErrorMessage(null);
      }
    } catch (err: any) {
      setErrorMessage(`텍스트 파싱 오류: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black uppercase tracking-tight">시약 재고대장 반입 (F-01)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition cursor-pointer font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Default Dataset Shortcut */}
          <div className="bg-emerald-100 border-2 border-black p-4 flex items-center justify-between shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div>
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                PRD 검증용 기본 데이터셋 (80건)
              </h4>
              <p className="text-xs font-bold text-emerald-900 mt-0.5">
                당일 만료 2건, 잔량 오류 2건, 중복 후보 2쌍이 포함된 원본 대장으로 즉시 로드합니다.
              </p>
            </div>
            <button
              onClick={() => {
                onLoadDefault();
                onClose();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition cursor-pointer shrink-0"
            >
              기본 80행 로드
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b-2 border-black">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 pb-3 text-xs sm:text-sm font-black uppercase tracking-wide border-b-4 transition cursor-pointer ${
                activeTab === 'file'
                  ? 'border-black text-black bg-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-black'
              }`}
            >
              CSV / XLSX 파일 업로드
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 pb-3 text-xs sm:text-sm font-black uppercase tracking-wide border-b-4 transition cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-black text-black bg-zinc-100'
                  : 'border-transparent text-zinc-500 hover:text-black'
              }`}
            >
              텍스트 붙여넣기
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-100 border-2 border-black text-xs font-bold text-rose-950 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-700" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'file' ? (
            <div className="space-y-4">
              <label className="border-4 border-dashed border-black hover:border-zinc-800 rounded-none p-8 flex flex-col items-center justify-center cursor-pointer bg-zinc-50 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center text-black mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-sm font-black uppercase text-black">클릭하여 파일 선택 또는 드래그 앤 드롭</span>
                <span className="text-xs font-bold text-zinc-600 mt-1">지원 형식: CSV, XLSX, XLS (UTF-8 권장)</span>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase text-black">
                CSV 또는 탭 구분 재고대장 텍스트 입력
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="reagent_id,reagent_name,cas_no,hazard_class..."
                className="w-full p-3 font-mono text-xs bg-zinc-50 border-2 border-black font-bold text-black focus:ring-2 focus:ring-black focus:outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePasteParse}
                  className="px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  텍스트 파싱 실행
                </button>
              </div>
            </div>
          )}

          {/* Import Mode */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-between">
            <span className="text-xs font-black uppercase text-black">반입 데이터 적용 방식:</span>
            <div className="flex items-center gap-4 text-xs font-black">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-black"
                />
                <span>기존 대장 대체 (교체)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-black"
                />
                <span>기존 대장에 병합 (추가)</span>
              </label>
            </div>
          </div>

          {/* Preview Results */}
          {previewItems && (
            <div className="bg-emerald-100 border-2 border-black p-4 space-y-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 text-emerald-950 font-black text-sm uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>파싱 성공: 총 {previewItems.length}건 감지됨</span>
              </div>
              <p className="text-xs font-bold text-emerald-900">
                첫 3개 항목 미리보기: {previewItems.slice(0, 3).map(i => `${i.reagent_id}(${i.reagent_name})`).join(', ')} ...
              </p>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    onImportSuccess(previewItems, importMode);
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black uppercase tracking-wide border-2 border-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  <span>대장 반영 완료하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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

