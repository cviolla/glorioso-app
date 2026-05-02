# UI Audit Review - Admin Dashboard

## Overall Score: 16/24

### 1. Copywriting (3/4)
- **Strengths:** Clear action verbs ("Gerenciar", "Novo Produto"). Good use of helper texts.
- **Weaknesses:** Some helper texts are too long for an ultra-dense mobile view (e.g. "Altere preços, nomes e descrições do cardápio.").
- **Fix:** Truncate or remove secondary descriptions on mobile.

### 2. Visuals & Icons (3/4)
- **Strengths:** Consistent use of `lucide-react` icons. Good visual hierarchy with opacity.
- **Weaknesses:** Icon sizes are slightly too large for a dense layout (`w-5 h-5` and `w-6 h-6`).
- **Fix:** Standardize icons to `w-4 h-4` (16px) or `w-3.5 h-3.5` (14px) for list items.

### 3. Color (3/4)
- **Strengths:** Adheres to the brand palette (`--color-brand-dark`, `--color-brand-accent`).
- **Weaknesses:** Contrast ratios in some "disabled" or "hidden" states (e.g. `opacity-60 grayscale-[0.5]`) might be too subtle in bright light.
- **Fix:** Increase contrast on badges.

### 4. Typography (2/4)
- **Strengths:** Good use of font weights (`font-black` for headers).
- **Weaknesses:** Uncontrolled scale. Font sizes range erratically (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[12.5px]`, `text-[14.5px]`, `text-3xl`). `8px` and `9px` are practically illegible on some mobile screens.
- **Fix:** Enforce a strict scale: `text-xs` (11px), `text-sm` (13px), `text-base` (15px). Remove arbitrary pixel sizes.

### 5. Spacing & Layout (2/4) - *Critical for Density*
- **Strengths:** Good use of flexbox for alignment.
- **Weaknesses:** Paddings are too generous for an "ultra-dense" requirement. `p-6` inside modals wastes ~24px of screen edge. List items use `p-3` and `p-4`. Inputs use `p-4`.
- **Fix:** Reduce container paddings to `p-3` (12px) max on mobile. Reduce input heights to `h-10` or `h-11`. Reduce list item padding to `p-2.5` or `p-2`.

### 6. Experience Design (3/4)
- **Strengths:** Good use of bottom sheets for mobile (e.g., in history).
- **Weaknesses:** The Edit Product modal is very tall, requiring scrolling within a scrollable view. Too much vertical space used per input.
- **Fix:** Compact the form fields. Put variations in a tighter grid.
