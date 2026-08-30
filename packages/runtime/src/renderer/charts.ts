/**
 * Pure SVG Chart Generator for Wovemark (Zero dependencies)
 * Features interactive tooltips, line, area, bar, pie, and donut charts.
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

  // Handle Pie and Donut Charts
  if (type === "pie" || type === "donut") {
    const total = normalized.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
    const cx = width / 3;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 20;
    const innerRadius = type === "donut" ? radius * 0.55 : 0;

    const colors = [
      "var(--wm-color-accent)",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
      "#ec4899",
      "#06b6d4",
      "#6366f1",
      "#14b8a6",
    ];

    let currentAngle = -Math.PI / 2;
    const slices: string[] = [];
    const legendItems: string[] = [];

    normalized.forEach((d, i) => {
      const sliceAngle = (d.value / total) * 2 * Math.PI;
      const endAngle = currentAngle + sliceAngle;
      const sliceColor = colors[i % colors.length];
      const pct = Math.round((d.value / total) * 100);

      const x1 = cx + radius * Math.cos(currentAngle);
      const y1 = cy + radius * Math.sin(currentAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      const x3 = cx + innerRadius * Math.cos(endAngle);
      const y3 = cy + innerRadius * Math.sin(endAngle);
      const x4 = cx + innerRadius * Math.cos(currentAngle);
      const y4 = cy + innerRadius * Math.sin(currentAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = innerRadius > 0
        ? `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      slices.push(`
        <path d="${pathData}" fill="${sliceColor}" class="wm-chart-slice" style="cursor:pointer;transition:transform 150ms ease">
          <title>${d.label}: ${d.value} (${pct}%)</title>
        </path>
      `);

      legendItems.push(`
        <div style="display:flex;align-items:center;gap:8px;font-size:0.85rem">
          <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${sliceColor}"></span>
          <span style="color:var(--wm-text-muted)">${d.label}</span>
          <strong style="margin-left:auto">${pct}%</strong>
        </div>
      `);

      currentAngle = endAngle;
    });

    return `
      <div style="display:flex;align-items:center;gap:24px;width:100%;flex-wrap:wrap">
        <svg class="wm-chart-svg" viewBox="0 0 ${(width * 0.6).toFixed(0)} ${height}" width="${width * 0.55}" height="${height}" style="overflow:visible">
          ${slices.join("\n")}
        </svg>
        <div style="flex:1;min-width:180px;display:flex;flex-direction:column;gap:8px">
          ${legendItems.join("\n")}
        </div>
      </div>
    `;
  }

  const values = normalized.map((d) => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = Math.min(0, ...values);
  const range = maxVal - minVal || 1;

  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Grid lines
  const gridLines = [0, 0.5, 1]
    .map((ratio) => {
      const y = padding.top + chartH * (1 - ratio);
      const val = (minVal + range * ratio).toFixed(0);
      return `
        <line x1="${padding.left}" y1="${y.toFixed(1)}" x2="${width - padding.right}" y2="${y.toFixed(1)}" stroke="var(--wm-border-subtle)" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${(padding.left - 8).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--wm-text-faint)">${val}</text>
      `;
    })
    .join("\n");

  if (type === "bar") {
    const barWidth = Math.max(12, Math.min(48, (chartW / normalized.length) * 0.6));
    const step = chartW / normalized.length;

    const bars = normalized
      .map((d, i) => {
        const x = padding.left + i * step + (step - barWidth) / 2;
        const barH = Math.max(2, ((d.value - minVal) / range) * chartH);
        const y = padding.top + chartH - barH;
        return `
        <g class="wm-chart-bar" style="cursor:pointer">
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="${color}" opacity="0.9">
            <title>${d.label}: ${d.value}</title>
          </rect>
          <text x="${(x + barWidth / 2).toFixed(1)}" y="${(height - 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--wm-text-muted)">${d.label}</text>
        </g>
      `;
      })
      .join("\n");

    return `
      <svg class="wm-chart-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" style="overflow:visible">
        ${gridLines}
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
    <g class="wm-chart-dot" style="cursor:pointer">
      <circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.5" fill="${color}" stroke="var(--wm-surface)" stroke-width="2">
        <title>${pt.label}: ${pt.value}</title>
      </circle>
      <text x="${pt.x.toFixed(1)}" y="${(height - 15).toFixed(1)}" text-anchor="middle" font-size="11" fill="var(--wm-text-muted)">${pt.label}</text>
    </g>
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
      ${gridLines}
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="var(--wm-border)" stroke-width="1" />
      <path d="${areaD}" fill="url(#${gradientId})" />
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
    </svg>
  `;
}
