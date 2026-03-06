'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Video, Upload, Play, Download, AlertCircle, Clock, Zap } from 'lucide-react';

const VIDEO_STYLES = [
  { id: 'cinematic', label: 'Cinematic', desc: 'Film-quality motion' },
  { id: 'commercial', label: 'Commercial', desc: 'Brand-ready content' },
  { id: 'social', label: 'Social Media', desc: 'Short-form optimized' },
  { id: 'documentary', label: 'Documentary', desc: 'Realistic narrative' },
];

const VIDEO_DURATIONS = [
  { value: '3', label: '3 seconds', credits: 5 },
  { value: '5', label: '5 seconds', credits: 8 },
  { value: '10', label: '10 seconds', credits: 15 },
  { value: '15', label: '15 seconds', credits: 20 },
];

const VIDEO_RESOLUTIONS = [
  { value: '720p', label: '720p HD', credits: 0 },
  { value: '1080p', label: '1080p Full HD', credits: 2 },
  { value: '4k', label: '4K Ultra HD', credits: 5 },
];

export default function VideoGenerationPage() {
  const { user, updateCredits } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState('5');
  const [resolution, setResolution] = useState('1080p');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const selectedDuration = VIDEO_DURATIONS.find(d => d.value === duration)!;
  const selectedResolution = VIDEO_RESOLUTIONS.find(r => r.value === resolution)!;
  const totalCredits = selectedDuration.credits + selectedResolution.credits;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setReferenceImage(url);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { setError('Please enter a prompt'); return; }
    if ((user?.credits ?? 0) < totalCredits) { setError('Insufficient credits'); return; }
    setError('');
    setGenerating(true);
    setProgress(0);
    setResult(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 8;
      });
    }, 500);

    try {
      await new Promise(r => setTimeout(r, 6000));
      clearInterval(interval);
      setProgress(100);
      updateCredits(totalCredits);
      // Demo result
      setResult('demo');
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
          Video Generation
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Generate AI-powered videos from text prompts
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Config Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Prompt */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--foreground)' }}>
              Video Prompt
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate... e.g. 'A person walking through a sunlit forest, cinematic slow motion'"
              style={{
                width: '100%', minHeight: '120px', padding: '0.75rem',
                border: '1px solid var(--border)', borderRadius: '0.5rem',
                background: 'var(--background)', color: 'var(--foreground)',
                fontSize: '0.875rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                fontFamily: 'Satoshi, sans-serif'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
              {prompt.length}/500 characters
            </p>
          </div>

          {/* Reference Image */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Reference Image <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(optional)</span>
            </label>
            {referenceImage ? (
              <div style={{ position: 'relative' }}>
                <img src={referenceImage} alt="Reference" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                <button onClick={() => setReferenceImage(null)} style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none',
                  borderRadius: '0.25rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem'
                }}>Remove</button>
              </div>
            ) : (
              <label className="drop-zone" style={{ cursor: 'pointer', display: 'block' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <Upload size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--muted-foreground)' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Upload reference image</p>
              </label>
            )}
          </div>

          {/* Style */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Video Style
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {VIDEO_STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)} style={{
                  padding: '0.75rem', border: `1px solid ${style === s.id ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem', background: style === s.id ? 'var(--foreground)' : 'var(--background)',
                  color: style === s.id ? 'var(--background)' : 'var(--foreground)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.125rem' }}>{s.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings + Output */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Duration */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Duration
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {VIDEO_DURATIONS.map(d => (
                <button key={d.value} onClick={() => setDuration(d.value)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', border: `1px solid ${duration === d.value ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem', background: duration === d.value ? 'var(--foreground)' : 'transparent',
                  color: duration === d.value ? 'var(--background)' : 'var(--foreground)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} />
                    <span style={{ fontSize: '0.875rem' }}>{d.label}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{d.credits} cr</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Resolution
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {VIDEO_RESOLUTIONS.map(r => (
                <button key={r.value} onClick={() => setResolution(r.value)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', border: `1px solid ${resolution === r.value ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem', background: resolution === r.value ? 'var(--foreground)' : 'transparent',
                  color: resolution === r.value ? 'var(--background)' : 'var(--foreground)',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '0.875rem' }}>{r.label}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>+{r.credits} cr</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="card" style={{ padding: '1.5rem' }}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={14} color="#ef4444" />
                <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>{error}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Total Cost</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={14} style={{ color: 'var(--foreground)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--foreground)' }}>{totalCredits} credits</span>
              </div>
            </div>

            {generating && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Generating video...</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--foreground)' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--foreground)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
                </div>
              </div>
            )}

            <button onClick={handleGenerate} disabled={generating || !prompt.trim()} style={{
              width: '100%', padding: '0.875rem',
              background: generating || !prompt.trim() ? 'var(--muted)' : 'var(--foreground)',
              color: generating || !prompt.trim() ? 'var(--muted-foreground)' : 'var(--background)',
              border: 'none', borderRadius: '0.5rem', cursor: generating || !prompt.trim() ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}>
              <Video size={16} />
              {generating ? 'Generating...' : `Generate Video · ${totalCredits} cr`}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Generated Video</span>
                <span className="badge badge-success">Ready</span>
              </div>
              <div style={{
                width: '100%', aspectRatio: '16/9', background: 'var(--surface-2)',
                borderRadius: '0.5rem', border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem'
              }}>
                <Play size={48} style={{ color: 'var(--muted-foreground)' }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>
                  {duration}s · {resolution} · {style}
                </p>
              </div>
              <button style={{
                width: '100%', marginTop: '1rem', padding: '0.75rem',
                border: '1px solid var(--border)', borderRadius: '0.5rem',
                background: 'transparent', color: 'var(--foreground)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
                <Download size={14} /> Download MP4
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
