interface StatFrameOrnamentProps {
  width: number;
  height: number;
  /** Stroke colour for the frame and corner flourishes. */
  accentColor: string;
  /** Fill behind the content. Defaults to the sheet's dark panel colour. */
  fillColor?: string;
  /** Diagonal corner cut in px. */
  cut?: number;
}

/**
 * The octagonal "traditional D&D sheet" frame ornament, rendered as a
 * standalone, absolutely-positioned SVG with no content slot of its own
 * (Interface Segregation). Callers layer their own content on top, so the
 * ornament is reusable across attribute and combat stat blocks without
 * dictating the content's padding.
 */
export function StatFrameOrnament({
  width,
  height,
  accentColor,
  fillColor = "#12131a",
  cut = 8,
}: StatFrameOrnamentProps) {
  const framePath = `M ${cut} 0 L ${width - cut} 0 L ${width} ${cut} L ${width} ${height - cut} L ${width - cut} ${height} L ${cut} ${height} L 0 ${height - cut} L 0 ${cut} Z`;
  const innerPath = `M ${cut + 3} 3 L ${width - cut - 3} 3 L ${width - 3} ${cut + 3} L ${width - 3} ${height - cut - 3} L ${width - cut - 3} ${height - 3} L ${cut + 3} ${height - 3} L 3 ${height - cut - 3} L 3 ${cut + 3} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={framePath} fill={fillColor} />
      <path d={framePath} fill="none" stroke={accentColor} strokeWidth="1" opacity="0.6" />
      <path d={innerPath} fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
      {/* Corner flourishes */}
      <path d={`M 2 ${cut + 2} L ${cut + 2} 2`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
      <path d={`M ${width - cut - 2} 2 L ${width - 2} ${cut + 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
      <path d={`M 2 ${height - cut - 2} L ${cut + 2} ${height - 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
      <path d={`M ${width - 2} ${height - cut - 2} L ${width - cut - 2} ${height - 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
    </svg>
  );
}
