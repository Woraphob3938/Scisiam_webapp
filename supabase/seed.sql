insert into public.mission_definitions
  (id, title, description, mission_type, target_count, points_reward, is_active, sort_order)
values
  ('daily-login', 'เข้าศึกษาประจําวัน (Daily Log-in)', 'เข้าสู่ระบบการเรียนรู้และสำรวจห้องปฏิบัติการจำลองของ SciSiam', 'daily_login', 1, 10, true, 10),
  ('daily-science-1', 'ผู้ใฝ่รู้ห้องปฏิบัติการ (Science Explorer)', 'ทำการจำลองแล็บสำเร็จและบันทึกผลอย่างน้อย 1 ห้อง', 'completed_labs', 1, 25, true, 20),
  ('daily-science-3', 'ยอดนักวิจัยขั้นสูง (Expert Inquirer)', 'ทำวิจัยเชิงปฏิบัติการและบันทึกผลสำเร็จครบ 3 ห้อง', 'completed_labs', 3, 50, true, 30),
  ('quest-ohms', 'เควสต์: วิศวกรไฟฟ้ากระแสตรง', 'ทำจำลองห้องปฏิบัติการวงจรกระแสตรงกฎของโอห์มสำเร็จ', 'lab_completed', 1, 30, true, 40),
  ('quest-cooling', 'เควสต์: ผู้ควบคุมความร้อนนิวตัน', 'ทำจำลองห้องปฏิบัติการกฎการเย็นตัวของนิวตันสำเร็จ', 'lab_completed', 1, 30, true, 50),
  ('quest-equilibrium', 'เควสต์: ปรมาจารย์สมดุลเคมี', 'ทำจำลองห้องปฏิบัติการการรบกวนสมดุลเคมีสำเร็จ', 'lab_completed', 1, 30, true, 60),
  ('quest-hesss', 'เควสต์: ยอดนักคำนวณแคลอรี', 'ทำจำลองห้องปฏิบัติการ Hess''s Law & Calorimetry สำเร็จ', 'lab_completed', 1, 30, true, 70),
  ('ach-first-lab', 'จุดเริ่มต้นของนักวิทยาศาสตร์', 'ปลดล็อกจากการทำห้องปฏิบัติการใดๆ ในระบบสำเร็จเป็นครั้งแรก', 'completed_labs', 1, 20, true, 80),
  ('ach-five-labs', 'ผู้เชี่ยวชาญการวิจัยเสมือนจริง', 'ฝึกฝนทักษะการทดลองในห้องปฏิบัติการจำลองครบ 5 การทดลอง', 'completed_labs', 5, 50, true, 90),
  ('ach-point-collector', 'ยอดนักสะสมรางวัลเหรียญตรา', 'เก็บสะสมคะแนนวิจัยรวมให้ถึง 300 คะแนน', 'points_total', 300, 40, true, 100)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  mission_type = excluded.mission_type,
  target_count = excluded.target_count,
  points_reward = excluded.points_reward,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  updated_at = now();
