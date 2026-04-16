import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Markdown } from 'tiptap-markdown'
import { Mask } from './src/utils/tiptap-extensions/index.ts'

const editor = new Editor({
  extensions: [
    StarterKit,
    Markdown,
    TaskList,
    TaskItem.configure({ nested: true }).extend({
      addStorage() {
        return {
          markdown: {
            serialize(state, node) {
              state.write(node.attrs.checked ? '[x] ' : '[ ] ')
              const paragraph = node.firstChild
              if (paragraph) {
                state.renderInline(paragraph)
              }
              state.closeBlock(node)
            },
          },
        }
      },
    }),
    Mask,
  ],
  content: '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Hello <span class="mask-text">world</span></p></li></ul>',
})

console.log('MARKDOWN:', editor.storage.markdown.getMarkdown())
