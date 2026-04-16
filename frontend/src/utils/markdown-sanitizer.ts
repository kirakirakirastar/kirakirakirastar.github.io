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
  // This helps clean up cases where the serializer might have outputted 
  // duplicate formatted segments due to extension conflicts or spanning issues.
  // It handles bold (**), underline ([u]), and mask ([mask])
  return markdown
    .replace(/(\*\*[^*]+\*\*) \1/g, '$1') // Space separated duplicates
    .replace(/(\*\*[^*]+\*\*)(\1)+/g, '$1') // Consecutive duplicates
    .replace(/(\[u\].+?\[\/u\]) \1/g, '$1')
    .replace(/(\[u\].+?\[\/u\])(\1)+/g, '$1')
    .replace(/(\[mask\].+?\[\/mask\]) \1/g, '$1')
    .replace(/(\[mask\].+?\[\/mask\])(\1)+/g, '$1');
};

export const validateAndSanitizeMarkdown = (content: string): string => {
  if (!content) return content;
  const converted = convertLegacyHTMLToBBCode(content);
  return deduplicateRepeatedFormattedText(converted);
};
