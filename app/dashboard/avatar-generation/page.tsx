'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { User, Upload, Download, Sparkles, AlertCircle, Zap } from 'lucide-react';

const AVATAR_STYLES = [
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'casual', label: 'Casual', emoji: '😎' },
  { id: 'fantasy', label: 'Fantasy', emoji: '⚔️' },
  { id: 'anime', label: 'Anime', emoji: '🌸' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '🤖' },
  { id: 'watercolor', label: 'Watercolor', emoji: '🎨' },
  { id: '3d-render', label: '3D Render', emoji: '🔮' },
  { id: 'oil-painting', label: 'Oil Painting', emoji: '🖼️' },
];

const AVATAR_BACKGROUNDS = [
  { id: 'studio', label: 'Studio White' },
  { id: 'office', label: 'Office' },
  { id: 'nature', label: 'Nature' },
  { id: 'gradient', label: 'Gradient' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'transparent', label: 'Transparent' },
];

const COUNTS = [1, 2, 4];

export default function AvatarGenerationPage() {
  const { user, deductCredits } = useAuth();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [style, setStyle] = useState('professional');
  const [background, setBackground] = useState('studio');
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const CREDIT_COST = 3 * count;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSourceImage(url);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) { setError('Please upload a source photo'); return; }
    if ((user?.credits ?? 0) < CREDIT_COST) { setError('Insufficient credits'); return; }
    setError('');
    setGenerating(true);
    setResults([]);

    try {
      await new Promise(r => setTimeout(r, 3500));
      deductCredits(CREDIT_COST);
      setResults(Array.from({ length: count }, (_, i) => `demo_${i}`));
    } catch {
      setError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: 'var(--foreground)' }}>
          Avatar Generation
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Transform portraits into stunning AI-generated avatars
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Upload + Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upload */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Source Photo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            {sourceImage ? (
              <div style={{ position: 'relative' }}>
                <img src={sourceImage} alt="Source" style={{
                  width: '100%', height: '200px', objectFit: 'cover',
                  borderRadius: '0.5rem', border: '1px solid var(--border)'
                }} />
                <button onClick={() => setSourceImage(null)} style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none',
                  borderRadius: '0.25rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem'
                }}>Remove</button>
              </div>
            ) : (
              <label className="drop-zone" style={{ cursor: 'pointer', display: 'block' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <User size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--muted-foreground)' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', marginBottom: '0.25rem' }}>Upload your photo</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Clear face photo for best results</p>
              </label>
            )}
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: '0.5rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                💡 <strong>Tip:</strong> Use a well-lit, front-facing photo for best avatar quality
              </p>
            </div>
          </div>

          {/* Style */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Avatar Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {AVATAR_STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} style={{
                  padding: '0.625rem 0.75rem',
                  border: `1px solid ${style === s.id ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem',
                  background: style === s.id ? 'var(--foreground)' : 'transparent',
                  color: style === s.id ? 'var(--background)' : 'var(--foreground)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <span>{s.emoji}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Background + Count + Generate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Background */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Background
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {AVATAR_BACKGROUNDS.map(b => (
                <button key={b.id} onClick={() => setBackground(b.id)} style={{
                  padding: '0.625rem', border: `1px solid ${background === b.id ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem', background: background === b.id ? 'var(--foreground)' : 'transparent',
                  color: background === b.id ? 'var(--background)' : 'var(--foreground)',
                  cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.2s', fontWeight: 500
                }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Number of Avatars
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {COUNTS.map(c => (
                <button key={c} onClick={() => setCount(c)} style={{
                  flex: 1, padding: '0.875rem',
                  border: `1px solid ${count === c ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem', background: count === c ? 'var(--foreground)' : 'transparent',
                  color: count === c ? 'var(--background)' : 'var(--foreground)',
                  cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s'
                }}>
                  {c}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
              3 credits per avatar · {CREDIT_COST} credits total
            </p>
          </div>

          {/* Generate */}
          <div className="card" style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{error}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Your balance</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{user?.credits ?? 0} credits</span>
            </div>
            <button onClick={handleGenerate} disabled={generating || !sourceImage} style={{
              width: '100%', padding: '0.875rem',
              background: generating || !sourceImage ? 'var(--muted)' : 'var(--foreground)',
              color: generating || !sourceImage ? 'var(--muted-foreground)' : 'var(--background)',
              border: 'none', borderRadius: '0.5rem',
              cursor: generating || !sourceImage ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}>
              {generating ? (
                <><Sparkles size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating Avatars...</>
              ) : (
                <><Zap size={16} /> Generate {count} Avatar{count > 1 ? 's' : ''} · {CREDIT_COST} cr</>
              )}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Generated Avatars</span>
                <span className="badge badge-success">{results.length} ready</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${results.length > 1 ? 2 : 1}, 1fr)`, gap: '0.75rem' }}>
                {results.map((_, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', background: 'var(--surface-2)', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem' }}>
                    <User size={32} style={{ color: 'var(--muted-foreground)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{style} #{i + 1}</span>
                    <button style={{
                      position: 'absolute', bottom: '0.5rem', right: '0.5rem',
                      padding: '0.375rem', background: 'var(--foreground)', color: 'var(--background)',
                      border: 'none', borderRadius: '0.375rem', cursor: 'pointer'
                    }}>
                      <Download size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
