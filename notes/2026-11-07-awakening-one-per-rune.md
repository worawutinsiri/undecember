# ปลุกพลังได้ประเภทเดียวต่อรูน

วันที่ 7 พ.ย. 2026 ผู้ใช้ถามว่าสายคริทำไม Unleash ไม่เลือก Source จึงพบว่าหน้าที่ทำไว้คิดการปลุกพลังผิด

## กฎ
- ไกด์ทางการ (guide.floor.line.games/UD/en_US/detail/1166916579138100391): "Only one Awakening Option can be imbued between Source/Origin/Verity" ถ้าปลุกคนละแบบจะแทนของเดิม ถ้าแบบเดิมจะสุ่มค่าใหม่
- ประกาศ 23 พ.ย. 2022 (ud.floor.line.games/us/bbsCmn/detail/1669106869357013226): "Each Rune can have only one type of Awakening option"
- ประกาศ 5 ม.ค. 2026 ไม่ได้พูดถึงการเปลี่ยนกฎนี้ ยังไม่ได้ยืนยันในเกม S12
- นับแยกต่อรูน จึงปลุก Unleash Source และ Shadow Archer Origin พร้อมกันได้

## Unleash Lightning Shot ควรปลุก Source เมื่อตีบอส
- Source, Origin, Verity มีไลน์ขยายดาเมจสายฟ้า 5–10% และโอกาส Shock +5–15% เหมือนกัน ต่างกันแค่ไลน์ที่ 3: Particle +5, ลูกธนูเจาะ +2, ลูกธนูกระโดด +2
- ถ้า Particle โดนไม่เกิน 3 ครั้ง ทั้งสามแบบเท่ากัน ถ้าโดนเกิน 3 ครั้ง Source แรงกว่า Source จึงไม่แพ้แบบอื่นเมื่อตีบอส Origin และ Verity เหมาะกับฟาร์ม
- ตัวจำลองไม่อ่าน Particle +5 ตัวเลขของ Source ในหน้าจึงเท่ากับแบบอื่น

## ตัวเลขที่จำลองใหม่ (ล้านต่อวินาที)
ตั้งค่าเหมือน `docs/unleash-shadow-archer-crit-build.html` ทำซ้ำชุดเดิมได้ตรง 13.78 และ Particle 7.05 นับลูกธนู 1 ลูก ไม่นับธนูเงา
| Particle โดนต่อลูก | 0 | 1 | 3 | 4 | 5 | 8 |
|---|---|---|---|---|---|---|
| Source | 12.8 | 19.3 | 32.3 | 38.9 | 45.4 | 65.0 |
| Source + Shadow Archer Origin | 14.4 | 21.8 | 36.6 | 44.0 | 51.4 | 73.5 |

- ตัวเลขเดิมของหน้า Unleash ที่นับ Source + Origin สูงเกิน ×1.08 ค่าที่ถูก (ลูกธนูอย่างเดียว ถึง Particle โดน 3 ครั้ง): ชุดฐาน 12.8–32.3, Foresight 27.1–68.6, ชุดเต็ม 38.8–98.3
- โอกาส Shock ค่ากลาง: 20% + ปลุก 10% + ถุงมือ 10.5% = ราว 41% ไม่ใช่ราว 51% ที่เคยเขียน
- ยังไม่รู้ว่า Particle ที่เพิ่มโดนบอสตัวเดียวกี่ครั้ง ให้ยิงหุ่น 1 ตัวแล้วนับตัวเลขที่ใหญ่ราวครึ่งหนึ่งของลูกธนู

## ที่ต้องแก้ (ยังไม่ได้แก้ รอผู้ใช้สั่ง)
- `docs/unleash-shadow-archer-crit-build.html`: ค่าตั้งต้น, ตารางปลุกพลังที่นับสะสม, "Shadow Archer ทั้ง Origin และ Verity", ลำดับอัปเกรด "Unleash Verity ×1.08"
- `docs/cla-lightning-chain-build.html`: แท็บ Unleash และจุดอื่นที่ค้นเจอ
- `docs/ogre-arrow-poison-build.html`, `docs/frost-storm-ice-crystal-build.html`: ค้นเจอคำที่อาจนับหลายระดับ ยังไม่ได้เช็กทีละบรรทัด
- `src/data/runeGuide.ts` บรรทัด 70, 81, 87, 130 ใส่ปลุกพลัง 2 ระดับในชุดเดียว
- `src/components/sim/Editor.tsx` บรรทัด 76 ให้ติ๊กหลายระดับได้ และ `simulate()` รวมทุกระดับที่ติ๊ก
- ตัวเลขใน `notes/2026-11-02-ogre-vs-cla-crit.md`, `notes/2026-11-05-lightning-bow-skills.md`, `notes/2026-11-06-unleash-shadow-archer.md` ที่นับหลายระดับ ยังเป็นค่าเดิม
