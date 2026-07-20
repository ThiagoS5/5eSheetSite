/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MarkdownEditor } from "@/src/components/molecules/MarkdownEditor";

const easyMdeState = vi.hoisted(() => ({
  instances: [] as Array<{
    currentValue: string;
    change?: () => void;
    value: (next?: string) => string;
    emitUserChange: (next: string) => void;
  }>,
}));

vi.mock("easymde", () => ({
  default: class EasyMDEMock {
    currentValue: string;
    change?: () => void;
    codemirror = { on: (_event: string, callback: () => void) => { this.change = callback; } };
    constructor(options: { initialValue: string }) {
      this.currentValue = options.initialValue;
      easyMdeState.instances.push(this);
    }
    value(next?: string) {
      if (next !== undefined) this.currentValue = next;
      return this.currentValue;
    }
    emitUserChange(next: string) {
      this.currentValue = next;
      this.change?.();
    }
    toTextArea() {}
    togglePreview() {}
    isPreviewActive() { return false; }
  },
}));

describe("MarkdownEditor", () => {
  afterEach(() => {
    cleanup();
    easyMdeState.instances.length = 0;
    vi.useRealTimers();
  });
  it("renders a labelled textarea and reports changes", () => {
    const onChange = vi.fn();
    render(<MarkdownEditor docId="backstory" value="hello" ariaLabel="Backstory editor" onChange={onChange} />);
    const textarea = screen.getByLabelText("Backstory editor") as HTMLTextAreaElement;
    expect(textarea.value).toBe("hello");
    fireEvent.change(textarea, { target: { value: "world" } });
    expect(onChange).toHaveBeenCalledWith("world");
  });

  it("does not throw on unmount (guards EasyMDE teardown against detached DOM)", () => {
    const onChange = vi.fn();
    const { unmount } = render(
      <MarkdownEditor docId="backstory" value="hello" ariaLabel="Backstory editor" onChange={onChange} />
    );
    expect(() => unmount()).not.toThrow();
  });

  it("synchronizes a value that arrives after the editor mounts", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MarkdownEditor docId="traits" value="" ariaLabel="Traits editor" onChange={onChange} />,
    );
    await waitFor(() => expect(easyMdeState.instances).toHaveLength(1));

    rerender(
      <MarkdownEditor
        docId="traits"
        value="Hydrated personality traits"
        ariaLabel="Traits editor"
        onChange={onChange}
      />,
    );

    expect(easyMdeState.instances[0]?.value()).toBe("Hydrated personality traits");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps a local edit during hydration and flushes it on document change", async () => {
    vi.useFakeTimers();
    const traitsChange = vi.fn();
    const notesChange = vi.fn();
    const { rerender } = render(
      <MarkdownEditor docId="traits" value="saved" ariaLabel="Traits editor" onChange={traitsChange} />,
    );
    await vi.waitFor(() => expect(easyMdeState.instances).toHaveLength(1));
    const editor = easyMdeState.instances[0]!;
    editor.emitUserChange("local edit");

    rerender(
      <MarkdownEditor docId="traits" value="hydrated stale value" ariaLabel="Traits editor" onChange={traitsChange} />,
    );
    expect(editor.value()).toBe("local edit");

    rerender(
      <MarkdownEditor docId="notes" value="new document" ariaLabel="Notes editor" onChange={notesChange} />,
    );
    expect(traitsChange).toHaveBeenCalledWith("local edit");
    expect(editor.value()).toBe("new document");
  });
});
