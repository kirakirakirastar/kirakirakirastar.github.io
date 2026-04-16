import { Markdown, type MarkdownStorage } from 'tiptap-markdown'
import type MarkdownIt from 'markdown-it'

/**
 * Augment the MarkdownStorage interface to include markdownit
 */
declare module 'tiptap-markdown' {
  interface MarkdownStorage {
    markdownit: MarkdownIt
  }
}

/**
 * Balanced-Tag BBCode and Formatting Plugin for markdown-it
 * 
 * This version implements balanced checks to ensure [tag] is only parsed
 * if a corresponding [/tag] exists. This prevents unclosed tags from
 * causing "greedy" parses that duplicate content or leak formatting.
 */
const bbcodePlugin = (md: any) => {
  const tagMap: Record<string, string> = {
    u: 'u',
    s: 's',
    mark: 'mark',
    mask: 'span',
    color: 'span',
  }

  const markMap: Record<string, string> = {
    u: 'underline',
    s: 'strike',
    mark: 'highlight',
    mask: 'mask',
    color: 'textStyle',
  }

  // Guard: prevent duplicate registration when parse() is called multiple times
  if ((md.inline.ruler as any).__find__('bbcode') !== -1) return

  // Handle [tag] and [/tag] as tokens with balancedness check
  md.inline.ruler.before('text', 'bbcode', (state: any, silent: boolean) => {
    const start = state.pos
    if (state.src.charCodeAt(start) !== 0x5B /* [ */) return false

    // Look for [tag], [tag=value], or [/tag]
    const match = state.src.slice(start).match(/^\[(\/?)([a-z]+)(=([^\]]+))?\]/i)
    if (!match) return false

    const isClose = match[1] === '/'
    const tagName = match[2].toLowerCase()
    const attrValue = match[4]
    const htmlTag = tagMap[tagName]
    const markName = markMap[tagName]

    if (!htmlTag) return false

    // BALANCE CHECK: If opening, ensure there's a close tag somewhere after it
    if (!isClose) {
      const remaining = state.src.slice(start + match[0].length)
      if (!remaining.toLocaleLowerCase().includes(`[/${tagName}]`)) {
        return false // Not a balanced tag, treat as plain text
      }
    }

    if (!silent) {
      if (markName) {
        const tokenType = isClose ? `${markName}_close` : `${markName}_open`
        const token = state.push(tokenType, htmlTag, isClose ? -1 : 1)
        if (!isClose && tagName === 'color' && attrValue) {
          token.attrs = [['color', attrValue]]
        }
      } else {
        const token = state.push(isClose ? 'bbcode_close' : 'bbcode_open', htmlTag, isClose ? -1 : 1)
        if (!isClose) {
          if (tagName === 'mask') {
            token.attrs = [['class', 'mask-text']]
          } else if (tagName === 'color' && attrValue) {
            token.attrs = [['style', `color: ${attrValue}`]]
          }
        }
      }
    }

    state.pos += match[0].length
    return true
  })

  // Handle legacy HTML formatting tags (<u>, <s>, <mark>, <span class="mask-text">) natively to avoid tiptap-markdown duplication bug!
  md.inline.ruler.before('html_inline', 'legacy_html_marks', (state: any, silent: boolean) => {
    const start = state.pos
    if (state.src.charCodeAt(start) !== 0x3C /* < */) return false
    
    // Look for closing tags </u>, </s>, </mark>, </span>
    const closeMatch = state.src.slice(start).match(/^<\/(u|s|mark|span)>/i)
    if (closeMatch) {
      if (!silent) {
        const tag = closeMatch[1].toLowerCase()
        let markName = ''
        if (tag === 'u') markName = 'underline'
        else if (tag === 's') markName = 'strike'
        else if (tag === 'mark') markName = 'highlight'
        else if (tag === 'span') markName = 'mask' // We assume </span> closes mask safely
        
        if (markName) {
          state.push(`${markName}_close`, tag, -1)
        }
      }
      state.pos += closeMatch[0].length
      return true
    }

    // Look for opening tags
    const openMatch = state.src.slice(start).match(/^<(u|s|mark|span(?:\s+class="mask-text"|\s+style="color:\s*([^;"]+)")?)>/i)
    if (openMatch) {
      if (!silent) {
        const fullTag = openMatch[1].toLowerCase()
        let markName = ''
        const attrs: string[][] = []

        if (fullTag.startsWith('u')) markName = 'underline'
        else if (fullTag.startsWith('s')) { if (!fullTag.startsWith('span')) markName = 'strike' }
        else if (fullTag.startsWith('mark')) markName = 'highlight'
        else if (fullTag.startsWith('span')) {
           if (fullTag.includes('mask-text')) markName = 'mask'
           else if (openMatch[2]) {
             markName = 'textStyle'
             attrs.push(['color', openMatch[2]])
           }
        }

        if (markName) {
          const token = state.push(`${markName}_open`, fullTag.split(' ')[0], 1)
          if (attrs.length) token.attrs = attrs
        } else {
           // If we matched span but no known mark, just let html_inline handle it
           return false
        }
      }
      state.pos += openMatch[0].length
      return true
    }
    return false
  })

  // Strikethrough Renderer Rule Fix
  const fixRenderer = (tokens: any, idx: any, options: any, env: any, self: any) => {
    tokens[idx].tag = 's'
    return self.renderToken(tokens, idx, options)
  }
  md.renderer.rules.s_open = fixRenderer
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
    // Enable clipboard and paste handling for better state sync
    transformPastedText: true,
    ...options,
  }).extend({
    addStorage() {
      const parentStorage = (this.parent?.() || {}) as any
      return {
        ...parentStorage,
        markdown: {
          ...(parentStorage.markdown || {}),
          parse: {
            setup: (md: any) => {
              md.use(bbcodePlugin)
            }
          }
        }
      }
    }
  })
}
