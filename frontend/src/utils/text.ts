/**
 * Calculate reading time for a given content string.
 * It considers both CJK (Chinese, Japanese, Korean) characters and Western words based on typical reading speeds.
 * 
 * - Western reading speed: ~200 WPM
 * - CJK reading speed: ~500 CPM
 */
export const calculateReadingTime = (content: string | undefined | null): number => {
  if (!content) return 0
  
  // 1. Strip basic code/markup logic if needed (optional refinement)
  // For now, focus on character/word extraction
  const cleanText = content.trim()

  // 2. Count CJK characters (Unified Ideographs)
  const cjkMatched = cleanText.match(/[\u4E00-\u9FFF]/g)
  const cjkCount = cjkMatched ? cjkMatched.length : 0

  // 3. Count Western words
  // We remove CJK characters first then count standard word patterns
  const westernText = cleanText.replace(/[\u4E00-\u9FFF]/g, ' ')
  const westernMatched = westernText.match(/[a-zA-Z0-9_\u00C0-\u024f]+/g)
  const westernCount = westernMatched ? westernMatched.length : 0

  // 4. Cumulative minutes
  const minutes = Math.ceil((westernCount / 200) + (cjkCount / 500))
  
  return minutes > 0 ? minutes : 1
}
