"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "./actions";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function signOut() {
      try {
        await logout();
        router.push("/projects");
      } catch (error) {
        console.error("Error signing out:", error);
        router.push("/error");
      }
    }

    signOut();
  }, [router]);

  return <div>Signing Out...</div>;
}
