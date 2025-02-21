"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import ProjectCreationWizard from "@/components/ProjectCreationWizard";
import { useState, useEffect } from "react";
import { Tables } from "@/types/supabase";
import Link from "next/link";

type Project = Tables<"projects">;

function getTextColor(hexColor: string) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "black" : "white";
}

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    }

    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Link href={`/project/${project.id}`} key={project.id}>
            <div
              className="aspect-[3/4] rounded-lg p-4 flex flex-col justify-between bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition duration-300 transform hover:scale-105"
              style={{ backgroundColor: project.cover_color || "white" }}
            >
              <div
                style={{
                  color: getTextColor(project.cover_color || "#ffffff"),
                }}
              >
                <h2 className="text-2xl font-bold text-center dark:text-white">
                  {project.title}
                </h2>
              </div>
              <div
                style={{
                  color: getTextColor(project.cover_color || "#ffffff"),
                }}
              >
                <p className="text-sm dark:text-gray-300">{project.genre}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <button
        onClick={() => setShowWizard(true)}
        className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
      >
        <svg
          fill="none"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 mr-2"
        >
          <path
            d="M14.5 13.5V5.41a1 1 0 0 0-.3-.7L9.8.29A1 1 0 0 0 9.08 0H1.5v13.5A2.5 2.5 0 0 0 4 16h8a2.5 2.5 0 0 0 2.5-2.5m-1.5 0v-7H8v-5H3v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1M9.5 5V2.12L12.38 5zM5.13 5h-.62v1.25h2.12V5zm-.62 3h7.12v1.25H4.5zm.62 3h-.62v1.25h7.12V11z"
            clipRule="evenodd"
            fill="#666"
            fillRule="evenodd"
          />
        </svg>
        New Project
      </button>
      {showWizard && <ProjectCreationWizard />}
    </div>
  );
}
