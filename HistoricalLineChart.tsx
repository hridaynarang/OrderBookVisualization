import { useMemo, memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

interface HistoricalLineChartProps {
  data: OrderBookSnapshot[];
}

// Color palette for bid levels (green shades, darkest for best bid)
const bidColors = [
  "#006400", // dark green - best bid
  "#228B22",
  "#2E8B57",
  "#3CB371",
  "#66CDAA",
  "#90EE90",
  "#98FB98",
  "#ADFF2F",
  "#C1FFC1",
  "#E0FFE0", // light green - worst bid
];

// Color palette for ask levels (red shades, darkest for best ask)
const askColors = [
  "#8B0000", // dark red - best ask
  "#B22222",
  "#CD5C5C",
  "#DC143C",
  "#F08080",
  "#FA8072",
  "#FFA07A",
  "#FFB6C1",
  "#FFC0CB",
  "#FFE4E1", // light red - worst ask
];

const HistoricalLineChart = memo(function HistoricalLineChart({
  data,
}: HistoricalLineChartProps) {
  // Memoize chart data transformation - expensive operation with ~10k items
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Transform data for stacked area chart
    // Each point will have bid and ask prices at each level
    return data.map((snapshot, idx) => {
      const point: Record<string, number> = {
        tickIndex: snapshot.tickIndex,
        displayIndex: idx,
      };

      // Add bid prices (we show prices, not volumes, for the stacked view)
      for (let i = 0; i < 10; i++) {
        point[`bidPrice${i}`] = snapshot.bids[i]?.price || 0;
      }

      // Add ask prices
      for (let i = 0; i < 10; i++) {
        point[`askPrice${i}`] = snapshot.asks[i]?.price || 0;
      }

      return point;
    });
  }, [data]);

  // Memoize price domain calculation
  const { minPrice, maxPrice } = useMemo(() => {
    if (!data || data.length === 0) return { minPrice: 0, maxPrice: 100 };

    let min = Infinity;
    let max = -Infinity;

    data.forEach((snapshot) => {
      snapshot.bids.forEach((b) => {
        if (b.price > 0) {
          min = Math.min(min, b.price);
          max = Math.max(max, b.price);
        }
      });
      snapshot.asks.forEach((a) => {
        if (a.price > 0) {
          min = Math.min(min, a.price);
          max = Math.max(max, a.price);
        }
      });
    });

    // Add some padding to the domain
    const pricePadding = (max - min) * 0.05;
    return {
      minPrice: Math.max(0, min - pricePadding),
      maxPrice: max + pricePadding,
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        No historical data available
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Price Levels Over Time
        <span style={{ fontWeight: "normal", fontSize: "12px", marginLeft: "10px", color: "#666" }}>
          (10 levels each side)
        </span>
      </h3>
      <ResponsiveContainer width="100%" height="90%" minHeight={350}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="displayIndex"
            tickFormatter={(v) => {
              const tick = chartData[v]?.tickIndex;
              return tick !== undefined ? tick.toLocaleString() : "";
            }}
            label={{ value: "Time Snapshot", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={(v) => `$${v.toFixed(3)}`}
            label={{ value: "Price Levels", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name.startsWith("bid")) return [`$${value.toFixed(4)}`, name.replace("Price", " Level ")];
              if (name.startsWith("ask")) return [`$${value.toFixed(4)}`, name.replace("Price", " Level ")];
              return [value, name];
            }}
            labelFormatter={(label) => `Tick: ${chartData[label]?.tickIndex?.toLocaleString() || label}`}
          />

          {/* Bid levels - stacked areas (green shades) */}
          {[...Array(10)].map((_, i) => (
            <Area
              key={`bid${i}`}
              type="monotone"
              dataKey={`bidPrice${i}`}
              stackId="bids"
              stroke={bidColors[i]}
              fill={bidColors[i]}
              fillOpacity={0.6}
              name={`bidPrice${i}`}
            />
          ))}

          {/* Ask levels - stacked areas (red shades) */}
          {[...Array(10)].map((_, i) => (
            <Area
              key={`ask${i}`}
              type="monotone"
              dataKey={`askPrice${i}`}
              stackId="asks"
              stroke={askColors[i]}
              fill={askColors[i]}
              fillOpacity={0.6}
              name={`askPrice${i}`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", fontSize: "12px" }}>
        <span>
          <span style={{ color: "#228B22", fontWeight: "bold" }}>■</span> Bid Levels
        </span>
        <span>
          <span style={{ color: "#DC143C", fontWeight: "bold" }}>■</span> Ask Levels
        </span>
      </div>
    </div>
  );
});

export default HistoricalLineChart;
