# Ogre Arrow vs Cross Lightning Arrow สายคริ (S12 endgame)

วันที่ 2 พ.ย. 2026

## คำถาม
เทียบสองชุดนี้ว่าชุดไหนเล่นสายคริแล้วไปเอนด์เกมได้ไกลกว่า
1. Ogre Arrow + (Spell Activation on Hit หรือ on Spell) + (Toxic Flame หรือ Plague Spike)
2. Cross Lightning Arrow + (Spell Activation on Hit หรือ on Spell) + (Lightning Chain หรือ Lightning Wave)

## ข้อสรุป
**เลือกชุด 2: Cross Lightning Arrow + Spell Activation on Hit + Lightning Chain**

### รูนลิงก์: ใช้ Spell Activation on Hit ทั้งสองชุด
- Spell Activation on Spell Hit ต้องใช้สกิลที่เป็นทั้ง Spell และ Strike เป็นตัวเปิด Ogre Arrow กับ CLA เป็น Attack จึงเปิดไม่ได้
- On Spell Hit ไม่มีไลน์โอนอัตราคริ/คริดาเมจของ Attack ไปให้ Spell แต่ On Hit มี
- On Spell Hit ไม่มีในชีทรูนลิงก์ S12 มีแค่ใน `RuneList.json` ของ buildDecember
- ข้อจำกัดของ On Hit: ยิง 1 ครั้งเปิดสกิลได้ 1 ครั้ง สกิลที่ถูกเปิดโดนลดดาเมจ 33.8% ที่ Lv45 และอีก 5% จากไลน์เกรด Legendary (เหลือ ×0.63)

### ชุด 1: ถ้าเล่น Ogre Arrow ให้ใช้ Plague Spike
- Toxic Flame เป็น DoT ล้วน ไม่มีแท็ก Strike DoT ไม่ติดคริ ไม่ได้ผลจาก Projectile DMG และยูนีคที่ทำให้แรง (Vanishing Night) เป็นไม้เท้า ใส่กับธนูไม่ได้
- Plague Spike เป็น Strike คริได้ มีโอกาส 25% ทำ Plague 4 วินาที ลดค่าต้านธาตุ 10% และศัตรูรับดาเมจพิษเพิ่ม 10% ช่วยให้ Ogre Arrow แรงขึ้น

### ชุด 2: ถ้าเล่น CLA ให้ใช้ Lightning Chain
- Lightning Chain Lv45 ดาเมจ 916% +667 เกรด Legendary กระโดด 11 ตัว โอกาส Shock 40% คริดาเมจ Spell +50% และขยายดาเมจ 30% ใส่ศัตรูที่ติด Shock
- CLA ทำ Shock เองไม่ได้ แต่เกรด Legendary ได้ดาเมจ +150% ใส่ศัตรูติด Shock และปลุกระดับ Verity ได้คริดาเมจ +40% ใส่ศัตรูติดสถานะสายฟ้า Lightning Chain จึงเป็นตัวทำ Shock ให้ CLA
- Lightning Wave: 487% +1406 แรงขึ้น 25% ต่อ Lightning Energy 1 สแตก ยิงแล้วสแตกหมด ได้สแตก 20% ต่อครั้งที่โดน แหวน Transcendent Leo's Flow ทำให้สแตกไม่หายแต่ Lightning Wave ดาเมจลด 25% ข้อเสียคือไม่ทำ Shock และคลื่นออกจากตัวเราไปข้างหน้า 900 หน่วย ใช้เป็นตัวสลับตีบอสได้ถ้าทดสอบแล้วสแตกค้างจริง

