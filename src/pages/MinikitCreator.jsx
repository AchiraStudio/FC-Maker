// src/pages/MinikitCreator.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Download, Loader2, AlertCircle, X, Layers, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

// ---------- Helper: Generate shape path ----------
const getShapePath = (ctx, shape, width, height, ovalWidth, ovalHeight) => {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  switch (shape) {
    case 'square':
      ctx.rect(10, 10, width - 20, height - 20);
      break;
    case 'circle':
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      break;
    case 'hexagon': {
      const sides = 6;
      const angle = (Math.PI * 2) / sides;
      const startAngle = -Math.PI / 2;
      for (let i = 0; i <= sides; i++) {
        const x = centerX + radius * Math.cos(startAngle + i * angle);
        const y = centerY + radius * Math.sin(startAngle + i * angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      break;
    }
    case 'octagon': {
      const sides = 8;
      const angle = (Math.PI * 2) / sides;
      const startAngle = -Math.PI / 8;
      for (let i = 0; i <= sides; i++) {
        const x = centerX + radius * Math.cos(startAngle + i * angle);
        const y = centerY + radius * Math.sin(startAngle + i * angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      break;
    }
    case 'vertical-oval':
      ctx.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, 2 * Math.PI);
      break;
    default:
      ctx.rect(10, 10, width - 20, height - 20);
  }
};

// ---------- Helper: Resize image to fixed square (1024x1024) ----------
const resizeToSquare = (img, targetSize = 1024) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, targetSize, targetSize);
    ctx.drawImage(img, 0, 0, targetSize, targetSize);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const normalizedImg = new Image();
      normalizedImg.onload = () => {
        URL.revokeObjectURL(url);
        resolve(normalizedImg);
      };
      normalizedImg.src = url;
    }, 'image/png');
  });
};

