"use client";

import { useEffect, useRef } from "react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  /**
   * Identity of the document currently shown. When it changes, the editor loads
   * the new `value` in place rather than the parent remounting the component —
   * remounting is avoided because EasyMDE relocates the React-owned `<textarea>`
   * into its own container, which leaks/stacks editors when React unmounts it.
   */
  docId: string;
  /** When true, EasyMDE shows the rendered-markdown preview instead of the editor. */
  preview?: boolean;
}

interface EasyMDEInstance {
  value: (val?: string) => string;
  toTextArea: () => void;
  togglePreview: () => void;
  isPreviewActive: () => boolean;
  codemirror: { on: (event: string, cb: () => void) => void };
}

export function MarkdownEditor({ value, onChange, ariaLabel, docId, preview = false }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<EasyMDEInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // True while we programmatically swap the loaded document, so the resulting
  // CodeMirror "change" event isn't written back as a user edit.
  const swappingRef = useRef(false);
  const previewRef = useRef(preview);
  previewRef.current = preview;

  // Latest props, so the mount-once effect and CM handlers read current values.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;
  // onChange bound to the doc actually loaded in the editor (updated on swap),
  // so a debounced write is always attributed to the right field.
  const activeOnChangeRef = useRef(onChange);

  // Mount EasyMDE once for the component's lifetime.
  useEffect(() => {
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
        const editor = new EasyMDE({
          element: textareaRef.current,
          initialValue: valueRef.current,
          spellChecker: false,
          status: false,
          minHeight: "360px",
          toolbar: [
            "bold", "italic", "strikethrough", "heading-2", "heading-3", "|",
            "unordered-list", "ordered-list", "quote", "|",
            "link", "horizontal-rule", "|", "preview",
          ],
        }) as unknown as EasyMDEInstance;
        editorRef.current = editor;
        activeOnChangeRef.current = onChangeRef.current;
        if (previewRef.current && !editor.isPreviewActive()) editor.togglePreview();
        editor.codemirror.on("change", () => {
          if (swappingRef.current) return; // ignore programmatic content swaps
          const cb = activeOnChangeRef.current;
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => cb(editor.value()), 300);
        });
      } catch {
        // EasyMDE unavailable (e.g. jsdom/test environment): fall back to the
        // plain controlled <textarea> already rendered below.
      }
    }

    void mount();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      const editor = editorRef.current;
      if (editor) {
        try {
          activeOnChangeRef.current(editor.value()); // flush last edit (best-effort)
          editor.toTextArea();
        } catch {
          // React runs passive-effect cleanup after the DOM subtree is detached;
          // EasyMDE's toTextArea() (or reading .value()) throws when its wrapper's
          // parentNode is already gone. Safe to ignore.
        }
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the loaded document when docId changes, without remounting EasyMDE.
  useEffect(() => {
    const editor = editorRef.current;
    // On first run the editor may not be mounted yet; mount() already loads the
    // initial value, so there is nothing to swap.
    if (!editor) return;
    // Flush the outgoing doc's latest content to its own onChange, then load the
    // incoming doc without emitting a change for it.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    try {
      activeOnChangeRef.current(editor.value());
    } catch {
      // ignore — editor detached
    }
    swappingRef.current = true;
    try {
      editor.value(valueRef.current);
    } catch {
      // ignore — editor detached
    }
    swappingRef.current = false;
    activeOnChangeRef.current = onChangeRef.current;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  // Keep EasyMDE's preview state in sync with the `preview` prop. Runs after the
  // docId-swap effect above (declaration order), so when the document changes
  // while preview stays on, we re-render the preview from the new content.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      const active = editor.isPreviewActive();
      if (preview !== active) {
        editor.togglePreview();
      } else if (preview) {
        // Same preview state but the document (docId) changed: refresh it.
        editor.togglePreview();
        editor.togglePreview();
      }
    } catch {
      // ignore — editor detached
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview, docId]);

  return (
    <textarea
      ref={textareaRef}
      aria-label={ariaLabel}
      defaultValue={value}
      onChange={(e) => onChangeRef.current(e.target.value)}
      // Dark styling for the bare textarea: the graceful fallback when EasyMDE
      // is unavailable, and it prevents a white flash in the brief window before
      // EasyMDE takes over.
      className="min-h-[360px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-[13px] leading-relaxed text-subdued outline-none placeholder:text-muted-foreground focus:border-primary"
    />
  );
}
