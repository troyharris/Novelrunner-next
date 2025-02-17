"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import ProjectCreationWizard from "@/components/ProjectCreationWizard";

export default function ProjectsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Projects</h1>
      <p>Welcome, {user.email}!</p>
      <ProjectCreationWizard />
    </div>
  );
}
