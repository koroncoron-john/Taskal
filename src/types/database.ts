// Taskal データベース型定義

export interface Task {
    id: string
    title: string
    priority: 'urgent_important' | 'important' | 'urgent' | 'other'
    project: string
    due: string | null
    status: '未着手' | '進行中' | '下書き' | 'アイデア' | '完了'
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    name: string
    client: string
    pm: string
    phase: '提案' | '見積' | '開発' | '納品' | '請求' | '保守'
    budget: number
    deadline: string | null
    is_active: boolean
    maintenance_cost: number
    invoiced: boolean
    created_at: string
    updated_at: string
}

export interface Article {
    id: string
    title: string
    platform: string
    status: 'アイデア' | '下書き' | '投稿済み'
    month: string
    created_at: string
    updated_at: string
}

export interface Movie {
    id: string
    title: string
    status: 'アイデア' | '撮影済み' | '編集中' | '投稿済み'
    views: number
    likes: number
    popularity: number
    created_at: string
    updated_at: string
}

export interface LearningNote {
    id: string
    title: string
    category: string
    content: string
    status: 'studying' | 'completed'
    ai_feedback: string
    created_at: string
    updated_at: string
}

export interface BusinessCard {
    id: string
    name: string
    company: string
    role: string
    email: string
    phone: string
    affinity: '高' | '普通' | '低'
    created_at: string
    updated_at: string
}
