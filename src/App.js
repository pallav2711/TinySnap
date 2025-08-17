import { useMemo, useState } from "react";
import Header from "./components/Header";
import Uploader from "./components/Uploader";
import ControlsPanel from "./components/ControlsPanel";
import ImageCard from "./components/ImageCard";
import Footer from "./components/Footer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { compressOnce, compressToTarget } from "./utils/compress";
import { sanitizeFileName } from "./utils/format";

export default function App() {
  const [items, setItems] = useState([]); // {id, file, previewUrl, origWidth, origHeight, processed?, progress}
  const [busy, setBusy] = useState(false);

  // Controls
  const [mode, setMode] = useState("quality"); // quality | target
  const [quality, setQuality] = useState(0.8);
  const [outFormat, setOutFormat] = useState("auto");
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [keepAspect, setKeepAspect] = useState(true);

  const [useMB, setUseMB] = useState(false);
  const [targetKB, setTargetKB] = useState(400);
  const [targetMB, setTargetMB] = useState(0.4);

  const targetSizeKB = useMemo(() => (useMB ? Math.round(targetMB * 1024) : targetKB), [useMB, targetKB, targetMB]);

  function addFiles(files) {
    const newOnes = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      origWidth: 0,
      origHeight: 0,
      processed: null,
      progress: 0,
    }));

    // Measure original dimensions async
    newOnes.forEach((it) => {
      const img = new Image();
      img.onload = () => {
        setItems((prev) => prev.map(p => p.id === it.id ? { ...p, origWidth: img.width, origHeight: img.height } : p));
        URL.revokeObjectURL(img.src);
      };
      img.src = it.previewUrl;
    });

    setItems((prev) => [...newOnes, ...prev]);
  }

  async function processAll() {
    if (!items.length) return;
    setBusy(true);

    try {
      const updated = [];
      for (const item of items) {
        let result;
        if (mode === "quality") {
          setItems((prev) => prev.map(p => p.id === item.id ? { ...p, progress: 20 } : p));
          result = await compressOnce({
            file: item.file,
            quality,
            format: outFormat,
            targetWidth: width,
            targetHeight: height,
            keepAspect,
          });
          setItems((prev) => prev.map(p => p.id === item.id ? { ...p, progress: 100 } : p));
        } else {
          result = await compressToTarget({
            file: item.file,
            targetKB: targetSizeKB,
            startQuality: 0.9,
            minQuality: 0.25,
            downscaleStep: 0.9,
            format: outFormat,
            targetWidth: width,
            targetHeight: height,
            keepAspect,
            onProgress: (prog) => setItems((prev) => prev.map(p => p.id === item.id ? { ...p, progress: prog } : p)),
          });
        }

        const outName = sanitizeFileName(item.file.name, (result.mime || "image/jpeg").split("/")[1].replace("jpeg", "jpg"));
        const url = URL.createObjectURL(result.blob);
        updated.push({
          ...item,
          processed: {
            blob: result.blob,
            url,
            width: result.width,
            height: result.height,
            size: result.blob.size,
            name: outName,
          },
          progress: 100,
        });
      }
      setItems(updated);
    } finally {
      setBusy(false);
    }
  }

  function downloadOne(item) {
    if (!item.processed) return;
    saveAs(item.processed.blob, item.processed.name);
  }

  async function downloadAllZip() {
    const zip = new JSZip();
    items.forEach((it, idx) => {
      if (it.processed) {
        const name = it.processed.name || `tinysnap-${idx + 1}.jpg`;
        zip.file(name, it.processed.blob);
      }
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "tinysnap-images.zip");
  }

  function removeOne(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  function clearAll() {
    setItems([]);
  }

  const hasProcessed = items.some((i) => i.processed);

  return (
    <>
      <Header />

      <main className="ts-main">
        <section className="ts-hero ts-container">
          <h2>Pixel-perfect compression. Zero uploads.</h2>
          <p>Drag & drop your images and choose <b>Quality</b> or an exact <b>Target Size</b> in KB/MB. Batch process and download as ZIP — all privately in your browser.</p>
        </section>

        <div className="ts-container">
          <Uploader onFiles={addFiles} />

          <ControlsPanel
            mode={mode} setMode={setMode}
            quality={quality} setQuality={setQuality}
            targetKB={targetKB} setTargetKB={setTargetKB}
            targetMB={targetMB} setTargetMB={setTargetMB}
            useMB={useMB} setUseMB={setUseMB}
            outFormat={outFormat} setOutFormat={setOutFormat}
            width={width} setWidth={setWidth}
            height={height} setHeight={setHeight}
            keepAspect={keepAspect} setKeepAspect={setKeepAspect}
            onProcessAll={processAll}
            disabled={!items.length || busy}
          />

          {/* Ad slot placeholder */}
          <div className="ts-ad-slot" aria-label="ad">
            {/* After AdSense approval, place <ins class="adsbygoogle">…</ins> here */}
          </div>

          <section className="ts-actions-bar">
            {items.length > 0 && (
              <>
                <button className="ts-btn" onClick={clearAll} disabled={busy}>Clear All</button>
                <span className="ts-muted">{items.length} file(s) queued</span>
              </>
            )}
            {hasProcessed && (
              <button className="ts-btn ts-btn-success" onClick={downloadAllZip} disabled={busy}>
                Download All (ZIP)
              </button>
            )}
          </section>

          <section className="ts-grid">
            {items.map((it) => (
              <ImageCard key={it.id} item={it} onDownload={downloadOne} onRemove={removeOne} />
            ))}
            {items.length === 0 && (
              <div className="ts-empty">No files yet. Drop some images above to begin.</div>
            )}
          </section>

          <section id="how" className="ts-info">
            <h3>How it works</h3>
            <ul>
              <li>All processing happens locally in your browser with HTML5 Canvas.</li>
              <li>“Target Size” mode iteratively adjusts <i>quality</i> and <i>dimensions</i> to hit your KB/MB goal.</li>
              <li>Choose <b>JPEG</b> or <b>WEBP</b> for smaller files. PNG is lossless and ignores “quality”.</li>
            </ul>
          </section>

          <section id="faq" className="ts-info">
            <h3>FAQ</h3>
            <p><b>Is TinySnap free?</b> Yes. We may show ads to keep it free.</p>
            <p><b>Are my images uploaded?</b> No. Everything runs on your device — nothing is sent to any server.</p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
