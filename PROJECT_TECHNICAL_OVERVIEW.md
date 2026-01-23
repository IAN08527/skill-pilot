# Skill Pilot - Project Technical Overview

## Project Description
**Skill Pilot** is a premium Learning Management System (LMS) built to provide an engaging and personalized learning experience. It features course enrollment, progress tracking, video lessons with YouTube integration, and an intelligent project recommendation engine.

## Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript / React 19
- **Styling**: 
  - Tailwind CSS 4
  - [Shadcn UI](https://ui.shadcn.com/) (Component Library)
  - `tailwindcss-animate` for animations
- **Icons**: Lucide React
- **State Management**: React Hooks (`useState`, `useEffect`)

### Backend & Data
- **Platform**: [Supabase](https://supabase.com/)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **API Interactions**: Next.js API Routes (Serverless functions)

### Visualization
- **Charts**: Recharts

## Feature Focus: Intelligent Recommendation Engine

A key feature of Skill Pilot is its **Vector Space Model** recommendation system for suggesting projects.

### How it Works
1.  **Data Collection**: 
    - The system aggregates data from a user's enrolled courses.
    - It extracts implicit and explicit skills (e.g., "React" from a Web Dev course).
    - It uses course progress to determine "Expertise Weight" (e.g. 50% completion vs 10% completion).

2.  **Vectorization**:
    - **User Profile Vector**: A mathematical representation of the user's skills.
      - *Formula*: `SkillWeight = (CourseProgress / 100) * Relevance`
    - **Project Vectors**: Mathematical representations of potential projects based on their required skills.

3.  **Similarity Calculation**:
    - The system computes the **Cosine Similarity** between the User Vector and every Project Vector.
    - `Cosine Similarity = (A . B) / (||A|| * ||B||)`
    - This yields a match score from 0 to 1 (0% to 100%).

4.  **Result**:
    - Projects are ranked by their score.
    - The UI displays the "Model Confidence" (match percentage) and explains the match reason.
    - A confidence threshold filters out irrelevant projects.

### Logic Location
- **Engine Logic**: `lib/recommendations.ts`
- **UI Component**: `components/CourseProjectSuggestions.tsx`
