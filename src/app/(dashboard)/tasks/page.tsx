'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import DateInput from '../../../components/DateInput/DateInput'
import { createClient } from '../../../lib/supabase/client'
import type { Task, Project } from '../../../types/database'

export default function TasksPage() {
    const supabase = createClient()
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [projectNames, setProjectNames] = useState<string[]>([])
    const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list')
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
    const [editingTask, setEditingTask] = useState<Task | null>(null)


    const [formTitle, setFormTitle] = useState('')
    const [formPriority, setFormPriority] = useState<Task['priority']>('other')
    const [formDue, setFormDue] = useState('')
    const [formProject, setFormProject] = useState('')
    const [formStatus, setFormStatus] = useState<Task['status']>('未着手')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [sortOrder, setSortOrder] = useState<string>('default')

    const fetchTasks = useCallback(async () => {
        setLoading(true)
        let query = supabase.from('tasks').select('*')
        if (filterStatus !== 'all') query = query.eq('status', filterStatus)
        if (sortOrder === 'due_asc') query = query.order('due', { ascending: true, nullsFirst: false })
        else if (sortOrder === 'due_desc') query = query.order('due', { ascending: false, nullsFirst: false })
        else query = query.order('created_at', { ascending: false })
        const { data } = await query
        setTasks(data || [])
        setLoading(false)
    }, [filterStatus, sortOrder])

    useEffect(() => { fetchTasks() }, [fetchTasks])

    // プロジェクト一覧をfetch
    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase.from('projects').select('name, client')
            setProjectNames((data || []).map((p: any) => p.name))
        }
        fetchProjects()
    }, [])


    const handleCheck = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task) return
        const newStatus = task.status === '完了' ? '未着手' : '完了'
        await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
        fetchTasks()
    }




    const openCreatePanel = () => {
        setPanelMode('create'); setEditingTask(null); setFormTitle(''); setFormPriority('other'); setFormDue(''); setFormProject(''); setFormStatus('未着手'); setIsPanelOpen(true)
    }
    const openEditPanel = (task: Task) => {
        setPanelMode('edit'); setEditingTask(task); setFormTitle(task.title); setFormPriority(task.priority); setFormDue(task.due || ''); setFormProject(task.project); setFormStatus(task.status); setIsPanelOpen(true)
    }
    const handleSave = async () => {
        const payload = { title: formTitle, priority: formPriority, due: formDue || null, project: formProject, status: formStatus }
        if (panelMode === 'create') await supabase.from('tasks').insert(payload)
        else if (editingTask) await supabase.from('tasks').update(payload).eq('id', editingTask.id)
        setIsPanelOpen(false); fetchTasks()
    }
    const handleDelete = async () => {
        if (!editingTask) return
        await supabase.from('tasks').delete().eq('id', editingTask.id)
        setIsPanelOpen(false); fetchTasks()
    }

    const priorityDot = (p: string) => { if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'; if (p === 'important') return 'dot-important'; return 'dot-other' }
    const priorityLabel = (p: string) => { if (p === 'urgent_important') return '緊急×重要'; if (p === 'important') return '重要'; if (p === 'urgent') return '緊急'; return 'その他' }

    const q1 = tasks.filter(t => t.priority === 'urgent_important')
    const q2 = tasks.filter(t => t.priority === 'important')
    const q3 = tasks.filter(t => t.priority === 'urgent')
    const q4 = tasks.filter(t => t.priority === 'other')

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Tasks</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${viewMode === 'list' ? styles.tabActive : ''}`} onClick={() => setViewMode('list')}>List</button>
                    <button className={`${styles.tab} ${viewMode === 'matrix' ? styles.tabActive : ''}`} onClick={() => setViewMode('matrix')}>Matrix</button>
                </div>
                <div className={styles.actions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select className="select" style={{ width: 'auto', paddingRight: '28px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Filter: All</option><option value="未着手">未着手</option><option value="進行中">進行中</option><option value="下書き">下書き</option><option value="完了">完了</option>
                    </select>
                    <select className="select" style={{ width: 'auto', paddingRight: '28px' }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="default">Sort: Default</option><option value="due_asc">期限: 昇順</option><option value="due_desc">期限: 降順</option>
                    </select>


                    <button className="btn btn-primary" onClick={openCreatePanel}>＋ New Task</button>
                </div>
            </div>

            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : viewMode === 'list' ? (
                <>
                    <div className={styles.tableWrap}><table className={styles.table}>
                        <thead><tr>
                            <th style={{ width: 40 }}></th>
                            <th>Task Name</th><th>Priority</th><th>Project</th><th>Due Date</th><th>Status</th>
                        </tr></thead>
                        <tbody>{tasks.map(t => (
                            <tr key={t.id} style={t.status === '完了' ? { opacity: 0.5, textDecoration: 'line-through' } : {}}>
                                <td className={styles.tdCheck}><input type="checkbox" className="checkbox" checked={t.status === '完了'} onChange={() => handleCheck(t.id)} title="完了にする" style={{ accentColor: 'var(--color-brand)' }} /></td>
                                <td className={styles.tdName}><span className="text-link" onClick={() => openEditPanel(t)}>{t.title}</span></td>
                                <td><span className={`dot ${priorityDot(t.priority)}`} /> {priorityLabel(t.priority)}</td>
                                <td className="text-secondary">{t.project || '—'}</td>
                                <td className="text-mono text-secondary">{t.due || '—'}</td>
                                <td>{t.status}</td>
                            </tr>
                        ))}
                            {tasks.length === 0 && filterStatus === 'all' && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-tertiary)', fontSize: 14 }}>No tasks yet. Add one from "+ New Task".</td></tr>
                            )}
                            {tasks.length === 0 && filterStatus !== 'all' && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-tertiary)', fontSize: 14 }}>No data matching your filter criteria.</td></tr>
                            )}
                        </tbody>
                    </table></div>
                    <div className={styles.pagination}>{tasks.length} tasks</div>
                </>
            ) : (
                <div className={styles.matrix}>
                    {[
                        { label: 'Q1: 緊急かつ重要', items: q1, dotClass: 'dot-urgent' },
                        { label: 'Q2: 重要だが緊急ではない', items: q2, dotClass: 'dot-important' },
                        { label: 'Q3: 緊急だが重要ではない', items: q3, dotClass: 'dot-urgent' },
                        { label: 'Q4: 緊急でも重要でもない', items: q4, dotClass: 'dot-other' },
                    ].map(q => (
                        <div key={q.label} className={styles.matrixQuadrant}>
                            <div className={styles.quadrantHeader}><span className={`dot ${q.dotClass}`} /> {q.label} ({q.items.length})</div>
                            <div className={styles.quadrantList}>{q.items.map(t => (
                                <div key={t.id} className={styles.matrixTaskItem} onClick={() => openEditPanel(t)} style={t.status === '完了' ? { opacity: 0.5 } : {}}>
                                    <input type="checkbox" className="checkbox" checked={t.status === '完了'} onChange={() => handleCheck(t.id)} onClick={e => e.stopPropagation()} />
                                    <div className={styles.matrixTaskInfo}>
                                        <div className={styles.matrixTaskTitle}>{t.title}</div>
                                        <div className={styles.matrixTaskMeta}><span>{t.due || 'No Date'}</span> <span>•</span> <span>{t.project || 'No Project'}</span></div>
                                    </div>
                                </div>
                            ))}</div>
                        </div>
                    ))}
                </div>
            )}

            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Task' : 'Edit Task'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Task Name</label><input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Priority</label><select className="select" value={formPriority} onChange={e => setFormPriority(e.target.value as Task['priority'])}><option value="urgent_important">緊急×重要 (Q1)</option><option value="important">重要 (Q2)</option><option value="urgent">緊急 (Q3)</option><option value="other">その他 (Q4)</option></select></div>
                    <div><label className="text-section-label">Due Date</label><DateInput value={formDue} onChange={setFormDue} /></div>
                    <div><label className="text-section-label">Project</label><select className="select" value={formProject} onChange={e => setFormProject(e.target.value)}><option value="">（なし）</option>{projectNames.map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                    <div><label className="text-section-label">Status</label><select className="select" value={formStatus} onChange={e => setFormStatus(e.target.value as Task['status'])}><option value="未着手">未着手</option><option value="進行中">進行中</option><option value="下書き">下書き</option><option value="アイデア">アイデア</option><option value="完了">完了</option></select></div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave}>Save Task</button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
