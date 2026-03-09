-- プロジェクト追加要件テーブル
CREATE TABLE IF NOT EXISTS project_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    budget INTEGER NOT NULL DEFAULT 0,
    deadline TEXT DEFAULT '',
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requirements_own" ON project_requirements FOR ALL
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
