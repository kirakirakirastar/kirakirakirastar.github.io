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
    .replace(/<span\s+class="mask-text">([\s\S]*?)<\/span>/gi, '[mask]$1[/mask]')
    .replace(/<span\s+style=["']color:\s*([^;"']+)["']>([\s\S]*?)<\/span>/gi, '[color=$1]$2[/color]')
};

export const validateAndSanitizeMarkdown = (content: string): string => {
  if (!content) return content;
  return convertLegacyHTMLToBBCode(content);
};
