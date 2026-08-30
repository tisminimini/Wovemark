/**
 * Pure SVG Chart Generator for Wovemark (Zero dependencies)
 */

export function renderSvgChart(
  type: "line" | "bar" | "area" | "pie" | "donut" = "line",
  data: Array<{ label: string; value: number } | number>,
  options: { width?: number; height?: number; color?: string } = {}
): string {
  const width = options.width || 600;
  const height = options.height || 260;
  const color = options.color || "var(--wm-color-accent)";

  // Normalize data
  const normalized: Array<{ label: string; value: number }> = data.map((item, idx) => {
    if (typeof item === "number") {
      return { label: `Pt ${idx + 1}`, value: item };
    }
    return item;
  });

  if (normalized.length === 0) {
    return `<div class="wm-empty-chart" style="height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--wm-text-muted)">No data available</div>`;
  }

  const values = normalized.map((d) => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = Math.min(0, ...values);
  const range = maxVal - minVal || 1;

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (type === "bar") {
    const barWidth = Math.max(12, Math.min(48, (chartW / normalized.length) * 0.6));
    const step = chartW / normalized.length;

    const bars = normalized
      .map((d, i) => {
        const x = padding.left + i * step + (step - barWidth) / 2;
        const barH = ((d.value - minVal) / range) * chartH;
        const y = padding.top + chartH - barH;
        return `
        <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="${color}" opacity="0.9" />
        <text x="${(x + barWidth / 2).toFixed(1)}" y="${(height - 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--wm-text-muted)">${d.label}</text>
      `;
      })
      .join("\n");

    return `
      <svg class="wm-chart-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="overflow:visible">
        <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="var(--wm-border)" stroke-width="1" />
        ${bars}
      </svg>
    `;
  }

  // Line or Area chart
  const step = chartW / Math.max(1, normalized.length - 1);
  const points = normalized.map((d, i) => {
    const x = padding.left + i * step;
    const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + chartH).toFixed(1)} Z`;

  const dots = points
    .map(
      (pt) => `
    <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4" fill="${color}" stroke="var(--wm-surface)" stroke-width="2" />
    <text x="${pt.x.toFixed(1)}" y="${(height - 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--wm-text-muted)">${pt.label}</text>
  `
    )
    .join("\n");

  const gradientId = `wm-grad-${Math.random().toString(36).slice(2, 8)}`;

  return `
    <svg class="wm-chart-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="overflow:visible">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="var(--wm-border)" stroke-width="1" />
      <path d="${areaD}" fill="url(#${gradientId})" />
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
    </svg>
  `;
}
