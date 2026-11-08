/**
 * Every file the site builds in the browser is saved through this one function, so a future limit,
 * watermark or sign-in prompt has a single place to go. Nothing leaves the browser: the file is
 * handed to the browser's own download through a temporary object URL.
 * Toolkit templates are static files with ordinary download links and do not pass through here.
 */
export type ExportKind = 'markdown' | 'word' | 'csv' | 'json' | 'png' | 'scorm';

export function exportFile(_kind: ExportKind, blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/** text content as a Blob of the given type */
export const textBlob = (text: string, type: string) => new Blob([text], { type });
