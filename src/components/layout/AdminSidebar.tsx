import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, BarChart3, Tag, Truck, MapPin, Star, Settings } from 'lucide-react';
import { cn } from '@/lib/constants';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/menu', label: 'Menu Management', icon: UtensilsCrossed },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/promotions', label: 'Promotions', icon: Tag },
  { to: '/admin/delivery', label: 'Delivery Zones', icon: MapPin },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-ink-100 min-h-[calc(100vh-4rem)] hidden lg:block">
      <nav className="p-4 space-y-1">
        <p className="px-3 py-2 text-xs font-semibold text-ink-400 uppercase tracking-wider">Management</p>
        {adminNav.map(item => {
          const isActive = location.pathname === item.to || (item.to !== '/admin' && location.pathname.startsWith(item.to));
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-terracotta-50 text-terracotta-700'
                  : 'text-ink-600 hover:bg-cream-100 hover:text-terracotta-600'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
