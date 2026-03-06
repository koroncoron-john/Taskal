'use client'

import { useState } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'

export default function MoviesPage() {
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelTitle, setPanelTitle] = useState('')

    const videos = [
        { id: '1', title: '朝5時起き生活のリアル', status: '投稿済み', views: 12500, likes: 340, popularity: 4 },
        { id: '2', title: 'ノーコードで月100万稼ぐ方法', status: '編集中', views: 0, likes: 0, popularity: 0 },
        { id: '3', title: '朝活ルーティン紹介', status: 'アイデア', views: 0, likes: 0, popularity: 0 },
        { id: '4', title: 'Supabase入門チュートリアル', status: '撮影済み', views: 0, likes: 0, popularity: 0 },
        { id: '5', title: 'フリーランス1年目の収支公開', status: 'アイデア', views: 0, likes: 0, popularity: 0 },
    ]

    const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

    const openPanel = (title: string) => {
        setPanelTitle(title)
        setIsPanelOpen(true)
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Movies</h1>
                <div className={styles.actions}>
                    <button className="btn btn-outline">Filter</button>
                    <button className="btn btn-outline">Sort</button>
                    <button className="btn btn-primary" onClick={() => openPanel('Create New Video')}>＋ New Video</button>
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thCheck}><input type="checkbox" className="checkbox" /></th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th>Likes</th>
                            <th>Popularity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map((v) => (
                            <tr key={v.id}>
                                <td className={styles.tdCheck}><input type="checkbox" className="checkbox" /></td>
                                <td className={styles.tdName}>
                                    <span className="text-link" onClick={() => openPanel(`Edit: ${v.title}`)}>{v.title}</span>
                                </td>
                                <td>{v.status}</td>
                                <td className="text-mono text-secondary">{v.views.toLocaleString()}</td>
                                <td className="text-mono text-secondary">{v.likes.toLocaleString()}</td>
                                <td className="text-secondary">{v.popularity > 0 ? stars(v.popularity) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>Page 1 of 1 | {videos.length} videos</div>

            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelTitle}>
                <p className="text-secondary" style={{ marginBottom: 24 }}>ここは動画企画・編集ステータスの詳細エリア（モック）です。</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label">Video Title</label>
                        <input type="text" className="select" defaultValue={panelTitle.replace('Edit: ', '')} style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Status</label>
                        <select className="select">
                            <option>アイデア</option>
                            <option>撮影済み</option>
                            <option>編集中</option>
                            <option>投稿済み</option>
                        </select>
                    </div>
                    <button className="btn btn-primary" style={{ marginTop: 16, width: 'fit-content' }}>Save changes</button>
                </div>
            </SlidePanel>
        </div>
    )
}
