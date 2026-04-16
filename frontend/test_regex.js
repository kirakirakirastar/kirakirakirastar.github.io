const md = '1. RAW from DB: - [ ] [mask]测试内容 测试内容 测试内容 测试内容[/mask]';

let cleaned = md.replace(/(\[[a-z]+(?:=[^\]]+)?\])(.+?)(\[\/[a-z]+\])/gi, (match, openTag, inner, closeTag) => {
   let innerPrev = '';
   let innerClean = inner;
   while (innerPrev !== innerClean) {
      innerPrev = innerClean;
      innerClean = innerClean.replace(/(\S+)\s+\1/g, '$1');
   }
   return openTag + innerClean + closeTag;
});

console.log('CLEANED:', cleaned);
