import styles from './page.module.css'

export default function TasksPage() {
    const tasks = [
        { id: '1', title: 'クライアントA 見積書提出', priority: 'urgent_important', project: 'WebApp開発', due: '2026/03/06', status: '進行中' },
        { id: '2', title: 'デザインレビュー MTG', priority: 'urgent_important', project: 'LP制作', due: '2026/03/06', status: '未着手' },
        { id: '3', title: 'note記事: 朝活の始め方', priority: 'important', project: '', due: '2026/03/07', status: '下書き' },
        { id: '4', title: 'Taskal MVP設計', priority: 'important', project: 'Taskal', due: '2026/03/10', status: '進行中' },
        { id: '5', title: 'YouTube企画: 朝活ルーティン', priority: 'important', project: '', due: '2026/03/12', status: 'アイデア' },
        { id: '6', title: '請求書発行: 案件D', priority: 'urgent', project: 'モバイルアプリ', due: '2026/03/06', status: '未着手' },
        { id: '7', title: '名刺整理', priority: 'other', project: '', due: '', status: '未着手' },
        { id: '8', title: 'ブログデザイン更新', priority: 'other', project: '', due: '', status: '未着手' },
    ]

    const priorityDot = (p: string) => {
        if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'
        if (p === 'important') return 'dot-important'
        return 'dot-other'
    }

    const priorityLabel = (p: string) => {
        if (p === 'urgent_important') return '緊急×重要'
        if (p === 'important') return '重要'
        if (p === 'urgent') return '緊急'
        return 'その他'
    }

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Tasks</h1>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${styles.tabActive}`}>Matrix</button>
                    <button className={styles.tab}>List</button>
                </div>
                <div className={styles.actions}>
                    <button className="btn btn-outline">Filter</button>
                    <button className="btn btn-outline">Sort</button>
                    <button className="btn btn-primary">＋ New Task</button>
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thCheck}><input type="checkbox" /></th>
                            <th>Task Name</th>
                            <th>Priority</th>
                            <th>Project</th>
                            <th>Due Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((t) => (
                            <tr key={t.id}>
                                <td className={styles.tdCheck}><input type="checkbox" /></td>
                                <td className={styles.tdName}>{t.title}</td>
                                <td><span className={`dot ${priorityDot(t.priority)}`} /> {priorityLabel(t.priority)}</td>
                                <td className="text-secondary">{t.project || '—'}</td>
                                <td className="text-mono text-secondary">{t.due || '—'}</td>
                                <td>{t.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>Page 1 of 1 | {tasks.length} tasks</div>
        </div>
    )
}
