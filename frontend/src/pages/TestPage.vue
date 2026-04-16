<template>
  <div>
    <button @click="testContent">TEST</button>
    <div ref="editorDiv"></div>
    <EditorContent :editor="editor" v-if="editor" />
  </div>
</template>

<script setup lang="ts">
import { useMarkdownEditor } from '../hooks/useMarkdownEditor'
import { EditorContent } from '@tiptap/vue-3'

import { watchEffect } from 'vue'

const { editor } = useMarkdownEditor({
  placeholder: 'test',
  onUpdate: console.log
})

watchEffect(() => {
  if (editor.value) window.editor_ref = editor.value
})

const testContent = () => {
  editor.value?.commands.setContent('- [ ] <span class="mask-text">测试内容</span>')
  if (window.__DOUBLE_SETCONTENT__) {
      const md = editor.value?.storage.markdown.getMarkdown();
      editor.value?.commands.setContent(md); // simulating pass 2
  }
  console.log('MARKDOWN:', editor.value?.storage.markdown.getMarkdown())
  console.log('HTML:', editor.value?.getHTML())
}
</script>
