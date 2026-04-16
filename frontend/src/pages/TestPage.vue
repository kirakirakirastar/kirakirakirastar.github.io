<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Editor Diagnostic Page</h1>
    
    <div class="flex flex-wrap gap-2 mb-6">
      <button @click="startFullTest" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors shadow">
        RUN FULL DIAGNOSTIC
      </button>
      <button @click="editor?.commands.clearContent()" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors shadow">
        CLEAR
      </button>
    </div>
    
    <div v-if="testResults.length" class="mb-8 space-y-4">
      <h2 class="text-lg font-semibold">Diagnostic Results:</h2>
      <div v-for="(res, idx) in testResults" :key="idx" class="p-4 border rounded-lg shadow-sm" :class="res.duplicated ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'">
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold text-gray-800">{{ res.label }}</span>
          <span v-if="res.duplicated" class="text-red-600 font-bold bg-white px-2 py-0.5 rounded border border-red-300">DUPLICATION DETECTED!</span>
          <span v-else class="text-green-600 font-medium">CLEAN</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div class="space-y-1">
            <div class="text-gray-500 uppercase tracking-wider">Input</div>
            <div class="p-2 bg-white rounded border overflow-x-auto whitespace-pre">{{ res.input }}</div>
          </div>
          <div class="space-y-1">
            <div class="text-gray-500 uppercase tracking-wider">Output Markdown</div>
            <div class="p-2 bg-white rounded border overflow-x-auto whitespace-pre">{{ res.outputMd }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mb-4 text-gray-500 text-sm italic">Live Editor View:</div>
    <div class="border rounded-xl shadow-inner overflow-hidden bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
      <EditorContent :editor="editor" class="prose dark:prose-invert max-w-none p-4 min-h-[150px]" />
    </div>
    
    <div class="mt-8 p-4 bg-gray-100 rounded text-xs font-mono">
      <div class="font-bold mb-2">CURRENT STATE DEBUG:</div>
      <div>MD: {{ editor?.storage.markdown.getMarkdown() }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMarkdownEditor } from '../hooks/useMarkdownEditor'
import { EditorContent } from '@tiptap/vue-3'

const testResults = ref<any[]>([])

const { editor } = useMarkdownEditor({
  placeholder: 'Diagnostic editor...',
  onUpdate: () => {}
})

// Expose to window for external scripts
if (typeof window !== 'undefined') {
  (window as any).editor_instance = editor
}

const runDiagnostic = async (label: string, content: string) => {
  if (!editor.value) return
  
  editor.value.commands.setContent(content)
  // Wait for state to settle
  await new Promise(r => setTimeout(r, 150))
  
  const md = editor.value.storage.markdown.getMarkdown()
  const html = editor.value.getHTML()
  
  // Duplication check: look for repeated text within a short span
  // Use a simpler check for this diagnostic: does the output contain the test string twice?
  const testString = "测试1"
  const count = (md.match(new RegExp(testString, 'g')) || []).length
  const inputCount = (content.match(new RegExp(testString, 'g')) || []).length
  
  testResults.value.push({
    label,
    input: content,
    outputMd: md,
    outputHtml: html,
    duplicated: count > inputCount
  })
}

const startFullTest = async () => {
  testResults.value = []
  await runDiagnostic('01. Plain Task', '- [ ] 测试1')
  await runDiagnostic('02. Strike HTML Task', '- [ ] <s>测试1</s>')
  await runDiagnostic('03. Strike BBCode Task', '- [ ] [s]测试1[/s]')
  await runDiagnostic('04. Mask HTML Task', '- [ ] <span class="mask-text">测试1</span>')
  await runDiagnostic('05. Mask BBCode Task', '- [ ] [mask]测试1[/mask]')
  await runDiagnostic('06. Nested HTML Bold', '- [ ] <strong>测试1</strong>')
}
</script>
