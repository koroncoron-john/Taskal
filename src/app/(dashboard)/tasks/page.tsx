'use client'

import { useState } from 'react'
import styles from './page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'

const initialTasks = [
    { id: '1', title: 'クライアントA 見積書提出', priority: 'urgent_important', project: 'WebApp開発', due: '2026-03-06', status: '進行中' },
    { id: '2', title: 'デザインレビュー MTG', priority: 'urgent_important', project: 'LP制作', due: '2026-03-06', status: '未着手' },
    { id: '3', title: 'note記事: 朝活の始め方', priority: 'important', project: '', due: '2026-03-07', status: '下書き' },
    { id: '4', title: 'Taskal MVP設計', priority: 'important', project: 'Taskal', due: '2026-03-10', status: '進行中' },
    { id: '5', title: 'YouTube企画: 朝活ルーティン', priority: 'important', project: '', due: '2026-03-12', status: 'アイデア' },
    { id: '6', title: '請求書発行: 案件D', priority: 'urgent', project: 'モバイルアプリ', due: '2026-03-06', status: '未着手' },
    { id: '7', title: '名刺整理', priority: 'other', project: '', due: '', status: '未着手' },
    { id: '8', title: 'ブログデザイン更新', priority: 'other', project: '', due: '', status: '未着手' },
]

