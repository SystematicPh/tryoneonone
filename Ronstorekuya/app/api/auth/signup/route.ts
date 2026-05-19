import { NextResponse } from "next/server";
import { normalizeUsername, usernameToEmail } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = String(formData.get("fullName") || "").trim();
  const username = normalizeUsername(String(formData.get("username") || ""));
  const password = String(formData.get("password") || "");

  if (!fullName || !username || password.length < 6) {
    return NextResponse.redirect(new URL("/signup", request.url), 303);
  }

  const adminClient = createAdminClient();

  const { data: existingProfile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.redirect(new URL("/signup", request.url), 303);
  }

  const email = usernameToEmail(username);
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username
    }
  });

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/signup", request.url), 303);
  }

  await adminClient.from("profiles").upsert({
    id: data.user.id,
    username,
    full_name: fullName,
    role: "customer"
  });

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email,
    password
  });

  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
