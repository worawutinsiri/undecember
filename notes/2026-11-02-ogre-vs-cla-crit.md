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
- Toxic Flame สาย Maximized DMG หรือสายคริ (6 พ.ย. 2026): ไม่แนะนำทั้งคู่ แท็กคือ Spell, DoT, Poison, Projectile ไม่มี Strike รูนหลักทั้งสองสาย (Find Weakness, Slaughter, Sharpness, Maximized DMG Increase, Increase Maximized DMG Chance, Persistence, Smash, Extract Poison Energy) จึงลิงก์ไม่ได้ ควรไปทาง DoT ชุดรูนและหลักฐานดู `notes/2026-11-06-dot-runes.md` ชีทไม่มีข้อความตรงว่า DoT คริไม่ได้ แต่โพสต์ผู้เล่นปี 2025 บอกว่าคริกับ Maximized 2–3 เท่าไม่ทำงานกับ Toxic Flame ตัวจำลองไม่มีทั้ง DoT และ Maximized ตัวเลขจึงคำนวณเอง
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
ผู้ใช้ขอใช้ **Spell Activation on Attack Hit** (ไม่ใช่ On Hit) หน้าอยู่ที่ `docs/cla-lightning-chain-build.html` ตอนนี้มี 6 แท็บ: CLA, Unleash และ Lightning Arrow แบบ Skill + Rune link แล้วตามด้วย Item, Charm, Lacrima (3 แท็บหลังใช้ร่วมกัน) Lightning Arrow ดู `notes/2026-11-05-lightning-bow-skills.md`

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
- ตัวเลข: CLA 12.0 + Lightning Chain 10.2 = 22.2 ล้านต่อวินาที บอสไม่ติด Shock ลดราว 25%
- เทียบ CLA 6 ลิงก์ (ใส่ Mana Storm แทนรูนร่ายสกิล) ไอเทมและปลุกพลังเดียวกัน: 13.2 ล้าน (ไม่ติด Shock) ถึง 14.9 ล้าน (ติดตลอด) ชุดนี้จึงแรงกว่าราว 1.5–1.7 เท่า เลข 10.8 ล้านที่เคยเขียนว่า "ราว 2 เท่า" ผิด เพราะใช้ถุงมือ Spica's และยังไม่ปลุก Source
- **ระยะ (ผู้ใช้บอกว่ายิงไกลเกินแล้ว Lightning Chain ไม่โดน แก้ 5 พ.ย. 2026):** Cast Distance 650 เกรด Magic/Rare/Legendary +100/+150/+200 รวม 850 ที่ Legendary เลเวลรูนไม่เพิ่ม ไม่มีรูนลิงก์หรือยูนีคใน S12 ที่เพิ่ม Cast Distance ส่วน Chain และการปลุก Origin/Verity เพิ่มแค่ Chain Range
- DPS รวมตามระยะ:
  - ชุดในหน้า: ใกล้กว่า 850 ได้ 22.2 ล้าน, ไกลกว่า 850 เหลือ CLA 10.6–12.0 ล้าน (แย่กว่า CLA 6 ลิงก์ เพราะเสีย Mana Storm ไปแล้ว)
  - Precise Shot แทน Element DMG Amplification ฝั่ง CLA: ใกล้กว่า 600 ได้ 20.1, ช่วง 600–850 ได้ 25.5 (นับ 6 สแตกเอง ถ้าไม่นับ 22.05), ไกลกว่า 850 ได้ 13.8–15.3 ล้าน
  - Close Range Shot แทนตัวเดียวกัน: ระยะ 600 ได้ 21.5, ระยะ 400 ได้ 23.1, ระยะ 200 ได้ 24.6 ล้าน (ผลบัฟคำนวณเอง)
