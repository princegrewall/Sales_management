import { StatCard } from './StatCard';

interface StatsBarProps {
  totalUnits: number;
  totalAmount: number;
  totalDiscount: number;
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatSRs(amount: number): string {
  return `(${Math.round(amount / 1000)} SRs)`;
}

export function StatsBar({ totalUnits, totalAmount, totalDiscount }: StatsBarProps) {
  return (
    // outer container keeps layout static; inner wrapper scrolls horizontally when needed
    <div className="w-full">
      <div
        className="overflow-x-auto w-full"
        role="region"
        aria-label="Statistics - horizontal scroll"
      >
        <div className="flex items-center gap-4 flex-nowrap px-1">
          <StatCard
            label="Total units sold"
            value={totalUnits}
          />
          <StatCard
            label="Total Amount"
            value={formatCurrency(totalAmount)}
            subValue={formatSRs(totalAmount)}
          />
          <StatCard
            label="Total Discount"
            value={formatCurrency(totalDiscount)}
            subValue={formatSRs(totalDiscount)}
          />
        </div>
      </div>
    </div>
  );
}
