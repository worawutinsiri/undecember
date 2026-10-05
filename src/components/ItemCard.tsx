import type { UniqueItem } from '../data/types'
import { CATEGORY_TH, gearTypeTh } from '../i18n/labels'
import { thLine } from '../i18n/translate'
import { StatLines } from './StatLines'
import './ItemCard.css'

export function ItemCard({ item, showEnglish = false, compact = false }: { item: UniqueItem; showEnglish?: boolean; compact?: boolean }) {
  return (
    <article className={`item-card ${item.transcendent ? 'transcendent' : ''} ${compact ? 'compact' : ''}`}>
      <header>
        <h3>{item.name}</h3>
        <div className="item-meta">
          <span className="chip">
            {gearTypeTh(item.gearType)} · {CATEGORY_TH[item.category]}
          </span>
          {item.tier && <span className="chip mono">T{item.tier}</span>}
          {item.reqLevel && <span className="chip mono">Lv.{item.reqLevel}</span>}
          <span className={`chip season ${item.status}`}>
            {item.season} {item.status === 'new' ? 'ใหม่' : 'ปรับสมดุล'}
          </span>
        </div>
        {item.requirement && <p className="item-req faint">{thLine(item.requirement)}</p>}
      </header>
      {!compact && (
        <>
          <StatLines lines={item.implicit} showEnglish={showEnglish} className="implicit" />
          {item.innate.length > 0 && <StatLines lines={item.innate} showEnglish={showEnglish} className="innate" />}
          <StatLines lines={item.options} showEnglish={showEnglish} className="options" />
        </>
      )}
    </article>
  )
}
