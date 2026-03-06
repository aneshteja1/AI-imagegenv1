'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { User, Download, Sparkles, AlertCircle, Zap, X, Loader2 } from 'lucide-react';

// ... (AVATAR_STYLES, AVATAR_BACKGROUNDS, COUNTS remain the same)

export default function AvatarGenerationPage() {
  const { user, updateCredits } = useAuth();
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [style, setStyle] = useState('professional');
  const [background, setBackground] = useState('studio');
  const [count, setCount] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const CREDIT_COST = 3 * count;

  // CLEANUP: Revoke object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (sourceImage && sourceImage.startsWith('blob:')) {
        URL.revokeObjectURL(sourceImage);
      }
    };
  }, [sourceImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit check
        setError('Image too large. Please upload a file under 5MB.');
        return;
      }
      const url = URL.createObjectURL(file);
      setSourceImage(url);
      setError('');
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) { setError('Please upload a source photo'); return; }
    if ((user?.credits ?? 0) < CREDIT_COST) { setError('Insufficient credits'); return; }
    
    setError('');
    setGenerating(true);
    // Optional: Clear results when starting new generation
    // setResults([]); 

    try {
      // Logic for actual API call would go here
      await new Promise(r => setTimeout(r, 3500));
      
      updateCredits(-CREDIT_COST); 
      // In a real app, these would be S3/Cloudinary URLs from your backend
      setResults(Array.from({ length: count }, (_, i) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`));
    } catch (err) {
      setError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Adding a hidden CSS block for the spin animation if not in global CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin 2s linear infinite; }
      `}} />

      <div>
        <h1 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: 'var(--foreground)' }}>
          Avatar Generation
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Transform portraits into stunning AI-generated avatars
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Source Photo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            
            {sourceImage ? (
              <div style={{ position: 'relative' }}>
                <img src={sourceImage} alt="Source" style={{
                  width: '100%', height: '220px', objectFit: 'cover',
                  borderRadius: '0.5rem', border: '1px solid var(--border)'
                }} />
                <button 
                  onClick={() => setSourceImage(null)} 
                  style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                    borderRadius: '50%', width: '24px', height: '24px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="drop-zone" style={{ 
                cursor: 'pointer', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', height: '220px',
                border: '2px dashed var(--border)', borderRadius: '0.5rem'
              }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <User size={32} style={{ marginBottom: '0.75rem', color: 'var(--muted-foreground)' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Upload your photo</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>JPG, PNG up to 5MB</p>
              </label>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
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
                  cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <span>{s.emoji}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              Background & Quantity
            </label>
            <select 
              value={background} 
              onChange={(e) => setBackground(e.target.value)}
              style={{ 
                width: '100%', padding: '0.625rem', borderRadius: '0.5rem', 
                border: '1px solid var(--border)', background: 'var(--background)',
                color: 'var(--foreground)', marginBottom: '1rem'
              }}
            >
              {AVATAR_BACKGROUNDS.map(b => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {COUNTS.map(c => (
                <button key={c} onClick={() => setCount(c)} style={{
                  flex: 1, padding: '0.625rem',
                  border: `1px solid ${count === c ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem', background: count === c ? 'var(--foreground)' : 'transparent',
                  color: count === c ? 'var(--background)' : 'var(--foreground)',
                  cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{error}</span>
              </div>
            )}
            
            <button 
              onClick={handleGenerate} 
              disabled={generating || !sourceImage} 
              style={{
                width: '100%', padding: '0.875rem',
                background: generating || !sourceImage ? 'var(--muted)' : 'var(--foreground)',
                color: generating || !sourceImage ? 'var(--muted-foreground)' : 'var(--background)',
                border: 'none', borderRadius: '0.5rem',
                cursor: generating || !sourceImage ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin-slow" /> Processing...</>
              ) : (
                <><Zap size={16} /> Generate ({CREDIT_COST} credits)</>
              )}
            </button>
          </div>

          {/* Results Grid */}
          {results.length > 0 && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Your New Avatars</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {results.map((url, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={url} alt="Generated Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <a 
                      href={url} 
                      download={`avatar-${i}.png`}
                      style={{
                        position: 'absolute', bottom: '5px', right: '5px',
                        padding: '4px', background: 'var(--foreground)', color: 'var(--background)',
                        borderRadius: '4px', display: 'flex'
                      }}
                    >
                      <Download size={14} />
                    </a>
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
