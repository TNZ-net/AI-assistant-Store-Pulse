"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#F7F7F2] md:grid md:grid-cols-2">
      {/* Brand panel */}
      <section className="relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-[#102331] px-8 py-8 text-white sm:px-12 sm:py-10 md:min-h-screen lg:px-16">
        <div className="relative z-10">
          <a href="/login" className="inline-flex items-center gap-3">
            <span className="text-3xl font-bold text-[#75D6C1]">
              ⌁
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              Store Pulse
            </span>
          </a>

          <div className="mt-12 max-w-md md:mt-24 lg:mt-32">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#75D6C1]">
              Inventory intelligence
            </p>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Smarter inventory.
              <br />
              <span className="text-[#75D6C1]">
                Healthier margins.
              </span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-[#D1DCE1] sm:text-base">
              Get a clearer view of your stock, sales and inventory
              performance, all in one place.
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -left-10 h-40 w-[120%] opacity-50"
        >
          <svg
            viewBox="0 0 600 160"
            fill="none"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 85 C100 10 140 150 245 80 S400 30 600 95"
              stroke="#238D92"
              strokeWidth="2"
            />
            <path
              d="M0 105 C100 30 150 160 260 100 S440 50 600 115"
              stroke="#75D6C1"
              strokeWidth="1.2"
              opacity="0.7"
            />
            <path
              d="M0 125 C120 50 160 170 280 120 S460 80 600 135"
              stroke="#238D92"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>
        </div>

        <p className="relative z-10 mt-12 text-xs text-[#C0CDD3]">
          Store Pulse · Inventory management
        </p>
      </section>

      {/* Login area */}
      <section className="flex min-h-[520px] items-center justify-center px-5 py-12 sm:px-10 md:min-h-screen lg:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#168C80]">
              Welcome back
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#172B3A]">
              Sign in
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#53666F]">
              Access your Store Pulse inventory dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E1E6DF] bg-white p-6 shadow-[0_8px_35px_rgba(23,43,58,0.06)] sm:p-8">
            <form onSubmit={signIn} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#263B48]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#CBD5D1] bg-white px-4 py-3 text-sm text-[#172B3A] outline-none transition placeholder:text-[#7B898D] focus:border-[#168C80] focus:ring-4 focus:ring-[#168C80]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#263B48]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-[#CBD5D1] bg-white px-4 py-3 text-sm text-[#172B3A] outline-none transition placeholder:text-[#7B898D] focus:border-[#168C80] focus:ring-4 focus:ring-[#168C80]/10"
                />
              </div>

              {message && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[#A52727]"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#102331] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#193849] focus:outline-none focus:ring-4 focus:ring-[#168C80]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in to Store Pulse"}
              </button>
            </form>

            <div className="mt-6 border-t border-[#E8ECE7] pt-5">
              <p className="text-center text-xs leading-5 text-[#53666F]">
                Your inventory workspace, all in one place.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#53666F]">
            Store Pulse · Inventory intelligence
          </p>
        </div>
      </section>
    </main>
  );
}
