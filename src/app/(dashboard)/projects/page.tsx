'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import DateInput from '../../../components/DateInput/DateInput'
import { createClient } from '../../../lib/supabase/client'
import type { Project } from '../../../types/database'

const phases = [
    { key: '提案', label: '提案' }, { key: '見積', label: '見積' }, { key: '開発', label: '開発' },
    { key: '納品', label: '納品' }, { key: '請求', label: '請求' }, { key: '保守', label: '保守' },
]

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

    const fillForm = (p: Project) => {
        setFormName(p.name)
        setFormClient(p.client)
        setFormPm(p.pm)
        setFormPhase(p.phase)
        setFormBudget(p.budget)
        setFormDeadline(p.deadline || '')
        setFormIsActive((p as any).is_active !== false)
    }

    const selectProject = (p: Project) => {
        setSelected(p)
        fillForm(p)
    }

    const handleSave = async () => {
        if (!selected) return
        await supabase.from('projects').update({
            name: formName, client: formClient, pm: formPm,
            phase: formPhase, budget: formBudget, deadline: formDeadline || null,
            is_active: formIsActive,
        }).eq('id', selected.id)

        // 更新後にselectedも更新
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        const list = data || []
        setProjects(list)
        const updated = list.find((p: any) => p.id === selected.id)
        if (updated) { setSelected(updated); fillForm(updated) }
    }

    const handleCreate = async () => {
        const { data } = await supabase.from('projects').insert({ name: 'New Project', client: '', pm: '', phase: '提案', budget: 0, is_active: true }).select().single()
        const list = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        setProjects(list.data || [])
        if (data) { setSelected(data); fillForm(data) }
    }

    const activeProjects = projects.filter((p: any) => p.is_active !== false)
    const inactiveProjects = projects.filter((p: any) => p.is_active === false)
    const phaseIndex = phases.findIndex(p => p.key === selected?.phase)

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
                                        <option value="">（なし）</option><option value="A社">A社</option><option value="B社">B社</option><option value="C社">C社</option><option value="D社">D社</option>
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
                                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave}>Save changes</button>
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

                            <div className={`${styles.section} ${selected?.phase !== '保守' ? styles.disabled : ''}`}>
                                <h2 className="text-section-header">Maintenance Timer</h2>
                                <p className="text-secondary">保守フェーズ時にアクティブになります</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
