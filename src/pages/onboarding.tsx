import Link from "next/link";
import React from "react";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-xl rounded bg-white p-8 shadow">
        <h1 className="mb-4 text-2xl font-semibold">Welcome to Warungku</h1>
        <p className="mb-6">
          Let's get your shop set up. Create your first Warung, add products,
          and invite staff.
        </p>
        <div className="flex gap-2">
          <Link
            href="/dashboard"
            className="rounded bg-slate-800 px-4 py-2 text-white"
          >
            Go to Dashboard
          </Link>
          <Link href="/register" className="rounded border px-4 py-2">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
