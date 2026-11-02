# Lightning Rune Knight (มินเนียน) ข้อสรุปหลังทำหน้า HTML

วันที่ 25–28 ต.ค. 2026 · หน้า `docs/lightning-rune-knight-minion-build.html`

ข้อสรุปเหล่านี้มาหลังทำหน้าแล้ว **ยังไม่ได้ใส่ในหน้า HTML**

## รูนลิงก์ของ Rune Knight
- HP ของ Lightning Abyss Knight ในหน้าต่าง Stat Info › Skill ของผู้ใช้ = 63,744 (เกิน 30,000) จึงใช้ **Minion Presence** แทน Concentrated Area DMG ได้ทั้งตีบอสและฟาร์ม (×1.13 เทียบ Concentrated Area DMG) ได้ดาเมจมินเนียน +400% ขยายดาเมจ 20% และ HP +~25%
- ชุดหลักใหม่: Minion DMG, Spell DMG Increase, Noble Sacrifice, Electric Shock, Conductor, Minion Presence (ฟาร์มที่มอนติดช็อกน้อยกว่าราว 55–60% ใช้ Find Weakness + Slaughter แทน Electric Shock + Conductor)
- Element Master ดีกว่า Lightning Penetration ทุกกรณีที่คำนวณ แต่ยังด้อยกว่ารูนในชุดหลัก ยกเว้นบอสต้านธาตุสูงมาก
- ปลุก Minion Presence ระดับสัจธรรม (Verity) ถ้าเน้นอึด (ฟื้น HP 1–3%/วินาที หักล้าง Noble Sacrifice)

## ดันเจี้ยนดาเมจสะท้อน
- ไม่มีไลน์ลดดาเมจสะท้อนให้มินเนียนใน S12 (Offset Counterattack ลิงก์กับสกิล Minion ไม่ได้ ส่วนชุดเกราะ/โล่ที่กันสะท้อนช่วยแค่ตัวละคร)
- ชุดสะท้อน: ขั้น 1 Noble Sacrifice → Absorb Minion HP (ดาเมจ 0.73) ขั้น 2 Conductor → Minion Body Shield (ดาเมจ 0.46 ดาเมจสะท้อนที่รับ ~0.30)
- อย่ากด Gather Minions กับ Mark of Focus ใส่ Elite ที่สะท้อน

## ปลุกพลังที่ผู้ใช้ถาม
- Electric Sentry: สัจธรรม (Verity) ค่าช็อก +20–40 อัตราโจมตีโดน +32–40%
- Gather Minions: บ่อเกิด (Origin) ความเร็วมินเนียน +15–30% ถ้า Rune Knight ตายบ่อยใช้สัจธรรมแทน

## คริของมินเนียน
- ค่าคริในหน้าต่าง Skill คิดกับศัตรู Lv100 และไม่รวมไลน์ที่มีเงื่อนไข ค่าตีบอส Lv150 ≈ ค่าในหน้าต่าง × 5/7 (55% → ~39%)
- เทียบความคุ้ม: คริ +1% เท่ากับคริดาเมจ +(m−1)/c % (m = ตัวคูณคริดาเมจ, c = โอกาสคริ)

## วิธีคำนวณ
ตัวจำลองของเว็บไม่รองรับมินเนียน ใช้สคริปต์เทียบตัวคูณใน scratchpad: ดาเมจแบบบวก × การขยายดาเมจ × คริ × ค่าต้านธาตุ (ฐาน +655% ก่อนลิงก์, บอส Lv150 ต้าน 40%)
