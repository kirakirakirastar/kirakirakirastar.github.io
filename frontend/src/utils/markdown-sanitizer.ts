/**
 * Detects and removes duplication artifacts in Markdown content.
 * Also logs diagnostic info if duplication is found.
 */
export const validateAndSanitizeMarkdown = (content: string, context?: string): string => {
  if (!content) return content;

  let cleaned = content;

  // 1. Detect Large Pattern Duplication (Self-Replication)
  // Look for sequences of 20+ characters that repeat consecutively 2+ times.
  // This is the classic "self-replication" bug signature.
  const duplicationRegex = /(.{20,})\1+/g;
  const matches = cleaned.match(duplicationRegex);
  
  if (matches) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context: context || 'Editor',
      matches,
      originalLength: content.length,
      sample: content.substring(0, 1000)
    };
    
    console.warn('[Markdown Sanitizer] Duplication detected and cleaned.', logEntry);
    
    // Store in localStorage for persistent debugging by the developer
    try {
      const logs = JSON.parse(localStorage.getItem('markdown_sanitizer_logs') || '[]');
      logs.unshift(logEntry);
      localStorage.setItem('markdown_sanitizer_logs', JSON.stringify(logs.slice(0, 20)));
    } catch (e) {
      // Ignore localStorage errors
    }

    // Deduplicate: replace the whole match with just the first capture group.
    // Note: This is an aggressive fix for the user's specific symptom.
    cleaned = cleaned.replace(duplicationRegex, '$1');
  }

  // 2. Remove Redundant Nested Tags (e.g., <s><s>...</s></s>)
  // These often happen if Tiptap state synchronization creates overlapping marks.
  const redundantTags = ['s', 'u', 'mark', 'strong', 'em', 'span'];
  redundantTags.forEach(tag => {
    // We check for tags that may contain attributes (like <span style="...">)
    // but for simple tags like <s>, this regex is highly effective.
    const openTag = `<${tag}(?:\\s+[^>]*)?>`
    const closeTag = `<\\/${tag}>`
    const nestedRegex = new RegExp(`${openTag}[\\s\\n]*${openTag}([\\s\\S]*?)${closeTag}[\\s\\n]*${closeTag}`, 'gi');
    
    while (nestedRegex.test(cleaned)) {
      cleaned = cleaned.replace(nestedRegex, (match, content) => {
        // Extract the original opening tag from the match to preserve attributes
        const outerOpen = match.match(new RegExp(`^${openTag}`, 'i'))?.[0] || `<${tag}>`;
        return `${outerOpen}${content}${closeTag}`;
      });
    }
  });

  return cleaned;
};
