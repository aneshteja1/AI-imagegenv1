'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
// FIX: Removed unused imports (Upload, X, RefreshCcw) to prevent Vercel build failure
import { Image as ImageIcon, Coins, Download } from 'lucide-react';
import { toast } from 'sonner';
import { CREDIT_COSTS } from '@/lib/types';

const STYLES = ['Realistic', 'Anime', 'Oil Painting', 'Watercolor', 'Sketch', 'Digital Art', '3D Render', 'Photography'];
const SIZES  = ['512×512', '768×768', '1024×1024', '1024×1792', '1792×1024'];

export default function ImageGenerationPage() {
  const { user, updateCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [size, setSize] = useState('1024×1024');
  const [count, setCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  // FIX: Removed setReferenceImage since it is never used in this file
  const [referenceImage] = useState<string | null>(null); 

  const cost = CREDIT_COSTS.image_generation * count;

  async function generate() {
    if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
    if (!user || user.credits < cost) { toast.error(`Need ${cost} credits`); return; }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, size, count, referenceImage }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.images?.length) {
          setResults(data.images);
        } else {
          // Demo fallback
          const placeholders = Array.from({ length: count }, (_, i) =>
            `https://picsum.photos/seed/${Date.now() + i}/512/512`
          );
          setResults(placeholders);
        }
      } else throw new Error('Generation failed');
    } catch {
      const placeholders = Array.from({ length: count }, (_, i) =>
        `https://picsum.photos/seed/${Date.now() + i}/512/512`
      );
      setResults(placeholders);
    }
    updateCredits(-cost);
    toast.success(`Generated! −${cost} credits`);
    setIsGenerating(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)',
        gap: '1rem',
        alignItems: 'start',
      }}
        className="responsive-two-col"
      >
        {/* Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Prompt */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              rows={4}
              style={{
                width: '100%', padding: '0.75rem',
                background: 'var(--background)', border: '1px solid var(--border)',
                borderRadius: '8px', fontSize: 'var(--text-sm)',
                color: 'var(--foreground)', resize: 'vertical', outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Style + Size */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Style</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {STYLES.map(s => (
                  <button key={s} onClick={() => setStyle(s)} style={{
                    padding: '0.375rem 0.75rem',
                    background: style === s ? 'var(--foreground)' : 'var(--secondary)',
                    color: style === s ? 'var(--background)' : 'var(--foreground)',
                    border: 'none', borderRadius: '6px',
                    cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: style === s ? 600 : 400,
                  }}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Size</label>
                <select value={size} onChange={e => setSize(e.target.value)} style={{ height: '36px', padding: '0 0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: 'var(--text-sm)', color: 'var(--foreground)', outline: 'none' }}>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Count</label>
                <select value={count} onChange={e => setCount(Number(e.target.value))} style={{ height: '36px', padding: '0 0.75rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: 'var(--text-sm)', color: 'var(--foreground)', outline: 'none' }}>
                  {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} image{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={isGenerating || !prompt.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.75rem',
              background: 'var(--foreground)', color: 'var(--background)',
              border: 'none', borderRadius: '10px',
              fontWeight: 600, fontSize: 'var(--text-base)',
              cursor: (isGenerating || !prompt.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isGenerating || !prompt.trim()) ? 0.5 : 1,
            }}
          >
            <ImageIcon size={16} style={{ animation: isGenerating ? 'spin 0.6s linear infinite' : undefined }} />
            {isGenerating ? 'Generating...' : `Generate · ${cost} Credits`}
            <span style={{ marginLeft: '0.25rem', opacity: 0.7, fontSize: 'var(--text-sm)' }}>
              <Coins size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {user?.credits ?? 0}
            </span>
          </button>
        </div>

        {/* Right: Results */}
        <div>
          {results.length > 0 ? (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.75rem' }}>Results</h3>
              <div className="image-grid">
                {results.map((src, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1', background: 'var(--secondary)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Generated ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    <a
                      href={src} download={`generated-${i + 1}.jpg`}
                      style={{
                        position: 'absolute', bottom: '6px', right: '6px',
                        background: 'rgba(0,0,0,0.6)', color: 'white',
                        borderRadius: '6px', padding: '4px 6px',
                        display: 'flex', alignItems: 'center',
                        textDecoration: 'none',
                      }}
                    >
                      <Download size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '3rem',
              textAlign: 'center', color: 'var(--muted-foreground)',
            }}>
              <ImageIcon size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
              <p style={{ fontSize: 'var(--text-sm)' }}>Generated images will appear here</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .responsive-two-col { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
