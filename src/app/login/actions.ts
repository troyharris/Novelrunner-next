"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/projects", "layout");
  redirect("/projects");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error: signupError } = await supabase.auth.signUp(
    data
  );

  if (signupError) {
    redirect("/error");
  }

  if (authData.user) {
    // Create a record in our custom users table
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: authData.user.id,
        display_name: authData.user.email?.split("@")[0], // Use part before @ as display name
      },
    ]);

    if (insertError) {
      console.error("Error creating user record:", insertError);
      redirect("/error");
    }
  }

  revalidatePath("/projects", "layout");
  redirect("/projects");
}
