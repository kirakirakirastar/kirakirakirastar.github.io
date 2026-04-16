const md = '1. RAW from DB: - [ ] [s]测试 测试 测试 测试 测试 测试 测试 测试[/s]';
let cleaned = md.replace(/(\[[a-z]+(?:=[^\]]+)?\])(.+?)(\[\/[a-z]+\])/gi, (match, openTag, inner, closeTag) => {
   let innerPrev = '';
   let innerClean = inner;
   while (innerPrev !== innerClean) {
      innerPrev = innerClean;
      innerClean = innerClean.replace(/(.{2,})[\s\u200B\u200C\u200D\uFEFF]*\1+/g, '$1');
   }
   return openTag + innerClean + closeTag;
});
console.log(cleaned);
