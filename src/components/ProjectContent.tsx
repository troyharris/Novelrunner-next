"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookTextInput } from "./TextEditor";
import { Cactus_Classical_Serif } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Users,
  Globe,
  ListTree,
  Sparkles,
  Settings,
  Plus,
  ChevronLeft,
  Save,
  X,
} from "lucide-react";

const cactusFont = Cactus_Classical_Serif({ weight: "400" });

// --- Types ---
type Episode = {
  id: string;
  title: string;
  sequence_number: number;
  current_word_count: number;
  target_word_count: number;
};

type Scene = {
  id: string;
  title: string;
  content: string;
  word_count: number;
  status: string;
  sequence_number: number;
};

type Project = {
  id: string; // Assuming project has an ID
  title: string;
  genre: string;
  target_word_count: number;
  words_written: number;
};

type Props = {
  project: Project;
  episodes: Episode[];
};

// --- Constants ---
const NAV_ITEMS = [
  { id: "Manuscript", label: "Manuscript", icon: BookOpen },
  { id: "Characters", label: "Characters", icon: Users },
  { id: "WorldBuilding", label: "World Building", icon: Globe },
  { id: "Outline", label: "Outline", icon: ListTree },
  { id: "AIAssistant", label: "AI Assistant", icon: Sparkles },
];

const SIDEBAR_WIDTH = "w-16"; // Adjust as needed
const CHAPTER_SCENE_COL_WIDTH = "w-80"; // Adjust as needed

