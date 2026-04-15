/**
 * Markdown Logic Diagnostic Tool
 * This tool helps identify why markers like ~~ or <s> are duplicating or escaping incorrectly.
 */

interface EditorSubstitute {
  storage: {
    markdown: {
      getMarkdown: () => string;
    };
  };
  commands: {
    setContent: (content: string) => void;
  };
}

export const runMarkdownDiagnosis = (editor: any) => {
  console.group('--- Markdown Logic Diagnosis ---');
  
  const testCases = [
    { name: 'Old Strike Style', input: '~~test~~', expected: '<s>test</s>' },
    { name: 'New Strike Style', input: '<s>test</s>', expected: '<s>test</s>' },
    { name: 'Old Mask Style', input: '[mask]test[/mask]', expected: '<span class="mask-text">test</span>' },
    { name: 'Multi-line Strike', input: '<s>line1\nline2</s>', expected: '<s>line1\nline2</s>' },
    { name: 'Trailing Spaces', input: '<s> test </s>', expected: ' <s>test</s> ' },
    { name: 'Nested Markers', input: '~~strike [u]underline[/u]~~', expected: '<s>strike <u>underline</u></s>' },
    { name: 'Escaped HTML', input: '`<s>`', expected: '`<s>`' },
    { name: 'Legacy Color', input: '[color=red]text[/color]', expected: '<span style="color: red">text</span>' },
    { name: 'Legacy Underline', input: '[u]underline[/u]', expected: '<u>underline</u>' },
  ];

  testCases.forEach(tc => {
    console.log(`Testing: ${tc.name}`);
    
    // Cycle 1: Load Initial
    editor.commands.setContent(tc.input);
    const output1 = editor.storage.markdown.getMarkdown();
    
    // Cycle 2: Load Output 1 back to editor
    editor.commands.setContent(output1);
    const output2 = editor.storage.markdown.getMarkdown();
    
    const isStable = output1 === output2;
    const isMatched = output1.includes(tc.expected) || output1 === tc.expected;
    
    if (isStable && isMatched) {
      console.log('%c PASS ', 'background: #22c55e; color: #fff', `Result: ${output1}`);
    } else {
      console.error(' FAIL ');
      console.log('Original Input:', tc.input);
      console.log('Cycle 1 Output:', output1);
      console.log('Cycle 2 Output:', output2);
      if (!isStable) {
        console.warn('CRITICAL: Output is not stable! (Self-replication detected)');
      }
    }
    console.log('---');
  });

  console.groupEnd();
};

export default runMarkdownDiagnosis;
