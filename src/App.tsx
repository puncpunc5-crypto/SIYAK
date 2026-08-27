import React, { useState, useEffect, useMemo } from 'react';
import { ReagentItem, ProcessedReagentItem, FilterState } from './types';
import { DEFAULT_REAGENTS } from './data/defaultReagents';
import { processReagents, sortProcessedReagents, analyzeDuplicateCandidates } from './utils/reagentLogic';
import { Header } from './components/Header';
import { DashboardCards } from './components/DashboardCards';
import { FilterBar } from './components/FilterBar';
import { ReagentList } from './components/ReagentList';
import { ReagentDetailModal } from './components/ReagentDetailModal';
import { ImportModal } from './components/ImportModal';
import { ReorderModal } from './components/ReorderModal';
import { DirectAddModal } from './components/DirectAddModal';
import { LoginScreen } from './components/LoginScreen';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { getSupabaseClient } from './lib/supabaseClient';

const LOCAL_STORAGE_KEY = 'reagent_inventory_data_v1';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showSupabaseConfigModal, setShowSupabaseConfigModal] = useState(false);

  // Check Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setAuthChecking(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        }
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
        });
        setAuthChecking(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (e) {
        console.error('Auth check error:', e);
        setAuthChecking(false);
      }
    };
    checkSession();
  }, []);

  const [rawReagents, setRawReagents] = useState<ReagentItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
    return DEFAULT_REAGENTS;
  });

  // Save to localStorage whenever rawReagents changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawReagents));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [rawReagents]);

  // Filter & Search State
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    expiryState: 'all',
    qtyState: 'all',
    hazardClass: 'all',
    storageTemp: 'all',
    lab: 'all',
    duplicateOnly: false,
    missingOnly: false
  });

  const [activeFilterKey, setActiveFilterKey] = useState<string>('all');

  // Modals state
  const [selectedItem, setSelectedItem] = useState<ProcessedReagentItem | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showDirectAddModal, setShowDirectAddModal] = useState(false);

  // Processed and sorted items
  const processedItems = useMemo(() => {
    return processReagents(rawReagents);
  }, [rawReagents]);

  const sortedItems = useMemo(() => {
    return sortProcessedReagents(processedItems);
  }, [processedItems]);

  const duplicateMap = useMemo(() => {
    return analyzeDuplicateCandidates(rawReagents);
  }, [rawReagents]);

  // Filter items based on activeFilterKey and filter state
  const filteredItems = useMemo(() => {
    return sortedItems.filter(item => {
      // 1. Dashboard card active filter key
      if (activeFilterKey === 'expired' && item.expiryState !== '만료') return false;
      if (activeFilterKey === 'imminent' && item.expiryState !== '임박') return false;
      if (activeFilterKey === 'shortage' && item.qtyState !== '부족') return false;
      if (activeFilterKey === 'error' && item.qtyState !== '데이터 오류') return false;
      if (activeFilterKey === 'duplicate' && !item.isDuplicateCandidate) return false;
      if (activeFilterKey === 'missing' && item.expiry_date && item.remain_qty !== null && item.remain_qty !== undefined) return false;

      // 2. Dropdown / search filters
      if (filter.expiryState !== 'all' && item.expiryState !== filter.expiryState) return false;
      if (filter.qtyState !== 'all' && item.qtyState !== filter.qtyState) return false;
      if (filter.hazardClass !== 'all' && item.hazard_class !== filter.hazardClass) return false;
      if (filter.storageTemp !== 'all' && item.storage_temp !== filter.storageTemp) return false;
      if (filter.lab !== 'all' && !item.location.startsWith(filter.lab)) return false;
      if (filter.duplicateOnly && !item.isDuplicateCandidate) return false;

      // 3. Search query
      if (filter.search.trim()) {
        const query = filter.search.toLowerCase();
        const matchId = item.reagent_id.toLowerCase().includes(query);
        const matchName = item.reagent_name.toLowerCase().includes(query);
        const matchCas = item.cas_no.toLowerCase().includes(query);
        const matchLoc = item.location.toLowerCase().includes(query);
        const matchEmp = item.emp_name.toLowerCase().includes(query);
        if (!matchId && !matchName && !matchCas && !matchLoc && !matchEmp) return false;
      }

      return true;
    });
  }, [sortedItems, activeFilterKey, filter]);

  // Handle dashboard card click
  const handleSelectFilterKey = (key: string) => {
    if (activeFilterKey === key) {
      setActiveFilterKey('all');
    } else {
      setActiveFilterKey(key);
      setFilter(prev => ({
        ...prev,
        expiryState: 'all',
        qtyState: 'all',
        duplicateOnly: false
      }));
    }
  };

  // Reset filters
  const handleResetFilter = () => {
    setFilter({
      search: '',
      expiryState: 'all',
      qtyState: 'all',
      hazardClass: 'all',
      storageTemp: 'all',
      lab: 'all',
      duplicateOnly: false,
      missingOnly: false
    });
    setActiveFilterKey('all');
  };

  // Reset to default dataset
  const handleResetDefault = () => {
    if (confirm('원본 80행 데이터셋으로 초기화하시겠습니까? 현재 변경사항이 초기화됩니다.')) {
      setRawReagents(DEFAULT_REAGENTS);
      handleResetFilter();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['reagent_id', 'reagent_name', 'cas_no', 'hazard_class', 'storage_temp', 'location', 'init_qty', 'remain_qty', 'qty_unit', 'receipt_date', 'expiry_date', 'emp_name', 'remark'];
    const rows = rawReagents.map(i => [
      i.reagent_id,
      `"${i.reagent_name}"`,
      i.cas_no,
      i.hazard_class,
      i.storage_temp,
      `"${i.location}"`,
      i.init_qty ?? '',
      i.remain_qty ?? '',
      i.qty_unit,
      i.receipt_date,
      i.expiry_date,
      `"${i.emp_name}"`,
      `"${i.remark || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reagent_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save updated item from detail modal
  const handleSaveItem = (updated: ProcessedReagentItem) => {
    setRawReagents(prev => prev.map(item => item.reagent_id === updated.reagent_id ? updated : item));
    setSelectedItem(null);
  };

  // Delete item
  const handleDeleteItem = (reagentId: string) => {
    setRawReagents(prev => prev.filter(item => item.reagent_id !== reagentId));
    setSelectedItem(null);
  };

  // Add new item
  const handleAddDirect = (newItem: ReagentItem) => {
    setRawReagents(prev => [newItem, ...prev]);
  };

  // Import success
  const handleImportSuccess = (imported: ReagentItem[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setRawReagents(imported);
    } else {
      setRawReagents(prev => [...imported, ...prev]);
    }
    handleResetFilter();
  };

  // Logout handler
  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center font-black text-sm uppercase tracking-wider animate-pulse">
          인증 세션 확인 중...
        </div>
      </div>
    );
  }

  // If user is not logged in, show LoginScreen
  if (!user) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={loggedInUser => setUser(loggedInUser)}
          onOpenSupabaseConfig={() => setShowSupabaseConfigModal(true)}
        />
        <SupabaseConfigModal
          isOpen={showSupabaseConfigModal}
          onClose={() => setShowSupabaseConfigModal(false)}
          onConfigSaved={() => {
            // Re-check session or prompt login
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <Header
        totalCount={rawReagents.length}
        user={user}
        onOpenImport={() => setShowImportModal(true)}
        onOpenDirectAdd={() => setShowDirectAddModal(true)}
        onOpenReorder={() => setShowReorderModal(true)}
        onResetDefault={handleResetDefault}
        onExportCSV={handleExportCSV}
        onLogout={handleLogout}
        onOpenSupabaseConfig={() => setShowSupabaseConfigModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Summary Cards */}
        <DashboardCards
          items={processedItems}
          duplicateMap={duplicateMap}
          activeFilterKey={activeFilterKey}
          onSelectFilter={handleSelectFilterKey}
        />

        {/* Filter Bar */}
        <FilterBar
          filter={filter}
          onChangeFilter={updater => setFilter(prev => ({ ...prev, ...updater }))}
          onResetFilter={handleResetFilter}
          totalFilteredCount={filteredItems.length}
          totalCount={rawReagents.length}
        />

        {/* Reagent List Table */}
        <ReagentList
          items={filteredItems}
          onSelectItem={item => setSelectedItem(item)}
        />
      </main>

      {/* Modals */}
      {selectedItem && (
        <ReagentDetailModal
          item={selectedItem}
          duplicateMap={duplicateMap}
          onClose={() => setSelectedItem(null)}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
        />
      )}

      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
          onLoadDefault={() => {
            setRawReagents(DEFAULT_REAGENTS);
            handleResetFilter();
          }}
        />
      )}

      {showReorderModal && (
        <ReorderModal
          items={processedItems}
          onClose={() => setShowReorderModal(false)}
        />
      )}

      {showDirectAddModal && (
        <DirectAddModal
          existingCount={rawReagents.length}
          onClose={() => setShowDirectAddModal(false)}
          onAdd={handleAddDirect}
        />
      )}

      <SupabaseConfigModal
        isOpen={showSupabaseConfigModal}
        onClose={() => setShowSupabaseConfigModal(false)}
        onConfigSaved={() => {}}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          시약·시료 재고 관리대장 (PRD-R02 / EX-R02) • Supabase 인증 연동 • 사용자: {user?.email}
        </div>
      </footer>
    </div>
  );
}
