export interface MarkdownEditorProps {
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
