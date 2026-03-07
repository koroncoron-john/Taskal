'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import { createClient } from '../../../lib/supabase/client'
import type { BusinessCard } from '../../../types/database'

export default function BusinessCardsPage() {
    const supabase = createClient()
    const [cards, setCards] = useState<BusinessCard[]>([])
    const [loading, setLoading] = useState(true)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
    const [editing, setEditing] = useState<BusinessCard | null>(null)
    const [formName, setFormName] = useState('')
    const [formCompany, setFormCompany] = useState('')
    const [formRole, setFormRole] = useState('')
    const [formEmail, setFormEmail] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formAffinity, setFormAffinity] = useState<BusinessCard['affinity']>('普通')

    const fetchCards = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('business_cards').select('*').order('created_at', { ascending: false })
        setCards(data || [])
        setLoading(false)
    }, [])

    useEffect(() => { fetchCards() }, [fetchCards])

    const openCreate = () => { setPanelMode('create'); setEditing(null); setFormName(''); setFormCompany(''); setFormRole(''); setFormEmail(''); setFormPhone(''); setFormAffinity('普通'); setIsPanelOpen(true) }
    const openEdit = (c: BusinessCard) => { setPanelMode('edit'); setEditing(c); setFormName(c.name); setFormCompany(c.company); setFormRole(c.role); setFormEmail(c.email); setFormPhone(c.phone); setFormAffinity(c.affinity); setIsPanelOpen(true) }

    const handleSave = async () => {
        const p = { name: formName, company: formCompany, role: formRole, email: formEmail, phone: formPhone, affinity: formAffinity }
        if (panelMode === 'create') { await supabase.from('business_cards').insert(p) } else if (editing) { await supabase.from('business_cards').update(p).eq('id', editing.id) }
        setIsPanelOpen(false); fetchCards()
    }
    const handleDelete = async () => { if (!editing) return; await supabase.from('business_cards').delete().eq('id', editing.id); setIsPanelOpen(false); fetchCards() }

    const affinityColor = (a: string) => a === '高' ? 'var(--color-brand)' : a === '低' ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)'

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">BusinessCards</h1>
                <div className={styles.actions}>
                    <button className="btn btn-outline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg> CSV Import
                    </button>
                    <button className="btn btn-primary" onClick={openCreate}>＋ New Contact</button>
                </div>
            </div>
            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <><div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr><th className={styles.thCheck}><input type="checkbox" className="checkbox" /></th><th>Name</th><th>Company</th><th>Role</th><th>Email</th><th>Affinity</th></tr></thead>
                    <tbody>{cards.map(c => (
                        <tr key={c.id}><td className={styles.tdCheck}><input type="checkbox" className="checkbox" /></td>
                            <td className={styles.tdName}><span className="text-link" onClick={() => openEdit(c)}>{c.name}</span></td>
                            <td className="text-secondary">{c.company}</td><td className="text-secondary">{c.role}</td>
                            <td className="text-secondary">{c.email}</td>
                            <td style={{ color: affinityColor(c.affinity), fontWeight: 600 }}>{c.affinity}</td></tr>
                    ))}</tbody></table></div><div className={styles.pagination}>{cards.length} contacts</div></>
            )}
            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Contact' : 'Edit Contact'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Name</label><input type="text" className="select" value={formName} onChange={e => setFormName(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Company</label><input type="text" className="select" value={formCompany} onChange={e => setFormCompany(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Role</label><input type="text" className="select" value={formRole} onChange={e => setFormRole(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Email</label><input type="email" className="select" value={formEmail} onChange={e => setFormEmail(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Phone</label><input type="tel" className="select" value={formPhone} onChange={e => setFormPhone(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Affinity</label><select className="select" value={formAffinity} onChange={e => setFormAffinity(e.target.value as BusinessCard['affinity'])}><option>高</option><option>普通</option><option>低</option></select></div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave}>Save</button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
