"use client";

import { useEffect, useRef } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
}

interface EasyMDEInstance {
  value: () => string;
  toTextArea: () => void;
  codemirror: { on: (event: string, cb: () => void) => void };
}

export function MarkdownEditor({ value, onChange, ariaLabel }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let editor: EasyMDEInstance | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    async function mount() {
      try {
        const [mod] = await Promise.all([
          import("easymde"),
          import("easymde/dist/easymde.min.css"),
        ]);
        // Dark-theme overrides, loaded after EasyMDE's own stylesheet.
        await import("./markdownEditor.dark.css");
        if (cancelled || !textareaRef.current) return;
        const EasyMDE = mod.default;
        editor = new EasyMDE({
          element: textareaRef.current,
          initialValue: value,
          spellChecker: false,
          status: false,
          minHeight: "360px",
          toolbar: [
            "bold", "italic", "strikethrough", "heading-2", "heading-3", "|",
            "unordered-list", "ordered-list", "quote", "|",
            "link", "horizontal-rule", "|", "preview",
          ],
        }) as unknown as EasyMDEInstance;
        editor.codemirror.on("change", () => {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            if (editor) onChangeRef.current(editor.value());
          }, 300);
        });
      } catch {
        // EasyMDE unavailable (e.g. jsdom/test environment): fall back to the
        // plain controlled <textarea> already rendered below.
      }
    }

    void mount();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      if (editor) {
        try {
          onChangeRef.current(editor.value()); // flush last edit (best-effort)
          editor.toTextArea();
        } catch {
          // React runs passive-effect cleanup after the DOM subtree is
          // detached; EasyMDE's toTextArea() (or reading .value()) throws
          // when its wrapper's parentNode is already gone. Safe to ignore.
        }
        editor = null;
      }
    };
    // Mount once per instance; parent remounts via `key` when the field changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <textarea
      ref={textareaRef}
      aria-label={ariaLabel}
      defaultValue={value}
      onChange={(e) => onChangeRef.current(e.target.value)}
    />
  );
}
