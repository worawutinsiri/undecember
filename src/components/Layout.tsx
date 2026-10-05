import { useEffect, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { DATA_META } from '../data'
import './Layout.css'

type Theme = 'dark' | 'light'

function readTheme(): Theme {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

const NAV = [
  { to: '/', label: 'หน้าแรก', end: true },
  { to: '/items', label: 'ไอเทม' },
  { to: '/runes', label: 'รูน' },
  { to: '/simulator', label: 'จำลองดาเมจ' },
]

export function Layout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* storage unavailable — theme just won't persist */
    }
  }, [theme])

  return (
    <div className="layout">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={26} height={26} />
          <span>
            Undecember <b>DB</b>
          </span>
        </NavLink>
        <nav className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="btn theme-toggle"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="สลับธีม"
          title="สลับธีม"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>
      <main className="content">{children}</main>
      <footer className="footer faint">
        แฟนเมด ไม่เกี่ยวข้องกับ LINE Games / Needs Games · ข้อมูลอ้างอิง {DATA_META.season} · อัปเดตข้อมูล{' '}
        {DATA_META.updated}
      </footer>
    </div>
  )
}
