# Foundation & Content Components Reference

## Foundation

### `:::container`
Constrains horizontal content width.
- `size`: `sm` | `md` | `lg` | `xl` | `full` (default: `lg`)

### `:::section`
Major vertical content section.
- `variant`: `default` | `muted` | `surface` | `accent`
- `id`: Anchor ID

### `:::card`
Elevated surface with hover interaction.
- `title`: Card title string
- `description`: Subtitle text
- `icon`: Icon name (e.g. `zap`, `shield`, `globe`)
- `badge`: Pill badge string
- `action`: Click action string

### `:::grid`
Responsive multi-column grid.
- `columns`: Number of columns (1-6)

### `:::split`
Two-column responsive split layout.
- `ratio`: `50-50` | `60-40` | `40-60` | `70-30` | `30-70`

## Content

### `:::callout`
Highlighted callout box.
- `variant`: `info` | `success` | `warning` | `danger` | `tip`
- `title`: Callout title
- `icon`: Custom icon

### `:::accordion` & `:::accordion-item`
Collapsible disclosure panels.
- `title`: Item title
- `open`: boolean

### `::badge`
- `label`: Badge text
- `variant`: `default` | `accent` | `success` | `warning` | `danger`
- `icon`: Icon name

### `::button`
- `label`: Button text
- `variant`: `primary` | `secondary` | `outline` | `ghost` | `danger`
- `size`: `sm` | `md` | `lg`
- `action`: Action command
- `href`: Link destination
- `icon`: Icon name
- `disabled`: boolean
