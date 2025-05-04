# Active Context

## Recent Changes

### Scene Management Implementation

- Added scene reordering functionality with sequence numbers
- Created secure database function for reordering scenes
- Implemented scene management API endpoints
- Added scene sequence validation and error handling
- Implemented drag-and-drop UI for scene reordering
- Added optimistic updates for smooth UX
- Added scene types system with predefined categories
- Added character management for scenes
- Added scene-specific synopsis support

### Project View UI/UX Overhaul (`ProjectContent.tsx`)

- **Implemented New Layout:** Refactored `ProjectContent.tsx` to a new three-section layout:
  - **Right Sidebar:** Fixed-width, dark background, icon-based navigation using `lucide-react`. Includes links/placeholders for App Logo (Home), Manuscript, Characters, World Building, Outline, AI Assistant, and Settings.
  - **Top Bar:** Persistent horizontal bar displaying Project Title, Genre, and overall word count progress.
  - **Main Content Area:** Flexible area adapting to the selected sidebar navigation item.
- **Manuscript View:**
  - **Chapter/Scene Column:** Combined column for chapters and scenes. Uses `framer-motion` for animated horizontal transitions between the chapter list and the scene list for the selected chapter. Includes "Back" navigation from scenes to chapters and "New Scene" functionality.
  - **Editor Area:** Displays the `BookTextInput` component for the selected scene or a placeholder message. Existing logic for fetching/saving scenes and updating project/episode word counts is integrated.
- **Dependencies Added:** `framer-motion`, `lucide-react`.
- **Styling:** Utilized Tailwind CSS for layout and styling, aiming for a modern, polished look based on the provided screenshot.

### Previous Changes

- Implemented AuthProvider component for managing auth state
- Created login/signup flows with Supabase
- Added protected routes and middleware
- Set up auth confirmation routes

### Project Management Features

- Created ProjectCreationWizard component
- Implemented project creation flow with genre/word count calculation
- Added projects API routes for CRUD operations
- Implemented episodes management system

### Database Evolution

- Added words_written tracking to projects table
- Implemented user insert policies for security
- Added cover color and episode count fields
- Schema supports full project management workflow
- Added new tables for characters, scene types, and scene synopsis
- Implemented many-to-many relationships for scene types and characters
- Added comprehensive RLS policies for new tables

## Current Focus

The primary focus has shifted to refining the core writing experience within the newly implemented project view structure (`ProjectContent.tsx`). Advanced scene management features (reordering, types, characters, synopsis) are integrated into this new UI.

```
/src
├── app/
│   ├── api/
│   │   ├── projects/     # Project management
│   │   └── episodes/     # Episode and scene management
│   ├── auth/            # Authentication routes
│   ├── login/           # Login page and actions
│   ├── project/         # Project view pages
│   └── projects/        # Projects list page
├── components/
│   ├── auth/           # Auth components
│   ├── ProjectContent.tsx  # Project page main component
│   └── ProjectCreationWizard.tsx
├── lib/
│   └── supabase/       # Supabase client/server utilities
└── types/
    └── supabase.ts     # Generated types
```

## Active Decisions

1. **Project Structure**

   - Using dynamic routes for project pages
   - API routes for data operations
   - Server components for data fetching
   - Client components for interactive features like scene management

2. **Database Design**

   - Words written tracking at project level
   - Cover color for project customization
   - Episode count for progress tracking
   - Scene management with status tracking
   - User-specific data policies
   - Project-specific character management
   - Global scene type categories
   - Scene-level synopsis tracking
   - Many-to-many relationships for flexible scene categorization

3. **Authentication Flow**

   - Email-based authentication
   - Protected routes with middleware
   - Persistent sessions
   - Secure sign-out process

4. **Scene Management**
   - Scenes tied to episodes
   - Real-time scene creation
   - Progress tracking at scene level
   - Status tracking for scenes
   - Character tracking per scene
   - Multiple scene type categorization
   - Scene-specific synopsis

- **Project View UI (`ProjectContent.tsx`):**
  - Adopted a three-section layout (Right Sidebar, Top Bar, Main Content).
  - Implemented icon-based navigation in the Right Sidebar.
  - Made the Top Bar persistent for project-level information.
  - Utilized an animated (`framer-motion`) column for switching between Chapter and Scene lists within the Manuscript view.

## Current Challenges

1. **Technical Implementation**

   - Real-time word count updates
   - Scene content editor integration
   - Scene content persistence
   - AI service connection

2. **UX Refinement**
   - Implementing placeholder navigation views (Characters, World Building, etc.).
   - Scene transition animations (refining existing, adding others as needed).
   - Progress visualization improvements (beyond the top bar).
   - Settings management implementation.

## Next Steps

### Immediate Priority

1.  **Verify & Refine New UI:** Test the `ProjectContent.tsx` component thoroughly (potentially using the browser tool) to ensure the layout, navigation, chapter/scene switching, animations, and editor integration work correctly. Address any visual glitches or functional issues.
2.  **Implement Placeholder Views:** Create basic placeholder components/content for the other navigation sections (Characters, World Building, Outline, AI Assistant, Settings) to make the sidebar navigation functional.
3.  **Continue AI Integration:** Proceed with planning and implementing AI features (e.g., OpenRouter connection, personas).
4.  **Address Remaining Challenges:** Tackle outstanding items like editor persistence details, real-time word count refinements, etc.

### Short-term Goals

1. Export Functionality

   - RTF manuscript generation
   - Formatting options
   - Chapter organization
   - Metadata handling

2. Collaboration Features
   - Shared projects
   - Comments system
   - Version control
   - Real-time updates

## Notes

- Core authentication and project management complete
- Completed major UI overhaul for the project's Manuscript view.
- Integrated existing scene management logic into the new structure.
- Next focus is verifying the new UI, implementing placeholder views, and continuing AI integration.
- Focus remains on user experience, performance, and building out core writing/planning features.
