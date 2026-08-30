# Product UI & Dashboard Reference

## `:::app-shell`
Complete application frame with fixed sidebar and content viewport.

```md
:::app-shell title="SaaS Studio"
:::sidebar title="SaaS Studio"
:::sidebar-group label="Analytics"
::sidebar-item label="Overview" href="#dashboard" active=true icon="bar-chart"
::sidebar-item label="Real-Time" href="#realtime" icon="activity"
:::
:::sidebar-group label="Management"
::sidebar-item label="Users" href="#users" icon="users" badge="1.4k"
::sidebar-item label="Settings" href="#settings" icon="settings"
:::
:::

:::page-header title="Analytics Overview" description="Live telemetry from all regions"
::button label="Download CSV" icon="download" variant="outline"
::button label="New Project" icon="plus" variant="primary" action="open:create-modal"
:::

:::metric-grid columns=4
::metric label="Monthly Revenue" value="$124,500" change="+18.4%" trend="up" icon="zap"
::metric label="Active Subscriptions" value="1,842" change="+6.1%" trend="up" icon="users"
::metric label="Avg Response Time" value="18ms" change="-4.2%" trend="up" icon="activity"
::metric label="Server Error Rate" value="0.01%" change="0.0%" trend="neutral" icon="shield"
:::

::chart title="Weekly Traffic Overview" type="line" source="trafficData" height=280

:::
```

## `::metric`
Dashboard metric card.
- `label`: Metric name
- `value`: Main stat display
- `change`: Percentage or delta string
- `trend`: `up` | `down` | `neutral`
- `icon`: Icon name

## `::chart`
SVG vector chart (line, bar, area, pie, donut).
- `title`: Chart heading
- `type`: `line` | `bar` | `area` | `pie` | `donut`
- `source`: Data source ID
- `height`: Number (default: 280)
