import styles from '../tasks/page.module.css'

export default function BusinessCardsPage() {
    const contacts = [
        { id: '1', name: '田中 太郎', company: 'ABC株式会社', industry: 'IT/SaaS', occasion: '会食', location: '渋谷・イタリアン', date: '2026/02/28', affinity: 'high', notes: 'AI開発に興味あり' },
        { id: '2', name: '佐藤 花子', company: 'DEFデザイン', industry: 'デザイン', occasion: 'イベント', location: '渋谷ヒカリエ', date: '2026/02/15', affinity: 'medium', notes: 'LPデザイン相談可能' },
        { id: '3', name: '山田 健一', company: 'GHI不動産', industry: '不動産', occasion: '紹介', location: 'オンライン', date: '2026/01/20', affinity: 'low', notes: '不動産テック検討中' },
        { id: '4', name: '鈴木 美咲', company: 'JKLメディア', industry: 'メディア', occasion: '会食', location: '六本木・和食', date: '2026/03/01', affinity: 'high', notes: 'コラボ動画提案' },
        { id: '5', name: '高橋 一郎', company: 'MNO商事', industry: '商社', occasion: 'イベント', location: 'ビッグサイト', date: '2026/02/10', affinity: 'medium', notes: '海外展開の相談' },
    ]

    const affinityStyle = (a: string) => {
        if (a === 'high') return { color: 'var(--color-brand)' }
        if (a === 'low') return { color: 'var(--color-text-tertiary)' }
        return {}
    }

    const affinityLabel = (a: string) => {
        if (a === 'high') return '高'
        if (a === 'medium') return '中'
        return '低'
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">BusinessCards</h1>
                <div className={styles.actions}>
                    <button className="btn btn-outline">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        CSV Import
                    </button>
                    <button className="btn btn-outline">Filter</button>
                    <button className="btn btn-outline">Sort</button>
                    <button className="btn btn-primary">＋ New Contact</button>
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thCheck}><input type="checkbox" /></th>
                            <th>Name</th>
                            <th>Company</th>
                            <th>Industry</th>
                            <th>Occasion</th>
                            <th>Location</th>
                            <th>Date</th>
                            <th>Affinity</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((c) => (
                            <tr key={c.id}>
                                <td className={styles.tdCheck}><input type="checkbox" /></td>
                                <td className={styles.tdName}>{c.name}</td>
                                <td>{c.company}</td>
                                <td className="text-secondary">{c.industry}</td>
                                <td className="text-secondary">{c.occasion}</td>
                                <td className="text-secondary">{c.location}</td>
                                <td className="text-mono text-secondary">{c.date}</td>
                                <td style={affinityStyle(c.affinity)}>{affinityLabel(c.affinity)}</td>
                                <td className="text-secondary">{c.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>Page 1 of 1 | {contacts.length} contacts</div>
        </div>
    )
}
