const strings = [
  '[mask]测试内容 测试内容[/mask]',
  '[mask]测试内容 测试内容 测试内容 测试内容[/mask]',
  '[color=#ff0000]红色 红色 红色[/color]'
];

let res = strings.map(s => {
  let prev = '';
  let cleaned = s;
  while(prev !== cleaned) {
    prev = cleaned;
    // Collapse identical repeated words inside bbcode tags
    cleaned = cleaned.replace(/(\[[a-z0-9_=]+?\])(.+?)\s+\2(\[\/[a-z0-9]+?\])/gi, '$1$2$3');
  }
  return cleaned;
});

console.log(res);
