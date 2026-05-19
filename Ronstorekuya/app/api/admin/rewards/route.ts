import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function toNullableNumber(value: FormDataEntryValue | null) {
  if (!value || String(value).trim() === "") {
    return null;
  }
  return Number(value);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  }

  const adminClient = createAdminClient();

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const imageEmoji = String(formData.get("imageEmoji") || "").trim() || "🎁";
  const pointsCost = Number(formData.get("pointsCost") || 0);
  const stock = toNullableNumber(formData.get("stock"));
  const intent = String(formData.get("intent") || "create");

  if (!title || !description || pointsCost <= 0) {
    return NextResponse.redirect(new URL("/admin/rewards", request.url), 303);
  }

  if (!id) {
    await adminClient.from("rewards").insert({
      title,
      description,
      image_emoji: imageEmoji,
      points_cost: pointsCost,
      stock
    });
  } else if (intent === "toggle") {
    const { data: current } = await adminClient.from("rewards").select("is_active").eq("id", id).single();

    await adminClient
      .from("rewards")
      .update({
        is_active: !current?.is_active,
        title,
        description,
        image_emoji: imageEmoji,
        points_cost: pointsCost,
        stock
      })
      .eq("id", id);
  } else {
    await adminClient
      .from("rewards")
      .update({
        title,
        description,
        image_emoji: imageEmoji,
        points_cost: pointsCost,
        stock
      })
      .eq("id", id);
  }

  return NextResponse.redirect(new URL("/admin/rewards", request.url), 303);
}
