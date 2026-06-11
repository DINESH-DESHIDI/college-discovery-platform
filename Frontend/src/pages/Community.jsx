import { useEffect, useState } from "react";
import { Plus, MessageCircle, ArrowRight, ThumbsUp, ArrowLeft, Send, Calendar, User, MessageSquare } from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  
  // New Question Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Answer Form State
  const [newAnswerText, setNewAnswerText] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    document.title = "Community Discussions — CollVerse";
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/discussions?limit=20");
      setQuestions(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load discussions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const viewDiscussionDetail = async (id) => {
    setLoadingDetail(true);
    setError("");
    try {
      const response = await api.get(`/api/discussions/${id}`);
      setSelectedQuestion(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load discussion details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isAuthenticated) {
      setError("Please log in to post a question.");
      return;
    }

    if (!title.trim() || !body.trim()) {
      setError("Please provide both a title and details for your question.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/api/discussions", {
        title,
        body,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      // Refresh question list
      await loadQuestions();
      setTitle("");
      setBody("");
      setTags("");
      setSuccessMessage("Your question was posted successfully.");
      
      // Auto scroll to list
      document.getElementById("threads-section")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      const message = err?.response?.data?.message || "Unable to post your question. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please sign in to reply.");
      return;
    }
    if (!newAnswerText.trim()) {
      setError("Reply body cannot be empty.");
      return;
    }
    setIsSubmittingAnswer(true);
    setError("");
    try {
      const response = await api.post(`/api/discussions/${selectedQuestion.id}/answers`, {
        body: newAnswerText,
      });
      
      // Append the new answer directly to our state
      setSelectedQuestion((prev) => ({
        ...prev,
        answers: [response.data.data, ...(prev.answers || [])],
      }));
      setNewAnswerText("");
      setSuccessMessage("Your reply was posted successfully!");
      
      // Update answers count in local list
      setQuestions((prevList) =>
        prevList.map((q) =>
          q.id === selectedQuestion.id
            ? { ...q, answers: [response.data.data, ...(q.answers || [])] }
            : q
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to submit reply. Please try again.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleUpvoteAnswer = async (answerId) => {
    if (!isAuthenticated) {
      setError("Please sign in to upvote replies.");
      return;
    }
    try {
      const response = await api.patch(`/api/discussions/answers/${answerId}/upvote`);
      const updatedAnswer = response.data.data;
      
      // Update in selectedQuestion state
      setSelectedQuestion((prev) => ({
        ...prev,
        answers: prev.answers.map((ans) =>
          ans.id === answerId ? { ...ans, upvotes: updatedAnswer.upvotes } : ans
        ),
      }));
    } catch (err) {
      console.error(err);
      setError("Could not register upvote.");
    }
  };

  if (selectedQuestion) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <button
          onClick={() => {
            setSelectedQuestion(null);
            setError("");
            setSuccessMessage("");
          }}
          className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to discussions
        </button>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <article className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elegant">
          <div className="flex flex-wrap gap-2 text-xs">
            {(selectedQuestion.tags || []).map((tag) => (
              <span key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">{tag}</span>
            ))}
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl text-foreground">
            {selectedQuestion.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 border-b border-border pb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{selectedQuestion.authorName || "Anonymous"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{new Date(selectedQuestion.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <p className="mt-6 whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-muted-foreground">
            {selectedQuestion.body}
          </p>
        </article>

        {/* Answers list */}
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Replies ({selectedQuestion.answers?.length || 0})
          </h2>

          <div className="mt-4 space-y-4">
            {selectedQuestion.answers?.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No replies yet. Be the first to answer!
              </div>
            ) : (
              (selectedQuestion.answers || []).map((answer) => (
                <div key={answer.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft hover:border-primary/20 transition-all duration-300">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {answer.body}
                    </p>
                    <button
                      onClick={() => handleUpvoteAnswer(answer.id)}
                      className="inline-flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-2.5 hover:bg-primary/5 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all duration-200"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="mt-1 text-xs font-bold">{answer.upvotes || 0}</span>
                    </button>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/40 pt-3">
                    <span className="font-bold text-foreground">{answer.authorName || "Anonymous User"}</span>
                    <span>•</span>
                    <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Submit reply form */}
        <section className="mt-8">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Post a reply</h3>
            {isAuthenticated ? (
              <form onSubmit={handlePostAnswer} className="space-y-4">
                <textarea
                  rows={4}
                  value={newAnswerText}
                  onChange={(e) => setNewAnswerText(e.target.value)}
                  placeholder="Share your advice, rank experience, or placement detail..."
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmittingAnswer}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75"
                >
                  {isSubmittingAnswer ? "Posting reply..." : <><Send className="h-4 w-4" /> Reply</>}
                </button>
              </form>
            ) : (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900/45 p-4 text-sm text-orange-700 dark:text-orange-400">
                Please sign in to share your knowledge and reply to this discussion.
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-elegant">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <MessageCircle className="h-3 w-3" /> Community Discussions
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Ask, answer, and learn from other students</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Join simplified discussion threads to get help on rank, college fit, placements, and admission strategy.
            </p>
          </div>
          <div className="rounded-3xl bg-background p-5 border border-border shadow-soft flex items-center gap-3 text-sm text-muted-foreground sm:max-w-xs">
            <MessageSquare className="h-6 w-6 text-primary shrink-0 animate-bounce" />
            <span>Engage with students to answer questions & clarify cutoffs.</span>
          </div>
        </div>

        {/* Submit Question Form */}
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 rounded-3xl border border-border bg-background p-6">
          <h2 className="font-display text-lg font-bold text-foreground">Have a question? Ask the community</h2>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-pulse">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {successMessage}
            </div>
          )}
          {!isAuthenticated && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
              Sign in to post your own question and receive faster answers from the community.
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-foreground">
              Question Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder="e.g. Which colleges fit my JEE Main rank?"
              />
            </label>
            <label className="block text-sm font-semibold text-foreground">
              Tags (comma separated)
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder="e.g. CSE, JEE Main, Placements"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold text-foreground">
            Details
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-3xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="Describe your rank, exam type, category, and goals in detail."
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-3xl bg-gradient-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-75"
          >
            <Plus className="mr-2 h-4 w-4" /> {isSubmitting ? "Posting…" : "Post question"}
          </button>
        </form>

        <section id="threads-section" className="mt-10">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Live discussions</p>
              <h2 className="mt-2 text-2xl font-bold">Most active conversations</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {questions.length} threads
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-border bg-background p-8 text-center text-sm text-muted-foreground">
                Loading discussions...
              </div>
            ) : questions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-background p-12 text-center text-muted-foreground">
                No discussions posted yet. Be the first to start a conversation!
              </div>
            ) : (
              questions.map((question) => (
                <article
                  key={question.id}
                  className="rounded-3xl border border-border bg-background p-6 shadow-sm hover:border-primary/30 hover:shadow-soft transition-all duration-300"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => viewDiscussionDetail(question.id)}>
                        {question.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{question.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {(question.tags || []).map((tag) => (
                          <span key={tag} className="rounded-full border border-border/80 px-2 py-0.5 font-semibold text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 mt-2 sm:mt-0">
                      <span className="flex items-center gap-1 font-semibold text-primary/80">
                        <MessageSquare className="h-4 w-4" /> {question.answers?.length ?? 0} answers
                      </span>
                      <span>By {question.authorName || "Anonymous"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm border-t border-border/40 pt-4">
                    <button
                      type="button"
                      onClick={() => viewDiscussionDetail(question.id)}
                      className="inline-flex items-center gap-2 font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      View discussion <ArrowRight className="h-4 w-4" />
                    </button>
                    {question.answers?.length > 0 ? (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 px-3 py-1 text-xs font-semibold">Active</span>
                    ) : (
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">Unanswered</span>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
