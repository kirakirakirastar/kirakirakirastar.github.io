/**
 * 存储空间全量审计工具 (大扫除脚本)
 * 功能：对比数据库与存储桶，删除所有“孤儿图片”。
 * 
 * 使用说明：
 * 1. 在 frontend 目录下运行: npx ts-node cleanup_storage.ts
 */

import { createClient } from '@supabase/supabase-js'

// 已自动从 .env 文件同步项目地址
const supabaseUrl = 'https://qqhpxvfcockmciiuaxzt.supabase.co'
const supabaseKey = '请在此处填入你的 service_role_key' 
const supabase = createClient(supabaseUrl, supabaseKey)

async function getAllReferencedUrls() {
  const urls = new Set<string>()

  // 1. 扫描笔记
  const { data: notes } = await supabase.from('notes').select('content_md, summary')
  notes?.forEach(n => {
    extractUrls(n.content_md, urls)
    extractUrls(n.summary, urls)
  })

  // 2. 扫描日志
  const { data: journals } = await supabase.from('journals').select('content_html, excerpt')
  journals?.forEach(j => {
    extractUrls(j.content_html, urls)
    extractUrls(j.excerpt, urls)
  })

  // 3. 扫描爱好
  const { data: hobbies } = await supabase.from('hobbies').select('cover_url, review')
  hobbies?.forEach(h => {
    if (h.cover_url) urls.add(h.cover_url)
    extractUrls(h.review, urls)
  })

  return urls
}

function extractUrls(text: string | null, set: Set<string>) {
  if (!text) return
  const regex = /https:\/\/[^"'\s)>]*storage\/v1\/object\/public\/[^"'\s)>]*/g
  let match
  while ((match = regex.exec(text)) !== null) {
    set.add(match[0])
  }
}

async function cleanupBucket(bucketName: string, activeUrls: Set<string>) {
  console.log(`--- 正在审计存储桶: ${bucketName} ---`)
  
  const { data, error } = await supabase.storage.from(bucketName).listV2({ prefix: '' })
  const files = data?.objects
  if (error) {
    console.error(`列出 ${bucketName} 文件失败:`, error)
    return
  }

  const orphanedPaths: string[] = []
  
  for (const file of files || []) {
    // 忽略目录
    if (!file.id) continue 

    const filePath = file.name // 这里的 name 是相对路径
    const fullUrl = `https://qqhpxvfcockmciiuaxzt.supabase.co/storage/v1/object/public/${bucketName}/${filePath}`
    
    if (!activeUrls.has(fullUrl)) {
      console.log(`  发现孤儿文件: ${filePath}`)
      orphanedPaths.push(filePath)
    }
  }

  if (orphanedPaths.length > 0) {
    console.log(`  🗑️ 准备删除 ${orphanedPaths.length} 个文件...`)
    const { error: delError } = await supabase.storage.from(bucketName).remove(orphanedPaths)
    if (delError) console.error(`  删除失败:`, delError)
    else console.log(`  ✅ 清理完成`)
  } else {
    console.log(`  ✨ 存储桶很干净，无需处理`)
  }
}

async function run() {
  console.log('🚀 开始全局存储审计...')
  
  const activeUrls = await getAllReferencedUrls()
  console.log(`已在数据库中发现 ${activeUrls.size} 个活跃图片链接`)

  const buckets = ['notes-images', 'journals-images', 'hobbies-covers', 'system-assets', 'images']
  
  for (const bucket of buckets) {
    await cleanupBucket(bucket, activeUrls)
  }

  console.log('🎉 所有存储桶审计完成！')
}

// run()
console.log('请先配置 supabaseKey 后取消 run() 的注释以运行。')
