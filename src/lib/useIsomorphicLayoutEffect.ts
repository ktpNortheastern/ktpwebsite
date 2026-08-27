import { useEffect, useLayoutEffect } from "react";

// `useLayoutEffect`'s cleanup runs synchronously as part of React's commit —
// before a deleted subtree's DOM nodes are detached from their parent. That
// timing matters for components whose effect does imperative DOM surgery
// GSAP's ScrollTrigger `pin: true` reparents its trigger element into a
// `.pin-spacer` wrapper it inserts itself, outside React's tracking. If that
// reparenting is still in place when React removes the old node, React
// calls `removeChild` on a parent that no longer actually holds it
// (`NotFoundError: the node to be removed is not a child of this node`).
// Plain `useEffect`'s cleanup is passive and deferred until after that
// removal already happened, so it loses the race; `useLayoutEffect` doesn't.
//
// `useLayoutEffect` warns when it runs during SSR, so fall back to
// `useEffect` on the server — nothing pins anything there anyway.
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
