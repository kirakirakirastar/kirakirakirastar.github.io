/**
 * 数据库图片迁移脚本 - 智能迁移版
 * 功能：扫描数据库中的 Base64 图片，上传至 Supabase Storage 并替换链接。
 * 
 * 使用说明：
 * 1. 确保已运行 optimization_phase_2.sql 创建存储桶。
 * 2. 在项目根目录下运行 (建议先备份数据库): 
 *    npx ts-node migrate_images.ts
 */

import { createClient } from '@supabase/supabase-js' // 修正库名

// 已自动从 .env 文件同步项目地址
const supabaseUrl = 'https://qqhpxvfcockmciiuaxzt.supabase.co'
const supabaseKey = '请在此处填入你的 service_role_key (从 Supabase 后台获取)' 
const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateTable(tableName: string, contentField: string, bucket: string) {
  console.log(`正在扫描表 [${tableName}]...`)
  
  const { data: records, error } = await supabase
    .from(tableName)
    .select(`id, ${contentField}, is_private`)

  if (error || !records) {
    console.error(`读取表 ${tableName} 失败:`, error)
    return
  }

  for (const record of records) {
    let content = record[contentField]
    if (!content) continue

    // 匹配 Base64 图片的正则表达式 (支持常见格式)
    const base64Regex = /data:image\/([a-zA-Z]*);base64,([^"'\s)>]*)/g
    let match
    let hasChanges = false

    while ((match = base64Regex.exec(content)) !== null) {
      const fullMatch = match[0]
      const ext = match[1] || 'png'
      const base64Data = match[2]
      
      try {
        // 将 Base64 转为 Buffer
        const buffer = Buffer.from(base64Data, 'base64')
        const fileName = `migrated_${record.id}_${Math.random().toString(36).substring(7)}.${ext}`
        const folder = record.is_private ? 'private' : 'public'
        const path = `${folder}/${fileName}`

        console.log(`  正在上传: ${tableName} ID:${record.id} -> ${path}`)
        
        // 上传到对应的存储桶
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, buffer, {
            contentType: `image/${ext}`,
            upsert: true
          })

        if (uploadError) throw uploadError

        // 获取并替换为公共链接
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(path)

        content = content.replace(fullMatch, publicUrl)
        hasChanges = true
      } catch (err) {
        console.error(`  迁移图片失败 (Record ID: ${record.id}):`, err)
      }
    }

    if (hasChanges) {
      await supabase
        .from(tableName)
        .update({ [contentField]: content })
        .eq('id', record.id)
      console.log(`  ✅ 记录 ID:${record.id} 更新成功`)
    }
  }
}

async function run() {
  console.log('--- 开始全量图片迁移 ---')
  
  // 1. 迁移笔记插图
  await migrateTable('notes', 'content_md', 'notes-images')
  
  // 2. 迁移日志插图
  await migrateTable('journals', 'content_html', 'journals-images')
  
  // 3. 迁移爱好封面 ( cover_url 字段通常是纯字符串而非常文本，需要特殊处理)
  // ... 此处逻辑可根据实际字段格式扩展
  
  console.log('--- 迁移任务完成 ---')
}

// run()
console.log('请根据脚本内的注释配置 URL 和 KEY 后再取消 run() 的注释运行。')
