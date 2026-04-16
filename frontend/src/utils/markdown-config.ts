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
 */
export const createMarkdownExtension = (options: any = {}) => {
  return Markdown.configure({
    html: true,
    tightLists: true,
    bulletListMarker: '-',
    linkify: true,
    breaks: true,
    ...options,
    // Explicitly override serializers here as well 
    // (some versions of tiptap-markdown use this directly)
    serializer: {
        strike: (state: any, mark: any) => {
          state.write('<s>')
          state.renderContent(mark)
          state.write('</s>')
        },
        underline: (state: any, mark: any) => {
          state.write('<u>')
          state.renderContent(mark)
          state.write('</u>')
        },
        highlight: (state: any, mark: any) => {
          state.write('<mark>')
          state.renderContent(mark)
          state.write('</mark>')
        },
        mask: (state: any, mark: any) => {
          state.write('<span class="mask-text">')
          state.renderContent(mark)
          state.write('</span>')
        },
        textStyle: (state: any, mark: any) => {
          if (mark.attrs.color) {
            state.write(`<span style="color: ${mark.attrs.color}">`)
            state.renderContent(mark)
            state.write('</span>')
          } else {
            state.renderContent(mark)
          }
        }
    }
  }).extend({
    // Use onBeforeCreate to ensure markdown-it is configured before any content parsing happens
    onBeforeCreate() {
      const md = this.storage.markdownit
      if (md) {
        md.use(bbcodePlugin)
      }
    }
  })
}
