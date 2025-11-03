import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logServerActivity } from "@/server/services/activity";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    await admin.from("oauth_tokens").delete().eq("user_id", user.id).eq("provider", "youtube");

    // Unified activity log: YouTube disconnected
    try {
      await logServerActivity({
        userId: user.id,
        type: "youtube_disconnected",
        message: "Disconnected YouTube account",
      });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Disconnect failed" }, { status: 500 });
  }
}