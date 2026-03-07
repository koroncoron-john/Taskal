'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
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

    // フォーム
    const [formName, setFormName] = useState('')
    const [formClient, setFormClient] = useState('')
    const [formPm, setFormPm] = useState('')
    const [formPhase, setFormPhase] = useState<Project['phase']>('提案')
    const [formBudget, setFormBudget] = useState(0)
    const [formDeadline, setFormDeadline] = useState('')

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
        }).eq('id', selected.id)
        fetchProjects()
    }

    const handleCreate = async () => {
        await supabase.from('projects').insert({ name: 'New Project', client: '', pm: '', phase: '提案', budget: 0 })
        fetchProjects()
    }

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
                <div className={styles.twoCol}>
                    <div className={styles.projectList}>
                        <div className={styles.listLabel}>ACTIVE</div>
                        {projects.map(p => (
                            <div key={p.id} className={`${styles.listItem} ${selected?.id === p.id ? styles.listItemActive : ''}`} onClick={() => selectProject(p)}>
                                {p.name} - {p.client || '(No client)'}
                            </div>
                        ))}
                    </div>
                    {selected && (
                        <div className={styles.detail}>
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
                                <input type="date" className="select" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} />
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave}>Save changes</button>

                            <h2 className="text-section-header" style={{ marginTop: 32 }}>Phase</h2>
                            <div className={styles.stepper}>
                                {phases.map((p, i) => (
                                    <span key={p.key} className={`${styles.step} ${i < phaseIndex ? styles.stepDone : ''} ${i === phaseIndex ? styles.stepCurrent : ''}`}>
                                        {i < phaseIndex ? '✓' : i === phaseIndex ? '●' : '○'} {p.label}
                                    </span>
                                ))}
                            </div>
                            <p className="text-secondary" style={{ marginTop: 8, fontSize: 12 }}>ステータスはドロップダウンで変更できます</p>

                            <h2 className="text-section-header" style={{ marginTop: 32 }}>Maintenance Timer</h2>
                            <p className="text-secondary">保守フェーズ時にアクティブになります</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
