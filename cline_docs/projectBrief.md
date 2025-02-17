# Project Brief

## Overview

Building a web app, named Novelrunner, that allows users to write a novel. Novelrunner is an opinionated, structured way to write a novel, using storytelling structure based on serialized television. It uses modern AI Large Language Models to analyze prose, plot, pacing, charactorization, and find plot holes. It can even help users brainstorm story solutions when they write themselves into a corner.

When a user creates a project, they give Novelrunner the following pieces of information and it creates a project template for them:

- Title
- Genre
- Word count (Novelrunner will suggest a word count based on your genre, but you are free to change it)
- Pace (How quickly does your plot move?)

Based on the above information, Novelrunner will create an appropriate amount of “Episodes” with a target word count for each. Reach the target word count for each episode and the user will reach their target word count for their novel. It also has place for the user to add research documents, notes, and a special synopsis that is episode based that the user can write themselves or have AI help them build and update.

When the user has completed their novel, Novelrunner can export the novel as a complete, compiled work in RTF, manuscript format. From there, they can edit as they please, split into chapters as they see fit and add any additional personal information.

## Core Features

- Create a novel project and based on target wordcount and pace, it will create "Episodes" in which the user writes "Scenes" to complete the episode
- AI functionality built in using a user provided OpenRouter API key. There are several personas that the user can select to focus on prose, worldbuilding, plot development, character development, plot holes, or brainstorming. The AI is focused on helping the user write, not writing for the user.
- Each project has the ability to write worldbuilding notes, research notes, and a synopsis. An extra benefit is that the AI can read these to understand the novel better when offering advice.
- Export finished projects into manuscript format, ready to submit to agents.

## Target Users

Aspiring or veteran novel writers.

## Technical Preferences

- Next.js 14+ - App Router version
- Tailwind CSS
- TypeScript
- Supabase (for database, storage and authentication)
- Vercel for deployment
- Repo on Github
