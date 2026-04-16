/**
 * Detects and removes duplication artifacts in Markdown content.
 * Also logs diagnostic info if duplication is found.
 */
export const validateAndSanitizeMarkdown = (content: string, context?: string): string => {
  if (!content) return content;

  let cleaned = content;
  let issueDetected = false;

  // 1. Recursive Duplication Cleanup (Multi-pass)
  // Replaces consecutive repeating patterns of 20+ characters.
  // Using multi-pass to catch triple-repeats (AAA -> AA -> A).
  const duplicationRegex = /(.{20,})\1+/g;
  let prevLength = -1;
  let iterations = 0;
  
  while (cleaned.length !== prevLength && iterations < 5) {
    prevLength = cleaned.length;
    const matches = cleaned.match(duplicationRegex);
    if (matches) {
      issueDetected = true;
      cleaned = cleaned.replace(duplicationRegex, '$1');
    }
    iterations++;
  }

  // 2. HTML-Aware "Shadow" Detection
  // Check if raw text (ignoring tags) still has major duplication
  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');
  const shadowText = stripHtml(cleaned);
  const shadowRegex = /(.{40,})\1+/g;
  if (shadowRegex.test(shadowText)) {
    issueDetected = true;
    console.error('[Markdown Sanitizer] CRITICAL: Logic duplication detected in shadow text!', {
       context,
       shadowSnippet: shadowText.substring(0, 200)
    });
    // Note: fixing shadow-only duplication is complex, 
    // but the recursive pass above usually catches the serialized form.
  }

  // 3. Remove Redundant Nested Tags (e.g., <s><s>...</s></s>)
  // This is the most common cause of exponential growth in formatting.
  const redundantTags = ['s', 'u', 'mark', 'strong', 'em', 'span'];
  redundantTags.forEach(tag => {
    const openTag = `<${tag}(?:\\s+[^>]*)?>`
    const closeTag = `<\\/${tag}>`
    const nestedRegex = new RegExp(`${openTag}[\\s\\n]*${openTag}([\\s\\S]*?)${closeTag}[\\s\\n]*${closeTag}`, 'gi');
    
    while (nestedRegex.test(cleaned)) {
      issueDetected = true;
      cleaned = cleaned.replace(nestedRegex, (match, inner) => {
        const outerOpen = match.match(new RegExp(`^${openTag}`, 'i'))?.[0] || `<${tag}>`;
        return `${outerOpen}${inner}${closeTag}`;
      });
    }
  });

  if (issueDetected) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context: context || 'Editor',
      originalLength: content.length,
      finalLength: cleaned.length,
      sample: cleaned.substring(0, 1000)
    };
    
    console.warn('[Markdown Sanitizer] Content stabilization applied.', logEntry);
    
    try {
      const logs = JSON.parse(localStorage.getItem('markdown_sanitizer_logs') || '[]');
      logs.unshift(logEntry);
      localStorage.setItem('markdown_sanitizer_logs', JSON.stringify(logs.slice(0, 20)));
    } catch (e) {
      // Ignored
    }
  }

  return cleaned;
};
