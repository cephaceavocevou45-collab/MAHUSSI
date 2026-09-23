import { useState } from 'react';
import { Save, Settings as SettingsIcon, Store, Bell, Globe } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import PageHeader from '@/components/common/PageHeader';
import { useToast } from '@/context/ToastContext';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    restaurantName: 'MAHUSSI',
    phone: '+221 33 800 1234',
    email: 'contact@mahussi.com',
    address: '123 Avenue de la Paix, Dakar, Senegal',
    currency: 'FCFA',
    minOrderAmount: '2000',
    openingTime: '08:00',
    closingTime: '22:00',
    enableNotifications: true,
    enableSMS: false,
    enableEmail: true,
    enablePush: true,
  });

  const handleSave = () => {
    toast('Settings saved successfully', 'success');
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <PageHeader title="Settings" subtitle="Manage your restaurant configuration" />

        <div className="max-w-2xl space-y-6">
          {/* Restaurant info */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4 flex items-center gap-2"><Store className="w-5 h-5 text-terracotta-500" /> Restaurant Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Restaurant Name</label>
                <input value={settings.restaurantName} onChange={e => setSettings({ ...settings, restaurantName: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Currency</label>
                <input value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Address</label>
                <input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className="input" />
              </div>
            </div>
          </div>

          {/* Order settings */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-terracotta-500" /> Order Settings</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Min Order (FCFA)</label>
                <input type="number" value={settings.minOrderAmount} onChange={e => setSettings({ ...settings, minOrderAmount: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Opening Time</label>
                <input type="time" value={settings.openingTime} onChange={e => setSettings({ ...settings, openingTime: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Closing Time</label>
                <input type="time" value={settings.closingTime} onChange={e => setSettings({ ...settings, closingTime: e.target.value })} className="input" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-5">
            <h3 className="font-semibold text-ink-800 mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-terracotta-500" /> Notification Settings</h3>
            <div className="space-y-3">
              {[
                { key: 'enableNotifications', label: 'In-app notifications' },
                { key: 'enableSMS', label: 'SMS notifications (Africa\'s Talking / Twilio)' },
                { key: 'enableEmail', label: 'Email notifications' },
                { key: 'enablePush', label: 'Push notifications (Web Push API)' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={(settings as any)[opt.key]} onChange={e => setSettings({ ...settings, [opt.key]: e.target.checked })} className="accent-terracotta-500 w-4 h-4" />
                  <span className="text-sm text-ink-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary"><Save className="w-4 h-4" /> Save Settings</button>
        </div>
      </div>
    </div>
  );
}
