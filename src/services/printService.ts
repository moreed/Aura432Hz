/**
 * Universal Printing and File Download Service
 * 
 * Provides robust, sandbox-safe, and popup-blocker-immune utilities for:
 * 1. Isolated document printing via hidden iframe (no window.open required)
 * 2. File downloads via Blob and URL.createObjectURL (safe for all sizes and characters)
 * 3. Formatted CSV and JSON downloads with UTF-8 BOM for Excel compatibility
 */

/**
 * Downloads a Blob safely to the user's filesystem
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Downloads plain text as a file (e.g. HTML, SVG, Markdown)
 */
export function downloadText(content: string, filename: string, mimeType = 'text/plain;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Downloads CSV content with UTF-8 BOM so Microsoft Excel and Google Sheets
 * properly render accented characters, currency symbols, and delimiters.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Downloads formatted JSON data
 */
export function downloadJSON(data: unknown, filename: string): void {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Prints an HTML document in a sandboxed, isolated hidden iframe.
 * 
 * Why this is superior:
 * - Does not trigger popup blockers (avoids window.open completely)
 * - Immune to iframe parent sandbox restrictions
 * - Isolates the document so the parent web application's dark mode,
 *   audio controls, banners, and layout never bleed onto printed paper
 * - Automatically falls back to standard window.print() if iframe is restricted
 */
export function printIsolatedDocument(htmlContent: string): void {
  try {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;z-index:-1;');
    iframe.setAttribute('title', 'Print Document');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Isolated iframe print error, falling back to window.print():', e);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    };

    // Ensure assets/styles inside the iframe have loaded before initiating print dialog
    if (iframe.contentWindow?.document.readyState === 'complete') {
      setTimeout(triggerPrint, 250);
    } else {
      iframe.onload = () => setTimeout(triggerPrint, 250);
      // Safety timeout in case onload doesn't fire
      setTimeout(triggerPrint, 600);
    }
  } catch (err) {
    console.warn('Fallback to standard window.print():', err);
    window.print();
  }
}
