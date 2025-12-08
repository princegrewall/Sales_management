import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FilterBar } from '@/components/filters/FilterBar';
import { StatsBar } from '@/components/stats/StatsBar';
import { SalesTable } from '@/components/table/SalesTable';
import { Pagination } from '@/components/table/Pagination';
import { useSalesData } from '@/hooks/useSalesData';

const Index = () => {
  // ✅ Hook ALWAYS at top
  const {
    data,
    filters,
    sortBy,
    currentPage,
    totalPages,
    stats,
    updateFilter,
    resetFilters,
    setSortBy,
    goToPage,
    uploadFile,
    loadingRemote,
    error,
  } = useSalesData();

  // ✅ BLOCK UI until backend responds
  if (loadingRemote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground text-lg">Loading sales data...</p>
      </div>
    );
  }

  // ✅ Show backend error safely
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-500 font-semibold text-lg">Backend Error</p>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // ✅ Normal render only after data is stable
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          searchValue={filters.search}
          onSearchChange={(value) => updateFilter('search', value)}
          onUpload={uploadFile}
        />

        <main className="flex-1 p-6 overflow-hidden">
          <div className="space-y-6">
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              sortBy={sortBy}
              onFilterChange={updateFilter}
              onSortChange={setSortBy}
              onReset={resetFilters}
            />

            {/* Stats Bar */}
            <StatsBar
              totalUnits={stats.totalUnits}
              totalAmount={stats.totalAmount}
              totalDiscount={stats.totalDiscount}
            />

            {/* Data Table */}
            <SalesTable data={data} />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
