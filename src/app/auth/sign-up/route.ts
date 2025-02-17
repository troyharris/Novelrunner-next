import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = formData.get("displayName") as string;
  const redirectTo = formData.get("redirectTo") as string;

  const supabase = await createClient();

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return new NextResponse(JSON.stringify({ error: authError.message }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (authData.user) {
    // Insert into users table
    const { error: dbError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          display_name: displayName,
        },
      ])
      .select()
      .single();

    if (dbError) {
      // Attempt to clean up auth user if db insert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return new NextResponse(JSON.stringify({ error: dbError.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  }

  return NextResponse.redirect(new URL(redirectTo || "/projects", request.url));
}
