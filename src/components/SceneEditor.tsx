"use client";

import { useState, useEffect, useRef } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SceneEditorProps {
  content: string | null;
  onSave: (content: string) => void;
}

export default function SceneEditor({
  content: initialContent,
  onSave,
}: SceneEditorProps) {
  const [content, setContent] = useState(initialContent || "");
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const lastSavedContent = useRef(initialContent || "");

  // Handle initial content
  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Calculate word count whenever content changes
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Auto-save when content changes (debounced 5s)
  useEffect(() => {
    // Only proceed if content has changed from last save
    if (content === lastSavedContent.current) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await onSave(content);
        lastSavedContent.current = content;
        setSaveStatus("saved");
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Failed to save:", error);
        setSaveStatus("error");
        // Reset to idle after 3 seconds on error
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    }, 3000); // Increased to 5 seconds

    return () => clearTimeout(timer);
  }, [content, onSave]);

  return (
    <div className="min-h-screen bg-white">
      {/* Editor container with book-like typography */}
      <div className="max-w-[70ch] mx-auto px-8 py-12 relative">
        {/* Status indicators */}
        <div className="absolute top-4 right-4 flex gap-2 items-center">
          {/* Save status indicator */}
          <div
            className={`text-sm px-2 py-1 rounded transition-colors ${
              saveStatus === "idle"
                ? "hidden"
                : saveStatus === "saving"
                ? "bg-blue-100 text-blue-700"
                : saveStatus === "saved"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
              ? "Saved"
              : saveStatus === "error"
              ? "Error saving"
              : ""}
          </div>

          {/* Word count display */}
          <div className="text-sm text-gray-500 bg-white/80 px-2 py-1 rounded">
            {wordCount} words
          </div>
        </div>

        {/* Editor */}
        <div className="prose prose-lg">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[calc(100vh-8rem)] bg-transparent resize-none focus:outline-none
                       font-['Crimson_Text'] text-gray-800 text-xl leading-relaxed tracking-normal
                       indent-8 first-line:indent-0
                       [&>em]:italic [&>em]:not-italic
                       placeholder:text-gray-400 scrollbar-hide"
            placeholder="Start writing..."
            style={{
              border: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
