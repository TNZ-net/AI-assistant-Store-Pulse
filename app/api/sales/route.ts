import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("sales")
    .select("id, product_id, quantity, unit_price, source, sold_at")
    .order("sold_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Sales query failed:", error.message);
    return NextResponse.json(
      { error: "Could not load sales" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: { product_id?: unknown; quantity?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const productId = body.product_id;
  const quantity = body.quantity;

  if (
    typeof productId !== "number" ||
    !Number.isSafeInteger(productId) ||
    productId <= 0 ||
    typeof quantity !== "number" ||
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    quantity > 100000
  ) {
    return NextResponse.json(
      { error: "Valid product_id and positive quantity are required" },
      { status: 400 }
    );
  }

  // Confirm that this product belongs to the signed-in user.
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, price")
    .eq("id", productId)
    .eq("store_id", user.id)
    .maybeSingle();

  if (productError) {
    return NextResponse.json(
      { error: "Could not verify product" },
      { status: 500 }
    );
  }

  if (!product) {
    return NextResponse.json(
      { error: "Product not found" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("sales")
    .insert({
      store_id: user.id,
      product_id: product.id,
      quantity,
      unit_price: product.price,
      source: "manual",
    })
    .select()
    .single();

  if (error) {
    console.error("Sale insert failed:", error.message);
    return NextResponse.json(
      { error: "Could not record sale" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
