"use client";
import DemoShopifySyncButton from "@/app/components/DemoShopifySyncButton";
import { useEffect, useMemo, useState } from "react";
import SignOutButton from "@/app/components/SignOutButton";
import InventoryCopilot from "@/app/components/InventoryCopilot";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  stock: number;
  threshold: number;
  price: number;
};

type StockFilter = "all" | "low" | "out";

type Sale = {
  id: number;
  product_id: number | null;
  quantity: number;
  unit_price: number;
  source: string;
  sold_at: string;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState("");

  const [copilotOpen, setCopilotOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch {
        setError("Could not load inventory. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadSales() {
      try {
        setSalesLoading(true);
        setSalesError("");

        const response = await fetch("/api/sales");

        if (!response.ok) {
          throw new Error("Could not load sales");
        }

        const data: Sale[] = await response.json();
        setSales(data);
      } catch {
        setSalesError("Sales data unavailable");
      } finally {
        setSalesLoading(false);
      }
    }

    loadSales();
  }, []);

  const lowStockCount = products.filter(
    (p) => p.stock > 0 && p.stock <= p.threshold
  ).length;

  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const inventoryValue = products.reduce(
    (total, p) => total + p.stock * p.price,
    0
  );

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + Number(sale.unit_price) * sale.quantity,
    0
  );

  const totalSales = sales.length;

  const totalUnitsSold = sales.reduce(
    (sum, sale) => sum + sale.quantity,
    0
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term);

      const matchesFilter =
        filter === "all" ||
        (filter === "low" && p.stock > 0 && p.stock <= p.threshold) ||
        (filter === "out" && p.stock === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-[#172B3A] md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-[#102331] px-5 py-7 text-white md:flex">
        <div>
          <a href="#overview" className="mb-10 flex items-center gap-3 px-2">
            <span className="text-2xl font-bold text-[#75D6C1]">⌁</span>
            <span className="text-xl font-bold tracking-tight">
              Store Pulse
            </span>
          </a>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-2">
            <SidebarLink href="#overview" icon="⌂" label="Overview" active />
            <SidebarLink href="#inventory" icon="▤" label="Inventory" />
            <SidebarLink href="#sales" icon="▧" label="Sales" />
            <button
              onClick={() => setCopilotOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <span className="text-lg">✧</span>
              Ask your store
            </button>
          </nav>
        </div>

        <div className="border-t border-white/10 pt-5">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE9E4] font-bold text-[#102331]">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold">Store account</p>
              <p className="text-xs text-slate-400">Inventory workspace</p>
            </div>
          </div>

          <div className="rounded-xl px-2 py-2 transition hover:bg-white/10">
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Mobile header */}
        <div className="flex items-center justify-between bg-[#102331] px-5 py-4 text-white md:hidden">
          <a href="#overview" className="text-lg font-bold">
            <span className="mr-2 text-[#75D6C1]">⌁</span>
            Store Pulse
          </a>
          <SignOutButton />
        </div>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {/* Page heading */}
          <header
            id="overview"
            className="mb-7 flex flex-col justify-between gap-5 border-b border-[#DDE2DC] pb-6 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#74868B]">
                Inventory intelligence
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#172B3A]">
                Overview
              </h1>
              <p className="mt-1 text-sm text-[#74868B]">
                Monitor your stock, sales and inventory performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-2 text-xs text-[#74868B]">
                <span className="h-2 w-2 rounded-full bg-[#168C80]" />
                Live inventory
              </span>
              <DemoShopifySyncButton />
            </div>
          </header>

          {error && (
            <p
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {/* Inventory summary */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total products"
              value={String(products.length)}
              detail="Products in your inventory"
              icon="▤"
            />
            <SummaryCard
              label="Low stock"
              value={String(lowStockCount)}
              detail="Products needing attention"
              icon="!"
              accent="orange"
            />
            <SummaryCard
              label="Out of stock"
              value={String(outOfStockCount)}
              detail="Products with zero stock"
              icon="!"
              accent="red"
            />
            <SummaryCard
              label="Inventory value"
              value={`$${inventoryValue.toFixed(2)}`}
              detail="Based on current stock and price"
              icon="$"
            />
          </section>

          {/* Sales summary */}
          <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Recorded revenue"
              value={
                salesLoading
                  ? "Loading..."
                  : salesError
                    ? "Unavailable"
                    : `$${totalRevenue.toFixed(2)}`
              }
              detail="From recorded sales"
              icon="$"
            />
            <SummaryCard
              label="Sales records"
              value={
                salesLoading
                  ? "Loading..."
                  : salesError
                    ? "—"
                    : String(totalSales)
              }
              detail="Recorded transactions"
              icon="▧"
            />
            <SummaryCard
              label="Units sold"
              value={
                salesLoading
                  ? "Loading..."
                  : salesError
                    ? "—"
                    : String(totalUnitsSold)
              }
              detail="Total units in recorded sales"
              icon="↗"
            />
          </section>

          {/* Inventory table */}
          <section
            id="inventory"
            className="mt-7 rounded-2xl border border-[#E5E8E1] bg-white p-5 shadow-[0_3px_14px_rgba(23,43,58,0.04)] sm:p-6"
          >
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-[#172B3A]">
                  Inventory
                </h2>
                <p className="mt-1 text-xs text-[#829096]">
                  {filteredProducts.length} products shown
                </p>
              </div>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, SKU, category..."
                aria-label="Search products"
                className="w-full rounded-xl border border-[#DDE3DF] bg-[#FBFCFA] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#9AA6A5] focus:border-[#168C80] focus:ring-2 focus:ring-[#168C80]/10 lg:max-w-sm"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["all", "All products"],
                  ["low", "Low stock"],
                  ["out", "Out of stock"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    filter === value
                      ? "bg-[#102331] text-white"
                      : "bg-[#F0F3F0] text-[#647579] hover:bg-[#E5EBE6]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-[#829096]">
                Loading inventory...
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E7EBE6] text-[10px] uppercase tracking-wider text-[#829096]">
                      <th className="px-3 py-3 font-semibold">Product</th>
                      <th className="px-3 py-3 font-semibold">Category</th>
                      <th className="px-3 py-3 font-semibold">Stock</th>
                      <th className="px-3 py-3 font-semibold">Price</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => {
                      const out = p.stock === 0;
                      const low = !out && p.stock <= p.threshold;

                      return (
                        <tr
                          key={p.id}
                          className="border-b border-[#F0F2EE] transition hover:bg-[#FAFBF8]"
                        >
                          <td className="px-3 py-4">
                            <p className="font-semibold text-[#263B48]">
                              {p.name}
                            </p>
                            <p className="mt-1 text-xs text-[#98A4A3]">
                              {p.sku}
                            </p>
                          </td>
                          <td className="px-3 py-4 text-[#647579]">
                            {p.category}
                          </td>
                          <td className="px-3 py-4 font-medium text-[#263B48]">
                            {p.stock}
                          </td>
                          <td className="px-3 py-4 text-[#647579]">
                            ${Number(p.price).toFixed(2)}
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                                out
                                  ? "bg-red-50 text-[#C94332]"
                                  : low
                                    ? "bg-orange-50 text-[#B86A19]"
                                    : "bg-[#E8F4EF] text-[#16805F]"
                              }`}
                            >
                              {out
                                ? "Out of stock"
                                : low
                                  ? "Low stock"
                                  : "Healthy"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {!loading && filteredProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-10 text-center text-sm text-[#829096]"
                        >
                          No matching products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Recent sales */}
          <section
            id="sales"
            className="mt-6 rounded-2xl border border-[#E5E8E1] bg-white p-5 shadow-[0_3px_14px_rgba(23,43,58,0.04)] sm:p-6"
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#172B3A]">
                Recent sales
              </h2>
              <p className="mt-1 text-xs text-[#829096]">
                Your recorded sales activity
              </p>
            </div>

            {salesLoading ? (
              <p className="py-6 text-sm text-[#829096]">
                Loading sales...
              </p>
            ) : salesError ? (
              <p role="alert" className="py-6 text-sm text-red-600">
                {salesError}
              </p>
            ) : sales.length === 0 ? (
              <p className="py-6 text-sm text-[#829096]">
                No sales recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E7EBE6] text-[10px] uppercase tracking-wider text-[#829096]">
                      <th className="px-3 py-3 font-semibold">Sale time</th>
                      <th className="px-3 py-3 font-semibold">Product</th>
                      <th className="px-3 py-3 font-semibold">Quantity</th>
                      <th className="px-3 py-3 font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => {
                      const product = products.find(
                        (p) => p.id === sale.product_id
                      );

                      return (
                        <tr
                          key={sale.id}
                          className="border-b border-[#F0F2EE] hover:bg-[#FAFBF8]"
                        >
                          <td className="whitespace-nowrap px-3 py-4 text-xs text-[#647579]">
                            {new Date(sale.sold_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-4 font-medium text-[#263B48]">
                            {product?.name ?? "Product unavailable"}
                          </td>
                          <td className="px-3 py-4 text-[#647579]">
                            {sale.quantity}
                          </td>
                          <td className="px-3 py-4 font-semibold text-[#263B48]">
                            $
                            {(
                              Number(sale.unit_price) * sale.quantity
                            ).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="mt-7 border-t border-[#DDE2DC] pt-5 text-xs text-[#8B9998]">
            Inventory data supplied by Supabase · Restocking is not yet enabled
          </footer>
        </main>
      </div>

      {/* Floating copilot launcher */}
      <button
        type="button"
        onClick={() => setCopilotOpen((open) => !open)}
        aria-label={copilotOpen ? "Close AI Copilot" : "Open AI Copilot"}
        aria-expanded={copilotOpen}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#102331] text-2xl text-[#75D6C1] shadow-xl ring-4 ring-white transition hover:scale-105 hover:bg-[#193849]"
      >
        {copilotOpen ? "×" : "✧"}
      </button>

      {/* Floating copilot panel */}
      {copilotOpen && (
        <div className="fixed bottom-24 right-4 z-40 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#DCE4DF] bg-white shadow-2xl sm:right-6">
          <div className="flex items-center justify-between bg-[#102331] px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl text-[#75D6C1]">✧</span>
              <span className="font-semibold">AI Copilot</span>
            </div>
            <button
              type="button"
              onClick={() => setCopilotOpen(false)}
              aria-label="Close AI Copilot"
              className="rounded-lg px-2 py-1 text-xl text-slate-300 hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="max-h-[min(70vh,650px)] overflow-y-auto p-3">
            <InventoryCopilot />
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
        active
          ? "bg-[#17665F] font-semibold text-white"
          : "text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </a>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon,
  accent = "teal",
}: {
  label: string;
  value: string;
  detail: string;
  icon: string;
  accent?: "teal" | "orange" | "red";
}) {
  const accentStyles = {
    teal: "bg-[#E8F4EF] text-[#168C80]",
    orange: "bg-orange-50 text-[#D97732]",
    red: "bg-red-50 text-[#C94332]",
  };

  return (
    <div className="rounded-2xl border border-[#E5E8E1] bg-white p-5 shadow-[0_3px_14px_rgba(23,43,58,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${accentStyles[accent]}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#829096]">
            {label}
          </p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-[#172B3A]">
            {value}
          </p>
          <p className="mt-1 text-xs text-[#98A4A3]">{detail}</p>
        </div>
      </div>
    </div>
  );
}
