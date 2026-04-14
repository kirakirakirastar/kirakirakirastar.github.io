-- 第二阶段：架构与性能优化补丁 (多存储桶版)
-- 请在 Supabase SQL Editor 中运行此脚本

-- ==========================================
-- 1. 存储桶权限配置 (Storage RLS - 多桶支持)
-- ==========================================

-- 定义支持的存储桶列表
-- system-assets, hobbies-covers, journals-images, notes-images, images

-- 确保 RLS 已启用
-- 允许所有认证用户 (你自己) 上传和管理所有图片桶
DROP POLICY IF EXISTS "authenticated_full_access" ON storage.objects;
CREATE POLICY "authenticated_full_access" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id IN ('images', 'system-assets', 'hobbies-covers', 'journals-images', 'notes-images'))
WITH CHECK (bucket_id IN ('images', 'system-assets', 'hobbies-covers', 'journals-images', 'notes-images'));

-- 允许访客读取这些桶中 'public/' 路径下的文件
DROP POLICY IF EXISTS "public_read_access" ON storage.objects;
CREATE POLICY "public_read_access" ON storage.objects
FOR SELECT TO anon
USING (
  bucket_id IN ('images', 'system-assets', 'hobbies-covers', 'journals-images', 'notes-images') 
  AND (storage.foldername(name))[1] = 'public'
);

-- ==========================================
-- 2. 服务端统计函数 (RPC - Statistics)
-- ==========================================

CREATE OR REPLACE FUNCTION get_combined_stats(start_date timestamp with time zone, is_owner boolean DEFAULT false)
RETURNS json AS $$
DECLARE
  res json;
BEGIN
  SELECT json_build_object(
    'notes_count', (SELECT count(*) FROM notes WHERE is_owner OR is_private = false),
    'journals_count', (SELECT count(*) FROM journals WHERE is_owner OR is_private = false),
    'hobbies_count', (SELECT count(*) FROM hobbies WHERE is_owner OR is_private = false),
    'completed_todos_today', (SELECT count(*) FROM todos WHERE status = 'completed' AND completed_at >= CURRENT_DATE AND (is_owner OR is_private = false)),
    'completed_todos_week', (SELECT count(*) FROM todos WHERE status = 'completed' AND completed_at >= date_trunc('week', now()) AND (is_owner OR is_private = false)),
    'completed_todos_month', (SELECT count(*) FROM todos WHERE status = 'completed' AND completed_at >= date_trunc('month', now()) AND (is_owner OR is_private = false)),
    'month_updates', (
      (SELECT count(*) FROM notes WHERE updated_at >= start_date AND (is_owner OR is_private = false)) +
      (SELECT count(*) FROM journals WHERE updated_at >= start_date AND (is_owner OR is_private = false)) +
      (SELECT count(*) FROM hobbies WHERE updated_at >= start_date AND (is_owner OR is_private = false))
    )
  ) INTO res;
  RETURN res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 3. 热力图聚合函数 (RPC - Heatmap)
-- ==========================================

CREATE OR REPLACE FUNCTION get_daily_activities(is_owner boolean DEFAULT false)
RETURNS TABLE (
  activity_date text,
  note_count bigint,
  journal_count bigint,
  hobby_count bigint,
  todo_count bigint,
  schedule_count bigint,
  note_titles text[],
  journal_titles text[],
  hobby_titles text[],
  todo_titles text[],
  schedule_titles text[]
) AS $$
BEGIN
  RETURN QUERY
  WITH all_days AS (
    SELECT (created_at AT TIME ZONE 'UTC')::date as d, 'note' as type, title as t FROM notes WHERE is_owner OR is_private = false
    UNION ALL
    SELECT (created_at AT TIME ZONE 'UTC')::date as d, 'journal' as type, title as t FROM journals WHERE is_owner OR is_private = false
    UNION ALL
    SELECT (updated_at AT TIME ZONE 'UTC')::date as d, 'hobby' as type, title as t FROM hobbies WHERE is_owner OR is_private = false
    UNION ALL
    SELECT (completed_at AT TIME ZONE 'UTC')::date as d, 'todo' as type, text as t FROM todos WHERE status = 'completed' AND (is_owner OR is_private = false)
    UNION ALL
    SELECT (due_date)::date as d, 'schedule' as type, text as t FROM todos WHERE status = 'pending' AND due_date IS NOT NULL AND (is_owner OR is_private = false)
  )
  SELECT 
    d::text as activity_date,
    count(*) FILTER (WHERE type = 'note') as note_count,
    count(*) FILTER (WHERE type = 'journal') as journal_count,
    count(*) FILTER (WHERE type = 'hobby') as hobby_count,
    count(*) FILTER (WHERE type = 'todo') as todo_count,
    count(*) FILTER (WHERE type = 'schedule') as schedule_count,
    array_agg(t) FILTER (WHERE type = 'note') as note_titles,
    array_agg(t) FILTER (WHERE type = 'journal') as journal_titles,
    array_agg(t) FILTER (WHERE type = 'hobby') as hobby_titles,
    array_agg(t) FILTER (WHERE type = 'todo') as todo_titles,
    array_agg(t) FILTER (WHERE type = 'schedule') as schedule_titles
  FROM all_days
  WHERE d >= CURRENT_DATE - INTERVAL '2 years'
  GROUP BY d
  ORDER BY d DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. 搜索工具扩展 (Trgm Index)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_notes_search ON notes USING gin (title gin_trgm_ops, summary gin_trgm_ops, content_md gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_journals_search ON journals USING gin (title gin_trgm_ops, excerpt gin_trgm_ops, content_html gin_trgm_ops);
