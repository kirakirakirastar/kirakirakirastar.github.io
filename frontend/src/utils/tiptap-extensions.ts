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
 * 
 * spanning: false prevents the mark from crossing block boundaries, 
 * which is critical for stable Markdown serialization in lists/tasks.
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
          open: '<span class="mask-text">',
          close: '</span>',
          expelEnclosingWhitespace: true,
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
          open: '<u>',
          close: '</u>',
          expelEnclosingWhitespace: true,
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
          open: '<s>',
          close: '</s>',
          expelEnclosingWhitespace: true,
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
          open: '<mark>',
          close: '</mark>',
          expelEnclosingWhitespace: true,
        },
      },
    }
  },
})

export const MarkdownTextStyle = TextStyle
export const MarkdownColor = Color.extend({
  inclusive: false,
  spanning: false,
  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => {
          return (element as HTMLElement).style.color ? null : false
        },
        priority: 90,
      },
    ]
  },
  addStorage() {
    return {
      markdown: {
        serialize: {
          open(state, mark) {
            return `<span style="color: ${mark.attrs.color}">`
          },
          close: '</span>',
          expelEnclosingWhitespace: true,
        },
      },
    }
  },
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
