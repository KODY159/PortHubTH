"use client";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import type { Answer } from "./QASection";

type Props = {
  answer: Answer;
  currentUserId: string | null;
  onDelete: (answerId: string) => void;
};

export default function AnswerItem({ answer, currentUserId, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  const isOwnerOfAnswer = currentUserId === answer.user_id;
  const authorName = answer.profiles?.name ?? "Anonymous";

  async function handleDelete() {
    if (!isOwnerOfAnswer || deleting) return;
    const confirmed = confirm("ลบคำตอบนี้?");
    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase
      .from("portfolio_answers")
      .delete()
      .eq("id", answer.id)
      .eq("user_id", currentUserId as string);

    if (error) {
      console.error("deleteAnswer:", error.message);
      setDeleting(false);
      return;
    }

    onDelete(answer.id);
    // component จะ unmount เพราะ parent เอาออกจาก list
  }

  return (
    <>
      <style>{`
        .ai-wrap {
          background: #F5F0E8;
          border: 1px solid #D8D1C2;
          border-left: 3px solid #D8D1C2;
          padding: 10px 12px;
          animation: aiFade 0.3s ease both;
          transition: border-color 0.2s;
        }
        .ai-wrap.owner {
          border-left-color: #C4581F;
          background: #FDF8F2;
        }
        .ai-owner-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
          background: #F5EDDF; color: #C4581F; border: 1px solid #D4AA78;
          padding: 2px 8px; margin-bottom: 8px;
          font-family: 'DM Sans', sans-serif;
        }
        .ai-owner-dot { width: 5px; height: 5px; border-radius: 50%; background: #C4581F; }
        .ai-head { display: flex; align-items: center; gap: 7px; margin-bottom: 6px; }
        .ai-av {
          width: 20px; height: 20px; border-radius: 50%;
          background: #1A1714; color: #F5F0E8; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif; font-size: 8px; font-weight: 600;
        }
        .ai-name { font-size: 12px; font-weight: 500; color: #2E2B26; font-family: 'DM Sans', sans-serif; }
        .ai-date { font-size: 11px;
          color: #7B746B; font-family: 'DM Sans', sans-serif; margin-left: auto; }
        .ai-text {
          font-size: 14px;
          line-height: 1.9;
          color: #2E2B26;
          font-family: 'DM Sans', sans-serif;
          word-break: break-word; white-space: pre-wrap; margin: 0;
        }
        .ai-foot { display: flex; justify-content: flex-end; margin-top: 6px; }
        .ai-del {
          background: none; border: none; cursor: pointer;
          font-size: 9px; color: #C8BFA8;
          font-family: 'DM Sans', sans-serif; padding: 2px 4px;
          transition: color 0.18s;
        }
        .ai-del:hover:not(:disabled) { color: #8B1A14; }
        .ai-del:disabled { opacity: 0.4; cursor: not-allowed; }
        @keyframes aiFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className={`ai-wrap${answer.is_owner_answer ? " owner" : ""}`}>
        {answer.is_owner_answer && (
          <div className="ai-owner-badge">
            <span className="ai-owner-dot" />
            เจ้าของพอร์ต
          </div>
        )}

        <div className="ai-head">
          {answer.profiles?.avatar_url ? (
            <Image
              src={answer.profiles.avatar_url}
              alt={authorName}
              width={20}
              height={20}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          ) : (
            <div className="ai-av">{authorName.charAt(0).toUpperCase()}</div>
          )}
          <span className="ai-name">{authorName}</span>
          <span className="ai-date">
            {new Date(answer.created_at).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        <p className="ai-text">{answer.answer}</p>

        {isOwnerOfAnswer && (
          <div className="ai-foot">
            <button
              className="ai-del"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "กำลังลบ..." : "ลบ"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
