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

    if (!htmlTag) return false

    // BALANCE CHECK: If opening, ensure there's a close tag somewhere after it
    if (!isClose) {
      const remaining = state.src.slice(start + match[0].length)
      if (!remaining.toLocaleLowerCase().includes(`[/${tagName}]`)) {
        return false // Not a balanced tag, treat as plain text
      }
    }

    if (!silent) {
      const token = state.push(isClose ? 'bbcode_close' : 'bbcode_open', htmlTag, isClose ? -1 : 1)
      if (!isClose) {
        if (tagName === 'mask') {
          token.attrs = [['class', 'mask-text']]
        } else if (tagName === 'color' && attrValue) {
          token.attrs = [['style', `color: ${attrValue}`]]
        }
      }
    }

    state.pos += match[0].length
    return true
  })

  // Strikethrough Renderer Rule Fix
  // Force <s> instead of <del> for compatibility with our extensions
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
