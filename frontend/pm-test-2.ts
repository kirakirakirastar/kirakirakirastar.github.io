import MarkdownIt from 'markdown-it'

const tagMap: Record<string, string> = {
  u: 'u',
  s: 's',
  mark: 'mark',
  mask: 'span',
  color: 'span',
}

const bbcodePlugin = (md: any) => {
  md.inline.ruler.before('text', 'bbcode', (state: any, silent: boolean) => {
    const start = state.pos
    if (state.src.charCodeAt(start) !== 0x5B /* [ */) return false

    const match = state.src.slice(start).match(/^\[(\/?)([a-z]+)(=([^\]]+))?\]/i)
    if (!match) return false

    const isClose = match[1] === '/'
    const tagName = match[2].toLowerCase()
    const attrValue = match[4]
    const htmlTag = tagMap[tagName]

    if (!htmlTag) return false

    if (!isClose) {
      const remaining = state.src.slice(start + match[0].length)
      if (!remaining.toLowerCase().includes(`[/${tagName}]`)) {
        return false // Not a balanced tag, treat as plain text
      }
    }

    if (!silent) {
      const token = state.push(isClose ? 'bbcode_close' : 'bbcode_open', htmlTag, isClose ? -1 : 1)
      if (!isClose) {
        if (tagName === 'mask') {
          token.attrs = [['class', 'mask-text']]
        } else if (tagName === 'color' && attrValue) {
          token.attrs = [['style', `color: ${attrValue}`]]
        }
      }
    }

    state.pos += match[0].length
    return true
  })
}

const md = new MarkdownIt({ html: true }).use(bbcodePlugin)

console.log("RENDER BBCODE:")
console.log(md.render("[mask]word[/mask]"))
console.log(md.render("<u>word</u>"))
