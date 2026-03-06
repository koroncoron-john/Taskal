'use client'

import { useState } from 'react'
import styles from './page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'

const categories = [
    { id: '1', name: 'プログラミング' },
    { id: '2', name: 'デザイン' },
    { id: '3', name: 'ビジネス' },
    { id: '4', name: '英語' },
]

const notesData = [
    { id: '1', categoryId: '1', title: 'Next.js App Router入門', content: 'Server ComponentsとClient Componentsの使い分け...', status: 'studying', ai_feedback: '' },
    { id: '2', categoryId: '1', title: 'Supabase RLSの設計パターン', content: 'Row Level Securityのベストプラクティス...', status: 'completed', ai_feedback: 'RLSの基本を理解できています。' },
    { id: '3', categoryId: '2', title: 'Figmaのオートレイアウト', content: 'オートレイアウトを使った効率的なデザイン...', status: 'studying', ai_feedback: '' },
    { id: '4', categoryId: '3', title: 'フリーランスの契約書テンプレ', content: '業務委託契約で抑えるべきポイント...', status: 'completed', ai_feedback: '実践的な内容です。' },
]

export default function LearningPage() {
    const [selectedCat, setSelectedCat] = useState<string | null>(null)
    const filtered = selectedCat ? notesData.filter(n => n.categoryId === selectedCat) : notesData

    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelTitle, setPanelTitle] = useState('')

    const openPanel = (title: string) => {
        setPanelTitle(title)
        setIsPanelOpen(true)
    }

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className="text-page-title">Learning</h1>
                    <p className="text-secondary">学びたいこと・学んだことのアウトプット記録</p>
                </div>
                <button className="btn btn-primary" onClick={() => openPanel('Create New Note')}>＋ New Note</button>
            </div>

            <div className={styles.categories}>
                <button
                    className={`${styles.catBtn} ${selectedCat === null ? styles.catActive : ''}`}
                    onClick={() => setSelectedCat(null)}
                >All</button>
                {categories.map(c => (
                    <button
                        key={c.id}
                        className={`${styles.catBtn} ${selectedCat === c.id ? styles.catActive : ''}`}
                        onClick={() => setSelectedCat(c.id)}
                    >{c.name}</button>
                ))}
            </div>

            <div className={styles.noteGrid}>
                {filtered.map(note => (
                    <div key={note.id} className={styles.noteCard} style={{ cursor: 'pointer' }} onClick={() => openPanel(`Edit: ${note.title}`)}>
                        <div className={styles.noteHeader}>
                            <span className={`dot ${note.status === 'completed' ? 'dot-success' : 'dot-important'}`} />
                            <span className={styles.noteStatus}>{note.status === 'completed' ? '完了' : '学習中'}</span>
                        </div>
                        <h3 className={styles.noteTitle}>{note.title}</h3>
                        <p className={styles.noteContent}>{note.content}</p>
                        {note.ai_feedback && (
                            <div className={styles.aiFeedback}>
                                <span className={styles.aiLabel}>AI Feedback</span>
                                <p>{note.ai_feedback}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelTitle}>
                <p className="text-secondary" style={{ marginBottom: 24 }}>ノートの作成・編集とAIフィードバックの確認エリア（モック）。</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label">Note Title</label>
                        <input type="text" className="select" defaultValue={panelTitle.replace('Edit: ', '')} style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Category</label>
                        <select className="select">
                            {categories.map(c => <option key={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-section-label">Content</label>
                        <textarea className="select" rows={5} style={{ backgroundImage: 'none', cursor: 'text', height: 'auto', resize: 'vertical' }}></textarea>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 16, width: 'fit-content' }}>Save changes</button>
                </div>
            </SlidePanel>
        </div>
    )
}
