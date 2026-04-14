import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

/**
 * Configure Markdown-It with syntax highlighting
 */
export const createMarkdownRenderer = () => {
  const md: MarkdownIt = new MarkdownIt({
    html: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><code>' +
                 hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                 '</code></pre>'
        } catch (_) {}
      }
      // Use md.utils.escapeHtml safely by ensuring we don't reference md during initialization if possible,
      // although in this closure md is captured after initialization.
      // To be safer and fix circular dependency, we can use hljs.highlightAuto or a separate utility.
      return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
    }
  })

  return md
}

// Global instance for simple usage
export const md = createMarkdownRenderer()

export const renderMarkdown = (content: string) => {
  if (!content) return ''
  return md.render(content)
}
