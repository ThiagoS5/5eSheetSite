/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { sanitizeNotesHtml } from "@/src/components/molecules/sanitizeNotesHtml";

describe("sanitizeNotesHtml", () => {
  it("strips event-handler attributes that would execute scripts", () => {
    const dirty = '<img src="x" onerror="window.__xss=1">';
    const clean = sanitizeNotesHtml(dirty);

    expect(clean).not.toMatch(/onerror/i);
    expect(clean).not.toMatch(/window\.__xss/);
  });

  it("removes <script> tags entirely", () => {
    const clean = sanitizeNotesHtml('<p>hi</p><script>alert(1)</script>');

    expect(clean).toContain("hi");
    expect(clean.toLowerCase()).not.toContain("<script");
  });

  it("drops javascript: URLs from links", () => {
    const clean = sanitizeNotesHtml('<a href="javascript:window.__xss=1">click</a>');

    expect(clean).not.toMatch(/javascript:/i);
  });

  it("keeps safe formatting markup intact", () => {
    const clean = sanitizeNotesHtml(
      '<h1>Title</h1><p><strong>bold</strong> and <em>italic</em></p><ul><li>item</li></ul>',
    );

    expect(clean).toContain("<h1>Title</h1>");
    expect(clean).toContain("<strong>bold</strong>");
    expect(clean).toContain("<li>item</li>");
  });

  it("keeps ordinary http links", () => {
    const clean = sanitizeNotesHtml('<a href="https://example.com">safe</a>');

    expect(clean).toContain('href="https://example.com"');
  });
});
