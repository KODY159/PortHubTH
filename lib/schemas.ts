import { z } from "zod";

const thaiOrEnglishText = (fieldName: string, max: number) =>
  z
    .string()
    .min(1, "กรุณากรอกชื่อ")
    .min(1, `กรุณากรอก${fieldName}`)
    .max(max, `${fieldName}ต้องไม่เกิน ${max} ตัวอักษร`)
    .trim();

export const UploadPortfolioSchema = z.object({
  title: thaiOrEnglishText("ชื่อผลงาน", 200),
  description: z
    .string()
    .max(1000, "คำอธิบายต้องไม่เกิน 1,000 ตัวอักษร")
    .optional(),
  story: z.string().max(3000, "Story ต้องไม่เกิน 3,000 ตัวอักษร").optional(),
  category: z.string().max(100).optional(),
  faculty: z.string().max(100, "ชื่อคณะต้องไม่เกิน 100 ตัวอักษร").optional(),
  university: z
    .string()
    .max(200, "ชื่อมหาวิทยาลัยต้องไม่เกิน 200 ตัวอักษร")
    .optional(),
  applyYear: z
    .number()
    .min(2500, "ปีต้องไม่น้อยกว่า 2500")
    .max(2600, "ปีไม่ถูกต้อง")
    .optional(),
  applyRound: z.enum(["Portfolio", "รอบ 1", "รอบ 2", ""]).optional(),
  result: z.enum(["ติด", "ไม่ติด", "รอผล", ""]).optional(),
});

export type UploadPortfolioData = z.infer<typeof UploadPortfolioSchema>;

export const QuestionSchema = z.object({
  question: thaiOrEnglishText("คำถาม", 500),
  portfolio_id: z.string().uuid("portfolio_id ไม่ถูกต้อง"),
  user_id: z.string().uuid("user_id ไม่ถูกต้อง"),
});

export const AnswerSchema = z.object({
  answer: thaiOrEnglishText("คำตอบ", 1000),
  question_id: z.string().uuid("question_id ไม่ถูกต้อง"),
  user_id: z.string().uuid("user_id ไม่ถูกต้อง"),
});

// ─── Profile schemas ──────────────────────────────────────

export const ProfileSchema = z.object({
  name: thaiOrEnglishText("ชื่อ", 50),
  bio: z.string().max(500, "Bio ต้องไม่เกิน 500 ตัวอักษร").optional(),
});

export const AvatarFileSchema = z
  .instanceof(File, { message: "กรุณาเลือกไฟล์รูปภาพ" })
  .refine(
    (file) => file.type.startsWith("image/"),
    "ไฟล์ต้องเป็นรูปภาพเท่านั้น (jpg, png, webp)",
  )
  .refine((file) => file.size <= 5 * 1024 * 1024, "ขนาดไฟล์ต้องไม่เกิน 5MB");

// ─── File schemas (validate metadata ของไฟล์) ────────────

export const CoverFileSchema = z
  .instanceof(File, { message: "กรุณาเลือกไฟล์รูปภาพ" })
  .refine(
    (file) => file.type.startsWith("image/"),
    "ไฟล์ต้องเป็นรูปภาพเท่านั้น (jpg, png, webp)",
  )
  .refine((file) => file.size <= 8 * 1024 * 1024, "ขนาดไฟล์ต้องไม่เกิน 8MB");

export const PdfFileSchema = z
  .instanceof(File, { message: "กรุณาเลือกไฟล์ PDF" })
  .refine(
    (file) => file.type === "application/pdf",
    "ไฟล์ต้องเป็น PDF เท่านั้น",
  )
  .refine((file) => file.size <= 20 * 1024 * 1024, "ขนาดไฟล์ต้องไม่เกิน 20MB");
