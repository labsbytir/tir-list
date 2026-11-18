# Brand

Forest-green palette for tir-list. Site theme lives in `src/pages/index.astro` (`:root` vars) and `src/components/CategoryChart.tsx`.

## Palette

| Name             | HEX       | HSL                      | RGB                     |
| ---------------- | --------- | ------------------------ | ----------------------- |
| `--black`        | `#020202` | `hsla(0, 0%, 1%, 1)`     | `rgba(2, 2, 2, 1)`      |
| `--evergreen`    | `#0d2818` | `hsla(144, 51%, 10%, 1)` | `rgba(13, 40, 24, 1)`   |
| `--black-forest` | `#04471c` | `hsla(141, 89%, 15%, 1)` | `rgba(4, 71, 28, 1)`    |
| `--sea-green`    | `#058c42` | `hsla(147, 93%, 28%, 1)` | `rgba(5, 140, 66, 1)`   |
| `--malachite`    | `#16db65` | `hsla(144, 82%, 47%, 1)` | `rgba(22, 219, 101, 1)` |

Plus `--mist: #d7efe0` (derived light text) and `--muted: #8fb8a0` (derived muted text).

## Logos

Stored in `public/brand/` (served as site assets), recorded here as the brand kit:

- `tirlist-white.svg` — white wordmark, for dark backgrounds. Used in the site header.
- `tirlist-black.svg` — black wordmark, for light backgrounds.

Both are the "tirLIST" wordmark with a pixel-brick motif in lime accent `#c9ef79`. Do not recolor the lime bricks; pair the white lockup with dark surfaces and the black lockup with light surfaces.

## CSS

```css
--black: #020202ff;
--evergreen: #0d2818ff;
--black-forest: #04471cff;
--sea-green: #058c42ff;
--malachite: #16db65ff;
```

## SCSS

```scss
$black: #020202ff;
$evergreen: #0d2818ff;
$black-forest: #04471cff;
$sea-green: #058c42ff;
$malachite: #16db65ff;

$gradient-top: linear-gradient(
  0deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-right: linear-gradient(
  90deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-bottom: linear-gradient(
  180deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-left: linear-gradient(
  270deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-top-right: linear-gradient(
  45deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-bottom-right: linear-gradient(
  135deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-top-left: linear-gradient(
  225deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-bottom-left: linear-gradient(
  315deg,
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
$gradient-radial: radial-gradient(
  #020202ff,
  #0d2818ff,
  #04471cff,
  #058c42ff,
  #16db65ff
);
```

## Usage

- Page background: `linear-gradient(180deg, evergreen, black)`; base surfaces `black`, cards `evergreen`.
- Borders/dividers: `black-forest` (subtle), `sea-green` (interactive).
- Accents (links, headings, tags, chart bars/ticks, buttons): `malachite`.
- Body text `mist`, secondary text `muted`.
