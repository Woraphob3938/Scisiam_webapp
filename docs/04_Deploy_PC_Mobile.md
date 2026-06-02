---
title: Deploy PC Mobile Plan
tags:
  - scisiam
  - deploy
  - pc
  - mobile
---

# Deploy PC Mobile Plan

SciSiam ควรวางแผนเป็น 3 target แยกกัน แต่ใช้ codebase เดียวให้มากที่สุด

## Target 1: Web Demo

Purpose:

- ให้กรรมการเปิดง่าย
- ใช้ AI Tutor ผ่าน backend route
- เป็น canonical production URL สำหรับ PC/mobile app เรียก API

Requirements:

- Hosting ต้องรองรับ Next.js route handlers
- Set `GEMINI_API_KEY` ใน hosting env
- Run lint/build before deploy
- No secrets in repo

## Target 2: PC App

Options:

- Electron: ทำเร็วกว่า เหมาะกับ prototype/competition
- Tauri: เบากว่า แต่ setup ซับซ้อนกว่า

Rule:

- ห้ามใส่ AI key ใน PC package
- App should call hosted backend for AI
- Offline simulation can work, AI requires internet

## Target 3: Mobile App

Options:

- Capacitor wrapper
- PWA installable app
- Native later if needed

Rule:

- Mobile app calls hosted backend for AI
- Test 390px layout before packaging
- Floating AI button must not cover core actions

## Packaging Risks

- Static export cannot use local Next API routes
- API key in app package can be extracted
- localStorage score/progress is not trustworthy for real accounts
- In-memory rate limit is not enough for multi-instance production

## Related Notes

- [[03_AI_Tutor_Policy]]
- [[01_Competition_Readiness]]
- [[05_Backlog]]

