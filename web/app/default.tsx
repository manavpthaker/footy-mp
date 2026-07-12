/**
 * Parallel-routes default for the implicit `children` slot. The layout
 * only renders `@rail` and `@detail`; `children` is unused, so we return
 * null for every URL so Next.js can still match every route successfully.
 */
export default function DefaultSlot() { return null; }
