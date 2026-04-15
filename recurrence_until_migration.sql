-- 为 todos 表添加截止重复日期字段
ALTER TABLE todos ADD COLUMN IF NOT EXISTS recurrence_until date;

-- 添加注释说明
COMMENT ON COLUMN todos.recurrence_until IS '截止循环日期。如果设置，循环将在该日期后停止。';
