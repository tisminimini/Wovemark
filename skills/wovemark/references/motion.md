# Motion & The Three Dials Reference

## The Three Dials

```yaml
---
variance: 6 # 1 - 10
motion: 5   # 0 - 10
density: 7  # 1 - 10
---
```

### 1. `variance` (1 to 10)
- **1 - 3**: Linear, symmetrical grids, uniform card sizes.
- **4 - 7**: Varied card elevations, badges, subtle offsets.
- **8 - 10**: Editorial typography sizes, asymmetrical Bento grid spans, dynamic gradient accents.

### 2. `motion` (0 to 10)
- **0**: All animations disabled (instant DOM changes).
- **1 - 3**: 100-150ms subtle opacity and button hover micro-interactions.
- **4 - 7**: 250-350ms scroll reveals, staggered child card entrances, smooth page route transitions.
- **8 - 10**: 400-500ms spring physics, choreographed scroll sequences.

### 3. `density` (1 to 10)
- **1 - 3**: Spacious layout (28-36px padding), large font sizes, generous breathing room (landing pages).
- **4 - 6**: Standard comfortable density (16-20px padding).
- **7 - 10**: Compact SaaS layout (8-12px padding), dense data tables, tight form inputs.

## Motion Presets
- `reveal`: Smooth upward translate and fade on scroll into view.
- `stagger`: Cascading delay for children of grids or lists.
- `fade`: Pure opacity fade.
