'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback, useRef } from 'react'
import styles from '../tasks/page.module.css'
import SlidePanel from '../../../components/SlidePanel/SlidePanel'
import DateInput from '../../../components/DateInput/DateInput'
import { createClient } from '../../../lib/supabase/client'
import type { Article } from '../../../types/database'

const PLATFORM_OPTIONS = ['note', '自社サイト', 'X', 'Qiita', 'Zenn', 'Medium', 'YouTube', 'Instagram']

export default function ArticlesPage() {
    const supabase = createClient()
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create')
    const [editing, setEditing] = useState<Article | null>(null)
    const [formTitle, setFormTitle] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formPlatforms, setFormPlatforms] = useState<string[]>([])
    const [formStatus, setFormStatus] = useState<Article['status']>('アイデア')
    const [formMonth, setFormMonth] = useState('')
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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
        const header = 'Title,Platform,Status,Month,Description\n'
        const rows = articles.map(a => {
            const platforms = (a as any).platforms ? ((a as any).platforms as string[]).join('; ') : (a.platform || '')
            return `"${a.title}","${platforms}","${a.status}","${a.month}","${((a as any).description || '').replace(/"/g, '""')}"`
        }).join('\n')
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'articles.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const openCreate = () => {
        setPanelMode('create'); setEditing(null)
        setFormTitle(''); setFormDescription(''); setFormPlatforms([]); setFormStatus('アイデア'); setFormMonth('')
        setThumbnailFile(null); setThumbnailPreview(null)
        setIsPanelOpen(true)
    }
    const openEdit = (a: Article) => {
        setPanelMode('edit'); setEditing(a)
        setFormTitle(a.title)
        setFormDescription((a as any).description || '')
        setFormPlatforms((a as any).platforms || (a.platform ? [a.platform] : []))
        setFormStatus(a.status)
        setFormMonth(a.month)
        setThumbnailFile(null)
        setThumbnailPreview((a as any).thumbnail_url || null)
        setIsPanelOpen(true)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setThumbnailFile(file)
        setThumbnailPreview(URL.createObjectURL(file))
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    const handleSave = async () => {
        setUploading(true)

        // サムネイルBase64を決定
        let thumbnailUrl = editing ? ((editing as any).thumbnail_url || '') : ''
        if (thumbnailFile) {
            thumbnailUrl = await fileToBase64(thumbnailFile)
        }

        const payload: any = {
            title: formTitle,
            description: formDescription,
            platform: formPlatforms[0] || '',
            platforms: formPlatforms,
            status: formStatus,
            month: formMonth,
            thumbnail_url: thumbnailUrl,
        }

        if (panelMode === 'create') {
            await supabase.from('articles').insert(payload)
        } else if (editing) {
            await supabase.from('articles').update(payload).eq('id', editing.id)
        }

        setUploading(false)
        setIsPanelOpen(false)
        fetchArticles()
    }

    const handleDelete = async () => {
        if (!editing) return
        await supabase.from('articles').delete().eq('id', editing.id)
        setIsPanelOpen(false)
        fetchArticles()
    }

    const handleDownloadThumbnail = (dataUrl: string, title: string) => {
        const a = document.createElement('a')
        a.href = dataUrl
        const ext = dataUrl.startsWith('data:image/png') ? 'png' : dataUrl.startsWith('data:image/gif') ? 'gif' : 'jpg'
        a.download = `${title}_thumbnail.${ext}`
        a.click()
    }

    // Platform追加/削除
    const addPlatform = (platform: string) => {
        if (!formPlatforms.includes(platform)) setFormPlatforms([...formPlatforms, platform])
    }
    const removePlatform = (platform: string) => {
        setFormPlatforms(formPlatforms.filter(p => p !== platform))
    }

    const getPlatformsDisplay = (a: Article): string => {
        const platforms = (a as any).platforms as string[] | undefined
        if (platforms && platforms.length > 0) return platforms.join(', ')
        return a.platform || '—'
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Articles</h1>
                <div className={styles.actions}>
                    {selectedIds.size > 0 && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleBulkDelete}>🗑 Delete ({selectedIds.size})</button>}
                    <button className="btn btn-outline" onClick={handleCsvExport} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        CSV
                    </button>
                    <button className="btn btn-primary" onClick={openCreate}>＋ New Article</button>
                </div>
            </div>
            {loading ? <p className="text-secondary" style={{ padding: 24 }}>読み込み中...</p> : (
                <><div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr>
                        <th className={styles.thCheck}><input type="checkbox" className="checkbox" checked={selectedIds.size === articles.length && articles.length > 0} onChange={toggleSelectAll} /></th>
                        <th style={{ width: 60 }}></th>
                        <th>Title</th><th>Platform</th><th>Status</th><th>Month</th>
                    </tr></thead>
                    <tbody>{articles.map(a => (
                        <tr key={a.id}>
                            <td className={styles.tdCheck}><input type="checkbox" className="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleSelect(a.id)} /></td>
                            <td style={{ padding: '4px 8px' }}>
                                {(a as any).thumbnail_url ? (
                                    <img
                                        src={(a as any).thumbnail_url}
                                        alt=""
                                        style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                                        onClick={() => handleDownloadThumbnail((a as any).thumbnail_url, a.title)}
                                        title="クリックでダウンロード"
                                    />
                                ) : (
                                    <div style={{ width: 48, height: 32, background: 'var(--color-surface)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--color-text-tertiary)' }}>No img</div>
                                )}
                            </td>
                            <td className={styles.tdName}><span className="text-link" onClick={() => openEdit(a)}>{a.title}</span></td>
                            <td className="text-secondary">{getPlatformsDisplay(a)}</td>
                            <td>{a.status}</td>
                            <td className="text-mono text-secondary">{a.month || '—'}</td>
                        </tr>
                    ))}
                        {articles.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-text-tertiary)', fontSize: 14 }}>No articles yet. Add one from "+ New Article".</td></tr>
                        )}
                    </tbody></table></div><div className={styles.pagination}>{articles.length} articles</div></>
            )}
            <SlidePanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} title={panelMode === 'create' ? 'New Article' : 'Edit Article'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="text-section-label">Title</label>
                        <input type="text" className="select" value={formTitle} onChange={e => setFormTitle(e.target.value)} style={{ backgroundImage: 'none', cursor: 'text' }} />
                    </div>

                    <div>
                        <label className="text-section-label">Description</label>
                        <textarea className="select" value={formDescription} onChange={e => setFormDescription(e.target.value)}
                            style={{ backgroundImage: 'none', cursor: 'text', minHeight: 80, resize: 'vertical', fontFamily: 'var(--font-family)' }} />
                    </div>

                    <div>
                        <label className="text-section-label">Thumbnail</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {thumbnailPreview && (
                                <img src={thumbnailPreview} alt="preview" style={{ width: 80, height: 54, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--color-border)' }} />
                            )}
                            <div>
                                <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 13 }}>
                                    📎 画像を選択
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                {thumbnailFile && <p className="text-secondary" style={{ margin: '4px 0 0', fontSize: 11 }}>{thumbnailFile.name}</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-section-label">Platforms</label>
                        {formPlatforms.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                {formPlatforms.map(p => (
                                    <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 13 }}>
                                        {p}
                                        <button onClick={() => removePlatform(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                        <select className="select" value="" onChange={e => { if (e.target.value) addPlatform(e.target.value) }}>
                            <option value="">＋ プラットフォームを追加</option>
                            {PLATFORM_OPTIONS.filter(o => !formPlatforms.includes(o)).map(o => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-section-label">Status</label>
                        <select className="select" value={formStatus} onChange={e => setFormStatus(e.target.value as Article['status'])}>
                            <option>アイデア</option><option>下書き</option><option>投稿済み</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-section-label">Month</label>
                        <DateInput value={formMonth} onChange={setFormMonth} type="month" placeholder="月を選択" />
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={uploading}>
                            {uploading ? 'Saving...' : 'Save'}
                        </button>
                        {panelMode === 'edit' && <button className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={handleDelete}>Delete</button>}
                    </div>
                </div>
            </SlidePanel>
        </div>
    )
}
