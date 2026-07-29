import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("AI I-Oon supports natural Scisiam and general conversation", () => {
  const route = readProjectFile("src/app/api/ai-tutor/route.ts");
  const chat = readProjectFile("src/components/AIChatButton.tsx");

  assert.match(route, /เพื่อนคู่คิดและผู้ช่วยการเรียนรู้/);
  assert.match(route, /สามารถคุยเรื่องทั่วไปนอกวิทยาศาสตร์ได้/);
  assert.doesNotMatch(route, /ถ้าคำถามไม่เกี่ยวกับวิทยาศาสตร์ ให้ชวนกลับ/);
  assert.match(route, /ใช้คำลงท้ายสุภาพแบบผู้หญิง/);
  assert.match(chat, /คุยเรื่องทั่วไปก็ได้ค่ะ/);
  assert.doesNotMatch(chat, /ผมคือ AI ไออุ่น/);
});

test("AI I-Oon uses the full mascot artwork without cropping", () => {
  const chat = readProjectFile("src/components/AIChatButton.tsx");
  const artworkPath = "public/ai-oon-logo.png";

  assert.match(chat, /src="\/ai-oon-logo\.png"/);
  assert.match(chat, /className="object-contain"/);
  assert.doesNotMatch(chat, /src="\/ai-oon-avatar\.png"/);
  assert.equal(existsSync(join(rootDir, artworkPath)), true);
});

test("AI I-Oon chat header stays compact and uses the mascot", () => {
  const chat = readProjectFile("src/components/AIChatButton.tsx");

  assert.match(chat, /src="\/ai-oon-logo\.png"/);
  assert.match(chat, /text-base font-extrabold/);
  assert.doesNotMatch(chat, /เพื่อนคู่คิด Scisiam/);
  assert.doesNotMatch(chat, /visibleTitle/);
});
