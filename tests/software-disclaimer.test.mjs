import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (relativePath) =>
  readFileSync(join(rootDir, relativePath), "utf8");

test("NSC software disclaimer keeps the approved canonical copy in one data module", () => {
  const dataPath = "src/data/softwareDisclaimer.ts";
  assert.equal(existsSync(join(rootDir, dataPath)), true, `${dataPath} should exist`);

  const source = readProjectFile(dataPath);
  assert.match(source, /scisiam_nsc_disclaimer_seen_v1/);
  assert.match(source, /ไซสยาม: ห้องทดลองวิทยาศาสตร์ออนไลน์ เพื่อการศึกษาไทยที่ยั่งยืนทั่วทุกพื้นที่/);
  assert.match(source, /SciSiam Simulation Lab/);
  assert.match(source, /นางสาวชัชนัน บุญเหลือง/);
  assert.match(source, /นายวรภพ ไชยวงศ์คต/);
  assert.match(source, /นายพิพัฒน์ โพธิ์ศรีสุข/);
  assert.match(source, /ผู้ช่วยศาสตราจารย์ ดร\.ทวี งามวิไลกร/);
  assert.match(source, /คณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร/);
  assert.match(source, /โครงการการแข่งขันพัฒนาโปรแกรมคอมพิวเตอร์แห่งประเทศไทย ครั้งที่ 28/);
  assert.match(source, /เผยแพร่ซอฟต์แวร์นี้ตาม “ต้นฉบับ”/);
  assert.match(source, /ไม่มีวัตถุประสงค์ในเชิงพาณิชย์/);
  assert.match(source, /ไม่รับประกันความเสียหายต่าง ๆ/);
  assert.doesNotMatch(
    source,
    /\(ชื่อผู้พัฒนา\)|\(ชื่อสถาบัน\)|\(ชื่ออาจารย์ที่ปรึกษา\)|\(ชื่อโครงการ\)/,
  );
});

test("software disclaimer dialog uses the shared accessible controlled dialog", () => {
  const componentPath = "src/components/SoftwareDisclaimerDialog.tsx";
  assert.equal(
    existsSync(join(rootDir, componentPath)),
    true,
    `${componentPath} should exist`,
  );

  const source = readProjectFile(componentPath);
  const sharedDialog = readProjectFile("src/components/ui/dialog.tsx");
  assert.match(source, /<Dialog open=\{open\} onOpenChange=\{handleOpenChange\}>/);
  assert.match(source, /<DialogTitle/);
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /onOpenAutoFocus/);
  assert.match(source, /onCloseAutoFocus/);
  assert.match(source, /aria-describedby=\{undefined\}/);
  assert.match(source, /รับทราบและดำเนินการต่อ/);
  assert.match(source, /tabIndex=\{0\}/);
  assert.match(source, /text-base/);
  assert.match(source, /leading-\[1\.7\]/);
  assert.match(source, /sm:max-w-5xl/);
  assert.match(source, /lg:grid-cols-3/);
  assert.match(source, /whitespace-nowrap/);
  assert.match(source, /focus-visible:ring-blue-600/);
  assert.doesNotMatch(source, /focus-visible:ring-blue-200/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(sharedDialog, /<XIcon\s+aria-hidden="true"/);
  assert.doesNotMatch(source, /createPortal|role="dialog"/);
});

test("login and register show the NSC disclaimer once and keep a permanent trigger", () => {
  const source = readProjectFile("src/components/auth/AuthForm.tsx");
  assert.match(source, /SoftwareDisclaimerDialog/);
  assert.match(source, /SOFTWARE_DISCLAIMER_SEEN_KEY/);
  assert.match(source, /localStorage\.getItem\(SOFTWARE_DISCLAIMER_SEEN_KEY\)/);
  assert.match(source, /localStorage\.setItem\(SOFTWARE_DISCLAIMER_SEEN_KEY, "true"\)/);
  assert.match(source, /try \{/);
  assert.match(source, /setShowSoftwareDisclaimer\(true\)/);
  assert.match(source, /ข้อตกลงการใช้ซอฟต์แวร์ NSC 2026/);
  assert.match(source, /aria-haspopup="dialog"/);
  assert.match(
    source,
    /aria-haspopup="dialog"[\s\S]{0,500}focus-visible:ring-blue-600/,
  );
  assert.match(source, /returnFocusRef=\{emailInputRef\}/);
  assert.match(source, /ref=\{emailInputRef\}/);
  assert.doesNotMatch(
    source,
    /supabase[\s\S]{0,80}SOFTWARE_DISCLAIMER_SEEN_KEY/,
  );
});

test("settings opens the disclaimer through Navbar without nesting modals", () => {
  const settings = readProjectFile("src/components/SettingsModal.tsx");
  const navbar = readProjectFile("src/components/Navbar.tsx");

  assert.match(settings, /onOpenSoftwareDisclaimer: \(\) => void/);
  assert.match(settings, /ข้อตกลงการใช้ซอฟต์แวร์ NSC 2026/);
  assert.match(settings, /onClick=\{onOpenSoftwareDisclaimer\}/);
  assert.match(
    settings,
    /onClick=\{onOpenSoftwareDisclaimer\}[\s\S]{0,240}border-blue-600[\s\S]{0,180}focus-visible:ring-blue-600/,
  );
  assert.doesNotMatch(settings, /<SoftwareDisclaimerDialog/);

  assert.match(navbar, /SoftwareDisclaimerDialog/);
  assert.match(navbar, /profileMenuTriggerRef/);
  assert.match(navbar, /setShowSettingsModal\(false\)/);
  assert.match(navbar, /setShowSoftwareDisclaimer\(true\)/);
  assert.match(
    navbar,
    /onOpenSoftwareDisclaimer=\{openSoftwareDisclaimerFromSettings\}/,
  );
  assert.match(navbar, /returnFocusRef=\{profileMenuTriggerRef\}/);
});
