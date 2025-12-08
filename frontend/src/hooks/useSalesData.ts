import { useState, useMemo, useCallback, useEffect } from 'react';
import { SalesRecord, mockData } from '@/data/mockData';

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

export type SortOption = 'date-desc' | 'date-asc' | 'quantity-desc' | 'quantity-asc' | 'name-asc' | 'name-desc';

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

export function useSalesData() {
  // default to backend port used by backend (4004) — server may set PORT via .env
  const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000';

  // start with bundled mockData so UI shows something if backend isn't reachable
  const [allRecords, setAllRecords] = useState<SalesRecord[]>(mockData);
  const [loadingRemote, setLoadingRemote] = useState(false);

  // fetch records from backend if available
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingRemote(true);
      try {
        const res = await fetch(`${API_BASE}/api/sales`);
        if (!res.ok) throw new Error('no remote');
        const json = await res.json();
        // backend returns { data, meta }
        const rows = Array.isArray(json.data) ? json.data : json;
        if (mounted && rows.length) setAllRecords(rows as SalesRecord[]);
      } catch (e) {
        // keep mockData
      } finally {
        if (mounted) setLoadingRemote(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [API_BASE]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sales`);
      if (!res.ok) return;
      const json = await res.json();
      const rows = Array.isArray(json.data) ? json.data : json;
      setAllRecords(rows as SalesRecord[]);
    } catch (e) {
      // ignore
    }
  }, [API_BASE]);

  const uploadFile = useCallback(async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/api/sales/upload`, { method: 'POST', body: form });
    if (res.ok) {
      // after successful upload, refresh remote data
      await refresh();
    } else {
      const text = await res.text();
      throw new Error(text || 'Upload failed');
    }
  }, [API_BASE, refresh]);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredData = useMemo(() => {
  let result = [...allRecords];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((item) => {
        const name = item.customerName ? String(item.customerName).toLowerCase() : '';
        const phone = item.phoneNumber ? String(item.phoneNumber) : '';
        return name.includes(searchLower) || phone.includes(filters.search);
      });
    }

    // Region filter
    if (filters.regions.length > 0) {
      result = result.filter((item) => filters.regions.includes(item.customerRegion));
    }

    // Gender filter
    if (filters.genders.length > 0) {
      result = result.filter((item) => filters.genders.includes(item.gender));
    }

    // Age range filter
    if (filters.ageRanges.length > 0) {
      result = result.filter((item) => {
        return filters.ageRanges.some((range) => {
          const { min, max } = parseAgeRange(range);
          return item.age >= min && item.age <= max;
        });
      });
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((item) => filters.categories.includes(item.productCategory));
    }

    // Tags filter
    if (filters.tags.length > 0) {
      result = result.filter((item) =>
        filters.tags.some((tag) => item.tags.includes(tag))
      );
    }

    // Payment method filter
    if (filters.paymentMethods.length > 0) {
      result = result.filter((item) => filters.paymentMethods.includes(item.paymentMethod));
    }

    // Date range filter
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      result = result.filter((item) => {
        const itemDate = new Date(item.date);
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;
        
        if (startDate && endDate) {
          return itemDate >= startDate && itemDate <= endDate;
        } else if (startDate) {
          return itemDate >= startDate;
        } else if (endDate) {
          return itemDate <= endDate;
        }
        return true;
      });
    }

    return result;
  }, [filters]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];

    switch (sortBy) {
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'quantity-desc':
        sorted.sort((a, b) => b.quantity - a.quantity);
        break;
      case 'quantity-asc':
        sorted.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.customerName.localeCompare(b.customerName));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.customerName.localeCompare(a.customerName));
        break;
    }

    return sorted;
  }, [filteredData, sortBy]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const stats = useMemo(() => {
    const getNumericField = (item: any, ...keys: string[]) => {
      for (const k of keys) {
        const v = (item as any)[k];
        if (v !== undefined && v !== null && !isNaN(Number(v))) return Number(v);
      }
      return 0;
    };

    const totalUnits = filteredData.reduce((sum, item) => sum + (getNumericField(item, 'quantity') || 0), 0);
    const totalAmount = filteredData.reduce((sum, item) => sum + getNumericField(item, 'amount', 'totalAmount'), 0);
    const totalDiscount = filteredData.reduce((sum, item) => {
      const total = getNumericField(item, 'totalAmount', 'amount');
      const final = getNumericField(item, 'finalAmount') || total;
      return sum + (total - final);
    }, 0);
    const totalRecords = filteredData.length;

    return {
      totalUnits,
      totalAmount,
      totalDiscount,
      totalRecords,
    };
  }, [filteredData]);

  const updateFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  return {
    data: paginatedData,
    allData: sortedData,
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
  };
}
