import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onUpload?: (file: File) => Promise<void>;
}

export function Header({ searchValue, onSearchChange, onUpload }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between flex-shrink-0">
      <h1 className="text-xl font-semibold text-foreground">Sales Management System</h1>
      
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Name, Phone no."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background border-border"
        />
      </div>
      
      {/* upload button */}
      {/* <div className="ml-4">
        <label className="inline-flex items-center px-3 py-1 bg-primary text-white rounded cursor-pointer">
          Upload CSV
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files && e.target.files[0];
              if (f && typeof onUpload === 'function') await onUpload(f);
            }}
          />
        </label>
      </div> */}
    </header>
  );
}
