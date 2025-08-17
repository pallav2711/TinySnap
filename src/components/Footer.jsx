export default function Footer() {
  return (
    <footer id="footer" className="ts-footer">
      <div className="ts-container ts-footer-inner">
        <div>
          <div className="ts-logo small">TS</div>
          <div className="ts-muted">© {new Date().getFullYear()} TinySnap</div>
        </div>
        <div className="ts-muted">
          Built for privacy • images never leave your browser
        </div>
      </div>
    </footer>
  );
}
