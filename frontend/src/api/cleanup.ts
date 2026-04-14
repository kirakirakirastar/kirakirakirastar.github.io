import { supabase } from './supabase'

/**
 * 从文本中提取 Supabase Storage 的路径
 * 匹配格式如: .../storage/v1/object/public/bucket-name/folder/filename.png
 */
export function extractStoragePaths(text: string): { bucket: string; path: string }[] {
  if (!text) return []
  
  // 匹配 Supabase 存储地址模式
  // 关键特征：/storage/v1/object/public/{bucket}/{path}
  const regex = /storage\/v1\/object\/public\/([^/]+)\/((?:private|public)\/[^"'\s)>]*)/g
  const results: { bucket: string; path: string }[] = []
  
  let match
  while ((match = regex.exec(text)) !== null) {
    results.push({
      bucket: match[1],
      path: match[2]
    })
  }
  
  return results
}

/**
 * 批量从 Supabase Storage 中删除文件
 */
export async function deleteStorageFiles(files: { bucket: string; path: string }[]) {
  if (files.length === 0) return

  // 按 bucket 分组执行删除
  const groups = files.reduce((acc, curr) => {
    if (!acc[curr.bucket]) acc[curr.bucket] = []
    acc[curr.bucket].push(curr.path)
    return acc
  }, {} as Record<string, string[]>)

  for (const bucket in groups) {
    const paths = groups[bucket]
    console.log(`[Cleanup] 正在从存储桶 ${bucket} 删除文件:`, paths)
    const { error } = await supabase.storage.from(bucket).remove(paths)
    if (error) {
      console.error(`[Cleanup] 删除存储桶 ${bucket} 中的文件失败:`, error)
    }
  }
}

/**
 * 尝试从单一 URL 中删除（用于封面图、背景图替换）
 */
export async function deleteFileByUrl(url?: string) {
  if (!url || !url.includes('storage/v1/object/public/')) return
  
  const paths = extractStoragePaths(url)
  if (paths.length > 0) {
    await deleteStorageFiles(paths)
  }
}
