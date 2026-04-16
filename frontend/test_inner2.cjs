const strings = [
  '[mask]测试内容 测试内容[/mask]',
  '[mask]测试内容 测试内容 测试内容 测试内容[/mask]',
  '[color=#ff0000]红色 红色 红色[/color]',
  '[size=16]巨大 巨大[/size]',
  '普通文本 普通文本',
  '这是一个 [mask]测试内容 测试内容[/mask] 啊',
  '- [ ] [mask]项目 项目[/mask]'
];

let res = strings.map(s => {
  let prev = '';
  let cleaned = s;
  while(prev !== cleaned) {
    prev = cleaned;
    
    // 1. Deduplicate consecutive identical words inside a string (not involving tags)
    // Actually we only want to do this if it's safe. What if we just match any repeating words that are identical?
    // /(.+?)\s+\1/ is dangerous if it's like a word boundary.
    // What about plain non-whitespace tokens?
    
    // Replace non-whitespace string identical repetitions inside BBCode.
    // Specifically looking at the space delimited tokens.
    // Let's just find bbcode blocks, and clean their contents.
    cleaned = cleaned.replace(/(\[[a-z]+(?:=[^\]]+)?\])(.+?)(\[\/[a-z]+\])/gi, (match, openTag, inner, closeTag) => {
       let innerPrev = '';
       let innerClean = inner;
       while (innerPrev !== innerClean) {
          innerPrev = innerClean;
          innerClean = innerClean.replace(/(\S+)\s+\1/g, '$1');
       }
       return openTag + innerClean + closeTag;
    });

    // Also apply to whole string for raw words?
    cleaned = cleaned.replace(/(\b\S+)\s+\1\b/g, '$1');
    // But for Chinese words \b doesn't work well!
    // Let's use the bbcode approach, since that's what corrupted for sure.
  }
  return cleaned;
});

console.log(JSON.stringify(res, null, 2));
