"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import QuestionItem from "./Questionitem";
import { sanitize } from "@/lib/sanitize";
import { QuestionSchema } from "@/lib/schemas";
import * as Sentry from "@sentry/nextjs";

export type Answer = {
  id: string;
  question_id: string;
  user_id: string;
  answer: string;
  is_owner_answer: boolean;
  upvotes: number;
  created_at: string;
  profiles: { name: string | null; avatar_url: string | null } | null;
};

export type Question = {
  id: string;
  portfolio_id: string;
  user_id: string;
  question: string;
  is_answered: boolean;
  upvotes: number;
  created_at: string;
  profiles: { name: string | null; avatar_url: string | null } | null;
  portfolio_answers: Answer[]; //store answer array
};

// for type inference make sure the profile type matches the database schema
type RawProfile =
  | { name: string | null; avatar_url: string | null }
  | { name: string | null; avatar_url: string | null }[]
  | null;

type RawAnswer = Omit<Answer, "profiles"> & {
  profiles: RawProfile;
};

type Props = {
  portfolioId: string;
  ownerId: string; // port owner user id
};

export default function QASection({ portfolioId, ownerId }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]); //store question array
  const [userId, setUserId] = useState<string | null>(null); //current user

  const [questionText, setQuestionText] = useState("");
  const [submitError, setSubmitError] = useState("");

  //for state checking
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  //for question
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null);
    });

    // for state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUserId(session?.user.id ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  //fetch questions on mount
  const fetchQuestions = useCallback(
    async (pageNum = 0, append = false): Promise<void> => {
      setLoading(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // question nested select
      const { data, error, count } = await supabase
        .from("portfolio_questions")
        .select(
          `
          id,
          portfolio_id,
          user_id,
          question,
          is_answered,
          upvotes,
          created_at,
          profiles ( name, avatar_url ),
          portfolio_answers (
            id,
            question_id,
            user_id,
            answer,
            is_owner_answer,
            upvotes,
            created_at,
            profiles ( name, avatar_url )
          )
        `,
          { count: "exact" },
        )
        .eq("portfolio_id", portfolioId)
        .order("upvotes", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.log("fetchQuestions error:", error);
        Sentry.captureException(error, {
          tags: {
            section: "QASection",
            action: "fetchQuestions",
          },
          extra: {
            portfolioId,
            pageNum,
          },
        });
        setLoading(false);
        return;
      }

      // normalize profile data
      const normalized = (data ?? []).map((q) => ({
        ...q,

        profiles: Array.isArray(q.profiles)
          ? (q.profiles[0] ?? null)
          : q.profiles,

        portfolio_answers: (q.portfolio_answers ?? []).map((a: RawAnswer) => ({
          ...a,

          profiles: Array.isArray(a.profiles)
            ? (a.profiles[0] ?? null)
            : a.profiles,
        })),
      }));

      // replace or append
      if (append) {
        setQuestions((prev) => [...prev, ...(normalized as Question[])]);
      } else {
        setQuestions(normalized as Question[]);
      }

      // has more?
      setHasMore((count ?? 0) > (pageNum + 1) * PAGE_SIZE);

      // fetch liked questions
      if (userId) {
        const likeQuestionIds = (data ?? []).map((q) => q.id);

        if (likeQuestionIds.length > 0) {
          const { data: likes } = await supabase
            .from("question_likes")
            .select("question_id")
            .eq("user_id", userId)
            .in("question_id", likeQuestionIds);

          // merge liked ids
          setLikedIds((prev) => {
            const next = new Set(prev);

            likes?.forEach((l) => {
              next.add(l.question_id);
            });

            return next;
          });
        }
      }

      setLoading(false);
    },
    [portfolioId, userId],
  );
  useEffect(() => {
    const load = async () => {
      await fetchQuestions(0, false);
    };

    load();
  }, [portfolioId, userId, fetchQuestions]);

  async function handleLoadMore() {
    const nextPage = page + 1;

    setPage(nextPage);

    await fetchQuestions(nextPage, true);
  }

  //new question submiting function
  async function handleSubmitQuestion() {
    const rawText = questionText.trim();
    const text = sanitize.question(rawText);

    if (!text || !userId) return;
    if (text.length > 500) {
      setSubmitError("คำถามต้องไม่เกิน 500 ตัวอักษร");
      return;
    }

    const result = QuestionSchema.safeParse({
      question: text,
      portfolio_id: portfolioId,
      user_id: userId,
    });

    if (!result.success) {
      // result.error.errors เป็น array ของทุก error
      const firstError = result.error.issues[0];
      setSubmitError(firstError.message);
      return;
    }

    const { question } = result.data;

    setSubmitting(true);
    setSubmitError("");

    //inserted and selected for adding to Question array
    const { data: inserted, error } = await supabase
      .from("portfolio_questions")
      .insert({
        portfolio_id: portfolioId,
        user_id: userId,
        question: question,
      })
      .select(
        `
        id, portfolio_id, user_id, question,
        is_answered, upvotes, created_at,
        profiles ( name, avatar_url )
      `,
      )
      .single();

    if (error || !inserted) {
      Sentry.captureException(error, {
        tags: {
          section: "QASection",
          action: "submitQuestion",
        },
        extra: {
          portfolioId,
          userId,
        },
      });
      setSubmitError("ส่งคำถามไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
      return;
    }

    const newQ: Question = {
      ...inserted,
      profiles: Array.isArray(inserted.profiles)
        ? (inserted.profiles[0] ?? null)
        : (inserted.profiles ?? null),
      portfolio_answers: [],
    };

    setQuestions((prev) => [newQ, ...prev]); // prepend new question to the list
    setQuestionText("");
    setSubmitting(false);
  }

  // Callback from QuestionItem for DB delete
  // Returns true if delete was successful, false otherwise
  // return boolean to update state in parent component(QuestionItem)
  async function handleDeleteQuestion(questionId: string): Promise<boolean> {
    const { error } = await supabase
      .from("portfolio_questions")
      .delete()
      .eq("id", questionId)
      .eq("user_id", userId as string); // RLS guard

    if (error) {
      console.error("deleteQuestion:", error.message);
      Sentry.captureException(error, {
        tags: {
          section: "QASection",
          action: "deleteQuestion",
        },
        extra: {
          questionId,
          userId,
        },
      });
      return false; //fail
    }

    // successful delete -> remove question from list
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    return true;
  }

  // add answer callback from QuestionItem after insertion success
  // updates questions state to mark question as answered and add new answer
  function handleAnswerAdded(questionId: string, newAnswer: Answer) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              is_answered: true, // is answered after adding answer
              portfolio_answers: [...q.portfolio_answers, newAnswer],
            }
          : q,
      ),
    );
  }

  // callback from AnswerItem to remove answer and update question state
  function handleAnswerDeleted(questionId: string, answerId: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const remaining = q.portfolio_answers.filter((a) => a.id !== answerId); // for remaining answers
        return {
          ...q,
          portfolio_answers: remaining,
          is_answered: remaining.length > 0,
        };
      }),
    );
  }

  // updates question state to sync upvote count from QuestionItem
  function handleLikeChange(
    questionId: string,
    newCount: number,
    liked: boolean, // true = เพิ่ง like, false = เพิ่ง unlike
  ) {
    // update count ใน questions list
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, upvotes: newCount } : q)),
    );
    // update likedIds set
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (liked) next.add(questionId);
      else next.delete(questionId);
      return next;
    });
  }

  return (
    <>
      <style>{`
          .qa-wrap { display: flex; flex-direction: column; gap: 10px; animation: fadeUp 0.4s ease 0.15s both; }

          /* header */
          .qa-hd { display: flex; align-items: center; gap: 10px; }
          .qa-dot { width: 5px; height: 5px; background: #C4581F; flex-shrink: 0; }
          .qa-lbl {
            font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase;
            color: #9A9288; font-weight: 500; white-space: nowrap;
            font-family: 'DM Sans', sans-serif;
          }
          .qa-line { flex: 1; height: 1px; background: #E3DDD0; }
          .qa-count {
            font-size: 11px; color: #C4581F;
            background: #F5EDDF; border: 1px solid #D4AA78;
            padding: 1px 8px; font-family: 'DM Sans', sans-serif;
          }

          /* ask form */
          .qa-form { background: #F5F0E8; border: 1px solid #D8D1C2; padding: 14px; }
          .qa-form-lbl {
            display: block; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
            color: #6B6560; font-weight: 500; margin-bottom: 8px;
            font-family: 'DM Sans', sans-serif;
          }
          .qa-textarea {
            width: 100%; resize: none;
            background: #EDE8DC; border: 1px solid #D8D1C2; border-bottom: 2px solid #C8BFA8;
            padding: 9px 11px; font-size: 14px;
            line-height: 1.8; color: #1A1714;
            outline: none; font-family: 'DM Sans', sans-serif;
            transition: border-color 0.2s, background 0.2s;
          }
          .qa-textarea:focus { border-color: #C4581F; border-bottom-color: #C4581F; background: #F5F0E8; }
          .qa-textarea::placeholder { color: #9A9288; }
          .qa-form-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
          .qa-chars { font-size: 11px; color: #C8BFA8; font-family: 'DM Mono', monospace; }
          .qa-chars.warn { color: #C4581F; }
          .qa-send {
            background: #1A1714; color: #F5F0E8; border: none; padding: 7px 16px;
            font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
            cursor: pointer; font-family: 'DM Sans', sans-serif;
            transition: background 0.2s, transform 0.15s;
          }
          .qa-send:hover { background: #C4581F; transform: translateY(-1px); }
          .qa-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

          /* login prompt */
          .qa-login {
            background: #EDE8DC; border: 1px dashed #C8BFA8; padding: 14px;
            text-align: center; font-size: 13px; line-height: 1.8; color: #9A9288;
            font-family: 'DM Sans', sans-serif;
          }
          .qa-login a { color: #C4581F; text-decoration: none; font-weight: 500; }

          /* error */
          .qa-err {
            font-size: 10px; color: #8B1A14;
            background: #F5E8E8; border: 1px solid #DBA8A5;
            padding: 6px 10px; margin-top: 6px; font-family: 'DM Sans', sans-serif;
          }

          /* skeleton */
          .qa-skel { display: flex; flex-direction: column; gap: 8px; }
          .qa-skel-card { background: #EDE8DC; border: 1px solid #D8D1C2; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
          .qa-skel-line { height: 10px; background: #E3DDD0; animation: pulse 1.8s ease infinite; border-radius: 2px; }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }

          /* empty */
          .qa-empty {
            background: #EDE8DC; border: 1px dashed #D8D1C2; padding: 28px;
            text-align: center; font-size: 13px; color: #9A9288;
            font-family: 'DM Sans', sans-serif; line-height: 1.8;
          }

          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        `}</style>

      <div className="qa-wrap">
        {/* section header */}
        <div className="qa-hd">
          <div className="qa-dot" />
          <span className="qa-lbl">ถาม — ตอบ</span>
          <div className="qa-line" />
          {questions.length > 0 && (
            <span className="qa-count">{questions.length}</span>
          )}
        </div>

        {/* ask form หรือ login prompt */}
        {userId ? (
          <div className="qa-form">
            <label className="qa-form-lbl">ถามคำถามเจ้าของพอร์ต</label>
            <textarea
              className="qa-textarea"
              placeholder="เช่น ผลงานนี้เก็บยังไง? ใช้เวลานานไหม? มีเทคนิคอะไรแนะนำบ้าง?"
              value={questionText}
              rows={3}
              maxLength={500}
              onChange={(e) => {
                setQuestionText(e.target.value);
                setSubmitError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                  handleSubmitQuestion();
              }}
            />
            <div className="qa-form-foot">
              <span
                className={`qa-chars${questionText.length > 450 ? " warn" : ""}`}
              >
                {questionText.length}/500
              </span>
              <button
                className="qa-send"
                onClick={handleSubmitQuestion}
                disabled={submitting || !questionText.trim()}
              >
                {submitting ? "กำลังส่ง..." : "ส่งคำถาม"}
              </button>
            </div>
            {submitError && <div className="qa-err">{submitError}</div>}
          </div>
        ) : (
          <div className="qa-login">
            <a href="/login">เข้าสู่ระบบ</a> เพื่อถามคำถามเจ้าของพอร์ต
          </div>
        )}

        {/* question list */}
        {loading ? (
          <div className="qa-skel">
            {[0, 1].map((i) => (
              <div key={i} className="qa-skel-card">
                <div className="qa-skel-line" style={{ width: "35%" }} />
                <div className="qa-skel-line" style={{ width: "75%" }} />
                <div className="qa-skel-line" style={{ width: "55%" }} />
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="qa-empty">
            ยังไม่มีคำถาม
            <br />
            เป็นคนแรกที่ถามเจ้าของพอร์ตได้เลย
          </div>
        ) : (
          <>
            {/* question list */}
            {questions.map((q, idx) => (
              <QuestionItem
                key={q.id}
                question={q}
                currentUserId={userId}
                ownerId={ownerId}
                animationDelay={idx * 0.05}
                isLiked={likedIds.has(q.id)}
                onDelete={handleDeleteQuestion}
                onAnswerAdded={handleAnswerAdded}
                onAnswerDeleted={handleAnswerDeleted}
                onLikeChange={handleLikeChange}
              />
            ))}

            {/* load more button */}
            {hasMore && !loading && (
              <button
                onClick={handleLoadMore}
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "#1A1714",
                  color: "#F5F0E8",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                โหลดเพิ่ม
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
