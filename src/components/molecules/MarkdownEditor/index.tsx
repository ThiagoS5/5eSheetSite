"use client";

import { useEffect, useRef } from "react";
import { sanitizeNotesHtml } from "@/src/components/molecules/sanitizeNotesHtml";

import type { MarkdownEditorProps } from "./index.types";
export type { MarkdownEditorProps } from "./index.types";

interface EasyMDEInstance {
  value: (val?: string) => string;
  toTextArea: () => void;
  togglePreview: () => void;
  isPreviewActive: () => boolean;
  codemirror: { on: (event: string, callback: () => void) => void };
}

export function MarkdownEditor({
  value,
  onChange,
  ariaLabel,
  docId,
  preview = false,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<EasyMDEInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swappingRef = useRef(false);
  const dirtyRef = useRef(false);
  const pendingValueRef = useRef<string | null>(null);
  const previewRef = useRef(preview);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const docIdRef = useRef(docId);
  const activeOnChangeRef = useRef(onChange);
  const activeDocIdRef = useRef(docId);

  useEffect(() => {
    previewRef.current = preview;
    valueRef.current = value;
    onChangeRef.current = onChange;
    docIdRef.current = docId;
  });

  function flushPendingEdit() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (pendingValueRef.current !== null) {
      activeOnChangeRef.current(pendingValueRef.current);
      pendingValueRef.current = null;
    }
    dirtyRef.current = false;
  }

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        const [module] = await Promise.all([
          import("easymde"),
          import("easymde/dist/easymde.min.css"),
        ]);
        await import("./index.css");
        if (cancelled || !textareaRef.current) return;

        const EasyMDE = module.default;
        const editor = new EasyMDE({
          element: textareaRef.current,
          initialValue: valueRef.current,
          spellChecker: false,
          status: false,
          minHeight: "360px",
          autoDownloadFontAwesome: false,
          renderingConfig: { sanitizerFunction: sanitizeNotesHtml },
          toolbar: [
            "bold",
            "italic",
            "strikethrough",
            "heading-2",
            "heading-3",
            "|",
            "unordered-list",
            "ordered-list",
            "quote",
            "|",
            "link",
            "horizontal-rule",
            "|",
            "preview",
          ],
        }) as unknown as EasyMDEInstance;

        editorRef.current = editor;
        activeOnChangeRef.current = onChangeRef.current;
        activeDocIdRef.current = docIdRef.current;
        if (previewRef.current && !editor.isPreviewActive()) editor.togglePreview();

        editor.codemirror.on("change", () => {
          if (swappingRef.current) return;
          dirtyRef.current = true;
          pendingValueRef.current = editor.value();
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(flushPendingEdit, 300);
        });
      } catch {
        // EasyMDE is optional in tests; the controlled textarea remains usable.
      }
    }

    void mount();

    return () => {
      cancelled = true;
      flushPendingEdit();
      const editor = editorRef.current;
      if (editor) {
        try {
          editor.toTextArea();
        } catch {
          // EasyMDE may already be detached when React runs passive cleanup.
        }
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const documentChanged = activeDocIdRef.current !== docId;
    if (documentChanged) flushPendingEdit();
    if (!documentChanged && dirtyRef.current) return;

    swappingRef.current = true;
    try {
      if (editor.value() !== value) editor.value(value);
    } catch {
      // The editor may have detached during route navigation.
    }
    swappingRef.current = false;
    activeOnChangeRef.current = onChangeRef.current;
    activeDocIdRef.current = docId;
  }, [docId, onChange, value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      const active = editor.isPreviewActive();
      if (preview !== active) {
        editor.togglePreview();
      } else if (preview) {
        editor.togglePreview();
        editor.togglePreview();
      }
    } catch {
      // The editor may have detached during route navigation.
    }
  }, [preview, docId]);

  return (
    <textarea
      ref={textareaRef}
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChangeRef.current(event.target.value)}
      className="min-h-[360px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-[13px] leading-relaxed text-subdued outline-none placeholder:text-muted-foreground focus:border-primary"
    />
  );
}
