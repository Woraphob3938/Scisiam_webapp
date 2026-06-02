---
name: thai-token-efficient
description: Reduce token usage for Thai-heavy SciSiam conversations, docs, audits, and status updates while preserving technical accuracy, file paths, commands, security caveats, and scientific formulas.
---
# Thai Token Efficient

Use this skill when the user asks for shorter Thai responses, token saving, concise mode, prompt compression, or when a Thai-heavy response can be safely compacted.

## Goal

ตอบภาษาไทยให้สั้น หนาแน่น และยังเข้าใจง่าย โดยลดคำฟุ่มเฟือย ไม่ลดข้อมูลที่จำเป็นต่อการตัดสินใจ

## Default Style

- ใช้หัวข้อสั้น: `สรุป`, `ไฟล์`, `ผล`, `เสี่ยง`, `ต่อไป`
- ใช้ bullet สั้นแทนย่อหน้ายาว
- ผสม English technical terms เมื่อประหยัดกว่า เช่น `route`, `env`, `build`, `deploy`, `fallback`, `state`
- ตัดคำเติมที่ไม่เพิ่มสาระ เช่น `โดยรวมแล้ว`, `ค่อนข้าง`, `ในส่วนของ`, `สามารถที่จะ`
- ตอบตรงคำถามก่อน แล้วค่อยใส่ caveat ที่จำเป็น
- ใช้ file links/paths แทนการอธิบายตำแหน่งยาว ๆ

## Compression Patterns

| Verbose Thai | Compact |
|---|---|
| `ผมคิดว่าโดยรวมแล้วจุดนี้ควรได้รับการแก้ไขก่อน` | `ควรแก้ก่อน` |
| `ไฟล์ที่เกี่ยวข้องกับส่วนนี้คือ` | `ไฟล์:` |
| `คำสั่งที่ควรรันเพื่อตรวจสอบคือ` | `ตรวจ:` |
| `มีความเสี่ยงที่ API key จะรั่วไหล` | `เสี่ยง: key leak` |
| `ในกรณีที่ต้องการ deploy จริง` | `ถ้า deploy จริง:` |
| `ข้อมูลนี้ยังเป็น mock data อยู่` | `ยังเป็น mock` |

## Safe Shortcuts

- `รายละเอียด` → `detail`
- `หน้าการทดลอง` → `simulation`
- `ตัวแปรสภาพแวดล้อม` → `env`
- `ความพร้อมสำหรับ deploy` → `deploy readiness`
- `ข้อมูลจำลอง` → `mock`
- `ยังไม่รองรับ` → `unsupported`
- `กลับไปใช้ค่าเดิมผิดหัวข้อ` → `wrong fallback`

## Do Not Compress

Keep exact wording/details for:

- API keys, secrets, tokens, credentials
- Error messages and stack traces
- File paths and line numbers
- Shell commands
- Security findings and severity
- Legal/license/privacy caveats
- Scientific formulas, units, and variables
- User-facing Thai copy that will appear in the app
- Git directives, commit messages, PR titles

## Response Modes

### Quick Answer

Use 1-3 short bullets or one short paragraph.

### Code/Review Summary

Use:

- `เปลี่ยน:` files/behavior
- `ตรวจ:` commands/results
- `เหลือ:` warnings/risks

### Audit Findings

Do not over-compress. Keep:

- severity
- file/line
- impact
- suggested fix

### Docs Compression

For internal docs, prefer compact Thai-English mixed wording. For student-facing docs, preserve natural Thai readability.

## Token-Saving Priorities

1. Remove filler.
2. Remove repeated context already known in the thread.
3. Use tables only when they reduce words.
4. Link files instead of quoting code.
5. Summarize generated output instead of pasting it.
6. Keep verification evidence concise but explicit.

## Stop Conditions

If compacting would make the answer ambiguous, unsafe, rude, or incomplete, use normal concise Thai instead.