- ทางเลือก: ซองธนู Master of Trajectory 23.0, ถุงมือ Spica's Light 20.4, แหวน Approaching Omen 15.9 (ไม่นับสแตก), ชุดฟาร์ม Area Effect 19.5, CLA ไม่ปลุก Source 20.9 ล้าน
- กระดาน: ผู้ใช้บอกว่าลูกศรของ Spell Activation หักมุมได้ (`---\`) จึงวาง Lightning Chain เยื้องลงขวาของรูนร่ายสกิล (ห่างจาก CLA 2 ช่องแบบไม่เป็นเส้นตรง) ทั้งสองสกิลติดกัน 2 ช่อง: รูนร่ายสกิลกับรูนลิงก์ที่ใช้ร่วม 1 ตัว (ใส่ Additional Lightning DMG หรือ Element DMG Amplification) รวมแล้วใช้รูนลิงก์ 10 ตัวแทน 11 ตัว DPS เท่าเดิม เพราะแต่ละสกิลยังมีลิงก์ 6 ด้าน
- คริ: Lightning Chain ต้องมีคริแบบตัวเลข 80 ถึงจะคริ 100% (40 → 84%) เพราะไม่ได้ค่าคริเฉพาะของรูน CLA
- Shadow Archer ใช้ร่วมกับชุดนี้ไม่ได้ (ลิงก์กับรูนร่ายสกิลไม่ได้) ต้องเลือกอย่างใดอย่างหนึ่ง
- **Shadow Archer แรงกว่าเพราะอะไร (ผู้ใช้ถาม 5 พ.ย. 2026):** ไลน์ของรูนให้ ×1.23 (ขยายดาเมจโปรเจกไทล์ 15% ×1.15, เจาะดาเมจ +30% ×1.04, ดาเมจโปรเจกไทล์ +31.2% ×1.03) ใกล้ Mana Storm ×1.24 ส่วนที่เหนือกว่าน่าจะเป็นธนูเงา ซึ่งตัวจำลองไม่นับ และไม่มีตัวเลขดาเมจในข้อมูลหรือบนเว็บ
  - CLA 6 ลิงก์ใส่ Shadow Archer ได้ 13.0–14.7 ล้าน ก่อนนับธนูเงา ธนูเงาต้องทำดาเมจ 51–70% ของตัวละครจึงเท่าชุด Lightning Chain 22.2 ล้าน ข้อสรุป "แรงกว่า 1.5–1.7 เท่า" จึงเทียบกับชุด Mana Storm เท่านั้น
  - ข้อดีอื่น: ไม่ติดระยะ 850, มานาราว 211 ต่อวินาที (ชุด Lightning Chain ราว 300) ข้อเสีย: ไม่มี Lightning Chain ช่วยฟาร์มและทำ Shock เหลือแค่โอกาส Shock +8–13% จากถุงมือ
- ลาคริมา: Silver Shadow (สวม Stra's บนตัว), Casthor's Vision 27.1 ล้าน, Token of Trust 34.9 ล้าน (ประมาณ)
- มานา: CLA ราว 38 ต่อการยิง (รวม +15%) + Lightning Chain ราว 22 = ราว 300 ต่อวินาที

## เทียบ Unleash Lightning Shot แทน CLA (5 พ.ย. 2026)
ผู้ใช้เรียกว่า "ยิงประทุสายฟ้า" ผมตีความว่าคือ Unleash Lightning Shot จากคำอธิบายรูน ผู้ใช้ไม่ได้แย้ง แต่ยังไม่ได้ยืนยันจากภาพในเกม ผู้ใช้ขอให้เพิ่มเป็นอีกบิลด์ในหน้าเดียวกัน จึงอยู่ในแท็บ `Unleash: Skill + Rune link` ของ `docs/cla-lightning-chain-build.html` ต่อมาผู้ใช้ทดสอบในเกมว่า Unleash + Shadow Archer แรงกว่า On Hit มาก ดู `notes/2026-11-06-unleash-shadow-archer.md`

**ผลยิงหุ่นในเกม (ผู้ใช้วัดเอง 5 พ.ย. 2026 ตอนจะเปลี่ยนมาเล่น Unleash): ชุด Shadow Archer แรงกว่าชุด Lightning Chain ราว 2.1–2.2 เท่า ใช้ผลนี้แทนตัวเลขจำลองด้านล่าง**
- หุ่น Lv100 ตัวเดียว: Unleash + Lightning Chain 33 ล้าน, Unleash + Shadow Archer 69 ล้าน (×2.09)
- หุ่น Lv100 9 ตัว: 274 ล้าน เทียบกับ 606 ล้าน (×2.21) ทั้งสองชุดโดนเกือบครบ 9 ตัว (8.3 และ 8.8 เท่าของหุ่นตัวเดียว) หุ่นยืนใกล้กัน จึงยังไม่ได้วัดกรณีมอนกระจายที่ Lightning Chain ได้เปรียบ
- ตัวจำลองไม่นับธนูเงา ชุด Lightning Chain จึงดูดีกว่าที่เป็นจริง ประมาณจากผลนี้ ธนูเงาทำดาเมจอย่างน้อยราว 70% ของตัวละคร (สมมติว่ารูนตัวอื่นเหมือนกัน และไลน์บนรูน Shadow Archer ให้ ×1.23: ถ้า Lightning Chain ไม่มีส่วนใน 33 ล้านเลย ได้ 70% ถ้ามีส่วนตามตัวจำลองราว 31% ได้ราว 146%)
- ถ้าตอนวัดชุดแรกยืนเกิน 850 Lightning Chain จะไม่ถูกร่าย แต่บวกดาเมจ Lightning Chain ตามสัดส่วนในตัวจำลอง (36–48% ของ Unleash) ก็ได้แค่ราว 45–49 ล้าน ยังต่ำกว่า 69 ล้าน
- Unleash ทำ Shock เองได้ (+20% บวกปลุกและถุงมือ) ไม่เสียไฟช็อตเมื่อถอด Lightning Chain ต่างจาก CLA ที่ทำเองไม่ได้ ผลนี้จึงใช้กับ CLA ตรงๆ ไม่ได้ ถ้าจะเทียบ CLA ต้องยิงหุ่นแยก
- มานาคำนวณเองราว 53–65 ต่อการยิง หรือ 265–325 ต่อวินาที เทียบกับ 350–400 ของชุด Lightning Chain (+50% แทน +15% แต่ไม่ต้องจ่ายค่า Lightning Chain ยังไม่ได้วัดในเกม) เปลี่ยน Mana Storm เป็น Element Master เหลือราว 210
- **Illusion Arrow ใช้ทำ Shock แทน Lightning Chain ไม่ได้ (ผู้ใช้ถาม 5 พ.ย. 2026):** ธาตุ Physical ไม่มีไลน์ Shock ไม่มีแท็ก Lightning จึงลิงก์ Continuous Shock ไม่ได้ ใส่ Convert Lightning DMG ได้แต่แปลงแค่ 50% และไม่เพิ่มโอกาส Shock คูลดาวน์ 3 วินาที ซองธนู Miraseti's Wave ลดลูก 5 ลูกและดาเมจ 30–40% ไม่มีแท็ก Shadow จึงลิงก์ Shadow Archer ไม่ได้ และเพิ่มค่าทรัพยากร 15%
- Unleash ทำ Shock เองได้ราว 51% ต่อการโดนเมื่อปลุก Source, Origin และใส่ถุงมือ น่าจะติดแทบตลอดแต่ยังไม่ได้เช็กไอคอนบนบอส ถ้าหลุดบ่อย: ปลุก Unleash ก่อน แล้วค่อย Continuous Shock แทนรูนตัวที่อ่อนสุด ทางเลือกสุดท้ายคือ Electric Sentry

**ข้อสรุปจากการจำลองก่อนยิงหุ่น (เทียบ CLA กับ Unleash โดยใช้ชุด Lightning Chain ทั้งคู่): ฟาร์ม CLA ดีกว่า ตีบอสขึ้นกับว่า Lightning Particle โดนบอสกี่ครั้ง** สองบิลด์ใช้ไอเทมและชุด Lightning Chain เดียวกัน ต่างกันแค่รูนสกิลและ Concentrated Area DMG เป็น Mana Storm
- ใส่ Concentrated Area DMG กับ Area Effect ไม่ได้ เพราะไม่มีแท็ก Area of Effect ชุดลิงก์ที่ดีสุดคือ Attack DMG Increase, Additional Lightning DMG, Quick Attack, Element DMG Amplification, Mana Storm (บวก Spell Activation)
- **เกรด Mana Storm:** แท็บ Unleash ใช้ Legendary (ขยายดาเมจ 24.2% และ 8%) ให้ตรงกับรูนตัวอื่น รอบเทียบครั้งแรกใช้ Rare ได้ 20.6–36.5 ล้าน ส่วนแท็บ CLA และ `bow-crit-builds.html` ยังใช้ CLA 6 ลิงก์ที่ Mana Storm เกรด Rare (13.2–14.9 ล้าน)
- DPS ต่อธนู 1 ลูก ติด Shock รวม Lightning Chain 10.2 ล้าน ปลุก Source + Origin:
  - CLA ลูกธนู + ระเบิด 21.2 + 10.2 = 31.5 ล้าน (ตัวเลข 22.2 ล้านในแท็บ CLA นับแค่ระเบิด)
  - Unleash ลูกธนูอย่างเดียว 21.4, บวก Particle 1 ครั้ง 27.2, 2 ครั้ง 32.9, 3 ครั้ง 38.6 ล้าน จุดเท่ากันคือ Particle โดน 1.75 ครั้งต่อลูก ต่อครั้ง ลูกธนูเฉลี่ย 2.24 ล้าน Particle 1.15 ล้าน จึงนับ Particle ในเกมจากตัวเลขที่ใหญ่ราวครึ่งหนึ่งของลูกธนูได้
- ตัวจำลองไม่นับจำนวน Particle, การปลุก Source (Particle +5) และไลน์ถุงมือ Miraseti's Miracle ที่เพิ่มการโจมตีสายฟ้าเท่าดาเมจ Particle
- ฟาร์ม: CLA เจาะทุกตัว ระเบิด 320 ใส่ Area Effect ได้ ลูกธนูเร็ว 4500 ส่วน Unleash ไม่เจาะ (ปลุก Origin +2) ระเบิด 150 ลูกธนูเร็ว 3000 ชุดฟาร์มใช้ Multishot แทน Mana Storm ได้ 19.3–33.2 ล้าน
- Shock: Unleash ทำเองได้ 20% รวมปลุก Source, Origin และถุงมือราว 51% ยืนเกินระยะ 850 จึงยังติด Shock ได้ 11.2–28.4 ล้าน (ไม่ติดเลย 9.3–23.7) CLA ได้ 18.8–21.2 ล้าน
- คริ: Unleash ต้องมีคริแบบตัวเลข 80 (มอน Lv170 ได้ 95% ต้อง 100) ตัวคูณคริ ×6.04 เทียบกับ CLA ×7.04 Find Weakness ไม่คุ้มทุกระดับคริแบบตัวเลข ใส่แล้วดาเมจลดเสมอ
- มานา: ตัวจำลองไม่นับ `+6 Resource Cost` ของ Mana Storm และ `+2` ของเกรด Legendary คำนวณเองได้ราว 47–60 ต่อการยิง รวม Lightning Chain ราว 350–400 ต่อวินาที (ตัวจำลองให้ 318 ซึ่งต่ำไป) ถ้าเปลี่ยน Mana Storm เป็น Element Master เหลือราว 300 และดาเมจ 20.5–36.3 ล้าน
- ปลุกพลัง (Particle โดน 3 ครั้ง): ไม่ปลุก 34.6, Source 36.5, + Origin 38.6, + Verity 40.9 ล้าน
- ไอเทมทางเลือก (ลูกธนูอย่างเดียว ถึง Particle 3 ครั้ง): Master of Trajectory 22.3–40.1, Spica's Light 19.8–35.9, Approaching Omen 14.2–24.6 (ไม่นับสแตก), ลาคริมา Casthor's Vision 26.5–48.2, Token of Trust 34.2–62.1 ล้าน
- Precise Shot แทน Element DMG Amplification: ใกล้กว่า 600 ได้ 19.5–33.7, 600–850 ได้ 24.8–47.2 (นับ 6 สแตกเอง), ไกลกว่า 850 ได้ 14.6–37.0 ล้าน ยังไม่รู้ว่ามีผลกับ Particle หรือไม่ Close Range Shot แทนตัวเดียวกัน: ระยะ 600 ได้ 20.8–37.0, 400 ได้ 22.2–40.6, 200 ได้ 23.6–44.2 ล้าน

## รูน Chain (ลูกโซ่) บน Lightning Chain (2 พ.ย. 2026)
ผู้ใช้ถามจากภาพกระดาน ตอนนั้นรูน Chain Lv31 Legendary วางติด CLA กับรูนร่ายสกิล ไม่ได้ติด Lightning Chain ส่วน Lightning Chain มีลิงก์ครบ 6 ด้านแล้ว
- ค่า Chain: Lv45 กระโดด +3, ระยะ +31.9%, ขยายดาเมจ 7.8%, มานา +20% / Legendary กระโดด +1, ระยะ +15%, ขยายดาเมจ 7.5% (Lv31 ในเกม: +2, +24.9%, 5.3%)
- **ตีบอส: ไม่คุ้ม** การกระโดดที่เพิ่มไปโดนมอนตัวอื่น ได้แค่ขยายดาเมจ ×1.13 (Lv31) ถึง ×1.16 (Lv45) ตัวที่อ่อนสุดในชุดของหน้าเว็บคือ Element Master ราว ×1.33 (เท่ากับ Mana Storm ในตัวจำลอง) ถ้าเปลี่ยน Lightning Chain ดาเมจลดราว 13–15% DPS รวมลดราว 6–7% (คำนวณเอง ไม่ได้รันตัวจำลอง)
- ถ้าปลุก Lightning Chain ระดับ Verity (ขยายดาเมจ 2–3% ต่อการกระโดดที่เหลือ สูงสุด 15) Chain Lv45 Legendary ทำให้กระโดด 11 → 15 พอดีเพดาน ได้เพิ่มอีกราว ×1.07–1.09 รวมราว ×1.25 ยังน้อยกว่า Element Master และยังไม่ได้ทดสอบว่าไลน์ Verity ทำงานแบบนี้กับบอสตัวเดียว
- **ฟาร์ม: ใส่ได้** แทน Element Master โดนมอน 12 → 16 ตัว (Lv31: 15 ตัว) ระยะกระโดด +40–47% เข้ากับปลุก Origin (3% ต่อการกระโดด สูงสุด 15)
- CLA ไม่มีค่าการกระโดดในข้อมูล รูน Chain ที่วางติด CLA น่าจะไม่ได้ผล ให้ผู้ใช้เช็กดาเมจ CLA ในหน้าต่างสกิลก่อนและหลังถอด

## Shadow Archer: คำอธิบายในเกมและการปลุก (3 พ.ย. 2026)
ตัวเลขเทียบกับชุด Lightning Chain ให้ใช้ข้อ "Shadow Archer แรงกว่าเพราะอะไร" ด้านบน (13.0–14.7 ล้านก่อนนับธนูเงา จุดคุ้มทุน 51–70%) ตัวเลขที่เคยตอบผู้ใช้วันที่ 3 พ.ย. (10.6, 21.2 และ 63.6 ล้าน, จุดคุ้มทุน 45–110%) ใช้ไม่ได้ เพราะอิงเลข CLA 6 ลิงก์ 10.8 ล้านที่ผิด
- ภาพคำอธิบาย "เอฟเฟกต์นักธนูเงา" (Shadow Archer Effect) ในเกม: "เอฟเฟกต์เงาจะใช้กับสกิลที่ติดแท็กเงา เมื่อโจมตี เงาจะถูกอัญเชิญและใช้การโจมตีแบบเดียวกับผู้อัญเชิญ" ไม่ได้บอกทั้งว่าดาเมจลดลงหรือเต็ม ผลยิงหุ่นของ Unleash อยู่ในหัวข้อ "เทียบ Unleash Lightning Shot แทน CLA" ด้านบน
- ถ้าธนูเงาทำดาเมจเต็มจริง ชุด Shadow Archer จะได้ราว 26.0–29.4 ล้าน เทียบกับชุด Lightning Chain 22.2 ล้าน (คำนวณเองจาก 13.0–14.7 × 2)
- ถ้าเล่นชุด Shadow Archer (CLA หรือ Unleash) ปลุก Shadow Archer: Origin (ธนูเงาคู่คูลดาวน์ 1 วินาที คริดาเมจ Attack +45–60% ดาเมจโปรเจคไทล์ +45–60%) เป็นตัวเลือกที่ปลอดภัย, Verity (ลูก +2 ขยายดาเมจ 7.5–15%) ถ้าลูกธนูโดนบอสหลายลูก, Source ความเร็วโจมตีชนเพดาน 5 ครั้งต่อวินาทีแล้ว จึงได้ผลแค่โอกาส 10% เรียกธนูเงาคู่ ยังไม่รู้ว่าไลน์นั้นมีคูลดาวน์หรือไม่ (ประเมินเอง)

## ยังไม่ได้ทำ
- ข้อมูล Charm ของ S12 ยังไม่มี (ชื่อ/ผลของ Blessing ทั้ง 12) แท็บ Charm จึงเป็นหลักการ ถ้าผู้ใช้ส่งรายการ Charm มา ให้ปรับแท็บนั้น
- ยังไม่รู้ค่าธนูเงาที่แน่นอน (ประมาณจากการยิงหุ่นว่าอย่างน้อยราว 70%) ถ้าจะวัดต้องยิงหุ่นชุดที่ไม่มีทั้ง Lightning Chain และ Shadow Archer เพิ่ม ก่อนหน้านี้ผู้ใช้เล่นชุด CLA + Lightning Chain เพราะฟาร์มเร็วกว่า ล่าสุด (5 พ.ย. 2026) บอกว่าจะเล่น Unleash ยิงหุ่นเทียบกับ Shadow Archer และถามหาตัวทำ Shock แทน Lightning Chain จึงถือว่ากำลังเปลี่ยนมาใช้ชุด Unleash + Shadow Archer
- แท็บ `Unleash: Skill + Rune link` ใน `docs/cla-lightning-chain-build.html` ใส่ชุด Shadow Archer เป็นชุดหลักแล้ว (5 พ.ย. 2026) ชุด Lightning Chain เหลือไว้เทียบ ตัวเลขส่วนใหญ่ในแท็บยังเป็นของชุด Lightning Chain ยังไม่ได้ยิงหุ่น CLA และ Lightning Arrow กับ Shadow Archer
- ยังไม่ได้เช็กในเกมว่า Cast Distance นับจากตัวละครหรือไม่ และถ้าเกินระยะแล้วรูนยังหักมานาของ Lightning Chain หรือเปล่า
- ยังไม่ได้เช็กในเกมว่าไลน์ลดดาเมจ 10% ของ On Attack Hit ซ้อนกับไลน์เกรด Legendary 5% หรือไม่ (ดูจากดาเมจ Lightning Chain ในหน้าต่างสกิลตอนลิงก์รูน)
- ยังไม่ได้เช็กในเกมว่า Particle ของ Unleash โดนบอสกี่ครั้งต่อลูก, ไลน์ถุงมือ Miraseti's Miracle เพิ่มการโจมตีกี่ครั้ง, CLA โดนบอสทั้งลูกธนูและระเบิดหรือไม่ และการปลุก Unleash เจาะ +2 / กระโดด +2 ทำงานจริงหรือไม่ เพราะรูนมีไลน์ Cannot Pierce และ Cannot Chain
- แท็บ CLA ยังใช้ Mana Storm เกรด Rare ในตัวเลข CLA 6 ลิงก์ (13.2–14.9 ล้าน และ "แรงกว่า 1.5–1.7 เท่า") ถ้าเป็น Legendary จะเป็น 14.3–16.1 ล้าน และ "แรงกว่า 1.4–1.6 เท่า" เลขมานา "42.6 เป็น 46" ของ Mana Storm ฝั่ง Lightning Chain ก็ยังไม่นับ `+6 Resource Cost` ทั้งสองจุดยังไม่ได้แก้ รอผู้ใช้ตัดสินใจ

## หน้าที่เกี่ยวข้อง
- `docs/cla-lightning-chain-build.html`: ชุด CLA และ Unleash Lightning Shot + Spell Activation on Attack Hit + Lightning Chain
- `docs/bow-crit-builds.html`: CLA รูนลิงก์ ไอเทม และตัวเลขจำลอง
- `docs/ogre-arrow-poison-build.html`: Ogre Arrow และการคำนวณการเจาะ
