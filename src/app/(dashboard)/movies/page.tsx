import styles from '../tasks/page.module.css'

export default function MoviesPage() {
    const videos = [
        { id: '1', title: '朝5時起き生活のリアル', status: '投稿済み', views: 12500, likes: 340, popularity: 4 },
        { id: '2', title: 'ノーコードで月100万稼ぐ方法', status: '編集中', views: 0, likes: 0, popularity: 0 },
        { id: '3', title: '朝活ルーティン紹介', status: 'アイデア', views: 0, likes: 0, popularity: 0 },
        { id: '4', title: 'Supabase入門チュートリアル', status: '撮影済み', views: 0, likes: 0, popularity: 0 },
        { id: '5', title: 'フリーランス1年目の収支公開', status: 'アイデア', views: 0, likes: 0, popularity: 0 },
    ]

    const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

    return (
        <div>
            <div className={styles.header}>
                <h1 className="text-page-title">Movies</h1>
                <div className={styles.actions}>
                    <button className="btn btn-outline">Filter</button>
                    <button className="btn btn-outline">Sort</button>
                    <button className="btn btn-primary">＋ New Video</button>
                </div>
            </div>

            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.thCheck}><input type="checkbox" /></th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th>Likes</th>
                            <th>Popularity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map((v) => (
                            <tr key={v.id}>
                                <td className={styles.tdCheck}><input type="checkbox" /></td>
                                <td className={styles.tdName}><span className="text-link">{v.title}</span></td>
                                <td>{v.status}</td>
                                <td className="text-mono text-secondary">{v.views.toLocaleString()}</td>
                                <td className="text-mono text-secondary">{v.likes.toLocaleString()}</td>
                                <td className="text-secondary">{v.popularity > 0 ? stars(v.popularity) : '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.pagination}>Page 1 of 1 | {videos.length} videos</div>
        </div>
    )
}
