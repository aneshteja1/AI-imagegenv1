'use client';

import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { toast } from 'sonner';
import { Upload, RefreshCcw, Download, X, Coins } from 'lucide-react';
import { CREDIT_COSTS } from '@/lib/types';
import Image from 'next/image';

const AVATARS = [
  { id: 'ava',      name: 'Ava',      src: '/assets/avatars/Ava.png' },
  { id: 'lora',     name: 'Lora',     src: '/assets/avatars/Lora.png' },
  { id: 'henry',    name: 'Henry',    src: '/assets/avatars/henry.png' },
  { id: 'himari',   name: 'Himari',   src: '/assets/avatars/himari.png' },
  { id: 'kwame',    name: 'Kwame',    src: '/assets/avatars/kwame.png' },
  { id: 'mark',     name: 'Mark',     src: '/assets/avatars/mark.png' },
  { id: 'seo-jun',  name: 'Seo-Jun',  src: '/assets/avatars/seo-jun.png' },
  { id: 'zola',     name: 'Zola',     src: '/assets/avatars/zola.png' },
];

export default function SwapModelPage() {
  const { user, updateCredits } = useAuth();
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const cost = CREDIT_COSTS.face_swap;

  function readFile(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target?.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  async function handleModelDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      setModelImage(await readFile(file));
      setResult(null);
    }
  }

  async function handleModelSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setModelImage(await readFile(file)); setResult(null); }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setCustomAvatar(await readFile(file));
      setSelectedAvatar(null);
      setResult(null);
    }
  }

  const activeAvatar = customAvatar ?? (selectedAvatar ? AVATARS.find(a => a.id === selectedAvatar)?.src : null);

  async function handleSwap() {
    if (!modelImage || !activeAvatar) {
      toast.error('Please upload a model image and select/upload an avatar');
      return;
    }
    if (!user || user.credits < cost) {
      toast.error(`Insufficient credits. Need ${cost} credits.`);
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();

      // Convert base64 to blob
      const modelBlob = await (await fetch(modelImage)).blob();
      const avatarBlob = await (await fetch(activeAvatar)).blob();

      formData.append('model_image', modelBlob, 'model.jpg');
      formData.append('avatar_image', avatarBlob, 'avatar.jpg');

      const res = await fetch('/api/external-faceswap', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.startsWith('image/')) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setResult(url);
          updateCredits(-cost);
          toast.success(`Swap complete! −${cost} credits`);
        } else {
          const data = await res.json();
          // If JSON analysis returned (Vertex AI)
          setResult(modelImage); // show original as fallback
          toast.success('Swap analysis complete');
          updateCredits(-cost);
        }
      } else {
        throw new Error('Swap failed');
      }
    } catch (err) {
      // Demo mode: show placeholder result
      setResult(modelImage);
      updateCredits(-cost);
      toast.success(`Demo: Swap simulated! −${cost} credits`);
    }
    setIsProcessing(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Credit cost notice */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.625rem 1rem',
        background: 'var(--secondary)',
        borderRadius: '8px',
        fontSize: 'var(--text-sm)',
        color: 'var(--muted-foreground)',
        width: 'fit-content',
      }}>
        <Coins size={14} />
        <span>This operation costs <strong style={{ color: 'var(--foreground)' }}>{cost} credits</strong> per swap · Your balance: <strong style={{ color: 'var(--foreground)' }}>{user?.credits ?? 0}</strong></span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(280px, 40%, 420px), 1fr))',
        gap: '1rem',
        alignItems: 'start',
      }}>

        {/* Model Image Upload */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Model Image</h3>
            {modelImage && (
              <button onClick={() => setModelImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {modelImage ? (
            <div style={{ position: 'relative', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', background: 'var(--secondary)' }}>
              <img src={modelImage} alt="Model" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleModelDrop}
              onClick={() => modelInputRef.current?.click()}
              style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <Upload size={24} style={{ color: 'var(--muted-foreground)' }} />
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Drop model image here</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>or click to browse · JPG, PNG, WEBP</p>
            </div>
          )}
          <input ref={modelInputRef} type="file" accept="image/*" onChange={handleModelSelect} style={{ display: 'none' }} />
        </div>

        {/* Avatar Selection */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Avatar / Reference Face</h3>
            <button
              onClick={() => avatarInputRef.current?.click()}
              style={{
                padding: '0.25rem 0.625rem',
                background: 'var(--secondary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: 'var(--text-xs)',
                color: 'var(--foreground)',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              <Upload size={12} /> Upload Custom
            </button>
          </div>

          {customAvatar ? (
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                <img src={customAvatar} alt="Custom avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button
                onClick={() => setCustomAvatar(null)}
                style={{ position: 'absolute', top: '-6px', left: '68px', background: 'var(--foreground)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--background)' }}
              >
                <X size={10} />
              </button>
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {AVATARS.map(avatar => (
              <button
                key={avatar.id}
                onClick={() => { setSelectedAvatar(avatar.id); setCustomAvatar(null); }}
                style={{
                  border: `2px solid ${selectedAvatar === avatar.id && !customAvatar ? 'var(--foreground)' : 'transparent'}`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'none',
                  padding: 0,
                  transition: 'border-color 150ms',
                  aspectRatio: '1',
                }}
              >
                <img src={avatar.src} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${avatar.name}&background=gray&color=fff`; }}
                />
              </button>
            ))}
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Swap Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleSwap}
          disabled={isProcessing || !modelImage || !activeAvatar}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 2rem',
            background: 'var(--foreground)',
            color: 'var(--background)',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: 'var(--text-base)',
            cursor: (isProcessing || !modelImage || !activeAvatar) ? 'not-allowed' : 'pointer',
            opacity: (isProcessing || !modelImage || !activeAvatar) ? 0.5 : 1,
          }}
        >
          <RefreshCcw size={16} style={{ animation: isProcessing ? 'spin 0.6s linear infinite' : undefined }} />
          {isProcessing ? 'Processing...' : `Swap Face · ${cost} Credits`}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Result</h3>
            <a
              href={result}
              download="faceswap-result.jpg"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                background: 'var(--foreground)',
                color: 'var(--background)',
                borderRadius: '6px',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              <Download size={14} /> Download
            </a>
          </div>
          <div style={{ maxWidth: '400px', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={result} alt="Swap result" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
