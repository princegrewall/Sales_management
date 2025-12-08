import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SalesRecord } from '@/data/mockData';

export interface Filters {
  search: string;
  regions: string[];
  genders: string[];
  ageRanges: string[];
  categories: string[];
  tags: string[];
  paymentMethods: string[];
  dateRange: { start: string; end: string } | null;
}

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'quantity-desc'
  | 'quantity-asc'
  | 'name-asc'
  | 'name-desc';

const initialFilters: Filters = {
  search: '',
  regions: [],
  genders: [],
  ageRanges: [],
  categories: [],
  tags: [],
  paymentMethods: [],
  dateRange: null,
};

function parseAgeRange(range: string): { min: number; max: number } {
  if (range === '55+') return { min: 55, max: 200 };
  const [min, max] = range.split('-').map(Number);
  return { min, max };
}

function buildQuery(page: number, pageSize: number, filters: Filters, sortBy: SortOption) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  params.set('sort', sortBy);

  if (filters.search) params.set('search', filters.search);

  // arrays -> repeated params: regions=North&regions=South
  for (const r of filters.regions) params.append('regions', r);
  for (const g of filters.genders) params.append('genders', g);
  for (const a of filters.ageRanges) params.append('ageRanges', a);
  for (const c of filters.categories) params.append('categories', c);
  for (const t of filters.tags) params.append('tags', t);
  for (const p of filters.paymentMethods) params.append('paymentMethods', p);

  // Optional: if backend expects numeric range params instead of "ageRanges"
  // uncomment and adapt if needed (this uses the first selected ageRange)
  /*
  if (filters.ageRanges.length > 0) {
    const { min, max } = parseAgeRange(filters.ageRanges[0]);
    params.set('ageMin', String(min));
    params.set('ageMax', String(max));
  }
  */

  if (filters.dateRange) {
    if (filters.dateRange.start) params.set('start', new Date(filters.dateRange.start).toISOString());
    if (filters.dateRange.end) params.set('end', new Date(filters.dateRange.end).toISOString());
  }

  return params.toString();
}


export function useSalesData() {
  const API_BASE =
    (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

  // Backend state
  const [allRecords, setAllRecords] = useState<SalesRecord[]>([]);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [serverMeta, setServerMeta] = useState<null | {
    total?: number;
    totalPages?: number;
    page?: number;
    pageSize?: number;
    // optional: server-provided aggregates
    aggregates?: { totalUnits?: number; totalAmount?: number; totalDiscount?: number };
  }>(null);

  // Local UI/filtering/sorting state
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');

  // debounce ref
  const fetchTimeout = useRef<number | null>(null);
  const mountedRef = useRef(true);

  // Core fetch function used by effect + refresh
  const fetchPage = useCallback(
    async (page: number) => {
      setLoadingRemote(true);
      setError(null);

      try {
        const qs = buildQuery(page, pageSize, filters, sortBy);
        const res = await fetch(`${API_BASE}/api/sales?${qs}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

        const json = await res.json();

        // expecting { meta: {...}, data: [...] } ideally
        if (json && json.meta && Array.isArray(json.data)) {
          if (!mountedRef.current) return;
          setServerMeta(json.meta);
          setCurrentPage(json.meta.page || page);
          setAllRecords(json.data as SalesRecord[]);
        } else {
          // fallback: server returns raw array (no meta)
          if (!mountedRef.current) return;
          setServerMeta(null);
          const rows = Array.isArray(json.data) ? json.data : json;
          setAllRecords(rows as SalesRecord[]);
        }
      } catch (err: any) {
        if (!mountedRef.current) return;
        setAllRecords([]);
        setError(err.message || 'Backend not reachable');
      } finally {
        if (mountedRef.current) setLoadingRemote(false);
      }
    },
    [API_BASE, filters, pageSize, sortBy]
  );

  // Fetch on mount and whenever currentPage / filters / sortBy / pageSize change (debounced)
  useEffect(() => {
    mountedRef.current = true;
    if (fetchTimeout.current) window.clearTimeout(fetchTimeout.current);
    fetchTimeout.current = window.setTimeout(() => {
      fetchPage(currentPage);
    }, 200); // 200ms debounce

    return () => {
      mountedRef.current = false;
      if (fetchTimeout.current) window.clearTimeout(fetchTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, filters, sortBy, API_BASE, fetchPage]);

  // Manual refresh (calls same fetch)
  const refresh = useCallback(async () => {
    await fetchPage(currentPage);
  }, [fetchPage, currentPage]);

  // Upload file and refresh page
  const uploadFile = useCallback(
    async (file: File) => {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch(`${API_BASE}/api/sales/upload`, {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }

      await refresh();
    },
    [API_BASE, refresh]
  );

  // Since server drives filtering/pagination, compute lightweight stats from server-provided aggregates if available.
  // If server doesn't provide aggregates, we compute them from current page (may be partial) — consider adding an endpoint returning global aggregates.
  const stats = useMemo(() => {
    if (serverMeta && (serverMeta as any).aggregates) {
      const ag = (serverMeta as any).aggregates;
      return {
        totalUnits: ag.totalUnits ?? 0,
        totalAmount: ag.totalAmount ?? 0,
        totalDiscount: ag.totalDiscount ?? 0,
        totalRecords: serverMeta.total ?? 0,
      };
    }

    // fallback: compute from current page (note: partial)
    const getNumericField = (item: any, ...keys: string[]) => {
      for (const k of keys) {
        const v = item[k];
        if (v !== undefined && v !== null && !isNaN(Number(v)))
          return Number(v);
      }
      return 0;
    };

    const totalUnits = allRecords.reduce((sum, item) => sum + (getNumericField(item, 'quantity') || 0), 0);
    const totalAmount = allRecords.reduce((sum, item) => sum + getNumericField(item, 'amount', 'totalAmount'), 0);
    const totalDiscount = allRecords.reduce((sum, item) => {
      const total = getNumericField(item, 'totalAmount', 'amount');
      const final = getNumericField(item, 'finalAmount') || total;
      return sum + (total - final);
    }, 0);
    const totalRecords = serverMeta?.total ?? allRecords.length;

    return { totalUnits, totalAmount, totalDiscount, totalRecords };
  }, [serverMeta, allRecords]);

  // When filters change from UI, reset to page 1
  const updateFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
  }, []);

  // goToPage triggers server fetch via currentPage change
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const totalPages = serverMeta ? serverMeta.totalPages ?? Math.ceil((serverMeta.total ?? 0) / pageSize) : 1;

  // return server page as data; client-side allData kept for backward compatibility (but note: it's only current page's data)
  return {
    data: allRecords, // server page rows
    allData: allRecords,
    filters,
    sortBy,
    currentPage,
    totalPages,
    pageSize,
    stats,
    updateFilter,
    resetFilters,
    setSortBy,
    goToPage,
    refresh,
    uploadFile,
    loadingRemote,
    error,
  };
}
