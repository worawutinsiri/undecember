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
- `data-raw/official-s12/`: ชีททางการ S12 (The Farside) ให้ใช้เป็นหลัก ไฟล์ CSV มีขึ้นบรรทัดใหม่ในเซลล์ที่อยู่ในเครื่องหมายคำพูด ชื่อรูนอยู่คอลัมน์ที่ 2
  - `season-skill-rune-list-the-farside.csv` ค่าสกิลรูน Lv1/Lv45 และผลปลุก Source/Origin/Verity
  - `season-link-rune-list-the-farside.csv` รูนลิงก์
  - `new-unique-*.csv`, `the-forge-uniquebalance-changes.csv` ยูนีค
- `data-raw/buildDecember/RuneList.json`: ข้อมูลเก่ากว่า มีบางรูนที่ไม่อยู่ในชีท S12 (เช่น Spell Activation on Spell Hit) ใช้เทียบเท่านั้น
- `data-raw/game-assets/`: รายการ path ของ asset ในเกม ไม่มีค่าสถานะ
- `docs/*.html`: หน้าบิลด์ที่ทำไว้แล้ว ตัวเลข DPS มาจากตัวจำลองของ Undecember DB
- เครื่อง Windows นี้ไม่มี `python` ใน PATH ให้ใช้ `node` เขียนสคริปต์อ่านข้อมูล
