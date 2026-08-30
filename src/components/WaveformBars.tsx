"use client";

const HEIGHTS = [0.4, 0.65, 0.9, 0.5, 1, 0.6, 0.8, 0.35, 0.7, 0.95, 0.45, 0.6, 0.85, 0.5, 0.75, 0.4];

export function WaveformBars({
  active = false,
  heightClassName = "h-10",
  className = "",
}: {
  active?: boolean;
  heightClassName?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-end gap-[3px] ${heightClassName} ${className}`} aria-hidden="true">
      {HEIGHTS.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-accent origin-bottom"
          style={{
            height: "100%",
            transform: active ? undefined : `scaleY(${h})`,
            animation: active
              ? `eq-bar ${0.7 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite`
              : undefined,
            opacity: active ? 1 : 0.55,
          }}
        />
      ))}
    </div>
  );
}
