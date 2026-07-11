---
title: Deploy PC Mobile Plan
status: active
---

# Deploy PC Mobile Plan

SciSiam ใช้ Next.js web deployment เป็น canonical backend สำหรับ browser, PC และ mobile wrapper

## Web

- Deploy บน host ที่รองรับ Next.js Route Handlers และ middleware เช่น Vercel
- Canonical fallback origin คือ https://scisiam-app.vercel.app
- ตั้ง NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, GEMINI_API_KEY และ optional GEMINI_MODEL ใน hosting environment
- ตั้ง Supabase redirect URL สำหรับ /auth/verify และ /auth/oauth-callback ของ local และ production origin
- ก่อน deploy ให้ผ่าน npm test, npm run lint, npm run build, secret scan และตรวจ migration history

## PC

- มี Electron scaffold ใน main.js สำหรับการพัฒนา แต่ยังไม่ใช่ product decision สุดท้าย
- Tauri อาจเหมาะเมื่อขนาด package และ memory สำคัญกว่าเวลา setup
- package ต้องไม่มี provider key, service-role key หรือ private database credential
- wrapper เรียก backend ของ SciSiam ผ่าน HTTPS และต้องทดสอบ sign-in, upload, notification และ offline state

## Mobile

- เลือก PWA ก่อนเมื่อเป้าหมายคือ installable web experience ที่เร็ว
- พิจารณา Capacitor เมื่อจำเป็นต้องเข้าถึงความสามารถ native มากขึ้น
- ตรวจ mobile 390px, touch targets, keyboard, dialog, notification และ AI floating button ก่อน packaging

## ความเสี่ยงที่ต้องคุม

- Static export ใช้ built-in API route และ middleware แบบนี้ไม่ได้ ต้องแยก backend ก่อน
- localStorage ไม่ใช่ source of truth ของ account หรือ authorization
- in-memory fallback ของ rate limit ไม่เพียงพอสำหรับหลาย instance
- SMTP, leaked-password protection, redirect URL และ OAuth consent ต้องตรวจซ้ำใน production
