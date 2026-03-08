'use client'

import { useRef } from 'react'
import styles from './DateInput.module.css'

interface DateInputProps {
    value: string
    onChange: (value: string) => void
    type?: 'date' | 'month'
    placeholder?: string
}

/**
 * カレンダーアイコン非表示 + クリックでカレンダー表示のカスタム日付入力
 * アプリ全体の統一コンポーネント
 */
export default function DateInput({ value, onChange, type = 'date', placeholder }: DateInputProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
        // showPicker() でネイティブのカレンダーピッカーを開く
        try {
            inputRef.current?.showPicker()
        } catch {
            inputRef.current?.focus()
        }
    }

    const displayValue = value
        ? type === 'month'
            ? value
            : new Date(value + 'T00:00:00').toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : ''

    return (
        <div className={styles.wrapper} onClick={handleClick}>
            <span className={`${styles.display} ${!value ? styles.placeholder : ''}`}>
                {displayValue || placeholder || '日付を選択'}
            </span>
            <input
                ref={inputRef}
                type={type}
                className={styles.hiddenInput}
                value={value}
                onChange={e => onChange(e.target.value)}
                tabIndex={-1}
            />
        </div>
    )
}
