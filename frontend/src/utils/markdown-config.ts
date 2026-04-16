import { Markdown } from 'tiptap-markdown'
import type MarkdownIt from 'markdown-it'

/**
 * Augment the MarkdownStorage interface to include markdownit, 
 * which is present at runtime but missing from the library's type definitions.
 */
declare module 'tiptap-markdown' {
  interface MarkdownStorage {
    markdownit: MarkdownIt
  }
}

/**
 * Robust BBCode-to-HTML and Strike conversion plugin for markdown-it
 */
const bbcodePlugin = (md: any) => {
  md.core.ruler.after('block', 'bbcode_to_html', (state: any) => {
    state.tokens.forEach((token: any) => {
      if (token.type !== 'inline') return
      
      let content = token.content

      // Pre-process common markers to HTML tags for stability
      // We handle potential escaping (e.g. \[u\]) by matching an optional backslash
      content = content.replace(/\\?\[u\\?\]([\s\S]*?)\\?\[\/u\\?\]/gi, '<u>$1</u>')
      content = content.replace(/\\?\[s\\?\]([\s\S]*?)\\?\[\/s\\?\]/gi, '<s>$1</s>')
      content = content.replace(/~~(?!\s)([\s\S]*?)(?<!\s)~~/g, '<s>$1</s>')
      content = content.replace(/\\?\[mark\\?\]([\s\S]*?)\\?\[\/mark\\?\]/gi, '<mark>$1</mark>')
      content = content.replace(/\\?\[mask\\?\]([\s\S]*?)\\?\[\/mask\\?\]/gi, '<span class="mask-text">$1</span>')
      content = content.replace(/\\?\[color=([^\]]+)\\?\]([\s\S]*?)\\?\[\/color\\?\]/gi, '<span style="color: $1">$2</span>')

      token.content = content
    })
    return true
  })
}

/**
 * Centralized Markdown Extension Factory
 * 
 * NOTE: We avoid using onBeforeCreate() override here because it breaks 
 * the base Markdown extension's internal initialization logic.
 */
export const createMarkdownExtension = (options: any = {}) => {
  return Markdown.configure({
    html: true,
    tightLists: true,
    bulletListMarker: '-',
    linkify: true,
    breaks: true,
    ...options,
  }).extend({
    addStorage() {
      return {
        ...this.parent?.(),
        markdown: {
          parse: {
            // This hook is called by tiptap-markdown to configure the markdown-it instance
            setup: (md: any) => {
              md.use(bbcodePlugin)
            }
          }
        }
      }
    }
  })
}
