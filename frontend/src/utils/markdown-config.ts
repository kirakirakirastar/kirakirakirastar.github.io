import { Markdown, type MarkdownStorage } from 'tiptap-markdown'
import type MarkdownIt from 'markdown-it'
import taskListPlugin from 'markdown-it-task-lists'
import { forceHex } from './tiptap-extensions'

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
export const bbcodePlugin = (md: any) => {
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
    mark: 'textStyle',
    mask: 'mask',
    color: 'textStyle',
  }

  const findBalancedClosingTag = (source: string, from: number, tagName: string): number => {
    const tagRegex = /\[(\/)?([a-z]+)(=([^\]]+))?\]/gi
    tagRegex.lastIndex = from
    const stack = [tagName]
    let match: RegExpExecArray | null

    while ((match = tagRegex.exec(source)) !== null) {
      const matchedTagName = match[2].toLowerCase()
      if (!tagMap[matchedTagName]) continue

      if (match[1] === '/') {
        if (stack[stack.length - 1] !== matchedTagName) return -1
        stack.pop()
        if (stack.length === 0) return match.index
      } else {
        stack.push(matchedTagName)
      }
    }

    return -1
  }

  const hasMatchingOpeningTag = (source: string, until: number, tagName: string): boolean => {
    const tagRegex = /\[(\/)?([a-z]+)(=([^\]]+))?\]/gi
    const stack: string[] = []
    let match: RegExpExecArray | null

    while ((match = tagRegex.exec(source)) !== null && match.index < until) {
      const matchedTagName = match[2].toLowerCase()
      if (!tagMap[matchedTagName]) continue

      if (match[1] === '/') {
        if (stack.length > 0 && stack[stack.length - 1] === matchedTagName) {
          stack.pop()
        }
      } else {
        stack.push(matchedTagName)
      }
    }

    return stack.length > 0 && stack[stack.length - 1] === tagName
  }

  // Guard: prevent duplicate registration
  if ((md.inline.ruler as any).__find__('bbcode') !== -1) return

  // Handle [tag] and [/tag] as tokens with balancedness check
  md.inline.ruler.before('text', 'bbcode', (state: any, silent: boolean) => {
    const start = state.pos
    if (state.src.charCodeAt(start) !== 0x5B /* [ */) return false

    const match = state.src.slice(start).match(/^\[(\/?)([a-z]+)(=([^\]]+))?\]/i)
    if (!match) return false

    const isClose = match[1] === '/'
    const tagName = match[2].toLowerCase()
    const attrValue = match[4]
    
    const htmlTag = tagMap[tagName]
    const markName = markMap[tagName]

    if (!htmlTag || !markName) return false

    if (isClose) {
      if (!hasMatchingOpeningTag(state.src, start, tagName)) return false
    } else {
      const closeTagIndex = findBalancedClosingTag(state.src, start + match[0].length, tagName)
      if (closeTagIndex === -1) return false
    }

    if (!silent) {
      const tokenType = isClose ? `${markName}_close` : `${markName}_open`
      const token = state.push(tokenType, htmlTag, isClose ? -1 : 1)

      if (!isClose) {
        if (tagName === 'mask') {
          token.attrs = [['class', 'mask-text']]
        } else if (tagName === 'mark') {
          token.attrs = [['style', 'background-color: yellow']]
        } else if (tagName === 'color' && attrValue) {
          const hex = forceHex(attrValue)
          token.attrs = [
            ['color', hex],
            ['style', `color: ${hex}`]
          ]
        }
      }
    }

    state.pos += match[0].length
    return true
  })

  // Strike-through renderer rules
  md.renderer.rules.strike_open = (tokens: any, idx: any, options: any, env: any, self: any) => {
    tokens[idx].tag = 's'
    return self.renderToken(tokens, idx, options)
  }
  md.renderer.rules.strike_close = (tokens: any, idx: any, options: any, env: any, self: any) => {
    tokens[idx].tag = 's'
    return self.renderToken(tokens, idx, options)
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
    transformPastedText: false,
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
              md.use(taskListPlugin, { label: true })
              md.use(bbcodePlugin)
            }
          }
        }
      }
    }
  })
}
