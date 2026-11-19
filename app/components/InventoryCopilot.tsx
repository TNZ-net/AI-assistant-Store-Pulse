"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Which products need restocking first?",
  "Summarize my recent sales.",
  "Which products have the lowest stock?",
];

export default function InventoryCopilot() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askCopilot(text: string) {
    const prompt = text.trim();

    if (!prompt || loading) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: prompt },
    ]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "The copilot request failed.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.answer },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the AI copilot."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xl">
          ✦
        </div>
        <div>
          <h2 className="text-xl font-bold">Inventory Copilot</h2>
          <p className="mt-1 text-sm text-slate-500">
            AI-powered inventory insights, using your store data.
          </p>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => askCopilot(suggestion)}
              disabled={loading}
              className="rounded-full border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:border-teal-500 hover:bg-teal-50 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div
          aria-live="polite"
          className="mt-5 max-h-[420px] space-y-4 overflow-y-auto"
        >
          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`rounded-xl p-4 ${
                message.role === "user"
                  ? "ml-6 bg-slate-100"
                  : "mr-3 border border-teal-100 bg-teal-50"
              }`}
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {message.role === "user" ? "You" : "Store Pulse AI"}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {message.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p role="status" className="mt-4 text-sm text-slate-500">
          Analyzing your inventory...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void askCopilot(question);
        }}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={1000}
          placeholder="Ask about your inventory..."
          aria-label="Ask the inventory copilot"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>

      <p className="mt-3 text-xs text-slate-400">
        Recommendations only. The copilot does not change stock or place orders.
      </p>
    </section>
  );
}
