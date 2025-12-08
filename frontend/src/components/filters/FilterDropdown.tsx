import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  multiSelect?: boolean;
}

export function FilterDropdown({
  label,
  options,
  selectedValues,
  onChange,
  multiSelect = true,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    if (multiSelect) {
      if (selectedValues.includes(option)) {
        onChange(selectedValues.filter((v) => v !== option));
      } else {
        onChange([...selectedValues, option]);
      }
    } else {
      onChange([option]);
      setIsOpen(false);
    }
  };

  const displayLabel = selectedValues.length > 0 
    ? `${label} (${selectedValues.length})`
    : label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-border bg-background',
          'hover:bg-accent transition-colors',
          selectedValues.length > 0 && 'border-primary/50'
        )}
      >
        <span className={cn(
          'text-foreground',
          selectedValues.length > 0 && 'font-medium'
        )}>
          {displayLabel}
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 text-muted-foreground transition-transform',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-popover border border-border rounded-md shadow-lg z-50 py-1 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors"
            >
              <div className={cn(
                'w-4 h-4 border rounded flex items-center justify-center',
                selectedValues.includes(option) 
                  ? 'bg-primary border-primary' 
                  : 'border-border'
              )}>
                {selectedValues.includes(option) && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              <span>{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
