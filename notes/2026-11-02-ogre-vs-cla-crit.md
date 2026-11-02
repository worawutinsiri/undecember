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
- ข้อจำกัดของ On Hit: ยิง 1 ครั้งเปิดสกิลได้ 1 ครั้ง สกิลที่ถูกเปิดโดนลดดาเมจ 32.5% ที่ Lv45

### ชุด 1: ถ้าเล่น Ogre Arrow ให้ใช้ Plague Spike
- Toxic Flame เป็น DoT ล้วน ไม่มีแท็ก Strike DoT ไม่ติดคริ ไม่ได้ผลจาก Projectile DMG และยูนีคที่ทำให้แรง (Vanishing Night) เป็นไม้เท้า ใส่กับธนูไม่ได้
- Plague Spike เป็น Strike คริได้ มีโอกาส 25% ทำ Plague 4 วินาที ลดค่าต้านธาตุ 10% และศัตรูรับดาเมจพิษเพิ่ม 10% ช่วยให้ Ogre Arrow แรงขึ้น

### ชุด 2: ถ้าเล่น CLA ให้ใช้ Lightning Chain
- Lightning Chain Lv45 ดาเมจ 881% +641 เกรด Legendary กระโดด 11 ตัว โอกาส Shock 40% คริดาเมจ Spell +50% และขยายดาเมจ 30% ใส่ศัตรูที่ติด Shock
- CLA ทำ Shock เองไม่ได้ แต่เกรด Legendary ได้ดาเมจ +150% ใส่ศัตรูติด Shock และปลุกระดับ Verity ได้คริดาเมจ +40% ใส่ศัตรูติดสถานะสายฟ้า Lightning Chain จึงเป็นตัวทำ Shock ให้ CLA
- Lightning Wave: 468% +1352 แรงขึ้น 25% ต่อ Lightning Energy 1 สแตก ยิงแล้วสแตกหมด ได้สแตก 20% ต่อครั้งที่โดน แหวน Transcendent Leo's Flow ทำให้สแตกไม่หายแต่ Lightning Wave ดาเมจลด 25% ข้อเสียคือไม่ทำ Shock และคลื่นออกจากตัวเราไปข้างหน้า 900 หน่วย ใช้เป็นตัวสลับตีบอสได้ถ้าทดสอบแล้วสแตกค้างจริง

### เหตุผลที่ชุด 2 ไปได้ไกลกว่า
- CLA มีโอกาสคริ +15% ในตัว และปลุกระดับ Origin ได้ผล Find Weakness ประหยัดรูนลิงก์ 1 ช่อง Ogre Arrow ต้องใส่ Find Weakness เอง
- เกรด Legendary ของ CLA ให้อัตราคริ Attack +120% คริดาเมจ +100% และเมื่อคริมีโอกาส 60–70% ปล่อยสายฟ้าเพิ่ม
- มอนเลเวลสูงต้องใช้คริเวทมากขึ้น (Lv150 ≈ 700, Lv170 ≈ 780) CLA ถึงเป้าง่ายกว่า
- ฟาร์มได้ในตัว: CLA เจาะทุกตัวและระเบิดกากบาท Lightning Chain กระโดด 11 ตัว ส่วน Ogre Arrow ต้องเพิ่ม Poison Rain of Arrows
- ตัวเลขตีบอสของ CLA มาจากตัวจำลอง (17.7 ล้านต่อลูก โดนครบ 3 ลูกราว 53 ล้าน) ส่วนของ Ogre Arrow (ราว 50 ล้าน ถึง 150 ล้านเมื่อใช้ธนู Star Usurper's) คำนวณเองโดยสมมติว่าลูกวนกลับมาโดนบอสทุกครั้ง ยังไม่ได้ลองในเกม กรณีแย่สุดราว 1.1 ล้าน
- ตัวเลขทั้งสองยังไม่รวมดาเมจของสกิลที่ถูกเปิด

### เมื่อไหร่ควรเลือกชุด 1
เมื่อมีธนู Star Usurper's Bow แล้ว และยิงหุ่นบอสแล้วเห็นว่าลูก Ogre Arrow วนกลับมาโดนซ้ำจริง ชุดนี้ตีบอสได้สูงกว่า แต่ฟาร์มอ่อนและไม่ได้ใช้คริเต็มที่เท่าชุด 2

## ยังไม่ได้ทำ
- ยังไม่ได้รันตัวจำลองสำหรับคอมโบที่มี Spell Activation on Hit
- ยังไม่ได้ทำหน้า HTML ของชุด CLA + Lightning Chain (เสนอไว้แล้ว ผู้ใช้ยังไม่ได้ตอบ)

## หน้าที่เกี่ยวข้อง
- `docs/bow-crit-builds.html`: CLA รูนลิงก์ ไอเทม และตัวเลขจำลอง
- `docs/ogre-arrow-poison-build.html`: Ogre Arrow และการคำนวณการเจาะ
