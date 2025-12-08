import React from 'react';
import { Copy } from 'lucide-react';
import { SalesRecord } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SalesTableProps {
  data: SalesRecord[];
}

export function SalesTable({ data }: SalesTableProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: 'Copied to clipboard',
      duration: 2000,
    });
  };

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <p className="text-muted-foreground text-lg">No results found</p>
        <p className="text-muted-foreground text-sm mt-1">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  // dynamic columns
  const keys = React.useMemo(() => {
    const set = new Set<string>();
    data.slice(0, 50).forEach((row) => Object.keys(row || {}).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [data]);

  return (
    <div className="bg-card border border-border rounded-lg">

      {/* 🔥 SCROLLBAR ADDED HERE ONLY */}
      <div className="
        w-full max-w-full 
        overflow-x-auto overflow-y-auto
        scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent
      ">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-table-header border-b border-table-border">
              {keys.map((k) => (
                <th
                  key={k}
                  className="text-left px-4 py-3 text-sm font-medium text-muted-foreground whitespace-nowrap"
                >
                  {k}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((record, rIdx) => (
              <tr
                key={rIdx}
                className={cn(
                  'border-b border-table-border last:border-b-0',
                  'hover:bg-table-row-hover transition-colors'
                )}
              >
                {keys.map((k) => (
                  <td key={k} className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {(() => {
                      const v = (record as any)[k];
                      if (v === undefined || v === null) return '';
                      if (Array.isArray(v)) return v.join(', ');
                      if (typeof v === 'object') return JSON.stringify(v);
                      return String(v);
                    })()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
