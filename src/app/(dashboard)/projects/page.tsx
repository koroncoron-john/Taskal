'use client'

import { useState } from 'react'
import styles from './page.module.css'

const projectsData = [
    { id: '1', name: 'WebApp開発', client: 'A社', pm: 'じょん', phase: 'development', budget: 1200000, deadline: '2026/04/15', contracted_hours: 20 },
    { id: '2', name: 'LP制作', client: 'B社', pm: 'じょん', phase: 'delivery', budget: 300000, deadline: '2026/03/20', contracted_hours: null },
    { id: '3', name: 'ECサイト保守', client: 'C社', pm: 'じょん', phase: 'maintenance', budget: 80000, deadline: '', contracted_hours: 20 },
    { id: '4', name: 'モバイルアプリ', client: 'D社', pm: 'じょん', phase: 'estimate', budget: 500000, deadline: '2026/05/01', contracted_hours: null },
]

const phases = [
    { key: 'proposal', label: '提案' },
    { key: 'estimate', label: '見積' },
    { key: 'development', label: '開発' },
    { key: 'delivery', label: '納品' },
    { key: 'billing', label: '請求' },
    { key: 'maintenance', label: '保守' },
]

export default function ProjectsPage() {
    const [selectedId, setSelectedId] = useState(projectsData[0].id)
    const selected = projectsData.find(p => p.id === selectedId) || projectsData[0]

    const phaseIndex = phases.findIndex(p => p.key === selected.phase)
    const isMaintenance = selected.phase === 'maintenance'

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className="text-page-title">Projects</h1>
                    <p className="text-secondary">進行中の案件と保守プロジェクトを管理</p>
                </div>
                <button className="btn btn-primary">＋ New Project</button>
            </div>

            <div className={styles.layout}>
                {/* 左カラム：プロジェクト一覧 */}
                <div className={styles.listCol}>
                    <p className="text-section-label">ACTIVE</p>
                    {projectsData.map(p => (
                        <button
                            key={p.id}
                            className={`${styles.listItem} ${p.id === selectedId ? styles.listItemActive : ''}`}
                            onClick={() => setSelectedId(p.id)}
                        >
                            {p.name} - {p.client}
                        </button>
                    ))}
                </div>

                {/* 右カラム：詳細 */}
                <div className={styles.detailCol}>
                    {/* 基本情報 */}
                    <section className={styles.section}>
                        <h2 className="text-section-header">基本情報</h2>
                        <div className={styles.formGrid}>
                            <label>Project Name</label><div className={styles.fieldValue}>{selected.name}</div>
                            <label>Client</label>
                            <select className="select" defaultValue={selected.client}>
                                <option value="A社">A社</option>
                                <option value="B社">B社</option>
                                <option value="C社">C社</option>
                                <option value="D社">D社</option>
                            </select>
                            <label>PM</label><div className={styles.fieldValue}>{selected.pm}</div>
                            <label>Status</label>
                            <select className="select" defaultValue={selected.phase}>
                                {phases.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                            </select>
                            <label>Budget</label><div className={`${styles.fieldValue} text-mono`}>¥{selected.budget?.toLocaleString() || '—'}</div>
                            <label>Deadline</label><div className={`${styles.fieldValue} text-mono`}>{selected.deadline || '—'}</div>
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 16 }}>Save changes</button>
                    </section>

                    {/* フェーズ */}
                    <section className={styles.section}>
                        <h2 className="text-section-header">Phase</h2>
                        <div className={styles.stepper}>
                            {phases.map((p, i) => (
                                <div key={p.key} className={styles.step}>
                                    <span className={`${styles.stepDot} ${i < phaseIndex ? styles.stepDone : ''} ${i === phaseIndex ? styles.stepCurrent : ''}`}>
                                        {i < phaseIndex ? '✓' : i === phaseIndex ? '●' : '○'}
                                    </span>
                                    <span className={styles.stepLabel}>{p.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-caption" style={{ marginTop: 8 }}>ステータスはドロップダウンで変更できます</p>
                    </section>

                    {/* 保守タイマー */}
                    <section className={`${styles.section} ${!isMaintenance ? styles.disabled : ''}`}>
                        <h2 className="text-section-header">Maintenance Timer</h2>
                        {isMaintenance ? (
                            <div className={styles.timerRow}>
                                <span>今月の稼働</span>
                                <span className="text-mono">12.5h / {selected.contracted_hours}h</span>
                                <button className="btn btn-outline">▶ Start Timer</button>
                            </div>
                        ) : (
                            <p className="text-caption">保守フェーズ時にアクティブ化されます</p>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}
