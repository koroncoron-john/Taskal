'use client'

import styles from './page.module.css'
import { useData } from '../../../contexts/DataProvider'

const phaseProgress: Record<string, number> = {
    '提案': 10, '見積': 25, '開発': 50, '納品': 75, '請求': 90, '保守': 100,
}

const today = new Date().toISOString().slice(0, 10)

const priorityOrder: Record<string, number> = { urgent_important: 0, important: 1, urgent: 2, other: 3 }

const GREETINGS = ['おはようございます', 'お疲れ様です', 'こんにちは', '今日も頑張りましょう', 'お手伝いします']
const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]

export default function DashboardPage() {
    const { tasks, projects, isLoading, updateTask } = useData()

    // 今日以前の期限を持つタスク（完了以外）
    const todayTasks = tasks
        .filter(t => t.status !== '完了' && (!t.due || t.due <= today))
        .sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3))

    // アクティブフェーズのプロジェクトタスク
    const activePhases = ['提案', '見積', '開発']
    const virtualTasks = projects
        .filter((p: any) => activePhases.includes(p.phase) && p.deadline && p.deadline <= today)
        .map((p: any) => ({
            id: `proj-${p.id}`,
            title: `${p.name}${p.client ? ` - ${p.client}` : ''}`,
            due: p.deadline || null,
            project: p.name,
            type: 'project' as const,
        }))

    const handleCheckTask = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task) return
        const newStatus = task.status === '完了' ? '未着手' : '完了'
        await updateTask(taskId, { status: newStatus })
    }

    const priorityDotClass = (p: string) => {
        if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'
        if (p === 'important') return 'dot-important'
        return 'dot-other'
    }

    const typeBadge = (type: string) => {
        if (type === 'project') return <span style={{ fontSize: 10, background: 'var(--color-brand)', color: '#fff', borderRadius: 4, padding: '1px 5px', marginRight: 4, fontWeight: 600, flexShrink: 0 }}>PJ</span>
        return <span style={{ fontSize: 10, background: '#8B5CF6', color: '#fff', borderRadius: 4, padding: '1px 5px', marginRight: 4, fontWeight: 600, flexShrink: 0 }}>REQ</span>
    }

    if (isLoading) return <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p>

    return (
        <div className={styles.dashboard}>
            <div className={styles.greeting}>
                <p className={styles.greetingText}>{greeting}</p>
                <h1 className={styles.date}>
                    {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                </h1>
            </div>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>今日のタスク</h2>
                <div className={styles.taskList}>
                    {/* プロジェクト・追加要件の仮想タスク */}
                    {virtualTasks.map(v => (
                        <div key={v.id} className={styles.taskRow}>
                            <span style={{ display: 'inline-block', width: 16, height: 16, flexShrink: 0 }} />
                            <span className="dot dot-urgent" />
                            <span className={styles.taskName} style={{ display: 'flex', alignItems: 'center' }}>
                                {typeBadge(v.type)}{v.title}
                            </span>
                            <span className={styles.taskMeta}>
                                {v.project && <span>{v.project}</span>}
                                <span>{v.due || '—'}</span>
                            </span>
                        </div>
                    ))}
                    {/* 通常タスク */}
                    {todayTasks.length === 0 && virtualTasks.length === 0 ? (
                        <p className="text-secondary" style={{ padding: '16px 0', margin: 0, fontSize: 14 }}>
                            There are no tasks for today 🎉
                        </p>
                    ) : todayTasks.map((task) => (
                        <div key={task.id} className={styles.taskRow} style={task.status === '完了' ? { opacity: 0.45, textDecoration: 'line-through' } : {}}>
                            <input type="checkbox" className="checkbox" checked={task.status === '完了'} onChange={() => handleCheckTask(task.id)} />
                            <span className={`dot ${priorityDotClass(task.priority)}`} />
                            <span className={styles.taskName}>{task.title}</span>
                            <span className={styles.taskMeta}>
                                {task.project && <span>{task.project}</span>}
                                <span>{task.due || '—'}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>案件サマリー</h2>
                <div className={styles.projectList}>
                    {projects.map((p) => (
                        <div key={p.id} className={styles.projectRow}>
                            <div className={styles.projectInfo}>
                                <span className={styles.projectName}>{p.name} - {p.client}</span>
                                <span className="text-caption" style={{ whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 8 }}>{p.phase}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-bar-fill" style={{ width: `${phaseProgress[p.phase] || 0}%` }} />
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && (
                        <p className="text-secondary" style={{ margin: 0, fontSize: 14 }}>No projects yet.</p>
                    )}
                </div>
            </section>
        </div>
    )
}
