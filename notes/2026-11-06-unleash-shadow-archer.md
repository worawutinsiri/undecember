# Unleash Lightning Shot + Shadow Archer สายคริ

วันที่ 6 พ.ย. 2026 · หน้า `docs/unleash-shadow-archer-crit-build.html` มี 4 แท็บ: Skill + Rune link, Item, Charm, Lacrima

## ที่มา
ผู้ใช้ทดสอบในเกมแล้วบอกว่า Unleash + Shadow Archer แรงกว่า Spell Activation on Hit มาก จึงขอหน้าแยก ผู้ใช้ยังไม่ได้ให้ตัวเลขผลทดสอบ ถ้าส่งมา ให้ใส่ในหน้าและคำนวณย้อนว่าธนูเงาทำดาเมจกี่ %

## ข้อสรุป
- ตัวจำลองไม่นับธนูเงา และชีทไม่มีตัวเลข ตัวเลขทุกตัวในหน้าจึงเป็นค่าต่ำกว่าของจริง ผลทดสอบในเกมมาก่อนตัวเลขจำลองเมื่อเทียบกับชุดอื่น
- รูนลิงก์ดีสุดจากการลองทุกชุด: Shadow Archer, Attack DMG Increase, Additional Lightning DMG, Quick Attack, Element DMG Amplification, Mana Storm (ปลุก Unleash ระดับ Source + Origin)
- **ธนู Foresight of the Conqueror คือของที่ควรหาก่อน:** ×2.12 (Ultimate ×2.72) สูงกว่า ×1.45 ของ Frost Storm เพราะ Unleash มีดาเมจตัวเลขของรูนแค่ +200 และ Tipan's ให้ขยายดาเมจน้ำแข็งที่ Unleash ไม่ได้ใช้ ค่าของ Foresight มาจากประกาศแพตช์ 8 ต.ค. ไม่อยู่ใน `uniques.json`

## ตัวเลข (ลูกธนูอย่างเดียว ถึง Particle โดน 3 ครั้งต่อลูก, ไม่นับธนูเงา)
ตั้งค่าเหมือนหน้าธนูสายฟ้า: Lv45 Legendary, มอน Lv150 ต้าน 40%, คริแบบตัวเลข 80, ค่าสุ่ม 50%, Shock ตลอด, Tipan's + Leo's Flow
- ชุดฐาน 13.78–34.93 ล้าน, ตัวคูณคริ ×6.04, Particle 7.05 ล้านต่อครั้งที่โดน
- เทียบรูนร่ายสกิล: On Hit + Lightning Chain 20.46–37.65, On Attack Hit 21.42–38.62 ล้าน จุดเท่ากับ On Hit คือธนูเงาทำดาเมจ 48% ถึง 8% ของตัวละคร
- ไลน์ของ Shadow Archer ×1.23 (ขยายดาเมจโปรเจกไทล์ 15% ×1.15, เจาะดาเมจ +30% ×1.04, ดาเมจโปรเจกไทล์ +31.2% ×1.02)
- อัปเกรด: Foresight 29.24–74.10, Ultimate Foresight 37.47–94.98, Ring of Fate เฉลี่ย 7.5 สแตก 17.69–44.85 (×1.28), ปลุก Shadow Archer Origin 15.59–39.51 (×1.13), Unleash Verity 14.88–37.72 (×1.08) ชุดเต็ม Foresight + Ring of Fate + Shadow Archer Origin 41.88–106.15 ล้าน (×3.04), ใช้ Ultimate 52.99–134.31 ล้าน
- คริแบบตัวเลขที่ต้องมีเพื่อคริ 100% (Lv150/Lv170): Tipan's 78/88, Foresight 67/77, Foresight + Ring of Fate 75/87
- คริต่ำกว่าราว 70 ใส่ Electric Shock แทน Element DMG Amplification ดีกว่า Find Weakness และ Sharpness ทุกระดับ
- มานาคำนวณเอง (ตัวจำลองไม่นับ +8 ของ Mana Storm): ราว 265–325 ต่อวินาที, Element Master แทน Mana Storm ราว 210 และได้ 12.12–30.71 ล้าน, On Hit + Lightning Chain ราว 360–430
- ลาคริมา: Casthor's Vision 17.38–44.06, Token of Trust 22.38–56.74, Brilliance of Contrast 26.30–66.66 (กรณีดีที่สุด นับ Shadow of Sephdar ว่าทำงานตลอด) ชุดนี้ไม่มีรูนร่ายสกิล ส่วนเรียกเงาของ Brilliance จึงน่าจะทำงานได้

## ยังไม่รู้ ต้องลองในเกม
- ธนูเงาทำดาเมจกี่ % ปล่อย Particle ทำ Shock และติดไลน์ถุงมือ Miraseti's Miracle หรือไม่
- ปลุก Shadow Archer ระดับ Origin: คริดาเมจ +45–60% ถาวรหรือมีผลเฉพาะตอนธนูเงาคู่ทำงาน หน้าคิดเป็นถาวร
- Transcendent Ring of Fate ใช้ค่าจาก `docs/frost-storm-crit-build.html` ยังไม่ได้เทียบ tooltip
- ยังไม่ได้เทียบความเร็วฟาร์มกับ CLA ผู้ใช้เคยตัดสินใจเล่น CLA + Lightning Chain เพราะฟาร์มเร็วกว่า (5 พ.ย. 2026) หน้านี้จึงไม่ได้แปลว่าต้องเปลี่ยนชุดฟาร์ม
