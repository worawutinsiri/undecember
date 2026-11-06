// Hand-written advice for the home page rune guide. Sources: notes/ in this repo and the linked board posts.
// runeGuide.test.ts checks that every rune named in a set exists and can really be linked to that skill.
import type { AwakeningTier } from './types'

export interface DamageType {
  title: string
  examples: string
  crit: string
  maximized: string
  /** Link rune names. */
  runes: string[]
  note: string
}

export const DAMAGE_TYPES: DamageType[] = [
  {
    title: 'ตีโดน (แท็ก Strike)',
    examples: 'Fire Ball, Cross Lightning Arrow',
    crit: 'ได้ผล',
    maximized: 'ได้ผล',
    runes: ['Find Weakness', 'Slaughter', 'Sharpness', 'Maximized DMG Increase', 'Increase Maximized DMG Chance'],
    note: 'เลือกคริหรือ Maximized ทางเดียว เพราะ Maximized DMG Increase ลดคริดาเมจ 100% และ Increase Maximized DMG Chance ลดโอกาสคริ 31.2%',
  },
  {
    title: 'DoT จากตัวสกิล (แท็ก DoT)',
    examples: 'Toxic Flame, Poison Area, Flamethrower',
    crit: 'ไม่ได้ผล',
    maximized: 'ไม่ได้ผล (โพสต์ผู้เล่นเรื่อง Toxic Flame)',
    runes: ['Spell DMG Increase', 'DoT', 'Mana Storm', 'DMG Acceleration', 'Center of Gravity'],
    note: 'รูนคริและ Maximized ส่วนใหญ่ต้องมีแท็ก Strike จึงลิงก์ไม่ได้ ไลน์แบบ "ทุกครั้งที่โดน" ก็ไม่ทำงานกับ Toxic Flame',
  },
  {
    title: 'สถานะผิดปกติ (Bleed, Burn, Venom)',
    examples: 'ติดจากสกิล Strike เช่น Burn Arrow',
    crit: 'ไม่ได้ผล',
    maximized: 'ได้ผล',
    runes: ['DoT', 'Mana Storm', 'DoT Enhancement', 'Endless Pain', 'Burning Flame', 'Flowing Pain'],
    note: 'ควรใช้สกิลที่ตีครั้งเดียวแรง ดาเมจ Strike, Melee, Area และ Projectile ไม่มีผล กระทู้นี้เก่ากว่า S12 ซึ่ง Bleed และ Burn ไม่ทะลุค่าต้านแล้ว',
  },
]

export const GUIDE_SOURCES = [
  { label: 'พื้นฐานบิลด์ DoT (4 มี.ค. 2026)', url: 'https://gall.dcinside.com/mgallery/board/view/?id=undecember&no=302766' },
  { label: 'Toxic Flame คริไม่ได้ (15 มี.ค. 2025)', url: 'https://gall.dcinside.com/mgallery/board/view/?id=undecember&no=296901' },
  { label: 'ไลน์ทุกครั้งที่โดนใช้ไม่ได้ (28 พ.ค. 2025)', url: 'https://gall.dcinside.com/mgallery/board/view/?id=undecember&no=298439' },
]

export interface GuideSet {
  label: string
  /** Link rune names. */
  links: string[]
  awakening: AwakeningTier[]
  note?: string
}

export interface SkillGuide {
  notes: string[]
  sets: GuideSet[]
}

const SPELL_TRIGGER = 'Spell Activation on Attack Hit'

