'use client';

import { useState } from 'react';
import { Save, Building, Bell, CreditCard, Globe } from 'lucide-react';
import { COLORS } from '@/lib/theme';


const tabs = [
  { id: 'organization', label: 'Organization', icon: Building },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'branches', label: 'Branches', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('organization');
  const [saving, setSaving] = useState(false);

  const [orgData, setOrgData] = useState({
    name: 'Yadawi Workshops',
    email: 'info@yadawi.com',
    phone: '+966 50 123 4567',
    website: 'https://yadawi.com',
    description: 'An educational platform providing various workshops in Kuwait and Saudi Arabia',
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: COLORS.bark, marginBottom: 8 }}>Settings</h2>
        <p style={{ color: COLORS.smoke, fontSize: 15 }}>Manage your organization and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar */}
        <div style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 12, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: isActive ? COLORS.terracottaLight : 'transparent',
                    border: 'none',
                    color: isActive ? COLORS.terracotta : COLORS.smoke,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: 4,
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {activeTab === 'organization' && (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: COLORS.bark, marginBottom: 24 }}>Organization Details</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>Organization Name</label>
                  <input
                    type="text"
                    value={orgData.name}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: COLORS.sand, fontSize: 15, color: COLORS.bark, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>Email</label>
                  <input
                    type="email"
                    value={orgData.email}
                    onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: COLORS.sand, fontSize: 15, color: COLORS.bark, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>Phone</label>
                  <input
                    type="tel"
                    value={orgData.phone}
                    onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: COLORS.sand, fontSize: 15, color: COLORS.bark, outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>Website</label>
                  <input
                    type="url"
                    value={orgData.website}
                    onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: COLORS.sand, fontSize: 15, color: COLORS.bark, outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>Description</label>
                <textarea
                  value={orgData.description}
                  onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: COLORS.sand, fontSize: 15, color: COLORS.bark, outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, background: saving ? '#9CA3AF' : `linear-gradient(135deg, ${COLORS.terracotta}, #E8873A)`, color: 'white', padding: '14px 28px', borderRadius: 12, border: 'none', fontWeight: 600, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 12px rgba(200,98,42,0.3)' }}>
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: COLORS.bark, marginBottom: 24 }}>Notification Preferences</h3>
              
              {[
                { label: 'New order notifications', desc: 'Get notified when someone places an order', enabled: true },
                { label: 'Order confirmation emails', desc: 'Send confirmation emails to customers', enabled: true },
                { label: 'Daily summary', desc: 'Receive daily sales summary', enabled: false },
                { label: 'Low stock alerts', desc: 'Alert when ticket inventory is low', enabled: true },
                { label: 'Weekly reports', desc: 'Receive weekly analytics report', enabled: false },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 4 ? `1px solid ${COLORS.sand}` : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.bark, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, color: COLORS.smoke }}>{item.desc}</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 28 }}>
                    <input type="checkbox" defaultChecked={item.enabled} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, background: item.enabled ? COLORS.terracotta : COLORS.sand, borderRadius: 28, transition: '0.3s' }}>
                      <span style={{ position: 'absolute', height: 20, width: 20, left: item.enabled ? 24 : 4, bottom: 4, background: 'white', borderRadius: '50%', transition: '0.3s' }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'payments' && (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: COLORS.bark, marginBottom: 24 }}>Payment Settings</h3>
              
              <div style={{ padding: 20, background: COLORS.sand, borderRadius: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={20} color={COLORS.bark} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: COLORS.bark }}>Managed by Pretix</div>
                    <div style={{ fontSize: 13, color: COLORS.smoke }}>Payment settings are configured in Pretix</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.bark, marginBottom: 8 }}>Currency</label>
                <select style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: `2px solid ${COLORS.sand}`, background: COLORS.sand, fontSize: 15, color: COLORS.bark, outline: 'none', cursor: 'pointer' }}>
                  <option>SAR - Saudi Riyal</option>
                  <option>KWD - Kuwaiti Dinar</option>
                  <option>USD - US Dollar</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div style={{ background: 'white', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(61,43,26,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: COLORS.bark }}>Branch Locations</h3>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: COLORS.terracotta, color: 'white', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  + Add Branch
                </button>
              </div>

              {[
                { name: 'Riyadh Studio', address: '123 Al-Masyaf District, Riyadh', phone: '+966 11 234 5678', active: true },
                { name: 'Kuwait City', address: '456 Sharq, Kuwait City', phone: '+965 224 5678', active: true },
                { name: 'Jeddah Hub', address: '789 Al-Hamra, Jeddah', phone: '+966 12 345 6789', active: false },
              ].map((branch, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: COLORS.sand, borderRadius: 12, marginBottom: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    🏢
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: COLORS.bark, marginBottom: 4 }}>{branch.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.smoke }}>{branch.address}</div>
                    <div style={{ fontSize: 13, color: COLORS.smoke }}>{branch.phone}</div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: branch.active ? COLORS.successLight : COLORS.sand, color: branch.active ? COLORS.success : COLORS.smoke }}>
                    {branch.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
