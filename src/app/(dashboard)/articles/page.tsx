'use client'

import { useState } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'

export default function ArticlesPage() {
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelTitle, setPanelTitle] = useState('')

    const articles = [
        { id: '1', title: '朝5時、画面の向こうに仲間がいた話', platform: 'note', status: '投稿済み', month: '2026-02' },
        { id: '2', title: '新社会人に伝えたいこと', platform: 'note', status: '下書き', month: '2026-03' },
        { id: '3', title: 'Supabase-like UI Patterns', platform: '自社サイト', status: '下書き', month: '2026-03' },
        { id: '4', title: '朝活コミュニティに向いてない人の特徴', platform: 'note', status: '投稿済み', month: '2026-02' },
        { id: '5', title: 'AI時代のノーコード開発', platform: 'X', status: 'アイデア', month: '' },
        { id: '6', title: 'リモートワークの生産性を上げる5つの習慣', platform: 'note', status: 'アイデア', month: '' },
    ]

    const openPanel = (title: string) => {
        setPanelTitle(title)
        setIsPanelOpen(true)
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Articles</h1>
                <div className={styles.actions}>
                    <button className="btn btn-outline">Filter</button>
                    <button className="btn btn-outline">Sort</button>
                    <button className="btn btn-primary" onClick={() => openPanel('Create New Article')}>＋ New Article</button>
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thCheck}><input type="checkbox" className="checkbox" /></th>
                            <th>Title</th>
                            <th>Platform</th>
                            <th>Status</th>
                            <th>Month</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((a) => (
                            <tr key={a.id}>
                                <td className={styles.tdCheck}><input type="checkbox" className="checkbox" /></td>
                                <td className={styles.tdName}>
                                    <span className="text-link" onClick={() => openPanel(`Edit: ${a.title}`)}>{a.title}</span>
                                </td>
                                <td className="text-secondary">{a.platform}</td>
                                <td>{a.status}</td>
                                <td className="text-mono text-secondary">{a.month || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>Page 1 of 1 | {articles.length} articles</div>

            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelTitle}>
                <p className="text-secondary" style={{ marginBottom: 24 }}>ここは作成・編集情報の詳細エリア（モック）です。</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label">Title</label>
                        <input type="text" className="select" defaultValue={panelTitle.replace('Edit: ', '')} style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Platform</label>
                        <select className="select">
                            <option>note</option>
                            <option>自社サイト</option>
                            <option>X</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-section-label">Status</label>
                        <select className="select">
                            <option>アイデア</option>
                            <option>下書き</option>
                            <option>投稿済み</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 16, width: 'fit-content' }}>Save changes</button>
                </div>
            </SlidePanel>
        </div>
    )
}
