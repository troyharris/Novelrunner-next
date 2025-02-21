import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      title,
      genre,
      target_word_count,
      words_written
    `
    )
    .eq("id", projectId)
    .single();

  if (error) {
    console.error(error);
    return <div>Error loading project!</div>;
  }

  if (!project) {
    notFound();
  }

  const progress = project.words_written / project.target_word_count;
  const percentage = Math.round(progress * 100);

  const { data: episodes, error: episodesError } = await supabase
    .from("episodes")
    .select("title, sequence_number")
    .eq("project_id", projectId)
    .order("sequence_number", { ascending: true });

  if (episodesError) {
    console.error(episodesError);
    return <div>Error loading episodes!</div>;
  }

  return (
    <div className="flex h-full">
      {/* Left Column */}
      <div className="w-1/4 p-4 border-r border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Project Information</h2>
        <div>
          <p>Title: {project.title}</p>
          <p>Genre: {project.genre}</p>
          <p>
            Word Count: {project.words_written}/{project.target_word_count}
          </p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-green-600 h-2.5 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-sm mt-1">{percentage}% Complete</p>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Episodes</h3>
        <ul>
          {episodes.map((episode) => (
            <li key={episode.sequence_number}>{episode.title}</li>
          ))}
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="w-3/4 p-4">
        <h2>Main Content</h2>
        <p>This is where the main content of the project will go.</p>
      </div>
    </div>
  );
}
