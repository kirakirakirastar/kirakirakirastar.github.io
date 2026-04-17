import MarkdownIt from 'markdown-it'
import taskListPlugin from 'markdown-it-task-lists'
import { bbcodePlugin } from './markdown-config'

/**
 * Markdown Sanitizer - Rewritten for Stability (Phase 2)
 */

// Centralized Markdown-It instance for pre-rendering
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
})
  .use(taskListPlugin, { label: true })
  .use(bbcodePlugin)

// Ensure strike-through uses <s>
md.renderer.rules.strike_open = () => '<s>'
md.renderer.rules.strike_close = () => '</s>'


/**
 * Converts legacy HTML formatting tags to BBCode equivalents.
 * We include this in the main validation pass so that even raw HTML in the DB
 * is normalized before hitting the editor.
 */
export const convertLegacyHTMLToBBCode = (markdown: string): string => {
  if (!markdown) return markdown;
  return markdown
    .replace(/<u[^>]*>([\s\S]*?)<\/u>/gi, '[u]$1[/u]')
    .replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, '[s]$1[/s]')
    .replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '[mark]$1[/mark]')
    .replace(/<span[^>]*class=['"][^'"]*mask-text[^'"]*['"][^>]*>([\s\S]*?)<\/span>/gi, '[mask]$1[/mask]')
    .replace(/<span[^>]*style=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/span>/gi, (match, style, content) => {
      let result = content
      const colorMatch = style.match(/color:\s*([^;]+)/)
      const bgMatch = style.match(/background-color:\s*([^;]+)/)
      if (colorMatch) result = `[color=${colorMatch[1].trim()}]${result}[/color]`
      if (bgMatch) result = `[mark]${result}[/mark]`
      return result
    })
    .replace(/<span[^>]*color=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/span>/gi, '[color=$1]$2[/color]')
    .replace(/<mark[^>]*>([\s\S]*?)<\/mark>/gi, '[mark]$1[/mark]');
};

/**
 * Normalizes BBCode and removes proven "bug signature" duplications.
 */
export const validateAndSanitizeMarkdown = (content: string): string => {
  if (!content) return content;

  // 1. Normalize legacy HTML to BBCode first
  let cleaned = convertLegacyHTMLToBBCode(content);

  // 2. Collapse proved corrupted consecutive duplicates of formatted tokens
  //    Matches: "[s]A[/s] [s]A[/s]" -> "[s]A[/s]"
  //    Matches: "[mask]A[/mask][mask]A[/mask]" -> "[mask]A[/mask]"
  const tags = ['u', 's', 'mark', 'mask', 'b', 'i', 'color'];
  for (const tag of tags) {
    const rx = new RegExp(`(\\[${tag}(?:=[^\\]]+)?\\].+?\\[\\/${tag}\\])[\\s\\u200B]*\\1+`, 'gi');
    cleaned = cleaned.replace(rx, '$1');
  }


  // 3. Selective token deduplication has been removed to prevent false positives 
  // with legitimate repeated text (e.g. in Chinese "哈哈").
  // The source-level serialization cleanup in useMarkdownEditor.ts is now the 
  // preferred way to handle duplication.

  return cleaned;
};

/**
 * Industrial-grade Markdown to HTML renderer.
 * Used for pre-loading content into the editor to ensure perfect stability.
 */
export const renderMarkdownToHTML = (markdown: string): string => {
  if (!markdown) return '';
  
  // 1. Sanitize the markdown draft first
  const sanitized = validateAndSanitizeMarkdown(markdown);
  
  // 2. Render to plain HTML using the standalone parser
  // This ensures Tiptap starts in a perfectly clean, processed state.
  return md.render(sanitized);
};
