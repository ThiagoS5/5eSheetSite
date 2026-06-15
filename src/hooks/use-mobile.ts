import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  return React.useSyncExternalStore(subscribeToMobileBreakpoint, getSnapshot, getServerSnapshot)
}

function subscribeToMobileBreakpoint(onStoreChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {}
  }

  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

function getSnapshot() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
}

function getServerSnapshot() {
  return false
}
