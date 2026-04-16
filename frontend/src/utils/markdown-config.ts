import { Markdown } from 'tiptap-markdown'
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
 * Advanced BBCode and Formatting Plugin for markdown-it
 * 
 * Instead of global string replacement, we use a structured ruler approach 
 * to identify tags as tokens. This prevents double-parsing and self-replication
 * by decoupling BBCode handling from raw HTML handling.
 */
const bbcodePlugin = (md: any) => {
  const tagMap: Record<string, string> = {
    u: 'u',
    s: 's',
    mark: 'mark',
    mask: 'span',
    color: 'span',
  }

  // Handle [tag] and [/tag] as tokens
  md.inline.ruler.before('text', 'bbcode', (state: any, silent: boolean) => {
    const start = state.pos
    if (state.src.charCodeAt(start) !== 0x5B /* [ */) return false

    const match = state.src.slice(start).match(/^\[(\/?)([a-z]+)(=([^\]]+))?\]/i)
    if (!match) return false

    const isClose = match[1] === '/'
    const tagName = match[2].toLowerCase()
    const attrValue = match[4]
    const htmlTag = tagMap[tagName]

    if (!htmlTag) return false

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

  // Handle ~~strike~~ specifically if markdown-it's default isn't sufficient
  // or needs to be forced to <s>
  const originalStrikethrough = md.renderer.rules.s_open || ((tokens: any, idx: any, options: any, env: any, self: any) => self.renderToken(tokens, idx, options))
  md.renderer.rules.s_open = (tokens: any, idx: any, options: any, env: any, self: any) => {
    tokens[idx].tag = 's' // Force <s> instead of <del>
    return originalStrikethrough(tokens, idx, options, env, self)
  }
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
  }).extend({
    addStorage() {
      return {
        ...this.parent?.(),
        markdown: {
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
