"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

const ProjectCreationWizard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState(1);
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

  const calculateEpisodeCount = () => {
    switch (pace) {
      case "Slow":
        return Math.ceil(targetWordCount / 15000);
      case "Medium":
        return Math.ceil(targetWordCount / 10000);
      case "Fast":
        return Math.ceil(targetWordCount / 7500);
      default:
        return 0;
    }
  };

  const episodeCount = calculateEpisodeCount();

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
          episodeCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const projectData = await response.json();
      console.log("Project created", projectData);

      // Create episodes
      const episodes = [];
      for (let i = 1; i <= episodeCount; i++) {
        episodes.push({
          title: `Episode ${i}`,
          targetWordCount: Math.ceil(targetWordCount / episodeCount), // Distribute word count evenly
          projectId: projectData.id, // Assuming the API returns the project ID
        });
      }

      // Store episodes in the database
      const episodesResponse = await fetch("/api/episodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(episodes),
      });

      if (!episodesResponse.ok) {
        throw new Error(`HTTP error! status: ${episodesResponse.status}`);
      }

      const episodesData = await episodesResponse.json();
      console.log("Episodes created", episodesData);

      closeModal();
    } catch (error) {
      console.error("Error creating project", error);
    }
  };

  function closeModal() {
    setIsOpen(false);
    setStep(1);
    setTitle("");
    setGenre("");
    setTargetWordCount(0);
    setPace("");
    setCoverColor("");
  }

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  onSubmit={handleSubmit}
                >
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Create New Project
                  </Dialog.Title>
                  <form>
                    <div className="mt-2">
                      {step === 1 && (
                        <div>
                          <label
                            htmlFor="title"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Title:
                          </label>
                          <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      )}
                      {step === 2 && (
                        <div>
                          <label
                            htmlFor="genre"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Genre:
                          </label>
                          <select
                            id="genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Select a genre</option>
                            {genres.map((genre) => (
                              <option key={genre} value={genre}>
                                {genre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {step === 3 && (
                        <div>
                          <label
                            htmlFor="targetWordCount"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Target Word Count:
                          </label>
                          <input
                            type="number"
                            id="targetWordCount"
                            value={targetWordCount}
                            onChange={(e) =>
                              setTargetWordCount(Number(e.target.value))
                            }
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      )}
                      {step === 4 && (
                        <div>
                          <label
                            htmlFor="pace"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Pace:
                          </label>
                          <select
                            id="pace"
                            value={pace}
                            onChange={(e) => setPace(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          >
                            <option value="">Select a pace</option>
                            {paces.map((pace) => (
                              <option key={pace} value={pace}>
                                {pace}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {step === 5 && (
                        <div>
                          <label
                            htmlFor="coverColor"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Cover Color:
                          </label>
                          <input
                            type="color"
                            id="coverColor"
                            value={coverColor}
                            onChange={(e) => setCoverColor(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      )}
                      {step === 6 && (
                        <div>
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Project Stats
                          </h3>
                          <p>Title: {title}</p>
                          <p>Genre: {genre}</p>
                          <p>Target Word Count: {targetWordCount}</p>
                          <p>Pace: {pace}</p>
                          <p>Cover Color: {coverColor}</p>
                          <p>Episode Count: {episodeCount}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between">
                      {step > 1 && step < 6 && (
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          onClick={() => setStep(step - 1)}
                        >
                          Back
                        </button>
                      )}
                      {step < 5 && (
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={() => setStep(step + 1)}
                        >
                          Next
                        </button>
                      )}
                      {step === 5 && (
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={() => setStep(step + 1)}
                        >
                          Show Stats
                        </button>
                      )}
                      {step === 6 && (
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Create Project
                        </button>
                      )}
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ProjectCreationWizard;
