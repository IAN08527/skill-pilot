# Implementation Plan: Integrate Real Data from Database

## Current Situation
The course detail screen currently shows dummy/mock data. The `createCustomCourse` module generates real course data and should save it to the database, but the page rendering needs to be updated to use this real data.

## Database Schema Required

Based on the `createCustomCourse.js` code, we need these tables:

### 1. `courses` table
- id (primary key)
- title
- description
- instructor
- duration
- category
- skills (array)
- total_lessons
- is_ai_generated
- created_by
- outcomes (jsonb)
- created_at
- updated_at

### 2. `modules` table
- id (primary key)
- course_id (foreign key → courses.id)
- title
- order_index
- created_at

### 3. `lessons` table
- id (primary key)
- module_id (foreign key → modules.id)
- course_id (foreign key → courses.id)
- title
- duration
- type
- order_index
- video_url
- video_id
- created_at

### 4. `chapters` table
- id (primary key)
- lesson_id (foreign key → lessons.id)
- course_id (foreign key → courses.id)
- title
- timestamp_seconds
- created_at

### 5. `enrollments` table
- id (primary key)
- user_id (foreign key → auth.users.id)
- course_id (foreign key → courses.id)
- progress
- completed_lessons
- total_lessons
- last_accessed_at
- created_at

## Steps to Implement

### Step 1: Create/Update Database Schema
Create SQL migration file with all necessary tables

### Step 2: Verify Data Flow
- Ensure `createCustomCourse` is being called properly
- Verify data is being saved to database
- Check that course ID is being passed correctly to the detail page

### Step 3: Update API Route (if needed)
- Remove mock data fallback OR keep it only for true errors
- Ensure proper error handling
- Fetch all related data (modules, lessons, chapters)

### Step 4: Update Course Detail Page
- Ensure it's fetching from the correct course ID
- Display real data from database
- Handle loading and error states properly

### Step 5: Testing
- Create a new course using createCustomCourse
- Navigate to course detail page
- Verify all data is coming from database