### เหตุผลที่ชุด 2 ไปได้ไกลกว่า
- CLA มีโอกาสคริ +15% ในตัว และปลุกระดับ Origin ได้ผล Find Weakness ประหยัดรูนลิงก์ 1 ช่อง Ogre Arrow ต้องใส่ Find Weakness เอง
- เกรด Legendary ของ CLA ให้อัตราคริ Attack +120% คริดาเมจ +100% และเมื่อคริมีโอกาส 60–70% ปล่อยสายฟ้าเพิ่ม
- มอนเลเวลสูงต้องใช้คริเวทมากขึ้น (Lv150 ≈ 700, Lv170 ≈ 780) CLA ถึงเป้าง่ายกว่า
- ฟาร์มได้ในตัว: CLA เจาะทุกตัวและระเบิดกากบาท Lightning Chain กระโดด 11 ตัว ส่วน Ogre Arrow ต้องเพิ่ม Poison Rain of Arrows
- ตัวเลขตีบอสของ CLA มาจากตัวจำลอง (17.7 ล้านต่อลูก โดนครบ 3 ลูกราว 53 ล้าน) ส่วนของ Ogre Arrow (ราว 50 ล้าน ถึง 150 ล้านเมื่อใช้ธนู Star Usurper's) คำนวณเองโดยสมมติว่าลูกวนกลับมาโดนบอสทุกครั้ง ยังไม่ได้ลองในเกม กรณีแย่สุดราว 1.1 ล้าน
- ตัวเลขทั้งสองยังไม่รวมดาเมจของสกิลที่ถูกเปิด

### เมื่อไหร่ควรเลือกชุด 1
เมื่อมีธนู Star Usurper's Bow แล้ว และยิงหุ่นบอสแล้วเห็นว่าลูก Ogre Arrow วนกลับมาโดนซ้ำจริง ชุดนี้ตีบอสได้สูงกว่า แต่ฟาร์มอ่อนและไม่ได้ใช้คริเต็มที่เท่าชุด 2

## หน้า HTML ชุด CLA + Lightning Chain (ทำแล้ว 2 พ.ย. 2026)
ผู้ใช้ขอใช้ **Spell Activation on Attack Hit** (ไม่ใช่ On Hit) หน้าอยู่ที่ `docs/cla-lightning-chain-build.html` มี 4 แท็บ: Skill + Rune link, Item, Charm, Lacrima

ผลจากตัวจำลอง (`src/lib/damage.ts`, ค่าสุ่มออปชัน 50%, คริแบบตัวเลข +80, มอน Lv150 ต้าน 40%, สมมติบอสติด Shock ตลอด):
- **On Attack Hit (แก้ 2 พ.ย. 2026 จากภาพหน้ารูนบนเว็บฐานข้อมูลเกมที่ผู้ใช้ส่งมา):** ไม่อยู่ในชีท S12 แต่ยังหาได้ (ดรอป, ร้านค้า Act 2, 6–10, 11–12, เกรด Normal ขึ้นไป) สีแดง (Str) แท็ก Attack, Strike
  - Lv1: ลดดาเมจสกิลที่ถูกร่าย 55%, Lv45: 26.9% และมีไลน์ "10% DMG Dampening for Activated Skill" ท้ายรายการโดยไม่มีป้ายเกรด
  - ลดมานาสกิลที่ถูกร่าย 48%, ค่ามานาสกิลตัวร่าย +15%
  - เกรด: Magic ลดดาเมจ 8% / Rare ลดมานา 10%, ลดดาเมจ 8% / Legendary ลดมานา 20%, Skill Rune Cooldown Recovery Speed +20%, ลดดาเมจ 5%
  - ตีความว่า 10% เป็นค่าของเกรด Normal ที่เกรดสูงกว่าแทนที่ (ไลน์ลดดาเมจลดลงตามเกรด 10 → 8 → 8 → 5 และ On Hit ซึ่งเริ่มเกรด Rare ไม่มีไลน์ 10%) Legendary จึงเหลือ ×0.731 × 0.95 = ×0.694 ถ้านับซ้อนจะเหลือ ×0.625
  - ค่าเดิม 10% ผิด เพราะ buildDecember เก็บไลน์ชื่อซ้ำได้ค่าเดียว
- DPS รวม: On Attack Hit 22.2 ล้าน (ถ้านับ 10% ซ้อน 21.2), On Hit 21.3 ล้าน (×0.629) ดาเมจต่างกันแค่ราว 4% ข้อดีของ On Attack Hit คือหาง่ายและใช้มานาน้อยกว่า
- วิธีจำลอง: CLA จำลองตามปกติ ส่วน Lightning Chain จำลองแยก ใส่ `custom.ampDmg` ติดลบแทนค่าลดดาเมจของรูนร่ายสกิล (×0.694 → −30.56) ใส่ไอเทมปลอมที่มี "+100% Spell DMG" และ "+55% Spell Critical Rate" แทนค่าที่โอนจาก Attack แล้วคูณด้วยจำนวนครั้งที่ CLA ยิงต่อวินาที
- CLA 5 ลิงก์: Attack DMG Increase, Additional Lightning DMG, Quick Attack, Concentrated Area DMG, Element DMG Amplification (ตัด Mana Storm เสียน้อยสุด)
- Lightning Chain 5 ลิงก์: Spell DMG Increase, Additional Lightning DMG, Element DMG Amplification, Element Master, Electric Shock ไม่ต้องใส่ Find Weakness เพราะคริ 100% แล้ว (เมื่อคริแบบตัวเลข 80) ห้าม Conductor (ทำ Shock ไม่ได้)
- ถุงมือเปลี่ยนเป็น Transcendent Miraseti's Miracle (Dex 270) ดีกว่า Spica's Light ราว 8% และไม่ต้องลง Int
- ตัวเลข: CLA 12.0 + Lightning Chain 10.2 = 22.2 ล้านต่อวินาที (ราว 2 เท่า) เทียบ CLA ชุดเดิม 6 ลิงก์ 10.8 ล้าน (ตั้งค่าเดียวกัน) บอสไม่ติด Shock ลดราว 25%
- ทางเลือก: ซองธนู Master of Trajectory 23.0, ถุงมือ Spica's Light 20.4, แหวน Approaching Omen 15.9 (ไม่นับสแตก), ชุดฟาร์ม Area Effect 19.5, CLA ไม่ปลุก Source 20.9 ล้าน
- คริ: Lightning Chain ต้องมีคริแบบตัวเลข 80 ถึงจะคริ 100% (40 → 84%) เพราะไม่ได้ค่าคริเฉพาะของรูน CLA
- Shadow Archer ใช้ไม่ได้ (ลิงก์กับรูนร่ายสกิลไม่ได้)
- ลาคริมา: Silver Shadow (สวม Stra's บนตัว), Casthor's Vision 27.1 ล้าน, Token of Trust 34.9 ล้าน (ประมาณ)
- มานา: CLA ราว 38 ต่อการยิง (รวม +15%) + Lightning Chain ราว 22 = ราว 300 ต่อวินาที

## ยังไม่ได้ทำ
- ข้อมูล Charm ของ S12 ยังไม่มี (ชื่อ/ผลของ Blessing ทั้ง 12) แท็บ Charm จึงเป็นหลักการ ถ้าผู้ใช้ส่งรายการ Charm มา ให้ปรับแท็บนั้น
- ยังไม่ได้เช็กในเกมว่าไลน์ลดดาเมจ 10% ของ On Attack Hit ซ้อนกับไลน์เกรด Legendary 5% หรือไม่ (ดูจากดาเมจ Lightning Chain ในหน้าต่างสกิลตอนลิงก์รูน)

## หน้าที่เกี่ยวข้อง
- `docs/cla-lightning-chain-build.html`: ชุด CLA + Spell Activation on Attack Hit + Lightning Chain
- `docs/bow-crit-builds.html`: CLA รูนลิงก์ ไอเทม และตัวเลขจำลอง
- `docs/ogre-arrow-poison-build.html`: Ogre Arrow และการคำนวณการเจาะ
