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
    .from("products")
    .select("*")
    .order("id");

  if (error) {
    console.error("Products query failed:", error.message);

    return NextResponse.json(
      { error: "Could not load products" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}