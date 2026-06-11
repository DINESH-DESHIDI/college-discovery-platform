import { useState, useEffect } from "react";
import { Send, Sparkles, Search } from "lucide-react";
import api from "@/utils/api";

export default function Assistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "AI College Assistant — CollVerse";
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    setError(null);

    try {
      const response = await api.post("/api/assistant", { question });
      setAnswer(response.data.data.answer);
    } catch (err) {
      setError("Unable to get an answer right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-elegant">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">AI Assistant</p>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Ask about colleges, rank, fees or placements</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Get instant guidance from the assistant using real college data and admission trends.
            </p>
          </div>
          <div className="rounded-3xl bg-background p-5 shadow-soft">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-3xl border border-border bg-background p-6">
          <label className="block text-sm font-medium text-foreground">
            Ask your question
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="e.g. Which college is better for CSE with 90% placements?"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-3xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant"
          >
            <Send className="mr-2 h-4 w-4" /> Ask assistant
          </button>
        </form>

        {loading && (
          <div className="mt-6 rounded-3xl bg-background p-6 text-sm text-muted-foreground">Thinking... please wait.</div>
        )}

        {error && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        )}

        {answer && (
          <div className="mt-6 rounded-3xl border border-border bg-background p-6">
            <p className="text-sm text-muted-foreground">Answer from the AI assistant</p>
            <div className="mt-3 whitespace-pre-line text-sm text-foreground">{answer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
