-- ============================================
-- Taskal MVP マイグレーション
-- 認証なし（RLSは後で追加）
-- ============================================

-- Tasks テーブル
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'other' CHECK (priority IN ('urgent_important', 'important', 'urgent', 'other')),
  project TEXT DEFAULT '',
  due DATE,
  status TEXT NOT NULL DEFAULT '未着手' CHECK (status IN ('未着手', '進行中', '下書き', 'アイデア', '完了')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects テーブル
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT DEFAULT '',
  pm TEXT DEFAULT '',
  phase TEXT NOT NULL DEFAULT '提案' CHECK (phase IN ('提案', '見積', '開発', '納品', '請求', '保守')),
  budget INTEGER DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Articles テーブル
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT DEFAULT 'note',
  status TEXT NOT NULL DEFAULT 'アイデア' CHECK (status IN ('アイデア', '下書き', '投稿済み')),
  month TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Movies テーブル
CREATE TABLE IF NOT EXISTS movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'アイデア' CHECK (status IN ('アイデア', '撮影済み', '編集中', '投稿済み')),
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  popularity INTEGER DEFAULT 0 CHECK (popularity >= 0 AND popularity <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Learning Notes テーブル
CREATE TABLE IF NOT EXISTS learning_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'プログラミング',
  content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'studying' CHECK (status IN ('studying', 'completed')),
  ai_feedback TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Business Cards テーブル
CREATE TABLE IF NOT EXISTS business_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT DEFAULT '',
  role TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  affinity TEXT DEFAULT '普通' CHECK (affinity IN ('高', '普通', '低')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- updated_at 自動更新用トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER movies_updated_at BEFORE UPDATE ON movies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER learning_notes_updated_at BEFORE UPDATE ON learning_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER business_cards_updated_at BEFORE UPDATE ON business_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 初期データ（モックデータの移行）
-- ============================================

INSERT INTO tasks (title, priority, project, due, status) VALUES
('クライアントA 見積書提出', 'urgent_important', 'WebApp開発', '2026-03-06', '進行中'),
('デザインレビュー MTG', 'urgent_important', 'LP制作', '2026-03-06', '未着手'),
('note記事: 朝活の始め方', 'important', '', '2026-03-07', '下書き'),
('Taskal MVP設計', 'important', 'Taskal', '2026-03-10', '進行中'),
('YouTube企画: 朝活ルーティン', 'important', '', '2026-03-12', 'アイデア'),
('請求書発行: 案件D', 'urgent', 'モバイルアプリ', '2026-03-06', '未着手'),
('名刺整理', 'other', '', NULL, '未着手'),
('ブログデザイン更新', 'other', '', NULL, '未着手');

INSERT INTO projects (name, client, pm, phase, budget, deadline) VALUES
('WebApp開発', 'A社', 'じょん', '開発', 1200000, '2026-04-15'),
('LP制作', 'B社', 'じょん', '納品', 300000, '2026-03-20'),
('ECサイト保守', 'C社', 'じょん', '保守', 50000, NULL),
('モバイルアプリ', 'D社', 'じょん', '提案', 800000, '2026-05-01');

INSERT INTO articles (title, platform, status, month) VALUES
('朝5時、画面の向こうに仲間がいた話', 'note', '投稿済み', '2026-02'),
('新社会人に伝えたいこと', 'note', '下書き', '2026-03'),
('Supabase-like UI Patterns', '自社サイト', '下書き', '2026-03'),
('朝活コミュニティに向いてない人の特徴', 'note', '投稿済み', '2026-02'),
('AI時代のノーコード開発', 'X', 'アイデア', ''),
('リモートワークの生産性を上げる5つの習慣', 'note', 'アイデア', '');

INSERT INTO movies (title, status, views, likes, popularity) VALUES
('朝5時起き生活のリアル', '投稿済み', 12500, 340, 4),
('ノーコードで月100万稼ぐ方法', '編集中', 0, 0, 0),
('朝活ルーティン紹介', 'アイデア', 0, 0, 0),
('Supabase入門チュートリアル', '撮影済み', 0, 0, 0),
('フリーランス1年目の収支公開', 'アイデア', 0, 0, 0);

INSERT INTO learning_notes (title, category, content, status, ai_feedback) VALUES
('Next.js App Router入門', 'プログラミング', 'Server ComponentsとClient Componentsの使い分け...', 'studying', ''),
('Supabase RLSの設計パターン', 'プログラミング', 'Row Level Securityのベストプラクティス...', 'completed', 'RLSの基本を理解できています。'),
('Figmaのオートレイアウト', 'デザイン', 'オートレイアウトを使った効率的なデザイン...', 'studying', ''),
('フリーランスの契約書テンプレ', 'ビジネス', '業務委託契約で抑えるべきポイント...', 'completed', '実践的な内容です。');

INSERT INTO business_cards (name, company, role, email, phone, affinity) VALUES
('田中太郎', 'A社', 'CEO', 'tanaka@example.com', '090-1234-5678', '高'),
('鈴木花子', 'B社', 'デザイナー', 'suzuki@example.com', '090-2345-6789', '高'),
('佐藤一郎', 'C社', 'エンジニア', 'sato@example.com', '090-3456-7890', '普通'),
('山田次郎', 'D社', 'PM', 'yamada@example.com', '090-4567-8901', '普通'),
('高橋三郎', 'E社', '営業', 'takahashi@example.com', '090-5678-9012', '低');
