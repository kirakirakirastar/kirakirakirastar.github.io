import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// @ts-ignore
import emoji from 'markdown-it-emoji'
// @ts-ignore
import anchor from 'markdown-it-anchor'
// @ts-ignore
import toc from 'markdown-it-toc-done-right'
// @ts-ignore
import externalLinks from 'markdown-it-external-links'
// @ts-ignore
import taskLists from 'markdown-it-task-lists'
// @ts-ignore
import footnote from 'markdown-it-footnote'
// @ts-ignore
import abbr from 'markdown-it-abbr'
// @ts-ignore
import container from 'markdown-it-container'
// @ts-ignore
import ins from 'markdown-it-ins'
// @ts-ignore
import mark from 'markdown-it-mark'
// @ts-ignore
import sub from 'markdown-it-sub'
// @ts-ignore
import sup from 'markdown-it-sup'
// @ts-ignore
import katex from 'markdown-it-katex'
// @ts-ignore
import deflist from 'markdown-it-deflist'
// @ts-ignore
import abbr from 'markdown-it-abbr'

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
    .use(taskLists, { label: true, labelAfter: true })
    .use(footnote)
    .use(abbr)
    .use(deflist)
    .use(ins)
    .use(mark)
    .use(sub)
    .use(sup)
    .use(katex, { throwOnError: false, errorColor: ' #cc0000' })

  // BBCode Plugin
  md.core.ruler.after('block', 'bbcode', (state) => {
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'inline') continue
      let content = tokens[i].content

      // [b]...[/b] -> **...** (let MD handle it) or just <strong>
      content = content.replace(/\[b\]([\s\S]*?)\[\/b\]/gi, '<strong>$1</strong>')
      content = content.replace(/\[i\]([\s\S]*?)\[\/i\]/gi, '<em>$1</em>')
      content = content.replace(/\[u\]([\s\S]*?)\[\/u\]/gi, '<u>$1</u>')
      content = content.replace(/\[s\]([\s\S]*?)\[\/s\]/gi, '<s>$1</s>')
      
      // [mask]...[/mask]
      content = content.replace(/\[mask\]([\s\S]*?)\[\/mask\]/gi, '<span class="mask-text">$1</span>')
      
      // [color=red]...[/color]
      content = content.replace(/\[color=([^\]]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color: $1">$2</span>')
      
      // [size=14]...[/size]
      content = content.replace(/\[size=(\d+)\]([\s\S]*?)\[\/size\]/gi, '<span style="font-size: $1px">$2</span>')
      
      // [url=http://...]text[/url]
      content = content.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>')
      // [url]http://...[/url]
      content = content.replace(/\[url\]([\s\S]*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // [img]http://...[/img]
      content = content.replace(/\[img\]([\s\S]*?)\[\/img\]/gi, '<img src="$1" alt="image" />')

      tokens[i].content = content
    }
    return true
  })

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

export const renderMarkdown = (content: string) => {
  if (!content) return ''
  return md.render(content)
}

