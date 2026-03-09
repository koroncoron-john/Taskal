'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './page.module.css'
import DateInput from '../../../components/DateInput/DateInput'
import { createClient } from '../../../lib/supabase/client'
import type { Project } from '../../../types/database'

const phases = [
    { key: '提案', label: '提案' }, { key: '見積', label: '見積' }, { key: '開発', label: '開発' },
    { key: '納品', label: '納品' }, { key: '請求', label: '請求' }, { key: '保守', label: '保守' },
]

interface MaintenanceLog {
    id: string
    project_id: string
    description: string
    duration_seconds: number
    work_date: string
    created_at: string
}

interface Requirement {
    id: string
    project_id: string
    title: string
    budget: number
    deadline: string
    created_at: string
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
}

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}時間${m}分${s}秒`
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
}

export default function ProjectsPage() {
    const supabase = createClient()
    const [projects, setProjects] = useState<Project[]>([])
    const [selected, setSelected] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)

    const [formName, setFormName] = useState('')
    const [formClient, setFormClient] = useState('')
    const [formPm, setFormPm] = useState('')
    const [formPhase, setFormPhase] = useState<Project['phase']>('提案')
    const [formBudget, setFormBudget] = useState(0)
    const [formDeadline, setFormDeadline] = useState('')
    const [formIsActive, setFormIsActive] = useState(true)
    const [formMaintenanceCost, setFormMaintenanceCost] = useState(0)
    const [clientOptions, setClientOptions] = useState<{ id: string, name: string }[]>([])

    // 追加要件
    const [requirements, setRequirements] = useState<Requirement[]>([])
    const [reqTitle, setReqTitle] = useState('')
    const [reqBudget, setReqBudget] = useState(0)
    const [reqDeadline, setReqDeadline] = useState('')
    const [reqEditing, setReqEditing] = useState<Requirement | null>(null)
    const [reqPanelOpen, setReqPanelOpen] = useState(false)

    // タイマー
    const [timerRunning, setTimerRunning] = useState(false)
    const [timerSeconds, setTimerSeconds] = useState(0)
    const [workDescription, setWorkDescription] = useState('')
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // 履歴
    const [logs, setLogs] = useState<MaintenanceLog[]>([])
    const [logMonth, setLogMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    })

    useEffect(() => {
        if (timerRunning) {
            intervalRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [timerRunning])

    useEffect(() => {
        setTimerRunning(false)
        setTimerSeconds(0)
        setWorkDescription('')
    }, [selected?.id])

    // 履歴データfetch
    const fetchLogs = useCallback(async (projectId: string, month: string) => {
        const startDate = `${month}-01`
        const [y, m] = month.split('-').map(Number)
        const endDate = new Date(y, m, 0).toISOString().slice(0, 10)
        const { data } = await supabase
            .from('maintenance_logs')
            .select('*')
            .eq('project_id', projectId)
            .gte('work_date', startDate)
            .lte('work_date', endDate)
            .order('work_date', { ascending: false })
        setLogs(data || [])
    }, [])

    useEffect(() => {
        if (selected?.id) fetchLogs(selected.id, logMonth)
    }, [selected?.id, logMonth, fetchLogs])

    const fetchRequirements = useCallback(async (projectId: string) => {
        const { data } = await supabase.from('project_requirements').select('*').eq('project_id', projectId).order('created_at')
        setRequirements(data || [])
    }, [])

    useEffect(() => {
        if (selected?.id) fetchRequirements(selected.id)
        else setRequirements([])
    }, [selected?.id, fetchRequirements])

    const fetchProjects = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        const list = data || []
        setProjects(list)
        if (!selected && list.length > 0) {
            setSelected(list[0])
            fillForm(list[0])
        }
        setLoading(false)
    }, [])

    useEffect(() => { fetchProjects() }, [fetchProjects])

    useEffect(() => {
        supabase.from('clients').select('id, name').order('name').then(({ data }) => {
            if (data) setClientOptions(data)
        })
    }, [])

    const fillForm = (p: Project) => {
        setFormName(p.name)
        setFormClient(p.client)
        setFormPm(p.pm)
        setFormPhase(p.phase)
        setFormBudget(p.budget)
        setFormDeadline(p.deadline || '')
        setFormIsActive((p as any).is_active !== false)
        setFormMaintenanceCost((p as any).maintenance_cost || 0)
    }

    const selectProject = (p: Project) => {
        setSelected(p)
        fillForm(p)
        setTimerRunning(false)
        setTimerSeconds(0)
        setWorkDescription('')
        setReqPanelOpen(false)
    }

    const handleSave = async () => {
        if (!selected) return
        await supabase.from('projects').update({
            name: formName, client: formClient, pm: formPm,
            phase: formPhase, budget: formBudget, deadline: formDeadline || null,
            is_active: formIsActive, maintenance_cost: formMaintenanceCost,
        }).eq('id', selected.id)

        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        const list = data || []
        setProjects(list)
        const updated = list.find((p: any) => p.id === selected.id)
        if (updated) { setSelected(updated); fillForm(updated) }
    }

    const handleCreate = async () => {
        const { data } = await supabase.from('projects').insert({ name: 'New Project', client: '', pm: '', phase: '提案', budget: 0, is_active: true, maintenance_cost: 0 }).select().single()
        const list = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        setProjects(list.data || [])
        if (data) { setSelected(data); fillForm(data) }
    }

    const handleDelete = async () => {
        if (!selected) return
        if (!confirm(`"${selected.name}" を完全に削除しますか？\nこの操作は取り消せません。`)) return
        await supabase.from('projects').delete().eq('id', selected.id)
        setSelected(null)
        fetchProjects()
    }

    // 追加要件 CRUD
    const openReqCreate = () => { setReqEditing(null); setReqTitle(''); setReqBudget(0); setReqDeadline(''); setReqPanelOpen(true) }
    const openReqEdit = (r: Requirement) => { setReqEditing(r); setReqTitle(r.title); setReqBudget(r.budget); setReqDeadline(r.deadline || ''); setReqPanelOpen(true) }
    const handleReqSave = async () => {
        if (!selected) return
        if (reqEditing) {
            await supabase.from('project_requirements').update({ title: reqTitle, budget: reqBudget, deadline: reqDeadline || null }).eq('id', reqEditing.id)
        } else {
            await supabase.from('project_requirements').insert({ project_id: selected.id, title: reqTitle, budget: reqBudget, deadline: reqDeadline || null })
        }
        setReqPanelOpen(false)
        fetchRequirements(selected.id)
    }
    const handleReqDelete = async () => {
        if (!reqEditing || !selected) return
        await supabase.from('project_requirements').delete().eq('id', reqEditing.id)
        setReqPanelOpen(false)
        fetchRequirements(selected.id)
    }

    // タイマー記録を保存
    const handleSaveLog = async () => {
        if (!selected || timerSeconds === 0) return
        const today = new Date().toISOString().slice(0, 10)
        await supabase.from('maintenance_logs').insert({
            project_id: selected.id,
            description: workDescription || '作業',
            duration_seconds: timerSeconds,
            work_date: today,
        })
        setTimerRunning(false)
        setTimerSeconds(0)
        setWorkDescription('')
        fetchLogs(selected.id, logMonth)
    }

    const handleDeleteLog = async (logId: string) => {
        await supabase.from('maintenance_logs').delete().eq('id', logId)
        if (selected) fetchLogs(selected.id, logMonth)
    }

    // 月ナビゲーション
    const navigateMonth = (direction: number) => {
        const [y, m] = logMonth.split('-').map(Number)
        const d = new Date(y, m - 1 + direction, 1)
        setLogMonth(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`)
    }

    const totalSeconds = logs.reduce((sum, l) => sum + l.duration_seconds, 0)
    const maintenanceCost = formMaintenanceCost || 0
    const totalHours = totalSeconds / 3600
    const hourlyRate = totalHours > 0 ? Math.round(maintenanceCost / totalHours) : 0
    const displayMonth = (() => {
        const [y, m] = logMonth.split('-').map(Number)
        return `${y}年${m}月`
    })()
    const reqTotalBudget = requirements.reduce((sum, r) => sum + (r.budget || 0), 0)
    const grandTotalBudget = (formBudget || 0) + reqTotalBudget

    const activeProjects = projects.filter((p: any) => p.is_active !== false)
    const inactiveProjects = projects.filter((p: any) => p.is_active === false)
    const phaseIndex = phases.findIndex(p => p.key === selected?.phase)
    const isMaintenancePhase = selected?.phase === '保守'

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className="text-page-title">Projects</h1>
                    <p className="text-secondary">進行中の案件と保守プロジェクトを管理</p>
                </div>
                <button className="btn btn-primary" onClick={handleCreate}>＋ New Project</button>
            </div>

            {loading ? (
                <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p>
            ) : (
                <div className={styles.layout}>
                    <div className={styles.listCol}>
                        {activeProjects.length > 0 && (
                            <>
                                <div className="text-section-label" style={{ padding: '0 16px', marginBottom: 8 }}>ACTIVE</div>
                                {activeProjects.map(p => (
                                    <button key={p.id} className={`${styles.listItem} ${selected?.id === p.id ? styles.listItemActive : ''}`} onClick={() => selectProject(p)}>
                                        {p.name} - {p.client || '(No client)'}
                                    </button>
                                ))}
                            </>
                        )}
                        {inactiveProjects.length > 0 && (
                            <>
                                <div className="text-section-label" style={{ padding: '16px 16px 8px', borderTop: '1px solid var(--color-border-light)', marginTop: activeProjects.length > 0 ? 8 : 0 }}>INACTIVE</div>
                                {inactiveProjects.map(p => (
                                    <button key={p.id} className={`${styles.listItem} ${selected?.id === p.id ? styles.listItemActive : ''}`} onClick={() => selectProject(p)} style={{ opacity: 0.5 }}>
                                        {p.name} - {p.client || '(No client)'}
                                    </button>
                                ))}
                            </>
                        )}
                        {projects.length === 0 && (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
                                No projects yet. Add one from "+ New Project".
                            </div>
                        )}
                    </div>
                    {selected && (
                        <div className={styles.detailCol}>
                            <div className={styles.section}>
                                <h2 className="text-section-header">基本情報</h2>
                                <div className={styles.formGrid}>
                                    <label>Project Name</label>
                                    <input type="text" className="select" value={formName} onChange={e => setFormName(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} />
                                    <label>Client</label>
                                    <select className="select" value={formClient} onChange={e => setFormClient(e.target.value)}>
                                        <option value="">（なし）</option>
                                        {clientOptions.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                    <label>PM</label>
                                    <input type="text" className="select" value={formPm} onChange={e => setFormPm(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} />
                                    <label>Status</label>
                                    <select className="select" value={formPhase} onChange={e => setFormPhase(e.target.value as Project['phase'])}>
                                        {phases.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                                    </select>
                                    <label>Budget</label>
                                    <input type="number" className="select" value={formBudget} onChange={e => setFormBudget(Number(e.target.value))} style={{ backgroundImage: 'none', cursor: 'text' }} />
                                    <label>Deadline</label>
                                    <DateInput value={formDeadline} onChange={setFormDeadline} />
                                    <label>Active</label>
                                    <select className="select" value={formIsActive ? 'active' : 'inactive'} onChange={e => setFormIsActive(e.target.value === 'active')}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
                                    <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>
                                </div>
                            </div>

                            {/* 追加要件セクション */}
                            <div className={styles.section}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h2 className="text-section-header" style={{ margin: 0 }}>Additional Requirements</h2>
                                    <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 10px' }} onClick={openReqCreate}>+ Add</button>
                                </div>

                                {/* 追加要件インラインフォーム */}
                                {reqPanelOpen && (
                                    <div style={{ padding: '12px 16px', border: '1px solid var(--color-brand)', borderRadius: 'var(--border-radius)', background: 'var(--color-surface)', marginBottom: 12 }}>
                                        <div className={styles.formGrid}>
                                            <label>Title</label>
                                            <input type="text" className="select" value={reqTitle} onChange={e => setReqTitle(e.target.value)} placeholder="例: 2ndフェーズ" style={{ backgroundImage: 'none', cursor: 'text' }} />
                                            <label>Budget (¥)</label>
                                            <input type="number" className="select" value={reqBudget} onChange={e => setReqBudget(Number(e.target.value))} style={{ backgroundImage: 'none', cursor: 'text' }} />
                                            <label>Deadline</label>
                                            <DateInput value={reqDeadline} onChange={setReqDeadline} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                            <button className="btn btn-primary" onClick={handleReqSave} disabled={!reqTitle}>Save</button>
                                            {reqEditing && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleReqDelete}>Delete</button>}
                                            <button className="btn btn-outline" onClick={() => setReqPanelOpen(false)}>Cancel</button>
                                        </div>
                                    </div>
                                )}

                                {/* 追加要件リスト */}
                                {requirements.length === 0 ? (
                                    <p className="text-secondary" style={{ fontSize: 13, margin: 0 }}>追加要件はありません</p>
                                ) : requirements.map(r => (
                                    <div key={r.id} onClick={() => openReqEdit(r)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', background: 'var(--color-bg)', marginBottom: 6, cursor: 'pointer' }}>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{r.title}</div>
                                            {r.deadline && <div className="text-secondary" style={{ fontSize: 12 }}>期限: {r.deadline}</div>}
                                        </div>
                                        <span className="text-mono" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>¥{(r.budget || 0).toLocaleString()}</span>
                                    </div>
                                ))}

                                {/* 合計予算サマリー */}
                                <div style={{ marginTop: 12, padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', background: 'var(--color-surface)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span className="text-secondary">Base Budget</span>
                                        <span className="text-mono">¥{(formBudget || 0).toLocaleString()}</span>
                                    </div>
                                    {requirements.map(r => (
                                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span className="text-secondary">{r.title}</span>
                                            <span className="text-mono">¥{(r.budget || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)', paddingTop: 8, marginTop: 4 }}>
                                        <span style={{ fontWeight: 600 }}>Total</span>
                                        <span className="text-mono" style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-brand)' }}>¥{grandTotalBudget.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2 className="text-section-header">Phase</h2>
                                <div className={styles.stepper}>
                                    {phases.map((p, i) => (
                                        <span key={p.key} className={`${styles.step} ${i < phaseIndex ? styles.stepDone : ''} ${i === phaseIndex ? styles.stepCurrent : ''}`}>
                                            {i < phaseIndex ? '✓' : i === phaseIndex ? '●' : '○'} {p.label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={`${styles.section} ${!isMaintenancePhase ? styles.disabled : ''}`}>
                                <h2 className="text-section-header">Maintenance Timer</h2>
                                {isMaintenancePhase ? (
                                    <>
                                        {/* タイマー */}
                                        <div className={styles.timerRow}>
                                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, color: timerRunning ? 'var(--color-brand)' : 'var(--color-text-primary)', letterSpacing: 2 }}>
                                                {formatTime(timerSeconds)}
                                            </span>
                                        </div>
                                        <div style={{ marginTop: 12 }}>
                                            <input type="text" className="select" placeholder="作業内容を入力..." value={workDescription} onChange={e => setWorkDescription(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text', marginBottom: 8 }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {!timerRunning ? (
                                                <button className="btn btn-primary" onClick={() => setTimerRunning(true)}>▶ Start</button>
                                            ) : (
                                                <button className="btn btn-outline" onClick={() => setTimerRunning(false)}>⏸ Stop</button>
                                            )}
                                            <button className="btn btn-outline" onClick={() => { setTimerRunning(false); setTimerSeconds(0) }}>↺ Reset</button>
                                            {timerSeconds > 0 && !timerRunning && (
                                                <button className="btn btn-primary" onClick={handleSaveLog}>💾 記録する</button>
                                            )}
                                        </div>

                                        {/* 月額保守費用 */}
                                        <div className={styles.formGrid} style={{ marginTop: 24 }}>
                                            <label>月額保守費用</label>
                                            <input type="number" className="select" value={formMaintenanceCost} onChange={e => setFormMaintenanceCost(Number(e.target.value))} style={{ backgroundImage: 'none', cursor: 'text' }} />
                                        </div>
                                        <p className="text-secondary" style={{ marginTop: 4, fontSize: 12 }}>
                                            保守費用は「Save changes」で保存されます
                                        </p>

                                        {/* 作業履歴 */}
                                        <div style={{ marginTop: 32 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                                <h3 className="text-section-header" style={{ margin: 0 }}>作業履歴</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => navigateMonth(-1)}>◀</button>
                                                    <span style={{ fontWeight: 500, minWidth: 80, textAlign: 'center' }}>{displayMonth}</span>
                                                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => navigateMonth(1)}>▶</button>
                                                </div>
                                            </div>

                                            {logs.length > 0 ? (
                                                <>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {logs.map(log => (
                                                            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', background: 'var(--color-bg)' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: 500 }}>{log.description}</div>
                                                                    <div className="text-secondary" style={{ fontSize: 12, marginTop: 2 }}>{log.work_date}</div>
                                                                </div>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                    <span className="text-mono" style={{ fontWeight: 500 }}>{formatDuration(log.duration_seconds)}</span>
                                                                    <button onClick={() => handleDeleteLog(log.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: 14 }} title="削除">×</button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* サマリー */}
                                                    <div style={{ marginTop: 16, padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', background: 'var(--color-surface)' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <span className="text-secondary">合計作業時間</span>
                                                            <span className="text-mono" style={{ fontWeight: 700 }}>{formatDuration(totalSeconds)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                            <span className="text-secondary">月額保守費用</span>
                                                            <span className="text-mono" style={{ fontWeight: 500 }}>¥{maintenanceCost.toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border-light)', paddingTop: 8, marginTop: 8 }}>
                                                            <span className="text-secondary">時給換算</span>
                                                            <span className="text-mono" style={{ fontWeight: 700, color: 'var(--color-brand)' }}>¥{hourlyRate.toLocaleString()}/h</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius)', background: 'var(--color-surface)', textAlign: 'center' }}>
                                                    <p className="text-secondary" style={{ margin: 0 }}>{displayMonth}の作業履歴はありません</p>
                                                    <p className="text-mono" style={{ margin: '8px 0 0', fontWeight: 700 }}>¥0</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-secondary">保守フェーズ時にアクティブになります</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
