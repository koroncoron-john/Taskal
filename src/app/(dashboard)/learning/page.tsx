'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import { createClient } from '../../../lib/supabase/client'
import type { LearningNote } from '../../../types/database'

const categories = ['プログラミング', 'デザイン', 'ビジネス', '英語']

export default function LearningPage() {
    const supabase = createClient()
    const [notes, setNotes] = useState<LearningNote[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCat, setSelectedCat] = useState<string | null>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
    const [editing, setEditing] = useState<LearningNote | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formCategory, setFormCategory] = useState('プログラミング')
    const [formContent, setFormContent] = useState('')
    const [formStatus, setFormStatus] = useState<LearningNote['status']>('studying')

    const fetchNotes = useCallback(async () => {
        setLoading(true)
        let query = supabase.from('learning_notes').select('*').order('created_at', { ascending: false })
        if (selectedCat) { query = query.eq('category', selectedCat) }
        const { data } = await query
        setNotes(data || [])
        setLoading(false)
    }, [selectedCat])

    useEffect(() => { fetchNotes() }, [fetchNotes])

    const openCreate = () => { setPanelMode('create'); setEditing(null); setFormTitle(''); setFormCategory('プログラミング'); setFormContent(''); setFormStatus('studying'); setIsPanelOpen(true) }
    const openEdit = (n: LearningNote) => { setPanelMode('edit'); setEditing(n); setFormTitle(n.title); setFormCategory(n.category); setFormContent(n.content); setFormStatus(n.status); setIsPanelOpen(true) }

    const handleSave = async () => {
        const p = { title: formTitle, category: formCategory, content: formContent, status: formStatus }
        if (panelMode === 'create') { await supabase.from('learning_notes').insert(p) } else if (editing) { await supabase.from('learning_notes').update(p).eq('id', editing.id) }
        setIsPanelOpen(false); fetchNotes()
    }
    const handleDelete = async () => { if (!editing) return; await supabase.from('learning_notes').delete().eq('id', editing.id); setIsPanelOpen(false); fetchNotes() }

    return (
        <div>
            <div className={styles.header}>
                <div><h1 className="text-page-title">Learning</h1><p className="text-secondary">学びたいこと・学んだことのアウトプット記録</p></div>
                <button className="btn btn-primary" onClick={openCreate}>＋ New Note</button>
            </div>
            <div className={styles.categories}>
                <button className={`${styles.catBtn} ${selectedCat === null ? styles.catActive : ''}`} onClick={() => setSelectedCat(null)}>All</button>
                {categories.map(c => <button key={c} className={`${styles.catBtn} ${selectedCat === c ? styles.catActive : ''}`} onClick={() => setSelectedCat(c)}>{c}</button>)}
            </div>
            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <div className={styles.noteGrid}>
                    {notes.map(note => (
                        <div key={note.id} className={styles.noteCard} style={{ cursor: 'pointer' }} onClick={() => openEdit(note)}>
                            <div className={styles.noteHeader}>
                                <span className={`dot ${note.status === 'completed' ? 'dot-success' : 'dot-important'}`} />
                                <span className={styles.noteStatus}>{note.status === 'completed' ? '完了' : '学習中'}</span>
                            </div>
                            <h3 className={styles.noteTitle}>{note.title}</h3>
                            <p className={styles.noteContent}>{note.content}</p>
                            {note.ai_feedback && <div className={styles.aiFeedback}><span className={styles.aiLabel}>AI Feedback</span><p>{note.ai_feedback}</p></div>}
                        </div>
                    ))}
                </div>
            )}
            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Note' : 'Edit Note'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Title</label><input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Category</label><select className="select" value={formCategory} onChange={e => setFormCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label className="text-section-label">Content</label><textarea className="select" rows={5} value={formContent} onChange={e => setFormContent(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text', height: 'auto', resize: 'vertical' }} /></div>
                    <div><label className="text-section-label">Status</label><select className="select" value={formStatus} onChange={e => setFormStatus(e.target.value as LearningNote['status'])}><option value="studying">学習中</option><option value="completed">完了</option></select></div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
