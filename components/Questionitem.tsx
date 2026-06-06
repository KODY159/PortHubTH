"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { Question, Answer } from "./QASection";
import AnswerItem from "./Answeritem";
import { sanitize } from "@/lib/sanitize";
import { AnswerSchema } from "@/lib/schemas";

type Props = {
  question: Question;
  currentUserId: string | null;
  ownerId: string;
  animationDelay: number;
  isLiked: boolean;
  // onDelete คือ async function จาก QASection ที่ทำ DB delete + state update
  // return true = สำเร็จ, false = ล้มเหลว
  onDelete: (questionId: string) => Promise<boolean>;
  onAnswerAdded: (questionId: string, answer: Answer) => void;
  onAnswerDeleted: (questionId: string, answerId: string) => void;
  onLikeChange: (questionId: string, newCount: number, liked: boolean) => void;
};

export default function QuestionItem({
  question,
  currentUserId,
  ownerId,
  animationDelay,
  isLiked,
  onDelete,
  onAnswerAdded,
  onAnswerDeleted,
  onLikeChange,
}: Props) {
  const [answerText, setAnswerText] = useState("");
  const [answerError, setAnswerError] = useState("");

  // upvote local state
  const [localUpvotes, setLocalUpvotes] = useState(question.upvotes);
  // prevRef store "before click" state for rollback in case of DB error

  // state check
  const [showAnswers, setShowAnswers] = useState(true);
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // owner/portfolio owner check
  const isOwnerOfQuestion = currentUserId === question.user_id;
  const isPortfolioOwner = currentUserId === ownerId;
  const authorName = question.profiles?.name ?? "Anonymous";

  //upvote toggle
  async function handleUpvote() {
    if (!currentUserId) return;

    // เก็บค่า "ก่อนกด" ไว้ใน local variable ทันที
    // ไม่ใช้ prevRef เพราะ closure ของ async function นี้จะจำค่านี้ไว้ถูกต้อง
    const prevCount = localUpvotes;
    const prevLiked = isLiked;

    const next = prevLiked ? prevCount - 1 : prevCount + 1;

    // optimistic update
    setLocalUpvotes(next);
    onLikeChange(question.id, next, !prevLiked);

    if (prevLiked) {
      // unlike
      const { error } = await supabase
        .from("question_likes")
        .delete()
        .eq("user_id", currentUserId)
        .eq("question_id", question.id);

      if (error) {
        console.error("unlike error:", error.message);
        // rollback จาก local variable ที่เก็บไว้ก่อนกด
        setLocalUpvotes(prevCount);
        onLikeChange(question.id, prevCount, prevLiked);
        return;
      }
    } else {
      // like
      const { error } = await supabase
        .from("question_likes")
        .insert({ user_id: currentUserId, question_id: question.id });

      if (error) {
        console.error("like error:", error.message);
        // rollback
        setLocalUpvotes(prevCount);
        onLikeChange(question.id, prevCount, prevLiked);
        return;
      }
    }
  }

  // question delete
  // confirm here but DB delete + state update is handled in QASection (onDelete)
  async function handleDelete() {
    if (!isOwnerOfQuestion || deleting) return; // is this uer owner of this question
    const confirmed = confirm("ลบคำถามนี้? คำตอบทั้งหมดจะถูกลบด้วย");
    if (!confirmed) return;

    setDeleting(true);
    const ok = await onDelete(question.id); //call parent to handle DB delete and state update (QASection)
    if (!ok) setDeleting(false);
  }

  //answer submitting
  async function handleSubmitAnswer() {
    const rawText = answerText.trim();
    const text = sanitize.answer(rawText);

    if (!text || !currentUserId) return;
    if (text.length > 1000) {
      setAnswerError("คำตอบต้องไม่เกิน 1,000 ตัวอักษร");
      return;
    }

    const result = AnswerSchema.safeParse({
      answer: text,
      question_id: question.id,
      user_id: currentUserId,
    });

    if (!result.success) {
      setAnswerError(result.error.issues[0].message);
      return;
    }

    const { answer } = result.data;

    setAnswerSubmitting(true);
    setAnswerError("");

    const { data: inserted, error } = await supabase
      .from("portfolio_answers")
      .insert({
        question_id: question.id,
        user_id: currentUserId,
        answer,
        is_owner_answer: isPortfolioOwner,
      })
      .select(
        `id, question_id, user_id, answer,
         is_owner_answer, upvotes, created_at,
         profiles ( name, avatar_url )`,
      )
      .single();

    if (error || !inserted) {
      console.error("[QA:submitAnswer]", error);
      setAnswerError("ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่");
      setAnswerSubmitting(false);
      return;
    }

    const normalized: Answer = {
      ...inserted,
      profiles: Array.isArray(inserted.profiles)
        ? (inserted.profiles[0] ?? null)
        : (inserted.profiles ?? null),
    };

    onAnswerAdded(question.id, normalized); //call parent to update array of answers (QASection)
    setAnswerText("");
    setAnswerSubmitting(false);
    setShowAnswers(true); //open answers list after submitting
  }

  const answerCount = question.portfolio_answers.length;

  return (
    <>
      <style>{`
        .qi-card {
          background: #F5F0E8; border: 1px solid #D8D1C2;
          overflow: hidden; animation: fadeUp 0.35s ease both;
          transition: border-color 0.2s;
        }
        .qi-card:hover { border-color: #C8BFA8; }

        /* header row */
        .qi-head { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px 0; }
        .qi-av {
          width: 28px; height: 28px; border-radius: 50%;
          background: #1A1714; color: #F5F0E8;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 11px; font-weight: 600;
          flex-shrink: 0; border: 1.5px solid #D8D1C2;
        }
        .qi-meta { flex: 1; min-width: 0; }
        .qi-name { font-size: 13px; font-weight: 500; color: #2E2B26; font-family: 'DM Sans', sans-serif; }
        .qi-date { font-size: 11px;
          color: #7B746B; font-family: 'DM Sans', sans-serif; }
        .qi-badges { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .qi-badge-answered {
          font-size: 8px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
          background: #E8F5EE; color: #1A5C2E; border: 1px solid #8ECEBF;
          padding: 2px 7px; font-family: 'DM Sans', sans-serif;
        }

        /* question text */
        .qi-text {
          padding: 10px 14px 0 52px; /* 52px = 28px avatar + 10px gap + 14px padding */
          font-size: 14px;
          line-height: 1.9; color: #1A1714;
          font-family: 'DM Sans', sans-serif; word-break: break-word;
        }

        /* action bar */
        .qi-actions { display: flex; align-items: center; gap: 8px; padding: 10px 14px 12px 52px; }

        .qi-upvote {
          display: flex; align-items: center; gap: 5px;
          background: none; border: 1px solid #D8D1C2; padding: 4px 10px;
          cursor: pointer; font-size: 11px; font-family: 'DM Mono', monospace; color: #6B6560;
          transition: all 0.18s;
        }
        .qi-upvote:hover:not(:disabled) { border-color: #C4581F; color: #C4581F; }
        .qi-upvote.voted { background: #F5EDDF; border-color: #C4581F; color: #C4581F; }
        .qi-upvote:disabled { opacity: 0.4; cursor: not-allowed; }

        .qi-toggle {
          display: flex; align-items: center; gap: 5px;
          background: none; border: 1px solid #D8D1C2; padding: 4px 10px;
          cursor: pointer; font-size: 11px; font-family: 'DM Sans', sans-serif; color: #6B6560;
          letter-spacing: 0.04em; transition: all 0.18s;
        }
        .qi-toggle:hover { border-color: #C8BFA8; color: #1A1714; }

        .qi-del {
          background: none; border: none; cursor: pointer; margin-left: auto;
          font-size: 10px; color: #C8BFA8; font-family: 'DM Sans', sans-serif;
          padding: 4px 6px; transition: color 0.18s;
        }
        .qi-del:hover:not(:disabled) { color: #8B1A14; }
        .qi-del:disabled { opacity: 0.4; cursor: not-allowed; }

        /* divider */
        .qi-div { height: 1px; background: #E3DDD0; margin: 0 14px; }

        /* answers area */
        .qi-answers { background: #EDE8DC; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }

        /* answer form */
        .qi-aform { display: flex; flex-direction: column; gap: 6px; }
        .qi-owner-lbl {
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #C4581F; font-weight: 500; font-family: 'DM Sans', sans-serif;
        }
        .qi-atextarea {
          width: 100%; resize: none;
          background: #F5F0E8; border: 1px solid #D8D1C2; border-bottom: 2px solid #C8BFA8;
          padding: 8px 10px; font-size: 13px; color: #1A1714;
          outline: none; font-family: 'DM Sans', sans-serif; line-height: 1.8;
          transition: border-color 0.2s;
        }
        .qi-atextarea:focus { border-color: #C4581F; border-bottom-color: #C4581F; }
        .qi-atextarea::placeholder { color: #9A9288; }
        .qi-afoot { display: flex; align-items: center; justify-content: space-between; }
        .qi-achars { font-size: 9px; color: #C8BFA8; font-family: 'DM Mono', monospace; }
        .qi-achars.warn { color: #C4581F; }
        .qi-asubmit {
          background: #1A1714; color: #F5F0E8; border: none; padding: 5px 14px;
          font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.18s;
        }
        .qi-asubmit:hover { background: #C4581F; }
        .qi-asubmit:disabled { opacity: 0.4; cursor: not-allowed; }
        .qi-aerr {
          font-size: 10px; color: #8B1A14;
          background: #F5E8E8; border: 1px solid #DBA8A5;
          padding: 5px 8px; font-family: 'DM Sans', sans-serif;
        }
        .qi-alogin { font-size: 12px; color: #9A9288; font-family: 'DM Sans', sans-serif; text-align: center; padding: 6px; }
        .qi-alogin a { color: #C4581F; text-decoration: none; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="qi-card" style={{ animationDelay: `${animationDelay}s` }}>
        {/* ── header ── */}
        <div className="qi-head">
          {question.profiles?.avatar_url ? (
            <Image
              src={question.profiles.avatar_url}
              alt={authorName}
              width={28}
              height={28}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1.5px solid #D8D1C2",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div className="qi-av">{authorName.charAt(0).toUpperCase()}</div>
          )}
          <div className="qi-meta">
            <div className="qi-name">{authorName}</div>
            <div className="qi-date">
              {new Date(question.created_at).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="qi-badges">
            {question.is_answered && (
              <span className="qi-badge-answered">ตอบแล้ว</span>
            )}
          </div>
        </div>

        {/* ── question text ── */}
        <div className="qi-text">{question.question}</div>

        {/* ── action bar ── */}
        <div className="qi-actions">
          {/* upvote */}
          <button
            className={`qi-upvote${isLiked ? " voted" : ""}`}
            onClick={handleUpvote}
            disabled={!currentUserId}
            title={
              !currentUserId
                ? "เข้าสู่ระบบเพื่อ upvote"
                : isLiked
                  ? "ยกเลิก upvote"
                  : "upvote คำถามนี้"
            }
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill={isLiked ? "#C4581F" : "none"}
              stroke={isLiked ? "#C4581F" : "currentColor"}
              strokeWidth="1.5"
            >
              <path d="M5 1L9 8H1L5 1Z" strokeLinejoin="round" />
            </svg>
            {localUpvotes}
          </button>

          {/* toggle answers */}
          <button
            className="qi-toggle"
            onClick={() => setShowAnswers((v) => !v)}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M1 3h10M1 6h7M1 9h5" />
            </svg>
            {answerCount > 0
              ? `${answerCount} คำตอบ ${showAnswers ? "▲" : "▼"}`
              : `คำตอบ ${showAnswers ? "▲" : "▼"}`}
          </button>

          {/* delete — เฉพาะเจ้าของคำถาม */}
          {isOwnerOfQuestion && (
            <button
              className="qi-del"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "กำลังลบ..." : "ลบ"}
            </button>
          )}
        </div>

        <div className="qi-div" />

        {/* ── answers area ── */}
        {showAnswers && (
          <div className="qi-answers">
            {/* existing answers — sort: owner ก่อน, แล้ว upvotes */}
            {question.portfolio_answers
              .slice()
              .sort((a, b) => {
                if (a.is_owner_answer !== b.is_owner_answer)
                  return a.is_owner_answer ? -1 : 1;
                return b.upvotes - a.upvotes;
              })
              .map((ans) => (
                <AnswerItem
                  key={ans.id}
                  answer={ans}
                  currentUserId={currentUserId}
                  onDelete={(answerId) =>
                    onAnswerDeleted(question.id, answerId)
                  }
                />
              ))}

            {/* answer form */}
            {currentUserId ? (
              <div className="qi-aform">
                {isPortfolioOwner && (
                  <div className="qi-owner-lbl">ตอบในฐานะเจ้าของพอร์ต</div>
                )}
                <textarea
                  className="qi-atextarea"
                  placeholder={
                    isPortfolioOwner
                      ? "ตอบคำถามนี้..."
                      : "เพิ่มคำตอบหรือความคิดเห็น..."
                  }
                  value={answerText}
                  rows={2}
                  maxLength={1000}
                  onChange={(e) => {
                    setAnswerText(e.target.value);
                    setAnswerError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                      handleSubmitAnswer();
                  }}
                />
                <div className="qi-afoot">
                  <span
                    className={`qi-achars${answerText.length > 900 ? " warn" : ""}`}
                  >
                    {answerText.length}/1000
                  </span>
                  <button
                    className="qi-asubmit"
                    onClick={handleSubmitAnswer}
                    disabled={answerSubmitting || !answerText.trim()}
                  >
                    {answerSubmitting ? "..." : "ตอบ"}
                  </button>
                </div>
                {answerError && <div className="qi-aerr">{answerError}</div>}
              </div>
            ) : (
              <div className="qi-alogin">
                <a href="/login">เข้าสู่ระบบ</a> เพื่อตอบคำถาม
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
