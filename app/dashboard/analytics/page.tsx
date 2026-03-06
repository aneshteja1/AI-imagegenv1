'use client';

import { useAuth } from '@/app/context/auth-context';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const WEEKLY = [
  { day: 'Mon', swaps: 42, images: 18, videos: 6 },
  { day: 'Tue', swaps: 58, images: 24, videos: 9 },
  { day: 'Wed', swaps: 35, images: 15, videos: 4 },
  { day: 'Thu', swaps: 71, images: 30, videos: 12 },
  { day: 'Fri', swaps: 84, images: 36, videos: 15 },
  { day: 'Sat', swaps: 29, images: 12, videos: 3 },
  { day: 'Sun', swaps: 22, images: 9,  videos: 2 },
];

const MONTHLY = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  credits: Math.floor(Math.random() * 200) + 50,
}));

const PIE_DATA = [
  { name: 'Face Swap',   value: 48, color: '#171717' },
  { name: 'Images',      value: 24, color: '#404040' },
  { name: 'Videos',      value: 14, color: '#737373' },
  { name: 'Avatar',      value: 9,  color: '#a3a3a3' },
  { name: 'Bulk',        value: 5,  color: '#d4d4d4' },
];

export default function AnalyticsPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(160px, 20%, 220px), 1fr))', gap: '0.75rem' }}>
        {[
          { label: 'Total Operations', value: '1,284', change: '+12% vs last week' },
          { label: 'Credits Used',     value: '2,568', change: '+8% vs last week' },
          { label: 'Success Rate',     value: '97.2%', change: '+0.3%' },
          { label: 'Avg Response',     value: '2.4s',  change: '−0.2s' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{card.label}</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>{card.value}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{card.change}</div>
          </div>
        ))}
      </div>

      {/* Weekly Usage Bar Chart */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '1rem' }}>Weekly Operations</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={WEEKLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="swaps"  name="Face Swaps"  fill="#171717" radius={[3, 3, 0, 0]} />
            <Bar dataKey="images" name="Images"      fill="#737373" radius={[3, 3, 0, 0]} />
            <Bar dataKey="videos" name="Videos"      fill="#d4d4d4" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 45%, 500px), 1fr))', gap: '1rem' }}>
        {/* Credits Usage Line Chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '1rem' }}>Credits Used (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="credits" stroke="#171717" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Operations Pie Chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '1rem' }}>Operations Breakdown</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <PieChart width={140} height={140}>
              <Pie data={PIE_DATA} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
              {PIE_DATA.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-xs)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: d.color, flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ fontWeight: 600 }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
