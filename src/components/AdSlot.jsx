import { useEffect } from "react";

export default function AdSlot({ adSlotId, style }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div style={{ width: "100%", textAlign: "center", margin: "20px 0", ...style }}>
      <ins className="adsbygoogle"
           style={{ display: "block" }}
           data-ad-client="ca-pub-7930528160249032"
           data-ad-slot={adSlotId}
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
