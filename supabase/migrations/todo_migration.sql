-- 1. 新增时间段与优先级支持
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS priority text default 'medium';
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS start_date date;

-- 2. 新增全新的装填机系统，并附带向下兼容的旧数据转移脚本
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS status text default 'pending';
UPDATE public.todos SET status = 'completed' WHERE completed = true;

-- 3. 添加最后修改时间追踪
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();
