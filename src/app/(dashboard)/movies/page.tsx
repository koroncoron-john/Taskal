'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import { createClient } from '../../../lib/supabase/client'
import type { Movie } from '../../../types/database'

export default function MoviesPage() {
    const supabase = createClient()
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
    const [editing, setEditing] = useState<Movie | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formStatus, setFormStatus] = useState<Movie['status']>('アイデア')

    const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

    const fetchMovies = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false })
        setMovies(data || [])
        setLoading(false)
    }, [])

    useEffect(() => { fetchMovies() }, [fetchMovies])

    const openCreate = () => { setPanelMode('create'); setEditing(null); setFormTitle(''); setFormStatus('アイデア'); setIsPanelOpen(true) }
    const openEdit = (m: Movie) => { setPanelMode('edit'); setEditing(m); setFormTitle(m.title); setFormStatus(m.status); setIsPanelOpen(true) }

    const handleSave = async () => {
        const p = { title: formTitle, status: formStatus }
        if (panelMode === 'create') { await supabase.from('movies').insert(p) } else if (editing) { await supabase.from('movies').update(p).eq('id', editing.id) }
        setIsPanelOpen(false); fetchMovies()
    }
    const handleDelete = async () => { if (!editing) return; await supabase.from('movies').delete().eq('id', editing.id); setIsPanelOpen(false); fetchMovies() }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Movies</h1>
                <div className={styles.actions}><button className="btn btn-primary" onClick={openCreate}>＋ New Video</button></div>
            </div>
            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <><div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr><th className={styles.thCheck}><input type="checkbox" className="checkbox" /></th><th>Title</th><th>Status</th><th>Views</th><th>Likes</th><th>Popularity</th></tr></thead>
                    <tbody>{movies.map(v => (
                        <tr key={v.id}><td className={styles.tdCheck}><input type="checkbox" className="checkbox" /></td>
                            <td className={styles.tdName}><span className="text-link" onClick={() => openEdit(v)}>{v.title}</span></td>
                            <td>{v.status}</td><td className="text-mono text-secondary">{v.views.toLocaleString()}</td>
                            <td className="text-mono text-secondary">{v.likes.toLocaleString()}</td>
                            <td className="text-secondary">{v.popularity > 0 ? stars(v.popularity) : '—'}</td></tr>
                    ))}</tbody></table></div><div className={styles.pagination}>{movies.length} videos</div></>
            )}
            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Video' : 'Edit Video'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Title</label><input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Status</label><select className="select" value={formStatus} onChange={e => setFormStatus(e.target.value as Movie['status'])}><option>アイデア</option><option>撮影済み</option><option>編集中</option><option>投稿済み</option></select></div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
