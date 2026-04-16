
import MarkdownIt from 'markdown-it';

const tagMap = {
  u: 'u',
  s: 's',
  mark: 'mark',
  mask: 'span',
  color: 'span',
};

const bbcodePlugin = (md) => {
  md.inline.ruler.before('text', 'bbcode', (state, silent) => {
    const start = state.pos;
    if (state.src.charCodeAt(start) !== 0x5B) return false;
    const match = state.src.slice(start).match(/^\[(\/?)([a-z]+)(=([^\]]+))?\]/i);
    if (!match) return false;
    const isClose = match[1] === '/';
    const tagName = match[2].toLowerCase();
    const attrValue = match[4];
    const htmlTag = tagMap[tagName];
    if (!htmlTag) return false;
    if (!silent) {
      const token = state.push(isClose ? 'bbcode_close' : 'bbcode_open', htmlTag, isClose ? -1 : 1);
      if (!isClose) {
        if (tagName === 'mask') token.attrs = [['class', 'mask-text']];
        else if (tagName === 'color' && attrValue) token.attrs = [['style', `color: ${attrValue}`]];
      }
    }
    state.pos += match[0].length;
    return true;
  });
};

const md = new MarkdownIt({ html: true, breaks: true });
md.use(bbcodePlugin);

const testCases = [
  '[s]test[/s]',
  '~~test~~',
  '[u]multi\nline[/u]',
  '[u]nested [s]strike[/s][/u]',
  'Already <u>HTML</u>',
  '[color=red]red text[/color]'
];

console.log('--- Markdown-it Output Diagnosis ---');
testCases.forEach(tc => {
  console.log(`Input: ${tc}`);
  const output = md.renderInline(tc);
  console.log(`Output: ${output}`);
  console.log('---');
});
