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
const forceHex = (color?: string): string => {
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
  inclusive: false,
  spanning: false,
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
        getAttrs: element => (element as HTMLElement).classList.contains('mask-text') && null,
        priority: 100,
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
      },
    }
  },
})

/**
 * Hardened Underline
 */
export const MarkdownUnderline = Underline.extend({
  inclusive: false,
  spanning: false,
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
      },
    }
  },
})

/**
 * Hardened Strike
 */
export const MarkdownStrike = Strike.extend({
  inclusive: false,
  spanning: false,
  parseHTML() {
    return [
      {
        tag: 's',
        priority: 100,
      },
      {
        tag: 'del',
        priority: 100,
      },
      {
        tag: 'strike',
        priority: 100,
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
      },
    }
  },
})

/**
 * Hardened Highlight
 */
export const MarkdownHighlight = Highlight.configure({ multicolor: true }).extend({
  inclusive: false,
  spanning: false,
  parseHTML() {
    return [
      {
        tag: 'mark',
        priority: 100,
      },
    ]
  },
  addStorage() {
    return {
      markdown: {
        serialize: {
          open: '[mark]',
          close: '[/mark]',
        },
      },
    }
  },
})

/**
 * Hardened TextStyle with proper markdown color serialization.
 * This is the actual Mark that holds `attrs.color` (set by the Color extension).
 * Color (Extension type) is FILTERED OUT by tiptap-markdown's serializer
 * (.filter(extension.type === 'mark')), so we MUST handle color serialization here.
 */
export const MarkdownTextStyle = TextStyle.extend({
  addStorage() {
    return {
      markdown: {
        serialize: {
          open(_state: any, mark: any) {
            // Build style attribute, converting any rgb() to hex for html input compatibility
            const color = mark.attrs.color ? forceHex(mark.attrs.color) : null
            if (!color) return ''
            return `[color=${color}]`
          },
          close: '[/color]',
        },
        parse: {
          setup: (md: any) => {},
          getAttrs: (tok: any) => {
            return { color: tok.attrGet('color') }
          }
        }
      },
    }
  },
})

// MarkdownColor is kept for its commands (setColor/unsetColor) but its addStorage
// is effectively dead code since Color is an Extension, not a Mark.
// The actual serialization is handled by MarkdownTextStyle above.
export const MarkdownColor = Color.extend({
  inclusive: false,
  spanning: false,
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
