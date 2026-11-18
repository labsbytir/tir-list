# Proposal

## Why
User supplied brand palette (black → evergreen → black-forest → sea-green → malachite); site still uses unstyled system colors.

## What Changes
- Theme `index.astro` with brand vars (dark forest base, malachite accents)
- Match Recharts chart colors to brand

## Capabilities

### New Capabilities
- `brand-theme`: site styled with brand palette

### Modified Capabilities
(none)

## Impact
- `src/pages/index.astro` styles, `src/components/CategoryChart.tsx` colors only
