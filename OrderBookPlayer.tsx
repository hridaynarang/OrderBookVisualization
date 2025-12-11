import { useState, useEffect, useMemo, useCallback } from "react";
import PlaybackControls from "./PlaybackControls";
import HorizontalBarChart from "./HorizontalBarChart";
import HistoricalLineChart from "./HistoricalLineChart";

interface PriceLevel {
  price: number;
  size: number;
}

interface OrderBookSnapshot {
  timestamp: number | string;
  tickIndex: number;
  bids: PriceLevel[];
  asks: PriceLevel[];
  midPrice: number;
}

interface OrderBookResponse {
  snapshots: OrderBookSnapshot[];
  totalTicks: number;
  stride: number;
}

export default function OrderBookPlayer() {
  const [data, setData] = useState<OrderBookSnapshot[]>([]);
  const [totalTicks, setTotalTicks] = useState(0);
  const [stride, setStride] = useState(1);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order book data on mount
  useEffect(() => {
    fetch("http://localhost:4000/orderbook")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch data");
        return r.json();
      })
      .then((response: OrderBookResponse) => {
        setData(response.snapshots);
        setTotalTicks(response.totalTicks);
        setStride(response.stride);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Playback logic - uses requestAnimationFrame for smoother updates with accurate timing
  useEffect(() => {
    if (!playing || data.length === 0) return;

    let animationId: number;
    let lastTime = performance.now();
    const msPerFrame = 500 / speed; // Time between frame advances

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastTime;

      if (elapsed >= msPerFrame) {
        // Maintain accuracy by accounting for any extra elapsed time
        lastTime = currentTime - (elapsed % msPerFrame);
        setFrame((f) => {
          const nextFrame = f + stride;
          if (nextFrame >= totalTicks) {
            setPlaying(false);
            return totalTicks - 1;
          }
          return nextFrame;
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [playing, data.length, speed, stride, totalTicks]);

  // Memoize current snapshot calculation
  const currentSnapshot = useMemo((): OrderBookSnapshot | null => {
    if (data.length === 0) return null;
    // Find the snapshot closest to the current frame
    const index = Math.min(Math.floor(frame / stride), data.length - 1);
    return data[index] || null;
  }, [data, frame, stride]);

  // Memoize playback control handlers
  const handlePlay = useCallback(() => setPlaying(true), []);
  const handlePause = useCallback(() => setPlaying(false), []);
  const handleStop = useCallback(() => {
    setPlaying(false);
    setFrame(0);
  }, []);
  const handleAdvance100 = useCallback(() => {
    setFrame((f) => Math.min(f + 100, totalTicks - 1));
  }, [totalTicks]);
  const handleReverse100 = useCallback(() => {
    setFrame((f) => Math.max(f - 100, 0));
  }, []);
  const handleSpeedChange = useCallback((newSpeed: number) => setSpeed(newSpeed), []);
  const handleSeek = useCallback((newFrame: number) => setFrame(newFrame), []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", marginBottom: "10px" }}>Loading order book...</div>
        <div style={{ color: "#666" }}>This may take a moment for large datasets</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#dc3545" }}>
        <div style={{ fontSize: "20px", marginBottom: "10px" }}>Error loading data</div>
        <div>{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "20px" }}>No order book data available</div>
        <div style={{ color: "#666", marginTop: "10px" }}>Please upload a CSV file first</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Order Book Player</h2>

      {/* Playback Controls */}
      <PlaybackControls
        frame={frame}
        totalFrames={totalTicks}
        isPlaying={playing}
        speed={speed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onAdvance100={handleAdvance100}
        onReverse100={handleReverse100}
        onSpeedChange={handleSpeedChange}
        onSeek={handleSeek}
      />

      {/* Current Order Info */}
      {currentSnapshot && (
        <div
          style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            display: "flex",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong>Tick:</strong> {currentSnapshot.tickIndex.toLocaleString()}
          </div>
          <div>
            <strong>Mid Price:</strong>{" "}
            <span style={{ color: "#007bff", fontFamily: "monospace" }}>
              ${currentSnapshot.midPrice.toFixed(4)}
            </span>
          </div>
          <div>
            <strong>Best Bid:</strong>{" "}
            <span style={{ color: "#28a745", fontFamily: "monospace" }}>
              ${currentSnapshot.bids[0]?.price.toFixed(4) || "N/A"} ({currentSnapshot.bids[0]?.size.toLocaleString() || 0})
            </span>
          </div>
          <div>
            <strong>Best Ask:</strong>{" "}
            <span style={{ color: "#dc3545", fontFamily: "monospace" }}>
              ${currentSnapshot.asks[0]?.price.toFixed(4) || "N/A"} ({currentSnapshot.asks[0]?.size.toLocaleString() || 0})
            </span>
          </div>
          <div>
            <strong>Spread:</strong>{" "}
            <span style={{ fontFamily: "monospace" }}>
              {currentSnapshot.bids[0] && currentSnapshot.asks[0]
                ? `$${(currentSnapshot.asks[0].price - currentSnapshot.bids[0].price).toFixed(4)}`
                : "N/A"}
            </span>
          </div>
        </div>
      )}

      {/* Charts Side by Side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        {/* Historical Line Chart */}
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", minHeight: "450px", position: "relative" }}>
          <HistoricalLineChart data={data} />
          {/* Position indicator overlay - renders outside Recharts for performance */}
          <div
            style={{
              position: "absolute",
              top: "55px",
              bottom: "45px",
              left: `calc(75px + ${(frame / totalTicks) * (100 - 13)}%)`,
              width: "2px",
              backgroundColor: "#333",
              pointerEvents: "none",
              zIndex: 10,
            }}
          />
        </div>

        {/* Horizontal Bar Chart */}
        <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", minHeight: "450px" }}>
          <HorizontalBarChart snapshot={currentSnapshot} />
        </div>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#666",
        }}
      >
        <strong>Data Summary:</strong> {totalTicks.toLocaleString()} total ticks
        {stride > 1 && ` (showing ${data.length.toLocaleString()} samples, stride: ${stride})`}
      </div>
    </div>
  );
}
