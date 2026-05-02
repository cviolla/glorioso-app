# UI Spec: Admin Optimization

## Phase Goal
Refactor `src/app/admin/page.tsx` and `src/app/admin/history/page.tsx` to adhere to the `DESIGN-SYSTEM.md` ultra-dense rules.

## 1. Global Refactoring Targets
- [x] Replace all arbitrary pixel fonts (`text-[14.5px]`, `text-[12.5px]`) with the strict scale (`text-[11.5px]`, `text-[13px]`).
- [x] Reduce all `p-6` (24px) container paddings to `p-3` or `p-4` on mobile.
- [x] Reduce border radiuses from `rounded-2xl` / `rounded-3xl` to `rounded-xl` for tighter grouping.
- [x] Reduce icon sizes from `w-5 h-5` to `w-4 h-4`.

## 2. Product Management (`page.tsx`)
- **Header:** Reduce padding and title size. Make the "Novo Produto" button smaller (`h-10`, `px-4`).
- **Search Input:** Reduce height from `py-3` to `py-2`.
- **Category Accordion:** Reduce padding. `py-4` -> `py-3`.
- **Product List Items:** 
  - Image thumbnail: `w-14 h-14` -> `w-10 h-10` or `w-12 h-12`.
  - Item padding: `p-3` -> `p-2`.
- **Edit Modal:**
  - Remove `p-6` from sections, use `p-4`.
  - Inputs: Change `p-4` to `p-2.5` or `h-10 px-3`.
  - Variants grid: Make inputs side-by-side without heavy wrapping.

## 3. History Dashboard (`history/page.tsx`)
- **Daily Summaries List:**
  - `p-4 md:p-5` -> `p-3 md:p-4`.
  - Compact the typography so more days fit on screen.
- **Mobile Bottom Sheet:**
  - `top-[8dvh]` is okay, but inner padding `p-6` -> `p-4`.
  - Order items: `p-3` -> `p-2`.
- **Order Detail Modal:**
  - Reduce header padding. Remove `mt-2` gaps.

## 4. Settings Dashboard (Optional/If time permits)
- Apply the same reduction in padding and typography to `settings/page.tsx`.
