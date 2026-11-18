import { useEffect, useState } from "react";
import { Comments } from "@fuma-comment/react";
import "@fuma-comment/react/style.css";

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(textOf).join(" ");
  if (content && typeof content === "object") {
    const c = content as Record<string, unknown>;
    return [c.text, c.content].filter(Boolean).map(textOf).join(" ");
  }
  return "";
}

function ReportBox({ page }: { page: string }) {
  const [items, setItems] = useState<{ id: string; label: string }[]>([]);
  const [pick, setPick] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch(`/api/comments/${page}`)
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : (d.comments ?? d.data ?? []);
        setItems(
          list.map(
            (c: {
              id: string;
              author?: { name?: string };
              content: unknown;
            }) => ({
              id: String(c.id),
              label: `#${c.id} ${c.author?.name ?? "anon"} — ${textOf(c.content).slice(0, 60)}`,
            })
          )
        );
      })
      .catch(() => {});
  }, [page]);
  if (!items.length) return null;
  return (
    <details
      style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--muted)" }}
    >
      <summary style={{ cursor: "pointer" }}>Report a comment</summary>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <select
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          aria-label="Pick a comment"
        >
          <option value="">Pick one…</option>
          {items.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
        <button
          onClick={async () => {
            if (!pick) return;
            const r = await fetch("/api/comments/report", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ id: Number(pick) }),
            });
            setMsg(r.ok ? "Reported — thanks." : "Report failed.");
          }}
        >
          Report
        </button>
        {msg ? <span>{msg}</span> : null}
      </div>
    </details>
  );
}

export default function Discussion({ page }: { page: string }) {
  return (
    <>
      <Comments
        page={page}
        apiUrl="/api/comments"
        auth={{
          type: "api",
          signIn: () => {
            window.location.href = "/auth/login";
          },
        }}
      />
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--muted)",
          marginTop: "0.5rem",
        }}
      >
        No account needed — max 500 characters, posts with links are held for
        review.
      </p>
      <ReportBox page={page} />
    </>
  );
}