export default function TasksPage() {
    const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list')
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelTitle, setPanelTitle] = useState('')

    // フィルタ・ソート用の状態
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [sortOrder, setSortOrder] = useState<string>('default')

    const priorityDot = (p: string) => {
        if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'
        if (p === 'important') return 'dot-important'
        return 'dot-other'
    }

    const priorityLabel = (p: string) => {
        if (p === 'urgent_important') return '緊急×重要'
        if (p === 'important') return '重要'
        if (p === 'urgent') return '緊急'
        return 'その他'
    }

    const openPanel = (title: string) => {
        setPanelTitle(title)
        setIsPanelOpen(true)
    }

    // フィルタとソートの適用
    let displayTasks = [...initialTasks]
    if (filterStatus !== 'all') {
        displayTasks = displayTasks.filter(t => t.status === filterStatus)
    }
    if (sortOrder === 'due_asc') {
        displayTasks.sort((a, b) => {
            if (!a.due) return 1
            if (!b.due) return -1
            return a.due.localeCompare(b.due)
        })
    } else if (sortOrder === 'due_desc') {
        displayTasks.sort((a, b) => {
            if (!a.due) return 1
            if (!b.due) return -1
            return b.due.localeCompare(a.due)
        })
    }

    // マトリクス用の振り分け
    const q1 = displayTasks.filter(t => t.priority === 'urgent_important')
    const q2 = displayTasks.filter(t => t.priority === 'important')
    const q3 = displayTasks.filter(t => t.priority === 'urgent')
    const q4 = displayTasks.filter(t => t.priority === 'other')

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Tasks</h1>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${viewMode === 'list' ? styles.tabActive : ''}`}
                        onClick={() => setViewMode('list')}
                    >List</button>
                    <button
                        className={`${styles.tab} ${viewMode === 'matrix' ? styles.tabActive : ''}`}
                        onClick={() => setViewMode('matrix')}
                    >Matrix</button>
                </div>
                <div className={styles.actions} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select className="select" style={{ width: 'auto', paddingRight: '28px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Filter: All</option>
                        <option value="未着手">未着手</option>
                        <option value="進行中">進行中</option>
                        <option value="下書き">下書き</option>
                    </select>
                    <select className="select" style={{ width: 'auto', paddingRight: '28px' }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="default">Sort: Default</option>
                        <option value="due_asc">期限: 昇順</option>
                        <option value="due_desc">期限: 降順</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => openPanel('Create New Task')}>＋ New Task</button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.thCheck}><input type="checkbox" className="checkbox" /></th>
                                    <th>Task Name</th>
                                    <th>Priority</th>
                                    <th>Project</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayTasks.map((t) => (
                                    <tr key={t.id}>
                                        <td className={styles.tdCheck}><input type="checkbox" className="checkbox" /></td>
                                        <td className={styles.tdName}>
                                            <span className="text-link" onClick={() => openPanel(`Edit: ${t.title}`)}>{t.title}</span>
                                        </td>
                                        <td><span className={`dot ${priorityDot(t.priority)}`} /> {priorityLabel(t.priority)}</td>
                                        <td className="text-secondary">{t.project || '—'}</td>
                                        <td className="text-mono text-secondary">{t.due || '—'}</td>
                                        <td>{t.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className={styles.pagination}>Page 1 of 1 | {displayTasks.length} tasks</div>
                </>
            ) : (
                <div className={styles.matrix}>
                    <div className={styles.matrixQuadrant}>
                        <div className={styles.quadrantHeader}>
                            <span className="dot dot-urgent" /> Q1: 緊急かつ重要 ({q1.length})
                        </div>
                        <div className={styles.quadrantList}>
                            {q1.map(t => (
                                <div key={t.id} className={styles.matrixTaskItem} onClick={() => openPanel(`Edit: ${t.title}`)}>
                                    <input type="checkbox" className="checkbox" style={{ marginTop: '2px' }} onClick={e => e.stopPropagation()} />
                                    <div className={styles.matrixTaskInfo}>
                                        <div className={styles.matrixTaskTitle}>{t.title}</div>
                                        <div className={styles.matrixTaskMeta}>
                                            <span>{t.due || 'No Date'}</span>
                                            <span>•</span>
                                            <span>{t.project || 'No Project'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.matrixQuadrant}>
                        <div className={styles.quadrantHeader}>
                            <span className="dot dot-important" /> Q2: 重要だが緊急ではない ({q2.length})
                        </div>
                        <div className={styles.quadrantList}>
                            {q2.map(t => (
                                <div key={t.id} className={styles.matrixTaskItem} onClick={() => openPanel(`Edit: ${t.title}`)}>
                                    <input type="checkbox" className="checkbox" style={{ marginTop: '2px' }} onClick={e => e.stopPropagation()} />
                                    <div className={styles.matrixTaskInfo}>
                                        <div className={styles.matrixTaskTitle}>{t.title}</div>
                                        <div className={styles.matrixTaskMeta}>
                                            <span>{t.due || 'No Date'}</span>
                                            <span>•</span>
                                            <span>{t.project || 'No Project'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.matrixQuadrant}>
                        <div className={styles.quadrantHeader}>
                            <span className="dot dot-urgent" style={{ background: 'var(--color-warning)' }} /> Q3: 緊急だが重要ではない ({q3.length})
                        </div>
                        <div className={styles.quadrantList}>
                            {q3.map(t => (
                                <div key={t.id} className={styles.matrixTaskItem} onClick={() => openPanel(`Edit: ${t.title}`)}>
                                    <input type="checkbox" className="checkbox" style={{ marginTop: '2px' }} onClick={e => e.stopPropagation()} />
                                    <div className={styles.matrixTaskInfo}>
                                        <div className={styles.matrixTaskTitle}>{t.title}</div>
                                        <div className={styles.matrixTaskMeta}>
                                            <span>{t.due || 'No Date'}</span>
                                            <span>•</span>
                                            <span>{t.project || 'No Project'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.matrixQuadrant}>
                        <div className={styles.quadrantHeader}>
                            <span className="dot dot-other" /> Q4: 緊急でも重要でもない ({q4.length})
                        </div>
                        <div className={styles.quadrantList}>
                            {q4.map(t => (
                                <div key={t.id} className={styles.matrixTaskItem} onClick={() => openPanel(`Edit: ${t.title}`)}>
                                    <input type="checkbox" className="checkbox" style={{ marginTop: '2px' }} onClick={e => e.stopPropagation()} />
                                    <div className={styles.matrixTaskInfo}>
                                        <div className={styles.matrixTaskTitle}>{t.title}</div>
                                        <div className={styles.matrixTaskMeta}>
                                            <span>{t.due || 'No Date'}</span>
                                            <span>•</span>
                                            <span>{t.project || 'No Project'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelTitle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label">Task Name</label>
                        <input type="text" className="select" defaultValue={panelTitle.replace('Edit: ', '')} style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Priority</label>
                        <select className="select">
                            <option>緊急×重要 (Q1)</option>
                            <option>重要 (Q2)</option>
                            <option>緊急 (Q3)</option>
                            <option>その他 (Q4)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-section-label">Due Date</label>
                        <input type="date" className="select" style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Project</label>
                        <select className="select">
                            <option>None</option>
                            <option>WebApp開発</option>
                            <option>LP制作</option>
                            <option>Taskal</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-section-label">Status</label>
                        <select className="select">
                            <option>未着手</option>
                            <option>進行中</option>
                            <option>完了</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 16, width: 'fit-content' }}>Save Task</button>
                </div>
            </SlidePanel>
        </div>
    )
}
