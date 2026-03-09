'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import { createClient } from '../../../lib/supabase/client'
import type { Movie } from '../../../types/database'

export default function MoviesPage() {
    const supabase = createClient()
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
    const [editing, setEditing] = useState<Movie | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formYoutubeUrl, setFormYoutubeUrl] = useState('')
    const [formStatus, setFormStatus] = useState<Movie['status']>('アイデア')
    const [formDescription, setFormDescription] = useState('')

    const fetchMovies = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('movies').select('*').order('created_at', { ascending: false })
        setMovies(data || [])
        setSelectedIds(new Set())
        setLoading(false)
    }, [])

    useEffect(() => { fetchMovies() }, [fetchMovies])

    const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
    const toggleSelectAll = () => { setSelectedIds(prev => prev.size === movies.length ? new Set() : new Set(movies.map(m => m.id))) }

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        await supabase.from('movies').delete().in('id', Array.from(selectedIds))
        fetchMovies()
    }

    const handleCsvExport = () => {
        const header = 'Title,YouTube URL,Status,Description\n'
        const rows = movies.map(m => `"${m.title}","${(m as any).youtube_url || ''}","${m.status}","${((m as any).description || '').replace(/"/g, '""')}"`).join('\n')
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'movies.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const openCreate = () => {
        setPanelMode('create'); setEditing(null)
        setFormTitle(''); setFormYoutubeUrl(''); setFormStatus('アイデア'); setFormDescription('')
        setIsPanelOpen(true)
    }
    const openEdit = (m: Movie) => {
        setPanelMode('edit'); setEditing(m)
        setFormTitle(m.title); setFormYoutubeUrl((m as any).youtube_url || ''); setFormStatus(m.status); setFormDescription((m as any).description || '')
        setIsPanelOpen(true)
    }

    const handleSave = async () => {
        const p: any = { title: formTitle, youtube_url: formYoutubeUrl, status: formStatus, description: formDescription }
        if (panelMode === 'create') await supabase.from('movies').insert(p)
        else if (editing) await supabase.from('movies').update(p).eq('id', editing.id)
        setIsPanelOpen(false); fetchMovies()
    }
    const handleDelete = async () => { if (!editing) return; await supabase.from('movies').delete().eq('id', editing.id); setIsPanelOpen(false); fetchMovies() }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Movies</h1>
                <div className={styles.actions}>
                    {selectedIds.size > 0 && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleBulkDelete}>🗑 Delete ({selectedIds.size})</button>}
                    <button className="btn btn-outline" onClick={handleCsvExport} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        CSV
                    </button>
                    <button className="btn btn-primary" onClick={openCreate}>＋ New Video</button>
                </div>
            </div>
            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <><div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr>
                        <th className={styles.thCheck}><input type="checkbox" className="checkbox" checked={selectedIds.size === movies.length && movies.length > 0} onChange={toggleSelectAll} /></th>
                        <th>Title</th><th>YouTube</th><th>Status</th>
                    </tr></thead>
                    <tbody>{movies.map(v => (
                        <tr key={v.id}>
                            <td className={styles.tdCheck}><input type="checkbox" className="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelect(v.id)} /></td>
                            <td className={styles.tdName}><span className="text-link" onClick={() => openEdit(v)}>{v.title}</span></td>
                            <td>{(v as any).youtube_url ? (
                                <a href={(v as any).youtube_url} target="_blank" rel="noopener noreferrer" className="text-link" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                    External Link
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                </a>
                            ) : <span className="text-secondary">—</span>}</td>
                            <td>{v.status}</td>
                        </tr>
                    ))}
                        {movies.length === 0 && (
                            <tr><td colSpan={4} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-tertiary)', fontSize: 14 }}>No videos yet. Add one from "+ New Video".</td></tr>
                        )}
                    </tbody></table></div><div className={styles.pagination}>{movies.length} videos</div></>
            )}
            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Video' : 'Edit Video'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label">Title</label>
                        <input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">YouTube URL</label>
                        <input type="url" className="select" value={formYoutubeUrl} onChange={e => setFormYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Status</label>
                        <select className="select" value={formStatus} onChange={e => setFormStatus(e.target.value as Movie['status'])}>
                            <option>アイデア</option><option>撮影済み</option><option>編集中</option><option>投稿済み</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-section-label">Description</label>
                        <textarea className="select" value={formDescription} onChange={e => setFormDescription(e.target.value)}
                            style={{ backgroundImage: 'none', cursor: 'text', minHeight: 120, resize: 'vertical', fontFamily: 'var(--font-family)' }}
                            placeholder="目次やメモを記入..." />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