// ---------- Main Component ----------
export default function MinikitCreator() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [batchApply, setBatchApply] = useState(false);
  const fileInputRef = useRef(null);

  const [editor, setEditor] = useState({
    normalizedImage: null,  // 1024x1024 version
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    shape: 'square',
    borderWidth: 5,
    borderColor: '#ffffff',
    ovalWidth: 200,
    ovalHeight: 400,
  });
  const canvasRef = useRef(null);

  const addLog = (msg) => setLogs(prev => [`• ${msg}`, ...prev]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter(f => f.type.includes('image'));
    if (validFiles.length !== files.length) {
      addLog('⚠️ Some files were skipped (non‑image).');
    }

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      processed: false,
      outputBlob: null,
      normalizedImage: null, // will be set when editing
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(f => addLog(`📁 Uploaded: ${f.name}`));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    addLog('🗑️ Cleared all files.');
  };

  // Load and normalize image to 1024x1024
  const loadAndNormalize = (fileObj) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const normalized = await resizeToSquare(img, 1024);
        resolve(normalized);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(fileObj.file);
    });
  };

  const openEditor = async (index) => {
    const fileObj = uploadedFiles[index];
    let normalized = fileObj.normalizedImage;
    if (!normalized) {
      normalized = await loadAndNormalize(fileObj);
      // Cache it
      const newFiles = [...uploadedFiles];
      newFiles[index] = { ...fileObj, normalizedImage: normalized };
      setUploadedFiles(newFiles);
    }
    setEditor({
      normalizedImage: normalized,
      scale: 1,
      offsetX: 0,
      offsetY: 0,
      shape: 'square',
      borderWidth: 5,
      borderColor: '#ffffff',
      ovalWidth: 200,
      ovalHeight: 400,
    });
    setEditingIndex(index);
    setBatchApply(false);
  };

  const closeEditor = () => {
    setEditingIndex(null);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !editor.normalizedImage) return;
    const ctx = canvas.getContext('2d');
    const w = 1024, h = 1024;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.beginPath();
    getShapePath(ctx, editor.shape, w, h, editor.ovalWidth, editor.ovalHeight);
    ctx.clip();

    const img = editor.normalizedImage;
    // Base size is 1024, so scale=1 means draw at 1024x1024
    const drawW = 1024 * editor.scale;
    const drawH = 1024 * editor.scale;
    const x = (w - drawW) / 2 + editor.offsetX;
    const y = (h - drawH) / 2 + editor.offsetY;
    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();

    ctx.beginPath();
    getShapePath(ctx, editor.shape, w, h, editor.ovalWidth, editor.ovalHeight);
    ctx.strokeStyle = editor.borderColor;
    ctx.lineWidth = editor.borderWidth;
    ctx.stroke();
  };

  useEffect(() => {
    if (editingIndex !== null && editor.normalizedImage) {
      drawCanvas();
    }
  }, [editor, editingIndex]);

  const updateEditor = (updates) => {
    setEditor(prev => ({ ...prev, ...updates }));
  };

  // Apply current settings to a specific image's normalized version
  const applyToNormalizedImage = async (normalizedImg, settings) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.save();
      ctx.beginPath();
      getShapePath(ctx, settings.shape, 1024, 1024, settings.ovalWidth, settings.ovalHeight);
      ctx.clip();
      const drawW = 1024 * settings.scale;
      const drawH = 1024 * settings.scale;
      const x = (1024 - drawW) / 2 + settings.offsetX;
      const y = (1024 - drawH) / 2 + settings.offsetY;
      ctx.drawImage(normalizedImg, x, y, drawW, drawH);
      ctx.restore();
      ctx.beginPath();
      getShapePath(ctx, settings.shape, 1024, 1024, settings.ovalWidth, settings.ovalHeight);
      ctx.strokeStyle = settings.borderColor;
      ctx.lineWidth = settings.borderWidth;
      ctx.stroke();
      canvas.toBlob(resolve, 'image/png');
    });
  };

  const saveCurrentEdit = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    
    let newFiles = [...uploadedFiles];
    newFiles[editingIndex] = {
      ...newFiles[editingIndex],
      processed: true,
      outputBlob: blob,
    };
    
    if (batchApply) {
      addLog(`🔄 Batch applying current settings to all other images...`);
      const settings = {
        shape: editor.shape,
        borderWidth: editor.borderWidth,
        borderColor: editor.borderColor,
        scale: editor.scale,
        offsetX: editor.offsetX,
        offsetY: editor.offsetY,
        ovalWidth: editor.ovalWidth,
        ovalHeight: editor.ovalHeight,
      };
      const promises = [];
      for (let i = 0; i < newFiles.length; i++) {
        if (i !== editingIndex && newFiles[i].normalizedImage) {
          promises.push(
            (async () => {
              try {
                const newBlob = await applyToNormalizedImage(newFiles[i].normalizedImage, settings);
                newFiles[i] = {
                  ...newFiles[i],
                  processed: true,
                  outputBlob: newBlob,
                };
                addLog(`   ✓ Batch applied to ${newFiles[i].name}`);
              } catch (err) {
                addLog(`   ❌ Failed to apply to ${newFiles[i].name}: ${err.message}`);
              }
            })()
          );
        } else if (i !== editingIndex && !newFiles[i].normalizedImage) {
          // Need to load and normalize first
          promises.push(
            (async () => {
              try {
                const normalized = await loadAndNormalize(newFiles[i]);
                newFiles[i] = { ...newFiles[i], normalizedImage: normalized };
                const newBlob = await applyToNormalizedImage(normalized, settings);
                newFiles[i] = {
                  ...newFiles[i],
                  processed: true,
                  outputBlob: newBlob,
                };
                addLog(`   ✓ Batch applied to ${newFiles[i].name}`);
              } catch (err) {
                addLog(`   ❌ Failed to apply to ${newFiles[i].name}: ${err.message}`);
              }
            })()
          );
        }
      }
      await Promise.all(promises);
    }
    
    setUploadedFiles(newFiles);
    addLog(`✅ Saved: ${newFiles[editingIndex].name}${batchApply ? ' (and batch applied to others)' : ''}`);
    closeEditor();
  };

  const reapplyToAll = async () => {
    const settings = {
      shape: editor.shape,
      borderWidth: editor.borderWidth,
      borderColor: editor.borderColor,
      scale: editor.scale,
      offsetX: editor.offsetX,
      offsetY: editor.offsetY,
      ovalWidth: editor.ovalWidth,
      ovalHeight: editor.ovalHeight,
    };
    addLog(`🔄 Re‑applying current settings to ALL images...`);
    let newFiles = [...uploadedFiles];
    const promises = newFiles.map(async (file, idx) => {
      try {
        let normalized = file.normalizedImage;
        if (!normalized) {
          normalized = await loadAndNormalize(file);
        }
        const newBlob = await applyToNormalizedImage(normalized, settings);
        newFiles[idx] = {
          ...file,
          processed: true,
          outputBlob: newBlob,
          normalizedImage: normalized,
        };
        addLog(`   ✓ Re‑applied to ${file.name}`);
      } catch (err) {
        addLog(`   ❌ Failed to re‑apply to ${file.name}: ${err.message}`);
      }
    });
    await Promise.all(promises);
    setUploadedFiles(newFiles);
    addLog(`✅ Re‑apply complete.`);
  };

  const exportAll = async () => {
    const unprocessed = uploadedFiles.filter(f => !f.processed);
    if (unprocessed.length) {
      addLog(`⚠️ Please edit and save ${unprocessed.length} file(s) first.`);
      return;
    }

    setIsProcessing(true);
    addLog(`📦 Packaging ${uploadedFiles.length} minikits...`);

    try {
      const zip = new JSZip();
      const kitsFolder = zip.folder('kits');

      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const finalName = file.name;
        kitsFolder.file(finalName, file.outputBlob);
        addLog(`   Added kits/${finalName}`);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `minikits_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addLog(`✅ Download complete: minikits_${Date.now()}.zip`);
    } catch (err) {
      addLog(`❌ Export error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const NumberInput = ({ value, onChange, min, max, step, label }) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        style={{
          width: '70px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid var(--glass-border)',
          borderRadius: '6px',
          color: '#fff',
          padding: '4px 8px',
          fontSize: '0.85rem',
        }}
      />
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '300', marginBottom: '0.25rem' }}>Minikit Creator</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Upload crests, apply custom border shapes, scale, and position – then export as 1024x1024 PNGs inside a `kits/` folder.
        </p>
      </div>

      <div style={{ background: 'rgba(255, 193, 7, 0.15)', borderLeft: '3px solid #ffc107', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <AlertCircle size={18} color="#ffc107" />
        <span style={{ fontSize: '0.85rem', color: '#ffd966' }}>
          <strong>Naming convention:</strong> Your files must be named <code>j&#123;kit_type&#125;_&#123;teamid&#125;_0.png</code> (e.g., <code>j0_1001_0.png</code>, <code>j3_1001_0.png</code>).<br />
          The filename you upload will be used <strong>exactly as is</strong> – no automatic renaming.
        </span>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <motion.div
            onClick={() => fileInputRef.current.click()}
            whileHover={{ scale: 1.01, borderColor: 'var(--accent-color)', backgroundColor: 'rgba(0, 255, 204, 0.05)' }}
            whileTap={{ scale: 0.99 }}
            style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(0,0,0,0.3)'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/png,image/jpeg,image/webp"
              multiple
              style={{ display: 'none' }}
            />
            <UploadCloud size={48} color={uploadedFiles.length ? "var(--accent-color)" : "var(--text-muted)"} style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
              {uploadedFiles.length ? `${uploadedFiles.length} file(s) selected` : "Upload Images"}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              PNG, JPG, WebP. All images are normalized to 1024x1024 before editing, ensuring consistent behavior.
            </p>
          </motion.div>

          {uploadedFiles.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Uploaded files:</span>
                <button onClick={clearFiles} style={{ background: 'none', border: 'none', color: '#ff6464', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Clear all
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {uploadedFiles.map((file, idx) => (
                  <div key={file.id} style={{ textAlign: 'center', width: '100px' }}>
                    <div
                      onClick={() => openEditor(idx)}
                      style={{
                        width: '80px',
                        height: '80px',
                        background: '#1a1a2a',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: file.processed ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {file.processed ? '✅' : '✏️'}
                    </div>
                    <span style={{ fontSize: '0.7rem', wordBreak: 'break-word' }}>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <motion.button
            whileHover={uploadedFiles.length && !isProcessing ? { scale: 1.01 } : {}}
            whileTap={uploadedFiles.length && !isProcessing ? { scale: 0.98 } : {}}
            className="btn-primary"
            disabled={!uploadedFiles.length || isProcessing}
            onClick={exportAll}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
          >
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isProcessing ? "Packaging..." : "Export All as ZIP"}
          </motion.button>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.9)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={closeEditor}
          >
            <div
              className="glass-panel"
              style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Edit Minikit</h3>
                <button onClick={closeEditor} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <canvas
                  ref={canvasRef}
                  width={1024}
                  height={1024}
                  style={{ width: '400px', height: '400px', border: '1px solid var(--glass-border)', borderRadius: '8px', background: 'checkerboard' }}
                />

                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Shape</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px', flexWrap: 'wrap' }}>
                      {['square', 'circle', 'hexagon', 'octagon', 'vertical-oval'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateEditor({ shape: s })}
                          style={{
                            background: editor.shape === s ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: editor.shape === s ? '#000' : '#fff',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          {s === 'vertical-oval' ? 'Oval' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {editor.shape === 'vertical-oval' && (
                    <>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Oval Width (px)</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input
                            type="range"
                            min="100"
                            max="800"
                            value={editor.ovalWidth}
                            onChange={(e) => updateEditor({ ovalWidth: parseInt(e.target.value) })}
                            style={{ flex: 1 }}
                          />
                          <NumberInput
                            value={editor.ovalWidth}
                            onChange={(v) => updateEditor({ ovalWidth: v })}
                            min={100}
                            max={800}
                            step={5}
                            label="px"
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Oval Height (px)</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input
                            type="range"
                            min="100"
                            max="800"
                            value={editor.ovalHeight}
                            onChange={(e) => updateEditor({ ovalHeight: parseInt(e.target.value) })}
                            style={{ flex: 1 }}
                          />
                          <NumberInput
                            value={editor.ovalHeight}
                            onChange={(v) => updateEditor({ ovalHeight: v })}
                            min={100}
                            max={800}
                            step={5}
                            label="px"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Border Width (px)</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={editor.borderWidth}
                        onChange={(e) => updateEditor({ borderWidth: parseInt(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        value={editor.borderWidth}
                        onChange={(v) => updateEditor({ borderWidth: v })}
                        min={0}
                        max={30}
                        step={1}
                        label="px"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Border Color</label>
                    <input
                      type="color"
                      value={editor.borderColor}
                      onChange={(e) => updateEditor({ borderColor: e.target.value })}
                      style={{ width: '100%', height: '40px', background: 'transparent' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scale</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.01"
                        value={editor.scale}
                        onChange={(e) => updateEditor({ scale: parseFloat(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        value={editor.scale}
                        onChange={(v) => updateEditor({ scale: v })}
                        min={0.5}
                        max={3}
                        step={0.05}
                        label="x"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Horizontal Offset (px)</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        value={editor.offsetX}
                        onChange={(e) => updateEditor({ offsetX: parseInt(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        value={editor.offsetX}
                        onChange={(v) => updateEditor({ offsetX: v })}
                        min={-300}
                        max={300}
                        step={5}
                        label="px"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vertical Offset (px)</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input
                        type="range"
                        min="-300"
                        max="300"
                        value={editor.offsetY}
                        onChange={(e) => updateEditor({ offsetY: parseInt(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <NumberInput
                        value={editor.offsetY}
                        onChange={(v) => updateEditor({ offsetY: v })}
                        min={-300}
                        max={300}
                        step={5}
                        label="px"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <input
                        type="checkbox"
                        id="batchApply"
                        checked={batchApply}
                        onChange={(e) => setBatchApply(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <label htmlFor="batchApply" style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} /> Apply to others
                      </label>
                    </div>
                    <button
                      onClick={reapplyToAll}
                      className="btn-primary"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', borderColor: 'var(--glass-border)' }}
                    >
                      <RefreshCw size={14} /> Reapply to all
                    </button>
                  </div>

                  <button onClick={saveCurrentEdit} className="btn-primary" style={{ marginTop: '1rem' }}>
                    Save & {batchApply ? 'Batch Apply' : 'Close'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.8)' }}>
        <div style={{ fontFamily: 'monospace', color: '#8a8d98', fontSize: '0.85rem', height: '150px', overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '0.5rem', color: log.includes('✅') ? 'var(--accent-color)' : log.includes('❌') ? '#ff6464' : 'inherit' }}>
              {log}
            </div>
          ))}
          {logs.length === 0 && <div style={{ opacity: 0.5 }}>• Upload images, edit each (or batch apply), then export ZIP.</div>}
        </div>
      </div>

      <style>{`
        canvas {
          background-image: repeating-linear-gradient(45deg, #2a2a3a 0px, #2a2a3a 20px, #1a1a2a 20px, #1a1a2a 40px);
        }
      `}</style>
    </div>
  );
}