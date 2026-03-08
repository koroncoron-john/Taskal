'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from '../tasks/page.module.css'
import SlidePanel from '@/components/SlidePanel/SlidePanel'

interface Client {
    id: string
    name: string
    contact_name: string
    email: string
    phone: string
    memo: string
    created_at: string
}

export default function ClientsPage() {
    const supabase = createClient()
    const [clients, setClients] = useState<Client[]>([])
    const [selected, setSelected] = useState<Client | null>(null)
    const [panelOpen, setPanelOpen] = useState(false)

    // フォーム
    const [formName, setFormName] = useState('')
    const [formContact, setFormContact] = useState('')
    const [formEmail, setFormEmail] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formMemo, setFormMemo] = useState('')
    const [saving, setSaving] = useState(false)

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
        if (data) setClients(data)
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const openPanel = (c: Client | null) => {
        setSelected(c)
        setFormName(c?.name || '')
        setFormContact(c?.contact_name || '')
        setFormEmail(c?.email || '')
        setFormPhone(c?.phone || '')
        setFormMemo(c?.memo || '')
        setPanelOpen(true)
    }

    const handleSave = async () => {
        setSaving(true)
        const payload = {
            name: formName,
            contact_name: formContact,
            email: formEmail,
            phone: formPhone,
            memo: formMemo,
        }
        if (selected) {
            await supabase.from('clients').update(payload).eq('id', selected.id)
        } else {
            await supabase.from('clients').insert(payload)
        }
        await fetchClients()
        setSaving(false)
        setPanelOpen(false)
    }

    const handleDelete = async () => {
        if (!selected) return
        if (!confirm(`「${selected.name}」を削除しますか？\nProjectsに紐づいているデータには影響しません。`)) return
        await supabase.from('clients').delete().eq('id', selected.id)
        await fetchClients()
        setPanelOpen(false)
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Clients</h1>
                <div className={styles.actions}>
                    <button className="btn btn-primary" onClick={() => openPanel(null)}>+ New Client</button>
                </div>
            </div>

            {/* テーブル */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Memo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '32px' }}>クライアントがまだありません。「+ New Client」から追加してください。</td></tr>
                        ) : clients.map(c => (
                            <tr key={c.id} onClick={() => openPanel(c)} style={{ cursor: 'pointer' }}>
                                <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.name}</td>
                                <td>{c.contact_name || '—'}</td>
                                <td>{c.email || '—'}</td>
                                <td>{c.phone || '—'}</td>
                                <td style={{ color: 'var(--color-text-tertiary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.memo || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* スライドパネル */}
            <SlidePanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} title={selected ? 'Edit Client' : 'New Client'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label">Client Name *</label>
                        <input type="text" className="select" value={formName} onChange={e => setFormName(e.target.value)}
                            placeholder="例: 株式会社〇〇" style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Contact Name</label>
                        <input type="text" className="select" value={formContact} onChange={e => setFormContact(e.target.value)}
                            placeholder="担当者名" style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Email</label>
                        <input type="email" className="select" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                            placeholder="email@example.com" style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Phone</label>
                        <input type="tel" className="select" value={formPhone} onChange={e => setFormPhone(e.target.value)}
                            placeholder="03-xxxx-xxxx" style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>
                    <div>
                        <label className="text-section-label">Memo</label>
                        <textarea className="select" value={formMemo} onChange={e => setFormMemo(e.target.value)}
                            placeholder="メモ..." rows={3}
                            style={{ backgroundImage: 'none', cursor: 'text', resize: 'vertical', fontFamily: 'inherit', padding: '8px 12px' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={!formName || saving}>
                            {saving ? '保存中...' : selected ? 'Save changes' : 'Create'}
                        </button>
                        {selected && (
                            <button className="btn" onClick={handleDelete}
                                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
