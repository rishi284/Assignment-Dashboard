# Joineazy – Assignment & Review Dashboard

Joineazy is a responsive assignment-management dashboard with separate experiences for **Students** and **Admins (Professors)**. Admins can create, edit, and delete assignments, while students can view their assigned work, confirm submissions, and track their progress.

## Live Demo

- **Live application:** https://assignment-dashboard-ruddy.vercel.app
- **GitHub repository:** https://github.com/rishi284/Assignment-Dashboard
- **Demo video:** Add your Loom or Google Drive link here after recording. Set Google Drive access to **Anyone with the link – Viewer**.

## Features

### Student

- Register and log in with the Student role.
- View assignments made available to all registered students.
- Read assignment descriptions and due dates.
- Open the assignment's Google Drive link.
- Confirm an assignment submission through a confirmation dialog.
- View submitted and pending counts, overall completion percentage, and progress.

### Admin

- Register and log in with the Admin role.
- View assignments created by the logged-in admin.
- Create assignments with a title, description, due date, and Google Drive link.
- Make assignments available to all registered students.
- Edit existing assignments.
- Delete assignments through a confirmation modal.
- View total assignments, student count, pending submissions, and class completion progress.

## Tech Stack

- **React** – Component-based user interface.
- **Vite** – Development server and production build tooling.
- **JavaScript** – Application logic.
- **Tailwind CSS** – Responsive styling.
- **React Router** – Client-side navigation.
- **React Hot Toast** – Success and error notifications.
- **Browser localStorage** – Stores demo accounts, assignments, and submissions.
- **Browser sessionStorage** – Stores the current user's login session.
- **Vercel** – Frontend deployment.

## Getting Started

### Prerequisites

Install Node.js and npm. Git is useful if you want to clone the repository.

### 1. Clone the repository

```bash
git clone https://github.com/rishi284/Assignment-Dashboard.git
```

### 2. Open the project folder

```bash
cd Assignment-Dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in the terminal (Vite commonly uses `http://localhost:5173`).

### 5. Create a production build

```bash
npm run build
```

Vite writes the production build to the `dist/` directory.

## Project Structure

The main project structure is shown below. If files have been moved or renamed during development, update this tree to match the current repository.

```text
Assignment-Dashboard/
├── public/                 # Static public assets
├── src/
│   ├── assets/              # Images used by the application (for example, login.png)
│   ├── Components/          # React page and UI components
│   │   ├── Login.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── StudentDashboard.jsx
│   ├── App.jsx              # Application routes
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind and global styles
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```


### `Login.jsx`

- Lets the user select Student or Admin.
- Validates the entered username/email and password fields.
- Creates a new demo account when the entered username is not found in the selected role's account collection.
- Reads and writes account records in localStorage.
- Stores the current user's non-password profile details in sessionStorage and routes the user to the matching dashboard.

### `AdminDashboard.jsx`

- Reads the account, assignment, and submission collections from localStorage.
- Displays only assignments created by the logged-in admin.
- Creates, edits, and deletes assignments.
- Removes submission records related to an assignment when that assignment is deleted.
- Calculates pending submissions and per-assignment class completion.

### `StudentDashboard.jsx`

- Reads assignments and submission records from localStorage.
- Shows assignments available to all students.
- Finds the current student's submission for each assignment and displays its Pending or Submitted status.
- Saves a submission after the student confirms the action.
- Calculates the student's submitted count, pending count, and overall progress.

### `App.jsx` and `main.jsx`

- `App.jsx` defines the routes for login, Student Dashboard, and Admin Dashboard.
- `main.jsx` mounts the React application and its router.

## Data Storage and Design Decisions

### Browser storage

The project uses browser storage instead of a backend API so the assignment workflow can be demonstrated without a server:

| Storage key | Purpose |
|---|---|
| `students` | Registered Student demo accounts |
| `admins` | Registered Admin demo accounts |
| `assignments` | Assignments created by Admins |
| `submissions` | Student submission records |
| `currentUser` in `sessionStorage` | Current login session |

### Role-specific dashboards

Students and Admins have separate dashboards so each role sees the actions and information relevant to them.

### Assignment workflow

Assignments created by an Admin are assigned to all registered students. Students confirm their submission through a two-step interaction. Admin statistics are calculated from the assignment and submission records.

### Responsive interface

Tailwind CSS responsive utilities are used to adapt the dashboard layout to desktop, tablet, and mobile screen sizes.

## Important Limitations

- **Browser-specific data:** localStorage belongs to a particular browser profile and website origin. Data created on a laptop will not automatically appear on a phone or in another browser profile.
- **Local persistence:** data generally remains after refreshes, but it can be removed when browser/site data is cleared.
- **Demo authentication only:** account records and passwords are stored in browser storage. This is a frontend demonstration and is **not suitable for production authentication or sensitive information**.
- **No shared backend:** the application does not synchronize data between users or devices.

## Demo Walkthrough

In the demo video, show both roles:

1. Log in or register as an Admin.
2. Create an assignment and show it on the Admin Dashboard.
3. Log out and log in or register as a Student in the same browser profile.
4. Open the assignment and confirm its submission.
5. Return to the Admin Dashboard and show the updated submission progress.
6. Demonstrate editing and deleting an assignment if time permits.

## Author

**Rishi Sai Karthikeya**

Frontend project built as an assignment-management dashboard demonstration.
