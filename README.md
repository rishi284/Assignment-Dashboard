Joineazy – Student, Group & Assignment Management
Joineazy is a role-based web application for managing courses, assignments, student groups, and assignment acknowledgments. It provides separate dashboards for Professors and Students.
- Live Demo: https://assignment-dashboard-ruddy.vercel.app/login
- GitHub Repository: https://github.com/rishi284/Assignment-Dashboard
Demo note: This version uses browser localStorage as its data store. Demo accounts and their data are saved in the browser where they are created. They are not shared automatically between different browsers, devices, or local and deployed versions.

Features
Authentication
- Student and Professor registration and login.
- Form validation for required fields, duplicate usernames/emails, password length, and password confirmation.
- Role-based navigation to the appropriate dashboard.
- Simulated login session using localStorage.
- Logout clears the current session.
Professor Dashboard
- View course, assignment, and pending-submission summaries.
- Create courses with a name, course code, and description.
- Create and edit assignments with a title, description, deadline, OneDrive link, and submission type.
- Delete assignments with a confirmation step.
- Track submission acknowledgments and view submitted and pending students or groups.
Student Dashboard
- View available courses and assignment progress.
- View assignment descriptions, deadlines, and OneDrive links.
- Acknowledge individual assignment submissions and see the acknowledgment date and time.
- Create a group or join an existing group within a course.
- View group details, including the leader and members.
- For group assignments, only the group leader can acknowledge submission. Other group members can see who acknowledged it and when.
- View overdue and pending assignment statuses.
Design Choices
- Separate role-based dashboards: Professors and Students have different workflows, so each role has its own dashboard and relevant actions.
- Reusable, focused components: The dashboards are divided into components for overviews, assignments, and group management. This keeps the UI easier to maintain.
- Purple-and-white visual theme: Purple is used for primary actions and progress indicators, with neutral backgrounds and status colours to make information easy to scan.
- Responsive layout: Tailwind CSS utility classes are used to adapt the interface to different screen sizes.
- Confirmation before important actions: Assignment deletion and submission acknowledgment use confirmation steps to reduce accidental actions.
- Local browser storage for this version: localStorage is used to persist demo users, courses, assignments, groups, and acknowledgments without requiring a backend service.
Technology Stack
- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- React Hot Toast
- Browser localStorage
- Vercel for deployment
Getting Started
Prerequisites
Install the following before running the project:
- Node.js (with npm)
- Git
Run locally
1. Clone the repository:
   git clone https://github.com/rishi284/Assignment-Dashboard.git
2. Open the project folder that contains package.json:
   cd Assignment-Dashboard
   If the frontend is inside a frontend subfolder in your checkout, run cd frontend before continuing.
3. Install dependencies:
   npm install
4. Start the development server:
   npm run dev
5. Open the local URL printed in the terminal (Vite commonly uses http://localhost:5173).
Production build
To create a production build:
npm run build
To preview the production build locally, when the preview script is available:
npm run preview
Demo Login Details
Create the demo accounts from the registration screen, then enter the credentials below. Replace these placeholders with the actual demo credentials before submitting the repository.
Role	Login email or username	Password
Professor / Admin	ADD_PROFESSOR_EMAIL_OR_USERNAME	ADD_PROFESSOR_PASSWORD
Student	ADD_STUDENT_EMAIL_OR_USERNAME	ADD_STUDENT_PASSWORD


Important: Create the accounts on the deployed website before recording or sharing the demo credentials. Because this project uses localStorage, the accounts are available only in the same browser profile and on the same website origin where they were created. A new browser or device will have separate data.


Component Structure
The main dashboard components are organized by user role. The structure below shows the key files; adjust it if your final repository uses different paths.
src/
├── App.jsx
├── main.jsx
├── assets/
│   └── login.png
└── Frontend/
    ├── LoginFolder/
    │   └── Login.jsx
    ├── AdminDashboard/
    │   ├── AdminPortal.jsx
    │   ├── AdminOverview.jsx
    │   ├── CourseAssignment.jsx
    │   └── CourseManagment.jsx
    └── StudentDashboard/
        ├── StudentPortal.jsx
        ├── StudentOverview.jsx
        ├── StudentAssignments.jsx
        └── StudentGroups.jsx
Main component responsibilities
- Login.jsx – registration, login, validation, and role-based navigation.
- AdminPortal.jsx – professor authentication, dashboard state, course and assignment operations, and data handling.
- AdminOverview.jsx – professor overview, statistics, and course cards.
- CourseAssignment.jsx – assignment cards, progress, and submitted/pending details.
- CourseManagment.jsx – course, assignment, and delete-confirmation modal components.
- StudentPortal.jsx – student authentication, course selection, group operations, and acknowledgment handling.
- StudentOverview.jsx – student course cards and progress summary.
- StudentAssignments.jsx – assignment details, deadlines, and acknowledgment interface.
- StudentGroups.jsx – group information and create/join interface.
Data Storage and Limitations
This demo stores application data in the browser's localStorage. The main data keys used by the application include:
- users
- currentUser
- authToken
- courses
- assignments
- groups
- submissions
This is suitable for demonstrating the interface and workflows, but it is not a production authentication or shared database solution. The simulated token and client-side passwords are not secure authentication. Data is local to each browser profile and can be cleared by the user or browser. A production deployment should use a backend, database, and secure authentication service.
Deployment
The application is deployed on Vercel:

https://assignment-dashboard-ruddy.vercel.app/login

For the latest deployment, check that the Vercel deployment corresponds to the latest pushed GitHub commit.
Author
Joineazy project – Student, Group & Assignment Management System.