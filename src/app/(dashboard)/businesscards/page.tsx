'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import DateInput from '../../../components/DateInput/DateInput'
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
    const [formRegisteredDate, setFormRegisteredDate] = useState('')
    const [formMeetStatus, setFormMeetStatus] = useState('Not Met')
    const [formMemo, setFormMemo] = useState('')
    const [importResult, setImportResult] = useState<string | null>(null)
    const csvInputRef = useRef<HTMLInputElement>(null)

    // Filter & Sort
    const [filterStatus, setFilterStatus] = useState<'All' | 'Met' | 'Not Met'>('All')
    const [sortKey, setSortKey] = useState<'newest' | 'oldest' | 'affinity_high' | 'affinity_low'>('newest')

    const fetchCards = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('business_cards').select('*').order('created_at', { ascending: false })
        setCards(data || [])
        setLoading(false)
    }, [])

    useEffect(() => { fetchCards() }, [fetchCards])

    const openCreate = () => {
        setPanelMode('create'); setEditing(null)
        setFormName(''); setFormCompany(''); setFormRole(''); setFormEmail(''); setFormPhone('')
        setFormAffinity('普通'); setFormRegisteredDate(new Date().toISOString().slice(0, 10))
        setFormMeetStatus('Not Met'); setFormMemo('')
        setIsPanelOpen(true)
    }
    const openEdit = (c: BusinessCard) => {
        setPanelMode('edit'); setEditing(c)
        setFormName(c.name); setFormCompany(c.company); setFormRole(c.role)
        setFormEmail(c.email); setFormPhone(c.phone); setFormAffinity(c.affinity)
        setFormRegisteredDate((c as any).registered_date || '')
        setFormMeetStatus((c as any).meet_status || 'Not Met')
        setFormMemo((c as any).memo || '')
        setIsPanelOpen(true)
    }

    const handleSave = async () => {
        const p: any = {
            name: formName, company: formCompany, role: formRole,
            email: formEmail, phone: formPhone, affinity: formAffinity,
            registered_date: formRegisteredDate || null,
            meet_status: formMeetStatus,
            memo: formMemo,
        }
        if (panelMode === 'create') await supabase.from('business_cards').insert(p)
        else if (editing) await supabase.from('business_cards').update(p).eq('id', editing.id)
        setIsPanelOpen(false); fetchCards()
    }
    const handleDelete = async () => {
        if (!editing) return
        await supabase.from('business_cards').delete().eq('id', editing.id)
        setIsPanelOpen(false); fetchCards()
    }

    // CSVインポート
    const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const text = await file.text()
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        if (lines.length < 2) { setImportResult('CSVにデータ行がありません'); return }

        // ヘッダー解析
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
        const rows = lines.slice(1)

        let imported = 0
        for (const row of rows) {
            // CSV行をパース（ダブルクォート対応）
            const values = parseCSVRow(row)
            const record: any = {}
            headers.forEach((h, i) => {
                const v = values[i] || ''
                if (h === 'name' || h === '名前') record.name = v
                else if (h === 'company' || h === '会社' || h === '会社名') record.company = v
                else if (h === 'role' || h === '役職') record.role = v
                else if (h === 'email' || h === 'メール') record.email = v
                else if (h === 'phone' || h === '電話' || h === '電話番号') record.phone = v
                else if (h === 'affinity' || h === '親密度') record.affinity = v || '普通'
                else if (h === 'memo' || h === 'メモ') record.memo = v
                else if (h === 'meet_status' || h === 'ステータス') record.meet_status = v || 'Not Met'
                else if (h === 'registered_date' || h === '登録日') record.registered_date = v || null
            })
            if (record.name) {
                if (!record.company) record.company = ''
                if (!record.role) record.role = ''
                if (!record.email) record.email = ''
                if (!record.phone) record.phone = ''
                if (!record.affinity) record.affinity = '普通'
                if (!record.meet_status) record.meet_status = 'Not Met'
                if (!record.memo) record.memo = ''
                await supabase.from('business_cards').insert(record)
                imported++
            }
        }
        setImportResult(`${imported}件のコンタクトをインポートしました`)
        fetchCards()
        if (csvInputRef.current) csvInputRef.current.value = ''
        setTimeout(() => setImportResult(null), 4000)
    }

    const parseCSVRow = (row: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < row.length; i++) {
            const c = row[i]
            if (c === '"') { inQuotes = !inQuotes }
            else if (c === ',' && !inQuotes) { result.push(current.trim()); current = '' }
            else { current += c }
        }
        result.push(current.trim())
        return result
    }

    const affinityColor = (a: string) => a === '高' ? 'var(--color-brand)' : a === '低' ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)'
    const affinityOrder = (a: string) => a === '高' ? 3 : a === '普通' ? 2 : 1

    // フィルタ & ソート適用
    const filteredCards = cards
        .filter(c => filterStatus === 'All' || (c as any).meet_status === filterStatus)
        .sort((a, b) => {
            if (sortKey === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            if (sortKey === 'oldest') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
            if (sortKey === 'affinity_high') return affinityOrder(b.affinity) - affinityOrder(a.affinity)
            if (sortKey === 'affinity_low') return affinityOrder(a.affinity) - affinityOrder(b.affinity)
            return 0
        })

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">BusinessCards</h1>
                <div className={styles.actions}>
                    <button className="btn btn-outline" onClick={() => csvInputRef.current?.click()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg> CSV Import
                    </button>
                    <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCsvImport} style={{ display: 'none' }} />
                    <button className="btn btn-primary" onClick={openCreate}>＋ New Contact</button>
                </div>
            </div>

            {importResult && (
                <div style={{ padding: '12px 24px', background: 'var(--color-success-bg, rgba(34,197,94,0.1))', color: 'var(--color-success, #22c55e)', borderRadius: 'var(--border-radius)', margin: '0 0 16px', fontWeight: 500 }}>
                    ✅ {importResult}
                </div>
            )}

            {/* Filter & Sort bar */}
            <div style={{ display: 'flex', gap: 12, padding: '0 0 16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                    {(['All', 'Met', 'Not Met'] as const).map(s => (
                        <button key={s} className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '4px 14px', fontSize: 13 }}
                            onClick={() => setFilterStatus(s)}>{s}</button>
                    ))}
                </div>
                <select className="select" value={sortKey} onChange={e => setSortKey(e.target.value as any)}
                    style={{ width: 'auto', padding: '4px 32px 4px 10px', fontSize: 13 }}>
                    <option value="newest">登録日: 新しい順</option>
                    <option value="oldest">登録日: 古い順</option>
                    <option value="affinity_high">Affinity: 高→低</option>
                    <option value="affinity_low">Affinity: 低→高</option>
                </select>
            </div>

            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <><div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr>
                        <th className={styles.thCheck}><input type="checkbox" className="checkbox" /></th>
                        <th>Name</th><th>Company</th><th>Role</th><th>Email</th><th>Status</th><th>Registered</th><th>Affinity</th>
                    </tr></thead>
                    <tbody>{filteredCards.map(c => (
                        <tr key={c.id}>
                            <td className={styles.tdCheck}><input type="checkbox" className="checkbox" /></td>
                            <td className={styles.tdName}><span className="text-link" onClick={() => openEdit(c)}>{c.name}</span></td>
                            <td className="text-secondary">{c.company}</td>
                            <td className="text-secondary">{c.role}</td>
                            <td className="text-secondary">{c.email}</td>
                            <td>
                                <span style={{
                                    display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                    background: (c as any).meet_status === 'Met' ? 'rgba(34,197,94,0.12)' : 'rgba(156,163,175,0.12)',
                                    color: (c as any).meet_status === 'Met' ? '#22c55e' : 'var(--color-text-tertiary)'
                                }}>
                                    {(c as any).meet_status || 'Not Met'}
                                </span>
                            </td>
                            <td className="text-mono text-secondary" style={{ fontSize: 12 }}>{(c as any).registered_date || '—'}</td>
                            <td style={{ color: affinityColor(c.affinity), fontWeight: 600 }}>{c.affinity}</td>
                        </tr>
                    ))}</tbody></table></div><div className={styles.pagination}>{filteredCards.length} / {cards.length} contacts</div></>
            )}

            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Contact' : 'Edit Contact'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label className="text-section-label">Name</label><input type="text" className="select" value={formName} onChange={e => setFormName(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Company</label><input type="text" className="select" value={formCompany} onChange={e => setFormCompany(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Role</label><input type="text" className="select" value={formRole} onChange={e => setFormRole(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Email</label><input type="email" className="select" value={formEmail} onChange={e => setFormEmail(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Phone</label><input type="tel" className="select" value={formPhone} onChange={e => setFormPhone(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} /></div>
                    <div><label className="text-section-label">Affinity</label><select className="select" value={formAffinity} onChange={e => setFormAffinity(e.target.value as BusinessCard['affinity'])}><option>高</option><option>普通</option><option>低</option></select></div>
                    <div>
                        <label className="text-section-label">Registered Date</label>
                        <DateInput value={formRegisteredDate} onChange={setFormRegisteredDate} />
                    </div>
                    <div>
                        <label className="text-section-label">Status</label>
                        <select className="select" value={formMeetStatus} onChange={e => setFormMeetStatus(e.target.value)}>
                            <option value="Not Met">Not Met</option>
                            <option value="Met">Met</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-section-label">Memo</label>
                        <textarea className="select" value={formMemo} onChange={e => setFormMemo(e.target.value)}
                            style={{ backgroundImage: 'none', cursor: 'text', minHeight: 80, resize: 'vertical', fontFamily: 'var(--font-family)' }}
                            placeholder="メモを入力..." />
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
