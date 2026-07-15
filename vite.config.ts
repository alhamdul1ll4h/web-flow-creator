import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // ลบ base ออกเพื่อให้ Vite ตรวจจับ Root ของ Vercel เองโดยอัตโนมัติ
    // วิธีนี้จะช่วยลดปัญหา 404 ที่เกิดจากการใส่ Path ซ้อนกันครับ
  },
});
