'use client'

/**
 * DataProvider
 * - tasks / projects / clients をグローバルキャッシュとして管理
 * - Supabase Realtime (postgres_changes) でDB変更をリアルタイム受信
 * - 2回目以降のページ遷移では「読み込み中」を表示しない
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Project } from '@/types/database'

// Client型（database.tsにないためここで定義）
export interface Client {
    id: string
    name: string
    contact_name: string
    email: string
    phone: string
    memo: string
    created_at: string
}

// Contextの型定義
interface DataContextValue {
    // データ
    tasks: Task[]
    projects: Project[]
    clients: Client[]
    isLoading: boolean  // 初回fetchのみtrue

    // タスク操作
    addTask: (payload: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
    updateTask: (id: string, payload: Partial<Task>) => Promise<void>
    deleteTask: (id: string) => Promise<void>
    refreshTasks: () => Promise<void>

    // プロジェクト操作
    addProject: (payload: Partial<Project>) => Promise<Project | null>
    updateProject: (id: string, payload: Partial<Project>) => Promise<void>
    deleteProject: (id: string) => Promise<void>
    refreshProjects: () => Promise<void>

    // クライアント操作
    addClient: (payload: Partial<Client>) => Promise<void>
    updateClient: (id: string, payload: Partial<Client>) => Promise<void>
    deleteClient: (id: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function useData() {
    const ctx = useContext(DataContext)
    if (!ctx) throw new Error('useData は DataProvider の内側で使ってください')
    return ctx
}

export function DataProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient()
    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)
    // 初回fetchが完了したかのフラグ（Realtimeの二重処理を防ぐ）
    const initializedRef = useRef(false)

    // 初回fetch
    const fetchAll = useCallback(async () => {
        setIsLoading(true)
        const [tasksRes, projectsRes, clientsRes] = await Promise.all([
            supabase.from('tasks').select('*').order('created_at', { ascending: false }),
            supabase.from('projects').select('*').order('created_at', { ascending: false }),
            supabase.from('clients').select('*').order('created_at', { ascending: false }),
        ])
        setTasks(tasksRes.data || [])
        setProjects(projectsRes.data || [])
        setClients(clientsRes.data || [])
        setIsLoading(false)
        initializedRef.current = true
    }, [])

    // Realtime サブスクリプションのセット
    useEffect(() => {
        fetchAll()

        // Googleログイン時にprovider_tokenをuser_metadataに保存
        // （provider_tokenはページリロード後に消えるため永続化が必要）
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.provider_token) {
                await supabase.auth.updateUser({
                    data: { google_provider_token: session.provider_token }
                })
            }
        })

        const channel = supabase
            .channel('taskal-db-changes')
            // --- tasks ---
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'tasks' },
                (payload) => {
                    const newRow = payload.new as Task
                    setTasks(prev => [newRow, ...prev])
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'tasks' },
                (payload) => {
                    const updated = payload.new as Task
                    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'tasks' },
                (payload) => {
                    const deleted = payload.old as { id: string }
                    setTasks(prev => prev.filter(t => t.id !== deleted.id))
                }
            )
            // --- projects ---
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'projects' },
                (payload) => {
                    const newRow = payload.new as Project
                    setProjects(prev => [newRow, ...prev])
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'projects' },
                (payload) => {
                    const updated = payload.new as Project
                    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p))
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'projects' },
                (payload) => {
                    const deleted = payload.old as { id: string }
                    setProjects(prev => prev.filter(p => p.id !== deleted.id))
                }
            )
            // --- clients ---
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'clients' },
                (payload) => {
                    const newRow = payload.new as Client
                    setClients(prev => [newRow, ...prev])
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'clients' },
                (payload) => {
                    const updated = payload.new as Client
                    setClients(prev => prev.map(c => c.id === updated.id ? updated : c))
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'clients' },
                (payload) => {
                    const deleted = payload.old as { id: string }
                    setClients(prev => prev.filter(c => c.id !== deleted.id))
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
            supabase.removeChannel(channel)
        }
    }, [fetchAll])

    // --- refresh helpers ---
    const refreshTasks = async () => {
        const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
        setTasks(data || [])
    }
    const refreshProjects = async () => {
        const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
        setProjects(data || [])
    }
    const refreshClients = async () => {
        const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
        setClients(data || [])
    }

    // --- タスク操作 ---
    const addTask = async (payload: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
        await supabase.from('tasks').insert(payload)
        await refreshTasks()  // Realtimeに依存せず確実に最新化
    }

    const updateTask = async (id: string, payload: Partial<Task>) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...payload } : t))  // 楽観的UI
        await supabase.from('tasks').update(payload).eq('id', id)
        await refreshTasks()
    }

    const deleteTask = async (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id))  // 楽観的UI
        await supabase.from('tasks').delete().eq('id', id)
        await refreshTasks()
    }

    // --- プロジェクト操作 ---
    const addProject = async (payload: Partial<Project>): Promise<Project | null> => {
        const { data } = await supabase.from('projects').insert(payload).select().single()
        await refreshProjects()
        return data
    }

    const updateProject = async (id: string, payload: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === id ? { ...p, ...payload } : p))  // 楽観的UI
        await supabase.from('projects').update(payload).eq('id', id)
        await refreshProjects()
    }

    const deleteProject = async (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id))  // 楽観的UI
        await supabase.from('projects').delete().eq('id', id)
        await refreshProjects()
    }

    // --- クライアント操作 ---
    const addClient = async (payload: Partial<Client>) => {
        await supabase.from('clients').insert(payload)
        await refreshClients()  // Realtimeに依存せず確実に最新化
    }

    const updateClient = async (id: string, payload: Partial<Client>) => {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c))  // 楽観的UI
        await supabase.from('clients').update(payload).eq('id', id)
        await refreshClients()
    }

    const deleteClient = async (id: string) => {
        setClients(prev => prev.filter(c => c.id !== id))  // 楽観的UI
        await supabase.from('clients').delete().eq('id', id)
        await refreshClients()
    }

    return (
        <DataContext.Provider value={{
            tasks, projects, clients, isLoading,
            addTask, updateTask, deleteTask, refreshTasks,
            addProject, updateProject, deleteProject, refreshProjects,
            addClient, updateClient, deleteClient,
        }}>
            {children}
        </DataContext.Provider>
    )
}
