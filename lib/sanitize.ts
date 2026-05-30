import DOMPurify from "isomorphic-dompurify";

// sanitizeText: ลบ HTML tags ทั้งหมด เหลือแค่ plain text
// ใช้กับ: question, answer, story, title, description
export default function sanitizeText(input: string): string {
  if (!input) return "";

  const trimmed = input.trim();

  // DOMPurify ลบ HTML/script ทั้งหมด
  // ALLOWED_TAGS: [] = ไม่อนุญาต HTML tag ใดๆ เลย
  const clean = DOMPurify.sanitize(trimmed, { ALLOWED_TAGS: [] });

  return clean;
}

// sanitizeLength: ตัดความยาวถ้าเกิน limit
// ป้องกัน user ส่ง payload ขนาดใหญ่มาก
export function sanitizeLength(input: string, max: number): string {
  return input.slice(0, max);
}

// sanitize สำหรับ field แต่ละประเภท
export const sanitize = {
  question: (s: string) => sanitizeLength(sanitizeText(s), 500),
  answer: (s: string) => sanitizeLength(sanitizeText(s), 1000),
  story: (s: string) => sanitizeLength(sanitizeText(s), 3000),
  title: (s: string) => sanitizeLength(sanitizeText(s), 200),
  short: (s: string) => sanitizeLength(sanitizeText(s), 100),
  faculty: (s: string) => sanitizeLength(sanitizeText(s), 100),
  university: (s: string) => sanitizeLength(sanitizeText(s), 100),
  description: (s: string) => sanitizeLength(sanitizeText(s), 5000),
  name: (s: string) => sanitizeLength(sanitizeText(s), 100),
  bio: (s: string) => sanitizeLength(sanitizeText(s), 500),
};
