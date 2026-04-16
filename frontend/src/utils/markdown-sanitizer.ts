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

  // 3. Task-List Specific Aggressive Cleaning
  //    Matches: "- [ ] [s]测试1 测试1[/s]"
  cleaned = cleaned.replace(/^(- \[[ x]\] )([\s\S]+?)$/gm, (line, prefix, content) => {
    // Inside a task line, if we find any repetition of 2+ chars within any tag
    return prefix + content.replace(/(\[[a-z]+(?:=[^\]]+)?\])(.+?)(\[\/[a-z]+\])/gi, (tagMatch, open, inner, close) => {
      let innerPrev = '';
      let innerClean = inner;
      while (innerPrev !== innerClean) {
        innerPrev = innerClean;
        innerClean = innerClean.replace(/(.{2,})[\s\u200B]*\1+/g, '$1');
      }
      return open + innerClean + close;
    });
  });

  // (Removed previous generic double-setContent loop logic in favor of this single targeted pass)
  if (cleaned !== markdown) {
    console.warn('[SANITIZER] Aggressively cleaned TaskList duplicates.');
  }

  // 4. Universal BBCode/Markdown tags consecutive duplication fix
  cleaned = cleaned.replace(/(\[([a-z]+)(?:=[^\]]*)?\][\s\S]*?\[\/\2\])\s?\1+/gi, '$1');

  // 5. Double-check generic Markdown bold/italic
  cleaned = cleaned.replace(/(\*\*[^*]+\*\*)\s?\1+/g, '$1');

  return cleaned;
};

export const validateAndSanitizeMarkdown = (content: string): string => {
  if (!content) return content;
  const converted = convertLegacyHTMLToBBCode(content);
  return deduplicateRepeatedFormattedText(converted);
};
