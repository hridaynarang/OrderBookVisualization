import { useState } from "react";
import UploadCSV from "./UploadCSV";
import OrderBookPlayer from "./OrderBookPlayer";

export default function App() {
  const [hasData, setHasData] = useState(false);

  if (!hasData) {
    return <UploadCSV onUploadComplete={() => setHasData(true)} />;
  }

  return (
    <div>
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => setHasData(false)}
          style={{
            padding: "6px 12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload New File
        </button>
      </div>
      <OrderBookPlayer />
    </div>
  );
}
