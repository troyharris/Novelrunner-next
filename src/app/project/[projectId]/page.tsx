import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectContent from "@/components/ProjectContent";

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

  const { data: episodes, error: episodesError } = await supabase
    .from("episodes")
    .select("id, title, sequence_number, current_word_count, target_word_count")
    .eq("project_id", projectId)
    .order("sequence_number", { ascending: true });

  if (episodesError) {
    console.error(episodesError);
    return <div>Error loading episodes!</div>;
  }

  return <ProjectContent project={project} episodes={episodes} />;
}
