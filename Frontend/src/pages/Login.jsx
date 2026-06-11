import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Field";
import { SocialDivider } from "@/components/auth/SocialDivider";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Log in — CollVerse";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      navigate("/colleges");
    } catch (error) {
      setServerError(error.response?.data?.message || "Unable to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to access your shortlist and personalized recommendations."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {serverError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            error={errors.email}
          />
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <div
              className={`flex items-center gap-2 rounded-xl border bg-background px-3 transition-colors ${
                errors.password
                  ? "border-destructive"
                  : "border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
              }`}
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
              <input type="checkbox" className="rounded border-border accent-primary cursor-pointer" /> Remember me
            </label>
            <a href="#" className="font-medium text-primary hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Signing in..." : "Log in"}
          </button>

          <SocialDivider />
          <SocialButtons />
        </form>
    </AuthShell>
  );
}
