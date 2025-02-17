"use client";

import React, { useState } from "react";

const ProjectCreationWizard = () => {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [targetWordCount, setTargetWordCount] = useState(0);
  const [pace, setPace] = useState("");
  const [coverColor, setCoverColor] = useState("");

  const genres = [
    "Literary",
    "Science Fiction",
    "Fantasy",
    "Romance",
    "Mystery",
    "Thriller",
    "Young Adult",
    "New Adult",
    "Horror",
    "Novella",
    "Western",
  ];

  const paces = ["Slow", "Medium", "Fast"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          genre,
          targetWordCount,
          pace,
          coverColor,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Project created", data);
      // Reset the form
      setTitle("");
      setGenre("");
      setTargetWordCount(0);
      setPace("");
      setCoverColor("");
    } catch (error) {
      console.error("Error creating project", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="genre">Genre:</label>
        <select
          id="genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">Select a genre</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="targetWordCount">Target Word Count:</label>
        <input
          type="number"
          id="targetWordCount"
          value={targetWordCount}
          onChange={(e) => setTargetWordCount(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="pace">Pace:</label>
        <select
          id="pace"
          value={pace}
          onChange={(e) => setPace(e.target.value)}
        >
          <option value="">Select a pace</option>
          {paces.map((pace) => (
            <option key={pace} value={pace}>
              {pace}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="coverColor">Cover Color:</label>
        <input
          type="color"
          id="coverColor"
          value={coverColor}
          onChange={(e) => setCoverColor(e.target.value)}
        />
      </div>
      <button type="submit">Create Project</button>
    </form>
  );
};

export default ProjectCreationWizard;
