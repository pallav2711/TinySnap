export default function Header() {
  return (
    <header className="ts-header">
      <div className="ts-container ts-header-inner">
        <div className="ts-brand">
          <div className="ts-logo">TS</div>
          <div className="ts-brand-text">
            <h1>TinySnap</h1>
            <span>Compress & Resize Images — Private & Fast</span>
          </div>
        </div>
        <nav className="ts-nav">
          <a href="#how">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#footer">Contact</a>
        </nav>
      </div>
    </header>
  );
}
