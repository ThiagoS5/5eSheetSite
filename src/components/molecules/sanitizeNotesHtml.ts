import DOMPurify from "dompurify";

/**
 * Sanitizes rendered-markdown HTML before it is injected into the notes preview.
 *
 * EasyMDE renders the preview with `marked` (no sanitization) and writes it via
 * innerHTML, so without this a note containing raw HTML — most dangerously one
 * loaded from an imported/shared character file — would execute arbitrary
 * scripts (`<img onerror>`, `javascript:` links, etc.). We strip anything but a
 * safe HTML profile: event handlers and dangerous URI schemes are removed.
 */
export function sanitizeNotesHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
