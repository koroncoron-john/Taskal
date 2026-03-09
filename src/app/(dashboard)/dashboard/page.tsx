'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { createClient } from '../../../lib/supabase/client'
import type { Task, Project } from '../../../types/database'

const phaseProgress: Record<string, number> = {
    '提案': 10, '見積': 25, '開発': 50, '納品': 75, '請求': 90, '保守': 100,
}

interface VirtualTask {
    id: string
    title: string
    priority: 'urgent_important'
    due: string | null
    project: string
    type: 'project' | 'requirement'
}

export default function DashboardPage() {
    const supabase = createClient()
    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [virtualTasks, setVirtualTasks] = useState<VirtualTask[]>([])
    const [loading, setLoading] = useState(true)
    const [displayName, setDisplayName] = useState('')
    const [doneTaskIds, setDoneTaskIds] = useState<Set<string>>(new Set())
    const [greeting] = useState(() => {
        const greetings = ['おはようございます', 'お疲れ様です', 'こんにちは', '今日も頑張りましょう', 'お手伝いします']
        return greetings[Math.floor(Math.random() * greetings.length)]
    })

    const fetchAll = async () => {
        setLoading(true)
        const [tasksRes, projectsRes, userRes] = await Promise.all([
            supabase.from('tasks').select('*').neq('status', '完了').order('due', { ascending: true, nullsFirst: false }),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.auth.getUser(),
        ])
        setTasks(tasksRes.data || [])
        setProjects(projectsRes.data || [])
        const name = userRes.data.user?.user_metadata?.full_name || userRes.data.user?.email?.split('@')[0] || ''
        setDisplayName(name)

        // プロジェクト・追加要件の仮想タスク
        const activePhases = ['提案', '見積', '開発']
        const { data: activeProjects } = await supabase
            .from('projects')
            .select('id, name, client, deadline')
            .in('phase', activePhases)

        const { data: reqs } = await supabase
            .from('project_requirements')
            .select('id, title, deadline, invoiced, projects(name)')
            .eq('invoiced', false)

        const projVirtual: VirtualTask[] = (activeProjects || [])
            .filter((p: any) => p.deadline && p.deadline <= today)
            .map((p: any) => ({
                id: `proj-${p.id}`,
                title: `${p.name}${p.client ? ` - ${p.client}` : ''}`,
                priority: 'urgent_important' as const,
                due: p.deadline || null,
                project: p.name,
                type: 'project' as const,
            }))

        const reqVirtual: VirtualTask[] = (reqs || [])
            .filter((r: any) => r.deadline && r.deadline <= today)
            .map((r: any) => ({
                id: `req-${r.id}`,
                title: r.title,
                priority: 'urgent_important' as const,
                due: r.deadline || null,
                project: r.projects?.name || '',
                type: 'requirement' as const,
            }))

        setVirtualTasks([...projVirtual, ...reqVirtual])
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [])

    const handleCheckTask = async (taskId: string) => {
        setDoneTaskIds(prev => new Set([...prev, taskId]))
        await supabase.from('tasks').update({ status: '完了' }).eq('id', taskId)
    }

    const priorityOrder: Record<string, number> = { urgent_important: 0, important: 1, urgent: 2, other: 3 }
    const today = new Date().toISOString().slice(0, 10)
    const todayTasks = tasks
        .filter(t => !t.due || t.due <= today)
        .sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3))

    const priorityDotClass = (p: string) => {
        if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'
        if (p === 'important') return 'dot-important'
        return 'dot-other'
    }

    const typeBadge = (type: string) => {
        if (type === 'project') return <span style={{ fontSize: 10, background: 'var(--color-brand)', color: '#fff', borderRadius: 4, padding: '1px 5px', marginRight: 4, fontWeight: 600, flexShrink: 0 }}>PJ</span>
        return <span style={{ fontSize: 10, background: '#8B5CF6', color: '#fff', borderRadius: 4, padding: '1px 5px', marginRight: 4, fontWeight: 600, flexShrink: 0 }}>REQ</span>
    }

    if (loading) return <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p>

    return (
        <div className={styles.dashboard}>
            <div className={styles.greeting}>
                <p className={styles.greetingText}>{greeting}、{displayName}さん</p>
                <h1 className={styles.date}>
                    {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                </h1>
            </div>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>今日のタスク</h2>
                <div className={styles.taskList}>
                    {/* プロジェクト・追加要件の仮想タスク（常時表示） */}
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
                        <div key={task.id} className={styles.taskRow} style={doneTaskIds.has(task.id) ? { opacity: 0.45, textDecoration: 'line-through' } : {}}>
                            <input type="checkbox" className="checkbox" checked={doneTaskIds.has(task.id)} onChange={() => handleCheckTask(task.id)} />
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
                </div>
            </section>
        </div>
    )
}
