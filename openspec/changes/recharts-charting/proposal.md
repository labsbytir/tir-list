# Proposal

## Why
Catalog has no visual overview; user asked for charting via Recharts (https://recharts.github.io/).

## What Changes
- Add React (`@astrojs/react`) + `recharts` deps
- Add `src/components/CategoryChart.tsx`: bar chart of entry counts per category
- Render chart on the catalog page as a client island

## Capabilities

### New Capabilities
- `catalog-chart`: bar chart of entries per category

### Modified Capabilities
(none)

## Impact
- New deps `react`, `react-dom`, `@astrojs/react`, `recharts`; `astro.config.mjs` gains react integration
- No data or search behavior changes
