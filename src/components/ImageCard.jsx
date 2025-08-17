import { formatBytes } from "../utils/format";

export default function ImageCard({ item, onDownload, onRemove }) {
  return (
    <div className="ts-card">
      <div className="ts-card-cols">
        <figure className="ts-fig">
          <img src={item.previewUrl} alt={item.file.name} />
          <figcaption className="ts-cap">
            Original • {item.origWidth}×{item.origHeight} • {formatBytes(item.file.size)}
          </figcaption>
        </figure>

        <figure className="ts-fig">
          {item.progress < 100 && item.progress > 0 && (
            <div className="ts-progress">
              <div className="ts-progress-bar" style={{ width: `${item.progress}%` }} />
            </div>
          )}

          {item.processed?.url ? (
            <img src={item.processed.url} alt={"processed-"+item.file.name}/>
          ) : (
            <div className="ts-placeholder">
              {item.progress === 0 ? "Not processed yet" : "Processing…"}
            </div>
          )}

          <figcaption className="ts-cap">
            {item.processed
              ? <>Output • {item.processed.width}×{item.processed.height} • {formatBytes(item.processed.size)}</>
              : "—"}
          </figcaption>
        </figure>
      </div>

      <div className="ts-card-actions">
        {item.processed?.url && (
          <button className="ts-btn ts-btn-success" onClick={() => onDownload(item)}>
            Download
          </button>
        )}
        <button className="ts-btn" onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    </div>
  );
}
