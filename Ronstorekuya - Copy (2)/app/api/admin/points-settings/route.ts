import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const amountPerPoint = Number(formData.get("amountPerPoint") || 0);
  const pointsPerAmount = Number(formData.get("pointsPerAmount") || 0);
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || amountPerPoint <= 0 || pointsPerAmount <= 0) {
    return NextResponse.redirect(new URL("/admin/points", request.url), 303);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  }

  const adminClient = createAdminClient();

  await adminClient.from("point_settings").upsert({
    id: 1,
    amount_per_point: amountPerPoint,
    points_per_amount: pointsPerAmount
  });

  return NextResponse.redirect(new URL("/admin/points", request.url), 303);
}
