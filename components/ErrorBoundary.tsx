"use client";
import { Component, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs"; // ← เพิ่ม import

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
};
type State = { hasError: boolean; eventId?: string };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ส่ง error ไป Sentry พร้อม context ว่าเกิดที่ component ไหน
    const eventId = Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        context: this.props.context ?? "unknown",
      },
    });
    // เก็บ eventId ไว้แสดงให้ user เห็น
    // ถ้า user ส่ง report มา support ใช้ ID นี้หาใน Sentry dashboard ได้เลย
    this.setState({ eventId });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: "16px",
              background: "#F5E8E8",
              border: "1px solid #DBA8A5",
              fontSize: 12,
              color: "#8B1A14",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div>เกิดข้อผิดพลาด กรุณารีเฟรชหน้า</div>
            {this.state.eventId && (
              <div style={{ fontSize: 10, marginTop: 4, color: "#9A9288" }}>
                Error ID: {this.state.eventId}
              </div>
            )}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
