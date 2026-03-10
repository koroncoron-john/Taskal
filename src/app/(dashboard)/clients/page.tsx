'use client'

import { useState } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '@/components/SlidePanel/SlidePanel'
import { useToast } from '@/components/Toast/Toast'
import { useData, type Client } from '@/contexts/DataProvider'

export default function ClientsPage() {
    const { clients, isLoading, addClient, updateClient, deleteClient } = useData()
    const { showToast } = useToast()
    const [selected, setSelected] = useState<Client | null>(null)
    const [panelOpen, setPanelOpen] = useState(false)

    // フォーム
    const [formName, setFormName] = useState('')
    const [formContact, setFormContact] = useState('')
    const [formEmail, setFormEmail] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formMemo, setFormMemo] = useState('')
    const [saving, setSaving] = useState(false)

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
            await updateClient(selected.id, payload)
            showToast(`「${formName}」を更新しました`, 'success')
        } else {
            await addClient(payload)
            showToast(`「${formName}」を登録しました`, 'success')
        }
        setSaving(false)
        setPanelOpen(false)
    }

    const handleDelete = async () => {
        if (!selected) return
        if (!confirm(`「${selected.name}」を削除しますか？\nProjectsに紐づいているデータには影響しません。`)) return
        await deleteClient(selected.id)
        showToast(`「${selected.name}」を削除しました`, 'error')
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
            {isLoading ? (
                <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p>
            ) : (
                <div className={styles.tableWrap}>
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
                                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', padding: '48px 24px', fontSize: 14 }}>No clients yet. Add one from "+ New Client".</td></tr>
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
            )}

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

                    <div style={{ display: 'flex', gap: 8, paddingTop: 8, flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
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
                </div>
            </SlidePanel>
        </div>
    )
}
