/**
 * Detects and removes duplication artifacts in Markdown content.
 * Also logs diagnostic info if duplication is found.
 */
export const convertLegacyHTMLToBBCode = (markdown: string): string => {
  if (!markdown) return markdown;
  return markdown
    .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '[u]$1[/u]')
    .replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '[s]$1[/s]')
    .replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '[mark]$1[/mark]')
    .replace(/<span[^>]*class=["'][^"']*mask-text[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi, '[mask]$1[/mask]')
    .replace(/<span[^>]*style=["']color:\s*([^;"']+)["'][^>]*>([\s\S]*?)<\/span>/gi, '[color=$1]$2[/color]')
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
  // This specifically targets the "tiptap fallback" duplication
  // Matches: word**word** -> **word**
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\*\*\1\*\*/g, '**$1**');
  // Matches: **word**word -> **word**
  cleaned = cleaned.replace(/\*\*([^ \n*\[\]]{2,})\*\*\1/g, '**$1**');
  // Matches: word[u]word[/u] -> [u]word[/u]
  cleaned = cleaned.replace(/([^ \n*\[\]]{2,})\[u\]\1\[\/u\]/g, '[u]$1[/u]');
  // Matches: [u]word[/u]word -> [u]word[/u]
  cleaned = cleaned.replace(/\[u\]([^ \n*\[\]]{2,})\[\/u\]\1/g, '[u]$1[/u]');

  // 3. Consecutive task list items (redundant serialization)
  cleaned = cleaned.replace(/(- \[ [x ] \] .+?)\n\1/g, '$1');

  // 4. Task list specific hybrid duplication fix
  // Matches: - [ ] word**word** -> - [ ] **word**
  cleaned = cleaned.replace(/(- \[ [x ] \] )([^ \n*\[\]]{2,})\*\*\2\*\*/g, '$1**$2**');

  return cleaned;
};

export const validateAndSanitizeMarkdown = (content: string): string => {
  if (!content) return content;
  const converted = convertLegacyHTMLToBBCode(content);
  return deduplicateRepeatedFormattedText(converted);
};
