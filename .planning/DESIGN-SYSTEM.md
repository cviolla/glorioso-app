# Design System: Ultra-Dense Admin (Mobile-First)

## Philosophy
Maximal information density, minimal chrome. Designed for operators who use the system daily and prioritize speed over "breathing room".

## 1. Grid & Spacing (Compact Scale)
- **Micro:** 2px (`gap-0.5`)
- **Tight:** 4px (`p-1`, `gap-1`)
- **Base:** 8px (`p-2`, `gap-2`)
- **Container Padding Mobile:** 12px (`p-3`) — *Never use `p-6` on mobile admin panels.*

## 2. Typography (Strict Scale)
No arbitrary pixel values. Use a strict tailwind-driven scale tuned for density.
- **Micro:** `text-[10px] uppercase tracking-widest font-black` (Labels, Badges)
- **Small:** `text-[11.5px] leading-tight` (Secondary text, descriptions)
- **Base:** `text-[13px] leading-snug font-bold` (List item titles, inputs)
- **Header:** `text-[16px] font-black tracking-tight` (Section headers)

## 3. UI Components & Patterns
### Buttons & Inputs
- **Height:** 36px (`h-9`) to 40px (`h-10`) max. (Currently using `py-4` which creates ~56px heights).
- **Radius:** `rounded-lg` or `rounded-xl`. (Avoid `rounded-2xl` or `3xl` as it wastes corner pixels in tight grids).

### List Items
- **Structure:** Single row when possible. 
- **Padding:** `p-2` or `p-2.5`.
- **Icons:** `w-4 h-4` (16px).

### Modals / Bottom Sheets
- **Header:** Compact `h-12` header with sticky close button.
- **Content:** Flat forms, no borders around inputs (use soft backgrounds `bg-gray-50`).

## 4. Anti-Patterns to Avoid
- 🚫 Shadows on list items (creates visual noise). Use flat borders (`border-b border-gray-100`).
- 🚫 Huge corner radiuses (`rounded-[2rem]`).
- 🚫 Nested scrolling areas with high padding.
