# Design

## Approach
- `@astrojs/react` integration + `recharts` BarChart in `CategoryChart.tsx` (`{ label, count }[]` props, serializable).
- Fixed-size chart (no ResponsiveContainer) so it server-renders; `client:load` for tooltip interactivity.
- Placed above the grid in `index.astro`.

## Alternatives
- ResponsiveContainer: rejected, needs client width at render; fixed size is fine for 4 bars.
- Chart.js/victory: rejected, user named Recharts.
