import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileInput,
  CircleDot,
  Smartphone,
  Ban,
  CheckCircle,
  FileText,
  File,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  isActive?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: '#',
  },
  {
    label: 'Nexus',
    icon: <Users className="h-4 w-4" />,
    href: '#',
  },
  {
    label: 'Intake',
    icon: <FileInput className="h-4 w-4" />,
    href: '#',
  },
  {
    label: 'Services',
    icon: <CircleDot className="h-4 w-4" />,
    children: [
      { label: 'Pre-active', icon: <CircleDot className="h-4 w-4" />, href: '#' },
      { label: 'Active', icon: <Smartphone className="h-4 w-4" />, href: '#' },
      { label: 'Blocked', icon: <Ban className="h-4 w-4" />, href: '#' },
      { label: 'Closed', icon: <CheckCircle className="h-4 w-4" />, href: '#' },
    ],
  },
  {
    label: 'Invoices',
    icon: <FileText className="h-4 w-4" />,
    children: [
      { label: 'Proforma Invoices', icon: <File className="h-4 w-4" />, href: '#', isActive: true },
      { label: 'Final Invoices', icon: <File className="h-4 w-4" />, href: '#' },
    ],
  },
];

interface SidebarItemProps {
  item: NavItem;
  depth?: number;
}

function SidebarItem({ item, depth = 0 }: SidebarItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    item.children?.some((child) => child.isActive) || item.label === 'Services' || item.label === 'Invoices'
  );
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors relative',
          'hover:bg-sidebar-hover',
          item.isActive && 'bg-sidebar-hover font-medium',
          item.isActive && 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-primary before:rounded-r',
          depth > 0 && 'pl-9'
        )}
      >
        <span className="text-sidebar-foreground">{item.icon}</span>
        <span className="flex-1 text-left text-sidebar-foreground">{item.label}</span>
        {hasChildren && (
          <span className="text-muted-foreground">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        )}
      </button>
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <SidebarItem key={child.label} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen border-r border-sidebar-border bg-sidebar-bg flex flex-col flex-shrink-0">
      {/* Logo and User */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">V</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm">Vault</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Anurag Yadav</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
}
