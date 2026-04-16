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
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\s*\*\*\1\*\*/g, '**$1**');
  cleaned = cleaned.replace(/\*\*([^ \n*\[\]]{2,})\*\*\s*\1/g, '**$1**');
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\s*\[u\]\1\[\/u\]/g, '[u]$1[/u]');
  cleaned = cleaned.replace(/\[u\]([^ \n*\[\]]{2,})\[\/u\]\s*\1/g, '[u]$1[/u]');
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\s*\[mask\]\1\[\/mask\]/g, '[mask]$1[/mask]');
  cleaned = cleaned.replace(/\[mask\]([^ \n*\[\]]{2,})\[\/mask\]\s*\1/g, '[mask]$1[/mask]');
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\s*\[mark\]\1\[\/mark\]/g, '[mark]$1[/mask]');
  cleaned = cleaned.replace(/\[mark\]([^ \n*\[\]]{2,})\[\/mark\]\s*\1/g, '[mark]$1[/mask]');

  // 3. Task list item content duplicated on next line as plain paragraph
  // Matches: "- [ ] content\ncontent" or "- [x] content\ncontent"
  cleaned = cleaned.replace(/^(- \[[ x]\] )(.+)\n\2\n/gm, '$1$2\n');
  cleaned = cleaned.replace(/^(- \[[ x]\] )(.+)\n\2$/gm, '$1$2');

  // 4. Universal BBCode/Markdown tags consecutive duplication fix
  cleaned = cleaned.replace(/(\[([a-z]+)(?:=[^\]]*)?\][\s\S]*?\[\/\2\])\s?\1+/gi, '$1');

  // 5. Double-check generic Markdown bold/italic
  cleaned = cleaned.replace(/(\*\*[^*]+\*\*)\s?\1+/g, '$1');

  // 6. Collapse repeated tokens INSIDE BBCode tags aggressively.
  //    Matches any repeating substring of length >= 2, even with invisible chars like ZWSP (\u200B) or missing spaces.
  let prev = '';
  while (prev !== cleaned) {
    prev = cleaned;
    // Target content inside any BBCode tags to avoid [mask] binding to the text token
    cleaned = cleaned.replace(/(\[[a-z]+(?:=[^\]]+)?\])(.+?)(\[\/[a-z]+\])/gi, (match, openTag, inner, closeTag) => {
       let innerPrev = '';
       let innerClean = inner;
       while (innerPrev !== innerClean) {
          innerPrev = innerClean;
          innerClean = innerClean.replace(/(.{2,})[\s\u200B\u200C\u200D\uFEFF]*\1+/g, '$1');
       }
       return openTag + innerClean + closeTag;
    });
  }

  return cleaned;
};

export const validateAndSanitizeMarkdown = (content: string): string => {
  if (!content) return content;
  const converted = convertLegacyHTMLToBBCode(content);
  return deduplicateRepeatedFormattedText(converted);
};
