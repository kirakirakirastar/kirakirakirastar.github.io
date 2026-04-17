-- 创建打卡历史记录表
CREATE TABLE IF NOT EXISTS public.checkin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    checkin_date DATE NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, checkin_date)
);

-- 设置权限
ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own checkin logs" ON public.checkin_logs
    FOR ALL USING (auth.uid() = user_id);

-- 数据迁移 (可选): 将当前 checkins 表中的 last_record 迁移进记录表作为第一条
INSERT INTO public.checkin_logs (user_id, checkin_date, message)
SELECT user_id, last_date, last_record 
FROM public.checkins 
WHERE last_date IS NOT NULL AND last_record IS NOT NULL
ON CONFLICT (user_id, checkin_date) DO NOTHING;
