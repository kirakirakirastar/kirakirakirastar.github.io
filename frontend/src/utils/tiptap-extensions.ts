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
      // Handled by Tiptap's parseHTML and tiptap-markdown's HTML support
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
      // Handled by Tiptap's parseHTML
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
      // Handled by Tiptap's parseHTML
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
      // Handled by Tiptap's parseHTML
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
      // Using HTML tags for strike avoids the standard Markdown ~~ escaping issues
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

