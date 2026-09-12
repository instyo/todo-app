import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'todo-app.tasks'

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function App() {
  const [tasks, setTasks] = useState(loadTasks)
  const [draft, setDraft] = useState('')
  const [filter, setFilter] = useState('all') // all | active | done

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setTasks((prev) => [
      { id: createId(), text, done: false },
      ...prev,
    ])
    setDraft('')
  }

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const clearDone = () => {
    setTasks((prev) => prev.filter((t) => !t.done))
  }

  const visibleTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((t) => !t.done)
    if (filter === 'done') return tasks.filter((t) => t.done)
    return tasks
  }, [tasks, filter])

  const remaining = tasks.filter((t) => !t.done).length

  return (
    <div className="page">
      <header className="header">
        <h1>Todo</h1>
        <p>{remaining} tugas tersisa</p>
      </header>

      <form className="composer" onSubmit={addTask}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tambah tugas baru..."
        />
        <button type="submit" disabled={!draft.trim()} aria-label="Tambah">
          +
        </button>
      </form>

      <div className="filters">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'active', label: 'Aktif' },
          { key: 'done', label: 'Selesai' },
        ].map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? 'active' : ''}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="list">
        {visibleTasks.length === 0 && (
          <p className="empty">
            {filter === 'done'
              ? 'Belum ada tugas selesai'
              : filter === 'active'
              ? 'Semua tugas sudah selesai'
              : 'Belum ada tugas, tambahkan satu di atas'}
          </p>
        )}

        {visibleTasks.map((task) => (
          <div className={`item ${task.done ? 'done' : ''}`} key={task.id}>
            <button
              className={`checkbox ${task.done ? 'checked' : ''}`}
              onClick={() => toggleTask(task.id)}
              aria-label={task.done ? 'Tandai belum selesai' : 'Tandai selesai'}
            >
              {task.done ? '✓' : ''}
            </button>
            <span className="label">{task.text}</span>
            <button
              className="delete"
              onClick={() => deleteTask(task.id)}
              aria-label="Hapus"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {tasks.some((t) => t.done) && (
        <div className="footer">
          <span>{tasks.length} total tugas</span>
          <button onClick={clearDone}>Hapus yang selesai</button>
        </div>
      )}
    </div>
  )
}

export default App
