/**
 * useMarkdownEditor — Shared Tiptap editor composable.
 *
 * Encapsulates the common setup logic for all rich-text editors (Notes, Journals, Hobbies):
 *  - Extension registration (StarterKit, Table, TaskList, custom marks, etc.)
 *  - Image upload via paste / drag-and-drop / file input
 *  - onUpdate debounce (avoids serializing the entire document tree on every keystroke)
 *  - getEditorColor utility
 *
 * Each editor page only needs to provide:
 *  - `placeholder`     — the editor placeholder string
 *  - `onUpdate`        — callback called with the serialized markdown (debounced, 400ms)
 *  - `isPrivate`       — whether uploaded images go to the private bucket
 *  - `imageBucket`     — Supabase storage bucket name (default: 'images')
 */
import { useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Typography } from '@tiptap/extension-typography'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Link } from '@tiptap/extension-link'
import { Mask, BangumiShortcuts, MarkdownUnderline, MarkdownColor, MarkdownTextStyle, MarkdownHighlight, MarkdownStrike } from '@/utils/tiptap-extensions'
import { createMarkdownExtension } from '@/utils/markdown-config'
import { uploadApi } from '@/api/upload'
import { resolveAssetUrl } from '@/api/http'
import { useUiStore } from '@/stores/ui'
import { ref, type Ref } from 'vue'

export interface UseMarkdownEditorOptions {
  /** Placeholder text shown in the empty editor */
  placeholder: string
  /** Called with the serialized Markdown string, debounced at 400ms */
  onUpdate: (markdown: string) => void
  /** Whether uploaded images should go to the private storage path */
  isPrivate?: Ref<boolean> | (() => boolean)
  /** Supabase storage bucket (default: 'images') */
  imageBucket?: string
}

export function useMarkdownEditor(options: UseMarkdownEditorOptions) {
  const uiStore = useUiStore()
  const { placeholder, onUpdate, imageBucket = 'images' } = options

  // Resolve isPrivate to a plain getter
  const getIsPrivate = (): boolean => {
    if (!options.isPrivate) return false
    if (typeof options.isPrivate === 'function') return options.isPrivate()
    return options.isPrivate.value
  }

  // Debounce timer — avoids calling getMarkdown() on every keystroke
  let _markdownSyncTimer: ReturnType<typeof setTimeout> | null = null

  const uploadAndInsertImage = async (file: File) => {
    if (!editor.value) return
    try {
      const result = await uploadApi.image(file, getIsPrivate(), imageBucket)
      editor.value.chain().focus().setImage({ src: resolveAssetUrl(result.url), alt: result.original_name }).run()
    } catch (error) {
      console.error('上传图片失败:', error)
      uiStore.addToast('上传图片失败', 'error')
    }
  }

  const editor = useEditor({
    extensions: [
      createMarkdownExtension(),
      StarterKit.configure(),
      MarkdownTextStyle,
      MarkdownUnderline,
      MarkdownHighlight,
      MarkdownColor,
      MarkdownStrike,
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false }),
      Mask,
      BangumiShortcuts,
      Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: '',
    editorProps: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || [])
        const imageItems = items.filter(item => item.type.startsWith('image'))
        if (imageItems.length > 0) {
          event.preventDefault()
          imageItems.forEach(item => {
            const file = item.getAsFile()
            if (file) uploadAndInsertImage(file)
          })
          return true
        }
        return false
      },
      handleDrop(view, event, slice, moved) {
        if (!moved && event.dataTransfer?.files?.[0]) {
          const imageFiles = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image'))
          if (imageFiles.length > 0) {
            event.preventDefault()
            imageFiles.forEach(file => uploadAndInsertImage(file))
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      if (_markdownSyncTimer) clearTimeout(_markdownSyncTimer)
      _markdownSyncTimer = setTimeout(() => {
        onUpdate(editor.storage.markdown.getMarkdown())
      }, 400)
    },
  })

  /** Returns the current text color in #rrggbb format */
  const getEditorColor = (): string => {
    const color = editor.value?.getAttributes('textStyle').color
    if (!color) return '#000000'
    if (color.startsWith('rgb')) {
      const rgb = color.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        return '#' + rgb.slice(0, 3).map((x: string) => parseInt(x).toString(16).padStart(2, '0')).join('')
      }
    }
    return color
  }

  /** Handles <input type="file"> change events for image upload */
  const handleImageUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) uploadAndInsertImage(file)
  }

  return {
    editor,
    uploadAndInsertImage,
    handleImageUpload,
    getEditorColor,
  }
}
