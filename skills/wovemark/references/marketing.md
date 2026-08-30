# Marketing Blocks Reference

## `:::hero`
Prominent landing page header.
- `variant`: `split` | `centered` | `editorial` | `product` | `minimal`
- `image`: URL or relative asset path
- `badge`: Subtitle pill badge
- `motion`: `reveal` | `stagger` | `fade`

```md
:::hero variant="split" image="/assets/hero.webp" badge="New Release v2.0"
# Build Faster with AI

The declarative format for modern applications.

::button label="Start Free" action="navigate:signup" variant="primary"
::button label="Watch Demo" action="open:video-dialog" variant="outline"
:::
```

## `:::feature-grid`
Multi-column feature highlights.
- `columns`: `2` | `3` | `4`
- `title`: Section heading
- `description`: Section subtext

```md
:::feature-grid columns=3 title="Everything you need" description="Built-in capabilities"
:::card title="End-to-End Encryption" icon="shield"
Security is baked into every layer.
:::
:::card title="Instant Global CDN" icon="globe"
Under 20ms latency worldwide.
:::
:::card title="Automated Backups" icon="layers"
Daily snapshots and one-click rollback.
:::
:::
```

## `:::bento` & `:::bento-item`
Asymmetric Bento grid layout.
- `span`: `1` | `2`
- `icon`: Icon name
- `title`: Title string
- `description`: Summary text

## `:::stats` & `::stat-item`
KPI metrics display.
- `value`: Number / Metric string (e.g. `99.99%`, `10M+`)
- `label`: Description label
- `change`: Trend badge (e.g. `+14.2%`)
- `trend`: `up` | `down` | `neutral`

## `:::pricing` & `:::pricing-card`
Tiered pricing comparison.
- `name`: Plan name (e.g. `Starter`, `Pro`, `Enterprise`)
- `price`: Price string (e.g. `$29`, `$99`)
- `period`: Billing duration (`/mo`, `/year`)
- `popular`: boolean
- `ctaLabel`: Button text
- `ctaAction`: Action string

## `:::faq` & `:::faq-item`
Frequently asked questions disclosure list.
- `question`: Question title

## `:::cta`
Call-to-action closing banner.
- `title`: Banner title
- `description`: Banner subtitle
