import { Link } from 'react-router-dom'
import { DATA_META, LINK_RUNES, SKILL_RUNES, UNIQUES } from '../data'
import './HomePage.css'

const ALL_RUNES = [...SKILL_RUNES, ...LINK_RUNES]
const newRunes = ALL_RUNES.filter((r) => r.status === 'new').length
const majorRunes = ALL_RUNES.filter((r) => r.change === 'major').length
const minorRunes = ALL_RUNES.filter((r) => r.change === 'minor').length

export function HomePage() {
  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">{DATA_META.season}</p>
        <h1>ฐานข้อมูล Undecember ภาษาไทย</h1>
        <p className="dim">ดูไอเทมแยกหมวด ค้นรูนสกิลและรูนลิงก์ทุกเลเวล แล้วลากมาจัดชุดเพื่อดูว่าดาเมจออกมาเท่าไหร่</p>
      </section>

      <section className="home-cards">
        <Link to="/items" className="home-card">
          <span className="big mono">{UNIQUES.length}</span>
          <h2>ไอเทม Unique</h2>
          <p className="dim">แยกเป็นอาวุธ ชุดเกราะ เครื่องประดับ พร้อมค่าออปชันภาษาไทย</p>
        </Link>
        <Link to="/runes" className="home-card">
          <span className="big mono">{SKILL_RUNES.length + LINK_RUNES.length}</span>
          <h2>รูนสกิล & รูนลิงก์</h2>
          <p className="dim">
            รูนสกิล {SKILL_RUNES.length} · รูนลิงก์ {LINK_RUNES.length} — ปรับเลเวล 1–50 ดูเกรดและการปลุกพลัง
          </p>
        </Link>
        <Link to="/simulator" className="home-card accent">
          <span className="big">⬡</span>
          <h2>จำลองดาเมจ</h2>
          <p className="dim">ลากรูนสกิล รูนลิงก์ และไอเทมมาวาง ดูดาเมจต่อครั้ง คริติคอล และ DPS</p>
        </Link>
      </section>

      <section className="card home-notes">
        <h3>ซีซันนี้มีอะไรเปลี่ยน</h3>
        <p>
          รูนใหม่ <b>{newRunes}</b> ตัว · เปลี่ยนสำคัญ <b>{majorRunes}</b> ตัว · ปรับตัวเลขขึ้นเล็กน้อย (ราว 4%) อีก {minorRunes} ตัว —{' '}
          <Link to="/runes?changed=1">ดูรูนสกิลที่ใหม่/เปลี่ยนสำคัญ</Link> · <Link to="/runes?kind=link&changed=1">รูนลิงก์</Link>
        </p>
        <h3>ข้อควรรู้</h3>
        <ul className="dim">
          <li>เกมเปิดเผยค่าเฉพาะเลเวล 1 และ 45 — เลเวลอื่นเป็นค่าประมาณแบบเส้นตรง (มีป้าย “ประมาณ”)</li>
          <li>ตัวจำลองใช้สูตรตามคู่มือทางการ ร่วมกับโมเดลคริติคอล/ค่าต้านทานที่ชุมชนทดสอบ ผลลัพธ์จึงเป็นค่าประมาณ ใช้เปรียบเทียบบิลด์ได้ แต่อาจไม่ตรงกับตัวเลขในเกม 100%</li>
          <li>ข้อมูลไอเทมตอนนี้มีเฉพาะ Unique ที่เพิ่ม/ปรับใน S11–S12 จากชีททางการ</li>
        </ul>
        <h3>แหล่งข้อมูล</h3>
        <ul className="dim">
          {DATA_META.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
