"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DemoShopifySyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function syncOrders() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/shopify/demo-sync", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Sync failed.");
      }

      setMessage(
        `Imported ${result.imported} order lines; ` +
        `${result.alreadyImported} already existed.`
      );

      router.refresh();

      // The dashboard loads sales in a client-side effect,
      // so refresh the current page to reload its sales data.
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sync failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        onClick={syncOrders}
        disabled={loading}
        className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
      >
        {loading ? "Syncing demo orders..." : "Sync demo Shopify orders"}
      </button>

      {message && (
        <p role="status" className="mt-2 text-sm text-slate-600">
          {message}
        </p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Simulation only — no live store connection.
      </p>
    </div>
  );
}