import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu as MenuIcon, X, User, LogOut, Bell, Heart, Search, ChefHat, Truck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ROLE_LABELS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';

export default function Navbar() {
  const { profile, signOut, hasRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const isAdmin = hasRole('super_admin', 'restaurant_admin');
  const isStaff = hasRole('kitchen_staff', 'delivery_agent');

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setNotifications(data as Notification[]);
      });
  }, [profile, location.pathname]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-terracotta-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-500 to-gold-500 flex items-center justify-center shadow-md">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-terracotta-700 hidden sm:block">MAHUSSI</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-terracotta-600 bg-terracotta-50'
                    : 'text-ink-600 hover:text-terracotta-500 hover:bg-cream-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {profile && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-lg hover:bg-cream-200 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-ink-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-ink-100 z-50 max-h-96 overflow-y-auto animate-slide-down">
                      <div className="p-3 border-b border-ink-100">
                        <h3 className="font-semibold text-sm text-ink-800">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-ink-400 text-center">No notifications yet</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b border-ink-50 hover:bg-cream-50 ${!n.is_read ? 'bg-terracotta-50' : ''}`}>
                            <p className="text-sm font-medium text-ink-800">{n.title}</p>
                            <p className="text-xs text-ink-500 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-cream-200 transition-colors" aria-label="Cart">
              <ShoppingBag className="w-5 h-5 text-ink-600" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-gold-500 text-ink-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-cream-200 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta-400 to-gold-400 flex items-center justify-center text-white text-sm font-semibold">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-ink-700">{profile.full_name.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-ink-100 z-50 animate-slide-down">
                      <div className="p-3 border-b border-ink-100">
                        <p className="font-semibold text-sm text-ink-800">{profile.full_name}</p>
                        <p className="text-xs text-ink-500">{ROLE_LABELS[profile.role]}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50">
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50">
                          <ShoppingBag className="w-4 h-4" /> My Orders
                        </Link>
                        <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-ink-700 hover:bg-cream-50">
                          <Heart className="w-4 h-4" /> Favorites
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-terracotta-600 hover:bg-cream-50">
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}
                        {hasRole('kitchen_staff') && (
                          <Link to="/kitchen" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-terracotta-600 hover:bg-cream-50">
                            <ChefHat className="w-4 h-4" /> Kitchen Display
                          </Link>
                        )}
                        {isStaff && (
                          <Link to="/delivery" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-terracotta-600 hover:bg-cream-50">
                            <Truck className="w-4 h-4" /> Delivery Dashboard
                          </Link>
                        )}
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/register" className="btn-primary">Sign Up</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-cream-200">
              {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-terracotta-100 py-3 animate-slide-down">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  location.pathname === link.to ? 'text-terracotta-600 bg-terracotta-50' : 'text-ink-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!profile && (
              <div className="flex gap-2 px-4 mt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
