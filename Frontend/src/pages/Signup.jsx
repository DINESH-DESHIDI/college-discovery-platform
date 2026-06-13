import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Lock, User } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/auth/Field";
import { SocialDivider } from "@/components/auth/SocialDivider";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Sign up — CollVerse";
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const next = {};
    if (name.trim().length < 2) next.name = "Please enter your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 8) next.password = "Use at least 8 characters";
    if (!agree) next.agree = "You must accept the terms";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signup({ name, email, password });
      navigate("/colleges");
    } catch (error) {
      setServerError(
        error.response?.data?.message || "Unable to create account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join 2M+ students discovering their perfect college fit."
      footer={
        <>
          Already a member?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
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
          label="Full name"
          icon={<User className="h-4 w-4" />}
          type="text"
          value={name}
          onChange={setName}
          placeholder="Aarav Sharma"
          error={errors.name}
        />
        <Field
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
        />
        <Field
          label="Password"
          icon={<Lock className="h-4 w-4" />}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          error={errors.password}
        />

        <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 rounded border-border accent-primary cursor-pointer"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-primary hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.agree && <p className="-mt-3 text-xs text-destructive">{errors.agree}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <SocialDivider />
        <SocialButtons />
      </form>
    </AuthShell>
  );
}
