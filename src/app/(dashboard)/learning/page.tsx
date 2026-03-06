'use client'

import { useState } from 'react'
import styles from './page.module.css'

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

    return (
        <div>
            <div className={styles.header}>
                <div>
                    <h1 className="text-page-title">Learning</h1>
                    <p className="text-secondary">学びたいこと・学んだことのアウトプット記録</p>
                </div>
                <button className="btn btn-primary">＋ New Note</button>
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
                    <div key={note.id} className={styles.noteCard}>
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
        </div>
    )
}
