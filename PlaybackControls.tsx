import { memo } from "react";

interface PlaybackControlsProps {
  frame: number;
  totalFrames: number;
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onAdvance100: () => void;
  onReverse100: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (frame: number) => void;
}

const PlaybackControls = memo(function PlaybackControls({
  frame,
  totalFrames,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStop,
  onAdvance100,
  onReverse100,
  onSpeedChange,
  onSeek,
}: PlaybackControlsProps) {
  const buttonStyle = {
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold" as const,
    fontSize: "14px",
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Main Controls */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
        {/* Play/Pause Button */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          style={{
            ...buttonStyle,
            backgroundColor: isPlaying ? "#ffc107" : "#28a745",
            color: isPlaying ? "#000" : "#fff",
          }}
        >
          {isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          style={{
            ...buttonStyle,
            backgroundColor: "#dc3545",
            color: "#fff",
          }}
        >
          ⏹ Stop
        </button>

        {/* Reverse 100 Button */}
        <button
          onClick={onReverse100}
          disabled={frame < 100}
          style={{
            ...buttonStyle,
            backgroundColor: frame < 100 ? "#ccc" : "#6c757d",
            color: "#fff",
            cursor: frame < 100 ? "not-allowed" : "pointer",
          }}
        >
          ◀◀ -100
        </button>

        {/* Advance 100 Button */}
        <button
          onClick={onAdvance100}
          disabled={frame >= totalFrames - 100}
          style={{
            ...buttonStyle,
            backgroundColor: frame >= totalFrames - 100 ? "#ccc" : "#6c757d",
            color: "#fff",
            cursor: frame >= totalFrames - 100 ? "not-allowed" : "pointer",
          }}
        >
          +100 ▶▶
        </button>

        {/* Speed Selector */}
        <label style={{ display: "flex", alignItems: "center", gap: "5px", marginLeft: "8px" }}>
          Speed:
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc" }}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
            <option value={10}>10x</option>
          </select>
        </label>

        {/* Frame Counter */}
        <span style={{ marginLeft: "auto", color: "#666", fontFamily: "monospace" }}>
          Frame: {(frame + 1).toLocaleString()} / {totalFrames.toLocaleString()}
        </span>
      </div>

      {/* Timeline Scrubber */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "12px", color: "#666" }}>0</span>
        <input
          type="range"
          min={0}
          max={totalFrames - 1}
          value={frame}
          onChange={(e) => onSeek(Number(e.target.value))}
          style={{ flex: 1, cursor: "pointer" }}
        />
        <span style={{ fontSize: "12px", color: "#666" }}>{totalFrames.toLocaleString()}</span>
      </div>
    </div>
  );
});

export default PlaybackControls;
