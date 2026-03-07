'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import { createClient } from '../../../lib/supabase/client'
import type { Article } from '../../../types/database'

export default function ArticlesPage() {
    const supabase = createClient()
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
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
        setLoading(false)
    }, [])

    useEffect(() => { fetchArticles() }, [fetchArticles])

    const openCreate = () => { setPanelMode('create'); setEditing(null); setFormTitle(''); setFormPlatform('note'); setFormStatus('アイデア'); setFormMonth(''); setIsPanelOpen(true) }
    const openEdit = (a: Article) => { setPanelMode('edit'); setEditing(a); setFormTitle(a.title); setFormPlatform(a.platform); setFormStatus(a.status); setFormMonth(a.month); setIsPanelOpen(true) }

    const handleSave = async () => {
        const p = { title: formTitle, platform: formPlatform, status: formStatus, month: formMonth }
        if (panelMode === 'create') { await supabase.from('articles').insert(p) } else if (editing) { await supabase.from('articles').update(p).eq('id', editing.id) }
        setIsPanelOpen(false); fetchArticles()
    }
    const handleDelete = async () => { if (!editing) return; await supabase.from('articles').delete().eq('id', editing.id); setIsPanelOpen(false); fetchArticles() }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Articles</h1>
                <div className={styles.actions}><button className="btn btn-primary" onClick={openCreate}>＋ New Article</button></div>
            </div>
            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <><div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr><th className={styles.thCheck}><input type="checkbox" className="checkbox" /></th><th>Title</th><th>Platform</th><th>Status</th><th>Month</th></tr></thead>
                    <tbody>{articles.map(a => (
                        <tr key={a.id}><td className={styles.tdCheck}><input type="checkbox" className="checkbox" /></td>
                            <td className={styles.tdName}><span className="text-link" onClick={() => openEdit(a)}>{a.title}</span></td>
                            <td className="text-secondary">{a.platform}</td><td>{a.status}</td><td className="text-mono text-secondary">{a.month || '—'}</td></tr>
                    ))}</tbody></table></div><div className={styles.pagination}>{articles.length} articles</div></>
            )}
            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Article' : 'Edit Article'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Title</label><input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Platform</label><select className="select" value={formPlatform} onChange={e => setFormPlatform(e.target.value)}><option>note</option><option>自社サイト</option><option>X</option></select></div>
                    <div><label className="text-section-label">Status</label><select className="select" value={formStatus} onChange={e => setFormStatus(e.target.value as Article['status'])}><option>アイデア</option><option>下書き</option><option>投稿済み</option></select></div>
                    <div><label className="text-section-label">Month</label><input type="month" className="select" value={formMonth} onChange={e => setFormMonth(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