export const SKILL_GUIDES: Record<string, SkillGuide> = {
  'Cross Lightning Arrow': {
    notes: ['ตีเป็นพื้นที่และเจาะทุกตัว ฟาร์มดีกว่า Unleash Lightning Shot', 'ปลุก Source ก่อน เพราะได้ผล Lightning Penetration'],
    sets: [
      {
        label: 'คู่ Lightning Chain',
        links: [SPELL_TRIGGER, 'Attack DMG Increase', 'Additional Lightning DMG', 'Quick Attack', 'Concentrated Area DMG', 'Element DMG Amplification'],
        awakening: ['source', 'origin'],
        note: '31.5 ล้าน นับลูกธนู ระเบิด 1 ครั้ง และ Lightning Chain 10.2 ล้าน สมมติบอสติด Shock ตลอด',
      },
    ],
  },
  'Unleash Lightning Shot': {
    notes: ['มีผลทดสอบในเกมว่าชุด Shadow Archer แรงกว่าชุด Spell Activation on Hit มาก ตัวจำลองไม่นับธนูเงา ตัวเลขจึงต่ำกว่าจริง', 'Shadow Archer ใช้ร่วมกับรูนทริกเกอร์ไม่ได้'],
    sets: [
      {
        label: 'ชุด Shadow Archer',
        links: ['Shadow Archer', 'Attack DMG Increase', 'Additional Lightning DMG', 'Quick Attack', 'Element DMG Amplification', 'Mana Storm'],
        awakening: ['source', 'origin'],
        note: '13.8–34.9 ล้าน ไม่นับธนูเงา ค่าต่ำคือลูกธนูอย่างเดียว ค่าสูงคือ Particle โดน 3 ครั้ง',
      },
      {
        label: 'คู่ Lightning Chain',
        links: [SPELL_TRIGGER, 'Attack DMG Increase', 'Additional Lightning DMG', 'Quick Attack', 'Element DMG Amplification', 'Mana Storm'],
        awakening: ['source', 'origin'],
        note: '21.4–38.6 ล้าน รวม Lightning Chain 10.2 ล้าน',
      },
    ],
  },
  'Lightning Arrow': {
    notes: ['ตีบอสแรงสุดในสามสกิลธนูสายฟ้าเมื่อโดนตั้งแต่ 3 ลูกขึ้นไป', 'ต้องปลุก Origin ลูกจึงโดนเป้าเดิมซ้ำได้ ยังไม่ได้ลองในเกมว่าโดนบอสจริงกี่ลูก'],
    sets: [
      {
        label: 'คู่ Lightning Chain',
        links: [SPELL_TRIGGER, 'Attack DMG Increase', 'Additional Lightning DMG', 'Quick Attack', 'Element DMG Amplification', 'Mana Storm'],
        awakening: ['origin'],
        note: '20.4–76.3 ล้าน ค่าต่ำคือโดน 1 ลูก ค่าสูงคือโดนครบ 7 ลูก รวม Lightning Chain 10.2 ล้าน',
      },
    ],
  },
  'Lightning Chain': {
    notes: ['ระยะร่าย 850 ที่เกรด Legendary ถ้ายิงไกลกว่านี้จะไม่โดนมอน', 'อย่าใส่ Conductor เพราะทำให้ทำ Shock ไม่ได้', 'ต้องมีคริแบบตัวเลข 80 จึงคริ 100%'],
    sets: [
      {
        label: 'ถูกร่ายจากสกิลธนู',
        links: [SPELL_TRIGGER, 'Spell DMG Increase', 'Additional Lightning DMG', 'Element DMG Amplification', 'Element Master', 'Electric Shock'],
        awakening: [],
        note: '10.2 ล้าน คิดจากจำนวนครั้งที่สกิลธนูยิงต่อวินาที และรวมอยู่ในตัวเลขของชุดธนูแล้ว',
      },
    ],
  },
  'Fire Ball': {
    notes: [
      "ต้องใช้ Transcendent Capri's Ember ลูกจึงโดนเป้าเดิมซ้ำได้ อาวุธอื่นโดนเป้าเดียวได้ลูกเดียว คทา Boundary Resonance ได้ราว 24 ล้าน",
      'ต้องให้ศัตรูติด Burn ดาเมจสูงกว่าตอนไม่ติด ×1.47 Burn เองทำดาเมจแค่ราว 1% ของ DPS',
      'ถ้าปลุก Verity ตัวจำลองไม่นับผล Quick Cast ที่ได้ฟรี ตัวเลขจึงเป็นค่าต่ำสุด',
    ],
    sets: [
      {
        label: 'ปลุก Source',
        links: ['Quick Cast', 'Spell DMG Increase', 'Concentrated Area DMG', 'Mana Storm', 'Additional Fire DMG', 'Element DMG Amplification'],
        awakening: ['source'],
        note: '23.4–103.1 ล้าน ค่าต่ำคือโดน 1 ลูก ค่าสูงคือโดนครบ 5 ลูก',
      },
      {
        label: 'ปลุก Source และ Verity',
        links: ['Element Master', 'Spell DMG Increase', 'Concentrated Area DMG', 'Mana Storm', 'Additional Fire DMG', 'Element DMG Amplification'],
        awakening: ['source', 'verity'],
        note: 'ไม่นับผล Quick Cast 22.1–97.2 ล้าน ถ้าได้ผลเต็มราว 34–151 ล้าน ต้องลองในเกม',
      },
    ],
  },
  'Axe Throw': {
    notes: ['รูปแบบการขว้างเปลี่ยนตามอาวุธ แบบสองมือมีลูกเดียว', 'ตัวเลขสูงเกินจริงเมื่อใช้ดาบ Resolution of Four Paths เพราะไลน์ดาเมจเพิ่ม 4 ธาตุไม่ถูกหักค่าต้าน'],
    sets: [
      {
        label: 'ดาบมือเดียว',
        links: ['Attack DMG Increase', 'Quick Attack', 'Concentrated Area DMG', 'Mana Storm', 'Element DMG Amplification', 'Additional Fire DMG'],
        awakening: [],
        note: '40.2–112.6 ล้าน ค่าต่ำคือโดน 1 ลูก ค่าสูงคือโดนครบ 3 ลูก',
      },
    ],
  },
  'Toxic Flame': {
    notes: [
      'คริกับ Maximized 2–3 เท่าไม่ทำงาน และไลน์แบบ "ทุกครั้งที่โดน" ใช้ไม่ได้ (โพสต์ผู้เล่นปี 2025)',
      'ไม้เท้า Transcendent Vanishing Night ให้ DoT +150–180%, เร่ง DoT +120% และสแตกสูงสุด +5',
      'ยังไม่แน่ใจว่าลูกไฟจากการร่ายครั้งเดียวซ้อนสแตกบนเป้าเดียวได้หรือไม่ และเร่ง DoT ทำให้ระยะเวลาสั้นลงหรือไม่',
      'โพสต์ผู้เล่นมองว่าสายนี้ทำได้สูงแต่ต้องลงทุนเต็มและไม่คุ้ม',
    ],
    sets: [
      {
        label: 'ตีบอส มี Vanishing Night',
        links: ['Spell DMG Increase', 'Center of Gravity', 'DoT', 'Mana Storm', 'Element DMG Amplification', 'Harmony'],
        awakening: [],
        note: 'เลือกจากการคำนวณมือ ตัวจำลองคิด DoT ไม่ได้ จึงไม่มีตัวเลข DPS',
      },
      {
        label: 'ตีบอส ไม่มีไม้เท้านี้',
        links: ['Spell DMG Increase', 'Center of Gravity', 'DoT', 'Mana Storm', 'DMG Acceleration', 'Harmony'],
        awakening: [],
        note: 'ถ้าเร่ง DoT ไม่เพิ่ม DPS ให้กลับไปใช้ Element DMG Amplification',
      },
      {
        label: 'ฟาร์ม',
        links: ['Spell DMG Increase', 'Confidence', 'DoT', 'Mana Storm', 'Element DMG Amplification', 'Harmony'],
        awakening: [],
        note: 'Center of Gravity หายเมื่อเดิน จึงสลับเป็น Confidence ซึ่งทำงานเมื่อ HP 80% ขึ้นไป',
      },
    ],
  },
  Flamethrower: {
    notes: [
      'ไม่แนะนำเป็นสกิลหลัก ไลน์ DoT ต่ำกว่า Toxic Flame ที่ซ้อนครบ 5 สแตกราว 4–12 เท่า ถ้าเลือกไฟให้ใช้ Fire Ball',
      'S12 ลดขยายดาเมจต่อขั้นจาก 20% เหลือ 15% และตัวคูณจาก 108% เหลือ 90%',
      'โพสต์ผู้เล่นเดือน ก.ย. 2026 บอกว่าอ่อนกว่าที่คิดและไอเทมหลักไม่ดี',
    ],
    sets: [],
  },
}

export const GUIDE_NUMBERS_NOTE = 'ตัวเลขคือ DPS จำลองที่รูน Lv45 Legendary, มอน Lv150 ต้าน 40%, คริแบบตัวเลข 80 แต่ละชุดใช้ไอเทมต่างกัน จึงเทียบข้ามกันตรง ๆ ไม่ได้'
