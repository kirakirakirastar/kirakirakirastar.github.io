import { Extension, Mark, mergeAttributes } from '@tiptap/core'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'

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
      unsetLink: () => ReturnType,
    },
    image: {
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType,
    },
  }
}

/**
 * Mask Extension (Spoiler)
 * Converts to/from <span class="mask-text">
 */
export const Mask = Mark.create({
  name: 'mask',
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
})

/**
 * Use standard extensions for core features to ensure tiptap-markdown compatibility
 * We name them clearly but they keep their internal 'name' for Tiptap
 */
export const MarkdownUnderline = Underline
export const MarkdownStrike = Strike
export const MarkdownHighlight = Highlight.configure({ multicolor: true })
export const MarkdownTextStyle = TextStyle
export const MarkdownColor = Color

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
