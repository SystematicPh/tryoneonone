import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const rewardId = String(formData.get("rewardId") || "");
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !rewardId) {
    return NextResponse.redirect(new URL("/rewards", request.url), 303);
  }

  await supabase.rpc("claim_reward", {
    reward_id_input: rewardId
  });

  return NextResponse.redirect(new URL("/rewards", request.url), 303);
}
