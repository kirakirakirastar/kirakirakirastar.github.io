-- 第五阶段：回收站（逻辑删除）补丁
-- 请在 Supabase SQL Editor 中运行此脚本

-- 1. 为笔记表增加逻辑删除字段
ALTER TABLE notes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. 为日志表增加逻辑删除字段
ALTER TABLE journals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. 创建自动清理索引（可选，提升查询性能）
CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON notes (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_journals_deleted_at ON journals (deleted_at) WHERE deleted_at IS NULL;

-- 注：爱好的逻辑删除目前不作为必选项，如有需要可后续添加。
