import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const demoOrders = [
  {
    id: "DEMO-1001",
    minutesAgo: 30,
    items: [
      { lineId: "DEMO-1001-1", sku: "COF-001", quantity: 2 },
      { lineId: "DEMO-1001-2", sku: "TEA-002", quantity: 1 },
    ],
  },
  {
    id: "DEMO-1002",
    minutesAgo: 120,
    items: [
      { lineId: "DEMO-1002-1", sku: "MIL-003", quantity: 3 },
      { lineId: "DEMO-1002-2", sku: "SNK-004", quantity: 2 },
    ],
  },
  {
    id: "DEMO-1003",
    minutesAgo: 240,
    items: [
      { lineId: "DEMO-1003-1", sku: "TEA-005", quantity: 1 },
      { lineId: "DEMO-1003-2", sku: "ACC-006", quantity: 2 },
    ],
  },
];

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in first." },
        { status: 401 }
      );
    }

    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, sku, price")
      .eq("store_id", user.id);

    if (productError) throw productError;

    const { data: existingLines, error: existingError } = await supabase
      .from("sales")
      .select("external_line_item_id")
      .eq("store_id", user.id)
      .eq("source", "shopify")
      .not("external_line_item_id", "is", null);

    if (existingError) throw existingError;

    const importedIds = new Set(
      (existingLines ?? []).map((line) => line.external_line_item_id)
    );

    const productBySku = new Map(
      (products ?? []).map((product) => [
        product.sku,
        product,
      ])
    );

    const rows = [];
    const unmatchedSkus = new Set<string>();
    let alreadyImported = 0;

    for (const order of demoOrders) {
      for (const item of order.items) {
        if (importedIds.has(item.lineId)) {
          alreadyImported++;
          continue;
        }

        const product = productBySku.get(item.sku);

        if (!product) {
          unmatchedSkus.add(item.sku);
          continue;
        }

        const soldAt = new Date(
          Date.now() - order.minutesAgo * 60 * 1000
        ).toISOString();

        rows.push({
          store_id: user.id,
          product_id: product.id,
          quantity: item.quantity,
          unit_price: Number(product.price),
          source: "shopify",
          external_order_id: order.id,
          external_line_item_id: item.lineId,
          sold_at: soldAt,
        });

        // Also prevent duplicates within this same import batch.
        importedIds.add(item.lineId);
      }
    }

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("sales")
        .insert(rows);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      demo: true,
      imported: rows.length,
      alreadyImported,
      unmatchedSkus: [...unmatchedSkus],
      message: "Demo order sync completed.",
    });
  } catch (error) {
    console.error("Demo order sync failed:", error);

    return NextResponse.json(
      { error: "Could not sync demo orders. Check the server logs." },
      { status: 500 }
    );
  }
}
