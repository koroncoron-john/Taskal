'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import DateInput from '../../../components/DateInput/DateInput'
import { createClient } from '../../../lib/supabase/client'
import type { Article } from '../../../types/database'

export default function ArticlesPage() {
    const supabase = createClient()
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
    const [editing, setEditing] = useState<Article | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formPlatform, setFormPlatform] = useState('note')
    const [formStatus, setFormStatus] = useState<Article['status']>('アイデア')
    const [formMonth, setFormMonth] = useState('')

    const fetchArticles = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
        setArticles(data || [])
        setSelectedIds(new Set())
        setLoading(false)
    }, [])

    useEffect(() => { fetchArticles() }, [fetchArticles])

    const toggleSelect = (id: string) => { setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }
    const toggleSelectAll = () => { setSelectedIds(prev => prev.size === articles.length ? new Set() : new Set(articles.map(a => a.id))) }

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return
        await supabase.from('articles').delete().in('id', Array.from(selectedIds))
        fetchArticles()
    }

    const handleCsvExport = () => {
        const header = 'Title,Platform,Status,Month\n'
        const rows = articles.map(a => `"${a.title}","${a.platform}","${a.status}","${a.month}"`).join('\n')
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'articles.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const openCreate = () => { setPanelMode('create'); setEditing(null); setFormTitle(''); setFormPlatform('note'); setFormStatus('アイデア'); setFormMonth(''); setIsPanelOpen(true) }
    const openEdit = (a: Article) => { setPanelMode('edit'); setEditing(a); setFormTitle(a.title); setFormPlatform(a.platform); setFormStatus(a.status); setFormMonth(a.month); setIsPanelOpen(true) }

    const handleSave = async () => {
        const p = { title: formTitle, platform: formPlatform, status: formStatus, month: formMonth }
        if (panelMode === 'create') await supabase.from('articles').insert(p)
        else if (editing) await supabase.from('articles').update(p).eq('id', editing.id)
        setIsPanelOpen(false); fetchArticles()
    }
    const handleDelete = async () => { if (!editing) return; await supabase.from('articles').delete().eq('id', editing.id); setIsPanelOpen(false); fetchArticles() }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Articles</h1>
                <div className={styles.actions}>
                    {selectedIds.size > 0 && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleBulkDelete}>🗑 Delete ({selectedIds.size})</button>}
                    <button className="btn btn-outline" onClick={handleCsvExport}>📥 CSV</button>
                    <button className="btn btn-primary" onClick={openCreate}>＋ New Article</button>
                </div>
            </div>
            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <><div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr>
                        <th className={styles.thCheck}><input type="checkbox" className="checkbox" checked={selectedIds.size === articles.length && articles.length > 0} onChange={toggleSelectAll} /></th>
                        <th>Title</th><th>Platform</th><th>Status</th><th>Month</th>
                    </tr></thead>
                    <tbody>{articles.map(a => (
                        <tr key={a.id}><td className={styles.tdCheck}><input type="checkbox" className="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                            <td className={styles.tdName}><span className="text-link" onClick={() => openEdit(a)}>{a.title}</span></td>
                            <td className="text-secondary">{a.platform}</td><td>{a.status}</td><td className="text-mono text-secondary">{a.month || '—'}</td></tr>
                    ))}</tbody></table></div><div className={styles.pagination}>{articles.length} articles</div></>
            )}
            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Article' : 'Edit Article'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Title</label><input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Platform</label><select className="select" value={formPlatform} onChange={e => setFormPlatform(e.target.value)}><option>note</option><option>自社サイト</option><option>X</option></select></div>
                    <div><label className="text-section-label">Status</label><select className="select" value={formStatus} onChange={e => setFormStatus(e.target.value as Article['status'])}><option>アイデア</option><option>下書き</option><option>投稿済み</option></select></div>
                    <div><label className="text-section-label">Month</label><DateInput value={formMonth} onChange={setFormMonth} type="month" placeholder="月を選択" /></div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
