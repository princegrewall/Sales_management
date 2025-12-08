import React from "react";
import { RotateCcw } from "lucide-react";
import { FilterDropdown } from "./FilterDropdown";
import { DateRangeFilter } from "./DateRangeFilter";
import { SortDropdown } from "./SortDropdown";
import { filterOptions } from "@/data/mockData";
import { Filters, SortOption } from "@/hooks/useSalesData";

interface FilterBarProps {
  filters: Filters;
  sortBy: SortOption;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
}

export function FilterBar({
  filters,
  sortBy,
  onFilterChange,
  onSortChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters =
    filters.regions.length > 0 ||
    filters.genders.length > 0 ||
    filters.ageRanges.length > 0 ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.paymentMethods.length > 0 ||
    filters.dateRange !== null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onReset}
        disabled={!hasActiveFilters}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Reset filters"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <FilterDropdown
        label="Customer Region"
        options={filterOptions.regions}
        selectedValues={filters.regions}
        onChange={(values) =>
          onFilterChange("regions", values as Filters["regions"])
        }
      />

      <FilterDropdown
        label="Gender"
        options={filterOptions.genders}
        selectedValues={filters.genders}
        onChange={(values) =>
          onFilterChange("genders", values as Filters["genders"])
        }
      />

      <FilterDropdown
        label="Age Range"
        options={filterOptions.ageRanges}
        selectedValues={filters.ageRanges}
        onChange={(values) =>
          onFilterChange("ageRanges", values as Filters["ageRanges"])
        }
      />

      <FilterDropdown
        label="Product Category"
        options={filterOptions.categories}
        selectedValues={filters.categories}
        onChange={(values) =>
          onFilterChange("categories", values as Filters["categories"])
        }
      />

      <FilterDropdown
        label="Tags"
        options={filterOptions.tags}
        selectedValues={filters.tags}
        onChange={(values) => onFilterChange("tags", values as Filters["tags"])}
      />

      <FilterDropdown
        label="Payment Method"
        options={filterOptions.paymentMethods}
        selectedValues={filters.paymentMethods}
        onChange={(values) =>
          onFilterChange("paymentMethods", values as Filters["paymentMethods"])
        }
      />

      <DateRangeFilter
        value={filters.dateRange}
        onChange={(value) =>
          onFilterChange("dateRange", value as Filters["dateRange"])
        }
      />

      <div className="flex-1" />

      <SortDropdown value={sortBy} onChange={onSortChange} />
    </div>
  );
}
