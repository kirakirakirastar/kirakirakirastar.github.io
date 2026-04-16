/**
 * Converts legacy HTML formatting tags to BBCode equivalents.
 * Used when loading old notes that may have been saved with raw HTML marks.
 */
export const convertLegacyHTMLToBBCode = (markdown: string): string => {
  if (!markdown) return markdown;
  return markdown
    .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '[u]$1[/u]')
    .replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '[s]$1[/s]')
    .replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '[mark]$1[/mark]')
    .replace(/<span[^>]*class=['"][^'"]*mask-text[^'"]*['"][^>]*>([\s\S]*?)<\/span>/gi, '[mask]$1[/mask]')
    .replace(/<span[^>]*style=['"]color:\s*([^;'"]+)['"][^>]*>([\s\S]*?)<\/span>/gi, '[color=$1]$2[/color]');
};

/**
 * Pre-converts BBCode tags to HTML BEFORE passing content to editor.setContent().
 *
 * WHY: tiptap-markdown's bbcodePlugin (inline.ruler) conflicts with
 * markdown-it-task-lists when both process inline tokens simultaneously.
 * Within task list items, this causes BBCode to appear as BOTH a parsed mark
 * AND as literal text — causing visible duplication in the editor.
 *
 * By pre-converting [mask]→<span class="mask-text"> before calling setContent,
 * tiptap-markdown sees plain HTML (not BBCode). With html:true, markdown-it
 * passes the HTML through unchanged, and ProseMirror's parseHTML rules on each
 * extension (Mask, Underline, etc.) create the correct marks with no conflict.
 */
export const convertBBCodeToEditorHTML = (markdown: string): string => {
  if (!markdown) return markdown;
  return markdown
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>')
    .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<s>$1</s>')
    .replace(/\[mark\]([\s\S]*?)\[\/mark\]/gi, '<mark>$1</mark>')
    .replace(/\[mask\]([\s\S]*?)\[\/mask\]/gi, '<span class="mask-text">$1</span>')
    .replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color: $1">$2</span>')
    .replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size: $1px">$2</span>');
};

const deduplicateRepeatedFormattedText = (markdown: string): string => {
  if (!markdown) return markdown;

  // 1. Consecutive identical formatted segments (BBCode/Markdown)
  let cleaned = markdown
    .replace(/(\*\*[^*]+\*\*) \1/g, '$1')
    .replace(/(\*\*[^*]+\*\*)(\1)+/g, '$1')
    .replace(/(\[u\].+?\[\/u\]) \1/g, '$1')
    .replace(/(\[u\].+?\[\/u\])(\1)+/g, '$1')
    .replace(/(\[mask\].+?\[\/mask\]) \1/g, '$1')
    .replace(/(\[mask\].+?\[\/mask\])(\1)+/g, '$1')
    .replace(/(\[color=[^\]]+\].+?\[\/color\]) \1/g, '$1')
    .replace(/(\[color=[^\]]+\].+?\[\/color\])(\1)+/g, '$1');

  // 2. Hybrid duplicates: Plain text followed by its formatted equivalent (or vice versa)
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\*\*\1\*\*/g, '**$1**');
  cleaned = cleaned.replace(/\*\*([^ \n*\[\]]{2,})\*\*\1/g, '**$1**');
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\[u\]\1\[\/u\]/g, '[u]$1[/u]');
  cleaned = cleaned.replace(/\[u\]([^ \n*\[\]]{2,})\[\/u\]\1/g, '[u]$1[/u]');

  // 3. Task list item content duplicated on next line as plain paragraph
  // Matches: "- [ ] content\ncontent" or "- [x] content\ncontent"
  cleaned = cleaned.replace(/^(- \[[ x]\] )(.+)\n\2\n/gm, '$1$2\n');
  cleaned = cleaned.replace(/^(- \[[ x]\] )(.+)\n\2$/gm, '$1$2');

  // 4. Universal BBCode/Markdown tags consecutive duplication fix
  cleaned = cleaned.replace(/(\[([a-z]+)(?:=[^\]]*)?\][\s\S]*?\[\/\2\])\s?\1+/gi, '$1');

  // 5. Double-check generic Markdown bold/italic
  cleaned = cleaned.replace(/(\*\*[^*]+\*\*)\s?\1+/g, '$1');

  // 6. Collapse repeated space-separated tokens anywhere in content.
  //    This fixes corrupted DB rows like: "[mask]X X X X[/mask]" → "[mask]X[/mask]"
  //    Apply iteratively to handle 4→2→1 chains.
  let prev = '';
  while (prev !== cleaned) {
    prev = cleaned;
    // Collapse identical adjacent non-whitespace tokens: "foo foo" → "foo"
    cleaned = cleaned.replace(/(\S+) \1/g, '$1');
  }

  return cleaned;
};

export const validateAndSanitizeMarkdown = (content: string): string => {
  if (!content) return content;
  const converted = convertLegacyHTMLToBBCode(content);
  return deduplicateRepeatedFormattedText(converted);
};
