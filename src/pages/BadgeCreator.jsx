// src/pages/BadgeCreator.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, Download, Loader2, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';

export default function BadgeCreator() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState([]);
  const fileInputRef = useRef(null);

  const addLog = (msg) => setLogs(prev => [`• ${msg}`, ...prev]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = files.filter(f => f.type.includes('image'));
    if (validFiles.length !== files.length) {
      addLog('⚠️ Some files were skipped (non‑image).');
    }
    setUploadedFiles(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      addLog(`📁 Loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    });
  };

  const loadAndValidateImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 512 || img.height < 512) {
            reject(`"${file.name}" too small: ${img.width}x${img.height}. Minimum 512x512px.`);
          } else {
            resolve(img);
          }
        };
        img.onerror = () => reject(`Failed to load "${file.name}".`);
        img.src = e.target.result;
      };
      reader.onerror = () => reject(`Failed to read "${file.name}".`);
      reader.readAsDataURL(file);
    });
  };

  const resizeImageToSquare = (img, targetSize) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, targetSize, targetSize);
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  };

  const blobToImage = (blob) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  const generateBadges = async () => {
    if (!uploadedFiles.length) {
      addLog('⚠️ No images uploaded.');
      return;
    }

    setIsProcessing(true);
    setLogs([]);
    addLog(`🚀 Starting badge generation for ${uploadedFiles.length} image(s)...`);

    try {
      const zip = new JSZip();

      for (const file of uploadedFiles) {
        const teamId = file.name.replace(/\.[^/.]+$/, '');
        addLog(`📌 Processing: ${teamId}`);

        const originalImg = await loadAndValidateImage(file);
        addLog(`✅ ${teamId}: ${originalImg.width}x${originalImg.height} (accepted)`);

        // Always create a 1024x1024 version (upscale if needed)
        const base1024Blob = await resizeImageToSquare(originalImg, 1024);
        const base1024Img = await blobToImage(base1024Blob);

        // Define sizes and their corresponding folder names
        const sizeConfigs = [
          { size: 1024, folder: 'crest1024x1024', useLPrefix: false },
          { size: 512,  folder: 'crest512x512',   useLPrefix: true },
          { size: 256,  folder: 'crest',          useLPrefix: true },
          { size: 50,   folder: 'crest50x50',     useLPrefix: true },
          { size: 32,   folder: 'crest32x32',     useLPrefix: true },
          { size: 16,   folder: 'crest16x16',     useLPrefix: true },
        ];

        for (const cfg of sizeConfigs) {
          let finalBlob;
          if (cfg.size === 1024) {
            finalBlob = base1024Blob;
          } else {
            finalBlob = await resizeImageToSquare(base1024Img, cfg.size);
          }
          const fileName = cfg.useLPrefix ? `l${teamId}.png` : `${teamId}.png`;

          zip.file(`${cfg.folder}/light/${fileName}`, finalBlob);
          zip.file(`${cfg.folder}/dark/${fileName}`, finalBlob);
          addLog(`   📦 Added ${cfg.folder}/{light,dark}/${fileName}`);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badges_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addLog(`✅ Badge pack ready: badges_${Date.now()}.zip`);
    } catch (err) {
      addLog(`❌ Error: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    addLog('🗑️ Cleared all uploaded files.');
  };

  return (
    <div style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '300', marginBottom: '0.25rem' }}>Badge Creator</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Generate game‑ready team crests with transparency, resized to multiple resolutions.
          <br />
          <strong>Minimum image size: 512x512 pixels</strong> – will be upscaled to 1024 if needed.
          <br />
          <strong>Folders:</strong> crest/ (256px), crest16x16/, crest32x32/, crest50x50/, crest512x512/, crest1024x1024/.
          <br />
          <strong>Naming rule:</strong> 1024px files = <code>teamid.png</code>; all smaller sizes = <code>lteamid.png</code>.
        </p>
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
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            <UploadCloud size={48} color={uploadedFiles.length ? "var(--accent-color)" : "var(--text-muted)"} style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: '500', marginBottom: '0.5rem' }}>
              {uploadedFiles.length ? `${uploadedFiles.length} file(s) selected` : "Upload Team Crests"}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              PNG with transparency recommended. Each file's name (without extension) becomes Team ID.<br />
              Minimum size: <strong>512x512 pixels</strong> (will be scaled to 1024 automatically).
            </p>
          </motion.div>

          {uploadedFiles.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Uploaded images:</span>
                <button onClick={clearFiles} style={{ background: 'none', border: 'none', color: '#ff6464', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Clear all
                </button>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', maxHeight: '120px', overflowY: 'auto' }}>
                {uploadedFiles.map((f, idx) => (
                  <li key={idx}>{f.name} ({(f.size / 1024).toFixed(0)} KB)</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ background: 'rgba(255, 100, 100, 0.1)', borderLeft: '3px solid #ff6464', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <AlertCircle size={18} color="#ff6464" />
            <span style={{ fontSize: '0.85rem', color: '#ffaaaa' }}>
              Output is <strong>PNG with transparency</strong>. DDS conversion not available in‑browser – use external tools (TexConv, NVTT) after download.
            </span>
          </div>

          <motion.button
            whileHover={!isProcessing && uploadedFiles.length ? { scale: 1.01 } : {}}
            whileTap={!isProcessing && uploadedFiles.length ? { scale: 0.98 } : {}}
            className="btn-primary"
            disabled={!uploadedFiles.length || isProcessing}
            onClick={generateBadges}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
          >
            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isProcessing ? "Generating badges..." : "Generate & Download ZIP"}
          </motion.button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.8)' }}>
        <div style={{ fontFamily: 'monospace', color: '#8a8d98', fontSize: '0.85rem', height: '150px', overflowY: 'auto' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '0.5rem', color: log.includes('✅') ? 'var(--accent-color)' : log.includes('❌') ? '#ff6464' : 'inherit' }}>
              {log}
            </div>
          ))}
          {logs.length === 0 && <div style={{ opacity: 0.5 }}>• Ready. Upload one or more images (each at least 512x512).</div>}
        </div>
      </div>
    </div>
  );
}