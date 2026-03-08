'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import styles from './page.module.css'
import { createClient } from '../../../lib/supabase/client'
import type { Task, Project } from '../../../types/database'

const phaseProgress: Record<string, number> = {
    '提案': 10, '見積': 25, '開発': 50, '納品': 75, '請求': 90, '保守': 100,
}

export default function DashboardPage() {
    const supabase = createClient()
    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    const fetchAll = async () => {
        setLoading(true)
        const [tasksRes, projectsRes] = await Promise.all([
            supabase.from('tasks').select('*').neq('status', '完了').order('due', { ascending: true, nullsFirst: false }),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
        ])
        setTasks(tasksRes.data || [])
        setProjects(projectsRes.data || [])
        setLoading(false)
    }

    useEffect(() => { fetchAll() }, [])

    const handleCheckTask = async (taskId: string) => {
        await supabase.from('tasks').update({ status: '完了' }).eq('id', taskId)
        fetchAll()
    }

    const matrix = {
        urgent_important: tasks.filter(t => t.priority === 'urgent_important').length,
        important: tasks.filter(t => t.priority === 'important').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length,
        other: tasks.filter(t => t.priority === 'other').length,
    }

    const todayTasks = tasks.slice(0, 5)

    const priorityDotClass = (p: string) => {
        if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'
        if (p === 'important') return 'dot-important'
        return 'dot-other'
    }

    if (loading) return <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p>

    return (
        <div className={styles.dashboard}>
            <div className={styles.greeting}>
                <p className={styles.greetingText}>おはようございます、じょんさん</p>
                <h1 className={styles.date}>
                    {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                </h1>
            </div>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>今日のタスク</h2>
                <div className={styles.taskList}>
                    {todayTasks.map((task) => (
                        <div key={task.id} className={styles.taskRow}>
                            <input type="checkbox" className="checkbox" onChange={() => handleCheckTask(task.id)} />
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

            <div className={styles.twoCol}>
                <section className={styles.card}>
                    <h2 className={styles.sectionTitle}>案件サマリー</h2>
                    <div className={styles.projectList}>
                        {projects.map((p) => (
                            <div key={p.id} className={styles.projectRow}>
                                <div className={styles.projectInfo}>
                                    <span className={styles.projectName}>{p.name} - {p.client}</span>
                                    <span className="text-caption">{p.phase}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${phaseProgress[p.phase] || 0}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.card}>
                    <h2 className={styles.sectionTitle}>マトリクス</h2>
                    <div className={styles.matrix}>
                        <div className={styles.matrixCell}><span className={styles.matrixLabel}>緊急×重要</span><span className={styles.matrixCount}>{matrix.urgent_important}</span></div>
                        <div className={styles.matrixCell}><span className={styles.matrixLabel}>重要</span><span className={styles.matrixCount} style={{ opacity: 0.8 }}>{matrix.important}</span></div>
                        <div className={styles.matrixCell}><span className={styles.matrixLabel}>緊急</span><span className={styles.matrixCount} style={{ opacity: 0.6 }}>{matrix.urgent}</span></div>
                        <div className={styles.matrixCell}><span className={styles.matrixLabel}>その他</span><span className={styles.matrixCount} style={{ opacity: 0.4 }}>{matrix.other}</span></div>
                    </div>
                </section>
            </div>
        </div>
    )
}
