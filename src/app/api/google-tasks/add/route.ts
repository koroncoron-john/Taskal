import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/google-tasks/add
 * クライアントから provider_token + タスク情報を受け取り、
 * Google Tasks API のデフォルトリストにタスクを追加する
 */
export async function POST(req: NextRequest) {
    try {
        const { providerToken, title, due } = await req.json()

        if (!providerToken) {
            return NextResponse.json(
                { error: 'provider_token がありません。Googleで再ログインしてください。' },
                { status: 401 }
            )
        }

        if (!title) {
            return NextResponse.json(
                { error: 'タスクタイトルが必要です。' },
                { status: 400 }
            )
        }

        // Google Tasks API のペイロードを組み立て
        // due は RFC3339（例: 2025-03-20T00:00:00.000Z）形式が必要
        const taskPayload: { title: string; due?: string } = { title }
        if (due) {
            // "YYYY-MM-DD" → "YYYY-MM-DDT00:00:00.000Z"
            taskPayload.due = new Date(due + 'T00:00:00.000Z').toISOString()
        }

        // Google Tasks API v1: @default = ユーザーのデフォルトタスクリスト
        const response = await fetch(
            'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${providerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskPayload),
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            const errorMessage = errorData?.error?.message || `Google APIエラー (${response.status})`

            // 401 = トークン期限切れ → 再ログイン案内
            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Googleのセッションが切れました。再ログインしてください。', needsRelogin: true },
                    { status: 401 }
                )
            }

            // 403 = スコープ不足
            if (response.status === 403) {
                return NextResponse.json(
                    { error: 'Google Tasksの権限がありません。Googleで再ログインしてください（tasksスコープが必要です）。', needsRelogin: true },
                    { status: 403 }
                )
            }

            return NextResponse.json({ error: errorMessage }, { status: response.status })
        }

        const createdTask = await response.json()
        return NextResponse.json({ success: true, task: createdTask })

    } catch (e: any) {
        console.error('[google-tasks/add] 予期しないエラー:', e)
        return NextResponse.json(
            { error: '予期しないエラーが発生しました。' },
            { status: 500 }
        )
    }
}
