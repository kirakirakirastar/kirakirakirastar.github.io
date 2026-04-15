import { Mark, mergeAttributes, Extension } from '@tiptap/core'

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
    underline: {
      /**
       * Toggle underline
       */
      toggleUnderline: () => ReturnType,
    },
    color: {
      /**
       * Set text color
       */
      setColor: (color: string) => ReturnType,
      /**
       * Unset text color
       */
      unsetColor: () => ReturnType,
    },
    highlight: {
      /**
       * Toggle highlight
       */
      toggleHighlight: (attributes?: { color: string }) => ReturnType,
    }
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
    serialize(state: MarkdownState, mark: any) {
      state.write('[mask]')
      state.renderContent(mark)
      state.write('[/mask]')
    },
    parse: {
      setup(markdownit: any) {
        // Handled by markdown-it custom rule in our renderer
      }
    }
  }
})

/**
 * Enhanced TextStyle with Markdown support
 */
export const MarkdownTextStyle = Extension.create({
  name: 'textStyle',
  // @ts-ignore
  markdown: {
    serialize: {
      open: '',
      close: '',
    },
    parse: {
      setup(markdownit: any) {
        // Just a container
      }
    }
  }
})

/**
 * Markdown-compatible Color extension
 */
export const MarkdownColor = Mark.create({
  name: 'color', 
  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.style.color || (element as HTMLElement).getAttribute('data-color'),
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return { style: `color: ${attributes.color}`, 'data-color': attributes.color }
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span', getAttrs: element => (element as HTMLElement).style.color ? {} : false }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      setColor: color => ({ chain }) => {
        return chain()
          .setMark('textStyle')
          .setMark(this.name, { color })
          .run()
      },
      unsetColor: () => ({ chain }) => {
        return chain()
          .unsetMark(this.name)
          .run()
      },
    }
  },
  // @ts-ignore
  markdown: {
    serialize(state: MarkdownState, mark: any) {
      if (!mark.attrs.color) return
      state.write(`<span style="color: ${mark.attrs.color}">`)
      state.renderContent(mark)
      state.write('</span>')
    },
    parse: {
      setup(markdownit: any) {
        // html: true handled by markdown-it
      }
    }
  }
})

/**
 * Markdown-compatible Highlight extension
 */
export const MarkdownHighlight = Mark.create({
  name: 'highlight',
  addOptions() {
    return {
      multicolor: true,
      HTMLAttributes: {},
    }
  },
  addAttributes() {
    if (!this.options.multicolor) return {}
    return {
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return { 'data-color': attributes.color, style: `background-color: ${attributes.color}` }
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'mark' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },
  addCommands() {
    return {
      toggleHighlight: attributes => ({ commands }) => {
        return commands.toggleMark(this.name, attributes)
      },
    }
  },
  // @ts-ignore
  markdown: {
    serialize(state: MarkdownState, mark: any) {
      state.write('<mark>')
      state.renderContent(mark)
      state.write('</mark>')
    },
    parse: {
      setup(markdownit: any) {
        // html: true handles <mark>
      }
    }
  }
})

/**
 * Markdown-compatible Underline extension
 */
export const MarkdownUnderline = Mark.create({
  name: 'underline',
  parseHTML() {
    return [
      { tag: 'u' },
      { style: 'text-decoration=underline' },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return ['u', HTMLAttributes, 0]
  },
  addCommands() {
    return {
      toggleUnderline: () => ({ commands }) => {
        return commands.toggleMark(this.name)
      },
    }
  },
  // @ts-ignore
  markdown: {
    serialize(state: MarkdownState, mark: any) {
      state.write('<u>')
      state.renderContent(mark)
      state.write('</u>')
    },
    parse: {
      setup(markdownit: any) {
         // Standard markdown-it handles <u> if html is enabled
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