// --- Component ---
export default function ProjectContent({
  project: initialProject,
  episodes: initialEpisodes,
}: Props) {
  // --- State ---
  const [projectState, setProjectState] = useState<Project>(initialProject);
  const [episodesState, setEpisodesState] =
    useState<Episode[]>(initialEpisodes);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(
    null
  );
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [isCreatingScene, setIsCreatingScene] = useState(false);
  const [newSceneTitle, setNewSceneTitle] = useState("");
  const [activeNav, setActiveNav] = useState<string>("Manuscript"); // Default view
  const [columnView, setColumnView] = useState<"chapters" | "scenes">(
    "chapters"
  );
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);

  // --- Derived State ---
  const progress =
    projectState.target_word_count > 0
      ? projectState.words_written / projectState.target_word_count
      : 0;
  const percentage = Math.round(progress * 100);
  const selectedEpisode = episodesState.find(
    (ep) => ep.id === selectedEpisodeId
  );

  // --- Effects ---
  useEffect(() => {
    setProjectState(initialProject);
    setEpisodesState(initialEpisodes);
    // Reset dependent state if project/episodes fundamentally change
    // Consider if resetting selection is desired UX
    // setSelectedEpisodeId(null);
    // setScenes([]);
    // setSelectedScene(null);
    // setColumnView('chapters');
  }, [initialProject, initialEpisodes]);

  // --- Handlers ---
  const handleEpisodeClick = async (episodeId: string) => {
    if (isLoadingScenes) return; // Prevent multiple clicks while loading

    setSelectedScene(null); // Reset scene selection when changing episode context
    setSelectedEpisodeId(episodeId);
    setIsLoadingScenes(true);
    setScenes([]); // Clear previous scenes immediately

    try {
      const response = await fetch(`/api/episodes/${episodeId}/scenes`);
      if (response.ok) {
        const data = await response.json();
        setScenes(data.scenes);
        setColumnView("scenes"); // Animate to scenes view only after successful fetch
      } else {
        console.error("Failed to fetch scenes");
        // Handle error state, maybe show a message
        setSelectedEpisodeId(null); // Optionally reset episode selection on error
      }
    } catch (error) {
      console.error("Error fetching scenes:", error);
      setSelectedEpisodeId(null); // Optionally reset episode selection on error
    } finally {
      setIsLoadingScenes(false);
    }
  };

  const handleSceneClick = (scene: Scene) => {
    setSelectedScene(scene);
  };

  const handleBackToChapters = () => {
    setColumnView("chapters");
    // Optionally reset scene selection when going back
    // setSelectedScene(null);
  };

  const handleSaveScene = async (content: string) => {
    if (!selectedScene || !selectedEpisodeId) return;

    try {
      const response = await fetch(
        `/api/episodes/${selectedEpisodeId}/scenes`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sceneId: selectedScene.id, content }),
        }
      );

      if (response.ok) {
        const { scene, episodeWordCount, projectWordCount } =
          await response.json();

        // Update scenes state
        setScenes((prevScenes) =>
          prevScenes.map((s) => (s.id === scene.id ? scene : s))
        );

        // Update episodes state
        if (episodeWordCount !== undefined) {
          setEpisodesState((prevEpisodes) =>
            prevEpisodes.map((ep) =>
              ep.id === selectedEpisodeId
                ? { ...ep, current_word_count: episodeWordCount }
                : ep
            )
          );
        }

        // Update selectedScene state if it's the one being edited
        setSelectedScene(scene); // Update with the latest data including word count

        // Update project state
        if (projectWordCount !== undefined) {
          setProjectState((prevProject) => ({
            ...prevProject,
            words_written: projectWordCount,
          }));
        }
      } else {
        console.error("Failed to save scene");
        // Handle error
      }
    } catch (error) {
      console.error("Error saving scene:", error);
    }
  };

  const handleCreateScene = async () => {
    if (!newSceneTitle.trim() || !selectedEpisodeId) return;

    try {
      const response = await fetch(
        `/api/episodes/${selectedEpisodeId}/scenes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newSceneTitle }),
        }
      );

      if (response.ok) {
        const { scene } = await response.json();
        setScenes((prevScenes) => [...prevScenes, scene]); // Add to the end by default
        setIsCreatingScene(false);
        setNewSceneTitle("");
      } else {
        console.error("Failed to create scene");
        // Handle error
      }
    } catch (error) {
      console.error("Error creating scene:", error);
    }
  };

  // --- Render ---
  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* --- Right Sidebar --- */}
      <div
        className={`${SIDEBAR_WIDTH} flex flex-col justify-between bg-gray-900 text-gray-400 py-4`}
      >
        <div>
          <Link
            href="/projects"
            className="flex items-center justify-center mb-6 group"
          >
            {/* Replace with actual Logo component if available */}
            <Home className="h-7 w-7 text-gray-500 group-hover:text-white transition-colors" />
          </Link>
          <nav className="flex flex-col items-center space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                title={item.label}
                className={`p-3 rounded-lg flex items-center justify-center group transition-colors w-12 h-12 ${
                  activeNav === item.id
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </button>
            ))}
          </nav>
        </div>
        <div className="flex flex-col items-center">
          <button
            title="Settings"
            className="p-3 rounded-lg flex items-center justify-center group transition-colors w-12 h-12 hover:bg-gray-800 hover:text-white"
            onClick={() => setActiveNav("Settings")} // Assuming 'Settings' is a valid nav ID
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* --- Main Area --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- Top Bar --- */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className={`text-2xl font-semibold ${cactusFont.className}`}>
              {projectState.title}
            </h1>
            <p className="text-sm text-gray-500">{projectState.genre}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium">
                {projectState.words_written.toLocaleString()} words
              </p>
              <p className="text-xs text-gray-500">
                Target: {projectState.target_word_count.toLocaleString()}
              </p>
            </div>
            <div className="w-40">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden shadow-inner">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1.5 text-right font-medium">
                {percentage}%
              </p>
            </div>
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1 flex overflow-hidden">
          {activeNav === "Manuscript" && (
            <>
              {/* Chapter/Scene Column */}
              <div
                className={`${CHAPTER_SCENE_COL_WIDTH} border-r border-gray-200 bg-white flex flex-col h-full shadow-sm`}
              >
                <div className="relative flex-1 overflow-hidden">
                  <AnimatePresence initial={false}>
                    {/* Chapters List */}
                    <motion.div
                      key="chapters"
                      initial={{
                        x: columnView === "chapters" ? "0%" : "-100%",
                      }}
                      animate={{
                        x: columnView === "chapters" ? "0%" : "-100%",
                      }}
                      exit={{ x: "-100%" }}
                      transition={{
                        type: "tween",
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 flex flex-col h-full"
                    >
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                          <span className={cactusFont.className}>Chapters</span>
                        </h2>
                        <button className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
                          <Plus size={18} />
                        </button>
                      </div>
                      <ul className="space-y-1 p-2 overflow-y-auto flex-1">
                        {episodesState.map((episode) => {
                          const episodeProgress =
                            episode.target_word_count > 0
                              ? Math.round(
                                  (episode.current_word_count /
                                    episode.target_word_count) *
                                    100
                                )
                              : 0;
                          return (
                            <li key={episode.id}>
                              <button
                                onClick={() => handleEpisodeClick(episode.id)}
                                disabled={
                                  isLoadingScenes &&
                                  selectedEpisodeId === episode.id
                                }
                                className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm ${
                                  selectedEpisodeId === episode.id
                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                    : "border-l-4 border-transparent"
                                } ${
                                  isLoadingScenes &&
                                  selectedEpisodeId === episode.id
                                    ? "opacity-50 cursor-wait"
                                    : ""
                                }`}
                              >
                                <div className="font-medium">
                                  {episode.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {episode.current_word_count.toLocaleString()}{" "}
                                  / {episode.target_word_count.toLocaleString()}{" "}
                                  words
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 overflow-hidden shadow-inner">
                                  <div
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${episodeProgress}%` }}
                                  ></div>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </motion.div>

                    {/* Scenes List */}
                    <motion.div
                      key="scenes"
                      initial={{ x: columnView === "scenes" ? "0%" : "100%" }}
                      animate={{ x: columnView === "scenes" ? "0%" : "100%" }}
                      exit={{ x: "100%" }}
                      transition={{
                        type: "tween",
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 flex flex-col h-full bg-white" // Ensure bg covers underlying content
                    >
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <button
                          onClick={handleBackToChapters}
                          className="flex items-center text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                        >
                          <ChevronLeft size={16} className="mr-1" /> Chapters
                        </button>
                        <button
                          onClick={() => setIsCreatingScene(true)}
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                          disabled={isCreatingScene}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="px-4 pt-3 pb-2">
                        <h3 className="font-semibold text-gray-700 flex items-center">
                          <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                          <span className={cactusFont.className}>
                            {selectedEpisode?.title}
                          </span>
                        </h3>
                      </div>

                      {isCreatingScene && (
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                          <input
                            type="text"
                            value={newSceneTitle}
                            onChange={(e) => setNewSceneTitle(e.target.value)}
                            placeholder="New scene title..."
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm mb-2"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm flex items-center"
                              onClick={() => {
                                setIsCreatingScene(false);
                                setNewSceneTitle("");
                              }}
                            >
                              <X size={16} className="mr-1" /> Cancel
                            </button>
                            <button
                              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center shadow-sm"
                              onClick={handleCreateScene}
                              disabled={!newSceneTitle.trim()}
                            >
                              <Save size={16} className="mr-1" /> Save
                            </button>
                          </div>
                        </div>
                      )}

                      <ul className="space-y-1 p-2 overflow-y-auto flex-1">
                        {isLoadingScenes && (
                          <li className="p-4 text-center text-gray-500">
                            Loading scenes...
                          </li>
                        )}
                        {!isLoadingScenes &&
                          scenes.length === 0 &&
                          !isCreatingScene && (
                            <li className="p-4 text-center text-gray-500">
                              No scenes yet.
                            </li>
                          )}
                        {!isLoadingScenes &&
                          scenes.map((scene) => (
                            <li key={scene.id}>
                              <button
                                onClick={() => handleSceneClick(scene)}
                                className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors shadow-sm ${
                                  selectedScene?.id === scene.id
                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                    : "border-l-4 border-transparent"
                                }`}
                              >
                                <div className="font-medium text-sm">
                                  {scene.title}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {scene.word_count.toLocaleString()} words
                                </div>
                              </button>
                            </li>
                          ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 flex justify-center">
                <div
                  className={`max-w-3xl${
                    selectedScene
                      ? "bg-white rounded-lg shadow-md mx-6 border border-gray-100"
                      : ""
                  }`}
                >
                  {selectedScene ? (
                    <BookTextInput
                      key={selectedScene.id} // Force re-render when scene changes
                      initialText={selectedScene.content}
                      saveText={handleSaveScene}
                      font={cactusFont}
                      textSize="lg" // Or manage this dynamically
                      // Add any other props needed by BookTextInput
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-12 border border-gray-200 border-dashed rounded-lg bg-white/50 backdrop-blur-sm">
                      <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium mb-2">
                        No scene selected
                      </p>
                      <p className="text-sm">
                        Select a scene to start writing or create a new one.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Placeholder for other nav sections */}
          {activeNav === "Characters" && (
            <div className="p-6 flex-1">Characters View (Not Implemented)</div>
          )}
          {activeNav === "WorldBuilding" && (
            <div className="p-6 flex-1">
              World Building View (Not Implemented)
            </div>
          )}
          {activeNav === "Outline" && (
            <div className="p-6 flex-1">Outline View (Not Implemented)</div>
          )}
          {activeNav === "AIAssistant" && (
            <div className="p-6 flex-1">
              AI Assistant View (Not Implemented)
            </div>
          )}
          {activeNav === "Settings" && (
            <div className="p-6 flex-1">Settings View (Not Implemented)</div>
          )}
        </div>
      </div>
    </div>
  );
}
