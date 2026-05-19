import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const amount = Number(formData.get("amount") || 0);
  const notes = String(formData.get("notes") || "").trim();
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !username || amount <= 0) {
    return NextResponse.redirect(new URL("/admin/users", request.url), 303);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  }

  await supabase.rpc("add_purchase_points", {
    acting_admin_id: user.id,
    purchase_amount: amount,
    target_username: username,
    notes_input: notes || null
  });

  return NextResponse.redirect(new URL(`/admin/user/${username}`, request.url), 303);
}
