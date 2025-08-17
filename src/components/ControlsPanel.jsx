import { useState } from "react";

export default function ControlsPanel({
  mode, setMode,
  quality, setQuality,
  targetKB, setTargetKB,
  targetMB, setTargetMB,
  useMB, setUseMB,
  outFormat, setOutFormat,
  width, setWidth,
  height, setHeight,
  keepAspect, setKeepAspect,
  onProcessAll,
  disabled
}) {
  return (
    <section className="ts-controls">
      <div className="ts-controls-row">
        <div className="ts-field">
          <label>Compression Mode</label>
          <div className="ts-segment">
            <button
              className={mode === "quality" ? "active" : ""}
              onClick={() => setMode("quality")}
            >By Quality</button>
            <button
              className={mode === "target" ? "active" : ""}
              onClick={() => setMode("target")}
            >By Target Size</button>
          </div>
        </div>

        <div className="ts-field">
          <label>Format</label>
          <select value={outFormat} onChange={(e)=>setOutFormat(e.target.value)}>
            <option value="auto">Auto</option>
            <option value="jpeg">JPEG</option>
            <option value="webp">WEBP</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>

      {mode === "quality" ? (
        <div className="ts-controls-row">
          <div className="ts-field">
            <label>Quality: <b>{Math.round(quality*100)}%</b></label>
            <input type="range" min="0.2" max="1" step="0.05" value={quality}
                   onChange={(e)=>setQuality(Number(e.target.value))}/>
            <div className="ts-help">Higher = better quality, larger file. PNG ignores quality.</div>
          </div>
        </div>
      ) : (
        <div className="ts-controls-row">
          <div className="ts-field">
            <label>Target Size</label>
            <div className="ts-input-group">
              {!useMB ? (
                <input type="number" min="10" step="10" value={targetKB}
                       onChange={(e)=>setTargetKB(Number(e.target.value) || 0)} />
              ) : (
                <input type="number" min="0.05" step="0.05" value={targetMB}
                       onChange={(e)=>setTargetMB(Number(e.target.value) || 0)} />
              )}
              <button className="ts-toggle" onClick={()=>setUseMB(!useMB)}>
                {useMB ? "MB" : "KB"}
              </button>
            </div>
            <div className="ts-help">TinySnap will iteratively adjust quality and dimensions to meet your size.</div>
          </div>
        </div>
      )}

      <div className="ts-controls-row">
        <div className="ts-field">
          <label>Resize (optional)</label>
          <div className="ts-grid-2">
            <input type="number" placeholder="Width (px)" min="1"
                   value={width ?? ""} onChange={(e)=>setWidth(e.target.value ? Number(e.target.value) : null)}/>
            <input type="number" placeholder="Height (px)" min="1"
                   value={height ?? ""} onChange={(e)=>setHeight(e.target.value ? Number(e.target.value) : null)}/>
          </div>
          <label className="ts-check">
            <input type="checkbox" checked={keepAspect} onChange={(e)=>setKeepAspect(e.target.checked)} />
            Keep aspect ratio
          </label>
        </div>

        <div className="ts-field ts-actions">
          <button className="ts-btn ts-btn-primary" disabled={disabled} onClick={onProcessAll}>
            {disabled ? "Processing…" : "Process All"}
          </button>
        </div>
      </div>
    </section>
  );
}
