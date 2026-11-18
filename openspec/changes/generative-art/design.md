# Design

## Approach
- Philosophy `art/philosophy.md` ("Verdant Drift"): spore-dispersal flow field; particles = listings drifting through a canopy; speed-banded brand colors with rare lime sparks (logo accent).
- Viewer follows the skill's template structure (seed → params → colors → actions, download) restyled to the dark forest brand (skill allows brand adaptation; Anthropic light theme would clash with the site).
- Seeded `randomSeed`/`noiseSeed`; animated advect-with-fade loop; static defaults tuned for 1500 particles.
- Homepage sidebar card links to `/art.html`.

## Alternatives
- Embedding canvas in homepage hero: rejected, heavier first paint; standalone page + link.
