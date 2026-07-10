/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MarkdownEditor } from "@/src/components/molecules/MarkdownEditor";

describe("MarkdownEditor", () => {
  it("renders a labelled textarea and reports changes", () => {
    const onChange = vi.fn();
    render(<MarkdownEditor value="hello" ariaLabel="Backstory editor" onChange={onChange} />);
    const textarea = screen.getByLabelText("Backstory editor") as HTMLTextAreaElement;
    expect(textarea.value).toBe("hello");
    fireEvent.change(textarea, { target: { value: "world" } });
    expect(onChange).toHaveBeenCalledWith("world");
  });
});
