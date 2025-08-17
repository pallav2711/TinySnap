import { useRef, useState } from "react";

export default function Uploader({ onFiles }) {
  const fileRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const handleSelect = (e) => onFiles(Array.from(e.target.files || []));
  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length) onFiles(files);
  };

  return (
    <section className="ts-uploader">
      <div
        className={`ts-drop ${drag ? "is-drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        aria-label="Upload images"
        tabIndex={0}
      >
        <div className="ts-drop-icon">⬆️</div>
        <div className="ts-drop-text">
          <strong>Drag & drop</strong> your images here<br/>
          <span>or click to browse</span>
          <div className="ts-drop-sub">JPG · PNG · WEBP — multiple files supported</div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          hidden
        />
      </div>
    </section>
  );
}
