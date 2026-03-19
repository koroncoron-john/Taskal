'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import styles from './page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import DateInput from '../../../components/DateInput/DateInput'
import { useData } from '../../../contexts/DataProvider'
import { usePreferences } from '../../../hooks/usePreferences'
import type { Task } from '../../../types/database'

// プロジェクト由来の仮想タスク型
interface VirtualItem {
    id: string
    title: string
    priority: 'urgent_important'
    due: string | null
    project: string
    status: string
    type: 'project' | 'requirement'
}

export default function TasksPage() {
    const { tasks, projects, isLoading, addTask, updateTask, deleteTask } = useData()

    // プロジェクト・追加要件の仮想タスク（projects から派生）
    const activePhases = ['提案', '見積', '開発']
    const virtualItems: VirtualItem[] = [
        ...projects
            .filter((p: any) => activePhases.includes(p.phase))
            .map((p: any): VirtualItem => ({
                id: `proj-${p.id}`,
                title: `${p.name}${p.client ? ` - ${p.client}` : ''}`,
                priority: 'urgent_important',
                due: p.deadline || null,
                project: p.name,
                status: p.phase,
                type: 'project',
            })),
    ]

    const projectNames = projects.map((p: any) => p.name)

    const supabase = createClient()

    // Filter/Sort設定の永続化
    const { preferences, savePreferences, loaded } = usePreferences()

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

    // preferencesが読み込まれたら初期値を反映
    useEffect(() => {
        if (loaded && preferences.tasks) {
            setFilterStatus(preferences.tasks.filterStatus)
            setSortOrder(preferences.tasks.sortOrder)
        }
    }, [loaded])

    // Google Sync 用 state
    const [syncLoading, setSyncLoading] = useState(false)
    const [syncResult, setSyncResult] = useState<'success' | 'error' | 'needs-google-login' | null>(null)
    const [syncMessage, setSyncMessage] = useState('')

    // フィルタ & ソートはローカルで計算（fetchなし）
    const filteredTasks = tasks
        .filter(t => filterStatus === 'all' || t.status === filterStatus)
        .sort((a, b) => {
            if (sortOrder === 'due_asc') return (a.due || 'zzz').localeCompare(b.due || 'zzz')
            if (sortOrder === 'due_desc') return (b.due || '').localeCompare(a.due || '')
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

    const handleCheck = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId)
        if (!task) return
        const newStatus = task.status === '完了' ? '未着手' : '完了'
        // 楽観的UI: updateTask が先にローカルStateを更新してくれる
        await updateTask(taskId, { status: newStatus })
    }

    const openCreatePanel = () => {
        setPanelMode('create'); setEditingTask(null); setFormTitle(''); setFormPriority('other'); setFormDue(''); setFormProject(''); setFormStatus('未着手'); setIsPanelOpen(true)
    }
    const openEditPanel = (task: Task) => {
        setPanelMode('edit'); setEditingTask(task); setFormTitle(task.title); setFormPriority(task.priority); setFormDue(task.due || ''); setFormProject(task.project); setFormStatus(task.status); setIsPanelOpen(true)
    }
    const handleSave = async () => {
        const payload = { title: formTitle, priority: formPriority, due: formDue || null, project: formProject, status: formStatus }
        if (panelMode === 'create') {
            await addTask(payload as Omit<Task, 'id' | 'created_at' | 'updated_at'>)
        } else if (editingTask) {
            await updateTask(editingTask.id, payload)
        }
        setIsPanelOpen(false)
    }
    const handleDelete = async () => {
        if (!editingTask) return
        await deleteTask(editingTask.id)
        setIsPanelOpen(false)
    }

    const handleGoogleSync = async () => {
        if (!formTitle) return
        setSyncLoading(true)
        setSyncResult(null)
        setSyncMessage('')

        // Supabaseセッションからprovider_tokenを取得
        // provider_tokenはページリロード後に消えるため、user_metadataをフォールバックとして使用
        const { data: { session } } = await supabase.auth.getSession()
        const { data: { user } } = await supabase.auth.getUser()
        const providerToken = session?.provider_token || user?.user_metadata?.google_provider_token

        // Googleログインでない場合（provider_token が存在しない）
        if (!session?.user) {
            setSyncResult('needs-google-login')
            setSyncMessage('ログインが必要です。')
            setSyncLoading(false)
            return
        }

        if (!providerToken) {
            // emailログインまたはprovider_tokenが期限切れ
            const provider = session.user.app_metadata?.provider
            if (provider !== 'google') {
                setSyncResult('needs-google-login')
                setSyncMessage('Google Tasksと連携するには、Googleアカウントでログインしてください。')
            } else {
                setSyncResult('needs-google-login')
                setSyncMessage('Googleセッションが切れました。一度ログアウトして、Googleで再ログインしてください。')
            }
            setSyncLoading(false)
            return
        }

        // API Route 経由でGoogle Tasks APIを呼び出す
        try {
            const res = await fetch('/api/google-tasks/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    providerToken,
                    title: formTitle,
                    due: formDue || null,
                }),
            })
            const data = await res.json()

            if (res.ok && data.success) {
                setSyncResult('success')
                setSyncMessage('✅ Google Tasksに追加しました！')
            } else if (data.needsRelogin) {
                setSyncResult('needs-google-login')
                setSyncMessage('Googleセッションが切れました。再ログインしてください。')
            } else {
                setSyncResult('error')
                setSyncMessage('エラー: ' + (data.error || '不明なエラー'))
            }
        } catch {
            setSyncResult('error')
            setSyncMessage('通信エラーが発生しました。')
        }

        setSyncLoading(false)
    }

    const priorityDot = (p: string) => { if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'; if (p === 'important') return 'dot-important'; return 'dot-other' }
    const priorityLabel = (p: string) => { if (p === 'urgent_important') return '緊急×重要'; if (p === 'important') return '重要'; if (p === 'urgent') return '緊急'; return 'その他' }

    // MatrixのQ分類（フィルタ前のtasks全体から）
    const q1 = tasks.filter(t => t.priority === 'urgent_important')
    const q2 = tasks.filter(t => t.priority === 'important')
    const q3 = tasks.filter(t => t.priority === 'urgent')
    const q4 = tasks.filter(t => t.priority === 'other')
    const q1All = [...q1, ...virtualItems as any[]]

    const typeBadge = (type: string) => {
        if (type === 'project') return <span style={{ fontSize: 10, background: 'var(--color-brand)', color: '#fff', borderRadius: 4, padding: '1px 5px', marginRight: 4, fontWeight: 600 }}>PJ</span>
        if (type === 'requirement') return <span style={{ fontSize: 10, background: '#8B5CF6', color: '#fff', borderRadius: 4, padding: '1px 5px', marginRight: 4, fontWeight: 600 }}>REQ</span>
        return null
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Tasks</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${viewMode === 'list' ? styles.tabActive : ''}`} onClick={() => setViewMode('list')}>List</button>
                    <button className={`${styles.tab} ${viewMode === 'matrix' ? styles.tabActive : ''}`} onClick={() => setViewMode('matrix')}>Matrix</button>
                </div>
                <div className={styles.actions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select className="select" style={{ width: 'auto', paddingRight: '28px' }} value={filterStatus} onChange={(e) => {
                        const v = e.target.value
                        setFilterStatus(v)
                        savePreferences('tasks', { filterStatus: v, sortOrder })
                    }}>
                        <option value="all">Filter: All</option><option value="未着手">未着手</option><option value="進行中">進行中</option><option value="下書き">下書き</option><option value="完了">完了</option>
                    </select>
                    <select className="select" style={{ width: 'auto', paddingRight: '28px' }} value={sortOrder} onChange={(e) => {
                        const v = e.target.value
                        setSortOrder(v)
                        savePreferences('tasks', { filterStatus, sortOrder: v })
                    }}>
                        <option value="default">Sort: Default</option><option value="due_asc">期限: 昇順</option><option value="due_desc">期限: 降順</option>
                    </select>
                    <button className="btn btn-primary" onClick={openCreatePanel}>＋ New Task</button>
                </div>
            </div>

            {isLoading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : viewMode === 'list' ? (
                <>
                    {/* ── 手動タスク ── */}
                    <div className={styles.tableWrap}><table className={styles.table}>
                        <thead><tr>
                            <th style={{ width: 40 }}></th>
                            <th>Task Name</th><th>Priority</th><th>Project</th><th>Due Date</th><th>Status</th>
                        </tr></thead>
                        <tbody>
                            {filteredTasks.map(t => (
                                <tr key={t.id} style={t.status === '完了' ? { opacity: 0.5, textDecoration: 'line-through' } : {}}>
                                    <td className={styles.tdCheck}><input type="checkbox" className="checkbox" checked={t.status === '完了'} onChange={() => handleCheck(t.id)} title="完了にする" style={{ accentColor: 'var(--color-brand)' }} /></td>
                                    <td className={styles.tdName}><span className="text-link" onClick={() => openEditPanel(t)}>{t.title}</span></td>
                                    <td><span className={`dot ${priorityDot(t.priority)}`} /> {priorityLabel(t.priority)}</td>
                                    <td className="text-secondary">{t.project || '—'}</td>
                                    <td className="text-mono text-secondary">{t.due || '—'}</td>
                                    <td>{t.status}</td>
                                </tr>
                            ))}
                            {filteredTasks.length === 0 && filterStatus === 'all' && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--color-text-tertiary)', fontSize: 14 }}>No tasks yet. Add one from "+ New Task".</td></tr>
                            )}
                            {filteredTasks.length === 0 && filterStatus !== 'all' && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--color-text-tertiary)', fontSize: 14 }}>No data matching your filter criteria.</td></tr>
                            )}
                        </tbody>
                    </table></div>
                    <div className={styles.pagination}>{filteredTasks.length} tasks</div>

                    {/* ── Project Tasks ── */}
                    <div style={{ marginTop: 32 }}>
                        <h2 className="text-section-label" style={{ padding: '0 0 12px 0', fontSize: 13, letterSpacing: '0.08em' }}>PROJECT TASKS</h2>
                        <div className={styles.tableWrap}><table className={styles.table}>
                            <thead><tr>
                                <th style={{ width: 40 }}></th>
                                <th>Task Name</th><th>Priority</th><th>Project</th><th>Due Date</th><th>Status</th>
                            </tr></thead>
                            <tbody>
                                {virtualItems.map(v => (
                                    <tr key={v.id}>
                                        <td className={styles.tdCheck}><span style={{ display: 'inline-block', width: 16, height: 16 }} /></td>
                                        <td className={styles.tdName}>{typeBadge(v.type)}{v.title}</td>
                                        <td><span className="dot dot-urgent" /> 緊急×重要</td>
                                        <td className="text-secondary">{v.project || '—'}</td>
                                        <td className="text-mono text-secondary">{v.due || '—'}</td>
                                        <td>{v.status}</td>
                                    </tr>
                                ))}
                                {virtualItems.length === 0 && (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--color-text-tertiary)', fontSize: 14 }}>No active project tasks.</td></tr>
                                )}
                            </tbody>
                        </table></div>
                        <div className={styles.pagination}>{virtualItems.length} project tasks</div>
                    </div>
                </>
            ) : (
                <div className={styles.matrix}>
                    {[
                        { label: 'Q1: 緊急かつ重要', items: q1All, dotClass: 'dot-urgent' },
                        { label: 'Q2: 重要だが緊急ではない', items: q2, dotClass: 'dot-important' },
                        { label: 'Q3: 緊急だが重要ではない', items: q3, dotClass: 'dot-q3' },
                        { label: 'Q4: 緊急でも重要でもない', items: q4, dotClass: 'dot-other' },
                    ].map(q => (
                        <div key={q.label} className={styles.matrixQuadrant}>
                            <div className={styles.quadrantHeader}><span className={`dot ${q.dotClass}`} /> {q.label} ({q.items.length})</div>
                            <div className={styles.quadrantList}>{q.items.map((t: any) => (
                                <div key={t.id} className={styles.matrixTaskItem} onClick={() => !t.type && openEditPanel(t)} style={{ ...((t.status === '完了') ? { opacity: 0.5 } : {}), cursor: t.type ? 'default' : 'pointer' }}>
                                    {t.type ? (
                                        <div className={styles.matrixTaskInfo}>
                                            <div className={styles.matrixTaskTitle}>{typeBadge(t.type)}{t.title}</div>
                                            <div className={styles.matrixTaskMeta}><span>{t.due || 'No Date'}</span> <span>•</span> <span>{t.project || 'No Project'}</span></div>
                                        </div>
                                    ) : (
                                        <>
                                            <input type="checkbox" className="checkbox" checked={t.status === '完了'} onChange={() => handleCheck(t.id)} onClick={(e: any) => e.stopPropagation()} />
                                            <div className={styles.matrixTaskInfo}>
                                                <div className={styles.matrixTaskTitle}>{t.title}</div>
                                                <div className={styles.matrixTaskMeta}><span>{t.due || 'No Date'}</span> <span>•</span> <span>{t.project || 'No Project'}</span></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}</div>
                        </div>
                    ))}
                </div>
            )}

            <SlidePanel isOpen={isPanelOpen} onClose={() => { setIsPanelOpen(false); setSyncResult(null); setSyncMessage('') }} title={panelMode === 'create' ? 'New Task' : 'Edit Task'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Task Name</label><input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Priority</label><select className="select" value={formPriority} onChange={e => setFormPriority(e.target.value as Task['priority'])}><option value="urgent_important">緊急×重要 (Q1)</option><option value="important">重要 (Q2)</option><option value="urgent">緊急 (Q3)</option><option value="other">その他 (Q4)</option></select></div>
                    <div><label className="text-section-label">Due Date</label><DateInput value={formDue} onChange={setFormDue} /></div>

                    {/* Google Sync ボタン（Editモードのみ表示） */}
                    {panelMode === 'edit' && (
                        <div>
                            <button
                                onClick={handleGoogleSync}
                                disabled={syncLoading || !formTitle}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 14px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--border-radius)',
                                    background: '#fff',
                                    color: syncLoading ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                                    fontSize: 14,
                                    fontFamily: 'var(--font-family)',
                                    fontWeight: 500,
                                    cursor: (syncLoading || !formTitle) ? 'not-allowed' : 'pointer',
                                    opacity: (syncLoading || !formTitle) ? 0.6 : 1,
                                    transition: 'all 0.15s',
                                    width: '100%',
                                    justifyContent: 'center',
                                }}
                            >
                                {/* Google G アイコン */}
                                <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {syncLoading ? '同期中...' : 'Google Tasksに追加'}
                            </button>

                            {/* 同期メッセージ表示 */}
                            {syncResult && (
                                <div style={{
                                    marginTop: 8,
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    fontSize: 13,
                                    background: syncResult === 'success' ? 'rgba(62,207,142,0.12)'
                                              : syncResult === 'needs-google-login' ? 'rgba(66,133,244,0.10)'
                                              : 'rgba(239,68,68,0.08)',
                                    color: syncResult === 'success' ? '#16a34a'
                                         : syncResult === 'needs-google-login' ? '#1d4ed8'
                                         : 'var(--color-danger)',
                                    lineHeight: 1.5,
                                }}>
                                    {syncMessage}
                                    {syncResult === 'needs-google-login' && (
                                        <div style={{ marginTop: 6 }}>
                                            <a href="/login" style={{ color: '#1d4ed8', fontWeight: 600, textDecoration: 'underline' }}>Googleでログインする →</a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

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
