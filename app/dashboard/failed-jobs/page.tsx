'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { AlertCircle, RefreshCw, Trash2, Clock, Filter } from 'lucide-react';

interface FailedJob {
  id: string;
  type: 'face_swap' | 'image_gen' | 'video_gen' | 'avatar_gen' | 'bulk';
  prompt?: string;
  error: string;
  creditsRefunded: number;
  timestamp: string;
  companyId: string;
}

const MOCK_FAILED: FailedJob[] = [
  { id: '1', type: 'face_swap', error: 'No face detected in source image', creditsRefunded: 2, timestamp: '2024-01-15 14:32', companyId: 'acme' },
  { id: '2', type: 'image_gen', prompt: 'Sunset over mountains with dramatic clouds...', error: 'Content policy violation', creditsRefunded: 1, timestamp: '2024-01-15 13:10', companyId: 'acme' },
  { id: '3', type: 'video_gen', prompt: 'Person walking in a park', error: 'Generation timeout (60s)', creditsRefunded: 8, timestamp: '2024-01-14 18:45', companyId: 'acme' },
  { id: '4', type: 'bulk', error: 'Invalid file format: .heic not supported', creditsRefunded: 0, timestamp: '2024-01-14 11:20', companyId: 'acme' },
  { id: '5', type: 'avatar_gen', error: 'Multiple faces detected — please use a single-face photo', creditsRefunded: 3, timestamp: '2024-01-13 09:05', companyId: 'acme' },
];

const TYPE_LABELS: Record<string, string> = {
  face_swap: 'Face Swap',
  image_gen: 'Image Gen',
  video_gen: 'Video Gen',
  avatar_gen: 'Avatar Gen',
  bulk: 'Bulk',
};

export default function FailedJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<FailedJob[]>(MOCK_FAILED);
  const [filter, setFilter] = useState<string>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = filter === 'all' ? jobs : jobs.filter(j => j.type === filter);
  const totalRefunded = jobs.reduce((acc, j) => acc + j.creditsRefunded, 0);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const deleteSelected = () => {
    setJobs(prev => prev.filter(j => !selected.includes(j.id)));
    setSelected([]);
  };

  const deleteJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id));

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: 'var(--foreground)' }}>
          Failed Jobs
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Review failed operations — credits are automatically refunded
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Failed Jobs', value: jobs.length, color: '#ef4444' },
          { label: 'Credits Refunded', value: `${totalRefunded} cr`, color: '#22c55e' },
          { label: 'This Week', value: jobs.filter(j => j.timestamp.startsWith('2024-01-1')).length, color: 'var(--foreground)' },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters + Actions */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'face_swap', 'image_gen', 'video_gen', 'avatar_gen', 'bulk'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '0.375rem 0.75rem', borderRadius: '2rem',
                border: `1px solid ${filter === f ? 'var(--foreground)' : 'var(--border)'}`,
                background: filter === f ? 'var(--foreground)' : 'transparent',
                color: filter === f ? 'var(--background)' : 'var(--foreground)',
                cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.2s', fontWeight: 500
              }}>
                {f === 'all' ? 'All' : TYPE_LABELS[f]}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <button onClick={deleteSelected} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500
            }}>
              <Trash2 size={14} /> Delete {selected.length} selected
            </button>
          )}
        </div>
      </div>

      {/* Jobs List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={40} style={{ margin: '0 auto 1rem', color: 'var(--muted-foreground)' }} />
          <p style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>No failed jobs</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>All your operations completed successfully</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(job => (
            <div key={job.id} className="card" style={{
              padding: '1.25rem',
              borderLeft: `3px solid ${selected.includes(job.id) ? 'var(--foreground)' : '#ef4444'}`,
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="checkbox"
                  checked={selected.includes(job.id)}
                  onChange={() => toggleSelect(job.id)}
                  style={{ marginTop: '0.2rem', cursor: 'pointer', accentColor: 'var(--foreground)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{
                      padding: '0.2rem 0.625rem', background: 'var(--surface-2)',
                      borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--foreground)'
                    }}>
                      {TYPE_LABELS[job.type]}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {job.timestamp}
                    </span>
                    {job.creditsRefunded > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>
                        +{job.creditsRefunded} cr refunded
                      </span>
                    )}
                  </div>
                  {job.prompt && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>
                      Prompt: "{job.prompt}"
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={14} color="#ef4444" />
                    <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{job.error}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem',
                    border: '1px solid var(--border)', borderRadius: '0.375rem',
                    background: 'transparent', color: 'var(--foreground)',
                    cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500
                  }}>
                    <RefreshCw size={12} /> Retry
                  </button>
                  <button onClick={() => deleteJob(job.id)} style={{
                    padding: '0.5rem', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '0.375rem', background: 'rgba(239,68,68,0.05)',
                    color: '#ef4444', cursor: 'pointer'
                  }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
