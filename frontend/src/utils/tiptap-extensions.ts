import { Extension, Mark, mergeAttributes } from '@tiptap/core'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

/**
 * Helper to force color output to HEX format, ensuring browser compatibility
 * and preventing "The specified value 'rgb(...)' does not conform to the required format" errors.
 */
export const forceHex = (color?: string): string => {
  if (!color) return '#000000'
  if (!color.startsWith('rgb')) return color
  
  const rgb = color.match(/\d+/g)
  if (rgb && rgb.length >= 3) {
    const hex = '#' + rgb.slice(0, 3).map(x => {
      const val = parseInt(x).toString(16)
      return val.length === 1 ? '0' + val : val
    }).join('')
    return hex
  }
  return color
}

/**
 * TypeScript Module Augmentation
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mask: {
      toggleMask: () => ReturnType,
    },
    link: {
      setLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType,
      toggleLink: (attributes: { href: string; target?: string | null; rel?: string | null; class?: string | null }) => ReturnType,
      unsetLink: () => ReturnType,
    },
    image: {
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType,
    },
  }
}

/**
 * Mask Extension (Spoiler)
 */
export const Mask = Mark.create({
  name: 'mask',
  inclusive: true,
  spanning: true,
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'mask-text',
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          const el = element as HTMLElement
          return el.classList.contains('mask-text') ? {} : false
        },
        priority: 1000,
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
  addCommands() {
    return {
      toggleMask: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
    }
  },
  addStorage() {
    return {
      markdown: {
        serialize: {
          open: '[mask]',
          close: '[/mask]',
        },
        parse: {
          setup: (md: any) => {},
          getAttrs: (tok: any) => {
            if (tok.type === 'mask_open') return {}
          }
        }
      },
    }
  },
})

/**
 * Hardened Underline
 */
export const MarkdownUnderline = Underline.extend({
  inclusive: true,
  spanning: true,
  parseHTML() {
    return [
      {
        tag: 'u',
        priority: 100,
      },
    ]
  },
  addStorage() {
    return {
      markdown: {
        serialize: {
          open: '[u]',
          close: '[/u]',
        },
        parse: {
          setup: (md: any) => {},
          getAttrs: (tok: any) => {
            if (tok.type === 'underline_open') return {}
          }
        }
      },
    }
  },
})

export const MarkdownStrike = Strike.extend({
  inclusive: true,
  spanning: true,
  parseHTML() {
    return [
      {
        tag: 's',
        priority: 200,
      },
      {
        tag: 'del',
        priority: 200,
      },
      {
        tag: 'strike',
        priority: 200,
      },
    ]
  },
  addStorage() {
    return {
      markdown: {
        serialize: {
          open: '[s]',
          close: '[/s]',
        },
        parse: {
          setup: (md: any) => {},
          getAttrs: (tok: any) => {
            if (tok.type === 'strike_open') return {}
          }
        }
      },
    }
  },
})

/**
 * Hardened TextStyle with unified markdown color AND highlight serialization.
 * This is the ONLY Mark that handles textStyle attributes.
 * By unifying them here, we prevent conflicts between the Color and Highlight extensions.
 */
export const MarkdownTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      color: {
        default: null,
        parseHTML: element => element.style.color || element.getAttribute('color'),
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return {
            style: `color: ${forceHex(attributes.color)}`,
            color: forceHex(attributes.color),
          }
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || (element.tagName === 'MARK' ? 'yellow' : null),
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {}
          return {
            style: `background-color: ${attributes.backgroundColor}`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          const el = element as HTMLElement
          const color = el.style.color || el.getAttribute('color')
          const bg = el.style.backgroundColor
          return (color || bg) ? { color: color ? forceHex(color) : null, backgroundColor: bg } : false
        },
        priority: 100,
      },
      {
        tag: 'mark',
        getAttrs: (element) => {
          if (typeof element === 'string') return false
          const el = element as HTMLElement
          return { backgroundColor: el.style.backgroundColor || 'yellow' }
        },
        priority: 100,
      }
    ]
  },

  addStorage() {
    return {
      markdown: {
        serialize: {
          open(_state: any, mark: any) {
            let tags = ''
            if (mark.attrs.backgroundColor) tags += '[mark]'
            const color = mark.attrs.color ? forceHex(mark.attrs.color) : null
            if (color) tags += `[color=${color}]`
            return tags
          },
          close(_state: any, mark: any) {
            let tags = ''
            const color = mark.attrs.color ? forceHex(mark.attrs.color) : null
            if (color) tags += '[/color]'
            if (mark.attrs.backgroundColor) tags = '[/mark]' + tags
            return tags
          },
        },
        parse: {
          setup: (md: any) => {},
          getAttrs: (tok: any) => {
            const color = tok.attrGet('color') || tok.attrGet('style')?.match(/color:\s*([^;]+)/)?.[1]
            const bg = tok.attrGet('style')?.match(/background-color:\s*([^;]+)/)?.[1]
            return { 
              color: color ? forceHex(color) : null,
              backgroundColor: bg || (tok.tag === 'mark' ? 'yellow' : null)
            }
          }
        }
      },
    }
  },
})

// MarkdownColor is kept only for its commands (setColor/unsetColor)
export const MarkdownColor = Color.extend({
  inclusive: true,
  spanning: true,
})

// MarkdownHighlight is kept only for its commands (setHighlight/toggleHighlight)
export const MarkdownHighlight = Highlight.extend({
  inclusive: true,
  spanning: true,
})


/**
 * Bangumi Shortcuts
 */
export const BangumiShortcuts = Extension.create({
  name: 'bangumiShortcuts',
  addKeyboardShortcuts() {
    return {
      'Mod-d': () => this.editor.commands.toggleStrike(),
      'Mod-m': () => this.editor.commands.toggleMark('mask'),
      'Mod-u': () => this.editor.commands.toggleMark('underline'),
    }
  },
})
