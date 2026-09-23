import { useEffect, useState } from 'react';
import { Search, UserCog } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';
import { ROLE_LABELS, formatDate } from '@/lib/constants';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/context/ToastContext';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) || []);
    setLoading(false);
  };

  const updateRole = async (id: string, role: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) { toast('Failed to update role', 'error'); return; }
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    toast('User role updated', 'success');
  };

  const toggleActive = async (user: Profile) => {
    const { error } = await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id);
    if (error) { toast('Failed to update user', 'error'); return; }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    toast('User status updated', 'success');
  };

  const filtered = users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Users" subtitle="Manage user accounts and roles" />

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input pl-10" />
        </div>

        {loading ? <LoadingSpinner size="lg" /> : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 text-ink-500 text-xs uppercase">
                <tr>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Loyalty</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-cream-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta-400 to-gold-400 flex items-center justify-center text-white text-xs font-bold">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-ink-800">{user.full_name}</p>
                          <p className="text-xs text-ink-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <select value={user.role} onChange={e => updateRole(user.id, e.target.value as UserRole)} className="text-xs rounded-lg border border-ink-200 px-2 py-1 cursor-pointer">
                        {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-ink-600">{user.loyalty_points} pts · <span className="text-xs capitalize">{user.loyalty_tier}</span></td>
                    <td className="p-3">
                      <button onClick={() => toggleActive(user)} className={`badge cursor-pointer ${user.is_active ? 'bg-forest-100 text-forest-700' : 'bg-red-100 text-red-700'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-3 text-ink-400 text-xs">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
