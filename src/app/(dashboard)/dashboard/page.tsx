import styles from './page.module.css'

export default function DashboardPage() {
    // TODO: Supabase連携後にリアルデータに差し替え
    const todayTasks = [
        { id: '1', title: 'クライアントA 見積書提出', priority: 'urgent_important' as const, due: '今日', project: 'WebApp開発' },
        { id: '2', title: 'デザインレビュー MTG', priority: 'urgent_important' as const, due: '14:00', project: 'LP制作' },
        { id: '3', title: 'note記事 下書き完成', priority: 'important' as const, due: '3/7', project: '' },
        { id: '4', title: 'Taskal MVP設計', priority: 'important' as const, due: '3/10', project: 'Taskal' },
        { id: '5', title: '請求書発行', priority: 'urgent' as const, due: '今日', project: 'モバイルアプリ' },
    ]

    const projects = [
        { name: 'WebApp開発 - A社', phase: '開発', progress: 60 },
        { name: 'LP制作 - B社', phase: '納品', progress: 85 },
        { name: 'ECサイト保守 - C社', phase: '保守', progress: 40 },
    ]

    const matrix = {
        urgent_important: 2,
        important: 5,
        urgent: 1,
        other: 3,
    }

    const priorityDotClass = (p: string) => {
        if (p === 'urgent_important' || p === 'urgent') return 'dot-urgent'
        if (p === 'important') return 'dot-important'
        return 'dot-other'
    }

    return (
        <div className={styles.dashboard}>
            {/* Greeting */}
            <div className={styles.greeting}>
                <p className={styles.greetingText}>おはようございます、じょんさん</p>
                <h1 className={styles.date}>
                    {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
                </h1>
            </div>

            {/* 今日のタスク */}
            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>今日のタスク</h2>
                <div className={styles.taskList}>
                    {todayTasks.map((task) => (
                        <div key={task.id} className={styles.taskRow}>
                            <input type="checkbox" className={styles.checkbox} />
                            <span className={`dot ${priorityDotClass(task.priority)}`} />
                            <span className={styles.taskName}>{task.title}</span>
                            <span className={styles.taskMeta}>
                                {task.project && <span>{task.project}</span>}
                                <span>{task.due}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            {/* 案件サマリー + マトリクス */}
            <div className={styles.twoCol}>
                <section className={styles.card}>
                    <h2 className={styles.sectionTitle}>案件サマリー</h2>
                    <div className={styles.projectList}>
                        {projects.map((p) => (
                            <div key={p.name} className={styles.projectRow}>
                                <div className={styles.projectInfo}>
                                    <span className={styles.projectName}>{p.name}</span>
                                    <span className="text-caption">{p.phase}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className={styles.card}>
                    <h2 className={styles.sectionTitle}>マトリクス</h2>
                    <div className={styles.matrix}>
                        <div className={styles.matrixCell}>
                            <span className={styles.matrixLabel}>緊急×重要</span>
                            <span className={styles.matrixCount} style={{ opacity: 1 }}>{matrix.urgent_important}</span>
                        </div>
                        <div className={styles.matrixCell}>
                            <span className={styles.matrixLabel}>重要</span>
                            <span className={styles.matrixCount} style={{ opacity: 0.8 }}>{matrix.important}</span>
                        </div>
                        <div className={styles.matrixCell}>
                            <span className={styles.matrixLabel}>緊急</span>
                            <span className={styles.matrixCount} style={{ opacity: 0.6 }}>{matrix.urgent}</span>
                        </div>
                        <div className={styles.matrixCell}>
                            <span className={styles.matrixLabel}>その他</span>
                            <span className={styles.matrixCount} style={{ opacity: 0.4 }}>{matrix.other}</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
