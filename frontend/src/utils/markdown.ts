// @ts-ignore
import { full as emoji } from 'markdown-it-emoji'
import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-toc-done-right'
import externalLinks from 'markdown-it-external-links'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'
import abbr from 'markdown-it-abbr'
import container from 'markdown-it-container'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import katex from 'markdown-it-katex'
import deflist from 'markdown-it-deflist'

import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

/**
 * Configure Markdown-It with advanced plugins and syntax highlighting
 */
export const createMarkdownRenderer = () => {
  const md: MarkdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      // Basic support for mermaid (will be rendered client-side)
      if (lang === 'mermaid') {
        return `<div class="mermaid">${md.utils.escapeHtml(str)}</div>`
      }

      const codeClass = lang ? `language-${lang}` : 'language-text'
      let highlightedStr = md.utils.escapeHtml(str)
      
      if (lang && hljs.getLanguage(lang)) {
        try {
          highlightedStr = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        } catch (_) {}
      }

      return `<div class="code-block-wrapper">
                <button class="copy-code-btn" data-code="${encodeURIComponent(str)}" title="复制代码">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                </button>
                <pre class="hljs ${codeClass}"><code>${highlightedStr}</code></pre>
              </div>`
    }
  })

  // Add plugins
  md.use(emoji)
    .use(anchor, {
      permalink: anchor.permalink.ariaHidden({
        placement: 'before',
        symbol: '#',
        class: 'header-anchor'
      })
    })
    .use(toc, { level: [2, 3] })
    .use(externalLinks, {
      externalTarget: '_blank',
      externalRel: 'noopener noreferrer'
    })
    .use(taskLists, { label: false })
    .use(footnote)
    .use(abbr)
    .use(deflist)
    .use(ins)
    .use(mark)
    .use(sub)
    .use(sup)
    .use(katex, { throwOnError: false, errorColor: ' #cc0000' })

  // Remove the core.ruler bbcode plugin - it caused duplication in task list items
  // because it modified token.content between the block and inline passes,
  // conflicting with markdown-it-task-lists which also processes inline tokens.
  // BBCode is now handled as a post-processing step on the final HTML string.

  // Custom containers (e.g., ::: info)
  const containers = ['info', 'warning', 'danger', 'success', 'tip', 'note']
  containers.forEach(name => {
    md.use(container, name, {
      render: (tokens: any, idx: any) => {
        const token = tokens[idx]
        const info = token.info.trim().slice(name.length).trim()
        if (token.nesting === 1) {
          return `<div class="admonition ${name}"><p class="admonition-title">${info || name.toUpperCase()}</p>\n`
        } else {
          return '</div>\n'
        }
      }
    })
  })

  return md
}

// Global instance for simple usage
export const md = createMarkdownRenderer()

/**
 * Post-process rendered HTML to convert BBCode tags to HTML.
 * This runs AFTER markdown-it and all its plugins (including task-lists),
 * so there is no interference with token-level processing.
 */
const applyBBCode = (html: string): string => {
  if (!html) return html
  return html
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
    .replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>')
    .replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<s>$1</s>')
    .replace(/\[mask\]([\s\S]*?)\[\/mask\]/gi, '<span class="mask-text">$1</span>')
    .replace(/\[mark\]([\s\S]*?)\[\/mark\]/gi, '<mark>$1</mark>')
    .replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color: $1">$2</span>')
    .replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size: $1px">$2</span>')
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
    .replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" alt="image" />')
}

/**
 * Wraps task list input and content in dedicated containers for stable styling.
 */
const wrapTaskItems = (html: string): string => {
  if (!html) return html
  // Matches task-list-item <li> tags and their checkbox inputs
  // Wraps input in .task-marker and everything else in .task-content
  return html.replace(
    /(<li class="task-list-item"[^>]*>)\s*(<input[^>]*>)([\s\S]*?)(?=<\/li>)/gi,
    '$1<div class="task-marker">$2</div><div class="task-content">$3</div>'
  )
}

export const renderMarkdown = (content: string) => {
  if (!content) return ''
  let html = md.render(content)
  html = applyBBCode(html)
  return wrapTaskItems(html)
}

