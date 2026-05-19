import { NextResponse } from "next/server";
import { normalizeUsername, usernameToEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = normalizeUsername(String(formData.get("username") || ""));
  const password = String(formData.get("password") || "");

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password
  });

  if (error) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).maybeSingle();

  return NextResponse.redirect(new URL(profile?.role === "admin" ? "/admin" : "/dashboard", request.url), 303);
}
