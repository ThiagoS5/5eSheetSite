/**
 * @vitest-environment jsdom
 */
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "@/src/hooks/use-mobile";

function stubViewport(width: number) {
  vi.stubGlobal("innerWidth", width);
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: width < 768,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("useIsMobile", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("reports mobile below the 768px breakpoint", () => {
    stubViewport(375);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("reports desktop at and above the 768px breakpoint", () => {
    stubViewport(1280);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it("subscribes to breakpoint changes and unsubscribes on unmount", () => {
    stubViewport(1024);
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener,
        removeEventListener,
      })),
    );

    const { unmount } = renderHook(() => useIsMobile());
    expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });
});
