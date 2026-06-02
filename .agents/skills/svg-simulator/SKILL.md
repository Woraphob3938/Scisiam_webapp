---
name: svg-simulator
description: Guidelines and instructions for generating high-performance SVG animations, physics engines, and chemistry/biology interactive simulator viewports in Next.js/React.
---

# SVG & Simulator Development Skill

คู่มือการพัฒนา SVG Vectors, Physics Engine (Euler Integration) และการจำลองระบบจำลองเสมือนจริง (Interactive Simulators) สำหรับแอปพลิเคชันเพื่อการศึกษาใน React / Next.js

---

## 1. Core Principles of AI-Generated Simulators

เมื่อมีงานให้สร้างหรือปรับปรุงวิทยาศาสตร์จำลอง (Virtual Lab Simulator):
1. **Interactive Viewport**: พื้นที่ทดลอง (Viewport) หลักต้องสร้างขึ้นด้วย SVG หรือ HTML5 Canvas โดยเน้น SVG เป็นหลักเนื่องจากรองรับ Dynamic Styling, Gradients และ Responsive (Scaling) ได้ง่ายกว่า
2. **Physics/Math Precision**: ห้ามใช้วิธีเปลี่ยน CSS Transition สุ่มสี่สุ่มห้าสำหรับการเคลื่อนที่เชิงฟิสิกส์ (เช่น คาบแกว่ง, ตกอิสระ, การชน) ให้ใช้ **Numerical Integration** (เช่น Euler หรือ Verlet Integration) คำนวณความเร็วและตำแหน่งทุกเฟรม (60fps) ในลูปแอนิเมชันจริง
3. **Performance Isolation**: เพื่อป้องกันการกระตุก (Lag) หรือ Re-render ที่ถี่เกินไปใน React:
   - บันทึกตัวแปรสถานะที่ต้องการเปลี่ยนอย่างต่อเนื่อง (เช่น ตำแหน่ง $x$, ความเร็ว $v$, อุณหภูมิ, ความต่างศักย์) ใน `useRef`
   - รัน Physics Loop ผ่าน `requestAnimationFrame` (rAF)
   - อัปเดต React State เฉพาะส่วนของตัวเลขหรือ Metric บน UI ที่ต้องการแสดงผลเป็นตัวอักษรเท่านั้น โดยทำการ Throttle/Debounce รอบการอัปเดต React State

---

## 2. Advanced SVG Rendering & Aesthetics

เพื่อให้งานออกแบบดู **Premium / Competition-ready**:
- **Gradients & Textures**: เติมมิติ 3D เสมอโดยใช้ `<linearGradient>` หรือ `<radialGradient>` สำหรับชิ้นส่วนโลหะ แก้ว ของเหลว หรือสารเคมี
  - ของเหลวในบีกเกอร์หรือบิวเรต: ใช้ Gradient ซ้อนเลเยอร์ที่มี Opacity และมี Overlay ฟองอากาศ
  - ขดลวดสปริง: ใช้ Smooth Bezier Splines แทนการขีดเส้นฟันปลา (Zigzag)
- **Filters & Shadow Effects**: ใช้ `<filter id="dropShadow">` สำหรับเพิ่มเงาใต้บล็อกมวลหรือฐานอุปกรณ์
- **Burner / Heating Effects**:
  - หากระบบมีความร้อนสูง ($T > 300\text{ K}$): ให้แสดงแอนิเมชันเปลวไฟด้วยสีผสมไล่เฉด `from-orange-500 via-red-500 to-amber-400`
  - หากมีความเย็นจัด ($T < 273\text{ K}$): ให้มีไอเย็นสีขาวหรือผลึกน้ำแข็งโปร่งแสงตกแต่ง

---

## 3. Physics Simulation Mechanics (Euler Integration)

สำหรับระบบฟิสิกส์จำลอง ให้ใช้สมการและรูปแบบโค้ดดังนี้:

### Hooke's Law (Damped Harmonic Motion)
คำนวณแรงที่เกิดขึ้นในแต่ละ Time Step:
$$F_{\text{net}} = F_{\text{gravity}} + F_{\text{spring}} + F_{\text{damping}}$$
โค้ดรูปแบบตัวอย่างใน rAF:
```typescript
const g = 9.81;
const forceSpring = -k * x; // x = displacement จากจุดสมดุล
const forceGravity = mass * g;
const forceDamping = -dampingCoeff * velocity;

const forceNet = forceSpring + forceGravity + forceDamping;
const acceleration = forceNet / mass;

velocity = velocity + acceleration * dt;
displacement = displacement + velocity * dt;
```

### Ideal Gas Law (Kinetic Theory of Gases)
การเรนเดอร์แก๊สโมเลกุล:
- กำหนดให้แก๊สแต่ละโมเลกุลเป็นออบเจกต์ `{ x, y, vx, vy }`
- คำนวณความเร็วเฉลี่ยตามอุณหภูมิ: $v \propto \sqrt{T}$
- เช็คการสะท้อนขอบแก้ว (Elastic Collisions):
```typescript
if (molecule.x - r < minX || molecule.x + r > maxX) molecule.vx *= -1;
if (molecule.y - r < minY || molecule.y + r > maxY) molecule.vy *= -1;
```

---

## 4. Animation Loops & Cleanup in React

เพื่อป้องกัน Memory Leak หรือ Thread Block:
- เคลียร์แอนิเมชันลูปทุกครั้งใน `cleanup` ของ `useEffect`:
```typescript
useEffect(() => {
  let animationFrameId: number;

  const loop = () => {
    updatePhysics();
    renderSVG();
    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(animationFrameId);
}, [dependencies]);
```
- ใช้ `useMemo` เสมอในการคำนวณ Path SVG ที่ซับซ้อน เพื่อจำกัดทราฟฟิก CPU ในการทำ Render Path ของ React
