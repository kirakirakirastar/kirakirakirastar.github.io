import { Mark, mergeAttributes, Extension } from '@tiptap/core'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Highlight from '@tiptap/extension-highlight'
import Color from '@tiptap/extension-color'

/**
 * TypeScript Module Augmentation to let Tiptap know about our custom commands.
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mask: {
      /**
       * Toggle the mask (spoiler) status of the selection.
       */
      toggleMask: () => ReturnType,
    },
  }
}

/**
 * Interface for tiptap-markdown state
 */
interface MarkdownState {
  write: (content: string) => void
  renderContent: (node: any) => void
}

/**
 * Mask (Mosaics/Spoiler) extension
 */
export const Mask = Mark.create({
  name: 'mask',
  addOptions() {
    return {
      HTMLAttributes: {
        class: 'mask-text',
        title: '点击显示/隐藏',
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (node) => (node as HTMLElement).classList.contains('mask-text') && null,
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
  // @ts-ignore
  markdown: {
    serialize: {
      open: '<span class="mask-text">',
      close: '</span>',
    },
    parse: {
      setup(markdownit: any) {
        markdownit.inline.ruler.before('escape', 'mask', (state: any, silent: any) => {
          const startTag = '<span class="mask-text">'
          const endTag = '</span>'
          if (!state.src.startsWith(startTag, state.pos)) return false
          const start = state.pos
          const contentStart = start + startTag.length
          const end = state.src.indexOf(endTag, contentStart)
          if (end === -1) return false
          if (silent) return true
          const oldMax = state.posMax
          state.pos = contentStart
          state.posMax = end
          const token = state.push('mask_open', 'span', 1)
          token.attrs = [['class', 'mask-text']]
          state.md.inline.tokenize(state)
          state.push('mask_close', 'span', -1)
          state.pos = end + endTag.length
          state.posMax = oldMax
          return true
        })
      }
    }
  }
})

/**
 * Enhanced TextStyle with Markdown support
 */
export const MarkdownTextStyle = TextStyle.extend({
  // @ts-ignore
  markdown: {
    serialize: {
      open: '',
      close: '',
    }
  }
})

/**
 * Markdown-compatible Color extension
 */
export const MarkdownColor = Color.extend({
  // @ts-ignore
  markdown: {
    serialize: {
      open(_state: any, mark: any) {
        return mark.attrs.color ? `<span style="color: ${mark.attrs.color}">` : ''
      },
      close(_state: any, mark: any) {
        return mark.attrs.color ? '</span>' : ''
      },
    },
    parse: {
      setup(markdownit: any) {
        markdownit.inline.ruler.before('escape', 'color', (state: any, silent: any) => {
          const regex = /^<span style="color: ([^"]+)">/
          const match = state.src.slice(state.pos).match(regex)
          if (!match) return false
          const startTag = match[0]
          const endTag = '</span>'
          const start = state.pos
          const contentStart = start + startTag.length
          const end = state.src.indexOf(endTag, contentStart)
          if (end === -1) return false
          if (silent) return true
          const color = match[1]
          const oldMax = state.posMax
          state.pos = contentStart
          state.posMax = end
          const token = state.push('textStyle_open', 'span', 1)
          token.attrs = [['style', `color: ${color}`]]
          state.md.inline.tokenize(state)
          state.push('textStyle_close', 'span', -1)
          state.pos = end + endTag.length
          state.posMax = oldMax
          return true
        })
      }
    }
  }
})

/**
 * Markdown-compatible Highlight extension
 */
export const MarkdownHighlight = Highlight.extend({
  // @ts-ignore
  markdown: {
    serialize: {
      open: '<mark>',
      close: '</mark>',
    },
    parse: {
      setup(markdownit: any) {
        markdownit.inline.ruler.before('escape', 'highlight', (state: any, silent: any) => {
          const startTag = '<mark>'
          const endTag = '</mark>'
          if (!state.src.startsWith(startTag, state.pos)) return false
          const start = state.pos
          const contentStart = start + startTag.length
          const end = state.src.indexOf(endTag, contentStart)
          if (end === -1) return false
          if (silent) return true
          const oldMax = state.posMax
          state.pos = contentStart
          state.posMax = end
          state.push('highlight_open', 'mark', 1)
          state.md.inline.tokenize(state)
          state.push('highlight_close', 'mark', -1)
          state.pos = end + endTag.length
          state.posMax = oldMax
          return true
        })
      }
    }
  }
}).configure({ multicolor: true })

/**
 * Markdown-compatible Underline extension
 */
export const MarkdownUnderline = Underline.extend({
  // @ts-ignore
  markdown: {
    serialize: {
      open: '<u>',
      close: '</u>',
    },
    parse: {
      setup(markdownit: any) {
        markdownit.inline.ruler.before('escape', 'underline', (state: any, silent: any) => {
          const startTag = '<u>'
          const endTag = '</u>'
          if (!state.src.startsWith(startTag, state.pos)) return false
          const start = state.pos
          const contentStart = start + startTag.length
          const end = state.src.indexOf(endTag, contentStart)
          if (end === -1) return false
          if (silent) return true
          const oldMax = state.posMax
          state.pos = contentStart
          state.posMax = end
          state.push('underline_open', 'u', 1)
          state.md.inline.tokenize(state)
          state.push('underline_close', 'u', -1)
          state.pos = end + endTag.length
          state.posMax = oldMax
          return true
        })
      }
    }
  }
})

/**
 * Markdown-compatible Strike extension
 */
export const MarkdownStrike = Strike.extend({
  // @ts-ignore
  markdown: {
    serialize: {
      open: '<s>',
      close: '</s>',
    },
    parse: {
      setup(markdownit: any) {
        markdownit.inline.ruler.before('escape', 'strike', (state: any, silent: any) => {
          const startTag = '<s>'
          const endTag = '</s>'
          if (!state.src.startsWith(startTag, state.pos)) return false
          const start = state.pos
          const contentStart = start + startTag.length
          const end = state.src.indexOf(endTag, contentStart)
          if (end === -1) return false
          if (silent) return true
          const oldMax = state.posMax
          state.pos = contentStart
          state.posMax = end
          state.push('strike_open', 's', 1)
          state.md.inline.tokenize(state)
          state.push('strike_close', 's', -1)
          state.pos = end + endTag.length
          state.posMax = oldMax
          return true
        })
      }
    }
  }
})

/**
 * Custom Shortcuts to match Bangumi-style requirements
 */
export const BangumiShortcuts = Extension.create({
  name: 'bangumiShortcuts',
  addKeyboardShortcuts() {
    return {
      'Mod-d': () => this.editor.commands.toggleStrike(),
      'Mod-m': () => this.editor.commands.toggleMark('mask'),
      'Mod-l': () => {
        const previousUrl = this.editor.getAttributes('link').href
        const url = window.prompt('链接地址:', previousUrl)
        if (url === null) return false
        if (url === '') {
          return this.editor.chain().focus().extendMarkRange('link').unsetLink().run()
        }
        return this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
      },
      'Mod-p': () => {
        const url = window.prompt('图片地址:')
        if (url) {
          return this.editor.chain().focus().setImage({ src: url }).run()
        }
        return false
      },
      'Mod-u': () => this.editor.commands.toggleUnderline(),
    }
  },
})

