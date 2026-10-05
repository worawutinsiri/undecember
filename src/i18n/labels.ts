import type { AwakeningTier, ItemCategory, RuneColor, RuneGrade } from '../data/types'

export const CATEGORY_TH: Record<ItemCategory, string> = {
  weapon1h: 'อาวุธมือเดียว',
  weapon2h: 'อาวุธสองมือ',
  offhand: 'อาวุธรอง / โล่',
  armor: 'ชุดเกราะ',
  accessory: 'เครื่องประดับ',
  other: 'อื่น ๆ',
}

export const CATEGORY_ORDER: ItemCategory[] = ['weapon1h', 'weapon2h', 'offhand', 'armor', 'accessory', 'other']

export const GEAR_TYPE_TH: Record<string, string> = {
  Sword: 'ดาบ',
  Axe: 'ขวาน',
  Dagger: 'มีดสั้น',
  Wand: 'ไม้กายสิทธิ์',
  Scepter: 'คทา',
  '2-handed Sword': 'ดาบสองมือ',
  '2-handed Axe': 'ขวานสองมือ',
  Staff: 'ไม้เท้า',
  Bow: 'ธนู',
  'Steel Bow': 'ธนูเหล็ก',
  Bowgun: 'โบว์กัน',
  Shield: 'โล่',
  Quiver: 'ซองธนู',
  Magazine: 'แม็กกาซีน',
  Helmet: 'หมวก',
  Armor: 'เสื้อเกราะ',
  Gloves: 'ถุงมือ',
  Shoes: 'รองเท้า',
  Spaulders: 'เกราะไหล่',
  Belt: 'เข็มขัด',
  Necklace: 'สร้อยคอ',
  Ring: 'แหวน',
}

export const gearTypeTh = (t: string) => GEAR_TYPE_TH[t] ?? t

export const COLOR_TH: Record<RuneColor, string> = {
  red: 'แดง (Strength)',
  green: 'เขียว (Dexterity)',
  blue: 'น้ำเงิน (Intelligence)',
}

export const GRADE_TH: Record<RuneGrade | 'relic', string> = {
  normal: 'Normal',
  magic: 'Magic',
  rare: 'Rare',
  legendary: 'Legendary',
  relic: 'Relic',
}

export const AWAKENING_TH: Record<AwakeningTier, string> = {
  source: 'ปลุกพลัง Source',
  origin: 'ปลุกพลัง Origin',
  verity: 'ปลุกพลัง Verity',
}

export const HOW_TO_GET_TH: Record<string, string> = {
  Drop: 'ดรอป',
  Shop: 'ร้านค้า',
  Synthesis: 'สังเคราะห์',
  Quest: 'เควส',
  Craft: 'คราฟต์',
}

/** Short Thai gloss shown next to tag names (tags themselves stay in English). */
export const TAG_TH: Record<string, string> = {
  Attack: 'โจมตี',
  Spell: 'เวท',
  Melee: 'ประชิด',
  Projectile: 'โพรเจกไทล์',
  'Area of Effect': 'พื้นที่',
  Strike: 'ตีโดน',
  Physical: 'กายภาพ',
  Fire: 'ไฟ',
  Cold: 'น้ำแข็ง',
  Lightning: 'สายฟ้า',
  Poison: 'พิษ',
  Duration: 'ระยะเวลา',
  Toggle: 'เปิด-ปิด',
  'Toggle Effect': 'เอฟเฟกต์เปิด-ปิด',
  'Toggle DMG': 'ดาเมจเปิด-ปิด',
  Movement: 'เคลื่อนที่',
  'Move Attack': 'เคลื่อนที่โจมตี',
  'Attack Enhance': 'เสริมโจมตี',
  'Defense Enhance': 'เสริมป้องกัน',
  Minion: 'มินเนียน',
  'Rune Knight': 'อัศวินรูน',
  Abyssling: 'อบิสลิง',
  Shadow: 'เงา',
  Channel: 'ร่ายต่อเนื่อง',
  'Weapon Range': 'ระยะอาวุธ',
  Bow: 'ธนู',
  Bowgun: 'โบว์กัน',
  Overheat: 'ความร้อน',
  Charge: 'ชาร์จ',
  Trap: 'กับดัก',
  Blow: 'ทุบ',
  Sentry: 'เซนทรี',
  DoT: 'ดาเมจต่อเนื่อง',
  Totem: 'โทเทม',
  Shout: 'ตะโกน',
  'Attack Seal': 'ผนึกโจมตี',
  'Defense Seal': 'ผนึกป้องกัน',
  'Rapid Seal': 'ผนึกเร็ว',
  'Extract Energy': 'ดูดพลังงาน',
  'Repeat Strike': 'ตีซ้ำ',
  'Repeat DoT': 'DoT ซ้ำ',
}

export const ELEMENT_TH: Record<string, string> = {
  Physical: 'กายภาพ',
  Fire: 'ไฟ',
  Cold: 'น้ำแข็ง',
  Lightning: 'สายฟ้า',
  Poison: 'พิษ',
  Chaos: 'เคออส',
}
