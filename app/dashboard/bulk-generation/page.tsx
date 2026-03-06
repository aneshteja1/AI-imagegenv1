'use client';

import { useState, useCallback, useEffect } from 'react';
// Assuming useAuth is in this path
import { useAuth } from '@/app/context/auth-context';
import { Upload, X, Play, Download, CheckCircle, AlertCircle, Clock, Zap, Package, Loader2 } from 'lucide-react';

interface BulkJob {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  preview?: string;
  progress?: number;
}

export default function BulkGenerationPage() {
  const { user, updateCredits } = useAuth();
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [batchFiles, setBatchFiles] = useState<BulkJob[]>([]);
  const [operation, setOperation] = useState<'face_swap' | 'avatar'>('face_swap');
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Stats
  const doneCount = batchFiles.filter(f => f.status === 'done').length;
  const pendingCount = batchFiles.filter(f => f.status === 'pending').length;
  const processingCount = batchFiles.filter(f => f.status === 'processing').length;

  // FIX: Only calculate cost for PENDING files, not all files in the array
  const creditCost = operation === 'face_swap' ? 1 : 2;
  const totalCost = pendingCount * creditCost;

  // FIX: Memory management for object URLs
  useEffect(() => {
    return () => {
      // Cleanup URLs on unmount to prevent memory leaks
      if (modelImage) URL.revokeObjectURL(modelImage);
      batchFiles.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    };
  }, [modelImage, batchFiles]);

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (modelImage) URL.revokeObjectURL(modelImage); // Clear old memory
      setModelImage(URL.createObjectURL(file));
    }
  };

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newJobs: BulkJob[] = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: crypto.randomUUID(), // FIX: Better unique ID generation
        filename: f.name,
        status: 'pending',
        preview: URL.createObjectURL(f),
      }));
    setBatchFiles(prev => [...prev, ...newJobs]);
  }, []);

  const removeFile = (id: string) => {
    setBatchFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview); // Cleanup
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAllFiles = () => {
    batchFiles.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    setBatchFiles([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleBulkRun = async () => {
    if (!modelImage || pendingCount === 0) return;
    if ((user?.credits ?? 0) < totalCost) return;
    setRunning(true);

    // FIX: Only process pending jobs and use their specific IDs, not array indexes
    const jobsToProcess = batchFiles.filter(f => f.status === 'pending');

    for (const job of jobsToProcess) {
      setBatchFiles(prev => prev.map(f =>
        f.id === job.id ? { ...f, status: 'processing', progress: 0 } : f
      ));
      
      // Simulate API call processing
      await new Promise(r => setTimeout(r, 1200));
      
      // Deduct credits
      updateCredits(-creditCost); 
      
      setBatchFiles(prev => prev.map(f =>
        f.id === job.id ? { ...f, status: 'done', progress: 100 } : f
      ));
    }
    
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', color: 'var(--foreground)' }}>
          Bulk Generation
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Process multiple images at once — {creditCost} credit{creditCost > 1 ? 's' : ''} per image
        </p>
      </div>

      {/* Stats Bar */}
      {batchFiles.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total', value: batchFiles.length, icon: Package },
            { label: 'Pending', value: pendingCount, icon: Clock },
            { label: 'Processing', value: processingCount, icon: Play },
            { label: 'Done', value: doneCount, icon: CheckCircle },
            { label: 'Est. Cost', value: `${totalCost} cr`, icon: Zap },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <stat.icon size={18} style={{ margin: '0 auto 0.5rem', color: 'var(--muted-foreground)' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--foreground)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Config */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Operation */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Operation Type
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'face_swap', label: 'Bulk Face Swap', desc: '1 credit per image', emoji: '🔄' },
                { id: 'avatar', label: 'Bulk Avatar Gen', desc: '2 credits per image', emoji: '✨' },
              ].map(op => (
                <button key={op.id} disabled={running} onClick={() => setOperation(op.id as typeof operation)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                  border: `1px solid ${operation === op.id ? 'var(--foreground)' : 'var(--border)'}`,
                  borderRadius: '0.5rem', background: operation === op.id ? 'var(--foreground)' : 'transparent',
                  color: operation === op.id ? 'var(--background)' : 'var(--foreground)',
                  cursor: running ? 'not-allowed' : 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  opacity: running ? 0.6 : 1
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{op.emoji}</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{op.label}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{op.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Image */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
              Model / Target Image
            </label>
            {modelImage ? (
              <div style={{ position: 'relative' }}>
                <img src={modelImage} alt="Model" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '0.5rem', border: '1px solid var(--border)' }} />
                {!running && (
                  <button onClick={() => {
                    URL.revokeObjectURL(modelImage);
                    setModelImage(null);
                  }} style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none',
                    borderRadius: '0.25rem', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem'
                  }}>
                    <X size={12} />
                  </button>
                )}
              </div>
            ) : (
              <label className="drop-zone" style={{ cursor: 'pointer', display: 'block', border: '1px dashed var(--border)', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center' }}>
                <input type="file" accept="image/*" onChange={handleModelUpload} style={{ display: 'none' }} />
                <Upload size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--muted-foreground)' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Upload model image</p>
              </label>
            )}
          </div>

          {/* Run Button */}
          <div className="card" style={{ padding: '1.5rem' }}>
            {(user?.credits ?? 0) < totalCost && pendingCount > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                <AlertCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ fontSize: '0.8125rem', color: '#ef4444' }}>
                  Insufficient credits. Need {totalCost}, have {user?.credits ?? 0}.
                </span>
              </div>
            )}
            <button 
              onClick={handleBulkRun} 
              disabled={running || !modelImage || pendingCount === 0 || (user?.credits ?? 0) < totalCost} 
              style={{
                width: '100%', padding: '0.875rem',
                background: running || !modelImage || pendingCount === 0 ? 'var(--muted)' : 'var(--foreground)',
                color: running || !modelImage || pendingCount === 0 ? 'var(--muted-foreground)' : 'var(--background)',
                border: 'none', borderRadius: '0.5rem',
                cursor: running || !modelImage || pendingCount === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              {running ? (
                <><Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
              ) : (
                <><Play size={16} /> Run Batch · {totalCost} cr</>
              )}
            </button>
            {doneCount > 0 && doneCount === batchFiles.length && !running && (
              <button style={{
                width: '100%', marginTop: '0.75rem', padding: '0.75rem',
                border: '1px solid var(--border)', borderRadius: '0.5rem',
                background: 'transparent', color: 'var(--foreground)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}>
                <Download size={14} /> Download All Results
              </button>
            )}
          </div>
        </div>

        {/* Batch Upload Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>
                Batch Images ({batchFiles.length})
              </label>
              {batchFiles.length > 0 && !running && (
                <button onClick={clearAllFiles} style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear all
                </button>
              )}
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `2px dashed ${dragging ? 'var(--foreground)' : 'var(--border)'}`,
                borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center',
                background: dragging ? 'var(--surface-2)' : 'transparent',
                marginBottom: batchFiles.length > 0 ? '1rem' : '0', transition: 'all 0.2s',
                pointerEvents: running ? 'none' : 'auto', opacity: running ? 0.6 : 1
              }}
            >
              <div style={{ pointerEvents: 'none' }}>
                <Upload size={24} style={{ margin: '0 auto 0.5rem', color: 'var(--muted-foreground)' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', fontWeight: 500, marginBottom: '0.25rem' }}>Drop images here</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>or click to browse</p>
              </div>
              <label style={{
                padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '0.375rem',
                cursor: 'pointer', fontSize: '0.8125rem', background: 'var(--background)', color: 'var(--foreground)'
              }}>
                <input type="file" multiple accept="image/*" onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} disabled={running} />
                Browse Files
              </label>
            </div>

            {batchFiles.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {batchFiles.map(job => (
                  <div key={job.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem',
                    border: '1px solid var(--border)', borderRadius: '0.5rem', background: 'var(--surface-2)'
                  }}>
                    {job.preview && (
                      <img src={job.preview} alt={job.filename} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.375rem', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.filename}
                      </p>
                      {/* Using standard HTML progress element for better accessibility/animation */}
                      {job.status === 'processing' && (
                        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '0.25rem', overflow: 'hidden' }}>
                           <div style={{ height: '100%', width: '100%', background: 'var(--foreground)', borderRadius: '2px', animation: 'progress-indeterminate 1s ease-in-out infinite' }} />
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {job.status === 'pending' && <Clock size={14} style={{ color: 'var(--muted-foreground)' }} />}
                      {/* FIX: Replaced broken inline keyframe spinner with standard Lucide icon */}
                      {job.status === 'processing' && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                      {job.status === 'done' && <CheckCircle size={14} color="#22c55e" />}
                      {job.status === 'failed' && <AlertCircle size={14} color="#ef4444" />}
                      {job.status === 'pending' && !running && (
                        <button onClick={() => removeFile(job.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', padding: '0.125rem' }}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
