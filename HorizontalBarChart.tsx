import { useMemo, memo } from "react";

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

interface HorizontalBarChartProps {
  snapshot: OrderBookSnapshot | null;
}

const HorizontalBarChart = memo(function HorizontalBarChart({ snapshot }: HorizontalBarChartProps) {
  // Memoize chart data and max size
  const { chartData, maxSize } = useMemo(() => {
    if (!snapshot) return { chartData: [], maxSize: 1 };

    // Combine bids and asks into a single dataset
    const allPrices = new Set<number>();
    snapshot.bids.forEach((b) => allPrices.add(b.price));
    snapshot.asks.forEach((a) => allPrices.add(a.price));

    // Create maps for quick lookup
    const bidMap = new Map(snapshot.bids.map((b) => [b.price, b.size]));
    const askMap = new Map(snapshot.asks.map((a) => [a.price, a.size]));

    // Sort prices descending (highest price at top)
    const sortedPrices = Array.from(allPrices).sort((a, b) => b - a);

    // Calculate max size for scaling
    const max = Math.max(
      ...snapshot.bids.map((b) => b.size),
      ...snapshot.asks.map((a) => a.size),
      1
    );

    // Build chart data
    const data = sortedPrices.map((price) => ({
      price,
      bidSize: bidMap.get(price) || 0,
      askSize: askMap.get(price) || 0,
    }));

    return { chartData: data, maxSize: max };
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "400px", display: "flex", flexDirection: "column" }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px", flexShrink: 0 }}>
        Order Book Depth
        {snapshot.midPrice > 0 && (
          <span style={{ fontWeight: "normal", fontSize: "14px", marginLeft: "10px", color: "#666" }}>
            Mid: ${snapshot.midPrice.toFixed(4)}
          </span>
        )}
      </h3>

      {/* Chart container */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", padding: "0 10px" }}>
          {chartData.map(({ price, bidSize, askSize }) => (
            <div
              key={price}
              style={{
                display: "flex",
                height: "18px",
                alignItems: "center",
              }}
            >
              {/* Bid bar - grows from center to left */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", paddingRight: "4px" }}>
                <div
                  style={{
                    width: `${(bidSize / maxSize) * 100}%`,
                    backgroundColor: "#28a745",
                    height: "14px",
                    borderRadius: "2px 0 0 2px",
                  }}
                />
              </div>

              {/* Price label */}
              <div
                style={{
                  width: "70px",
                  textAlign: "center",
                  fontSize: "10px",
                  fontFamily: "monospace",
                  color: "#333",
                  flexShrink: 0,
                }}
              >
                ${price.toFixed(2)}
              </div>

              {/* Ask bar - grows from center to right */}
              <div style={{ flex: 1, paddingLeft: "4px" }}>
                <div
                  style={{
                    width: `${(askSize / maxSize) * 100}%`,
                    backgroundColor: "#dc3545",
                    height: "14px",
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "12px", paddingTop: "10px", flexShrink: 0 }}>
        <span>
          <span style={{ color: "#28a745", fontWeight: "bold" }}>■</span> Bids (Buy)
        </span>
        <span>
          <span style={{ color: "#dc3545", fontWeight: "bold" }}>■</span> Asks (Sell)
        </span>
      </div>
    </div>
  );
});

export default HorizontalBarChart;
