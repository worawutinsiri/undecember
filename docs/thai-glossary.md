# อภิธานศัพท์แปลไทย (Thai glossary)

ใช้คำเหล่านี้ให้ตรงกันทุกที่ ทั้งตอนแปลบรรทัดค่าสถานะ คำอธิบายรูน และ UI

## หลักการ
- **ชื่อเฉพาะไม่แปล** ให้คงภาษาอังกฤษไว้: ชื่อรูน ชื่อสกิล ชื่อไอเทม ชื่อบัฟ/เอฟเฟกต์เฉพาะ ชื่อตัวละคร/เทพ
  (เช่น Fire Ball, Shadow of Sephdar, Sacred Light, Quick Cast Link Rune, Charged Shot)
- **ชื่อแท็กสกิลไม่แปล** เมื่ออ้างเป็นแท็ก (เช่น "สกิลที่มีแท็ก Attack, Spell")
- ตัวแทนตัวเลข `{0}`, `{1}` ต้องอยู่ครบทุกตัว สลับลำดับได้ถ้าภาษาไทยต้องการ
- คงเครื่องหมาย `+`/`-` และ `%` ไว้ติดกับตัวเลขเหมือนต้นฉบับ (เช่น `+{0}%`)
- ข้อความอื่นที่อยู่ในปีกกา เช่น `{BuffDurationTime}` ให้คงไว้ตามเดิม
- กระชับ อ่านง่ายแบบเกม ไม่ต้องสุภาพเป็นทางการ

## กลไกคำนวณ (สำคัญที่สุด ต้องแยกให้ชัด)
| English | ไทย | ความหมาย |
|---|---|---|
| `+X% DMG` | `ดาเมจ +X%` | บวกสะสม (additive) |
| `X% DMG Amplification` | `ขยายดาเมจ X%` | คูณแยก (multiplicative) |
| `X% … Dampening` | `ลด… X%` หรือ `ลดทอน… X%` | คูณลด (1 − X) |
| `… Increase X%` | `เพิ่ม… X%` | |
| `… Multiplier` | `ตัวคูณ…` | |
| `Maximized DMG` | `ดาเมจสูงสุด (Maximized)` | |
| `DMG Taken` | `ดาเมจที่ได้รับ` | |

## คำศัพท์
| English | ไทย |
|---|---|
| DMG | ดาเมจ |
| Attack DMG | ดาเมจโจมตี |
| Spell DMG | ดาเมจเวท |
| Attack and Spell DMG | ดาเมจโจมตีและเวท |
| Main Element DMG | ดาเมจธาตุหลัก |
| Physical / Fire / Cold / Lightning / Poison / Chaos | กายภาพ / ไฟ / น้ำแข็ง / สายฟ้า / พิษ / เคออส |
| Element / Elemental | ธาตุ |
| Melee / Projectile / Area of Effect | ระยะประชิด / โพรเจกไทล์ / พื้นที่ (AoE) |
| Critical Rate | ค่าคริติคอล |
| Critical DMG | ดาเมจคริติคอล |
| Gear Critical Rate | ค่าคริติคอลของอุปกรณ์ |
| Attack Speed / Cast Speed / Speed | ความเร็วโจมตี / ความเร็วร่าย / ความเร็ว |
| Movement Speed | ความเร็วเคลื่อนที่ |
| Cooldown / Cooldown Recovery Speed | คูลดาวน์ / ความเร็วฟื้นคูลดาวน์ |
| Mana / Mana Cost / Resource Cost | มานา / มานาที่ใช้ / ทรัพยากรที่ใช้ |
| HP / Barrier / Armor / Dodge Rate | HP / บาเรีย / เกราะ / อัตราหลบ |
| Gear Armor / Gear Barrier / Gear Dodge Rate | เกราะของอุปกรณ์ / บาเรียของอุปกรณ์ / อัตราหลบของอุปกรณ์ |
| Element Resist / Chaos Resist | ต้านทานธาตุ / ต้านทานเคออส |
| Penetration | เจาะ (เช่น เจาะเกราะ, เจาะธาตุ) |
| Hit Rate | อัตราโจมตีโดน |
| Block Chance | โอกาสบล็อก |
| Status Effect | สถานะผิดปกติ |
| DoT (Damage over Time) | ดาเมจต่อเนื่อง (DoT) |
| Bleed / Burn / Poison (status) / Chill / Freeze / Shock / Stun / Blind | เลือดไหล / ไหม้ / ติดพิษ / หนาวสั่น / แช่แข็ง / ช็อต / มึนงง / ตาบอด |
| Rate (e.g. Bleed Rate, Chill Rate) | ค่า… (เช่น ค่าเลือดไหล) |
| Chance | โอกาส |
| Duration | ระยะเวลา |
| Stack(s) / Max Stacks | สแตก / สแตกสูงสุด |
| Range / Radius | ระยะ / รัศมี |
| Projectile Count | จำนวนโพรเจกไทล์ |
| Minion / Summon | มินเนียน / อัญเชิญ |
| Sentry / Totem / Trap | เซนทรี / โทเทม / กับดัก |
| Channeling | ร่ายต่อเนื่อง (Channeling) |
| Overheat / Max Overheat | ความร้อน (Overheat) / ความร้อนสูงสุด |
| Toggle | สกิลเปิด-ปิด (Toggle) |
| Shout | ตะโกน (Shout) |
| Skill Rune / Link Rune | รูนสกิล / รูนลิงก์ |
| Rune Level | เลเวลรูน |
| Awakening (Source / Origin / Verity) | ปลุกพลัง (Source / Origin / Verity) |
| Magic / Rare / Legendary / Relic grade | เกรด Magic / Rare / Legendary / Relic |
| Triggers Immediately | ทำงานทันที |
| Trigger Chance / Trigger Cooldown | โอกาสทริกเกอร์ / คูลดาวน์ทริกเกอร์ |
| on hit / when hit | เมื่อโจมตีโดน / เมื่อถูกโจมตี |
| against X enemies | ต่อศัตรูที่… |
| per | ต่อ |
| Requires Strength / Dexterity / Intelligence | ต้องการ Strength / Dexterity / Intelligence (คงชื่อค่าสถานะเป็นอังกฤษ) |
| Cannot … | ไม่สามารถ… |
| s (seconds) | วินาที |
