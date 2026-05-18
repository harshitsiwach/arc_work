# Arc Work — Design System

## Theme

Dark-first with light mode support. The app is a tool first — users are managing escrows, browsing gigs, bridging funds. Deep charcoal backgrounds with tinted neutrals, subtle blue/cool undertones. Light mode uses warm off-white backgrounds.

## Color Palette

Colors expressed in OKLCH for perceptual uniformity.

### Dark Mode

```css
:root {
  /* Surfaces */
  --color-bg: oklch(0.13 0.008 260);        /* Deep charcoal base */
  --color-bg-elevated: oklch(0.16 0.01 260); /* Cards, panels */
  --color-bg-hover: oklch(0.19 0.012 260);   /* Hover states */
  --color-bg-inset: oklch(0.10 0.006 260);   /* Inputs, code */

  /* Text */
  --color-text-primary: oklch(0.93 0.01 260);
  --color-text-secondary: oklch(0.65 0.015 260);
  --color-text-muted: oklch(0.45 0.012 260);

  /* Borders */
  --color-border: oklch(0.22 0.012 260);
  --color-border-hover: oklch(0.28 0.014 260);

  /* Accent — cool blue */
  --color-accent: oklch(0.55 0.15 260);
  --color-accent-hover: oklch(0.50 0.16 260);
  --color-accent-soft: oklch(0.55 0.15 260 / 0.12);

  /* Semantic */
  --color-success: oklch(0.60 0.15 150);
  --color-warning: oklch(0.65 0.14 80);
  --color-error: oklch(0.55 0.18 30);
  --color-info: oklch(0.55 0.15 260);
}
```

### Light Mode

```css
[data-theme="light"] {
  --color-bg: oklch(0.97 0.005 80);
  --color-bg-elevated: oklch(0.95 0.005 80);
  --color-bg-hover: oklch(0.92 0.006 80);
  --color-bg-inset: oklch(0.99 0.003 80);

  --color-text-primary: oklch(0.15 0.01 260);
  --color-text-secondary: oklch(0.40 0.012 260);
  --color-text-muted: oklch(0.55 0.01 260);

  --color-border: oklch(0.85 0.008 80);
  --color-border-hover: oklch(0.75 0.01 80);

  --color-accent: oklch(0.50 0.18 260);
  --color-accent-hover: oklch(0.45 0.19 260);
  --color-accent-soft: oklch(0.50 0.18 260 / 0.1);
}
```

## Typography

- **Font family**: `Inter`, -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- **Scale**: Fixed rem scale (not fluid)
  - `xs`: 0.75rem (12px)
  - `sm`: 0.875rem (14px)
  - `base`: 0.9375rem (15px)
  - `lg`: 1.125rem (18px)
  - `xl`: 1.375rem (22px)
  - `2xl`: 1.75rem (28px)
  - `3xl`: 2.25rem (36px)
- **Line height**: 1.6 body, 1.3 headings
- **Font weight**: 400 body, 500 medium, 600 semibold headings

## Elevation

```css
--shadow-sm: 0 1px 2px oklch(0 0 0 / 0.06);
--shadow-md: 0 2px 8px oklch(0 0 0 / 0.08);
--shadow-lg: 0 4px 16px oklch(0 0 0 / 0.10);
```

## Border Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

## Motion

- **Duration**: 150-200ms for micro-interactions, 250-300ms for page transitions
- **Easing**: cubic-bezier(0.16, 1, 0.3, 1) — exponential ease-out
- **Reduced motion**: Respects prefers-reduced-motion
- **Allowed motion**: hover lifts (translateY -1px), fade-ins, scale on press (0.97), skeleton pulse
- **Banned motion**: orchestrated page-load sequences, bounce, elastic, layout animations

## Component Patterns

- **Cards**: Thin border (1px), no shadow by default, subtle shadow on hover, no nested cards
- **Buttons**: Pill-shaped for primary, flat for secondary, icon buttons are 32x32
- **Inputs**: Inset background, thin border, focus ring uses accent with 3px offset
- **Navigation**: Top bar with glass effect (backdrop-blur), active tab uses thin underline
- **Badges**: Rounded-pill, small padding, muted bg with tinted text
- **Tables**: Clean lines, hover row highlight, no alternating row colors
