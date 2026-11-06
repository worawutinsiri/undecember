# Undecember: notes for Claude

## บันทึกบทสนทนา (ใช้ต่อข้ามเครื่อง)
- สรุปบทสนทนาเก็บไว้ใน `notes/` ไฟล์ละหัวข้อ ชื่อ `YYYY-MM-DD-หัวข้อ.md`
- ก่อนตอบคำถามเรื่องบิลด์หรือสกิล ให้อ่านไฟล์ใน `notes/` ที่เกี่ยวข้องก่อน
- ถ้าได้ข้อสรุปใหม่หรือข้อสรุปเดิมเปลี่ยน ให้แก้ไฟล์เดิมหรือเพิ่มไฟล์ใหม่ใน `notes/`

## วิธีทำงาน
- ตอบเป็นภาษาไทย ชื่อรูน สกิล ไอเทมคงเป็นภาษาอังกฤษ ใช้คำตาม `docs/thai-glossary.md`
- "ทำเป็น HTML" หมายถึงไฟล์ `.html` ธรรมดาใน `docs/` ไม่ใช่ claude.ai Artifact
- ห้าม commit หรือ push จนกว่าผู้ใช้จะสั่ง

## แหล่งข้อมูล
- `src/data/generated/*.json`: ค่ารูนและยูนีคของ S12 ที่แปลงจากชีทแล้ว (ค่าหลังแพตช์) ใช้อ่านค่าได้ง่ายที่สุด รูนลิงก์ที่มี `status: "legacy"` ไม่ได้มาจากชีท แต่มาจาก `RuneList.json`
- เช็กว่ารูนลิงก์ใส่กับสกิลได้ไหม ให้ใช้ `linkFit` และ `triggerRoles` ใน `src/lib/runeGuide.ts` เพราะ `checkLink` ใน `damage.ts` อ่านแค่แท็ก ไม่อ่านข้อจำกัดของสกิล (เช่น Cannot Split) และเงื่อนไขคูลดาวน์ ทั้งสองแบบไม่เช็กไลน์ปลุกพลัง "Cannot link X" ให้ดู `awakeningLinks`
- `data-raw/official-s12/`: ชีททางการ S12 (The Farside) ให้ใช้เป็นหลัก ไฟล์ CSV มีขึ้นบรรทัดใหม่ในเซลล์ที่อยู่ในเครื่องหมายคำพูด ชื่อรูนอยู่คอลัมน์ที่ 2
  - ไฟล์ `*-the-farside.csv` มีรูนละ 2 แถว: แถวที่มีชื่อ = `기존` (ค่าก่อนแพตช์) แถวถัดไปที่ชื่อว่าง = `변경` (ค่า S12) **ต้องใช้แถว `변경`**
  - `season-skill-rune-list-the-farside.csv` ค่าสกิลรูน Lv1/Lv45 และผลปลุก Source/Origin/Verity
  - `season-link-rune-list-the-farside.csv` รูนลิงก์
  - `new-unique-*.csv`, `the-forge-uniquebalance-changes.csv` ยูนีค
- `data-raw/buildDecember/RuneList.json`: ข้อมูลเก่ากว่า มีบางรูนที่ไม่อยู่ในชีท S12 (เช่น Spell Activation on Spell Hit) ใช้เทียบเท่านั้น **ไลน์ที่ชื่อซ้ำกันในรูนเดียวจะเหลือค่าเดียว** เช่น Spell Activation on Attack Hit มี DMG Dampening 2 ไลน์ (26.9% กับ 10%) แต่ไฟล์นี้เหลือแค่ 10% ถ้ารูนไม่อยู่ในชีท ให้ขอภาพหน้ารูนจากเว็บฐานข้อมูลเกมแทน
- ไลน์เกรด `(마법/희귀/전설 등급 효과)` ในชีท: แต่ละเกรดเป็นชุดของตัวเอง ไม่ได้บวกสะสมกัน รูนร่ายสกิล (Spell Activation) มีไลน์เกรดที่ลดดาเมจสกิลที่ถูกร่ายด้วย (Legendary 5%)
- `data-raw/game-assets/`: รายการ path ของ asset ในเกม ไม่มีค่าสถานะ
- `docs/*.html`: หน้าบิลด์ที่ทำไว้แล้ว ตัวเลข DPS มาจากตัวจำลองของ Undecember DB
- ตัวจำลองดาเมจ: `src/lib/damage.ts` (`simulate()`) รันนอกเว็บได้โดยเขียนสคริปต์ TS ใน scratchpad ที่ import จาก `src/` แล้ว bundle ด้วย `npx rolldown <file.ts> --file <out.mjs> --platform node --format esm` ตามด้วย `node <out.mjs>` ตัวจำลองไม่รองรับรูนร่ายสกิล (Spell Activation) และไม่นับไลน์แบบสแตกหรือมีเงื่อนไขหลายแบบ
- เครื่อง Windows นี้ไม่มี `python` ใน PATH ให้ใช้ `node` เขียนสคริปต์อ่านข้อมูล
